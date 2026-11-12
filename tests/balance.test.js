'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),G=require('../engine'),D=require('../data');
function battle(ids,slots=ids.map((_,i)=>i)){
 const r=G.newRun('none', 17);r.roster=ids.map(id=>G.instance(r,id));r.depth=15;r.node={row:15,lane:1,type:'boss'};r.phase='combat';
 const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:1,interval:1,hp:100},spawned:1};b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u);u.currentCooldown=999});return b;
}
function enemy(b,kind='boss',p=15.99){const e={uid:b.enemies.length+1,p,hp:11000,maxHp:11000,speed:.31,leak:kind==='boss'?100:10,defense:0,boss:kind==='boss',champion:kind==='champion',maxProgress:p,bornAt:0,gone:false,slows:[],bleeds:[],burns:[],venoms:[],auras:[],ruleMarks:0};b.enemies.push(e);return e;}
for(const id of ['ruleArchitect','livingTaboo','xuanwuCubApex'])for(const kind of ['boss','champion','ordinary'])test(id+' leak protection: '+kind,()=>{
 const b=battle([id]);b.units[0].lineage='xuanwu';const e=enemy(b,kind);G.step(b,.1);
 if(kind==='ordinary'){assert.equal(b.metrics.leaks,0);assert.equal(b.run.health,100);}
 else {assert.equal(e.hp,11000);assert.equal(b.metrics.leaks,1);assert.ok(b.run.health<100);if(kind==='boss')assert.equal(b.won,false);}
});
for(const kind of ['boss','champion','ordinary'])test('Penrose execution: '+kind,()=>{const b=battle(['penroseLabyrinth']),u=b.units[0],e=enemy(b,kind,3.99);u.violations=45;e.hp=2000;e.panicUntil=10;b.curfewUntil=10;b.blackoutLockoutUntil=18;G.step(b,.1);if(kind==='ordinary')assert.equal(e.hp,0);else assert.ok(e.hp>0);});
for(const id of ['talismanSovereign','slitMouthedSovereign'])for(const kind of ['boss','champion','ordinary'])test(id+' execution: '+kind,()=>{const b=battle([id]),e=enemy(b,kind,4);e.maxHp=100000;e.hp=9000;e.speed=.5;G.attack(b,b.units[0]);if(kind==='ordinary')assert.equal(e.hp,0);else assert.ok(e.hp>0);});
test('Kuchisake earns progression, cooldown throttles rewards but not damage or marks',()=>{const b=battle(['kuchisake','mannequin'],[0,1]),[u,v]=b.units,e=enemy(b,'ordinary',4);e.hp=e.maxHp=1e6;e.speed=.5;G.attack(b,u);assert.equal(u.violations,.35);assert.equal(v.violations||0,0);const hp=e.hp;G.attack(b,u);assert.ok(e.hp<hp);assert.equal(G.getTabooMark(e,'kuchisake'),2);assert.equal(u.violations,.35);b.time=8;G.attack(b,u);assert.equal(u.violations,.7);assert.equal(v.violations||0,0);});
test('different runners earn independent reaction rewards',()=>{const b=battle(['nightBus']),u=b.units[0];for(let i=0;i<2;i++){const e=enemy(b,'ordinary',4+i);e.speed=.5;}G.attack(b,u);assert.equal(u.violations,.7);});
test('normal Practitioner attacks grant no Qi',()=>{const b=battle(['practitioner']),u=b.units[0];enemy(b,'ordinary',4);for(let i=0;i<6;i++)G.attack(b,u);assert.equal(u.qi||0,0);assert.equal(b.run.roster[0].qi||0,0);});
test('one forge working slot can complete two-piece recipe across deployments',()=>{
 const b=battle(['smelter','scrapFrame','magneticCrane','magneticCrane','magneticCrane'],[4,0,1,3,5]),s=b.units[0];
 function input(id){const t=G.spawnToken(b,s,id,true,{origin:id,tokenAtk:0,attackInterval:0});assert.equal(t.slot,7);G.forge(b,s);assert.ok(t.removed);}
 input('rustSword');assert.deepEqual(s.scrapIntake,['rustSword']);assert.equal(b.metrics.smelts,undefined);assert.deepEqual(b.run.roster[0].scrapIntake,['rustSword']);
 const restored=G.runtime(b,b.run.roster[0],4);b.units[0]=restored;const t=G.spawnToken(b,restored,'rustGun',true,{origin:'rustGun',tokenAtk:0,attackInterval:0});assert.equal(t.slot,7);G.forge(b,restored);
 assert.deepEqual(restored.scrapIntake,[]);assert.deepEqual(b.units[1].modules,['gunblade']);assert.equal(b.units[1].alloy,3);assert.equal(b.metrics.smelts,1);
});
test('intake capacity and forge cooldown prevent duplicate smelts',()=>{const b=battle(['smelter','scrapFrame'],[4,8]),s=b.units[0];s.scrapIntake=['rustSword','rustGun'];s.forgeAt=4;const t=G.spawnToken(b,s,'rustGun',true);G.forge(b,s);assert.equal(t.removed,false);assert.equal(s.scrapIntake.length,2);b.time=4;G.forge(b,s);assert.equal(b.metrics.smelts,1);G.forge(b,s);assert.equal(b.metrics.smelts,1);assert.deepEqual(s.scrapIntake,['rustGun']);});
test('stored intake is preserved when no Mech is deployed',()=>{const b=battle(['smelter']),s=b.units[0];s.scrapIntake=['rustSword'];const t=G.spawnToken(b,s,'rustGun',true);G.forge(b,s);assert.equal(t.removed,false);assert.deepEqual(s.scrapIntake,['rustSword']);});

