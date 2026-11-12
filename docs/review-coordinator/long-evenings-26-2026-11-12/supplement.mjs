import {chromium} from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out=path.dirname(fileURLToPath(import.meta.url)),base='http://127.0.0.1:4397/',KEY='myit.d6.light.v1';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const checks=[];const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
try{
 const states=[{version:1,answers:{dawn:0,focus:0}},{version:2,answers:{dawn:1}},{version:3,answers:{dawn:1,focus:2,arc:0,pause:1,line:2,halo:0,fold:1,point:2},draft:{scenario:'work',modules:['focus','line']},personal:{scenario:'work',modules:['focus','line']}},{version:4,situation:'evening',lights:['ambient','accent'],done:true,legacy:null}];
 for(const s of states){
  const ctx=await b.newContext();await ctx.addInitScript(([k,v])=>localStorage.setItem(k,v),[KEY,JSON.stringify(s)]);const p=await ctx.newPage();await p.goto(base);await p.waitForSelector('.migration');
  const migrated=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  check(`browser-migration-v${s.version}`,migrated.version===5&&migrated.legacy.version===s.version&&Object.values(migrated.rooms).every(r=>r.items.length===0));
  if(s.version>=3){await p.locator('[data-action=legacy-apply]').click();const saved=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);check(`legacy-apply-v${s.version}`,s.version===3?saved.rooms.work.items[0]==='focus'&&saved.rooms.kitchen.items[0]==='line':saved.rooms.living.items.join(',')==='dawn,halo')}
  await ctx.close();
 }
 {
  const ctx=await b.newContext();const p=await ctx.newPage();let bad=[];p.on('response',r=>{if(r.status()>=400)bad.push(r.url())});await p.goto(base+'public/#/komnata/kitchen');await p.waitForSelector('.room');await p.locator('[data-action=add][data-product=arc]').click();await p.locator('.cart-bar a').click();await p.waitForSelector('.final');check('public-prefix-path-and-saved-choice',(await p.locator('.lines tbody').innerText()).includes('Дуга')&&bad.length===0,bad);await ctx.close();
 }
 {
  // Inspect actual exported XML geometry, then render these exact bytes as an image.
  const ctx=await b.newContext();const p=await ctx.newPage();const svg=await fs.readFile(path.join(out,'independent-390.svg'),'utf8');await p.setContent(svg.replace(/^<\?xml[^>]+\?>\s*/,''));
  const geom=await p.evaluate(()=>{const root=document.querySelector('svg');const first=[...root.children].find(e=>e.tagName==='text'&&e.getAttribute('y')==='1046');const r=first.getBBox();const dark=[...root.children].find(e=>e.tagName==='rect'&&e.getAttribute('fill')==='#141c1a');return {text:first.textContent,textTop:r.y,textBottom:r.y+r.height,darkBottom:Number(dark.getAttribute('height')),fill:first.getAttribute('fill')}});
  check('export-first-row-on-light-background',geom.textTop>=geom.darkBottom,geom);
  await p.setContent(`<img width="1200" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`);await p.locator('img').evaluate(i=>i.decode());await p.setViewportSize({width:1280,height:700});await p.evaluate(()=>scrollTo(0,940));await p.screenshot({path:path.join(out,'export-first-row.png'),fullPage:false});await ctx.close();
 }
 // Source SVG shapes do not have external image resources; no raster fallback is needed.
 const ctx=await b.newContext({viewport:{width:390,height:844}}),p=await ctx.newPage();await p.goto(base);await p.waitForSelector('.hero');
 for(const id of ['hall','kitchen','living','work','bedroom']){await p.goto(base+'#/komnata/'+id);await p.waitForSelector('.room');const ids=await p.locator('.pick-list [data-action=add]').evaluateAll(es=>es.map(e=>e.dataset.product));for(const x of ids){await p.locator(`[data-action=add][data-product=${x}]`).click();const attr=await p.locator('.room').getAttribute('aria-label');check(`scene-text-${id}-${x}`,attr.includes('с выбранным светом'));await p.waitForTimeout(460);await p.locator(`[data-action=remove][data-product=${x}]`).click()}}
 await ctx.close();
}finally{await b.close();await fs.writeFile(path.join(out,'supplement-results.json'),JSON.stringify({date:new Date().toISOString(),passed:checks.filter(c=>c.pass).length,total:checks.length,checks},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass)},null,2))}
