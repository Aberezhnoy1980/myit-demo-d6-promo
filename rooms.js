// Крупные сцены комнат. Режим «как сейчас» — одна плоская лампа и видимая проблема;
// режим «с изделиями» — плоская лампа выключена, светят только выбранные изделия.
// Корпуса светильников видны всегда, когда изделие выбрано; светящиеся части — в слоях .light.

// Точка проблемы на сцене в процентах (для доступной кнопки поверх изображения).
export const spots={kitchen:{x:24,y:41},hall:{x:24,y:28},living:{x:38,y:24},work:{x:25,y:54},bedroom:{x:56,y:49}};

function common(p){return `<linearGradient id="${p}-cold" x2="0" y2="1"><stop stop-color="#cfdde2" stop-opacity=".22"/><stop offset="1" stop-color="#cfdde2" stop-opacity=".02"/></linearGradient>
<linearGradient id="${p}-cone" x2="0" y2="1"><stop stop-color="#ffe9bd" stop-opacity=".5"/><stop offset="1" stop-color="#ffdca3" stop-opacity=".03"/></linearGradient>
<radialGradient id="${p}-pool"><stop stop-color="#ffe0a6" stop-opacity=".7"/><stop offset="1" stop-color="#ffd697" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-glow"><stop stop-color="#ffe6b4" stop-opacity=".8"/><stop offset=".4" stop-color="#f7cb8c" stop-opacity=".25"/><stop offset="1" stop-color="#f7cb8c" stop-opacity="0"/></radialGradient>
<filter id="${p}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="${p}-edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="${p}-shadow"><feGaussianBlur stdDeviation="7"/></filter>`}