test('Nascent Soul earns uncapped permanent ATK for each Qi gained above 175',()=>{
 const b=battle(['cultivationNascentSoul']),u=b.units[0];u.qi=174;b.run.roster[0].qi=174;
 G.addQi(b,u,4);
 assert.equal(u.qi,178);assert.equal(u.permanentAtkBonus,.45);
 assert.equal(b.run.roster[0].permanentAtkBonus,.45);assert.equal(u.id,'cultivationNascentSoul');
});
test('Breakthrough Pill unlocks a realm and carries overflow Qi through the gate',()=>{
 const b=battle(['practitioner','cauldron'],[0,1]),u=b.units[0];u.qi=29;b.run.roster[0].qi=29;b.run.breakthroughPills=1;
 G.addQi(b,u,6);
 assert.equal(u.id,'cultivationFoundation');assert.equal(u.realm,1);assert.equal(u.qi,35);assert.equal(b.run.breakthroughPills,0);
});
test('Qi waits at each realm gate until a pill is spent; no deployed Cauldron cannot spend',()=>{
 const b=battle(['practitioner','cauldron'],[0,1]),u=b.units[0];b.units=b.units.filter(v=>v.id!=='cauldron');u.qi=29;b.run.roster[0].qi=29;
 G.addQi(b,u,10);assert.equal(u.qi,30);assert.equal(u.id,'practitioner');
 b.run.breakthroughPills=1;G.processPractitionerBreakthroughs(b);assert.equal(u.id,'practitioner');assert.equal(b.run.breakthroughPills,1);
});
test('Crossing multiple paid realm thresholds spends multiple pills and preserves the remainder',()=>{
 const b=battle(['practitioner','cauldron'],[0,1]),u=b.units[0];u.qi=29;b.run.roster[0].qi=29;b.run.breakthroughPills=2;
 G.addQi(b,u,60);assert.equal(u.id,'cultivationGoldenCore');assert.equal(u.qi,89);assert.equal(b.run.breakthroughPills,0);
});
test('Breakthrough pill target is the eligible deployed Practitioner with the most Qi',()=>{
 const b=battle(['practitioner','cultivationFoundation','cauldron'],[0,1,2]);
 b.units[0].qi=30;b.run.roster[0].qi=30;b.units[1].qi=85;b.run.roster[1].qi=85;b.run.breakthroughPills=1;
 G.processPractitionerBreakthroughs(b);
 assert.equal(b.units[1].id,'cultivationGoldenCore');assert.equal(b.units[0].id,'practitioner');assert.equal(b.run.breakthroughPills,0);
});
test('Cauldron storage is capped at three and is cleared when its last roster copy is lost',()=>{
 const b=battle(['cauldron']),u=b.units[0];b.run.breakthroughPills=2;
 const grass=G.instance(b.run,'herbGrass');b.run.roster.push(grass);const g=G.runtime(b,grass,3);b.units.push(g);G.prepareHooks(b,g);b.time=8;G.extras(b,u,0);
 assert.equal(b.run.breakthroughPills,3);assert.ok(g.removed);
 b.run.roster=b.run.roster.filter(v=>v.uid!==u.uid);G.processPractitionerBreakthroughs(b);assert.equal(b.run.breakthroughPills,0);
});
test('Cauldron brews one pill from adjacent Grass and leaves the Blossom for its next brew',()=>{
 const b=battle(['practitioner','cauldron','herbGrass','lotusBlossom'],[0,1,2,3]),pot=b.units.find(v=>v.id==='cauldron'),grass=b.units.find(v=>v.id==='herbGrass'),blossom=b.units.find(v=>v.id==='lotusBlossom');
 b.time=8;G.extras(b,pot,0);
 assert.equal(b.run.breakthroughPills,1);assert.equal(grass.removed,true);assert.equal(blossom.removed,false);
});
test('Full Cauldron storage turns adjacent Grass into +12 Qi for the highest-Qi deployed Practitioner',()=>{
 const b=battle(['practitioner','cultivationFoundation','cauldron','herbGrass'],[0,2,1,4]),low=b.units[0],high=b.units[1],pot=b.units[2],grass=b.units[3];
 low.qi=30;high.qi=70;b.run.roster[0].qi=30;b.run.roster[1].qi=70;b.run.breakthroughPills=3;
 b.time=8;G.extras(b,pot,0);
 assert.equal(high.qi,82);assert.equal(high.id,'cultivationFoundation');assert.equal(low.qi,30);assert.equal(b.run.breakthroughPills,2);assert.equal(grass.removed,true);
});
test('Cauldron independently brews adjacent Grass and Blossom on the same cycle',()=>{
 const b=battle(['practitioner','cauldron','herbGrass','lotusBlossom'],[0,1,2,4]),cultivator=b.units[0],pot=b.units[1],grass=b.units[2],blossom=b.units[3];
 b.time=8;G.extras(b,pot,0);assert.equal(b.run.breakthroughPills,1);assert.equal(cultivator.qi,6);assert.equal(cultivator.permanentAtkBonus,4);assert.equal(grass.removed,true);assert.equal(blossom.removed,true);
});
test('Cauldron brews a Blossom for +6 Qi and +4 ATK to the least-Qi unit; direct absorption remains +5 Qi/+2 ATK',()=>{
 const brewed=battle(['practitioner','cultivationFoundation','cauldron','lotusBlossom'],[0,2,1,4]),cultivator=brewed.units[0],foundation=brewed.units[1],pot=brewed.units[2],blossom=brewed.units[3];
 cultivator.qi=30;foundation.qi=20;brewed.time=8;G.extras(brewed,pot,0);assert.equal(cultivator.qi,30);assert.equal(foundation.qi,26);assert.equal(foundation.permanentAtkBonus,4);assert.equal(blossom.removed,true);
 const direct=battle(['practitioner','lotusBlossom'],[0,1]),p=direct.units[0],token=direct.units[1];G.extras(direct,p,0);assert.equal(p.qi,5);assert.equal(p.permanentAtkBonus,2);assert.equal(token.removed,true);
});
test('Nascent Soul starts its Elite/Boss trial at 200 Qi, not 175',()=>{
 const b=tribulationBattle();b.units[0].qi=199;b.run.roster[0].qi=199;assert.equal(G.startHeavenlyTrial(b),null);
 G.addQi(b,b.units[0],1);assert.equal(b.heavenlyTrial?.status,'active');
});
test('Cultivation Qi ATK continues after Apex alongside the existing 30-Qi growth',()=>{
 const b=battle(['swordImmortal']),u=b.units[0];u.qi=180;u.apexQi=0;b.run.roster[0].qi=180;
 G.addQi(b,u,4);assert.equal(u.permanentAtkBonus,.6);
 G.addQi(b,u,26);assert.equal(u.qi,210);assert.equal(u.permanentAtkBonus,6.5);
 assert.equal(b.run.roster[0].permanentAtkBonus,6.5);assert.equal(u.apexQi,0);
});
function tribulationBattle(practitionerId='cultivationNascentSoul', relicId='flyingSword', slots=[0,1]){const r=G.newRun('none', 91);r.roster=[G.instance(r,practitionerId),G.instance(r,relicId)];r.roster[0].qi=200;r.depth=15;r.node={row:15,lane:1,type:'boss'};r.phase='combat';const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:42,interval:1.4,hp:100,bossHp:11000},spawned:0,enemyUid:0,done:false};b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u)});return b;}
test('Heavenly Tribulation starts on Elite or Boss with an adjacent matching relic',()=>{const b=tribulationBattle();b.run.node.type='battle';assert.equal(G.startHeavenlyTrial(b),null);b.run.node.type='elite';assert.equal(G.startHeavenlyTrial(b).apexId,'swordImmortal');const boss=tribulationBattle();assert.equal(G.startHeavenlyTrial(boss).apexId,'swordImmortal');});
test('Cultivation trial starts mid-node when Qi reaches 200 and is blocked after a leak',()=>{const b=tribulationBattle();const soul=b.units[0];soul.qi=199;b.run.roster[0].qi=199;assert.equal(G.startHeavenlyTrial(b),null);G.addQi(b,soul,1);assert.equal(b.heavenlyTrial?.status,'active');const blocked=tribulationBattle();blocked.units[0].qi=199;blocked.run.roster[0].qi=199;blocked.metrics.leaks=1;G.addQi(blocked,blocked.units[0],1);assert.equal(blocked.heavenlyTrial,undefined);});
test('Heavenly storm stuns the Nascent Soul for 0.5s and hits all active runners for 25',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);const soul=b.units[0],a=enemy(b,'ordinary',2),boss=enemy(b,'boss',3);a.hp=a.maxHp=1000;boss.hp=boss.maxHp=11000;b.time=4;G.tickHeavenlyTrial(b);assert.equal(soul.trialStunnedUntil,4.5);assert.equal(a.hp,975);assert.equal(boss.hp,10975);assert.equal(b.heavenlyTrial.strikes,1);});
test('Cultivation evolves only after a zero-leak Elite/Boss node clear',()=>{for(const nodeType of ['elite','boss']){const b=tribulationBattle('cultivationNascentSoul','guqin');b.run.node.type=nodeType;G.startHeavenlyTrial(b);const soul=b.units[0],relic=b.units[1];if(nodeType==='boss'){const boss=enemy(b,'boss',6);boss.hp=1;G.damage(b,boss,2,soul);assert.equal(b.heavenlyTrial.status,'active');assert.equal(soul.id,'cultivationNascentSoul');}G.finish(b,true);assert.equal(b.heavenlyTrial.status,'passed',nodeType);assert.equal(soul.id,'melodicSaint',nodeType);assert.equal(relic.removed,true,nodeType);assert.ok(b.run.roster.some(u=>u.uid===soul.uid&&u.id==='melodicSaint'),nodeType);}});
test('runner escape fails on Elite or Boss and permanently removes Nascent Soul plus matching relic',()=>{for(const nodeType of ['elite','boss']){const b=tribulationBattle();b.run.node.type=nodeType;G.startHeavenlyTrial(b);const e=enemy(b,'ordinary',15.99);e.hp=e.maxHp=10000;G.step(b,.1);assert.equal(b.heavenlyTrial.status,'failed',nodeType);assert.equal(b.metrics.leaks,1,nodeType);assert.equal(b.run.roster.length,0,nodeType);assert.equal(b.run.health,90,nodeType);}});
test('failure leaves the rest of the run active',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);G.failHeavenlyTrial(b,'runner escape');assert.equal(b.run.phase,'combat');});
test('all seven relics map to a single trial and their Mythic forms',()=>{for(const [relic,apex] of [['flyingSword','swordImmortal'],['guqin','melodicSaint'],['weiqiBoard','formationMaster'],['inkBrush','talismanSovereign'],['mountainScroll','landscapeSage'],['demonBlade','bloodFiendMaster'],['soulBanner','soulReapingDemon']]){const b=tribulationBattle('cultivationNascentSoul',relic);const t=G.startHeavenlyTrial(b);assert.equal(t?.apexId,apex,relic);assert.equal(G.startHeavenlyTrial(b),t,relic);}});
test('Soul Banner qualifies for the Mythic trial without stored souls',()=>{const b=tribulationBattle('cultivationNascentSoul','soulBanner');assert.equal(b.units[1].souls,0);assert.equal(G.startHeavenlyTrial(b)?.apexId,'soulReapingDemon');});
test('Soul Banner transfers captured souls into the Soul-Reaping Demon when the trial passes',()=>{const b=tribulationBattle('cultivationNascentSoul','soulBanner'),banner=b.units[1],soul=b.units[0];banner.souls=37;G.startHeavenlyTrial(b);b.won=true;assert.equal(G.passHeavenlyTrial(b),true);assert.equal(soul.id,'soulReapingDemon');assert.equal(soul.souls,37);});
test('only the highest-Qi eligible Nascent Soul enters the trial',()=>{const b=tribulationBattle();const other=G.instance(b.run,'cultivationNascentSoul');other.qi=250;b.run.roster.push(other);const unit=G.runtime(b,other,0);G.prepareHooks(b,unit);b.units.push(unit);b.units[1].slot=1;const t=G.startHeavenlyTrial(b);assert.equal(t.unitUid,unit.uid);});
test('Nascent Soul and relic cannot evolve outside an Elite/Boss trial',()=>{const b=tribulationBattle();b.run.node.type='battle';G.extras(b,b.units[0],0);assert.equal(b.units[0].id,'cultivationNascentSoul');assert.equal(b.units[1].removed,false);});
test('a Cultivation trial cannot pass before a clean Elite/Boss clear',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);assert.equal(G.passHeavenlyTrial(b),false);assert.equal(b.heavenlyTrial.status,'active');b.won=true;b.metrics.leaks=1;assert.equal(G.passHeavenlyTrial(b),false);assert.equal(b.heavenlyTrial.status,'active');});
test('a leak before Cultivation readiness prevents trial start',()=>{const b=tribulationBattle();b.run.node.type='elite';b.metrics.leaks=1;assert.equal(G.startHeavenlyTrial(b),null);});
test('removing relic during the active trial also fails and removes practitioner',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);b.units[1].removed=true;b.time=.1;G.tickHeavenlyTrial(b);assert.equal(b.heavenlyTrial.status,'failed');assert.equal(b.units[0].removed,true);assert.equal(b.run.roster.length,0);});


