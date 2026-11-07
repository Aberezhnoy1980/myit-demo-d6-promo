import { chromium } from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const out=path.dirname(new URL(import.meta.url).pathname), base='http://127.0.0.1:4336/';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-gpu']});
const results={browser:browser.version(),checks:[],widths:[],errors:[],screenshots:[]};
const check=(name,pass,detail)=>results.checks.push({name,pass,detail});
async function context(options={}) {
  const ctx=await browser.newContext(options);
  await ctx.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>results.errors.push(e.message));
  await p.goto(base);return {ctx,p};
}
const stored=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('myit.d6.light.v1')||'{"answers":{}}'));
async function shot(p,name){await p.screenshot({path:path.join(out,name),fullPage:true});results.screenshots.push(name);}

try {
  for(const width of [390,1440]) {
    const {ctx,p}=await context({viewport:{width,height:900}});
    await shot(p,`start-${width}.png`);
    await p.locator('[data-action=start]').click();
    check(`start-${width}`,await p.locator('#step-title').textContent()==='Рассвет.');
    await p.locator('[data-answer="1"]').focus();await p.keyboard.press('Enter');
    check(`wrong-no-reward-${width}`,Object.keys((await stored(p)).answers).length===0);
    const focus=await p.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id}));
    check(`wrong-answer-retains-useful-focus-${width}`,focus.tag!=='BODY',focus);
    for(let i=0;i<4;i++)await p.locator('[data-answer="0"]').click();
    check(`half-${width}`,Object.keys((await stored(p)).answers).length===4);
    check(`composition-visible-during-play-${width}`,await p.locator('.stage').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}));
    await shot(p,`middle-${width}.png`);
    await p.reload();
    check(`reload-continue-${width}`,await p.locator('[data-action=start]').textContent().then(x=>x.includes('Продолжить')));
    await p.locator('[data-action=start]').click();
    check(`restore-step-${width}`,await p.locator('#step-title').textContent()==='Линия.');
    for(let i=0;i<4;i++)await p.locator('[data-answer="0"]').click();
    check(`complete-${width}`,Object.keys((await stored(p)).answers).length===8&&await p.locator('#share').count()===1);
    check(`final-composition-visible-${width}`,await p.locator('.stage').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}));
    await shot(p,`complete-${width}.png`);
    await ctx.grantPermissions(['clipboard-read','clipboard-write']);
    await p.locator('[data-action=copy]').click();
    await p.waitForFunction(()=>document.querySelector('#copy-status').textContent.length>0);
    check(`copy-success-${width}`,await p.locator('#copy-status').textContent()==='Текст скопирован.');
    await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('synthetic refusal')}}}));
    await p.locator('[data-action=copy]').click();
    await p.waitForFunction(()=>document.querySelector('#copy-status').textContent.includes('Не удалось'));
    check(`copy-fallback-${width}`,await p.locator('#share').evaluate(el=>document.activeElement===el&&el.selectionEnd>el.selectionStart));
    await p.locator('#play [data-action=reset]').click();
    check(`reset-dialog-${width}`,await p.locator('[role=dialog]').count()===1);
    await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.keyboard.press('Tab');
    check(`reset-tab-trap-${width}`,await p.evaluate(()=>Boolean(document.activeElement.closest('[role=dialog]'))));
    await p.keyboard.press('Escape');
    check(`reset-cancel-preserves-${width}`,Object.keys((await stored(p)).answers).length===8&&await p.locator('[role=dialog]').count()===0);
    await p.locator('#play [data-action=reset]').click();await p.locator('[data-action=confirm-reset]').click();
    check(`reset-clears-${width}`,Object.keys((await stored(p)).answers).length===0&&await p.locator('#step-title').textContent()==='Рассвет.');
    await ctx.close();
  }
  for(const width of [360,390,768,1024,1280,1440]){
    const {ctx,p}=await context({viewport:{width,height:900}});
    const sizes=await p.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    await p.locator('[data-action=start]').click();
    const playing=await p.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    results.widths.push({width,start:sizes,playing});
    check(`overflow-${width}`,sizes.scroll<=sizes.client&&playing.scroll<=playing.client);
    await ctx.close();
  }
  {
    const {ctx,p}=await context({viewport:{width:1440,height:900}});
    await p.locator('[data-action=start]').click();
    const b=await p.locator('[data-answer="0"]').boundingBox();
    await p.mouse.dblclick(b.x+b.width/2,b.y+b.height/2,{delay:30});
    const count=Object.keys((await stored(p)).answers).length;
    check('one-double-click-does-not-answer-next-question',count<=1,{collected:count});
    await ctx.close();
  }
  {
    const {ctx,p}=await context({javaScriptEnabled:false});
    check('no-js-explanation',await p.locator('noscript').textContent().then(x=>x.includes('JavaScript')));await ctx.close();
  }
  {
    const {ctx,p}=await context({reducedMotion:'reduce'});
    check('reduced-motion-css',await p.locator('.module').first().evaluate(el=>getComputedStyle(el).transitionDuration)==='0s');await ctx.close();
  }
  {
    const {ctx,p}=await context();
    await p.evaluate(()=>localStorage.setItem('myit.d6.light.v1','{'));await p.reload();
    check('corrupt-storage-warning',await p.locator('.warning').textContent().then(x=>x.includes('не удалось прочитать')));
    await p.locator('[data-action=start]').click();await p.locator('[data-answer="0"]').click();
    check('corrupt-storage-recovered',Object.keys((await stored(p)).answers).length===1);await ctx.close();
  }
  {
    const ctx=await browser.newContext();
    await ctx.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('synthetic storage unavailable')}}));
    const p=await ctx.newPage();await p.goto(base);await p.locator('[data-action=start]').click();
    for(let i=0;i<8;i++)await p.locator('[data-answer="0"]').click();
    check('storage-denied-play-completes',await p.locator('#share').count()===1&&await p.locator('.warning').textContent().then(x=>x.includes('не доступно')||x.includes('недоступно')));await ctx.close();
  }
}finally{
  await browser.close();
  await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify(results,null,2)+'\n');
}
console.log(JSON.stringify({checks:results.checks.length,passed:results.checks.filter(x=>x.pass).length,failed:results.checks.filter(x=>!x.pass),pageErrors:results.errors,screenshots:results.screenshots}));
