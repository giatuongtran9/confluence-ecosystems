// Paired final-wave tests: identical five-card ecosystem, an established Rare
// in the sixth slot versus a fresh late card. No campaign or rarity luck.
const G=require('./dist/engine.js');
const scenarios=[
 ['railgun',['nanite','sensor','conduit','cannon','vent'],'nanite'],
 ['weaver',['jade','crystal','conduit','lotus','cannon'],'jade'],
 ['mage',['jade','crystal','conduit','lotus','cannon'],'jade'],
 ['behemoth',['cannon','smelter','vent','mantis','bellows'],'cannon'],
 ['core',['nanite','sensor','cannon','mantis','vent'],'nanite'],
 ['executioner',['totem','familiar','cannon','vent','leech'],'leech'],
 ['eye',['bell','vent','larva','spirit','lantern'],'bell'],
 ['reaper',['totem','familiar','matriarch','altar','leech'],'leech'],
 ['herald',['eye','larva','bell','vent','mass'],'bell'],
 ['medium',['spirit','bell','lantern','vent','cannon'],'spirit'],
 ['matriarch',['familiar','hound','heir','broodkeeper','altar'],'familiar'],
 ['soulwell',['harvester','lamb','shepherd','lantern','medium'],'lantern']
];
function trial(ids,late,seed,leader){const r=G.newRun(leader,{},seed);r.roster=ids.map((id,i)=>{const u=G.instance(r,id);u.permanentAtkBonus=i<5?30:late?0:60;return u;});r.phase='ready';r.depth=15;r.node={row:15,lane:1,type:'boss'};const b=G.deploy(r);for(let i=0;i<27000&&!b.done;i++)G.step(b,1/30);if(!b.done)throw Error('Unfinished payoff trial');return {won:b.won,time:b.time,damage:r.recap.damage,lateDamage:r.recap.cards.find(c=>c.uid===6)?.damage||0};}
for(const [payoff,core,rare]of scenarios){const a=[],b=[];for(const leader of ['shen','vesper','lyra'])for(let seed=1;seed<=4;seed++){a.push(trial([...core,rare],false,seed,leader));b.push(trial([...core,payoff],true,seed,leader));}const avg=(xs,k)=>Math.round(xs.reduce((s,x)=>s+x[k],0)/xs.length);console.log(JSON.stringify({payoff,establishedAlternative:rare,runs:12,rareWins:a.filter(x=>x.won).length,payoffWins:b.filter(x=>x.won).length,rareSeconds:avg(a,'time'),payoffSeconds:avg(b,'time'),rareSlotDamage:avg(a,'lateDamage'),payoffSlotDamage:avg(b,'lateDamage')}));}
