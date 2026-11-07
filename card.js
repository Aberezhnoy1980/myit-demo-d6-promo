import {scenes} from './data.js';
import {scenarios} from './state.js';
export const roles={dawn:'Рассеянный фон',focus:'Свет для рабочего места',arc:'Пространство общего стола',pause:'Островок отдыха',line:'Связь вдоль маршрута',halo:'Акцент вокруг детали',fold:'Глубина световой плоскости',point:'Небольшой финальный акцент'};
const shapes={
 dawn:'<circle cx="105" cy="117" r="43" fill="#f6c76d"/>',
 focus:'<rect x="180" y="48" width="38" height="145" rx="19" fill="#f5e2b9"/>',
 arc:'<path d="M260 160 V118 A60 60 0 0 1 380 118 V160 Z" fill="#d3bbec"/>',
 pause:'<circle cx="460" cy="117" r="39" fill="#ef8051"/>',
 line:'<rect x="55" y="214" width="160" height="15" rx="7" fill="#f6da80"/>',
 halo:'<circle cx="290" cy="220" r="38" fill="#d3bbec"/><circle cx="290" cy="220" r="26" fill="#f2d7a7"/>',
 fold:'<path d="M366 193 H445 L430 245 H351 Z" fill="#f29a6a"/>',
 point:'<circle cx="493" cy="220" r="14" fill="#fbf3b2"/>'
};
// Все строки и геометрия берутся из ограниченного набора, произвольный ввод не используется.
export function cardText(p){const list=p.modules.map(id=>`${scenes.find(s=>s.id===id).name} — ${roles[id].toLowerCase()}`).join('; ');return `Мой световой сценарий: ${scenarios[p.scenario]}. ${list}. Концепция вымышленной коллекции, не проект освещения.`;}
export function makeCard(p){if(!p||!Object.hasOwn(scenarios,p.scenario)||!Array.isArray(p.modules)||p.modules.length<2||p.modules.length>3||new Set(p.modules).size!==p.modules.length||p.modules.some(id=>!Object.hasOwn(shapes,id)))throw Error('Некорректный набор');
 const rows=p.modules.map((id,i)=>`<text x="56" y="${540+i*34}" font-size="20" fill="#eae9df">${scenes.find(s=>s.id===id).name} — ${roles[id]}</text>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="760" viewBox="0 0 680 760" role="img" aria-labelledby="title desc"><title id="title">Мой световой сценарий: ${scenarios[p.scenario]}</title><desc id="desc">${cardText(p)}</desc><rect width="680" height="760" fill="#1b201d"/><text x="56" y="57" fill="#c9cbbd" font-family="Arial,sans-serif" font-size="13" letter-spacing="2">СВЕТ / СБОРКА · ДЕМО-КОЛЛЕКЦИЯ</text><text x="56" y="108" fill="#f4f2e7" font-family="Arial,sans-serif" font-size="31" font-weight="bold">Мой световой сценарий</text><text x="56" y="147" fill="#f5b575" font-family="Arial,sans-serif" font-size="22">${scenarios[p.scenario]}</text><rect x="56" y="175" width="568" height="275" fill="#30362f" stroke="#747a6b"/><g transform="translate(56 175)" stroke="#fff3ce" stroke-width="1">${p.modules.map(id=>shapes[id]).join('')}</g><g font-family="Arial,sans-serif"><text x="56" y="500" fill="#bfc3b4" font-size="13" letter-spacing="2">ВЫБРАННЫЕ МОДУЛИ</text>${rows}<text x="56" y="700" fill="#c9cbbd" font-size="14">Вымышленная коллекция · не проект освещения</text><text x="56" y="725" fill="#c9cbbd" font-size="14">Образ сценария, а не подбор реального товара</text></g></svg>`;}