function kitchen(p,on){return `<defs>${common(p)}
<linearGradient id="${p}-wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#55584f"/><stop offset=".6" stop-color="#40453f"/><stop offset="1" stop-color="#2d3330"/></linearGradient>
<linearGradient id="${p}-side" x2="1"><stop stop-color="#323b37"/><stop offset="1" stop-color="#232b28"/></linearGradient>
<linearGradient id="${p}-floor" x2=".2" y2="1"><stop stop-color="#5e5246"/><stop offset="1" stop-color="#2b2c27"/></linearGradient>
<linearGradient id="${p}-stone" x2="0" y2="1"><stop stop-color="#b5ad9e"/><stop offset="1" stop-color="#8b8476"/></linearGradient>
<linearGradient id="${p}-wood" x2=".2" y2="1"><stop stop-color="#a7825f"/><stop offset=".55" stop-color="#76604b"/><stop offset="1" stop-color="#4a3f34"/></linearGradient>
<linearGradient id="${p}-night" x2="0" y2="1"><stop stop-color="#16242e"/><stop offset="1" stop-color="#2b3d46"/></linearGradient>
<linearGradient id="${p}-metal" x2="1" y2="1"><stop stop-color="#5f6c65"/><stop offset=".55" stop-color="#303b36"/><stop offset="1" stop-color="#1d2521"/></linearGradient>
<linearGradient id="${p}-wash" x2="0" y2="1"><stop stop-color="#fff0c9" stop-opacity=".62"/><stop offset=".75" stop-color="#ffe0a8" stop-opacity=".22"/><stop offset="1" stop-color="#ffe0a8" stop-opacity=".05"/></linearGradient>
</defs>
<rect width="1120" height="710" fill="#1b2420"/>
<path d="M0 0H880V432H0Z" fill="url(#${p}-wall)"/>
<path d="M880 0H1120V522L880 432Z" fill="url(#${p}-side)"/>
<path d="M0 432H880L1120 522V710H0Z" fill="url(#${p}-floor)"/>
<path d="M0 520L930 452M0 610L1010 486M120 710L1090 506M560 710L1120 576" stroke="#cfb08f" stroke-opacity=".1" stroke-width="2"/>
<path d="M0 431H880L1120 521M880 0V432" fill="none" stroke="#a09a86" stroke-opacity=".25" stroke-width="3"/>
<!-- Окно на боковой стене: вечер за стеклом -->
<path d="M936 92L1066 70V338L936 322Z" fill="url(#${p}-night)" stroke="#1a211e" stroke-width="10"/>
<path d="M1001 82V330M936 206L1066 204" stroke="#1a211e" stroke-width="6"/>
<g fill="#f2d79f" opacity=".7"><rect x="952" y="268" width="6" height="8"/><rect x="972" y="282" width="5" height="7"/><rect x="1018" y="260" width="6" height="9"/><rect x="1040" y="290" width="5" height="7"/></g>
<!-- Верхние шкафы, фартук, столешница -->
<rect x="40" y="64" width="530" height="156" fill="#3c4741"/>
<path d="M172 64V220M305 64V220M438 64V220" stroke="#2a332f" stroke-width="4"/>
<path d="M160 148h6M293 148h6M426 148h6M558 148h6" stroke="#a9a28f" stroke-width="4" stroke-linecap="round"/>
<rect x="40" y="220" width="530" height="104" fill="#5b6159"/>
<path d="M40 254H570M40 288H570M92 220V324M144 220V324M196 220V324M248 220V324M300 220V324M352 220V324M404 220V324M456 220V324M508 220V324" stroke="#474c45" stroke-width="2"/>
<path d="M22 324H588L602 346H8Z" fill="url(#${p}-stone)"/>
<rect x="8" y="346" width="594" height="86" fill="#323c37"/><path d="M156 346V432M304 346V432M452 346V432" stroke="#262e2a" stroke-width="3"/>
<path d="M140 386h22M288 386h22M436 386h22" stroke="#8b8576" stroke-width="4" stroke-linecap="round"/>
<!-- На столешнице: доска, нож, овощи, миска, чайник -->
<path d="M206 316L330 316L342 328L196 328Z" fill="#9b7656"/><path d="M196 328L342 328V332H196Z" fill="#6f5440"/>
<path d="M300 318l52-6" stroke="#cfd3cd" stroke-width="4" stroke-linecap="round"/><path d="M346 312l14-2" stroke="#2a2420" stroke-width="5" stroke-linecap="round"/>
<circle cx="236" cy="314" r="9" fill="#b54a35"/><circle cx="252" cy="317" r="7" fill="#c75c40"/><path d="M262 318l22-2" stroke="#7d9a52" stroke-width="5" stroke-linecap="round"/>
<path d="M408 306Q412 326 438 326Q464 326 468 306Z" fill="#c7bfae"/>
<path d="M496 282q0-20 26-20t26 20v40h-52Z" fill="#2c3632"/><path d="M548 290q16 4 14 22" fill="none" stroke="#2c3632" stroke-width="5"/>
<!-- Обеденный стол и стулья -->
<path d="M700 430Q700 406 724 406H774V496H700Z" fill="#323c37"/><path d="M712 418H762" stroke="#4b5650" stroke-width="3"/><path d="M872 426Q872 402 896 402H946V492H872Z" fill="#323c37"/><path d="M884 414H934" stroke="#4b5650" stroke-width="3"/>
<ellipse cx="830" cy="602" rx="250" ry="34" fill="#111815" opacity=".55" filter="url(#${p}-shadow)"/>
<path d="M600 498L962 486L1034 556L644 574Z" fill="url(#${p}-wood)" stroke="#3a3229" stroke-width="4"/>
<path d="M644 574L1034 556V572L644 590Z" fill="#54443a"/>
<path d="M664 590l-14 112M1010 572l18 120" stroke="#2c2722" stroke-width="13" stroke-linecap="round"/>
<ellipse cx="760" cy="532" rx="44" ry="9" fill="#e4dccb"/><ellipse cx="900" cy="526" rx="44" ry="9" fill="#e4dccb"/>
<path d="M826 524q-4-30 4-42h14q8 12 4 42Z" fill="#7b8a7d"/><path d="M836 482q-10-40-30-56M840 482q6-44 24-62" fill="none" stroke="#5b4a3a" stroke-width="3"/>
<!-- Потолочная лампа «как сейчас» -->
<path d="M470 0V16" stroke="#7d8580" stroke-width="3"/><ellipse cx="470" cy="22" rx="74" ry="12" fill="#c5ccc8"/>
<g class="light base${on.base}">
<rect width="1120" height="710" fill="#c9d7dc" opacity=".06"/>
<path d="M404 26H536L760 432H170Z" fill="url(#${p}-cold)" filter="url(#${p}-edge)"/>
<ellipse cx="470" cy="24" rx="70" ry="9" fill="#f2f6f4"/>
<!-- Тень хозяйки на фартуке и доске: свет падает из-за спины -->
<path d="M190 326Q194 254 234 242Q238 206 266 206Q294 206 298 242Q338 254 344 326Z" fill="#0d1311" opacity=".5" filter="url(#${p}-edge)"/>
<ellipse cx="268" cy="322" rx="96" ry="12" fill="#0d1311" opacity=".45"/>
</g>
<!-- Без верхнего света комната погружается в вечер -->
<g class="light dim${on.dim}"><rect width="1120" height="710" fill="#080d0c" opacity=".36"/></g>
<!-- Линия: профиль под шкафами -->
<g class="fixture${on.line?'':' absent'}"><rect x="58" y="220" width="494" height="7" rx="2" fill="#cdc5b2"/></g>
<g class="light line${on.line}">
<rect x="60" y="225" width="490" height="3" fill="#fff3d2"/>
<path d="M60 228H550L560 324H50Z" fill="url(#${p}-wash)" filter="url(#${p}-edge)"/><ellipse cx="305" cy="250" rx="300" ry="60" fill="url(#${p}-glow)" filter="url(#${p}-soft)" opacity=".5"/>
<path d="M22 324H588L602 346H8Z" fill="#ffe3ae" opacity=".42"/>
<path d="M206 316L330 316L342 328L196 328Z" fill="#ffe7b8" opacity=".35"/>
<ellipse cx="300" cy="330" rx="300" ry="20" fill="url(#${p}-pool)"/>
</g>
<!-- Дуга: подвес над столом -->
<g class="fixture${on.arc?'':' absent'}">
<path d="M818 0V250" stroke="#8f8a7a" stroke-width="3"/>
<path d="M736 302Q746 256 818 252Q890 256 900 302Z" fill="url(#${p}-metal)"/>
<path d="M754 286Q766 266 818 264" fill="none" stroke="#9fb0a6" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/>
</g>
<g class="light arc${on.arc}">
<ellipse cx="818" cy="302" rx="80" ry="10" fill="#fff0c8"/>
<path d="M742 306H894L1004 552H640Z" fill="url(#${p}-cone)" filter="url(#${p}-edge)"/>
<ellipse cx="830" cy="530" rx="220" ry="40" fill="url(#${p}-pool)"/>
<ellipse cx="760" cy="532" rx="44" ry="9" fill="#fff4dc" opacity=".55"/><ellipse cx="900" cy="526" rx="44" ry="9" fill="#fff4dc" opacity=".55"/>
<ellipse cx="818" cy="300" rx="140" ry="40" fill="url(#${p}-glow)" filter="url(#${p}-soft)"/><ellipse cx="840" cy="600" rx="260" ry="60" fill="url(#${p}-pool)" opacity=".45"/><path d="M700 430Q700 406 724 406H774V496H700Z" fill="#ffd9a0" opacity=".12"/><path d="M872 426Q872 402 896 402H946V492H872Z" fill="#ffd9a0" opacity=".12"/>
</g>`}

