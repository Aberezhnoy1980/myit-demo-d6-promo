import {chromium} from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
const root=process.cwd(),out=path.dirname(new URL(import.meta.url).pathname),base='http://127.0.0.1:4336/';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-gpu']});
const answers=[1,2,0,1,2,0,1,2],key='myit.d6.light.v1';
const result={browser:browser.version(),checks:[],errors:[],screenshots:[],layouts:[]};
const check=(name,pass,detail)=>result.checks.push({name,pass,detail});
const count=p=>p.evaluate(k=>Object.keys(JSON.parse(localStorage.getItem(k)||'{"answers":{}}').answers).length,key);
const visible=p=>p.locator('.stage').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight});
async function make(width=1440,options={}){
 const ctx=await browser.newContext({viewport:{width,height:900},...options});
 await ctx.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
 const p=await ctx.newPage();p.on('pageerror',e=>result.errors.push(e.message));await p.goto(base);return {ctx,p};
}
async function screenshot(p,name){await p.screenshot({path:path.join(out,name),fullPage:true});result.screenshots.push(name)}
try{
 for(const width of [390,1440]){
  const {ctx,p}=await make(width);await screenshot(p,`start-${width}.png`);
  await p.locator('[data-action=start]').click();
  await p.locator('[data-answer="0"]').focus();await p.keyboard.press('Enter');
  check(`wrong-focus-${width}`,await p.evaluate(()=>document.activeElement.dataset.answer==='0'));
  await p.keyboard.press('Tab');check(`wrong-tab-${width}`,await p.evaluate(()=>document.activeElement.dataset.answer==='1'));
  await p.keyboard.press('Shift+Tab');check(`wrong-shift-tab-${width}`,await p.evaluate(()=>document.activeElement.dataset.answer==='0'));
  let box=await p.locator('[data-answer="1"]').boundingBox();await p.mouse.dblclick(box.x+box.width/2,box.y+box.height/2,{delay:30});
  check(`double-answer-awards-one-${width}`,await count(p)===1&&await p.locator('[data-action=next]').count()===1);
  check(`reward-scene-visible-${width}`,await visible(p));
  await p.locator('[data-action=next]').scrollIntoViewIfNeeded();box=await p.locator('[data-action=next]').boundingBox();
  await p.mouse.dblclick(box.x+box.width/2,box.y+box.height/2,{delay:30});
  check(`double-next-does-not-answer-${width}`,await count(p)===1&&await p.locator('.question').getAttribute('data-scene')==='focus');
  for(let j=1;j<4;j++){
   await p.locator(`[data-answer="${answers[j]}"]`).click();
   check(`reward-${j+1}-visible-${width}`,await visible(p));
   if(j<3)await p.locator('[data-action=next]').click();
  }
  await screenshot(p,`middle-${width}.png`);
  result.layouts.push({width,state:'reward-4',boxes:await p.evaluate(()=>Object.fromEntries(['.stage','.reward'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [s,{top:r.top,bottom:r.bottom}]})))});
  await p.reload();check(`continue-entry-${width}`,await p.locator('[data-action=start]').textContent().then(t=>t.includes('Продолжить')));
  await p.locator('[data-action=start]').click();check(`restore-next-unsolved-${width}`,await p.locator('.question').getAttribute('data-scene')==='line');
  for(let j=4;j<8;j++){await p.locator(`[data-answer="${answers[j]}"]`).click();await p.locator('[data-action=next]').click()}
  check(`complete-${width}`,await count(p)===8&&await p.locator('.result').count()===1);
  check(`final-scene-visible-${width}`,await visible(p));await screenshot(p,`complete-${width}.png`);
  await ctx.grantPermissions(['clipboard-read','clipboard-write']);await p.locator('[data-action=copy]').click();
  await p.waitForFunction(()=>document.querySelector('#copy-status').textContent==='Текст скопирован.');
  check(`actual-clipboard-${width}`,await p.evaluate(()=>navigator.clipboard.readText()).then(t=>t.includes('все 8 модулей')));
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('synthetic denied')}}}));
  await p.locator('[data-action=copy]').click();
  check(`clipboard-fallback-${width}`,await p.locator('#share').evaluate(el=>document.activeElement===el&&el.selectionEnd>el.selectionStart));
  await p.locator('[data-action=reset]').click();await p.keyboard.press('Shift+Tab');
  check(`dialog-shift-tab-trap-${width}`,await p.evaluate(()=>Boolean(document.activeElement.closest('[role=dialog]'))));
  await p.keyboard.press('Escape');check(`reset-cancel-${width}`,await count(p)===8);
  await p.locator('[data-action=reset]').click();await p.locator('[data-action=confirm-reset]').click();
  check(`reset-${width}`,await count(p)===0&&await p.locator('.question').getAttribute('data-scene')==='dawn');await ctx.close();
 }
 for(const width of [360,390,768,1024,1280,1440]){
  const {ctx,p}=await make(width);
  check(`entry-overflow-${width}`,await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
  await p.locator('[data-action=start]').click();check(`play-overflow-${width}`,await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));await ctx.close();
 }
 for(const [name,value,expected] of [
  ['old-partial',{version:1,answers:{dawn:0,focus:0}},2],
  ['old-complete',{version:1,answers:Object.fromEntries(['dawn','focus','arc','pause','line','halo','fold','point'].map(id=>[id,0]))},8],
  ['bad-old',{version:1,answers:{dawn:1}},0],['unknown-version',{version:9,answers:{}},0],['bad-json','{',0]]){
  const {ctx,p}=await make(390);
  await p.evaluate(({key,value})=>localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value)),{key,value});await p.reload();
  await p.locator('[data-action=start]').click();
  if(name==='old-partial'||name==='old-complete'){
   const state=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
   check(`migration-${name}`,state.version===2&&Object.keys(state.answers).length===expected&&state.answers.dawn===1&&state.answers.focus===2);
   check(`migration-route-${name}`,name==='old-complete'?await p.locator('.result').count()===1:await p.locator('.question').getAttribute('data-scene')==='arc');
  }else check(`invalid-storage-${name}`,await p.locator('.warning').count()===1&&await p.locator('.question').getAttribute('data-scene')==='dawn');
  await ctx.close();
 }
 {
  const {ctx,p}=await make(390);const q=await ctx.newPage();await q.goto(base);await p.locator('[data-action=start]').click();await p.locator('[data-answer="1"]').click();
  await q.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).answers.dawn===1,key);
  await q.waitForFunction(()=>document.querySelector('[data-action=start]').textContent.includes('Продолжить'));
  check('two-tabs-update',await q.locator('.stage-header strong').textContent().then(t=>t.includes('01')));
  await q.locator('[data-action=start]').click();await q.locator('[data-action=reset]').click();await q.locator('[data-action=confirm-reset]').click();
  await p.waitForFunction(()=>document.querySelector('.question')?.dataset.scene==='dawn');
  check('two-tabs-reset',await p.locator('.question').getAttribute('data-scene')==='dawn');await ctx.close();
 }
 {
  const {ctx,p}=await make(390,{javaScriptEnabled:false});check('no-js-readable',await p.locator('noscript').textContent().then(t=>t.includes('JavaScript')&&t.includes('Вымышленная')));await ctx.close();
 }
 {
  const {ctx,p}=await make(390,{reducedMotion:'reduce'});check('reduced-motion',await p.locator('.module').first().evaluate(el=>getComputedStyle(el).transitionDuration)==='0s');await ctx.close();
 }
 {
  const ctx=await browser.newContext({viewport:{width:390,height:900}});
  await ctx.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('synthetic unavailable')}}));
  const p=await ctx.newPage();await p.goto(base);await p.locator('[data-action=start]').click();
  for(let j=0;j<8;j++){await p.locator(`[data-answer="${answers[j]}"]`).click();await p.locator('[data-action=next]').click()}
  check('no-storage-complete',await p.locator('.result').count()===1&&await p.locator('.warning').textContent().then(t=>t.includes('недоступно')));await ctx.close();
 }
 {
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'d6-prefix-review-'));let server;
  try{
   const site=path.join(temp,'portfolio','d6');await fs.mkdir(site,{recursive:true});
   for(const name of ['index.html','app.js','data.js','state.js','storage.js','style.css'])await fs.copyFile(path.join(root,name),path.join(site,name));
   server=spawn('python3',['-m','http.server','4338','--bind','127.0.0.1','--directory',temp],{stdio:'ignore'});
   const ctx=await browser.newContext();const p=await ctx.newPage();
   for(let i=0;i<30;i++){try{await p.goto('http://127.0.0.1:4338/portfolio/d6/');break}catch{await new Promise(r=>setTimeout(r,100))}}
   await p.locator('[data-action=start]').click();await p.locator('[data-answer="1"]').click();
   check('prefix-live-path',await count(p)===1&&await p.locator('.reward').count()===1);await ctx.close();
  }finally{if(server&&server.exitCode===null){server.kill('SIGTERM');await new Promise(r=>server.once('exit',r))}await fs.rm(temp,{recursive:true,force:true})}
 }
}finally{
 await browser.close();await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify(result,null,2)+'\n');
}
console.log(JSON.stringify({checks:result.checks.length,passed:result.checks.filter(c=>c.pass).length,failed:result.checks.filter(c=>!c.pass),pageErrors:result.errors,screenshots:result.screenshots,layouts:result.layouts}));
