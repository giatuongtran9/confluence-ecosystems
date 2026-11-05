const G=require('../engine'),D=require('../data'),fs=require('fs');
const setups={hauntedLegends:{start:['mannequin','chainLetter'],add:{1:'kuchisake',2:'nightBus',4:'payphone',5:'morgueMirror'}}};
const median=a=>a.length?a.sort((a,b)=>a-b)[Math.floor(a.length/2)]:null,all={};
for(const [name,setup] of Object.entries(setups)){
 const rows=[];
 for(let seed=1;seed<=30;seed++){
 const r=G.newRun('none',{},seed);r.roster=setup.start.map(id=>G.instance(r,id));let legendary=null,mythic=null,won=false,titan=null,leaks=0,smelts=0;
 for(let depth=0;depth<16;depth++){
 if(setup.add[depth])r.roster.push(G.instance(r,setup.add[depth]));
 if([3,7,11].includes(depth)){r.health=Math.min(r.maxHealth,r.health+12);continue;}
 r.depth=depth;r.node={row:depth,lane:1,type:depth===15?'boss':'battle'};r.phase='ready';const b=G.deploy(r);
 while(!b.done&&b.time<240){G.step(b,1/30);if(legendary==null&&b.units.some(u=>!u.removed&&!G.token(u)&&['Legendary','Mythic'].includes(D.CARD[u.id].rarity)))legendary=depth+1;if(mythic==null&&b.units.some(u=>!u.removed&&!G.token(u)&&D.CARD[u.id].rarity==='Mythic'))mythic=depth+1;if(titan==null&&b.units.some(u=>G.isMech(u)&&u.extraSlot!=null))titan=depth+1;}
 leaks+=b.metrics.leaks;smelts+=b.metrics.smelts||0;if(depth===15&&b.won)won=true;if(!b.won)break;
 }
 rows.push({seed,won,lastCrossing:r.depth+1,legendary,mythic,titan,leaks,smelts,health:r.health,roster:r.roster.map(u=>({id:u.id,qi:u.qi,dread:u.dread,violations:u.violations,alloy:u.alloy,meals:u.meals,atk:u.permanentAtkBonus}))});
 }
 all[name]={setup,runs:30,wins:rows.filter(x=>x.won).length,medianLeaks:median(rows.map(x=>x.leaks)),legendaryRuns:rows.filter(x=>x.legendary!=null).length,medianLegendary:median(rows.filter(x=>x.legendary!=null).map(x=>x.legendary)),mythicRuns:rows.filter(x=>x.mythic!=null).length,medianMythic:median(rows.filter(x=>x.mythic!=null).map(x=>x.mythic)),medianTitan:median(rows.filter(x=>x.titan!=null).map(x=>x.titan)),rows};
 fs.writeFileSync(__dirname+'/legend-campaign-results.json',JSON.stringify(all,null,2));console.error(name,JSON.stringify({...all[name],rows:undefined}));
}
