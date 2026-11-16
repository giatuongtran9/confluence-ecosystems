'use strict';
// Cyberpunk redesign: Heat bands, install-anywhere chrome, Netrunner, crew cards, Redline Proof, 6 Mythic 10th abilities.
const test=require('node:test'),assert=require('node:assert/strict'),G=require('../engine'),D=require('../data');
function battle(ids,slots=ids.map((_,i)=>i),type='battle',seed={}){
 const r=G.newRun('none',17);r.roster=ids.map(id=>Object.assign(G.instance(r,id),seed[id]||{}));r.depth=9;r.node={row:9,lane:1,type};r.phase='combat';
 const b={run:r,time:0,units:[],enemies:[],effects:[],metrics:{kills:0,leaks:0,growth:0,triggers:0,devours:0},plan:{count:3,interval:2,hp:100,speed:.3},spawned:3,enemyUid:0};b.units=r.roster.map((u,i)=>G.runtime(b,u,slots[i]));b.units.forEach(u=>{G.prepareHooks(b,u);G.record(b,u);u.currentCooldown=999});return b;
}
function enemy(b,kind='',p=1,hp=100000){const e={uid:++b.enemyUid,p,hp,maxHp:hp,speed:.3,defense:0,boss:kind==='boss',champion:kind==='champion',elite:kind==='elite',gone:false,bornAt:0,frozenUntil:0,slows:[],bleeds:[],burns:[],venoms:[],stuns:[],auras:[]};b.enemies.push(e);return e;}
const ready={chrome:120,arm:'mantisImplant',os:'sandyOS'};

test('six Mythics (3 Arms × 2 OS); the Cyberdeck line and Reactor are gone; new crew at approved stats',()=>{
 assert.equal(G.CYBER_APEX.length,6);
 for(const id of ['cyberdeckOS','accessPoint','cyberReactor','glitchAssassin','empBreaker','networkReaper'])assert.equal(D.CARD[id],undefined,id);
 for(const [id,atk,iv] of [['cyberSolo',12,1.4],['streetSamurai',12,1.4],['netrunner',14,1.4],['roninMerc',46,1.2],['afterlifeLegend',88,1.2],['chronoPhantom',130,1.2],['thermalRipper',140,1.3],['gravitonColossus',160,1.4],['juggernautSmasher',165,1.5],['razorPhantom',120,1.0],['plasmaTempest',135,1.2]]){assert.equal(D.CARD[id].baseAtk,atk,id);assert.equal(D.CARD[id].attackInterval,iv,id);}
});

test('Heat bands: Warm +15% damage, Redline +35% damage and +15% attack speed',()=>{
 const b=battle(['streetSamurai']),u=b.units[0];u.state='active';
 u.heat=20;assert.equal(G.heatDamage(u),1);assert.equal(G.heatSpeed(u),1);
 u.heat=60;assert.equal(G.heatBand(u),'warm');assert.equal(G.heatDamage(u),1.15);
 u.heat=85;assert.equal(G.heatBand(u),'redline');assert.equal(G.heatDamage(u),1.35);assert.equal(G.heatSpeed(u),1.15);
});

test('reaching 100°C shuts the unit down for 3s and resets heat to 40',()=>{
 const b=battle(['cyberSolo']),u=b.units[0];enemy(b);u.heat=95;G.attack(b,u);
 assert.equal(u.heat,40);assert.equal(u.state,'overheat');
});

test('implants install into any Operative; an adjacent one is preferred and gains +10% tuning',()=>{
 const far=battle(['cyberSolo','mantisImplant'],[0,8]);far.units.forEach(u=>G.cyberExtras(far,u,.1));
 assert.equal(far.units[0].arm,'mantisImplant');assert.equal(far.units[0].tuning||0,0);
 const near=battle(['cyberSolo','cyberSolo','sandyOS'],[0,8,7]);near.units.forEach(u=>G.cyberExtras(near,u,.1));
 assert.equal(near.units[1].os,'sandyOS');assert.equal(near.units[1].tuning,.1);assert.equal(near.units[0].os,null);
});

test('every 4 Operative attacks earn 1 Chrome',()=>{
 const b=battle(['cyberSolo']),u=b.units[0];enemy(b);for(let i=0;i<4;i++){u.heat=20;G.attack(b,u);}
 assert.equal(u.chrome,1);
});

test('Redline Proof: 12s at 80–99°C on an Elite node awakens the Arm × OS Mythic when the battle is won',()=>{
 const b=battle(['eliteSolo'],[4],'elite',{eliteSolo:ready}),u=b.units[0];u.state='active';
 for(let i=0;i<25;i++){u.heat=85;b.time+=.5;G.tickCyber(b,.5);}
 assert.equal(b.cyberTrial.status,'proven');
 G.finish(b,true);
 assert.equal(b.run.roster[0].id,'chronoPhantom');
});

test('overheating costs 4s of Redline proof; a failed proof costs nothing',()=>{
 const b=battle(['eliteSolo'],[4],'boss',{eliteSolo:ready}),u=b.units[0];u.state='active';enemy(b);
 for(let i=0;i<10;i++){u.heat=85;b.time+=.5;G.tickCyber(b,.5);}
 assert.equal(b.cyberTrial.redline,5);
 u.heat=99;u.currentCooldown=0;G.attack(b,u);
 assert.equal(b.cyberTrial.redline,1);assert.equal(b.cyberTrial.resets,1);
 G.finish(b,true);
 assert.equal(b.run.roster[0].id,'eliteSolo');
});

