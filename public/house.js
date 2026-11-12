// Разрез дома вечером. Неосвещённая комната — одна плоская холодная лампа под потолком;
// освещённая — тёплый свет именно выбранных изделий. Рисунок общий для страницы и экспорта.
import {rooms,products} from './data.js';

// Прямоугольники комнат в координатах viewBox 1200×860.
export const cells={
  work:{x:96,y:262,w:318,h:230},
  bedroom:{x:422,y:262,w:372,h:230},
  hall:{x:96,y:508,w:222,h:274},
  kitchen:{x:326,y:508,w:362,h:274},
  living:{x:696,y:508,w:408,h:274},
};

const furniture={
  hall:`<rect x="134" y="560" width="58" height="104" rx="29" fill="#2f3a36" stroke="#18201d" stroke-width="5"/><rect x="142" y="568" width="42" height="88" rx="21" fill="#4a5852"/>
<path d="M118 712H214V726H118Z" fill="#191f1c"/><path d="M126 726V760M206 726V760" stroke="#191f1c" stroke-width="6"/>
<path d="M234 636H300V644H234Z" fill="#191f1c"/><path d="M246 644v14M268 644v18M286 644v10" stroke="#151b18" stroke-width="5"/><rect x="250" y="700" width="40" height="60" rx="6" fill="#1b2320"/>`,
  kitchen:`<rect x="340" y="556" width="190" height="52" fill="#1c2522"/><path d="M403 556v52M466 556v52" stroke="#121916" stroke-width="3"/>
<rect x="336" y="664" width="200" height="12" fill="#2e3733"/><rect x="340" y="676" width="192" height="100" fill="#19211e"/>
<path d="M556 718H678L670 730H564Z" fill="#241e19"/><path d="M570 730V778M664 730V778" stroke="#191512" stroke-width="7"/>
<path d="M586 692h18v26h-18zM634 692h18v26h-18z" fill="#191f1c"/>`,
  living:`<path d="M730 704Q732 680 760 680H884Q912 680 914 704V752H730Z" fill="#1d2522"/><path d="M722 718h200v40H722Z" fill="#232c29"/>
<rect x="936" y="590" width="86" height="64" fill="#2b2a24"/><rect x="942" y="596" width="74" height="52" fill="#3f4339"/><path d="M946 644l18-22 12 10 14-18 22 30Z" fill="#2b2f29"/>
<path d="M1036 712q4-24 30-24h14q14 0 14 14v56h-58Z" fill="#1d2522"/>`,
  work:`<rect x="140" y="330" width="200" height="8" fill="#1f2724"/><rect x="152" y="306" width="14" height="24" fill="#2c3430"/><rect x="170" y="300" width="10" height="30" fill="#33302a"/><rect x="186" y="310" width="16" height="20" fill="#2a2f2b"/>
<rect x="210" y="384" width="74" height="46" rx="3" fill="#131a18"/><rect x="214" y="388" width="66" height="38" fill="#6f8ea0" opacity=".55"/><path d="M247 430v14" stroke="#131a18" stroke-width="5"/>
<path d="M136 444H360V454H136Z" fill="#2a231d"/><path d="M146 454v34M350 454v34" stroke="#1d1814" stroke-width="7"/><path d="M190 460q0-26 26-26h18v58" fill="none" stroke="#18201d" stroke-width="8"/>`,
  bedroom:`<path d="M470 394Q470 372 492 372H726Q748 372 748 394V430H470Z" fill="#212a27"/><rect x="470" y="430" width="282" height="46" fill="#cfc6b3" opacity=".22"/><rect x="466" y="472" width="290" height="14" fill="#1a211e"/>
<rect x="486" y="414" width="80" height="22" rx="10" fill="#d9d1c0" opacity=".3"/><rect x="650" y="414" width="80" height="22" rx="10" fill="#d9d1c0" opacity=".3"/>
<rect x="436" y="436" width="28" height="44" fill="#1c2421"/><rect x="756" y="436" width="28" height="44" fill="#1c2421"/>`,
};

// Плоский холодный плафон «как сейчас».
const plafond={work:[255,270],bedroom:[608,270],hall:[207,516],kitchen:[507,516],living:[900,516]};

