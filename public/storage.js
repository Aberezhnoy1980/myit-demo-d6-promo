// Хранилище только D6: один ключ, версия внутри значения. Весь localStorage не очищается.
import {empty,validate,VERSION} from './state.js';
export const KEY='myit.d6.light.v1';
export function load(storage){
  try{
    const raw=storage.getItem(KEY);
    if(raw===null)return {state:empty(),status:'empty'};
    let data;try{data=JSON.parse(raw)}catch{return {state:empty(),status:'invalid'}}
    const state=validate(data);
    return state?{state,status:data.version===VERSION?'saved':'migrated'}:{state:empty(),status:'invalid'};
  }catch{return {state:empty(),status:'unavailable'}}
}
export function save(storage,state){try{storage.setItem(KEY,JSON.stringify(state));return true}catch{return false}}
export function clear(storage){try{storage.removeItem(KEY);return true}catch{return false}}
