// Чистая модель состояния акции: комнаты, выбранные изделия, параметры демо-оформления.
// Прогресс, скидка, сумма и промокод не хранятся, а вычисляются из выбора.
import {rooms,roomOrder,products,maxPerRoom,tiers,checkoutOptions} from './data.js';
import {validate as validate123,validate4} from './legacy.js';

const own=(o,k)=>!!o&&Object.hasOwn(o,k);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const sameKeys=(x,keys)=>plain(x)&&Object.keys(x).sort().join()===[...keys].sort().join();
export const VERSION=5;

const blankRooms=()=>Object.fromEntries(roomOrder.map(id=>[id,{found:false,items:[]}]));
const defaultCheckout=()=>({delivery:'courier',mount:'yes',slot:'weekday'});
export const empty=()=>({version:VERSION,rooms:blankRooms(),checkout:defaultCheckout(),legacy:null,legacyOpen:false});

// Куда прежний модуль/слой попадает в новой коллекции.
const homeRoom={point:'hall',line:'kitchen',arc:'kitchen',dawn:'living',pause:'living',halo:'living',focus:'work',fold:'bedroom'};
const fromLight={ambient:'dawn',task:'focus',accent:'halo'};

function validRoom(id,r){
  if(!sameKeys(r,['found','items'])||typeof r.found!=='boolean'||!Array.isArray(r.items))return false;
  const opts=rooms[id].options;
  return r.items.length<=maxPerRoom&&new Set(r.items).size===r.items.length&&r.items.every(p=>typeof p==='string'&&opts.includes(p));
}
function validCheckout(c){
  return sameKeys(c,['delivery','mount','slot'])&&Object.keys(c).every(k=>typeof c[k]==='string'&&own(checkoutOptions[k],c[k]));
}
function validLegacy(x){
  if(!plain(x))return false;
  if([1,2,3].includes(x.version))return !!validate123(x);
  if(x.version===4)return !!validate4(x);
  return false;
}

export function validate(x){
  if(!plain(x))return null;
  if([1,2,3,4].includes(x.version))return validLegacy(x)?{...empty(),legacy:x,legacyOpen:true}:null;
  if(x.version!==VERSION||!sameKeys(x,['version','rooms','checkout','legacy','legacyOpen']))return null;
  if(!sameKeys(x.rooms,roomOrder)||!roomOrder.every(id=>validRoom(id,x.rooms[id])))return null;
  if(!validCheckout(x.checkout)||typeof x.legacyOpen!=='boolean')return null;
  if(!(x.legacy===null||validLegacy(x.legacy)))return null;
  if(x.legacy===null&&x.legacyOpen)return null;
  return {version:VERSION,rooms:Object.fromEntries(roomOrder.map(id=>[id,{found:x.rooms[id].found,items:[...x.rooms[id].items]}])),checkout:{...x.checkout},legacy:x.legacy,legacyOpen:x.legacyOpen};
}

const withRoom=(s,id,r)=>({...s,rooms:{...s.rooms,[id]:r}});

export function find(s,id){
  if(!own(rooms,id)||s.rooms[id].found)return s;
  return withRoom(s,id,{...s.rooms[id],found:true});
}
// Явные операции «добавить» и «убрать» идемпотентны: повторный клик не меняет результат.
// Возвращают {state, result}: added | removed | same | full | invalid.
export function addItem(s,id,p){
  if(!own(rooms,id)||!rooms[id].options.includes(p))return {state:s,result:'invalid'};
  const r=s.rooms[id];
  if(r.items.includes(p))return {state:s,result:'same'};
  if(r.items.length>=maxPerRoom)return {state:s,result:'full'};
  // Выбор изделия означает, что проблема комнаты уже показана.
  return {state:withRoom(s,id,{found:true,items:[...r.items,p]}),result:'added'};
}
export function removeItem(s,id,p){
  if(!own(rooms,id)||!rooms[id].options.includes(p))return {state:s,result:'invalid'};
  const r=s.rooms[id];
  if(!r.items.includes(p))return {state:s,result:'same'};
  return {state:withRoom(s,id,{...r,items:r.items.filter(x=>x!==p)}),result:'removed'};
}
export function setCheckout(s,key,value){
  return own(checkoutOptions,key)&&own(checkoutOptions[key],value)?{...s,checkout:{...s.checkout,[key]:value}}:s;
}

// Прежний выбор (v1–v4) превращается в предложение, а не в молча добавленный комплект.
export function legacySuggestion(s){
  const x=s.legacy;if(!x)return [];
  let ids=[];
  const fromOld=o=>{const person=o?.personal||o?.draft;return person?.modules||[]};
  if(x.version===4){ids=x.lights.map(l=>fromLight[l]);if(!ids.length&&x.legacy)ids=fromOld(x.legacy)}
  else ids=fromOld(x);
  const out=[],count={};
  for(const p of ids){const room=homeRoom[p];if(!room||out.some(o=>o.product===p))continue;count[room]=(count[room]||0)+1;if(count[room]<=maxPerRoom)out.push({room,product:p})}
  return out;
}
export function applyLegacy(s){
  let next=s;
  for(const {room,product} of legacySuggestion(s)){const r=next.rooms[room];if(!r.items.includes(product)&&r.items.length<maxPerRoom)next=withRoom(next,room,{found:true,items:[...r.items,product]})}
  return {...next,legacyOpen:false};
}
export const dismissLegacy=s=>({...s,legacyOpen:false});

export const isLit=(s,id)=>s.rooms[id].items.length>0;
export const litRooms=s=>roomOrder.filter(id=>isLit(s,id));
export function tierFor(n){let t={rooms:0,pct:0,gift:false};for(const x of tiers)if(n>=x.rooms)t={gift:false,...x};return t}
export function nextTier(n){return tiers.find(x=>x.rooms>n)||null}

function hash(text){let h=0x811c9dc5;for(const ch of text){h^=ch.codePointAt(0);h=Math.imul(h,0x01000193)>>>0}return h.toString(36).toUpperCase().padStart(4,'0').slice(-4)}

export function summary(s){
  const lit=litRooms(s),n=lit.length,tier=tierFor(n);
  const lines=roomOrder.flatMap(room=>s.rooms[room].items.map(p=>({room,product:p,price:products[p].price})));
  const subtotal=lines.reduce((a,l)=>a+l.price,0);
  const discount=Math.round(subtotal*tier.pct/100);
  const code=tier.pct?`ВЕЧЕР${tier.pct}-${hash(lines.map(l=>l.room+':'+l.product).join('|'))}`:null;
  const next=roomOrder.find(id=>!isLit(s,id))||null;
  return {lit,n,total:roomOrder.length,pct:tier.pct,gift:!!tier.gift,nextTier:nextTier(n),lines,subtotal,discount,afterDiscount:subtotal-discount,code,next};
}
export function checkoutCost(s){
  const sum=summary(s),c=s.checkout,o=checkoutOptions;
  const delivery=o.delivery[c.delivery].price;
  const mountFull=o.mount[c.mount].perItem*sum.lines.length;
  const mount=sum.gift?0:mountFull;
  return {...sum,delivery,mount,mountFull,grand:sum.afterDiscount+delivery+mount};
}
