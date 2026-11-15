'use strict';
// Cosmic Horror redesign: Madness → Insane, Pages pool + Archivist, the Summoning, Herald of the Outer Dark, 6 Old Ones.
const test=require('node:test'),assert=require('node:assert/strict'),G=require('../engine'),D=require('../data');
function battle(ids,slots=ids.map((_,i)=>i),type='battle'){
 const r=G.newRun('naal', 17);r.roster=ids.map(id=>G.instance(r,id));r.depth=0;r.node={row:0,lane:1,type};r.phase='combat';
 const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:3,interval:2,hp:100,speed:.3},spawned:3,enemyUid:0};b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u);u.currentCooldown=999});return b;
}
function enemy(b,kind='',p=1,hp=100000){const e={uid:++b.enemyUid,p,hp,maxHp:hp,speed:.3,defense:0,boss:kind==='boss',champion:kind==='champion',elite:kind==='elite',gone:false,bornAt:0,frozenUntil:0,slows:[],bleeds:[],burns:[],venoms:[],stuns:[],auras:[]};b.enemies.push(e);return e;}

test('approved stats; Grimoires and page tokens are gone; Archivist and Eye are supports',()=>{
 for(const [id,atk,iv] of [['slumberingIdol',12,1.5],['blindAstrologer',12,1.5],['larva',12,1.4],['mass',24,1.4],['herald',85,1.2],['cthulhu',150,1.3],['yogSothoth',140,1.2],['shubNiggurath',135,1.1],['kingInYellow',140,1.2],['elderBrain',135,1.2],['azathoth',165,1.4]]){assert.equal(D.CARD[id].baseAtk,atk,id);assert.equal(D.CARD[id].attackInterval,iv,id);}
 for(const id of ['deepGrimoire','astralGrimoire','fleshGrimoire','yellowGrimoire','brainGrimoire','chaosGrimoire','abyssPage','astralPage','fleshPage'])assert.equal(D.CARD[id],undefined,id);
 assert.equal(D.CARD.archivist.attackInterval,0);assert.equal(D.CARD.eye.attackInterval,0);
});

test('Madness: +1 per Cosmic hit, +2 per ally slow; at 10 the runner goes Insane and walks backward for 3s',()=>{
 const b=battle(['larva']),u=b.units[0],e=enemy(b);
 G.attack(b,u);assert.equal(e.madness,3); // hit +1, its own slow +2
 G.addMadness(b,e,7);assert.ok(G.insane(b,e));assert.equal(e.madness,0);assert.ok(e.retreatingUntil>=b.time+3);
});

test('Insane runners drain neighbours within 1 tile for 2% of their own max HP per second',()=>{
 const b=battle(['larva']),mad=enemy(b,'',5,100000),near=enemy(b,'',5.5,50000),far=enemy(b,'',8,50000);
 G.goInsane(b,mad);G.tickCosmic(b,1);
 assert.ok(Math.abs(50000-near.hp-1000)<1e-6);assert.equal(far.hp,50000);assert.equal(mad.hp,100000);
});

test('Bosses never walk backward; at 10 Madness they take +20% damage for 3s',()=>{
 const b=battle(['larva']),boss=enemy(b,'boss');G.addMadness(b,boss,10);
 assert.ok(!G.insane(b,boss));assert.ok(boss.vulnerableUntil>b.time);assert.equal(boss.vulnerability,.2);
});

test('Blind Astrologer writes a random-script page into the pool (max 6) every fourth attack',()=>{
 const b=battle(['blindAstrologer']),u=b.units[0];enemy(b);
 for(let i=0;i<4;i++)G.attack(b,u);
 assert.equal(G.pages(b.run).length,1);assert.ok(G.SCRIPTS.includes(G.pages(b.run)[0]));
 for(let i=0;i<10;i++)G.writePage(b,u);assert.equal(G.pages(b.run).length,6);
});

test('Archivist deciphers the oldest page: the Idol learns the script and gains Syllables (+50% beside it)',()=>{
 const b=battle(['archivist','slumberingIdol'],[0,1]),[arc,idol]=b.units;enemy(b);b.run.forbiddenPages=['astral','flesh'];
 b.time=5;G.cosmicExtras(b,arc);
 assert.deepEqual(idol.scripts,['astral']);assert.equal(idol.syllables,18);assert.deepEqual(G.pages(b.run),['flesh']);
});

