'use strict';const G=require('../engine');
const pairs={magma:['pyroMage','geoMage'],tempest:['pyroMage','aeroMage'],steam:['pyroMage','hydroMage'],swamp:['hydroMage','geoMage'],blizzard:['hydroMage','aeroMage'],sand:['geoMage','aeroMage']};
const results=[];
for(const [name,mages] of Object.entries(pairs))for(let seed=1;seed<=8;seed++){
 const r=G.newRun('lyra', seed*7919);r.roster=['elementalApprentice',mages[0]].map(id=>G.instance(r,id));let first30=null,apex=null;const rows=[];
 for(let d=0;d<16;d++){
  const id={1:mages[1],3:'elementalPrism',4:'manaBattery',5:'astralLoom'}[d];if(id)r.roster.push(G.instance(r,id));
  r.depth=d;r.node={row:d,lane:1,type:d===15?'boss':[5,9,13].includes(d)?'elite':'battle'};r.phase='ready';const b=G.deploy(r);
  for(let n=0;n<6000&&!b.done;n++)G.step(b,.1);
  const u=r.roster.find(G.isApprentice),p=Math.max(0,...Object.values(u?.synthesis||{}));if(p>=30&&first30==null)first30=d+1;if(u&&G.isArchon(u)&&apex==null)apex=d+1;
  rows.push({stage:d+1,won:b.won,health:r.health,points:p,form:u?.id,triggers:b.metrics.triggers,reactions:b.metrics.elementalReactions||0});if(!b.won)break;
 }
 results.push({name,seed,first30,apex,won:r.depth===15&&rows.at(-1).won,rows});
}
console.log(JSON.stringify({method:'48 controlled campaigns; start Apprentice + first mage, second mage crossing2, Prism4, Battery5, Loom6. Random placement, no meta or upgrades, elite6/10/14 and boss16. Not random draft win rates.',results},null,2));
