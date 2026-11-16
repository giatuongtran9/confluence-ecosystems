import { detail } from './board.js';
import { info } from './cards.js';
import { enterLab, labSpawn, labTriggerUlt, leaveLab } from './lab.js';
import { CARD, Game, NODES, RELICS } from './lib.js';
import { encounterPanel, mapView, showReport, syncNodeModal, upgradeChoices } from './map.js';
import { help, receiveFeedback, render, showDialog, startLeader } from './screens.js';
import { art } from './sprites.js';
import { S } from './state.js';
import { $, btn, modal, save, toast } from './ui.js';

document.addEventListener('input',e=>{
  if(!e.target.classList?.contains('lab-search'))return;
  S.labQuery=e.target.value.trim().toLowerCase();
  document.querySelectorAll('.lab-item').forEach(b=>{b.hidden=!!S.labQuery&&!b.dataset.name.includes(S.labQuery)});
});
document.addEventListener('click',e=>{let el=e.target.closest('[data-action]');if(!el)return;let a=el.dataset.action,id=el.dataset.id;
 if(a==='labOpen'){if(modal.open)modal.close();enterLab(id);window.scrollTo(0,0);return}
 if(S.screen==='lab'){
  if(a==='labPick'){S.labPickerOpen=false;enterLab(id);return}
  if(a==='labToggle'){S.labPickerOpen=!S.labPickerOpen;render();if(S.labPickerOpen)$('.lab-search')?.focus();return}
  if(a==='labFilter'){S.labFilter=id;render();return}
  if(a==='labUlt'){labTriggerUlt();return}
  if(a==='labSpeed'){S.labSpeed=Number(id);document.querySelectorAll('[data-action="labSpeed"]').forEach(b=>{const on=Number(b.dataset.id)===S.labSpeed;b.classList.toggle('chosen',on);b.setAttribute('aria-pressed',on)});return}
  if(a==='labElite'||a==='labBoss'){labSpawn(a==='labBoss'?'boss':'elite');return}
  if(a==='labReset'){enterLab(S.labId);return}
  if(a==='unit'){info(el.dataset.card);return}
  if(!['close','help','inspectCard'].includes(a)){leaveLab()}
 }
 if(a==='close'){modal.close();return}
 if(a==='home'||a==='codex'){if(S.battle&&!S.battle.done)S.paused=true;S.screen=a;render();window.scrollTo(0,0);return}
 if(a==='help'){help();return}
 if(a==='filter'){S.filter=id;render();return}
 if(a==='inspectCard'){info(id);return}
 if(a==='leader'){if(S.run&&!['won','lost'].includes(S.run.phase))showDialog(`<h2>Begin a new crossing?</h2><p>This replaces your current run.</p>${btn('confirmLeader','Begin new run','primary',`data-id="${id}"`)}`);else startLeader(id);return}
 if(a==='confirmLeader'){modal.close();startLeader(id);return}
 if(a==='journey'||a==='resume'){S.screen=S.run?'game':'home';render();window.scrollTo(0,0);return}
 if(a==='draftTab'){if(S.run?.phase==='draft'){S.screen='game';render()}else toast('Draft reward opens after clearing a battle!');return}
 if(!S.run)return;
 if(a==='upgradeCard'&&S.run.phase==='event'&&S.run.node.type==='workshop'){upgradeChoices(id);return}
 if(a==='upgrade'){if(Game.upgrade(S.run,id,el.dataset.choice)){modal.close();save();render();toast('Upgrade applied · 10 health spent')}return}
 if(a==='skipDraft'){if(Game.skipDraft(S.run)){S.battle=null;S.selected=null;save();render();window.scrollTo(0,0)}return}
 if(a==='rerollDraft'){if(Game.rerollDraft(S.run)){save();render();toast('Three new options · 10 coins spent')}return}
 if(a==='draft'){if(Game.draft(S.run,id)){S.battle=null;S.selected=null;save();render();window.scrollTo(0,0)}return}
 if(a==='node'){if(Game.chooseNode(S.run,id)){save();render();syncNodeModal(true)}return}
 if(a==='nodeOpen'){syncNodeModal(true);return}if(a==='closeReport'){modal.close();return}if(a==='nodeInfo'&&S.run.reports?.[id]){showReport(S.run.reports[id],S.run.map.flat().find(n=>n.id===id));return}if(a==='nodeInfo'){let n=S.run.map.flat().find(n=>n.id===id);showDialog(`<div class="eyebrow">Stage ${n.row+1}</div><h2>${NODES[n.type].name}</h2><p>${NODES[n.type].desc}</p>${encounterPanel(n)}<p class="hint">${S.run.visited.includes(id)?'You visited this destination.':'Follow connected routes to reach this destination.'}</p>`);return}
 if(a==='deploy'&&S.run.phase==='ready'){save();S.battle=Game.deploy(S.run);S.openingAt=performance.now();S.feedbackSeen=0;S.visualEvents=[];receiveFeedback();S.selected=null;S.paused=false;S.screen='game';render();window.scrollTo(0,0);return}
 if(a==='pause'){S.paused=!S.paused;el.textContent=S.paused?'▶ Resume':'Ⅱ Pause';return}
 if(a==='speed'){S.speed=Number(id);document.querySelectorAll('[data-action="speed"]').forEach(b=>b.classList.toggle('chosen',Number(b.dataset.id)===S.speed));return}
 if(a==='unit'){S.selected=id;showDialog('<div id="live-card-detail">'+detail()+'</div>',true);return}
 if(a==='route'){showDialog(mapView(false));return}
 if(a==='roster'){showDialog(`<div class="eyebrow">Active deck · ${S.run.roster.length} cards</div><h2>Your fellowship.</h2><p>Up to nine are randomly drawn each battle. Visit a Fate Workshop to upgrade a card.</p><div class="rostergrid">${S.run.roster.map(u=>`<button class="unit-card" data-action="rosterCard" data-id="${u.uid}">${art(CARD[u.id])}<h3>${CARD[u.id].name}</h3><p>${Math.round(Game.base(u))} ATK · +${u.permanentAtkBonus} permanent growth</p></button>`).join('')}</div>`);return}
 if(a==='rosterCard'){let u=S.run.roster.find(u=>String(u.uid)===id);if(modal.open)modal.close();info(u.id,u);return}
 if(S.run.phase==='event'&&S.run.node?.type==='shop'&&['shopCard','shopRelic','shopRemove','shopLeave'].includes(a)){const ok=a==='shopCard'?Game.shopBuyCard(S.run,id):a==='shopRelic'?Game.shopBuyRelic(S.run,id):a==='shopRemove'?Game.shopRemove(S.run,id):Game.leaveShop(S.run);if(!ok&&a!=='shopLeave')toast('Not enough coins');save();render();return}
 if(S.run.phase==='event'&&a==='purify'){if(Game.campfirePurify(S.run,id)){toast('Card removed');save();render();window.scrollTo(0,0)}return}
 if(S.run.phase==='event'&&a==='rite'){const res=Game.performRite(S.run);if(res)toast(`Eclipse Rite · ${CARD[res.apexId].name} awakened · ${CARD[res.sacrificed].name} sacrificed`);S.run.recap=null;Game.reward(S.run);save();render();window.scrollTo(0,0);return}
 if(S.run.phase==='event'&&['rest','relic','bargain','safe'].includes(a)){if(a==='rest')S.run.health=Math.min(S.run.maxHealth,S.run.health+12);if(a==='safe')S.run.health=Math.min(S.run.maxHealth,S.run.health+3);if(a==='relic')Game.addRelic(S.run,id);if(a==='bargain'){if(S.run.health<=12)return;S.run.health-=12;let opts=RELICS.filter(r=>!S.run.relics.includes(r.id));if(opts.length){let r=opts[Math.floor(Game.rand(S.run)*opts.length)];Game.addRelic(S.run,r.id);toast(`Found ${r.name}`)}}S.run.recap=null;Game.reward(S.run);save();render();window.scrollTo(0,0)}
});
