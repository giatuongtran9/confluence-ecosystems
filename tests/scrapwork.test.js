'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),G=require('../engine'),D=require('../data');
function battle(ids,slots=ids.map((_,i)=>i)){
 const r=G.newRun('none',{},17);r.roster=ids.map(id=>G.instance(r,id));r.node={row:5,lane:1,type:'battle'};r.depth=5;r.phase='combat';
 const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:0,interval:1,hp:100},spawned:0};
 b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u)});return b;
}
function enemy(b,p=4,hp=10000){const e={uid:b.enemies.length+1,p,hp,maxHp:hp,speed:.336,defense:0,gone:false,slows:[],bleeds:[],burns:[],venoms:[],auras:[],ruleMarks:0};b.enemies.push(e);return e;}
function scrap(b,owner,id,slot){const u=G.spawnToken(b,owner,id,false,{origin:id,tokenAtk:0,attackInterval:0});assert.ok(u);Object.assign(u,G.xy(slot),{slot});return u;}
for(const [ids,module] of [[['rustSword','rustSword'],'blade'],[['rustGun','rustGun'],'flak'],[['rustSword','rustGun'],'gunblade']])test('forge recipe '+module,()=>{
 const b=battle(['scrapFrame','smelter'],[8,4]),[u,s]=b.units;ids.forEach((id,i)=>scrap(b,s,id,[1,3][i]));G.forge(b,s);assert.deepEqual(u.modules,[module]);assert.equal(u.alloy,3);assert.equal(b.units.filter(x=>!x.removed&&['rustSword','rustGun'].includes(x.id)).length,0);assert.deepEqual(b.run.roster[0].modules,[module]);
});
test('two locked modules; surplus gives only Alloy',()=>{const b=battle(['scrapFrame','smelter'],[8,4]),[u,s]=b.units;u.modules=['blade','flak'];for(const i of [1,3])scrap(b,s,'rustSword',i);G.forge(b,s);assert.deepEqual(u.modules,['blade','flak']);assert.equal(u.alloy,3);assert.equal(u.permanentAtkBonus,0);});
test('no deployed frame preserves scrap',()=>{const b=battle(['smelter'],[4]);for(const i of [1,3])scrap(b,b.units[0],'rustSword',i);G.forge(b,b.units[0]);assert.equal(b.units.filter(x=>!x.removed).length,3);});
test('Alloy stages and permanent overflow persist',()=>{const b=battle(['scrapFrame'],[4]),u=b.units[0];G.addAlloy(b,u,25);assert.equal(u.id,'reinforcedWalker');G.addAlloy(b,u,40);assert.equal(u.id,'heavyWalker');G.addAlloy(b,u,55);assert.equal(u.id,'titanFrame');assert.equal(G.occupiedSlots(u).length,2);G.addAlloy(b,u,30);assert.equal(u.permanentAtkBonus,4);assert.equal(b.run.roster[0].alloy,150);});
test('full board waits then reserves next deployment',()=>{const b=battle(['scrapFrame',...Array(8).fill('magneticCrane')]),u=b.units[0];G.addAlloy(b,u,120);assert.equal(u.extraSlot,undefined);assert.equal(u.titanUnlocked,true);b.run.phase='ready';const next=G.deploy(b.run);assert.equal(next.units.length,8);assert.equal(new Set(next.units.flatMap(G.occupiedSlots)).size,9);});
test('four Titans pack within existing grid over 100 seeds',()=>{for(let seed=1;seed<=100;seed++){const r=G.newRun('none',{},seed);r.roster=[...Array(4).fill('scrapFrame'),'magneticCrane'].map(id=>G.instance(r,id));r.roster.slice(0,4).forEach(u=>u.alloy=120);const {placements}=G.reserveDeployment(r),slots=[...placements.values()].flat();assert.equal(slots.length,9);assert.equal(new Set(slots).size,9);for(const cells of placements.values())if(cells.length===2){const [a,z]=cells.map(G.xy);assert.equal(Math.abs(a.x-z.x)+Math.abs(a.y-z.y),1);}}});
test('footprint adjacency counts owner once and protects reserved cell from tokens',()=>{const b=battle(['scrapFrame','magneticCrane'],[0,4]),u=b.units[0];u.extraSlot=1;assert.deepEqual(G.neighbors(b,b.units[1]),[u]);for(let i=0;i<10;i++)G.spawnToken(b,b.units[1],'rustGun');assert.equal(b.units.some(v=>v!==u&&!v.removed&&v.slot===1),false);assert.equal(b.units.filter(v=>!v.removed).length,8);});
for(const pair of [['blade','blade'],['flak','flak'],['blade','flak'],['gunblade','gunblade'],['blade','gunblade'],['flak','gunblade']])test('Reactor gate and path '+pair.join('+'),()=>{const b=battle(['scrapFrame','titanReactor'],[0,3]),u=b.units[0];u.modules=pair;G.addAlloy(b,u,120);assert.equal(u.id,'titanFrame');assert.equal(b.units[1].removed,false);b.run.depth=9;G.updateMech(b,u);assert.equal(u.id,G.mechPath(u));assert.equal(b.units[1].removed,true);assert.equal(b.run.roster.length,1);});
test('Reactor cannot bind without two weapons',()=>{const b=battle(['scrapFrame','titanReactor'],[0,3]);b.run.depth=9;G.addAlloy(b,b.units[0],120);assert.equal(b.units[0].id,'titanFrame');assert.equal(b.units[1].removed,false);});
test('armor shred is permanent and noncompounding',()=>{const e={hp:100,defense:.6};G.armorStrip(e,.25);assert.ok(Math.abs(e.defense-.45)<1e-10);G.armorStrip(e,.5);G.armorStrip(e,.25);assert.equal(e.defense,.3);});
test('Berserker cleave removes current HP, excludes bosses from execution',()=>{const b=battle(['berserkerColossus']),u=b.units[0],e=enemy(b,4,10000);e.boss=true;e.hp=2000;u.attackCount=3;G.mechAttack(b,u,e,100);assert.equal(e.hp,1615);});
test('both installed modules fire at reduced damage',()=>{const b=battle(['scrapFrame']),u=b.units[0],e=enemy(b);u.modules=['gunblade','gunblade'];u.attackCount=1;G.mechAttack(b,u,e,100);assert.equal(e.hp,9870);});
test('arc widths wrap and oil refresh does not multiply DPS',()=>{for(const width of [4,6,8]){const a=G.arcTiles(0,width);assert.equal(new Set(a).size,width);assert.ok(a.every(x=>x>=0&&x<16));}const b=battle(['scrapFrame']),u=b.units[0],e=enemy(b,0);G.oilPool(b,u,0,4,35);G.oilPool(b,u,0,4,35);assert.equal(b.oilPools.length,4);G.tickOil(b,1);assert.equal(e.hp,9965);b.time=4;G.tickOil(b,1);assert.equal(e.hp,9965);});
test('Crane moves scrap beside Smelter without entering Titan slot',()=>{const b=battle(['scrapFrame','smelter','magneticCrane'],[0,4,8]);b.units[0].extraSlot=1;const s=scrap(b,b.units[2],'rustSword',6);b.time=4;G.scrapworkExtras(b,b.units[2]);assert.notEqual(s.slot,1);assert.ok(G.touches(s,b.units[1]));});
test('retired draft cards stay out and Reactor begins at crossing five',()=>{const r=G.newRun('none',{},2);for(let depth=-1;depth<16;depth++){r.depth=depth;for(let i=0;i<100;i++){const ids=G.offers(r);assert.ok(ids.every(id=>!['cannon','bellows','behemoth'].includes(id)));if(depth<3)assert.ok(!ids.includes('titanReactor'));}}assert.equal(D.CARD.titanReactor.rarity,'Epic');});
test('global kills can salvage zero-attack scrap and full board cannot overflow',()=>{const b=battle(['junkScavenger'],[8]);for(let i=0;i<40;i++){const e=enemy(b,0,1);G.damage(b,e,2,b.units[0]);}const tokens=b.units.filter(x=>x.token);assert.ok(tokens.length>0);assert.ok(tokens.every(x=>x.attackInterval===0&&x.tokenAtk===0));assert.ok(b.units.filter(x=>!x.removed).length<=9);assert.equal(new Set(b.units.filter(x=>!x.removed).map(x=>x.slot)).size,b.units.filter(x=>!x.removed).length);});
test('alloy attack remainder and five-clear reward survive reload',()=>{const b=battle(['scrapFrame']),u=b.units[0],e=enemy(b);G.mechAttack(b,u,e,0);G.mechAttack(b,u,e,0);const restored=G.runtime(b,b.run.roster[0],0);assert.equal(restored.alloyAttacks,2);G.mechAttack(b,restored,e,0);assert.equal(restored.alloy,1);b.units=[restored];G.finish(b,true);assert.equal(b.run.roster[0].alloy,6);});
test('Riveter welds every six seconds and Reactor aura does not stack',()=>{const b=battle(['scrapFrame','hydraulicRiveter','titanReactor','titanReactor'],[4,1,3,5]),u=b.units[0];const base=G.atk(b,u);assert.equal(base,12);b.time=6;G.scrapworkExtras(b,b.units[1]);assert.equal(u.permanentAtkBonus,3);G.scrapworkExtras(b,b.units[1]);assert.equal(u.permanentAtkBonus,3);});
test('Titan HTML merges horizontal and vertical cells with working new art',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync(require.resolve('../app'),'utf8');
 const code=source.slice(source.indexOf('function fieldUnit('),source.indexOf('function board('));
 for(const [a,z,w,h] of [[3,4,200/3,100/3],[1,4,100/3,200/3]]){
 const b=battle(['scrapFrame'],[a]),u=b.units[0];G.addAlloy(b,u,120);u.extraSlot=z;
 const ctx={Game:G,CARD:D.CARD,GENRES:D.GENRES,battle:b,selected:null,art:c=>`<img src="assets/scrapwork/${c.scrapworkAsset}.svg">`,u};vm.createContext(ctx);vm.runInContext(code+';globalThis.html=fieldUnit(u);',ctx);
 assert.ok(ctx.html.includes(`--unit-width:${w}%`));assert.ok(ctx.html.includes(`--unit-height:${h}%`));assert.ok(ctx.html.includes('2 SLOTS'));assert.ok(fs.existsSync(require('node:path').join(__dirname,'../assets/scrapwork',D.CARD[u.id].scrapworkAsset+'.svg')));
 }
});
test('legacy Post-Apocalypse catalogs and mechanics are removed',()=>{
 const fs=require('node:fs');
 for(const id of ['cannon','bellows','behemoth','armamentPod']){
  assert.equal(D.CARD[id],undefined);
  assert.ok(!fs.readFileSync(require.resolve('../engine'),'utf8').includes("'"+id+"'"));
 }
 assert.equal(D.CARDS.filter(c=>c.genre==='PostApoc').length,6);
 assert.ok(!fs.existsSync(require('node:path').join(__dirname,'../assets/scrapwork/armamentPod.svg')));
 for(const c of Object.values(D.CARD))assert.ok(!/Scrap Autocannon|Thermal Bellows|Doomsday Behemoth|Secondary Armament Pod/.test(JSON.stringify(c)));
});
test('old Post-Apocalypse saves reset safely while clean Scrapwork saves survive',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),code=fs.readFileSync(require.resolve('../app'),'utf8').split('let feedbackSeen=')[0];
 for(const id of ['cannon','bellows','behemoth','armamentPod','scrapFrame']){
  const values=new Map([['confluence-run-v3',JSON.stringify({version:3,roster:[{id}]})],['confluence-meta-v1',JSON.stringify({power:7,shards:50})]]);
  const ctx={Game:G,document:{querySelector:()=>({})},localStorage:{getItem:k=>values.get(k),removeItem:k=>values.delete(k)}};vm.createContext(ctx);vm.runInContext(code+';globalThis.result={run,meta};',ctx);
  assert.equal(ctx.result.run===null,id!=='scrapFrame');assert.equal(ctx.result.meta.shards,50);
 }
});
test('new armor removal triggers surviving armor-break synergies without double shred',()=>{
 const b=battle(['scrapFrame']),u=b.units[0],e=enemy(b);e.defense=.6;G.armorStrip(e,.5);
 // Disable random critical hits by comparing the identical seeded battle.
 const other=battle(['scrapFrame']),f=enemy(other);f.defense=.3;
 G.hit(b,u,e,100);G.hit(other,other.units[0],f,100);assert.equal(e.hp,f.hp);
});