// Общая коробка комнаты: задняя стена 0–880, боковая стена справа, пол.
function shellDefs(p,[w1,w2,w3],[s1,s2],[f1,f2]){return `<linearGradient id="${p}-wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${w1}"/><stop offset=".6" stop-color="${w2}"/><stop offset="1" stop-color="${w3}"/></linearGradient>
<linearGradient id="${p}-side" x2="1"><stop stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient>
<linearGradient id="${p}-floor" x2=".2" y2="1"><stop stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></linearGradient>
<linearGradient id="${p}-night" x2="0" y2="1"><stop stop-color="#16242e"/><stop offset="1" stop-color="#2b3d46"/></linearGradient>
<linearGradient id="${p}-wash" x2="0" y2="1"><stop stop-color="#fff0c9" stop-opacity=".62"/><stop offset=".75" stop-color="#ffe0a8" stop-opacity=".22"/><stop offset="1" stop-color="#ffe0a8" stop-opacity=".05"/></linearGradient>`}
function shell(p,boards=true){return `<rect width="1120" height="710" fill="#1b2420"/>
<path d="M0 0H880V432H0Z" fill="url(#${p}-wall)"/>
<path d="M880 0H1120V522L880 432Z" fill="url(#${p}-side)"/>
<path d="M0 432H880L1120 522V710H0Z" fill="url(#${p}-floor)"/>
${boards?`<path d="M0 520L930 452M0 610L1010 486M120 710L1090 506M560 710L1120 576" stroke="#cfb08f" stroke-opacity=".1" stroke-width="2"/>`:''}
<path d="M0 431H880L1120 521M880 0V432" fill="none" stroke="#a09a86" stroke-opacity=".25" stroke-width="3"/>`}
// Плоская лампа под потолком «как сейчас» (корпус) и её холодный конус (в слое base).
const plafond=x=>`<path d="M${x} 0V16" stroke="#7d8580" stroke-width="3"/><ellipse cx="${x}" cy="22" rx="74" ry="12" fill="#c5ccc8"/>`;
const coldCone=(p,x,l,r,y=432)=>`<rect width="1120" height="710" fill="#c9d7dc" opacity=".06"/><path d="M${x-66} 26H${x+66}L${r} ${y}H${l}Z" fill="url(#${p}-cold)" filter="url(#${p}-edge)"/><ellipse cx="${x}" cy="24" rx="70" ry="9" fill="#f2f6f4"/>`;
const dim=(on,o=.36)=>`<g class="light dim${on.dim}"><rect width="1120" height="710" fill="#080d0c" opacity="${o}"/></g>`;

