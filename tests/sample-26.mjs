// Этап A задания 26: снимки образца и адресные проверки первого экрана.
// Использует установленный Chrome и существующий playwright-core из соседнего демо (не зависимость страницы).
import {chromium} from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
const base=process.env.D6_URL||'http://127.0.0.1:4391/',out='evidence/sample-26',checks=[],errors=[],external=[];
await fs.mkdir(out,{recursive:true});
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const KEY='myit.d6.light.v1';
const blank={hall:{found:false,items:[]},kitchen:{found:false,items:[]},living:{found:false,items:[]},work:{found:false,items:[]},bedroom:{found:false,items:[]}};
const setA={...blank,hall:{found:true,items:['point']},kitchen:{found:true,items:['line','arc']}};
const setB={hall:{found:true,items:['line']},kitchen:{found:true,items:['arc']},living:{found:true,items:['pause','halo']},work:{found:true,items:['focus']},bedroom:{found:true,items:['fold']}};
const saved=rooms=>({version:5,rooms,checkout:{delivery:'courier',mount:'yes',slot:'weekday'},legacy:null,legacyOpen:false});

async function page(width,height,state,hash='#/'){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(base).origin)return r.continue();external.push(u.href);return r.abort()});
  if(state)await ctx.addInitScript(([k,v])=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(k,v);sessionStorage.setItem('seeded','1')}},[KEY,JSON.stringify(state)]);
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await p.goto(base+hash);await p.waitForSelector('#screen-title');return {ctx,p};
}
const shot=(p,name)=>p.screenshot({path:`${out}/${name}.png`,fullPage:false});
const fits=p=>p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);

for(const [w,h] of [[1440,900],[1280,800],[1024,768],[390,844],[360,800]]){
  const {ctx,p}=await page(w,h);
  const b=await p.locator('.hero .primary').boundingBox();
  check(`hero-cta-visible-${w}x${h}`,b&&b.y>=0&&b.y+b.height<=h,b);
  check(`hero-no-overflow-${w}`,await fits(p));
  if(w===1440||w===390)await shot(p,`01-start-${w}`);
  await ctx.close();
}
for(const w of [1440,390]){
  const h=w===1440?900:844;
  // Комната: как сейчас → найти проблему → выбрать «Линию»
  let {ctx,p}=await page(w,h,null,'#/komnata/kitchen');
  check(`kitchen-hotspot-${w}`,await p.locator('.hotspot').isVisible());
  await shot(p,`02-kitchen-now-${w}`);
  await p.locator('.hotspot').click();
  check(`kitchen-found-${w}`,(await p.locator('.problem.found h2').innerText()).includes('тени'));
  await p.locator('[data-action=add][data-product=line]').dblclick();
  const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  check(`double-click-adds-once-${w}`,JSON.stringify(st.rooms.kitchen.items)==='["line"]',st.rooms.kitchen.items);
  check(`light-on-${w}`,await p.locator('.room .light.line.on').count()===1&&await p.locator('.room .light.base.on').count()===0);
  await p.locator('.scene').scrollIntoViewIfNeeded();await shot(p,`03-kitchen-line-${w}`);
  await p.locator('[data-action=add][data-product=arc]').click();
  await p.evaluate(()=>window.scrollTo(0,0));await shot(p,`04-kitchen-both-${w}`);
  check(`kitchen-no-overflow-${w}`,await fits(p));
  await ctx.close();
  // Два разных итоговых дома
  for(const [name,rooms] of [['a',setA],['b',setB]]){
    ({ctx,p}=await page(w,h,saved(rooms),'#/komplekt'));
    await shot(p,`05-final-${name}-${w}`);
    check(`final-${name}-${w}`,(await p.locator('.lines').innerText()).includes('Итого'));
    check(`final-no-overflow-${name}-${w}`,await fits(p),await p.evaluate(()=>{const W=document.documentElement.clientWidth;return [...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>W+1).slice(0,6).map(e=>e.tagName+'.'+e.className+':'+Math.round(e.getBoundingClientRect().right))}));
    await ctx.close();
  }
  // Карточки коллекции
  ({ctx,p}=await page(w,h));
  await p.locator('#kollekciya').scrollIntoViewIfNeeded();await p.evaluate(()=>document.querySelector('#kollekciya').scrollIntoView());
  await shot(p,`06-collection-${w}`);
  await p.locator('.top-nav a[href="#kollekciya"]').click().catch(()=>{});
  await ctx.close();
}
// Якорь коллекции со страницы комнаты возвращает на главную и прокручивает к разделу.
{const {ctx,p}=await page(1440,900,null,'#/komnata/kitchen');await p.locator('.top-nav a[href="#kollekciya"]').click();await p.waitForTimeout(300);
 check('anchor-from-room',await p.evaluate(()=>document.body.dataset.page==='home'&&Math.abs(document.querySelector('#kollekciya').getBoundingClientRect().top)<5));await ctx.close()}
await browser.close();
const result={browser:browser.version?.()||'chrome',checks,errors,external};
await fs.writeFile(`${out}/check-results.json`,JSON.stringify(result,null,2));
const failed=checks.filter(c=>!c.pass);
console.log(JSON.stringify({passed:checks.length-failed.length,total:checks.length,failed,errors,external},null,2));
if(failed.length||errors.length||external.length)process.exitCode=1;
