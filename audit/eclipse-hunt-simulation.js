'use strict';
const G=require('../engine');
function run(seed,withStake,allStart=false){
 const r=G.newRun('morrow', seed);r.roster=['mercenary','leech'].map(id=>G.instance(r,id));
 if(allStart)for(const id of ['witchHunter','taxidermist','executioner','totem',...(withStake?['trophyStake']:[])])r.roster.push(G.instance(r,id));
 const rows=[];let first100=null,firstApex=null;
 for(let d=0;d<16;d++){
  if(!allStart){const add={1:'witchHunter',2:'taxidermist',4:'totem',5:'executioner',6:withStake?'trophyStake':null}[d];if(add)r.roster.push(G.instance(r,add));}
  r.depth=d;r.node={row:d,lane:1,type:d===15?'boss':[5,9,13].includes(d)?'elite':'battle'};r.phase='ready';
  const b=G.deploy(r);for(let n=0;n<6000&&!b.done;n++)G.step(b,.1);
  const core=r.roster.find(G.isSlayer);if((core?.trophyPoints||0)>=100&&first100==null)first100=d+1;if(G.HUNT_APEX.includes(core?.id)&&firstApex==null)firstApex=d+1;
  rows.push({crossing:d+1,won:b.won,health:r.health,points:core?.trophyPoints||0,form:core?.id,harvest:b.metrics.trophiesHarvested||0,lost:b.metrics.trophiesLost||0,carved:b.metrics.trophiesCarved||0,forges:b.metrics.huntForges||0});
  if(!b.won)break;
 }
 return {seed,withStake,allStart,won:r.depth===15&&rows.at(-1)?.won,first100,firstApex,rows};
}
const output=[];for(const allStart of [false,true])for(const withStake of [false,true])for(let seed=1;seed<=30;seed++)output.push(run(seed*7919,withStake,allStart));
if(require.main===module){console.log(JSON.stringify({method:'30 seeds per scenario; fixed support acquisition, random deployment, no meta or workshop upgrades. Normal crossings except elite 6/10/14 and boss16. allStart gives every support at crossing1 as an upper-bound control, not realistic drafting.',runs:output},null,2));}
