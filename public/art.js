// Предметные изображения восьми изделий: собственные SVG, без внешних ресурсов.
// У каждого экземпляра свой префикс ID, чтобы несколько SVG на странице не конфликтовали.
import {products} from './data.js';

const warm='#ffe6b4';
function defs(p){return `<defs>
<radialGradient id="${p}-bg" cx=".5" cy=".38" r=".75"><stop stop-color="#3f4943"/><stop offset=".7" stop-color="#232c28"/><stop offset="1" stop-color="#1a211e"/></radialGradient>
<radialGradient id="${p}-glow"><stop stop-color="#ffe2a8" stop-opacity=".75"/><stop offset=".45" stop-color="#f6c98a" stop-opacity=".22"/><stop offset="1" stop-color="#f6c98a" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-cone" x2="0" y2="1"><stop stop-color="#ffe9bd" stop-opacity=".42"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}-brass" x2="1" y2="1"><stop stop-color="#e2c48f"/><stop offset=".5" stop-color="#a98552"/><stop offset="1" stop-color="#6d5532"/></linearGradient>
<linearGradient id="${p}-metal" x2="1" y2="1"><stop stop-color="#5d6a63"/><stop offset=".55" stop-color="#2f3a35"/><stop offset="1" stop-color="#1c2420"/></linearGradient>
<linearGradient id="${p}-opal" x2="0" y2="1"><stop stop-color="#efe5d2"/><stop offset="1" stop-color="#c5b597"/></linearGradient>
<linearGradient id="${p}-linen" x2="1" y2="0"><stop stop-color="#d8bb8c"/><stop offset=".5" stop-color="#f6e2bb"/><stop offset="1" stop-color="#cfae7c"/></linearGradient>
<filter id="${p}-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>`}
const frame=(p,body,title)=>`<svg class="art" viewBox="0 0 300 300" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">${defs(p)}<rect width="300" height="300" fill="url(#${p}-bg)"/><path d="M0 252H300V300H0Z" fill="#171e1b" opacity=".75"/><path d="M0 252H300" stroke="#59625a" stroke-opacity=".5"/>${body}</svg>`;

