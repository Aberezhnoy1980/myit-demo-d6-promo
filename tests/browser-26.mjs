// Задание 26, этап B: полный браузерный прогон промо «Долгие вечера».
// Chrome установлен в системе, playwright-core берётся из соседнего демо D2 (зависимостью страницы не является).
// Запуск: сервер `python3 -m http.server 4391 --bind 127.0.0.1` в корне D6, затем `node tests/browser-26.mjs`.
import {chromium} from '/Users/alex/myit/demo/Landing/d2-photo/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';

const base=process.env.D6_URL||'http://127.0.0.1:4391/';
const out=process.env.D6_OUT||'evidence/stage-b-26';
const KEY='myit.d6.light.v1';
const checks=[],errors=[],external=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,...(detail===undefined?{}:{detail})});
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});

const options={hall:['point','line'],kitchen:['line','arc'],living:['dawn','pause','halo'],work:['focus','line'],bedroom:['fold','point']};
const order=['hall','kitchen','living','work','bedroom'];
const blank=()=>Object.fromEntries(order.map(id=>[id,{found:false,items:[]}]));
const saved=rooms=>({version:5,rooms,checkout:{delivery:'courier',mount:'yes',slot:'weekday'},legacy:null,legacyOpen:false});
const full=saved({hall:{found:true,items:['point','line']},kitchen:{found:true,items:['line','arc']},living:{found:true,items:['dawn','halo']},work:{found:true,items:['focus']},bedroom:{found:true,items:['fold']}});

