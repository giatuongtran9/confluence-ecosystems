'use strict';
// Dark Fantasy redesign: Alpha Quarry rule, Trophy Rack, % HP bleed stacks, Taxidermist/Stake supports, Eclipse Rite, 5 Mythics.
const test=require('node:test'),assert=require('node:assert/strict'),G=require('../engine'),D=require('../data');
function battle(ids,slots=ids.map((_,i)=>i),seed={}){
 const r=G.newRun('none', 17);r.roster=ids.map(id=>Object.assign(G.instance(r,id),seed[id]||{}));r.depth=9;r.node={row:9,lane:1,type:'battle'};r.phase='combat';
 const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:3,interval:2,hp:100,speed:.3},spawned:0,enemyUid:0};b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u);u.currentCooldown=999});return b;
}
function enemy(b,kind='',p=1,hp=10000){const e={uid:++b.enemyUid,p,hp,maxHp:hp,speed:.3,defense:0,boss:kind==='boss',champion:kind==='champion',elite:kind==='elite',alphaQuarry:kind==='alpha',armored:kind==='armored',gone:false,bornAt:0,slows:[],bleeds:[],burns:[],venoms:[],stuns:[],auras:[]};b.enemies.push(e);return e;}

test('the ladder and Mythics sit at the approved stats; relics and head tokens are gone',()=>{
 for(const [id,rar,atk,iv] of [['mercenary','Normal',12,1.5],['oathboundHunter','Rare',24,1.4],['blackIronSlayer','Epic',48,1.3],['brandedBerserker','Legendary',88,1.2],['dragonSlayer','Mythic',160,1.4],['witcherGrandmaster','Mythic',150,1.1],['bloodDrunkHunter','Mythic',145,1.0],['lycanLord','Mythic',150,1.0],['gallowsHeadsman','Mythic',160,1.4]]){assert.equal(D.CARD[id].rarity,rar,id);assert.equal(D.CARD[id].baseAtk,atk,id);assert.equal(D.CARD[id].attackInterval,iv,id);}
 for(const id of ['beastRelic','fiendRelic','witchRelic','beastSkull','fiendHorn','witchEye'])assert.equal(D.CARD[id],undefined,id);
 assert.equal(D.CARD.taxidermist.attackInterval,0);assert.equal(D.CARD.totem.attackInterval,0);
});

test('Alpha Quarry is a genre rule: any hunter marks the healthiest ordinary runner after 3 spawns',()=>{
 const b=battle(['mercenary']);G.spawn(b);G.spawn(b);assert.ok(!b.alphaMarked);b.enemies[0].hp=15;G.spawn(b);
 assert.equal(b.enemies.filter(e=>e.alphaQuarry).length,1);
});

test('Sellsword hits inflict 1 Bleed stack = 1% max HP over 1s; more stacks extend the bleed; Bosses take half',()=>{
 const b=battle(['mercenary']),u=b.units[0],e=enemy(b,'',1,100000),boss=enemy(b,'boss',0,100000);
 G.attack(b,u);assert.equal(e.huntBleed,1);
 G.bleedStacks(b,e,2,u);const hp0=e.hp;G.tickHunt(b,3);
 assert.ok(Math.abs(hp0-e.hp-3000)<1e-6);assert.equal(e.huntBleed,0);
 G.bleedStacks(b,boss,1,u);const bhp=boss.hp;G.tickHunt(b,1);assert.ok(Math.abs(bhp-boss.hp-500)<1e-6);
});

test('Blood Totem is an adjacency aura: only adjacent allies inflict a Bleed stack',()=>{
 const b=battle(['leech','totem','leech'],[0,1,8]),[near,,far]=b.units;const e=enemy(b,'',1,100000);
 G.attack(b,near);assert.equal(e.huntBleed,1);G.attack(b,far);assert.equal(e.huntBleed,1);
});

test('kills fill the Trophy Rack by type: Quarry=Beast, Elite=Fiend, armored=Witch, Boss=Wyrm, execution=Hollow',()=>{
 const b=battle(['mercenary']);
 for(const kind of ['alpha','elite','armored','boss'])G.harvestTrophy(b,enemy(b,kind));
 const x=enemy(b);x.huntExecuted=true;G.harvestTrophy(b,x);
 assert.deepEqual(G.rack(b.run).map(t=>t.type),['beast','fiend','witch','wyrm','hollow']);
});

test('the Rack holds at most 8 trophies and persists on the run',()=>{
 const b=battle(['mercenary']);for(let i=0;i<10;i++)G.harvestTrophy(b,enemy(b,'elite'));
 assert.equal(G.rack(b.run).length,8);assert.equal(b.metrics.trophiesLost,2);
});