function hall(p,on){return `<defs>${common(p)}${shellDefs(p,['#5d584d','#46463f','#30332f'],['#373d38','#262c29'],['#5a4636','#2a2722'])}
<linearGradient id="${p}-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#53646a"/><stop offset=".5" stop-color="#2f3d42"/><stop offset="1" stop-color="#1f292d"/></linearGradient>
<radialGradient id="${p}-opal"><stop stop-color="#fffaf0"/><stop offset=".7" stop-color="#ffe7bd"/><stop offset="1" stop-color="#f2c98a"/></radialGradient>
</defs>${shell(p)}
<!-- Входная дверь на боковой стене -->
<path d="M942 118L1066 96V538L942 480Z" fill="#2c2620" stroke="#171310" stroke-width="8"/>
<path d="M960 150L1048 136V250L960 258ZM960 300L1048 296V500L960 462Z" fill="none" stroke="#3d342b" stroke-width="5"/>
<circle cx="1046" cy="330" r="7" fill="#a8874f"/><circle cx="1004" cy="214" r="4" fill="#8a7a62"/>
<!-- Коврик и обувь -->
<path d="M110 612L660 590L740 668L40 694Z" fill="#4e3d31"/><path d="M90 640L700 620M70 668L720 646" stroke="#6b5442" stroke-width="5" stroke-opacity=".6"/>
<path d="M820 610q8-18 30-16l40 4q10 4 6 16Z" fill="#1c1a17"/><path d="M880 640q8-18 30-16l40 4q10 4 6 16Z" fill="#1c1a17"/>
<!-- Вешалка с куртками в углу -->
<path d="M790 120H866" stroke="#2a2723" stroke-width="8" stroke-linecap="round"/><path d="M806 120v12M848 120v12" stroke="#a8874f" stroke-width="4"/>
<path d="M792 132Q806 126 820 132L830 330Q806 340 784 330Z" fill="#3b4440"/><path d="M834 132Q848 126 862 132L872 300Q850 310 826 300Z" fill="#5b4334"/>
<!-- Зеркало -->
<path d="M190 340V156Q190 70 270 70Q350 70 350 156V340Z" fill="url(#${p}-glass)" stroke="#8a7350" stroke-width="10"/>
<path d="M214 320V160Q214 98 250 88" fill="none" stroke="#a9bcc1" stroke-opacity=".18" stroke-width="10" stroke-linecap="round"/>
<!-- Отражение: человек у зеркала -->
<path d="M204 336Q210 268 270 258Q330 268 336 336Z" fill="#2f3a3f"/>
<path d="M256 240h28v24h-28z" fill="#6a5d50"/>
<ellipse cx="270" cy="200" rx="34" ry="42" fill="#7c6b5c"/>
<path d="M236 196Q234 152 270 150Q308 152 304 196Q296 172 270 170Q244 172 236 196Z" fill="#2a221d"/>
<path d="M250 190h14M276 190h14" stroke="#3a2e26" stroke-width="3" stroke-linecap="round"/><circle cx="257" cy="200" r="3" fill="#2a221d"/><circle cx="283" cy="200" r="3" fill="#2a221d"/>
<path d="M270 204v12" stroke="#5e4f43" stroke-width="3" stroke-linecap="round"/><path d="M260 226q10 5 20 0" fill="none" stroke="#5a463b" stroke-width="3" stroke-linecap="round"/>
<!-- Консоль под полкой: ключи, перчатки, сумка -->
<path d="M470 170H790V184H470Z" fill="#2c2924"/>
<rect x="500" y="132" width="54" height="38" rx="4" fill="#5c4b3c"/><rect x="566" y="146" width="40" height="24" rx="3" fill="#3f4842"/>
<path d="M730 170q-4-30 8-40h14q12 10 8 40Z" fill="#6f7a6a"/><path d="M738 130q-10-26-24-34M752 130q6-28 22-36" fill="none" stroke="#4d5a45" stroke-width="3"/>
<path d="M480 330H780V344H480Z" fill="#4a3c30"/><path d="M496 344V432M764 344V432" stroke="#2d251e" stroke-width="10"/>
<circle cx="560" cy="322" r="7" fill="none" stroke="#a8a49a" stroke-width="3"/><path d="M566 324l20 4M584 328v6" stroke="#a8a49a" stroke-width="3"/>
<path d="M630 330q2-16 14-18q8 0 10 8l10-4q6 2 2 8l-6 6Z" fill="#6c3a2a"/>
<path d="M694 330q0-30 40-30q40 0 40 30Z" fill="#2c3330"/><path d="M712 306q22-30 44 0" fill="none" stroke="#2c3330" stroke-width="4"/>
${plafond(560)}
<g class="light base${on.base}">${coldCone(p,560,300,860)}
<!-- Свет сверху и сзади: лицо в отражении в тени, на консоли темно -->
<path d="M240 158Q270 146 300 158L298 176Q270 166 242 176Z" fill="#dfe9ec" opacity=".22"/>
<ellipse cx="270" cy="220" rx="30" ry="24" fill="#0c1210" opacity=".42" filter="url(#${p}-edge)"/>
<ellipse cx="257" cy="202" rx="11" ry="7" fill="#0c1210" opacity=".35" filter="url(#${p}-edge)"/><ellipse cx="283" cy="202" rx="11" ry="7" fill="#0c1210" opacity=".35" filter="url(#${p}-edge)"/>
<path d="M472 184H788V346H472Z" fill="#0b100e" opacity=".42" filter="url(#${p}-edge)"/>
</g>
${dim(on)}
<!-- Точка: опаловый шар у зеркала -->
<g class="fixture${on.point?'':' absent'}"><rect x="384" y="186" width="16" height="22" rx="4" fill="#a8874f"/><circle cx="410" cy="196" r="22" fill="#cfc9bb"/></g>
<g class="light point${on.point}">
<circle cx="410" cy="196" r="160" fill="url(#${p}-glow)" filter="url(#${p}-soft)"/>
<circle cx="410" cy="196" r="22" fill="url(#${p}-opal)"/>
<ellipse cx="280" cy="206" rx="26" ry="32" fill="#f2c99c" opacity=".3" filter="url(#${p}-edge)"/>
</g>
<!-- Линия: профиль под полкой, свет на консоль -->
<g class="fixture${on.line?'':' absent'}"><rect x="486" y="184" width="288" height="6" rx="2" fill="#cdc5b2"/></g>
<g class="light line${on.line}">
<rect x="488" y="188" width="284" height="3" fill="#fff3d2"/>
<path d="M488 191H772L790 332H470Z" fill="url(#${p}-wash)" filter="url(#${p}-edge)" opacity=".8"/>
<path d="M480 330H780V336H480Z" fill="#ffe3ae" opacity=".55"/>
<ellipse cx="630" cy="330" rx="170" ry="16" fill="url(#${p}-pool)"/>
<circle cx="560" cy="322" r="7" fill="none" stroke="#fff1cf" stroke-width="3"/>
</g>`}