async function context(opts={}){
  const {state,init,width=1440,height=900,...rest}=opts;
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,acceptDownloads:true,...rest});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(base).origin)return r.continue();external.push(u.href);return r.abort()});
  // Состояние кладётся один раз на вкладку, чтобы перезагрузка не затирала изменения теста.
  if(state)await ctx.addInitScript(([k,v])=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(k,v);sessionStorage.setItem('seeded','1')}},[KEY,JSON.stringify(state)]);
  if(init)await ctx.addInitScript(init);
  return ctx;
}
async function open(ctx,hash='#/',wait=true){
  const p=await ctx.newPage();
  p.on('pageerror',e=>errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await p.goto(base+hash);if(wait)await p.waitForSelector('#screen-title');return p;
}
const shot=(p,name,fullPage=false)=>p.screenshot({path:`${out}/${name}.png`,fullPage});
const fits=p=>p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
const stored=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const status=p=>p.locator('[role=status].status').first().innerText();
// Каждый id в документе встречается один раз: SVG-градиенты и фильтры не перехватывают друг друга.
const uniqueIds=p=>p.evaluate(()=>{const seen={};for(const e of document.querySelectorAll('[id]'))seen[e.id]=(seen[e.id]||0)+1;return Object.entries(seen).filter(([,n])=>n>1).map(([id])=>id)});

// ——— 1. Пять комнат: проблема, выбор, свет, сравнение ———
for(const [w,h] of [[1440,900],[390,844]]){
  const ctx=await context({width:w,height:h});
  for(const id of order){
    const p=await open(ctx,`#/komnata/${id}`);
    const spot=await p.locator('.hotspot').boundingBox(),sc=await p.locator('.scene').boundingBox();
    check(`${id}-${w}-hotspot-in-scene`,spot&&sc&&spot.x>=sc.x-1&&spot.x+spot.width<=sc.x+sc.width+1&&spot.y>=sc.y-1,{spot,sc});
    if(w===1440)await shot(p,`room-${id}-now-${w}`);
    await p.locator('.hotspot').click();
    check(`${id}-${w}-problem-found`,await p.locator('.problem.found').count()===1);
    const [a,b]=options[id];
    await p.locator(`[data-action=add][data-product=${a}]`).dblclick();
    check(`${id}-${w}-dblclick-once`,JSON.stringify((await stored(p)).rooms[id].items)===JSON.stringify([a]));
    await p.locator(`[data-action=add][data-product=${b}]`).click();
    const lit=await p.evaluate(([a,b])=>({a:document.querySelectorAll(`.room .light.${a}.on`).length,b:document.querySelectorAll(`.room .light.${b}.on`).length,base:document.querySelectorAll('.room .light.base.on').length,absent:[...document.querySelectorAll('.room .fixture.absent')].length}),[a,b]);
    check(`${id}-${w}-two-lights-on`,lit.a>=1&&lit.b>=1&&lit.base===0,lit);
    check(`${id}-${w}-status`,(await status(p)).includes('в комплекте'));
    if(options[id].length===3){
      await p.locator(`[data-product=${options[id][2]}]`).click();
      check(`${id}-${w}-third-refused`,(await status(p)).includes('уже 2')&&(await stored(p)).rooms[id].items.length===2);
    }
    await p.locator('.scene').scrollIntoViewIfNeeded();
    await shot(p,`room-${id}-after-${w}`);
    check(`${id}-${w}-no-overflow`,await fits(p));
    check(`${id}-${w}-unique-ids`,(await uniqueIds(p)).length===0,await uniqueIds(p));
    await p.locator('[data-mode=now]').click();
    const now=await p.evaluate(()=>({on:[...document.querySelectorAll('.room .light.on')].map(e=>e.getAttribute('class')),pressed:document.querySelector('[data-mode=now]').getAttribute('aria-pressed'),focus:document.activeElement?.dataset?.mode}));
    check(`${id}-${w}-compare-now`,now.on.length===1&&now.on[0].includes('base')&&now.pressed==='true'&&now.focus==='now',now);
    await p.close();
  }
  await ctx.close();
}

// ——— 2. Весь путь кликами: вход → 5 комнат → комплект → оформление → финал ———
{
  const ctx=await context();const p=await open(ctx);
  await p.locator('.hero .primary').click();
  for(const id of order){
    await p.waitForFunction(id=>location.hash===`#/komnata/${id}`,id);
    await p.locator('[data-action=find]').first().click();
    await p.locator(`[data-action=add][data-product=${options[id][0]}]`).click();
    await p.locator('.lit-note .primary').click();
  }
  await p.waitForFunction(()=>location.hash==='#/komplekt'&&document.body.dataset.page==='komplekt');
  const fin=await p.evaluate(()=>({h1:document.querySelector('h1').innerText,code:document.querySelector('.code b')?.innerText,gift:[...document.querySelectorAll('.lines tr')].some(t=>t.innerText.includes('в подарок')),rows:document.querySelectorAll('.lines tbody tr').length}));
  check('journey-final',fin.h1.includes('долгим вечерам')&&/^ВЕЧЕР15-[0-9A-Z]{4}$/.test(fin.code)&&fin.gift&&fin.rows===5,fin);
  await shot(p,'journey-01-final-1440');
  await p.locator('a[href="#/oformlenie"]').click();await p.waitForSelector('.checkout-form');
  await p.locator('input[value=pickup]').check();
  const co=await p.evaluate(()=>({grand:document.querySelector('.grand td').innerText,focus:document.activeElement?.value,inputs:document.querySelectorAll('input:not([type=radio])').length}));
  check('checkout-pickup-no-contact-fields',co.focus==='pickup'&&co.inputs===0,co);
  check('checkout-state-saved',(await stored(p)).checkout.delivery==='pickup');
  await shot(p,'journey-02-checkout-1440');
  await p.locator('a[href="#/gotovo"]').click();await p.waitForSelector('.done');
  check('done-honest',(await p.locator('.done').innerText()).includes('Заказ не создан'));
  await shot(p,'journey-03-done-1440');
  await ctx.close();
}

// ——— 3. Ширины 768/1024/1280 и zoom 200% (окно 720×450 и 640×400 CSS-пикселей) ———
for(const [w,h] of [[768,1024],[1024,768],[1280,800],[720,450],[640,400]]){
  const ctx=await context({width:w,height:h,state:full});
  for(const hash of ['#/','#/dom','#/komnata/living','#/komplekt','#/oformlenie','#/gotovo']){
    const p=await open(ctx,hash);check(`fit-${w}x${h}-${hash}`,await fits(p));await p.close();
  }
  await ctx.close();
}

// ——— 4. Две вкладки: изменение в одной видно в другой ———
{
  const ctx=await context({state:saved({...blank(),kitchen:{found:true,items:['line']}})});
  const a=await open(ctx,'#/komnata/hall'),b=await open(ctx,'#/komplekt');
  await a.locator('[data-action=add][data-product=point]').click();
  await b.waitForFunction(()=>document.querySelector('.lines')?.innerText.includes('Точка'),null,{timeout:3000}).catch(()=>{});
  check('two-tabs-sync',(await b.locator('.lines').innerText()).includes('Точка'));
  await b.locator('[data-action=remove]').count();
  await ctx.close();
}

// ——— 5. Без JavaScript и при отказе модуля ———
{
  const ctx=await context({javaScriptEnabled:false});const p=await open(ctx,'#/',false);
  const t=await p.evaluate(()=>({h1:document.querySelector('.nojs h1')?.innerText,items:document.querySelectorAll('.nojs li').length,note:!!document.querySelector('.nojs-note')}));
  check('nojs-offer-and-collection',t.h1?.includes('Зажгите дом')&&t.items===8&&t.note,t);
  await shot(p,'nojs-1440');await ctx.close();
}
{
  const ctx=await context();await ctx.route('**/rooms.js',r=>r.abort());
  const p=await ctx.newPage();await p.goto(base);await p.waitForTimeout(500);
  check('module-failure-shows-static-offer',await p.locator('.nojs h1').isVisible()&&await p.locator('.nojs-note').isVisible());
  await ctx.close();
}

// ——— 6. Reduced motion ———
{
  const ctx=await context({reducedMotion:'reduce',state:full});const p=await open(ctx,'#/komnata/kitchen');
  check('reduced-motion-no-transition',await p.evaluate(()=>getComputedStyle(document.querySelector('.room .light')).transitionDuration)==='0s');
  await ctx.close();
}

// ——— 7. Экспорт: SVG, PNG, текст и их отказы ———
{
  // Без Web Share API открытка сохраняется как PNG.
  const ctx=await context({state:full,init:()=>{Object.defineProperty(navigator,'canShare',{value:undefined})}});const p=await open(ctx,'#/komplekt');
  const [svg]=await Promise.all([p.waitForEvent('download'),p.locator('[data-action=download]').click()]);
  await svg.saveAs(`${out}/podborka-full.svg`);
  const text=await fs.readFile(`${out}/podborka-full.svg`,'utf8');
  check('export-svg-standalone',text.startsWith('<?xml')&&!/<script|href=|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(text)&&text.includes('Итого'));
  const [pngFile]=await Promise.all([p.waitForEvent('download'),p.locator('[data-action=share]').click()]);
  await pngFile.saveAs(`${out}/otkrytka-full.png`);
  const sig=(await fs.readFile(`${out}/otkrytka-full.png`)).subarray(0,8).toString('hex');
  check('export-png-fallback-download',sig==='89504e470d0a1a0a'&&(await status(p)).includes('PNG'));
  await ctx.close();
}
{
  const ctx=await context({state:full,init:()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))}})}});
  const p=await open(ctx,'#/komplekt');await p.locator('[data-action=copy]').click();
  check('clipboard-denied-manual-select',(await status(p)).includes('вручную')&&await p.evaluate(()=>document.activeElement?.id==='result-text'));
  await ctx.close();
}
{
  const ctx=await context({state:full,init:()=>{URL.createObjectURL=()=>{throw new Error('blob denied')}}});
  const p=await open(ctx,'#/komplekt');
  await p.locator('[data-action=download]').click();
  check('blob-denied-svg-fallback',(await status(p)).includes('вручную'));
  await p.locator('[data-action=share]').click();await p.waitForTimeout(200);
  check('blob-denied-png-fallback',(await status(p)).includes('вручную'));
  await ctx.close();
}

