'use strict';const G=require('../engine');const results=[];
for(const [arm,oses] of Object.entries(G.CYBER_MATRIX))for(const [os,apex] of Object.entries(oses))for(let seed=1;seed<=6;seed++){
 const r=G.newRun('nyx', seed*7919);r.roster=[G.instance(r,'cyberSolo')];let first120=null,firstApex=null;const rows=[];
 for(let d=0;d<16;d++){
  const add={1:arm,2:os,3:'vent',4:'accessPoint',5:'cryoPump',6:'biomonitor',7:'cyberReactor'}[d];if(add)r.roster.push(G.instance(r,add));
  r.depth=d;r.node={row:d,lane:1,type:d===15?'boss':[5,9,13].includes(d)?'elite':'battle'};r.phase='ready';const b=G.deploy(r);for(let n=0;n<6000&&!b.done;n++)G.step(b,.1);
  const u=r.roster.find(G.isCyber);if((u?.chrome||0)>=120&&first120==null)first120=d+1;if(u&&G.cyberApex(u)&&firstApex==null)firstApex=d+1;
  rows.push({stage:d+1,won:b.won,health:r.health,chrome:u?.chrome||0,form:u?.id,arm:u?.arm,os:u?.os,attacks:b.metrics.cards?.[u?.uid]?.attacks||0});if(!b.won)break;
 }
 results.push({apex,seed,first120,firstApex,won:r.depth===15&&rows.at(-1).won,rows});
}
console.log(JSON.stringify({method:'54 controlled one-Operative campaigns; startSolo, guarantee Arm2, OS3, Vent4, Access5, Pump6, Biomonitor7, Reactor8. Nyx, random deployment, no meta or workshop upgrades, elite6/10/14 and boss16. These are not random-draft win rates.',results},null,2));
