'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),G=require('../engine');
function battle(ids,slots=ids.map((_,i)=>i)){
 const r=G.newRun('none',{},17);r.roster=ids.map(id=>G.instance(r,id));r.depth=15;r.node={row:15,lane:1,type:'boss'};r.phase='combat';
 const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:1,interval:1,hp:100},spawned:1};b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u);u.currentCooldown=999});return b;
}
function enemy(b,kind='boss',p=15.99){const e={uid:b.enemies.length+1,p,hp:11000,maxHp:11000,speed:.31,leak:kind==='boss'?100:10,defense:0,boss:kind==='boss',champion:kind==='champion',maxProgress:p,bornAt:0,gone:false,slows:[],bleeds:[],burns:[],venoms:[],auras:[],ruleMarks:0};b.enemies.push(e);return e;}
for(const id of ['ruleArchitect','livingTaboo','xuanwuCubApex'])for(const kind of ['boss','champion','ordinary'])test(id+' leak protection: '+kind,()=>{
 const b=battle([id]);b.units[0].lineage='xuanwu';const e=enemy(b,kind);G.step(b,.1);
 if(kind==='ordinary'){assert.equal(b.metrics.leaks,0);assert.equal(b.run.health,100);}
 else {assert.equal(e.hp,11000);assert.equal(b.metrics.leaks,1);assert.ok(b.run.health<100);if(kind==='boss')assert.equal(b.won,false);}
});
for(const kind of ['boss','champion','ordinary'])test('Penrose execution: '+kind,()=>{const b=battle(['penroseLabyrinth']),u=b.units[0],e=enemy(b,kind,3.99);u.violations=45;e.hp=2000;e.panicUntil=10;b.curfewUntil=10;b.blackoutLockoutUntil=18;G.step(b,.1);if(kind==='ordinary')assert.equal(e.hp,0);else assert.ok(e.hp>0);});
for(const id of ['talismanSovereign','slitMouthedSovereign'])for(const kind of ['boss','champion','ordinary'])test(id+' execution: '+kind,()=>{const b=battle([id]),e=enemy(b,kind,4);e.maxHp=100000;e.hp=12000;e.speed=.5;G.attack(b,b.units[0]);if(kind==='ordinary')assert.equal(e.hp,0);else assert.ok(e.hp>0);});
test('Kuchisake earns progression, cooldown throttles rewards but not damage or marks',()=>{const b=battle(['kuchisake','mannequin'],[0,1]),[u,v]=b.units,e=enemy(b,'ordinary',4);e.hp=e.maxHp=1e6;e.speed=.5;G.attack(b,u);assert.equal(u.violations,.35);assert.equal(v.violations,.0525);const hp=e.hp;G.attack(b,u);assert.ok(e.hp<hp);assert.equal(G.getTabooMark(e,'kuchisake'),2);assert.equal(u.violations,.35);b.time=8;G.attack(b,u);assert.equal(u.violations,.7);assert.equal(v.violations,.105);});
test('different runners earn independent reaction rewards',()=>{const b=battle(['nightBus']),u=b.units[0];for(let i=0;i<2;i++){const e=enemy(b,'ordinary',4+i);e.speed=.5;}G.attack(b,u);assert.equal(u.violations,.7);});
test('three cultivation attacks earn one Qi and remainder persists',()=>{const b=battle(['practitioner']),u=b.units[0];enemy(b,'ordinary',4);G.attack(b,u);G.attack(b,u);assert.equal(u.qi,0);const restored=G.runtime(b,b.run.roster[0],0);assert.equal(restored.qiAttackCharge,2);G.attack(b,restored);assert.equal(restored.qi,1);assert.equal(restored.qiAttackCharge,0);});
test('one forge working slot can complete two-piece recipe across deployments',()=>{
 const b=battle(['smelter','scrapFrame','magneticCrane','magneticCrane','magneticCrane'],[4,0,1,3,5]),s=b.units[0];
 function input(id){const t=G.spawnToken(b,s,id,true,{origin:id,tokenAtk:0,attackInterval:0});assert.equal(t.slot,7);G.forge(b,s);assert.ok(t.removed);}
 input('rustSword');assert.deepEqual(s.scrapIntake,['rustSword']);assert.equal(b.metrics.smelts,undefined);assert.deepEqual(b.run.roster[0].scrapIntake,['rustSword']);
 const restored=G.runtime(b,b.run.roster[0],4);b.units[0]=restored;const t=G.spawnToken(b,restored,'rustGun',true,{origin:'rustGun',tokenAtk:0,attackInterval:0});assert.equal(t.slot,7);G.forge(b,restored);
 assert.deepEqual(restored.scrapIntake,[]);assert.deepEqual(b.units[1].modules,['gunblade']);assert.equal(b.units[1].alloy,3);assert.equal(b.metrics.smelts,1);
});
test('intake capacity and forge cooldown prevent duplicate smelts',()=>{const b=battle(['smelter','scrapFrame'],[4,8]),s=b.units[0];s.scrapIntake=['rustSword','rustGun'];s.forgeAt=4;const t=G.spawnToken(b,s,'rustGun',true);G.forge(b,s);assert.equal(t.removed,false);assert.equal(s.scrapIntake.length,2);b.time=4;G.forge(b,s);assert.equal(b.metrics.smelts,1);G.forge(b,s);assert.equal(b.metrics.smelts,1);assert.deepEqual(s.scrapIntake,['rustGun']);});
test('stored intake is preserved when no Mech is deployed',()=>{const b=battle(['smelter']),s=b.units[0];s.scrapIntake=['rustSword'];const t=G.spawnToken(b,s,'rustGun',true);G.forge(b,s);assert.equal(t.removed,false);assert.deepEqual(s.scrapIntake,['rustSword']);});