{
  // С Web Share API открытка-PNG уходит в системное окно; отмена пользователем сообщается честно.
  const ctx=await context({state:full,init:()=>{window.__shared=[];navigator.canShare=()=>true;navigator.share=async d=>{window.__shared.push(d.files[0].type+':'+d.files[0].size);if(window.__cancel)throw new DOMException('cancel','AbortError')}}});
  const p=await open(ctx,'#/komplekt');
  await p.locator('[data-action=share]').click();await p.waitForFunction(()=>window.__shared.length===1);
  check('share-api-png',(await p.evaluate(()=>window.__shared[0])).startsWith('image/png:')&&(await status(p)).includes('передана'));
  await p.evaluate(()=>window.__cancel=true);await p.locator('[data-action=share]').click();await p.waitForFunction(()=>window.__shared.length===2);await p.waitForTimeout(100);
  check('share-api-cancel',(await status(p)).includes('отменена'));
  await ctx.close();
}

// ——— 8. Сброс: диалог, ловушка фокуса, Escape, затрагивается только ключ D6 ———
{
  const ctx=await context({state:full,init:()=>localStorage.setItem('other-site','keep')});const p=await open(ctx,'#/komplekt');
  await p.locator('[data-action=reset]').click();
  check('dialog-focus-cancel',await p.evaluate(()=>document.activeElement?.dataset.action==='reset-cancel'));
  await p.keyboard.press('Tab');await p.keyboard.press('Tab');
  check('dialog-focus-trap',await p.evaluate(()=>document.activeElement?.closest('.dialog')!==null));
  await p.keyboard.press('Escape');
  check('dialog-escape-returns-focus',await p.evaluate(()=>!document.querySelector('.dialog')&&document.activeElement?.dataset.action==='reset'));
  await p.locator('[data-action=reset]').click();await p.locator('[data-action=reset-confirm]').click();
  await p.waitForFunction(()=>document.body.dataset.page==='home');
  check('reset-only-d6',await p.evaluate(k=>localStorage.getItem(k)===null&&localStorage.getItem('other-site')==='keep',KEY));
  await ctx.close();
}

