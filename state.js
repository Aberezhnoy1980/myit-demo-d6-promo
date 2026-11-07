import {scenes} from './data.js';
export const scenarios = {work:'Работа',rest:'Отдых',meeting:'Встречи'};
const blankDraft=()=>({scenario:null,modules:[]});
export const empty=()=>({version:3,answers:{},draft:blankDraft(),personal:null});
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>plain(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const known=id=>scenes.some(s=>s.id===id);
function validChoice(x,complete=false){return exact(x,['scenario','modules'])&&(x.scenario===null||Object.hasOwn(scenarios,x.scenario))&&Array.isArray(x.modules)&&x.modules.length<=3&&new Set(x.modules).size===x.modules.length&&x.modules.every(known)&&(!complete||(x.scenario!==null&&x.modules.length>=2));}
export function validate(x){
 if(!plain(x)||![1,2,3].includes(x.version)||!plain(x.answers))return null;
 if(!exact(x,x.version===3?['version','answers','draft','personal']:['version','answers']))return null;
 const keys=Object.keys(x.answers);if(keys.some(k=>!known(k))||keys.some(k=>!Number.isInteger(x.answers[k])||(x.version===1?x.answers[k]!==0:scenes.find(s=>s.id===k).answer!==x.answers[k])))return null;
 const answers=Object.fromEntries(keys.map(k=>[k,scenes.find(s=>s.id===k).answer]));
 if(x.version!==3)return {version:3,answers,draft:blankDraft(),personal:null};
 if(!validChoice(x.draft)||!(x.personal===null||validChoice(x.personal,true)))return null;
 if(keys.length!==8&&(x.draft.scenario!==null||x.draft.modules.length||x.personal!==null))return null;
 return {version:3,answers,draft:{scenario:x.draft.scenario,modules:[...x.draft.modules]},personal:x.personal?{scenario:x.personal.scenario,modules:[...x.personal.modules]}:null};
}
export const count=s=>Object.keys(s.answers).length;
export const next=s=>scenes.findIndex(x=>!(x.id in s.answers));
export function answer(s,id,value){const item=scenes.find(x=>x.id===id);if(!item||!Number.isInteger(value)||value<0||value>=item.options.length)return {state:s,result:'invalid'};if(id in s.answers)return {state:s,result:'already'};if(value!==item.answer)return {state:s,result:'wrong'};return {state:{...s,answers:{...s.answers,[id]:value}},result:'correct'};}
export function setScenario(s,id){return count(s)===8&&Object.hasOwn(scenarios,id)?{...s,draft:{...s.draft,scenario:id}}:s;}
export function toggleModule(s,id){if(count(s)!==8||!known(id))return s;const selected=s.draft.modules;const modules=selected.includes(id)?selected.filter(x=>x!==id):selected.length<3?[...selected,id]:selected;return {...s,draft:{...s.draft,modules}};}
export function confirm(s){return count(s)===8&&validChoice(s.draft,true)?{...s,personal:{scenario:s.draft.scenario,modules:[...s.draft.modules]}}:s;}