// Мини-изображения изделий в доме и свет от них.
const fixtures={
  hall:{
    point:`<g class="hl"><circle cx="216" cy="590" r="70" fill="url(#h-glow)"/></g><circle cx="216" cy="590" r="11" fill="#c39d62"/><circle cx="216" cy="590" r="8" class="lamp" />`,
    line:`<g class="hl"><path d="M238 646H296L302 700H232Z" fill="url(#h-cone)" opacity=".7" filter="url(#h-blur)"/><rect x="250" y="698" width="40" height="5" fill="#ffd9a0" opacity=".6"/><path d="M262 692h10" stroke="#fff0c8" stroke-width="3"/></g><rect x="236" y="643" width="62" height="4" class="lamp"/>`,
  },
  kitchen:{
    line:`<g class="hl"><path d="M342 612H528L540 666H330Z" fill="url(#h-cone)"/><rect x="336" y="662" width="200" height="12" fill="#ffd9a0" opacity=".35"/></g><rect x="342" y="608" width="186" height="5" class="lamp"/>`,
    arc:`<path d="M617 508V626" stroke="#61675e" stroke-width="2"/><path d="M587 640Q591 624 617 622Q643 624 647 640Z" fill="#3a443f"/><g class="hl"><path d="M590 641H644L690 724H546Z" fill="url(#h-cone)"/><ellipse cx="617" cy="722" rx="70" ry="10" fill="#ffd9a0" opacity=".5"/></g><ellipse cx="617" cy="640" rx="30" ry="4" class="lamp"/>`,
  },
  living:{
    dawn:`<path d="M822 508V548" stroke="#61675e" stroke-width="2"/><g class="hl"><ellipse cx="822" cy="600" rx="190" ry="110" fill="url(#h-glow)"/></g><path d="M792 574Q794 548 822 546Q850 548 852 574Z" fill="#d9ccb2"/><ellipse cx="822" cy="574" rx="30" ry="4" class="lamp"/>`,
    pause:`<path d="M1066 616V752" stroke="#3a3128" stroke-width="4"/><g class="hl"><ellipse cx="1066" cy="640" rx="80" ry="90" fill="url(#h-glow)"/><path d="M1046 628H1086L1104 758H1028Z" fill="url(#h-cone)"/></g><path d="M1050 600H1082L1088 628H1044Z" class="lamp"/>`,
    halo:`<path d="M928 560h14" stroke="#2b3430" stroke-width="4"/><g class="hl"><path d="M942 556L956 552L1032 660L930 664Z" fill="url(#h-cone)"/><rect x="942" y="596" width="74" height="52" fill="#ffe1ad" opacity=".3"/></g><rect x="940" y="548" width="20" height="12" rx="3" transform="rotate(35 950 554)" class="lamp"/>`,
  },
  work:{
    focus:`<path d="M330 444L318 410L300 396" fill="none" stroke="#2c3531" stroke-width="4"/><g class="hl"><path d="M290 398L310 392L300 446L230 446Z" fill="url(#h-cone)"/><ellipse cx="270" cy="444" rx="56" ry="7" fill="#ffd9a0" opacity=".6"/></g><path d="M288 392L306 384L312 400L294 406Z" class="lamp"/>`,
    line:`<g class="hl"><path d="M142 340H338L360 446H124Z" fill="url(#h-cone)"/></g><rect x="142" y="338" width="196" height="4" class="lamp"/>`,
  },
  bedroom:{
    fold:`<path d="M496 344q20-8 28 6" fill="none" stroke="#a88a58" stroke-width="3"/><g class="hl"><path d="M512 362H544L580 432H486Z" fill="url(#h-cone)"/><ellipse cx="530" cy="428" rx="54" ry="10" fill="#ffd9a0" opacity=".5"/></g><path d="M514 346H542L548 362H508Z" class="lamp"/>`,
    point:`<g class="hl"><circle cx="770" cy="404" r="54" fill="url(#h-glow)"/></g><circle cx="770" cy="404" r="9" fill="#c39d62"/><circle cx="770" cy="404" r="6" class="lamp"/>`,
  },
};