const draw={
  dawn:p=>`<ellipse cx="150" cy="168" rx="125" ry="70" fill="url(#${p}-glow)" filter="url(#${p}-blur)"/>
<path d="M88 172L212 172L262 252H38Z" fill="url(#${p}-cone)"/>
<path d="M150 0V70" stroke="#a7966f" stroke-width="3"/><ellipse cx="150" cy="72" rx="15" ry="6" fill="url(#${p}-brass)"/>
<path d="M72 166Q76 88 150 84Q224 88 228 166Z" fill="url(#${p}-opal)"/>
<path d="M92 132Q110 100 150 98" fill="none" stroke="#fffaf0" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="150" cy="166" rx="78" ry="11" fill="${warm}"/><path d="M72 166Q150 182 228 166" fill="none" stroke="url(#${p}-brass)" stroke-width="5"/>
<ellipse cx="150" cy="256" rx="100" ry="10" fill="#ffd9a0" opacity=".18"/>`,
  arc:p=>`<path d="M78 178H222L292 300H8Z" fill="url(#${p}-cone)"/>
<path d="M150 0V114" stroke="#8f8a7a" stroke-width="3"/>
<path d="M58 178Q66 120 150 116Q234 120 242 178Z" fill="url(#${p}-metal)"/>
<path d="M78 158Q92 128 150 126" fill="none" stroke="#9fb0a6" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="150" cy="178" rx="92" ry="12" fill="${warm}"/>
<path d="M40 262L260 256L286 278L22 286Z" fill="#7b5f47"/><ellipse cx="150" cy="268" rx="110" ry="14" fill="#ffdba3" opacity=".42"/>
<ellipse cx="118" cy="266" rx="24" ry="6" fill="#e8dfcd"/><ellipse cx="186" cy="264" rx="24" ry="6" fill="#e8dfcd"/>`,
  line:p=>`<rect x="22" y="70" width="256" height="72" fill="#3b4741"/><path d="M107 70V142M192 70V142" stroke="#2a332f" stroke-width="3"/><path d="M96 104h6M181 104h6M266 104h6" stroke="#a9a28f" stroke-width="3"/>
<path d="M44 150H256L286 248H14Z" fill="url(#${p}-cone)"/>
<rect x="44" y="142" width="212" height="9" rx="3" fill="#d6cfbf"/><rect x="48" y="148" width="204" height="4" fill="${warm}"/>
<path d="M14 246H286V262H14Z" fill="#9a9283"/><ellipse cx="150" cy="248" rx="132" ry="9" fill="#ffe2ad" opacity=".55"/>
<path d="M98 242h76l6 6H92Z" fill="#a17b58"/><circle cx="206" cy="242" r="8" fill="#b44c38"/>`,
  focus:p=>`<path d="M178 138L220 166L150 262H40Z" fill="url(#${p}-cone)"/>
<ellipse cx="96" cy="262" rx="70" ry="11" fill="#ffdca3" opacity=".42"/><path d="M58 254l60-6 26 10-58 7Z" fill="#ebe3d1"/>
<ellipse cx="214" cy="262" rx="40" ry="8" fill="#1d2420"/><path d="M214 258L176 178L222 104" fill="none" stroke="#2c3531" stroke-width="9" stroke-linecap="round"/>
<circle cx="176" cy="178" r="8" fill="url(#${p}-brass)"/><circle cx="222" cy="104" r="7" fill="url(#${p}-brass)"/>
<path d="M226 92L246 112L216 168L170 134Z" fill="#b9ab92"/><path d="M226 92L246 112L236 128L212 104Z" fill="#8e826d"/>
<path d="M172 136L214 166" stroke="${warm}" stroke-width="6" stroke-linecap="round"/>`,
  pause:p=>`<ellipse cx="150" cy="104" rx="110" ry="88" fill="url(#${p}-glow)" filter="url(#${p}-blur)"/>
<path d="M92 136H208L250 256H50Z" fill="url(#${p}-cone)" opacity=".7"/>
<path d="M150 136V256" stroke="#7a5d40" stroke-width="7"/><ellipse cx="150" cy="258" rx="42" ry="8" fill="#5a4630"/>
<path d="M98 64H202L214 136H86Z" fill="url(#${p}-linen)"/><ellipse cx="150" cy="64" rx="52" ry="7" fill="#e9d3a9"/><ellipse cx="150" cy="136" rx="64" ry="8" fill="${warm}"/>
<path d="M118 70L112 132M150 68V134M182 70L188 132" stroke="#c49e6c" stroke-opacity=".35" stroke-width="2"/>`,
  halo:p=>`<rect x="170" y="150" width="104" height="94" fill="#8f7d62"/><rect x="178" y="158" width="88" height="78" fill="#cdbb9d"/><path d="M182 230L210 196L228 210L246 186L262 230Z" fill="#7a6e58"/>
<path d="M124 120L148 104L292 214L222 262Z" fill="url(#${p}-cone)"/>
<rect x="178" y="158" width="88" height="78" fill="#ffe5b8" opacity=".28"/>
<rect x="34" y="96" width="20" height="56" rx="6" fill="#2b3430"/><path d="M54 124H96" stroke="#2b3430" stroke-width="7"/>
<g transform="rotate(35 100 124)"><rect x="92" y="104" width="62" height="38" rx="5" fill="url(#${p}-metal)"/><rect x="150" y="106" width="6" height="34" fill="${warm}"/></g>`,
  fold:p=>`<path d="M100 172H212L248 262H70Z" fill="url(#${p}-cone)"/>
<rect x="58" y="70" width="18" height="46" rx="5" fill="url(#${p}-brass)"/><path d="M76 92Q140 72 156 112" fill="none" stroke="url(#${p}-brass)" stroke-width="6"/>
<path d="M120 112H192L216 172H96Z" fill="url(#${p}-linen)"/><path d="M132 114L114 170M147 114L138 170M162 114L160 170M177 114L184 170M190 114L204 170" stroke="#b08a5c" stroke-opacity=".5" stroke-width="2"/>
<ellipse cx="156" cy="172" rx="60" ry="7" fill="${warm}"/>
<path d="M48 252Q60 232 110 234L242 236Q268 240 272 256Z" fill="#d9d2c2"/><path d="M122 244l38-6 36 8-38 6Z" fill="#f2ead9"/><ellipse cx="160" cy="246" rx="70" ry="12" fill="#ffdca3" opacity=".4"/>`,
  point:p=>`<circle cx="150" cy="130" r="118" fill="url(#${p}-glow)" filter="url(#${p}-blur)"/>
<circle cx="150" cy="130" r="58" fill="url(#${p}-brass)"/><circle cx="150" cy="130" r="44" fill="#fff4dc"/><circle cx="150" cy="130" r="44" fill="url(#${p}-opal)" opacity=".35"/>
<path d="M124 112Q134 98 150 96" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>`,
};

let serial=0;
export function productArt(id,prefix){const p=prefix||`pa${++serial}`;const item=products[id];return frame(p,draw[id](p),`${item.type} «${item.name}»`)}