function living(p,on){return `<defs>${common(p)}${shellDefs(p,['#55594f','#43473f','#2e332f'],['#363d38','#252c29'],['#5b4a3c','#272722'])}
<linearGradient id="${p}-canvas" x2="0" y2="1"><stop stop-color="#5f7480"/><stop offset=".45" stop-color="#c38f61"/><stop offset=".6" stop-color="#8d6a4c"/><stop offset="1" stop-color="#3a4636"/></linearGradient>
<linearGradient id="${p}-frost" x2="0" y2="1"><stop stop-color="#efe7d6"/><stop offset="1" stop-color="#b9b0a0"/></linearGradient>
<linearGradient id="${p}-linen" x2="1"><stop stop-color="#d9cdb4"/><stop offset="1" stop-color="#a99c84"/></linearGradient>
<radialGradient id="${p}-glare"><stop stop-color="#ffffff" stop-opacity=".95"/><stop offset=".3" stop-color="#eef6f8" stop-opacity=".45"/><stop offset="1" stop-color="#e3eef1" stop-opacity="0"/></radialGradient>
</defs>${shell(p)}
<!-- Окно со шторами на боковой стене -->
<path d="M936 110L1060 92V350L936 334Z" fill="url(#${p}-night)" stroke="#1a211e" stroke-width="10"/>
<path d="M998 100V342" stroke="#1a211e" stroke-width="6"/>
<path d="M914 80Q930 220 916 430L944 438Q956 230 940 84Z" fill="#5a3f33"/><path d="M1062 70Q1080 230 1066 470L1092 480Q1104 230 1086 66Z" fill="#5a3f33"/>
<!-- Картина -->
<rect x="470" y="96" width="300" height="190" fill="url(#${p}-canvas)" stroke="#231d18" stroke-width="10"/>
<path d="M480 236Q560 200 640 226T760 214V276H480Z" fill="#33402f"/><circle cx="700" cy="150" r="16" fill="#e7c48a" opacity=".7"/>
<!-- Диван, подушки, ковёр, журнальный столик -->
<ellipse cx="520" cy="590" rx="400" ry="74" fill="#5b4535" opacity=".75"/>
<path d="M300 420Q300 308 360 304H740Q800 308 800 420V470H300Z" fill="#3c4945"/>
<path d="M280 380Q280 356 306 356Q330 356 330 380V500H280ZM770 380Q770 356 794 356Q820 356 820 380V500H770Z" fill="#33403c"/>
<path d="M300 430H800V500H300Z" fill="#45534e"/><path d="M550 432V498" stroke="#33403c" stroke-width="4"/>
<rect x="340" y="350" width="90" height="70" rx="14" fill="#9a6a4e"/><rect x="670" y="350" width="90" height="70" rx="14" fill="#c2b49a"/>
<path d="M290 500v26M810 500v26" stroke="#1d1a17" stroke-width="8"/>
<ellipse cx="540" cy="600" rx="150" ry="26" fill="#3e3128"/><path d="M412 606v54M668 606v54" stroke="#2a221c" stroke-width="7"/>
<rect x="476" y="582" width="60" height="10" fill="#7a5b44"/><path d="M590 586q0-14 16-14q16 0 16 14Z" fill="#cfc6b4"/>
<!-- Кресло у торшера -->
<path d="M860 520Q860 450 910 446H970Q1010 450 1012 520V640H860Z" fill="#4a3c33"/>
<path d="M850 560Q850 540 870 540Q890 540 890 560V650H850ZM990 560Q990 540 1010 540Q1030 540 1030 560V650H990Z" fill="#3e3229"/>
<path d="M870 580H1010V640H870Z" fill="#584739"/>
<!-- Прежняя люстра с открытыми лампами (исчезает, если выбран «Рассвет») -->
<g class="fixture${on.dawn?' absent':''}">
<path d="M420 0V80" stroke="#7d8580" stroke-width="3"/><path d="M340 96Q420 76 500 96" fill="none" stroke="#8d938e" stroke-width="5"/>
<path d="M420 80V96" stroke="#8d938e" stroke-width="5"/>
${[340,380,420,460,500].map(x=>`<path d="M${x} 94v6" stroke="#8d938e" stroke-width="4"/><circle cx="${x}" cy="108" r="9" fill="#e9f0ef"/>`).join('')}
</g>
<g class="light base${on.base}">
<rect width="1120" height="710" fill="#dfe9ec" opacity=".09"/>
<path d="M320 110H520L1000 540H-40Z" fill="url(#${p}-cold)" filter="url(#${p}-edge)"/>
<ellipse cx="420" cy="108" rx="200" ry="90" fill="url(#${p}-glare)"/>
${[340,380,420,460,500].map(x=>`<circle cx="${x}" cy="108" r="11" fill="#ffffff"/><path d="M${x-26} 108H${x+26}M${x} 84V132" stroke="#ffffff" stroke-opacity=".55" stroke-width="2"/>`).join('')}
<!-- Блик на стекле картины: её почти не видно -->
<rect x="470" y="96" width="300" height="190" fill="#dfe8ea" opacity=".38"/>
<path d="M500 100L580 100L520 282L440 282Z" fill="#ffffff" opacity=".22"/>
</g>
${dim(on,.42)}
<!-- Рассвет: матовый купол -->
<g class="fixture${on.dawn?'':' absent'}"><path d="M420 0V64" stroke="#8f8a7a" stroke-width="3"/><path d="M356 126Q360 66 420 62Q480 66 484 126Z" fill="url(#${p}-frost)"/></g>
<g class="light dawn${on.dawn}">
<ellipse cx="420" cy="126" rx="64" ry="8" fill="#fff4d8"/><path d="M356 126Q360 66 420 62Q480 66 484 126Z" fill="#fff1d4" opacity=".8"/>
<ellipse cx="420" cy="200" rx="460" ry="260" fill="url(#${p}-glow)" filter="url(#${p}-soft)" opacity=".7"/>
<rect width="1120" height="710" fill="#ffd9a0" opacity=".08"/>
<ellipse cx="540" cy="560" rx="380" ry="80" fill="url(#${p}-pool)" opacity=".5"/>
</g>
<!-- Ореол: поворотный цилиндр над картиной -->
<g class="fixture${on.halo?'':' absent'}"><path d="M826 66h-18" stroke="#6b726d" stroke-width="6"/><rect x="784" y="56" width="40" height="22" rx="5" transform="rotate(-36 804 67)" fill="#7a827c"/></g>
<g class="light halo${on.halo}">
<path d="M786 84L800 66L790 300L480 300Z" fill="url(#${p}-cone)" filter="url(#${p}-edge)"/>
<ellipse cx="630" cy="196" rx="190" ry="120" fill="url(#${p}-pool)"/>
<rect x="470" y="96" width="300" height="190" fill="#ffd9a0" opacity=".16"/>
<circle cx="700" cy="150" r="16" fill="#ffe3a8" opacity=".6"/>
</g>
<!-- Пауза: торшер у кресла -->
<g class="fixture${on.pause?'':' absent'}"><path d="M1046 324V650" stroke="#6b5440" stroke-width="5"/><ellipse cx="1046" cy="654" rx="30" ry="7" fill="#2a231d"/><path d="M1006 262H1086L1102 326H990Z" fill="url(#${p}-linen)"/></g>
<g class="light pause${on.pause}">
<path d="M1006 262H1086L1102 326H990Z" fill="#ffe2b0" opacity=".85"/>
<path d="M994 326H1098L1110 650H880Z" fill="url(#${p}-cone)" filter="url(#${p}-edge)" opacity=".8"/>
<ellipse cx="1046" cy="290" rx="150" ry="180" fill="url(#${p}-glow)" filter="url(#${p}-soft)"/>
<ellipse cx="960" cy="610" rx="170" ry="40" fill="url(#${p}-pool)"/>
<path d="M870 580H1010V600H870Z" fill="#ffd9a0" opacity=".25"/>
</g>`}

