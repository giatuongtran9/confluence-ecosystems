import { battlefield, cardCell, stageAspect } from './battlefield.js';
import { cardTags, evolutionHint } from './cards.js';
import { CARD, GENRES, Game } from './lib.js';
import { ascensionBarHTML, devourGhosts } from './screens.js';
import { art } from './sprites.js';
import { S } from './state.js';
import { rarityBadge } from './ui.js';

export function fieldUnit(u){
  const c=CARD[u.id],fav=Game.favored(S.battle,u),isApex=Game.isApexImmortal(u)||c.rarity==='Mythic';
  const cells=Game.occupiedSlots(u).map(Game.xy),w=Math.max(...cells.map(p=>p.x))-Math.min(...cells.map(p=>p.x))+1,h=Math.max(...cells.map(p=>p.y))-Math.min(...cells.map(p=>p.y))+1;
  // #field spans the whole board; the box is the union of the occupied cells, and nearer rows stack in front.
  const boxes=cells.map(p=>cardCell(p.x,p.y)),left=Math.min(...boxes.map(b=>b.left)),top=Math.min(...boxes.map(b=>b.top)),bw=Math.max(...boxes.map(b=>b.left+b.width))-left,bh=Math.max(...boxes.map(b=>b.top+b.height))-top,z=1+Math.max(...cells.map(p=>p.y));
  const titanClass = u.extraSlot != null ? `scrap-titan ${h > w ? "titan-vertical" : "titan-horizontal"}` : "";
  return `<button class="field-card ${titanClass} ${fav?'favored':''} ${isApex?'apex-unit':''} ${u.state!=='active'?'inactive':''} ${String(S.selected)===String(u.uid)?'selected':''}" style="--realm:${GENRES[c.genre][1]};--unit-width:${bw}%;--unit-height:${bh}%;left:${left}%;top:${top}%;width:${bw}%;height:${bh}%;z-index:${z}" data-action="unit" data-card="${u.id}" data-layout="${u.slot}:${u.extraSlot??''}:${(u.modules||[]).join()}:${u.mountedHead||''}" data-id="${u.uid}" aria-label="${c.name}, ${Math.round(Game.atk(S.battle,u))} attack">
    <div class="unit-shadow"></div>
    ${art(c)}${u.mountedHead?'<span class="trophy-mount-label">'+u.mountedHead.toUpperCase()+'</span>':''}${u.extraSlot!=null?'<span class="titan-label">2 SLOTS</span>':''}
    <span class="field-atk">${Math.round(Game.atk(S.battle,u))}</span>
  </button>`
}
// 2.5D: the .battle-stage shows the perspective image at its own aspect; the square .board (cards, runners, effects)
// spans the stage's full width, centred vertically, which is the frame BattleView.projector maps into.
export function board(){const field=battlefield(),v=field.view;return `${v?`<div class="battle-stage" style="aspect-ratio:${stageAspect(v)};--stage-aspect:${stageAspect(v)};background-image:url('${v.image}')">`:``}<div class="board ${v?'board-25d':''}" style="${v?'':`--battlefield-image:url('${field.asset}')`}" role="group" aria-label="Three by three card grid inside a sixteen-tile perimeter"><div id="field" style="left:0;top:0;width:100%;height:100%">${S.battle.units.filter(u=>!u.removed).map(fieldUnit).join('')}</div>${devourGhosts()}<canvas id="arena" width="700" height="700" aria-label="Animated enemy route around the outside of the nine card slots"></canvas></div>${v?`</div>`:``}`}
export function cosmicDetail(u){
 if(CARD[u.id].genre!=='Lovecraft')return '';
 let lines=[];
 if(Game.isIdol(u)){const scripts=u.scripts||[],branch=Game.COSMIC_BRANCHES[Game.cosmicPair(scripts)];lines.push('Locked scripts: '+(scripts.join(' + ')||'awaiting the first deciphered page'));if(branch)lines.push('Old One: '+CARD[branch[1]].name);lines.push(Game.cosmicApex(u)?'The Old One has answered.':scripts.length<2?'The oldest Idol missing a script learns the next deciphered page.':'At 154 Syllables on an Elite or Boss node: drive 16 runners Insane (a Boss counts 3).');}
 if(u.id==='archivist')lines.push('Pages in the pool: '+(Game.pages(S.run).join(', ')||'none')+' (max 6)');
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}
export function cyberDetail(u){
 if(!Game.heatUser(u))return '';
 const arm=u.arm||CARD[u.id].cyberArm,os=u.os||CARD[u.id].cyberOS,live=!!S.battle?.units.includes(u),t=S.battle?.cyberTrial,band=Game.heatBand(u);
 const bandText={redline:'REDLINE · +35% damage, +15% attack speed',warm:'WARM · +15% damage',cold:'COLD'}[band];
 const sockets=Game.isCyber(u)?`<p class="hint">Arm: ${arm?CARD[arm].name:'empty'} · OS: ${os?CARD[os].name:'empty'}${u.tuning?` · +${Math.round(u.tuning*100)}% tuning`:''}<br>Implants install into any Operative with a free socket; an adjacent install adds +10% tuning.</p>`:'';
 const heat=live?`<p class="hint">Heat: ${(u.heat||0).toFixed(0)}°C / 100°C · ${u.state==='overheat'?'THERMAL SHUTDOWN':bandText}${u.id==='netrunner'?`<br>RAM: ${Math.floor(u.ram||0)} / 8 · Short Circuit costs 3`:''}</p>`:'<p class="hint">Heat resets each battle. Installed hardware, tuning and Chrome persist.</p>';
 const proof=t&&t.unitUid===u.uid?`<p class="hint">Redline Proof: ${t.redline.toFixed(1)}/8s · ${t.status}</p>`:'';
 const chrome=Game.isCyber(u)?`<p class="hint">${u.chrome||0} Chrome · ${u.chromeAttackCharge||0}/4 attacks toward the next point</p>`:'';
 return sockets+heat+proof+chrome;
}
const rackSummary=r=>{const n={};for(const t of Game.rack(r))n[t.type]=(n[t.type]||0)+1;return Game.TROPHIES.map(t=>Game.TROPHY_NAMES[t]+' '+(n[t]||0)).join(' · ')};
export function huntTrialHUDHTML(b){const r=b?.run;if(!r||!b.units.some(u=>!u.removed&&Game.isHunter(u)))return '';const n=Game.rack(r).length;return `<div class="hunt-trial-hud active"><div class="urban-trial-head"><b>⚔ TROPHY RACK</b><span>${n}/${Game.RACK_CAP}</span></div><p>${rackSummary(r)}</p></div>`}
export function cyberTrialHUDHTML(b){const t=b?.cyberTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Cyber Mythic',pct=Math.min(100,t.redline/8*100);if(t.status==='active'||t.status==='proven')return `<div class="cyber-trial-hud active"><div class="urban-trial-head"><b>⌘ REDLINE PROOF</b><span>${t.nodeType.toUpperCase()} · ${t.redline.toFixed(1)}/8s</span></div><div class="blackout-meter"><i style="width:${pct}%"></i></div><p>${t.status==='proven'?`Proven. Win this battle to awaken ${name}.`:`Hold the Operative at 80–99°C for 8s in total to awaken ${name}. Overheating costs 4s (${t.resets} so far).`}</p></div>`;if(t.status==='passed')return `<div class="cyber-trial-hud passed"><b>✦ REDLINE PROOF PASSED</b><span>${name} awakened</span></div>`;return `<div class="cyber-trial-hud failed"><b>REDLINE PROOF FAILED</b><span>${t.reason||''} · nothing was lost</span></div>`;}
function arcaneDetail(u){
 if(CARD[u.id].genre!=='Arcane')return '';
 const names=p=>p.split('+').join(' + ');
 let lines=[];
 if(Game.isElemental(u)&&!Game.isArchon(u)){
  lines.push(`Mastery: ${u.mastery||0}% · Permanent ATK: +${u.permanentAtkBonus||0}`);
 }
 if(Game.isApprentice(u)){
  if(u.lockedPair)lines.push(`Locked Path: ${names(u.lockedPair)} (Off-pair points convert 2:1 into ${names(u.lockedPair)})`);
  lines.push('Synthesis: '+Object.keys(Game.ARCANE_PAIRS).map(p=>names(p)+' '+(u.synthesis?.[p]||0)).join(' · '));
  lines.push('Stored essences: '+((u.essences||[]).join(', ')||'none'));
  const prog=Game.evolutionProgress(u);
  if(prog.label)lines.push(prog.label);
 }
 if(Game.isArchon(u)){
  lines.push(`Archon Ultimate: ${u.archonAttacks||0}/10 attacks toward Channel${u.channeling?' · CHANNELING':''}`);
 }
 if(u.id==='manaBattery')lines.push('Mana Battery: pulses every 8.0s → +4 ticks to a random deployed mage');
 if(u.id==='elementalPrism')lines.push('Elemental Prism: when an adjacent mage casts at max gauge (10 ticks), grants +2 ticks to all deployed elemental mages; no cooldown');
 if(u.id==='astralLoom')lines.push('Astral Loom: adjacent units gain 2 ticks per attack and +20% attack speed');
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}
function huntDetail(u){
 if(CARD[u.id].genre!=='Grimdark')return '';
 let lines=[];
 if(Game.isBodyPath(u)&&u.id!=='vajraBody')lines.push(`Kill points: ${u.killPoints||0} · milestones 12 / 35 / 70 (ordinary 1, Elite 3, Boss/Champion 5) · Qi tempering ${Math.floor(u.qiTemper||0)}/10`);
 if(Game.isMonkPath(u)&&u.id!=='bodhisattva'){const g=Game.MONK_GATES[u.id==='wanderingMonk'?0:1];lines.push(`Discipline: ${u.monkAttacks||0}/${g.attacks} attacks · ${u.monkFinishes||0}/${g.finishes} finishes on slowed or marked runners · ${Math.floor(u.qi||0)}/${g.qi} Qi${u.id==='arhatMonk'?' · trial needs the Bodhi Prayer Beads adjacent':''}`);}
 if(Game.isSlayer(u))lines.push(`Trophy Points: ${u.trophyPoints||0} · milestones 25 / 60 / 100${Game.HUNT_APEX.includes(u.id)?' · Mythic awakened':' · Eclipse Rite at a Campfire: 3 trophies of one type (Wyrm 2) + 1 random card'}`);
 if(u.id==='taxidermist')lines.push(`Trophy Rack: ${rackSummary(S.run)} · ${Game.rack(S.run).filter(t=>!t.carved).length} uncarved`);
 if(u.id==='trophyStake')lines.push(`Projecting: ${Game.rack(S.run).length?Game.TROPHY_NAMES[Game.rack(S.run).at(-1).type]:'nothing yet'}`);
 if(u.id==='dragonSlayer')lines.push(`Blood-frenzy: +${Math.round((u.huntFrenzy||0)*100)}% attack speed`);
 if(u.id==='witcherGrandmaster')lines.push(`Next stance: ${Math.floor((u.attackCount||0)/3)%2?'Signs':'Silver'} · Silver criticals are 3× total against priority targets`);
 if(S.run?.huntArmor)lines.push(`Carved Horns: -${Math.round(S.run.huntArmor*100)}% priority enemy base armor`);
 if(S.run?.huntEye)lines.push('Carved Eye: existing 30% ordinary execution thresholds become 35%');
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}
function scrapworkDetail(u){
 if(u.id==='smelter'){
 const near=Game.neighbors(S.battle,u),scraps=near.filter(v=>['rustSword','rustGun'].includes(v.id)).length;
 const openings=[0,1,2,3,4,5,6,7,8].filter(s=>!Game.slotOccupied(S.battle,s)&&Math.abs(Game.xy(s).x-u.x)+Math.abs(Game.xy(s).y-u.y)===1).length;
 const mechs=S.battle.units.some(v=>!v.removed&&Game.isMech(v));
 const stored=(u.scrapIntake||[]),names={rustSword:'Sword',rustGun:'Gun'};
 return `<div class="scrap-progress"><b>Intake: ${stored.length}/2 · ${stored.map(id=>names[id]).join(' + ')||'empty'}</b><p>Stored scrap survives battles · ${scraps} adjacent scrap(s)</p><p>${!mechs?'Needs a deployed Mech':stored.length+scraps>=2?'Ready in '+Math.max(0,(u.forgeAt||0)-S.battle.time).toFixed(1)+'s':scraps+openings<1?'Blocked: needs one neighboring working slot. Next battle reshuffles.':'Waiting for salvage. A Crane delivers into empty neighboring slots.'}</p></div>`;
 }
 if(!Game.isMech(u))return '';
 const names={blade:'Colossal Scrap Blade',flak:'Twin Flak Battery',gunblade:'Vanguard Gunblade'};
 return `<div class="scrap-progress"><b>Tempered Alloy: ${u.alloy||0}</b><p>Walker 25 · Heavy 65 · Titanshift 120</p><p>${(u.modules||[]).map(m=>names[m]).join(' + ')||'Awaiting forged weapons'} · ${(u.modules||[]).length}/2 locked</p><p>${u.extraSlot!=null?'Two adjacent slots reserved':u.titanUnlocked?'Titanshift ready — waiting for an adjacent empty slot':'One deployment slot'}.</p><p>Mythic trial: 120 Alloy, Titanshift, two modules, adjacent Reactor on Elite/Boss. Prove both modules against priority enemies, then clear with zero leaks. Every 15 Alloy above 120 grants +2 ATK.</p></div>`;
}

function xenoDetail(u){
 if(!Game.isXeno(u))return '';
 let lines=[];
 if(Game.isXenoSpecimen(u)){
  const g=u.genome||0,strains=u.strains||[],sc=u.strainScore||{};
  lines.push(`Genome: ${g} · Chitin ${sc.chitin||0} · Acid ${sc.acid||0} · Psionic ${sc.psionic||0}${u.strainsLocked?' · locked':''} · Biomass pool ${S.battle?.biomass||0}`);
  const pair=Game.xenoPair(strains);
  if(pair&&Game.XENO_BRANCHES[pair]&&strains.length===2){
   const [epicId,,apexId]=Game.XENO_BRANCHES[pair];
   lines.push(`Lineage: ${CARD[epicId].name} → ${CARD[apexId].name}`);
  }
  lines.push('Metamorphosis: at 130 Genome on an Elite/Boss node the chrysalis cocoons for 15s; no leaks and it hatches mid-battle. A leak cracks the cocoon; try again next Elite/Boss.');
  const trial=S.battle?.xenoTrial;
  if(trial?.unitUid===u.uid)lines.push(`Cocoon: ${trial.status}${trial.status==='active'?` · hatches in ${Math.max(0,trial.hatchAt-S.battle.time).toFixed(1)}s`:trial.reason?` · ${trial.reason}`:''}`);
 }
 if(u.id==='geneSplicer'){
  lines.push('The Specimen eats 8 Biomass every 5s for +6 Genome (+2 permanent ATK if adjacent).');
 }
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}

export function detail(){let u=S.battle?.units.find(u=>String(u.uid)===String(S.selected));if(!u)return `<div class="empty-detail"><span class="sigil">✧</span><h3>Watch the connections.</h3><p>Tap any card to inspect its current attack, progress, and ecosystem role.</p><p class="hint">Team effects work across the board. Only explicitly marked abilities depend on neighbors. No card can take damage.</p></div>`;const c=CARD[u.id];return `<div class="unit-title">${art(c)}<div><div class="eyebrow" style="color:${GENRES[c.genre][1]}">${GENRES[c.genre][0]}</div><h3>${c.name}</h3>${rarityBadge(c.id)}${cardTags(c,!!(u.phantom||u.token))}</div></div><div class="unit-stats"><div><b>${Math.round(Game.atk(S.battle,u))}</b><small>ATTACK</small></div><div><b>${u.attackInterval?(u.attackInterval/Game.speed(S.battle,u)).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u.permanentAtkBonus}</b><small>${u.phantom?"WAVE BONUS":"PERMANENT"}</small></div></div>${Game.isPractitioner(u)?`<p class="state-text cultivation-realm">${['Qi-Refining','Foundation Establishment','Golden Core','Nascent Soul'][u.realm||0]} · Realm ${u.realm||0}/3 · ${u.qi||0} Qi${u.realm<3?` · next pill gate ${[30,85,175][u.realm||0]} · stock ${Game.breakthroughPills?.(S.battle)??0}/3`:u.qi>=200?' · 200 Qi + adjacent relic: Elite/Boss trial':' · next: 200 Qi + adjacent relic on Elite/Boss'}</p>`:''}${Game.isCultivationApex(u)?`<p class="state-text cultivation-realm">Post-ascension Qi ${u.apexQi||0}/30 toward the next permanent +2 ATK · lifetime Qi ${u.qi||0}</p>`:''}${u.id==='cauldron'?`<p class="state-text cultivation-realm">Breakthrough Pills ${Game.breakthroughPills?.(S.battle)??0}/3 · stored while any Cauldron remains in roster; spend only while one is deployed.</p>`:''}<p class="state-text">${u.removed?(u.phantom?'Token consumed · parent safe':'Original consumed · permanently lost'):u.state!=='active'?u.state+' · '+u.stateRemaining.toFixed(1)+'s remaining':'Active'}${u.phantom?' · one-wave token · species: '+CARD[Game.species(u)]?.name:''}</p>${u.threshold.max?`<div class="meter"><i style="width:${u.threshold.current/u.threshold.max*100}%"></i></div><p class="hint">Progress ${Math.floor(u.threshold.current)} / ${u.threshold.max}</p>`:''}${cosmicDetail(u)}${cyberDetail(u)}${arcaneDetail(u)}${huntDetail(u)}${scrapworkDetail(u)}${xenoDetail(u)}${ascensionBarHTML(u)}${evolutionHint(c,u)}${u?`<p class="hint">Workshop: +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}</p>`:""}<div class="eyebrow">Rules</div><div class="ability">${c.rules}</div>${c.rules.includes('Team Power')?`<p class="hint">Current Team Power: <b>${Game.teamPower(S.battle).toFixed(1)}</b> · permanent ATK on deployed originals, including this card.</p>`:''}<div class="spatial ${Game.favored(S.battle,u)?'on':''}">Works well with<p>${c.synergy}</p></div><p class="hint">${Math.round(Game.crit(S.battle,u)*100)}% critical chance · ${Math.round(Game.critMultiplier(S.battle,u)*100)}% critical damage</p>${c.fav==='neighbor'?`<p class="hint">Neighbors: ${Game.neighbors(S.battle,u).map(v=>CARD[v.id].name).join(', ')||'none'}</p>`:''}`}
export function blackoutHUDHTML(b){
 if(!b)return '';
 const hasUrban = b.units.some(u=>!u.removed&&Game.isUrbanLegend(u));
 const inCurfew = b.curfewUntil > b.time;
 const inLockout = !inCurfew && b.time < (b.blackoutLockoutUntil||0);
 const hasOrder = b.units.some(u=>!u.removed&&Game.isOrderUnit(u));
 const gauge = b.orderChaos || 0, lit = Game.lightsOn(b);
 if(!hasUrban && !hasOrder && !inCurfew && !inLockout && !lit && gauge === 0)return '';
 if(lit){
  const rem = Math.max(0, b.lightsOnUntil - b.time);
  return `<div class="blackout-banner state-lights"><div class="blackout-header"><span class="blackout-badge lights-badge">☀ LIGHTS ON</span><span class="blackout-timer">${rem.toFixed(1)}s</span></div><div class="blackout-meter"><i style="width:${Math.min(100,rem/6*100)}%"></i></div><div class="blackout-sub">Runners Compliant · Order +30% speed, +10% damage · Chaos goes quiet</div></div>`;
 }

 if(inCurfew){
  const rem = Math.max(0, b.curfewUntil - b.time);
  const pct = Math.min(100, Math.max(0, (rem / 6.0) * 100));
  return `<div class="blackout-banner state-frenzy"><div class="blackout-header"><span class="blackout-badge frenzy-badge">⚡ BLACKOUT FRENZY</span><span class="blackout-timer">${rem.toFixed(1)}s</span></div><div class="blackout-meter"><i style="width:${pct}%"></i></div><div class="blackout-sub">True Form attacks active · 1.5s reaction rate per runner</div></div>`;
 }
 if(inLockout){
  const rem = Math.max(0, (b.blackoutLockoutUntil||0) - b.time);
  const pct = Math.min(100, Math.max(0, ((8.0 - rem) / 8.0) * 100));
  return `<div class="blackout-banner state-lockout"><div class="blackout-header"><span class="blackout-badge lockout-badge">🔒 BLACKOUT LOCKOUT</span><span class="blackout-timer">${rem.toFixed(1)}s</span></div><div class="blackout-meter"><i style="width:${pct}%"></i></div><div class="blackout-sub">Taboos suppressed · Grace period cooling down (${rem.toFixed(1)}s remaining)</div></div>`;
 }
 // Two-sided gauge: left half fills toward Lights On (Order), right half toward Blackout (Chaos).
 const side = gauge < 0 ? 'order' : 'chaos', pct = Math.abs(gauge) / 2;
 const statusMsg = gauge <= -80 ? '☀ Lights On is close' : gauge >= 80 ? '⚠️ Next taboo violation triggers Blackout!' : 'Order pushes left · Chaos pushes right · crossing the middle flickers the lights';
 return `<div class="blackout-banner state-ready"><div class="blackout-header"><span class="blackout-badge ready-badge">☀ ORDER ↔ CHAOS ☾</span><span class="blackout-counter">${gauge > 0 ? '+' : ''}${Math.round(gauge)}</span></div><div class="blackout-meter gauge"><i class="${side}" style="width:${pct}%"></i></div><div class="blackout-sub">${statusMsg}${b.caseFiles ? ` · Case Files ${b.caseFiles}/6` : ''}</div></div>`;
}
export function bloodlineTrialHUDHTML(b){const t=b?.bloodlineTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Bloodline Mythic';if(t.status==='active')return `<div class="bloodline-trial-hud active"><div class="urban-trial-head"><b>♜ ANCESTRAL ASCENSION TRIAL</b><span>${CARD[t.relicId]?.name||'Ancestral Relic'} · ${t.nodeType.toUpperCase()}</span></div><p>Clear this Elite/Boss node with zero runner leaks to awaken ${name}. Any leak removes the Tier 3 Bloodline and its relic.</p></div>`;if(t.status==='passed')return `<div class="bloodline-trial-hud passed"><b>✦ ANCESTRAL TRIAL PASSED</b><span>${name} awakened · relic consumed</span></div>`;return `<div class="bloodline-trial-hud failed"><b>♜ ANCESTRAL TRIAL FAILED</b><span>${t.reason||'A runner leaked'} · Tier 3 Bloodline and relic removed</span></div>`}
export function urbanLegendTrialHUDHTML(b){const t=b?.urbanLegendTrial;if(!t)return '';const dev=b.units.find(u=>u.uid===t.devourerUid);const name=dev?CARD[dev.id]?.name:'Urban Legend';if(t.status==='active')return `<div class="urban-legend-trial-hud active"><div class="urban-trial-head"><b>☒ FOLKLORE MERGER TRIAL · ${name}</b><span>80+ Violations · +${Number(t.inheritedAtk||0).toFixed(1)} inherited ATK</span></div><p>Same-lineage prey (45+ Violations) was consumed at trial start. Clear this Elite/Boss node with zero runner leaks to earn Mythic. Any leak removes the devourer from the roster.</p></div>`;if(t.status==='passed')return `<div class="urban-legend-trial-hud passed"><b>✦ ZERO-LEAK TRIAL PASSED</b><span>${CARD[t.apexId]?.name||'Mythic Urban Legend'} awakened · +${Number(t.inheritedAtk||0).toFixed(1)} ATK inherited</span></div>`;return `<div class="urban-legend-trial-hud failed"><b>☒ FOLKLORE TRIAL FAILED</b><span>${t.reason||'A runner leaked'} · devourer removed; prey was consumed</span></div>`}
export function urbanContainmentHUDHTML(b){const t=b?.urbanContainmentTrial;if(!t)return '';const zero=b.enemies.find(e=>e.uid===t.subjectZeroUid);if(t.status==='active'&&t.subjectZeroContained)return `<div class="urban-trial-hud active"><div class="urban-trial-head"><b>☒ SUBJECT ZERO CONTAINED</b><span>Zero-leak clear required</span></div><p>The containment feat is complete. Clear this Elite/Boss node with no runner leaks to bind the Relic into ${CARD[t.apexId]?.name||'its Mythic form'}; any leak removes the Rule Enforcer and Relic.</p></div>`;if(t.status==='active'){const marks=zero?.ruleMarks||0,hp=zero?Math.max(0,Math.ceil(zero.hp)).toLocaleString():'—',max=zero?zero.maxHp.toLocaleString():'—';return `<div class="urban-trial-hud active"><div class="urban-trial-head"><b>☒ SUBJECT ZERO CONTAINMENT</b><span>${marks}/5 Citations · ${hp}/${max} HP</span></div><p>Cite Subject Zero five times, then defeat it before it reaches the exit. Its escape or an under-marked kill permanently removes the Rule Enforcer and Relic. After containment, finish the Elite/Boss with zero leaks to earn Mythic.</p></div>`}if(t.status==='passed')return `<div class="urban-trial-hud passed"><b>✦ SUBJECT ZERO CONTAINED</b><span>${CARD[t.apexId]?.name||'Mythic Authority'} awakened · Relic consumed</span></div>`;return `<div class="urban-trial-hud failed"><b>☒ CONTAINMENT FAILED</b><span>${t.reason||'Trial failed'} · Rule Enforcer and Relic removed</span></div>`}
export function cosmicTrialHUDHTML(b){const t=b?.cosmicTrial;if(!t){if(!b?.units.some(u=>!u.removed&&CARD[u.id]?.genre==='Lovecraft'))return '';const p=Game.pages(b.run);return `<div class="cosmic-trial-hud active"><div class="urban-trial-head"><b>◈ FORBIDDEN PAGES</b><span>${p.length}/6 · ${b.metrics.insane||0} INSANE</span></div><p>${p.map(s=>s.toUpperCase()).join(' · ')||'No pages yet. Blind Astrologers write them.'}</p></div>`}const name=CARD[t.apexId]?.name||'Cosmic Mythic',pct=Math.min(100,t.insane/t.need*100);if(t.status==='active'||t.status==='proven')return `<div class="cosmic-trial-hud active"><div class="urban-trial-head"><b>◈ THE SUMMONING</b><span>${t.nodeType.toUpperCase()} · ${t.insane}/${t.need} INSANE</span></div><div class="blackout-meter"><i style="width:${pct}%"></i></div><p>${t.status==='proven'?`Complete. ${name} manifests when the battle ends.`:`Drive runners Insane (a Boss counts 3) to summon ${name}.`}</p></div>`;if(t.status==='passed')return `<div class="cosmic-trial-hud passed"><b>✦ THE SUMMONING</b><span>${name} manifested</span></div>`;return `<div class="cosmic-trial-hud failed"><b>THE SUMMONING FAILED</b><span>${t.reason||''} · nothing was lost</span></div>`}
export function xenoTrialHUDHTML(b){const t=b?.xenoTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Xeno-Leviathan';if(t.status==='active')return `<div class="xeno-trial-hud active"><div class="urban-trial-head"><b>⬡ METAMORPHOSIS · COCOON</b><span>${t.pair.split('+').join(' + ')} · hatches in ${Math.max(0,t.hatchAt-b.time).toFixed(1)}s</span></div><p>Hold the line: no leaks for 15s and the chrysalis hatches into ${name} mid-battle. A leak cracks the cocoon; it tries again next Elite/Boss.</p></div>`;if(t.status==='passed')return `<div class="xeno-trial-hud passed"><b>✦ HATCHED</b><span>${name} emerged mid-battle</span></div>`;return `<div class="xeno-trial-hud failed"><b>⬡ COCOON CRACKED</b><span>${t.reason||'A runner leaked'} · the chrysalis will try again</span></div>`}