// Haunted Mythic gates and Subject Zero containment trial.
const urbanApexByRelic={ruleboard:'ruleArchitect',panopticon:'allSeeingOverseer',redPhone:'curfewDirector',boneSaw:'forensicDemiurge',elevatorKey:'backroomsWarden'};
const legendApex={kuchisake:'slitMouthedSovereign',nightBus:'terminusBus',payphone:'midnightOperator',morgueMirror:'mirrorQueen',mannequin:'livingTaboo',stair13:'penroseLabyrinth',redRaincoat:'crimsonHarbinger'};
function urbanTrialBattle(relic='ruleboard',nodeType='elite',dread=140){
 const b=battle(['ruleEnforcer',relic],[4,1]);b.run.node.type=nodeType;
 const enforcer=b.units.find(u=>G.family(u)==='investigator'),focus=b.units.find(u=>u.id===relic);
 enforcer.dread=dread;b.run.roster.find(u=>u.uid===enforcer.uid).dread=dread;
 G.startUrbanContainmentTrial(b);return {b,enforcer,focus};
}
test('Urban Legends stay Epic at 80 until the zero-leak Elite/Boss trial passes',()=>{
 for(const id of Object.keys(legendApex)){const b=battle([id]),u=b.units[0];u.violations=79.9;G.grantUrbanViolation(b,u,0);assert.notEqual(u.id,legendApex[id]);u.violations=80;G.grantUrbanViolation(b,u,0);assert.notEqual(u.id,legendApex[id]);}
});
const legendSameLineagePairs={
 kuchisake:['kuchisake','scissorBanshee'], nightBus:['nightBus','ghostRoute'], payphone:['payphone','hauntedSwitchboard'],
 morgueMirror:['morgueMirror','doppelMirror'], mannequin:['mannequin','stalker'], stair13:['stair13','infiniteStair'], redRaincoat:['redRaincoat','bloodPhantasm']
};
test('80-Violation Legend starts Elite/Boss trial by consuming adjacent same-lineage 45+ prey and inherits 20% ATK',()=>{
 for(const [lineage,[baseId,epicId]] of Object.entries(legendSameLineagePairs)){
  const b=battle([baseId,epicId],[4,1]);b.run.node.type='elite';const a=b.units[0],v=b.units[1];a.violations=80;v.violations=45;
  const expected=Math.round(G.atk(b,v)*.2*100)/100;const t=G.startUrbanLegendTrial(b);
  assert.equal(t.status,'active',lineage);assert.equal(v.removed,true,lineage);assert.equal(b.run.roster.some(x=>x.uid===v.uid),false,lineage);
  assert.equal(a.permanentAtkBonus,expected,lineage);assert.notEqual(a.id,legendApex[lineage],lineage);
  assert.equal(t.lineage,lineage);assert.equal(b.metrics.urbanLegendTrial.inheritedAtk,expected);
 }
});
test('same-lineage Mythic trial requires 80/45, adjacency, and Elite/Boss node',()=>{
 const b=battle(['stair13','infiniteStair'],[4,1]),a=b.units[0],v=b.units[1];a.violations=79.99;v.violations=45;b.run.node.type='elite';assert.equal(G.startUrbanLegendTrial(b),null);a.violations=80;v.slot=8;Object.assign(v,G.xy(8));assert.equal(G.startUrbanLegendTrial(b),null);v.slot=1;Object.assign(v,G.xy(1));b.run.node.type='battle';assert.equal(G.startUrbanLegendTrial(b),null);b.run.node.type='boss';assert.equal(G.startUrbanLegendTrial(b)?.status,'active');
});
test('zero-leak trial success evolves each same-lineage Legend to its own Mythic',()=>{
 for(const [lineage,[baseId,epicId]] of Object.entries(legendSameLineagePairs)){
  const b=battle([baseId,epicId],[4,1]),a=b.units[0],v=b.units[1];a.violations=80;v.violations=45;G.startUrbanLegendTrial(b);b.won=true;b.metrics.leaks=0;
  assert.equal(G.passUrbanLegendTrial(b),true,lineage);assert.equal(a.id,legendApex[lineage],lineage);assert.equal(b.urbanLegendTrial.status,'passed');assert.equal(a.permanentAtkBonus,b.urbanLegendTrial.inheritedAtk);
 }
});
test('failed Folklore trial removes the devourer and prey remains permanently consumed',()=>{
 const b=battle(['stair13','infiniteStair'],[4,1]),a=b.units[0],v=b.units[1];a.violations=80;v.violations=45;G.startUrbanLegendTrial(b);assert.equal(v.removed,true);assert.equal(b.run.roster.some(x=>x.uid===v.uid),false);assert.equal(G.failUrbanLegendTrial(b,'A runner leaked'),true);assert.equal(a.removed,true);assert.equal(b.run.roster.some(x=>x.uid===a.uid),false);assert.equal(b.urbanLegendTrial.status,'failed');assert.match(b.urbanLegendTrial.reason,/leaked/);
});
test('finishing Elite/Boss with zero leaks passes trial and failure consumes the devourer',()=>{
 let b=battle(['stair13','infiniteStair'],[4,1]),a=b.units[0],v=b.units[1];a.violations=80;v.violations=45;b.run.node.type='elite';G.startUrbanLegendTrial(b);G.finish(b,true);assert.equal(a.id,legendApex.stair13);assert.equal(b.urbanLegendTrial.status,'passed');
 b=battle(['stair13','infiniteStair'],[4,1]);a=b.units[0];v=b.units[1];a.violations=80;v.violations=45;b.run.node.type='boss';G.startUrbanLegendTrial(b);G.finish(b,false);assert.equal(b.urbanLegendTrial.status,'failed');assert.equal(a.removed,true);assert.equal(b.run.roster.some(x=>x.uid===a.uid),false);assert.equal(v.removed,true);
});
test('Blackout alone cannot evolve an 80-Violation Legend without starting its Elite/Boss trial',()=>{
 const b=battle(['stair13','infiniteStair'],[4,1]),a=b.units[0],v=b.units[1];a.violations=80;v.violations=45;b.run.node.type='battle';b.urbanViolationsForBlackout=4;G.grantUrbanViolation(b,a,1,null);assert.notEqual(a.id,legendApex.stair13);assert.equal(v.removed,false);assert.equal(b.urbanLegendTrial,undefined);
});
test('nearby Legends no longer receive shared violation progress',()=>{const b=battle(['kuchisake','nightBus'],[4,1]),a=b.units[0],v=b.units[1];G.grantUrbanViolation(b,a,1,null);assert.ok(a.violations>0);assert.equal(v.violations||0,0);});
test('Red Hotline marks Subject Zero and Director locks marked target without Blackout',()=>{const {b}=urbanTrialBattle('redPhone');const phone=b.units.find(u=>u.id==='redPhone'),zero=b.enemies.find(e=>e.subjectZero);b.time=4;G.extras(b,phone,0);assert.equal(zero.ruleMarks,1);assert.equal(b.curfewUntil||0,0);const director={...phone,uid:999,id:'curfewDirector',slot:2};G.prepareHooks(b,director);b.units.push(director);zero.ruleMarks=5;b.time=6;G.extras(b,director,0);assert.ok(zero.frozenUntil>=9);assert.equal(b.curfewUntil||0,0);});
test('all five Architecture A relics launch Subject Zero only on Elite/Boss at 140 Dread',()=>{
 for(const [relic,apex] of Object.entries(urbanApexByRelic)){
  let {b}=urbanTrialBattle(relic,'elite');assert.equal(b.urbanContainmentTrial?.status,'active');assert.equal(b.urbanContainmentTrial.apexId,apex);assert.ok(b.enemies.some(e=>e.subjectZero));
  ({b}=urbanTrialBattle(relic,'boss'));assert.equal(b.urbanContainmentTrial?.status,'active');
  ({b}=urbanTrialBattle(relic,'battle'));assert.equal(b.urbanContainmentTrial,undefined);assert.ok(!b.enemies.some(e=>e.subjectZero));
 }
});
test('Subject Zero trial requires 140 Dread and orthogonal adjacency',()=>{
 let {b}=urbanTrialBattle('ruleboard','elite',139);assert.equal(b.urbanContainmentTrial,undefined);
 let x=urbanTrialBattle('ruleboard','elite',140);x.b.urbanContainmentTrial=undefined;x.b.metrics.urbanContainmentTrial=undefined;x.b.enemies=x.b.enemies.filter(e=>!e.subjectZero);x.focus.slot=8;Object.assign(x.focus,G.xy(8));assert.equal(G.startUrbanContainmentTrial(x.b),null);
});
test('Subject Zero kill completes its feat; Mythic binding waits for a zero-leak Elite/Boss clear',()=>{
 for(const [relic,apex] of Object.entries(urbanApexByRelic)){
  const {b,enforcer,focus}=urbanTrialBattle(relic,'elite');const zero=b.enemies.find(e=>e.subjectZero);zero.ruleMarks=5;
  assert.equal(G.damage(b,zero,zero.hp,enforcer),zero.maxHp);assert.equal(b.urbanContainmentTrial.status,'active');assert.equal(b.urbanContainmentTrial.subjectZeroContained,true);assert.equal(enforcer.id,'ruleEnforcer');assert.equal(focus.removed,false);
  G.finish(b,true);assert.equal(b.urbanContainmentTrial.status,'passed');assert.equal(enforcer.id,apex);assert.ok(focus.removed);assert.ok(b.run.roster.some(u=>u.uid===enforcer.uid&&u.id===apex));assert.ok(!b.run.roster.some(u=>u.uid===focus.uid));
 }
});
test('Subject Zero does not bind if a runner leaks after its five-mark kill',()=>{
 const {b,enforcer,focus}=urbanTrialBattle();const zero=b.enemies.find(e=>e.subjectZero);zero.ruleMarks=5;G.damage(b,zero,zero.hp,enforcer);b.metrics.leaks=1;G.finish(b,true);
 assert.equal(b.urbanContainmentTrial.status,'failed');assert.equal(enforcer.removed,true);assert.equal(focus.removed,true);assert.ok(!b.run.roster.some(u=>u.uid===enforcer.uid||u.uid===focus.uid));
});
test('Subject Zero under-marked kill and escape fail and permanently remove Enforcer and Relic',()=>{
 let {b,enforcer,focus}=urbanTrialBattle();let zero=b.enemies.find(e=>e.subjectZero);zero.ruleMarks=4;G.damage(b,zero,zero.hp,enforcer);assert.equal(b.urbanContainmentTrial.status,'failed');assert.ok(enforcer.removed&&focus.removed);assert.equal(b.run.roster.length,0);
 ({b,enforcer,focus}=urbanTrialBattle());zero=b.enemies.find(e=>e.subjectZero);zero.p=15.99;zero.speed=1;G.step(b,.1);assert.equal(b.urbanContainmentTrial.status,'failed');assert.ok(enforcer.removed&&focus.removed);assert.equal(b.run.roster.length,0);
});
test('trial progress display advertises the 80-point Elite/Boss zero-leak gate',()=>{
 const b=battle(['kuchisake']),u=b.units[0];u.violations=80;const progress=G.evolutionProgress(u);assert.equal(progress.current,80);assert.equal(progress.max,80);assert.match(progress.label,/Elite\/Boss/);
});