function work(p,on){return `<defs>${common(p)}${shellDefs(p,['#4f5856','#3f4745','#2b3230'],['#343c3a','#242b29'],['#504438','#262620'])}
<linearGradient id="${p}-screen" x2="0" y2="1"><stop stop-color="#bcd8e8"/><stop offset="1" stop-color="#7fa3ba"/></linearGradient>
<radialGradient id="${p}-blue"><stop stop-color="#bfe0f2" stop-opacity=".5"/><stop offset="1" stop-color="#9cc7e0" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-desk" x2=".1" y2="1"><stop stop-color="#8c6c50"/><stop offset="1" stop-color="#5d4835"/></linearGradient>
</defs>${shell(p)}
<!-- Окно на боковой стене -->
<path d="M936 100L1060 80V320L936 306Z" fill="url(#${p}-night)" stroke="#1a211e" stroke-width="10"/><path d="M998 90V314M936 204L1060 200" stroke="#1a211e" stroke-width="6"/>
<!-- Полка с книгами над столом -->
<path d="M170 150H790V162H170Z" fill="#2c2924"/>
${[[190,96,18,'#6c3a2a'],[210,104,14,'#3f4c55'],[226,90,20,'#8b7a52'],[248,108,12,'#4b5d47'],[262,100,16,'#2f3833'],[300,116,40,'#5c4b3c'],[620,98,16,'#4d3a2f'],[638,104,14,'#6e7d72'],[654,92,18,'#93765a'],[674,110,12,'#3a4650']].map(([x,y,w,c])=>`<rect x="${x}" y="${y}" width="${w}" height="${150-y}" fill="${c}"/>`).join('')}
<path d="M736 150q-4-30 8-40h14q12 10 8 40Z" fill="#6f7a6a"/><path d="M744 110q-10-26-24-34M758 110q6-28 22-36" fill="none" stroke="#4d5a45" stroke-width="3"/>
<!-- Стол, монитор, клавиатура, бумаги -->
<path d="M160 372H800L840 410H120Z" fill="url(#${p}-desk)"/><path d="M120 410H840V424H120Z" fill="#3e3127"/>
<path d="M146 424V600M814 424V600" stroke="#2a221c" stroke-width="12"/>
<path d="M470 340h20v32h-20zM440 370h80v6h-80z" fill="#1a1f1d"/>
<rect x="350" y="186" width="260" height="160" rx="6" fill="#121816"/>
<rect x="360" y="196" width="240" height="140" fill="url(#${p}-screen)"/>
<path d="M378 220H520M378 240H570M378 260H540M378 280H500" stroke="#5b7f96" stroke-width="6" stroke-linecap="round" opacity=".7"/>
<ellipse cx="480" cy="266" rx="250" ry="160" fill="url(#${p}-blue)"/>
<path d="M410 382H560L568 398H402Z" fill="#2a302e"/><path d="M414 388H556M410 394H562" stroke="#454c49" stroke-width="2"/>
<path d="M610 386q0-8 10-8h10v14h-20Z" fill="#33393a"/>
<path d="M222 378H330L340 400H210Z" fill="#c9c3b5"/><path d="M234 384H318M232 390H326M230 396H300" stroke="#8a8478" stroke-width="2"/>
<path d="M342 394l40-8" stroke="#2a2420" stroke-width="4" stroke-linecap="round"/>
<path d="M690 372q-2-26 4-30h24q6 4 4 30Z" fill="#a54e36"/><path d="M722 350q14 2 12 14" fill="none" stroke="#a54e36" stroke-width="4"/>
<!-- Кресло перед столом, вид со спины -->
<path d="M400 470Q400 446 426 446H534Q560 446 560 470V600H400Z" fill="#161d1b"/><path d="M480 600V660M430 668H530" stroke="#121816" stroke-width="10" stroke-linecap="round"/>
${plafond(560)}
<g class="light base${on.base}">${coldCone(p,560,200,940,640)}
<!-- Свет из-за спины: тень от кресла и человека ложится на бумаги -->
<path d="M190 376Q260 352 330 362Q420 350 470 376L476 404H180Z" fill="#0c1210" opacity=".55" filter="url(#${p}-edge)"/>
</g>
${dim(on,.4)}
<!-- Экран светит всегда: он и есть самое яркое в комнате -->
<rect x="360" y="196" width="240" height="140" fill="#cfe6f2" opacity=".25"/>
<!-- Фокус: лампа на шарнире -->
<g class="fixture${on.focus?'':' absent'}">
<ellipse cx="176" cy="372" rx="26" ry="6" fill="#7d867f"/><path d="M176 370L200 280L262 262" fill="none" stroke="#8a938c" stroke-width="7" stroke-linecap="round"/><circle cx="200" cy="280" r="7" fill="#a5aca5"/>
<path d="M252 246L288 254L292 292L246 290Z" fill="#8a938c"/>
</g>
<g class="light focus${on.focus}">
<path d="M250 290L292 292L352 398H196Z" fill="url(#${p}-cone)" filter="url(#${p}-edge)"/>
<path d="M248 288L292 292" stroke="#fff3d2" stroke-width="5"/>
<ellipse cx="276" cy="392" rx="110" ry="22" fill="url(#${p}-pool)"/>
<path d="M222 378H330L340 400H210Z" fill="#fff6e2" opacity=".5"/>
</g>
<!-- Линия: профиль под полкой, ровный свет по столешнице -->
<g class="fixture${on.line?'':' absent'}"><rect x="186" y="162" width="588" height="6" rx="2" fill="#cdc5b2"/></g>
<g class="light line${on.line}">
<rect x="188" y="166" width="584" height="3" fill="#fff3d2"/>
<path d="M188 169H772L820 404H140Z" fill="url(#${p}-wash)" filter="url(#${p}-edge)" opacity=".42"/>
<ellipse cx="480" cy="392" rx="340" ry="22" fill="url(#${p}-pool)"/>
<path d="M160 372H800L812 384H148Z" fill="#ffe3ae" opacity=".3"/>
</g>`}

