// Отображение и навигация. Маршруты в hash: Back/Forward работают, состояние в адрес не попадает.
import {rooms,roomOrder,products,promo,tiers,checkoutOptions,maxPerRoom} from './data.js';
import {empty,find,addItem,removeItem,setCheckout,summary,checkoutCost,legacySuggestion,applyLegacy,dismissLegacy,isLit} from './state.js';
import {KEY,load,save,clear} from './storage.js';
import {house,cells} from './house.js';
import {roomScene,spots} from './rooms.js';
import {productArt} from './art.js';
import {cardText,cardSvg,rub} from './card.js';

let store;try{store=window.localStorage}catch{store=null}
const initial=load(store);
let state=initial.state;
// Состояние хранилища: одно актуальное предупреждение вместо нескольких одинаковых.
const store_={invalid:initial.status==='invalid',broken:initial.status==='unavailable',resetFailed:false};
if(initial.status==='migrated'&&!save(store,state))store_.broken=true;
function warningText(){
  if(store_.resetFailed)return 'Сброшен только этот экран: браузер не дал удалить сохранённый комплект, после перезагрузки он может вернуться.';
  if(store_.broken)return 'Сохранение недоступно: выбор работает, пока открыта эта страница. После перезагрузки или закрытия вкладки он пропадёт.';
  if(store_.invalid)return 'Прежнее сохранение повреждено или имеет неизвестную версию — начинаем с чистого дома.';
  return '';
}
// Живая область вне #app не пересоздаётся при рендере: новое предупреждение объявляется один раз, фокус не меняется.
const live=document.querySelector('#live');let announced='';
function announceWarning(){const t=warningText();if(t!==announced){announced=t;if(live&&t)live.textContent=t}}
const view={mode:{},dialog:false,status:'',announce:''};
const app=document.querySelector('#app');
const cart=document.querySelector('#cart-link');

