'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const G = require('../engine');
const D = require('../data');
function battle(ids, slots = ids.map((_, i) => i)) {
 const r = G.newRun('none', {}, 17);
 r.roster = ids.map(id => G.instance(r, id));
 r.node = {row: 5, lane: 1, type: 'battle'}; r.depth = 5; r.phase = 'combat';
 const b = {run:r, time:0, units:[], enemies:[], effects:[], metrics:{kills:0, leaks:0, growth:0, triggers:0, devours:0}, plan:{count:0, interval:1, hp:100}, spawned:0};
 b.units = r.roster.map((u,i) => G.runtime(b,u,slots[i]));
 b.units.forEach(u => { G.prepareHooks(b,u); G.record(b,u); });
 return b;
}
function enemy(b, p=4, hp=100000) {
 const e={uid:b.enemies.length+1,p,hp,maxHp:hp,speed:.336,defense:0,gone:false,slows:[],bleeds:[],burns:[],venoms:[],auras:[],ruleMarks:0};
 b.enemies.push(e); return e;
}
test('grass brewing starts at 8s, shares cadence and temporary speed expires',()=>{
 const b=battle(['practitioner','cauldron','herbGrass','lotusRoot'],[0,4,5,8]);
 const [u,c]=b.units;
 G.extras(b,c,.1);assert.equal(u.qi,0);
 b.time=8;G.extras(b,c,.1);assert.equal(u.qi,18);assert.equal(u.permanentAtkBonus,3);
 assert.equal(u.permanentSpeed,undefined);assert.equal(u.pillSpeedUntil,16);
 const faster=G.speed(b,u);b.time=16;assert.ok(G.speed(b,u)<faster);
 const blossom=G.spawnToken(b,b.units[3],'lotusBlossom');Object.assign(blossom,G.xy(7),{slot:7});
 G.extras(b,c,.1);assert.equal(u.qi,53);assert.equal(c.brewAt,24);assert.ok(blossom.removed);
 G.extras(b,c,.1);assert.equal(u.qi,53);
});
test('Cauldron preserves ingredients without a valid recipient',()=>{
 const b=battle(['cauldron','lotusRoot'],[4,8]);const blossom=G.spawnToken(b,b.units[1],'lotusBlossom');
 Object.assign(blossom,G.xy(7),{slot:7});b.time=8;G.extras(b,b.units[0],.1);assert.equal(blossom.removed,false);
});
test('all seven Cultivation Apex forms accept Qi, pills and Blossoms',()=>{
 for(const id of ['swordImmortal','melodicSaint','formationMaster','talismanSovereign','landscapeSage','soulReapingDemon','bloodFiendMaster']){
  const b=battle([id,'cauldron','herbGrass'],[0,4,5]),u=b.units[0];
  u.qi=175;G.addQi(b,u,29);assert.equal(u.permanentAtkBonus,0);G.addQi(b,u,1);assert.equal(u.permanentAtkBonus,2);assert.equal(u.apexQi,0);
  b.time=8;G.extras(b,b.units[1],.1);assert.equal(u.apexQi,18);assert.equal(u.permanentAtkBonus,2);
  const blossom=G.spawnToken(b,b.units[1],'lotusBlossom');Object.assign(blossom,G.xy(1),{slot:1});
  G.extras(b,u,.1);assert.ok(blossom.removed);assert.equal(u.apexQi,3);assert.equal(u.permanentAtkBonus,4);
  assert.equal(b.run.roster[0].apexQi,3);
 }
});
test('ascension does not convert pre-ascension resources',()=>{
 const b=battle(['practitioner','investigator']);b.units[0].qi=190;b.units[1].dread=160;
 G.evolve(b,b.units[0],'swordImmortal');G.evolve(b,b.units[1],'ruleArchitect');
 G.addQi(b,b.units[0],1);G.addDread(b,b.units[1],1);
 assert.equal(b.units[0].apexQi,1);assert.equal(b.units[1].apexDread,1);assert.equal(b.metrics.growth,0);
});
test('partial and capped marks reward only marks actually applied',()=>{
 const b=battle(['investigator']),u=b.units[0],e=enemy(b);e.ruleMarks=4;
 G.addRuleMark(b,e,3,u);assert.equal(u.dread,1);assert.equal(b.metrics.violations,1);
 G.addRuleMark(b,e,1,u);assert.equal(u.dread,1);assert.equal(b.totalRuleMarks,1);
});
test('Rule Enforcer binds during combat and only once',()=>{
 const b=battle(['investigator','ruleboard'],[0,1]),u=b.units[0];u.dread=139;
 G.addRuleMark(b,enemy(b),1,u);G.extras(b,u,.1);assert.equal(u.id,'ruleArchitect');assert.ok(b.units[1].removed);
 G.extras(b,u,.1);assert.equal(b.metrics.consumed.length,1);
});
test('Authorities keep receiving Dossier and mark Dread after ascension',()=>{
 for(const id of ['ruleArchitect','allSeeingOverseer','curfewDirector','forensicDemiurge','backroomsWarden']){
  const b=battle([id,'coroner','decoder','securityCam'],[0,4,8,2]),u=b.units[0];
  G.addDread(b,u,20);
  let dossier=G.spawnToken(b,b.units[3],'dossier');Object.assign(dossier,G.xy(3),{slot:3});
  b.time=5;G.extras(b,b.units[1],.1);assert.equal(u.apexDread,0);assert.equal(u.permanentAtkBonus,2);
  dossier=G.spawnToken(b,b.units[3],'dossier');Object.assign(dossier,G.xy(7),{slot:7});
  b.time=6;G.extras(b,b.units[2],.1);assert.equal(u.apexDread,8);
  G.addRuleMark(b,enemy(b),1,b.units[3]);assert.equal(u.apexDread,9);
 }
});
test('Chain Letter ordinary hits do not award legend progress',()=>{
 const b=battle(['chainLetter','mannequin'],[0,8]);const e=enemy(b);
 G.attack(b,b.units[0]);G.attack(b,b.units[0]);assert.equal(b.units[1].violations,0);assert.ok(e.rumorInfected);
});
test('rumors reward one contact spread per source and infected deaths',()=>{
 const b=battle(['chainLetter','mannequin'],[0,8]);const e=enemy(b,4),next=enemy(b,4.2);
 e.rumorInfected=true;e.rumorOwner=b.units[0].uid;G.spreadRumor(b,e);
 assert.ok(next.rumorInfected);assert.equal(next.hp,99980);assert.equal(b.units[1].violations,1);
 enemy(b,4.1);G.spreadRumor(b,e);assert.equal(b.units[1].violations,1);
 G.damage(b,e,e.hp,b.units[0],'ability');assert.equal(b.units[1].violations,2);
});
test('Bus attacks do not warp; timed sweep requires two marks',()=>{
 const b=battle(['nightBus']),u=b.units[0],e=enemy(b,6);
 G.attack(b,u);assert.equal(e.p,6);assert.equal(e.ruleMarks,1);
 b.time=8;G.extras(b,u,.1);assert.equal(e.p,6);
 G.attack(b,u);assert.equal(e.p,6);b.time=16;G.extras(b,u,.1);assert.equal(e.p,3);
 const v=u.violations;G.extras(b,u,.1);assert.equal(e.p,3);assert.equal(u.violations,v);
});
test('Matriarch covers all five original and token species without stacking',()=>{
 for(const id of ['serpentFodder','hound','scuttler','flameToad','peachFodder']){
  const b=battle([id,'matriarch','matriarch']),u=b.units[0];
  assert.equal(G.speed(b,u),1.4);const tok=G.spawnToken(b,u,id);assert.equal(G.speed(b,tok),1.4);
  const e=enemy(b);G.dot(b,e,'bleed',3,4,u);assert.equal(e.bleeds[0].until,5);
 }
});
test('Bloodline opening meals, breeding requirements and thresholds remain unchanged',()=>{
 const b=battle(['cub','hound','hound'],[0,1,2]);G.startAbilities(b);
 assert.ok(b.units[1].removed);assert.equal(b.units[0].lineageStacks,1);
 b.time=1;G.breed(b,b.units[2]);assert.equal(b.metrics.breedingChecks,undefined);
 for(let i=2;i<=6;i++){
  const prey=G.spawnToken(b,b.units[2],'hound');Object.assign(prey,G.xy(1),{slot:1});G.devour(b,b.units[0]);
  assert.equal(b.units[0].lineageStacks,i);
  assert.equal(b.units[0].id,i<2?'cub':i<4?'tigerCubT1':i<6?'tigerCubT2':'tigerCubT3');
 }
});
test('removed cards and offspring are absent from every catalog',()=>{
 for(const id of ['heir','progenitor','familiar','imp'])assert.equal(D.CARD[id],undefined);
 for(const c of Object.values(D.CARD))assert.ok(!/Blood Heir|Scarlet Familiar|Bloodline Progenitor/.test(JSON.stringify(c)),c.id);
});
test('only saves containing removed cards reset, account upgrades survive',()=>{
 const code=fs.readFileSync(require.resolve('../app'),'utf8').split('let feedbackSeen=')[0];
 for(const payload of [ {version:3,roster:[{id:'heir'}]}, {version:3,roster:[{id:'cub'}],offers:['familiar']}, {version:3,roster:[{id:'cub'}],recap:{cards:[{id:'progenitor'}]}}, {version:3,roster:[{id:'cub'}]} ]){
  const values=new Map([['confluence-run-v3',JSON.stringify(payload)],['confluence-meta-v1',JSON.stringify({power:7,shards:50})]]);
  const ctx={Game:G,document:{querySelector:()=>({})},localStorage:{getItem:k=>values.get(k),removeItem:k=>values.delete(k)}};
  vm.createContext(ctx);vm.runInContext(code+';globalThis.result={run,meta,resetRemovedRun};',ctx);
  assert.equal(ctx.result.meta.power,7);assert.equal(ctx.result.meta.shards,50);
  const reset=JSON.stringify(payload).match(/heir|familiar|progenitor/)!==null;
  assert.equal(ctx.result.resetRemovedRun,reset);assert.equal(ctx.result.run===null,reset);assert.equal(values.has('confluence-run-v3'),!reset);
 }
});
test('new resource remainders persist across deployments, temporary pill haste does not',()=>{
 const b=battle(['swordImmortal','ruleArchitect']);
 G.addQi(b,b.units[0],17);G.addDread(b,b.units[1],19);b.units[0].pillSpeedUntil=100;G.persist(b,b.units[0]);
 const fresh=G.runtime(b,b.run.roster[0],0),authority=G.runtime(b,b.run.roster[1],1);
 assert.equal(fresh.apexQi,17);assert.equal(authority.apexDread,19);assert.equal(fresh.pillSpeedUntil,0);
 const oldSword=G.runtime(b,{...b.run.roster[0],apexQi:undefined,swordQi:15},0);assert.equal(oldSword.apexQi,15);
});
test('WebP maps cover every current Cultivation and Bloodline draft card and Apex',()=>{
 const source=fs.readFileSync(require.resolve('../app'),'utf8');
 const definitions=source.slice(source.indexOf('const cultivationRealmSprites='),source.indexOf('function art('));
 const ctx={};vm.createContext(ctx);vm.runInContext(definitions+';globalThis.maps={...cultivationRealmSprites,...bloodlineSprites};',ctx);
 for(const c of [...D.CARDS.filter(c=>!c.retired),...D.FORMS.filter(c=>G.isApexImmortal(c))].filter(c=>['Cultivation','Bloodline'].includes(c.genre)))assert.match(ctx.maps[c.id]||'',/-sprites-webp\/.*\.webp(?:\?.*)?$/);
 assert.ok(!source.includes('assets/bloodline-sprites/'));assert.ok(!source.includes('assets/cultivation-sprites/'));
});

