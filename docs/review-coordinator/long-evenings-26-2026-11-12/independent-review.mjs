import {chromium} from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out=path.dirname(fileURLToPath(import.meta.url));
const base='http://127.0.0.1:4397/';
const KEY='myit.d6.light.v1';
const checks=[],errors=[],requests=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const names={hall:'Прихожая',kitchen:'Кухня-столовая',living:'Гостиная',work:'Рабочий угол',bedroom:'Спальня'};
const prices={point:5900,line:6300,arc:16400,dawn:24900,pause:19700,halo:7800,focus:8900,fold:9600};
const pct=n=>n>=5?15:n>=3?10:n>=2?5:0;
const blank=()=>({version:5,rooms:Object.fromEntries(Object.keys(names).map(id=>[id,{found:false,items:[]} ])),checkout:{delivery:'courier',mount:'yes',slot:'weekday'},legacy:null,legacyOpen:false});
const one=blank();one.rooms.hall={found:true,items:['point']};
async function context(options={}){
 const ctx=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true,...options});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());requests.push({url:u.href,method:r.request().method()});return u.origin===new URL(base).origin?r.continue():r.abort()});
 return ctx;
}
async function page(ctx,hash='#/'){
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+hash);await p.waitForSelector('#screen-title');return p;
}
const read=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
async function nav(p,hash){await p.evaluate(h=>location.hash=h,hash);await p.waitForFunction(h=>location.hash===h&&document.body.dataset.page===(h==='#/'?'home':h.slice(2).split('/')[0]),hash)}
const snap=(p,name)=>p.screenshot({path:path.join(out,name+'.png'),fullPage:false});
async function totals(p,name,n,subtotal){
 const t=await p.locator('.lines').innerText();
 const vals=await p.locator('.lines tfoot td').allTextContents();
 const num=s=>Number(s.replace(/[^0-9]/g,''));
 check(name, t.includes(`Скидка ${pct(n)}%`)&&num(vals[0])===subtotal&&num(vals.at(-2))===subtotal-Math.round(subtotal*pct(n)/100),{n,subtotal,vals});
}
try{
 for(const [width,order,choices] of [
  [390,['bedroom','work','living','kitchen','hall'],{hall:'line',kitchen:'arc',living:'halo',work:'line',bedroom:'point'}],
  [1440,['kitchen','hall','bedroom','living','work'],{hall:'point',kitchen:'line',living:'pause',work:'focus',bedroom:'fold'}]
 ]){
  const ctx=await context({viewport:{width,height:width===390?844:900}}),p=await page(ctx);
  const cta=await p.locator('.hero .primary').boundingBox();
  check(`fresh-cta-${width}`,cta&&cta.y>=0&&cta.y+cta.height<=(width===390?844:900),cta);
  await snap(p,`fresh-${width}`);
  let subtotal=0;
  for(let i=0;i<order.length;i++){
   const id=order[i],product=choices[id];
   await p.locator('.top-nav a[href="#/dom"]').click();await p.waitForSelector('.room-list');
   await p.locator(`.room-list a[href="#/komnata/${id}"]`).click();await p.waitForSelector('.scene');
   check(`route-focus-${width}-${id}`,await p.evaluate(()=>document.activeElement?.id==='screen-title'));
   await p.locator('.scene').scrollIntoViewIfNeeded();await snap(p,`${id}-before-${width}`);
   await p.locator('.problem [data-action=find]').click();
   check(`problem-focus-${width}-${id}`,await p.evaluate(()=>document.activeElement?.classList.contains('problem')));
   await p.locator(`[data-action=add][data-product=${product}]`).click();subtotal+=prices[product];
   check(`selection-${width}-${id}`,JSON.stringify((await read(p)).rooms[id].items)===JSON.stringify([product]));
   await p.locator('.scene').scrollIntoViewIfNeeded();await snap(p,`${id}-after-${width}`);
   await nav(p,'#/komplekt');await totals(p,`threshold-${width}-${i+1}`,i+1,subtotal);
   if(i===1){
    await nav(p,'#/');await p.reload();await p.waitForSelector('.progress-note');
    check(`partial-reentry-${width}`,(await p.locator('.progress-note').innerText()).includes('2 из 5')&&(await p.locator('.hero .primary').getAttribute('href')).startsWith('#/komnata/'));
    check(`restart-on-home-${width}`,await p.locator('[data-action=reset]').count()>0);
   }
  }
  await snap(p,`final-top-${width}`);
  await p.locator('.final-copy').scrollIntoViewIfNeeded();await snap(p,`final-copy-${width}`);
  await p.locator('[data-action=download]').scrollIntoViewIfNeeded();
  const [d]=await Promise.all([p.waitForEvent('download'),p.locator('[data-action=download]').click()]);
  const svg=path.join(out,`independent-${width}.svg`);await d.saveAs(svg);
  const bytes=await fs.readFile(svg,'utf8');check(`svg-${width}`,bytes.includes('ВЕЧЕР15-')&&!/<script|foreignObject|\bon\w+=|\b(?:href|src)=/i.test(bytes));
  await p.locator('a[href="#/oformlenie"]').click();await p.waitForSelector('.checkout-form');
  await p.locator('input[value=pickup]').check();await p.locator('input[name=mount][value=no]').check();
  check(`checkout-arithmetic-${width}`,Number((await p.locator('.grand td').innerText()).replace(/[^0-9]/g,''))===subtotal-Math.round(subtotal*.15));
  check(`no-contact-fields-${width}`,await p.locator('input:not([type=radio]),select,textarea').count()===0);
  await p.locator('a[href="#/gotovo"]').click();await p.waitForSelector('.done');await snap(p,`done-${width}`);
  check(`honest-completion-${width}`,(await p.locator('.done').innerText()).includes('Заказ не создан, контакты не собраны, данные не переданы'));
  await p.reload();await p.waitForSelector('.done');await p.locator('.done a[href="#/"]').click();await p.waitForSelector('.hero');
  check(`completed-reentry-${width}`,(await p.locator('.progress-note').innerText()).includes('5 из 5')&&await p.locator('.hero .primary').getAttribute('href')==='#/komplekt');
  const saved=await read(p);await fs.writeFile(path.join(out,`selection-${width}.json`),JSON.stringify(saved,null,2));
  const removeIds=[...order].reverse();let left=5;
  for(const id of removeIds){await nav(p,`#/komnata/${id}`);await p.locator(`[data-action=remove][data-product=${choices[id]}]`).click();subtotal-=prices[choices[id]];left--;await nav(p,'#/komplekt');if(left)await totals(p,`remove-threshold-${width}-${left}`,left,subtotal);else check(`empty-again-${width}`,await p.locator('h1').innerText()==='Комплект пока пуст')}
  await ctx.close();
  // Open the actual exported artifact without the running website or network.
  const offline=await browser.newContext({offline:true});const op=await offline.newPage();await op.setContent(`<img alt="Exported house" width="600" src="data:image/svg+xml;base64,${Buffer.from(bytes).toString('base64')}">`);await op.locator('img').evaluate(img=>img.decode());await op.screenshot({path:path.join(out,`offline-export-${width}.png`),fullPage:false});check(`offline-svg-${width}`,await op.locator('img').evaluate(img=>img.naturalWidth===1200&&img.naturalHeight>1000));await offline.close();
 }
 // A replacement must change both the stored choice and the displayed artwork.
 {
  const ctx=await context(),p=await page(ctx,'#/komnata/living');
  for(const id of ['dawn','pause'])await p.locator(`[data-action=add][data-product=${id}]`).click();
  await p.locator('[data-action=add][data-product=halo]').click();check('cap-two',(await read(p)).rooms.living.items.length===2);
  await p.locator('[data-action=remove][data-product=dawn]').click();await p.locator('[data-action=add][data-product=halo]').click();
  check('replace-product',JSON.stringify((await read(p)).rooms.living.items)==='["pause","halo"]'&&await p.locator('.room .light.halo.on').count()>0&&await p.locator('.room .light.dawn.on').count()===0);
  await ctx.close();
 }
 // Storage refusal can first happen on an inner route, not only on the landing page.
 {
  const ctx=await context();await ctx.addInitScript(()=>{Storage.prototype.getItem=function(){throw Error('denied')};Storage.prototype.setItem=function(){throw Error('denied')}});
  const p=await page(ctx,'#/komnata/hall');await p.locator('[data-action=add][data-product=point]').click();
  check('storage-failure-visible-in-room',await p.getByText('Сохранение недоступно:',{exact:false}).isVisible());
  await snap(p,'storage-denied-room');await nav(p,'#/komplekt');check('storage-denied-memory-flow',await p.locator('.lines tbody tr').count()===1);
  await nav(p,'#/');check('storage-warning-on-home',await p.locator('.warning').isVisible());await ctx.close();
 }
 // Failed removal must not report a complete reset when old data survives reload.
 {
  const ctx=await context();await ctx.addInitScript(([k,v])=>{if(!sessionStorage.getItem('seed')){localStorage.setItem(k,v);sessionStorage.setItem('seed','1')}Storage.prototype.removeItem=function(){throw Error('denied')}},[KEY,JSON.stringify(one)]);
  const p=await page(ctx,'#/komplekt');await p.locator('[data-action=reset]').click();await p.locator('[data-action=reset-confirm]').click();await p.waitForSelector('.hero');
  check('reset-failure-visible',await p.locator('.warning').isVisible());
  await snap(p,'reset-denied-before-reload');await p.reload();await p.waitForSelector('.hero');
  check('reset-does-not-resurrect',!(await read(p))?.rooms?.hall?.items?.length,await read(p));await snap(p,'reset-denied-after-reload');await ctx.close();
 }
 // Web Share exists but refuses: inspect whether a real fallback can be reached.
 {
  const ctx=await context();await ctx.addInitScript(([k,v])=>{localStorage.setItem(k,v);navigator.canShare=()=>true;navigator.share=async()=>{throw new DOMException('denied','NotAllowedError')}},[KEY,JSON.stringify(one)]);
  const p=await page(ctx,'#/komplekt');let downloads=0;p.on('download',()=>downloads++);
  await p.locator('[data-action=share]').click();await p.waitForFunction(()=>document.querySelector('#export-status').textContent.includes('Поделиться не получилось'));
  await snap(p,'share-denied');await p.locator('[data-action=share]').click();await p.waitForTimeout(400);
  check('share-denied-has-png-fallback',downloads>0||await p.locator('[download$=".png"],[data-action=download-png]').count()>0,{downloads,status:await p.locator('#export-status').innerText()});await ctx.close();
 }
 // Widths and actual first action fit; also nested public, corrupt data, back/forward.
 for(const [w,h] of [[360,800],[768,1024],[1024,768],[1280,800]]){
  const ctx=await context({viewport:{width:w,height:h}}),p=await page(ctx);const b=await p.locator('.hero .primary').boundingBox();check(`cta-window-${w}`,b.y>=0&&b.y+b.height<=h,b);check(`overflow-${w}`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await snap(p,`fresh-${w}`);await ctx.close();
 }
 {
  const ctx=await context(),p=await page(ctx);await p.locator('.hero .primary').click();await p.waitForSelector('.room');await p.goBack();await p.waitForSelector('.hero');await p.goForward();await p.waitForSelector('.room');check('back-forward',await p.locator('h1').innerText()==='Прихожая');await ctx.close();
 }
 {
  const ctx=await context();await ctx.addInitScript(k=>localStorage.setItem(k,'{broken'),KEY);const p=await page(ctx);check('corrupt-state-warning',await p.locator('.warning').innerText().then(t=>t.includes('повреждено')));await ctx.close();
 }
 check('requests-get-local-only',requests.every(r=>r.method==='GET'&&new URL(r.url).origin===new URL(base).origin));
 check('no-page-errors',errors.length===0,errors);
}finally{
 await browser.close();await fs.writeFile(path.join(out,'independent-results.json'),JSON.stringify({date:new Date().toISOString(),checks,passed:checks.filter(x=>x.pass).length,total:checks.length,errors,requests},null,2));
 console.log(JSON.stringify({passed:checks.filter(x=>x.pass).length,total:checks.length,failed:checks.filter(x=>!x.pass),errors},null,2));
}