test('no Redline Proof on an ordinary battle node or without both sockets',()=>{
 const a=battle(['eliteSolo'],[4],'battle',{eliteSolo:ready});G.tickCyber(a,.1);assert.equal(a.cyberTrial,undefined);
 const c=battle(['eliteSolo'],[4],'elite',{eliteSolo:{chrome:120,arm:'mantisImplant'}});G.tickCyber(c,.1);assert.equal(c.cyberTrial,undefined);
});

test('Netrunner banks RAM from any Cyberpunk attack and spends 3 every 2s on a stunning Short Circuit',()=>{
 const b=battle(['netrunner','streetSamurai']),[n,s]=b.units;n.state='active';const e=enemy(b);
 for(let i=0;i<3;i++){s.heat=20;G.attack(b,s);}
 assert.equal(n.ram,3);
 b.time=2;G.tickCyber(b,.1);
 assert.equal(n.ram,0);assert.ok(e.hp<100000);assert.ok(e.frozenUntil>b.time||e.stuns.some(x=>x.until>b.time));
});

test('Ronin Merc hits harder the hotter its hottest ally runs',()=>{
 const total=allyHeat=>{const b=battle(['roninMerc','streetSamurai']),[r,s]=b.units,e=enemy(b,'',1,1e9);for(let i=0;i<40;i++){r.heat=20;s.heat=allyHeat;G.attack(b,r);}return 1e9-e.hp;};
 const low=total(0),high=total(90);
 assert.ok(high>low*1.5,`${high} vs ${low}`); // +90% from a 90°C ally, averaged over crits
});

test('Afterlife Legend vents 20°C from an ally at 90°C+ every 5s and fires a 300% ATK shot',()=>{
 const b=battle(['afterlifeLegend','streetSamurai']),[a,s]=b.units;a.state='active';const e=enemy(b);s.heat=90;b.time=5;
 G.cyberExtras(b,a,0);
 assert.equal(s.heat,70);assert.ok(e.hp<100000);
});

test('Cyber Mythics channel 1.2s on every 10th attack',()=>{
 for(const id of G.CYBER_APEX){const b=battle([id]),u=b.units[0];enemy(b);u.attackCount=9;u.heat=20;G.attack(b,u);assert.equal(u.channeling?.type,'cyber-'+id,id);}
});

test('Time Stop freezes every runner; Plasma Storm puts a zone on all 4 walls',()=>{
 const t=battle(['chronoPhantom']),u=t.units[0];const es=[enemy(t,'',1),enemy(t,'',9)];G.resolveCyberUlt(t,u,'chronoPhantom',100);
 assert.ok(es.every(e=>e.frozenUntil>t.time||e.stuns.some(s=>s.until>t.time)||e.slows.some(s=>s.until>t.time)));
 const p=battle(['plasmaTempest']),v=p.units[0];enemy(p);G.resolveCyberUlt(p,v,'plasmaTempest',100);
 assert.deepEqual([...new Set(p.cyberZones.map(z=>z.wall))].sort(),[0,1,2,3]);
});

test('saves: cut Cyberdeck Mythics keep their arm as the Sandevistan Mythic; a Cyberdeck socket is freed',()=>{
 const r=G.newRun('none',3);r.roster=[{uid:1,id:'empBreaker',arm:'gorillaImplant',os:'cyberdeckOS'},{uid:2,id:'eliteSolo',arm:'mantisImplant',os:'cyberdeckOS',chrome:90},{uid:3,id:'accessPoint'}];r.coins=0;
 assert.equal(G.migrateRun(r),1);
 assert.equal(r.roster[0].id,'gravitonColossus');assert.equal(r.roster[0].os,'sandyOS');
 assert.equal(r.roster[1].os,undefined);assert.equal(r.coins,10);
});

test('all Cyber art paths exist and the UI shows sockets, heat bands, RAM and the Redline Proof',()=>{
 const fs=require('node:fs'),path=require('node:path');
 for(const c of Object.values(D.CARD).filter(c=>c.cyberAsset))assert.ok(fs.existsSync(path.join(__dirname,'../assets/cyber-matrix',c.cyberAsset+'.webp')),c.id);
 const s=require('./app-source')();
 for(const re of [/Chrome Tolerance/,/THERMAL SHUTDOWN/,/REDLINE · \+35% damage/,/Short Circuit costs 3/,/REDLINE PROOF/])assert.match(s,re);
});

test('Cyber detail renders permanent sockets outside battle without stale heat',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),s=require('./app-source')();
 const code=s.slice(s.indexOf('function cyberDetail('),s.indexOf('function huntTrialHUDHTML('));
 const ctx={Game:G,CARD:D.CARD,battle:null,u:{id:'cyberSolo',arm:'mantisImplant',os:'sandyOS',chrome:65,chromeAttackCharge:3,tuning:.1}};vm.createContext(ctx);vm.runInContext(code+';globalThis.html=cyberDetail(u);',ctx);
 assert.match(ctx.html,/Thermal Mantis Blades/);assert.match(ctx.html,/Sandevistan OS/);assert.match(ctx.html,/65 Chrome/);assert.match(ctx.html,/\+10% tuning/);assert.match(ctx.html,/Heat resets each battle/);
});

test('battle completion grants no Chrome bonus',()=>{const b=battle(['cyberSolo']);G.finish(b,true);assert.equal(b.run.roster[0].chrome,undefined);});