function roomLayer(id,items,labels){
  const c=cells[id],lit=items.length>0,[px,py]=plafond[id];
  const flat=lit?'':`<g><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="#9fb3bd" opacity=".09"/><path d="M${px-40} ${py+8}H${px+40}L${px+c.w*.42} ${c.y+c.h}H${px-c.w*.42}Z" fill="#b9c9d0" opacity=".06"/></g>`;
  const warmWall=lit?`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="url(#h-warm)"/>`:'';
  const fx=items.map(p=>fixtures[id][p]).join('');
  const label=labels?`<text x="${c.x+14}" y="${c.y+c.h-14}" fill="${lit?'#fff3dc':'#93a39b'}" font-size="17" font-family="Arial,sans-serif" font-weight="700" letter-spacing="1">${rooms[id].name.toUpperCase()}</text>`:'';
  return `<g class="cell ${lit?'is-lit':'is-dark'}" data-room-cell="${id}">
<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${lit?'#3a3a30':'#1b2422'}"/>${warmWall}
<rect x="${c.x}" y="${c.y+c.h-26}" width="${c.w}" height="26" fill="${lit?'#4a3c2e':'#1f211d'}"/>
${furniture[id]}${flat}
<path d="M${px} ${c.y}v6" stroke="#5f6863" stroke-width="2"/><ellipse cx="${px}" cy="${py}" rx="26" ry="5" fill="${lit?'#59605a':'#c9d6da'}"/>
${fx}${label}</g>`;
}

// selection: {roomId: [productIds]}; labels — подписи комнат внутри SVG (для экспорта).
export function house(selection,{labels=false,title='Разрез дома вечером'}={}){
  const litCount=Object.values(selection).filter(x=>x.length).length;
  const desc=Object.entries(selection).map(([id,items])=>`${rooms[id].name}: ${items.length?items.map(p=>products[p].name).join(', '):'одна плоская лампа'}`).join('; ');
  return `<svg class="house" viewBox="0 0 1200 860" role="img" aria-label="${title}. Освещено комнат: ${litCount} из 5. ${desc}." xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="h-sky" x2="0" y2="1"><stop stop-color="#0d161d"/><stop offset=".7" stop-color="#1a2a33"/><stop offset="1" stop-color="#2b3a3d"/></linearGradient>
<radialGradient id="h-glow"><stop stop-color="#ffe2a8" stop-opacity=".62"/><stop offset=".5" stop-color="#f4c487" stop-opacity=".2"/><stop offset="1" stop-color="#f4c487" stop-opacity="0"/></radialGradient>
<linearGradient id="h-cone" x2="0" y2="1"><stop stop-color="#ffe7b6" stop-opacity=".55"/><stop offset="1" stop-color="#ffd9a0" stop-opacity=".04"/></linearGradient>
<filter id="h-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
<linearGradient id="h-warm" x2="0" y2="1"><stop stop-color="#6d5a40" stop-opacity=".55"/><stop offset="1" stop-color="#2e2a22" stop-opacity=".2"/></linearGradient>
<style>.lamp{fill:#fff0c8}.is-dark .lamp{fill:#7b847f}</style></defs>
<rect width="1200" height="860" fill="url(#h-sky)"/>
<g fill="#e9e3cf" opacity=".55"><circle cx="980" cy="70" r="2"/><circle cx="1120" cy="140" r="1.5"/><circle cx="880" cy="120" r="1.2"/><circle cx="1050" cy="210" r="1.6"/><circle cx="60" cy="90" r="1.4"/><circle cx="180" cy="40" r="1.8"/></g>
<circle cx="1060" cy="110" r="34" fill="#d9d4bf" opacity=".85"/><circle cx="1074" cy="100" r="30" fill="#14212a"/>
<path d="M0 790Q300 770 600 786T1200 784V860H0Z" fill="#101613"/>
<!-- Крыша и конструкция -->
<path d="M70 262L445 82L820 262Z" fill="#202a27" stroke="#0c1110" stroke-width="10" stroke-linejoin="round"/>
<path d="M150 236L445 96L740 236" fill="none" stroke="#33403b" stroke-width="6"/>
<rect x="404" y="164" width="82" height="66" fill="#141c19"/><rect x="412" y="172" width="66" height="50" fill="#26323a"/>
<rect x="88" y="254" width="714" height="246" fill="#0c1110"/><rect x="88" y="500" width="1024" height="290" fill="#0c1110"/>
<!-- Терраса -->
<path d="M802 492H1112" stroke="#0c1110" stroke-width="16"/><path d="M812 448H1104M830 448V492M880 448V492M930 448V492M980 448V492M1030 448V492M1080 448V492" stroke="#2a3530" stroke-width="5"/>
<path d="M1040 446q-6-40 10-60q8 30-2 60M1056 446q2-30 22-44q-2 30-16 44" fill="#25362c"/><rect x="1036" y="440" width="34" height="10" fill="#3b312a"/>
${['work','bedroom','hall','kitchen','living'].map(id=>roomLayer(id,selection[id]||[],labels)).join('')}
<path d="M418 262V492M692 508V782M322 508V782" stroke="#0c1110" stroke-width="8"/>
</svg>`;
}