// Bloodline Mythic trial: only the Tier 3 lineage and matching relic are at stake.
function bloodlineTrialBattle(unitId='dragonCubT3', relicId='dragonPearl', nodeType='elite') {
 const b=battle([unitId,relicId],[0,1]);b.run.node.type=nodeType;return b;
}
test('Bloodline trial starts only for matching Tier 3 lineage and relic on Elite/Boss with no prior leaks',()=>{
 for(const nodeType of ['elite','boss']){const b=bloodlineTrialBattle('tigerCubT3','tigerSeal',nodeType);assert.equal(G.startBloodlineTrial(b)?.apexId,'tigerCubApex',nodeType);assert.equal(G.startBloodlineTrial(b),b.bloodlineTrial,nodeType);}
 const ordinary=bloodlineTrialBattle();ordinary.run.node.type='battle';assert.equal(G.startBloodlineTrial(ordinary),null);
 const leaked=bloodlineTrialBattle();leaked.metrics.leaks=1;assert.equal(G.startBloodlineTrial(leaked),null);
 const mismatch=bloodlineTrialBattle('dragonCubT3','tigerSeal');assert.equal(G.startBloodlineTrial(mismatch),null);
});
test('Bloodline trial starts when Tier 3 criteria become ready mid-node',()=>{
 const b=bloodlineTrialBattle('dragonCubT3','dragonPearl','elite');assert.equal(b.bloodlineTrial,undefined);G.extras(b,b.units[0],0);assert.equal(b.bloodlineTrial?.status,'active');
});
test('Bloodline evolves to its mapped Mythic and consumes relic only after a zero-leak Elite/Boss clear',()=>{
 for(const [relic,apex] of [['dragonPearl','dragonCubApex'],['tigerSeal','tigerCubApex'],['earthTablet','xuanwuCubApex'],['phoenixTree','phoenixCubApex'],['goldenStaff','monkeyCubApex']]){
  for(const nodeType of ['elite','boss']){const lineage={dragon:'dragonCubT3',tiger:'tigerCubT3',xuanwu:'xuanwuCubT3',phoenix:'phoenixCubT3',monkey:'monkeyCubT3'}[G.lineageTierIds[{dragonPearl:'dragonCubApex',tigerSeal:'tigerCubApex',earthTablet:'xuanwuCubApex',phoenixTree:'phoenixCubApex',goldenStaff:'monkeyCubApex'}[relic]].path];const b=bloodlineTrialBattle(lineage,relic,nodeType),unit=b.units[0],focus=b.units[1];assert.ok(G.startBloodlineTrial(b));G.finish(b,true);assert.equal(b.bloodlineTrial.status,'passed',relic+' '+nodeType);assert.equal(unit.id,apex,relic+' '+nodeType);assert.equal(focus.removed,true,relic+' '+nodeType);assert.ok(b.run.roster.some(u=>u.uid===unit.uid&&u.id===apex));assert.ok(!b.run.roster.some(u=>u.uid===focus.uid));}
 }
});
test('Bloodline trial leak or failed node removes Tier 3 candidate and relic only',()=>{
 for(const mode of ['leak','failed-clear']){const b=bloodlineTrialBattle();const unit=b.units[0],focus=b.units[1],other=G.instance(b.run,'hound');b.run.roster.push(other);b.units.push(G.runtime(b,other,4));assert.ok(G.startBloodlineTrial(b));if(mode==='leak')assert.ok(G.failBloodlineTrial(b,'A runner leaked'));else G.finish(b,false);assert.equal(b.bloodlineTrial.status,'failed');assert.equal(unit.removed,true);assert.equal(focus.removed,true);assert.deepEqual(b.run.roster.map(u=>u.uid),[other.uid]);}
});
test('Bloodline Tier 3 progress explains its distinct final trial gate',()=>{
 const b=bloodlineTrialBattle();b.units[0].lineageStacks=6;const p=G.evolutionProgress(b.units[0]);assert.equal(p.current,6);assert.equal(p.max,6);assert.match(p.label,/Elite\/Boss zero-leak trial/);assert.match(p.label,/Dragon Pearl/);
});