// ——— 9. Клавиатура: отметка проблемы и выбор без мыши ———
{
  const ctx=await context();const p=await open(ctx,'#/komnata/bedroom');
  await p.locator('.hotspot').focus();await p.keyboard.press('Enter');
  check('keyboard-hotspot',await p.locator('.problem.found').count()===1);
  await p.locator('[data-action=add][data-product=fold]').focus();await p.keyboard.press('Enter');
  check('keyboard-add-keeps-focus',await p.evaluate(()=>document.activeElement?.dataset.product==='fold')&&(await stored(p)).rooms.bedroom.items[0]==='fold');
  await ctx.close();
}

// ——— 10. Прежний прогресс v3 становится предложением ———
{
  const v3={version:3,answers:{dawn:1,focus:2,arc:0,pause:1,line:2,halo:0,fold:1,point:2},draft:{scenario:'work',modules:['focus','line']},personal:{scenario:'work',modules:['focus','line']}};
  const ctx=await context({state:v3});const p=await open(ctx,'#/');
  check('legacy-offer-visible',await p.locator('.migration').isVisible()&&(await stored(p)).version===5);
  await p.locator('[data-action=legacy-apply]').click();
  check('legacy-applied',JSON.stringify((await stored(p)).rooms.work.items)==='["focus"]');
  await ctx.close();
}

