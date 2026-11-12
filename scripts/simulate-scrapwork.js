const G=require('../engine');
const results=[];
for(let seed=1;seed<=100;seed++){
 const r=G.newRun('rook', seed);r.roster=['scrapFrame','junkScavenger'].map(id=>G.instance(r,id));let titan=null,mythic=null,smelts=0,won=false;
 for(let depth=0;depth<16;depth++){
  if(depth===1)r.roster.push(G.instance(r,'smelter'));
  if(depth===2)r.roster.push(G.instance(r,'magneticCrane'));
  if(depth===4)r.roster.push(G.instance(r,'hydraulicRiveter'));
  if(depth===5)r.roster.push(G.instance(r,'titanReactor'));
  if([3,7,11].includes(depth)){r.health=Math.min(r.maxHealth,r.health+12);continue;}
  r.depth=depth;r.node={row:depth,lane:1,type:depth===15?'boss':'battle'};r.phase='ready';const b=G.deploy(r);
  while(!b.done&&b.time<240){G.step(b,1/30);const u=b.units.find(G.isMech);if(u.extraSlot!=null&&titan==null)titan=depth+1;if(['berserkerColossus','siegeDreadnought','vanguardJuggernaut'].includes(u.id)&&mythic==null)mythic=depth+1;}
  smelts+=b.metrics.smelts||0;if(depth===15&&b.won)won=true;if(!b.won)break;
 }
 const u=r.roster.find(G.isMech);results.push({seed,stage:r.depth+1,won,titan,mythic,alloy:u.alloy||0,modules:u.modules,smelts,health:r.health});
}
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)]??null;
console.log(JSON.stringify({scenario:'100 controlled campaigns: chosen support drafts, normal battles, Rook, no meta, 30 Hz',runs:results.length,wins:results.filter(x=>x.won).length,reachFinal:results.filter(x=>x.stage===16).length,titans:results.filter(x=>x.titan).length,medianTitanshift:median(results.filter(x=>x.titan).map(x=>x.titan)),mythics:results.filter(x=>x.mythic).length,medianMythic:median(results.filter(x=>x.mythic).map(x=>x.mythic)),medianSmelts:median(results.map(x=>x.smelts)),results},null,2));
