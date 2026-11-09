'use strict';
const Game = (() => {
 const D = typeof module !== 'undefined' ? require('./data.js') : { CARD, CARDS, LEADERS, RELICS };
 const card = id => D.CARD[id];
 const mod = (r, k, base = 1) => D.LEADERS.find(l => l.id === r.leader)?.mods?.[k] ?? base;
 const tier = id => ['Normal', 'Rare', 'Epic', 'Legendary', 'Mythic'].indexOf(card(id).rarity);
 const xy = s => ({ x: s % 3, y: Math.floor(s / 3) }), isCenter = (x, y) => x === 1 && y === 1, isCorner = (x, y) => x !== 1 && y !== 1, isEdge = (x, y) => (x === 1) !== (y === 1), sharesRowOrCol = (a, b) => a.x === b.x || a.y === b.y;
 const kind = s => s === 4 ? 'center' : [0, 2, 6, 8].includes(s) ? 'corner' : 'edge';
 const adjacent = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
 function rand(r) { r.seed = (Math.imul(r.seed, 1664525) + 1013904223) >>> 0; return r.seed / 4294967296 }
 function shuffle(r, a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { let j = Math.floor(rand(r) * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
 function instance(r, id) { return { uid: ++r.uid, id, permanentAtkBonus: 0, threshold: 0 } }
 function newRun(leader, meta = {}, seed = Date.now() >>> 0) {
  const r = { version: 3, leader, seed, uid: 0, roster: [], health: 100 + (meta.vitality || 0) * 5 + (D.LEADERS.find(l => l.id === leader)?.mods?.health || 0), maxHealth: 100 + (meta.vitality || 0) * 5 + (D.LEADERS.find(l => l.id === leader)?.mods?.health || 0), legacyPower: (meta.power || 0) * .02, phase: 'draft', draftReason: 'first', coins: 0, depth: -1, lane: 1, visited: [], relics: [], cleared: 0, stats: { kills: 0, leaks: 0, growth: 0 }, map: [] };
  for (let row = 0; row < 16; row++) {
   r.map.push(Array.from({ length: row === 15 ? 1 : 3 }, (_, lane) => {
    let type = 'battle';
    if (row === 15) type = 'boss';
    else if (row > 1) {
     let n = rand(r);
     type = [3, 7, 11].includes(row) ? ['rest', 'cache', 'event'][(lane + Math.floor(n * 3)) % 3] : n < .28 ? 'elite' : 'battle'
    }
    if ([3, 7, 11].includes(row) && lane === 1) type = 'workshop';
    return { id: `${row}-${lane}`, row, lane: row === 15 ? 1 : lane, type }
   }))
  }
  r.offers = offers(r, true); return r;
 }
 function rewardWeights(r, first = false) { let stage = first ? 1 : Math.min(16, r.depth + 2), elite = !first && r.node?.type === 'elite'; return stage < 5 ? [72, 28, 0, 0, 0] : stage < 10 ? (elite ? [40, 40, 20, 0, 0] : [55, 35, 10, 0, 0]) : elite ? [35, 35, 24, 6, 0] : [50, 32, 15, 3, 0] }
 function offers(r, first = false, exclude = []) {
  let weights = rewardWeights(r, first), pool = D.CARDS.filter(c => !c.retired && (!first || c.baseAtk > 0) && weights[tier(c.id)] > 0 && !exclude.includes(c.id)), out = [];
  while (out.length < 3 && pool.length) {
   const available = weights.map((w, i) => pool.some(c => tier(c.id) === i) ? w : 0);
   let roll = rand(r) * available.reduce((a, v) => a + v, 0), chosen = 0;
   for (let i = 0; i < available.length; i++) { roll -= available[i]; if (roll < 0) { chosen = i; break } }
   let options = pool.filter(c => tier(c.id) === chosen), genre = D.LEADERS.find(l => l.id === r.leader)?.genre;
   let total = options.reduce((n, c) => n + (c.genre === genre ? 1.5 : 1), 0), pickRoll = rand(r) * total, pick = options[options.length - 1];
   for (const c of options) { pickRoll -= c.genre === genre ? 1.5 : 1; if (pickRoll < 0) { pick = c; break } }
   out.push(pick.id); pool = pool.filter(c => c.id !== pick.id)
  }
  return out;
 }

 function draft(r, id) { if (r.phase !== 'draft' || !r.offers.includes(id)) return false; r.roster.push(instance(r, id)); r.offers = []; r.phase = r.depth === 15 ? 'won' : 'map'; return true }
 function available(r) { if (r.phase !== 'map') return []; return (r.map[r.depth + 1] || []).filter(n => r.depth < 0 || n.row === 15 || Math.abs(n.lane - r.lane) <= 1) }
 function chooseNode(r, id) { const n = available(r).find(n => n.id === id); if (!n) return false; r.depth = n.row; r.lane = n.lane; r.node = n; r.visited.push(id); r.phase = ['battle', 'elite', 'boss'].includes(n.type) ? 'ready' : 'event'; return true }
 function skipDraft(r) { if (r.phase !== 'draft' || r.draftReason === 'first') return false; r.offers = []; r.phase = r.depth === 15 ? 'won' : 'map'; return true }
 function rerollDraft(r) { if (r.phase !== 'draft' || (r.coins || 0) < 10) return false; const next = offers(r, r.draftReason === 'first', r.offers); if (next.length !== 3) return false; r.coins -= 10; r.offers = next; return true }

 function reward(r) { r.draftRerolls = 0; r.phase = 'draft'; r.draftReason = 'reward'; r.offers = offers(r) }
 function addRelic(r, id) { if (r.relics.includes(id)) return; r.relics.push(id); if (id === 'heart') { r.maxHealth += 20; r.health = Math.min(r.maxHealth, r.health + 10) } }
 function base(u) { return card(u.id).baseAtk + (u.permanentAtkBonus || 0) }

 // Ripperdoc Matrix: two locked hardware sockets; thermal/RAM state is battle-only.
 const CYBER_MATRIX={mantisImplant:{sandyOS:'chronoPhantom',berserkOS:'thermalRipper',cyberdeckOS:'glitchAssassin'},gorillaImplant:{sandyOS:'gravitonColossus',berserkOS:'juggernautSmasher',cyberdeckOS:'empBreaker'},monowireImplant:{sandyOS:'razorPhantom',berserkOS:'plasmaTempest',cyberdeckOS:'networkReaper'}};
 const CYBER_APEX=Object.values(CYBER_MATRIX).flatMap(Object.values);
 const isCyber=u=>family(u)==='cyberSolo';
 const cyberApex=u=>CYBER_APEX.includes(u.id);
 const augmented=u=>isCyber(u)&&!!(u.arm||u.os);
 const hasAccess=(b,u)=>neighbors(b,u).some(v=>v.id==='accessPoint');
 const ramCapacity=(b,u)=>hasAccess(b,u)?12:8;
 const berserkActive=u=>isCyber(u)&&!cyberApex(u)&&u.os==='berserkOS'&&(u.heat||0)>=80&&u.state==='active';
 function updateCyber(b,u){
  if(!isCyber(u)||token(u)||u.removed)return;
  if(!cyberApex(u)){
   const id=(u.chrome||0)>=65?'eliteSolo':(u.chrome||0)>=25?'chromedSolo':'cyberSolo';if(u.id!==id)evolve(b,u,id);
   if((u.chrome||0)>=120&&b.run.depth>=9&&CYBER_MATRIX[u.arm]?.[u.os]){
    const reactor=neighbors(b,u).find(v=>v.id==='cyberReactor'&&!token(v));
    if(reactor){const apex=CYBER_MATRIX[u.arm][u.os];consume(b,u,reactor,'Military Reactor Binding',0);evolve(b,u,apex);u.sandyUntil=0;}
   }
  }persist(b,u);
 }
 function installChrome(b,module){
  const socket=card(module.id)?.cyberModule;if(!socket||module.removed||token(module))return false;
  const u=neighbors(b,module).filter(v=>isCyber(v)&&!token(v)&&!v[socket]).sort((a,z)=>a.uid-z.uid)[0];if(!u)return false;
  u[socket]=module.id;consume(b,u,module,'Chrome Installation',0);persist(b,u);updateCyber(b,u);return true;
 }
 function addChromeAttack(b,u){u.chromeAttackCharge=(u.chromeAttackCharge||0)+1;if(u.chromeAttackCharge>=4){u.chrome=(u.chrome||0)+1;u.chromeAttackCharge-=4;}persist(b,u);updateCyber(b,u);}
 function addRAM(b,u,n){u.ram=Math.min(ramCapacity(b,u),(u.ram||0)+n);}
 function cyberPoison(b,u,e,dps=24,seconds=4){
  if(e.gone||e.hp<=0)return;e.venoms??=[];
  // One Contagion per owner per victim; refresh instead of multiplying from viral kills.
  e.venoms=e.venoms.filter(d=>d.cyberOwner!==u.uid);venom(b,e,dps,seconds,u);e.venoms.at(-1).cyberOwner=u.uid;
 }
 function uploadHack(b,u){
  if(u.os!=='cyberdeckOS'||u.state!=='active'||b.time<(u.hackUploadAt??0)||(u.ram||0)<3||!living(b).length)return false;
  u.ram-=3;u.hackUploadAt=b.time+(u.id==='networkReaper'?1.5:3);
  const target=living(b)[0],contagion=u.id!=='networkReaper'&&(u.hackIndex||0)%2===1;u.hackIndex=(u.hackIndex||0)+1;
  if(contagion){for(const e of living(b).slice(0,3))cyberPoison(b,u,e,24+rawAtk(u)*.25,4);}
  else trueHit(b,u,target,220+3*rawAtk(u));
  fx(b,'spell',u,target,contagion?'CONTAGION · −3 RAM':'SHORT CIRCUIT · −3 RAM');return true;
 }
 function cyberDeath(b,e){
  if(!e.viralOwner||e.viralExploded||!(e.bleeds||[]).some(d=>d.until>b.time))return;
  const u=b.units.find(v=>!v.removed&&v.uid===e.viralOwner&&v.id==='glitchAssassin');if(!u)return;
  e.viralExploded=true;for(const v of living(b).filter(v=>wallOf(v)===wallOf(e)))cyberPoison(b,u,v,24,4);
  b.metrics.viralExplosions=(b.metrics.viralExplosions||0)+1;fx(b,'spell',u,e,'VIRAL WALL');
 }
 function cyberZone(b,u,type,p,dps){b.cyberZones??=[];const wall=wallOf({p}),old=b.cyberZones.find(z=>z.owner===u.uid&&z.wall===wall&&z.until>b.time);b.cyberZones=b.cyberZones.filter(z=>z.owner!==u.uid);b.cyberZones.push({owner:u.uid,type,wall,dps,until:b.time+4,shredAt:old?.shredAt??b.time+1});}
 function clearSprint(e){e.speedBoostUntil=0;if(e.baseSpeed!=null)e.speed=e.baseSpeed;else if(e.swift&&!e.cyberSprintSuppressed&&!e.steamSuppressed){e.speed/=1.6;e.cyberSprintSuppressed=true;}}
 function cyberAttack(b,u,target,power){
  const overdrive=berserkActive(u),wall=wallOf(target),truePower=power/mod(b.run,'basicDamage');
  let targets=[target];
  if(u.id==='thermalRipper')targets=living(b).slice(0,4);
  else if(u.id==='razorPhantom')targets=living(b).slice(0,8);
  else if(u.id==='empBreaker')targets=living(b).filter(e=>inArc(e,arcTiles(target.p,6)));
  else if(u.arm==='mantisImplant')targets=[target,...living(b).filter(e=>e!==target).slice(0,2)];
  else if(u.arm==='monowireImplant')targets=living(b).filter(e=>wallOf(e)===wall).slice(0,5);
  for(const [i,e] of targets.entries()){
   if(e.gone)continue;
   const mantis=u.arm==='mantisImplant',gorilla=u.arm==='gorillaImplant',wire=u.arm==='monowireImplant';
   if(mantis){dot(b,e,'bleed',8,4,u);if(u.id==='glitchAssassin')e.viralOwner=u.uid;}
   if(gorilla)armorStrip(e,u.id==='juggernautSmasher'?1:.4);
   if(wire||u.id==='empBreaker')e.shield=0;
   if(u.id==='empBreaker')clearSprint(e);
   const scale=mantis&&u.id!=='thermalRipper'&&i>0?.5:1;
   const n=(u.id==='thermalRipper'?truePower:overdrive?truePower*2:power)*scale;
   hit(b,u,e,n,true,{ignoreArmor:overdrive||u.id==='thermalRipper',armorFactor:wire?.5:1});
   if(u.id==='networkReaper')addRAM(b,u,1);
   if(gorilla&&u.attackCount%4===0)status(b,e,'stun',1,0,u);
   if(u.id==='chronoPhantom'&&e.hp>0&&!e.boss&&!e.champion&&e.hp/e.maxHp<executeThreshold(b))damage(b,e,e.hp,u,'ability');
   if(u.id==='juggernautSmasher'&&u.attackCount%3===0&&(e.boss||e.champion)&&e.hp>0)damage(b,e,e.hp*.15,u,'ability',true);
  }
  if(overdrive)for(const e of living(b).filter(e=>wallOf(e)===wall)){e.burns=e.burns.filter(d=>d.berserkOwner!==u.uid);dot(b,e,'burn',12,2,u);e.burns.at(-1).berserkOwner=u.uid;}
  if(u.id==='thermalRipper')cyberZone(b,u,'slag',target.p,50);
  if(u.id==='plasmaTempest')cyberZone(b,u,'plasma',target.p,40);
  if(u.id==='gravitonColossus'&&b.time>=(u.gravityAt||0)){
   u.gravityAt=b.time+4;status(b,target,'freeze',2,0,u);
   for(const e of living(b).filter(e=>e!==target&&Math.abs(e.p-target.p)<=2)){if(e.p>target.p)warp(b,e,Math.min(2,e.p-target.p),u);else if(!e.boss&&!e.champion)e.p=Math.min(target.p,e.p+2);status(b,e,'freeze',2,0,u);}
   fx(b,'spell',u,target,'GRAVITY WELL');
  }
  if(u.os==='sandyOS'&&!cyberApex(u)){
   if((u.sandyUntil||0)<=b.time){u.sandyCharge=(u.sandyCharge||0)+1;if(u.sandyCharge>=8){u.sandyCharge=0;u.sandyUntil=b.time+3.5;}}
  }
  if(u.os==='cyberdeckOS'&&u.id!=='networkReaper'){
   u.ramAttacks=(u.ramAttacks||0)+1;const threshold=hasAccess(b,u)?2:3;
   if(u.ramAttacks>=threshold){u.ramAttacks-=threshold;addRAM(b,u,1);}
  }
  u.heat=(u.heat||0)+(u.os==='berserkOS'?14:8);
  if(u.heat>=100){u.heat=40;u.sandyUntil=0;flip(b,u,'overheat',3);fx(b,'state',u,null,'THERMAL SHUTDOWN');}
  addChromeAttack(b,u);uploadHack(b,u);
 }
 function pumpWall(u){const d=[u.y,2-u.x,2-u.y,u.x];return d.indexOf(Math.min(...d));}
 function cyberExtras(b,u,dt){
  if(card(u.id)?.cyberModule){installChrome(b,u);return;}
  if(isCyber(u)){
   u.heat=Math.max(0,(u.heat||0)-(4+(neighbors(b,u).some(v=>v.id==='vent')?15:0))*dt);
   u.ram=Math.min(u.ram||0,ramCapacity(b,u));updateCyber(b,u);uploadHack(b,u);
  }
  if(u.id==='cryoPump'&&b.time>=(u.pumpAt??6)){
   u.pumpAt=b.time+6;for(const v of neighbors(b,u).filter(isCyber))v.heat=Math.max(0,(v.heat||0)-40);
   for(const e of living(b).filter(e=>wallOf(e)===pumpWall(u)))status(b,e,'freeze',2,0,u);
   fx(b,'state',u,null,'COOLANT PURGE');
  }
  if(u.id==='biomonitor'&&b.time>=(u.monitorAt??1)){
   u.monitorAt=b.time+1;const ns=neighbors(b,u).filter(isCyber);
   if(ns.length>1){const mean=ns.reduce((n,v)=>n+(v.heat||0),0)/ns.length;for(const v of ns)v.heat=mean;}
  }
 }
 function tickCyber(b,dt){
  const sources=b.units.filter(u=>!u.removed&&isCyber(u));
  const slowPower=sources.some(u=>!cyberApex(u)&&u.sandyUntil>b.time)?.5:sources.some(u=>u.id==='chronoPhantom')?.4:0;
  if(slowPower)for(const e of living(b)){
   const power=slowPower*((e.boss||e.champion)?.5:1),s=e.slows.find(s=>s.cyberTime);
   if(s){s.until=b.time+.2;s.power=power;}else{status(b,e,'slow',.2,slowPower,sources[0]);const added=e.slows.find(s=>s.power===power);if(added)added.cyberTime=true;}
  }
  b.cyberZones=(b.cyberZones||[]).filter(z=>z.until>b.time&&sources.some(u=>u.uid===z.owner));
  for(const z of b.cyberZones){const u=sources.find(u=>u.uid===z.owner),shred=z.type==='plasma'&&b.time>=z.shredAt;
   for(const e of living(b).filter(e=>wallOf(e)===z.wall)){trueHit(b,u,e,z.dps*dt);if(shred)armorStrip(e,Math.min(1,(e.permanentShred||0)+.1));}
   if(shred)z.shredAt=b.time+1;
  }
 }

 // Arcane Loom: pair counters persist; battlefield statuses, mana and terrain do not.
 const ARCANE_PAIRS={'earth+fire':'magmaLord','fire+wind':'tempestArchon','fire+water':'steamSovereign','earth+water':'quagmireColossus','water+wind':'blizzardArchon','earth+wind':'sandstormTitan'};
 const arcanePair=(a,z)=>[a,z].sort().join('+');
 const isApprentice=u=>family(u)==='elementalApprentice';
 const isArchon=u=>Object.values(ARCANE_PAIRS).includes(u.id);
 const isElemental=u=>!!card(u.id).element||isApprentice(u);
 const arcaneGauge=u=>isElemental(u)&&!isArchon(u);
 function bestPair(u){return Object.keys(ARCANE_PAIRS).sort((a,z)=>(u.synthesis?.[z]||0)-(u.synthesis?.[a]||0))[0];}
 function updateApprentice(b,u){
  if(!isApprentice(u)||isArchon(u)||u.removed||token(u))return;
  const pair=bestPair(u),p=u.synthesis?.[pair]||0,id=p>=20?'elementalMaster':p>=10?'elementalAdept':'elementalApprentice';
  if(id!==u.id)evolve(b,u,id);
  if(p>=30&&b.run.depth>=9)startArcaneTrial(b);
  persist(b,u);
 }
 function receiveEssence(b,u,element){
  if(!isApprentice(u)||isArchon(u)||token(u)||u.removed)return;
  u.essences??=[];const i=u.essences.findIndex(e=>e!==element);
  if(i<0)u.essences.push(element);
  else {const other=u.essences.splice(i,1)[0],pair=arcanePair(other,element);u.synthesis??={};u.synthesis[pair]=(u.synthesis[pair]||0)+1;interact(b,u,u,'synthesis',pair+' · +1 synthesis');updateApprentice(b,u);}
  persist(b,u);
 }
 function storeOverflow(b,u,amount){
  if(amount<=0||b.batteryDischarging)return false;
  const battery=b.units.find(v=>!v.removed&&v.id==='manaBattery'&&(v.manaStored||0)<32);if(!battery)return false;
  const stored=Math.min(amount,32-(battery.manaStored||0));battery.manaStored=(battery.manaStored||0)+stored;u.threshold.current-=stored;return true;
 }
 function elementalLinks(b,u){
  const element=card(u.id).element;
  if(element)for(const v of neighbors(b,u))receiveEssence(b,v,element);
  // Choose only one ready Prism for this spell; lock before generating charge.
  const prism=neighbors(b,u).find(v=>v.id==='elementalPrism'&&b.time>=(v.prismAt||0));
  if(prism){prism.prismAt=b.time+1;for(const v of neighbors(b,prism).filter(v=>abilityGauge(v)))tick(b,v,2,prism);interact(b,u,prism,'refraction','PRISM · +2 adjacent gauge');}
 }
 function arcaneReaction(b,u,e,element){
  if(e.gone||e.hp<=0)return;
  e.elements??={};const other=Object.keys(e.elements).find(k=>k!==element&&e.elements[k]>b.time);
  // Each application is consumed by at most one reaction; reaction effects never reapply elements.
  if(!other){e.elements[element]=b.time+4;return;}
  delete e.elements[other];delete e.elements[element];const pair=arcanePair(other,element);
  if(pair==='fire+water')trueHit(b,u,e,(e.maxHp-e.hp)*.15);
  if(pair==='earth+fire')armorStrip(e,1);
  if(pair==='fire+wind'){
   const burns=(e.burns||[]).filter(d=>d.until>b.time&&!d.spreadCopy);
   const distance=v=>Math.min(Math.abs(v.p-e.p),16-Math.abs(v.p-e.p));
   for(const v of living(b).filter(v=>v!==e).sort((a,z)=>distance(a)-distance(z)).slice(0,2))v.burns.push(...burns.map(d=>({...d,spreadCopy:true})));
  }
  if(pair==='earth+water'){for(const slow of e.slows)if(slow.until>b.time)slow.until=b.time+Math.min(6,(slow.until-b.time)*2);status(b,e,'freeze',1.5,0,u);}
  if(pair==='water+wind')status(b,e,'freeze',2,0,u);
  if(pair==='earth+wind')dot(b,e,'bleed',30,4,u);
  b.metrics.elementalReactions=(b.metrics.elementalReactions||0)+1;
  const trial=b.arcaneTrial;
  if(trial?.status==='active'&&trial.pair===pair&&(e.elite||e.champion||e.boss)&&!trial.featDone){
   trial.featDone=true;trial.featAt=b.time;
   b.metrics.arcaneTrial={...b.metrics.arcaneTrial,featDone:true,featAt:b.time,targetType:e.boss?'Boss':e.champion?'Harbinger':'Elite'};
   interact(b,u,e,'arcane-trial-feat',`${pair} reaction proved against a priority target`);
   fx(b,'growth',u,e,'ARCANE REACTION PROVED');
  }
  fx(b,'spell',u,e,pair.toUpperCase());
 }
 function elementalSpell(b,u){
  const target=living(b)[0];if(!target)return;
  const element=card(u.id).element,p=rawAtk(u);
  if(!element){const points=u.synthesis?.[bestPair(u)]||0;for(const e of living(b).slice(0,4))hit(b,u,e,120+6*p+8*points,false);}
  else{
   const targets=element==='water'?living(b).slice(0,4):[target];
   for(const e of targets){
    const n=element==='fire'?200+8*p:element==='water'?100+6*p:element==='earth'?250+10*p:100+5*p;
    hit(b,u,e,n,false);if(e.gone)continue;
    if(element==='fire')dot(b,e,'burn',8,4,u);
    if(element==='water')status(b,e,'slow',3,.35,u);
    if(element==='earth'){armorStrip(e,.4);status(b,e,'stun',1,0,u);}
    if(element==='wind')warp(b,e,2,u);
    arcaneReaction(b,u,e,element);
   }
   if(element==='wind')for(const v of neighbors(b,u).filter(isElemental))v.arcaneHasteUntil=b.time+3;
  }
  elementalLinks(b,u);
 }
 function arcaneZone(b,u,type,p,duration,dps){
  b.arcaneZones??=[];b.arcaneZones=b.arcaneZones.filter(z=>z.owner!==u.uid);
  b.arcaneZones.push({owner:u.uid,type,wall:wallOf({p}),until:b.time+duration,dps});
 }
 function archonAttack(b,u,target,power){
  if(u.id==='magmaLord'){
   for(const e of living(b).filter(e=>Math.abs(e.p-target.p)<=1)){armorStrip(e,1);hit(b,u,e,power*(priority(e)?3:1));}
   arcaneZone(b,u,'magma',target.p,5,60);
  }else if(u.id==='steamSovereign'){
   hit(b,u,target,power);target.elements??={};target.elements.water=b.time+4;
   trueHit(b,u,target,(target.maxHp-target.hp)*.2);
   if(u.attackCount%5===0&&(target.boss||target.champion))damage(b,target,target.hp*.12,u,'ability');
  }else if(u.id==='sandstormTitan'&&u.attackCount%3===0){for(const e of living(b).slice(0,5))hit(b,u,e,power);}
  else{
   hit(b,u,target,power);
   if(u.id==='quagmireColossus'&&!b.arcaneZones?.some(z=>z.owner===u.uid))arcaneZone(b,u,'swamp',target.p,Infinity,45);
   if(u.id==='tempestArchon'&&u.attackCount%4===0){b.cyclones??=[];b.cyclones=b.cyclones.filter(c=>c.owner!==u.uid);b.cyclones.push({owner:u.uid,p:target.p,until:b.time+4,caught:[]});}
  }
 }
 function arcaneExtras(b,u){
  updateApprentice(b,u);
  if(u.id==='manaBattery'&&b.time>=(u.batteryAt??6)){
   u.batteryAt=b.time+6;
   const v=b.units.filter(v=>!v.removed&&arcaneGauge(v)&&v.threshold.current<v.threshold.max).sort((a,z)=>a.threshold.current/a.threshold.max-z.threshold.current/z.threshold.max||a.uid-z.uid)[0];
   if(v&&(u.manaStored||0)>0){const amount=Math.min(u.manaStored,v.threshold.max-v.threshold.current);u.manaStored-=amount;b.batteryDischarging=true;try{tick(b,v,amount/mod(b.run,'gauge'),u);}finally{b.batteryDischarging=false;}interact(b,u,v,'mana-surge','STORED MANA DISCHARGED');}
  }
  if(u.id==='blizzardArchon'&&b.time>=(u.blizzardAt??5)){
   u.blizzardAt=b.time+5;
   for(const e of living(b)){if((e.boss||e.champion)&&e.enraged)continue;status(b,e,'freeze',2.5,0,u);e.iceShatters??=[];e.iceShatters.push({owner:u.uid,at:b.time+((e.boss||e.champion)?1.25:2.5)});}
  }
  if(u.id==='sandstormTitan'&&b.time>=(u.sandAt??1)){
   u.sandAt=b.time+1;
   for(const e of living(b)){armorStrip(e,Math.min(1,(e.permanentShred||0)+.1));if(e.defense<=1e-9){e.bleeds=e.bleeds.filter(d=>d.sandOwner!==u.uid);dot(b,e,'bleed',40,4,u);e.bleeds.at(-1).sandOwner=u.uid;}}
  }
 }
 function tickArcane(b,dt){
  const steam=b.units.some(u=>!u.removed&&u.id==='steamSovereign');
  for(const e of living(b)){
   if(steam){e.speedBoostUntil=0;if(e.baseSpeed!=null)e.speed=e.baseSpeed;else if(e.swift&&!e.steamSuppressed){e.speed/=1.6;e.steamSuppressed=true;}}
   for(const ice of e.iceShatters||[])if(!ice.done&&b.time>=ice.at){ice.done=true;const u=b.units.find(u=>!u.removed&&u.uid===ice.owner);if(u)warp(b,e,3,u);}
   e.iceShatters=(e.iceShatters||[]).filter(i=>!i.done);
  }
  b.arcaneZones=(b.arcaneZones||[]).filter(z=>z.until>b.time&&b.units.some(u=>!u.removed&&u.uid===z.owner));
  for(const z of b.arcaneZones){const u=b.units.find(u=>u.uid===z.owner);for(const e of living(b).filter(e=>wallOf(e)===z.wall)){trueHit(b,u,e,z.dps*dt);if(z.type==='swamp'){let slow=e.slows.find(s=>s.swampOwner===u.uid);if(slow)slow.until=b.time+.2;else{status(b,e,'slow',.2,.6,u);slow=e.slows.find(s=>s.sourceUid===u.uid);if(slow)slow.swampOwner=u.uid;}}}}
  b.cyclones=(b.cyclones||[]).filter(c=>c.until>b.time&&b.units.some(u=>!u.removed&&u.uid===c.owner));
  for(const c of b.cyclones){const u=b.units.find(u=>u.uid===c.owner);c.p=(c.p+2*dt)%16;
   for(const e of living(b)){const dist=Math.min(Math.abs(e.p-c.p),16-Math.abs(e.p-c.p));if(dist<1&&!e.boss&&!e.champion&&!c.caught.includes(e.uid)&&c.caught.length<6)c.caught.push(e.uid);
    if(c.caught.includes(e.uid)){// Carry never wraps a runner past the exit or moves a boss.
     e.p=Math.min(15.95,e.p+2*dt);trueHit(b,u,e,35*dt);
    }else if(dist<1)trueHit(b,u,e,35*dt);
   }
  }
 }
 function arcaneKill(b){for(const u of b.units.filter(u=>!u.removed&&u.id==='tempestArchon')){u.tempestKills=(u.tempestKills||0)+1;if(u.tempestKills%10===0){u.permanentSpeed=(u.permanentSpeed||0)+.05;persist(b,u);}}}

 // Eclipse Hunt: trophies occupy real cells; only forged relics survive battles.
 const HUNT_APEX=['dragonSlayer','witcherGrandmaster','bloodDrunkHunter'];
 const HUNT_RELICS={beast:'beastRelic',fiend:'fiendRelic',witch:'witchRelic'};
 const HUNT_BIND={beastRelic:'bloodDrunkHunter',fiendRelic:'dragonSlayer',witchRelic:'witcherGrandmaster'};
 const isSlayer=u=>family(u)==='mercenary';
 const isHunter=u=>isSlayer(u)||['witchHunter','executioner'].includes(u.id);
 const priority=e=>!!(e.elite||e.boss||e.champion||e.alphaQuarry);
 const trophyFamily=u=>card(u.id)?.trophyFamily||u.mountedHead||null;
 const huntAura=(b,u,f)=>neighbors(b,u).some(v=>trophyFamily(v)===f);
 const relicAura=(b,u,id)=>neighbors(b,u).some(v=>v.id===id);
 const executeThreshold=b=>b.run.huntEye?.35:.30;
 const wallOf=e=>Math.floor(((((e?.p??e)%16)+16)%16)/4);
 function huntArmor(b,e){
  if(!priority(e))return;
  e.originalDefense??=e.defense||0;e.huntArmor=Math.min(.3,b.run.huntArmor||0);
  e.defense=e.originalDefense*(1-(e.permanentShred||0))*(1-e.huntArmor);
 }
 function brandQuarry(b){
  if(b.alphaMarked||b.spawned<3||!b.units.some(u=>!u.removed&&u.id==='witchHunter'))return;
  const e=living(b).filter(e=>!priority(e)).sort((a,z)=>z.hp-a.hp||a.uid-z.uid)[0];
  if(!e)return;e.alphaQuarry=true;b.alphaMarked=true;huntArmor(b,e);
  fx(b,'state',null,e,'ALPHA QUARRY');
 }
 function updateSlayer(b,u){
  if(!isSlayer(u)||token(u)||u.removed||HUNT_APEX.includes(u.id))return;
  const p=u.trophyPoints||0,id=p>=100?'brandedBerserker':p>=60?'blackIronSlayer':p>=25?'oathboundHunter':'mercenary';
  if(u.id!==id)evolve(b,u,id);
  if(p>=100&&b.run.depth>=9){
   const relic=neighbors(b,u).find(v=>HUNT_BIND[v.id]&&!token(v));
   if(relic){const apex=HUNT_BIND[relic.id];consume(b,u,relic,'Trophy Relic Binding',0);evolve(b,u,apex);}
  }
  persist(b,u);
 }
 function trophyPoints(b,n){
  for(const u of b.units.filter(v=>!v.removed&&!token(v)&&isSlayer(v))){u.trophyPoints=(u.trophyPoints||0)+n;updateSlayer(b,u);}
 }
 function harvestTrophy(b,e){
  for(const u of b.units.filter(v=>!v.removed&&v.id==='dragonSlayer'&&v.huntWall===wallOf(e)))u.huntFrenzy=Math.min(.5,(u.huntFrenzy||0)+.05);
  if(!priority(e))return;
  const hunters=b.units.filter(u=>!u.removed&&!token(u)&&isHunter(u));
  if(!hunters.length)return;
  trophyPoints(b,3);
  const id=['beastSkull','fiendHorn','witchEye'][Math.floor(rand(b.run)*3)];
  let drop=null;for(const u of hunters){drop=spawnToken(b,u,id,true,{origin:id,tokenAtk:0,attackInterval:0});if(drop)break;}
  const k=drop?'trophiesHarvested':'trophiesLost';b.metrics[k]=(b.metrics[k]||0)+1;
  if(drop)fx(b,'state',drop,null,'GREATER TROPHY');
 }
 function forgeHuntRelic(b,u){
  for(const f of ['beast','fiend','witch']){
   const id=HUNT_RELICS[f];if((u.carvings?.[f]||0)<2||b.run.roster.some(v=>v.id===id))continue;
   const slot=[0,1,2,3,4,5,6,7,8].find(s=>!slotOccupied(b,s));if(slot==null)return;
   const src=instance(b.run,id);b.run.roster.push(src);const v=runtime(b,src,slot);prepareHooks(b,v);b.units.push(v);record(b,v);
   u.carvings[f]-=2;persist(b,u);b.metrics.huntForges=(b.metrics.huntForges||0)+1;
   interact(b,u,v,'forge','TROPHY RELIC FORGED');
  }
 }
 function carveTrophy(b,u){
  if(b.time<(u.carveAt??6))return false;
  const v=neighbors(b,u).find(v=>trophyFamily(v));if(!v)return false;
  const f=trophyFamily(v);u.carveAt=b.time+6;
  if(v.mountedHead){v.mountedHead=null;interact(b,u,v,'carve','MOUNTED HEAD CARVED');}
  else consume(b,u,v,'Trophy Carving',0);
  u.carvings??={};u.carvings[f]=(u.carvings[f]||0)+1;
  for(const h of neighbors(b,u).filter(v=>isHunter(v)&&!token(v)))growth(b,h,3);
  if(f==='beast'){
   const low=b.units.filter(v=>!v.removed&&!token(v)&&v!==u).sort((a,z)=>rawAtk(a)-rawAtk(z)||a.uid-z.uid)[0];if(low)growth(b,low,3);
  }else if(f==='fiend'){
   b.run.huntArmor=Math.min(.3,Math.round(((b.run.huntArmor||0)+.1)*10)/10);for(const e of living(b))huntArmor(b,e);
  }else b.run.huntEye=true;
  trophyPoints(b,10);persist(b,u);b.metrics.trophiesCarved=(b.metrics.trophiesCarved||0)+1;
  forgeHuntRelic(b,u);return true;
 }
 function huntExtras(b,u){
  if(u.id==='trophyStake'&&!u.mountedHead){const v=neighbors(b,u).find(v=>card(v.id)?.trophyFamily);if(v){u.mountedHead=trophyFamily(v);consume(b,u,v,'Mount Trophy',0);}}
  if(u.id==='taxidermist'){carveTrophy(b,u);forgeHuntRelic(b,u);}
  updateSlayer(b,u);
 }
 function visceral(b,e){
  if(e.gone||e.hp<=0||e.boss||e.champion||e.visceralDone||e.hp/e.maxHp>=executeThreshold(b))return;
  const mark=(e.bleeds||[]).find(d=>d.hemorrhage&&d.until>b.time);if(!mark)return;
  const u=b.units.find(u=>u.uid===mark.owner);if(!u)return;
  e.visceralDone=true;const wall=wallOf(e);damage(b,e,e.hp,u,'ability');
  for(const other of living(b).filter(v=>wallOf(v)===wall))trueHit(b,u,other,400);
  fx(b,'spell',u,e,'VISCERAL DECAPITATION');
 }
 function slayerAttack(b,u,target,power){
  if(u.id==='dragonSlayer'){
   u.huntWall=wallOf(target);
   for(const e of living(b).filter(e=>wallOf(e)===u.huntWall)){
    e.shield=0;e.speedBoostUntil=0;if(e.baseSpeed!=null)e.speed=e.baseSpeed;
    hit(b,u,e,power,true,{ignoreArmor:true});
    if(u.attackCount%3===0&&(e.boss||e.champion)&&e.hp>0)damage(b,e,e.hp*.15,u,'ability');
   }
  }else if(u.id==='witcherGrandmaster'){
   if(Math.floor((u.attackCount-1)/3)%2===0)hit(b,u,target,power,true,{criticalMultiplier:priority(target)?3:2});
   else for(const e of living(b).filter(e=>wallOf(e)===wallOf(target))){armorStrip(e,.5);hit(b,u,e,power);warp(b,e,3,u);}
  }else{
   hit(b,u,target,power);
   dot(b,target,'bleed',u.id==='bloodDrunkHunter'?40:3,4,u);
   if(u.id==='bloodDrunkHunter'&&target.hp>0){target.bleeds[target.bleeds.length-1].hemorrhage=true;visceral(b,target);}
  }
 }

 // Scrapwork: footprint reservations are part of the owner, never extra allies.
 const MECH_APEX = ['berserkerColossus', 'siegeDreadnought', 'vanguardJuggernaut'];
 const isMechanical = u => isMech(u) || isCyber(u) || ['smelter','junkScavenger','magneticCrane','hydraulicRiveter','vent','cryoPump','biomonitor','accessPoint','nanite','railgun','sensor','core'].includes(u.id);
 const isMech = u => family(u) === 'scrapFrame';
 const isScrap = u => ['rustSword', 'rustGun'].includes(u.id);
 const occupiedSlots = u => u.extraSlot == null ? [u.slot] : [u.slot, u.extraSlot];
 const slotOccupied = (b, slot) => b.units.some(u => !u.removed && occupiedSlots(u).includes(slot));
 const touches = (u, v, diagonal = false) => [u,...(u.extraSlot==null?[]:[xy(u.extraSlot)])].some(x => [v,...(v.extraSlot==null?[]:[xy(v.extraSlot)])].some(y => {
  return diagonal ? Math.max(Math.abs(x.x-y.x),Math.abs(x.y-y.y))===1 : adjacent(x,y);
 }));
 function mechPath(u) {
  const a = u.modules || [];
  if (a.length < 2) return null;
  return a.every(x => x === 'blade') ? 'berserkerColossus' : a.every(x => x === 'flak') ? 'siegeDreadnought' : 'vanguardJuggernaut';
 }
 function updateMech(b,u) {
  if (!isMech(u) || token(u) || u.removed) return;
  if ((u.alloy || 0) >= 120) u.titanUnlocked = true;
  if (u.titanUnlocked && u.extraSlot == null) {
   const free = [0,1,2,3,4,5,6,7,8].find(s => !slotOccupied(b,s) && adjacent(u,xy(s)));
   if (free != null) {
    u.extraSlot = free;
    interact(b,u,u,'titanshift','TITANSHIFT · two slots, one machine');
   }
  }
  if (!MECH_APEX.includes(u.id)) {
   const id = u.extraSlot != null ? 'titanFrame' : (u.alloy||0)>=65 ? 'heavyWalker' : (u.alloy||0)>=25 ? 'reinforcedWalker' : 'scrapFrame';
   if(u.id !== id)evolve(b,u,id);
   if(u.extraSlot != null && b.run.depth >= 9 && mechPath(u)) {
    const reactor = neighbors(b,u).find(v=>v.id==='titanReactor'&&!token(v));
    if(reactor){consume(b,u,reactor,'Reactor Binding',0);evolve(b,u,mechPath(u));}
   }
  }
  persist(b,u);
 }
 function addAlloy(b,u,n) {
  if(!isMech(u)||token(u)||u.removed)return;
  const before=u.alloy||0;u.alloy=before+n;
  const steps=Math.floor(Math.max(0,u.alloy-120)/15)-Math.floor(Math.max(0,before-120)/15);
  if(steps>0)growth(b,u,steps*2);
  updateMech(b,u);
 }
 function reserveDeployment(r) {
  const order=shuffle(r,r.roster), picked=[];let remaining=9;
  for(const u of order){const cost=isMech(u)&&((u.alloy||0)>=120||u.titanUnlocked)?2:1;if(cost<=remaining){picked.push(u);remaining-=cost;}}
  const slots=shuffle(r,[0,1,2,3,4,5,6,7,8]);
  const large=picked.filter(u=>isMech(u)&&((u.alloy||0)>=120||u.titanUnlocked));
  const small=picked.filter(u=>!large.includes(u)), placements=new Map();
  function pack(i,free){
   if(i===large.length){small.forEach((u,j)=>placements.set(u.uid,[free[j]]));return true;}
   for(const a of free)for(const z of free)if(a!==z&&adjacent(xy(a),xy(z))){
    placements.set(large[i].uid,[a,z]);if(pack(i+1,free.filter(s=>s!==a&&s!==z)))return true;
   }
   return false;
  }
  if(!pack(0,slots))throw Error('Unable to reserve Titan footprint');
  return {picked,placements};
 }
 function salvage(b) {
  for(const scavenger of b.units.filter(u=>!u.removed&&!token(u)&&u.id==='junkScavenger')){
   if(rand(b.run)>=.5)continue;
   const id=rand(b.run)<.5?'rustSword':'rustGun';
   const scrap=spawnToken(b,scavenger,id,true,{origin:id,tokenAtk:0,attackInterval:0});
   if(scrap){b.metrics.salvaged=(b.metrics.salvaged||0)+1;interact(b,scavenger,scrap,'salvage',id==='rustSword'?'Rust Sword salvaged':'Rust Gun salvaged');}
  }
 }
 function forge(b,u) {
  const mechs=b.units.filter(v=>!v.removed&&!token(v)&&isMech(v));
  if(!mechs.length)return;
  u.scrapIntake ||= [];
  const scraps=neighbors(b,u).filter(v=>isScrap(v)&&token(v)).sort((a,z)=>a.slot-z.slot).slice(0,2-u.scrapIntake.length);
  for(const scrap of scraps){u.scrapIntake.push(scrap.id);consume(b,u,scrap,'Forge Intake',0);}
  if(scraps.length)persist(b,u);
  if(u.scrapIntake.length<2 || b.time<(u.forgeAt||0))return;
  u.forgeAt=b.time+4;
  const module=u.scrapIntake.every(id=>id==='rustSword')?'blade':u.scrapIntake.every(id=>id==='rustGun')?'flak':'gunblade';
  u.scrapIntake=[];persist(b,u);
  const distance=v=>Math.min(...occupiedSlots(v).map(s=>Math.abs(xy(s).x-u.x)+Math.abs(xy(s).y-u.y)));
  const recipient=mechs.filter(v=>(v.modules||[]).length<2).sort((a,z)=>distance(a)-distance(z)||a.uid-z.uid)[0];
  if(recipient){recipient.modules=[...(recipient.modules||[]),module];persist(b,recipient);interact(b,u,recipient,'module',`${module.toUpperCase()} installed · ${recipient.modules.length}/2 locked`);}
  for(const mech of mechs)addAlloy(b,mech,3);
  b.metrics.smelts=(b.metrics.smelts||0)+1;
  interact(b,u,recipient||u,'smelt',recipient?'+3 Alloy to deployed Mechs':'Modules recycled · +3 Alloy to deployed Mechs');
 }
 function scrapworkExtras(b,u) {
  if(token(u))return;
  if(isMech(u))updateMech(b,u);
  if(u.id==='smelter')forge(b,u);
  if(u.id==='magneticCrane'&&b.time>=(u.craneAt||4)){
   u.craneAt=b.time+4;
   const smelters=b.units.filter(v=>!v.removed&&v.id==='smelter');
   for(const scrap of b.units.filter(v=>!v.removed&&isScrap(v))){
    if(smelters.some(v=>touches(v,scrap)))continue;
    for(const smelter of smelters){
     const free=[0,1,2,3,4,5,6,7,8].find(s=>!slotOccupied(b,s)&&adjacent(smelter,xy(s)));
     if(free!=null){scrap.slot=free;Object.assign(scrap,xy(free));interact(b,u,scrap,'crane','Scrap delivered beside Smelter');break;}
    }
   }
  }
  if(u.id==='hydraulicRiveter'&&b.time>=(u.weldAt||6)){
   u.weldAt=b.time+6;
   const mech=neighbors(b,u).filter(v=>isMech(v)&&!token(v)).sort((a,z)=>a.permanentAtkBonus-z.permanentAtkBonus||a.uid-z.uid)[0];
   if(mech){growth(b,mech,3);interact(b,u,mech,'weld','Welded +3 permanent ATK');}
  }
 }
 function armorStrip(e,amount) {
  if(e.hp<=0||e.gone)return;
  e.originalDefense??=e.defense||0;e.permanentShred=Math.max(e.permanentShred||0,amount);
  e.defense=e.originalDefense*(1-e.permanentShred)*(1-(e.huntArmor||0));
 }
 const arcTiles=(p,width)=>Array.from({length:width},(_,i)=>(Math.floor(p)-Math.floor((width-1)/2)+i+16)%16);
 const inArc=(e,tiles)=>tiles.includes(((Math.floor(e.p)%16)+16)%16);
 function oilPool(b,u,p,width,dps) {
  const tiles=arcTiles(p,width);b.oilPools??=[];
  // Refresh this owner's existing tiles; overlapping pools never multiply its DPS.
  for(const tile of tiles){const old=b.oilPools.find(o=>o.owner===u.uid&&o.tile===tile);if(old){old.until=b.time+4;old.dps=Math.max(old.dps,dps);}else b.oilPools.push({owner:u.uid,tile,dps,until:b.time+4});}
 }
 function tickOil(b,dt) {
  b.oilPools=(b.oilPools||[]).filter(o=>o.until>b.time);
  for(const e of living(b))for(const pool of b.oilPools.filter(o=>o.tile===Math.floor(e.p))){
   const u=b.units.find(v=>v.uid===pool.owner&&!v.removed);
   if(u)damage(b,e,pool.dps*dt*mod(b.run,'damage'),u,'dot');
  }
 }
 function mechAttack(b,u,target,power) {
  u.alloyAttacks=(u.alloyAttacks||0)+1;
  if(u.alloyAttacks>=3){u.alloyAttacks-=3;addAlloy(b,u,1);}else persist(b,u);
  const strongest=()=>living(b).sort((a,z)=>z.hp-a.hp||a.uid-z.uid)[0];
  if(u.id==='berserkerColossus'){
   const e=strongest();if(!e)return;
   armorStrip(e,.5);damage(b,e,power,u,'direct');
   if(e.hp>0&&!e.boss&&!e.champion&&e.hp/e.maxHp<executeThreshold(b))damage(b,e,e.hp,u,'ability');
   if(u.attackCount%3===0)for(const boss of living(b).filter(e=>e.boss||e.champion))damage(b,boss,boss.hp*.15,u,'ability');
   fx(b,'beam',u,e,'SEISMIC');return;
  }
  if(u.id==='siegeDreadnought'){
   const tiles=arcTiles(target.p,8);for(const e of living(b).filter(e=>inArc(e,tiles))){e.shield=0;armorStrip(e,.5);hit(b,u,e,power);}
   fx(b,'pulse',u,target,'BOMBARDMENT');return;
  }
  if(u.id==='vanguardJuggernaut'){
   damage(b,target,power,u,'direct');
   const tiles=arcTiles(target.p,4);for(const e of living(b).filter(e=>inArc(e,tiles)))hit(b,u,e,power*.45);
   oilPool(b,u,target.p,4,35);return;
  }
  const modules=u.modules||[];
  if(!modules.length){hit(b,u,target,power);return;}
  const scale=modules.length===2?.65:1;
  modules.forEach(module=>{
   const lead=living(b)[0];if(!lead)return;
   if(module==='blade'){
    const e=strongest();armorStrip(e,.5);hit(b,u,e,power*scale*(e.hp/e.maxHp<.35?3:1));
   }else if(module==='flak'){
    const tiles=arcTiles(lead.p,6);for(const e of living(b).filter(e=>inArc(e,tiles))){armorStrip(e,.25);hit(b,u,e,power*scale*.65);}
   }else if(u.attackCount%2){damage(b,lead,power*scale,u,'direct');}
   else{const tiles=arcTiles(lead.p,4);for(const e of living(b).filter(e=>inArc(e,tiles)))hit(b,u,e,power*scale*.65);oilPool(b,u,lead.p,4,10*scale);}
  });
 }

 const ring = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 3], [0, 2], [0, 1]];
 function track(p) { p = Math.max(0, Math.min(15.999, p)); let i = Math.floor(p), f = p - i, a = ring[i], z = ring[(i + 1) % 16]; return { x: a[0] + (z[0] - a[0]) * f, y: a[1] + (z[1] - a[1]) * f } }
 function flank(s, e) { let p = track(e.p); return s === 1 ? p.y < .55 : s === 3 ? p.x < .55 : s === 5 ? p.x > 3.45 : s === 7 ? p.y > 3.45 : false }
 const STAIR_TRAP_CORNERS = [0, 4, 8, 12];
 function trackEffect(b, type, fromP, toP, text) {
  const from = track(fromP), to = track(toP);
  b.effects.push({ type, x: from.x, y: from.y, tx: to.x, ty: to.y, text, ttl: 1.0 });
 }
 function triggerStairTraps(b, e, fromP, toP) {
  if (toP <= fromP) return;
  const stairs = b.units.filter(u => !u.removed && family(u) === 'stair13');
  if (!stairs.length) return;
  const inBlackout = b.curfewUntil > b.time;
  const crossedCorner = STAIR_TRAP_CORNERS.some(corner => corner === 0 ? (fromP === 0 && toP > 0) : (fromP < corner && toP >= corner));
  const oldSteps = Math.floor(fromP * 4);
  const newSteps = Math.floor(toP * 4);
  const normalStep13 = newSteps > oldSteps && (newSteps % 13 === 0);
  const blackoutStep4 = inBlackout && newSteps > oldSteps && (newSteps % 4 === 0);

  if (!crossedCorner && !normalStep13 && !blackoutStep4) return;

  for (const stair of stairs) {
   stair.lastRunnerReact = stair.lastRunnerReact || {};
   if (inBlackout && b.time - (stair.lastRunnerReact[e.uid] || -99) < 1.5) continue;
   if (inBlackout) stair.lastRunnerReact[e.uid] = b.time;

   const baseDmg = stair.id === 'penroseLabyrinth' ? 180 : stair.id === 'infiniteStair' ? 75 : 35;
   if (inBlackout && blackoutStep4) {
    const isPanicked = e.panic || e.panicUntil > b.time;
    if (!e.boss && !e.champion && isPanicked && e.hp / e.maxHp < 0.25) {
     damage(b, e, e.hp, stair, 'direct');
     fx(b, 'curfew', stair, e, 'TERMINAL DESCENT');
    } else {
     const voidDmg = baseDmg * (isPanicked ? 2.5 : 1.5);
     damage(b, e, voidDmg, stair, 'ability');
     status(b, e, 'stun', 2.0, 0, stair);
     if (!e.boss && !e.champion) e.p = Math.floor(e.p);
     fx(b, 'warp', stair, e, 'PENROSE TRAPDOOR');
    }
   } else {
    damage(b, e, baseDmg, stair, 'ability');
    status(b, e, 'slow', 1.2, 0.40, stair);
    const point = track(e.p);
    b.effects.push({ type: 'impact', x: point.x, y: point.y, tx: point.x, ty: point.y, text: `−${Math.round(baseDmg)}`, ttl: 1.0 });
   }
   grantUrbanViolation(b, stair, 1, e);
   addTabooMark(b, e, 'stair13', 1, stair);
   if (getTabooMark(e, 'stair13') >= 2) {
    const warpTiles = stair.id === 'penroseLabyrinth' ? 4 : 2;
    const before = e.p;
    warp(b, e, warpTiles, stair);
    if (e.p < before) trackEffect(b, 'warp', before, e.p, `WARP −${(before - e.p).toFixed(1).replace(/\.0$/, '')}`);
   }
  }
 }

 function triggerRedRaincoatTraps(b, e, previousProgress, currentProgress, wasRetreating) {
  const raincoats = b.units.filter(u => !u.removed && family(u) === 'redRaincoat');
  if (!raincoats.length) return;
  const inBlackout = b.curfewUntil > b.time;
  const lookedBack = wasRetreating || currentProgress < previousProgress || (e.slows || []).some(s => s.until > b.time && !raincoats.some(u => u.uid === s.sourceUid));
  let crowding = false;
  if (inBlackout) {
   crowding = living(b).some(other => other !== e && Math.abs(other.p - currentProgress) <= 2.0);
  }
  if (!lookedBack && !crowding) return;

  for (const u of raincoats) {
   u.lastRunnerReact = u.lastRunnerReact || {};
   if (b.time - (u.lastRunnerReact[e.uid] || -99) < 1.5) continue;
   u.lastRunnerReact[e.uid] = b.time;

   const baseDmg = u.id === 'crimsonHarbinger' ? 120 : u.id === 'bloodPhantasm' ? 45 : 18;
   const mult = inBlackout ? ((e.panic || lookedBack) ? 3.0 : 2.0) : 1.0;
   damage(b, e, baseDmg * mult, u, 'direct');
   dot(b, e, 'bleed', u.id === 'crimsonHarbinger' ? 30 : 10, 4, u);
   status(b, e, 'slow', 2.0, 0.35, u);
   grantUrbanViolation(b, u, 1, e);
   addTabooMark(b, e, 'redRaincoat', 1, u);

   if (inBlackout && (e.panic || lookedBack)) {
    for (const nearby of living(b).filter(other => Math.abs(other.p - currentProgress) <= 2.0)) {
     status(b, nearby, 'slow', 3.0, 0.60, u);
    }
    fx(b, 'curfew', u, e, 'CRIMSON DELUGE');
   } else {
    fx(b, 'shot', u, e, 'DO NOT LOOK BACK');
   }
  }
 }
 function neighbors(b, u, diagonal = false) { return b.units.filter(v => !v.removed && v !== u && touches(u, v, diagonal)) }
 function allies(b, u) { return b.units.filter(v => !v.removed && v !== u) }
 function support(b, id) { return b.units.filter(v => !v.removed && v.id === id).sort((a, z) => Number(a.uid) - Number(z.uid))[0] }
 function living(b) { return b.enemies.filter(e => e.hp > 0 && !e.gone).sort((a, z) => z.p - a.p || a.uid - z.uid) }
 function tabooBreaker(b, e) { return (e.ruleMarks || 0) > 0 || e.panicUntil > b.time || e.retreatingUntil > b.time || e.speed > 0.40 || e.frozenUntil > b.time || (e.stuns || []).some(v => v.until > b.time) }
 
 function fx(b, type, u, e, text) { b.effects.push({ type, x: u?.x + 1, y: u?.y + 1, tx: e ? track(e.p).x : u?.x + 1, ty: e ? track(e.p).y : u?.y + 1, text, ttl: type === 'beam' ? .35 : .7 }); if (b.effects.length > 90) b.effects.shift() }
 const ENCOUNTERS = { packs: { id: 'packs', name: 'Swarm packs', test: 'Area damage', desc: 'Runners arrive in groups of three with reduced health.', tip: 'Soul-Wailing Bell or piercing strikes help hit several runners.' }, armor: { id: 'armor', name: 'Iron procession', test: 'Armor penetration', desc: 'Most runners wear armor blocking 40% damage.', tip: 'True damage and defense shred bypass armor.' }, fast: { id: 'fast', name: 'Rush runners', test: 'Crowd control', desc: 'Most runners move 60% faster.', tip: 'Slows, stuns, and knockbacks buy time.' } };
 function encounterFor(n) { if (!n || !['battle', 'elite'].includes(n.type) || n.row === 0) return null; return ENCOUNTERS[['packs', 'armor', 'fast'][(n.row + (n.lane ?? 1)) % 3]] }
 function record(b, u) { b.metrics.cards ??= {}; return b.metrics.cards[u.uid] ??= { uid: u.uid, id: u.id, slot: u.slot, phantom: !!u.phantom, damage: 0, direct: 0, ability: 0, dot: 0, kills: 0, growth: 0, triggers: 0, attacks: 0 } }
 function interact(b, from, to, kind, label) {
  b.metrics.interactions ??= {}; b.feedback ??= []; const key = [from?.uid ?? 'track', to?.uid ?? 'track', kind].join(':');
  const row = b.metrics.interactions[key] ??= { from: from?.id || null, to: to?.id || null, fromUid: from?.uid, toUid: to?.uid, kind, label, count: 0, last: -99 }; row.count++;
  if (b.time - row.last < .75) return; row.last = b.time;
  const event = { seq: ++b.feedbackSeq || (b.feedbackSeq = 1), t: b.time, fromUid: from?.uid, toUid: to?.uid, fromSlot: from?.slot, toSlot: to?.slot, kind, text: `${(from && card(from.id)?.name) || (from && from.hp != null ? 'Runner' : 'Track')}${to && to !== from ? ' → ' + (card(to.id)?.name || 'Enemy') : ''}: ${label}` }; b.feedback.push(event); if (b.feedback.length > 40) b.feedback.shift();
 }
 function report(b) {
  const cards = b.units.map(u => ({ ...record(b, u), consumed: !!u.removed })).sort((a, z) => z.damage - a.damage);
  const interactions = Object.values(b.metrics.interactions || {}).map(({ last, ...v }) => v).sort((a, z) => z.count - a.count);
  const consumed = b.metrics.consumed || [];
  const encounter = encounterFor(b.run.node);
  const dormant = cards.filter(c => ['jade','eye','elementalApprentice','pyroMage','hydroMage','geoMage','aeroMage'].includes(c.id) && !c.consumed && c.triggers === 0);
  let notes = [];
  if (b.metrics.leaks) notes.push(`${b.metrics.leaks} runners escaped.`); else notes.push('No runners escaped. Formation held.');
  if (b.metrics.heavenlyTribulation) notes.push(b.metrics.heavenlyTribulation.status === 'passed' ? 'Heavenly Tribulation passed; the matching relic was consumed and a Mythic Immortal awakened.' : b.metrics.heavenlyTribulation.status === 'failed' ? `Heavenly Tribulation failed: ${b.metrics.heavenlyTribulation.reason}. The Nascent Soul and matching relic were removed from the roster.` : 'Heavenly Tribulation is active: clear the Elite/Boss node with zero leaks.');
  if (b.metrics.urbanContainmentTrial) notes.push(b.metrics.urbanContainmentTrial.status === 'passed' ? `Subject Zero contained with ${b.metrics.urbanContainmentTrial.finalMarks}/5 marks; the Relic was consumed and ${card(b.metrics.urbanContainmentTrial.apexId).name} awakened.` : b.metrics.urbanContainmentTrial.status === 'failed' ? `Subject Zero trial failed: ${b.metrics.urbanContainmentTrial.reason}. The Rule Enforcer and Relic were removed from the roster.` : `Subject Zero trial active: apply 5 Violation Marks and defeat it before it escapes.`);
  if (b.metrics.urbanLegendTrial) notes.push(b.metrics.urbanLegendTrial.status === 'passed' ? `Folklore Merger trial passed with zero runner leaks; ${card(b.metrics.urbanLegendTrial.apexId).name} awakened with +${b.metrics.urbanLegendTrial.inheritedAtk} inherited ATK.` : b.metrics.urbanLegendTrial.status === 'failed' ? `Folklore Merger trial failed: ${b.metrics.urbanLegendTrial.reason}. The devourer was removed; its same-lineage prey was already consumed.` : `Folklore Merger trial active: clear the Elite/Boss node with zero leaks to earn Mythic.`);
  if (b.metrics.arcaneTrial) notes.push(b.metrics.arcaneTrial.status === 'passed' ? `Astral Weaving passed; ${card(b.metrics.arcaneTrial.apexId).name} awakened and the Loom was consumed.` : b.metrics.arcaneTrial.status === 'failed' ? `Astral Weaving failed: ${b.metrics.arcaneTrial.reason}. Mage and Astral Loom removed.` : `Astral Weaving active: prove ${b.metrics.arcaneTrial.pair} on a priority target, then clear with zero leaks.`);
  if (dormant.length) notes.push(`${dormant.map(c => card(c.id).name + ' #' + c.uid).join(', ')} did not fill a trigger gauge.`);
  const originals = consumed.filter(c => !c.token).length, tokens = consumed.filter(c => c.token).length;
  if (originals) notes.push(`${originals} original cards permanently lost.`);
  if (tokens) notes.push(`${tokens} tokens consumed.`);
  return { cards, interactions, consumed, encounter: encounter?.id || null, notes, damage: cards.reduce((a, c) => a + c.damage, 0), leakTypes: { ...b.metrics.leakTypes } };
 }
 function growth(b, u, n) {
  if (u.removed || n <= 0) return;
  n = Math.round(n * mod(b.run, 'growth') * 100) / 100;
  u.permanentAtkBonus += n;
  if (token(u)) { record(b, u).temporaryGrowth = (record(b, u).temporaryGrowth || 0) + n; fx(b, 'growth', u, null, `+${n} wave ATK`); return; }
  record(b, u).growth += n;
  const src = b.run.roster.find(v => v.uid === u.uid);
  if (src) src.permanentAtkBonus = u.permanentAtkBonus;
  b.run.stats.growth += n; b.metrics.growth += n;
  fx(b, 'growth', u, null, `+${n} ATK`);
 }
 function grantGrowth(b, u, n) { if (u.removed || n <= 0) return false; growth(b, u, n); return true }
 function teamPower(b) { return b.units.filter(u => !u.removed && !token(u)).reduce((n, u) => n + (u.permanentAtkBonus || 0), 0) }
 function highestGrowth(b, u) { return Math.max(0, ...allies(b, u).filter(v => !token(v)).map(v => v.permanentAtkBonus || 0)) }

 const APEX_FORMS = [
  'dragonCubApex','tigerCubApex','xuanwuCubApex','phoenixCubApex','monkeyCubApex',
  'swordImmortal', 'melodicSaint', 'formationMaster', 'talismanSovereign', 'landscapeSage', 'soulReapingDemon', 'bloodFiendMaster',
  'ruleArchitect', 'allSeeingOverseer', 'curfewDirector', 'forensicDemiurge', 'backroomsWarden',
  'slitMouthedSovereign', 'terminusBus', 'midnightOperator', 'mirrorQueen', 'livingTaboo',
  'penroseLabyrinth', 'crimsonHarbinger'
 ];
 const CULT_RELICS = ['flyingSword', 'guqin', 'weiqiBoard', 'inkBrush', 'mountainScroll', 'soulBanner', 'demonBlade'];
 const isCultivationRelic = u => CULT_RELICS.includes(u.id);
 const cultivationRelicApex = { flyingSword: 'swordImmortal', guqin: 'melodicSaint', weiqiBoard: 'formationMaster', inkBrush: 'talismanSovereign', mountainScroll: 'landscapeSage', demonBlade: 'bloodFiendMaster' };
 function trialRelicFor(b, u) {
  return neighbors(b, u, false).filter(v => !v.removed && (cultivationRelicApex[v.id] || (v.id === 'soulBanner' && (v.souls || 0) >= 100))).sort((a, z) => a.slot - z.slot)[0] || null;
 }
 function startHeavenlyTrial(b) {
  if (!b || !['elite', 'boss'].includes(b.run.node?.type) || (b.metrics?.leaks || 0) > 0) return null;
  if (b.heavenlyTrial) return b.heavenlyTrial;
  const candidates = b.units.filter(u => !u.removed && !token(u) && isPractitioner(u) && u.id === 'cultivationNascentSoul' && (u.qi || 0) >= 175)
   .map(u => ({ unit: u, relic: trialRelicFor(b, u) })).filter(v => v.relic)
   .sort((a, z) => (z.unit.qi || 0) - (a.unit.qi || 0) || a.unit.slot - z.unit.slot || a.unit.uid - z.unit.uid);
  const selected = candidates[0];
  if (!selected) return null;
  const apexId = selected.relic.id === 'soulBanner' ? 'soulReapingDemon' : cultivationRelicApex[selected.relic.id];
  const trial = b.heavenlyTrial = { status: 'active', unitUid: selected.unit.uid, relicUid: selected.relic.uid, relicId: selected.relic.id, apexId, startedAt: b.time, nextStrikeAt: b.time + 4, strikes: 0 };
  b.metrics.heavenlyTribulation = { status: 'active', practitionerId: selected.unit.id, practitionerUid: selected.unit.uid, relicId: selected.relic.id, relicUid: selected.relic.uid, apexId, qi: selected.unit.qi || 0, startedAt: b.time, strikes: 0 };
  interact(b, selected.unit, selected.relic, 'tribulation', 'Heavenly Tribulation begins · clear the Elite/Boss node with zero leaks');
  fx(b, 'pulse', selected.unit, null, 'HEAVENLY TRIBULATION');
  return trial;
 }
 function failHeavenlyTrial(b, reason = 'runner escaped') {
  const trial = b?.heavenlyTrial;
  if (!trial || trial.status !== 'active') return false;
  const practitioner = b.units.find(u => u.uid === trial.unitUid);
  const relic = b.units.find(u => u.uid === trial.relicUid);
  trial.status = 'failed'; trial.reason = reason; trial.failedAt = b.time;
  if (practitioner) practitioner.removed = true;
  if (relic) relic.removed = true;
  const lost = new Set([trial.unitUid, trial.relicUid]);
  b.run.roster = b.run.roster.filter(u => !lost.has(u.uid));
  b.metrics.heavenlyTribulation = { ...b.metrics.heavenlyTribulation, status: 'failed', reason, failedAt: b.time, strikes: trial.strikes };
  interact(b, practitioner || null, relic || null, 'tribulation-failed', `TRIBULATION FAILED · ${reason}; Nascent Soul and relic lost`);
  fx(b, 'impact', practitioner || null, null, 'TRIBULATION FAILED');
  return true;
 }
 function passHeavenlyTrial(b) {
  const trial = b?.heavenlyTrial;
  if (!trial || trial.status !== 'active' || !b.won || (b.metrics?.leaks || 0) > 0 || !['elite', 'boss'].includes(b.run?.node?.type)) return false;
  const practitioner = b.units.find(u => u.uid === trial.unitUid && !u.removed);
  const relic = b.units.find(u => u.uid === trial.relicUid && !u.removed);
  if (!practitioner || !relic) return failHeavenlyTrial(b, 'Nascent Soul or matching relic was removed');
  consume(b, practitioner, relic, 'Heavenly Tribulation', 0);
  evolve(b, practitioner, trial.apexId);
  practitioner.realm = 4;
  persist(b, practitioner);
  trial.status = 'passed'; trial.passedAt = b.time;
  b.metrics.heavenlyTribulation = { ...b.metrics.heavenlyTribulation, status: 'passed', passedAt: b.time, strikes: trial.strikes };
  interact(b, practitioner, practitioner, 'tribulation-passed', `HEAVENLY TRIBULATION PASSED · ${card(trial.apexId).name} awakened`);
  fx(b, 'growth', practitioner, null, 'TRIBULATION PASSED');
  return true;
 }
 function tickHeavenlyTrial(b) {
  const trial = b?.heavenlyTrial;
  if (!trial || trial.status !== 'active') return;
  const practitioner = b.units.find(u => u.uid === trial.unitUid && !u.removed);
  const relic = b.units.find(u => u.uid === trial.relicUid && !u.removed);
  if (!practitioner) { failHeavenlyTrial(b, 'Nascent Soul was removed'); return; }
  if (!relic) { failHeavenlyTrial(b, 'matching relic was removed'); return; }
  while (trial.status === 'active' && b.time >= trial.nextStrikeAt) {
   practitioner.trialStunnedUntil = b.time + .5;
   trial.strikes++;
   b.metrics.heavenlyTribulation.strikes = trial.strikes;
   fx(b, 'impact', practitioner, null, 'LIGHTNING · STUN 0.5s');
   for (const e of living(b)) {
    damage(b, e, 25, practitioner, 'ability', true);
    if (!e.gone) fx(b, 'beam', practitioner, e, '−25 TRIBULATION');
    if (trial.status !== 'active') break;
   }
   trial.nextStrikeAt += 4;
  }
 }

 const urbanRelicMap = {
  ruleboard: 'ruleArchitect',
  panopticon: 'allSeeingOverseer',
  redPhone: 'curfewDirector',
  boneSaw: 'forensicDemiurge',
  elevatorKey: 'backroomsWarden'
 };
 const isUrbanRelic = u => Object.keys(urbanRelicMap).includes(u.id) || (card(u.id).genre === 'Haunted' && (card(u.id).tags || []).includes('urban-relic'));
 const isApexImmortal = u => APEX_FORMS.includes(u.id) || u.realm === 4;

 // Quái Đàm Đô Thị: Investigator & Urban Legend constants
 const urbanInvestigatorIds = ['investigator', 'occultDetective', 'anomalySpecialist', 'ruleEnforcer'];
 const isUrbanAuthority = u => Object.values(urbanRelicMap).includes(u.id);
 const isCultivationApex = u => APEX_FORMS.includes(u.id) && card(u.id).genre === 'Cultivation';
 const acceptsQi = u => !token(u) && (isPractitioner(u) || isCultivationApex(u));
 const acceptsDread = u => !token(u) && (isUrbanInvestigator(u) || isUrbanAuthority(u));
 function addQi(b, u, amount) {
  const previousQi = u.qi || 0;
  u.qi = previousQi + amount;
  const bonusQi = Math.max(0, u.qi - Math.max(175, previousQi));
  if (bonusQi > 0) growth(b, u, bonusQi * 0.15);
  if (isCultivationApex(u)) {
   u.apexQi = (u.apexQi || 0) + amount;
   while (u.apexQi >= 30) { u.apexQi -= 30; growth(b, u, 2); }
  } else updatePractitionerRealm(b, u);
  persist(b, u);
  startHeavenlyTrial(b);
 }
 function arcaneTrialCandidate(b) {
  if(!b||b.run.depth<9||!['elite','boss'].includes(b.run?.node?.type)||(b.metrics?.leaks||0)>0)return null;
  for(const unit of b.units.filter(u=>!u.removed&&!token(u)&&isApprentice(u)&&!isArchon(u))
    .sort((a,z)=>a.slot-z.slot||a.uid-z.uid)){
   const pair=bestPair(unit),points=unit.synthesis?.[pair]||0;
   if(points<30)continue;
   const loom=neighbors(b,unit,false).filter(v=>!v.removed&&!token(v)&&v.id==='astralLoom')
    .sort((a,z)=>a.slot-z.slot||a.uid-z.uid)[0];
   if(loom)return{unit,loom,pair,apexId:ARCANE_PAIRS[pair]};
  }
  return null;
 }
 function startArcaneTrial(b){
  if(!b||b.arcaneTrial)return b?.arcaneTrial||null;
  const candidate=arcaneTrialCandidate(b);if(!candidate)return null;
  const t=b.arcaneTrial={status:'active',unitUid:candidate.unit.uid,loomUid:candidate.loom.uid,
   pair:candidate.pair,apexId:candidate.apexId,startedAt:b.time,nodeType:b.run.node.type,featDone:false};
  b.metrics.arcaneTrial={status:'active',unitUid:t.unitUid,loomUid:t.loomUid,pair:t.pair,apexId:t.apexId,
   startedAt:b.time,nodeType:t.nodeType,featDone:false};
  interact(b,candidate.unit,candidate.loom,'arcane-trial','ASTRAL WEAVING TRIAL · prove the chosen reaction against an Elite/Harbinger/Boss, then clear with zero leaks');
  fx(b,'growth',candidate.unit,null,'ARCANE TRIAL · REACTION + ZERO LEAKS');
  return t;
 }
 function failArcaneTrial(b,reason='A runner leaked'){
  const t=b?.arcaneTrial;if(!t||t.status!=='active')return false;
  const unit=b.units.find(u=>u.uid===t.unitUid),loom=b.units.find(u=>u.uid===t.loomUid);
  if(unit)unit.removed=true;if(loom)loom.removed=true;
  const lost=new Set([t.unitUid,t.loomUid]);b.run.roster=b.run.roster.filter(u=>!lost.has(u.uid));
  t.status='failed';t.reason=reason;t.failedAt=b.time;
  b.metrics.arcaneTrial={...b.metrics.arcaneTrial,status:'failed',reason,failedAt:b.time};
  interact(b,unit||null,loom||null,'arcane-trial-failed',`ASTRAL WEAVING FAILED · ${reason}; Mage and Astral Loom lost`);
  fx(b,'impact',unit||null,null,'ARCANE TRIAL FAILED');return true;
 }
 function passArcaneTrial(b){
  const t=b?.arcaneTrial;
  if(!t||t.status!=='active'||!t.featDone||!b.won||(b.metrics?.leaks||0)!==0||!['elite','boss'].includes(b.run?.node?.type))return false;
  const unit=b.units.find(u=>u.uid===t.unitUid&&!u.removed),loom=b.units.find(u=>u.uid===t.loomUid&&!u.removed);
  if(!unit||!loom)return failArcaneTrial(b,'The Mage or Astral Loom was removed');
  unit.boundPair=t.pair;consume(b,unit,loom,'Astral Weaving Trial',0);evolve(b,unit,t.apexId);persist(b,unit);
  t.status='passed';t.passedAt=b.time;
  b.metrics.arcaneTrial={...b.metrics.arcaneTrial,status:'passed',passedAt:b.time};
  interact(b,unit,unit,'arcane-trial-passed',`ASTRAL WEAVING PASSED · ${card(t.apexId).name} awakened`);
  fx(b,'growth',unit,null,'ARCANE MYTHIC AWAKENED');return true;
 }
 function tickArcaneTrial(b){
  const t=b?.arcaneTrial;if(!t||t.status!=='active')return;
  if(!b.units.some(u=>u.uid===t.unitUid&&!u.removed)||!b.units.some(u=>u.uid===t.loomUid&&!u.removed))failArcaneTrial(b,'The Mage or Astral Loom was removed');
 }

 function addDread(b, u, amount) {
  u.dread = (u.dread || 0) + amount;
  if (isUrbanAuthority(u)) {
   u.apexDread = (u.apexDread || 0) + amount;
   while (u.apexDread >= 30) { u.apexDread -= 30; growth(b, u, 2); }
  } else updateUrbanInvestigatorRealm(b, u);
  persist(b, u);
 }
 function bindUrbanRelic(b, u) {
  // Architecture A's Relic is a trial focus, never an automatic Mythic binding.
  if (!b || u?.removed || token(u) || u?.id !== 'ruleEnforcer') return null;
  return startUrbanContainmentTrial(b);
 }
 function urbanTrialCandidate(b) {
  if (!b || !['elite', 'boss'].includes(b.run?.node?.type) || (b.metrics?.leaks || 0) > 0) return null;
  const enforcers = b.units.filter(u => !u.removed && !token(u) && u.id === 'ruleEnforcer' && (u.dread || 0) >= 140)
    .sort((a,z)=>a.slot-z.slot||a.uid-z.uid);
  for (const enforcer of enforcers) {
   const relic = neighbors(b, enforcer, false).filter(v => !v.removed && urbanRelicMap[v.id])
    .sort((a,z)=>a.slot-z.slot||a.uid-z.uid)[0];
   if (relic) return { enforcer, relic, apexId: urbanRelicMap[relic.id] };
  }
  return null;
 }
 function spawnSubjectZero(b, trial) {
  const bossNode = b.run.node.type === 'boss';
  const hp = bossNode ? Math.round((b.plan?.bossHp || 11000) * 0.65) : Math.max(4500, Math.round((b.plan?.hp || 500) * 4));
  const e = { uid: ++b.enemyUid, id: 'subjectZero', name: 'Subject Zero', subjectZero: true, p: 0,
   hp, maxHp: hp, speed: bossNode ? 0.24 : 0.26, leak: 0, defense: 0.25,
   boss: false, champion: false, elite: true, maxProgress: 0, bornAt: b.time, enraged: false, gone: false,
   panic: false, panicUntil: 0, retreatingUntil: 0, slows: [], frozenUntil: 0, shredUntil: 0,
   bleeds: [], burns: [], venoms: [], vulnerableUntil: 0, vulnerability: 0, auras: [], ruleMarks: 0,
   tabooMarks: { kuchisake: 0, nightBus: 0, payphone: 0, morgueMirror: 0, mannequin: 0, stair13: 0, redRaincoat: 0 } };
  b.enemies.push(e); trial.subjectZeroUid = e.uid;
  interact(b, trial.enforcer, e, 'subject-zero', `SUBJECT ZERO · contain with 5 Violation Marks (${hp.toLocaleString()} HP)`);
  fx(b, 'curfew', trial.enforcer, e, 'SUBJECT ZERO · 0/5 MARKS');
  return e;
 }
 function startUrbanContainmentTrial(b) {
  if (!b || b.urbanContainmentTrial) return b?.urbanContainmentTrial || null;
  const candidate = urbanTrialCandidate(b); if (!candidate) return null;
  const trial = b.urbanContainmentTrial = { status: 'active', enforcerUid: candidate.enforcer.uid,
   relicUid: candidate.relic.uid, relicId: candidate.relic.id, apexId: candidate.apexId,
   startedAt: b.time, marksRequired: 5, subjectZeroUid: null };
  b.metrics.urbanContainmentTrial = { status: 'active', enforcerId: candidate.enforcer.id,
   enforcerUid: candidate.enforcer.uid, relicId: candidate.relic.id, relicUid: candidate.relic.uid,
   apexId: candidate.apexId, nodeType: b.run.node.type, startedAt: b.time, marksRequired: 5 };
  spawnSubjectZero(b, trial);
  return trial;
 }
 function urbanLegendTrialCandidate(b) {
  if (!b || !['elite', 'boss'].includes(b.run?.node?.type) || (b.metrics?.leaks || 0) > 0) return null;
  const devourers = b.units.filter(u => !u.removed && !token(u) && isUrbanLegend(u)
    && !APEX_FORMS.includes(u.id) && (u.violations || 0) >= 80)
    .sort((a,z)=>(z.violations||0)-(a.violations||0)||a.slot-z.slot||a.uid-z.uid);
  for (const devourer of devourers) {
   const prey = neighbors(b, devourer, false).filter(v => !v.removed && !token(v)
    && isUrbanLegend(v) && family(v) === family(devourer) && (v.violations || 0) >= 45)
    .sort((a,z)=>(z.violations||0)-(a.violations||0)||rawAtk(z)-rawAtk(a)||a.uid-z.uid)[0];
   if (prey) return { devourer, prey, apexId: urbanLegendTiers[family(devourer)]?.[2] };
  }
  return null;
 }
 function startUrbanLegendTrial(b) {
  if (!b || b.urbanLegendTrial) return b?.urbanLegendTrial || null;
  const candidate = urbanLegendTrialCandidate(b);
  if (!candidate?.apexId) return null;
  const inherited = Math.round(atk(b, candidate.prey) * .20 * 100) / 100;
  const t = b.urbanLegendTrial = { status: 'active', devourerUid: candidate.devourer.uid,
   preyUid: candidate.prey.uid, lineage: family(candidate.devourer), apexId: candidate.apexId,
   inheritedAtk: inherited, startedAt: b.time, nodeType: b.run.node.type };
  b.metrics.urbanLegendTrial = { status: 'active', devourerUid: t.devourerUid, preyUid: t.preyUid,
   lineage: t.lineage, apexId: t.apexId, inheritedAtk: inherited, startedAt: b.time, nodeType: t.nodeType };
  consume(b, candidate.devourer, candidate.prey, 'Folklore Merger Trial', 0);
  candidate.devourer.permanentAtkBonus = (candidate.devourer.permanentAtkBonus || 0) + inherited;
  persist(b, candidate.devourer);
  interact(b, candidate.prey, candidate.devourer, 'folklore-trial-start',
   `FOLKLORE TRIAL · same-lineage prey consumed; +${inherited} inherited ATK · clear with zero leaks`);
  fx(b, 'growth', candidate.devourer, null, 'FOLKLORE TRIAL · ZERO LEAKS');
  return t;
 }
 function failUrbanLegendTrial(b, reason = 'A runner leaked') {
  const t = b?.urbanLegendTrial;
  if (!t || t.status !== 'active') return false;
  const devourer = b.units.find(u => u.uid === t.devourerUid);
  if (devourer) devourer.removed = true;
  b.run.roster = b.run.roster.filter(u => u.uid !== t.devourerUid);
  t.status = 'failed'; t.reason = reason; t.failedAt = b.time;
  b.metrics.urbanLegendTrial = { ...b.metrics.urbanLegendTrial, status: 'failed', reason, failedAt: b.time };
  interact(b, devourer || null, null, 'folklore-trial-failed',
   `FOLKLORE TRIAL FAILED · ${reason}; devourer removed; prey was already consumed`);
  fx(b, 'impact', devourer || null, null, 'FOLKLORE TRIAL FAILED');
  return true;
 }
 function passUrbanLegendTrial(b) {
  const t = b?.urbanLegendTrial;
  if (!t || t.status !== 'active' || !b.won || (b.metrics.leaks || 0) !== 0) return false;
  const devourer = b.units.find(u => u.uid === t.devourerUid && !u.removed);
  if (!devourer) return failUrbanLegendTrial(b, 'The devourer did not survive the node');
  evolve(b, devourer, t.apexId);
  devourer.realm = 4; persist(b, devourer);
  t.status = 'passed'; t.passedAt = b.time;
  b.metrics.urbanLegendTrial = { ...b.metrics.urbanLegendTrial, status: 'passed', passedAt: b.time };
  interact(b, devourer, devourer, 'folklore-trial-passed',
   `FOLKLORE TRIAL PASSED · ${card(t.apexId).name} awakened · +${t.inheritedAtk} inherited ATK`);
  fx(b, 'growth', devourer, null, 'MYTHIC · ZERO-LEAK TRIAL PASSED');
  return true;
 }
 function failUrbanContainmentTrial(b, reason = 'Subject Zero escaped') {
  const t = b?.urbanContainmentTrial;
  if (!t || t.status !== 'active') return false;
  const enforcer = b.units.find(u => u.uid === t.enforcerUid);
  const relic = b.units.find(u => u.uid === t.relicUid);
  const zero = b.enemies.find(e => e.uid === t.subjectZeroUid);
  if (zero && zero.hp > 0 && reason !== 'Subject Zero escaped') zero.gone = true;
  t.status = 'failed'; t.reason = reason; t.failedAt = b.time;
  if (enforcer) enforcer.removed = true;
  if (relic) relic.removed = true;
  const lost = new Set([t.enforcerUid, t.relicUid]);
  b.run.roster = b.run.roster.filter(u => !lost.has(u.uid));
  b.metrics.urbanContainmentTrial = { ...b.metrics.urbanContainmentTrial, status: 'failed', reason, failedAt: b.time };
  interact(b, enforcer || null, relic || null, 'subject-zero-failed', `CONTAINMENT FAILED · ${reason}; Rule Enforcer and Relic lost`);
  fx(b, 'impact', enforcer || null, null, 'CONTAINMENT FAILED');
  return true;
 }
 function passUrbanContainmentTrial(b, e) {
  const t = b?.urbanContainmentTrial;
  if (!t || t.status !== 'active' || !e?.subjectZero || (e.ruleMarks || 0) < t.marksRequired) return false;
  const enforcer = b.units.find(u => u.uid === t.enforcerUid && !u.removed);
  const relic = b.units.find(u => u.uid === t.relicUid && !u.removed);
  if (!enforcer || !relic) return failUrbanContainmentTrial(b, 'Rule Enforcer or Relic was removed');
  t.subjectZeroContained = true; t.finalMarks = e.ruleMarks || 0;
  b.metrics.urbanContainmentTrial = { ...b.metrics.urbanContainmentTrial, subjectZeroContained: true, finalMarks: t.finalMarks };
  interact(b, enforcer, e, 'subject-zero-contained', 'SUBJECT ZERO CONTAINED · survive this Elite/Boss with zero leaks');
  fx(b, 'growth', enforcer, null, 'ZERO-LEAK CLEAR REQUIRED');
  return true;
 }
 function tickUrbanContainmentTrial(b) {
  const t = b?.urbanContainmentTrial;
  if (!t || t.status !== 'active') return;
  if (!b.units.some(u => u.uid === t.enforcerUid && !u.removed) || !b.units.some(u => u.uid === t.relicUid && !u.removed)) {
   failUrbanContainmentTrial(b, 'Rule Enforcer or Relic was removed'); return;
  }
  const zero = b.enemies.find(e => e.uid === t.subjectZeroUid);
  if (zero && zero.p >= 16 && zero.hp > 0 && !zero.gone) {
   zero.gone = true; failUrbanContainmentTrial(b, 'Subject Zero escaped');
  }
 }
 const isUrbanInvestigator = u => family(u) === 'investigator' && !APEX_FORMS.includes(u.id);
 const urbanLegendFamilies = ['kuchisake', 'nightBus', 'payphone', 'morgueMirror', 'mannequin', 'stair13', 'redRaincoat'];
 const URBAN_LEGEND_MARK_NAMES = { kuchisake: 'Scissor Slit', nightBus: 'Phantom Fare', payphone: 'Dead Wire', morgueMirror: 'Mirror Stigma', mannequin: 'Stillness Hex', stair13: 'Penrose Stumble', redRaincoat: 'Look-Back Omen' };
 function getTabooMark(e, fam) { return e && e.tabooMarks ? (e.tabooMarks[fam] || 0) : 0 }
 function totalTabooMarks(e) { return Object.values(e?.tabooMarks || {}).reduce((sum, value) => sum + (Number(value) || 0), 0) }
 function hasLegendMark(e, fam) { return getTabooMark(e, fam) > 0 }
 function breaksLegendNaturalRule(b, u, e) {
  if (!e || e.gone || e.hp <= 0) return false;
  const fam = family(u);
  const panicked = e.panic || e.panicUntil > b.time;
  const fleeing = e.retreatingUntil > b.time;
  if (fam === 'kuchisake') return e.speed > 0.30 || panicked || fleeing;
  if (fam === 'nightBus') return e.speed > 0.40 || panicked || fleeing;
  if (fam === 'payphone') return panicked || fleeing;
  if (fam === 'morgueMirror') return flank(u.slot, e) || panicked || fleeing || e.frozenUntil > b.time || (e.stuns || []).some(v => v.until > b.time);
  if (fam === 'mannequin') return e.speed > 0.40 || panicked || fleeing;
  if (fam === 'stair13') return false; // This legend is activated only by its step/corner crossing trap.
  if (fam === 'redRaincoat') return fleeing || e.p < (e.previousP ?? e.p) || (e.slows || []).some(v => v.until > b.time);
  return false;
 }
 function isLegendTarget(b, u, e) { const fam = family(u); return !!e && !e.gone && e.hp > 0 && (hasLegendMark(e, fam) || breaksLegendNaturalRule(b, u, e)); }
 function markNaturalBreach(b, u, e) { const fam = family(u); return breaksLegendNaturalRule(b, u, e) ? addTabooMark(b, e, fam, 1, u) : 0 }
 function addTabooMark(b, e, fam, n = 1, source = null) {
  if (!e || e.gone || e.hp <= 0 || !urbanLegendFamilies.includes(fam) || n <= 0) return 0;
  e.tabooMarks ||= { kuchisake: 0, nightBus: 0, payphone: 0, morgueMirror: 0, mannequin: 0, stair13: 0, redRaincoat: 0 };
  e.tabooMarks[fam] = (e.tabooMarks[fam] || 0) + n;
  fx(b, 'violation', source || e, e, `+${n} ${URBAN_LEGEND_MARK_NAMES[fam]}`);
  return n;
 }

 const urbanLegendTiers = {
  kuchisake: ['kuchisake', 'scissorBanshee', 'slitMouthedSovereign'],
  nightBus: ['nightBus', 'ghostRoute', 'terminusBus'],
  payphone: ['payphone', 'hauntedSwitchboard', 'midnightOperator'],
  morgueMirror: ['morgueMirror', 'doppelMirror', 'mirrorQueen'],
  mannequin: ['mannequin', 'stalker', 'livingTaboo'],
  stair13: ['stair13', 'infiniteStair', 'penroseLabyrinth'],
  redRaincoat: ['redRaincoat', 'bloodPhantasm', 'crimsonHarbinger']
 };
 const isUrbanLegend = u => urbanLegendFamilies.includes(family(u));

 function urbanInvestigatorRealmForDread(dread = 0) { return dread >= 140 ? 3 : dread >= 70 ? 2 : dread >= 25 ? 1 : 0; }

 function updateUrbanInvestigatorRealm(b, u) {
  if (!isUrbanInvestigator(u)) return;
  const dread = u.dread || 0, newRealm = urbanInvestigatorRealmForDread(dread), oldRealm = u.realm || 0;
  u.realm = newRealm;
  if (newRealm !== oldRealm || u.id !== urbanInvestigatorIds[newRealm]) {
   const nextId = urbanInvestigatorIds[newRealm];
   if (u.id !== nextId) evolve(b, u, nextId);
   const stats = [[8, 1.3], [24, 1.1], [50, 0.85], [90, 0.65]][newRealm];
   u.baseAtk = stats[0]; u.attackInterval = stats[1];
   if (newRealm > oldRealm) {
    const title = ['Investigator', 'Occult Detective', 'Anomaly Specialist', 'Rule Enforcer'][newRealm];
    fx(b, 'growth', u, null, title.toUpperCase());
   }
   persist(b, u);
  }
 }

 function grantUrbanViolation(b, u, amount = 1, runner = null) {
  if (!u || !isUrbanLegend(u)) return;
  let canReward=true;
  if(runner && amount>0){
   u.violationRewardAt ||= {};
   canReward=b.time >= (u.violationRewardAt[runner.uid] ?? -Infinity);
   if(canReward)u.violationRewardAt[runner.uid]=b.time+8;
  }
  const progress=canReward?amount*0.35:0;
  u.violations = Math.round(((u.violations || 0) + progress)*10000)/10000;
  updateUrbanLegendLineage(b, u);
  startUrbanLegendTrial(b);
  if (b.time >= (b.blackoutLockoutUntil || 0) && b.time >= (b.curfewUntil || 0)) {
   b.urbanViolationsForBlackout = (b.urbanViolationsForBlackout || 0) + amount;
   if (b.urbanViolationsForBlackout >= 5) {
    b.urbanViolationsForBlackout = 0;
    triggerBlackout(b);
   }
  }
 }

 function updateUrbanLegendLineage(b, u) {
  const fam = family(u);
  if (!urbanLegendFamilies.includes(fam) || APEX_FORMS.includes(u.id)) return;
  const forms = urbanLegendTiers[fam];
  if (!forms) return;
  // 15 earns the Epic form; 80 unlocks only the zero-leak Elite/Boss Folklore trial.
  const targetId = (u.violations || 0) >= 15 ? forms[1] : forms[0];
  if (u.id !== targetId) { evolve(b, u, targetId); persist(b, u); }
 }
 function resolveUrbanLegendMerger(b) {
  // Mythic evolution is now earned only through the Elite/Boss zero-leak trial.
  return startUrbanLegendTrial(b);
 }

 function triggerBlackout(b) {
  const legends = b.units.filter(v => !v.removed && isUrbanLegend(v));
  if (!legends.length) return;
  if (b.time < (b.blackoutLockoutUntil || 0) || b.curfewUntil > b.time) return;

  const dur = 6.0 * mod(b.run, 'buffDuration');
  b.curfewUntil = b.time + dur;
  b.blackoutLockoutUntil = b.curfewUntil + 8.0;
  for (const e of living(b)) { e.panicUntil = Math.max(e.panicUntil || 0, b.time + 2.5); e.panic = true; }
  fx(b, 'curfew', null, null, 'TẮT ĐÈN · BLACKOUT FRENZY');
  for (const v of legends) {
   v.blackouts = (v.blackouts || 0) + 1;
   grantGrowth(b, v, 1);
   persist(b, v);
   if (family(v) === 'payphone') {
    const violators = living(b).filter(e => tabooBreaker(b, e));
    for (const e of violators) {
     const mult = (v.id === 'midnightOperator' || v.id === 'hauntedSwitchboard') ? 1.5 : 1.0;
     hit(b, v, e, atk(b, v) * mult);
     if (v.id === 'midnightOperator') status(b, e, 'stun', 1.2, 0, v);
     else if (v.id === 'hauntedSwitchboard') status(b, e, 'stun', 1.0, 0, v);
     else status(b, e, 'slow', 2.0, 0.30, v);
     grantUrbanViolation(b, v, 1, e);
    }
    fx(b, 'pulse', v, null, 'CURFEW RING');
   }
   if (family(v) === 'morgueMirror') {
    const count = v.id === 'mirrorQueen' ? 4 : v.id === 'doppelMirror' ? 2 : 1;
    const targets = v.id === 'mirrorQueen' ? [0,1,2,3,4,5,6,7,8].filter(slot => adjacent(v, xy(slot)) && !b.units.some(w => !w.removed && w.slot === slot)).slice(0, count) : Array(count).fill(0);
    let spawned = 0;
    for (let i = 0; i < count; i++) {
     const clone = spawnToken(b, v, 'mirrorClone', v.id === 'mirrorQueen', { tokenAtk: v.id === 'mirrorQueen' ? rawAtk(v) : rawAtk(v), attackInterval: v.attackInterval, expiresAt: b.time + (v.id === 'mirrorQueen' ? 4 * mod(b.run, 'buffDuration') : 4 * mod(b.run, 'buffDuration')) });
     if (clone) { spawned++; interact(b, v, clone, 'reflection', 'Blackout manifested temporary Mirror Reflection'); }
    }
    if (v.id === 'mirrorQueen' && spawned < 4) fx(b, 'pulse', v, null, `MIRROR CLONES ${spawned}/4`);
   }
  }
 }

 function addRuleMark(b, e, n = 1, source = null) {
  if (e.hp <= 0 || e.gone) return;
  n = Math.min(n, 5 - (e.ruleMarks || 0));
  if (n <= 0) return;
  e.ruleMarks = (e.ruleMarks || 0) + n;
  b.metrics.violations = (b.metrics.violations || 0) + n;
  b.totalRuleMarks = (b.totalRuleMarks || 0) + n;

  for (const v of b.units.filter(v => !v.removed && acceptsDread(v))) {
   const gain = n;
   addDread(b, v, gain);
   interact(b, null, v, 'dread', `+${gain} Dread recorded`);
  }

  if (source && isUrbanLegend(source)) {
   grantUrbanViolation(b, source, n, e);
  }
  // Security Monitor drops Incident Dossier on violations
  for (const cam of b.units.filter(v => !v.removed && v.id === 'securityCam')) {
   if (rand(b.run) < 0.40) {
    spawnToken(b, cam, 'dossier', true);
   }
  }

  fx(b, 'violation', source || e, e, e.subjectZero ? `SUBJECT ZERO · ${e.ruleMarks}/5 MARKS` : 'PHẠM QUY');
 }

 function practitionerRealmForQi(qi = 0) { return qi >= 175 ? 3 : qi >= 85 ? 2 : qi >= 30 ? 1 : 0 }

 function updatePractitionerRealm(b, u) {
  if (!isPractitioner(u)) return;
  const qi = u.qi || 0, newRealm = practitionerRealmForQi(qi), oldRealm = u.realm || 0;
  u.realm = newRealm;
  if (newRealm !== oldRealm || u.id !== cultivationRealmIds[newRealm]) {
   const nextId = cultivationRealmIds[newRealm];
   if (u.id !== nextId) evolve(b, u, nextId);
   const stats = [[6, 1.5], [18, 1.2], [40, 1.0], [75, .75]][newRealm];
   u.baseAtk = stats[0]; u.attackInterval = stats[1];
   if (newRealm > oldRealm) {
    const title = ['Qi-Refining', 'Foundation Establishment', 'Golden Core', 'Nascent Soul'][newRealm];
     fx(b, 'growth', u, null, title.toUpperCase());
   }
   persist(b, u);
  }
 }
 
 // Orbital Xeno-Lab: Alien CRISPR gene-splicing ecosystem
 const XENO_BRANCHES = {
  'chitin+chitin': ['impalerMorph', 'keratinSerum', 'impalerApex'],
  'acid+acid': ['acidBrood', 'royalSerum', 'xenoQueen'],
  'psionic+psionic': ['synapseNexus', 'cortexSerum', 'hiveOvermind'],
  'chitin+acid': ['ravagerMorph', 'ordnanceSerum', 'causticRavager'],
  'chitin+psionic': ['stalkerMorph', 'phaseSerum', 'phaseStalker'],
  'acid+psionic': ['siphonMorph', 'metroidSerum', 'metroidLeviathan']
 };
 const XENO_FORMS = ['xenoSpecimen', 'spineLurker', 'bileSpitter', 'opticDrone', ...Object.values(XENO_BRANCHES).flatMap(([epic, serum, apex]) => [epic, apex])];
 const XENO_SERUMS = Object.values(XENO_BRANCHES).map(b => b[1]);
 const isXeno = u => XENO_FORMS.includes(u?.id) || XENO_SERUMS.includes(u?.id) || ['chitinHelix', 'acidHelix', 'psionicHelix', 'bioScanner', 'geneSplicer'].includes(u?.id);
 const isXenoSpecimen = u => XENO_FORMS.includes(u?.id);
 const isXenoApex = u => Object.values(XENO_BRANCHES).map(b => b[2]).includes(u?.id);
 const isSciFi = u => card(u?.id)?.genre === 'SciFi' || isXeno(u) || u?.genre === 'SciFi';
 const xenoPair = strains => {
  if (!strains || strains.length < 2) return null;
  const s = [...strains].slice(0, 2).sort();
  if (s[0] === 'acid' && s[1] === 'chitin') return 'chitin+acid';
  if (s[0] === 'chitin' && s[1] === 'psionic') return 'chitin+psionic';
  if (s[0] === 'acid' && s[1] === 'psionic') return 'acid+psionic';
  return s[0] + '+' + s[1];
 };
 function addWeakpoint(b, e, n = 1) {
  e.weakpoints = (e.weakpoints || 0) + n;
 }
 function extractHelix(b, u) {
  const freeSlot = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(s => !slotOccupied(b, s) && adjacent(u, xy(s)));
  if (freeSlot == null) return;
  const helixId = ['chitinHelix', 'acidHelix', 'psionicHelix'][Math.floor(rand(b.run) * 3)];
  spawnToken(b, u, helixId, freeSlot);
 }
 function addGenome(b, u, n, strain = null) {
  if (!isXenoSpecimen(u) || isXenoApex(u)) return;
  u.genome = (u.genome || 0) + n;
  if (strain) {
   u.strains ??= [];
   if (u.strains.length < 2) u.strains.push(strain);
  }
  checkXenoMetamorphosis(b, u);
 }
 function checkXenoMetamorphosis(b, u) {
  if (!isXenoSpecimen(u) || isXenoApex(u)) return;
  const g = u.genome || 0, strains = u.strains || [];
  if (u.id === 'xenoSpecimen' && g >= 25 && strains.length >= 1) {
   const targetId = strains[0] === 'chitin' ? 'spineLurker' : strains[0] === 'acid' ? 'bileSpitter' : 'opticDrone';
   evolve(b, u, targetId);
  }
  if (['xenoSpecimen', 'spineLurker', 'bileSpitter', 'opticDrone'].includes(u.id) && g >= 65 && strains.length >= 2) {
   const pair = xenoPair(strains);
   if (pair && XENO_BRANCHES[pair]) {
    const [epicId, serumId] = XENO_BRANCHES[pair];
    evolve(b, u, epicId);
    const splicer = allies(b, u).find(v => v.id === 'geneSplicer');
    if (splicer && !u.serumForged) {
     const freeSlot = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(s => !slotOccupied(b, s) && adjacent(splicer, xy(s)));
     if (freeSlot != null) {
      u.serumForged = true;
      spawnToken(b, splicer, serumId, freeSlot);
     }
    }
   }
  }
  if (g >= 130 && strains.length >= 2 && !isXenoApex(u)) {
   const pair = xenoPair(strains);
   if (pair && XENO_BRANCHES[pair]) {
    const [epicId, serumId, apexId] = XENO_BRANCHES[pair];
    const serum = neighbors(b, u, false).find(v => !v.removed && v.id === serumId);
    if (serum) {
     consume(b, u, serum, 'Awakening', 0);
     evolve(b, u, apexId);
    }
   }
  }
 }
 function acidPool(b, u, p, duration, dps) {
  b.acidPools ??= [];
  b.acidPools.push({ owner: u.uid, p, duration, until: b.time + duration, dps });
 }
 function tickXeno(b, dt) {
  b.acidPools = (b.acidPools || []).filter(z => z.until > b.time && b.units.some(u => !u.removed && u.uid === z.owner));
  for (const z of b.acidPools) {
   const u = b.units.find(v => v.uid === z.owner);
   for (const e of living(b).filter(e => Math.min(Math.abs(e.p - z.p), 16 - Math.abs(e.p - z.p)) <= 1.5)) {
    trueHit(b, u, e, z.dps * dt);
   }
  }
  const metroids = b.units.filter(u => !u.removed && u.id === 'metroidLeviathan');
  for (const u of metroids) {
   u.metroidDrain = (u.metroidDrain || 0) + dt;
   if (u.metroidDrain >= 3) {
    u.metroidDrain = 0;
    for (const e of [...living(b)].sort((a, z) => z.hp - a.hp).slice(0, 2)) {
     status(b, e, 'slow', 3, 0.45, u);
     damage(b, e, e.maxHp * 0.08, u, 'ability', true);
    }
    growth(b, u, 2);
    for (const ally of allies(b, u).filter(v => abilityGauge(v) && !token(v))) tick(b, ally, 2, u);
   }
  }
 }
 function xenoAttack(b, u, target, power) {
  if (u.id === 'bioScanner') {
   u.scanCount = (u.scanCount || 0) + 1;
   const targets = u.scanCount % 4 === 0 ? living(b).slice(0, 3) : [target, ...living(b).filter(e => e !== target).sort((a, z) => z.speed - a.speed).slice(0, 1)];
   for (const [i, e] of targets.entries()) {
    addWeakpoint(b, e, 1);
    hit(b, u, e, power * (i ? 0.5 : 1));
   }
  } else if (u.id === 'spineLurker') {
   for (const e of living(b).slice(0, 2)) hit(b, u, e, power);
  } else if (u.id === 'opticDrone') {
   u.opticCount = (u.opticCount || 0) + 1;
   hit(b, u, target, power);
   if (u.opticCount % 3 === 0) {
    addWeakpoint(b, target, 2);
    const second = living(b).find(e => e !== target);
    if (second) hit(b, u, second, power * 0.75, false);
   }
  } else if (u.id === 'impalerMorph') {
   for (const e of living(b).slice(0, 4)) hit(b, u, e, power, true, { ignoreArmor: true });
  } else if (u.id === 'siphonMorph') {
   u.siphonCount = (u.siphonCount || 0) + 1;
   hit(b, u, target, power);
   if (u.siphonCount % 4 === 0) {
    for (const ally of allies(b, u).filter(v => abilityGauge(v) && !token(v))) tick(b, ally, 2, u);
   }
  } else if (u.id === 'metroidLeviathan') {
   u.metroidCount = (u.metroidCount || 0) + 1;
   hit(b, u, target, power);
   if (u.metroidCount % 3 === 0) {
    for (const ally of allies(b, u).filter(v => abilityGauge(v) && !token(v))) tick(b, ally, 2, u);
    growth(b, u, 2);
   }
  } else if (u.id === 'impalerApex') {
   for (const e of living(b).filter(e => wallOf(e) === wallOf(target))) {
    hit(b, u, e, power, true, { ignoreArmor: true });
    if ((e.weakpoints || 0) > 0) warp(b, e, 2, u);
   }
  } else {
   hit(b, u, target, power);
  }
 }
 function xenoExtras(b, u, dt) {
  if (u.id === 'geneSplicer') {
   u.spliceTimer = (u.spliceTimer || 0) + dt;
   if (u.spliceTimer >= 5) {
    u.spliceTimer = 0;
    const helix = neighbors(b, u, false).find(v => !v.removed && ['chitinHelix', 'acidHelix', 'psionicHelix'].includes(v.id));
    if (helix) {
     const strain = helix.id.replace('Helix', '');
     consume(b, u, helix, 'Gene-Splicing', 0);
     const specimen = allies(b, u).find(v => isXenoSpecimen(v) && !isXenoApex(v));
     if (specimen) {
      growth(b, specimen, 3);
      addGenome(b, specimen, 12, strain);
     }
     if (strain === 'chitin') {
      const e = living(b)[0];
      if (e) trueHit(b, u, e, atk(b, u) * 2);
     } else if (strain === 'acid') {
      const e = living(b)[0];
      if (e) acidPool(b, u, e.p, 3, 30);
     } else {
      for (const e of living(b)) if ((e.weakpoints || 0) > 0) status(b, e, 'stun', 1.0, 0, u);
     }
    }
   }
  }
 }

// Forbidden Texts: persistent progression is separate from temporary combat effects.
 const COSMIC_BRANCHES={
  'abyss+abyss':['rlyehHerald','deepGrimoire','cthulhu'],
  'astral+astral':['gateHerald','astralGrimoire','yogSothoth'],
  'flesh+flesh':['broodHerald','fleshGrimoire','shubNiggurath'],
  'abyss+astral':['yellowHerald','yellowGrimoire','kingInYellow'],
  'abyss+flesh':['brainHerald','brainGrimoire','elderBrain'],
  'astral+flesh':['chaosHerald','chaosGrimoire','azathoth']
 };
 const cosmicPair=s=>s?.length>=2?[...s.slice(0,2)].sort().join('+'):null;
 const isIdol=u=>family(u)==='slumberingIdol';
 const cosmicApex=u=>isIdol(u)&&card(u.id).rarity==='Mythic';
 const cosmicUnits=b=>b.units.filter(u=>!u.removed&&card(u.id).genre==='Lovecraft');
 const deployedIdols=b=>cosmicUnits(b).filter(u=>isIdol(u)&&!token(u)).sort((a,z)=>a.uid-z.uid);
 const pageAura=(b,u,script)=>neighbors(b,u).some(v=>v.id===script+'Page');
 function updateIdol(b,u){
  if(!isIdol(u)||token(u)||u.removed||cosmicApex(u))return;
  const scripts=u.scripts||[],p=u.syllables||0,pair=cosmicPair(scripts),branch=COSMIC_BRANCHES[pair];
  let id='slumberingIdol';
  if(p>=25&&scripts[0])id={abyss:'drownedIdol',astral:'keyIdol',flesh:'wombIdol'}[scripts[0]];
  if(p>=65&&branch)id=branch[0];
  if(u.id!==id)evolve(b,u,id);
  if(p>=130&&branch){const relic=neighbors(b,u).find(v=>v.id===branch[1]&&!token(v));if(relic){
   // Capture the finite awakening snapshot before any new form or growth can affect it.
   const absorption=branch[2]==='elderBrain'?cosmicUnits(b).filter(v=>v!==u).reduce((n,v)=>n+rawAtk(v)*.5,0):0;
   consume(b,u,relic,'Forbidden Binding',0);evolve(b,u,branch[2]);
   if(u.id==='elderBrain'&&!u.brainAbsorbed){u.brainAbsorbed=true;u.permanentAtkBonus=(u.permanentAtkBonus||0)+absorption;persist(b,u);}
   if(u.id==='shubNiggurath'){spawnYoung(b,u);u.youngAt=b.time+6;}
   (b.metrics.cosmicAwakenings??=[]).push({id:u.id,stage:b.run.depth+1,time:b.time});
  }}
  persist(b,u);
 }
 function dropPage(b,source,script){
  if(!source||source.removed)return null;
  script=script||['abyss','astral','flesh'][Math.floor(rand(b.run)*3)];
  const v=spawnToken(b,source,script+'Page',true,{tokenAtk:0,attackInterval:0,origin:script+'Page'});
  b.metrics[v?'pagesDropped':'pagesLost']=(b.metrics[v?'pagesDropped':'pagesLost']||0)+1;return v;
 }
 function addSyllables(b,n,source,script=null,chant=false){
  for(const u of deployedIdols(b)){u.syllables=(u.syllables||0)+n;persist(b,u);updateIdol(b,u);}
  if(chant){b.run.cosmicChantRemainder=(b.run.cosmicChantRemainder||0)+n;while(b.run.cosmicChantRemainder>=10){b.run.cosmicChantRemainder-=10;dropPage(b,source,script);}}
 }
 function forgeGrimoire(b,u){
  const pair=cosmicPair(u.pageRecipe),branch=COSMIC_BRANCHES[pair];if(!branch)return false;
  const slot=[0,1,2,3,4,5,6,7,8].find(s=>!slotOccupied(b,s));if(slot==null)return false;
  const src=instance(b.run,branch[1]);b.run.roster.push(src);const v=runtime(b,src,slot);prepareHooks(b,v);b.units.push(v);record(b,v);
  u.pageRecipe=[];persist(b,u);b.metrics.grimoiresForged=(b.metrics.grimoiresForged||0)+1;
  interact(b,u,v,'forge','Two forbidden pages → '+card(v.id).name);for(const idol of deployedIdols(b))updateIdol(b,idol);return true;
 }
 function decipherPage(b,u){
  if((u.pageRecipe||[]).length>=2){forgeGrimoire(b,u);if(u.pageRecipe.length>=2)return false;}
  const page=neighbors(b,u).filter(v=>['abyssPage','astralPage','fleshPage'].includes(v.id)).sort((a,z)=>a.slot-z.slot)[0];if(!page)return false;
  const script=card(page.id).cosmicScript;consume(b,u,page,'Decipher',0);
  const idol=deployedIdols(b).find(v=>(v.scripts||[]).length<2);if(idol){idol.scripts=[...(idol.scripts||[]),script];persist(b,idol);}
  u.pageRecipe=[...(u.pageRecipe||[]),script];persist(b,u);addSyllables(b,12,u,script,false);
  if(script==='abyss')for(const e of living(b).slice(0,2))cosmicPanic(b,u,e,1.5);
  if(script==='astral')for(const e of living(b).slice(0,2))warp(b,e,3,u);
  if(script==='flesh'){const v=neighbors(b,u).filter(v=>!token(v)).sort((a,z)=>rawAtk(a)-rawAtk(z)||a.uid-z.uid)[0];if(v)growth(b,v,3);}
  forgeGrimoire(b,u);return true;
 }
 function cosmicPanic(b,u,e,seconds){
  if(e.gone||e.hp<=0||((e.boss||e.champion)&&e.enraged))return;
  if(e.boss||e.champion)seconds*=.5;
  e.retreatingUntil=Math.max(e.retreatingUntil||0,b.time+seconds);e.panicUntil=e.retreatingUntil;e.panic=true;
  cosmicStatus(b,e,'panic',u);
 }
 function cosmicStatus(b,e,type,source){
  if(b.cosmicReaction||e.gone||e.hp<=0)return;
  e.cosmicStatusAt??={};if(b.time<(e.cosmicStatusAt[type]??-Infinity))return;e.cosmicStatusAt[type]=b.time+1;
  b.cosmicReaction=true;
  try{
   // Cast-generated statuses never feed the casting Eye back into itself.
   if(source?.id!=='eye')for(const eye of cosmicUnits(b).filter(v=>v.id==='eye'&&!token(v)))tick(b,eye,1,source);
   if(source&&['slow','stun','freeze','warp','panic'].includes(type)&&b.time>=(e.yellowReactionAt??-Infinity)){
    const king=cosmicUnits(b).find(v=>v.id==='kingInYellow');
    const herald=cosmicUnits(b).find(v=>v.id==='yellowHerald'&&e.yellowBrand===v.uid);
    if(king||herald){e.yellowReactionAt=b.time+1;const u=king||herald,targets=king?[e,...living(b).filter(v=>v!==e&&Math.abs(v.p-e.p)<=2.5).slice(0,2)]:[e];for(const v of targets)trueHit(b,u,v,king?180+1.5*rawAtk(u):140);}
   }
  }finally{b.cosmicReaction=false;}
 }
 function cosmicReward(b){if(!cosmicUnits(b).some(u=>u.id==='shubNiggurath'))return;for(const v of cosmicUnits(b).filter(u=>!token(u)))growth(b,v,2);}
 function cosmicDeath(b,e,source){
  cosmicReward(b);
  if(e.cosmicCursed&&priority(e)){const u=cosmicUnits(b).find(v=>v.uid===e.cosmicCursed)||cosmicUnits(b).find(v=>!token(v));if(u)dropPage(b,u);}
  if(source?.id==='mass'&&cosmicPrimary(b)==='flesh')spawnToken(b,source,'mindLarvaToken',true,{tokenAtk:11,attackInterval:1,origin:'larva'});
 }
 function cosmicPrimary(b){const u=deployedIdols(b)[0];return u?.scripts?.[0]||card(u?.id||'slumberingIdol').cosmicScript||card(u?.id||'slumberingIdol').cosmicPair?.split('+')[0];}
 function spawnYoung(b,u){for(let i=0;i<4;i++)if(!spawnToken(b,u,'darkYoung',true,{tokenAtk:rawAtk(u)*.75,attackInterval:.5,origin:'darkYoung'}))break;}
 function cosmicAttack(b,u,target,power){
  const id=u.id;target.cosmicCursed=u.uid;
  if(id==='blindAstrologer'){for(const e of living(b).slice(0,2))hit(b,u,e,power);if(u.attackCount%4===0&&!token(u)){addSyllables(b,4,u,null,true);if(rand(b.run)<.45)dropPage(b,u);}return;}
  if(family(u)==='larva'){hit(b,u,target,power*(u.attackCount%5===0?2:1));status(b,target,'slow',3,.2,u);if(u.attackCount%5===0&&!token(u))addSyllables(b,3,u,'flesh',true);return;}
  if(id==='darkYoung'){armorStrip(target,.25);hit(b,u,target,power);status(b,target,'slow',3,.2,u);return;}
  if(id==='mass'){const script=cosmicPrimary(b);for(const e of living(b).slice(0,script==='flesh'?3:1))hit(b,u,e,power);if(script==='abyss')status(b,target,'slow',3,.35,u);if(script==='astral'&&u.attackCount%4===0)warp(b,target,2,u);return;}
  if(id==='drownedIdol'){for(const e of living(b).slice(0,2))hit(b,u,e,power);if(u.attackCount%6===0)cosmicPanic(b,u,target,1.2);return;}
  if(id==='keyIdol'){hit(b,u,target,power,true,{ignoreArmor:true});if(u.attackCount%5===0)warp(b,target,2.5,u);return;}
  if(id==='wombIdol'){hit(b,u,target,power);dot(b,target,'bleed',8,4,u);return;}
  if(id==='yellowHerald')target.yellowBrand=u.uid;
  if(id==='brainHerald')target.neuralInfection={owner:u.uid,until:b.time+4,at:target.neuralInfection?.at??b.time+1};
  if(id==='chaosHerald'){const e=living(b).find(priority)||target;if(priority(e))armorStrip(e,.4);hit(b,u,e,power*(priority(e)?2:1));return;}
  if(id==='azathoth'){for(const e of living(b).slice(0,6)){trueHit(b,u,e,rawAtk(u));if(u.attackCount%4===0&&(e.boss||e.champion)&&e.hp>0){damage(b,e,e.hp*.15,u,'ability',true);warp(b,e,3,u);}}return;}
  hit(b,u,target,power);
 }
 function cosmicExtras(b,u){
  if(isIdol(u))updateIdol(b,u);
  if(u.id==='archivist'){if((u.pageRecipe||[]).length>=2)forgeGrimoire(b,u);if(b.time>=(u.decipherAt??5)){u.decipherAt=b.time+5;decipherPage(b,u);}}
  if(['wombIdol','broodHerald'].includes(u.id))u.mimic=Math.max(0,...neighbors(b,u).map(v=>base(v)))*(u.id==='wombIdol'?.3:.5);
  if(u.id==='broodHerald'&&b.time>=(u.broodAt??8)){u.broodAt=b.time+8;spawnToken(b,u,'mindLarvaToken',true,{tokenAtk:11,attackInterval:1,origin:'larva'});}
  if(u.id==='shubNiggurath'&&b.time>=(u.youngAt??0)){u.youngAt=b.time+6;spawnYoung(b,u);}
  if(['rlyehHerald','cthulhu'].includes(u.id)&&b.time>=(u.roarAt??6)){u.roarAt=b.time+6;for(const e of (u.id==='cthulhu'?living(b).filter(e=>!e.boss&&!e.champion):living(b).slice(0,2))){cosmicPanic(b,u,e,u.id==='cthulhu'?3:2);if(u.id==='cthulhu')e.psychicDread={owner:u.uid,until:b.time+3};}}
  if(u.id==='elderBrain'&&b.time>=(u.hijackAt??5)){u.hijackAt=b.time+5;const e=[...living(b)].sort((a,z)=>z.hp-a.hp)[0];if(e){status(b,e,'stun',4,0,u);e.hijack={owner:u.uid,until:b.time+4,at:b.time+1};}}
 }
 function tickCosmic(b,dt){
  const sources=cosmicUnits(b),cthulhu=sources.find(u=>u.id==='cthulhu'),rlyeh=sources.filter(u=>u.id==='rlyehHerald');
  for(const e of living(b)){
   const slowSource=cthulhu||rlyeh.find(u=>wallOf(e)===pumpWall(u));if(slowSource){let s=e.slows.find(s=>s.cosmicWater);const power=(slowSource.id==='cthulhu'?.35:.4)*((e.boss||e.champion)?.5:1);if(s){s.power=power;s.until=b.time+.2;}else e.slows.push({cosmicWater:true,power,until:b.time+.2});}
   const dread=e.psychicDread;if(dread?.until>b.time){const u=sources.find(u=>u.uid===dread.owner);if(u)trueHit(b,u,e,150*dt);}
   for(const key of ['neuralInfection','hijack']){const effect=e[key];if(!effect||effect.until<b.time||effect.at>b.time)continue;effect.at=b.time+1;const u=sources.find(u=>u.uid===effect.owner);if(u)for(const v of living(b).filter(v=>Math.abs(v.p-e.p)<=2.5))trueHit(b,u,v,rawAtk(u)*(key==='hijack'?2:.5));}
  }
 }
 function cosmicCrossing(b,e,from){
  if(e.gone||e.hp<=0||e.p<=from)return;
  const yog=cosmicUnits(b).find(u=>u.id==='yogSothoth'),gate=cosmicUnits(b).find(u=>u.id==='gateHerald');
  const u=yog||gate;if(!u)return;e.cosmicGates??={};
  for(const corner of yog?[8,12]:[8])if(from<corner&&e.p>=corner&&!e.cosmicGates[corner]){e.cosmicGates[corner]=true;trueHit(b,u,e,yog?220+teamPower(b):120);warp(b,e,yog?5:3,u);break;}
  if(yog&&!b.cosmicRewindUsed&&!e.boss&&!e.champion&&e.hp>0&&e.p>=15.5){b.cosmicRewindUsed=true;e.p=8;status(b,e,'stun',2.5,0,yog);}
 }

 function runtime(b, u, slot, phantom = false) {
  const d = card(u.id), pos = xy(slot);
  let baseAtk = d.baseAtk;
  let attackInterval = d.attackInterval;
  if (['stair13', 'redRaincoat'].includes(d.evolvedFrom || d.id)) attackInterval = 0;
  if (isUrbanInvestigator(u)) {
   const r = urbanInvestigatorRealmForDread(u.dread || 0);
   const stats = [[8, 1.3], [24, 1.1], [50, 0.85], [90, 0.65]][r];
   baseAtk = stats[0]; attackInterval = stats[1];
  }
  if (isPractitioner(u)) {
   const r = practitionerRealmForQi(u.qi || 0);
   if (r === 0) { baseAtk = 6; attackInterval = 1.5; }
   else if (r === 1) { baseAtk = 18; attackInterval = 1.2; }
   else if (r === 2) { baseAtk = 40; attackInterval = 1.0; }
   else { baseAtk = 75; attackInterval = 0.75; }
  }
  return {
   ...u, ...pos, scripts:[...(u.scripts||[])], pageRecipe:[...(u.pageRecipe||[])], arm:u.arm||d.cyberArm||null, os:u.os||d.cyberOS||null, heat:20, ram:0, ramAttacks:0, sandyCharge:0, sandyUntil:0, synthesis:{...(u.synthesis||{})}, essences:[...(u.essences||[])], manaStored:0, tempestKills:0, carvings: {...(u.carvings||{})}, mountedHead:null, huntFrenzy:0, huntWall:null, carveAt:6, modules: [...(u.modules || [])], scrapIntake: [...(u.scrapIntake || [])], extraSlot: undefined, apexQi: u.apexQi ?? u.swordQi ?? 0, apexDread: u.apexDread || 0, slot, name: d.name, genre: d.genre, lineage: u.lineage || d.lineage, lineageTier: u.lineageTier || d.lineageTier, baseAtk, attackInterval,
   currentCooldown: .15 + rand(b.run) * .25,
   threshold: { current: u.threshold || 0, max: d.max || 0, onTrigger: null },
   state: 'active', stateRemaining: 0, removed: false, phantom, mimic: 0, scale: phantom ? .5 : 1,
   attackCount: 0, naniteCrits: u.naniteCrits || 0, critCount: u.critCount || 0, breedAt: 1, overclock: false,
   cycle: 0, clockRemaining: 0, critGift: false, manualUntil: 0, herbSpeed: 0, emptySpeed: 0, hasteUntil: 0, lastFlip: -99,
   ventAt: 0, herbAt: 12, sacrificeAt: 18, offeringSpeed: 0, eliteHits: 0, feedAt: d.id === 'herald' ? 12 : 6,
   summonAt: 12, madnessAt: 8, flash: 0, spatialRole: { isCenter, isCorner, isEdge, sharesRowOrCol },
   onAdjacentAttack: null, onAdjacentStateFlip: null, onAdjacentTrigger: null,
   qi: u.qi || 0, realm: isPractitioner(u) ? practitionerRealmForQi(u.qi || 0) : (isUrbanInvestigator(u) ? urbanInvestigatorRealmForDread(u.dread || 0) : (u.realm || 0)), dread: u.dread || 0, violations: u.violations || 0, blackouts: u.blackouts || 0, busSweepAt: 8, abductAt: 6, swordQi: u.swordQi || 0, souls: u.souls || 0, bladeKills: u.bladeKills || 0, demonAtkBonus: u.demonAtkBonus || 0,
   bloomAt: 8, mistAt: 4, brewAt: 8, pillSpeedUntil: 0, missileAt: 5, banishAt: 10
  }
 }

 function prepareHooks(b, u) {
  u.threshold.onTrigger = () => trigger(b, u);
  u.onAdjacentAttack = v => { if (!token(u) && ['jade'].includes(family(u))) tick(b, u, 1, v) };
  u.onAdjacentStateFlip = v => {
   u.lastFlip = b.time; u.lastFlipSource = v;
  };
  u.onAdjacentTrigger = () => { u.flash = .4 };
 }

 function deploy(r) {
  if (r.phase !== 'ready') throw Error('Deployment requires a selected battle');
  const b = { run: r, time: 0, units: [], enemies: [], effects: [],  metrics: { kills: 0, leaks: 0, growth: 0, triggers: 0, devours: 0 }, spawned: 0, enemyUid: 0, spawnAt: 0, done: false, won: false, statusEvents: 0 };
  let picked;
  if(r.roster.some(u=>isMech(u)&&((u.alloy||0)>=120||u.titanUnlocked))){
   const layout=reserveDeployment(r);picked=layout.picked;
   b.units=picked.map(u=>{const slots=layout.placements.get(u.uid),v=runtime(b,u,slots[0]);v.extraSlot=slots[1];return v;});
  }else{
   picked=shuffle(r,r.roster).slice(0,9);const slots=shuffle(r,[0,1,2,3,4,5,6,7,8]);
   b.units=picked.map((u,i)=>runtime(b,u,slots[i]));
  }
  b.units.sort((a, z) => a.uid - z.uid);
  b.units.filter(isPractitioner).forEach(u => updatePractitionerRealm(b, u));
  b.units.filter(isUrbanInvestigator).forEach(u => updateUrbanInvestigatorRealm(b, u));
  b.units.filter(isUrbanLegend).forEach(u => updateUrbanLegendLineage(b, u));
  b.units.forEach(u => prepareHooks(b, u));
  b.units.forEach(u => record(b, u));
  r.phase = 'combat'; r.lastDraw = picked.map(u => u.uid);
  b.units.filter(isMech).forEach(u=>updateMech(b,u));
  b.plan = wavePlan(r);
  startHeavenlyTrial(b);
  startUrbanContainmentTrial(b);
  startUrbanLegendTrial(b);
  startArcaneTrial(b);
  startAbilities(b);
  
  return b;
 }

 function startAbilities(b) {
  if (b.openingResolved) return; b.openingResolved = true;
  const snap = new Map(b.units.map(u => [u.uid, base(u)]));
  for (const u of b.units.filter(u => u.id === 'mass')) u.mimic = Math.max(0, ...neighbors(b, u).map(v => snap.get(v.uid) - base(u)));
  // Only cards with an explicit opening-summon rule create a token here.
  for (const u of [...b.units].filter(v => !v.removed && !token(v) && ['shepherd'].includes(v.id))) summon(b, u);
  for (const u of [...b.units].filter(v => !v.removed && !token(v) && ['cub', 'alchemist', 'harvester'].includes(family(v)))) devour(b, u);
  startBloodlineTrial(b);
  for (const u of b.units.filter(v => !v.removed && v.id === 'herb')) teamCharge(b, u, 3);
  b.units.forEach(u => bindUrbanRelic(b, u));
  if (b.units.some(u => !u.removed && u.id === 'ruleArchitect')) {
   b.architectActive = true;
  }
  if (b.units.some(u => !u.removed && u.id === 'redPhone')) {
   const dur = 10 * mod(b.run, 'buffDuration');
   for (const u of b.units.filter(v => !v.removed && card(v.id).genre === 'Haunted')) u.hotlineUntil = b.time + dur;
   fx(b, 'state', null, null, 'RED HOTLINE');
  }
  for(const u of [...cosmicUnits(b)])cosmicExtras(b,u);
  flushEvents(b);
 }

 function herbOffering(b, u) {
  const recipient = allies(b, u).filter(v => v.attackInterval > 0 && !token(v) && card(v.id).genre === 'Cultivation').sort((a, z) => rawAtk(z) - rawAtk(a) || a.uid - z.uid)[0];
  if (!recipient) return false;
  consume(b, recipient, u, 'Offering', 10); recipient.offeringSpeed += .15; flushEvents(b); return true;
 }

 function rawAtk(u) { return (u.tokenAtk != null ? u.tokenAtk + (u.permanentAtkBonus || 0) : (base(u) + (u.mimic || 0))) * u.scale }

 function atk(b, u) {
  let m = 1 + (b.run.relics.includes('blade') ? .12 : 0) + (b.run.legacyPower || 0);
  if (allies(b, u).some(v => family(v) === 'spirit' && (v.state === 'dormant' || v.spiritBuffUntil > b.time))) m += .2 * mod(b.run, 'buffPower');
  if (isMechanical(u) && neighbors(b,u).some(v=>v.id==='titanReactor')) m *= 1.2;
  if (isApexImmortal(u) && neighbors(b, u, false).some(v => !v.removed && (isCultivationRelic(v) || isUrbanRelic(v)))) m *= 1.2;
  if (card(u.id).genre === 'Haunted' && b.curfewUntil > b.time) m *= 1.2;
  return (rawAtk(u) + (u.id === 'railgun' ? highestGrowth(b, u) * (b.units.some(v => !v.removed && v.id === 'impalerApex') ? 2.5 : 2) : 0)) * m * mod(b.run, 'damage') * mod(b.run,'basicDamage')
 }

 function speed(b, u) {
  let n = 1 + (b.run.relics.includes('clock') ? .1 : 0) + (u.emptySpeed + (u.offeringSpeed || 0) + (u.hasteUntil > b.time ? .15 : 0) + (u.manualUntil > b.time ? .25 : 0) + (u.pillSpeedUntil > b.time ? .15 : 0) + (u.hotlineUntil > b.time ? .20 : 0)) * mod(b.run, 'buffPower');
  if (support(b, 'matriarch') && BLOODLINE_FODDER.includes(species(u))) n += .4 * mod(b.run, 'buffPower');
  if ((isCultivationRelic(u) || isUrbanRelic(u)) && neighbors(b, u, false).some(v => !v.removed && isApexImmortal(v))) n *= 1.25;
  const inBlackout = b.curfewUntil > b.time;
  const hasDirector = b.units.some(v => !v.removed && v.id === 'curfewDirector');
  if (card(u.id).genre === 'Haunted') { if (hasDirector) n *= 1.6; else if (inBlackout) n *= 1.4; }
  if (family(u) === 'mannequin' && (inBlackout || allies(b, u).some(v => v.state !== 'active'))) {
   n *= (u.id === 'livingTaboo' && inBlackout ? 3.0 : 2.5);
  }
  if(pageAura(b,u,'flesh'))n+=.15;
  n += u.arcaneHasteUntil>b.time?.2:0;
  n += (huntAura(b,u,'beast')?.2:0)+(relicAura(b,u,'beastRelic')?.25:0)+(u.huntFrenzy||0);
  return n * (isCyber(u)&&!cyberApex(u)&&u.sandyUntil>b.time?2.5:1) * (1 + (u.permanentSpeed || 0)) * (u.overclock ? 1 + 2 * mod(b.run, 'buffPower') : 1) * mod(b.run, 'speed')
 }

 function sensor(b, u) { return support(b, 'sensor') && u.id !== 'sensor' ? 1 : 0 }
 function crit(b, u, e = null) {
  if(u.id==='razorPhantom')return 1;
  const lt = lineageTierIds[u.id]?.tier || 0, lineageCrit = u.lineage === 'tiger' && lt >= 1 ? .15 : u.lineage === 'monkey' && lt >= 1 ? .10 : 0;
  if (u.id === 'livingTaboo' && b.curfewUntil > b.time) return 1.0;
  if (family(u) === 'mannequin' && allies(b, u).some(v => v.state !== 'active')) return 1.0;
  if (u.critGift) return 1.0;
  const manualCrit = (u.manualUntil && u.manualUntil > b.time) ? 0.15 : 0;
  const rawCrit = Math.max(0, .1 + mod(b.run, 'crit', 0) + (b.run.relics.includes('lens') ? .1 : 0) + sensor(b, u) * .1 + (support(b, 'core') && u.id !== 'core' ? .15 : 0) + (augmented(u)&&neighbors(b,u).some(v=>v.id==='biomonitor')?.15:0) + lineageCrit + manualCrit + (huntAura(b,u,'witch')?.25:0)+(relicAura(b,u,'witchRelic')?.2:0) + ((e?.weakpoints||0)*.05) + (b.units.some(v=>!v.removed&&v.id==='hiveOvermind')?.30:0) + (allies(b,u).some(v=>v.id==='synapseNexus')?.20:0) + (neighbors(b,u).some(v=>v.id==='psionicHelix')?.15:0));
  return isSciFi(u) ? rawCrit : Math.min(1.0, rawCrit);
 }
 function critMultiplier(b, u, e = null) {
  const critRate = crit(b, u, e);
  const excessCritDamage = isSciFi(u) ? Math.max(0, (critRate - 1.0) * 0.5) : 0;
  const baseCritMultiplier = (u.id === 'impalerApex' && (e?.weakpoints || 0) > 0) ? 2.6 : null;
  const tigerBleedCrit = u.lineage === 'tiger' && (lineageTierIds[u.id]?.tier || 0) >= 2 && (e?.bleeds || []).some(d => d.until > b.time);
  const mannequinCritBonus = family(u) === 'mannequin' && (b.curfewUntil > b.time || allies(b, u).some(v => v.state !== 'active')) ? 1 : 0;
  return (baseCritMultiplier ?? (tigerBleedCrit ? 3 : 2)) + sensor(b, u) * .3 + mod(b.run, 'critDamage', 0) + mannequinCritBonus + (neighbors(b,u).some(v=>v.id==='chitinHelix')?.25:0) + (b.units.some(v=>!v.removed&&v.id==='hiveOvermind')?.30:0) + excessCritDamage;
 }
 function downtime(b, u, duration, state) { if (support(b, 'smelter')) duration -= 1; if (state === 'dormant' && support(b, 'medium')) duration -= 2; if (['burnout', 'overheat'].includes(state) && support(b, 'vent')) duration *= .5; return Math.max(.5, duration) }

 function flip(b, u, state, duration = 0) {
  if (family(u) === 'spirit' && state === 'dormant') u.spiritBuffUntil = b.time + downtime(b, u, duration, state) * mod(b.run, 'buffDuration');
  const previous = u.state; u.state = state; u.stateRemaining = state === 'active' ? 0 : downtime(b, u, duration, state); u.overclock = false;
  for (const v of allies(b, u)) v.onAdjacentStateFlip(u);
  fx(b, 'state', u, null, state === 'active' ? 'RETURN' : state.toUpperCase());
  if (state !== 'active') {
   for (const v of allies(b, u)) {
    if (v.id === 'vent' && ['burnout', 'overheat'].includes(state)) interact(b, v, u, 'coolant', `downtime shortened to ${u.stateRemaining.toFixed(1)}s`);
    if (v.id === 'smelter') interact(b, v, u, 'downtime', `downtime shortened to ${u.stateRemaining.toFixed(1)}s`);
   }
  }
  if (state !== 'active') event(b, 'shutdown', { unit: u, state });
  if (previous === 'dormant' && state === 'active' && family(u) === 'spirit') { growth(b, u, 1); u.returns = (u.returns || 0) + 1; persist(b, u); if (u.id === 'spirit' && u.returns >= 5) evolve(b, u, 'wraith'); }
  if (state !== 'active') 
  if (family(u) === 'spirit' && state === 'dormant') for (const e of living(b)) status(b, e, 'slow', 3, .25, u);
 }

 function tick(b, u, n, source = null) {
  if (u.removed || token(u) || !u.threshold.max || ['lotus', 'monk'].includes(u.id)) return;

  u.threshold.current += n * (abilityGauge(u) ? mod(b.run, 'gauge')*(pageAura(b,u,'astral')?1.2:1) : 1);
  let guard = 0;
  while (u.threshold.current >= u.threshold.max && u.threshold.max && guard++ < 2) {
   if (u.nextTrigger > b.time || u.state !== 'active') break;
   u.threshold.current -= u.threshold.max; u.triggerSource = source; trigger(b, u);
   if(arcaneGauge(u)&&u.threshold.current>0)storeOverflow(b,u,u.threshold.current);
  }
 }

 function trigger(b, u) {
  if (abilityGauge(u)) event(b, 'gauge', { unit: u });
  b.metrics.triggers++; record(b, u).triggers++; u.flash = .65;
  for (const v of allies(b, u)) { v.onAdjacentTrigger(u); }
  if(arcaneGauge(u)){elementalSpell(b,u);return;}
  switch (family(u)) {
   case 'spirit': flip(b, u, 'dormant', 5); break;
   case 'jade': grantGrowth(b, u, 3); u.qiGrowth = (u.qiGrowth || 0) + 3; persist(b, u); event(b, 'breakthrough', { unit: u }); if (u.id === 'jade' && u.qiGrowth >= 18) evolve(b, u, 'immortal'); interact(b, u.triggerSource || u, u, 'breakthrough', 'breakthrough, +3 permanent ATK');  break;
   case 'eye': u.nextTrigger = b.time + 4; addSyllables(b,8,u,'astral',true); for (const e of living(b).slice(0, 2)) status(b, e, 'vulnerable', 4, .15, u); interact(b, u.triggerSource || u, u, 'warp', 'control gauge filled · Warp'); for (const e of living(b).slice(0, 2)) { trueHit(b, u, e, 150 + teamPower(b) * .75); warp(b, e, 4, u); fx(b, 'warp', u, e, (e.boss || e.champion) ? (e.enraged ? 'RESIST' : 'WARP −2') : 'WARP −4') } break;
   case 'lantern': u.nextTrigger = b.time + 2; for (const e of living(b)) hit(b, u, e, 45, false); interact(b, u, u, 'echo-burst', '10 Echoes → shockwave'); break;
   case 'core': u.nextTrigger = b.time + 6; for (const e of living(b)) { trueHit(b, u, e, 240 + teamPower(b) * 2); warp(b, e, 2.5, u); } interact(b, u, u, 'singularity', '8 critical hits → collapse'); break;
  }
 }

 function status(b, e, type, seconds, power = 0, source = null) {
  if (e.hp <= 0 || e.gone) return;
  if (e.boss || e.champion) { if (type === 'slow') power *= .5; if (type === 'stun' || type === 'freeze') { if (e.enraged) return; seconds *= .5 } }
  const fresh=type==='slow'?!e.slows.some(s=>s.power===power&&s.until>b.time):['stun','freeze'].includes(type)?!(e.frozenUntil>b.time):true;
  if (type === 'slow') { const previous = e.slows.find(s => s.power === power); if (previous) { previous.until = Math.max(previous.until, b.time + seconds); previous.sourceUid = source?.uid ?? previous.sourceUid } else e.slows.push({ until: b.time + seconds, power, sourceUid: source?.uid }) }
  else if (type === 'stun' || type === 'freeze') e.frozenUntil = Math.max(e.frozenUntil || 0, b.time + seconds);
  else if (type === 'burn') { if (source) dot(b, e, 'burn', power, seconds, source); else (e.burns ??= []).push({ until: b.time + seconds, dps: power }); return }
  else if (type === 'vulnerable') { e.vulnerableUntil = b.time + seconds; e.vulnerability = power; cosmicStatus(b,e,type,source); return }
  else if (type === 'bleed') { if (source) dot(b, e, 'bleed', power, seconds, source); else e.bleeds.push({ until: b.time + seconds, dps: power }); return }
  else return;
  b.statusEvents++; if(fresh)cosmicStatus(b,e,type,source)
 }

 function damage(b, e, n, source = null, channel = 'direct', exact = false) {
  if (e.hp <= 0 || e.gone) return 0;
  if(!exact){if(b.units.some(u=>!u.removed&&u.id==='kingInYellow'))n*=1.35;if(channel==='ability'&&e.abyssDreadUntil>b.time)n*=1.1;}
  if (e.ruleMarks && !exact) n *= (1 + e.ruleMarks * 0.08);
  if(n>0&&source&&card(source.id).genre==='Lovecraft')e.cosmicCursed=source.uid;
  const actual = Math.min(e.hp, Math.max(0, n));
  if (source) { const row = record(b, source); row.damage += actual; row[channel] += actual; }
  e.hp -= actual;
  if (e.hp <= 0) {
   e.hp = 0; if (e.champion) recordTrial(b, e, true); if ((e.maxProgress || e.p) >= 12) b.metrics.closeCalls = (b.metrics.closeCalls || 0) + 1;
   e.gone = true; b.metrics.kills++; b.run.stats.kills++;
   if (e.subjectZero && b.urbanContainmentTrial?.status === 'active') {
    if ((e.ruleMarks || 0) >= b.urbanContainmentTrial.marksRequired) passUrbanContainmentTrial(b, e);
    else failUrbanContainmentTrial(b, `Subject Zero defeated with only ${e.ruleMarks || 0}/5 Violation Marks`);
   }
   salvage(b);
   harvestTrophy(b,e);arcaneKill(b);cyberDeath(b,e);cosmicDeath(b,e,source);
   if (e.rumorInfected) spreadRumor(b, e, true);

   // Soul Banner captures souls track-wide on any enemy death
   for (const banner of b.units.filter(v => !v.removed && v.id === 'soulBanner')) {
    banner.souls = Math.min(100, (banner.souls || 0) + 1);
    persist(b, banner);
    if (banner.souls === 100 && !banner.soulMaxLogged) {
     banner.soulMaxLogged = true;
     fx(b, 'state', banner, null, 'SOULS 100/100');
    }
   }
   startHeavenlyTrial(b);

   // Soul-Reaping Heavenly Demon perimeter detonation
   const demon = b.units.find(v => !v.removed && v.id === 'soulReapingDemon');
   if (demon) {
    const kp = track(e.p);
    for (const other of living(b)) {
     if (Math.hypot(track(other.p).x - kp.x, track(other.p).y - kp.y) <= 1.5) {
      damage(b, other, 160 * mod(b.run, 'damage'), demon, 'ability');
     }
    }
   }

  }
  if(e.hp>0)visceral(b,e);
  return actual;
 }

 function hit(b, u, e, n, normal = true, options = {}) {
  if (e.hp <= 0 || e.gone) return;
  if(huntAura(b,u,'witch')&&e.hp/e.maxHp<.35)n*=2;
  let torment = normal && !!support(b, 'totem');
  let critChance = crit(b, u, e);
  let critical = options.criticalMultiplier != null || u.id === 'asura' && ((e.permanentShred || 0) > 0 || e.nanoUntil > b.time) || (critChance >= 1.0 || rand(b.run) < critChance);
  if (critical) {
   n *= options.criticalMultiplier ?? critMultiplier(b, u, e);
   if (support(b, 'core') && normal) for (const v of allies(b, u).filter(v => v.id === 'core')) tick(b, v, 1 + (neighbors(b, u).some(v => v.id === 'psionicHelix') ? 1 : 0), u);
   if (support(b, 'sensor') && normal) addWeakpoint(b, e, 1);
   if (u.id === 'nanite') { e.nanoUntil = b.time + 3; u.naniteCrits = (u.naniteCrits || 0) + 1; if (u.naniteCrits % 6 === 0) { grantGrowth(b, u, 1); extractHelix(b, u); } }
   if (u.id === 'impalerMorph') { for (const near of living(b).filter(v => v !== e).slice(0, 2)) hit(b, u, near, n * 0.6, false); }
   if (u.id === 'impalerApex' && (e.weakpoints || 0) > 0) { for (const near of living(b).filter(v => v !== e).slice(0, 3)) hit(b, u, near, n * 0.75, false); }
   if (u.id === 'acidBrood') { armorStrip(e, 0.60); acidPool(b, u, e.p, 3, 30); }
   if (u.id === 'xenoQueen') {
    armorStrip(e, 1.0);
    acidPool(b, u, e.p, 5, 65);
    if (priority(e)) { u.queenCrits = (u.queenCrits || 0) + 1; if (u.queenCrits % 4 === 0) damage(b, e, e.hp * 0.14, u, 'ability', true); }
   }
   if (u.id === 'bileSpitter') { for (const v of living(b).slice(0, 2)) { armorStrip(v, 0.35); dot(b, v, 'burn', 12, 3, u); } }
   if (u.id === 'ravagerMorph') { for (const v of living(b).filter(v => v !== e && Math.min(Math.abs(v.p - e.p), 16 - Math.abs(v.p - e.p)) <= 2)) hit(b, u, v, n * 1.5, false); }
   if (u.id === 'causticRavager') { for (const v of living(b).filter(v => Math.min(Math.abs(v.p - e.p), 16 - Math.abs(v.p - e.p)) <= 2.5)) { armorStrip(v, 0.50); dot(b, v, 'bleed', 40, 4, u); } }
   if (u.id === 'stalkerMorph' && e.hp / e.maxHp < 0.35) n *= 2;
   if (u.id === 'phaseStalker' && priority(e)) {
    u.stalkerCrits = (u.stalkerCrits || 0) + 1;
    if (u.stalkerCrits % 5 === 0) { damage(b, e, 450, u, 'ability', true); status(b, e, 'freeze', 1.2, 0, u); }
   }
   if (!options.sync) {
    for (const nexus of allies(b, u).filter(v => v.id === 'synapseNexus' && touches(u, v))) hit(b, nexus, e, atk(b, nexus), false, { sync: true });
    const over = allies(b, u).find(v => v.id === 'hiveOvermind');
    if (over) damage(b, e, atk(b, over) * 0.75, over, 'ability', true);
   }
  }
  if (critical && u.id === 'asura') { u.critCount = (u.critCount || 0) + 1; if (u.critCount % 6 === 0) grantGrowth(b, u, 1); }
  let defense = (options.ignoreArmor || u.id === 'railgun' ? 0 : e.defense) * (e.nanoUntil > b.time ? .75 : 1);
  defense *= options.armorFactor??1;
  if(pageAura(b,u,'astral'))defense*=.7;
  defense *= (huntAura(b,u,'fiend')?.6:1)*(relicAura(b,u,'fiendRelic')?.7:1);
  damage(b, e, n * (normal ? 1 : mod(b.run, 'damage')) * mod(b.run, priority(e) ? 'eliteDamage' : 'normalDamage') * (1 - defense * (torment ? .75 : 1)) * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), u, normal ? 'direct' : 'ability');
  if (u.id === 'phaseStalker' && !e.boss && !e.champion && e.hp > 0 && e.hp / e.maxHp < 0.35) damage(b, e, e.hp, u, 'ability');
  if(normal&&pageAura(b,u,'abyss')){e.abyssDreadUntil=b.time+3;status(b,e,'slow',3,.2,u);}
  if(normal&&pageAura(b,u,'flesh'))dot(b,e,'bleed',6,4,u);
  if(normal&&huntAura(b,u,'beast'))dot(b,e,'bleed',6,4,u);
  if(normal&&!options.secondary&&huntAura(b,u,'fiend')&&u.hornCleaveAttack!==u.attackCount){u.hornCleaveAttack=u.attackCount;const second=living(b).find(v=>v!==e);if(second)hit(b,u,second,atk(b,u)*.5,true,{secondary:true});}
  if (species(u) === 'flameToad') dot(b,e,'burn',3,3,u);
  if (species(u) === 'scuttler') status(b,e,'slow',2,.15,u);
  if (torment && e.hp > 0) { dot(b, e, 'bleed', 2, 4, u); const totem = support(b, 'totem'); interact(b, totem, u, 'torment', '25% armor penetration + 2 DPS Bleed for 4s'); }
  if (critical && sensor(b, u)) { const src = support(b, 'sensor'); interact(b, src, u, 'critical', 'amplified critical strike'); }
  if (critical && normal) for (const v of allies(b, u).filter(v => v.id === 'core')) tick(b, v, 1, u);
  fx(b, normal ? 'shot' : 'spell', u, e, critical ? 'CRIT' : '');
 }

 function chooseTarget(b, u) {
  let es = living(b);
  if(isCyber(u)&&u.arm==='gorillaImplant')return [...es].sort((a,z)=>z.hp-a.hp||a.uid-z.uid)[0];
  if (species(u) === 'hound') { let low = es.filter(e => e.hp / e.maxHp < .3); if (low.length) return low[0] }
  if (isUrbanLegend(u)) {
   const valid = es.filter(e => isLegendTarget(b, u, e));
   if (!valid.length) return null;
   if (family(u) === 'kuchisake') return [...valid].sort((a, z) => z.speed - a.speed)[0];
   return valid[0];
  }
  if (['stalkerMorph', 'phaseStalker'].includes(u.id)) { const elite = es.find(priority); if (elite) return elite; }
  if (u.id === 'causticRavager') { return es.reduce((best, e) => es.filter(v => Math.min(Math.abs(v.p - e.p), 16 - Math.abs(v.p - e.p)) <= 2.5).length > es.filter(v => Math.min(Math.abs(v.p - best.p), 16 - Math.abs(v.p - best.p)) <= 2.5).length ? e : best, es[0]); }
  if (u.id === 'executioner' || u.lineage === 'tiger' && (lineageTierIds[u.id]?.tier || 0) >= 3) { let elite = es.find(e=>e.alphaQuarry)||es.find(priority); if (elite) return elite }
  return es[0]
 }

 function attack(b, u) {
  const target = chooseTarget(b, u); if (!target) return false;
  if (isUrbanLegend(u) && !isLegendTarget(b, u, target)) return false;
  const inBlackout = b.curfewUntil > b.time;
  if (u.id === 'allSeeingOverseer' && !living(b).some(e => e.swift || e.enraged || e.speedBoostUntil > b.time || e.speed > 0.40)) return false;
  if (isXeno(u)) { u.attackCount++; record(b, u).attacks++; u.flash = .18; xenoAttack(b, u, target, atk(b, u)); return true; }
  u.attackCount++; record(b, u).attacks++; u.flash = .18; let power = atk(b, u);
  for (const v of allies(b, u)) {
   if (family(v) === 'spirit' && (v.state === 'dormant' || v.spiritBuffUntil > b.time)) interact(b, v, u, 'spirit-buff', 'Dormancy → +20% team damage');
  }
  if (u.id === 'wraith' && (target.elite || target.boss || target.champion)) power *= 1.5;

  if(card(u.id).genre==='Lovecraft'&&u.id!=='herald'){cosmicAttack(b,u,target,power);}
  else if(isCyber(u)){cyberAttack(b,u,target,power);}
  else if(isArchon(u)){archonAttack(b,u,target,power);}
  else if(isSlayer(u)){slayerAttack(b,u,target,power);}
  else if(u.id==='witchHunter'){hit(b,u,target,power*(target.shield>0?2:1));}
  else if (isMech(u)) { mechAttack(b,u,target,power); }
  else if(u.id==='hydraulicRiveter'){armorStrip(target,.25);hit(b,u,target,power);}
  else if (family(u) === 'cub') {
   const path=u.lineage || 'dragon', tier=lineageTierIds[u.id]?.tier || 0;
   if(path==='dragon') {
    const targets=living(b), count=tier>=4?6:tier>=3?4:tier>=2&&u.attackCount%4===0?3:2, mult=tier>=2&&u.attackCount%4===0?2:1;
    for(const e of targets.slice(0,count)) hit(b,u,e,power*mult);
   }
   else if(path==='tiger') { const execute=tier>=3&&target.hp/target.maxHp<.4?3:1; hit(b,u,target,power*(tier>=4?4:1)*execute); if(tier>=2) dot(b,target,'bleed',3,4,u); }
   else if(path==='xuanwu') {
    hit(b,u,target,power); status(b,target,'slow',2,.2,u);
    if(tier>=2) venom(b,target,4,4,u);
    if(tier>=2&&u.attackCount%5===0) for(const e of living(b)) trueHit(b,u,e,120);
    if(tier>=3&&(target.swift||target.speedBoostUntil>b.time)){ trueHit(b,u,target,60); status(b,target,'stun',1,u); }
    if(tier>=4){ if(u.attackCount%2===0) warp(b,target,2,u); else venom(b,target,6,4,u); }
   }
   else if(path==='phoenix') {
    hit(b,u,target,power); dot(b,target,'burn',5,4,u);
    if(tier>=2) { const next=living(b).find(e=>e!==target); if(next){ dot(b,next,'burn',5,4,u); status(b,next,'vulnerable',3,.15,u); } status(b,target,'vulnerable',3,.15,u); }
    if(tier>=4) trueHit(b,u,target,power*.25);
   }
   else if(path==='monkey') {
    const targets=living(b), count=tier>=4?8:tier>=3?3:1;
    if(tier>=4) { for(const e of targets.slice(0,count)){ trueHit(b,u,e,power*1.5); e.auras=[]; e.speedBoostUntil=0; if(e.baseSpeed!=null)e.speed=e.baseSpeed; } }
    else for(const e of targets.slice(0,count)) hit(b,u,e,power);
    if(tier>=2&&!token(u)&&u.attackCount%6===0){ const clone=spawnToken(b,u,u.id,false,{lineage:path,lineageTier:tier,tokenAtk:rawAtk(u)*.5,attackInterval:u.attackInterval}); if(clone) interact(b,u,clone,'clone','Sixth strike → 50%-ATK temporary clone'); }
   }
   else hit(b,u,target,power);
  } else if (isPractitioner(u)) {
   u.qiAttackCharge=(u.qiAttackCharge||0)+1;
   if(u.qiAttackCharge>=3){u.qiAttackCharge-=3;addQi(b,u,1);}
   else persist(b,u);
   const r = u.realm || 0;
   if (r === 0) { hit(b, u, target, power); }
   else if (r === 1) { for (const e of living(b).slice(0, 2)) hit(b, u, e, power); }
   else if (r === 2) {
    hit(b, u, target, power);
    const tp = track(target.p);
    for (const e of living(b).filter(e => e !== target && Math.hypot(track(e.p).x - tp.x, track(e.p).y - tp.y) <= 1.5)) {
     hit(b, u, e, power * 0.5);
    }
   }
   else if (r >= 3) {
    const top3 = living(b).sort((a, z) => z.hp - a.hp).slice(0, 3);
    for (const e of top3) hit(b, u, e, power);
   }
  }
  else if (u.id === 'flyingSword') { for (const e of living(b).slice(0, 2)) hit(b, u, e, power); }
  else if (u.id === 'guqin') { for (const e of living(b).slice(0, 3)) { hit(b, u, e, power); status(b, e, 'slow', 3, 0.25, u); } }
  else if (u.id === 'weiqiBoard') { hit(b, u, target, power); damage(b, target, 35, u, 'ability'); }
  else if (u.id === 'inkBrush') { hit(b, u, target, power); status(b, target, 'vulnerable', 4, 0.15, u); }
  else if (u.id === 'demonBlade') { hit(b, u, target, power); dot(b, target, 'bleed', 5, 4, u); }
  else if (u.id === 'swordImmortal') {
   hit(b, u, target, power);
   if (u.attackCount % 4 === 0) {
    for (const e of living(b)) trueHit(b, u, e, rawAtk(u));
    const highestHp = living(b).sort((a, z) => z.hp - a.hp)[0];
    if (highestHp) damage(b, highestHp, highestHp.hp * 0.3, u, 'ability');
    fx(b, 'beam', u, target, 'SWORD TORRENT');
    interact(b, u, u, 'sword-torrent', 'Ten-Thousand Sword Torrent: all 16 tiles + 30% HP strip');
   }
  }
  else if (u.id === 'melodicSaint') {
   for (const e of living(b)) {
    hit(b, u, e, power);
    status(b, e, 'slow', 2, 0.45, u);
    e.dissonance = (e.dissonance || 0) + 1;
    if (e.dissonance >= 5) {
     e.dissonance = 0;
     damage(b, e, 260 * mod(b.run, 'damage'), u, 'ability');
     status(b, e, 'stun', 1.5, 0, u);
    }
   }
  }
  else if (u.id === 'formationMaster') {
   hit(b, u, target, power);
   u.stoneToggle = !u.stoneToggle;
   if (u.stoneToggle) { warp(b, target, 3, u); }
   else { status(b, target, 'stun', 2, 0, u); damage(b, target, 400 * mod(b.run, 'damage'), u, 'ability'); }
  }
  else if (u.id === 'talismanSovereign') {
   hit(b, u, target, power);
   status(b, target, 'vulnerable', 3, 0.70, u);
   if (!target.boss && !target.champion && target.hp / target.maxHp < 0.15) { damage(b, target, target.hp, u, 'direct'); }
  }
  else if (u.id === 'soulReapingDemon') {
   for (const e of living(b).slice(0, 5)) { hit(b, u, e, power * 0.4); }
  }
  else if (u.id === 'boneSaw') {
   hit(b, u, target, power * ((target.elite || target.champion || target.boss) ? 1.5 : 1));
   dot(b, target, 'bleed', 10, 4, u);
  }
  else if (u.id === 'bloodFiendMaster') {
   hit(b, u, target, power);
   if (u.attackCount % 4 === 0) {
    for (const e of living(b).slice(0, 4)) { hit(b, u, e, power * 2.8); dot(b, e, 'bleed', 50, 4, u); }
   }
  }
    else if (isUrbanInvestigator(u) || ['ruleArchitect', 'allSeeingOverseer', 'curfewDirector', 'forensicDemiurge', 'backroomsWarden'].includes(u.id)) {
   if (u.id === 'allSeeingOverseer') {
    for (const e of living(b).filter(e => e.swift || e.enraged || e.speedBoostUntil > b.time || e.speed > 0.40)) {
     hit(b, u, e, power);
     status(b, e, 'freeze', 2.0, 0, u);
     e.swift = false; e.enraged = false; e.speedBoostUntil = 0; e.auras = [];
     e.speed = Math.min(e.speed, 0.30);
    }
    fx(b, 'beam', u, target, 'PANOPTICON');
   } else if (u.id === 'curfewDirector') {
    hit(b, u, target, power * ((target.ruleMarks || 0) > 0 ? 2.0 : 1.0));
    addRuleMark(b, target, 1, u);
   } else if (u.id === 'forensicDemiurge') {
    hit(b, u, target, power);
    dot(b, target, 'bleed', 50, 4, u);
    if (u.attackCount % 4 === 0 && (target.elite || target.boss || target.champion)) {
     damage(b, target, target.maxHp * 0.12, u, 'ability');
     fx(b, 'spell', u, target, '−12% MAX HP');
    }
   } else if (u.id === 'backroomsWarden') {
    for (const e of living(b).slice(0, 3)) {
     hit(b, u, e, power);
     grantUrbanViolation(b, u, 1, e);
     addRuleMark(b, e, 1, null);
    }
    if (b.time >= (u.backroomsAt || 6)) {
     u.backroomsAt = b.time + 6;
     for (const e of living(b).slice(0, 3)) {
      dot(b, e, 'bleed', 150, 4.0 * mod(b.run, 'buffDuration'), u);
      warp(b, e, 6, u);
      fx(b, 'warp', u, e, 'BACKROOMS');
     }
    }
   }
   const r = urbanInvestigatorRealmForDread(u.dread || 0);
   if (u.id === 'ruleArchitect') {
    for (const e of living(b).slice(0, 4)) {
     const violator = (e.ruleMarks || 0) > 0;
     trueHit(b, u, e, power * (violator ? 2.5 : 1));
     addRuleMark(b, e, 1, u);
    }
    if (u.attackCount % 4 === 0) {
     for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0)) { trueHit(b, u, e, 240 + teamPower(b) * 2); fx(b, 'curfew', u, e, 'DETONATE'); }
    }
   } else if (r === 0) {
    hit(b, u, target, power); addRuleMark(b, target, 1, u);
   } else if (r === 1) {
    for (const e of living(b).slice(0, 2)) { hit(b, u, e, power); addRuleMark(b, e, 1, u); }
   } else if (r === 2) {
    hit(b, u, target, power); addRuleMark(b, target, 1, u);
    for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0).slice(0, 3)) { hit(b, u, e, power * 2); }
   } else if (r >= 3) {
    const top3 = [...living(b)].sort((a, z) => z.hp - a.hp).slice(0, 3);
    for (const e of top3) { trueHit(b, u, e, power); addRuleMark(b, e, 1, u); }
   }
  }
  else if (family(u) === 'redRaincoat' || family(u) === 'stair13') {
   return false;
  }
  else if (family(u) === 'kuchisake') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   } else if (!isLegendTarget(b, u, target)) {
    return false;
   }
   const marks = getTabooMark(target, 'kuchisake');
   const mult = marks > 0 ? (u.id === 'slitMouthedSovereign' ? 3.5 : 2.0) : 1.0;
   hit(b, u, target, power * mult);
   const dps = u.id === 'slitMouthedSovereign' ? 35 : u.id === 'scissorBanshee' ? 15 : 5;
   dot(b, target, 'bleed', dps, 4, u);
   markNaturalBreach(b, u, target);
   grantUrbanViolation(b, u, 1, target);
   if (u.id === 'scissorBanshee') {
    const second = living(b).find(e => e !== target && isLegendTarget(b, u, e));
    if (second) hit(b, u, second, power * 0.5);
   }
   if (u.id === 'slitMouthedSovereign') {
    if (!target.boss && !target.champion && target.hp / target.maxHp < executeThreshold(b)) {
     damage(b, target, target.hp, u, 'direct');
     fx(b, 'shot', u, target, 'EXECUTE');
    }
    if (u.attackCount % 6 === 0) {
     const bossTarget = living(b).find(e => e.boss || e.champion);
     if (bossTarget) {
      damage(b, bossTarget, bossTarget.hp * 0.15, u, 'ability');
      fx(b, 'spell', u, bossTarget, '−15% CURRENT HP');
     }
    }
   }
  }
  else if (family(u) === 'nightBus') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   }
   const violators = living(b).filter(e => isLegendTarget(b, u, e));
   if (!violators.length) return false;
   for (const e of violators.slice(0, u.id === 'terminusBus' ? 4 : 2)) {
    hit(b, u, e, power);
    if (!e.gone && e.hp > 0) markNaturalBreach(b, u, e);
    grantUrbanViolation(b, u, 1, e);
   }
  }
  else if (family(u) === 'payphone') {
   const inBlackout = b.curfewUntil > b.time;
   const violators = living(b).filter(e => isLegendTarget(b, u, e));
   if (!violators.length) return false;
   const ringEvery = u.id === 'midnightOperator' ? 2 : 3;
   const isRing = inBlackout || u.attackCount % ringEvery === 0;
   if (inBlackout && b.time - (u.lastRingReactAt || -99) < 1.5) return false;
   if (inBlackout) u.lastRingReactAt = b.time;
   if (isRing) {
    const ringMult = (u.id === 'midnightOperator' || u.id === 'hauntedSwitchboard') ? 1.5 : 1.0;
    for (const e of violators) {
     hit(b, u, e, power * ringMult);
     if (u.id === 'midnightOperator') status(b, e, 'stun', 1.2, 0, u);
     else if (u.id === 'hauntedSwitchboard' && inBlackout) status(b, e, 'stun', 1.0, 0, u);
     else status(b, e, 'slow', 2.0, 0.30, u);
     markNaturalBreach(b, u, e);
     grantUrbanViolation(b, u, 1, e);
    }
    if (u.id === 'midnightOperator' && inBlackout) {
     b.curfewUntil += 1.5;
     b.blackoutLockoutUntil = b.curfewUntil + 8.0;
    }
    fx(b, 'pulse', u, null, 'REDIAL');
   } else {
    if (!isLegendTarget(b, u, target)) return false;
    hit(b, u, target, power);
    markNaturalBreach(b, u, target);
   }
  }
  else if (family(u) === 'morgueMirror') {
   const inBlackout = b.curfewUntil > b.time;
   if (inBlackout) {
    u.lastRunnerReact = u.lastRunnerReact || {};
    if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
    u.lastRunnerReact[target.uid] = b.time;
   } else {
    const stares = flank(u.slot, target) || hasLegendMark(target, 'morgueMirror') || target.panic || target.panicUntil > b.time || target.retreatingUntil > b.time || target.frozenUntil > b.time || (target.stuns || []).some(v => v.until > b.time);
    if (!stares) return false;
   }
   hit(b, u, target, power);
   const adjAllies = neighbors(b, u, false);
   if (adjAllies.length) {
    const highestAdj = Math.max(...adjAllies.map(rawAtk));
    const bonusPct = u.id === 'mirrorQueen' ? 1.0 : u.id === 'doppelMirror' ? 0.5 : 0.25;
    damage(b, target, highestAdj * bonusPct, u, 'ability');
    if (u.id === 'mirrorQueen') {
     const cluster = living(b).filter(e => e !== target && (e.frozenUntil > b.time || (e.stuns || []).some(v => v.until > b.time)) && Math.abs(e.p - target.p) <= 2);
     for (const e of cluster) damage(b, e, highestAdj, u, 'ability');
    }
   }
   markNaturalBreach(b, u, target);
   grantUrbanViolation(b, u, 1, target);
  }
  else if (u.id === 'chainLetter') {
   target.rumorInfected = true;
   target.rumorOwner = u.uid;
   hit(b, u, target, power);
   fx(b, 'spell', u, target, 'RUMOR');
  }
  else if (family(u) === 'mannequin') {
   const inBlackout = b.curfewUntil > b.time;
   if (!isLegendTarget(b, u, target)) return false;
   u.lastRunnerReact = u.lastRunnerReact || {};
   if (b.time - (u.lastRunnerReact[target.uid] || -99) < 1.5) return false;
   u.lastRunnerReact[target.uid] = b.time;
   const mult = u.id === 'livingTaboo' ? 3.0 : inBlackout ? 2.5 : 1.0;
   hit(b, u, target, power * mult);
   if (u.id === 'stalker') status(b, target, 'slow', 3, 0.30, u);
   markNaturalBreach(b, u, target);
   grantUrbanViolation(b, u, 1, target);
  }
  else if (u.id === 'bell') { let empowered = b.time - u.lastFlip <= 2; if (empowered) interact(b, u.lastFlipSource || u, u, 'bell', 'state change → empowered ring + stun'); for (const e of living(b)) { hit(b, u, e, power + (empowered ? 24 * mod(b.run, 'damage') : 0)); status(b, e, 'slow', 1.5, .25, u); if (empowered) status(b, e, 'stun', .75, 0, u) } }
  else if (u.id === 'railgun') { const has = sensor(b, u); if (has) interact(b, support(b, 'sensor'), u, 'railgun', 'Sensor → five-target volley + knockback'); for (const e of living(b).slice(0, has ? 5 : 3)) { hit(b, u, e, power); if (has) warp(b, e, 1, u) } fx(b, 'beam', u, target, ''); }
  else if(u.id==='immortal'){for(const [i,e] of living(b).slice(0,3).entries())hit(b,u,e,power*(i?.55:1));}
  else if(u.id==='executioner'){hit(b,u,target,power*(target.hp/target.maxHp<.35?4:1));}
  else if (u.id === 'matriarch') { for (const e of living(b).slice(0, 3)) { hit(b, u, e, power); dot(b, e, 'bleed', 6, 4, u); } }
  else {
   if (species(u) === 'hound' && target.hp / target.maxHp < .3) power *= 2;
   if (u.id === 'executioner') { if (target.hp / target.maxHp < .25) power *= 4; else if ((target.permanentShred || 0) > 0 || target.nanoUntil > b.time || [...(target.bleeds || []), ...(target.burns || [])].some(d => d.until > b.time)) power *= 2; }
   if(u.id==='leech'&&((target.bleeds||[]).some(d=>d.until>b.time)||neighbors(b,u).some(trophyFamily)))power*=2.5;
   if (species(u) === 'larva' && u.attackCount % 5 === 0) power *= 2;
   hit(b, u, target, power);
   if (u.id === 'matriarch') dot(b, target, 'bleed', 6, 4, u);
   if (u.id === 'asura') dot(b, target, 'bleed', 6, 4, u);
   if (species(u) === 'larva') status(b, target, 'slow', 3, .2, u);
   if (species(u) === 'mass') status(b, target, 'slow', 2, .2, u);
  }

  for (const v of b.units.filter(v => !v.removed && v !== u)) { v.onAdjacentAttack(u) }
  if (!token(u) && u.upgradePath === 'storm' && u.attackCount % 6 === 0) { for (const e of living(b).slice(0, 3)) trueHit(b, u, e, rawAtk(u)); interact(b, u, u, 'branch', 'Storm path → three-target burst'); }
  if(arcaneGauge(u)||u.id==='eye')tick(b,u,1);
  if (family(u) === 'spirit') tick(b, u, 1);
  flushEvents(b); return true;
 }

 function trialFor(n) { if (!n || !['battle', 'elite'].includes(n.type)) return null; return ({ 5: { hp: 1800, leak: 10 }, 9: { hp: 4200, leak: 14 }, 13: { hp: 7000, leak: 18 } })[n.row] || null }
 function spreadRumor(b, source, onDeath = false) {
  if (!source.rumorInfected || (!onDeath && source.rumorContactSpread)) return;
  const target = living(b).find(e => e !== source && !e.rumorInfected && Math.min(Math.abs(e.p - source.p), 16 - Math.abs(e.p - source.p)) <= (onDeath ? 1.5 : .45));
  if (!onDeath && !target) return;
  if (!onDeath) source.rumorContactSpread = true;
  if (target) {
   target.rumorInfected = true;
   target.rumorOwner = source.rumorOwner;
   const owner = b.units.find(u => u.uid === source.rumorOwner);
   if (owner) trueHit(b, owner, target, 20);
  }
  fx(b, 'spell', null, source, 'RUMOR SPREAD');
 }

 function wavePlan(r) {
  let d = r.depth, elite = r.node.type === 'elite', boss = r.node.type === 'boss';
  const encounter = encounterFor(r.node);
  const plan = { encounter: encounter?.id || null, count: d === 0 ? 5 : boss ? 42 : Math.min(36, 10 + d * 2), interval: d === 0 ? 2.5 : boss ? 1.4 : Math.max(1.5, 2.3 - d * .045), hp: d === 0 ? 9 : Math.round((17 + d * 8 + d * d * 1.5) * 1.8 * (1 + Math.max(0, d - 3) * .02) * (elite ? 1.25 : 1)), speed: boss ? .31 : elite ? .34 : .3, bossHp: 11000, trial: trialFor(r.node) };
  if (d > 0 && !boss) { plan.hp = Math.round(plan.hp * (1.12 + Math.min(d, 10) * .035)); plan.speed *= 1.12; }
  if (encounter?.id === 'packs') { plan.count = Math.ceil(plan.count * 1.5); plan.hp = Math.round(plan.hp * .62) }
  if (encounter?.id === 'armor') { plan.count = Math.ceil(plan.count * .8); plan.hp = Math.round(plan.hp * .85) }
  if (encounter?.id === 'fast') { plan.count = Math.ceil(plan.count * .9); plan.hp = Math.round(plan.hp * .75) }
  return plan;
 }
 function spawn(b) {
  let plan = b.plan, idx = b.spawned, boss = b.run.node.type === 'boss' && idx === plan.count - 1, champion = !!plan.trial && idx === plan.count - 1, elite = !boss && !champion && (b.run.node.type === 'elite' && idx % 4 === 0), armored = !boss && !champion && !elite && (plan.encounter === 'armor' ? idx % 3 !== 2 : !plan.encounter && b.run.depth > 3 && idx % 5 === 3), swift = !boss && !champion && !elite && !armored && (plan.encounter === 'fast' ? idx % 3 !== 2 : !plan.encounter && b.run.depth > 1 && idx % 4 === 2), hp = boss ? plan.bossHp : champion ? plan.trial.hp : plan.hp * (elite ? 2 : armored ? 1.45 : 1);
  const newEnemy = { uid: ++b.enemyUid, p: 0, hp, maxHp: hp, speed: (champion ? .31 : plan.speed) * (boss ? .95 : swift ? 1.6 : armored ? .85 : 1), leak: boss ? b.run.maxHealth : champion ? plan.trial.leak : elite ? 6 : armored ? 3 : 2, defense: armored ? .4 : elite ? .25 : (boss || champion) ? .2 : 0, boss, champion, maxProgress: 0, elite, armored, swift, bornAt: b.time, enraged: false, gone: false, panic: false, panicUntil: 0, retreatingUntil: 0, slows: [], frozenUntil: 0, shredUntil: 0, bleeds: [], burns: [], venoms: [], vulnerableUntil: 0, vulnerability: 0, auras: [], tabooMarks: { kuchisake: 0, nightBus: 0, payphone: 0, morgueMirror: 0, mannequin: 0, stair13: 0, redRaincoat: 0 } };
  b.enemies.push(newEnemy);
  const architect = b.units.find(v => !v.removed && v.id === 'ruleArchitect');
  if (architect) addRuleMark(b, newEnemy, 2, architect);
  b.spawned++;
  huntArmor(b,newEnemy);brandQuarry(b);
 }

 function step(b, dt) {
  if (b.done) return; dt = Math.min(.1, dt); b.time += dt;
  tickHeavenlyTrial(b);
  tickBloodlineTrial(b);
  tickUrbanContainmentTrial(b);
  tickArcaneTrial(b);
  if (b.spawned < b.plan.count && b.time >= b.spawnAt) { spawn(b); b.spawnAt += b.plan.encounter === 'packs' ? (b.spawned % 3 === 0 ? b.plan.interval * 2 : .18) : b.plan.interval }
  for (const u of b.units.filter(u => !u.removed)) {
   if (u.removed) continue;
   if (token(u) && u.expiresAt != null && b.time >= u.expiresAt) { u.removed = true; continue; }
   u.flash = Math.max(0, u.flash - dt); extras(b, u, dt); flushEvents(b); if (u.removed) continue;
   if (u.state !== 'active') { u.stateRemaining -= dt; if (u.stateRemaining <= 0) flip(b, u, 'active'); else continue }
   if ((u.trialStunnedUntil || 0) > b.time) continue;
   if (u.id === 'herb' && b.time >= u.sacrificeAt && herbOffering(b, u)) continue;
   if (u.id === 'herb' && b.time >= u.herbAt) { u.herbAt = b.time + 12; teamCharge(b, u, 3); }
   if (u.id === 'vent' && support(b, 'vent') === u && b.time >= u.ventAt) { u.ventAt = b.time + 8; for (const e of living(b).slice(0, 2)) status(b, e, 'freeze', (e.burns || []).some(d => d.until > b.time) ? 2 : 1, 0, u); fx(b, 'pulse', u, null, 'FREEZE') }
   if (u.attackInterval > 0) { u.currentCooldown -= dt; let guard = 0; while (u.currentCooldown <= 0 && u.state === 'active' && guard++ < 5) { if (!attack(b, u)) { u.currentCooldown = .05; break } u.currentCooldown += u.attackInterval / speed(b, u) } }
  }
  tickOil(b,dt);
  tickArcane(b,dt);
  tickCyber(b,dt);
  tickCosmic(b,dt);
  for (const e of living(b)) {
   if ((e.boss || e.champion) && !e.enraged && b.time - e.bornAt >= 45) { e.enraged = true; e.frozenUntil = 0;  }
   e.bleeds = e.bleeds.filter(z => z.until > b.time); e.burns = (e.burns || []).filter(z => z.until > b.time); e.venoms = (e.venoms || []).filter(z => z.until > b.time); for (const dot of [...e.bleeds, ...e.burns, ...e.venoms]) damage(b, e, dot.dps * dt * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), b.units.find(u => u.uid === dot.owner) || null, 'dot'); if (e.gone) continue;
   e.slows = e.slows.filter(s => s.until > b.time); e.panic = e.panicUntil > b.time; let aura = b.units.some(v => !v.removed && v.id === 'wraith') ? ((e.boss || e.champion) ? .15 : .3) : 0; let slow = Math.max(aura, ...e.slows.map(s => s.power)), move = e.frozenUntil > b.time ? 0 : 1 - slow;
   if (b.curfewUntil > b.time) move *= 0.75;
   const previousProgress = e.p, wasRetreating = e.retreatingUntil > b.time && !((e.boss||e.champion)&&e.enraged);
   e.p += e.speed * dt * move * (e.enraged ? 1.25 : 1) * (b.run.relics.includes('frost') ? .9 : 1);
   if (wasRetreating) e.p -= e.speed * dt * move * (e.enraged ? 1.25 : 1) * (b.run.relics.includes('frost') ? .9 : 1) * 2;
   if (!wasRetreating && e.p > previousProgress) triggerStairTraps(b, e, previousProgress, e.p);
   triggerRedRaincoatTraps(b, e, previousProgress, e.p, wasRetreating);
   e.p=Math.max(0,e.p);cosmicCrossing(b,e,previousProgress);
   e.maxProgress = Math.max(e.maxProgress || 0, e.p);
   const livingTaboo = b.units.find(v => !v.removed && v.id === 'livingTaboo');
   if (!e.boss && !e.champion && livingTaboo && e.p >= 15 && !b.livingTabooSaved) {
    b.livingTabooSaved = true;
    damage(b, e, e.hp, livingTaboo, 'direct');
    fx(b, 'shot', livingTaboo, e, 'AMBUSH');
   }
   if (e.gone) continue;
   if (e.p >= 16) {
    if (e.subjectZero) { e.gone = true; failUrbanContainmentTrial(b, 'Subject Zero escaped'); fx(b, 'warp', null, e, 'SUBJECT ZERO ESCAPED'); continue; }
    if (e.champion) recordTrial(b, e, false);
    if (!e.boss && !e.champion && b.units.some(v => !v.removed && v.id === 'ruleArchitect') && !b.room404Saved) {
     b.room404Saved = true; e.gone = true;
     interact(b, null, e, 'room404', 'Room 404 trapped the runner · leak prevented');
     fx(b, 'warp', null, e, 'PHÒNG 404');
     continue;
    }
    const guardian=b.units.find(v=>!v.removed&&v.lineage==='xuanwu'&&(lineageTierIds[v.id]?.tier||0)>=4&&(v.savedLeaks||0)<2);
    if (!e.boss && !e.champion && guardian) { guardian.savedLeaks=(guardian.savedLeaks||0)+1; e.gone=true; interact(b,guardian,e,'save',`Xuanwu prevents leak ${guardian.savedLeaks}/2`); continue; }
    if (b.heavenlyTrial?.status === 'active') failHeavenlyTrial(b, e.boss ? 'boss escaped' : 'a runner escaped');
    e.gone = true;
    const leakLoss=e.boss ? b.run.maxHealth : Math.max(1, e.leak + mod(b.run, 'leak', 0) - (b.run.relics.includes('mercy') ? 1 : 0));
    b.run.health = Math.max(0, b.run.health - leakLoss); b.metrics.leaks++; b.run.stats.leaks++;
    if (b.bloodlineTrial?.status === 'active') failBloodlineTrial(b, 'A runner leaked');
    if (b.arcaneTrial?.status === 'active') failArcaneTrial(b, 'A runner leaked');
    if (b.urbanLegendTrial?.status === 'active') failUrbanLegendTrial(b, 'A runner leaked');
    if (b.urbanContainmentTrial?.status === 'active') failUrbanContainmentTrial(b, 'A runner leaked');
    b.metrics.leakTypes ??= {}; const leakType = e.boss ? 'boss' : e.champion ? 'harbinger' : e.elite ? 'elite' : e.armored ? 'armored' : e.swift ? 'fast' : 'normal'; b.metrics.leakTypes[leakType] = (b.metrics.leakTypes[leakType] || 0) + 1; fx(b, 'leak', null, e, `−${leakLoss}`);
    if (b.run.health <= 0) { const phoenix=b.units.find(v=>!v.removed&&v.lineage==='phoenix'&&(lineageTierIds[v.id]?.tier||0)>=4); if(phoenix&&!b.run.phoenixRevived){b.run.phoenixRevived=true;b.run.health=1;interact(b,phoenix,e,'revive','Phoenix revival → restore 1 HP');}else{finish(b,false);break} }
   }
  }
  for (const e of living(b)) spreadRumor(b, e);
  flushEvents(b); b.effects.forEach(e => e.ttl -= dt); b.effects = b.effects.filter(e => e.ttl > 0); b.enemies = b.enemies.filter(e => !e.gone);
  if (!b.done && b.spawned >= b.plan.count && living(b).length === 0) finish(b, true);
 }

 function recordTrial(b, e, killed) { const result = { stage: b.run.depth + 1, killed, hpRemaining: Math.round(e.hp), maxHp: e.maxHp, progress: Math.min(16, e.maxProgress || e.p), seconds: Math.round(b.time - e.bornAt) }; b.metrics.trial = result; }
 function finish(b, won) {
  if (b.done) return;
  if(won)for(const u of b.units.filter(v=>!v.removed&&!token(v)&&isMech(v)))addAlloy(b,u,5);
  b.done = true; b.won = won; let r = b.run;
  if (b.heavenlyTrial?.status === 'active') {
   if (won && (b.metrics.leaks || 0) === 0) passHeavenlyTrial(b);
   else failHeavenlyTrial(b, (b.metrics.leaks || 0) > 0 ? 'A runner leaked' : 'Elite/Boss node was not cleared');
  }
  if (b.urbanLegendTrial?.status === 'active') {
   if (won && (b.metrics.leaks || 0) === 0) passUrbanLegendTrial(b);
   else failUrbanLegendTrial(b, (b.metrics.leaks || 0) > 0 ? 'A runner leaked' : 'Elite/Boss node was not cleared');
  }
  if (b.bloodlineTrial?.status === 'active') {
   if (won && (b.metrics.leaks || 0) === 0) passBloodlineTrial(b);
   else failBloodlineTrial(b, (b.metrics.leaks || 0) > 0 ? 'A runner leaked' : 'Elite/Boss node was not cleared');
  }
  if (b.arcaneTrial?.status === 'active') {
   if (won && (b.metrics.leaks || 0) === 0 && b.arcaneTrial.featDone) passArcaneTrial(b);
   else failArcaneTrial(b, (b.metrics.leaks || 0) > 0 ? 'A runner leaked' : !b.arcaneTrial.featDone ? 'The chosen reaction did not hit a priority target' : 'Elite/Boss node was not cleared');
  }
  if (b.urbanContainmentTrial?.status === 'active') {
   const t=b.urbanContainmentTrial;
   if (!won || (b.metrics.leaks || 0) > 0) failUrbanContainmentTrial(b,(b.metrics.leaks||0)>0?'A runner leaked':'Elite/Boss node was not cleared');
   else if (t.subjectZeroContained) {
    const enforcer=b.units.find(u=>u.uid===t.enforcerUid&&!u.removed),relic=b.units.find(u=>u.uid===t.relicUid&&!u.removed);
    if(!enforcer||!relic) failUrbanContainmentTrial(b,'Rule Enforcer or Relic was removed');
    else {consume(b,enforcer,relic,'Subject Zero Containment',0);evolve(b,enforcer,t.apexId);enforcer.realm=4;persist(b,enforcer);t.status='passed';t.passedAt=b.time;b.metrics.urbanContainmentTrial={...b.metrics.urbanContainmentTrial,status:'passed',passedAt:b.time};interact(b,enforcer,enforcer,'subject-zero-contained',`SUBJECT ZERO BOUND · ${card(t.apexId).name} awakened · zero leaks`);fx(b,'growth',enforcer,null,'SUBJECT ZERO BOUND');}
   } else failUrbanContainmentTrial(b,'Subject Zero was not contained with five marks');
  }
  const coinsEarned = r.node?.type === 'boss' ? 500 : r.node?.type === 'elite' ? 200 : 100;
  r.coins = (r.coins || 0) + coinsEarned; b.metrics.coinsEarned = coinsEarned;
  for (const u of b.units.filter(u => !u.phantom)) {
   let src = r.roster.find(v => v.uid === u.uid); if (!src) continue;
   persist(b, u); src.threshold = abilityGauge(u) ? u.threshold.current : 0; src.naniteCrits = u.naniteCrits || 0; src.critCount = u.critCount || 0
  }
  r.recap = { ...b.metrics, time: b.time, ...report(b) };
  r.battleHistory ??= []; r.battleHistory.push({ stage: r.depth + 1, leaks: b.metrics.leaks, closeCalls: b.metrics.closeCalls || 0, trial: b.metrics.trial || null, heavenlyTribulation: b.metrics.heavenlyTribulation || null, bloodlineTrial: b.metrics.bloodlineTrial || null, arcaneTrial: b.metrics.arcaneTrial || null, urbanLegendTrial: b.metrics.urbanLegendTrial || null });
  r.battleHistory = r.battleHistory.slice(-16);
  if (won) {
   r.cleared++; if (r.node.type === 'elite') { let options = D.RELICS.filter(v => !r.relics.includes(v.id)); if (options.length) { let item = options[Math.floor(rand(r) * options.length)]; addRelic(r, item.id); r.recap.relic = item.name } }
   reward(r)
  } else r.phase = 'lost';
 }
 function favored(b, u) { return ['herald', 'alchemist', 'harvester'].includes(family(u)) ? neighbors(b, u).some(v => preyEligible(u, v)) : card(u.id).fav === 'neighbor' && neighbors(b, u).length > 0 }

 const family = u => card(u.id).evolvedFrom || u.id;
 const cultivationRealmIds = ['practitioner', 'cultivationFoundation', 'cultivationGoldenCore', 'cultivationNascentSoul'];
 const isPractitioner = u => family(u) === 'practitioner' && !APEX_FORMS.includes(u.id);
 const token = u => !!(u.phantom || u.token || card(u.id)?.token);
 const abilityGauge = u => arcaneGauge(u)||['jade', 'eye', 'lantern', 'core'].includes(family(u));
 function persist(b, u) {
  if (token(u)) return;
  const src = b.run.roster.find(v => v.uid === u.uid);
  if (src) {
   for (const k of ['id', 'syllables', 'scripts', 'pageRecipe', 'brainAbsorbed', 'arm', 'os', 'chrome', 'chromeAttackCharge', 'synthesis', 'essences', 'boundPair', 'trophyPoints', 'carvings', 'scrapIntake', 'qiAttackCharge', 'alloy', 'alloyAttacks', 'modules', 'titanUnlocked', 'permanentAtkBonus', 'permanentSpeed', 'upgradePath', 'lineage', 'lineageStacks', 'meals', 'qiGrowth', 'returns', 'witnesses', 'qi', 'realm', 'swordQi', 'apexQi', 'apexDread', 'souls', 'bladeKills', 'demonAtkBonus', 'dread', 'violations', 'blackouts', 'mirrorQueenBonusGranted']) {
    if (u[k] !== undefined) src[k] = u[k];
   }
  }
 }

 function event(b, type, data) { (b.events ??= []).push({ type, ...data }); }
 function flushEvents(b) {
  if (b.processingEvents) return; b.processingEvents = true; let count = 0;
  try {
   while (b.events?.length) {
    if (++count > 2000) throw Error('Combat event cycle exceeded limit');
    const ev = b.events.shift();
    if (ev.type === 'consumed' && species(ev.unit) === 'lamb') { for (const e of living(b).slice(0, 3)) trueHit(b, ev.unit, e, 80 + rawAtk(ev.unit) * 2); interact(b, ev.unit, ev.consumer, 'soulflare', 'Lamb sacrifice → three-target Soulflare'); }
    for (const u of [...b.units].filter(v => !v.removed && !token(v))) {
     if (u.id === 'herald' && ev.type === 'consumed' && ev.consumer===u) { u.madnessPower = (u.madnessPower || 0) + 100; interact(b, ev.consumer, u, 'madness-feed', 'consumption → +100 next Madness damage'); }
     if (u.id === 'broodkeeper' && support(b, 'broodkeeper') === u && ev.type === 'consumed' && BLOODLINE_FODDER.includes(species(ev.unit)) && rand(b.run) < .35) { const preySpecies = species(ev.unit), offspring = breedCopy[preySpecies] || preyToken[preySpecies]; const v = spawnToken(b, u, offspring, false, { origin: preySpecies, tokenAtk: rawAtk(ev.unit), attackInterval: ev.unit.attackInterval }); if (v) interact(b, u, v, 'recycle', `35% global recall → ${card(preySpecies).name} token; original stays deleted`); }
     if (ev.type === 'consumed' && species(ev.unit) === 'lamb' && u === support(b, 'lantern')) { tick(b, u, 3, ev.unit); interact(b, ev.unit, u, 'soul', 'Mourning Lamb → +3 Echoes'); }
     if (u.id === 'soulwell' && ev.type === 'consumed') { const haunted = card(species(ev.unit))?.genre === 'Haunted'; for (const e of living(b).slice(0, 3)) trueHit(b, u, e, haunted ? 300 + teamPower(b) : 80 + teamPower(b) * .5); interact(b, ev.unit, u, 'soul-payoff', haunted ? 'HAUNTED HARVEST → greater soul missiles' : 'foreign loss → soul missiles'); }
     if (u.id === 'lantern' && (ev.type === 'kill' || ev.type === 'shutdown' && ev.unit !== u)) tick(b, u, 1, ev.source || ev.unit);
     if (u.id === 'cauldron' && support(b, 'cauldron') === u && ['consumed', 'breakthrough', 'refined'].includes(ev.type) && ev.unit !== u && b.time >= (u.elixirAt || 0)) { u.elixirs = (u.elixirs || 0) + 1; u.elixirAt = b.time + 8; for (const v of b.units.filter(v => !v.removed)) growth(b, v, 1); interact(b, u, ev.consumer || ev.unit, 'elixir', 'Elixir: +1 team ATK; 8s cooldown'); }
     if (u.id === 'altar' && support(b, 'altar') === u && (ev.type === 'consumed' || ev.type === 'kill' && ev.bleeding)) for (const v of neighbors(b, u).filter(v => !token(v))) if (grantGrowth(b, v, 1)) interact(b, u, v, 'altar', 'ritual → +1 permanent ATK');
     if (u.id === 'monk' && ev.type === 'consumed' && !token(ev.unit) && ev.unit !== u) { u.witnesses = (u.witnesses || 0) + 1; u.threshold.current = u.witnesses; persist(b, u); if (u.witnesses >= 3) evolve(b, u, 'asura'); }
     if (u.id === 'medium' && !u.pendingEcho && b.time >= (u.echoAt || 0) && ev.unit !== u && !token(ev.unit || {}) && (ev.type === 'consumed' || ev.type === 'shutdown' && ev.state === 'dormant')) { u.echoUsed = true; u.echoAt = b.time + 10; u.pendingEcho = { atk: Math.max(0, rawAtk(ev.unit)), origin: family(ev.unit) }; }
    }
   }
  } finally { b.processingEvents = false }
 }

 function evolve(b, u, id) {
  if (token(u) || u.removed || u.id === id) return;
  const before = u.id, d = card(id);
  if (isCultivationApex({ id }) && !isCultivationApex(u)) u.apexQi = 0;
  if (isUrbanAuthority({ id }) && !isUrbanAuthority(u)) u.apexDread = 0;
  u.id = id; u.name = d.name; u.genre = d.genre; u.baseAtk = d.baseAtk; u.attackInterval = d.attackInterval;
  u.threshold = { current: 0, max: d.max || 0, onTrigger: () => trigger(b, u) };
  prepareHooks(b, u); persist(b, u); record(b, u).id = id;
  (b.metrics.evolutions ??= []).push({ uid: u.uid, from: before, to: id, time: b.time });
  interact(b, u, u, 'evolution', `EVOLUTION · ${card(before).name} → ${d.name}`);
  
  fx(b, 'growth', u, null, 'EVOLVED');
 }

 function evolutionProgress(u) {
  if (isXenoSpecimen(u) && !isXenoApex(u)) {
   const g = u.genome || 0, strains = u.strains || [];
   const max = g < 25 ? 25 : g < 65 ? 65 : 130;
   const pair = xenoPair(strains);
   const branch = pair ? XENO_BRANCHES[pair] : null;
   return { current: g, max, label: `Genome ${g} / ${max}` + (branch ? ` · Serum: ${card(branch[1]).name}` : strains.length ? ` · Strains: ${strains.join('+')}` : '') };
  }
  switch (family(u)) { case 'slumberingIdol':return {current:u.syllables||0,max:(u.syllables||0)<25?25:(u.syllables||0)<65?65:130}; case 'cyberSolo':return {current:u.chrome||0,max:(u.chrome||0)<25?25:(u.chrome||0)<65?65:120}; case 'elementalApprentice':{const pair=bestPair(u),p=u.synthesis?.[pair]||0,t=u.arcaneTrial;return {current:p,max:p<10?10:p<20?20:30,label:isArchon(u)?'Mythic · Astral Weaving complete':p<30?`${pair} synthesis · 10 / 20 / 30 toward Astral Weaving`:`${pair} · 30/30 · Crossing 10+ + adjacent Astral Loom · Elite/Boss reaction trial${t?.unitUid===u.uid?` · ${t.status}${t.featDone?' · reaction proved':''}`:''}`};} case 'mercenary':return {current:u.trophyPoints||0,max:(u.trophyPoints||0)<25?25:(u.trophyPoints||0)<60?60:100}; case 'scrapFrame': return {current:u.alloy||0,max:(u.alloy||0)<25?25:(u.alloy||0)<65?65:120}; case 'jade': return { current: u.qiGrowth || 0, max: 18 }; case 'cub': { const current=u.lineageStacks||0, tier=lineageTierIds[u.id]?.tier||0, relic=cubRelics[u.lineage]; return { current, max:6, label:tier>=4?'Mythic · ancestral trial complete':tier===3?`Tier 3 · Elite/Boss zero-leak trial + adjacent ${card(relic)?.name||'ancestral relic'}`:'Tier 3 at 6 matching meals · then ancestral Elite/Boss trial' }; } case 'spirit': return { current: u.returns || 0, max: 5 }; case 'monk': return { current: u.witnesses || 0, max: 3 };
   case 'investigator': {
    const dread = u.dread || 0;
    if (dread >= 140) return { current: 140, max: 140, label: 'Ready for Rule Binding' };
    if (dread >= 70) return { current: dread, max: 140 };
    if (dread >= 25) return { current: dread, max: 70 };
    return { current: dread, max: 25 };
   }
   case 'kuchisake': case 'nightBus': case 'payphone': case 'morgueMirror':
   case 'mannequin': case 'stair13': case 'redRaincoat': {
    const v = u.violations || 0;
    if (APEX_FORMS.includes(u.id)) return { current: 80, max: 80, label: 'Mythic zero-leak trial complete' };
    if (v >= 80) return { current: 80, max: 80, label: 'Ready: Elite/Boss + adjacent same-lineage Legend (45+)' };
    if (v >= 15) return { current: v, max: 80, label: 'Epic · Mythic trial at 80' };
    return { current: v, max: 15, label: 'Epic at 15 · Mythic trial at 80' };
   } default: return null } }
 const species = u => token(u) ? (u.origin || card(u.id).species) : family(u);
 function preyEligible(predator, prey) { if (prey.removed || predator === prey) return false; const diets = { cub: ['serpentFodder','hound','scuttler','flameToad','peachFodder'], herald: ['mass', 'larva'], alchemist: ['lotus', 'herb'], harvester: ['lamb'] }; return card(predator.id).genre === card(species(prey))?.genre && (diets[family(predator)] || []).includes(species(prey)); }
 function consume(b, consumer, victim, reason = 'Devour', reward = 0) {
  if (consumer.removed || victim.removed || consumer === victim) return false;
  const isToken = token(victim); victim.removed = true;
  if (!isToken) { b.run.roster = b.run.roster.filter(v => v.uid !== victim.uid); (b.run.devoured ??= []).push({ uid: victim.uid, id: victim.id, depth: b.run.depth, reason }); }
  const before = consumer.permanentAtkBonus; growth(b, consumer, reward);
  if (reason === 'Devour') b.metrics.devours++;
  const item = { uid: victim.uid, id: victim.id, slot: victim.slot, by: consumer.id, byUid: consumer.uid, toSlot: consumer.slot, bonus: consumer.permanentAtkBonus - before, reason, token: isToken, permanent: !isToken };
  (b.metrics.consumed ??= []).push(item);
  interact(b, victim, consumer, 'devour', `${isToken ? 'TOKEN CONSUMED · parent safe' : 'ORIGINAL PERMANENTLY LOST'}; +${item.bonus} ATK`);
  
  if(isToken)cosmicReward(b);
  event(b, 'consumed', { unit: victim, consumer, reason });
  return true;
 }

 function devour(b, u) {
  if (u.removed || token(u)) return false;
  const prey = neighbors(b, u).filter(v => preyEligible(u, v)).sort((a, z) => Number(token(z)) - Number(token(a)) || rawAtk(a) - rawAtk(z) || a.slot - z.slot)[0];
  if (!prey) return false;
  const mealSpecies = species(prey), mealPath = family(u) === 'cub' ? cubPathForPrey[mealSpecies] : null;
  if (family(u) === 'cub' && !u.lineage && mealPath) u.lineage = mealPath;
  const matchingMeal = family(u) === 'cub' && !!mealPath && mealPath === u.lineage;
  const reward = u.id==='herald'?0:family(u) === 'cub' ? (matchingMeal ? 4 : 3) : u.id === 'alchemist' ? 3 : u.id === 'harvester' ? 6 : 10;
  const reason = u.id === 'harvester' ? 'Sacrifice' : u.id === 'alchemist' ? 'Refinement' : 'Devour';
  consume(b, u, prey, reason, reward);
  if (u.id === 'alchemist') { teamCharge(b, u, 3); event(b, 'refined', { unit: u }); }
  if (u.id === 'harvester') for (const e of living(b).slice(0, 3)) trueHit(b, u, e, rawAtk(u) * 2);
  if (family(u) === 'cub') {
   u.meals = (u.meals || 0) + 1;
   if (matchingMeal) u.lineageStacks = (u.lineageStacks || 0) + 1;
   const tier = lineageTierIds[u.id]?.tier || 0, nextTier = Math.min(3, Math.floor((u.lineageStacks || 0) / 2));
   if (nextTier > tier) evolve(b, u, cubForms[u.lineage][nextTier - 1]);
   persist(b, u);
   startBloodlineTrial(b);
  }
  flushEvents(b); return true;
 }

 function spawnToken(b, parent, id, adjacentOnly = false, extra = {}) {
  if (parent.removed) return null;
  let free = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(slot => !slotOccupied(b, slot) && (!adjacentOnly || occupiedSlots(parent).some(s => adjacent(xy(s), xy(slot))))).sort((a, z) => { const x = xy(a), y = xy(z); return Math.abs(x.x - parent.x) + Math.abs(x.y - parent.y) - Math.abs(y.x - parent.x) - Math.abs(y.y - parent.y) || a - z });
  if (!free.length) return null;
  const v = runtime(b, { uid: `token-${++b.tokenSeq || (b.tokenSeq = 1)}`, id, permanentAtkBonus: 0, threshold: 0 }, free[0], true);
  v.parentUid = parent.uid; v.origin = species(parent); v.token = true; v.scale = 1; v.tokenAtk = rawAtk(parent); v.attackInterval = parent.attackInterval; v.breedAt = b.time + 1;
  Object.assign(v, extra); prepareHooks(b, v); b.units.push(v); record(b, v); interact(b, parent, v, 'summon', 'summoned disposable token'); return v;
 }
 const BLOODLINE_FODDER = ['serpentFodder','hound','scuttler','flameToad','peachFodder'];
 const preyToken = { lotus: 'petal', lotusRoot: 'lotusBlossom', hound: 'houndToken', serpentFodder: 'scaleImp', scuttler: 'carapaceToken', flameToad: 'emberToken', peachFodder: 'peachToken', lamb: 'lambToken' };
 const breedCopy = { hound: 'hound', serpentFodder: 'serpentFodder', scuttler: 'scuttler', flameToad: 'flameToad', peachFodder: 'peachFodder' };
 const cubPathForPrey = { serpentFodder:'dragon', hound:'tiger', scuttler:'xuanwu', flameToad:'phoenix', peachFodder:'monkey' };
 const cubForms = { dragon:['dragonCubT1','dragonCubT2','dragonCubT3','dragonCubApex'], tiger:['tigerCubT1','tigerCubT2','tigerCubT3','tigerCubApex'], xuanwu:['xuanwuCubT1','xuanwuCubT2','xuanwuCubT3','xuanwuCubApex'], phoenix:['phoenixCubT1','phoenixCubT2','phoenixCubT3','phoenixCubApex'], monkey:['monkeyCubT1','monkeyCubT2','monkeyCubT3','monkeyCubApex'] };
 const cubRelics = { dragon:'dragonPearl', tiger:'tigerSeal', xuanwu:'earthTablet', phoenix:'phoenixTree', monkey:'goldenStaff' };
 const lineageTierIds = Object.fromEntries(Object.entries(cubForms).flatMap(([path,ids])=>ids.map((id,i)=>[id,{path,tier:i+1}])));
 function bloodlineTrialCandidate(b) {
  if (!b || !['elite', 'boss'].includes(b.run?.node?.type) || (b.metrics?.leaks || 0) > 0) return null;
  for (const u of b.units.filter(v => !v.removed && !token(v) && family(v) === 'cub' && lineageTierIds[v.id]?.tier === 3)
   .sort((a,z)=>a.slot-z.slot||a.uid-z.uid)) {
   const relicId = cubRelics[u.lineage];
   const relic = relicId && neighbors(b,u,false).filter(v=>!v.removed&&v.id===relicId).sort((a,z)=>a.slot-z.slot||a.uid-z.uid)[0];
   if (relic) return { unit:u, relic, apexId:cubForms[u.lineage][3] };
  }
  return null;
 }
 function startBloodlineTrial(b) {
  if (!b || b.bloodlineTrial) return b?.bloodlineTrial || null;
  const candidate = bloodlineTrialCandidate(b); if (!candidate) return null;
  const t = b.bloodlineTrial = { status:'active', unitUid:candidate.unit.uid, relicUid:candidate.relic.uid,
   relicId:candidate.relic.id, apexId:candidate.apexId, lineage:candidate.unit.lineage, startedAt:b.time, nodeType:b.run.node.type };
  b.metrics.bloodlineTrial = { status:'active', unitUid:t.unitUid, relicUid:t.relicUid, relicId:t.relicId,
   apexId:t.apexId, lineage:t.lineage, nodeType:t.nodeType, startedAt:b.time };
  interact(b,candidate.unit,candidate.relic,'bloodline-trial','ANCESTRAL ASCENSION TRIAL · clear the Elite/Boss with zero leaks');
  fx(b,'growth',candidate.unit,null,'ANCESTRAL TRIAL · ZERO LEAKS');
  return t;
 }
 function failBloodlineTrial(b, reason='A runner leaked') {
  const t=b?.bloodlineTrial; if(!t||t.status!=='active') return false;
  const unit=b.units.find(u=>u.uid===t.unitUid), relic=b.units.find(u=>u.uid===t.relicUid);
  if(unit)unit.removed=true; if(relic)relic.removed=true;
  const lost=new Set([t.unitUid,t.relicUid]); b.run.roster=b.run.roster.filter(u=>!lost.has(u.uid));
  t.status='failed';t.reason=reason;t.failedAt=b.time;
  b.metrics.bloodlineTrial={...b.metrics.bloodlineTrial,status:'failed',reason,failedAt:b.time};
  interact(b,unit||null,relic||null,'bloodline-trial-failed',`ANCESTRAL TRIAL FAILED · ${reason}; Tier 3 Bloodline and relic lost`);
  fx(b,'impact',unit||null,null,'ANCESTRAL TRIAL FAILED'); return true;
 }
 function passBloodlineTrial(b) {
  const t=b?.bloodlineTrial;
  if(!t||t.status!=='active'||!b.won||(b.metrics?.leaks||0)!==0||!['elite','boss'].includes(b.run?.node?.type)) return false;
  const unit=b.units.find(u=>u.uid===t.unitUid&&!u.removed), relic=b.units.find(u=>u.uid===t.relicUid&&!u.removed);
  if(!unit||!relic) return failBloodlineTrial(b,'Tier 3 Bloodline or ancestral relic was removed');
  consume(b,unit,relic,'Ancestral Ascension',0); evolve(b,unit,t.apexId); persist(b,unit);
  t.status='passed';t.passedAt=b.time;
  b.metrics.bloodlineTrial={...b.metrics.bloodlineTrial,status:'passed',passedAt:b.time};
  interact(b,unit,unit,'bloodline-trial-passed',`ANCESTRAL TRIAL PASSED · ${card(t.apexId).name} awakened`);
  fx(b,'growth',unit,null,'BLOODLINE MYTHIC AWAKENED'); return true;
 }
 function tickBloodlineTrial(b) {
  const t=b?.bloodlineTrial; if(!t||t.status!=='active') return;
  const unit=b.units.find(u=>u.uid===t.unitUid&&!u.removed), relic=b.units.find(u=>u.uid===t.relicUid&&!u.removed);
  if(!unit||!relic) failBloodlineTrial(b,'Tier 3 Bloodline or ancestral relic was removed');
 }
 function summon(b, u) {
  if (token(u) || u.id === 'hound') return;
  // Explicit summon abilities keep their named token; bred Bloodline fodder uses its own card identity.
  const id = preyToken[species(u)]; if (id) return spawnToken(b, u, id, true);
  if (u.id === 'shepherd') return spawnToken(b, u, 'lambToken', false, { origin: 'lamb', tokenAtk: card('lamb').baseAtk, attackInterval: card('lamb').attackInterval });
 }
 function breed(b, u) {
  const kind = species(u), offspring = breedCopy[kind] || preyToken[kind]; if (!offspring || b.time < (u.breedAt || 1)) return; u.breedAt = b.time + 1;
  if (!neighbors(b, u).some(v => species(v) === kind)) return;
  if (![0, 1, 2, 3, 4, 5, 6, 7, 8].some(slot => !slotOccupied(b, slot) && adjacent(u, xy(slot)))) return;
  (b.metrics.breedingChecks ??= 0); b.metrics.breedingChecks++;
  if (rand(b.run) < .1) spawnToken(b, u, offspring, true);
 }
 function workshopOptions(r, uid) {
  const u = r.roster.find(v => String(v.uid) === String(uid)); if (!u) return [];
  if (card(u.id).evolveTo && !u.upgradePath) return [{ id: 'might', name: 'Might awakening', desc: 'Evolve now; +12 permanent ATK.' }, { id: 'flow', name: 'Flow awakening', desc: 'Evolve now; +20% permanent attack speed.' }, { id: 'storm', name: 'Storm awakening', desc: 'Evolve now; every sixth attack strikes 3 runners for unbuffed ATK as true damage.' }];
  return [{ id: 'power', name: 'Strength', desc: '+8 permanent ATK.' }, { id: 'tempo', name: 'Tempo', desc: '+10% permanent attack speed.' }, { id: 'resonance', name: 'Resonance', desc: 'Every 6s, grant other allies +1 ability progress.' }];
 }
 function upgrade(r, uid, choice) {
  if (r.phase !== 'event' || r.node?.type !== 'workshop' || r.health <= 10) return false;
  const u = r.roster.find(v => String(v.uid) === String(uid)); if (!u || !workshopOptions(r, uid).some(v => v.id === choice)) return false;
  r.health -= 10;
  if (['might', 'flow', 'storm'].includes(choice)) { u.id = card(u.id).evolveTo; u.upgradePath = choice; u.threshold = 0; }
  if (['might', 'power'].includes(choice)) u.permanentAtkBonus += (choice === 'might' ? 12 : 8);
  if (['flow', 'tempo'].includes(choice)) u.permanentSpeed = (u.permanentSpeed || 0) + (choice === 'flow' ? .2 : .1);
  if (choice === 'resonance') u.resonanceLevel = (u.resonanceLevel || 0) + 1;
  r.recap = null; reward(r); return true;
 }
 function teamCharge(b, u, n) { for (const v of allies(b, u).filter(v => abilityGauge(v) && !token(v))) { tick(b, v, n, u); interact(b, u, v, 'charge', `+${n} ability progress`); } }
 function refine(b, u) { const v = allies(b, u).filter(v => v.attackInterval > 0 && !token(v)).sort((a, z) => a.permanentAtkBonus - z.permanentAtkBonus || a.uid - z.uid)[0]; if (!v) return false; u.refinements = (u.refinements || 0) + 1; growth(b, v, 6); teamCharge(b, u, 3); interact(b, u, v, 'refinement', 'refine → +6 permanent ATK; root survives'); u.threshold.current = 0; u.refineAt = b.time + 18; return true; }
 function warp(b, e, tiles, source = null) { if (e.gone || e.hp <= 0 || ((e.boss||e.champion)&&e.enraged)) return; const before = e.p; e.p = Math.max(0, e.p - ((e.boss || e.champion) ? e.enraged ? 0 : tiles * .5 : tiles)); e.retreatingUntil = Math.max(e.retreatingUntil || 0, b.time + ((e.boss||e.champion)?1.25:2.5)); e.panicUntil = Math.max(e.panicUntil || 0, e.retreatingUntil); e.panic = true; if(before>e.p){cosmicStatus(b,e,'warp',source);if(source)event(b, 'displaced', { source, tiles: before - e.p });} }
 function pulseMadness(b, u) { const stored = u.madnessPower || 0; u.madnessPower = 0; for (const e of living(b)) { const late = e.p >= 12; trueHit(b, u, e, stored); if (late) warp(b, e, 5); } u.lastMadness = b.time; u.madnessAt = b.time + 8; interact(b, u, u, 'madness', `MADNESS → +${Math.round(stored)} stored damage released`); fx(b, 'pulse', u, null, 'MADNESS'); }
 function dot(b, e, type, dps, seconds, u) { if (e.hp <= 0 || e.gone) return; cosmicStatus(b,e,type,u); const key = type === 'burn' ? 'burns' : 'bleeds'; e[key] ??= []; e[key] = e[key].filter(x => x.until > b.time); if (type === 'bleed' && card(species(u))?.genre === 'Bloodline' && support(b, 'matriarch')) seconds += b.units.filter(v => !v.removed && BLOODLINE_FODDER.includes(species(v))).length * .5; e[key].push({ until: b.time + seconds, dps: dps * mod(b.run, 'damage') * mod(b.run, priority(e) ? 'eliteDamage' : 'normalDamage'), owner: u.uid }); }
 function venom(b, e, dps, seconds, u) { if (e.hp <= 0 || e.gone) return; cosmicStatus(b,e,'venom',u); e.venoms ??= []; e.venoms = e.venoms.filter(x => x.until > b.time); e.venoms.push({ until: b.time + seconds, dps: dps * mod(b.run, 'damage'), owner: u.uid }); }
 function trueHit(b, u, e, n) { damage(b, e, n * mod(b.run, 'damage') * mod(b.run, priority(e) ? 'eliteDamage' : 'normalDamage') * (e.vulnerableUntil > b.time ? 1 + e.vulnerability : 1), u, 'ability'); fx(b, 'spell', u, e, 'TRUE'); }

 function extras(b, u, dt) {
  breed(b, u); if (token(u)) return;
  scrapworkExtras(b,u);
  huntExtras(b,u);
  arcaneExtras(b,u);
  cyberExtras(b,u,dt);
  cosmicExtras(b,u);
  bindUrbanRelic(b, u);
  if (family(u) === 'nightBus' && b.time >= u.busSweepAt && living(b).length) {
   u.busSweepAt = b.time + 8;
   const lead = living(b)[0], edge = Math.floor(lead.p / 4);
   const targets = living(b).filter(e => getTabooMark(e, 'nightBus') >= 2 && (u.id === 'ghostRoute' ? Math.abs(e.p - lead.p) <= 3 : Math.floor(e.p / 4) === edge));
   for (const e of targets) {
    const before = e.p;
    warp(b, e, u.id === 'terminusBus' ? 5 : 3, u);
    if (e.p < before) grantUrbanViolation(b, u, 1, e);
    if (u.id === 'ghostRoute') hit(b, u, e, atk(b, u) * 1.5);
   }
   interact(b, u, u, 'bus-sweep', 'Timed sweep: marked runners sent backward');
  }
  if (u.id === 'terminusBus' && b.time >= u.abductAt && living(b).length) {
   u.abductAt = b.time + 6;
   for (const e of living(b).slice(0, 2)) {
    dot(b, e, 'bleed', 140, 3 * mod(b.run, 'buffDuration'), u);
    warp(b, e, 5, u);
   }
  }

  // Forensic Coroner examines adjacent Incident Dossier
  if (u.id === 'coroner' && b.time >= (u.autopsyAt || 5)) {
   u.autopsyAt = b.time + 5;
   const adjDossier = neighbors(b, u, false).find(v => v.id === 'dossier' && !v.removed);
   if (adjDossier) {
    adjDossier.removed = true;
    const recipient = neighbors(b, u, false).filter(v => !v.removed && !token(v) && card(v.id).genre === 'Haunted').sort((a, z) => rawAtk(a) - rawAtk(z))[0] || u;
    growth(b, recipient, 3);
    const investigator = b.units.filter(v => !v.removed && acceptsDread(v)).sort((a, z) => Number(isUrbanAuthority(a)) - Number(isUrbanAuthority(z)) || (a.dread || 0) - (z.dread || 0))[0];
    const dreadGain = 10 + (b.units.some(v => !v.removed && v.id === 'ruleboard') ? 2 : 0);
    if (investigator) addDread(b, investigator, dreadGain);
    interact(b, u, recipient, 'autopsy', `Dossier examined: +3 perm ATK, +${dreadGain} Dread`);
    fx(b, 'growth', recipient, null, '+3 ATK');
   }
  }

  // Black-Box Cryptographer decodes adjacent Incident Dossier into Survival Manual
  if (u.id === 'decoder' && b.time >= (u.decodeAt || 6)) {
   u.decodeAt = b.time + 6;
   const adjDossier = neighbors(b, u, false).find(v => v.id === 'dossier' && !v.removed);
   if (adjDossier) {
    adjDossier.removed = true;
    const dur = 4 * mod(b.run, 'buffDuration');
    for (const ally of b.units.filter(v => !v.removed && card(v.id).genre === 'Haunted')) {
     ally.manualUntil = Math.max(ally.manualUntil || 0, b.time + dur);
    }
    const investigator = b.units.filter(v => !v.removed && acceptsDread(v)).sort((a, z) => Number(isUrbanAuthority(a)) - Number(isUrbanAuthority(z)) || (a.dread || 0) - (z.dread || 0))[0];
    const dreadGain = 8 + (b.units.some(v => !v.removed && v.id === 'ruleboard') ? 2 : 0);
    if (investigator) addDread(b, investigator, dreadGain);
    interact(b, u, null, 'manual', `Survival Manual decoded: +25% team speed, +15% crit, +${dreadGain} Dread`);
    fx(b, 'pulse', u, null, 'SURVIVAL MANUAL');
   }
  }

  if (u.id === 'radioPA' && b.time >= (u.paSlowAt || 6)) {
   u.paSlowAt = b.time + 6;
   for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0)) status(b, e, 'slow', 3, 0.25, u);
   fx(b, 'pulse', u, null, 'CURFEW WARNING');
  }
  if (u.id === 'radioPA' && b.time >= (u.paDossierAt || 8)) {
   u.paDossierAt = b.time + 8;
   spawnToken(b, u, 'dossier', false);
  }
  if (u.id === 'mirrorQueen' && !u.mirrorQueenBonusGranted) {
   const highest = Math.max(0, ...allies(b, u).filter(v => !token(v)).map(rawAtk));
   if (highest > 0) {
    u.permanentAtkBonus = (u.permanentAtkBonus || 0) + highest;
    u.mirrorQueenBonusGranted = true;
    persist(b, u);
    interact(b, u, u, 'mirror-domain', `Permanently assimilated highest ally ATK: +${Math.round(highest)}`);
   }
  }

  // Panopticon Monitor scans all 16 tiles every 4s
  if (u.id === 'panopticon' && b.time >= (u.panopticonAt || 4)) {
   u.panopticonAt = b.time + 4;
   const fastRunners = [...living(b)].sort((a, z) => z.speed - a.speed).slice(0, 3);
   for (const e of fastRunners) {
    grantUrbanViolation(b, u, 1, e);
     addRuleMark(b, e, 1, null);
   }
  }

  // Red Hotline prioritizes Subject Zero, otherwise the leading runner.
  if (u.id === 'redPhone' && b.time >= (u.hotlineMarkAt || 4)) {
   u.hotlineMarkAt = b.time + 4;
   const zero = b.enemies.find(e => e.subjectZero && !e.gone && e.hp > 0 && (e.ruleMarks || 0) < 5);
   const target = zero || living(b)[0];
   if (target) { addRuleMark(b, target, 1, u); interact(b, u, target, 'hotline-mark', zero ? `Subject Zero · ${target.ruleMarks}/5 marks` : 'Emergency Hotline marks leading runner'); }
  }
  // Director of Curfew uses mark-scaled lockdown; it does not need Blackout.
  if (u.id === 'curfewDirector' && b.time >= (u.lockdownAt || 6)) {
   u.lockdownAt = b.time + 6;
   const marked = living(b).filter(e => (e.ruleMarks || 0) > 0);
   const target = marked.find(e => e.subjectZero) || marked.sort((a,z)=>(z.ruleMarks||0)-(a.ruleMarks||0)||z.p-a.p||a.uid-z.uid)[0];
   if (target) { const marks=target.ruleMarks||0,duration=marks>=5?3:marks>=3?2:1; status(b,target,'freeze',duration,0,u); interact(b,u,target,'lockdown',`LOCKDOWN ${duration}s · ${marks}/5 marks`); fx(b,'curfew',u,target,`LOCKDOWN ${duration}s`); }
  }

  // Liminal Keycard warps leading marked runners every 7s
  if (u.id === 'elevatorKey' && b.time >= (u.keyAt || 7)) {
   u.keyAt = b.time + 7;
   for (const e of living(b).filter(e => (e.ruleMarks || 0) > 0).slice(0, 2)) {
    warp(b, e, 3, u);
   }
  }
  if (u.resonanceLevel && b.time >= (u.resonateAt || 6)) { u.resonateAt = b.time + 6; teamCharge(b, u, u.resonanceLevel); }
  if (u.id === 'shepherd' && b.time >= (u.pastureAt || 8)) { u.pastureAt = b.time + 8; summon(b, u); }
  if (u.id === 'soulwell' && living(b).length && b.time >= (u.soulPulseAt || 6)) { u.soulPulseAt = b.time + 6; for (const e of living(b).slice(0, 3)) trueHit(b, u, e, 160 + teamPower(b) * .75); }
  if (u.id === 'jade' && b.time >= (u.catalystAt || 1)) { u.catalystAt = b.time + 1; const v = neighbors(b, u).find(v => species(v) === 'catalyst'); if (v) { const paths = ['might', 'flow', 'storm'], path = paths[Math.floor(b.time / 4) % 3]; consume(b, u, v, 'Catalyst', 0); u.upgradePath = path; evolve(b, u, 'immortal'); if (path === 'might') growth(b, u, 12); if (path === 'flow') u.permanentSpeed = (u.permanentSpeed || 0) + .2; persist(b, u); interact(b, v, u, 'adaptation', path.toUpperCase() + ' cultivation awakening'); } }
  if (['lotus', 'lamb'].includes(u.id) && b.time >= (u.summonAt || 0)) { summon(b, u); u.summonAt = b.time + 12; }
  if (['cub', 'herald', 'alchemist', 'harvester'].includes(family(u)) && b.time >= (u.feedAt || 6)) { devour(b, u); u.feedAt = b.time + (u.id === 'herald' ? 12 : 6); }
  if (u.lineage === 'dragon' && (lineageTierIds[u.id]?.tier || 0) >= 4 && living(b).length && b.time >= (u.dragonPulseAt || 8)) { u.dragonPulseAt=b.time+8; for(const e of living(b)) warp(b,e,2,u); }
  if (u.lineage === 'phoenix' && (lineageTierIds[u.id]?.tier || 0) >= 3 && living(b).length && b.time >= (u.phoenixPulseAt || 8)) { u.phoenixPulseAt=b.time+8; for(const e of living(b)){const total=(e.burns||[]).filter(d=>d.until>b.time).reduce((n,d)=>n+d.dps*Math.max(0,d.until-b.time),0); if(total){damage(b,e,total,u,'ability');e.burns=e.burns.filter(d=>d.until<=b.time);}} interact(b,u,u,'flare','Phoenix detonation → active Burns consumed'); }
  if (family(u) === 'cub' && (lineageTierIds[u.id]?.tier || 0) === 3) startBloodlineTrial(b);
  if (u.id === 'lotus') { u.threshold.current = Math.min(18, u.threshold.current + dt); if (u.threshold.current >= 18) refine(b, u); }
  if (u.id === 'medium' && living(b).length && b.time >= (u.soulAt || 6)) { u.soulAt = b.time + 6; const strongest = Math.max(rawAtk(u), ...allies(b, u).filter(v => !token(v)).map(rawAtk)); for (const e of living(b).slice(0, 2)) hit(b, u, e, 60 + strongest, false); interact(b, u, u, 'soul-volley', 'SOUL VOLLEY → strongest original ATK'); }
  if (u.id === 'core' && living(b).length && b.time >= (u.gravityAt || 2)) { u.gravityAt = b.time + 2; tick(b, u, 1, u); }
  if (u.id === 'medium' && u.pendingEcho) { const v = spawnToken(b, u, 'echo', false, { tokenAtk: u.pendingEcho.atk, origin: u.pendingEcho.origin, attackInterval: card(u.pendingEcho.origin).attackInterval }); if (v) u.pendingEcho = null; }
  if (u.id === 'herald' && b.time >= (u.madnessAt ?? 8)) pulseMadness(b, u);

  // --- CULTIVATION ECOSYSTEM TICKS ---
  // 1. Spirit Lotus Root blooms Lotus Blossom token every 8s
  if (u.id === 'lotusRoot' && b.time >= (u.bloomAt || 8)) {
   u.bloomAt = b.time + 8;
   spawnToken(b, u, 'lotusBlossom', false);
  }

  // Spirit dew and pills remain useful after ascension.
  if (u.id === 'herbGrass' && b.time >= u.mistAt) {
   u.mistAt = b.time + 4;
   for (const v of b.units.filter(v => !v.removed && acceptsQi(v))) {
    addQi(b, v, isCultivationApex(v)?2:1);
    interact(b, u, v, 'mist', `+${isCultivationApex(v)?2:1} Qi spiritual dew`);
   }
  }
  if (acceptsQi(u)) {
   const blossom = neighbors(b, u).find(v => v.id === 'lotusBlossom');
   if (blossom) {
    const apex = isCultivationApex(u);
    consume(b, u, blossom, 'Blossom Absorption', apex ? 0 : 2);
    addQi(b, u, apex?15:5);
    interact(b, blossom, u, 'qi', apex ? '+15 Qi toward permanent growth' : '+5 Qi, +2 permanent ATK');
   }
  }
  if (u.id === 'cauldron' && b.time >= u.brewAt) {
   const target = allies(b, u).filter(acceptsQi).sort((a, z) => Number(isCultivationApex(a)) - Number(isCultivationApex(z)) || (a.qi || 0) - (z.qi || 0))[0];
   if (target) {
    const blossom = neighbors(b, u).find(v => v.id === 'lotusBlossom');
    const grass = neighbors(b, u).find(v => v.id === 'herbGrass');
    if (blossom || grass) {
     u.brewAt = b.time + 8;
     const apex = isCultivationApex(target);
     if (blossom) consume(b, u, blossom, 'Brewing', 0);
     // Apex recipients gain ATK through new Qi only, not both reward paths.
     if (!apex) growth(b, target, blossom ? 4 : 3);
     addQi(b, target, apex?(blossom?35:18):(blossom?12:6));
     if (!blossom) target.pillSpeedUntil = Math.max(target.pillSpeedUntil || 0, b.time + 8 * mod(b.run, 'buffDuration'));
     interact(b, u, target, 'pill', blossom ? `+${apex?35:12} Qi: Breakthrough Dan` : `+${apex?18:6} Qi, temporary +15% speed: Qi Gathering Pill`);
    }
   }
  }

  // 5. Ten-Thousand Soul Banner Missiles
  if (u.id === 'soulBanner' && (u.souls || 0) > 0 && b.time >= (u.missileAt || 5)) {
   u.missileAt = b.time + 5;
   const targets = living(b).slice(0, 3);
   for (const e of targets) hit(b, u, e, (u.souls || 0) * 1.5, false);
  }

  // 6. Mountain-River Scroll Banishment
  if (u.id === 'mountainScroll' && b.time >= (u.banishAt || 10)) {
   u.banishAt = b.time + 10;
   const topEnemy = living(b).sort((a, z) => z.hp - a.hp)[0];
   if (topEnemy) {
    status(b, topEnemy, 'stun', 2, 0, u);
    damage(b, topEnemy, 70, u, 'ability');
    interact(b, u, topEnemy, 'scroll-banish', 'Banished into Mountain-River Scroll');
   }
  }

  // Elite/Boss zero-leak Heavenly Tribulation gates all Cultivation Mythic evolutions.

  // 8. Relic Resonance: Apex Immortal adjacent to Relic (Does NOT consume, triggers Resonance)
  if (isApexImmortal(u)) {
   const adjRelics = neighbors(b, u, false).filter(v => !v.removed && isCultivationRelic(v));
   if (adjRelics.length && b.time >= (u.resonanceLogAt || 0)) {
    u.resonanceLogAt = b.time + 6;
    interact(b, u, adjRelics[0], 'relic-resonance', 'Relic Resonance: +20% Apex Dmg, +25% Relic Spd');
    fx(b, 'state', u, null, 'RESONANCE');
   }
  }

  if (abilityGauge(u) && u.threshold.current >= u.threshold.max) tick(b, u, 0);
 }

 return { chooseTarget, XENO_BRANCHES, xenoPair, isXeno, isXenoSpecimen, isXenoApex, isSciFi, addWeakpoint, extractHelix, addGenome, checkXenoMetamorphosis, xenoAttack, xenoExtras, tickXeno, critMultiplier, COSMIC_BRANCHES, cosmicPair, isIdol, cosmicApex, updateIdol, dropPage, addSyllables, forgeGrimoire, decipherPage, cosmicPanic, cosmicStatus, cosmicReward, cosmicDeath, cosmicAttack, cosmicExtras, tickCosmic, cosmicCrossing, CYBER_MATRIX, CYBER_APEX, isCyber, cyberApex, augmented, hasAccess, ramCapacity, berserkActive, updateCyber, installChrome, addChromeAttack, addRAM, cyberPoison, uploadHack, cyberDeath, cyberZone, clearSprint, cyberAttack, pumpWall, cyberExtras, tickCyber, ARCANE_PAIRS, arcanePair, isApprentice, isArchon, isElemental, arcaneGauge, bestPair, updateApprentice, receiveEssence, startArcaneTrial, failArcaneTrial, passArcaneTrial, tickArcaneTrial, storeOverflow, elementalLinks, arcaneReaction, elementalSpell, arcaneZone, archonAttack, arcaneExtras, tickArcane, arcaneKill, HUNT_APEX, isSlayer, isHunter, priority, trophyFamily, huntAura, executeThreshold, wallOf, huntArmor, brandQuarry, updateSlayer, trophyPoints, harvestTrophy, forgeHuntRelic, carveTrophy, huntExtras, visceral, slayerAttack, isMech, isMechanical, occupiedSlots, slotOccupied, touches, mechPath, updateMech, addAlloy, reserveDeployment, salvage, forge, scrapworkExtras, armorStrip, arcTiles, inArc, oilPool, tickOil, mechAttack, addQi, addDread, acceptsQi, acceptsDread, isCultivationApex, isUrbanAuthority, bindUrbanRelic, spreadRumor, cubForms, cubRelics, lineageTierIds, species, breed, workshopOptions, upgrade, family, token, abilityGauge, persist, event, flushEvents, evolve, evolutionProgress, preyEligible, consume, devour, spawnToken, summon, teamCharge, refine, dot, warp, extras, growth, grantGrowth, teamPower, highestGrowth, mod, tier, rewardWeights, herbOffering, allies, support, trialFor, encounterFor, ENCOUNTERS, interact, record, report, newRun, draft, skipDraft, rerollDraft, offers, available, chooseNode, reward, addRelic, instance, deploy, step, base, atk, speed, crit, neighbors, kind, xy, track, ring, flank, living, tick, trigger, status, flip, attack, damage, hit, downtime, sensor, rawAtk, startAbilities, prepareHooks, runtime, startHeavenlyTrial, failHeavenlyTrial, passHeavenlyTrial, tickHeavenlyTrial, startBloodlineTrial, failBloodlineTrial, passBloodlineTrial, tickBloodlineTrial, startUrbanContainmentTrial, failUrbanContainmentTrial, passUrbanContainmentTrial, tickUrbanContainmentTrial, startUrbanLegendTrial, failUrbanLegendTrial, passUrbanLegendTrial, resolveUrbanLegendMerger, updateUrbanLegendLineage, wavePlan, spawn, favored, rand, shuffle, finish, updatePractitionerRealm, practitionerRealmForQi, isPractitioner, isCultivationRelic, isUrbanRelic, isUrbanInvestigator, isUrbanLegend, urbanInvestigatorRealmForDread, addRuleMark, triggerBlackout, isApexImmortal, grantUrbanViolation, addTabooMark, getTabooMark, hasLegendMark, totalTabooMarks, isLegendTarget, breaksLegendNaturalRule, markNaturalBreach, URBAN_LEGEND_MARK_NAMES };
})();
if (typeof module !== 'undefined') module.exports = Game;



