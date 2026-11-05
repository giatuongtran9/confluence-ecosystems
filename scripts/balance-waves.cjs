const G=require('../engine'),D=require('../data');
const setups={
 cultSolo:['practitioner'],cultCore:['practitioner','herbGrass','cauldron'],cultFull:['practitioner','lotusRoot','herbGrass','cauldron','flyingSword'],
 bloodStarter:['cub','hound','hound'],
 ...Object.fromEntries([['dragon','serpentFodder','dragonPearl'],['tiger','hound','tigerSeal'],['xuanwu','scuttler','earthTablet'],['phoenix','flameToad','phoenixTree'],['monkey','peachFodder','goldenStaff']].map(([p,f,r])=>['blood'+p,['cub',f,f,'broodkeeper','matriarch',r]])),
 hauntedA:['investigator','securityCam','radioPA','coroner','decoder','ruleboard'],
 hauntedDuo:['stair13','redRaincoat'],hauntedLegends:['kuchisake','nightBus','payphone','morgueMirror','mannequin','chainLetter'],
 scrapCore:['scrapFrame','junkScavenger'],scrapFull:['scrapFrame','junkScavenger','magneticCrane','hydraulicRiveter','smelter','titanReactor']};
const median=a=>a.length?a.sort((a,b)=>a-b)[Math.floor(a.length/2)]:null;
const all={};
for(const [name,ids] of Object.entries(setups)){
 const rows=[];
 for(let seed=1;seed<=30;seed++){
 const r=G.newRun('none',{},seed);r.roster=ids.map(id=>G.instance(r,id));r.depth=5;r.node={row:5,lane:1,type:'battle'};r.phase='ready';const b=G.deploy(r);let legend=null,mythic=null;
 while(!b.done&&b.time<180){G.step(b,1/30);if(legend==null&&b.units.some(u=>!u.removed&&!G.token(u)&&['Legendary','Mythic'].includes(D.CARD[u.id].rarity)))legend=b.time;if(mythic==null&&b.units.some(u=>!u.removed&&!G.token(u)&&D.CARD[u.id].rarity==='Mythic'))mythic=b.time;}
 rows.push({seed,won:b.won,kills:b.metrics.kills,leaks:b.metrics.leaks,legend,mythic,remaining:r.roster.length,alloy:r.roster.find(G.isMech)?.alloy||0,smelts:b.metrics.smelts||0,meals:r.roster.find(u=>G.family(u)==='cub')?.meals||0,breeding:b.metrics.breedingChecks||0,ids:r.roster.map(u=>u.id)});
 }
 all[name]={ids,runs:rows.length,clears:rows.filter(x=>x.won).length,medianLeaks:median(rows.map(x=>x.leaks)),legendary:rows.filter(x=>x.legend!=null).length,medianLegendSeconds:median(rows.filter(x=>x.legend!=null).map(x=>+x.legend.toFixed(1))),mythic:rows.filter(x=>x.mythic!=null).length,medianMythicSeconds:median(rows.filter(x=>x.mythic!=null).map(x=>+x.mythic.toFixed(1))),medianOriginalsRemaining:median(rows.map(x=>x.remaining)),medianAlloy:median(rows.map(x=>x.alloy)),medianSmelts:median(rows.map(x=>x.smelts)),medianMeals:median(rows.map(x=>x.meals)),rows};
 console.error(name,JSON.stringify({...all[name],rows:undefined}));
}
require('fs').writeFileSync(__dirname+'/wave-results.json',JSON.stringify(all,null,2));
