// Сохраняемая подборка: текст и автономный SVG (дом + список + сумма). Только фиксированные данные.
import {rooms,products,promo} from './data.js';
import {summary} from './state.js';
import {house} from './house.js';

export const rub=n=>`${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ')} ₽`;
const selection=s=>Object.fromEntries(Object.keys(s.rooms).map(id=>[id,s.rooms[id].items]));

export function cardText(s){
  const x=summary(s);
  const lines=x.lines.map(l=>`• ${rooms[l.room].name}: ${products[l.product].type} «${products[l.product].name}» — ${rub(l.price)}`);
  return [
    `${promo.brand} — акция «${promo.name}» (демо)`,
    `Мой дом к долгим вечерам: освещено ${x.n} из ${x.total} комнат.`,
    '',
    ...(lines.length?lines:['Комплект пока пуст.']),
    '',
    `Сумма: ${rub(x.subtotal)}`,
    x.pct?`Скидка ${x.pct}%: −${rub(x.discount)}`:'Скидка начинается со второй освещённой комнаты.',
    `Итого: ${rub(x.afterDiscount)}${x.gift?' + монтаж в подарок':''}`,
    x.code?`Промокод: ${x.code}`:'',
    '',
    'Демонстрационный проект: салон, коллекция, цены и акция вымышлены. Ничего не отправлено и не заказано.',
  ].filter((l,i,a)=>!(l===''&&a[i-1]==='')).join('\n');
}

const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function cardSvg(s){
  const x=summary(s);
  const rows=x.lines.map((l,i)=>`<text x="70" y="${1096+i*44}" font-size="26" fill="#2a312d">${esc(rooms[l.room].name)} · ${esc(products[l.product].type)} «${esc(products[l.product].name)}»</text><text x="1130" y="${1096+i*44}" font-size="26" fill="#2a312d" text-anchor="end">${rub(l.price)}</text>`).join('');
  const y=1096+Math.max(x.lines.length,1)*44+20;
  const h=y+330;
  const body=house(selection(s),{labels:true,title:'Мой дом к долгим вечерам'}).replace('<svg class="house" ','<svg x="40" y="200" width="1120" height="803" ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${h}" viewBox="0 0 1200 ${h}" font-family="Arial,Helvetica,sans-serif">
<title>${esc(promo.brand)} — мой дом к долгим вечерам (демо)</title>
<rect width="1200" height="${h}" fill="#efe9da"/>
<rect width="1200" height="1030" fill="#141c1a"/>
<text x="70" y="90" font-size="22" font-weight="700" letter-spacing="3" fill="#e8a477">${esc(promo.brand)} · АКЦИЯ «${esc(promo.name.toUpperCase())}» · ДЕМО</text>
<text x="70" y="160" font-size="54" font-family="Georgia,serif" fill="#fbf3e2">Мой дом к долгим вечерам</text>
${body}
${x.lines.length?rows:`<text x="70" y="1096" font-size="26" fill="#2a312d">Комплект пока пуст.</text>`}
<path d="M70 ${y-14}H1130" stroke="#9aa392"/>
<text x="70" y="${y+30}" font-size="26" fill="#2a312d">Освещено комнат: ${x.n} из ${x.total}</text><text x="1130" y="${y+30}" font-size="26" fill="#2a312d" text-anchor="end">Сумма ${rub(x.subtotal)}</text>
<text x="1130" y="${y+74}" font-size="26" fill="#8a4024" text-anchor="end">${x.pct?`Скидка ${x.pct}%: −${rub(x.discount)}`:'Скидка — со второй комнаты'}</text>
<text x="1130" y="${y+130}" font-size="40" font-family="Georgia,serif" fill="#1d2622" text-anchor="end">Итого ${rub(x.afterDiscount)}</text>
${x.gift?`<text x="1130" y="${y+172}" font-size="24" fill="#2a312d" text-anchor="end">+ монтаж в подарок</text>`:''}
${x.code?`<rect x="70" y="${y+92}" width="420" height="70" rx="6" fill="none" stroke="#1d2622" stroke-dasharray="8 6" stroke-width="2"/><text x="90" y="${y+136}" font-size="28" font-weight="700" letter-spacing="2" fill="#1d2622">${esc(x.code)}</text>`:''}
<text x="70" y="${h-50}" font-size="20" fill="#59625b">Демо: салон, коллекция, цены и акция вымышлены. Ничего не отправлено и не заказано.</text>
</svg>`;
}
