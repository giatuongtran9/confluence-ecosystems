'use strict';const G=require('../engine');const results=[];
for(const withHerald of [false,true])for(let seed=1;seed<=18;seed++){
 const r=G.newRun('naal',{},seed*7919);r.roster=[G.instance(r,'slumberingIdol')];let firstRare=null,firstEpic=null,firstApex=null;const rows=[];
 for(let d=0;d<16;d++){
  const add={1:'larva',2:'blindAstrologer',3:'archivist',4:'mass',5:'eye',...(withHerald?{9:'herald'}:{})}[d];if(add)r.roster.push(G.instance(r,add));
  r.depth=d;r.node={row:d,lane:1,type:d===15?'boss':[5,9,13].includes(d)?'elite':'battle'};r.phase='ready';const b=G.deploy(r);for(let n=0;n<6000&&!b.done;n++)G.step(b,.1);
  const u=r.roster.find(G.isIdol);if((u?.syllables||0)>=25&&u?.scripts?.length&&firstRare==null)firstRare=d+1;if((u?.syllables||0)>=65&&u?.scripts?.length===2&&firstEpic==null)firstEpic=d+1;if(u&&G.cosmicApex(u)&&firstApex==null)firstApex=d+1;
  rows.push({stage:d+1,won:b.won,health:r.health,syllables:u?.syllables||0,form:u?.id,scripts:u?.scripts||[],pages:b.metrics.pagesDropped||0,lostPages:b.metrics.pagesLost||0,grimoires:b.metrics.grimoiresForged||0,roster:r.roster.length,seconds:b.time});if(!b.won)break;
 }
 results.push({withHerald,seed,firstRare,firstEpic,firstApex,apex:r.roster.find(G.isIdol)?.id,won:r.depth===15&&rows.at(-1).won,rows});
}
console.log(JSON.stringify({method:'36 controlled campaigns: guaranteed Larva2, Astrologer3, Archivist4, Mass5, Eye6; half add Herald10. Naal; random deployment; no meta/workshop; elite6/10/14, boss16. Pages and locked branches are natural RNG. Not random-draft win rates.',results},null,2));
