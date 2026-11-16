import { board, fieldUnit } from './board.js';
import { CARD, CARDS, FORMS, GENRES, Game, LEADERS } from './lib.js';
import { render } from './screens.js';
import { S } from './state.js';
import { $, btn, toast } from './ui.js';

// ---- Ability Lab: one unit alone on the field against an endless, harmless stream of runners ----
// While the Lab is open, the global `battle` is a sandbox battle; the player's own battle is restored on leaving.

// The Lab has its own speed (default 1x) so a 2x/4x battle setting doesn't rush the preview.
export const simSpeed=()=>S.screen==='lab'?S.labSpeed:S.speed;
const LAB_COUNTERS={attackCount:'Attacks',archonAttacks:'Archon attacks',qi:'Qi',apexQi:'Apex Qi',souls:'Souls',alloy:'Alloy',alloyAttacks:'Alloy attacks',sandyCharge:'Sandy charge',chromeAttackCharge:'Chrome charge',trophyPoints:'Trophy points',genome:'Genome',dread:'Dread',ram:'RAM',essence:'Essence'};
const LAB_THRESHOLDS={archonAttacks:10,sandyCharge:8,chromeAttackCharge:4,alloyAttacks:3};
function labBattle(id){
  const r=Game.newRun(S.run?.leader||LEADERS[0].id,1234);
  r.roster=[Game.instance(r,id)];
  r.node={row:0,lane:1,type:'battle'};r.depth=5;r.phase='ready';
  const b=Game.deploy(r);
  b.sandbox=true;b.plan.count=Infinity;
  const u=b.units[0];
  if(u&&u.extraSlot==null){const p=Game.xy(4);u.slot=4;u.x=p.x;u.y=p.y}  // centre tile
  return b;
}
export function enterLab(id){
  if(id&&CARD[id])S.labId=id;
  if(!S.labState)S.labState={prevBattle:S.battle,prevPaused:S.paused,prevSelected:S.selected,prevFeedback:S.feedbackSeen,prevEvents:S.visualEvents};
  S.labState.b=labBattle(S.labId);
  S.battle=S.labState.b;S.paused=false;S.selected=null;S.feedbackSeen=0;S.visualEvents=[];
  S.screen='lab';render();
}
export function leaveLab(){
  if(!S.labState)return;
  S.battle=S.labState.prevBattle;S.paused=S.labState.prevPaused;S.selected=S.labState.prevSelected;S.feedbackSeen=S.labState.prevFeedback;S.visualEvents=S.labState.prevEvents;
  S.labState=null;
}
function labUnit(){return S.battle?.units.find(v=>!v.removed&&v.id===S.labId)||S.battle?.units.find(v=>!v.removed)}
export function labTriggerUlt(){
  const u=labUnit();if(!u)return;
  // Most ultimates fire on attackCount % N === 0 with N in {2,3,4,5,6,10}; 60 is a multiple of all of them.
  const bump=n=>Math.ceil(((n||0)+1)/60)*60-1;
  u.attackCount=bump(u.attackCount);
  for(const k of ['siphonCount','scanCount','opticCount','metroidCount'])if(k in u)u[k]=bump(u[k]);
  for(const [k,v] of Object.entries(LAB_THRESHOLDS))u[k]=Math.max(u[k]||0,v-1);
  u.currentCooldown=0;
  toast('Next attack fires the ultimate');
}
export function labSpawn(kind){
  Game.spawn(S.battle);
  const e=S.battle.enemies[S.battle.enemies.length-1];if(!e)return;
  if(kind==='boss'){e.boss=true;e.hp=e.maxHp=S.battle.plan.bossHp;e.defense=.2;e.speed*=.95}
  else{e.elite=true;e.hp=e.maxHp=e.maxHp*2;e.defense=.25}
}
function labNeedsPartner(c){
  const text=`${c.rules||''} ${c.synergy||''}`;
  return /adjacent|neighbou?r|ally|allies|relic|token|devour|consume|blossom|cauldron|module|mount|install|socket/i.test(text);
}
function labCounterHTML(){
  const u=labUnit();if(!u)return '<p class="muted">No unit on the field.</p>';
  const rows=Object.entries(LAB_COUNTERS).filter(([k])=>typeof u[k]==='number'&&(k==='attackCount'||u[k]>0)).map(([k,l])=>{
    const max=LAB_THRESHOLDS[k]||(k==='attackCount'?Math.ceil(((u[k]||0)+1)/10)*10:null);
    return `<div class="lab-counter-row"><span>${l}</span><b>${Math.round(u[k])}${max?`<small> / ${max}</small>`:''}</b></div>`});
  if(k10(u))rows.push(`<div class="lab-ring" aria-label="Attacks toward the 10th">${Array.from({length:10},(_,i)=>`<i class="${i<((u.attackCount||0)%10)?'on':''}"></i>`).join('')}</div>`);
  if(u.channeling)rows.push(`<div class="lab-channel">Channelling ${u.channeling.type} · ${Math.max(0,u.channeling.remaining).toFixed(1)}s</div>`);
  return rows.join('');
}
function k10(u){return /every 10th|10th attack/i.test(CARD[u.id]?.rules||'')}
function labLogHTML(){
  const rows=(S.battle?.feedback||[]).slice(-14).reverse();
  if(!rows.length)return '<p class="muted">Abilities appear here as they fire.</p>';
  return rows.map(r=>`<li><time>${r.t.toFixed(1)}s</time>${r.text}</li>`).join('');
}
function labPickerHTML(){
  const all=[...CARDS,...FORMS];
  return `<input class="lab-search" type="search" placeholder="Search ${all.length} units" value="${S.labQuery.replace(/"/g,'&quot;')}" aria-label="Search units">
  <div class="filterbar lab-filters">${btn('labFilter','All',S.labFilter==='all'?'active':'','data-id="all"')}${Object.entries(GENRES).map(([k,v])=>btn('labFilter',v[0],S.labFilter===k?'active':'',`data-id="${k}"`)).join('')}</div>
  <div class="lab-list" role="listbox" aria-label="Units">${all.filter(c=>S.labFilter==='all'||c.genre===S.labFilter).map(c=>`<button class="lab-item ${c.id===S.labId?'active':''}" data-action="labPick" data-id="${c.id}" data-name="${(c.name+' '+(c.vn||'')).toLowerCase().replace(/"/g,'')}" style="--realm:${GENRES[c.genre][1]}" ${S.labQuery&&!(c.name+' '+(c.vn||'')).toLowerCase().includes(S.labQuery)?'hidden':''}><span class="lab-item-name">${c.name}</span><span class="lab-item-meta">${c.rarity||''} · ${GENRES[c.genre][0]}</span></button>`).join('')}</div>`;
}
export function labView(){
  const c=CARD[S.labId],partner=labNeedsPartner(c);
  return `<section class="stage lab"><div class="eyebrow">Ability Lab</div><h2 class="lab-title">Watch every ability</h2>
  <p class="muted lab-sub">One unit alone on the field. Runners keep coming and never cost health.</p>
  <div class="lab-layout">
    <div class="lab-unitbar" style="--realm:${GENRES[c.genre][1]}"><div><small>${GENRES[c.genre][0]}</small><b>${c.name}</b></div>${btn('labToggle',S.labPickerOpen?'Close ✕':'Change unit ▾','small',`aria-expanded="${S.labPickerOpen}"`)}</div>
    ${S.labPickerOpen?`<aside class="panel lab-picker">${labPickerHTML()}</aside>`:''}
    <div class="lab-toolbar">${btn('labUlt','⚡ Trigger ultimate now','small primary')}${btn('labElite','+ Elite','small')}${btn('labBoss','+ Boss','small')}${btn('labReset','↺ Reset','small')}</div>
    <div class="lab-toolbar lab-speed" role="group" aria-label="Preview speed"><span>Speed</span>${[0.25,0.5,1].map(n=>btn('labSpeed',n===1?'1×':n===0.5?'½×':'¼×',`small ${S.labSpeed===n?'chosen':''}`,`data-id="${n}" aria-pressed="${S.labSpeed===n}"`)).join('')}</div>
    <section class="lab-arena">${board()}</section>
    <aside class="panel lab-info">
      <div class="lab-card" style="--realm:${GENRES[c.genre][1]}"><div class="eyebrow">${c.rarity||''} · ${GENRES[c.genre][0]}</div><h2>${c.name}</h2>${c.vn?`<div class="muted">${c.vn}</div>`:''}
        <div class="lab-stats"><span>${c.baseAtk??'—'} ATK</span><span>${c.attackInterval?c.attackInterval+'s':'—'} interval</span></div>
        <p class="lab-rules">${c.rules||''}</p>${c.synergy?`<p class="lab-synergy"><b>Synergy:</b> ${c.synergy}</p>`:''}
        ${partner?`<p class="lab-partner">This unit is placed alone, so effects that need adjacent allies, relics, tokens or modules won't fire here.</p>`:''}
      </div>
      <h3 class="lab-h">Toward the ultimate</h3><div id="lab-counter">${labCounterHTML()}</div>
      <h3 class="lab-h">Ability log</h3><ul id="lab-log" class="lab-log">${labLogHTML()}</ul>
    </aside>
  </div></section>`;
}
export function labUI(){
  const ctr=$('#lab-counter');if(ctr)ctr.innerHTML=labCounterHTML();
  const log=$('#lab-log');if(log)log.innerHTML=labLogHTML();
  const field=$('#field');
  if(field){const key=S.battle.units.filter(u=>!u.removed).map(u=>u.uid+':'+u.slot).join();if(field.dataset.key!==key){field.dataset.key=key;field.innerHTML=S.battle.units.filter(u=>!u.removed).map(fieldUnit).join('')}}
}
