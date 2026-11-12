import {test} from 'node:test';
import assert from 'node:assert/strict';
import {empty,validate,find,addItem,removeItem,setCheckout,summary,checkoutCost,legacySuggestion,applyLegacy,dismissLegacy,tierFor} from '../state.js';
import {load,save,clear,KEY} from '../storage.js';
import {cardText,cardSvg} from '../card.js';

const add=(s,r,p)=>addItem(s,r,p).state;
const mem=(init={})=>{const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),m}};

test('комната освещается выбранным изделием, повтор не добавляет второй раз',()=>{
  let s=empty();
  s=find(s,'kitchen');assert.equal(s.rooms.kitchen.found,true);assert.equal(find(s,'kitchen'),s);
  const r1=addItem(s,'kitchen','line');assert.equal(r1.result,'added');s=r1.state;
  assert.equal(addItem(s,'kitchen','line').result,'same');
  assert.deepEqual(summary(s).lit,['kitchen']);
  assert.equal(removeItem(s,'kitchen','arc').result,'same');
  s=removeItem(s,'kitchen','line').state;assert.equal(summary(s).n,0);
});
test('не больше двух изделий в комнате и только из её вариантов',()=>{
  let s=add(add(empty(),'living','dawn'),'living','pause');
  assert.equal(addItem(s,'living','halo').result,'full');
  assert.equal(addItem(s,'living','focus').result,'invalid');
  assert.equal(addItem(s,'garage','line').result,'invalid');
});
test('скидка и подарок вычисляются из числа освещённых комнат',()=>{
  assert.deepEqual([0,1,2,3,4,5].map(n=>tierFor(n).pct),[0,0,5,10,10,15]);
  let s=add(empty(),'hall','point');assert.equal(summary(s).code,null);
  s=add(s,'kitchen','line');let x=summary(s);assert.equal(x.pct,5);assert.equal(x.subtotal,12200);assert.equal(x.discount,610);assert.match(x.code,/^ВЕЧЕР5-[0-9A-Z]{4}$/);
  s=add(add(add(s,'living','dawn'),'work','focus'),'bedroom','fold');x=summary(s);
  assert.equal(x.pct,15);assert.equal(x.gift,true);assert.equal(x.next,null);assert.equal(checkoutCost(s).mount,0);
  // Промокод детерминирован и зависит от набора.
  assert.equal(summary(s).code,x.code);assert.notEqual(summary(add(s,'kitchen','arc')).code,x.code);
});
test('оформление: только допустимые значения, монтаж считается без подарка',()=>{
  let s=add(add(empty(),'hall','point'),'kitchen','line');
  assert.equal(setCheckout(s,'delivery','drone'),s);
  s=setCheckout(s,'delivery','pickup');const c=checkoutCost(s);
  assert.equal(c.delivery,0);assert.equal(c.mount,2400);assert.equal(c.grand,c.afterDiscount+2400);
  s=setCheckout(s,'mount','no');assert.equal(checkoutCost(s).mount,0);
});
test('проверка структуры отклоняет подделки и чужие версии',()=>{
  const ok=JSON.parse(JSON.stringify(add(empty(),'kitchen','line')));
  assert.ok(validate(ok));
  for(const bad of [null,[],{version:9},{...ok,extra:1},{...ok,rooms:{...ok.rooms,kitchen:{found:true,items:['line','line']}}},{...ok,rooms:{...ok.rooms,kitchen:{found:true,items:['dawn']}}},{...ok,checkout:{...ok.checkout,slot:'night'}},{...ok,legacyOpen:true}])assert.equal(validate(bad),null);
});
test('миграция v1–v4: прежний выбор становится предложением, а не молча добавленным комплектом',()=>{
  const ids=['dawn','focus','arc','pause','line','halo','fold','point'],correct=[1,2,0,1,2,0,1,2];
  const v3={version:3,answers:Object.fromEntries(ids.map((id,i)=>[id,correct[i]])),draft:{scenario:'work',modules:['focus','line']},personal:{scenario:'work',modules:['focus','line']}};
  let s=validate(v3);assert.equal(s.legacyOpen,true);assert.equal(summary(s).n,0);
  assert.deepEqual(legacySuggestion(s),[{room:'work',product:'focus'},{room:'kitchen',product:'line'}]);
  const applied=applyLegacy(s);assert.deepEqual(summary(applied).lit,['kitchen','work']);assert.equal(applied.legacyOpen,false);assert.deepEqual(applied.legacy,v3);
  assert.equal(dismissLegacy(s).legacyOpen,false);
  const v4={version:4,situation:'evening',lights:['ambient','accent'],done:true,legacy:null};
  assert.deepEqual(legacySuggestion(validate(v4)),[{room:'living',product:'dawn'},{room:'living',product:'halo'}]);
  const v1partial={version:1,answers:{dawn:0,focus:0}};assert.deepEqual(legacySuggestion(validate(v1partial)),[]);
  assert.equal(validate({version:4,situation:'disco',lights:[],done:false,legacy:null}),null);
  // Сохранённый v5 с прежними данными проходит проверку повторно.
  assert.ok(validate(JSON.parse(JSON.stringify(applied))));
});
test('хранилище: свой ключ, повреждение, отказ, сброс только D6',()=>{
  const st=mem({other:'keep'});
  assert.equal(load(st).status,'empty');
  const s=add(empty(),'kitchen','arc');assert.ok(save(st,s));
  const back=load(st);assert.equal(back.status,'saved');assert.deepEqual(back.state,s);
  st.setItem(KEY,'{');assert.equal(load(st).status,'invalid');
  st.setItem(KEY,JSON.stringify({version:2,answers:{dawn:1}}));assert.equal(load(st).status,'migrated');
  assert.ok(clear(st));assert.equal(st.getItem('other'),'keep');
  const broken={getItem(){throw Error('denied')},setItem(){throw Error('denied')},removeItem(){throw Error('denied')}};
  assert.equal(load(broken).status,'unavailable');assert.equal(save(broken,s),false);
});
test('подборка: разные наборы дают разный текст и автономный SVG',()=>{
  const a=add(add(empty(),'hall','point'),'kitchen','line');
  const b=add(add(add(empty(),'living','pause'),'work','focus'),'bedroom','fold');
  assert.notEqual(cardText(a),cardText(b));assert.match(cardText(a),/Точка/);assert.match(cardText(b),/Складка/);
  assert.match(cardText(a),/Ничего не отправлено/);
  for(const s of [a,b]){const svg=cardSvg(s).replaceAll('xmlns="http://www.w3.org/2000/svg"','');// пространство имён SVG — не ресурс

    assert.match(svg,/^<\?xml/);assert.doesNotMatch(svg,/<script|foreignObject|href=|xlink|on[a-z]+=|https?:\/\//i);
    // Ссылки url() допустимы только на собственные градиенты/фильтры внутри файла.
    for(const m of svg.matchAll(/url\(([^)]*)\)/g))assert.match(m[1],/^#[a-z0-9-]+$/i);}
  assert.match(cardSvg(b),/Торшер/);assert.doesNotMatch(cardSvg(a),/Торшер/);
});
test('подборка: первая строка списка ниже тёмной зоны с домом (R4)',()=>{
  for(const s of [add(empty(),'hall','point'),add(add(add(add(add(empty(),'hall','point'),'kitchen','line'),'living','dawn'),'work','focus'),'bedroom','fold')]){
    const svg=cardSvg(s);
    const dark=+svg.match(/<rect width="1200" height="(\d+)" fill="#141c1a"/)[1];
    const rows=[...svg.matchAll(/<text x="70" y="(\d+)" font-size="26" fill="#2a312d">/g)].map(m=>+m[1]);
    // Верх строки 26px примерно на 0,8 кегля выше базовой линии; нужен светлый отступ не меньше 30px.
    assert.ok(rows[0]-26*.8-dark>=30,`первая строка ${rows[0]}, тёмная зона до ${dark}`);
    const h=+svg.match(/height="(\d+)" viewBox/)[1];assert.ok(rows.at(-1)<h-100);
  }
});