test('The 13th Step and Red Raincoat are purely reactive and evolve to Mythic Apexes', () => {
 const b = battle(['stair13', 'redRaincoat']);
 const e = enemy(b, 2);
 assert.equal(G.attack(b, b.units[0]), false, 'stair13 should not attack normally');
 assert.equal(G.attack(b, b.units[1]), false, 'redRaincoat should not attack normally');

 b.units[0].violations = 15;
 G.grantUrbanViolation(b, b.units[0], 0);
 assert.equal(b.units[0].id, 'infiniteStair');

 b.units[0].violations = 45;
 G.grantUrbanViolation(b, b.units[0], 0);
 assert.equal(b.units[0].id, 'penroseLabyrinth');

 b.units[1].violations = 15;
 G.grantUrbanViolation(b, b.units[1], 0);
 assert.equal(b.units[1].id, 'bloodPhantasm');

 b.units[1].violations = 45;
 G.grantUrbanViolation(b, b.units[1], 0);
 assert.equal(b.units[1].id, 'crimsonHarbinger');
});

test('Blackout has 6s duration with an 8s lockout grace period and 1.5s runner guardrail', () => {
 const b = battle(['kuchisake']);
 b.time = 0;
 G.grantUrbanViolation(b, b.units[0], 5);
 assert.equal(b.curfewUntil, 6.0, 'Blackout duration should be 6s');
 assert.equal(b.blackoutLockoutUntil, 14.0, 'Lockout should be 6s + 8s = 14s');

 // During blackout, another 5 violations should not retrigger
 G.grantUrbanViolation(b, b.units[0], 5);
 assert.equal(b.curfewUntil, 6.0);

 // During 8s lockout grace period, should not retrigger
 b.time = 7;
 G.grantUrbanViolation(b, b.units[0], 5);
 assert.equal(b.curfewUntil, 6.0);

 // After lockout expires (t=15), triggers again
 b.time = 15;
 G.grantUrbanViolation(b, b.units[0], 5);
 assert.equal(b.curfewUntil, 21.0);

 // Guardrail: 1.5s per runner reaction limit during blackout
 const e = enemy(b, 2);
 b.curfewUntil = 30; b.time = 22;
 assert.equal(G.attack(b, b.units[0]), true, 'First reaction allowed');
 assert.equal(G.attack(b, b.units[0]), false, 'Immediate reaction throttled by 1.5s guardrail');
 b.time = 23.6;
 assert.equal(G.attack(b, b.units[0]), true, 'Allowed after 1.5s');
});