// ——— R1–R5 после ревью координатора ———
const deny=methods=>new Function(`for(const m of ${JSON.stringify(methods)})Storage.prototype[m]=function(){throw new Error('denied')}`);
{
  // R1а: удаление запрещено, запись разрешена — сброс записывает пустой дом, после перезагрузки комплект не возвращается.
  const ctx=await context({state:saved({...blank(),hall:{found:true,items:['point']}}),init:deny(['removeItem'])});
  const p=await open(ctx,'#/komplekt'),other=await open(ctx,'#/komplekt');
  await p.locator('[data-action=reset]').click();await p.locator('[data-action=reset-confirm]').click();
  await p.waitForFunction(()=>document.body.dataset.page==='home');
  await other.waitForFunction(()=>document.querySelector('h1')?.innerText.includes('пуст'),null,{timeout:3000}).catch(()=>{});
  check('R1-remove-denied-other-tab-empty',(await other.locator('h1').innerText()).includes('пуст'));
  await p.reload();await p.waitForSelector('#screen-title');
  check('R1-remove-denied-no-resurrect',(await stored(p)).rooms.hall.items.length===0&&await p.locator('.warning').count()===0);
  await ctx.close();
}
{
  // R1б: после сохранения запрещены и удаление, и запись — сброс честно предупреждает, что комплект может вернуться.
  const ctx=await context({state:saved({...blank(),hall:{found:true,items:['point']}})});
  const p=await open(ctx,'#/komplekt');
  await p.evaluate(()=>{for(const m of ['removeItem','setItem'])Storage.prototype[m]=function(){throw new Error('denied')}});
  await p.locator('[data-action=reset]').click();await p.locator('[data-action=reset-confirm]').click();
  await p.waitForFunction(()=>document.body.dataset.page==='home');
  const w=await p.locator('.warning').innerText().catch(()=>'');
  check('R1-reset-failure-visible',w.includes('может вернуться')&&(await p.locator('#live').innerText()).includes('может вернуться'),w);
  await shot(p,'r1-reset-failed-1440');
  // Путь в памяти продолжается, чужие ключи не трогаются.
  await p.goto(base+'#/komnata/kitchen');await p.waitForSelector('#screen-title');
  check('R1-after-reload-old-set-honestly-returns',(await stored(p)).rooms.hall.items[0]==='point');
  await ctx.close();
}
{
  // R2: чтение и запись запрещены — прямой вход в комнату, выбор, комплект, оформление: предупреждение везде.
  const ctx=await context({init:deny(['getItem','setItem','removeItem'])});
  const p=await open(ctx,'#/komnata/hall');
  const seen=[];
  seen.push(await p.locator('.warning').isVisible());
  await p.locator('[data-action=add][data-product=point]').click();
  check('R2-focus-kept-on-add',await p.evaluate(()=>document.activeElement?.dataset.product==='point'));
  seen.push(await p.locator('.warning').isVisible());
  await shot(p,'r2-storage-denied-room-1440');
  for(const h of ['#/komnata/kitchen','#/komplekt','#/oformlenie','#/gotovo']){await p.goto(base+h);await p.waitForSelector('#screen-title');seen.push(await p.locator('.warning').count()===1)}
  check('R2-warning-every-screen',seen.every(Boolean),seen);
  check('R2-live-announced',(await p.locator('#live').innerText()).includes('Сохранение недоступно'));
  await ctx.close();
}
{
  // R2: чтение работает, запись отказывает при обычном выборе — предупреждение появляется сразу, фокус остаётся.
  const ctx=await context({state:saved({...blank(),hall:{found:true,items:['point']}})});
  const p=await open(ctx,'#/komnata/kitchen');
  check('R2-no-warning-while-ok',await p.locator('.warning').count()===0);
  await p.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('quota')}});
  await p.locator('[data-action=find]').first().click();await p.locator('[data-action=add][data-product=line]').click();
  check('R2-write-failure-visible',await p.locator('.warning').isVisible()&&await p.evaluate(()=>document.activeElement?.dataset.product==='line'));
  await p.locator('.lit-note .primary').click();await p.waitForSelector('.room-title');
  check('R2-write-failure-next-screen',await p.locator('.warning').count()===1);
  await ctx.close();
}
for(const [w,h] of [[390,844],[1440,900]]){
  // R2: предупреждение на входе не выталкивает главный CTA из окна.
  const ctx=await context({width:w,height:h,init:deny(['getItem','setItem','removeItem'])});const p=await open(ctx);
  const b=await p.locator('.hero .primary').boundingBox();
  check(`R2-home-warning-cta-visible-${w}`,await p.locator('.warning').isVisible()&&b&&b.y+b.height<=h,b);
  await ctx.close();
}
{
  // Миграция видна и при входе по внутреннему маршруту.
  const v4={version:4,situation:'work',lights:['task'],done:true,legacy:null};
  const ctx=await context({state:v4});const p=await open(ctx,'#/komnata/work');
  check('R2-migration-on-inner-route',await p.locator('.migration').isVisible());
  await p.locator('[data-action=legacy-apply]').click();
  check('R2-migration-apply-inner',JSON.stringify((await stored(p)).rooms.work.items)==='["focus"]');
  await ctx.close();
}
{
  // R3: технический отказ Web Share — появляется кнопка скачивания уже готовой PNG, повтор share не нужен.
  const ctx=await context({state:full,init:()=>{window.__calls=0;navigator.canShare=()=>true;navigator.share=async()=>{window.__calls++;throw new DOMException('denied','NotAllowedError')}}});
  const p=await open(ctx,'#/komplekt');
  await p.locator('[data-action=share]').click();await p.waitForSelector('[data-action=png-save]');
  check('R3-png-button-focused',await p.evaluate(()=>document.activeElement?.dataset.action==='png-save')&&(await status(p)).includes('PNG'));
  await shot(p,'r3-share-denied-1440');
  const [d]=await Promise.all([p.waitForEvent('download'),p.locator('[data-action=png-save]').click()]);
  await d.saveAs(`${out}/otkrytka-after-share-error.png`);
  const sig=(await fs.readFile(`${out}/otkrytka-after-share-error.png`)).subarray(0,8).toString('hex');
  check('R3-png-downloaded-once-share-called-once',sig==='89504e470d0a1a0a'&&await p.evaluate(()=>window.__calls)===1);
  // Комплект изменился — устаревшая открытка не предлагается.
  await p.goto(base+'#/komnata/work');await p.waitForSelector('#screen-title');await p.locator('[data-action=remove][data-product=focus]').click();
  await p.goto(base+'#/komplekt');await p.waitForSelector('#screen-title');
  check('R3-stale-png-not-offered',await p.locator('[data-action=png-save]').count()===0);
  await ctx.close();
}
{
  // R3: отмена пользователем не навязывает скачивание.
  const ctx=await context({state:full,init:()=>{navigator.canShare=()=>true;navigator.share=async()=>{throw new DOMException('cancel','AbortError')}}});
  const p=await open(ctx,'#/komplekt');await p.locator('[data-action=share]').click();await p.waitForTimeout(300);
  check('R3-cancel-no-png-button',(await status(p)).includes('отменена')&&await p.locator('[data-action=png-save]').count()===0);
  await ctx.close();
}
{
  // R4: первая строка экспорта на светлом фоне — в реально скачанном SVG.
  const ctx=await context({state:saved({...blank(),hall:{found:true,items:['point']}})});const p=await open(ctx,'#/komplekt');
  const [d]=await Promise.all([p.waitForEvent('download'),p.locator('[data-action=download]').click()]);
  await d.saveAs(`${out}/podborka-one.svg`);
  const svgText=await fs.readFile(`${out}/podborka-one.svg`,'utf8');
  const box=await p.evaluate(t=>{const holder=document.createElement('div');holder.innerHTML=t.replace(/^<\?xml[^>]*>/,'');document.body.append(holder);const svg=holder.querySelector('svg');svg.style.width='1200px';
    const dark=svg.querySelector('rect[fill="#141c1a"]').getBBox();const row=[...svg.querySelectorAll('text')].find(e=>e.textContent.includes('Точка')).getBBox();holder.remove();return {darkEnd:dark.y+dark.height,rowTop:row.y}},svgText);
  check('R4-first-row-on-light',box.rowTop-box.darkEnd>=20,box);
  await ctx.close();
}
for(const [w,h] of [[360,800],[390,844],[1024,768],[1280,800],[1440,900]]){
  // R5: «Начать заново» на входе и при одной найденной проблеме; CTA остаётся в окне.
  const ctx=await context({width:w,height:h,state:saved({...blank(),kitchen:{found:true,items:[]}})});const p=await open(ctx);
  const b=await p.locator('.hero .primary').boundingBox();
  check(`R5-restart-on-home-${w}`,await p.locator('.hero [data-action=reset]').isVisible()&&b&&b.y+b.height<=h,b);
  if(w===390||w===1440)await shot(p,`r5-restart-home-${w}`);
  if(w===1440){
    await p.locator('.hero [data-action=reset]').click();
    check('R5-dialog-focus',await p.evaluate(()=>document.activeElement?.dataset.action==='reset-cancel'));
    await p.keyboard.press('Escape');
    check('R5-escape-returns-focus',await p.evaluate(()=>document.activeElement?.dataset.action==='reset'&&!!document.activeElement.closest('.hero')));
    await p.locator('.hero [data-action=reset]').click();await p.locator('[data-action=reset-confirm]').click();
    await p.waitForFunction(()=>!document.querySelector('.hero [data-action=reset]'));
    check('R5-reset-from-home',await p.evaluate(k=>localStorage.getItem(k)===null,KEY)&&(await p.locator('.hero .primary').innerText()).includes('начать с прихожей'));
  }
  await ctx.close();
}
{
  // C1: демо-условие возврата на главной.
  const ctx=await context();const p=await open(ctx);
  check('C1-return-terms',(await p.locator('.terms').innerText()).includes('Возврат')&&(await p.locator('.faq').innerText()).includes('не подойдёт'));
  await ctx.close();
}

