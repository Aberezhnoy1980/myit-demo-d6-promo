import {chromium} from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import http from 'node:http';
import {scenes} from '../../../data.js';
const out=path.dirname(new URL(import.meta.url).pathname),base='http://127.0.0.1:4336/',key='myit.d6.light.v1';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-gpu']});
const result={browser:browser.version(),checks:[],errors:[]},cards=[];
const check=(name,pass,detail)=>result.checks.push({name,pass,detail});
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{"answers":{}}'),key);
const n=p=>saved(p).then(s=>Object.keys(s.answers).length);
const seed=(version,size=8)=>({version,answers:Object.fromEntries(scenes.slice(0,size).map(s=>[s.id,version===1?0:s.answer]))});
async function make(width=390,opts={}){
 const ctx=await browser.newContext({viewport:{width,height:900},acceptDownloads:true,...opts});
 await ctx.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 const p=await ctx.newPage();p.on('pageerror',e=>result.errors.push(e.message));await p.goto(base);return {ctx,p};
}
async function seedPage(p,state){await p.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key,state});await p.reload()}
async function choose(p,scenario,modules){await p.locator(`[data-scenario=${scenario}]`).click();await p.locator('[data-action=modules]').click();for(const id of modules)await p.locator(`[data-module=${id}]`).click();await p.locator('[data-action=confirm]').click()}
async function download(p,name){const promise=p.waitForEvent('download');await p.locator('[data-action=download]').click();const file=await promise;const bytes=await fs.readFile(await file.path());await fs.writeFile(path.join(out,name),bytes);cards.push(name);return bytes.toString('utf8')}
try{
 for(const width of [390,1440]){
  const {ctx,p}=await make(width);await p.screenshot({path:path.join(out,`start-${width}.png`),fullPage:true});
  check(`entry-value-${width}`,await p.locator('.welcome').textContent().then(t=>t.includes('карточк')&&t.includes('2–3')));
  await p.locator('[data-action=start]').click();await p.locator('[data-answer="0"]').focus();await p.keyboard.press('Enter');
  check(`wrong-focus-${width}`,await p.evaluate(()=>document.activeElement.dataset.answer==='0'));
  await p.keyboard.press('Tab');check(`wrong-tab-${width}`,await p.evaluate(()=>document.activeElement.dataset.answer==='1'));
  await p.locator('[data-answer="1"]').dblclick({delay:30});check(`answer-double-${width}`,await n(p)===1&&await p.locator('.reward').count()===1);
  check(`reward-visible-${width}`,await p.locator('.stage').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}));
  await p.locator('[data-action=next]').dblclick({delay:30});check(`next-double-${width}`,await n(p)===1&&await p.locator('.question').getAttribute('data-scene')==='focus');
  for(let i=1;i<8;i++){await p.locator(`[data-answer="${scenes[i].answer}"]`).click();await p.locator('[data-action=next]').click()}
  check(`collection-complete-${width}`,await n(p)===8&&await p.locator('[data-action=modules]').isDisabled());
  await p.locator('[data-scenario=work]').focus();await p.keyboard.press('Enter');check(`scenario-keyboard-${width}`,await p.evaluate(()=>document.activeElement.dataset.scenario==='work'));
  await p.locator('[data-action=modules]').click();check(`zero-disables-${width}`,await p.locator('[data-action=confirm]').isDisabled());
  await p.locator('[data-module=focus]').dblclick({delay:30});check(`module-double-${width}`,(await saved(p)).draft.modules.join(',')==='focus');
  check(`one-disables-${width}`,await p.locator('[data-action=confirm]').isDisabled());
  await p.locator('[data-module=line]').focus();await p.keyboard.press('Enter');check(`module-focus-${width}`,await p.evaluate(()=>document.activeElement.dataset.module==='line'));
  check(`two-enables-${width}`,await p.locator('[data-action=confirm]').isEnabled());
  await p.locator('[data-module=arc]').click();await p.locator('[data-module=halo]').click();
  check(`max-three-${width}`,(await saved(p)).draft.modules.length===3&&await p.locator('.feedback').textContent().then(t=>t.includes('не больше')));
  await p.locator('[data-module=arc]').click();await p.locator('[data-action=confirm]').click();
  check(`personal-work-${width}`,(await saved(p)).personal.scenario==='work'&&await p.locator('.card-preview').textContent().then(t=>t.includes('Фокус')&&t.includes('Линия')&&!t.includes('Рассвет')));
  await p.screenshot({path:path.join(out,`work-${width}.png`),fullPage:true});
  const work=await download(p,`work-${width}.svg`);
  check(`work-standalone-data-${width}`,work.includes('Работа')&&work.includes('Фокус')&&!/<script|foreignObject|\b(?:href|src)\s*=|\bon\w+\s*=|url\(/i.test(work));
  await p.reload();await p.locator('[data-action=start]').click();check(`restore-personal-${width}`,await p.locator('.card-preview').count()===1&&(await saved(p)).personal.scenario==='work');
  await p.locator('[data-action=edit]').click();await p.locator('[data-scenario=rest]').click();await p.locator('[data-action=modules]').click();
  for(const id of ['focus','line','dawn','pause','halo'])await p.locator(`[data-module=${id}]`).click();await p.locator('[data-action=confirm]').click();
  check(`edit-preserves-learning-${width}`,await n(p)===8&&(await saved(p)).personal.modules.join(',')==='dawn,pause,halo');
  const rest=await download(p,`rest-${width}.svg`);check(`different-result-${width}`,work!==rest&&rest.includes('Отдых')&&rest.includes('Ореол')&&!rest.includes('Фокус'));
  await p.screenshot({path:path.join(out,`rest-${width}.png`),fullPage:true});
  await ctx.grantPermissions(['clipboard-read','clipboard-write']);await p.locator('[data-action=copy]').click();await p.waitForFunction(()=>document.querySelector('#copy-status').textContent==='Текст скопирован.');
  check(`copy-real-${width}`,await p.evaluate(()=>navigator.clipboard.readText())===await p.locator('#share').inputValue());
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('synthetic denied')}}}));await p.locator('[data-action=copy]').click();
  check(`copy-fallback-${width}`,await p.locator('#share').evaluate(el=>document.activeElement===el&&el.selectionEnd===el.value.length));
  await p.evaluate(()=>URL.createObjectURL=()=>{throw Error('synthetic file error')});await p.locator('[data-action=download]').click();
  check(`download-fallback-${width}`,await p.locator('details').evaluate(el=>el.open)&&await p.locator('#svg-source').evaluate(el=>document.activeElement===el&&el.selectionEnd===el.value.length));
  await p.locator('[data-action=reset]').click();await p.keyboard.press('Escape');check(`cancel-reset-${width}`,await n(p)===8&&!!(await saved(p)).personal);
  await p.locator('[data-action=reset]').click();await p.locator('[data-action=confirm-reset]').click();check(`reset-all-${width}`,await n(p)===0&&!(await saved(p)).personal);await ctx.close();
 }
 for(const version of [1,2])for(const size of [2,8]){
  const {ctx,p}=await make();await seedPage(p,seed(version,size));const s=await saved(p);
  check(`migrate-${version}-${size}`,s.version===3&&Object.keys(s.answers).length===size&&s.personal===null&&s.draft.scenario===null);
  await p.locator('[data-action=start]').click();check(`migrate-route-${version}-${size}`,size===8?await p.locator('[data-scenario=work]').count()===1:await p.locator('.question').getAttribute('data-scene')==='arc');await ctx.close();
 }
 for(const width of [360,390,768,1024,1280,1440]){
  const {ctx,p}=await make(width);const fits=()=>p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
  check(`entry-fits-${width}`,await fits());await seedPage(p,seed(2));await p.locator('[data-action=start]').click();
  await p.locator('[data-scenario=meeting]').click();await p.locator('[data-action=modules]').click();check(`choice-fits-${width}`,await fits());
  for(const id of ['arc','fold','point'])await p.locator(`[data-module=${id}]`).click();await p.locator('[data-action=confirm]').click();check(`result-fits-${width}`,await fits());await ctx.close();
 }
 {
  const ctx=await browser.newContext({offline:true});for(const name of cards.slice(0,2)){
   const p=await ctx.newPage();let network=0;p.on('request',r=>{if(/^https?:/.test(r.url()))network++});await p.goto(pathToFileURL(path.join(out,name)).href);
   check('offline-'+name,await p.locator('svg').count()===1&&await p.locator('svg > g').first().locator('circle,rect,path').count()>0&&network===0);
   await p.screenshot({path:path.join(out,name.replace('.svg','-offline.png'))});await p.close();
  }await ctx.close();
 }
 {
  const {ctx,p}=await make();await seedPage(p,seed(2));await p.locator('[data-action=start]').click();await p.locator('[data-scenario=meeting]').click();await p.locator('[data-action=modules]').click();await p.locator('[data-module=arc]').click();await p.reload();await p.locator('[data-action=start]').click();
  check('draft-restore',(await p.locator('[data-module=arc]').getAttribute('aria-pressed'))==='true'&&(await saved(p)).draft.scenario==='meeting');await ctx.close();
 }
 {
  const {ctx,p}=await make(390,{reducedMotion:'reduce'});check('reduced-motion',await p.locator('.module').first().evaluate(el=>getComputedStyle(el).transitionDuration)==='0s');await ctx.close();
  const x=await make(390,{javaScriptEnabled:false});check('no-js',await x.p.locator('noscript').textContent().then(t=>t.includes('JavaScript')));await x.ctx.close();
 }
 {
  const ctx=await browser.newContext();await ctx.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('synthetic unavailable')}}));const p=await ctx.newPage();await p.goto(base);await p.locator('[data-action=start]').click();
  for(const s of scenes){await p.locator(`[data-answer="${s.answer}"]`).click();await p.locator('[data-action=next]').click()}
  await choose(p,'work',['focus','line']);check('no-storage-complete',await p.locator('.card-preview svg').count()===1&&await p.locator('.warning').count()===1);await ctx.close();
 }
 {
  const {ctx,p}=await make();await seedPage(p,{...seed(3),draft:{scenario:'rest',modules:['unknown']},personal:null});
  check('invalid-choice-safe',await p.locator('.warning').count()===1);await ctx.close();
 }
 {
  const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://127.0.0.1');if(!u.pathname.startsWith('/nested/d6/'))throw Error();const file=u.pathname.slice('/nested/d6/'.length)||'index.html';if(!['index.html','app.js','card.js','state.js','storage.js','data.js','style.css'].includes(file))throw Error();res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});res.end(await fs.readFile(file))}catch{res.writeHead(404);res.end()}});
  await new Promise(r=>server.listen(4338,'127.0.0.1',r));try{const ctx=await browser.newContext();const p=await ctx.newPage();await p.goto('http://127.0.0.1:4338/nested/d6/');await seedPage(p,seed(2));await p.locator('[data-action=start]').click();await choose(p,'meeting',['arc','point']);check('nested-prefix-personal-card',await p.locator('.card-preview svg').count()===1);await ctx.close()}finally{await new Promise(r=>server.close(r))}
 }
}finally{await browser.close();await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify(result,null,2)+'\n')}
console.log(JSON.stringify({checks:result.checks.length,passed:result.checks.filter(c=>c.pass).length,failed:result.checks.filter(c=>!c.pass),errors:result.errors}));
