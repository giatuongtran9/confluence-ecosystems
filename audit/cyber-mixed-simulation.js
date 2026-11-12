'use strict';const G=require('../engine');const results=[];
for(const os of ['sandyOS','berserkOS'])for(let seed=1;seed<=6;seed++){
 const r=G.newRun('nyx', seed*7919);r.roster=[G.instance(r,'cyberSolo')];const rows=[];
 for(let d=0;d<16;d++){
  const add={1:'gorillaImplant',2:os,3:'cyberSolo',4:'mantisImplant',5:os,6:'vent',7:'cyberReactor',8:'cryoPump',9:'cyberReactor',10:'biomonitor'}[d];if(add)r.roster.push(G.instance(r,add));
  r.depth=d;r.node={row:d,lane:1,type:d===15?'boss':[5,9,13].includes(d)?'elite':'battle'};r.phase='ready';const b=G.deploy(r);for(let n=0;n<6000&&!b.done;n++)G.step(b,.1);
  rows.push({stage:d+1,won:b.won,health:r.health,operatives:r.roster.filter(G.isCyber).map(u=>({id:u.id,chrome:u.chrome,arm:u.arm,os:u.os}))});if(!b.won)break;
 }
 results.push({os,seed,won:r.depth===15&&rows.at(-1).won,rows});
}
console.log(JSON.stringify({method:'12 controlled mixed-arm campaigns. Second Operative at4, Mantis5, second OS6, Vent7, Reactors8/10, Pump9 and Biomonitor11. Same fixed battle route as one-Operative tests. Module recipient follows actual oldest-adjacent rule, not forced assignment.',results},null,2));