// ——— 11. Контраст текста на однотонном фоне (WCAG AA) ———
{
  const ctx=await context({state:full});
  const low=[];
  for(const hash of ['#/','#/dom','#/komnata/kitchen','#/komplekt','#/oformlenie','#/gotovo']){
    const p=await open(ctx,hash);
    low.push(...await p.evaluate(hash=>{
      const rgb=s=>{const m=s.match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]};
      const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
      const bgOf=el=>{for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage!=='none')return null;const c=rgb(cs.backgroundColor);if((c[3]??1)>.95)return c}return [255,255,255]};
      const res=[];
      for(const el of document.querySelectorAll('body *')){
        if(el.closest('svg')||!el.offsetParent&&el.tagName!=='BODY')continue;
        const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;
        const cs=getComputedStyle(el);if(cs.visibility==='hidden'||+cs.opacity<1)continue;
        const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;
        const bg=bgOf(el);if(!bg)continue;
        const fg=rgb(cs.color),a=fg[3]??1,mix=fg.slice(0,3).map((v,i)=>v*a+bg[i]*(1-a));
        const [l1,l2]=[lum(mix),lum(bg)].sort((x,y)=>y-x),ratio=(l1+.05)/(l2+.05);
        const size=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700,large=size>=24||bold&&size>=18.66;
        if(ratio<(large?3:4.5))res.push({hash,text:el.textContent.trim().slice(0,40),ratio:+ratio.toFixed(2)});
      }
      return res;
    },hash));
    await p.close();
  }
  check('contrast-aa',low.length===0,low.slice(0,10));
  await ctx.close();
}

// ——— 12. Снимки итогового пути на 390 ———
{
  const ctx=await context({width:390,height:844,state:full});
  for(const [hash,name] of [['#/','start'],['#/dom','dom'],['#/komplekt','final'],['#/oformlenie','checkout']]){const p=await open(ctx,hash);await shot(p,`m-${name}-390`);check(`m-${name}-390-fit`,await fits(p));await p.close()}
  await ctx.close();
}
{
  const ctx=await context({state:full});
  for(const [hash,name] of [['#/','start'],['#/dom','dom']]){const p=await open(ctx,hash);await shot(p,`d-${name}-1440`);await p.close()}
  await ctx.close();
}

await browser.close();
const failed=checks.filter(c=>!c.pass);
const result={date:new Date().toISOString(),base,passed:checks.length-failed.length,total:checks.length,failed,errors,external,checks};
await fs.writeFile(`${out}/check-results.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({passed:result.passed,total:result.total,failed,errors,external},null,2));
if(failed.length||errors.length||external.length)process.exitCode=1;
