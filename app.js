'use strict';

const isCultivator = u => Game.isPractitioner(u) || (Game.isApexImmortal(u) && Game.family(u) === 'practitioner');
function ascensionBarHTML(u){
  if(isCultivator(u)) {
    const qi = u.qi || 0, isApex = Game.isApexImmortal(u);
    const realmName = isApex ? 'Apex Immortal (Ascended)' : ['Qi-Refining (Luyện Khí)','Foundation (Trúc Cơ)','Golden Core (Kim Đan)','Nascent Soul (Nguyên Anh)'][u.realm||0];
    const progressPercent = isApex ? 100 : Math.min(100, Math.round((qi / 175) * 100));
    return `<div class="ascension-bar-box">
      <div class="ascension-bar-header"><span>Cultivation Realm</span><b>${realmName}</b></div>
      <div class="ascension-bar-track"><i style="width:${progressPercent}%"></i></div>
      <div class="ascension-bar-meta"><span>${isApex?'Apex Power Achieved':qi+' / 175 Qi'}</span><span>${isApex?'Relic Resonance Active':u.realm===3?'Ready for Relic Fusion':'Accumulate Qi on hit'}</span></div>
    </div>`;
  }
  const archAApexes = ['ruleArchitect', 'allSeeingOverseer', 'curfewDirector', 'forensicDemiurge', 'backroomsWarden'];
  if(Game.isUrbanInvestigator && (Game.isUrbanInvestigator(u) || archAApexes.includes(u.id))) {
    const dread = u.dread || 0, isApex = archAApexes.includes(u.id);
    const realmName = isApex ? `${CARD[u.id].name} (Mythic)` : ['Investigator (Tập Sự)','Occult Detective (Thần Thám)','Anomaly Specialist (Chuyên Viên)','Rule Enforcer (Chấp Pháp)'][u.realm||0];
    const progressPercent = isApex ? 100 : Math.min(100, Math.round((dread / 140) * 100));
    return `<div class="ascension-bar-box">
      <div class="ascension-bar-header"><span>Containment Protocol</span><b>${realmName}</b></div>
      <div class="ascension-bar-track"><i style="width:${progressPercent}%;background:#aab9ec"></i></div>
      <div class="ascension-bar-meta"><span>${isApex?'Mythic Authority Active':dread+' / 140 Dread'}</span><span>${isApex?'Rule Resonance Active':u.realm===3?'Ready to bind Cursed Relic':'Process Incident Dossiers'}</span></div>
    </div>`;
  }
  const archBApexes = ['slitMouthedSovereign', 'terminusBus', 'midnightOperator', 'mirrorQueen', 'livingTaboo'];
  if(Game.isUrbanLegend && (Game.isUrbanLegend(u) || archBApexes.includes(u.id))) {
    const v = u.violations || 0, isApex = archBApexes.includes(u.id);
    const progressPercent = isApex ? 100 : Math.min(100, Math.round((v / 45) * 100));
    return `<div class="ascension-bar-box">
      <div class="ascension-bar-header"><span>Autonomous Urban Legend</span><b>${isApex?'Mythic Urban Apex':v>=15?'Ascended Legend':'Urban Legend'}</b></div>
      <div class="ascension-bar-track"><i style="width:${progressPercent}%;background:#c084fc"></i></div>
      <div class="ascension-bar-meta"><span>${isApex?'Mythic Power Active':v+' / 45 Violations'}</span><span>${isApex?'Rule Resonance Active':v>=15?'Ascends at 45 Violations':'Self-ascends by catching violators'}</span></div>
    </div>`;
  }
  return '';
}


function bottomDock(){
  if(screen==='home') return '';
  return `<nav class="mobile-dock" aria-label="Game navigation">
    <button class="dock-tab ${screen==='game'&&run?.phase==='combat'?'active':''}" data-action="journey">
      <span class="dock-icon">⚔️</span>
      <span class="dock-label">Battle</span>
    </button>
    <button class="dock-tab ${screen==='game'&&run?.phase==='draft'?'active':''}" data-action="draftTab">
      <span class="dock-icon">🎴</span>
      <span class="dock-label">Draft</span>
    </button>
    <button class="dock-tab ${screen==='game'&&['ready','event','map'].includes(run?.phase)?'active':''}" data-action="route">
      <span class="dock-icon">🗺️</span>
      <span class="dock-label">Map</span>
    </button>
    <button class="dock-tab" data-action="roster">
      <span class="dock-icon">🃏</span>
      <span class="dock-label">Deck${run?` (${run.roster.length})`:''}</span>
    </button>
    <button class="dock-tab ${screen==='codex'?'active':''}" data-action="codex">
      <span class="dock-icon">📖</span>
      <span class="dock-label">Codex</span>
    </button>
  </nav>`;
}
const $=s=>document.querySelector(s),app=$('#app'),modal=$('#modal');
const RUN_KEY='confluence-run-v3',META_KEY='confluence-meta-v1';
function read(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}
let meta=read(META_KEY,{shards:0,vitality:0,power:0,runs:0,wins:0}),run=read(RUN_KEY,null),screen='home',battle=null,selected=null,paused=false,speed=1,last=0,uiClock=0,filter='all';
if(run?.version!==3)run=null;
let feedbackSeen=0,visualEvents=[],openingAt=0;
const rarityBadge=id=>`<span class="rarity rarity-${CARD[id].rarity.toLowerCase()}">${CARD[id].rarity}</span>`;
const cardLabel=c=>CARD[c.id].name+(c.phantom?' (phantom)':' #'+c.uid);
const nodeLabel=n=>{const encounter=Game.encounterFor(n);return encounter?(Game.trialFor(n)?'Trial · ':'')+(n.type==='elite'?'Warden · ':'')+({packs:'Swarm',armor:'Armor',fast:'Rush'}[encounter.id]):NODES[n.type].name;};
function save(){try{localStorage.setItem(META_KEY,JSON.stringify(meta));if(run&&run.phase!=='combat')localStorage.setItem(RUN_KEY,JSON.stringify(run))}catch{toast('Browser storage is unavailable. Keep this tab open to preserve this run.')}}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
const btn=(a,t,c='',extra='')=>`<button data-action="${a}" class="${c}" ${extra}>${t}</button>`;
function sprite(i){return `<span class="sprite" aria-hidden="true" style="background-position:${i%4*100/3}% ${Math.floor(i/4)*100/3}%"></span>`}
const modelIds=['jade','herb','spirit','bell','heir','hound','conduit','mage','cannon','smelter','sensor','railgun','mantis','vent','totem','executioner','eye','mass','lotus','cauldron','lantern','medium','familiar','altar','crystal','weaver','bellows','behemoth','nanite','core','netrunner','plasma','leech','reaper','larva','herald','monk','petal','imp'];
const unitAtlas=new Image();unitAtlas.src='assets/units-realistic.png';
const cultivationRealmSprites={practitioner:'assets/cultivation-sprites/qi-refining-practitioner.png',cultivationFoundation:'assets/cultivation-sprites/foundation-practitioner.png',cultivationGoldenCore:'assets/cultivation-sprites/golden-core-daoist.png',cultivationNascentSoul:'assets/cultivation-sprites/nascent-soul-sovereign.png',lotusRoot:'assets/cultivation-sprites/spirit-lotus.png',herbGrass:'assets/cultivation-sprites/cloud-mist-spirit-grass.png',cauldron:'assets/cultivation-sprites/nine-turn-alchemy-cauldron.png',flyingSword:'assets/cultivation-sprites/ancient-flying-sword.png',guqin:'assets/cultivation-sprites/celestial-guqin.png',weiqiBoard:'assets/cultivation-sprites/star-river-weiqi-board.png',swordImmortal:'assets/cultivation-sprites/sword-immortal.png',melodicSaint:'assets/cultivation-sprites/melodic-saint.png',formationMaster:'assets/cultivation-sprites/formation-master.png',talismanSovereign:'assets/cultivation-sprites/talisman-sovereign.png',landscapeSage:'assets/cultivation-sprites/landscape-sage.png',soulReapingDemon:'assets/cultivation-sprites/soul-reaping-heavenly-demon.png',bloodFiendMaster:'assets/cultivation-sprites/blood-fiend-sword-master.png',inkBrush:'assets/cultivation-sprites/dragon-tail-ink-brush.png?v=20261102-9',mountainScroll:'assets/cultivation-sprites/mountain-river-scroll.png',soulBanner:'assets/cultivation-sprites/soul-banner.png',demonBlade:'assets/cultivation-sprites/demon-blade.png'};
const bloodlineSprites={
  cub:'assets/bloodline-sprites/primordial-blood-cub.png',
  serpentFodder:'assets/bloodline-sprites/horned-serpent.png',
  scaleImp:'assets/bloodline-sprites/horned-serpent.png',
  hound:'assets/bloodline-sprites/crimson-hound.png',
  houndToken:'assets/bloodline-sprites/crimson-hound.png',
  scuttler:'assets/bloodline-sprites/iron-scuttler.png',
  carapaceToken:'assets/bloodline-sprites/iron-scuttler.png',
  flameToad:'assets/bloodline-sprites/flame-toad.png',
  emberToken:'assets/bloodline-sprites/flame-toad.png',
  peachFodder:'assets/bloodline-sprites/spirit-peach-fodder.png',
  peachToken:'assets/bloodline-sprites/spirit-peach-fodder.png',
  dragonPearl:'assets/bloodline-sprites/dragon-pearl.png',
  tigerSeal:'assets/bloodline-sprites/slaughter-tiger-seal.png',
  earthTablet:'assets/bloodline-sprites/heavy-earth-tablet.png',
  phoenixTree:'assets/bloodline-sprites/phoenix-flame-tree.png',
  goldenStaff:'assets/bloodline-sprites/golden-hooped-staff.png',
  dragonCubT1:'assets/bloodline-sprites/dragon-cub-t1.png',
  dragonCubT2:'assets/bloodline-sprites/dragon-cub-t2.png',
  dragonCubT3:'assets/bloodline-sprites/dragon-cub-t3.png',
  dragonCubApex:'assets/bloodline-sprites/dragon-cub-apex.png',
  tigerCubT1:'assets/bloodline-sprites/tiger-cub-t1.png',
  tigerCubT2:'assets/bloodline-sprites/tiger-cub-t2.png',
  tigerCubT3:'assets/bloodline-sprites/tiger-cub-t3.png',
  tigerCubApex:'assets/bloodline-sprites/tiger-cub-apex.png',
  xuanwuCubT1:'assets/bloodline-sprites/xuanwu-cub-t1.png',
  xuanwuCubT2:'assets/bloodline-sprites/xuanwu-cub-t2.png',
  xuanwuCubT3:'assets/bloodline-sprites/xuanwu-cub-t3.png',
  xuanwuCubApex:'assets/bloodline-sprites/xuanwu-cub-apex.png',
  phoenixCubT1:'assets/bloodline-sprites/phoenix-cub-t1.png',
  phoenixCubT2:'assets/bloodline-sprites/phoenix-cub-t2.png',
  phoenixCubT3:'assets/bloodline-sprites/phoenix-cub-t3.png',
  phoenixCubApex:'assets/bloodline-sprites/phoenix-cub-apex.png',
  monkeyCubT1:'assets/bloodline-sprites/monkey-cub-t1.png',
  monkeyCubT2:'assets/bloodline-sprites/monkey-cub-t2.png',
  monkeyCubT3:'assets/bloodline-sprites/monkey-cub-t3.png',
  monkeyCubApex:'assets/bloodline-sprites/monkey-cub-apex.png',
  altar:'assets/bloodline-sprites/blood-altar.png',
  broodkeeper:'assets/bloodline-sprites/crimson-broodkeeper.png',
  matriarch:'assets/bloodline-sprites/brood-matriarch.png'
};
function art(c){const spriteSrc=cultivationRealmSprites[c.id]||bloodlineSprites[c.id];if(spriteSrc)return `<img class="sprite cultivation-unit-sprite" aria-hidden="true" alt="" src="${spriteSrc}">`;let id=c.asset||c.evolvedFrom||c.id;if(id==='houndToken')id='hound';if(id==='echo')id='spirit';let i=modelIds.indexOf(id);if(i<0)i=2;return `<span class="sprite realistic-unit ${c.evolvedFrom?'ascended':''}" aria-hidden="true" style="background-position:${i%6*20}% ${Math.floor(i/6)*100/6}%"></span>`;}