// Arcane Mythic proof: the chosen synthesis reaction must strike a priority target.
function arcaneTrialBattle(pair='fire+water',nodeType='elite'){
 const b=battle(['elementalApprentice','astralLoom'],[0,1]);b.run.node.type=nodeType;b.run.depth=9;
 const mage=b.units[0];mage.synthesis={[pair]:30};b.run.roster[0].synthesis={...mage.synthesis};return b;
}
function arcaneTrialTarget(b,pair,kind='elite'){
 const e=enemy(b,kind==='boss'?'boss':kind==='champion'?'champion':'ordinary',6);
 if(kind==='elite')e.elite=true;
 const [first]=pair.split('+');e.elements={[first]:b.time+4};return e;
}
test('Arcane Weaving trial starts on Elite/Boss whenever 30-point Mage has adjacent Loom',()=>{
 for(const nodeType of ['elite','boss']){const b=arcaneTrialBattle('fire+water',nodeType);assert.equal(G.startArcaneTrial(b)?.apexId,'steamSovereign',nodeType);assert.equal(G.startArcaneTrial(b),b.arcaneTrial,nodeType);}
 const ordinary=arcaneTrialBattle();ordinary.run.node.type='battle';assert.equal(G.startArcaneTrial(ordinary),null);
 const early=arcaneTrialBattle();early.run.depth=0;assert.equal(G.startArcaneTrial(early)?.status,'active');
 const short=arcaneTrialBattle();short.units[0].synthesis['fire+water']=29;assert.equal(G.startArcaneTrial(short),null);
 const far=arcaneTrialBattle();far.units[1].slot=6;Object.assign(far.units[1],G.xy(6));assert.equal(G.startArcaneTrial(far),null);
});
test('Arcane Weaving starts as soon as the 30-point gate is reached during an eligible node',()=>{
 const b=arcaneTrialBattle('fire+water','elite'),mage=b.units[0];mage.synthesis['fire+water']=29;b.run.roster[0].synthesis={'fire+water':29};
 G.receiveEssence(b,mage,'fire');mage.essences=['water'];G.receiveEssence(b,mage,'fire');
 assert.equal(mage.synthesis['fire+water'],30);assert.equal(b.arcaneTrial?.status,'active');
});
test('Arcane proof requires the highest chosen pair reaction to hit Elite, Harbinger, or Boss',()=>{
 for(const [pair,apex] of Object.entries(G.ARCANE_PAIRS)){
  const b=arcaneTrialBattle(pair);G.startArcaneTrial(b);const mage=b.units[0],elements=pair.split('+'),sourceId={earth:'geoMage',fire:'pyroMage',water:'hydroMage',wind:'aeroMage'}[elements[1]],sourceInstance=G.instance(b.run,sourceId),source=G.runtime(b,sourceInstance,4);G.prepareHooks(b,source);b.units.push(source);const e=arcaneTrialTarget(b,pair,'ordinary');G.arcaneReaction(b,source,e,elements[1]);assert.equal(b.arcaneTrial.featDone,false,pair);
  const priority=arcaneTrialTarget(b,pair,'elite');G.arcaneReaction(b,source,priority,elements[1]);assert.equal(b.arcaneTrial.featDone,true,pair);assert.equal(b.metrics.arcaneTrial.targetType,'Elite');
 }
});
test('zero-leak Arcane trial clear consumes Loom and awakens the Mythic for each synthesis pair',()=>{
 for(const [pair,apex] of Object.entries(G.ARCANE_PAIRS)){
  const b=arcaneTrialBattle(pair,'boss'),mage=b.units[0],loom=b.units[1];G.startArcaneTrial(b);const target=arcaneTrialTarget(b,pair,'boss');G.arcaneReaction(b,mage,target,pair.split('+')[1]);G.finish(b,true);
  assert.equal(b.arcaneTrial.status,'passed',pair);assert.equal(mage.id,apex,pair);assert.equal(loom.removed,true,pair);assert.ok(b.run.roster.some(u=>u.uid===mage.uid&&u.id===apex),pair);assert.ok(!b.run.roster.some(u=>u.uid===loom.uid),pair);
 }
});
test('Arcane trial leak, failed clear, or missing priority reaction loses Mage and Loom',()=>{
 for(const mode of ['leak','failed-clear','no-feat']){
  const b=arcaneTrialBattle(),mage=b.units[0],loom=b.units[1],other=G.instance(b.run,'pyroMage');b.run.roster.push(other);b.units.push(G.runtime(b,other,4));assert.ok(G.startArcaneTrial(b));
  if(mode==='leak')G.failArcaneTrial(b,'A runner leaked');else G.finish(b,false);
  assert.equal(b.arcaneTrial.status,'failed',mode);assert.equal(mage.removed,true,mode);assert.equal(loom.removed,true,mode);assert.deepEqual(b.run.roster.map(u=>u.uid),[other.uid],mode);
 }
});
test('Arcane progress exposes the selected pair and exact final trial gate',()=>{
 const b=arcaneTrialBattle();G.startArcaneTrial(b);const p=G.evolutionProgress(b.units[0]);assert.equal(p.current,30);assert.match(p.label,/fire\+water/);assert.doesNotMatch(p.label,/Crossing 10\+/);assert.match(p.label,/Elite\/Boss reaction trial/);
});