test('Taxidermist is a support that carves the newest uncarved trophy anywhere without consuming it',()=>{
 const b=battle(['taxidermist','mercenary'],[0,8]),[tax,hunter]=b.units;
 G.rack(b.run).push({type:'witch',carved:false});b.time=6;G.huntExtras(b,tax);
 assert.equal(G.rack(b.run).length,1);assert.equal(G.rack(b.run)[0].carved,true);
 assert.equal(b.run.huntEye,true);assert.equal(hunter.trophyPoints,10);
});

test('Trophy Stake projects the newest trophy to every hunter, doubled beside the Stake',()=>{
 const b=battle(['mercenary','trophyStake','mercenary'],[0,1,8]),[near,,far]=b.units;G.rack(b.run).push({type:'beast',carved:false});
 assert.ok(G.speed(b,near)>G.speed(b,far));assert.ok(G.speed(b,far)>1);
});

test('the ladder evolves at 25 / 60 / 100 Trophy Points',()=>{
 const b=battle(['mercenary']),u=b.units[0];
 G.trophyPoints(b,25);assert.equal(u.id,'oathboundHunter');G.trophyPoints(b,35);assert.equal(u.id,'blackIronSlayer');G.trophyPoints(b,40);assert.equal(u.id,'brandedBerserker');
});

test('Eclipse Rite: a 100-point Branded Berserker at a Campfire consumes 3 matching trophies and one random non-core card',()=>{
 const r=G.newRun('none',5);r.roster=['brandedBerserker','mercenary','leech','investigator'].map(id=>G.instance(r,id));r.roster[0].trophyPoints=100;r.node={type:'rest'};
 r.trophyRack=[{type:'fiend'},{type:'beast'},{type:'fiend'},{type:'fiend'},{type:'fiend'}];
 const res=G.performRite(r);
 assert.equal(res.apexId,'bloodDrunkHunter');assert.equal(r.roster[0].id,'bloodDrunkHunter');
 assert.deepEqual(r.trophyRack.map(t=>t.type),['beast','fiend']);
 assert.ok(['leech','investigator'].includes(res.sacrificed));assert.equal(r.roster.length,3);
 assert.ok(r.roster.some(u=>u.id==='mercenary'),'the core line is never sacrificed');
});

test('Wyrm needs only 2; no Rite off a Campfire, below 100 points, or with nothing to sacrifice',()=>{
 const make=(node,pts,ids=['brandedBerserker','leech'])=>{const r=G.newRun('none',5);r.roster=ids.map(id=>G.instance(r,id));r.roster[0].trophyPoints=pts;r.node={type:node};r.trophyRack=[{type:'wyrm'},{type:'wyrm'}];return r;};
 assert.equal(G.performRite(make('rest',100)).apexId,'dragonSlayer');
 assert.equal(G.riteCandidate(make('battle',100)),null);
 assert.equal(G.riteCandidate(make('rest',99)),null);
 assert.equal(G.riteCandidate(make('rest',100,['brandedBerserker','mercenary'])),null);
});

test('Executioner deals 3× below 30% HP and its kills there count as executions',()=>{
 const b=battle(['executioner']),u=b.units[0],e=enemy(b,'',1,10000);e.hp=2500;
 G.attack(b,u);assert.equal(e.huntExecuted,true);
});

test('Dark Fantasy Mythics channel 1.2s on every 10th attack',()=>{
 for(const id of G.HUNT_APEX){const b=battle([id]),u=b.units[0];enemy(b,'',1,1e6);u.attackCount=9;G.attack(b,u);assert.equal(u.channeling?.type,'hunt-'+id,id);}
});

test('Mass Hanging executes ordinary runners below 40%; Wild Hunt Howl summons wolves that bite bleeding runners',()=>{
 const b=battle(['gallowsHeadsman']),u=b.units[0],low=enemy(b,'',1,1000),boss=enemy(b,'boss',2,10000);low.hp=350;
 G.resolveHuntUlt(b,u,'gallowsHeadsman',100);assert.ok(low.hp<=0);assert.ok(Math.abs(boss.hp-8800)<1e-6);
 const w=battle(['lycanLord']),l=w.units[0],prey=enemy(w,'',1,1e6);G.bleedStacks(w,prey,5,l);
 G.resolveHuntUlt(w,l,'lycanLord',100);const hp0=prey.hp;G.tickHunt(w,0);assert.ok(prey.hp<hp0);
});

test('saves holding removed hunt relics or heads are refunded',()=>{
 const r=G.newRun('none',3);r.roster=[{uid:1,id:'beastRelic'},{uid:2,id:'witchEye'},G.instance(r,'mercenary')];r.coins=0;
 assert.equal(G.migrateRun(r),2);assert.equal(r.coins,20);
});