test('Architecture A rule mark application does not trigger Architecture B Blackout', () => {
 const b = battle(['investigator']);
 const e = enemy(b, 2);
 for (let i = 0; i < 10; i++) {
  G.addRuleMark(b, e, 1, b.units[0]);
 }
 assert.equal(b.curfewUntil, undefined, 'Blackout should not trigger from Architecture A marks alone');
});

test('The 13th Step triggers Blackout from 5 taboo corner/step violations', () => {
 const b = battle(['stair13']);
 const e = enemy(b, 0, 100000);
 e.ruleMarks = 5; // Capped marks should not block taboo violation counting

 for (let i = 0; i < 5; i++) {
  e.p = 3.98;
  e.slows = [];
  e.retreatingUntil = 0;
  G.step(b, 0.1);
 }
 assert.ok(b.curfewUntil > b.time, 'Blackout triggered by 13th Step corner crossings');
 assert.equal(b.blackoutLockoutUntil, b.curfewUntil + 8.0, 'Lockout is active for 8s after Blackout');
});

test('Red Raincoat Specter triggers Blackout from 5 taboo look-back/retreat violations', () => {
 const b = battle(['redRaincoat']);
 const e = enemy(b, 5, 100000);
 e.ruleMarks = 5; // Capped marks should not block taboo violation counting

 for (let i = 0; i < 5; i++) {
  e.p = 5;
  e.retreatingUntil = b.time + 1.0;
  G.step(b, 0.1);
 }
 assert.ok(b.curfewUntil > b.time, 'Blackout triggered by Red Raincoat retreat/look-back violations');
 assert.equal(b.blackoutLockoutUntil, b.curfewUntil + 8.0, 'Lockout is active for 8s after Blackout');
});