function scrapworkTrialBattle(modules=['blade','flak'],nodeType='elite'){
 const b=battle(['scrapFrame','titanReactor'],[4,1]);b.run.node.type=nodeType;
 const titan=b.units[0],reactor=b.units[1];titan.id='titanFrame';titan.alloy=120;titan.extraSlot=5;titan.modules=[...modules];b.run.roster[0].id='titanFrame';b.run.roster[0].alloy=120;b.run.roster[0].extraSlot=5;b.run.roster[0].modules=[...modules];
 return b;
}
test('Scrapwork trial starts on Elite/Boss without a Crossing gate when Titan and Reactor criteria are met',()=>{
 for(const type of ['elite','boss']){const b=scrapworkTrialBattle(['blade','flak'],type);b.run.depth=0;assert.equal(G.startScrapworkTrial(b)?.status,'active',type);}
 const ordinary=scrapworkTrialBattle();ordinary.run.node.type='battle';assert.equal(G.startScrapworkTrial(ordinary),null);
 const short=scrapworkTrialBattle(['blade']);assert.equal(G.startScrapworkTrial(short),null);
 const far=scrapworkTrialBattle();far.units[1].slot=6;Object.assign(far.units[1],G.xy(6));assert.equal(G.startScrapworkTrial(far),null);
});
test('Scrapwork trial starts as soon as final module is installed during an eligible node',()=>{
 const b=scrapworkTrialBattle(['blade'],'elite');b.units[0].modules=['blade'];b.run.roster[0].modules=['blade'];
 b.units[0].modules.push('flak');b.run.roster[0].modules.push('flak');G.updateMech(b,b.units[0]);assert.equal(b.scrapworkTrial?.status,'active');
});
test('Scrapwork actual module attacks prove each locked module and clean clear consumes Reactor into mapped Mythic',()=>{
 for(const [mods,apex] of [[['blade','blade'],'berserkerColossus'],[['flak','flak'],'siegeDreadnought'],[['blade','flak'],'vanguardJuggernaut']]){
  const b=scrapworkTrialBattle(mods,'boss'),t=b.units[0],core=b.units[1];G.startScrapworkTrial(b);const e=enemy(b,'boss',5);e.hp=e.maxHp=1e6;
  t.attackCount=1;G.mechAttack(b,t,e,G.atk(b,t));
  assert.deepEqual(Object.keys(b.scrapworkTrial.moduleHits).sort(),mods.map((m,i)=>`${m}:${i+1}`).sort(),mods.join('+'));
  G.finish(b,true);assert.equal(b.scrapworkTrial.status,'passed');assert.equal(t.id,apex);assert.equal(core.removed,true);assert.ok(b.run.roster.some(u=>u.uid===t.uid&&u.id===apex));assert.ok(!b.run.roster.some(u=>u.uid===core.uid));
 }
});
test('Scrapwork trial fails on leak, missing module proof, or failed clear and removes Titan plus Reactor',()=>{
 for(const mode of ['leak','missing-proof','failed-clear']){const b=scrapworkTrialBattle(['blade','flak']),t=b.units[0],core=b.units[1];G.startScrapworkTrial(b);
  if(mode==='leak')G.failScrapworkTrial(b,'A runner leaked');else if(mode==='missing-proof'){G.markScrapworkTrialHit(b,t,'blade',0,enemy(b,'elite',5));G.finish(b,true);}else G.finish(b,false);
  assert.equal(b.scrapworkTrial.status,'failed',mode);assert.equal(t.removed,true,mode);assert.equal(core.removed,true,mode);assert.deepEqual(b.run.roster,[],mode);
 }
});