const BATTLEFIELDS=Object.freeze({
  shen:{theme:'Cultivation',asset:'assets/battlefields/cultivation.jpg?v=20261102-1'},
  yara:{theme:'Haunted',asset:'assets/battlefields/haunted.jpg?v=20261102-1'},
  vesper:{theme:'Bloodline Fantasy',asset:'assets/battlefields/bloodline-fantasy.jpg?v=20261102-1'},
  lyra:{theme:'Arcane Magic',asset:'assets/battlefields/arcane-magic.jpg?v=20261102-1'},
  rook:{theme:'Post-Apocalyptic',asset:'assets/battlefields/post-apocalyptic.jpg?v=20261102-1'},
  orion:{theme:'Science Fiction',asset:'assets/battlefields/science-fiction.jpg?v=20261102-1'},
  nyx:{theme:'Cyberpunk',asset:'assets/battlefields/cyberpunk.jpg?v=20261102-1'},
  morrow:{theme:'Dark Fantasy',asset:'assets/battlefields/dark-fantasy.jpg?v=20261102-1'},
  naal:{theme:'Cosmic Horror',asset:'assets/battlefields/cosmic-horror.jpg?v=20261102-1'}
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
const battlefield=()=>BATTLEFIELDS[run?.leader]||{theme:'Training Ground',asset:'assets/battlefield-realistic.png'};
const activeFieldGrid=()=>FIELD_GRIDS[run?.leader]||{left:34,top:34,width:32,height:32};
const cardCell=(x,y)=>{const g=activeFieldGrid(),cw=g.width/3,ch=g.height/3;return {left:g.left+x*cw,top:g.top+y*ch,width:cw,height:ch}};
// Map logical center-grid coordinates (1–3) and perimeter-route coordinates (0–4) onto the art.
const routePoint=(x,y,size=700)=>{const g=activeFieldGrid(),cw=g.width/3,ch=g.height/3;return {x:(g.left+(x-.5)*cw)*size/100,y:(g.top+(y-.5)*ch)*size/100}};
const routeGridStyle=()=>{const g=activeFieldGrid(),cw=g.width/3,ch=g.height/3;return `left:${g.left-cw}%;top:${g.top-ch}%;width:${g.width+2*cw}%;height:${g.height+2*ch}%`};
const cardCellCenter=(x,y,size=700)=>routePoint(x+1,y+1,size);
const leader=()=>LEADERS.find(l=>l.id===run?.leader);
function header(){
  if(screen==='game'&&run){
    const l=leader();
    return `<header class="mobile-hud">
      <div class="hud-left">
        <button class="hud-avatar-btn" data-action="home" title="Return to Home">
          <div class="hud-avatar-ring">${sprite(l.sprite)}</div>
          <span class="hud-lvl">1</span>
        </button>
        <div class="hud-meta">
          <div class="hud-leader-name">${l.name.split(',')[0]}</div>
          <div class="hud-hp-pill"><span class="hp-heart">♥</span> <b id="hp">${Math.ceil(run.health)}<span>/${run.maxHealth}</span></b></div>
        </div>
      </div>
      <div class="hud-center">
        <div class="hud-stage-pill">STAGE ${Math.max(1,run.depth+1)}/16</div>
      </div>
      <div class="hud-right">
        <div class="hud-res-pill" title="Run coins"><span class="res-gold">🪙</span> <b id="coin-count">${run.coins||0}</b></div>
        <button class="hud-res-pill hud-shard-btn" data-action="legacy" title="Legacy shards" aria-label="Legacy shards"><span class="res-gold">◆</span> <b>${meta.shards||0}</b></button>
        <button class="hud-icon-btn" data-action="help" aria-label="Help">?</button>
      </div>
    </header>`;
  }
  return `<header class="mobile-hud lobby-hud">
    <button class="brand" data-action="home"><span class="sigil">✧</span><span><span class="brand-name">CONFLUENCE</span><span class="brand-sub">THE NINEFOLD CROSSING</span></span></button>
    <div class="lobby-actions"><button class="hud-icon-btn" data-action="help" aria-label="How to play">?</button></div>
  </header>`;
}
function home(){return `<section class="hero"><div class="hero-copy"><div class="eyebrow">One deck. Nine impossible worlds.</div><h1>Build a living<br><span class="accent">ecosystem.</span></h1><p>Choose your cards. Read the road ahead. Connect attacks, state cycles, spells, and sacrifice into a team that can defeat the boss.</p><div class="row wrap"><span class="tag">3 × 3 formation</span><span class="tag">Automatic combat</span><span class="tag">${CARDS.filter(c=>!c.retired).length} cards · ${FORMS.length} evolutions · 9 genres</span></div></div><div class="hero-art"><div class="orbital"></div><div class="orbital two"></div><div class="hero-cast">${[0,4,8,12].map(sprite).join('')}</div><div class="hero-art-caption">ATTACK · TRANSFORM · TRIGGER · GROW</div></div></section>${run?`<div class="resume"><div><h3>${['won','lost'].includes(run.phase)?'Your last crossing':'A crossing in progress'}</h3><p>${leader().name} · ${run.roster.length} cards · ${Math.ceil(run.health)} health · ${run.coins||0} coins</p></div>${btn('resume','Continue →','primary')}</div>`:''}<div class="sectionhead"><div><div class="eyebrow">Choose a leader, then your first card</div><h2>Choose a power. Accept its price.</h2></div></div><div class="leaders">${LEADERS.map(l=>`<button class="leader" data-action="leader" data-id="${l.id}">${sprite(l.sprite)}<span class="eyebrow">${l.title}</span><h3>${l.name}</h3><p class="leader-benefit">+ ${l.benefit}</p><p class="leader-drawback">− ${l.drawback}</p><div class="leader-foot"><span>Choose leader</span><span>↗</span></div></button>`).join('')}</div><div class="footerline"><span>Automatic combat growth · Optional upgrades at Fate Workshops.</span><span>Saved on this browser</span></div>`}
function stats(){return `<div class="stats"><div class="stat"><small>Health</small><b class="health stat-hp">${Math.ceil(run.health)}<span>/${run.maxHealth}</span></b></div><div class="stat"><small>Coins</small><b class="stat-coin">${run.coins||0}</b></div><div class="stat"><small>Deck</small><b>${run.roster.length}<span> cards</span></b></div><div class="stat"><small>Crossing</small><b>${Math.max(1,run.depth+1)}<span>/16</span></b></div></div>`}
function gamehead(){return `<div class="gamehead"><div><div class="eyebrow">${leader().name}</div><h2>${run.phase==='combat'?'Hold the perimeter':run.phase==='draft'?'A new possibility':'The road between worlds'}</h2></div>${stats()}</div>`}
function cardTags(c,isToken=false){return `<span class="card-tags">${isToken||c.token?'TOKEN · parent safe':c.tags?.includes('fodder')?'FODDER · original lost if eaten':''}${c.evolvedFrom?'EVOLUTION ONLY':''}</span>`}

function getUnitTitles(c, u = null) {
  if (u && Game.isPractitioner(u)) {
    const realm = u.realm || 0;
    const names = ['Qi-Refining Practitioner', 'Foundation Practitioner', 'Golden Core Daoist', 'Nascent Soul Sovereign'];
    const vnNames = ['Luyện Khí Tu Giả', 'Trúc Cơ Tu Giả', 'Kim Đan Chân Nhân', 'Nguyên Anh Lão Tổ'];
    return { name: names[realm], vn: vnNames[realm] };
  }
  return { name: c.name, vn: c.vn };
}

function evolutionHint(c,u=null){
  if(u && Game.family(u)==='cub'){
    const path = u.lineage;
    const stacks = u.lineageStacks || 0;
    const tierInfo = Game.lineageTierIds ? Game.lineageTierIds[u.id] : null;
    const curTier = tierInfo ? tierInfo.tier : 0;
    if(!path){
      return `<p class="evolution-hint">✧ <b>Primordial Blood Cub · Destiny Unawakened</b><br>First prey eaten irrevocably locks destiny: Serpent (Dragon), Hound (Tiger), Scuttler (Xuanwu), Toad (Phoenix), or Peach (Monkey). All meals grant permanent ATK.</p>`;
    }
    const pathNames = { dragon: 'Primordial Dragon', tiger: 'White Tiger', xuanwu: 'Xuanwu Colossus', phoenix: 'Vermilion Phoenix', monkey: 'Great Sage Sun' };
    const lineageName = pathNames[path] || path;
    if(curTier < 3){
      const nextId = Game.cubForms[path][curTier];
      const nextCard = CARD[nextId];
      const neededStacks = (curTier + 1) * 2;
      return `<p class="evolution-hint">✧ Lineage: <b>${lineageName}</b> (Tier ${curTier}/4)<br>Current stacks: <b>${stacks}</b> · Next evolution into <b>${nextCard ? nextCard.name : 'Next Form'}</b> at ${neededStacks} matching prey meals (Devour matching fodder).</p>`;
    } else if(curTier === 3){
      const apexId = Game.cubForms[path][3];
      const apexCard = CARD[apexId];
      const relicId = Game.cubRelics[path];
      const relicCard = CARD[relicId];
      return `<p class="evolution-hint">✧ Lineage: <b>${lineageName}</b> (Tier 3/4 · Ancestral Verge)<br>Ancestral Ascension: Position adjacent to <b>${relicCard ? relicCard.name : 'Lineage Relic'}</b> to awaken into Apex <b>${apexCard ? apexCard.name : 'Apex Immortal Form'}</b>!</p>`;
    } else {
      return `<p class="evolution-hint">✧ Apex Lineage: <b>${lineageName}</b> (Apex Tier 4/4)<br>Ancestral manifestation complete. Relic Resonance active with adjacent Totem.</p>`;
    }
  }
  if(!c.evolveTo)return '';
  const p=u?Game.evolutionProgress(u):null;
  return `<p class="evolution-hint">✧ Evolves into <b>${CARD[c.evolveTo].name}</b><br>${c.evolution}${p?` · ${Math.min(p.current,p.max)} / ${p.max}`:''}</p>`
}
function cardView(id,action='inspectCard',extra=''){const c=CARD[id],col=GENRES[c.genre][1];return `<button class="draft-card" data-action="${action}" data-id="${id}" style="--realm:${col}" ${extra}>${rarityBadge(id)}${cardTags(c)}<span class="eyebrow">${GENRES[c.genre][0]} · ${c.fav==='neighbor'?'Neighbor interaction':'Any slot'}</span><div class="card-art">${art(c)}</div><h3>${c.name}</h3><div class="card-numbers"><b>${c.baseAtk} <small>ATK</small></b><span>${c.attackInterval?c.attackInterval+'s / attack':'Support'}</span></div><div class="eyebrow">Rules</div><p>${c.rules}</p><div class="eyebrow">${c.ecosystem}</div><div class="spatial"><b>Works well with</b><p>${c.synergy}</p></div>${evolutionHint(c)}${action==='draft'?'<span class="pick-label">Choose this card →</span>':''}</button>`}
function mapView(interactive=true){let options=Game.available(run).map(n=>n.id),nodes=run.map.flat(),w=360,h=16*56+26,px=n=>60+n.lane*120,py=n=>24+n.row*56;let paths='';for(let row=0;row<15;row++)for(const a of run.map[row])for(const z of run.map[row+1])if(z.row===15||Math.abs(z.lane-a.lane)<=1){let taken=run.visited.includes(a.id)&&run.visited.includes(z.id);paths+=`<path d="M${px(a)} ${py(a)} L${px(z)} ${py(z)}" class="${taken?'taken':''}"/>`}
return `<section class="map-panel panel"><div class="row between"><div><div class="eyebrow">The complete route</div><h3>Choose your crossing</h3></div><span class="badge">16 stages</span></div><p class="hint">Follow connected paths downward. Every destination is revealed. Gold nodes are available now.</p><div class="map-legend">${Object.entries(NODES).map(([k,n])=>`<span>${n.icon} ${n.name}</span>`).join('')}</div><div class="map-scroll"><div class="route-map" style="aspect-ratio:${w}/${h}"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${paths}</svg>${nodes.map(n=>{let available=options.includes(n.id),done=run.visited.includes(n.id),current=run.node?.id===n.id;return `<button style="left:${px(n)/w*100}%;top:${py(n)/h*100}%" class="map-node ${available?'available':''} ${done?'visited':''} ${current?'current':''} ${n.type}" data-action="${interactive&&available?'node':'nodeInfo'}" data-id="${n.id}" aria-label="Stage ${n.row+1}, ${['left','middle','right'][n.lane]}: ${nodeLabel(n)}${available?', available':''}${done?', visited':''}"><span>${NODES[n.type].icon}</span><small>${n.row+1} · ${nodeLabel(n)}</small></button>`}).join('')}</div></div></section>`}
function readinessPanel(){const history=run.battleHistory||[],lastTrial=[...history].reverse().find(w=>w.trial)?.trial,recent=history.slice(-3),leaks=recent.reduce((s,w)=>s+w.leaks,0);if(!history.length)return '';let message=lastTrial?(lastTrial.killed?`Last Harbinger: defeated after reaching ${Math.round(lastTrial.progress/16*100)}% of the track. ${lastTrial.progress>=12?'A narrow finish: strengthen sustained damage.':'Good evidence for that team, but the final boss has more health.'}`:`Last Harbinger escaped with ${lastTrial.hpRemaining.toLocaleString()} HP. Prioritize sustained damage; slows alone cannot stop enrage.`):'Boss readiness is untested. Harbingers at crossings 6, 10, and 14 introduce its resistance and enrage.';return `<div class="encounter-panel"><div class="eyebrow">Build check · observed results</div><p>${message}</p><p>${leaks?`${leaks} leaks across your last ${recent.length} battles. Use the next draft and route to address these weaknesses.`:'No recent leaks. This does not guarantee enough damage against the boss.'}</p>${run.roster.length>9?`<p class="health">${run.roster.length} cards compete for 9 slots. A grown card can miss the next battle. Skipping a reward preserves draw consistency.</p>`:''}<p class="hint">Random draws change the active team each battle; most synergies ignore position. This is a record of performance, not a win prediction.</p></div>`}
function encounterPanel(n){const e=Game.encounterFor(n),trial=Game.trialFor(n);return (e?`<div class="encounter-panel ${e.id}"><div class="eyebrow">This wave tests · ${e.test}</div><h3>${e.name}</h3><p>${e.desc}</p><p class="encounter-tip">${e.tip}</p></div>`:'')+(trial?`<div class="encounter-panel armor"><div class="eyebrow">Boss rehearsal · Harbinger</div><h3>${trial.hp.toLocaleString()} HP · ${trial.leak} damage if it escapes</h3><p>The final runner has 20% armor and halves Slow, Stun, Freeze, and knockback. After 45 seconds it enrages: +25% movement speed and immunity to Stun, Freeze, and knockback.</p><p class="encounter-tip">Test sustained damage now. A leak costs health, but does not automatically end the run. Read the result before your next draft.</p></div>`:'')}

function battleReport(r){if(!r?.cards)return '';let cards=r.cards,top=cards.filter(c=>c.damage>0).slice(0,3),max=Math.max(1,...cards.map(c=>c.damage)),growth=cards.filter(c=>c.growth>0),interactions=r.interactions||[],lost=r.consumed||[];
 const damageRow=c=>`<div class="damage-row"><div class="row between"><span>${cardLabel(c)}${c.consumed?' · consumed':''}</span><b>${Math.round(c.damage).toLocaleString()}</b></div><div class="damage-meter"><i style="width:${c.damage/max*100}%"></i></div></div>`;
 const interactionRow=i=>`<li><b>${i.from?CARD[i.from].name:'Track'}${i.to&&i.toUid!==i.fromUid?' → '+CARD[i.to].name:''}</b><span>${i.label}</span><em>×${i.count}</em></li>`;
 return `<section class="battle-report"><div class="row between wrap"><div><div class="eyebrow">What your build did</div><h3>Battle breakdown</h3></div><span class="badge">${r.encounter?Game.ENCOUNTERS[r.encounter].name:'Perimeter defense'} · ${Math.round(r.time)}s</span></div><div class="report-grid"><div><h4>Damage leaders</h4>${top.map(damageRow).join('')||'<p class="hint">No damage dealt.</p>'}<p class="hint">Actual damage, including damage over time. Overkill is excluded; support effects are listed as interactions.</p></div><div><h4>Growth & permanent losses</h4>${growth.length?growth.map(c=>`<p class="growth-line"><b>+${c.growth} ATK</b> ${cardLabel(c)}${c.consumed?' · later consumed':''}</p>`).join(''):'<p class="hint">No permanent attack gained this battle.</p>'}${lost.length?`<div class="loss-list">${lost.map(c=>`<p><strong>${c.token?'TOKEN CONSUMED · PARENT SAFE':'ORIGINAL PERMANENTLY LOST'}</strong> ${rarityBadge(c.id)} ${CARD[c.id].name} #${c.uid} → ${CARD[c.by].name} #${c.byUid}<span>${c.reason||'Devour'} granted +${c.bonus} permanent ATK.</span></p>`).join('')}</div>`:'<p class="hint">No cards consumed.</p>'}</div></div>${(r.evolutions||[]).length?`<div class="evolution-report"><h4>Evolutions earned</h4>${r.evolutions.map(e=>`<p>${CARD[e.from].name} → <b>${CARD[e.to].name}</b> · ${e.time.toFixed(1)}s</p>`).join('')}</div>`:''}${readinessPanel()}<div class="report-notes">${(r.notes||[]).map(n=>`<p>${n}</p>`).join('')}</div><details class="report-details"><summary>All cards & triggered interactions (${interactions.length})</summary><div class="report-table-wrap"><table><thead><tr><th>Card</th><th>Hits / spells</th><th>DoT</th><th>Kills</th><th>Gauge triggers</th></tr></thead><tbody>${cards.map(c=>`<tr><td>${cardLabel(c)}</td><td>${Math.round(c.direct+c.ability)}</td><td>${Math.round(c.dot)}</td><td>${c.kills}</td><td>${c.triggers}</td></tr>`).join('')}</tbody></table></div><h4>Interactions that actually happened</h4><ul class="interaction-list">${interactions.map(interactionRow).join('')||'<li>No connected interactions triggered.</li>'}</ul></details></section>`
}
function receiveFeedback(){if(!battle)return;const now=performance.now();for(const e of battle.feedback||[]){if(e.seq<=feedbackSeen)continue;feedbackSeen=e.seq;if(e.kind==='devour'&&e.t>0&&$('.board')){const v=battle.units.find(u=>u.uid===e.fromUid),a=Game.xy(e.fromSlot),z=Game.xy(e.toSlot);if(v){const ghost=document.createElement('div');ghost.className='devour-ghost';const cell=cardCell(a.x,a.y);ghost.style.cssText=`left:${cell.left}%;top:${cell.top}%;width:${cell.width}%;height:${cell.height}%;--dx:${(z.x-a.x)*100}%;--dy:${(z.y-a.y)*100}%`;ghost.innerHTML=art(CARD[v.id]);$('.board').appendChild(ghost);ghost.addEventListener('animationend',()=>ghost.remove(),{once:true});}}visualEvents.push({...e,expires:now+(e.kind==='devour'?3600:1800)});}visualEvents=visualEvents.filter(e=>e.expires>now).slice(-24);}
function lossNotice(){const lost=(battle.metrics.consumed||[]).filter(c=>!c.token);return lost.length?`<div class="combat-loss"><strong>PERMANENTLY LOST THIS BATTLE</strong>${lost.map(c=>`<span>${CARD[c.id].name} #${c.uid} → ${CARD[c.by].name} #${c.byUid} · +${c.bonus} ATK</span>`).join('')}</div>`:''}
function devourGhosts(){const age=performance.now()-openingAt;if(age>1600)return '';return (battle.metrics.consumed||[]).map(c=>{let a=Game.xy(c.slot),z=Game.xy(c.toSlot);const cell=cardCell(a.x,a.y);return `<div class="devour-ghost" style="left:${cell.left}%;top:${cell.top}%;width:${cell.width}%;height:${cell.height}%;--dx:${(z.x-a.x)*100}%;--dy:${(z.y-a.y)*100}%;animation-delay:-${age}ms">${art(CARD[c.id])}</div>`}).join('')}
function ecosystemPanel(){if(!run.roster.length)return '';const groups=[['Attack loops',['jade','immortal','conduit','cannon','mage','crystal']],['State cycles',['smelter','mantis','plasma','cannon','spirit','wraith','vent','bell','lantern']],['Burn & detonation',['bellows','plasma','behemoth','vent','leech','smelter']],['Critical volleys',['sensor','nanite','railgun','core','asura']],['Bleed & execution',['totem','executioner','reaper','leech','altar']],['Control & spells',['eye','bell','mage','weaver','netrunner','larva','herald']],['Bloodline food chain',['cub','serpentFodder','hound','scuttler','flameToad','peachFodder','broodkeeper','matriarch','altar']],['The Containment Protocol (Arch A)',['investigator','securityCam','radioPA','coroner','decoder','occultDetective','anomalySpecialist','ruleEnforcer','ruleboard','panopticon','redPhone','boneSaw','elevatorKey','ruleArchitect','allSeeingOverseer','curfewDirector','forensicDemiurge','backroomsWarden']],['Autonomous Urban Legends (Arch B)',['kuchisake','scissorBanshee','slitMouthedSovereign','nightBus','ghostRoute','terminusBus','payphone','hauntedSwitchboard','midnightOperator','morgueMirror','doppelMirror','mirrorQueen','mannequin','stalker','livingTaboo','chainLetter','redRaincoat','stair13']],['Cosmic predation',['mass','larva','herald']],['Cultivation & Ascension',['practitioner','lotusRoot','herbGrass','cauldron','flyingSword','guqin','weiqiBoard','inkBrush','mountainScroll','soulBanner','demonBlade','jade','immortal','monk','asura']]];const ids=new Set(run.roster.map(u=>u.id));return `<details class="ecosystem-guide"><summary>Your ecosystem · drafted connections</summary><p class="hint">These are overlapping paths, not classes. Only deployed cards contribute. Mix paths freely; passive support auras do not stack.</p>${groups.filter(([name,list])=>list.some(id=>ids.has(id))).map(([name,list])=>`<p><b>${name}</b><br>${list.filter(id=>ids.has(id)).map(id=>CARD[id].name).join(' · ')}<br><span class="hint">Explore: ${list.filter(id=>!ids.has(id)).map(id=>CARD[id].name).join(', ')||'All pieces drafted'}</span></p>`).join('')}</details>`}
function deckPanel(){return `<section class="panel"><div class="row between"><div><div class="eyebrow">${leader().title}</div><h3>${leader().name.split(',')[0]}</h3></div>${sprite(leader().sprite)}</div><p class="hint">${leader().passive}</p><div class="divider"></div><div class="row between"><b>Your deck · ${run.roster.length}</b>${btn('roster','Inspect','small')}</div>${ecosystemPanel()}<div class="deck-mini">${run.roster.map(u=>`<button data-action="rosterCard" data-id="${u.uid}" title="${CARD[u.id].name}">${art(CARD[u.id])}<span>${Math.round(Game.base(u))}</span></button>`).join('')||'<p class="muted">Your first draft awaits.</p>'}</div><p class="hint">Up to 9 cards are drawn randomly each battle. A small deck is more consistent. Devoured cards are permanently lost from this run.</p>${run.relics.length?`<div class="divider"></div>${run.relics.map(id=>{let r=RELICS.find(r=>r.id===id);return `<div class="relic"><b>${r.name}</b><p>${r.desc}</p></div>`}).join('')}`:''}</section>`}
function draftView(){return `${gamehead()}<section class="draft-intro"><div><div class="eyebrow">${run.draftReason==='first'?'Your first card':'Crossing cleared · choose your reward'}</div><h2>One of three. Your choice.</h2><p class="muted">${run.draftReason==='first'?'Begin with a single attacker. Your leader’s genre gets 1.5× selection weight within each rarity in every draft.':'Recruit one card, skip to keep your deck lean, or spend 10 coins to reroll all three choices.'}</p></div>${run.recap&&run.draftReason==='reward'?`<div class="recap"><b>${run.recap.kills} defeated · ${run.recap.leaks} escaped</b><span>+${run.recap.growth.toFixed(0)} permanent ATK · ${run.recap.triggers} ability triggers</span>${run.recap.relic?`<span>Found ${run.recap.relic}</span>`:''}${run.recap.coinsEarned?`<span>+${run.recap.coinsEarned} coins earned</span>`:''}</div>`:''}</section>${run.draftReason==='reward'?battleReport(run.recap):''}<p class="hint rarity-unlocks">Normal / Rare initially · Epic from crossing 5 · Legendary from crossing 10 · Mythic Apex forms are earned only · Elites improve rarity odds</p><div class="draft-grid">${run.offers.map(id=>cardView(id,'draft')).join('')}</div><div class="actions draft-actions">${run.draftReason!=='first'?btn('skipDraft','Skip · keep deck small'):''}${btn('rerollDraft','Reroll · −10 coins','',' '+((run.coins||0)<10?'disabled':''))}</div><p class="hint center">Each reroll costs 10 coins and can be repeated while you can afford it. Normal battles pay 100 coins, Elites 200, and the Boss 500, even on losses. Skipping grants no additional reward.</p><div class="map-layout below-draft">${mapView(false)}${deckPanel()}</div>`}
function readyPanel(){const n=run.node,p=Game.wavePlan(run),field=battlefield();return `<section class="panel ready-panel"><span class="node-emblem">${NODES[n.type].icon}</span><div class="eyebrow">Crossing ${run.depth+1} · ${NODES[n.type].name}</div><h2>Bring the ecosystem to life.</h2><div class="battlefield-callout"><b>${field.theme} battlefield</b><span>Cards deploy on the center 3×3. Enemies circle the 16-tile outer track.</span></div><p>${NODES[n.type].desc}</p>${encounterPanel(n)}${readinessPanel()}<div class="preview-stats"><span><b>${p.count}</b> runners</span><span><b>${p.hp}</b> base HP</span><span><b>${Math.min(run.roster.length,9)}</b> cards drawn</span></div>${n.type==='boss'?'<p class="health">If the final boss escapes, the run ends.</p><p class="hint">The Unraveler has 11,000 HP and halves slow strength, stun duration, and knockback. After 45 seconds on the track, it moves 25% faster and resists all stuns, freezes, and knockback.</p>':''}<p class="hint">Deploy draws your cards, shuffles them into the nine slots, resolves devours and opening effects, then starts combat immediately.</p>${btn('deploy','Deploy & Start →','primary')}<p class="hint">No manual placement · No energy cost · All attacks have global reach</p>${run.roster.some(u=>['investigator','kuchisake','nightBus','payphone','morgueMirror','mannequin','redRaincoat','stair13','ruleboard'].includes(u.id))?'<p class="health">QUÁI ĐÀM ĐÔ THỊ: Enemies violate track rules as they march, stacking Violation Marks (+8% damage taken). Every 5 marks trigger Blackout (Tắt Đèn), slowing runners and granting Haunted units +40% attack speed and True Form attacks. Night Investigator ascends via recorded Dread; Urban Legends self-ascend via witnessed violations!</p>':''}${run.roster.some(u=>['cub','heir','progenitor','herald','alchemist','harvester'].includes(u.id))?'<p class="health">CONSUMPTION: predators consume only named prey. The Cub&#39;s first meal locks its lineage; all meals grant permanent ATK and matching meals alone grant evolution stacks. Bloodline fodder attacks and breeds at 10% per second when same-species neighbors are orthogonally adjacent. Eating an original permanently deletes it, including a summoning parent. Tokens and originals grant the same predator-defined reward. No eligible prey means no meal.</p>':''}</section>`}
function workshopPanel(){return `<section class="panel ready-panel"><div class="eyebrow">Fate Workshop · crossing ${run.depth+1}</div><h2>Choose a card’s next path.</h2><p>One upgrade costs <b>10 health</b>. Cards with an unearned evolution offer three awakening paths. Other cards offer three permanent upgrades. Pick a card to see the exact choices before spending.</p><div class="rostergrid">${run.roster.map(u=>btn('upgradeCard',`${art(CARD[u.id])}<b>${CARD[u.id].name} #${u.uid}</b><span>${Math.round(Game.base(u))} ATK${u.upgradePath?' · '+u.upgradePath+' path':''}</span>`,'unit-card workshop-card',`data-id="${u.uid}" ${run.health<=10?'disabled':''}`)).join('')}</div>${run.health<=10?'<p>At least 11 health is required to purchase.</p>':''}${btn('safe','Pass · restore 3 health','event-option')}</section>`}
function upgradeChoices(uid){const u=run.roster.find(v=>String(v.uid)===String(uid));if(!u)return;showDialog(`<div class="eyebrow">Fate Workshop · ${run.health} health</div><h2>${CARD[u.id].name}</h2><p>Choose one · costs 10 health · growth and instance identity are retained.</p><div class="stack">${Game.workshopOptions(run,uid).map(o=>btn('upgrade',`<b>${o.name}</b><span>${o.desc}</span>`,'event-option',`data-id="${uid}" data-choice="${o.id}"`)).join('')}</div>`)}
function eventPanel(){const n=run.node;if(n.type==='workshop')return workshopPanel();return `<section class="panel ready-panel"><span class="node-emblem">${NODES[n.type].icon}</span><div class="eyebrow">${NODES[n.type].name}</div><h2>${n.type==='rest'?'A moment to breathe.':n.type==='cache'?'Something survived.':'Every road asks a price.'}</h2><p>${NODES[n.type].desc}</p>${n.type==='rest'?btn('rest','Rest · restore 12 health','primary'):n.type==='cache'?RELICS.filter(r=>!run.relics.includes(r.id)).slice(0,3).map(r=>btn('relic',`<b>${r.name}</b><span>${r.desc}</span>`,'event-option',`data-id="${r.id}"`)).join('')||btn('rest','Vault exhausted · restore 12 health','primary'):`${btn('bargain','Offer 12 health · gain a random relic','event-option',run.health<=12||run.relics.length===RELICS.length?'disabled':'')}${btn('safe','Take the safe road · restore 3 health','event-option')}`}</section>`}
function mapScreen(){return `${gamehead()}<div class="map-layout">${mapView(run.phase==='map')}<aside class="stack">${run.phase==='ready'?readyPanel():run.phase==='event'?eventPanel():`<section class="panel"><div class="eyebrow">Your next decision</div><h3>Choose a gold destination.</h3><p class="hint">Read the branches ahead before you commit. Battles test the deck; sanctuaries and vaults help it recover and grow.</p></section>`}${deckPanel()}</aside></div>`}
function fieldUnit(u){
  const c=CARD[u.id],fav=Game.favored(battle,u),isApex=Game.isApexImmortal(u);
  return `<button class="field-card ${fav?'favored':''} ${isApex?'apex-unit':''} ${u.state!=='active'?'inactive':''} ${String(selected)===String(u.uid)?'selected':''}" style="--realm:${GENRES[c.genre][1]};left:${u.x*100/3}%;top:${u.y*100/3}%" data-action="unit" data-card="${u.id}" data-id="${u.uid}" aria-label="${c.name}, ${Math.round(Game.atk(battle,u))} attack">
    <div class="unit-shadow"></div>
    ${art(c)}
    <span class="field-atk">${Math.round(Game.atk(battle,u))}</span>
  </button>`
}
function board(){const field=battlefield();return `<div class="board" style="--battlefield-image:url('${field.asset}')" role="group" aria-label="Three by three card grid inside a sixteen-tile perimeter"><div class="track-grid" style="${routeGridStyle()}">${Array.from({length:25},(_,i)=>{let x=i%5,y=Math.floor(i/5),idx=Game.ring.findIndex(p=>p[0]===x&&p[1]===y);return `<div class="${idx>=0?'track-tile':'interior-tile'} ${idx===0?'spawn-tile':''}">${idx>=0&&idx!==0&&idx!==15?`<span>${idx<4?'›':idx<8?'⌄':idx<12?'‹':'⌃'}</span>`:''}</div>`}).join('')}</div><div id="field" style="left:${activeFieldGrid().left}%;top:${activeFieldGrid().top}%;width:${activeFieldGrid().width}%;height:${activeFieldGrid().height}%">${battle.units.filter(u=>!u.removed).map(fieldUnit).join('')}</div>${devourGhosts()}<canvas id="arena" width="700" height="700" aria-label="Animated enemy route around the outside of the nine card slots"></canvas></div>`}
function detail(){let u=battle?.units.find(u=>String(u.uid)===String(selected));if(!u)return `<div class="empty-detail"><span class="sigil">✧</span><h3>Watch the connections.</h3><p>Tap any card to inspect its current attack, progress, and ecosystem role.</p><p class="hint">Team effects work across the board. Only explicitly marked abilities depend on neighbors. No card can take damage.</p></div>`;const c=CARD[u.id];return `<div class="unit-title">${art(c)}<div><div class="eyebrow" style="color:${GENRES[c.genre][1]}">${GENRES[c.genre][0]}</div><h3>${c.name}</h3>${rarityBadge(c.id)}${cardTags(c,!!(u.phantom||u.token))}</div></div><div class="unit-stats"><div><b>${Math.round(Game.atk(battle,u))}</b><small>ATTACK</small></div><div><b>${u.attackInterval?(u.attackInterval/Game.speed(battle,u)).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u.permanentAtkBonus}</b><small>${u.phantom?"WAVE BONUS":"PERMANENT"}</small></div></div>${Game.isPractitioner(u)?`<p class="state-text cultivation-realm">${['Qi-Refining','Foundation Establishment','Golden Core','Nascent Soul'][u.realm||0]} · Realm ${u.realm||0}/3 · ${u.qi||0} Qi${u.qi>=175?' · BREAKTHROUGH READY':''}</p>`:''}${u.id==='swordImmortal'?`<p class="state-text cultivation-realm">Post-ascension Qi ${u.swordQi||0}/30 toward the next permanent +2 ATK · lifetime Qi ${u.qi||0}</p>`:''}<p class="state-text">${u.removed?(u.phantom?'Token consumed · parent safe':'Original consumed · permanently lost'):u.overclock?'Overclock · '+u.clockRemaining.toFixed(1)+'s remaining':u.state!=='active'?u.state+' · '+u.stateRemaining.toFixed(1)+'s remaining':'Active'}${u.phantom?' · one-wave token · species: '+CARD[Game.species(u)]?.name:''}${u.id==='catalyst'?' · active path: '+['Might','Flow','Storm'][Math.floor(battle.time/4)%3]:''}</p>${u.threshold.max?`<div class="meter"><i style="width:${u.threshold.current/u.threshold.max*100}%"></i></div><p class="hint">Progress ${Math.floor(u.threshold.current)} / ${u.threshold.max}</p>`:''}${ascensionBarHTML(u)}${evolutionHint(c,u)}${u?`<p class="hint">Workshop: ${u.upgradePath||"no awakening path"} · +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}${u.upgradePath==="storm"?" · Every sixth attack: three-target true-damage burst equal to unbuffed ATK.":""}</p>`:""}<div class="eyebrow">Rules</div><div class="ability">${c.rules}</div>${c.rules.includes('Team Power')?`<p class="hint">Current Team Power: <b>${Game.teamPower(battle).toFixed(1)}</b> · permanent ATK on deployed originals, including this card.</p>`:''}<div class="spatial ${Game.favored(battle,u)?'on':''}">Works well with<p>${c.synergy}</p></div><p class="hint">${Math.round(Game.crit(battle,u)*100)}% critical chance · ${Math.round((2+Game.sensor(battle,u)*.3+Game.mod(run,'critDamage',0))*100)}% critical damage</p>${c.fav==='neighbor'?`<p class="hint">Neighbors: ${Game.neighbors(battle,u).map(v=>CARD[v.id].name).join(', ')||'none'}</p>`:''}`}
function combat(){return `${gamehead()}<div class="combat-layout"><section class="panel arena-panel"><div class="combat-toolbar"><div class="row">${btn('pause',paused?'▶ Resume':'Ⅱ Pause','small','id="pauseBtn"')}${[1,2,4].map(n=>btn('speed',n+'×',`small ${speed===n?'chosen':''}`,`data-id="${n}"`)).join('')}</div><div class="row">${btn('route','Map','small')}</div></div>${board()}<div id="loss-strip">${lossNotice()}</div></section></div>`}
function end(){return `${gamehead()}<section class="stage center"><div class="eyebrow">${run.phase==='won'?'The road holds':'The crossing falls'}</div><h1>${run.phase==='won'?'Worlds, united.':'A thread remains.'}</h1><p class="muted" style="margin-top:20px">Your next deck will tell a different story.</p><div class="summary-grid"><div><b>${run.cleared}</b><small>Battles cleared</small></div><div><b>${run.stats.kills}</b><small>Runners defeated</small></div><div><b>+${Math.round(run.stats.growth)}</b><small>ATK grown in combat</small></div><div><b>${run.coins||0}</b><small>Coins remaining</small></div></div><p>${run.earned||0} legacy shards earned.</p><div class="actions">${btn('home','Choose a new leader','primary')}${btn('legacy','Legacy')}</div></section>${battleReport(run.recap)}`}
function codex(){return `<section class="stage"><div class="eyebrow">${CARDS.filter(c=>!c.retired).length} draftable cards · ${FORMS.length} evolutions · Nine genres</div><h1>The fellowship.</h1><p class="muted" style="margin-top:15px">Mix attack loops, Burn, Bleed, tokens, sacrifice, critical hits, and control. Evolved forms are earned in combat or awakened at Fate Workshops, never drafted.</p><div class="filterbar">${btn('filter','All '+(CARDS.filter(c=>!c.retired).length+FORMS.length),filter==='all'?'active':'','data-id="all"')}${Object.entries(GENRES).map(([k,v])=>btn('filter',v[0],filter===k?'active':'',`data-id="${k}"`)).join('')}</div><div class="codex-grid">${[...CARDS.filter(c=>!c.retired),...FORMS].filter(c=>filter==='all'||c.genre===filter).map(c=>cardView(c.id)).join('')}</div></section>`}
function legacy(){return `<section class="stage center"><div class="eyebrow">Between crossings</div><h1>A lasting legacy.</h1><p class="muted" style="margin-top:18px">Permanent player bonuses support every genre. Cards grow automatically during combat.</p><div class="score">${meta.shards||0}</div><span class="muted">LEGACY SHARDS</span><div class="meta-grid"><div class="meta-card"><h3>Enduring thread</h3><p>+5 starting maximum health per level.</p>${btn('meta',`Improve · ${5+(meta.vitality||0)*5} shards`,'',`data-id="vitality" ${(meta.shards||0)<5+(meta.vitality||0)*5?'disabled':''}`)}<p>Level ${meta.vitality||0}</p></div><div class="meta-card"><h3>Shared strength</h3><p>+2% damage for every card per level.</p>${btn('meta',`Improve · ${5+(meta.power||0)*5} shards`,'',`data-id="power" ${(meta.shards||0)<5+(meta.power||0)*5?'disabled':''}`)}<p>Level ${meta.power||0}</p></div></div><p class="muted">${meta.runs||0} completed runs · ${meta.wins||0} victories</p></section>`}
function render(){document.body.classList.toggle('in-combat',screen==='game'&&run?.phase==='combat');document.body.classList.toggle('has-dock',screen!=='home');app.innerHTML=`<div class="shell">${header()}${screen==='home'?home():screen==='codex'?codex():screen==='legacy'?legacy():!run?home():run.phase==='combat'?combat():run.phase==='draft'?draftView():['won','lost'].includes(run.phase)?end():mapScreen()}</div>${bottomDock()}`;if(battle&&screen==='game'&&run.phase==='combat')draw();}
function showDialog(html,live=false){if(battle&&!battle.done&&!live){paused=true;let p=$('#pauseBtn');if(p)p.textContent='▶ Resume'}if(modal.open)modal.close();modal.dataset.live=live?'true':'false';modal.innerHTML=btn('close','×','close','aria-label="Close dialog"')+(live&&battle&&!battle.done?'<p class="live-warning">● COMBAT CONTINUES · close this window to return to the battlefield</p>':'')+html;modal.showModal()}
modal.addEventListener('close',()=>{if(!modal.open){selected=null;modal.dataset.live='false'}});

function info(id,u=null){const c=CARD[id];showDialog(`<div class="unit-title">${art(c)}<div><div class="eyebrow">${GENRES[c.genre][0]}</div><h2>${getUnitTitles(c,u).name}</h2>${rarityBadge(id)}${cardTags(c)}<p>${getUnitTitles(c,u).vn}</p></div></div><div class="unit-stats"><div><b>${u?Math.round(Game.base(u)):c.baseAtk}</b><small>ATK</small></div><div><b>${c.attackInterval?(c.attackInterval/(1+(u?.permanentSpeed||0))).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u?.permanentAtkBonus||0}</b><small>PERMANENT</small></div></div><div class="eyebrow">Rules</div><p>${c.rules}</p>${evolutionHint(c,u)}${u?`<p class="hint">Workshop: ${u.upgradePath||"no awakening path"} · +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}${u.upgradePath==="storm"?" · Every sixth attack: three-target true-damage burst equal to unbuffed ATK.":""}</p>`:""}<div class="eyebrow">${c.ecosystem}</div><div class="spatial"><b>Works well with</b><p>${c.synergy}</p></div><p class="hint">Team Power is the total permanent ATK bonus on deployed originals, including the caster; reserves, consumed cards, and tokens are excluded. Unbuffed ATK excludes damage multipliers. All attacking cards have global reach. Ability charge affects Jade, Conduit, Archmage, Weaver, Lantern, Eye, and Core; it never advances shutdown attack counts, maturity, or evolution witnesses. Consumed originals are permanently lost. Consumed tokens leave their parents safe. The predator defines the meal reward; token and original meals grant the same reward. Permanent ATK lasts for this run.</p>`,true)}
function help(){showDialog(`<div class="eyebrow">How to play</div><h2>Build the deck. Trust the draw.</h2><ol><li>Choose a genre-themed leader with a universal benefit and drawback, then choose <b>one of three starting attackers</b>. The leader’s genre gets 1.5× selection weight inside each rarity in every draft.</li><li>Inspect the entire branching map. Pick a connected gold destination.</li><li><b>Deploy & Start</b> draws up to nine cards and randomly assigns them to the 3×3 grid. Opening effects resolve and the battle begins immediately.</li><li>Enemies walk clockwise around the <b>16 outer tiles</b>. They cannot attack your cards. Runners completing the loop damage you and disappear.</li><li>All cards attack globally. Most synergies work across the deployed team. Predation, token spawns, Altar, Netrunner, and Shoggoth use the neighbor rules printed on their cards. There are no center, corner, edge, or alignment bonuses.</li><li>Cards grow, transform, and trigger automatically <b>during combat</b>. Coins are earned from battles and spent on draft rerolls. Fate Workshops offer optional upgrades and evolution paths.</li><li>After every successful stage, choose <b>one of three cards</b>, skip for no extra reward, or reroll all three for 10 coins per reroll. The first card is mandatory. Normal and Rare cards appear initially, Epic from crossing 5, and Legendary from crossing 10; Mythic Apex forms are earned, not drafted. Elite rewards improve high-rarity chances. A roster over nine cards makes each draw less predictable.</li></ol><p>Predators have named diets within their genre. A token’s ancestry determines its species and genre; being a token alone never makes it edible. Consumed originals—including eligible high-rarity Fodder—are permanently lost. Tokens do not delete their parents. Predators prioritize eligible adjacent tokens, then the weakest eligible original. Each predator defines its fixed meal reward, identical for tokens and originals. Lotus refinement resets maturity without removing the root. Herb offers itself after 18 seconds only when another original Cultivation attacker can receive it. Empty slots stay empty unless an explicit summon fills them. Parents summon before opening consumption. Lotus and Lamb attempt their printed extra token on their own timers; Crimson Hound does not summon. Each breeding original or token checks every second: with at least one orthogonal same-species neighbor, roll one 10% birth chance into a free orthogonal slot. A birth is a temporary copy of its parent fodder species, not a separate offspring species. No offspring cap. Tokens snapshot unbuffed ATK and attack interval at birth, inherit species attack and breeding traits, and never inherit growth engines or evolve. Veil Medium echoes never resurrect deleted roster cards. There are no attachments or automatic reserve replacements. Phantoms do not join the deck. The final boss halves crowd control and enrages after 45 seconds, so control alone cannot hold it indefinitely. Permanent ATK and trigger-gauge progress last for the run; temporary buffs and attack-cycle counters reset between battles.</p><p>Card values are shown before leader modifiers. Permanent ATK growth and Burn/Bleed stack counts have no numerical limits. Team Power means the sum of permanent ATK bonuses on deployed original cards, including the caster; consumed cards, reserves, and tokens are excluded. Unbuffed ATK means base ATK plus permanent ATK and any Shoggoth mimic bonus. Ability damage can crit unless marked true damage or a detonation. True damage ignores armor. Other damage remains affected by armor, critical hits, leader damage, and Vulnerable as applicable. Base critical chance: 10%. Critical strikes deal 200% damage. Bleed stacks last 4 seconds. Vents freeze the two leading runners every 8 seconds. Every Burn and Bleed stack expires independently; effects are not permanent. Slows use the strongest active slow rather than adding together. Vulnerable uses the most recently applied value. Original cards can evolve during combat; their new form and accumulated growth persist for the run. Cauldron elixirs have an 8s cooldown and cannot trigger themselves. Growth has no battle cap. Summoning has no per-parent or battle count cap. Each ability retains its stated timing, and requires an empty slot. Normal/Rare cards build permanent power early; late-tier cards use that accumulated power. Herald feeding is a lore-based late growth exception, and evolved forms retain their growth engines. Duplicate passive support auras do not stack. Downtime cannot fall below 0.5 seconds.</p><p>Progress saves between decisions. Reloading during combat returns to the pre-deployment checkpoint. Card information opens in a centered modal while combat continues. Map, Deck, and Help menus pause combat; use Resume to continue.</p>`)}
function award(){if(run.claimed)return;run.claimed=true;run.earned=Math.max(1,run.cleared*2+(run.phase==='won'?15:0));meta.shards=(meta.shards||0)+run.earned;meta.runs=(meta.runs||0)+1;if(run.phase==='won')meta.wins=(meta.wins||0)+1;save()}
function startLeader(id){run=Game.newRun(id,meta);battle=null;selected=null;screen='game';paused=false;save();render();window.scrollTo(0,0)}
document.addEventListener('click',e=>{let el=e.target.closest('[data-action]');if(!el)return;let a=el.dataset.action,id=el.dataset.id;
 if(a==='close'){modal.close();return}
 if(a==='home'||a==='codex'||a==='legacy'){if(battle&&!battle.done)paused=true;screen=a;render();window.scrollTo(0,0);return}
 if(a==='help'){help();return}
 if(a==='filter'){filter=id;render();return}
 if(a==='inspectCard'){info(id);return}
 if(a==='leader'){if(run&&!['won','lost'].includes(run.phase))showDialog(`<h2>Begin a new crossing?</h2><p>This replaces your current run. Your legacy remains.</p>${btn('confirmLeader','Begin new run','primary',`data-id="${id}"`)}`);else startLeader(id);return}
 if(a==='confirmLeader'){modal.close();startLeader(id);return}
 if(a==='journey'||a==='resume'){screen=run?'game':'home';render();window.scrollTo(0,0);return}
 if(a==='draftTab'){if(run?.phase==='draft'){screen='game';render()}else toast('Draft reward opens after clearing a battle!');return}
 if(a==='meta'){let cost=5+(meta[id]||0)*5;if(['vitality','power'].includes(id)&&meta.shards>=cost){meta.shards-=cost;meta[id]=(meta[id]||0)+1;save();render()}return}
 if(!run)return;
 if(a==='upgradeCard'&&run.phase==='event'&&run.node.type==='workshop'){upgradeChoices(id);return}
 if(a==='upgrade'){if(Game.upgrade(run,id,el.dataset.choice)){modal.close();save();render();toast('Upgrade applied · 10 health spent')}return}
 if(a==='skipDraft'){if(Game.skipDraft(run)){battle=null;selected=null;if(run.phase==='won')award();save();render();window.scrollTo(0,0)}return}
 if(a==='rerollDraft'){if(Game.rerollDraft(run)){save();render();toast('Three new options · 10 coins spent')}return}
 if(a==='draft'){if(Game.draft(run,id)){battle=null;selected=null;if(run.phase==='won')award();save();render();window.scrollTo(0,0)}return}
 if(a==='node'){if(Game.chooseNode(run,id)){save();render();if(innerWidth<760)document.querySelector('.ready-panel')?.scrollIntoView({behavior:'smooth',block:'start'})}return}
 if(a==='nodeInfo'){let n=run.map.flat().find(n=>n.id===id);showDialog(`<div class="eyebrow">Stage ${n.row+1}</div><h2>${NODES[n.type].name}</h2><p>${NODES[n.type].desc}</p>${encounterPanel(n)}<p class="hint">${run.visited.includes(id)?'You visited this destination.':'Follow connected routes to reach this destination.'}</p>`);return}
 if(a==='deploy'&&run.phase==='ready'){save();battle=Game.deploy(run);openingAt=performance.now();feedbackSeen=0;visualEvents=[];receiveFeedback();selected=null;paused=false;screen='game';render();window.scrollTo(0,0);return}
 if(a==='pause'){paused=!paused;el.textContent=paused?'▶ Resume':'Ⅱ Pause';return}
 if(a==='speed'){speed=Number(id);document.querySelectorAll('[data-action="speed"]').forEach(b=>b.classList.toggle('chosen',Number(b.dataset.id)===speed));return}
 if(a==='unit'){selected=id;showDialog('<div id="live-card-detail">'+detail()+'</div>',true);return}
 if(a==='route'){showDialog(mapView(false));return}
 if(a==='roster'){showDialog(`<div class="eyebrow">Active deck · ${run.roster.length} cards</div><h2>Your fellowship.</h2><p>Up to nine are randomly drawn each battle. Visit a Fate Workshop to upgrade a card.</p><div class="rostergrid">${run.roster.map(u=>`<button class="unit-card" data-action="rosterCard" data-id="${u.uid}">${art(CARD[u.id])}<h3>${CARD[u.id].name}</h3><p>${Math.round(Game.base(u))} ATK · +${u.permanentAtkBonus} permanent growth</p></button>`).join('')}</div>`);return}
 if(a==='rosterCard'){let u=run.roster.find(u=>String(u.uid)===id);if(modal.open)modal.close();info(u.id,u);return}
 if(run.phase==='event'&&['rest','relic','bargain','safe'].includes(a)){if(a==='rest')run.health=Math.min(run.maxHealth,run.health+12);if(a==='safe')run.health=Math.min(run.maxHealth,run.health+3);if(a==='relic')Game.addRelic(run,id);if(a==='bargain'){if(run.health<=12)return;run.health-=12;let opts=RELICS.filter(r=>!run.relics.includes(r.id));if(opts.length){let r=opts[Math.floor(Game.rand(run)*opts.length)];Game.addRelic(run,r.id);toast(`Found ${r.name}`)}}run.recap=null;Game.reward(run);save();render();window.scrollTo(0,0)}
});
function draw(){let canvas=$('#arena');if(!canvas||!battle)return;let ctx=canvas.getContext('2d'),size=700,unit=size/5;ctx.clearRect(0,0,size,size);const pos=e=>{let p=Game.track(e.p);return routePoint(p.x,p.y,size)};
 for(const e of battle.enemies){let p=pos(e),r=e.boss?20:e.champion?18:e.elite?15:11,color=e.frozenUntil>battle.time?'#a8e9fa':e.boss?'#ee8295':e.champion?'#d6a5ef':e.armored?'#c4ac87':e.swift?'#d6cd91':'#b0b7a3';ctx.save();ctx.translate(p.x,p.y);const spriteIndex=e.boss||e.champion?41:e.swift?40:39,sw=unitAtlas.naturalWidth/6,sh=unitAtlas.naturalHeight/7,scale=e.boss?58:e.champion?48:e.elite?40:34;
 ctx.fillStyle='#131a1480';ctx.beginPath();ctx.ellipse(0,2,scale*.32,scale*.13,0,0,Math.PI*2);ctx.fill();
 if(unitAtlas.complete&&sw){ctx.globalAlpha=e.frozenUntil>battle.time?.65:1;ctx.drawImage(unitAtlas,(spriteIndex%6)*sw,Math.floor(spriteIndex/6)*sh,sw,sh,-scale/2,-scale+Math.sin(battle.time*7+e.uid)*1.6,scale,scale);ctx.globalAlpha=1;}else{ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}
 if(e.armored){ctx.strokeStyle='#e3c58c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,6,scale*.35,0,Math.PI*2);ctx.stroke();}
 const barWidth=scale*.82;ctx.fillStyle='#281e21';ctx.fillRect(-barWidth/2,-scale-7,barWidth,5);ctx.fillStyle=e.boss?'#ec858d':'#aac998';ctx.fillRect(-barWidth/2,-scale-7,barWidth*Math.max(0,e.hp/e.maxHp),5);if(e.bleeds.length){ctx.fillStyle='#ff8290';ctx.fillRect(r+3,-scale-9,4,7)}if(e.burns?.length){ctx.fillStyle='#ffad55';ctx.fillRect(-r-7,-scale-9,5,9);ctx.font='10px system-ui';ctx.fillText(e.burns.length,-r-9,-scale-11)}ctx.restore()}
 const seen=new Set();for(const e of visualEvents){if(e.expires<performance.now()||e.fromSlot==null||e.toSlot==null||e.fromSlot===e.toSlot)continue;const key=e.fromSlot+':'+e.toSlot;if(seen.has(key))continue;seen.add(key);const a=Game.xy(e.fromSlot),z=Game.xy(e.toSlot),from=cardCellCenter(a.x,a.y,size),to=cardCellCenter(z.x,z.y,size),x=from.x,y=from.y,tx=to.x,ty=to.y;ctx.globalAlpha=Math.min(.8,(e.expires-performance.now())/900);ctx.strokeStyle=e.kind==='devour'?'#f293a0':'#d9e9ae';ctx.lineWidth=4;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(tx,ty,unit*.35,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
 for(const f of battle.effects){let from=routePoint(f.x,f.y,size),to=routePoint(f.tx,f.ty,size),x=from.x,y=from.y,tx=to.x,ty=to.y;ctx.globalAlpha=Math.min(1,f.ttl*2);if(['shot','spell','beam'].includes(f.type)){ctx.strokeStyle=f.type==='spell'?'#bea7f0':f.type==='beam'?'#9bedff':'#dfcc89';ctx.lineWidth=f.type==='beam'?8:2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke()}if(f.text){const breakthrough=['FOUNDATION ESTABLISHMENT','GOLDEN CORE','NASCENT SOUL'].includes(String(f.text).toUpperCase());ctx.font=breakthrough?'bold 9px system-ui':'bold 16px system-ui';ctx.textAlign='center';ctx.fillStyle=f.type==='growth'?'#b4f3ae':'#e6d4a4';ctx.fillText(f.text,Number.isFinite(x)?x:tx,(Number.isFinite(y)?y:ty)-(breakthrough?52:30)-(1-f.ttl)*25)}}ctx.globalAlpha=1;
}
function liveUI(){if(!$('#field'))return;receiveFeedback();for(const u of battle.units.filter(u=>!u.removed)){
 let el=document.querySelector('#field [data-id="'+u.uid+'"]');if(!el){$('#field').insertAdjacentHTML('beforeend',fieldUnit(u));el=document.querySelector('#field [data-id="'+u.uid+'"]');}else if(el.dataset.card!==u.id){el.outerHTML=fieldUnit(u);el=document.querySelector('#field [data-id="'+u.uid+'"]');}
 const active=visualEvents.filter(e=>e.expires>performance.now());el.classList.toggle('combo-source',active.some(e=>String(e.fromUid)===String(u.uid)));el.classList.toggle('combo-target',active.some(e=>String(e.toUid)===String(u.uid)));
 el.classList.toggle('selected',String(selected)===String(u.uid));el.classList.toggle('inactive',u.state!=='active');
 el.setAttribute('aria-label',CARD[u.id].name+', '+Math.round(Game.atk(battle,u))+' attack');
 el.querySelector('.field-atk').textContent=Math.round(Game.atk(battle,u));
 }const hpHTML=`${Math.ceil(run.health)}<span>/${run.maxHealth}</span>`;document.querySelectorAll('#hp,.stat-hp').forEach(el=>el.innerHTML=hpHTML);document.querySelectorAll('#coin-count,.stat-coin').forEach(el=>el.textContent=run.coins||0);const deckStat=document.querySelector('.stats .stat:nth-child(3) b');if(deckStat)deckStat.innerHTML=run.roster.length+'<span> cards</span>';if(modal.open&&modal.dataset.live==='true'&&$('#live-card-detail'))$('#live-card-detail').innerHTML=detail();$('#loss-strip').innerHTML=lossNotice();for(const u of battle.units.filter(u=>u.removed))document.querySelector('#field [data-id="'+u.uid+'"]')?.remove();}
function frame(ts){let dt=Math.min(.1,(ts-last)/1000||0);last=ts;if(battle&&!battle.done&&!paused&&screen==='game'&&(!modal.open||modal.dataset.live==='true')){let left=dt*speed;while(left>0&&!battle.done){let step=Math.min(1/30,left);Game.step(battle,step);left-=step}if(battle.done){if(modal.open)modal.close();selected=null;if(run.phase==='lost')award();save();render();window.scrollTo(0,0)}}if(battle&&screen==='game'&&run.phase==='combat'){draw();uiClock+=dt;if(uiClock>.15){liveUI();uiClock=0}}requestAnimationFrame(frame)}
render();requestAnimationFrame(frame);