function bedroom(p,on){return `<defs>${common(p)}${shellDefs(p,['#4b5352','#3b4342','#2a302f'],['#333b3a','#232a29'],['#4e4238','#252520'])}
<linearGradient id="${p}-blanket" x2="0" y2="1"><stop stop-color="#7a8784"/><stop offset="1" stop-color="#4f5c5a"/></linearGradient>
<radialGradient id="${p}-opal"><stop stop-color="#fffaf0"/><stop offset=".7" stop-color="#ffe7bd"/><stop offset="1" stop-color="#f2c98a"/></radialGradient>
</defs>${shell(p)}
<!-- Дверь в коридор -->
<path d="M960 150L1072 134V560L960 506Z" fill="#3a332b" stroke="#1b1713" stroke-width="8"/><circle cx="976" cy="340" r="6" fill="#a8874f"/>
<!-- Изголовье, кровать, подушки -->
<path d="M270 380V250Q270 214 306 214H714Q750 214 750 250V380Z" fill="#5a4a3e"/>
<path d="M300 236H720" stroke="#6c594b" stroke-width="3"/>
<path d="M290 360H730L800 560H220Z" fill="#d6cfc0"/>
<rect x="306" y="330" width="170" height="54" rx="22" fill="#e4ddcf"/><rect x="546" y="330" width="170" height="54" rx="22" fill="#e4ddcf"/>
<!-- Спящий справа: голова на подушке, рука на одеяле -->
<ellipse cx="626" cy="352" rx="28" ry="22" fill="#86705e"/><path d="M600 350Q604 326 628 326Q654 328 656 348Q640 336 624 338Q608 340 600 350Z" fill="#2c231d"/>
<!-- Читающий слева: сидит у изголовья -->
<path d="M330 452Q332 372 384 362Q436 372 438 452Z" fill="#3a4a55"/>
<ellipse cx="384" cy="330" rx="26" ry="30" fill="#86705e"/><path d="M358 324Q360 296 386 296Q412 298 410 326Q398 312 384 314Q368 314 358 324Z" fill="#3a2a20"/>
<!-- Одеяло -->
<path d="M262 430Q420 408 520 420Q640 396 760 432L808 560H212Z" fill="url(#${p}-blanket)"/>
<path d="M300 470Q420 456 520 474M560 470Q660 452 760 476" fill="none" stroke="#3e4a48" stroke-width="3" opacity=".6"/>
<path d="M212 560H808V600H212Z" fill="#3b4644"/>
<!-- Книга в руках -->
<path d="M340 404L384 414L428 404V376L384 388L340 378Z" fill="#e6dfcf"/><path d="M384 388V414" stroke="#9c9586" stroke-width="2"/>
<!-- Тумбы -->
<rect x="134" y="400" width="96" height="90" fill="#3a3029"/><path d="M134 444H230" stroke="#2a221c" stroke-width="3"/>
<rect x="790" y="400" width="96" height="90" fill="#3a3029"/><path d="M790 444H886" stroke="#2a221c" stroke-width="3"/>
<rect x="160" y="384" width="14" height="16" rx="3" fill="#9fb2b6" opacity=".6"/><rect x="820" y="382" width="34" height="18" rx="4" fill="#25302d"/><path d="M828 391h10" stroke="#d27a52" stroke-width="3"/>
${plafond(510)}
<g class="light base${on.base}">${coldCone(p,510,170,860,600)}
<!-- Верхний свет на всю комнату: спящему светит прямо в лицо -->
<ellipse cx="628" cy="350" rx="70" ry="34" fill="#e7f0f2" opacity=".28"/>
<path d="M596 360Q620 340 660 352" fill="none" stroke="#86705e" stroke-width="12" stroke-linecap="round"/>
</g>
${dim(on,.5)}
<!-- Складка: прикроватное бра над тумбой читающего -->
<g class="fixture${on.fold?'':' absent'}"><rect x="210" y="200" width="10" height="26" rx="3" fill="#a8874f"/><path d="M220 214q20-8 30 6" fill="none" stroke="#a8874f" stroke-width="4"/>
<path d="M238 218H268L280 252H226Z" fill="#cfc4ad"/><path d="M244 220l-6 30M253 220v32M262 220l6 30" stroke="#a99d86" stroke-width="2"/></g>
<g class="light fold${on.fold}">
<path d="M238 218H268L280 252H226Z" fill="#ffe7bd" opacity=".75"/>
<path d="M228 252H280L440 416H320Z" fill="url(#${p}-cone)" filter="url(#${p}-edge)"/>
<ellipse cx="384" cy="398" rx="90" ry="26" fill="url(#${p}-pool)"/>
<path d="M340 404L384 414L428 404V376L384 388L340 378Z" fill="#fff6e2" opacity=".6"/>
<ellipse cx="384" cy="330" rx="24" ry="28" fill="#f2c99c" opacity=".22"/>
</g>
<!-- Точка: опаловый ночник низко у двери -->
<g class="fixture${on.point?'':' absent'}"><rect x="900" y="384" width="14" height="18" rx="4" fill="#a8874f"/><circle cx="922" cy="392" r="16" fill="#cfc9bb"/></g>
<g class="light point${on.point}">
<circle cx="922" cy="392" r="16" fill="url(#${p}-opal)"/>
<circle cx="922" cy="400" r="140" fill="url(#${p}-glow)" filter="url(#${p}-soft)" opacity=".8"/>
<ellipse cx="940" cy="560" rx="160" ry="34" fill="url(#${p}-pool)" opacity=".6"/>
</g>`}

const scenes={hall,kitchen,living,work,bedroom};

// items — выбранные изделия комнаты; mode: 'now' | 'after'.
let serial=0;
export function roomScene(id,items,mode,title){
  const p=`rs${++serial}`;
  const after=mode==='after'&&items.length>0;
  // «Как сейчас» — комната до покупки: новых светильников в ней нет.
  const on={base:after?'':' on',dim:after?' on':''};
  for(const x of ['line','arc','dawn','pause','halo','focus','fold','point'])on[x]=after&&items.includes(x)?' on':'';
  const body=scenes[id](p,on);
  return `<svg class="room" viewBox="0 0 1120 710" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