test('Cultivation base stats are updated across Practitioner realms and Mythic forms',()=>{
 const expected={practitioner:[12,1.5],cultivationFoundation:[25,1.4],cultivationGoldenCore:[50,1.3],cultivationNascentSoul:[85,1.2]};
 for(const [id,[atk,interval]] of Object.entries(expected)){const b=battle([id]);assert.equal(b.units[0].baseAtk,atk,id);assert.equal(b.units[0].attackInterval,interval,id);}
 for(const [id,atk] of [['melodicSaint',110],['landscapeSage',110],['bloodFiendMaster',150]])assert.equal(G.base(G.instance(G.newRun('none', 2),id)),atk,id);
});
test('Cauldron and every Cultivation relic are non-attacking support cards',()=>{
 const ids=['cauldron','flyingSword','guqin','weiqiBoard','inkBrush','mountainScroll','soulBanner','demonBlade'];
 for(const id of ids){const b=battle([id]),u=b.units[0],e=enemy(b);const hp=e.hp;assert.equal(G.attack(b,u),false,id);assert.equal(u.attackCount,0,id);assert.equal(e.hp,hp,id);assert.equal(u.baseAtk,0,id);assert.equal(u.attackInterval,0,id);}
});
function supportEnemy(b,{p=5,hp=100000,maxHp=100000,defense=0,speed=0}={}){const e={uid:b.enemies.length+1,p,hp,maxHp,defense,speed,leak:10,gone:false,boss:false,champion:false,slows:[],bleeds:[],burns:[],venoms:[],auras:[],ruleMarks:0};b.enemies.push(e);return e;}
test('Flying Sword lets adjacent allies pierce 50% defense',()=>{
 const b=battle(['practitioner','flyingSword'],[0,1]),u=b.units[0],e=supportEnemy(b,{defense:.5});G.hit(b,u,e,100,true,{criticalMultiplier:1});assert.equal(100000-e.hp,75);
});
test('Guqin slows all enemies and grants adjacent allies 20% attack speed',()=>{
 const b=battle(['practitioner','guqin'],[0,1]),u=b.units[0],e=supportEnemy(b);G.extras(b,b.units[1],0);G.step(b,.1);assert.ok(e.slows.some(x=>Math.abs(x.power-.2)<1e-9));assert.equal(G.speed(b,u),1.2);
});
test('Soul Banner slows all enemies while remaining a non-attacking soul store',()=>{
 const b=battle(['soulBanner']),banner=b.units[0],e=supportEnemy(b);G.extras(b,banner,0);G.step(b,.1);assert.ok(e.slows.some(x=>Math.abs(x.power-.2)<1e-9));assert.equal(G.attack(b,banner),false);banner.souls=12;assert.equal(G.attack(b,banner),false);
});
test('Weiqi periodically warps enemies back and stuns once on a corner tile',()=>{
 const b=battle(['weiqiBoard']),board=b.units[0],e=supportEnemy(b,{p:10,hp:1000,maxHp:1000});b.time=8;G.extras(b,board,0);assert.equal(e.p,8);assert.ok(b.effects.some(x=>String(x.text).includes('WEIQI')));
 e.p=3.99;e.speed=1;b.time=8;board.formationAt=100;e.retreatingUntil=0;e.panicUntil=0;e.weiqiCornerStunned=false;G.step(b,.1);assert.equal(e.weiqiCornerStunned,true);assert.ok(e.frozenUntil>b.time+0.5);assert.ok(b.effects.some(x=>String(x.text).includes('CORNER')));
 const previous=e.frozenUntil;e.frozenUntil=0;e.p=7.99;b.time=9;G.step(b,.1);assert.equal(e.weiqiCornerStunned,true);assert.equal(e.frozenUntil,0);assert.ok(previous>8);
});
test('Ink Brush increases damage taken by every enemy by 10%',()=>{
 const b=battle(['inkBrush']),e=supportEnemy(b);G.damage(b,e,100,null,'direct',true);assert.equal(100000-e.hp,110);
});
test('Mountain-River Scroll gives adjacent attackers +15% ATK',()=>{
 const b=battle(['practitioner','mountainScroll'],[0,1]);assert.ok(Math.abs(G.atk(b,b.units[0])-13.8)<1e-9);
});
test('Demon Blade grants adjacent attack speed and normal hits add a one-second 1%-max-HP bleed',()=>{
 const b=battle(['practitioner','demonBlade'],[0,1]),u=b.units[0],e=supportEnemy(b);assert.equal(G.speed(b,u),1.1);G.hit(b,u,e,100,true,{criticalMultiplier:1});assert.ok(e.bleeds.some(d=>d.dps===1000&&d.until===1));
});
test('retired catalog entries and retired Haunted form are absent',()=>{
 for(const id of ['jade','monk','immortal','asura','spirit','bell','lantern','medium','lamb','shepherd','harvester','soulwell','wraith','alchemist','catalyst'])assert.equal(D.CARD[id],undefined,id);
 assert.equal(D.LEGACY_CARDS,undefined);
 assert.equal(D.FORMS.some(f=>f.id==='wraith'),false);
 assert.ok(D.CARD.lotusRoot&&D.CARD.herbGrass&&D.CARD.lotusBlossom,'current cultivation descendants remain intact');
 assert.ok(D.CARD.mirrorClone,'current Haunted token remains intact');
});
