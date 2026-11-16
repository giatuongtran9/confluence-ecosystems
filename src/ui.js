import { CARD, Game, NODES } from './lib.js';
import { writeSave } from './save.js';
import { S } from './state.js';

export const $=s=>document.querySelector(s),app=$('#app'),modal=$('#modal');

export const rarityBadge=id=>`<span class="rarity rarity-${CARD[id].rarity.toLowerCase()}">${CARD[id].rarity}</span>`;
const cardLabel=c=>CARD[c.id].name+(c.phantom?' (phantom)':' #'+c.uid);
export const nodeLabel=n=>{const encounter=Game.encounterFor(n);return encounter?(Game.trialFor(n)?'Trial · ':'')+(n.type==='elite'?'Warden · ':'')+({packs:'Swarm',armor:'Armor',fast:'Rush'}[encounter.id]):NODES[n.type].name;};
export function save(){try{if(S.run&&S.run.phase!=='combat')writeSave(localStorage,S.run)}catch{toast('Browser storage is unavailable. Keep this tab open to preserve this run.')}}
export function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
export const btn=(a,t,c='',extra='')=>`<button data-action="${a}" class="${c}" ${extra}>${t}</button>`;
