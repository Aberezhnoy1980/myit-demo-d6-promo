import {chromium} from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out=path.dirname(fileURLToPath(import.meta.url)),url='http://127.0.0.1:4397/',KEY='myit.d6.light.v1';
const checks=[],errors=[],external=[];const ck=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const empty=()=>({version:5,rooms:Object.fromEntries(['hall','kitchen','living','work','bedroom'].map(id=>[id,{found:false,items:[]}])),checkout:{delivery:'courier',mount:'yes',slot:'weekday'},legacy:null,legacyOpen:false});
const one=empty();one.rooms.hall={found:true,items:['point']};
const max=empty();for(const [r,items] of Object.entries({hall:['point','line'],kitchen:['line','arc'],living:['dawn','halo'],work:['focus','line'],bedroom:['fold','point']}))max.rooms[r]={found:true,items};
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
async function ctx(state,viewport={width:390,height:844}){
 const c=await browser.newContext({viewport,acceptDownloads:true});
 await c.route('**/*',r=>{if(!r.request().url().startsWith(url)){external.push(r.request().url());return r.abort()}return r.continue()});
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForSelector('#screen-title');
 if(state){await p.evaluate(([k,s])=>{localStorage.setItem(k,JSON.stringify(s));localStorage.setItem('unrelated','keep')},[KEY,state]);await p.reload();await p.waitForSelector('#screen-title')}
 return {c,p};
}
async function nav(p,hash){await p.evaluate(h=>location.hash=h,hash);await p.waitForFunction(h=>document.body.dataset.page===(h==='#/'?'home':h.slice(2).split('/')[0]),hash)}
const read=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const snap=(p,n)=>p.screenshot({path:path.join(out,n+'.png'),fullPage:false});
async function reset(p){await p.locator('[data-action=reset]').first().click();await p.locator('[data-action=reset-confirm]').click();await p.waitForFunction(()=>document.body.dataset.page==='home'&&!document.querySelector('.dialog'))}
try{
 {
  const {c,p}=await ctx(one);await nav(p,'#/komplekt');const other=await c.newPage();await other.goto(url+'#/komplekt');await other.waitForSelector('.lines');
  await p.evaluate(()=>{Storage.prototype.removeItem=function(){throw Error('denied')}});await reset(p);
  ck('R1-remove-only-empty-saved',Object.values((await read(p)).rooms).every(r=>r.items.length===0));
  await other.waitForFunction(()=>document.querySelector('h1').innerText.includes('пуст'));ck('R1-other-tab-empty',await other.locator('.lines').count()===0);
  await p.reload();await p.waitForSelector('.hero');ck('R1-no-resurrection',await p.locator('.progress-note').count()===0&&await p.locator('.warning').count()===0);
  ck('R1-other-key-kept',await p.evaluate(()=>localStorage.getItem('unrelated'))==='keep');await c.close();
 }
 {
  const {c,p}=await ctx(one);await nav(p,'#/komplekt');await p.evaluate(()=>{for(const m of ['removeItem','setItem'])Storage.prototype[m]=function(){throw Error('denied')}});await reset(p);
  ck('R1-both-refused-honest',await p.locator('.warning').isVisible()&&(await p.locator('.warning').innerText()).includes('может вернуться'));
  await snap(p,'reset-both-refused-390');await nav(p,'#/komnata/kitchen');await p.locator('[data-action=add][data-product=line]').click();
  ck('R1-memory-still-works',(await p.locator('.lit-note').innerText()).includes('Кухня-столовая освещена'));
  await p.reload();await p.waitForSelector('.room');ck('R1-return-was-disclosed',(await read(p)).rooms.hall.items[0]==='point'&&(await read(p)).rooms.kitchen.items.length===0);await c.close();
 }
 {
  const {c,p}=await ctx(one);await nav(p,'#/komnata/kitchen');await p.evaluate(()=>{window.liveChanges=0;new MutationObserver(()=>window.liveChanges++).observe(document.querySelector('#live'),{childList:true,subtree:true,characterData:true});Storage.prototype.setItem=function(){throw Error('denied')}});
  await p.locator('[data-action=add][data-product=line]').click();
  ck('R2-write-fail-visible-and-focus',await p.locator('.warning').isVisible()&&await p.evaluate(()=>document.activeElement?.dataset.product==='line'));
  for(const hash of ['#/dom','#/komplekt','#/oformlenie','#/gotovo','#/']){await nav(p,hash);ck('R2-warning-'+hash,await p.locator('.warning').count()===1)}
  ck('R2-live-single-mutation',await p.evaluate(()=>window.liveChanges)===1,await p.evaluate(()=>window.liveChanges));await snap(p,'warning-home-390');await c.close();
 }
 {
  const {c,p}=await ctx();await c.addInitScript(()=>{for(const m of ['getItem','setItem'])Storage.prototype[m]=function(){throw Error('denied')}});await p.reload();await p.waitForSelector('.hero');await nav(p,'#/komnata/bedroom');
  ck('R2-read-denied-inner-route',await p.locator('.warning').isVisible());await p.locator('[data-action=add][data-product=fold]').click();await nav(p,'#/komplekt');ck('R2-read-denied-in-memory',await p.locator('.lines tbody tr').count()===1);await c.close();
 }
 {
  const {c,p}=await ctx(max);await nav(p,'#/komplekt');await p.evaluate(()=>{window.shareCalls=0;navigator.canShare=()=>true;navigator.share=async()=>{window.shareCalls++;throw new DOMException('denied','NotAllowedError')}});
  await p.locator('[data-action=share]').click();await p.waitForSelector('[data-action=png-save]');ck('R3-fallback-focus',await p.evaluate(()=>document.activeElement?.dataset.action==='png-save'));await snap(p,'png-fallback-390');
  const [d]=await Promise.all([p.waitForEvent('download'),p.locator('[data-action=png-save]').click()]);const target=path.join(out,'fallback-max.png');await d.saveAs(target);const bytes=await fs.readFile(target);
  ck('R3-real-png',bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a'&&bytes.readUInt32BE(16)===1200&&bytes.readUInt32BE(20)>1700,{bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)});
  ck('R3-share-called-once',await p.evaluate(()=>window.shareCalls)===1);
  // Same-page storage sync changes the set without navigation: an outdated PNG must disappear.
  const other=await c.newPage();await other.goto(url+'#/komnata/hall');await other.waitForSelector('.room');await other.locator('[data-action=remove][data-product=point]').click();await p.waitForFunction(()=>!document.querySelector('[data-action=png-save]'));ck('R3-stale-after-other-tab',await p.locator('[data-action=png-save]').count()===0);await c.close();
 }
 {
  const {c,p}=await ctx(one);await nav(p,'#/komplekt');await p.evaluate(()=>{navigator.canShare=()=>true;navigator.share=async()=>{throw new DOMException('cancel','AbortError')}});let downloads=0;p.on('download',()=>downloads++);await p.locator('[data-action=share]').click();await p.waitForFunction(()=>document.querySelector('#export-status').innerText.includes('отменена'));ck('R3-cancel-no-download',downloads===0&&await p.locator('[data-action=png-save]').count()===0);await c.close();
 }
 for(const [name,s] of [['one',one],['max',max]]){
  const {c,p}=await ctx(s);await nav(p,'#/komplekt');const [d]=await Promise.all([p.waitForEvent('download'),p.locator('[data-action=download]').click()]);const target=path.join(out,`export-${name}.svg`);await d.saveAs(target);const xml=await fs.readFile(target,'utf8');
  const geometry=await p.evaluate(t=>{const div=document.createElement('div');div.innerHTML=t.replace(/^<\?xml[^>]+\?>/,'');document.body.append(div);const svg=div.querySelector('svg');const first=[...svg.children].find(e=>e.tagName==='text'&&e.getAttribute('y')==='1096');const rows=[...svg.children].filter(e=>e.tagName==='text'&&e.getAttribute('x')==='70'&&+e.getAttribute('y')>=1096&&e.getAttribute('font-size')==='26');const r=first.getBBox(),last=rows.at(-1).getBBox();const result={top:r.y,darkBottom:1030,lastBottom:last.y+last.height,height:+svg.getAttribute('height')};div.remove();return result},xml);
  ck('R4-light-background-'+name,geometry.top-geometry.darkBottom>=20&&geometry.lastBottom<geometry.height,geometry);
  await p.setContent(`<img width="1200" src="data:image/svg+xml;base64,${Buffer.from(xml).toString('base64')}">`);await p.locator('img').evaluate(i=>i.decode());await p.setViewportSize({width:1280,height:650});await p.evaluate(()=>scrollTo(0,960));await snap(p,'export-row-'+name);await c.close();
 }
 for(const [width,height] of [[360,800],[390,844],[768,1024],[1024,768],[1280,800],[1440,900]]){
  const s=empty();s.rooms.work.found=true;const {c,p}=await ctx(s,{width,height});const cta=await p.locator('.hero .primary').boundingBox();ck('R5-found-only-cta-'+width,await p.locator('.hero [data-action=reset]').isVisible()&&cta.y+cta.height<=height,cta);
  if(width===390){await p.locator('.hero [data-action=reset]').click();await p.keyboard.press('Escape');ck('R5-cancel-focus',await p.evaluate(()=>document.activeElement?.dataset.action==='reset'));await snap(p,'restart-390');await reset(p);ck('R5-found-reset',await p.locator('.hero [data-action=reset]').count()===0)}await c.close();
 }
 {
  const {c,p}=await ctx();await p.goto(url+'public/#/komnata/work');await p.waitForSelector('.room');await p.locator('[data-action=add][data-product=focus]').click();await p.locator('.cart-bar a').click();await p.waitForSelector('.final');ck('public-prefix-flow',(await p.locator('.lines tbody').innerText()).includes('Фокус'));await c.close();
 }
 ck('no-page-errors',errors.length===0,errors);ck('no-external',external.length===0,external);
}finally{await browser.close();await fs.writeFile(path.join(out,'targeted-results.json'),JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,checks,errors,external},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass),errors,external},null,2))}
