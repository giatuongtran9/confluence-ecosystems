// Entry point: data + engine (lib.js) load first, then the UI modules; input.js only registers listeners.
import './lib.js';
import './input.js';
import { draw, liveUI } from './arena.js';
import { labUI } from './lab.js';
import { CARDS, Game } from './lib.js';
import { BATTLEFIELDS, battlefield, routePoint } from './battlefield.js';
import { frozen } from './feedback.js';
import { showReport } from './map.js';
import { loadSave } from './save.js';
import { render, startLeader } from './screens.js';
import { S } from './state.js';
import { modal, save, toast } from './ui.js';

function frame(ts){let dt=Math.min(.1,(ts-S.last)/1000||0);S.last=ts;if(S.screen==='lab'&&S.battle){if(!S.paused){let left=frozen(dt)?0:dt*S.labSpeed;while(left>0){let step=Math.min(1/30,left);Game.step(S.battle,step);left-=step}}draw();S.uiClock+=dt;if(S.uiClock>.15){labUI();S.uiClock=0}requestAnimationFrame(frame);return}if(S.battle&&!S.battle.done&&!S.paused&&S.screen==='game'&&(!modal.open||modal.dataset.live==='true')){let left=frozen(dt)?0:dt*S.speed;while(left>0&&!S.battle.done){let step=Math.min(1/30,left);Game.step(S.battle,step);left-=step}if(S.battle.done){if(modal.open)modal.close();S.selected=null;save();render();window.scrollTo(0,0)}}if(S.battle?.done&&!S.battle.reported&&S.screen==='game'&&S.run?.recap){S.battle.reported=true;showReport(S.run.recap,S.run.node,true)} // once per battle, however it ended
if(S.battle&&S.screen==='game'&&S.run.phase==='combat'){draw();S.uiClock+=dt;if(S.uiClock>.15){liveUI();S.uiClock=0}}requestAnimationFrame(frame)}
{const loaded=loadSave(localStorage,Game);S.run=loaded.run;render();if(loaded.reset)toast('Your saved run was cleared for the update.');requestAnimationFrame(frame)}

// Handle for headless QA scripts, which drive the game from page.evaluate().
window.confluence = { S, Game, CARDS, BATTLEFIELDS, render, startLeader, battlefield, routePoint };