function persist(){if(save(store,state)){store_.broken=false;store_.resetFailed=false}else store_.broken=true}
const sel=()=>Object.fromEntries(roomOrder.map(id=>[id,state.rooms[id].items]));
// Маршруты начинаются с «#/». Обычные якоря (#kollekciya, #app) остаются якорями на текущей странице.
let anchorPage='home',pendingAnchor='';
const route=()=>{const raw=location.hash;if(raw&&!raw.startsWith('#/'))return {page:anchorPage,arg:'',anchor:raw.slice(1)};const h=raw.replace(/^#\/?/,'').split('/');return {page:h[0]||'home',arg:h[1]||''}};
const go=hash=>{if(location.hash===hash)render(true);else location.hash=hash};
const arrow='<span aria-hidden="true">↗</span>';
const roomIndex=id=>roomOrder.indexOf(id)+1;

// ——— Общие фрагменты ———
function tierStrip(n,compact){return `<ol class="tiers${compact?' compact':''}" aria-label="Скидка за освещённые комнаты">${tiers.map(t=>`<li class="${n>=t.rooms?'reached':''}"><b>${t.rooms} ${t.rooms===5?'комнат':'комнаты'}</b><span>−${t.pct}%${t.gift?' и монтаж в подарок':''}</span>${n>=t.rooms?'<i>получено</i>':''}</li>`).join('')}</ol>`}
function progressLine(x){
  if(!x.n)return 'Ни одна комната пока не освещена.';
  const next=x.nextTier?` До −${x.nextTier.pct}% — ещё ${x.nextTier.rooms-x.n} ${x.nextTier.rooms-x.n===1?'комната':'комнаты'}.`:'';
  return `Освещено ${x.n} из ${x.total}. ${x.pct?`Скидка ${x.pct}% закреплена.`:'Скидка начнётся со второй комнаты.'}${next}`;
}
function notices(){
  let out='';
  const w=warningText();
  if(w)out+=`<p class="warning">${w}</p>`;
  if(state.legacyOpen){
    const sug=legacySuggestion(state);
    out+=`<aside class="migration" aria-label="Обновление демонстрации"><p><strong>Демонстрация обновлена.</strong> Теперь это промоакция салона: светильники подбираются по комнатам. ${sug.length?`Из прежнего выбора получились изделия: ${sug.map(x=>`«${products[x.product].name}» (${rooms[x.room].name.toLowerCase()})`).join(', ')}.`:'Прежний прогресс сохранён на этом устройстве, но изделий в нём не выбрано.'}</p><div class="row">${sug.length?'<button class="secondary" data-action="legacy-apply">Добавить в комплект</button>':''}<button class="quiet" data-action="legacy-dismiss">${sug.length?'Не нужно':'Понятно'}</button></div></aside>`;
  }
  return out;
}
function cartBar(){
  const x=summary(state);
  if(!x.lines.length)return '';
  return `<div class="cart-bar" role="region" aria-label="Комплект"><p><b>Комплект: ${x.lines.length} ${plural(x.lines.length,'изделие','изделия','изделий')} · ${rub(x.afterDiscount)}</b><span>${x.pct?`скидка ${x.pct}% учтена`:'скидка — со второй комнаты'} · освещено ${x.n}/${x.total}</span></p><a class="secondary" href="#/komplekt">Комплект и скидка</a></div>`;
}
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c};
function houseWithSpots(){
  return `<div class="house-wrap">${house(sel())}<div class="house-spots" aria-hidden="true">${roomOrder.map(id=>{const c=cells[id];return `<a tabindex="-1" href="#/komnata/${id}" class="spot ${isLit(state,id)?'lit':''}" style="left:${c.x/12}%;top:${c.y/8.6}%;width:${c.w/12}%;height:${c.h/8.6}%"><span>${rooms[id].name}</span></a>`}).join('')}</div></div>`;
}

// ——— Вход ———
function home(){
  const x=summary(state);
  const started=x.lines.length>0||roomOrder.some(id=>state.rooms[id].found);
  const cta=!started?`<a class="primary" href="#/komnata/hall">Осветить дом — начать с прихожей ${arrow}</a>`:x.next?`<a class="primary" href="#/komnata/${x.next}">Продолжить: ${rooms[x.next].name.toLowerCase()} ${arrow}</a>`:`<a class="primary" href="#/komplekt">Открыть мой комплект ${arrow}</a>`;
  return `<section class="hero">
<div class="hero-copy">
<p class="eyebrow"><span class="dot"></span>Салон света · акция «${promo.name}» · демо</p>
<h1 id="screen-title" tabindex="-1">Темнеет в 16:30.<br><em>Зажгите дом.</em></h1>
<p class="lead">Пройдите пять комнат, найдите, где свет мешает, и подберите светильники из коллекции. Каждая освещённая комната увеличивает скидку на весь комплект.</p>
${tierStrip(x.n)}
${started?`<p class="progress-note">${progressLine(x)} <button class="quiet restart" data-action="reset">Начать заново</button></p>`:''}
<div class="row">${cta}<a class="text-link" href="#kollekciya">Смотреть коллекцию</a></div>
<p class="fine">3–5 минут · цены и акция демонстрационные · ничего не отправляется</p>
</div>
<div class="hero-visual">${house(sel(),{title:x.n?'Ваш дом: освещённые комнаты светятся тёплым светом':'Дом вечером: в каждой комнате одна плоская лампа'})}<p class="image-caption"><span>${x.n?`Ваш дом · освещено ${x.n} из 5`:'Так сейчас: одна плоская лампа на комнату'}</span><span>Иллюстрация</span></p></div>
</section>
<section class="how" aria-labelledby="how-title"><h2 id="how-title">Как работает акция</h2><ol>
<li><span>01</span><h3>Найдите, где свет мешает</h3><p>В каждой комнате — узнаваемая проблема: тень на столешнице, лицо в тени у зеркала, слишком яркий экран.</p></li>
<li><span>02</span><h3>Выберите светильник</h3><p>Сравните «как сейчас» и «с новым светом». Выбранное изделие сразу появляется в комнате, и она загорается.</p></li>
<li><span>03</span><h3>Оформите комплект со скидкой</h3><p>2 комнаты — −5%, 3 — −10%, все пять — −15% и монтаж в подарок. Прогресс сохраняется на этом устройстве.</p></li></ol></section>
<section class="collection" id="kollekciya" aria-labelledby="col-title"><div class="section-head"><p class="eyebrow">Коллекция «${promo.name}» · 8 изделий</p><h2 id="col-title">Свет для каждой комнаты</h2><p>Цены демонстрационные. В акции светильник выбирается для конкретной комнаты.</p></div>
<ul class="product-grid">${Object.entries(products).map(([id,p])=>`<li class="product"><div class="art-frame">${productArt(id)}</div><p class="ptype">${p.type}</p><h3>«${p.name}»</h3><p>${p.does}</p><p class="pmeta">${p.finish}</p><p class="price">${rub(p.price)}</p><p class="prooms">Для: ${roomOrder.filter(r=>rooms[r].options.includes(id)).map(r=>`<a href="#/komnata/${r}">${rooms[r].name}</a>`).join(', ')}</p></li>`).join('')}</ul></section>
<section class="terms" aria-labelledby="terms-title"><h2 id="terms-title">Доставка, монтаж, сроки</h2><dl>
<div><dt>Доставка</dt><dd>Курьером по городу — 990 ₽ или самовывоз из салона бесплатно.</dd></div>
<div><dt>Монтаж</dt><dd>Мастер салона — 1 200 ₽ за светильник. При пяти освещённых комнатах — в подарок.</dd></div>
<div><dt>Возврат</dt><dd>Демо-условие: светильник без следов монтажа можно вернуть в салон в течение 14 дней. Реальные правила возврата определяет салон.</dd></div>
<div><dt>Срок акции</dt><dd>${promo.period}. Промокод появляется со второй освещённой комнатой.</dd></div>
<div><dt>Всё это</dt><dd>Демонстрационные условия вымышленного салона, не публичная оферта.</dd></div></dl></section>
<section class="faq" aria-labelledby="faq-title"><h2 id="faq-title">Вопросы</h2>
<details><summary>Это настоящий магазин?</summary><p>Нет. Это демонстрационный промолендинг: салон, коллекция, цены и акция вымышлены. Заказ, оплата и доставка не выполняются.</p></details>
<details><summary>Нужно ли оставлять телефон или почту?</summary><p>Нет. Страница не запрашивает контакты и ничего не отправляет. Выбор хранится только в этом браузере.</p></details>
<details><summary>Как считается скидка?</summary><p>Комната считается освещённой, когда в ней выбран хотя бы один светильник. Скидка зависит от числа таких комнат и действует на весь комплект.</p></details>
<details><summary>Можно ли вернуться позже?</summary><p>Да. Освещённые комнаты и скидка сохраняются на этом устройстве. Начать заново можно на главной или на странице комплекта.</p></details>
<details><summary>А если светильник не подойдёт?</summary><p>В демо ничего не покупается. В реальном проекте здесь были бы правила возврата салона; демо-условие — в разделе «Доставка, монтаж, сроки».</p></details></section>`;
}

// ——— Дом ———
function dom(){
  const x=summary(state);
  return `<section class="page">
<div class="page-head"><p class="eyebrow">Акция «${promo.name}» · ваш дом</p><a class="quiet" href="#/">На главную</a></div>
<div class="dom-grid"><div>
<h1 id="screen-title" tabindex="-1">Ваш дом <em>вечером</em></h1>
<p class="lead">${progressLine(x)}</p>${tierStrip(x.n,true)}
${x.next?`<a class="primary" href="#/komnata/${x.next}">${x.n?'Следующая комната':'Начать'}: ${rooms[x.next].name.toLowerCase()} ${arrow}</a>`:`<a class="primary" href="#/komplekt">Открыть комплект ${arrow}</a>`}
</div>${houseWithSpots()}</div>
<ul class="room-list">${roomOrder.map(id=>{const r=state.rooms[id];return `<li><a href="#/komnata/${id}" class="${isLit(state,id)?'lit':''}"><span class="list-num">0${roomIndex(id)}</span><span><strong>${rooms[id].name}</strong><small>${isLit(state,id)?'Освещена: '+r.items.map(p=>'«'+products[p].name+'»').join(', '):rooms[id].problem}</small></span><b>${isLit(state,id)?'Изменить':'Осветить'}</b></a></li>`}).join('')}</ul>
</section>${cartBar()}`;
}

// ——— Комната ———
function room(id){
  if(!Object.hasOwn(rooms,id))return notFound();
  const r=rooms[id],st=state.rooms[id],x=summary(state);
  const mode=st.items.length?(view.mode[id]||'after'):'now';
  const scene=roomScene(id,st.items,mode,mode==='now'?`${r.name} сейчас: одна плоская лампа под потолком. ${r.problem}.`:`${r.name} с выбранным светом: ${st.items.map(p=>products[p].type.toLowerCase()+' «'+products[p].name+'»').join(', ')}.`);
  const sp=spots[id];
  const marker=!st.found&&mode==='now'?`<button class="hotspot" data-action="find" style="left:${sp.x}%;top:${sp.y}%"><span>Где свет мешает?</span></button>`:'';
  const next=roomOrder.find(k=>k!==id&&!isLit(state,k));
  return `<section class="page room-page">
<div class="page-head"><p class="eyebrow">Комната ${roomIndex(id)} из 5 · акция «${promo.name}»</p><a class="quiet" href="#/dom">Весь дом</a></div>
<h1 id="screen-title" tabindex="-1" class="room-title">${r.name}</h1>
<div class="room-grid">
<div class="scene-col">
<div class="scene">${scene}${marker}</div>
<div class="compare" role="group" aria-label="Сравнение"><button data-action="mode" data-mode="now" aria-pressed="${mode==='now'}">Как сейчас</button><button data-action="mode" data-mode="after" aria-pressed="${mode==='after'}" ${st.items.length?'':'disabled'}>С новым светом</button></div>
<p class="caption">${mode==='now'?'Сейчас: одна плоская лампа под потолком.':'Плоская лампа выключена, светят выбранные изделия.'} Иллюстрация, а не светотехнический расчёт.</p>
</div>
<div class="controls-col">
<div class="problem ${st.found?'found':''}">${st.found?`<p class="eyebrow">Что мешает</p><h2>${r.problem}</h2><p>${r.story}</p>`:`<h2>Где здесь свет мешает?</h2><p>Нажмите на отметку на картинке или</p><button class="secondary" data-action="find">Показать проблему</button>`}</div>
<h2 class="pick-title">Выберите светильник <small>до ${maxPerRoom} в комнату</small></h2>
<ul class="pick-list">${r.options.map(p=>{const item=products[p],chosen=st.items.includes(p);return `<li class="pick ${chosen?'chosen':''}"><div class="art-frame small">${productArt(p)}</div><div><p class="ptype">${item.type}</p><h3>«${item.name}» <span class="price">${rub(item.price)}</span></h3><p>${r.fix[p]}</p>${chosen?`<button class="secondary" data-action="remove" data-product="${p}" aria-label="Убрать «${item.name}» из комплекта">✓ В комплекте · убрать</button>`:`<button class="primary small" data-action="add" data-product="${p}" ${st.items.length>=maxPerRoom?'aria-describedby="full-note"':''}>Добавить в комплект</button>`}</div></li>`}).join('')}</ul>
${st.items.length>=maxPerRoom?`<p class="fine" id="full-note">В комнате уже ${maxPerRoom} светильника. Уберите один, чтобы выбрать другой.</p>`:''}
<p class="status" id="room-status" role="status">${view.status}</p>
${st.items.length?`<div class="lit-note"><p><b>${r.name} освещена.</b> ${progressLine(x)}</p>${next?`<a class="primary" href="#/komnata/${next}">Следующая: ${rooms[next].name.toLowerCase()} ${arrow}</a>`:`<a class="primary" href="#/komplekt">Все комнаты освещены — комплект ${arrow}</a>`}</div>`:''}
</div></div></section>${cartBar()}`;
}

// ——— Комплект ———
function komplekt(){
  const x=summary(state);
  if(!x.lines.length)return `<section class="page narrow"><div class="page-head"><p class="eyebrow">Комплект</p><a class="quiet" href="#/dom">Весь дом</a></div><h1 id="screen-title" tabindex="-1">Комплект пока <em>пуст</em></h1><p class="lead">Осветите хотя бы одну комнату: выбранные светильники появятся здесь вместе со скидкой.</p><a class="primary" href="#/komnata/${x.next||'hall'}">Осветить ${rooms[x.next||'hall'].name.toLowerCase()} ${arrow}</a></section>`;
  const all=!x.next;
  return `<section class="page final">
<div class="page-head"><p class="eyebrow">Акция «${promo.name}» · ваш комплект</p><a class="quiet" href="#/dom">Весь дом</a></div>
<div class="final-grid">
<div class="final-visual">${house(sel(),{title:'Ваш дом с выбранным светом'})}<p class="image-caption"><span>${all?'Все пять комнат освещены':`Освещено ${x.n} из 5`}</span><span>Иллюстрация</span></p></div>
<div class="final-copy">
<h1 id="screen-title" tabindex="-1">${all?'Ваш дом готов <em>к долгим вечерам</em>':`Ваш комплект: <em>${x.n} из 5 комнат</em>`}</h1>
<table class="lines"><caption class="sr">Светильники в комплекте</caption><tbody>${x.lines.map(l=>`<tr><th scope="row"><span>${rooms[l.room].name}</span>${products[l.product].type} «${products[l.product].name}»</th><td>${rub(l.price)}</td><td><a href="#/komnata/${l.room}" aria-label="Изменить: ${rooms[l.room].name}">Изменить</a></td></tr>`).join('')}</tbody>
<tfoot><tr><th scope="row">Сумма</th><td>${rub(x.subtotal)}</td><td></td></tr><tr class="disc"><th scope="row">Скидка ${x.pct}%</th><td>${x.pct?'−'+rub(x.discount):'—'}</td><td></td></tr>${x.gift?'<tr class="disc"><th scope="row">Монтаж</th><td>в подарок</td><td></td></tr>':''}<tr class="grand"><th scope="row">Итого</th><td>${rub(x.afterDiscount)}</td><td></td></tr></tfoot></table>
${x.nextTier?`<p class="upsell">Осветите ещё ${x.nextTier.rooms-x.n} ${plural(x.nextTier.rooms-x.n,'комнату','комнаты','комнат')} — скидка ${x.nextTier.pct}%${x.nextTier.gift?' и монтаж в подарок':''}. <a href="#/komnata/${x.next}">${rooms[x.next].name} →</a></p>`:''}
${x.code?`<p class="code"><span>Ваш промокод</span><b>${x.code}</b><small>Действует до 28.02.2027 · демо</small></p>`:''}
<div class="row"><a class="primary" href="#/oformlenie">Оформить комплект ${arrow}</a><a class="secondary" href="#/gotovo/konsultaciya">Консультация дизайнера</a></div>
<div class="export"><h2>Сохранить или показать</h2><div class="row"><button class="quiet" data-action="download">Сохранить подборку (SVG)</button><button class="quiet" data-action="share">Поделиться открыткой</button><button class="quiet" data-action="copy">Скопировать текст</button>${pngReady&&pngReady.text===cardText(state)?'<button class="secondary" data-action="png-save">Скачать открытку (PNG)</button>':''}</div><p class="status" id="export-status" role="status">${view.status}</p>
<label class="sr" for="result-text">Текст подборки для ручного копирования</label><textarea id="result-text" readonly rows="6">${cardText(state)}</textarea></div>
<button class="danger-link" data-action="reset">Начать заново и сбросить данные</button>
</div></div></section>`;
}

// ——— Оформление (демо) ———
function oformlenie(){
  const x=checkoutCost(state),c=state.checkout,o=checkoutOptions;
  if(!x.lines.length)return komplekt();
  const radio=(key,id,label,extra)=>`<label class="choice"><input type="radio" name="${key}" value="${id}" ${c[key]===id?'checked':''} data-action="checkout"><span>${label}</span>${extra?`<small>${extra}</small>`:''}</label>`;
  return `<section class="page narrow checkout">
<div class="page-head"><p class="eyebrow">Оформление · демо</p><a class="quiet" href="#/komplekt">Назад к комплекту</a></div>
<h1 id="screen-title" tabindex="-1">Оформление <em>комплекта</em></h1>
<p class="lead">${x.lines.length} ${plural(x.lines.length,'светильник','светильника','светильников')} для ${x.n} ${plural(x.n,'комнаты','комнат','комнат')}. Контакты не запрашиваются: в демо заказ никуда не уходит.</p>
<form class="checkout-form" data-form="checkout">
<fieldset><legend>Доставка</legend>${Object.entries(o.delivery).map(([id,v])=>radio('delivery',id,v.label,v.price?rub(v.price):'бесплатно')).join('')}</fieldset>
<fieldset><legend>Монтаж</legend>${Object.entries(o.mount).map(([id,v])=>radio('mount',id,v.label,id==='yes'?(x.gift?'в подарок по акции':`${rub(v.perItem)} × ${x.lines.length}`):'')).join('')}</fieldset>
<fieldset><legend>Удобное время</legend>${Object.entries(o.slot).map(([id,v])=>radio('slot',id,v.label)).join('')}</fieldset>
</form>
<table class="lines"><caption class="sr">Расчёт</caption><tbody>
<tr><th scope="row">Светильники со скидкой ${x.pct}%</th><td>${rub(x.afterDiscount)}</td></tr>
<tr><th scope="row">Доставка</th><td>${x.delivery?rub(x.delivery):'бесплатно'}</td></tr>
<tr><th scope="row">Монтаж</th><td>${c.mount==='no'?'—':x.gift?'в подарок':rub(x.mount)}</td></tr></tbody>
<tfoot><tr class="grand"><th scope="row">К оплате при получении</th><td>${rub(x.grand)}</td></tr></tfoot></table>
<div class="row"><a class="primary" href="#/gotovo">Подтвердить заказ (демо) ${arrow}</a></div>
<p class="fine">Нажатие ничего не отправляет и не создаёт заказ: это демонстрация того, как заканчивался бы путь.</p>
</section>`;
}

function gotovo(kind){
  const x=checkoutCost(state),consult=kind==='konsultaciya';
  return `<section class="page narrow done">
<p class="eyebrow">Демо · ничего не отправлено</p>
<h1 id="screen-title" tabindex="-1">${consult?'Здесь была бы <em>запись к дизайнеру</em>':'Здесь заказ <em>ушёл бы в салон</em>'}</h1>
<p class="lead">${consult?'В реальном проекте посетитель выбрал бы время выезда, а дизайнер салона получил бы его подборку: комнаты, изделия и найденные проблемы.':'В реальном проекте заказ попал бы в систему салона, менеджер позвонил бы подтвердить время доставки и монтажа, а оплата прошла бы при получении.'}</p>
${x.lines.length?`<p>Ваша подборка: ${x.lines.length} ${plural(x.lines.length,'светильник','светильника','светильников')}, ${rub(consult?x.afterDiscount:x.grand)}${x.code?`, промокод ${x.code}`:''}.</p>`:''}
<p class="fine">Это демонстрационный промолендинг вымышленного салона. Заказ не создан, контакты не собраны, данные не переданы.</p>
<div class="row"><a class="primary" href="#/komplekt">Вернуться к комплекту ${arrow}</a><a class="secondary" href="#/">На главную</a></div>
</section>`;
}
function notFound(){return `<section class="page narrow"><h1 id="screen-title" tabindex="-1">Такой страницы нет</h1><a class="primary" href="#/">На главную ${arrow}</a></section>`}

function dialog(){return view.dialog?`<div class="backdrop"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h2 id="dialog-title">Сбросить дом?</h2><p>Удалятся освещённые комнаты, комплект и параметры оформления D6 на этом устройстве. Другие сайты и данные браузера не затрагиваются.</p><div class="row"><button class="secondary" data-action="reset-cancel">Отмена</button><button class="primary" data-action="reset-confirm">Сбросить</button></div></div></div>`:''}

// ——— Рендер ———
let lastRoute='';
function render(focus){
  const {page,arg,anchor}=route();
  // Якорь раздела главной с другой страницы: сначала открыть главную, затем прокрутить.
  if(anchor&&page!=='home'&&anchor!=='app'){pendingAnchor=anchor;location.replace('#/');return}
  const html={home,dom,komnata:()=>room(arg),komplekt,oformlenie,gotovo:()=>gotovo(arg)}[page];
  app.innerHTML=notices()+(html?html():notFound())+dialog();
  document.body.dataset.page=page;
  const x=summary(state);
  cart.hidden=!x.lines.length;
  cart.innerHTML=`<span class="cl-word">Комплект</span> <b>${x.lines.length}</b>${x.pct?` <i>−${x.pct}%</i>`:''}`;
  cart.setAttribute('aria-label',`Комплект: ${x.lines.length} ${plural(x.lines.length,'изделие','изделия','изделий')}${x.pct?`, скидка ${x.pct}%`:''}`);
  const key=page+'/'+arg;
  if(view.dialog)app.querySelector('[data-action=reset-cancel]')?.focus();
  else if(anchor||pendingAnchor){const t=document.getElementById(anchor||pendingAnchor);pendingAnchor='';if(t){t.tabIndex=-1;t.scrollIntoView();t.focus({preventScroll:true})}}
  else if(focus||key!==lastRoute){window.scrollTo(0,0);app.querySelector('#screen-title')?.focus({preventScroll:true})}
  if(!anchor)anchorPage=page;
  lastRoute=key;
  announceWarning();
}
function announce(text){view.status=text;const el=app.querySelector('#room-status,#export-status');if(el)el.textContent=text}

// Защита от двойного клика: одинаковое действие с тем же изделием в течение 450 мс игнорируется.
let last={key:'',t:0};
function guard(key){const t=performance.now();if(last.key===key&&t-last.t<450)return false;last={key,t};return true}

function refocus(selector){const el=app.querySelector(selector);if(el)el.focus({preventScroll:true})}

app.addEventListener('click',async e=>{
  const b=e.target.closest('[data-action]');if(!b||b.tagName==='INPUT')return;
  const a=b.dataset.action,{page,arg}=route();
  if(a==='find'){state=find(state,arg);persist();view.status='Проблема найдена. Выберите светильник ниже.';render();const pr=app.querySelector('.problem');if(pr){pr.tabIndex=-1;pr.focus()}return}
  if(a==='add'||a==='remove'){
    const p=b.dataset.product;if(!guard(arg+':'+p))return;
    const res=(a==='add'?addItem:removeItem)(state,arg,p);
    if(res.result==='full'){announce(`В комнате уже ${maxPerRoom} светильника — уберите один, чтобы выбрать «${products[p].name}».`);return}
    if(res.result!=='added'&&res.result!=='removed')return;
    state=res.state;persist();view.mode[arg]='after';
    const x=summary(state);
    view.status=a==='add'?`«${products[p].name}» в комплекте. ${rooms[arg].name} освещена. ${x.pct?`Скидка ${x.pct}%.`:''}`:`«${products[p].name}» убран из комплекта.${isLit(state,arg)?'':` ${rooms[arg].name} снова без нового света.`}`;
    render();refocus(`[data-product="${p}"]`);return}
  if(a==='mode'){view.mode[arg]=b.dataset.mode;render();refocus(`[data-mode="${b.dataset.mode}"]`);return}
  if(a==='legacy-apply'){state=applyLegacy(state);persist();render();refocus('#screen-title');return}
  if(a==='legacy-dismiss'){state=dismissLegacy(state);persist();render();refocus('#screen-title');return}
  if(a==='reset'){view.dialog=true;render();return}
  if(a==='reset-cancel'){view.dialog=false;render();refocus('[data-action=reset]');return}
  if(a==='reset-confirm'){
    state=empty();view.dialog=false;view.mode={};view.status='';pngReady=null;
    // Если ключ не удаляется, пробуем записать пустой дом; иначе честно говорим, что сброшен только экран.
    const removed=clear(store),saved=!removed&&save(store,state);
    if(removed||saved){store_.invalid=false;store_.resetFailed=false;if(saved)store_.broken=false}else store_.resetFailed=true;
    go('#/');return}
  if(a==='copy')return copyText();
  if(a==='download')return download();
  if(a==='share')return share();
  if(a==='png-save')return savePng();
});
app.addEventListener('change',e=>{const i=e.target;if(i.dataset.action!=='checkout')return;state=setCheckout(state,i.name,i.value);persist();render();refocus(`input[name="${i.name}"][value="${i.value}"]`)});
app.addEventListener('keydown',e=>{
  if(!view.dialog)return;
  if(e.key==='Escape'){view.dialog=false;render();refocus('[data-action=reset]');return}
  if(e.key==='Tab'){const f=[...app.querySelectorAll('.dialog button')];const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}
});

function selectManual(msg){announce(msg);const t=app.querySelector('#result-text');if(t){t.focus();t.select()}}
async function copyText(){try{await navigator.clipboard.writeText(cardText(state));announce('Текст подборки скопирован.')}catch{selectManual('Браузер не дал скопировать. Текст выделен ниже — скопируйте его вручную.')}}
function saveBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function download(){try{saveBlob(new Blob([cardSvg(state)],{type:'image/svg+xml'}),'moy-dom-dolgie-vechera.svg');announce('Файл подборки сохранён на устройство. Он открывается без сайта и сети.')}catch{selectManual('Файл не удалось создать. Текст подборки выделен ниже — скопируйте его вручную.')}}
async function png(){
  const url=URL.createObjectURL(new Blob([cardSvg(state)],{type:'image/svg+xml'}));
  try{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);return await new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(Error('png')),'image/png'))}
  finally{URL.revokeObjectURL(url)}
}
// Открытка, подготовленная перед неудачным вызовом Web Share; действительна, пока не изменился комплект.
let pngReady=null;
function savePng(){if(!pngReady||pngReady.text!==cardText(state))return;try{saveBlob(pngReady.blob,'moy-dom-dolgie-vechera.png');announce('Открытка сохранена как PNG.')}catch{selectManual('Файл не удалось сохранить. Текст подборки выделен ниже — скопируйте его вручную.')}}
async function share(){
  try{
    const blob=await png();const file=new File([blob],'moy-dom-dolgie-vechera.png',{type:'image/png'});
    if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Мой дом к долгим вечерам',text:'Свет для дома подобран — демо-акция «Долгие вечера».'});announce('Открытка передана в выбранное приложение.')}catch(err){
      if(err?.name==='AbortError'){announce('Отправка открытки отменена.');return}
      pngReady={blob,text:cardText(state)};view.status='Поделиться не получилось. Открытка готова — скачайте её как PNG кнопкой «Скачать открытку».';render();refocus('[data-action=png-save]')}
    return}
    saveBlob(blob,file.name);announce('В этом браузере нельзя поделиться напрямую — открытка сохранена как PNG.');
  }catch{selectManual('Открытку не удалось создать. Текст подборки выделен ниже — скопируйте его вручную.')}
}

window.addEventListener('hashchange',()=>{view.status='';view.dialog=false;pngReady=null;render()});
// Две вкладки: последняя запись побеждает, открытая вкладка подхватывает изменения.
window.addEventListener('storage',e=>{if(e.key!==KEY)return;const next=load(store);if(next.status==='saved'||next.status==='empty'){state=next.state;render()}});
document.documentElement.classList.add('js');
render();
