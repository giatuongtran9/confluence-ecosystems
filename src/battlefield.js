import { BattleView, LEADERS } from './lib.js';
import { render } from './screens.js';
import { S } from './state.js';

// view = optional 2.5D perspective image; grid = its painted 3×3 square's corners as image fractions, clockwise from
// far-left, measured on zoomed coordinate sheets. Themes without a view use the flat top-down asset.
export const BATTLEFIELDS=Object.freeze({
  shen:{theme:'Cultivation',asset:'assets/battlefields/cultivation.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/cultivation.webp?v=20261115-2',aspect:1024/572,grid:[[0.3945,0.4038],[0.6055,0.4038],[0.6348,0.6084],[0.3652,0.6084]]}},
  yara:{theme:'Haunted',asset:'assets/battlefields/haunted.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/haunted.webp?v=20261115-2',aspect:1024/572,grid:[[0.4004,0.3497],[0.6006,0.3497],[0.6240,0.5874],[0.3740,0.5874]]}},
  vesper:{theme:'Bloodline Fantasy',asset:'assets/battlefields/bloodline-fantasy.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/bloodline-fantasy.webp?v=20261115-2',aspect:1024/572,grid:[[0.4014,0.4283],[0.5977,0.4283],[0.6230,0.6241],[0.3760,0.6241]]}},
  lyra:{theme:'Arcane Magic',asset:'assets/battlefields/arcane-magic.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/arcane-magic.webp?v=20261115-2',aspect:1024/572,grid:[[0.3867,0.4423],[0.6162,0.4423],[0.6455,0.6538],[0.3555,0.6538]]}},
  rook:{theme:'Post-Apocalyptic',asset:'assets/battlefields/post-apocalyptic.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/post-apocalyptic.webp?v=20261115-1',aspect:1024/572,grid:[[0.3877,0.4423],[0.6123,0.4423],[0.6406,0.6503],[0.3623,0.6503]]}},
  orion:{theme:'Science Fiction',asset:'assets/battlefields/science-fiction.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/science-fiction.webp?v=20261115-1',aspect:1024/572,grid:[[0.3789,0.3846],[0.6221,0.3846],[0.6572,0.6399],[0.3428,0.6399]]}},
  nyx:{theme:'Cyberpunk',asset:'assets/battlefields/cyberpunk.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/cyberpunk.webp?v=20261115-1',aspect:1024/572,grid:[[0.3965,0.4108],[0.6025,0.4108],[0.6309,0.6084],[0.3691,0.6084]]}},
  morrow:{theme:'Dark Fantasy',asset:'assets/battlefields/dark-fantasy.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/dark-fantasy.webp?v=20261115-1',aspect:1024/572,grid:[[0.3975,0.4073],[0.5967,0.4073],[0.6191,0.6224],[0.3809,0.6224]]}},
  naal:{theme:'Cosmic Horror',asset:'assets/battlefields/cosmic-horror.jpg?v=20261102-1',
    view:{image:'assets/battlefields/2_5d/cosmic-horror.webp?v=20261115-1',aspect:1024/572,grid:[[0.3975,0.4091],[0.5986,0.4091],[0.6191,0.6224],[0.3809,0.6224]]}}
});
// Percent bounds of each supplied scene's 3×3 playable surface, calibrated from the approved preview.
const FIELD_GRIDS=Object.freeze({
  orion:{left:33.0,top:32.9,width:34.2,height:34.2},
  shen:{left:33.2,top:32.1,width:33.8,height:35.2},
  rook:{left:33.3,top:33.3,width:33.6,height:33.6},
  lyra:{left:33.7,top:33.7,width:32.9,height:32.9},
  morrow:{left:33.4,top:33.4,width:33.2,height:33.2},
  nyx:{left:33.2,top:33.5,width:33.4,height:33.4},
  naal:{left:33.6,top:33.2,width:33.0,height:33.7},
  vesper:{left:33.2,top:33.0,width:33.6,height:33.8},
  yara:{left:33.0,top:32.9,width:34.0,height:34.0}
});
// The battle's own run decides the art (the Ability Lab runs a sandbox battle, possibly with no player run).
const fieldLeader=()=>S.battle?.run?.leader||S.run?.leader||LEADERS[0].id;
export const battlefield=()=>BATTLEFIELDS[fieldLeader()];
const activeFieldGrid=()=>FIELD_GRIDS[fieldLeader()];
// 2.5D: a theme's optional `view` ({image, aspect, corners}) is a perspective battlefield image; BattleView maps engine
// coordinates onto its painted floor. Themes without one keep the flat top-down JPG and its FIELD_GRIDS calibration.
const viewProjectors=new Map();
// Narrow screens (battle and Lab) show a square crop centred on the arena, so units stay large; desktop shows the whole
// widescreen image. Crossing 1024px re-renders to switch.
const desktopMQ=matchMedia('(min-width: 1024px)');
desktopMQ.addEventListener?.('change',()=>render());
export const stageAspect=v=>desktopMQ.matches?v.aspect:1;
const fieldProject=()=>{const f=battlefield();if(!f.view)return null;const S=stageAspect(f.view),k=f.view.image+S;if(!viewProjectors.has(k))viewProjectors.set(k,BattleView.projector(f.view,S));return viewProjectors.get(k)};
// Board-percent box of grid cell (0–2): in 2.5D an upright square standing on the cell's front edge, else the flat cell.
export const cardCell=(x,y)=>{const P=fieldProject();if(P){const l=P(x+.5,y+1),r=P(x+1.5,y+1),f=P(x+1,y+1.5),w=(r.u-l.u)*100;return {left:l.u*100,top:f.v*100-w,width:w,height:w}}const g=activeFieldGrid(),cw=g.width/3,ch=g.height/3;return {left:g.left+x*cw,top:g.top+y*ch,width:cw,height:ch}};
// Map logical center-grid coordinates (1–3) and perimeter-route coordinates (0–4) onto the battlefield.
export const routePoint=(x,y,size=700)=>{const P=fieldProject();if(P){const p=P(x,y);return {x:p.u*size,y:p.v*size}}const g=activeFieldGrid(),cw=g.width/3,ch=g.height/3;return {x:(g.left+(x-.5)*cw)*size/100,y:(g.top+(y-.5)*ch)*size/100}};
export const cardCellCenter=(x,y,size=700)=>routePoint(x+1,y+1,size);
// Devour ghost slide from cell a to cell z, as a share of its own box (cells differ in size on the tilted floor).
export const ghostShift=(a,z)=>{const p=cardCell(a.x,a.y),q=cardCell(z.x,z.y);return `--dx:${(q.left-p.left)/p.width*100}%;--dy:${(q.top-p.top)/p.height*100}%`};