test('the Summoning: a 154-Syllable Herald on an Elite node needs 16 Insane runners (a Boss counts 3); the Old One manifests at battle end',()=>{
 const b=battle(['slumberingIdol'],[4],'elite'),u=b.units[0];Object.assign(u,{scripts:['abyss','abyss'],syllables:154});G.updateIdol(b,u);
 assert.equal(u.id,'rlyehHerald');assert.equal(b.cosmicTrial.status,'active');
 G.goInsane(b,enemy(b,'boss'));for(let i=0;i<12;i++)G.goInsane(b,enemy(b));assert.equal(b.cosmicTrial.status,'active');G.goInsane(b,enemy(b));
 assert.equal(b.cosmicTrial.status,'proven');
 G.finish(b,true);assert.equal(b.run.roster[0].id,'cthulhu');
});

test('no Summoning on an ordinary node, and a failed Summoning costs nothing',()=>{
 const a=battle(['slumberingIdol']),u=a.units[0];Object.assign(u,{scripts:['flesh','flesh'],syllables:200});G.updateIdol(a,u);assert.equal(a.cosmicTrial,undefined);
 const b=battle(['slumberingIdol'],[4],'boss'),v=b.units[0];Object.assign(v,{scripts:['flesh','flesh'],syllables:200});G.updateIdol(b,v);
 G.goInsane(b,enemy(b));G.finish(b,true);
 assert.equal(b.cosmicTrial.status,'failed');assert.equal(b.run.roster[0].id,'broodHerald');
});

test('Herald of the Outer Dark charges per Insane runner and every 8s bursts 50% ATK × charges, warping late runners back 2',()=>{
 const b=battle(['herald']),h=b.units[0],late=enemy(b,'',13),early=enemy(b,'',3);
 G.goInsane(b,enemy(b,'',6));G.goInsane(b,enemy(b,'',7));assert.equal(h.madnessCharges,2);
 b.time=8;G.cosmicExtras(b,h);
 assert.ok(100000-early.hp>=G.atk(b,h)-1e-6);assert.ok(late.p<=11+1e-6);assert.equal(h.madnessCharges,0);
});

test('Yog-Sothoth: the first Tile 8 crossing warps back 2 and deals 100% ATK; its 10th warps every non-Boss back 3',()=>{
 const b=battle(['yogSothoth']),u=b.units[0],e=enemy(b,'',8.2);G.cosmicCrossing(b,e,7.9);
 assert.ok(Math.abs(e.p-6.2)<1e-6);assert.ok(e.hp<100000);
 const c=battle(['yogSothoth']),y=c.units[0],r=enemy(c,'',10),boss=enemy(c,'boss',10);G.resolveCosmicUlt(c,y,'yogSothoth',100);
 assert.ok(Math.abs(r.p-7)<1e-6);assert.equal(boss.p,10);
});

test('Eye of the Void warps the 2 leading runners back 2',()=>{
 const b=battle(['eye']),u=b.units[0],e=enemy(b,'',10);u.threshold.current=u.threshold.max;G.tick(b,u,0);
 assert.ok(Math.abs(e.p-8)<1e-6,String(e.p));
});

test('Cosmic Mythics channel 1.2s on every 10th attack',()=>{
 for(const id of Object.keys(G.COSMIC_ULTS)){const b=battle([id]),u=b.units[0];enemy(b);u.attackCount=9;G.attack(b,u);assert.equal(u.channeling?.type,'cosmic-'+id,id);}
});

test('Mind Hijack drives the 2 healthiest non-Boss runners Insane; The Yellow Sign detonates every brand',()=>{
 const b=battle(['elderBrain']),u=b.units[0],big=enemy(b,'',2,9e4),mid=enemy(b,'',3,8e4),small=enemy(b,'',4,1e3);
 G.resolveCosmicUlt(b,u,'elderBrain',100);assert.ok(G.insane(b,big)&&G.insane(b,mid)&&!G.insane(b,small));
 const k=battle(['kingInYellow']),h=k.units[0],e=enemy(k);e.yellowBrand=h.uid;G.resolveCosmicUlt(k,h,'kingInYellow',100);assert.ok(e.hp<=100000-180+1e-6);
});

test('saves holding removed Grimoires or pages are refunded',()=>{
 const r=G.newRun('none',3);r.roster=[{uid:1,id:'deepGrimoire'},{uid:2,id:'fleshPage'},G.instance(r,'larva')];r.coins=0;
 assert.equal(G.migrateRun(r),2);assert.equal(r.coins,20);
});