test('Cultivation gains uncapped permanent ATK for each Qi gained above 175',()=>{
 const b=battle(['practitioner']),u=b.units[0];u.qi=174;b.run.roster[0].qi=174;
 G.addQi(b,u,4);
 assert.equal(u.qi,178);assert.equal(u.permanentAtkBonus,.45);
 assert.equal(b.run.roster[0].permanentAtkBonus,.45);assert.equal(u.id,'cultivationNascentSoul');
});
test('Cultivation Qi ATK continues after Apex alongside the existing 30-Qi growth',()=>{
 const b=battle(['swordImmortal']),u=b.units[0];u.qi=180;u.apexQi=0;b.run.roster[0].qi=180;
 G.addQi(b,u,4);assert.equal(u.permanentAtkBonus,.6);
 G.addQi(b,u,26);assert.equal(u.qi,210);assert.equal(u.permanentAtkBonus,6.5);
 assert.equal(b.run.roster[0].permanentAtkBonus,6.5);assert.equal(u.apexQi,0);
});
function tribulationBattle(practitionerId='cultivationNascentSoul', relicId='flyingSword', slots=[0,1]){const r=G.newRun('none',{},91);r.roster=[G.instance(r,practitionerId),G.instance(r,relicId)];r.roster[0].qi=200;r.depth=15;r.node={row:15,lane:1,type:'boss'};r.phase='combat';const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:42,interval:1.4,hp:100,bossHp:11000},spawned:0,enemyUid:0,done:false};b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u)});return b;}
test('Heavenly Tribulation starts only at the boss with an adjacent matching relic',()=>{const b=tribulationBattle();b.run.node.type='battle';assert.equal(G.startHeavenlyTrial(b),null);b.run.node.type='boss';assert.equal(G.startHeavenlyTrial(b).apexId,'swordImmortal');});
test('Heavenly storm stuns the Nascent Soul for 0.5s and hits all active runners for 25',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);const soul=b.units[0],a=enemy(b,'ordinary',2),boss=enemy(b,'boss',3);a.hp=a.maxHp=1000;boss.hp=boss.maxHp=11000;b.time=4;G.tickHeavenlyTrial(b);assert.equal(soul.trialStunnedUntil,4.5);assert.equal(a.hp,975);assert.equal(boss.hp,10975);assert.equal(b.heavenlyTrial.strikes,1);});
test('boss kill passes trial and consumes relic into mapped Mythic path',()=>{const b=tribulationBattle('cultivationNascentSoul','guqin');G.startHeavenlyTrial(b);const soul=b.units[0],relic=b.units[1],boss=enemy(b,'boss',6);boss.hp=1;assert.equal(G.damage(b,boss,2,soul),1);assert.equal(b.heavenlyTrial.status,'passed');assert.equal(soul.id,'melodicSaint');assert.equal(relic.removed,true);assert.ok(b.run.roster.some(u=>u.uid===soul.uid&&u.id==='melodicSaint'));});
test('runner escape fails and permanently removes Nascent Soul plus matching relic',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);const e=enemy(b,'ordinary',15.99);e.hp=e.maxHp=10000;G.step(b,.1);assert.equal(b.heavenlyTrial.status,'failed');assert.equal(b.metrics.leaks,1);assert.equal(b.run.roster.length,0);assert.equal(b.run.health,90);});
test('failure leaves the rest of the run active',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);G.failHeavenlyTrial(b,'runner escape');assert.equal(b.run.phase,'combat');});
test('all seven relics map to a single trial and their Mythic forms',()=>{for(const [relic,apex] of [['flyingSword','swordImmortal'],['guqin','melodicSaint'],['weiqiBoard','formationMaster'],['inkBrush','talismanSovereign'],['mountainScroll','landscapeSage'],['demonBlade','bloodFiendMaster'],['soulBanner','soulReapingDemon']]){const b=tribulationBattle('cultivationNascentSoul',relic);if(relic==='soulBanner')b.units[1].souls=100;const t=G.startHeavenlyTrial(b);assert.equal(t?.apexId,apex,relic);assert.equal(G.startHeavenlyTrial(b),t,relic);}});
test('Soul Banner only qualifies when it has 100 souls',()=>{const b=tribulationBattle('cultivationNascentSoul','soulBanner');assert.equal(G.startHeavenlyTrial(b),null);});
test('only the highest-Qi eligible Nascent Soul enters the trial',()=>{const b=tribulationBattle();const other=G.instance(b.run,'cultivationNascentSoul');other.qi=250;b.run.roster.push(other);const unit=G.runtime(b,other,0);G.prepareHooks(b,unit);b.units.push(unit);b.units[1].slot=1;const t=G.startHeavenlyTrial(b);assert.equal(t.unitUid,unit.uid);});
test('Nascent Soul and relic cannot evolve outside a boss trial',()=>{const b=tribulationBattle();b.run.node.type='battle';G.extras(b,b.units[0],0);assert.equal(b.units[0].id,'cultivationNascentSoul');assert.equal(b.units[1].removed,false);});
test('a trial cannot pass until a boss is defeated',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);assert.equal(G.passHeavenlyTrial(b),false);assert.equal(b.heavenlyTrial.status,'active');});
test('removing relic during the active trial also fails and removes practitioner',()=>{const b=tribulationBattle();G.startHeavenlyTrial(b);b.units[1].removed=true;b.time=.1;G.tickHeavenlyTrial(b);assert.equal(b.heavenlyTrial.status,'failed');assert.equal(b.units[0].removed,true);assert.equal(b.run.roster.length,0);});
