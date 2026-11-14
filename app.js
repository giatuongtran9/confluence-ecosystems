'use strict';

const isCultivator = u => Game.isPractitioner(u) || (Game.isApexImmortal(u) && Game.family(u) === 'practitioner');
function ascensionBarHTML(u){
 if(Game.isIdol(u))return `<div class="ascension-bar-box"><div class="ascension-bar-header"><span>Forbidden Seals</span><b>${CARD[u.id].name}</b></div><div class="ascension-bar-track"><i style="width:${Math.min(100,(u.syllables||0)/154*100)}%"></i></div><div class="ascension-bar-meta"><span>${u.syllables||0} /154 Syllables</span><span>${Game.cosmicApex(u)?'Cổ Thần awakened':'25 /65 /154 · Elite/Boss trial · No Crossing gate'}</span></div></div>`;

 if(Game.isCyber(u))return `<div class="ascension-bar-box"><div class="ascension-bar-header"><span>Chrome Tolerance</span><b>${CARD[u.id].name}</b></div><div class="ascension-bar-track"><i style="width:${Math.min(100,(u.chrome||0)/120*100)}%"></i></div><div class="ascension-bar-meta"><span>${u.chrome||0} /120 Chrome</span><span>${Game.cyberApex(u)?'Hybrid awakened':'25 /65 /120 · OS proof + Elite/Boss zero-leak trial'}</span></div></div>`;

 if(Game.isApprentice(u)){const pair=Game.bestPair(u),p=u.synthesis?.[pair]||0;return `<div class="ascension-bar-box"><div class="ascension-bar-header"><span>Elemental Synthesis</span><b>${pair.split('+').join(' + ')}</b></div><div class="ascension-bar-track"><i style="width:${Math.min(100,p/30*100)}%"></i></div><div class="ascension-bar-meta"><span>${p} / 30 pair points</span><span>${Game.isArchon(u)?'Archon awakened':'Milestones 10 / 20 / 30 · then Loom + Elite/Boss trial'}</span></div></div>`;}

  if(Game.isSlayer(u))return `<div class="ascension-bar-box"><div class="ascension-bar-header"><span>Slayer’s Path</span><b>${CARD[u.id].name}</b></div><div class="ascension-bar-track"><i style="width:${Math.min(100,u.trophyPoints||0)}%"></i></div><div class="ascension-bar-meta"><span>${u.trophyPoints||0} / 100 Trophy Points</span><span>${Game.HUNT_APEX.includes(u.id)?'Mythic awakened':'Milestones 25 / 60 / 100 · Elite/Boss zero-leak relic trial'}</span></div></div>`;

  if(isCultivator(u)) {
    const qi = u.qi || 0, isApex = Game.isApexImmortal(u), isPractitioner = Game.isPractitioner(u);
    const realm = u.realm || 0;
    const realmName = isApex ? 'Apex Immortal (Ascended)' : ['Qi-Refining (Luyện Khí)','Foundation (Trúc Cơ)','Golden Core (Kim Đan)','Nascent Soul (Nguyên Anh)'][realm];
    const gates = [30,85,175], nextGate = isPractitioner && realm < 3 ? gates[realm] : isPractitioner ? 200 : null;
    const progressPercent = isApex ? ((u.apexQi??u.swordQi??0)/30)*100 : nextGate ? Math.min(100, Math.round((qi / nextGate) * 100)) : 100;
    const pills = Game.breakthroughPills?.(battle) ?? 0;
    const gateText = isApex ? 'Every 30 post-ascension Qi: +2 ATK · Qi above 175: +0.15 ATK/Qi' : isPractitioner ? (realm < 3 ? `${qi} / ${nextGate} Qi · Pill needed at gate · Cauldron stock ${pills}/3` : `${qi} / 200 Qi · adjacent relic + Elite/Boss starts trial`) : 'Cultivation support';
    return `<div class="ascension-bar-box">
      <div class="ascension-bar-header"><span>Cultivation Realm</span><b>${realmName}</b></div>
      <div class="ascension-bar-track"><i style="width:${progressPercent}%"></i></div>
      <div class="ascension-bar-meta"><span>${isApex?(u.apexQi??u.swordQi??0)+' / 30 new Qi':qi+' Qi'}</span><span>${gateText}</span></div>
    </div>`;
  }

  const archAApexes = ['ruleArchitect', 'allSeeingOverseer', 'curfewDirector', 'forensicDemiurge', 'backroomsWarden'];
  if(Game.isUrbanInvestigator && (Game.isUrbanInvestigator(u) || archAApexes.includes(u.id))) {
    const dread = u.dread || 0, isApex = archAApexes.includes(u.id);
    const realmName = isApex ? `${CARD[u.id].name} (Mythic)` : ['Investigator (Tập Sự)','Occult Detective (Thần Thám)','Anomaly Specialist (Chuyên Viên)','Rule Enforcer (Chấp Pháp)'][u.realm||0];
    const progressPercent = isApex ? ((u.apexDread||0)/30)*100 : Math.min(100, Math.round((dread / 140) * 100));
    return `<div class="ascension-bar-box">
      <div class="ascension-bar-header"><span>Containment Protocol</span><b>${realmName}</b></div>
      <div class="ascension-bar-track"><i style="width:${progressPercent}%;background:#aab9ec"></i></div>
      <div class="ascension-bar-meta"><span>${isApex?(u.apexDread||0)+' / 30 new Dread':dread+' / 140 Dread'}</span><span>${isApex?'Next reward: +2 permanent ATK':u.realm===3?'Ready to bind Cursed Relic':'Process Incident Dossiers'}</span></div>
    </div>`;
  }
  const archBApexes = ['slitMouthedSovereign', 'terminusBus', 'midnightOperator', 'mirrorQueen', 'livingTaboo', 'penroseLabyrinth', 'crimsonHarbinger'];
  if(Game.isUrbanLegend && (Game.isUrbanLegend(u) || archBApexes.includes(u.id))) {
    const v = Math.round((u.violations || 0)*100)/100, isApex = archBApexes.includes(u.id);
    const progressPercent = isApex ? 100 : Math.min(100, Math.round((v / 80) * 100));
    return `<div class="ascension-bar-box">
      <div class="ascension-bar-header"><span>Autonomous Urban Legend</span><b>${isApex?'Mythic Urban Apex':v>=15?'Ascended Legend':'Urban Legend'}</b></div>
      <div class="ascension-bar-track"><i style="width:${progressPercent}%;background:#c084fc"></i></div>
      <div class="ascension-bar-meta"><span>${isApex?'Mythic Power Active':v+' / 80 Mythic readiness'}</span><span>${isApex?'Rule Resonance Active':v>=80?'Trial needs adjacent same-lineage Legend (45+)':'Epic at 15 · Mythic trial at 80'}</span></div>
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
    <button class="dock-tab ${screen==='lab'?'active':''}" data-action="labOpen">
      <span class="dock-icon">🧪</span>
      <span class="dock-label">Lab</span>
    </button>
  </nav>`;
}
const $=s=>document.querySelector(s),app=$('#app'),modal=$('#modal');
const RUN_KEY='confluence-run-v5';
function read(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}
// Saves from earlier versions are incompatible; discard them once.
let resetSavedRuns=false;
try{
 const oldKeys=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(key=>key&&key!==RUN_KEY&&/^confluence-(run|meta|save-reset)-/.test(key));
 resetSavedRuns=oldKeys.some(key=>key.startsWith('confluence-run-'));
 for(const key of oldKeys)localStorage.removeItem(key);
}catch{}
let run=read(RUN_KEY,null),screen='home',battle=null,selected=null,paused=false,speed=1,last=0,uiClock=0,filter='all';
if(run?.version!==5){run=null;try{localStorage.removeItem(RUN_KEY)}catch{}}

let feedbackSeen=0,visualEvents=[],openingAt=0;
const rarityBadge=id=>`<span class="rarity rarity-${CARD[id].rarity.toLowerCase()}">${CARD[id].rarity}</span>`;
const cardLabel=c=>CARD[c.id].name+(c.phantom?' (phantom)':' #'+c.uid);
const nodeLabel=n=>{const encounter=Game.encounterFor(n);return encounter?(Game.trialFor(n)?'Trial · ':'')+(n.type==='elite'?'Warden · ':'')+({packs:'Swarm',armor:'Armor',fast:'Rush'}[encounter.id]):NODES[n.type].name;};
function save(){try{if(run&&run.phase!=='combat')localStorage.setItem(RUN_KEY,JSON.stringify(run))}catch{toast('Browser storage is unavailable. Keep this tab open to preserve this run.')}}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
const btn=(a,t,c='',extra='')=>`<button data-action="${a}" class="${c}" ${extra}>${t}</button>`;
function sprite(i){return `<span class="sprite" aria-hidden="true" style="background-position:${i%4*100/3}% ${Math.floor(i/4)*100/3}%"></span>`}
const modelIds=['cultivationBase','herbGrass','hauntedBase','hauntedRelic','atlasCaster','hound','atlasArcaneConduit','atlasArcaneMage','atlasMachineA','smelter','sensor','railgun','atlasCyberMantis','vent','totem','executioner','eye','mass','lotusRoot','cauldron','hauntedRelic','hauntedInvestigator','atlasCreature','altar','atlasArcaneCrystal','atlasArcaneWeaver','atlasMachineB','atlasMachineC','nanite','core','atlasCyberNetrunner','atlasCyberPlasma','leech','atlasScythe','larva','herald','cultivationBase','lotusBlossom',null];
const unitAtlas=new Image();unitAtlas.src='assets/units-realistic.png';
const cultivationRealmSprites={lotusBlossom:'assets/cultivation-sprites-webp/spirit-lotus.webp',practitioner:'assets/cultivation-sprites-webp/qi-refining-practitioner.webp',cultivationFoundation:'assets/cultivation-sprites-webp/foundation-practitioner.webp',cultivationGoldenCore:'assets/cultivation-sprites-webp/golden-core-daoist.webp',cultivationNascentSoul:'assets/cultivation-sprites-webp/nascent-soul-sovereign.webp',lotusRoot:'assets/cultivation-sprites-webp/spirit-lotus.webp',herbGrass:'assets/cultivation-sprites-webp/cloud-mist-spirit-grass.webp',cauldron:'assets/cultivation-sprites-webp/nine-turn-alchemy-cauldron.webp',flyingSword:'assets/cultivation-sprites-webp/ancient-flying-sword.webp',guqin:'assets/cultivation-sprites-webp/celestial-guqin.webp',weiqiBoard:'assets/cultivation-sprites-webp/star-river-weiqi-board.webp',swordImmortal:'assets/cultivation-sprites-webp/sword-immortal.webp',melodicSaint:'assets/cultivation-sprites-webp/melodic-saint.webp',formationMaster:'assets/cultivation-sprites-webp/formation-master.webp',talismanSovereign:'assets/cultivation-sprites-webp/talisman-sovereign.webp',landscapeSage:'assets/cultivation-sprites-webp/landscape-sage.webp',soulReapingDemon:'assets/cultivation-sprites-webp/soul-reaping-heavenly-demon.webp',bloodFiendMaster:'assets/cultivation-sprites-webp/blood-fiend-sword-master.webp',inkBrush:'assets/cultivation-sprites-webp/dragon-tail-ink-brush.webp?v=20261104-1',mountainScroll:'assets/cultivation-sprites-webp/mountain-river-scroll.webp',soulBanner:'assets/cultivation-sprites-webp/soul-banner.webp',demonBlade:'assets/cultivation-sprites-webp/demon-blade.webp'};
const bloodlineSprites={
  cub:'assets/bloodline-sprites-webp/primordial-blood-cub.webp',
  serpentFodder:'assets/bloodline-sprites-webp/horned-serpent.webp',
  hound:'assets/bloodline-sprites-webp/crimson-hound.webp',
  houndToken:'assets/bloodline-sprites-webp/crimson-hound.webp',
  scuttler:'assets/bloodline-sprites-webp/iron-scuttler.webp',
  flameToad:'assets/bloodline-sprites-webp/flame-toad.webp',
  peachFodder:'assets/bloodline-sprites-webp/spirit-peach-fodder.webp',
  dragonPearl:'assets/bloodline-sprites-webp/dragon-pearl.webp',
  tigerSeal:'assets/bloodline-sprites-webp/slaughter-tiger-seal.webp',
  earthTablet:'assets/bloodline-sprites-webp/heavy-earth-tablet.webp',
  phoenixTree:'assets/bloodline-sprites-webp/phoenix-flame-tree.webp',
  goldenStaff:'assets/bloodline-sprites-webp/golden-hooped-staff.webp',
  dragonCubT1:'assets/bloodline-sprites-webp/dragon-cub-t1.webp',
  dragonCubT2:'assets/bloodline-sprites-webp/dragon-cub-t2.webp',
  dragonCubT3:'assets/bloodline-sprites-webp/dragon-cub-t3.webp',
  dragonCubApex:'assets/bloodline-sprites-webp/dragon-cub-apex.webp',
  tigerCubT1:'assets/bloodline-sprites-webp/tiger-cub-t1.webp',
  tigerCubT2:'assets/bloodline-sprites-webp/tiger-cub-t2.webp',
  tigerCubT3:'assets/bloodline-sprites-webp/tiger-cub-t3.webp',
  tigerCubApex:'assets/bloodline-sprites-webp/tiger-cub-apex.webp',
  xuanwuCubT1:'assets/bloodline-sprites-webp/xuanwu-cub-t1.webp',
  xuanwuCubT2:'assets/bloodline-sprites-webp/xuanwu-cub-t2.webp',
  xuanwuCubT3:'assets/bloodline-sprites-webp/xuanwu-cub-t3.webp',
  xuanwuCubApex:'assets/bloodline-sprites-webp/xuanwu-cub-apex.webp',
  phoenixCubT1:'assets/bloodline-sprites-webp/phoenix-cub-t1.webp',
  phoenixCubT2:'assets/bloodline-sprites-webp/phoenix-cub-t2.webp',
  phoenixCubT3:'assets/bloodline-sprites-webp/phoenix-cub-t3.webp',
  phoenixCubApex:'assets/bloodline-sprites-webp/phoenix-cub-apex.webp',
  monkeyCubT1:'assets/bloodline-sprites-webp/monkey-cub-t1.webp',
  monkeyCubT2:'assets/bloodline-sprites-webp/monkey-cub-t2.webp',
  monkeyCubT3:'assets/bloodline-sprites-webp/monkey-cub-t3.webp',
  monkeyCubApex:'assets/bloodline-sprites-webp/monkey-cub-apex.webp',
  altar:'assets/bloodline-sprites-webp/blood-altar.webp',
  broodkeeper:'assets/bloodline-sprites-webp/crimson-broodkeeper.webp',
  matriarch:'assets/bloodline-sprites-webp/brood-matriarch.webp'
};
const hauntedSprites={
  investigator:'assets/haunted-sprites/night-investigator.webp',
  occultDetective:'assets/haunted-sprites/occult-detective.webp',
  anomalySpecialist:'assets/haunted-sprites/anomaly-specialist.webp',
  ruleEnforcer:'assets/haunted-sprites/rule-enforcer.webp',
  ruleArchitect:'assets/haunted-sprites/architect-of-taboos.webp',
  allSeeingOverseer:'assets/haunted-sprites/all-seeing-overseer.webp',
  curfewDirector:'assets/haunted-sprites/director-of-curfew.webp',
  forensicDemiurge:'assets/haunted-sprites/forensic-demiurge.webp',
  backroomsWarden:'assets/haunted-sprites/backrooms-warden.webp',
  securityCam:'assets/haunted-sprites/security-monitor.webp',
  radioPA:'assets/haunted-sprites/emergency-broadcast.webp',
  coroner:'assets/haunted-sprites/forensic-coroner.webp',
  decoder:'assets/haunted-sprites/black-box-cryptographer.webp',
  ruleboard:'assets/haunted-sprites/cursed-rulebook.webp',
  panopticon:'assets/haunted-sprites/panopticon-monitor.webp',
  redPhone:'assets/haunted-sprites/red-hotline.webp',
  boneSaw:'assets/haunted-sprites/coroners-bone-saw.webp',
  elevatorKey:'assets/haunted-sprites/liminal-keycard.webp',
  kuchisake:'assets/haunted-sprites/slit-mouthed-woman.webp',
  scissorBanshee:'assets/haunted-sprites/blood-scissors-banshee.webp',
  slitMouthedSovereign:'assets/haunted-sprites/slit-mouthed-sovereign.webp',
  mannequin:'assets/haunted-sprites/window-mannequin.webp',
  stalker:'assets/haunted-sprites/shadow-stalker.webp',
  livingTaboo:'assets/haunted-sprites/living-taboo.webp',
  redRaincoat:'assets/haunted-sprites/red-raincoat-specter.webp',
  bloodPhantasm:'assets/haunted-sprites/blood-drenched-phantasm.webp',
  crimsonHarbinger:'assets/haunted-sprites/harbinger-of-the-crimson-rain.webp',
  stair13:'assets/haunted-sprites/thirteenth-step.webp',
  infiniteStair:'assets/haunted-sprites/infinite-spiral-staircase.webp',
  penroseLabyrinth:'assets/haunted-sprites/penrose-labyrinth.webp',
  dossier:'assets/haunted-sprites/incident-dossier.webp',
  mirrorClone:'assets/haunted-sprites/mirror-reflection.webp',
  chainLetter:'assets/haunted-sprites/cursed-chain-letter.webp',
  nightBus:'assets/haunted-sprites/midnight-bus-44.webp',
  ghostRoute:'assets/haunted-sprites/ghost-route-express.webp',
  terminusBus:'assets/haunted-sprites/terminus-bus-44.webp',
  payphone:'assets/haunted-sprites/midnight-caller.webp',
  hauntedSwitchboard:'assets/haunted-sprites/haunted-switchboard.webp',
  midnightOperator:'assets/haunted-sprites/midnight-operator.webp',
  morgueMirror:'assets/haunted-sprites/morgue-mirror.webp',
  doppelMirror:'assets/haunted-sprites/doppelganger-glass.webp',
  mirrorQueen:'assets/haunted-sprites/mirror-queen.webp'
};
function art(c){const spriteSrc=(c.cosmicAsset?`assets/forbidden-texts/${c.cosmicAsset}.webp`:null)||(c.cyberAsset?`assets/cyber-matrix/${c.cyberAsset}.webp`:null)||(c.arcaneAsset?`assets/arcane-loom/${c.arcaneAsset}.webp`:null)||(c.huntAsset?`assets/eclipse-hunt/${c.huntAsset}.webp`:null)||(c.scrapworkAsset?`assets/scrapwork/${c.scrapworkAsset}.webp`:null)||cultivationRealmSprites[c.id]||bloodlineSprites[c.id]||hauntedSprites[c.id];if(spriteSrc)return `<img class="sprite cultivation-unit-sprite" aria-hidden="true" alt="" src="${spriteSrc}">`;let id=c.asset||c.evolvedFrom||c.id;if(id==='houndToken')id='hound';let i=modelIds.indexOf(id);if(i<0)i=2;return `<span class="sprite realistic-unit ${c.evolvedFrom?'ascended':''}" aria-hidden="true" style="background-position:${i%6*20}% ${Math.floor(i/6)*100/6}%"></span>`;}

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
// The battle's own run decides the art (the Ability Lab runs a sandbox battle, possibly with no player run).
const fieldLeader=()=>battle?.run?.leader||run?.leader||LEADERS[0].id;
const battlefield=()=>BATTLEFIELDS[fieldLeader()];
const activeFieldGrid=()=>FIELD_GRIDS[fieldLeader()];
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
        <button class="hud-icon-btn" data-action="help" aria-label="Help">?</button>
      </div>
    </header>`;
  }
  return `<header class="mobile-hud lobby-hud">
    <button class="brand" data-action="home"><span class="sigil">✧</span><span><span class="brand-name">CONFLUENCE</span><span class="brand-sub">THE NINEFOLD CROSSING</span></span></button>
    <div class="lobby-actions"><button class="hud-icon-btn lab-link" data-action="labOpen" aria-label="Ability Lab" title="Ability Lab">🧪</button><button class="hud-icon-btn" data-action="help" aria-label="How to play">?</button></div>
  </header>`;
}
function home(){return `<section class="hero"><div class="hero-copy"><div class="eyebrow">One deck. Nine impossible worlds.</div><h1>Build a living<br><span class="accent">ecosystem.</span></h1><p>Choose your cards. Read the road ahead. Connect attacks, state cycles, spells, and sacrifice into a team that can defeat the boss.</p><div class="row wrap"><span class="tag">3 × 3 formation</span><span class="tag">Automatic combat</span><span class="tag">${CARDS.length} cards · ${FORMS.length} evolutions · 9 genres</span></div></div><div class="hero-art"><div class="orbital"></div><div class="orbital two"></div><div class="hero-cast">${[0,4,8,12].map(sprite).join('')}</div><div class="hero-art-caption">ATTACK · TRANSFORM · TRIGGER · GROW</div></div></section>${run?`<div class="resume"><div><h3>${['won','lost'].includes(run.phase)?'Your last crossing':'A crossing in progress'}</h3><p>${leader().name} · ${run.roster.length} cards · ${Math.ceil(run.health)} health · ${run.coins||0} coins</p></div>${btn('resume','Continue →','primary')}</div>`:''}<div class="sectionhead"><div><div class="eyebrow">Choose a leader, then your first card</div><h2>Choose a power. Accept its price.</h2></div></div><div class="leaders">${LEADERS.map(l=>`<button class="leader" data-action="leader" data-id="${l.id}">${sprite(l.sprite)}<span class="eyebrow">${l.title}</span><h3>${l.name}</h3><p class="leader-benefit">+ ${l.benefit}</p><p class="leader-drawback">− ${l.drawback}</p><div class="leader-foot"><span>Choose leader</span><span>↗</span></div></button>`).join('')}</div><div class="footerline"><span>Automatic combat growth · Optional upgrades at Fate Workshops.</span><span>Saved on this browser</span></div>`}
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
      const trial = u.bloodlineTrial;
      const trialState = trial?.unitUid === u.uid ? (trial.status === 'active' ? 'Trial active · clear this Elite/Boss with zero leaks.' : trial.status === 'failed' ? `Trial failed · ${trial.reason || 'a runner leaked'}.` : '') : '';
      return `<p class="evolution-hint">✧ Lineage: <b>${lineageName}</b> (Tier 3/4 · Ancestral Verge)<br>Ancestral Ascension: An adjacent <b>${relicCard ? relicCard.name : 'Lineage Relic'}</b> starts the Elite/Boss trial. Clear with zero leaks to awaken <b>${apexCard ? apexCard.name : 'Apex Immortal Form'}</b>; a leak removes both cards.${trialState ? `<br><strong>${trialState}</strong>` : ''}</p>`;
    } else {
      return `<p class="evolution-hint">✧ Apex Lineage: <b>${lineageName}</b> (Apex Tier 4/4)<br>Ancestral manifestation complete. Relic Resonance active with adjacent Totem.</p>`;
    }
  }
  return '';
}
function cardView(id,action='inspectCard',extra=''){const c=CARD[id],col=GENRES[c.genre][1];return `<button class="draft-card" data-action="${action}" data-id="${id}" style="--realm:${col}" ${extra}>${rarityBadge(id)}${cardTags(c)}<span class="eyebrow">${GENRES[c.genre][0]} · ${c.fav==='neighbor'?'Neighbor interaction':'Any slot'}</span><div class="card-art">${art(c)}</div><h3>${c.name}</h3><div class="card-numbers"><b>${c.baseAtk} <small>ATK</small></b><span>${c.attackInterval?c.attackInterval+'s / attack':'Support'}</span></div><div class="eyebrow">Rules</div><p>${c.rules}</p><div class="eyebrow">${c.ecosystem}</div><div class="spatial"><b>Works well with</b><p>${c.synergy}</p></div>${evolutionHint(c)}${action==='draft'?'<span class="pick-label">Choose this card →</span>':''}</button>`}
function mapView(interactive=true){let options=Game.available(run).map(n=>n.id),nodes=run.map.flat(),w=360,h=16*56+26,px=n=>60+n.lane*120,py=n=>24+n.row*56;let paths='';for(let row=0;row<15;row++)for(const a of run.map[row])for(const z of run.map[row+1])if(z.row===15||Math.abs(z.lane-a.lane)<=1){let taken=run.visited.includes(a.id)&&run.visited.includes(z.id);paths+=`<path d="M${px(a)} ${py(a)} L${px(z)} ${py(z)}" class="${taken?'taken':''}"/>`}
return `<section class="map-panel panel"><div class="row between"><div><div class="eyebrow">The complete route</div><h3>Choose your crossing</h3></div><span class="badge">16 stages</span></div><p class="hint">Follow connected paths downward. Every destination is revealed. Gold nodes are available now.</p><div class="map-legend">${Object.entries(NODES).map(([k,n])=>`<span>${n.icon} ${n.name}</span>`).join('')}</div><div class="map-scroll"><div class="route-map" style="aspect-ratio:${w}/${h}"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${paths}</svg>${nodes.map(n=>{let available=options.includes(n.id),done=run.visited.includes(n.id),current=run.node?.id===n.id;return `<button style="left:${px(n)/w*100}%;top:${py(n)/h*100}%" class="map-node ${available?'available':''} ${done?'visited':''} ${current?'current':''} ${n.type}" data-action="${interactive&&available?'node':'nodeInfo'}" data-id="${n.id}" aria-label="Stage ${n.row+1}, ${['left','middle','right'][n.lane]}: ${nodeLabel(n)}${available?', available':''}${done?', visited':''}"><span>${NODES[n.type].icon}</span><small>${n.row+1} · ${nodeLabel(n)}</small></button>`}).join('')}</div></div></section>`}
function readinessPanel(){const history=run.battleHistory||[],lastTrial=[...history].reverse().find(w=>w.trial)?.trial,recent=history.slice(-3),leaks=recent.reduce((s,w)=>s+w.leaks,0);if(!history.length)return '';let message=lastTrial?(lastTrial.killed?`Last Harbinger: defeated after reaching ${Math.round(lastTrial.progress/16*100)}% of the track. ${lastTrial.progress>=12?'A narrow finish: strengthen sustained damage.':'Good evidence for that team, but the final boss has more health.'}`:`Last Harbinger escaped with ${lastTrial.hpRemaining.toLocaleString()} HP. Prioritize sustained damage; slows alone cannot stop enrage.`):'Boss readiness is untested. Harbingers at crossings 6, 10, and 14 introduce its resistance and enrage.';return `<div class="encounter-panel"><div class="eyebrow">Build check · observed results</div><p>${message}</p><p>${leaks?`${leaks} leaks across your last ${recent.length} battles. Use the next draft and route to address these weaknesses.`:'No recent leaks. This does not guarantee enough damage against the boss.'}</p>${run.roster.length>9?`<p class="health">${run.roster.length} cards compete for 9 slots. A grown card can miss the next battle. Skipping a reward preserves draw consistency.</p>`:''}<p class="hint">Random draws change the active team each battle; most synergies ignore position. This is a record of performance, not a win prediction.</p></div>`}
function encounterPanel(n){const e=Game.encounterFor(n),trial=Game.trialFor(n);return (e?`<div class="encounter-panel ${e.id}"><div class="eyebrow">This wave tests · ${e.test}</div><h3>${e.name}</h3><p>${e.desc}</p><p class="encounter-tip">${e.tip}</p></div>`:'')+(trial?`<div class="encounter-panel armor"><div class="eyebrow">Boss rehearsal · Harbinger</div><h3>${trial.hp.toLocaleString()} HP · ${trial.leak} damage if it escapes</h3><p>The final runner has 20% armor and halves Slow, Stun, Freeze, and knockback. After 45 seconds it enrages: +25% movement speed and immunity to Stun, Freeze, and knockback.</p><p class="encounter-tip">Test sustained damage now. A leak costs health, but does not automatically end the run. Read the result before your next draft.</p></div>`:'')}

function battleReport(r){if(!r?.cards)return '';let cards=r.cards,top=cards.filter(c=>c.damage>0).slice(0,3),max=Math.max(1,...cards.map(c=>c.damage)),growth=cards.filter(c=>c.growth>0),interactions=r.interactions||[],lost=r.consumed||[];
 const damageRow=c=>`<div class="damage-row"><div class="row between"><span>${cardLabel(c)}${c.consumed?' · consumed':''}</span><b>${Math.round(c.damage).toLocaleString()}</b></div><div class="damage-meter"><i style="width:${c.damage/max*100}%"></i></div></div>`;
 const interactionRow=i=>`<li><b>${i.from?CARD[i.from].name:'Track'}${i.to&&i.toUid!==i.fromUid?' → '+CARD[i.to].name:''}</b><span>${i.label}</span><em>×${i.count}</em></li>`;
 return `<section class="battle-report"><div class="row between wrap"><div><div class="eyebrow">What your build did</div><h3>Battle breakdown</h3></div><span class="badge">${r.encounter?Game.ENCOUNTERS[r.encounter].name:'Perimeter defense'} · ${Math.round(r.time)}s</span></div><div class="report-grid"><div><h4>Damage leaders</h4>${top.map(damageRow).join('')||'<p class="hint">No damage dealt.</p>'}<p class="hint">Actual damage, including damage over time. Overkill is excluded; support effects are listed as interactions.</p></div><div><h4>Growth & permanent losses</h4>${growth.length?growth.map(c=>`<p class="growth-line"><b>+${c.growth} ATK</b> ${cardLabel(c)}${c.consumed?' · later consumed':''}</p>`).join(''):'<p class="hint">No permanent attack gained this battle.</p>'}${lost.length?`<div class="loss-list">${lost.map(c=>`<p><strong>${c.token?'TOKEN CONSUMED · PARENT SAFE':'ORIGINAL PERMANENTLY LOST'}</strong> ${rarityBadge(c.id)} ${CARD[c.id].name} #${c.uid} → ${CARD[c.by].name} #${c.byUid}<span>${c.reason||'Devour'} granted +${c.bonus} permanent ATK.</span></p>`).join('')}</div>`:'<p class="hint">No cards consumed.</p>'}</div></div>${readinessPanel()}<div class="report-notes">${(r.notes||[]).map(n=>`<p>${n}</p>`).join('')}</div><details class="report-details"><summary>All cards & triggered interactions (${interactions.length})</summary><div class="report-table-wrap"><table><thead><tr><th>Card</th><th>Hits / spells</th><th>DoT</th><th>Kills</th><th>Gauge triggers</th></tr></thead><tbody>${cards.map(c=>`<tr><td>${cardLabel(c)}</td><td>${Math.round(c.direct+c.ability)}</td><td>${Math.round(c.dot)}</td><td>${c.kills}</td><td>${c.triggers}</td></tr>`).join('')}</tbody></table></div><h4>Interactions that actually happened</h4><ul class="interaction-list">${interactions.map(interactionRow).join('')||'<li>No connected interactions triggered.</li>'}</ul></details></section>`
}
function receiveFeedback(){if(!battle)return;const now=performance.now();for(const e of battle.feedback||[]){if(e.seq<=feedbackSeen)continue;feedbackSeen=e.seq;if(e.kind==='devour'&&e.t>0&&$('.board')){const v=battle.units.find(u=>u.uid===e.fromUid),a=Game.xy(e.fromSlot),z=Game.xy(e.toSlot);if(v){const ghost=document.createElement('div');ghost.className='devour-ghost';const cell=cardCell(a.x,a.y);ghost.style.cssText=`left:${cell.left}%;top:${cell.top}%;width:${cell.width}%;height:${cell.height}%;--dx:${(z.x-a.x)*100}%;--dy:${(z.y-a.y)*100}%`;ghost.innerHTML=art(CARD[v.id]);$('.board').appendChild(ghost);ghost.addEventListener('animationend',()=>ghost.remove(),{once:true});}}visualEvents.push({...e,expires:now+(e.kind==='devour'?3600:1800)});}visualEvents=visualEvents.filter(e=>e.expires>now).slice(-24);}
function heavenlyTrialHUDHTML(b){const t=b?.heavenlyTrial;if(!t)return '';const soul=b.units.find(u=>u.uid===t.unitUid),name=soul?CARD[soul.id]?.name:'Nascent Soul';if(t.status==='active'){const until=Math.max(0,t.nextStrikeAt-b.time),pct=Math.max(0,Math.min(100,until/4*100));return `<div class="tribulation-hud active"><div class="tribulation-head"><b>⚡ HEAVENLY TRIBULATION</b><span>${until.toFixed(1)}s to next strike</span></div><div class="tribulation-meter"><i style="width:${pct}%"></i></div><p>${name} is stunned for 0.5s every 4s · lightning deals 25 damage to every active runner, including the boss.</p><p><strong>Trial:</strong> clear the Elite/Boss node with zero leaks. Failure permanently removes the Nascent Soul and ${CARD[t.relicId]?.name||'matching relic'} from your roster.</p></div>`}if(t.status==='passed')return `<div class="tribulation-hud passed"><b>✦ TRIBULATION PASSED</b><span>${CARD[t.apexId]?.name||'Mythic Immortal'} awakened · ${t.strikes} lightning strikes</span></div>`;return `<div class="tribulation-hud failed"><b>⚡ TRIBULATION FAILED</b><span>${t.reason||'A runner escaped'} · Nascent Soul and ${CARD[t.relicId]?.name||'matching relic'} removed from the roster</span></div>`}
function arcaneTrialHUDHTML(b){const t=b?.arcaneTrial;if(!t)return '';const pair=t.pair.split('+').join(' + '),name=CARD[t.apexId]?.name||'Arcane Mythic';if(t.status==='active')return `<div class="arcane-trial-hud active"><div class="urban-trial-head"><b>✦ ASTRAL WEAVING TRIAL</b><span>${pair} · ${t.nodeType.toUpperCase()}</span></div><p>${t.featDone?'Chosen reaction proved. ':'Land this reaction on an Elite, Harbinger, or Boss. '}Then clear with zero leaks to awaken ${name}. Any leak or missing feat removes the Mage and Astral Loom.</p></div>`;if(t.status==='passed')return `<div class="arcane-trial-hud passed"><b>✦ ASTRAL WEAVING PASSED</b><span>${name} awakened · Astral Loom consumed</span></div>`;return `<div class="arcane-trial-hud failed"><b>✦ ASTRAL WEAVING FAILED</b><span>${t.reason||'Trial failed'} · Mage and Astral Loom removed</span></div>`}
function scrapworkTrialHUDHTML(b){const t=b?.scrapworkTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Titan Mythic',proof=t.modules.map((m,i)=>`<span class="${t.moduleHits[`${m}:${i+1}`]?'proved':''}">${m.toUpperCase()} ${t.moduleHits[`${m}:${i+1}`]?'✓':'○'}</span>`).join(' · ');if(t.status==='active')return `<div class="scrapwork-trial-hud active"><div class="urban-trial-head"><b>⚙ TITAN FIELD TEST</b><span>${t.nodeType.toUpperCase()}</span></div><p>Each locked module must hit an Elite, Harbinger, or Boss. Then clear with zero leaks to awaken ${name}. Any leak or missing proof removes the Titan and Reactor Core.</p><p class="module-proof">${proof}</p></div>`;if(t.status==='passed')return `<div class="scrapwork-trial-hud passed"><b>⚙ FIELD TEST PASSED</b><span>${name} awakened · Reactor Core consumed</span></div>`;return `<div class="scrapwork-trial-hud failed"><b>⚙ FIELD TEST FAILED</b><span>${t.reason||'Trial failed'} · Titan and Reactor Core removed</span></div>`}
function lossNotice(){const lost=(battle.metrics.consumed||[]).filter(c=>!c.token),trial=battle.heavenlyTrial,rows=lost.map(c=>`<span>${CARD[c.id].name} #${c.uid} → ${CARD[c.by].name} #${c.byUid} · +${c.bonus} ATK</span>`);if(battle.xenoTrial?.status==='failed')rows.unshift(`<span>Sci-Fi Xeno trial failure: candidate and matching Serum removed from roster.</span>`);if(battle.cyberTrial?.status==='failed')rows.unshift(`<span>Cyber OS Overdrive failure: Operative and Military Cyber-Reactor removed from roster.</span>`);if(battle.huntTrial?.status==='failed')rows.unshift(`<span>Eclipse Hunt failure: Branded Berserker and Hunt Relic removed from roster.</span>`);if(battle.scrapworkTrial?.status==='failed')rows.unshift(`<span>Titan Field Test failure: Titan and Reactor Core removed from roster.</span>`);if(trial?.status==='failed')rows.unshift(`<span>Heavenly Tribulation failure: ${CARD[trial.relicId]?.name||'relic'} and Nascent Soul removed from roster.</span>`);const arcane=battle.arcaneTrial;if(arcane?.status==='failed')rows.unshift(`<span>Astral Weaving failure: Mage and Astral Loom removed from roster.</span>`);const legendTrial=battle.urbanLegendTrial;if(legendTrial?.status==='failed')rows.unshift(`<span>Folklore trial failure: devourer removed; same-lineage prey was already consumed.</span>`);return rows.length?`<div class="combat-loss"><strong>PERMANENTLY LOST THIS BATTLE</strong>${rows.join('')}</div>`:''}
function devourGhosts(){const age=performance.now()-openingAt;if(age>1600)return '';return (battle.metrics.consumed||[]).map(c=>{let a=Game.xy(c.slot),z=Game.xy(c.toSlot);const cell=cardCell(a.x,a.y);return `<div class="devour-ghost" style="left:${cell.left}%;top:${cell.top}%;width:${cell.width}%;height:${cell.height}%;--dx:${(z.x-a.x)*100}%;--dy:${(z.y-a.y)*100}%;animation-delay:-${age}ms">${art(CARD[c.id])}</div>`}).join('')}
function ecosystemPanel(){if(!run.roster.length)return '';const groups=[['Scrapwork Colossus',['scrapFrame','junkScavenger','magneticCrane','hydraulicRiveter','smelter','titanReactor']],['Arcane Loom',['elementalApprentice','pyroMage','hydroMage','geoMage','aeroMage','elementalPrism','manaBattery','astralLoom']],['Ripperdoc Matrix',['cyberSolo','mantisImplant','gorillaImplant','monowireImplant','sandyOS','berserkOS','cyberdeckOS','vent','cryoPump','biomonitor','accessPoint','cyberReactor']],['Cooling & Bleed',['vent','leech']],['Critical volleys',['sensor','nanite','railgun','core']],['Eclipse Hunt',['mercenary','witchHunter','executioner','leech','trophyStake','taxidermist','totem']],['Control & spells',['eye','larva','herald']],['Bloodline food chain',['cub','serpentFodder','hound','scuttler','flameToad','peachFodder','broodkeeper','matriarch','altar']],['The Containment Protocol (Arch A)',['investigator','securityCam','radioPA','coroner','decoder','occultDetective','anomalySpecialist','ruleEnforcer','ruleboard','panopticon','redPhone','boneSaw','elevatorKey','ruleArchitect','allSeeingOverseer','curfewDirector','forensicDemiurge','backroomsWarden']],['Autonomous Urban Legends (Arch B)',['kuchisake','scissorBanshee','slitMouthedSovereign','nightBus','ghostRoute','terminusBus','payphone','hauntedSwitchboard','midnightOperator','morgueMirror','doppelMirror','mirrorQueen','mannequin','stalker','livingTaboo','chainLetter','redRaincoat','bloodPhantasm','crimsonHarbinger','stair13','infiniteStair','penroseLabyrinth']],['Cosmic predation',['mass','larva','herald']],['Cultivation & Ascension',['practitioner','lotusRoot','herbGrass','cauldron','flyingSword','guqin','weiqiBoard','inkBrush','mountainScroll','soulBanner','demonBlade']]];const ids=new Set(run.roster.map(u=>u.id));return `<details class="ecosystem-guide"><summary>Your ecosystem · drafted connections</summary><p class="hint">These are overlapping paths, not classes. Only deployed cards contribute. Mix paths freely; passive support auras do not stack.</p>${groups.filter(([name,list])=>list.some(id=>ids.has(id))).map(([name,list])=>`<p><b>${name}</b><br>${list.filter(id=>ids.has(id)).map(id=>CARD[id].name).join(' · ')}<br><span class="hint">Explore: ${list.filter(id=>!ids.has(id)).map(id=>CARD[id].name).join(', ')||'All pieces drafted'}</span></p>`).join('')}</details>`}
function deckPanel(){return `<section class="panel"><div class="row between"><div><div class="eyebrow">${leader().title}</div><h3>${leader().name.split(',')[0]}</h3></div>${sprite(leader().sprite)}</div><p class="hint">${leader().passive}</p><div class="divider"></div><div class="row between"><b>Your deck · ${run.roster.length}</b>${btn('roster','Inspect','small')}</div>${ecosystemPanel()}<div class="deck-mini">${run.roster.map(u=>`<button data-action="rosterCard" data-id="${u.uid}" title="${CARD[u.id].name}">${art(CARD[u.id])}<span>${Math.round(Game.base(u))}</span></button>`).join('')||'<p class="muted">Your first draft awaits.</p>'}</div><p class="hint">Nine deployment slots are filled randomly each battle. Titans occupy two adjacent slots. A small deck is more consistent. Devoured cards are permanently lost from this run.</p>${run.relics.length?`<div class="divider"></div>${run.relics.map(id=>{let r=RELICS.find(r=>r.id===id);return `<div class="relic"><b>${r.name}</b><p>${r.desc}</p></div>`}).join('')}`:''}</section>`}
function draftView(){return `${gamehead()}<section class="draft-intro"><div><div class="eyebrow">${run.draftReason==='first'?'Your first card':'Crossing cleared · choose your reward'}</div><h2>One of three. Your choice.</h2><p class="muted">${run.draftReason==='first'?'Begin with a single attacker. Your leader’s genre gets 1.5× selection weight within each rarity in every draft.':'Recruit one card, skip to keep your deck lean, or spend 10 coins to reroll all three choices.'}</p></div>${run.recap&&run.draftReason==='reward'?`<div class="recap"><b>${run.recap.kills} defeated · ${run.recap.leaks} escaped</b><span>+${run.recap.growth.toFixed(0)} permanent ATK · ${run.recap.triggers} ability triggers</span>${run.recap.relic?`<span>Found ${run.recap.relic}</span>`:''}${run.recap.coinsEarned?`<span>+${run.recap.coinsEarned} coins earned</span>`:''}</div>`:''}</section>${run.draftReason==='reward'?battleReport(run.recap):''}<p class="hint rarity-unlocks">Normal / Rare initially · Epic from crossing 5 · Legendary from crossing 10 · Mythic Apex forms are earned only · Elites improve rarity odds</p><div class="draft-grid">${run.offers.map(id=>cardView(id,'draft')).join('')}</div><div class="actions draft-actions">${run.draftReason!=='first'?btn('skipDraft','Skip · keep deck small'):''}${btn('rerollDraft','Reroll · −10 coins','',' '+((run.coins||0)<10?'disabled':''))}</div><p class="hint center">Each reroll costs 10 coins and can be repeated while you can afford it. Normal battles pay 100 coins, Elites 200, and the Boss 500, even on losses. Skipping grants no additional reward.</p><div class="map-layout below-draft">${mapView(false)}${deckPanel()}</div>`}
function readyPanel(){const n=run.node,p=Game.wavePlan(run),field=battlefield();return `<section class="panel ready-panel"><span class="node-emblem">${NODES[n.type].icon}</span><div class="eyebrow">Crossing ${run.depth+1} · ${NODES[n.type].name}</div><h2>Bring the ecosystem to life.</h2><div class="battlefield-callout"><b>${field.theme} battlefield</b><span>Cards deploy on the center 3×3. Enemies circle the 16-tile outer track.</span></div><p>${NODES[n.type].desc}</p>${encounterPanel(n)}${readinessPanel()}<div class="preview-stats"><span><b>${p.count}</b> runners</span><span><b>${p.hp}</b> base HP</span><span><b>9</b> deployment slots</span></div>${n.type==='boss'?'<p class="health">If the final boss escapes, the run ends.</p><p class="hint">The Unraveler has 11,000 HP and halves slow strength, stun duration, and knockback. After 45 seconds on the track, it moves 25% faster and resists all stuns, freezes, and knockback.</p>':''}<p class="hint">Deploy draws your cards, shuffles them into the nine slots, resolves devours and opening effects, then starts combat immediately.</p>${btn('deploy','Deploy & Start →','primary')}<p class="hint">No manual placement · No energy cost · All attacks have global reach</p>${run.roster.some(u=>['practitioner','cultivationFoundation','cultivationGoldenCore','cultivationNascentSoul','cauldron','herbGrass','lotusRoot'].includes(u.id))?'<p class="hint">Cultivation: normal attacks grant no Qi. Spirit Grass grants +1 Qi every 4s; Lotus Blossoms give +5 Qi/+2 ATK by direct absorption or +6 Qi/+4 ATK when brewed. A Cauldron stores 3 Breakthrough Pills, auto-spends them at 30/85/175 Qi gates only while deployed, and at full storage turns Grass into +12 Qi for the highest-Qi deployed cultivator. At 200 Qi with an adjacent relic on Elite/Boss, the zero-leak Heavenly Tribulation begins.</p>':''}${run.roster.some(u=>['practitioner','cultivationFoundation','cultivationGoldenCore','cultivationNascentSoul','cauldron','herbGrass','lotusRoot'].includes(u.id))?'<p class="hint">Cultivation: normal attacks grant no Qi. Spirit Grass grants +1 Qi every 4s; Lotus Blossoms grant +5 Qi/+2 ATK on direct absorption or +6 Qi/+4 ATK when brewed by a Cauldron. At 30/85/175 Qi, a stored Breakthrough Pill is spent only with a deployed Cauldron. Shared stock: 3; at cap, Grass converts to +12 Qi. Reach 200 Qi with an adjacent eligible relic on Elite/Boss to begin the zero-leak Heavenly Tribulation.</p>':''}${run.roster.some(u=>['investigator','kuchisake','nightBus','payphone','morgueMirror','mannequin','redRaincoat','stair13','ruleboard'].includes(u.id))?'<p class="health">QUÁI ĐÀM ĐÔ THỊ: Enemies violate track rules as they march, stacking Violation Marks (+8% damage taken). Every 5 marks trigger Blackout (Tắt Đèn), slowing runners and granting Haunted units +40% attack speed and True Form attacks. Night Investigator ascends via recorded Dread; Urban Legends reach Epic at 15 and Mythic readiness at 80; an adjacent same-lineage Legend at 45+ is consumed in an Elite/Boss trial, and Mythic requires zero leaks!</p>':''}${run.roster.some(u=>['cub','herald'].includes(u.id))?'<p class="health">CONSUMPTION: predators consume only named prey. The Cub&#39;s first meal locks its lineage; all meals grant permanent ATK and matching meals alone grant evolution stacks. Bloodline fodder attacks and breeds at 10% per second when same-species neighbors are orthogonally adjacent. Eating an original permanently deletes it, including a summoning parent. Tokens and originals grant the same predator-defined reward. No eligible prey means no meal.</p>':''}</section>`}
function workshopPanel(){return `<section class="panel ready-panel"><div class="eyebrow">Fate Workshop · crossing ${run.depth+1}</div><h2>Choose a card’s next path.</h2><p>One upgrade costs <b>10 health</b>. Every card offers three permanent upgrades. Pick a card to see the exact choices before spending.</p><div class="rostergrid">${run.roster.map(u=>btn('upgradeCard',`${art(CARD[u.id])}<b>${CARD[u.id].name} #${u.uid}</b><span>${Math.round(Game.base(u))} ATK</span>`,'unit-card workshop-card',`data-id="${u.uid}" ${run.health<=10?'disabled':''}`)).join('')}</div>${run.health<=10?'<p>At least 11 health is required to purchase.</p>':''}${btn('safe','Pass · restore 3 health','event-option')}</section>`}
function upgradeChoices(uid){const u=run.roster.find(v=>String(v.uid)===String(uid));if(!u)return;showDialog(`<div class="eyebrow">Fate Workshop · ${run.health} health</div><h2>${CARD[u.id].name}</h2><p>Choose one · costs 10 health · growth and instance identity are retained.</p><div class="stack">${Game.workshopOptions(run,uid).map(o=>btn('upgrade',`<b>${o.name}</b><span>${o.desc}</span>`,'event-option',`data-id="${uid}" data-choice="${o.id}"`)).join('')}</div>`)}
function eventPanel(){const n=run.node;if(n.type==='workshop')return workshopPanel();return `<section class="panel ready-panel"><span class="node-emblem">${NODES[n.type].icon}</span><div class="eyebrow">${NODES[n.type].name}</div><h2>${n.type==='rest'?'A moment to breathe.':n.type==='cache'?'Something survived.':'Every road asks a price.'}</h2><p>${NODES[n.type].desc}</p>${n.type==='rest'?btn('rest','Rest · restore 12 health','primary'):n.type==='cache'?RELICS.filter(r=>!run.relics.includes(r.id)).slice(0,3).map(r=>btn('relic',`<b>${r.name}</b><span>${r.desc}</span>`,'event-option',`data-id="${r.id}"`)).join('')||btn('rest','Vault exhausted · restore 12 health','primary'):`${btn('bargain','Offer 12 health · gain a random relic','event-option',run.health<=12||run.relics.length===RELICS.length?'disabled':'')}${btn('safe','Take the safe road · restore 3 health','event-option')}`}</section>`}
function mapScreen(){return `${gamehead()}<div class="map-layout">${mapView(run.phase==='map')}<aside class="stack">${run.phase==='ready'?readyPanel():run.phase==='event'?eventPanel():`<section class="panel"><div class="eyebrow">Your next decision</div><h3>Choose a gold destination.</h3><p class="hint">Read the branches ahead before you commit. Battles test the deck; sanctuaries and vaults help it recover and grow.</p></section>`}${deckPanel()}</aside></div>`}
function fieldUnit(u){
  const c=CARD[u.id],fav=Game.favored(battle,u),isApex=Game.isApexImmortal(u)||c.rarity==='Mythic';
  const cells=Game.occupiedSlots(u).map(Game.xy),left=Math.min(...cells.map(p=>p.x)),top=Math.min(...cells.map(p=>p.y)),w=Math.max(...cells.map(p=>p.x))-left+1,h=Math.max(...cells.map(p=>p.y))-top+1;
  const titanClass = u.extraSlot != null ? `scrap-titan ${h > w ? "titan-vertical" : "titan-horizontal"}` : "";
  return `<button class="field-card ${titanClass} ${fav?'favored':''} ${isApex?'apex-unit':''} ${u.state!=='active'?'inactive':''} ${String(selected)===String(u.uid)?'selected':''}" style="--realm:${GENRES[c.genre][1]};--unit-width:${w*100/3}%;--unit-height:${h*100/3}%;left:${left*100/3}%;top:${top*100/3}%" data-action="unit" data-card="${u.id}" data-layout="${u.slot}:${u.extraSlot??''}:${(u.modules||[]).join()}:${u.mountedHead||''}" data-id="${u.uid}" aria-label="${c.name}, ${Math.round(Game.atk(battle,u))} attack">
    <div class="unit-shadow"></div>
    ${art(c)}${u.mountedHead?'<span class="trophy-mount-label">'+u.mountedHead.toUpperCase()+'</span>':''}${u.extraSlot!=null?'<span class="titan-label">2 SLOTS</span>':''}
    <span class="field-atk">${Math.round(Game.atk(battle,u))}</span>
  </button>`
}
function board(){const field=battlefield();return `<div class="board" style="--battlefield-image:url('${field.asset}')" role="group" aria-label="Three by three card grid inside a sixteen-tile perimeter"><div class="track-grid" style="${routeGridStyle()}">${Array.from({length:25},(_,i)=>{let x=i%5,y=Math.floor(i/5),idx=Game.ring.findIndex(p=>p[0]===x&&p[1]===y);return `<div class="${idx>=0?'track-tile':'interior-tile'} ${idx===0?'spawn-tile':''}">${idx>=0&&idx!==0&&idx!==15?`<span>${idx<4?'›':idx<8?'⌄':idx<12?'‹':'⌃'}</span>`:''}</div>`}).join('')}</div><div id="field" style="left:${activeFieldGrid().left}%;top:${activeFieldGrid().top}%;width:${activeFieldGrid().width}%;height:${activeFieldGrid().height}%">${battle.units.filter(u=>!u.removed).map(fieldUnit).join('')}</div>${devourGhosts()}<canvas id="arena" width="700" height="700" aria-label="Animated enemy route around the outside of the nine card slots"></canvas></div>`}
function cosmicDetail(u){
 if(CARD[u.id].genre!=='Lovecraft')return '';
 let lines=[];
 if(Game.isIdol(u)){const scripts=u.scripts||[],pair=Game.cosmicPair(scripts),branch=Game.COSMIC_BRANCHES[pair];lines.push('Locked scripts: '+(scripts.join(' + ')||'awaiting first deciphered page'));if(branch)lines.push('Matching Grimoire: '+CARD[branch[1]].name);lines.push(Game.cosmicApex(u)?'Final seal broken. Permanent growth lasts for this run.':scripts.length<2?'The oldest deployed Idol missing a script receives the next deciphered page.':'Reach154 Syllables and place the matching Grimoire orthogonally adjacent; then complete its Elite/Boss trial.');}
 if(u.id==='archivist')lines.push('Stored recipe: '+((u.pageRecipe||[]).join(' + ')||'empty')+((u.pageRecipe||[]).length===2?' · complete; waiting for a free slot':' · two pages forge a Grimoire'));
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}
function cyberDetail(u){
 if(!Game.isCyber(u))return '';
 const arm=u.arm||CARD[u.id].cyberArm,os=u.os||CARD[u.id].cyberOS,live=!!battle?.units.includes(u),t=battle?.cyberTrial;
 const feat=os==='sandyOS'?`Sandevistan proof ${u.cyberSandyProof||0}/3 window attacks`:os==='berserkOS'?`Berserk proof ${u.cyberBerserkProof||0}/3 redline attacks`:os==='cyberdeckOS'?`Cyberdeck proof ${(u.cyberShortProof?'Short Circuit ✓':'Short Circuit ○')} · ${(u.cyberContagionProof?'Contagion ✓':'Contagion ○')}`:'OS not installed';
 return `<p class="hint">Arm: ${arm?CARD[arm].name:'empty'} · OS: ${os?CARD[os].name:'empty'}<br>Installed choices are locked for this run.</p>${live?`<p class="hint">Heat: ${(u.heat||0).toFixed(0)}°C / 100°C · ${Game.berserkActive(u)?'BERSERK OVERDRIVE':u.state==='overheat'?'THERMAL SHUTDOWN':'cooling active'}<br>RAM: ${Math.floor(u.ram||0)} / ${battle?Game.ramCapacity(battle,u):8} · hacks cost3 RAM</p>`:'<p class="hint">Heat and RAM reset each battle. Installed hardware and Chrome persist.</p>'}<p class="hint">${u.chrome||0} Chrome · ${u.chromeAttackCharge||0}/4 attacks toward next point${Game.cyberApex(u)?' · Mythic OS signature active':''}</p>${live&&!Game.cyberApex(u)?`<p class="hint">Elite/Boss Mythic gate: 120 Chrome · both sockets · adjacent Reactor · ${feat}; then zero-leak clear. Failure removes Operative + Reactor.</p>`:''}`;
}
function huntTrialHUDHTML(b){const t=b?.huntTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Eclipse Hunt Mythic';if(t.status==='active')return `<div class="hunt-trial-hud active"><div class="urban-trial-head"><b>⚔ ECLIPSE HUNT TRIAL</b><span>${t.nodeType.toUpperCase()} · ${CARD[t.relicId]?.name||'Hunt Relic'}</span></div><p>Clear this Elite/Boss node with zero runner leaks to awaken ${name}. Any leak or failed clear removes the Branded Berserker and Hunt Relic.</p></div>`;if(t.status==='passed')return `<div class="hunt-trial-hud passed"><b>✦ ECLIPSE HUNT PASSED</b><span>${name} awakened · Hunt Relic consumed</span></div>`;return `<div class="hunt-trial-hud failed"><b>⚔ ECLIPSE HUNT FAILED</b><span>${t.reason||'A runner leaked'} · Branded Berserker and Hunt Relic removed</span></div>`}
function cyberTrialHUDHTML(b){const t=b?.cyberTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Cyber Mythic',feat=t.os==='sandyOS'?'three attacks during the Sandevistan window':t.os==='berserkOS'?'three attacks at 80–99°C without shutdown':'one Short Circuit and one Contagion';if(t.status==='active')return `<div class="cyber-trial-hud active"><div class="urban-trial-head"><b>⌘ OS OVERDRIVE TRIAL</b><span>${t.nodeType.toUpperCase()} · ${CARD[t.os]?.name||t.os}</span></div><p>Signature proved: ${feat}. Clear with zero leaks to awaken ${name}. Any leak or failed clear removes the Operative and Military Cyber-Reactor.</p></div>`;if(t.status==='passed')return `<div class="cyber-trial-hud passed"><b>✦ OS OVERDRIVE PASSED</b><span>${name} awakened · Reactor consumed</span></div>`;return `<div class="cyber-trial-hud failed"><b>⌘ OS OVERDRIVE FAILED</b><span>${t.reason||'Trial failed'} · Operative and Reactor removed</span></div>`}
function arcaneDetail(u){
 if(CARD[u.id].genre!=='Arcane')return '';
 const names=p=>p.split('+').join(' + ');
 let lines=[];
 if(Game.isElemental(u)&&!Game.isArchon(u)){
  lines.push(`Mastery: ${u.mastery||0}% · Permanent ATK: +${u.permanentAtkBonus||0}`);
 }
 if(Game.isApprentice(u)){
  if(u.lockedPair)lines.push(`Locked Path: ${names(u.lockedPair)} (Off-pair points convert 2:1 into ${names(u.lockedPair)})`);
  lines.push('Synthesis: '+Object.keys(Game.ARCANE_PAIRS).map(p=>names(p)+' '+(u.synthesis?.[p]||0)).join(' · '));
  lines.push('Stored essences: '+((u.essences||[]).join(', ')||'none'));
  const prog=Game.evolutionProgress(u);
  if(prog.label)lines.push(prog.label);
 }
 if(Game.isArchon(u)){
  lines.push(`Archon Ultimate: ${u.archonAttacks||0}/10 attacks toward Channel${u.channeling?' · CHANNELING':''}`);
 }
 if(u.id==='manaBattery')lines.push('Mana Battery: pulses every 8.0s → +4 ticks to a random deployed mage');
 if(u.id==='elementalPrism')lines.push('Elemental Prism: when an adjacent mage casts at max gauge (10 ticks), grants +2 ticks to all deployed elemental mages; no cooldown');
 if(u.id==='astralLoom')lines.push('Astral Loom: adjacent units gain 2 ticks per attack and +20% attack speed');
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}
function huntDetail(u){
 if(CARD[u.id].genre!=='Grimdark')return '';
 let lines=[];
 if(Game.isSlayer(u))lines.push(`Trophy Points: ${u.trophyPoints||0} · milestones 25 / 60 / 100${Game.HUNT_APEX.includes(u.id)?' · Mythic awakened':' · relic binding from Crossing 10'}`);
 if(u.id==='taxidermist')lines.push(`Stored carvings: Beast ${u.carvings?.beast||0} / Fiend ${u.carvings?.fiend||0} / Witch ${u.carvings?.witch||0}. Two of one family forge a relic when space is free and no unbound copy exists.`);
 if(u.id==='trophyStake')lines.push(`Mounted head: ${u.mountedHead||'none'} · expires after this battle`);
 if(u.id==='dragonSlayer')lines.push(`Blood-frenzy: +${Math.round((u.huntFrenzy||0)*100)}% attack speed`);
 if(u.id==='witcherGrandmaster')lines.push(`Next stance: ${Math.floor((u.attackCount||0)/3)%2?'Signs':'Silver'} · Silver criticals are 3× total against priority targets`);
 if(run?.huntArmor)lines.push(`Carved Horns: -${Math.round(run.huntArmor*100)}% priority enemy base armor`);
 if(run?.huntEye)lines.push('Carved Eye: existing 30% ordinary execution thresholds become 35%');
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}
function scrapworkDetail(u){
 if(u.id==='smelter'){
 const near=Game.neighbors(battle,u),scraps=near.filter(v=>['rustSword','rustGun'].includes(v.id)).length;
 const openings=[0,1,2,3,4,5,6,7,8].filter(s=>!Game.slotOccupied(battle,s)&&Math.abs(Game.xy(s).x-u.x)+Math.abs(Game.xy(s).y-u.y)===1).length;
 const mechs=battle.units.some(v=>!v.removed&&Game.isMech(v));
 const stored=(u.scrapIntake||[]),names={rustSword:'Sword',rustGun:'Gun'};
 return `<div class="scrap-progress"><b>Intake: ${stored.length}/2 · ${stored.map(id=>names[id]).join(' + ')||'empty'}</b><p>Stored scrap survives battles · ${scraps} adjacent scrap(s)</p><p>${!mechs?'Needs a deployed Mech':stored.length+scraps>=2?'Ready in '+Math.max(0,(u.forgeAt||0)-battle.time).toFixed(1)+'s':scraps+openings<1?'Blocked: needs one neighboring working slot. Next battle reshuffles.':'Waiting for salvage. A Crane delivers into empty neighboring slots.'}</p></div>`;
 }
 if(!Game.isMech(u))return '';
 const names={blade:'Colossal Scrap Blade',flak:'Twin Flak Battery',gunblade:'Vanguard Gunblade'};
 return `<div class="scrap-progress"><b>Tempered Alloy: ${u.alloy||0}</b><p>Walker 25 · Heavy 65 · Titanshift 120</p><p>${(u.modules||[]).map(m=>names[m]).join(' + ')||'Awaiting forged weapons'} · ${(u.modules||[]).length}/2 locked</p><p>${u.extraSlot!=null?'Two adjacent slots reserved':u.titanUnlocked?'Titanshift ready — waiting for an adjacent empty slot':'One deployment slot'}.</p><p>Mythic trial: 120 Alloy, Titanshift, two modules, adjacent Reactor on Elite/Boss. Prove both modules against priority enemies, then clear with zero leaks. Every 15 Alloy above 120 grants +2 ATK.</p></div>`;
}

function xenoDetail(u){
 if(!Game.isXeno(u))return '';
 let lines=[];
 if(Game.isXenoSpecimen(u)){
  const g=u.genome||0,strains=u.strains||[],sc=u.strainScore||{};
  lines.push(`Genome: ${g} · Chitin ${sc.chitin||0} · Acid ${sc.acid||0} · Psionic ${sc.psionic||0}${u.strainsLocked?' · locked':''} · Biomass pool ${battle?.biomass||0}`);
  const pair=Game.xenoPair(strains);
  if(pair&&Game.XENO_BRANCHES[pair]&&strains.length===2){
   const [epicId,,apexId]=Game.XENO_BRANCHES[pair];
   lines.push(`Lineage: ${CARD[epicId].name} → ${CARD[apexId].name}`);
  }
  lines.push('Metamorphosis: at 130 Genome on an Elite/Boss node the chrysalis cocoons for 15s; no leaks and it hatches mid-battle. A leak cracks the cocoon; try again next Elite/Boss.');
  const trial=battle?.xenoTrial;
  if(trial?.unitUid===u.uid)lines.push(`Cocoon: ${trial.status}${trial.status==='active'?` · hatches in ${Math.max(0,trial.hatchAt-battle.time).toFixed(1)}s`:trial.reason?` · ${trial.reason}`:''}`);
 }
 if(u.id==='geneSplicer'){
  lines.push('The Specimen eats 8 Biomass every 5s for +6 Genome (+2 permanent ATK if adjacent).');
 }
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}

function detail(){let u=battle?.units.find(u=>String(u.uid)===String(selected));if(!u)return `<div class="empty-detail"><span class="sigil">✧</span><h3>Watch the connections.</h3><p>Tap any card to inspect its current attack, progress, and ecosystem role.</p><p class="hint">Team effects work across the board. Only explicitly marked abilities depend on neighbors. No card can take damage.</p></div>`;const c=CARD[u.id];return `<div class="unit-title">${art(c)}<div><div class="eyebrow" style="color:${GENRES[c.genre][1]}">${GENRES[c.genre][0]}</div><h3>${c.name}</h3>${rarityBadge(c.id)}${cardTags(c,!!(u.phantom||u.token))}</div></div><div class="unit-stats"><div><b>${Math.round(Game.atk(battle,u))}</b><small>ATTACK</small></div><div><b>${u.attackInterval?(u.attackInterval/Game.speed(battle,u)).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u.permanentAtkBonus}</b><small>${u.phantom?"WAVE BONUS":"PERMANENT"}</small></div></div>${Game.isPractitioner(u)?`<p class="state-text cultivation-realm">${['Qi-Refining','Foundation Establishment','Golden Core','Nascent Soul'][u.realm||0]} · Realm ${u.realm||0}/3 · ${u.qi||0} Qi${u.realm<3?` · next pill gate ${[30,85,175][u.realm||0]} · stock ${Game.breakthroughPills?.(battle)??0}/3`:u.qi>=200?' · 200 Qi + adjacent relic: Elite/Boss trial':' · next: 200 Qi + adjacent relic on Elite/Boss'}</p>`:''}${Game.isCultivationApex(u)?`<p class="state-text cultivation-realm">Post-ascension Qi ${u.apexQi||0}/30 toward the next permanent +2 ATK · lifetime Qi ${u.qi||0}</p>`:''}${u.id==='cauldron'?`<p class="state-text cultivation-realm">Breakthrough Pills ${Game.breakthroughPills?.(battle)??0}/3 · stored while any Cauldron remains in roster; spend only while one is deployed.</p>`:''}<p class="state-text">${u.removed?(u.phantom?'Token consumed · parent safe':'Original consumed · permanently lost'):u.state!=='active'?u.state+' · '+u.stateRemaining.toFixed(1)+'s remaining':'Active'}${u.phantom?' · one-wave token · species: '+CARD[Game.species(u)]?.name:''}</p>${u.threshold.max?`<div class="meter"><i style="width:${u.threshold.current/u.threshold.max*100}%"></i></div><p class="hint">Progress ${Math.floor(u.threshold.current)} / ${u.threshold.max}</p>`:''}${cosmicDetail(u)}${cyberDetail(u)}${arcaneDetail(u)}${huntDetail(u)}${scrapworkDetail(u)}${xenoDetail(u)}${ascensionBarHTML(u)}${evolutionHint(c,u)}${u?`<p class="hint">Workshop: +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}</p>`:""}<div class="eyebrow">Rules</div><div class="ability">${c.rules}</div>${c.rules.includes('Team Power')?`<p class="hint">Current Team Power: <b>${Game.teamPower(battle).toFixed(1)}</b> · permanent ATK on deployed originals, including this card.</p>`:''}<div class="spatial ${Game.favored(battle,u)?'on':''}">Works well with<p>${c.synergy}</p></div><p class="hint">${Math.round(Game.crit(battle,u)*100)}% critical chance · ${Math.round(Game.critMultiplier(battle,u)*100)}% critical damage</p>${c.fav==='neighbor'?`<p class="hint">Neighbors: ${Game.neighbors(battle,u).map(v=>CARD[v.id].name).join(', ')||'none'}</p>`:''}`}
function blackoutHUDHTML(b){
 if(!b)return '';
 const hasUrban = b.units.some(u=>!u.removed&&Game.isUrbanLegend(u));
 const inCurfew = b.curfewUntil > b.time;
 const inLockout = !inCurfew && b.time < (b.blackoutLockoutUntil||0);
 const hasOrder = b.units.some(u=>!u.removed&&Game.isOrderUnit(u));
 const gauge = b.orderChaos || 0, lit = Game.lightsOn(b);
 if(!hasUrban && !hasOrder && !inCurfew && !inLockout && !lit && gauge === 0)return '';
 if(lit){
  const rem = Math.max(0, b.lightsOnUntil - b.time);
  return `<div class="blackout-banner state-lights"><div class="blackout-header"><span class="blackout-badge lights-badge">☀ LIGHTS ON</span><span class="blackout-timer">${rem.toFixed(1)}s</span></div><div class="blackout-meter"><i style="width:${Math.min(100,rem/6*100)}%"></i></div><div class="blackout-sub">Runners Compliant · Order +30% speed, +20% damage · Chaos goes quiet</div></div>`;
 }

 if(inCurfew){
  const rem = Math.max(0, b.curfewUntil - b.time);
  const pct = Math.min(100, Math.max(0, (rem / 6.0) * 100));
  return `<div class="blackout-banner state-frenzy"><div class="blackout-header"><span class="blackout-badge frenzy-badge">⚡ BLACKOUT FRENZY</span><span class="blackout-timer">${rem.toFixed(1)}s</span></div><div class="blackout-meter"><i style="width:${pct}%"></i></div><div class="blackout-sub">True Form attacks active · 1.5s reaction rate per runner</div></div>`;
 }
 if(inLockout){
  const rem = Math.max(0, (b.blackoutLockoutUntil||0) - b.time);
  const pct = Math.min(100, Math.max(0, ((8.0 - rem) / 8.0) * 100));
  return `<div class="blackout-banner state-lockout"><div class="blackout-header"><span class="blackout-badge lockout-badge">🔒 BLACKOUT LOCKOUT</span><span class="blackout-timer">${rem.toFixed(1)}s</span></div><div class="blackout-meter"><i style="width:${pct}%"></i></div><div class="blackout-sub">Taboos suppressed · Grace period cooling down (${rem.toFixed(1)}s remaining)</div></div>`;
 }
 // Two-sided gauge: left half fills toward Lights On (Order), right half toward Blackout (Chaos).
 const side = gauge < 0 ? 'order' : 'chaos', pct = Math.abs(gauge) / 2;
 const statusMsg = gauge <= -80 ? '☀ Lights On is close' : gauge >= 80 ? '⚠️ Next taboo violation triggers Blackout!' : 'Order pushes left · Chaos pushes right · crossing the middle flickers the lights';
 return `<div class="blackout-banner state-ready"><div class="blackout-header"><span class="blackout-badge ready-badge">☀ ORDER ↔ CHAOS ☾</span><span class="blackout-counter">${gauge > 0 ? '+' : ''}${Math.round(gauge)}</span></div><div class="blackout-meter gauge"><i class="${side}" style="width:${pct}%"></i></div><div class="blackout-sub">${statusMsg}${b.caseFiles ? ` · Case Files ${b.caseFiles}/6` : ''}</div></div>`;
}
function bloodlineTrialHUDHTML(b){const t=b?.bloodlineTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Bloodline Mythic';if(t.status==='active')return `<div class="bloodline-trial-hud active"><div class="urban-trial-head"><b>♜ ANCESTRAL ASCENSION TRIAL</b><span>${CARD[t.relicId]?.name||'Ancestral Relic'} · ${t.nodeType.toUpperCase()}</span></div><p>Clear this Elite/Boss node with zero runner leaks to awaken ${name}. Any leak removes the Tier 3 Bloodline and its relic.</p></div>`;if(t.status==='passed')return `<div class="bloodline-trial-hud passed"><b>✦ ANCESTRAL TRIAL PASSED</b><span>${name} awakened · relic consumed</span></div>`;return `<div class="bloodline-trial-hud failed"><b>♜ ANCESTRAL TRIAL FAILED</b><span>${t.reason||'A runner leaked'} · Tier 3 Bloodline and relic removed</span></div>`}
function urbanLegendTrialHUDHTML(b){const t=b?.urbanLegendTrial;if(!t)return '';const dev=b.units.find(u=>u.uid===t.devourerUid);const name=dev?CARD[dev.id]?.name:'Urban Legend';if(t.status==='active')return `<div class="urban-legend-trial-hud active"><div class="urban-trial-head"><b>☒ FOLKLORE MERGER TRIAL · ${name}</b><span>80+ Violations · +${Number(t.inheritedAtk||0).toFixed(1)} inherited ATK</span></div><p>Same-lineage prey (45+ Violations) was consumed at trial start. Clear this Elite/Boss node with zero runner leaks to earn Mythic. Any leak removes the devourer from the roster.</p></div>`;if(t.status==='passed')return `<div class="urban-legend-trial-hud passed"><b>✦ ZERO-LEAK TRIAL PASSED</b><span>${CARD[t.apexId]?.name||'Mythic Urban Legend'} awakened · +${Number(t.inheritedAtk||0).toFixed(1)} ATK inherited</span></div>`;return `<div class="urban-legend-trial-hud failed"><b>☒ FOLKLORE TRIAL FAILED</b><span>${t.reason||'A runner leaked'} · devourer removed; prey was consumed</span></div>`}
function urbanContainmentHUDHTML(b){const t=b?.urbanContainmentTrial;if(!t)return '';const zero=b.enemies.find(e=>e.uid===t.subjectZeroUid);if(t.status==='active'&&t.subjectZeroContained)return `<div class="urban-trial-hud active"><div class="urban-trial-head"><b>☒ SUBJECT ZERO CONTAINED</b><span>Zero-leak clear required</span></div><p>The containment feat is complete. Clear this Elite/Boss node with no runner leaks to bind the Relic into ${CARD[t.apexId]?.name||'its Mythic form'}; any leak removes the Rule Enforcer and Relic.</p></div>`;if(t.status==='active'){const marks=zero?.ruleMarks||0,hp=zero?Math.max(0,Math.ceil(zero.hp)).toLocaleString():'—',max=zero?zero.maxHp.toLocaleString():'—';return `<div class="urban-trial-hud active"><div class="urban-trial-head"><b>☒ SUBJECT ZERO CONTAINMENT</b><span>${marks}/5 Citations · ${hp}/${max} HP</span></div><p>Cite Subject Zero five times, then defeat it before it reaches the exit. Its escape or an under-marked kill permanently removes the Rule Enforcer and Relic. After containment, finish the Elite/Boss with zero leaks to earn Mythic.</p></div>`}if(t.status==='passed')return `<div class="urban-trial-hud passed"><b>✦ SUBJECT ZERO CONTAINED</b><span>${CARD[t.apexId]?.name||'Mythic Authority'} awakened · Relic consumed</span></div>`;return `<div class="urban-trial-hud failed"><b>☒ CONTAINMENT FAILED</b><span>${t.reason||'Trial failed'} · Rule Enforcer and Relic removed</span></div>`}
function cosmicTrialHUDHTML(b){const t=b?.cosmicTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Cosmic Mythic',proof=t.scripts.map(s=>`<span class="${t.scriptProof[s]?'proved':''}">${s.toUpperCase()} ${t.scriptProof[s]?'✓':'○'}</span>`).join(' · '),remaining=Math.max(0,t.recitationEndsAt-b.time);if(t.status==='active')return `<div class="cosmic-trial-hud active"><div class="urban-trial-head"><b>☄ FORBIDDEN RECITATION</b><span>${t.nodeType.toUpperCase()} · ${remaining.toFixed(1)}s ${t.recitationComplete?'complete':'remaining'}</span></div><p>Channel uninterrupted for 8 seconds. Prove each script on an Elite, Harbinger, or Boss, then clear with zero leaks to awaken ${name}. Failure removes the Herald and matching Grimoire.</p><p class="module-proof">${proof}</p></div>`;if(t.status==='passed')return `<div class="cosmic-trial-hud passed"><b>☄ FORBIDDEN RECITATION PASSED</b><span>${name} awakened · Grimoire consumed</span></div>`;return `<div class="cosmic-trial-hud failed"><b>☄ FORBIDDEN RECITATION FAILED</b><span>${t.reason||'Trial failed'} · Herald and Grimoire removed</span></div>`}
function xenoTrialHUDHTML(b){const t=b?.xenoTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Xeno-Leviathan';if(t.status==='active')return `<div class="xeno-trial-hud active"><div class="urban-trial-head"><b>⬡ METAMORPHOSIS · COCOON</b><span>${t.pair.split('+').join(' + ')} · hatches in ${Math.max(0,t.hatchAt-b.time).toFixed(1)}s</span></div><p>Hold the line: no leaks for 15s and the chrysalis hatches into ${name} mid-battle. A leak cracks the cocoon; it tries again next Elite/Boss.</p></div>`;if(t.status==='passed')return `<div class="xeno-trial-hud passed"><b>✦ HATCHED</b><span>${name} emerged mid-battle</span></div>`;return `<div class="xeno-trial-hud failed"><b>⬡ COCOON CRACKED</b><span>${t.reason||'A runner leaked'} · the chrysalis will try again</span></div>`}
function combat(){return `${gamehead()}<div class="combat-layout"><section class="panel arena-panel"><div class="combat-toolbar"><div class="row">${btn('pause',paused?'▶ Resume':'Ⅱ Pause','small','id="pauseBtn"')}${[1,2,4].map(n=>btn('speed',n+'×',`small ${speed===n?'chosen':''}`,`data-id="${n}"`)).join('')}</div><div class="row">${btn('route','Map','small')}</div></div><div id="blackout-hud" class="blackout-hud">${blackoutHUDHTML(battle)}</div><div id="xeno-trial-hud">${xenoTrialHUDHTML(battle)}</div><div id="cosmic-trial-hud">${cosmicTrialHUDHTML(battle)}</div><div id="heavenly-trial-hud">${heavenlyTrialHUDHTML(battle)}</div><div id="arcane-trial-hud">${arcaneTrialHUDHTML(battle)}</div><div id="scrapwork-trial-hud">${scrapworkTrialHUDHTML(battle)}</div><div id="cyber-trial-hud">${cyberTrialHUDHTML(battle)}</div><div id="hunt-trial-hud">${huntTrialHUDHTML(battle)}</div><div id="bloodline-trial-hud">${bloodlineTrialHUDHTML(battle)}</div><div id="urban-trial-hud">${urbanContainmentHUDHTML(battle)}</div><div id="urban-legend-trial-hud">${urbanLegendTrialHUDHTML(battle)}</div>${board()}<div id="loss-strip">${lossNotice()}</div></section></div>`}
function end(){return `${gamehead()}<section class="stage center"><div class="eyebrow">${run.phase==='won'?'The road holds':'The crossing falls'}</div><h1>${run.phase==='won'?'Worlds, united.':'A thread remains.'}</h1><p class="muted" style="margin-top:20px">Your next deck will tell a different story.</p><div class="summary-grid"><div><b>${run.cleared}</b><small>Battles cleared</small></div><div><b>${run.stats.kills}</b><small>Runners defeated</small></div><div><b>+${Math.round(run.stats.growth)}</b><small>ATK grown in combat</small></div><div><b>${run.coins||0}</b><small>Coins remaining</small></div></div><div class="actions">${btn('home','Choose a new leader','primary')}</div></section>${battleReport(run.recap)}`}
function codex(){return `<section class="stage"><div class="eyebrow">${CARDS.length} draftable cards · ${FORMS.length} evolutions · Nine genres</div><h1>The fellowship.</h1><p class="muted" style="margin-top:15px">Mix attack loops, Burn, Bleed, tokens, sacrifice, critical hits, and control. Evolved forms are earned in combat or awakened at Fate Workshops, never drafted.</p><div class="filterbar">${btn('filter','All '+(CARDS.length+FORMS.length),filter==='all'?'active':'','data-id="all"')}${Object.entries(GENRES).map(([k,v])=>btn('filter',v[0],filter===k?'active':'',`data-id="${k}"`)).join('')}</div><div class="codex-grid">${[...CARDS,...FORMS].filter(c=>filter==='all'||c.genre===filter).map(c=>`<div class="codex-item">${cardView(c.id)}${btn('labOpen','▶ Preview in Ability Lab','small codex-preview',`data-id="${c.id}"`)}</div>`).join('')}</div></section>`}
function render(){if(screen!=='lab')leaveLab();document.body.classList.toggle('in-combat',screen==='lab'||(screen==='game'&&run?.phase==='combat'));document.body.classList.toggle('in-lab',screen==='lab');document.body.classList.toggle('has-dock',screen!=='home');app.innerHTML=`<div class="shell">${header()}${screen==='home'?home():screen==='codex'?codex():screen==='lab'?labView():!run?home():run.phase==='combat'?combat():run.phase==='draft'?draftView():['won','lost'].includes(run.phase)?end():mapScreen()}</div>${bottomDock()}`;if(battle&&(screen==='lab'||(screen==='game'&&run.phase==='combat')))draw();}
function showDialog(html,live=false){if(battle&&!battle.done&&!live){paused=true;let p=$('#pauseBtn');if(p)p.textContent='▶ Resume'}if(modal.open)modal.close();modal.dataset.live=live?'true':'false';modal.innerHTML=btn('close','×','close','aria-label="Close dialog"')+(live&&battle&&!battle.done?'<p class="live-warning">● COMBAT CONTINUES · close this window to return to the battlefield</p>':'')+html;modal.showModal()}
modal.addEventListener('close',()=>{if(!modal.open){selected=null;modal.dataset.live='false'}});

function info(id,u=null){const c=CARD[id];showDialog(`<div class="unit-title">${art(c)}<div><div class="eyebrow">${GENRES[c.genre][0]}</div><h2>${getUnitTitles(c,u).name}</h2>${rarityBadge(id)}${cardTags(c)}<p>${getUnitTitles(c,u).vn}</p></div></div><div class="unit-stats"><div><b>${u?Math.round(Game.base(u)):c.baseAtk}</b><small>ATK</small></div><div><b>${c.attackInterval?(c.attackInterval/(1+(u?.permanentSpeed||0))).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u?.permanentAtkBonus||0}</b><small>PERMANENT</small></div></div><div class="eyebrow">Rules</div><p>${c.rules}</p>${evolutionHint(c,u)}${u?cosmicDetail(u)+cyberDetail(u)+ascensionBarHTML(u):''}${u?`<p class="hint">Workshop: +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}</p>`:""}<div class="eyebrow">${c.ecosystem}</div><div class="spatial"><b>Works well with</b><p>${c.synergy}</p></div><p class="hint">Team Power is the total permanent ATK bonus on deployed originals, including the caster; reserves, consumed cards, and tokens are excluded. Unbuffed ATK excludes damage multipliers. All attacking cards have global reach. Ability charge affects elemental mages, Jade, Lantern, Eye, and Core; it never advances shutdown attack counts, maturity, or evolution witnesses. Consumed originals are permanently lost. Consumed tokens leave their parents safe. The predator defines the meal reward; token and original meals grant the same reward. Permanent ATK lasts for this run.</p>`,true)}
function help(){showDialog(`<div class="eyebrow">How to play</div><h2>Build the deck. Trust the draw.</h2><ol><li>Choose a genre-themed leader with a universal benefit and drawback, then choose <b>one of three starting attackers</b>. The leader’s genre gets 1.5× selection weight inside each rarity in every draft.</li><li>Inspect the entire branching map. Pick a connected gold destination.</li><li><b>Deploy & Start</b> fills nine slots with randomly drawn cards on the 3×3 grid; each Titan reserves two adjacent slots. Opening effects resolve and the battle begins immediately.</li><li>Enemies walk clockwise around the <b>16 outer tiles</b>. They cannot attack your cards. Runners completing the loop damage you and disappear.</li><li>All cards attack globally. Most synergies work across the deployed team. Predation, token spawns, Altar, Netrunner, and Shoggoth use the neighbor rules printed on their cards. There are no center, corner, edge, or alignment bonuses.</li><li>Cards grow, transform, and trigger automatically <b>during combat</b>. Coins are earned from battles and spent on draft rerolls. Fate Workshops offer optional upgrades and evolution paths.</li><li>After every successful stage, choose <b>one of three cards</b>, skip for no extra reward, or reroll all three for 10 coins per reroll. The first card is mandatory. Normal and Rare cards appear initially, Epic from crossing 5, and Legendary from crossing 10; Mythic Apex forms are earned, not drafted. Elite rewards improve high-rarity chances. A roster over nine cards makes each draw less predictable.</li></ol><p>Predators have named diets within their genre. A token’s ancestry determines its species and genre; being a token alone never makes it edible. Consumed originals—including eligible high-rarity Fodder—are permanently lost. Tokens do not delete their parents. Predators prioritize eligible adjacent tokens, then the weakest eligible original. Each predator defines its fixed meal reward, identical for tokens and originals. Empty slots stay empty unless an explicit summon fills them. Parents summon before opening consumption. Crimson Hound does not summon. Each breeding original or token checks every second: with at least one orthogonal same-species neighbor, roll one 10% birth chance into a free orthogonal slot. A birth is a temporary copy of its parent fodder species, not a separate offspring species. No offspring cap. Tokens snapshot unbuffed ATK and attack interval at birth, inherit species attack and breeding traits, and never inherit growth engines or evolve. Scrapwork Mechs permanently lock their first two forged weapons; both fire per attack at reduced individual power. There are no automatic reserve replacements. Phantoms do not join the deck. The final boss halves crowd control and enrages after 45 seconds, so control alone cannot hold it indefinitely. Permanent ATK and trigger-gauge progress last for the run; temporary buffs and attack-cycle counters reset between battles.</p><p>Card values are shown before leader modifiers. Permanent ATK growth and Burn/Bleed stack counts have no numerical limits. Team Power means the sum of permanent ATK bonuses on deployed original cards, including the caster; consumed cards, reserves, and tokens are excluded. Unbuffed ATK means base ATK plus permanent ATK and any Shoggoth mimic bonus. Ability damage can crit unless marked true damage or a detonation. True damage ignores armor. Other damage remains affected by armor, critical hits, leader damage, and Vulnerable as applicable. Base critical chance: 10%. Critical strikes deal 200% damage. Bleed stacks last 4 seconds. Vents freeze the two leading runners every 8 seconds. Every Burn and Bleed stack expires independently; effects are not permanent. Slows use the strongest active slow rather than adding together. Vulnerable uses the most recently applied value. Original cards can evolve during combat; their new form and accumulated growth persist for the run. Cauldron elixirs have an 8s cooldown and cannot trigger themselves. Growth has no battle cap. Summoning has no per-parent or battle count cap. Each ability retains its stated timing, and requires an empty slot. Normal/Rare cards build permanent power early; late-tier cards use that accumulated power. Herald feeding is a lore-based late growth exception, and evolved forms retain their growth engines. Duplicate passive support auras do not stack. Downtime cannot fall below 0.5 seconds.</p><p>Progress saves between decisions. Reloading during combat returns to the pre-deployment checkpoint. Card information opens in a centered modal while combat continues. Map, Deck, and Help menus pause combat; use Resume to continue.</p>`)}
function startLeader(id){run=Game.newRun(id);battle=null;selected=null;screen='game';paused=false;save();render();window.scrollTo(0,0)}
// ---- Ability Lab: one unit alone on the field against an endless, harmless stream of runners ----
// While the Lab is open, the global `battle` is a sandbox battle; the player's own battle is restored on leaving.
let labState=null,labId='swordImmortal',labFilter='all',labQuery='',labPickerOpen=false,labSpeed=1;
// The Lab has its own speed (default 1x) so a 2x/4x battle setting doesn't rush the preview.
const simSpeed=()=>screen==='lab'?labSpeed:speed;
const LAB_COUNTERS={attackCount:'Attacks',archonAttacks:'Archon attacks',qi:'Qi',apexQi:'Apex Qi',souls:'Souls',alloy:'Alloy',alloyAttacks:'Alloy attacks',sandyCharge:'Sandy charge',chromeAttackCharge:'Chrome charge',trophyPoints:'Trophy points',genome:'Genome',dread:'Dread',ram:'RAM',essence:'Essence'};
const LAB_THRESHOLDS={archonAttacks:10,sandyCharge:8,chromeAttackCharge:4,alloyAttacks:3};
function labBattle(id){
  const r=Game.newRun(run?.leader||LEADERS[0].id,1234);
  r.roster=[Game.instance(r,id)];
  r.node={row:0,lane:1,type:'battle'};r.depth=5;r.phase='ready';
  const b=Game.deploy(r);
  b.sandbox=true;b.plan.count=Infinity;
  const u=b.units[0];
  if(u&&u.extraSlot==null){const p=Game.xy(4);u.slot=4;u.x=p.x;u.y=p.y}  // centre tile
  return b;
}
function enterLab(id){
  if(id&&CARD[id])labId=id;
  if(!labState)labState={prevBattle:battle,prevPaused:paused,prevSelected:selected,prevFeedback:feedbackSeen,prevEvents:visualEvents};
  labState.b=labBattle(labId);
  battle=labState.b;paused=false;selected=null;feedbackSeen=0;visualEvents=[];
  screen='lab';render();
}
function leaveLab(){
  if(!labState)return;
  battle=labState.prevBattle;paused=labState.prevPaused;selected=labState.prevSelected;feedbackSeen=labState.prevFeedback;visualEvents=labState.prevEvents;
  labState=null;
}
function labUnit(){return battle?.units.find(v=>!v.removed&&v.id===labId)||battle?.units.find(v=>!v.removed)}
function labTriggerUlt(){
  const u=labUnit();if(!u)return;
  // Most ultimates fire on attackCount % N === 0 with N in {2,3,4,5,6,10}; 60 is a multiple of all of them.
  const bump=n=>Math.ceil(((n||0)+1)/60)*60-1;
  u.attackCount=bump(u.attackCount);
  for(const k of ['siphonCount','scanCount','opticCount','metroidCount'])if(k in u)u[k]=bump(u[k]);
  for(const [k,v] of Object.entries(LAB_THRESHOLDS))u[k]=Math.max(u[k]||0,v-1);
  u.currentCooldown=0;
  toast('Next attack fires the ultimate');
}
function labSpawn(kind){
  Game.spawn(battle);
  const e=battle.enemies[battle.enemies.length-1];if(!e)return;
  if(kind==='boss'){e.boss=true;e.hp=e.maxHp=battle.plan.bossHp;e.defense=.2;e.speed*=.95}
  else{e.elite=true;e.hp=e.maxHp=e.maxHp*2;e.defense=.25}
}
function labNeedsPartner(c){
  const text=`${c.rules||''} ${c.synergy||''}`;
  return /adjacent|neighbou?r|ally|allies|relic|token|devour|consume|blossom|cauldron|module|mount|install|socket/i.test(text);
}
function labCounterHTML(){
  const u=labUnit();if(!u)return '<p class="muted">No unit on the field.</p>';
  const rows=Object.entries(LAB_COUNTERS).filter(([k])=>typeof u[k]==='number'&&(k==='attackCount'||u[k]>0)).map(([k,l])=>{
    const max=LAB_THRESHOLDS[k]||(k==='attackCount'?Math.ceil(((u[k]||0)+1)/10)*10:null);
    return `<div class="lab-counter-row"><span>${l}</span><b>${Math.round(u[k])}${max?`<small> / ${max}</small>`:''}</b></div>`});
  if(k10(u))rows.push(`<div class="lab-ring" aria-label="Attacks toward the 10th">${Array.from({length:10},(_,i)=>`<i class="${i<((u.attackCount||0)%10)?'on':''}"></i>`).join('')}</div>`);
  if(u.channeling)rows.push(`<div class="lab-channel">Channelling ${u.channeling.type} · ${Math.max(0,u.channeling.remaining).toFixed(1)}s</div>`);
  return rows.join('');
}
function k10(u){return /every 10th|10th attack/i.test(CARD[u.id]?.rules||'')}
function labLogHTML(){
  const rows=(battle?.feedback||[]).slice(-14).reverse();
  if(!rows.length)return '<p class="muted">Abilities appear here as they fire.</p>';
  return rows.map(r=>`<li><time>${r.t.toFixed(1)}s</time>${r.text}</li>`).join('');
}
function labPickerHTML(){
  const all=[...CARDS,...FORMS];
  return `<input class="lab-search" type="search" placeholder="Search ${all.length} units" value="${labQuery.replace(/"/g,'&quot;')}" aria-label="Search units">
  <div class="filterbar lab-filters">${btn('labFilter','All',labFilter==='all'?'active':'','data-id="all"')}${Object.entries(GENRES).map(([k,v])=>btn('labFilter',v[0],labFilter===k?'active':'',`data-id="${k}"`)).join('')}</div>
  <div class="lab-list" role="listbox" aria-label="Units">${all.filter(c=>labFilter==='all'||c.genre===labFilter).map(c=>`<button class="lab-item ${c.id===labId?'active':''}" data-action="labPick" data-id="${c.id}" data-name="${(c.name+' '+(c.vn||'')).toLowerCase().replace(/"/g,'')}" style="--realm:${GENRES[c.genre][1]}" ${labQuery&&!(c.name+' '+(c.vn||'')).toLowerCase().includes(labQuery)?'hidden':''}><span class="lab-item-name">${c.name}</span><span class="lab-item-meta">${c.rarity||''} · ${GENRES[c.genre][0]}</span></button>`).join('')}</div>`;
}
function labView(){
  const c=CARD[labId],partner=labNeedsPartner(c);
  return `<section class="stage lab"><div class="eyebrow">Ability Lab</div><h2 class="lab-title">Watch every ability</h2>
  <p class="muted lab-sub">One unit alone on the field. Runners keep coming and never cost health.</p>
  <div class="lab-layout">
    <div class="lab-unitbar" style="--realm:${GENRES[c.genre][1]}"><div><small>${GENRES[c.genre][0]}</small><b>${c.name}</b></div>${btn('labToggle',labPickerOpen?'Close ✕':'Change unit ▾','small',`aria-expanded="${labPickerOpen}"`)}</div>
    ${labPickerOpen?`<aside class="panel lab-picker">${labPickerHTML()}</aside>`:''}
    <div class="lab-toolbar">${btn('labUlt','⚡ Trigger ultimate now','small primary')}${btn('labElite','+ Elite','small')}${btn('labBoss','+ Boss','small')}${btn('labReset','↺ Reset','small')}</div>
    <div class="lab-toolbar lab-speed" role="group" aria-label="Preview speed"><span>Speed</span>${[0.25,0.5,1].map(n=>btn('labSpeed',n===1?'1×':n===0.5?'½×':'¼×',`small ${labSpeed===n?'chosen':''}`,`data-id="${n}" aria-pressed="${labSpeed===n}"`)).join('')}</div>
    <section class="lab-arena">${board()}</section>
    <aside class="panel lab-info">
      <div class="lab-card" style="--realm:${GENRES[c.genre][1]}"><div class="eyebrow">${c.rarity||''} · ${GENRES[c.genre][0]}</div><h2>${c.name}</h2>${c.vn?`<div class="muted">${c.vn}</div>`:''}
        <div class="lab-stats"><span>${c.baseAtk??'—'} ATK</span><span>${c.attackInterval?c.attackInterval+'s':'—'} interval</span></div>
        <p class="lab-rules">${c.rules||''}</p>${c.synergy?`<p class="lab-synergy"><b>Synergy:</b> ${c.synergy}</p>`:''}
        ${partner?`<p class="lab-partner">This unit is placed alone, so effects that need adjacent allies, relics, tokens or modules won't fire here.</p>`:''}
      </div>
      <h3 class="lab-h">Toward the ultimate</h3><div id="lab-counter">${labCounterHTML()}</div>
      <h3 class="lab-h">Ability log</h3><ul id="lab-log" class="lab-log">${labLogHTML()}</ul>
    </aside>
  </div></section>`;
}
function labUI(){
  const ctr=$('#lab-counter');if(ctr)ctr.innerHTML=labCounterHTML();
  const log=$('#lab-log');if(log)log.innerHTML=labLogHTML();
  const field=$('#field');
  if(field){const key=battle.units.filter(u=>!u.removed).map(u=>u.uid+':'+u.slot).join();if(field.dataset.key!==key){field.dataset.key=key;field.innerHTML=battle.units.filter(u=>!u.removed).map(fieldUnit).join('')}}
}
document.addEventListener('input',e=>{
  if(!e.target.classList?.contains('lab-search'))return;
  labQuery=e.target.value.trim().toLowerCase();
  document.querySelectorAll('.lab-item').forEach(b=>{b.hidden=!!labQuery&&!b.dataset.name.includes(labQuery)});
});
document.addEventListener('click',e=>{let el=e.target.closest('[data-action]');if(!el)return;let a=el.dataset.action,id=el.dataset.id;
 if(a==='labOpen'){if(modal.open)modal.close();enterLab(id);window.scrollTo(0,0);return}
 if(screen==='lab'){
  if(a==='labPick'){labPickerOpen=false;enterLab(id);return}
  if(a==='labToggle'){labPickerOpen=!labPickerOpen;render();if(labPickerOpen)$('.lab-search')?.focus();return}
  if(a==='labFilter'){labFilter=id;render();return}
  if(a==='labUlt'){labTriggerUlt();return}
  if(a==='labSpeed'){labSpeed=Number(id);document.querySelectorAll('[data-action="labSpeed"]').forEach(b=>{const on=Number(b.dataset.id)===labSpeed;b.classList.toggle('chosen',on);b.setAttribute('aria-pressed',on)});return}
  if(a==='labElite'||a==='labBoss'){labSpawn(a==='labBoss'?'boss':'elite');return}
  if(a==='labReset'){enterLab(labId);return}
  if(a==='unit'){info(el.dataset.card);return}
  if(!['close','help','inspectCard'].includes(a)){leaveLab()}
 }
 if(a==='close'){modal.close();return}
 if(a==='home'||a==='codex'){if(battle&&!battle.done)paused=true;screen=a;render();window.scrollTo(0,0);return}
 if(a==='help'){help();return}
 if(a==='filter'){filter=id;render();return}
 if(a==='inspectCard'){info(id);return}
 if(a==='leader'){if(run&&!['won','lost'].includes(run.phase))showDialog(`<h2>Begin a new crossing?</h2><p>This replaces your current run.</p>${btn('confirmLeader','Begin new run','primary',`data-id="${id}"`)}`);else startLeader(id);return}
 if(a==='confirmLeader'){modal.close();startLeader(id);return}
 if(a==='journey'||a==='resume'){screen=run?'game':'home';render();window.scrollTo(0,0);return}
 if(a==='draftTab'){if(run?.phase==='draft'){screen='game';render()}else toast('Draft reward opens after clearing a battle!');return}
 if(!run)return;
 if(a==='upgradeCard'&&run.phase==='event'&&run.node.type==='workshop'){upgradeChoices(id);return}
 if(a==='upgrade'){if(Game.upgrade(run,id,el.dataset.choice)){modal.close();save();render();toast('Upgrade applied · 10 health spent')}return}
 if(a==='skipDraft'){if(Game.skipDraft(run)){battle=null;selected=null;save();render();window.scrollTo(0,0)}return}
 if(a==='rerollDraft'){if(Game.rerollDraft(run)){save();render();toast('Three new options · 10 coins spent')}return}
 if(a==='draft'){if(Game.draft(run,id)){battle=null;selected=null;save();render();window.scrollTo(0,0)}return}
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
const VFX_PALETTES = Object.freeze({
  Cultivation: { primary: '#5ce1e6', secondary: '#f6d365', glow: '#5ce1e688', trail: '#c2f9ff', style: 'sword' },
  Bloodline:   { primary: '#d92027', secondary: '#ff7b54', glow: '#d9202788', trail: '#ff9a8b', style: 'claw' },
  PostApoc:    { primary: '#ff9233', secondary: '#ffd166', glow: '#ff923388', trail: '#9ca3af', style: 'shell' },
  Cyberpunk:   { primary: '#00f0ff', secondary: '#ff2a6d', glow: '#00f0ff88', trail: '#ff2a6d', style: 'laser' },
  Arcane:      { primary: '#a855f7', secondary: '#38bdf8', glow: '#a855f788', trail: '#e9d5ff', style: 'orb' },
  Haunted:     { primary: '#aab9ec', secondary: '#b91c1c', glow: '#b91c1c88', trail: '#cbd5e1', style: 'glitch' },
  Lovecraft:   { primary: '#7e22ce', secondary: '#c084fc', glow: '#581c87aa', trail: '#3b0764', style: 'void' },
  Grimdark:    { primary: '#cbd5e1', secondary: '#991b1b', glow: '#991b1b88', trail: '#f8fafc', style: 'blade' },
  SciFi:       { primary: '#10b981', secondary: '#06b6d4', glow: '#10b98188', trail: '#a7f3d0', style: 'beam' }
});

function vfxPaletteFor(genre) {
  return VFX_PALETTES[genre] || VFX_PALETTES.Cultivation;
}

function bezierPt(x0, y0, cx, cy, x1, y1, t) {
  const inv = 1 - t;
  return {
    x: inv * inv * x0 + 2 * inv * t * cx + t * t * x1,
    y: inv * inv * y0 + 2 * inv * t * cy + t * t * y1
  };
}

function drawGroundRing(ctx, cx, cy, radius, progress, pal, genre) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.0, 0.52);
  const r = Math.max(8, radius * (0.28 + 0.72 * progress));
  ctx.globalAlpha = Math.max(0, (1 - progress) * 0.85);
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 4.5 * (1 - progress * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2;
  if (genre === 'Cultivation' || genre === 'Cyberpunk') {
    const sides = genre === 'Cultivation' ? 8 : 6;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 + progress * 0.8;
      const px = Math.cos(a) * r * 0.78, py = Math.sin(a) * r * 0.78;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCrescentSlash(ctx, x0, y0, tx, ty, progress, pal, genre) {
  const angle = Math.atan2(ty - y0, tx - x0);
  const spread = 0.92;
  const r = 28 + progress * 14;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(angle);
  ctx.globalAlpha = Math.min(1, (1 - progress) * 1.4);

  const count = genre === 'Bloodline' ? 3 : genre === 'Haunted' ? 2 : 1;
  for (let c = 0; c < count; c++) {
    ctx.save();
    if (genre === 'Haunted' && c === 1) ctx.rotate(0.65);
    const offset = (c - (count - 1) / 2) * 7;
    ctx.translate(offset * 0.4, offset);
    ctx.strokeStyle = c % 2 === 0 ? pal.primary : pal.secondary;
    ctx.lineWidth = (7 - c * 1.5) * (1 - progress * 0.45);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-8, 0, r, -spread, spread);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2 * (1 - progress * 0.5);
    ctx.beginPath();
    ctx.arc(-7, 0, r, -spread * 0.72, spread * 0.72);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawBezierProjectile(ctx, x0, y0, tx, ty, curve, progress, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || 0.18);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.22 - 26;
  const headT = Math.min(1, Math.max(0.05, progress * 1.15));
  const tailT = Math.max(0, headT - 0.26);
  const segments = 5;

  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < segments; i++) {
    const tA = tailT + (headT - tailT) * (i / segments);
    const tB = tailT + (headT - tailT) * ((i + 1) / segments);
    const pA = bezierPt(x0, y0, cx, cy, tx, ty, tA);
    const pB = bezierPt(x0, y0, cx, cy, tx, ty, tB);
    const frac = (i + 1) / segments;
    ctx.globalAlpha = frac * Math.min(1, (1 - progress) * 1.5);
    ctx.strokeStyle = frac > 0.7 ? pal.primary : pal.trail;
    ctx.lineWidth = 1.5 + frac * 4.5;
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
  }

  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const prev = bezierPt(x0, y0, cx, cy, tx, ty, Math.max(0, headT - 0.04));
  const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
  ctx.translate(head.x, head.y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - progress) * 1.6);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-5, -4.5);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-5, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawImpactSparks(ctx, tx, ty, progress, pal, isCrit) {
  ctx.save();
  ctx.translate(tx, ty);
  ctx.globalAlpha = Math.max(0, 1 - progress);
  const rays = isCrit ? 8 : 6;
  const inner = 6 + progress * 16;
  const outer = inner + (isCrit ? 16 : 10) * (1 - progress * 0.4);
  ctx.strokeStyle = isCrit ? pal.secondary : pal.primary;
  ctx.lineWidth = isCrit ? 2.8 : 2.0;
  ctx.lineCap = 'round';
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + progress * 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.stroke();
  }
  ctx.restore();
}
function drawEmeraldSwordBlade(ctx, x, y, ang, scale, alpha, isColossal = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

  const len = (isColossal ? 155 : 44) * scale;
  const w = (isColossal ? 13 : 4.2) * scale;

  // Outer Emerald Jade Qi Glow
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = (isColossal ? 26 : 12) * scale;

  // 1. Flowing Silk Tassel from Pommel (behind the hilt)
  ctx.strokeStyle = isColossal ? 'rgba(52, 211, 153, 0.9)' : 'rgba(110, 231, 183, 0.75)';
  ctx.lineWidth = (isColossal ? 3.2 : 1.6) * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-len * 0.36, 0);
  const wave = Math.sin((x + y) * 0.04) * (isColossal ? 12 : 4.5) * scale;
  ctx.quadraticCurveTo(-len * 0.56, wave, -len * 0.76, -wave * 0.6);
  ctx.stroke();

  if (isColossal) {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 1.8 * scale;
    ctx.beginPath();
    ctx.moveTo(-len * 0.36, 0);
    ctx.quadraticCurveTo(-len * 0.52, -wave * 0.8, -len * 0.68, wave * 0.5);
    ctx.stroke();
  }

  // 2. Pommel Ring & Jade Bead (Kiếm Thủ)
  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = (isColossal ? 2 : 1) * scale;
  ctx.beginPath();
  ctx.arc(-len * 0.33, 0, w * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(-len * 0.33, 0, w * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // 3. Cord-Wrapped Hilt Grip (Kiếm Bính)
  const gripLen = len * 0.23;
  const gripW = w * 0.46;
  ctx.fillStyle = '#064e3b';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.rect(-len * 0.29, -gripW, gripLen, gripW * 2);
  ctx.fill();
  ctx.stroke();

  // Criss-cross gold cord wrap on grip
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = (isColossal ? 1.5 : 0.8) * scale;
  const steps = isColossal ? 5 : 3;
  for (let i = 0; i < steps; i++) {
    const gx0 = -len * 0.28 + (i / steps) * gripLen;
    const gx1 = -len * 0.28 + ((i + 1) / steps) * gripLen;
    ctx.beginPath();
    ctx.moveTo(gx0, -gripW);
    ctx.lineTo(gx1, gripW);
    ctx.moveTo(gx0, gripW);
    ctx.lineTo(gx1, -gripW);
    ctx.stroke();
  }

  // 4. Double-Faceted Beveled Jian Blade (Upper & Lower Edges for 3D Metallic/Jade Sheen)
  // Upper Blade Facet (Bright Crystalline Jade)
  ctx.beginPath();
  ctx.moveTo(0, 0); // Center spine at guard
  ctx.lineTo(0, -w * 0.92); // Base edge at guard
  ctx.lineTo(len * 0.14, -w * 0.72); // Ricasso notch
  ctx.lineTo(len * 0.20, -w * 1.02); // Flare barb
  ctx.lineTo(len * 0.78, -w * 0.78); // Straight taper toward tip
  ctx.lineTo(len, 0); // Needle-sharp Jian point
  ctx.closePath();

  const upGrad = ctx.createLinearGradient(0, -w, len, 0);
  upGrad.addColorStop(0, '#10b981');
  upGrad.addColorStop(0.55, '#6ee7b7');
  upGrad.addColorStop(0.9, '#d1fae5');
  upGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = upGrad;
  ctx.fill();

  // Lower Blade Facet (Deep Imperial Emerald Shade)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, w * 0.92);
  ctx.lineTo(len * 0.14, w * 0.72);
  ctx.lineTo(len * 0.20, w * 1.02);
  ctx.lineTo(len * 0.78, w * 0.78);
  ctx.lineTo(len, 0);
  ctx.closePath();

  const lowGrad = ctx.createLinearGradient(0, w, len, 0);
  lowGrad.addColorStop(0, '#064e3b');
  lowGrad.addColorStop(0.45, '#047857');
  lowGrad.addColorStop(0.85, '#10b981');
  lowGrad.addColorStop(1, '#ecfdf5');
  ctx.fillStyle = lowGrad;
  ctx.fill();

  // Razor-sharp outer blade edge highlight
  ctx.strokeStyle = '#ecfdf5';
  ctx.lineWidth = (isColossal ? 2.0 : 1.0) * scale;
  ctx.beginPath();
  ctx.moveTo(0, -w * 0.92);
  ctx.lineTo(len * 0.14, -w * 0.72);
  ctx.lineTo(len * 0.20, -w * 1.02);
  ctx.lineTo(len * 0.78, -w * 0.78);
  ctx.lineTo(len, 0);
  ctx.lineTo(len * 0.78, w * 0.78);
  ctx.lineTo(len * 0.20, w * 1.02);
  ctx.lineTo(len * 0.14, w * 0.72);
  ctx.lineTo(0, w * 0.92);
  ctx.stroke();

  // Central Spine Ridge (Jian脊) & Blood/Qi Fuller Groove (Huyết Tào)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = (isColossal ? 2.4 : 1.1) * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len * 0.96, 0);
  ctx.stroke();

  if (isColossal) {
    // Glowing Ancient Seal Runes etched along the blade spine
    ctx.fillStyle = '#fef08a';
    for (let r = 0; r < 5; r++) {
      const rx = len * (0.18 + r * 0.13);
      ctx.beginPath();
      ctx.moveTo(rx, -w * 0.26);
      ctx.lineTo(rx + w * 0.35, 0);
      ctx.lineTo(rx, w * 0.26);
      ctx.lineTo(rx - w * 0.35, 0);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 5. Ornate Winged Cloud-Dragon Crossguard (Kiếm Cách / Hộ Thủ)
  ctx.beginPath();
  ctx.moveTo(len * 0.06, 0); // Forward prong over blade base
  ctx.lineTo(-len * 0.02, -w * 1.1);
  ctx.lineTo(len * 0.08, -w * 2.25); // Swept forward wingtip (Upper)
  ctx.lineTo(-len * 0.07, -w * 1.85);
  ctx.lineTo(-len * 0.09, -w * 0.65);
  ctx.lineTo(-len * 0.09, w * 0.65);
  ctx.lineTo(-len * 0.07, w * 1.85);
  ctx.lineTo(len * 0.08, w * 2.25); // Swept forward wingtip (Lower)
  ctx.lineTo(-len * 0.02, w * 1.1);
  ctx.closePath();

  const guardGrad = ctx.createLinearGradient(-len * 0.08, -w * 2, len * 0.06, w * 2);
  guardGrad.addColorStop(0, '#fde047');
  guardGrad.addColorStop(0.5, '#f59e0b');
  guardGrad.addColorStop(1, '#fef08a');
  ctx.fillStyle = guardGrad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = (isColossal ? 1.8 : 0.9) * scale;
  ctx.stroke();

  // Center Spirit Jade Core Gem set in the Crossguard
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = (isColossal ? 2.2 : 1.1) * scale;
  ctx.beginPath();
  ctx.moveTo(len * 0.03, 0);
  ctx.lineTo(-len * 0.02, -w * 0.65);
  ctx.lineTo(-len * 0.07, 0);
  ctx.lineTo(-len * 0.02, w * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawSwordTorrentChannel(ctx, cx, cy, prog, size, channelType = 'sword-torrent') {
  const channelLabels = {
    'sword-torrent': { text: '⚡ VẠN KIẾM QUY TÔNG (1.2s)', color: '#34d399', glow: '#10b981', bg: '#064e3b' },
    'melodic-resonance': { text: '🎵 THIÊN LÃI CỘNG HƯỞNG (1.2s)', color: '#818cf8', glow: '#6366f1', bg: '#1e1b4b' },
    'formation-star-river': { text: '✨ TINH HÀ KỲ TRẬN (1.2s)', color: '#60a5fa', glow: '#3b82f6', bg: '#172554' },
    'talisman-decree': { text: '📜 HOÀNG KIM THÁNH CHỈ (1.2s)', color: '#f59e0b', glow: '#d97706', bg: '#451a03' },
    'landscape-dragon': { text: '🐉 SƠN HÀ MỰC LONG (1.2s)', color: '#34d399', glow: '#059669', bg: '#022c22' },
    'soul-reap-detonation': { text: '💀 VẠN HỒN BẠO PHÁ (1.2s)', color: '#c084fc', glow: '#a855f7', bg: '#3b0764' },
    'blood-domain': { text: '🩸 HUYẾT HẢI CUỒNG LỘC (1.2s)', color: '#ef4444', glow: '#dc2626', bg: '#450a0a' },
    'azure-dragon': { text: '⚡ THANH LONG BẠO NỘ (1.2s)', color: '#38bdf8', glow: '#0284c7', bg: '#082f49' },
    'white-tiger': { text: '🐯 BẠCH HỔ THẦN HỐNG (1.2s)', color: '#f87171', glow: '#dc2626', bg: '#450a0a' },
    'xuanwu-toxin': { text: '🐢 HUYỀN VŨ ĐỘC ĐỊA (1.2s)', color: '#4ade80', glow: '#16a34a', bg: '#052e16' },
    'great-sage-staff': { text: '🐒 ĐỊNH HẢI THẦN CHÂM (1.2s)', color: '#fbbf24', glow: '#d97706', bg: '#451a03' },
    'berserker-cleave': { text: '⚔️ BERSERKER COLOSSUS CLEAVE (1.2s)', color: '#f59e0b', glow: '#d97706', bg: '#451a03' },
    'siege-bombardment': { text: '💥 SIEGE TITAN BOMBARDMENT (1.2s)', color: '#ef4444', glow: '#dc2626', bg: '#450a0a' },
    'juggernaut-hellfire': { text: '🔥 VANGUARD OIL HELLFIRE (1.2s)', color: '#fb923c', glow: '#ea580c', bg: '#431407' },
    'magmaLord': { text: '🔥 MOLTEN FISSURE (1.2s)', color: '#fb923c', glow: '#ea580c', bg: '#431407' },
    'tempestArchon': { text: '🌪️ FIRESTORM TORNADO (1.2s)', color: '#f87171', glow: '#ef4444', bg: '#450a0a' },
    'steamSovereign': { text: '💨 SCALDING VAPOR MIST (1.2s)', color: '#38bdf8', glow: '#0284c7', bg: '#082f49' },
    'quagmireColossus': { text: '🌿 PRIMORDIAL QUAGMIRE (1.2s)', color: '#4ade80', glow: '#16a34a', bg: '#052e16' },
    'blizzardArchon': { text: '❄️ GLACIAL BLIZZARD (1.2s)', color: '#67e8f9', glow: '#06b6d4', bg: '#164e63' },
    'sandstormTitan': { text: '🏜️ SANDSTORM STRIP (10s)', color: '#facc15', glow: '#ca8a04', bg: '#422006' }
  };
  const theme = channelLabels[channelType] || channelLabels['sword-torrent'];
  ctx.save();

  const haloRad = 70 + 35 * Math.sin(prog * Math.PI);
  const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, haloRad);
  radGrad.addColorStop(0, 'rgba(52, 211, 153, 0.42)');
  radGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.22)');
  radGrad.addColorStop(1, 'rgba(4, 120, 87, 0)');
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, haloRad, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  const rotAng = prog * Math.PI * 3.5;
  ctx.rotate(rotAng);

  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rx = Math.cos(a) * 42;
    const ry = Math.sin(a) * 42;
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(rx - 2, ry - 2, 4, 4);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 36, Math.sin(a) * 36);
    ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
    ctx.stroke();
  }

  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -8, 8, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.arc(0, 8, 8, Math.PI * 0.5, -Math.PI * 0.5);
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < 9; i++) {
    const seed = i * 47;
    const sparkT = (prog * 3 + seed * 0.1) % 1;
    const sparkRad = 15 + ((seed * 19) % 35);
    const sparkAng = (seed * 31) + prog * 4;
    const sx = cx + Math.cos(sparkAng) * sparkRad;
    const sy = cy + Math.sin(sparkAng) * (sparkRad * 0.6) - sparkT * 60;

    ctx.fillStyle = i % 2 === 0 ? '#ecfdf5' : '#34d399';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2 * (1 - sparkT * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }

  // 8 Levitating Jade Jian Swords pointing skyward (-Math.PI/2) and oscillating before launch
  const swordCount = 8;
  for (let i = 0; i < swordCount; i++) {
    const baseAng = (i * (Math.PI * 2)) / swordCount;
    const curAng = baseAng + prog * Math.PI * 4.5;
    const orbitRad = 54 - prog * 12;
    const sx = cx + Math.cos(curAng) * orbitRad;
    const sy = cy + Math.sin(curAng) * (orbitRad * 0.68);
    // Pointing upward with slight outward fan
    const swordAng = -Math.PI * 0.5 + Math.cos(curAng) * 0.22;
    const jitter = Math.sin(prog * 42 + i) * (prog * 4);
    drawEmeraldSwordBlade(ctx, sx, sy + jitter, swordAng, 0.62 + prog * 0.16, 0.8 + prog * 0.2, false);
  }

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillStyle = theme.color;
  ctx.fillText(theme.text, cx, cy - 68);

  const barW = 96, barH = 5;
  ctx.fillStyle = theme.bg;
  ctx.fillRect(cx - barW * 0.5, cy - 60, barW, barH);
  ctx.fillStyle = theme.color;
  ctx.fillRect(cx - barW * 0.5, cy - 60, barW * Math.min(1, prog), barH);
  ctx.strokeStyle = theme.glow;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - barW * 0.5, cy - 60, barW, barH);

  ctx.restore();
}

// ---- Sword Torrent VFX: cached sprites, additive light, particle pool ----
// Timeline (seconds after channel release, engine time; see engine sword-torrent branch):
// 0–0.15 swords fly up · 0.15–0.68 rain in three accelerating waves · 0.7–0.85 Colossal hangs over a
// lock-on sigil (engine slow motion from 0.8) · 0.85–0.95 slam · 1.0–2.0 linger, then stuck swords shatter.
const SWORD_SPRITES = {};
function swordSprite(colossal) {
  const key = colossal ? 'colossal' : 'rain';
  if (SWORD_SPRITES[key]) return SWORD_SPRITES[key];
  const scale = colossal ? 2.0 : 0.72;
  const len = (colossal ? 155 : 44) * scale, w = (colossal ? 13 : 4.2) * scale;
  const pad = colossal ? 70 : 18, back = len * 0.8, front = len;
  const c = document.createElement('canvas');
  c.width = Math.ceil(back + front + pad * 2);
  c.height = Math.ceil(w * 6 + pad * 2);
  const g = c.getContext('2d'), ox = back + pad, oy = c.height / 2;
  // Baked glow: an elongated radial gradient along the blade
  const gr = (front + back) * 0.55;
  g.save();
  g.translate(ox + len * 0.3, oy);
  g.scale(1, (c.height / 2) / gr);
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, gr);
  glow.addColorStop(0, 'rgba(110, 231, 183, 0.55)');
  glow.addColorStop(0.45, 'rgba(16, 185, 129, 0.22)');
  glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
  g.fillStyle = glow;
  g.beginPath(); g.arc(0, 0, gr, 0, Math.PI * 2); g.fill();
  g.restore();
  drawEmeraldSwordBlade(g, ox, oy, 0, scale, 1, colossal); // shadowBlur runs once, here
  return (SWORD_SPRITES[key] = { canvas: c, ox, oy, len });
}
// Stamp a cached sword. (x, y) is the guard; the blade points along ang.
function stampSword(ctx, x, y, ang, k, alpha, colossal) {
  if (alpha <= 0) return;
  const s = swordSprite(colossal);
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.rotate(ang);
  if (k !== 1) ctx.scale(k, k);
  ctx.drawImage(s.canvas, -s.ox, -s.oy);
  ctx.restore();
}
// Stamp so the tip sits at (tx, ty); bury pulls the guard toward the tip (0 = tip just touching).
function stampSwordTip(ctx, tx, ty, ang, k, alpha, colossal, bury = 0) {
  const reach = swordSprite(colossal).len * 0.96 * k * (1 - bury);
  stampSword(ctx, tx - Math.cos(ang) * reach, ty - Math.sin(ang) * reach, ang, k, alpha, colossal);
}
// Cached soft glow disc per colour, stamped with drawImage instead of building a gradient per call.
const GLOW_SPRITES = {};
function glowSprite(rgb) {
  if (GLOW_SPRITES[rgb]) return GLOW_SPRITES[rgb];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${rgb}, 1)`);
  gr.addColorStop(0.35, `rgba(${rgb}, 0.45)`);
  gr.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return (GLOW_SPRITES[rgb] = c);
}
function additiveGlow(ctx, x, y, r, rgb, alpha) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(glowSprite(rgb), x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// Fixed particle pool: no per-frame allocation.
// kind: 0 spark (additive streak), 1 dust, 2 stone chip, 3 jade shard (additive), 4 music note (additive glyph).
const PARTICLE_MAX = 300;
const PARTICLES = Array.from({ length: PARTICLE_MAX }, () => ({ live: false, kind: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, color: '#fff', rot: 0, vr: 0, glyph: 0 }));
const NOTE_GLYPHS = ['♪', '♫', '♩', '♬'];
let particleCursor = 0;
function emitParticle(kind, x, y, vx, vy, life, size, color) {
  for (let n = 0; n < PARTICLE_MAX; n++) {
    const p = PARTICLES[(particleCursor + n) % PARTICLE_MAX];
    if (p.live) continue;
    particleCursor = (particleCursor + n + 1) % PARTICLE_MAX;
    p.live = true; p.kind = kind; p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.life = life; p.max = life; p.size = size; p.color = color;
    p.rot = Math.random() * Math.PI; p.vr = (Math.random() - 0.5) * 14; p.glyph = 0;
    return p;
  }
  return null;
}
function burstImpact(x, y, sparks, dust, chips, power = 1) {
  for (let i = 0; i < sparks; i++) {
    const a = -Math.PI * (0.1 + Math.random() * 0.8), v = (90 + Math.random() * 170) * power;
    emitParticle(0, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.25 + Math.random() * 0.3, 1.2 + Math.random() * 1.6, Math.random() < 0.4 ? '#ecfdf5' : '#6ee7b7');
  }
  for (let i = 0; i < dust; i++) {
    const a = Math.random() * Math.PI * 2, v = (14 + Math.random() * 30) * power;
    emitParticle(1, x + Math.cos(a) * 4, y + Math.sin(a) * 2, Math.cos(a) * v, Math.sin(a) * v * 0.45 - 6, 0.5 + Math.random() * 0.45, (6 + Math.random() * 7) * power, '#8b8577');
  }
  for (let i = 0; i < chips; i++) {
    const a = -Math.PI * (0.15 + Math.random() * 0.7), v = (120 + Math.random() * 200) * power;
    emitParticle(2, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.55 + Math.random() * 0.4, 1.8 + Math.random() * 2.6, Math.random() < 0.5 ? '#6b6459' : '#4a443c');
  }
}
// Shatter a stuck sword: shards spawn along the exposed blade (tip at the ground, rising along -ang).
function burstShatter(x, y, ang, bladeLen, count) {
  for (let i = 0; i < count; i++) {
    const along = Math.random() * bladeLen;
    const px = x - Math.cos(ang) * along, py = y - Math.sin(ang) * along;
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 130;
    emitParticle(3, px, py, Math.cos(a) * v, Math.sin(a) * v - 60, 0.45 + Math.random() * 0.4, 1.6 + Math.random() * 2.4, Math.random() < 0.3 ? '#ecfdf5' : Math.random() < 0.5 ? '#6ee7b7' : '#34d399');
  }
}
function updateParticles(dt) {
  if (dt <= 0) return;
  for (const p of PARTICLES) {
    if (!p.live) continue;
    p.life -= dt;
    if (p.life <= 0) { p.live = false; continue; }
    if (p.kind === 0) { p.vx *= 1 - 2.5 * dt; p.vy = p.vy * (1 - 2.5 * dt) + 260 * dt; }
    else if (p.kind === 1) { p.vx *= 1 - 3 * dt; p.vy *= 1 - 3 * dt; p.size += 10 * dt; }
    else if (p.kind === 2) { p.vy += 620 * dt; p.rot += p.vr * dt; }
    else if (p.kind === 3) { p.vx *= 1 - 1.5 * dt; p.vy += 300 * dt; p.rot += p.vr * dt; }
    else { p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 1.2 * dt) - 26 * dt; p.rot = Math.sin(p.life * 7 + p.vr) * 0.35; } // notes float up, swaying
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
}
function drawParticles(ctx) {
  ctx.save();
  for (const p of PARTICLES) {          // normal blend: dust and chips
    if (!p.live || p.kind === 0 || p.kind >= 3) continue;
    const t = p.life / p.max;
    ctx.globalAlpha = p.kind === 1 ? 0.32 * t : Math.min(1, t * 2);
    ctx.fillStyle = p.color;
    if (p.kind === 1) { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2); ctx.restore(); }
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.font = '700 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of PARTICLES) {          // additive: sparks as streaks, shards as spinning slivers, notes as glyphs
    if (!p.live || p.kind === 1 || p.kind === 2) continue;
    const t = p.life / p.max;
    ctx.globalAlpha = p.kind === 0 ? t : Math.min(1, t * 1.6);
    if (p.kind === 4) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.size, p.size);
      ctx.fillStyle = p.color;
      ctx.fillText(NOTE_GLYPHS[p.glyph], 0, 0);
      ctx.restore();
    } else if (p.kind === 0) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
      ctx.stroke();
    } else {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.moveTo(-p.size * 1.6, 0); ctx.lineTo(0, -p.size * 0.5); ctx.lineTo(p.size * 1.6, 0); ctx.lineTo(0, p.size * 0.5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

const hash01 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// Darken the board with a vignette that keeps (fx, fy) brighter, so the jade light reads as the focus.
function dimFocus(ctx, size, fx, fy, alpha, rgb = '2, 8, 6') {
  if (alpha <= 0) return;
  ctx.save();
  const g = ctx.createRadialGradient(fx, fy, 40, fx, fy, size * 0.85);
  g.addColorStop(0, `rgba(${rgb}, ${alpha * 0.4})`);
  g.addColorStop(0.3, `rgba(${rgb}, ${alpha * 0.85})`);
  g.addColorStop(1, `rgba(${rgb}, ${Math.min(0.8, alpha * 1.35)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

// Gather (the 1.2s channel): board dims around the unit, a ring of swords forms pointing up and draws in.
function drawSwordGather(ctx, cx, cy, prog, size) {
  dimFocus(ctx, size, cx, cy, 0.5 * Math.min(1, prog / 0.25));
  additiveGlow(ctx, cx, cy, 50 + 46 * prog, '110, 231, 183', 0.22 + 0.55 * prog);
  const count = 12, radius = 76 - 36 * prog, lift = 6 + 14 * prog;
  for (let i = 0; i < count; i++) {
    const appear = Math.min(1, Math.max(0, (prog - (i / count) * 0.4) / 0.12));
    if (appear <= 0) continue;
    const a = (i / count) * Math.PI * 2 + prog * 1.6;
    const sx = cx + Math.cos(a) * radius, sy = cy + Math.sin(a) * radius * 0.45 - lift;
    const tremble = prog > 0.8 ? Math.sin(performance.now() * 0.09 + i * 1.7) * (prog - 0.8) * 10 : 0;
    // Pointing up, fanned slightly outward; swords behind the unit are drawn fainter
    const ang = -Math.PI / 2 + Math.cos(a) * 0.18;
    const depth = 0.65 + 0.35 * (Math.sin(a) + 1) / 2;
    stampSwordTip(ctx, sx + tremble, sy - 26, ang, 1.0, appear * depth, false);
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText('⚡ VẠN KIẾM QUY TÔNG', cx, cy - 80);
  const barW = 96, barH = 5;
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(cx - barW / 2, cy - 72, barW, barH);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(cx - barW / 2, cy - 72, barW * Math.min(1, prog), barH);
  ctx.restore();
}

function swordTorrentTarget(f, uid, size, fallback) {
  f._pos ??= {};
  const e = uid != null && battle.enemies.find(v => v.uid === uid && !v.gone && v.hp > 0);
  if (e) { const p = Game.track(e.p); f._pos[uid] = routePoint(p.x, p.y, size); }
  return f._pos[uid] || fallback;
}
function nudgeEnemy(uid, dx, dy, squash) {
  const e = battle.enemies.find(v => v.uid === uid);
  if (!e) return;
  e.recoilX = (e.recoilX || 0) + dx; e.recoilY = (e.recoilY || 0) + dy;
  e.hitSquash = Math.max(e.hitSquash || 0, squash);
}
// Visual-only shockwave: runners near the impact snap away from it (no gameplay knockback).
function shockwavePush(x, y, size, radius, skipUid) {
  for (const e of battle.enemies) {
    if (e.gone || e.hp <= 0 || e.uid === skipUid) continue;
    const tp = Game.track(e.p), p = routePoint(tp.x, tp.y, size);
    const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1;
    if (d > radius) continue;
    const push = 16 * (1 - d / radius);
    nudgeEnemy(e.uid, (dx / d) * push, (dy / d) * push, 0.4 * (1 - d / radius));
  }
}
// Ground crack with jade light glowing inside it. glow 0..1 scales the inner light.
function drawGroundCrack(ctx, x, y, seed, alpha, glow, t) {
  if (alpha <= 0) return;
  const paths = [];
  for (let i = 0; i < 10; i++) {
    let a = (i / 10) * Math.PI * 2 + hash01(seed + i) * 0.5, px = x, py = y;
    const pts = [[px, py]], segs = 3 + Math.floor(hash01(seed + i * 7) * 3);
    for (let s = 0; s < segs; s++) {
      a += (hash01(seed + i * 13 + s) - 0.5) * 0.9;
      const step = 11 + hash01(seed + i * 17 + s) * 14;
      px += Math.cos(a) * step; py += Math.sin(a) * step * 0.42;
      pts.push([px, py]);
    }
    paths.push(pts);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  // Faint scorch only: this pass draws above the runners, so a dark disc would hide the target
  ctx.fillStyle = 'rgba(12, 10, 8, 0.28)';
  ctx.beginPath(); ctx.ellipse(x, y, 36, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#120d09'; ctx.lineWidth = 4;
  for (const pts of paths) { ctx.beginPath(); pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); }
  if (glow > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha * glow * (0.65 + 0.35 * Math.sin(t * 22));
    ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 1.6;
    for (const pts of paths) { ctx.beginPath(); pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); }
  }
  ctx.restore();
  if (glow > 0) additiveGlow(ctx, x, y, 46, '52, 211, 153', 0.5 * glow * alpha);
}
// Lock-on sigil on the ground under the Colossal Sword: rotating rings and trigram ticks, squashed to the floor.
function drawLockSigil(ctx, x, y, prog, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.scale(1, 0.42);
  const r = 24 + 40 * prog;
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2); ctx.stroke();
  ctx.rotate(prog * 2.4);
  ctx.strokeStyle = '#ecfdf5';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.74, Math.sin(a) * r * 0.74);
    ctx.lineTo(Math.cos(a) * r * 0.94, Math.sin(a) * r * 0.94);
    ctx.stroke();
  }
  ctx.restore();
}

// Rain waves: each later wave has more swords landing closer together, so the cadence speeds up.
const RAIN_WAVES = [{ n: 6, start: 0.15, span: 0.16 }, { n: 10, start: 0.34, span: 0.14 }, { n: 16, start: 0.5, span: 0.13 }];
const RAIN_DROPS = RAIN_WAVES.flatMap((w, wi) => Array.from({ length: w.n }, (_, i) => {
  const seed = wi * 97 + i * 7.3 + 5;
  return { key: 'w' + wi + '-' + i, tile: Math.floor(hash01(seed) * 16), at: w.start + w.span * Math.sqrt(i / (w.n - 1)), seed };
}));

function drawSwordTorrent(ctx, f, size) {
  const t = (f.maxTtl || 2) - f.ttl;               // seconds since release, engine time
  const sch = f.schedule || { rain: [], colossalAt: 0.95, colossalUid: null };
  const origin = routePoint(f.x, f.y, size);
  f._landed ??= {};
  const impactAt = sch.colossalAt, hangAt = impactAt - 0.25, slamAt = impactAt - 0.1;
  const cp = swordTorrentTarget(f, sch.colossalUid, size, routePoint(f.tx, f.ty, size));
  const cGround = cp.y + 6;

  // Dim with the bright spot on the unit, sliding to the Colossal target while it hangs; lifts after impact
  const toTarget = Math.min(1, Math.max(0, (t - hangAt) / 0.2));
  const fx = origin.x + (cp.x - origin.x) * toTarget, fy = origin.y + (cGround - origin.y) * toTarget;
  dimFocus(ctx, size, fx, fy, t < impactAt ? 0.5 : 0.5 * Math.max(0, 1 - (t - impactAt) / 0.35));

  // Release: the ring swords shoot up off-screen with short trails
  if (t < 0.2) {
    const k = Math.min(1, t / 0.15), ease = k * k;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 1.6;
      const sx = origin.x + Math.cos(a) * 38, sy0 = origin.y + Math.sin(a) * 17 - 46;
      const sy = sy0 - ease * (sy0 + 80);
      ctx.strokeStyle = `rgba(110, 231, 183, ${0.6 * (1 - k * 0.5)})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(sx, Math.min(sy0, sy + 80)); ctx.lineTo(sx, sy); ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 1.6;
      const sx = origin.x + Math.cos(a) * 38, sy0 = origin.y + Math.sin(a) * 17 - 46;
      stampSwordTip(ctx, sx, sy0 - ease * (sy0 + 80), -Math.PI / 2, 1.0, 1 - k * 0.3, false);
    }
  }

  // Rain: one sword per enemy (timed to its damage) plus three waves over the track tiles
  const drops = [];
  for (const r of sch.rain) drops.push({ key: 'e' + r.uid, uid: r.uid, at: r.at, seed: r.uid * 3.7, enemy: true });
  for (const d of RAIN_DROPS) drops.push({ ...d, enemy: false });
  const FALL = 0.2;
  for (const d of drops) {
    if (t < d.at - FALL) continue;
    let p;
    if (d.enemy) p = swordTorrentTarget(f, d.uid, size, null);
    else { const tp = Game.track(d.tile + 0.5); p = routePoint(tp.x, tp.y, size); }
    if (!p) continue;
    const jx = (hash01(d.seed + 0.5) - 0.5) * (d.enemy ? 14 : 40), jy = (hash01(d.seed + 1) - 0.5) * (d.enemy ? 8 : 22);
    const gx = p.x + jx, gy = p.y + jy + (d.enemy ? 4 : 0);
    const lean = (hash01(d.seed + 2) - 0.5) * 0.5;                    // angle variation
    const k = d.enemy ? 1.15 + hash01(d.seed + 3) * 0.15 : 0.95 + hash01(d.seed + 3) * 0.3; // size variation
    const ang = Math.PI / 2 + lean;
    const sx = gx - Math.cos(ang) * 280, sy = gy - Math.sin(ang) * 280;
    if (t < d.at) {
      const q = (t - (d.at - FALL)) / FALL, e2 = q * q;            // accelerating fall
      const tx = sx + (gx - sx) * e2, ty = sy + (gy - sy) * e2;
      ctx.save();                                                   // ground shadow grows as it nears
      ctx.fillStyle = `rgba(0, 0, 0, ${0.12 + 0.32 * q})`;
      ctx.beginPath(); ctx.ellipse(gx, gy + 2, 3 + 10 * q * k, (1.5 + 3.8 * q) * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(110, 231, 183, ${0.25 + 0.45 * q})`;
      ctx.lineWidth = 2.4 * k; ctx.lineCap = 'round';
      const trail = 34 + 70 * q;
      ctx.beginPath();
      ctx.moveTo(tx - Math.cos(ang) * (trail + 30 * k), ty - Math.sin(ang) * (trail + 30 * k));
      ctx.lineTo(tx - Math.cos(ang) * 20 * k, ty - Math.sin(ang) * 20 * k);
      ctx.stroke();
      ctx.restore();
      stampSwordTip(ctx, tx, ty, ang, k, 1, false);
      continue;
    }
    if (!f._landed[d.key]) {
      f._landed[d.key] = true;
      if (d.enemy) { burstImpact(gx, gy, 9, 4, 3, 1); nudgeEnemy(d.uid, Math.cos(ang) * 4, 5, 0.35); }
      else burstImpact(gx, gy, 4, 1, 1, 0.8);
    }
    // Stuck in the ground until it shatters into jade shards near the end of the linger
    const shatterAt = 1.3 + hash01(d.seed + 4) * 0.4;
    if (t >= shatterAt) {
      if (!f._landed[d.key + 'x']) { f._landed[d.key + 'x'] = true; burstShatter(gx, gy, ang, swordSprite(false).len * k * 0.7, d.enemy ? 8 : 5); }
      continue;
    }
    const since = t - d.at;
    additiveGlow(ctx, gx, gy, 20 * k, '110, 231, 183', since < 0.15 ? 0.75 : 0.35);
    if (since < 0.25) {
      const rq = since / 0.25;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(167, 243, 208, ${(1 - rq) * 0.8})`;
      ctx.lineWidth = 2 * (1 - rq);
      ctx.beginPath(); ctx.ellipse(gx, gy, 4 + rq * 22, 2 + rq * 9, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    stampSwordTip(ctx, gx, gy, ang, k, 1, false, 0.28);
  }

  // Colossal Sword: lock-on sigil, hangs high above the target, slams, cracks the ground, then shatters
  if (t >= hangAt) {
    const high = Math.max(cGround - 330, Math.min(cGround - 90, 70)); // stay on the board for top-row targets
    let tipY;
    if (t < slamAt) tipY = high + ((t - hangAt) / (slamAt - hangAt)) * 8;   // nearly still
    else if (t < impactAt) { const q = (t - slamAt) / (impactAt - slamAt); tipY = high + 8 + (cGround - high - 8) * q * q * q; }
    else tipY = cGround;
    const inA = Math.min(1, (t - hangAt) / 0.06);
    const near = Math.min(1, Math.max(0, (tipY - high) / Math.max(1, cGround - high)));
    const sigilProg = Math.min(1, (t - hangAt) / (impactAt - hangAt));
    drawLockSigil(ctx, cp.x, cGround, sigilProg, t < impactAt ? inA * 0.9 : 0.9 * Math.max(0, 1 - (t - impactAt) / 0.3));
    if (t < impactAt) {
      ctx.save();                                                         // shadow spreads as it falls
      ctx.fillStyle = `rgba(0, 0, 0, ${0.18 + 0.45 * near})`;
      ctx.beginPath(); ctx.ellipse(cp.x, cGround + 2, 14 + 44 * Math.max(near, sigilProg * 0.5), 5 + 15 * Math.max(near, sigilProg * 0.5), 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      additiveGlow(ctx, cp.x, cGround, 50, '110, 231, 183', 0.3 * inA);
    }
    const shatterAt = 1.75;
    if (t >= impactAt) {
      if (!f._landed.colossal) {
        f._landed.colossal = true;
        burstImpact(cp.x, cGround, 30, 16, 40, 1.5);
        nudgeEnemy(sch.colossalUid, 0, 14, 0.7);
        shockwavePush(cp.x, cGround, size, 190, sch.colossalUid);
      }
      const crackFade = t > 1.5 ? Math.max(0, 1 - (t - 1.5) / 0.5) : 1;
      drawGroundCrack(ctx, cp.x, cGround, (sch.colossalUid || 1) * 5.3, crackFade, t < shatterAt ? 1 : 0.4, t);
      const since = t - impactAt;
      for (let r = 0; r < 3; r++) {                                       // shockwave rings
        const rq = Math.min(1, Math.max(0, (since - r * 0.06) / 0.4));
        if (rq <= 0 || rq >= 1) continue;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = r === 0 ? `rgba(236, 253, 245, ${(1 - rq) * 0.9})` : `rgba(110, 231, 183, ${(1 - rq) * 0.7})`;
        ctx.lineWidth = (5 - r) * (1 - rq);
        ctx.beginPath(); ctx.ellipse(cp.x, cGround, 12 + rq * 165, 5 + rq * 64, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (t < shatterAt) additiveGlow(ctx, cp.x, cGround - 50, 90, '167, 243, 208', 0.4);
    }
    if (t < shatterAt) stampSwordTip(ctx, cp.x, tipY, Math.PI / 2, 1, inA, true, t >= impactAt ? 0.12 : 0);
    else if (!f._landed.colossalShatter) {
      f._landed.colossalShatter = true;
      burstShatter(cp.x, cGround, Math.PI / 2, swordSprite(true).len * 0.85, 40);
      additiveGlow(ctx, cp.x, cGround - 60, 110, '167, 243, 208', 0.6);
    }
    if (t >= impactAt && t < impactAt + 0.12) {                           // short radial flash at the impact
      const a = 1 - (t - impactAt) / 0.12;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const r = 300 * (0.75 + 0.25 * (1 - a));
      const g = ctx.createRadialGradient(cp.x, cGround, 0, cp.x, cGround, r);
      g.addColorStop(0, `rgba(255, 255, 255, ${a})`);
      g.addColorStop(0.25, `rgba(167, 243, 208, ${0.6 * a})`);
      g.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = `rgba(110, 231, 183, ${0.1 * a})`;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    }
  }
}
// Big gold number for the Colossal hit: pops in, then rises slowly.
function drawColossalNumber(ctx, x, y, f) {
  const age = (f.maxTtl || 1.1) - f.ttl;
  const pop = age < 0.12 ? 1.7 - 0.7 * (age / 0.12) : 1;
  const alpha = f.ttl < 0.3 ? f.ttl / 0.3 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y - 74 - age * 30);
  ctx.scale(pop, pop);
  ctx.font = '900 34px Cinzel, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a1205';
  ctx.lineWidth = 7;
  ctx.strokeText(f.text, 0, 0);
  const g = ctx.createLinearGradient(0, -16, 0, 16);
  g.addColorStop(0, '#fffbe0');
  g.addColorStop(0.5, '#fde68a');
  g.addColorStop(1, '#f59e0b');
  ctx.fillStyle = g;
  ctx.fillText(f.text, 0, 0);
  ctx.restore();
}

// ---- Melodic Saint · Celestial Resonance (Thiên Lãi Cộng Hưởng) ----
// Gather: seven guqin strings vibrate harder as the 1.2s channel fills, sound rings contract, notes orbit.
// Release (seconds after channel end, engine time; see engine melodic-resonance branch): 0–0.12 pluck,
// then a sound wave spreads at schedule.waveSpeed tiles/s. Each enemy is hit and stunned when the wave
// reaches it; notes circle its head while the 1.5s stun lasts.
const MELODIC_RGB = '129, 140, 248', MELODIC_CORE = '199, 210, 254';
function guqinStrings(ctx, cx, cy, width, amp, alpha, time, snap = 0) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let s = 0; s < 7; s++) {
    const y0 = cy + 14 + (s - 3) * 6.5;
    const freq = 26 + s * 5;                               // higher strings vibrate faster
    const a = amp * (0.6 + 0.4 * Math.sin(time * 3 + s));
    ctx.strokeStyle = s % 3 === 0 ? `rgba(${MELODIC_CORE}, ${alpha})` : `rgba(${MELODIC_RGB}, ${alpha * 0.85})`;
    ctx.lineWidth = 1.2 + snap * 0.7;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, x = cx - width / 2 + u * width;
      const bow = -Math.sin(u * Math.PI) * 6;              // strings arc gently between the bridges
      const vib = Math.sin(u * Math.PI) * a * Math.sin(time * freq + u * 9 + s);
      if (i) ctx.lineTo(x, y0 + bow + vib); else ctx.moveTo(x, y0 + bow + vib);
    }
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(${MELODIC_CORE}, ${alpha})`;      // bridges at both ends
  ctx.fillRect(cx - width / 2 - 2, cy - 8, 3, 44);
  ctx.fillRect(cx + width / 2 - 1, cy - 8, 3, 44);
  ctx.restore();
}
function drawNoteGlyphs(ctx, pts, alpha) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.font = '700 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [x, y, glyph, color, a] of pts) {
    ctx.globalAlpha = Math.min(1, alpha * a);
    ctx.fillStyle = color;
    ctx.fillText(NOTE_GLYPHS[glyph % NOTE_GLYPHS.length], x, y);
  }
  ctx.restore();
}

function drawMelodicGather(ctx, cx, cy, prog, size) {
  const now = battle.time, appear = Math.min(1, prog / 0.2);
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25));
  additiveGlow(ctx, cx, cy, 48 + 44 * prog, MELODIC_RGB, 0.2 + 0.5 * prog);
  ctx.save();                                              // sound rings contracting toward the Saint
  ctx.globalCompositeOperation = 'lighter';
  for (let r = 0; r < 3; r++) {
    const ph = (now * 1.4 + r / 3) % 1, rad = 130 - ph * 105;
    ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${ph * 0.55 * appear})`;
    ctx.lineWidth = 1.5 + ph * 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy + 10, rad, rad * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  guqinStrings(ctx, cx, cy, 150, 1 + prog * 6, appear * 0.9, now);
  const notes = [];                                         // notes orbiting, drawing in and rising
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + now * 1.8;
    notes.push([cx + Math.cos(a) * (62 - prog * 14), cy - 6 + Math.sin(a) * 24 - prog * 10 + Math.sin(now * 5 + i) * 3, i, i % 2 ? '#c7d2fe' : '#fde68a', 0.55 + 0.45 * (Math.sin(a) + 1) / 2]);
  }
  drawNoteGlyphs(ctx, notes, appear);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#a5b4fc';
  ctx.fillText('🎵 THIÊN LÃI CỘNG HƯỞNG', cx, cy - 80);
  const barW = 96, barH = 5;
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(cx - barW / 2, cy - 72, barW, barH);
  ctx.fillStyle = '#818cf8';
  ctx.fillRect(cx - barW / 2, cy - 72, barW * Math.min(1, prog), barH);
  ctx.restore();
}

function drawMelodicResonance(ctx, f, size) {
  const t = (f.maxTtl || 2.4) - f.ttl;                      // seconds since release, engine time
  const sch = f.schedule || { hits: [], start: 0.12, waveSpeed: 5 };
  const o = routePoint(f.x, f.y, size), ox1 = routePoint(f.x + 1, f.y, size), oy1 = routePoint(f.x, f.y + 1, size);
  const pxX = ox1.x - o.x, pxY = oy1.y - o.y;               // pixels per grid tile, so the wave meets enemies on time
  const now = battle.time;
  f._landed ??= {};
  const waveR = Math.max(0, (t - sch.start) * sch.waveSpeed), maxR = 4.6;

  // Dim lifts once the wave passes the edge of the track
  dimFocus(ctx, size, o.x, o.y, 0.45 * Math.max(0, 1 - Math.max(0, waveR - 2.2) / 2.4));

  // Pluck: the strings snap bright and settle
  if (t < 0.5) {
    const k = Math.min(1, t / 0.12), fade = 1 - t / 0.5;
    guqinStrings(ctx, o.x, o.y, 150, 8 * fade, fade, now, 1 - k);
    additiveGlow(ctx, o.x, o.y, 70 + 60 * k, MELODIC_CORE, 0.85 * fade);
  }

  // The sound wave: a rippling front with three fading echoes behind it
  if (waveR > 0 && waveR < maxR + 1.1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round';
    const ring = (r, wob) => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const th = (i / 120) * Math.PI * 2, rr = r * (1 + wob * Math.sin(th * 26 + t * 40));
        const x = o.x + Math.cos(th) * rr * pxX, y = o.y + Math.sin(th) * rr * pxY;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
    };
    for (let e = 0; e < 4; e++) {
      const r = waveR - e * 0.35;
      if (r <= 0.05 || r > maxR) continue;
      const fade = Math.max(0, 1 - r / maxR);
      if (e === 0) {
        ring(r, 0.022);                                      // the front: wide indigo glow, then a thin bright core
        ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${0.22 * fade})`; ctx.lineWidth = 20; ctx.stroke();
        ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${0.6 * fade})`; ctx.lineWidth = 6; ctx.stroke();
        ctx.strokeStyle = `rgba(${MELODIC_CORE}, ${0.95 * fade})`; ctx.lineWidth = 1.8; ctx.stroke();
      } else {
        ring(r, 0.012);
        ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${(0.5 / e) * fade})`; ctx.lineWidth = 2.5; ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Hits: a burst of notes where the wave meets each enemy, then notes circle its head while stunned
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = swordTorrentTarget(f, h.uid, size, null);
    if (!p) continue;
    if (!f._landed[h.uid]) {
      f._landed[h.uid] = true;
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * (0.15 + Math.random() * 0.7), v = 50 + Math.random() * 70;
        const n = emitParticle(4, p.x, p.y - 10, Math.cos(a) * v, Math.sin(a) * v, 0.8 + Math.random() * 0.5, 0.7 + Math.random() * 0.5, i % 3 ? '#c7d2fe' : '#fde68a');
        if (n) n.glyph = i % NOTE_GLYPHS.length;
      }
      const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy) || 1;
      nudgeEnemy(h.uid, (dx / d) * 7, (dy / d) * 7, 0.45);
    }
    const since = t - h.at;
    if (since < 0.35) {                                      // resonance ring on the enemy
      const q = since / 0.35;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${MELODIC_CORE}, ${(1 - q) * 0.9})`;
      ctx.lineWidth = 2.5 * (1 - q);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 + q * 26, 3 + q * 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      additiveGlow(ctx, p.x, p.y - 6, 26, MELODIC_RGB, 0.6 * (1 - q));
    }
    const e = battle.enemies.find(v => v.uid === h.uid);
    if (e && !e.gone && e.hp > 0 && (e.frozenUntil || 0) > battle.time) {
      const pts = [];
      for (let i = 0; i < 3; i++) {
        const a = now * 4 + i * 2.094;
        pts.push([p.x + Math.cos(a) * 15, p.y - 32 + Math.sin(a) * 5, i + h.uid, i === 1 ? '#fde68a' : '#c7d2fe', 0.55 + 0.45 * (Math.sin(a) + 1) / 2]);
      }
      drawNoteGlyphs(ctx, pts, 0.95);
      ctx.save();                                              // faint bell ring at the feet
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${MELODIC_RGB}, ${0.35 + 0.2 * Math.sin(now * 8)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, 15, 5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
}


// ---- Formation Master · Star-River Weiqi Board (Tinh Hà Kỳ Trận) ----
// Gather: night falls, silver Go-board lines spread from the Master, the four corner tiles glow as star
// points and black/white stones snap onto enemies as the grid reaches them.
// Release (seconds after channel end, engine time; see engine formation-star-river branch): after a 0.15s
// opening a star river flows backward along the track from the exit end at schedule.sweep tiles/s. Each enemy
// is warped back and hit as it arrives (e.warpFx drives the slide); corner landings get a starburst.
const NIGHT_RGB = '3, 7, 22', SILVER_RGB = '226, 232, 240', RIVER_RGB = '147, 197, 253';
const FORMATION_CORNERS = [0, 4, 8, 12];
const STARFIELD = Array.from({ length: 70 }, (_, i) => ({ x: hash01(i * 3.1 + 1), y: hash01(i * 7.7 + 2), s: 0.6 + hash01(i * 1.3) * 1.5, ph: hash01(i * 9.9) * 6.28 }));
const easeOut = k => 1 - (1 - k) * (1 - k);

// Visual track position: after a Star-River warp the enemy slides back over 0.45s instead of jumping.
function visualTrackP(e) {
  const w = e.warpFx;
  if (!w || !battle) return e.p;
  const k = (battle.time - w.at) / 0.45;
  if (k >= 1 || k < 0) return e.p;
  return e.p + (w.from - w.to) * (1 - easeOut(k));
}
function trackPoint(p, size) { const tp = Game.track(Math.max(0, Math.min(15.999, p))); return routePoint(tp.x, tp.y, size); }
function ringTile(i, size) { const [x, y] = Game.ring[i]; return routePoint(x, y, size); }

function drawStarfield(ctx, size, alpha, time) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgb(${SILVER_RGB})`;
  for (const s of STARFIELD) {
    ctx.globalAlpha = alpha * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 3 + s.ph)));
    ctx.beginPath(); ctx.arc(s.x * size, s.y * size, s.s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// 9x9 Go grid through the tile centres (every half tile across the 5x5 board), revealed within radius r of (cx, cy).
function drawWeiqiGrid(ctx, size, cx, cy, r, alpha) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(${SILVER_RGB}, ${0.32 * alpha})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const v = i * 0.5, a = routePoint(v, 0, size), b = routePoint(v, 4, size), c = routePoint(0, v, size), d = routePoint(4, v, size);
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  }
  ctx.stroke();
  ctx.restore();
}
function drawStarPoint(ctx, x, y, r, alpha, rgb = SILVER_RGB) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, r * 2.2, RIVER_RGB, 0.45 * alpha);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {                       // four-pointed star
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r;
    if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawGoStoneDisc(ctx, x, y, r, white, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath(); ctx.ellipse(x + 1.5, y + r * 0.45, r, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
  if (white) { g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#e2e8f0'); g.addColorStop(1, '#94a3b8'); }
  else { g.addColorStop(0, '#64748b'); g.addColorStop(0.35, '#1e293b'); g.addColorStop(1, '#020617'); }
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = white ? 'rgba(148, 163, 184, 0.8)' : 'rgba(147, 197, 253, 0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawFormationGather(ctx, cx, cy, prog, size) {
  const time = battle.time, maxR = size * 0.95, R = maxR * easeOut(Math.min(1, prog / 0.8));
  dimFocus(ctx, size, cx, cy, 0.55 * Math.min(1, prog / 0.25), NIGHT_RGB);
  drawStarfield(ctx, size, Math.min(1, prog / 0.3), time);
  drawWeiqiGrid(ctx, size, cx, cy, R, 1);
  ctx.save();                                              // leading edge of the spreading grid
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.45 * (1 - prog)})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  for (const i of FORMATION_CORNERS) {                     // star points light up when the grid reaches them
    const p = ringTile(i, size), d = Math.hypot(p.x - cx, p.y - cy);
    const on = Math.min(1, Math.max(0, (R - d) / 40));
    drawStarPoint(ctx, p.x, p.y, 9 + 2 * Math.sin(time * 6 + i), on);
  }
  for (const e of battle.enemies) {                        // stones snap onto enemies under the grid
    if (e.gone || e.hp <= 0) continue;
    const p = trackPoint(e.p, size), d = Math.hypot(p.x - cx, p.y - cy), k = Math.min(1, Math.max(0, (R - d) / 30));
    if (k <= 0) continue;
    drawGoStoneDisc(ctx, p.x, p.y + 8, 7 * (1.5 - 0.5 * k), e.uid % 2 === 1, k);
  }
  additiveGlow(ctx, cx, cy, 46 + 40 * prog, RIVER_RGB, 0.2 + 0.45 * prog);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#bfdbfe';
  ctx.fillText('✦ TINH HÀ KỲ TRẬN', cx, cy - 80);
  const barW = 96, barH = 5;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - barW / 2, cy - 72, barW, barH);
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(cx - barW / 2, cy - 72, barW * Math.min(1, prog), barH);
  ctx.restore();
}

function drawFormationRiver(ctx, f, size) {
  const t = (f.maxTtl || 2) - f.ttl;                       // seconds since release, engine time
  const sch = f.schedule || { hits: [], start: 0.15, sweep: 16 / 0.6 };
  const o = routePoint(f.x, f.y, size), time = battle.time;
  const riverEnd = sch.start + 16 / sch.sweep, TAIL = 0.5;  // tail: how long a passed stretch stays lit
  const after = Math.max(0, t - riverEnd);
  f._landed ??= {};

  dimFocus(ctx, size, o.x, o.y, 0.55 * Math.max(0, 1 - after / 0.5), NIGHT_RGB);
  drawStarfield(ctx, size, Math.max(0, 1 - after / 0.6), time);
  drawWeiqiGrid(ctx, size, o.x, o.y, size * 0.95, Math.max(0, 1 - Math.max(0, t - 0.9) / 0.6));
  for (const i of FORMATION_CORNERS) {
    const p = ringTile(i, size);
    drawStarPoint(ctx, p.x, p.y, 10 + 2 * Math.sin(time * 6 + i), Math.max(0, 1 - after / 0.8));
  }

  // Stones stay on enemies the river hasn't reached yet
  const hitAt = {};
  for (const h of sch.hits) hitAt[h.uid] = h.at;
  for (const e of battle.enemies) {
    if (e.gone || e.hp <= 0 || hitAt[e.uid] == null || t >= hitAt[e.uid]) continue;
    const p = trackPoint(visualTrackP(e), size);
    drawGoStoneDisc(ctx, p.x, p.y + 8, 7, e.uid % 2 === 1, 1);
  }

  // The star river: lit stretch of track from the front back toward the exit, fading over TAIL seconds
  const front = 16 - Math.max(0, t - sch.start) * sch.sweep;
  if (t >= sch.start && t < riverEnd + TAIL) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const STEP = 0.2;
    for (let p = Math.max(0, front); p < 16; p += STEP) {
      const passedAt = sch.start + (16 - p) / sch.sweep, age = t - passedAt;
      const a = Math.max(0, 1 - age / TAIL);
      if (a <= 0) continue;
      const p0 = trackPoint(p, size), p1 = trackPoint(Math.min(15.999, p + STEP), size);
      ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.18 * a})`; ctx.lineWidth = 30;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.45 * a})`; ctx.lineWidth = 10;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${SILVER_RGB}, ${0.8 * a})`; ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
    // Stars drifting in the river, flowing backward with it
    const tailTiles = TAIL * sch.sweep;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgb(${SILVER_RGB})`;
    for (let k = 0; k < 46; k++) {
      const p = front + ((hash01(k * 5.3) * tailTiles + time * 3) % tailTiles);
      if (p < 0 || p >= 16) continue;
      const age = t - (sch.start + (16 - p) / sch.sweep), a = Math.max(0, 1 - age / TAIL);
      const q = trackPoint(p, size), off = (hash01(k * 2.9) - 0.5) * 22;
      ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(time * 9 + k));
      ctx.beginPath(); ctx.arc(q.x + off, q.y + off * 0.5, 1 + hash01(k) * 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (front > 0) { const q = trackPoint(front, size); additiveGlow(ctx, q.x, q.y, 46, SILVER_RGB, 0.7); }
  }

  // Hits: a starburst where the river meets each enemy, a star trail while it slides back, corner flares
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const e = battle.enemies.find(v => v.uid === h.uid);
    const w = e?.warpFx;
    if (!f._landed[h.uid]) {
      f._landed[h.uid] = true;
      if (e && w) {
        const p = trackPoint(w.from, size);
        for (let i = 0; i < (w.corner ? 22 : 10); i++) {
          const a = Math.random() * Math.PI * 2, v = (60 + Math.random() * 140) * (w.corner ? 1.4 : 1);
          emitParticle(0, p.x, p.y, Math.cos(a) * v, Math.sin(a) * v, 0.3 + Math.random() * 0.3, 1.2 + Math.random() * 1.4, w.corner ? (Math.random() < 0.5 ? '#fde68a' : '#ffffff') : (Math.random() < 0.5 ? '#e2e8f0' : '#93c5fd'));
        }
      }
    }
    if (!e || !w || e.gone) continue;
    const since = time - w.at;
    if (since < 0.6) {                                     // trail from where it was hit to where it is now
      const vp = visualTrackP(e), a = Math.max(0, 1 - since / 0.6);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(${RIVER_RGB}, ${0.7 * a})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let p = vp, i = 0; p <= w.from + 0.001; p += 0.15, i++) { const q = trackPoint(p, size); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
      ctx.stroke();
      ctx.restore();
    }
    if (w.corner && since < 0.7) {                         // corner: expanding star and gold flare on the star point
      const q = trackPoint(w.to, size), k = since / 0.7;
      drawStarPoint(ctx, q.x, q.y - 4, 14 + 40 * easeOut(k), 1 - k, '253, 230, 138');
      additiveGlow(ctx, q.x, q.y, 60 * (1 - k * 0.5), '253, 230, 138', 0.7 * (1 - k));
    }
  }
}

// Black Stone / White Stone: a Go stone arcs from the Master and lands on the target with a click and a ripple.
function drawGoStoneShot(ctx, x, y, tx, ty, prog, white, f) {
  const FLIGHT = 0.55;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT, mx = (x + tx) / 2, my = Math.min(y, ty) - 60;
    const px = (1 - k) * (1 - k) * x + 2 * (1 - k) * k * mx + k * k * tx, py = (1 - k) * (1 - k) * y + 2 * (1 - k) * k * my + k * k * ty;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = white ? 'rgba(226, 232, 240, 0.35)' : 'rgba(147, 197, 253, 0.35)';
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const kk = Math.max(0, k - 0.25 + (i / 8) * 0.25);
      const qx = (1 - kk) * (1 - kk) * x + 2 * (1 - kk) * kk * mx + kk * kk * tx, qy = (1 - kk) * (1 - kk) * y + 2 * (1 - kk) * kk * my + kk * kk * ty;
      if (i) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy);
    }
    ctx.stroke();
    ctx.restore();
    drawGoStoneDisc(ctx, px, py, 7, white, 1);
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._clicked) {
    f._clicked = true;
    for (let i = 0; i < 6; i++) { const a = -Math.PI * Math.random(), v = 50 + Math.random() * 80; emitParticle(0, tx, ty, Math.cos(a) * v, Math.sin(a) * v, 0.2 + Math.random() * 0.15, 1.1, white ? '#ffffff' : '#93c5fd'); }
  }
  drawGoStoneDisc(ctx, tx, ty, 7, white, 1 - q);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = white ? `rgba(226, 232, 240, ${0.8 * (1 - q)})` : `rgba(147, 197, 253, ${0.8 * (1 - q)})`;
  ctx.lineWidth = 2 * (1 - q);
  ctx.beginPath(); ctx.ellipse(tx, ty + 4, 6 + q * 22, 2.5 + q * 8, 0, 0, Math.PI * 2); ctx.stroke();
  if (white) {                                             // slow: a pale ring settles around the target
    ctx.strokeStyle = `rgba(191, 219, 254, ${0.5 * (1 - q * 0.5)})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.ellipse(tx, ty + 6, 15, 5.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}


// Channel type → CSS class that lifts and tints the channelling unit's card (see style.css).
const CHANNEL_GLOW = { 'sword-torrent': 'channeling-sword', 'melodic-resonance': 'channeling-melodic', 'formation-star-river': 'channeling-formation', 'talisman-decree': 'channeling-talisman', 'landscape-dragon': 'channeling-landscape', 'soul-reap-detonation': 'channeling-soul', 'blood-domain': 'channeling-blood',
  'azure-dragon': 'channeling-azure', 'white-tiger': 'channeling-tiger', 'xuanwu-toxin': 'channeling-xuanwu', 'phoenix-inferno': 'channeling-phoenix', 'great-sage-staff': 'channeling-sage',
  magmaLord: 'channeling-magma', tempestArchon: 'channeling-tempest', steamSovereign: 'channeling-steam', quagmireColossus: 'channeling-quagmire', blizzardArchon: 'channeling-blizzard', sandstormTitan: 'channeling-sandstorm' };

// ==== Shared helpers for the Cultivation apex effects below ====
// Current on-screen point of an enemy (follows slide-backs); remembers the last point after it dies.
function enemyPt(f, uid, size) {
  f._pos ??= {};
  const e = battle.enemies.find(v => v.uid === uid && !v.gone && v.hp > 0);
  if (e) f._pos[uid] = trackPoint(visualTrackP(e), size);
  return f._pos[uid] || null;
}
function burstColors(x, y, n, colors, speed = 1, life = 0.4, up = false) {
  for (let i = 0; i < n; i++) {
    const a = up ? -Math.PI * (0.15 + Math.random() * 0.7) : Math.random() * Math.PI * 2, v = (60 + Math.random() * 140) * speed;
    emitParticle(0, x, y, Math.cos(a) * v, Math.sin(a) * v, life * (0.7 + Math.random() * 0.6), 1.1 + Math.random() * 1.4, colors[i % colors.length]);
  }
}
function droplets(x, y, n, color, speed = 1) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + Math.random() * 0.8), v = (80 + Math.random() * 150) * speed;
    emitParticle(2, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.45 + Math.random() * 0.35, 1.2 + Math.random() * 1.6, color);
  }
}
function channelLabel(ctx, cx, cy, text, prog, fg, bg) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = fg;
  ctx.fillText(text, cx, cy - 80);
  ctx.fillStyle = bg;
  ctx.fillRect(cx - 48, cy - 72, 96, 5);
  ctx.fillStyle = fg;
  ctx.fillRect(cx - 48, cy - 72, 96 * Math.min(1, prog), 5);
  ctx.restore();
}
const quadPt = (x0, y0, cx, cy, x1, y1, k) => ({ x: (1 - k) * (1 - k) * x0 + 2 * (1 - k) * k * cx + k * k * x1, y: (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * cy + k * k * y1 });
// Unit-centred channel ring (like Sword Immortal's): count items orbit (cx, cy), drawing in and rising as prog grows.
// draw(x, y, i, depth, appear, angle) renders one item; depth 0.65 (behind) .. 1 (in front).
function channelRing(cx, cy, prog, count, r0, r1, draw) {
  const radius = r0 - (r0 - r1) * prog, lift = 6 + 14 * prog, now = battle.time;
  for (let i = 0; i < count; i++) {
    const appear = Math.min(1, Math.max(0, (prog - (i / count) * 0.4) / 0.12));
    if (appear <= 0) continue;
    const a = (i / count) * Math.PI * 2 + prog * 1.6 + now * 0.6;
    const tremble = prog > 0.8 ? Math.sin(now * 90 + i * 1.7) * (prog - 0.8) * 8 : 0;
    draw(cx + Math.cos(a) * radius + tremble, cy + Math.sin(a) * radius * 0.45 - lift, i, 0.65 + 0.35 * (Math.sin(a) + 1) / 2, appear, a);
  }
}

// ==== Talisman Sovereign · Imperial Ink Decree (Hoàng Kim Thánh Chỉ) ====
// Gather: a ring of talismans orbits and tightens around the Sovereign while a golden imperial scroll unrolls
// above and golden script is written column by column (right to left), sealed with a red imperial stamp.
// Release: talismans fly from the scroll and seal onto enemies one by one (schedule.hits); executes burn in gold.
const GOLD_RGB = '250, 204, 21';
function drawTalismanPaper(ctx, x, y, ang, k, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k);
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-6, -10, 12, 20);
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.2;
  ctx.strokeRect(-5, -9, 10, 18);
  ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';   // abstract talisman sigil strokes
  ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.moveTo(0, -7); ctx.lineTo(0, 6); ctx.moveTo(-3, -1); ctx.quadraticCurveTo(0, 2, 3, -1); ctx.moveTo(-2, 4); ctx.lineTo(2, 4); ctx.stroke();
  ctx.restore();
}
// Golden script: brush strokes in 6 vertical columns, generated once (normalised 0..1 scroll coordinates).
const SCRIPT_STROKES = (() => {
  const out = [];
  for (let c = 0; c < 6; c++) {
    const x = 0.86 - c * 0.14;                     // columns from right to left
    for (let s = 0; s < 6; s++) {
      const seed = c * 31 + s * 7.7, y0 = 0.16 + s * 0.12 + (hash01(seed) - 0.5) * 0.04, kind = Math.floor(hash01(seed + 1) * 4);
      const dx = (hash01(seed + 2) - 0.5) * 0.06, len = 0.06 + hash01(seed + 3) * 0.05;
      const st = kind === 0 ? [x - 0.035, y0, x + dx, y0 - 0.02, x + 0.035, y0 + 0.01]          // horizontal
        : kind === 1 ? [x + dx * 0.3, y0 - 0.02, x + dx, y0 + len * 0.5, x - dx * 0.4, y0 + len]  // vertical
        : kind === 2 ? [x + 0.02, y0, x - 0.01, y0 + 0.03, x - 0.035, y0 + len]                  // left-falling
        : [x - 0.01, y0, x + 0.01, y0 + 0.03, x + 0.035, y0 + len];                               // right-falling
      out.push({ st, w: 1.6 + hash01(seed + 4) * 1.8, order: (c + s / 6) / 6 });
    }
  }
  return out;
})();
function scrollGeom(cx, cy) { return { x: cx, y: Math.max(52, cy - 128), w: 230, h: 64 }; }
function drawImperialSeal(ctx, x, y, s, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.06);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-12, -12, 24, 24);
  ctx.strokeStyle = '#fee2e2'; ctx.lineWidth = 1.4;     // carved border and a square-spiral seal pattern
  ctx.strokeRect(-10, -10, 20, 20);
  ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, -7); ctx.lineTo(7, 7); ctx.lineTo(-4, 7); ctx.lineTo(-4, -4); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.lineTo(-1, 4); ctx.lineTo(-1, -1); ctx.stroke();
  ctx.restore();
}
function drawImperialScroll(ctx, g, open, write, glow, alpha, time, seal = 0) {
  if (alpha <= 0 || open <= 0) return;
  const w = g.w * open, x0 = g.x - w / 2, y0 = g.y - g.h / 2;
  additiveGlow(ctx, g.x, g.y, 95 + 40 * glow, GOLD_RGB, (0.22 + 0.4 * glow) * alpha);
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const bg = ctx.createLinearGradient(0, y0, 0, y0 + g.h);
  bg.addColorStop(0, '#f6e4b8'); bg.addColorStop(0.5, '#fbeccc'); bg.addColorStop(1, '#e3c78a');
  ctx.fillStyle = bg;
  ctx.fillRect(x0, y0, w, g.h);
  ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2;
  ctx.strokeRect(x0 + 3, y0 + 3, w - 6, g.h - 6);
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)'; ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 6, y0 + 6, w - 12, g.h - 12);
  // Golden script written right to left; each stroke appears once the brush reaches its place in the order
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, w, g.h); ctx.clip();
  ctx.lineCap = 'round';
  for (const s of SCRIPT_STROKES) {
    const k = Math.min(1, Math.max(0, (write - s.order) * 8));
    if (k <= 0) continue;
    const [ax, ay, bx, by, cx2, cy2] = s.st, px = v => g.x - g.w / 2 + v * g.w, py = v => y0 + v * g.h;
    const end = quadPt(px(ax), py(ay), px(bx), py(by), px(cx2), py(cy2), k);
    ctx.strokeStyle = '#a16207'; ctx.lineWidth = s.w;
    ctx.beginPath(); ctx.moveTo(px(ax), py(ay));
    ctx.quadraticCurveTo(px(ax) + (px(bx) - px(ax)) * k, py(ay) + (py(by) - py(ay)) * k, end.x, end.y);
    ctx.stroke();
  }
  ctx.restore();
  if (glow > 0.2 && write > 0) {                               // gold sheen over the script
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${GOLD_RGB}, ${0.12 * glow})`;
    ctx.fillRect(x0, y0, w, g.h);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (write > 0 && write < 1) {                                 // brush tip at the writing front
    const s = SCRIPT_STROKES.reduce((best, v) => Math.abs(v.order - write) < Math.abs(best.order - write) ? v : best);
    const bx = g.x - g.w / 2 + s.st[4] * g.w, by = y0 + s.st[5] * g.h;
    ctx.fillStyle = '#1c1208';
    ctx.beginPath(); ctx.ellipse(bx, by - 6 + Math.sin(time * 30) * 2, 2.6, 7, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx + 2, by - 12); ctx.lineTo(bx + 12, by - 34); ctx.stroke();
  }
  for (const sx of [x0, x0 + w]) {                              // rollers
    ctx.fillStyle = '#5b3a1a';
    ctx.fillRect(sx - 4, y0 - 7, 8, g.h + 14);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(sx - 5, y0 - 10, 10, 4);
    ctx.fillRect(sx - 5, y0 + g.h + 6, 10, 4);
  }
  ctx.restore();
  if (seal > 0) drawImperialSeal(ctx, x0 + 26, g.y + 8, 1 + 0.6 * (1 - seal), Math.min(1, seal * 2) * alpha);
}
function drawTalismanGather(ctx, cx, cy, prog, size) {
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '24, 14, 4');
  const g = scrollGeom(cx, cy), write = Math.min(1, Math.max(0, (prog - 0.3) / 0.55));
  drawImperialScroll(ctx, g, easeOut(Math.min(1, prog / 0.35)), write, prog, 1, battle.time, Math.max(0, (prog - 0.88) / 0.12));
  additiveGlow(ctx, cx, cy, 48 + 40 * prog, GOLD_RGB, 0.2 + 0.45 * prog);
  channelRing(cx, cy, prog, 10, 80, 44, (x, y, i, depth, appear, a) => {
    additiveGlow(ctx, x, y, 14, GOLD_RGB, 0.45 * appear);
    drawTalismanPaper(ctx, x, y + Math.sin(battle.time * 5 + i) * 2, Math.cos(a) * 0.3, 1.25, appear * depth);
  });
  channelLabel(ctx, cx, cy + 150, '📜 HOÀNG KIM THÁNH CHỈ', prog, '#fde047', '#451a03');
}
function drawTalismanDecree(ctx, f, size) {
  const t = (f.maxTtl || 1.6) - f.ttl, sch = f.schedule || { hits: [] };
  const o = routePoint(f.x, f.y, size), g = scrollGeom(o.x, o.y), FLIGHT = 0.25;
  f._landed ??= {};
  dimFocus(ctx, size, o.x, o.y, 0.45 * Math.max(0, 1 - Math.max(0, t - 0.9) / 0.4), '24, 14, 4');
  drawImperialScroll(ctx, g, 1, 1, t < 0.2 ? 1.6 : 1, Math.max(0, 1 - Math.max(0, t - 0.95) / 0.4), battle.time, 1);
  if (t < 0.25) additiveGlow(ctx, g.x - g.w / 2 + 26, g.y + 8, 40, '248, 113, 113', 0.8 * (1 - t / 0.25));   // the seal flares
  for (const h of sch.hits) {
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    if (t < h.at) {
      if (t < h.at - FLIGHT) continue;
      const k = (t - (h.at - FLIGHT)) / FLIGHT, side = (hash01(h.uid) - 0.5) * 140;
      const q = quadPt(g.x, g.y, (g.x + p.x) / 2 + side, Math.min(g.y, p.y) - 40, p.x, p.y - 26, k * k);
      additiveGlow(ctx, q.x, q.y, 16, GOLD_RGB, 0.7);
      drawTalismanPaper(ctx, q.x, q.y, k * 9 + h.uid, 1.3, 1);
      continue;
    }
    if (!f._landed[h.uid]) { f._landed[h.uid] = true; burstColors(p.x, p.y - 20, 12, ['#fde047', '#ffffff', '#f87171'], 1, 0.4); }
    const since = t - h.at;
    if (since < 0.35) {                                         // seal: a red-gold stamp ring
      const q = since / 0.35;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(248, 113, 113, ${0.9 * (1 - q)})`; ctx.lineWidth = 3 * (1 - q);
      ctx.strokeRect(p.x - 8 - q * 14, p.y - 30 - q * 14, 16 + q * 28, 22 + q * 28);
      ctx.restore();
      additiveGlow(ctx, p.x, p.y - 20, 30, GOLD_RGB, 0.7 * (1 - q));
    }
  }
}
function drawTalismanShot(ctx, x, y, tx, ty, prog, f) {
  const FLIGHT = 0.6;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT, px = x + (tx - x) * k, py = y + (ty - 26 - y) * k - Math.sin(k * Math.PI) * 20;
    additiveGlow(ctx, px, py, 12, GOLD_RGB, 0.5);
    drawTalismanPaper(ctx, px, py, k * 12, 1, 1);
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._hit) { f._hit = true; burstColors(tx, ty - 20, 6, ['#fde047', '#ffffff'], 0.7, 0.3); }
  additiveGlow(ctx, tx, ty - 22, 20, GOLD_RGB, 0.6 * (1 - q));
}
function drawTalismanBurn(ctx, tx, ty, prog, f) {
  if (!f._burnt) {
    f._burnt = true;
    for (let i = 0; i < 18; i++) emitParticle(0, tx + (Math.random() - 0.5) * 16, ty - 10, (Math.random() - 0.5) * 60, -80 - Math.random() * 140, 0.4 + Math.random() * 0.4, 1.4 + Math.random() * 1.6, Math.random() < 0.5 ? '#fde047' : '#fb923c');
  }
  additiveGlow(ctx, tx, ty - 14, 40 * (1 - prog * 0.5), '251, 146, 60', 0.8 * (1 - prog));
  drawTalismanPaper(ctx, tx, ty - 26 - prog * 10, prog * 2, 1.2 * (1 - prog), 1 - prog);
}

// ==== Landscape Sage · Mountain-River Ink Dragon (Sơn Hà Mực Long) ====
// Gather: ink strokes spiral in around the Sage while the board takes an ink-wash look and a large dragon is
// painted stroke by stroke above. Release: the dragon flies counter-clockwise along the track from the exit
// end; enemies are struck, stunned (ink swirl) and bosses dragged back as its head passes (schedule.hits).
const INK = '#0c0c0e';
function drawInkWash(ctx, size, cx, cy, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.fillStyle = `rgba(236, 232, 220, ${0.2 * alpha})`;        // rice-paper wash
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
  dimFocus(ctx, size, cx, cy, 0.35 * alpha, '10, 10, 12');
}
// pts run tail → head; W scales body thickness. reveal 0..1 paints from the tail; the head appears at the end.
const INK_PAL = { ink: INK, halo: 'rgba(55, 55, 60, 0.22)', belly: 'rgba(120, 120, 126, 0.55)', streak: 'rgba(160, 160, 166, 0.35)', scale: 'rgba(205, 205, 212, 0.5)', eye: '110, 231, 183' };
const AZURE_PAL = { ink: '#0c4a6e', halo: 'rgba(56, 189, 248, 0.35)', belly: 'rgba(186, 230, 253, 0.75)', streak: 'rgba(224, 242, 254, 0.5)', scale: 'rgba(224, 242, 254, 0.8)', eye: '255, 255, 255' };
let DRAGON_PAL = INK_PAL;   // drawInkDragon colours; swapped for the Azure Dragon spirit
function drawInkDragon(ctx, pts, reveal, alpha, time, W = 1) {
  if (alpha <= 0 || pts.length < 3) return;
  const N = pts.length, n = Math.max(2, Math.floor(N * reveal));
  const width = u => W * (5 + 17 * Math.sin(Math.min(1, u * 1.05) * Math.PI * 0.95 + 0.05));
  const nrm = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1; return { x: -dy / d, y: dx / d, tx: dx / d, ty: dy / d }; };
  const off = (i, k) => { const m = nrm(i); return { x: pts[i].x + m.x * k, y: pts[i].y + m.y * k }; };
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg = (i, w, style, dx = 0) => { const a = off(i - 1, dx), b = off(i, dx); ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
  for (let i = 1; i < n; i++) seg(i, width(i / (N - 1)) + 16, DRAGON_PAL.halo);           // wash halo
  // Legs (behind the body): front pair near the head, back pair mid-body; they paddle while flying
  for (const [u, ph] of [[0.42, 0], [0.47, 1.4], [0.8, 0.7], [0.85, 2.1]]) {
    const i = Math.floor(u * (N - 1));
    if (i >= n - 1 || i < 1) continue;
    const m = nrm(i), w = width(u), swing = Math.sin(time * 7 + ph) * 0.5;
    const hip = off(i, w * 0.35), knee = { x: hip.x + (m.x * 0.9 - m.tx * (0.4 + swing)) * 16 * W, y: hip.y + (m.y * 0.9 - m.ty * (0.4 + swing)) * 16 * W };
    const foot = { x: knee.x + (m.x * 0.5 + m.tx * 0.7) * 13 * W, y: knee.y + (m.y * 0.5 + m.ty * 0.7) * 13 * W };
    ctx.strokeStyle = DRAGON_PAL.ink; ctx.lineWidth = 5 * W;
    ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(knee.x, knee.y); ctx.lineTo(foot.x, foot.y); ctx.stroke();
    ctx.lineWidth = 1.6 * W;                                                  // three claws
    for (let c = -1; c <= 1; c++) { ctx.beginPath(); ctx.moveTo(foot.x, foot.y); ctx.lineTo(foot.x + (m.tx + c * m.x * 0.6) * 7 * W, foot.y + (m.ty + c * m.y * 0.6) * 7 * W); ctx.stroke(); }
  }
  // Dorsal mane: flame-like spikes along the back
  ctx.fillStyle = DRAGON_PAL.ink;
  for (let i = 4; i < n - 3; i += 3) {
    const u = i / (N - 1), m = nrm(i), w = width(u), base = off(i, -w * 0.45), len = (6 + w * 0.5) * (0.8 + 0.4 * Math.sin(time * 4 + i));
    ctx.beginPath();
    ctx.moveTo(base.x - m.tx * 4 * W, base.y - m.ty * 4 * W);
    ctx.quadraticCurveTo(base.x - m.x * len * 0.6 + m.tx * 2, base.y - m.y * len * 0.6 + m.ty * 2, base.x - m.x * len - m.tx * len * 0.5, base.y - m.y * len - m.ty * len * 0.5);
    ctx.lineTo(base.x + m.tx * 4 * W, base.y + m.ty * 4 * W);
    ctx.fill();
  }
  for (let i = 1; i < n; i++) seg(i, width(i / (N - 1)), DRAGON_PAL.ink);                                       // body
  for (let i = 2; i < n; i++) seg(i, width(i / (N - 1)) * 0.32, DRAGON_PAL.belly, width(i / (N - 1)) * 0.28);   // belly band
  ctx.setLineDash([7, 5]);                                                                           // dry-brush streaks
  for (let i = 2; i < n; i += 2) for (const k of [-0.25, 0.05]) seg(i, 1, DRAGON_PAL.streak, width(i / (N - 1)) * k);
  ctx.setLineDash([]);
  ctx.strokeStyle = DRAGON_PAL.scale; ctx.lineWidth = 1;                                 // scale rows
  for (let i = 3; i < n - 2; i += 2) {
    const u = i / (N - 1), m = nrm(i), w = width(u), ang = Math.atan2(m.ty, m.tx);
    for (const k of [-0.18, 0.1]) { const p = off(i, w * k); ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2, w * 0.16), ang + Math.PI * 0.55, ang + Math.PI * 1.45); ctx.stroke(); }
  }
  if (reveal > 0.05) {                                                                              // brushy tail fin
    const m = nrm(0), t0 = pts[0];
    ctx.strokeStyle = DRAGON_PAL.ink; ctx.lineWidth = 2 * W;
    for (let k = -2; k <= 2; k++) {
      const sp = k * 0.35 + Math.sin(time * 5 + k) * 0.08;
      ctx.beginPath(); ctx.moveTo(t0.x, t0.y);
      ctx.quadraticCurveTo(t0.x - m.tx * 12 * W + m.x * k * 6 * W, t0.y - m.ty * 12 * W + m.y * k * 6 * W, t0.x - (m.tx * Math.cos(sp) - m.x * Math.sin(sp)) * 24 * W, t0.y - (m.ty * Math.cos(sp) - m.y * Math.sin(sp)) * 24 * W);
      ctx.stroke();
    }
  }
  if (reveal >= 0.98) {                                                                             // head
    const h = pts[N - 1], m = nrm(N - 1), ang = Math.atan2(m.ty, m.tx), sw = Math.sin(time * 8);
    ctx.save();
    ctx.translate(h.x, h.y); ctx.rotate(ang); ctx.scale(W, W);
    ctx.strokeStyle = DRAGON_PAL.ink; ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) {                                // mane streaming back from the head
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-4, -4 + k * 1.5);
      ctx.quadraticCurveTo(-18, -14 + k * 4 + Math.sin(time * 6 + k) * 3, -34 - k * 2, -10 + k * 5 + Math.sin(time * 6 + k) * 5); ctx.stroke();
    }
    ctx.fillStyle = DRAGON_PAL.ink;
    ctx.beginPath(); ctx.ellipse(2, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill();         // skull
    ctx.beginPath(); ctx.moveTo(8, -7); ctx.quadraticCurveTo(24, -7, 30, -2); ctx.lineTo(22, 0); ctx.lineTo(8, 2); ctx.fill();   // upper snout
    ctx.beginPath(); ctx.moveTo(8, 4); ctx.quadraticCurveTo(20, 8 + sw, 27, 7 + sw * 2); ctx.lineTo(10, 8); ctx.fill();          // open lower jaw
    ctx.fillStyle = '#e5e7eb';                                                             // fangs
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(21.5, 4); ctx.lineTo(23, 0); ctx.fill();
    ctx.lineWidth = 2.6;                                                                  // branching horns
    for (const sgn of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(-2, sgn * 6); ctx.quadraticCurveTo(-10, sgn * 16, -22, sgn * 18); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-12, sgn * 14); ctx.lineTo(-14, sgn * 22); ctx.stroke(); ctx.lineWidth = 2.6;
    }
    ctx.lineWidth = 1.2;                                                                  // long whiskers
    ctx.beginPath(); ctx.moveTo(24, -4); ctx.bezierCurveTo(36, -14 + sw * 4, 48, -2 + sw * 6, 60, -12 + sw * 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24, 4); ctx.bezierCurveTo(36, 14 - sw * 4, 48, 4 - sw * 6, 58, 14 - sw * 5); ctx.stroke();
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.ellipse(8, -4, 3.2, 2, -0.2, 0, Math.PI * 2); ctx.fill();   // eye
    ctx.restore();
    additiveGlow(ctx, h.x + Math.cos(ang) * 8 * W + Math.sin(ang) * 4 * W, h.y + Math.sin(ang) * 8 * W - Math.cos(ang) * 4 * W, 7 * W, DRAGON_PAL.eye, 1);
  }
  ctx.restore();
}
function drawLandscapeGather(ctx, cx, cy, prog, size) {
  drawInkWash(ctx, size, cx, cy, Math.min(1, prog / 0.25));
  const now = battle.time;
  ctx.save();                                                                   // ink strokes spiralling in
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const ph = (now * 0.9 + i / 6) % 1, r = 118 * (1 - ph) + 26, a0 = i * 1.05 + ph * 3.2;
    ctx.strokeStyle = `rgba(12, 12, 14, ${Math.min(1, prog * 2) * (0.25 + 0.6 * ph)})`;
    ctx.lineWidth = 2 + 6 * ph;
    ctx.beginPath(); ctx.ellipse(cx, cy + 6, r, r * 0.45, 0, a0, a0 + 1.1); ctx.stroke();
  }
  ctx.restore();
  const pts = [];
  for (let i = 0; i <= 56; i++) {
    const u = i / 56;
    pts.push({ x: cx - 140 + 280 * u, y: Math.max(40, cy - 96) + Math.sin(u * Math.PI * 3) * 26 * (0.6 + 0.4 * u) });
  }
  drawInkDragon(ctx, pts, Math.min(1, prog / 0.9), 1, now, 1.25);
  if (Math.random() < 0.3 && prog < 0.9) {                                       // ink flicks off the brush
    const i = Math.floor(pts.length * Math.min(1, prog / 0.9)) - 1, p = pts[Math.max(0, i)];
    emitParticle(2, p.x, p.y, (Math.random() - 0.5) * 120, -40 - Math.random() * 80, 0.5, 1.5 + Math.random() * 1.5, INK);
  }
  channelLabel(ctx, cx, cy + 150, '🐉 SƠN HÀ MỰC LONG', prog, '#d1fae5', '#1f2937');
}
function drawLandscapeDragon(ctx, f, size) {
  const t = (f.maxTtl || 3) - f.ttl, sch = f.schedule || { hits: [], start: 0.15, speed: 20 };
  const o = routePoint(f.x, f.y, size), end = sch.start + 16 / sch.speed, time = battle.time;
  f._landed ??= {};
  drawInkWash(ctx, size, o.x, o.y, Math.max(0, 1 - Math.max(0, t - end - 0.2) / 0.5));
  // Head position along the track: emerges at the exit (16) and flies back toward the spawn (0)
  const head = 16 - Math.max(0, t - sch.start) * sch.speed, BODY = 6;
  if (t < sch.start) {                                                           // emergence: an ink splash at the exit
    const q = trackPoint(15.9, size), k = t / sch.start;
    additiveGlow(ctx, q.x, q.y, 30 * k, '110, 231, 183', 0.5 * k);
    if (!f._splash) { f._splash = true; droplets(q.x, q.y, 18, INK, 1.3); }
  } else {
    const fade = Math.max(0, 1 - Math.max(0, t - end) / 0.35);
    const pts = [];
    for (let p = Math.min(15.999, head + BODY); p >= Math.max(0, head); p -= 0.1) {   // tail → head
      const q = trackPoint(p, size), wig = Math.sin(p * 2.4 + time * 8) * 12;
      const n2 = trackPoint(Math.max(0, p - 0.1), size), dx = n2.x - q.x, dy = n2.y - q.y, d = Math.hypot(dx, dy) || 1;
      pts.push({ x: q.x - (dy / d) * wig, y: q.y + (dx / d) * wig - 14 });
    }
    drawInkDragon(ctx, pts, 1, fade, time, 1.45);
    if (head > 0 && Math.random() < 0.6) { const q = trackPoint(Math.min(15.99, head + BODY), size); emitParticle(1, q.x, q.y, (Math.random() - 0.5) * 20, -10, 0.7, 6, '#1f2937'); }
  }
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    if (!f._landed[h.uid]) { f._landed[h.uid] = true; droplets(p.x, p.y - 6, 12, INK, 1.1); burstColors(p.x, p.y - 8, 6, ['#6ee7b7', '#ffffff'], 0.8, 0.35); nudgeEnemy(h.uid, 0, 7, 0.5); }
    const e = battle.enemies.find(v => v.uid === h.uid);
    if (!e || e.gone || e.hp <= 0) continue;
    if (e.warpFx && time - e.warpFx.at < 0.6) {                                   // boss dragged back: ink trail
      const vp = visualTrackP(e), a = 1 - (time - e.warpFx.at) / 0.6;
      ctx.save(); ctx.strokeStyle = `rgba(12, 12, 14, ${0.7 * a})`; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let pp = vp, i = 0; pp <= e.warpFx.from + 0.001; pp += 0.15, i++) { const q = trackPoint(pp, size); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
      ctx.stroke(); ctx.restore();
    }
    if ((e.frozenUntil || 0) > battle.time) {                                     // stun: a turning ink swirl
      ctx.save();
      ctx.translate(p.x, p.y - 30); ctx.rotate(time * 5);
      ctx.strokeStyle = 'rgba(12, 12, 14, 0.85)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let a = 0; a < 3; a++) {
        ctx.beginPath();
        for (let s = 0; s <= 10; s++) { const r = 2 + s * 0.9, th = a * 2.094 + s * 0.35; if (s) ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r * 0.6); else ctx.moveTo(Math.cos(th) * r, Math.sin(th) * r * 0.6); }
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
function drawInkFlick(ctx, x, y, tx, ty, prog, f) {
  const FLIGHT = 0.55;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT;
    ctx.save();
    ctx.fillStyle = INK;
    for (let i = 0; i < 4; i++) {                                                  // blob with trailing droplets
      const qq = quadPt(x, y, (x + tx) / 2, Math.min(y, ty) - 50, tx, ty, Math.max(0, k - i * 0.05));
      ctx.globalAlpha = 1 - i * 0.22;
      ctx.beginPath(); ctx.arc(qq.x, qq.y, 5 - i, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._splat) { f._splat = true; droplets(tx, ty, 8, INK, 0.7); }
  ctx.save();
  ctx.globalAlpha = 0.85 * (1 - q * 0.6);
  ctx.fillStyle = INK;
  for (let i = 0; i < 5; i++) {
    const a = hash01(tx * 0.37 + i) * 6.28 + i * 1.3, r = 3 + i * 1.2 + q * 6;
    ctx.beginPath(); ctx.ellipse(tx + Math.cos(a) * r, ty + 4 + Math.sin(a) * r * 0.4, 4 + q * 3, 2 + q, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// Ink puddles on the track (Landscape Sage normal attack): they slow runners, so draw them where they are.
function drawInkPuddles(ctx, size) {
  for (const pd of battle.inkPuddles || []) {
    const left = pd.until - battle.time;
    if (left <= 0) continue;
    const grow = Math.min(1, Math.max(0, (battle.time - (pd.at ?? pd.until - 2)) / 0.2)), a = Math.min(1, left / 0.4) * grow;
    const c = ringTile(((pd.p % 16) + 16) % 16, size);
    ctx.save();
    ctx.globalAlpha = 0.6 * a;
    ctx.fillStyle = INK;
    for (let i = 0; i < 4; i++) {
      const ox = (hash01(pd.p * 7 + i) - 0.5) * 22, oy = (hash01(pd.p * 3 + i + 9) - 0.5) * 8;
      ctx.beginPath(); ctx.ellipse(c.x + ox, c.y + 8 + oy, (12 + hash01(pd.p + i) * 8) * grow, (4 + hash01(pd.p * 5 + i) * 3) * grow, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ==== Soul-Reaping Heavenly Demon · Ten-Thousand Soul Banner (Vạn Hồn Bạo Phá) ====
// Gather: souls spiral into the Demon from all around while a torn black silk banner unfurls behind it.
// Release: a wisp leaves the banner for each enemy and explodes on arrival (schedule.hits).
const SOUL_RGB = '187, 247, 208', SOUL_DEEP = '34, 197, 94';
function drawWisp(ctx, x, y, vx, vy, r, alpha) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, r * 3.2, SOUL_RGB, 0.55 * alpha);
  const sp = Math.hypot(vx, vy) || 1, tx = -vx / sp, ty = -vy / sp;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  const g = ctx.createLinearGradient(x, y, x + tx * r * 5, y + ty * r * 5);
  g.addColorStop(0, `rgba(${SOUL_RGB}, 0.9)`); g.addColorStop(1, `rgba(${SOUL_DEEP}, 0)`);
  ctx.strokeStyle = g; ctx.lineWidth = r * 1.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tx * r * 5, y + ty * r * 5); ctx.stroke();
  ctx.fillStyle = '#f0fdf4';
  ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function bannerGeom(cx, cy) { const top = Math.max(30, cy - 170); return { px: cx + 34, top, bottom: cy - 14, cx: cx - 4, cy: top + 62 }; }
// Torn black silk banner on a crossbar: fold shading, embroidered edge, frayed hem, tassels, bronze finial, green mist.
function drawSoulBanner(ctx, g, unfurl, glow, alpha, time) {
  if (alpha <= 0) return;
  const w = 66, h = 118 * unfurl, x1 = g.px - 5, x0 = x1 - w, y0 = g.top + 6;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const pole = ctx.createLinearGradient(g.px - 3, 0, g.px + 3, 0);                  // lacquered pole with bronze bands
  pole.addColorStop(0, '#1c1917'); pole.addColorStop(0.5, '#57534e'); pole.addColorStop(1, '#1c1917');
  ctx.fillStyle = pole; ctx.fillRect(g.px - 3, g.top - 6, 6, g.bottom - g.top + 6);
  ctx.fillStyle = '#a16207';
  for (const yy of [g.top + 2, g.top + 40, g.bottom - 10]) ctx.fillRect(g.px - 4, yy, 8, 3);
  ctx.fillStyle = '#ca8a04';                                                         // bronze spear finial
  ctx.beginPath(); ctx.moveTo(g.px, g.top - 26); ctx.lineTo(g.px + 5, g.top - 10); ctx.lineTo(g.px, g.top - 6); ctx.lineTo(g.px - 5, g.top - 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3f2a14'; ctx.fillRect(x0 - 6, y0 - 3, w + 10, 5);               // crossbar
  ctx.fillStyle = '#a16207'; ctx.fillRect(x0 - 9, y0 - 4, 5, 7);
  if (h > 4) {
    const cols = 14, edge = [];                                                     // waving cloth outline
    for (let i = 0; i <= cols; i++) {
      const u = i / cols, x = x0 + u * w + Math.sin(time * 4 + u * 5) * 3 * unfurl;
      const tear = hash01(i * 3.7) * 0.22 + (i === 4 || i === 10 ? 0.28 : 0);      // ragged hem with two deep tears
      edge.push({ x: x + Math.sin(time * 5 + u * 7) * 4 * unfurl, y: y0 + h * (1 - tear) });
    }
    const outline = () => {
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0);
      for (let i = cols; i >= 0; i--) ctx.lineTo(edge[i].x, edge[i].y);
      ctx.closePath();
    };
    outline();
    const fold = ctx.createLinearGradient(x0, 0, x1, 0);                            // vertical folds
    fold.addColorStop(0, '#0b0b0c'); fold.addColorStop(0.18, '#1d1d20'); fold.addColorStop(0.32, '#070708');
    fold.addColorStop(0.55, '#19191c'); fold.addColorStop(0.72, '#060607'); fold.addColorStop(0.88, '#18181b'); fold.addColorStop(1, '#09090a');
    ctx.fillStyle = fold; ctx.fill();
    ctx.save(); ctx.clip();
    const shade = ctx.createLinearGradient(0, y0, 0, y0 + h);
    shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = shade; ctx.fillRect(x0 - 10, y0, w + 20, h);
    ctx.strokeStyle = `rgba(${SOUL_RGB}, ${0.25 + 0.3 * glow})`; ctx.lineWidth = 1.2; ctx.setLineDash([3, 2]);   // embroidered edging
    ctx.strokeRect(x0 + 5, y0 + 5, w - 10, h * 0.62);
    ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = '#27272a'; ctx.lineWidth = 0.8;                                // frayed threads at the hem
    for (let i = 1; i < cols; i += 2) { const p = edge[i]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.sin(time * 6 + i) * 2, p.y + 5 + hash01(i) * 6); ctx.stroke(); }
    ctx.globalCompositeOperation = 'lighter';                                        // glowing 魂
    ctx.fillStyle = `rgba(${SOUL_RGB}, ${Math.min(1, (0.45 + 0.55 * glow) * (0.85 + 0.15 * Math.sin(time * 9)))})`;
    ctx.font = '900 30px "Noto Serif SC", "SimSun", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('魂', x0 + w / 2, y0 + Math.min(h * 0.4, 46));
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1.5;                                   // tassels at the crossbar ends
  for (const tx of [x0 - 6, x1 + 2]) {
    const sway = Math.sin(time * 3 + tx) * 2;
    ctx.beginPath(); ctx.moveTo(tx, y0); ctx.lineTo(tx + sway, y0 + 16); ctx.stroke();
    ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.arc(tx + sway, y0 + 18, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  additiveGlow(ctx, x0 + w / 2, y0 + 46, 64, SOUL_RGB, (0.18 + 0.4 * glow) * alpha);
  for (let i = 0; i < 4; i++) {                                                       // green mist rising off the cloth
    const ph = (time * 0.6 + i / 4) % 1;
    additiveGlow(ctx, x0 + w * (0.2 + 0.6 * hash01(i * 5.5)), y0 + h * 0.8 - ph * 70, 14 + ph * 10, SOUL_RGB, 0.25 * (1 - ph) * alpha * unfurl);
  }
}
function drawSoulGather(ctx, cx, cy, prog, size, u) {
  const time = battle.time, souls = u?.souls || 0, g = bannerGeom(cx, cy);
  dimFocus(ctx, size, cx, cy, 0.5 * Math.min(1, prog / 0.25), '2, 10, 5');
  drawSoulBanner(ctx, g, easeOut(Math.min(1, prog / 0.45)), prog, 1, time);
  const n = Math.min(36, 8 + Math.floor(souls / 3)), appear = Math.min(1, prog / 0.25);
  for (let i = 0; i < n; i++) {                                     // souls spiral in from all around and are absorbed
    const ph = (time * (0.7 + 0.5 * hash01(i * 2.1)) + hash01(i)) % 1, r = 150 * (1 - ph) + 8, a = hash01(i * 7.3) * 6.28 + ph * 4.2;
    const x = cx + Math.cos(a) * r, y = cy - 6 + Math.sin(a) * r * 0.55;
    drawWisp(ctx, x, y, -Math.sin(a) - Math.cos(a) * 1.5, Math.cos(a) * 0.55 - Math.sin(a) * 0.8, 2.4, appear * Math.min(1, ph * 4) * (0.6 + 0.4 * prog));
    if (ph > 0.95) additiveGlow(ctx, cx, cy - 6, 22, SOUL_RGB, 0.5 * appear);
  }
  additiveGlow(ctx, cx, cy, 44 + 34 * prog, SOUL_RGB, 0.18 + 0.4 * prog);
  channelLabel(ctx, cx, cy + 150, `💀 VẠN HỒN BẠO PHÁ · ${souls} souls`, prog, '#bbf7d0', '#052e16');
}
function drawSoulDetonation(ctx, f, size) {
  const t = (f.maxTtl || 1.6) - f.ttl, sch = f.schedule || { hits: [], souls: 0 };
  const o = routePoint(f.x, f.y, size), g = bannerGeom(o.x, o.y), time = battle.time, LAUNCH = 0.2;
  f._landed ??= {};
  dimFocus(ctx, size, o.x, o.y, 0.5 * Math.max(0, 1 - Math.max(0, t - 0.9) / 0.4), '2, 10, 5');
  drawSoulBanner(ctx, g, 1, t < LAUNCH ? 1.4 : 0.8, Math.max(0, 1 - Math.max(0, t - 1.0) / 0.4), time);
  const extra = Math.min(20, Math.floor((sch.souls || 0) / 4));       // spare souls scatter upward
  for (let i = 0; i < extra && t > LAUNCH && t < LAUNCH + 0.9; i++) {
    const k = (t - LAUNCH) / 0.9, a = -Math.PI / 2 + (hash01(i * 5.1) - 0.5) * 2.4, d = 30 + k * 180;
    drawWisp(ctx, g.cx + Math.cos(a) * d, g.cy + Math.sin(a) * d * 0.8, Math.cos(a), Math.sin(a), 2.2, 1 - k);
  }
  for (const h of sch.hits) {
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    if (t < h.at) {
      if (t < LAUNCH) continue;
      const k = (t - LAUNCH) / Math.max(0.05, h.at - LAUNCH), kk = k * k;
      const side = (hash01(h.uid * 1.7) - 0.5) * 160;
      const cxp = (g.cx + p.x) / 2 + side, cyp = Math.min(g.cy, p.y) - 70;
      const q = quadPt(g.cx, g.cy, cxp, cyp, p.x, p.y - 8, kk), q2 = quadPt(g.cx, g.cy, cxp, cyp, p.x, p.y - 8, Math.max(0, kk - 0.03));
      drawWisp(ctx, q.x, q.y, q.x - q2.x, q.y - q2.y, 3.2, 1);
      continue;
    }
    if (!f._landed[h.uid]) { f._landed[h.uid] = true; burstColors(p.x, p.y - 8, 16, ['#bbf7d0', '#22c55e', '#ffffff'], 1.2, 0.45); nudgeEnemy(h.uid, 0, 6, 0.5); }
    const since = t - h.at;
    if (since < 0.35) {
      const q = since / 0.35;
      additiveGlow(ctx, p.x, p.y - 8, 34 * (1 + q), SOUL_RGB, 0.8 * (1 - q));
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${SOUL_RGB}, ${0.8 * (1 - q)})`; ctx.lineWidth = 2.5 * (1 - q);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 + q * 30, 3 + q * 11, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
}
function drawSoulWispShot(ctx, x, y, tx, ty, prog, f) {
  const FLIGHT = 0.7;
  const side = (hash01((f.tx || 0) * 13.1 + (f.ty || 0) * 7.7) - 0.5) * 90;
  const cx = (x + tx) / 2 + side, cy = Math.min(y, ty) - 40;
  if (prog < FLIGHT) {
    const k = prog / FLIGHT, q = quadPt(x, y - 20, cx, cy, tx, ty - 8, k), q2 = quadPt(x, y - 20, cx, cy, tx, ty - 8, Math.max(0, k - 0.06));
    drawWisp(ctx, q.x, q.y, q.x - q2.x, q.y - q2.y, 2.6, 1);
    return;
  }
  const q = (prog - FLIGHT) / (1 - FLIGHT);
  if (!f._hit) { f._hit = true; burstColors(tx, ty - 8, 5, ['#bbf7d0', '#22c55e'], 0.6, 0.3); }
  additiveGlow(ctx, tx, ty - 8, 18, SOUL_RGB, 0.7 * (1 - q));
}
function drawSoulReturn(ctx, x, y, tx, ty, prog) {                    // from the fallen enemy (tx, ty) back to the Demon (x, y)
  const g = bannerGeom(x, y), k = easeOut(prog);
  const q = quadPt(tx, ty - 10, (tx + g.cx) / 2, Math.min(ty, g.cy) - 60, g.cx, g.cy, k);
  const q2 = quadPt(tx, ty - 10, (tx + g.cx) / 2, Math.min(ty, g.cy) - 60, g.cx, g.cy, Math.max(0, k - 0.05));
  drawWisp(ctx, q.x, q.y, q.x - q2.x, q.y - q2.y, 2.4, prog < 0.85 ? 1 : (1 - prog) / 0.15);
}

// ==== Blood-Fiend Sword Master · Boiling Blood Domain (Huyết Hải Cuồng Lộc) ====
// Gather: crimson blades circle and draw in around the Master over a boiling pool of liquid blood.
// Release: the pool floods outward (to the track) at 5 tiles/s with splashes at its edge; as it reaches each
// enemy a large blood sword erupts from cracked ground, and detonated bleeds burst as a geyser (e.bloodBurst).
const BLOOD_RGB = '220, 38, 38';
function bloodPoolPath(ctx, cx, cy, rx, ry, time) {
  ctx.beginPath();
  for (let i = 0; i <= 56; i++) {
    const th = (i / 56) * Math.PI * 2;
    const wob = 1 + 0.07 * Math.sin(th * 5 + time * 2.4) + 0.04 * Math.sin(th * 11 - time * 3.1) + 0.03 * Math.sin(th * 2 + 1.3);
    const x = cx + Math.cos(th) * rx * wob, y = cy + Math.sin(th) * ry * wob;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
}
// Glossy liquid blood: dark core, rim shading, a moving specular sheen, ripples and popping bubbles.
function drawBloodPool(ctx, cx, cy, rx, ry, alpha, time) {
  if (alpha <= 0 || rx <= 1) return;
  ctx.save();
  bloodPoolPath(ctx, cx, cy, rx, ry, time);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  g.addColorStop(0, `rgba(36, 2, 2, ${0.88 * alpha})`);
  g.addColorStop(0.6, `rgba(88, 7, 7, ${0.82 * alpha})`);
  g.addColorStop(0.92, `rgba(127, 18, 18, ${0.78 * alpha})`);
  g.addColorStop(1, `rgba(153, 27, 27, ${0.7 * alpha})`);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = `rgba(30, 2, 2, ${0.9 * alpha})`; ctx.lineWidth = 3; ctx.stroke();        // dark rim
  ctx.save(); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (let r = 0; r < 3; r++) {                                                                // ripples from the centre
    const ph = (time * 0.8 + r / 3) % 1;
    ctx.strokeStyle = `rgba(252, 165, 165, ${0.16 * (1 - ph) * alpha})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * ph, ry * ph, 0, 0, Math.PI * 2); ctx.stroke();
  }
  for (let s = 0; s < 2; s++) {                                                                // specular sheen
    const sx = cx - rx * 0.35 + Math.sin(time * 0.7 + s * 2) * rx * 0.15, sy = cy - ry * 0.4 + s * ry * 0.25;
    const sh = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx * 0.35);
    sh.addColorStop(0, `rgba(255, 228, 228, ${0.22 * alpha})`); sh.addColorStop(1, 'rgba(255, 228, 228, 0)');
    ctx.fillStyle = sh;
    ctx.beginPath(); ctx.ellipse(sx, sy, rx * 0.35, ry * 0.22, -0.2, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 18; i++) {                                                               // bubbles grow and pop
    const ph = (time * 1.4 + hash01(i * 4.4)) % 1, a = hash01(i * 2.2) * 6.28, d = Math.sqrt(hash01(i * 9.1)) * 0.85;
    const bx = cx + Math.cos(a) * rx * d, by = cy + Math.sin(a) * ry * d;
    ctx.strokeStyle = `rgba(254, 202, 202, ${(ph < 0.85 ? 0.4 : (1 - ph) * 2.5) * alpha})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx, by, 1 + ph * 4, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = `rgba(252, 165, 165, ${0.3 * alpha})`; ctx.lineWidth = 1;                  // wet highlight on the rim
  bloodPoolPath(ctx, cx, cy - 1.5, rx * 0.985, ry * 0.97, time); ctx.stroke();
  ctx.restore();
}
// A large crimson sword erupting tip-first from cracked ground: fuller ridge, edge highlight, cross-guard at ground level.
function drawBloodBlade(ctx, x, y, h, alpha, crack = 1) {
  if (alpha <= 0 || h <= 0) return;
  if (crack > 0) {                                                                // ground crack around the base
    ctx.save(); ctx.globalAlpha = Math.min(1, alpha * crack);
    ctx.strokeStyle = '#1c0505'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28 + 0.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 6); ctx.lineTo(x + Math.cos(a + 0.3) * 26, y + Math.sin(a + 0.3) * 9); ctx.stroke(); }
    ctx.restore();
  }
  additiveGlow(ctx, x, y - h * 0.5, h * 0.6, BLOOD_RGB, 0.5 * alpha);
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const w = 9;
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, '#450a0a'); g.addColorStop(0.45, '#dc2626'); g.addColorStop(0.55, '#fca5a5'); g.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w, y - h + 20); ctx.lineTo(x + w * 0.8, y); ctx.lineTo(x - w * 0.8, y); ctx.lineTo(x - w, y - h + 20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(254, 226, 226, 0.75)'; ctx.lineWidth = 1;              // fuller ridge
  ctx.beginPath(); ctx.moveTo(x, y - h + 6); ctx.lineTo(x, y - 4); ctx.stroke();
  ctx.fillStyle = '#2b0606';                                                       // cross-guard
  ctx.beginPath(); ctx.moveTo(x - 17, y - 2); ctx.quadraticCurveTo(x, y - 8, x + 17, y - 2); ctx.lineTo(x + 15, y + 2); ctx.lineTo(x - 15, y + 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(x, y - 3, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawBloodGather(ctx, cx, cy, prog, size) {
  const time = battle.time, r = 96 * easeOut(Math.min(1, prog / 0.85));
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 2, 2');
  drawBloodPool(ctx, cx, cy + 10, r, r * 0.45, 1, time);
  additiveGlow(ctx, cx, cy, 46 + 36 * prog, BLOOD_RGB, 0.2 + 0.45 * prog);
  channelRing(cx, cy, prog, 8, 80, 44, (x, y, i, depth, appear) => drawBloodBlade(ctx, x, y + 8, 34 * appear, appear * depth, 0));
  channelLabel(ctx, cx, cy + 150, '🩸 HUYẾT HẢI CUỒNG LỘC', prog, '#fca5a5', '#450a0a');
}
function drawBloodDomain(ctx, f, size) {
  const t = (f.maxTtl || 1.8) - f.ttl, sch = f.schedule || { hits: [] }, time = battle.time;
  const o = routePoint(f.x, f.y, size), ox1 = routePoint(f.x + 1, f.y, size), oy1 = routePoint(f.x, f.y + 1, size);
  const pxX = ox1.x - o.x, pxY = oy1.y - o.y;
  f._landed ??= {};
  const grow = Math.max(0, (t - 0.1) * 5), R = Math.max(0.6, Math.min(3.4, grow));   // tiles; stops at the track
  const drain = Math.max(0, 1 - Math.max(0, t - 1.1) / 0.6);
  dimFocus(ctx, size, o.x, o.y, 0.3 * drain, '20, 2, 2');            // the pool itself is drawn under the runners (drawBloodGround)
  if (grow > 0.6 && grow < 3.4) for (let i = 0; i < 3; i++) {                       // splashes thrown off the advancing edge
    const a = Math.random() * 6.28, ex = o.x + Math.cos(a) * R * pxX, ey = o.y + 10 + Math.sin(a) * R * pxY;
    emitParticle(2, ex, ey, Math.cos(a) * 60, -60 - Math.random() * 80, 0.4, 1.2 + Math.random() * 1.4, Math.random() < 0.3 ? '#fca5a5' : '#991b1b');
  }
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = enemyPt(f, h.uid, size);
    if (!p) continue;
    const e = battle.enemies.find(v => v.uid === h.uid);
    if (!f._landed[h.uid]) {
      f._landed[h.uid] = true;
      const geyser = !!(e?.bloodBurst?.geyser);
      (f._geyser ??= {})[h.uid] = geyser;
      droplets(p.x, p.y, 14, '#b91c1c', 1.2);
      for (let i = 0; i < 8; i++) emitParticle(2, p.x, p.y + 6, (Math.random() - 0.5) * 160, -90 - Math.random() * 120, 0.6, 1.8 + Math.random() * 2, Math.random() < 0.5 ? '#44403c' : '#57534e');   // ground debris
      if (geyser) for (let i = 0; i < 30; i++) emitParticle(2, p.x + (Math.random() - 0.5) * 10, p.y - 4, (Math.random() - 0.5) * 70, -240 - Math.random() * 220, 0.6 + Math.random() * 0.4, 1.6 + Math.random() * 2, Math.random() < 0.4 ? '#fca5a5' : '#dc2626');
      nudgeEnemy(h.uid, 0, -8, 0.6);
    }
    const since = t - h.at;
    const rise = easeOut(Math.min(1, since / 0.09)), sink = since > 0.6 ? Math.max(0, 1 - (since - 0.6) / 0.3) : 1;
    drawBloodBlade(ctx, p.x, p.y + 10, 84 * rise * sink, sink, sink);
    if (f._geyser?.[h.uid] && since < 0.5) additiveGlow(ctx, p.x, p.y - 60, 52, BLOOD_RGB, 0.7 * (1 - since / 0.5));
  }
}
// Ground layer for Boiling Blood Domain: the flooding pool is drawn before the runners so they stand in it.
function drawBloodGround(ctx, size) {
  for (const f of battle.effects) {
    if (f.type !== 'blood-domain') continue;
    const t = (f.maxTtl || 1.8) - f.ttl, o = routePoint(f.x, f.y, size), ox1 = routePoint(f.x + 1, f.y, size), oy1 = routePoint(f.x, f.y + 1, size);
    const R = Math.max(0.6, Math.min(3.4, Math.max(0, (t - 0.1) * 5))), drain = Math.max(0, 1 - Math.max(0, t - 1.1) / 0.6);
    drawBloodPool(ctx, o.x, o.y + 10, R * (ox1.x - o.x), R * (oy1.y - o.y), 0.65 * drain, battle.time);
  }
}
function drawBloodSlash(ctx, x, y, tx, ty, prog, f) {
  const ang = Math.atan2(ty - y, tx - x), sweep = Math.min(1, prog / 0.55), fade = prog < 0.55 ? 1 : 1 - (prog - 0.55) / 0.45;
  if (!f._hit && prog > 0.3) { f._hit = true; droplets(tx, ty - 6, 7, '#b91c1c', 0.8); }
  ctx.save();
  ctx.translate(tx, ty - 8); ctx.rotate(ang + Math.PI / 2);
  ctx.globalCompositeOperation = 'lighter';
  const a0 = -1.2, a1 = a0 + 2.4 * easeOut(sweep);
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(${BLOOD_RGB}, ${0.5 * fade})`; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(0, 0, 22, a0, a1); ctx.stroke();
  ctx.strokeStyle = `rgba(254, 226, 226, ${0.9 * fade})`; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(0, 0, 22, a0, a1); ctx.stroke();
  ctx.restore();
}

// ==== Sword Immortal normal attack: one jade sword pierces the target and up to 3 enemies behind it ====
// The sword flies from the Immortal to the target, then on through each enemy in schedule.chain (in order),
// leaving a light trail; each pierced enemy gets a slash flash, sparks and a knock. A thin line lingers after.
function drawSwordPierce(ctx, f, size) {
  const t = (f.maxTtl || 0.6) - f.ttl, FLY = 0.34;
  const o = routePoint(f.x, f.y, size), chain = f.schedule?.chain || [];
  const pts = [{ x: o.x, y: o.y - 18 }];
  for (const uid of chain) { const p = enemyPt(f, uid, size); if (p) pts.push({ x: p.x, y: p.y - 12, uid }); }
  if (pts.length < 2) return;
  const a = pts[pts.length - 2], b = pts[pts.length - 1], d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  pts.push({ x: b.x + (b.x - a.x) / d * 70, y: b.y + (b.y - a.y) / d * 70 });         // carries on past the last enemy
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const L = cum[cum.length - 1], s = L * Math.min(1, easeOut(Math.min(1, t / FLY)) * 1.02);
  const at = dist => { let i = 1; while (i < cum.length - 1 && cum[i] < dist) i++; const k = (dist - cum[i - 1]) / Math.max(1, cum[i] - cum[i - 1]); return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k, i }; };
  f._passed ??= {};
  for (let i = 1; i < pts.length - 1; i++) {                                           // pierce each enemy as the sword passes
    if (s < cum[i] || f._passed[i]) continue;
    f._passed[i] = { at: t };
    const p = pts[i], dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y, dd = Math.hypot(dx, dy) || 1;
    burstColors(p.x, p.y, 10, ['#ecfdf5', '#6ee7b7', '#34d399'], 1, 0.3);
    nudgeEnemy(p.uid, dx / dd * 6, dy / dd * 6, 0.45);
  }
  const fade = t <= FLY ? 1 : Math.max(0, 1 - (t - FLY) / (f.maxTtl - FLY));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(167, 243, 208, ${0.35 * fade})`; ctx.lineWidth = 1.5;          // thin line through everything pierced
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) { if (cum[i] > s) { const q = at(s); ctx.lineTo(q.x, q.y); break; } ctx.lineTo(pts[i].x, pts[i].y); }
  ctx.stroke();
  const tail = Math.max(0, s - 150);                                                    // bright trail behind the sword
  for (let k = 0; k < 10; k++) {
    const d0 = tail + (s - tail) * (k / 10), d1 = tail + (s - tail) * ((k + 1) / 10), q0 = at(d0), q1 = at(d1);
    ctx.strokeStyle = `rgba(110, 231, 183, ${(k / 10) * 0.7 * fade})`; ctx.lineWidth = 1 + k * 0.45;
    ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
  }
  for (const [i, pass] of Object.entries(f._passed)) {                                  // slash flash across each pierced enemy
    const since = t - pass.at;
    if (since > 0.22) continue;
    const p = pts[i], q = since / 0.22, dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y, dd = Math.hypot(dx, dy) || 1;
    ctx.strokeStyle = `rgba(236, 253, 245, ${0.9 * (1 - q)})`; ctx.lineWidth = 2.5 * (1 - q);
    ctx.beginPath(); ctx.moveTo(p.x - dy / dd * 16, p.y + dx / dd * 16); ctx.lineTo(p.x + dy / dd * 16, p.y - dx / dd * 16); ctx.stroke();
    additiveGlow(ctx, p.x, p.y, 22, '110, 231, 183', 0.7 * (1 - q));
  }
  ctx.restore();
  if (t <= FLY + 0.08) {                                                                 // the sword itself, tip leading
    const q = at(Math.min(s, L - 0.01)), q2 = at(Math.max(0, s - 12)), ang = Math.atan2(q.y - q2.y, q.x - q2.x);
    stampSwordTip(ctx, q.x, q.y, ang, 0.95, t <= FLY ? 1 : 1 - (t - FLY) / 0.08, false);
  }
}

// ==== Melodic Saint normal attacks ====
// Harmony Chord: a warm gold-and-indigo ring spreads gently; golden notes rise from each ally it reaches (speed buff).
function drawHarmonyChord(ctx, f, size) {
  const t = (f.maxTtl || 0.9) - f.ttl, o = routePoint(f.x, f.y, size), R = 260 * easeOut(Math.min(1, t / 0.6)), fade = Math.max(0, 1 - t / (f.maxTtl || 0.9));
  f._reached ??= {};
  if (!f._start) { f._start = true; for (let i = 0; i < 6; i++) { const n = emitParticle(4, o.x + (Math.random() - 0.5) * 20, o.y - 20, (Math.random() - 0.5) * 50, -40 - Math.random() * 40, 0.9, 0.8 + Math.random() * 0.4, i % 2 ? '#fde68a' : '#c7d2fe'); if (n) n.glyph = i % NOTE_GLYPHS.length; } }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let r = 0; r < 2; r++) {
    const rr = R - r * 22;
    if (rr <= 4) continue;
    ctx.strokeStyle = r ? `rgba(129, 140, 248, ${0.45 * fade})` : `rgba(253, 230, 138, ${0.6 * fade})`;
    ctx.lineWidth = r ? 2 : 3;
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) { const th = (i / 90) * Math.PI * 2, w = rr * (1 + 0.025 * Math.sin(th * 8 + t * 20)); if (i) ctx.lineTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5); else ctx.moveTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5); }
    ctx.stroke();
  }
  ctx.restore();
  for (const uid of f.schedule?.allies || []) {
    const v = battle.units.find(x => x.uid === uid && !x.removed);
    if (!v || f._reached[uid]) continue;
    const p = routePoint(v.x + 1, v.y + 1, size), d = Math.hypot(p.x - o.x, (p.y - o.y) * 2);
    if (d > R) continue;
    f._reached[uid] = true;
    for (let i = 0; i < 3; i++) { const n = emitParticle(4, p.x + (i - 1) * 10, p.y - 24, (i - 1) * 12, -55 - Math.random() * 25, 0.9, 0.75, '#fde68a'); if (n) n.glyph = (uid + i) % NOTE_GLYPHS.length; }
    additiveGlow(ctx, p.x, p.y - 10, 30, '253, 230, 138', 0.6);
  }
}
// Dissonance Chord: a jagged, discordant violet wave rips outward; each enemy it reaches gets broken notes and a jolt.
function drawDissonanceChord(ctx, f, size) {
  const t = (f.maxTtl || 0.8) - f.ttl, o = routePoint(f.x, f.y, size), R = 340 * Math.min(1, t / 0.4), fade = Math.max(0, 1 - t / (f.maxTtl || 0.8));
  f._reached ??= {};
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'miter';
  for (let r = 0; r < 3; r++) {
    const rr = R - r * 26;
    if (rr <= 4 || R >= 340 && r === 0 && t > 0.55) continue;
    ctx.strokeStyle = r === 0 ? `rgba(244, 114, 182, ${0.85 * fade})` : `rgba(168, 85, 247, ${(0.5 / r) * fade})`;
    ctx.lineWidth = r === 0 ? 2.6 : 1.8;
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {                                    // sawtooth with jitter: harsh, not musical
      const th = (i / 72) * Math.PI * 2, saw = ((i % 3) - 1) * 0.06 + (hash01(i * 3.3 + Math.floor(t * 30)) - 0.5) * 0.05;
      const w = rr * (1 + saw);
      if (i) ctx.lineTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5); else ctx.moveTo(o.x + Math.cos(th) * w, o.y + Math.sin(th) * w * 0.5);
    }
    ctx.stroke();
  }
  ctx.restore();
  for (const uid of f.schedule?.hits || []) {
    const p = enemyPt(f, uid, size);
    if (!p) continue;
    const d = Math.hypot(p.x - o.x, (p.y - o.y) * 2);
    if (d > R) continue;
    if (!f._reached[uid]) {
      f._reached[uid] = t;
      for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28, n = emitParticle(4, p.x, p.y - 14, Math.cos(a) * 50, Math.sin(a) * 30 - 30, 0.6, 0.7, i % 2 ? '#f472b6' : '#a855f7'); if (n) { n.glyph = i % NOTE_GLYPHS.length; n.vr = 20; } }
      const dx = p.x - o.x, dy = p.y - o.y, dd = Math.hypot(dx, dy) || 1;
      nudgeEnemy(uid, dx / dd * 5, dy / dd * 5, 0.4);
    }
    const since = t - f._reached[uid];
    if (since < 0.25) additiveGlow(ctx, p.x, p.y - 8, 22, '217, 70, 239', 0.7 * (1 - since / 0.25));
  }
}

// Marks that stay on enemies between effects: talisman while Vulnerable, blood drips from Blood-Fiend bleeds.
function drawPersistentMarks(ctx, size) {
  const fiends = new Set(battle.units.filter(v => !v.removed && v.id === 'bloodFiendMaster').map(v => v.uid));
  for (const e of battle.enemies) {
    if (e.gone || e.hp <= 0) continue;
    const p = trackPoint(visualTrackP(e), size);
    const left = (e.talismanMarkUntil || 0) - battle.time;
    if (left > 0) drawTalismanPaper(ctx, p.x + 12, p.y - 30 + Math.sin(battle.time * 4 + e.uid) * 1.5, 0.15 + Math.sin(battle.time * 3 + e.uid) * 0.12, 0.85, Math.min(1, left / 0.3));
    if (fiends.size && (e.bleeds || []).some(bl => bl.until > battle.time && fiends.has(bl.owner))) {
      if (battle.time - (e._dripAt || 0) > 0.22) {
        e._dripAt = battle.time;
        emitParticle(2, p.x + (Math.random() - 0.5) * 12, p.y - 6, (Math.random() - 0.5) * 10, 20, 0.5, 1.4, '#b91c1c');
      }
    }
  }
}


// ==== Bloodline + Arcane Mythic effects (normal attacks, channels, ultimates, ground zones) ====
// Shared helpers
const fxProg = f => Math.min(1, Math.max(0, 1 - f.ttl / (f.maxTtl || 1)));
const fxTime = f => (f.maxTtl || 1) - f.ttl;
function tilePx(size) { const a = routePoint(1, 1, size), b = routePoint(2, 2, size); return { x: b.x - a.x, y: b.y - a.y }; }
function tileGrid(i) { const [x, y] = Game.ring[((i % 16) + 16) % 16]; return { x, y }; }
function chainPts(f, size) { return (f.schedule?.chain || []).map(uid => { const p = enemyPt(f, uid, size); return p && { x: p.x, y: p.y, uid }; }).filter(Boolean); }
function onceEach(f, key, fn) { f._once ??= {}; if (!f._once[key]) { f._once[key] = true; fn(); } }
// A flickering lightning bolt: jagged polyline with a wide glow and a white core.
function drawBolt(ctx, x0, y0, x1, y1, seed, rgb, alpha, width = 2) {
  if (alpha <= 0) return;
  const n = 10, dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, pts = [];
  for (let i = 0; i <= n; i++) { const k = i / n, j = (i === 0 || i === n) ? 0 : (hash01(seed + i * 3.1) - 0.5) * d * 0.16; pts.push([x0 + dx * k + nx * j, y0 + dy * k + ny * j]); }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [w, c] of [[width * 4, `rgba(${rgb}, ${0.3 * alpha})`], [width, `rgba(255, 255, 255, ${0.95 * alpha})`]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
    pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  }
  ctx.restore();
}
function softPuff(ctx, x, y, r, rgb, alpha, additive = false) {
  if (alpha <= 0 || r <= 0) return;
  if (additive) { additiveGlow(ctx, x, y, r, rgb, alpha); return; }
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${alpha})`); g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// A radial "wave reaches each enemy" ring in tiles from grid origin (gx, gy), drawn as an ellipse on screen.
function waveRing(ctx, size, gx, gy, rTiles, draw) {
  const o = routePoint(gx, gy, size), px = tilePx(size);
  draw(o.x, o.y, rTiles * px.x, rTiles * px.y);
}

// ==== Primordial Azure Dragon (Thanh Long) — azure lightning ====
const AZURE = '125, 211, 252';
function drawAzureBolts(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = chainPts(f, size), a = prog < 0.7 ? 1 - prog / 0.7 : 0;
  pts.forEach((p, i) => {
    drawBolt(ctx, o.x, o.y - 24, p.x, p.y - 10, Math.floor(battle.time * 40) + i * 17, AZURE, a, 1.8);
    additiveGlow(ctx, p.x, p.y - 10, 20, AZURE, 0.8 * a);
    onceEach(f, 'h' + i, () => burstColors(p.x, p.y - 10, 6, ['#e0f2fe', '#7dd3fc'], 0.8, 0.3));
  });
}
function lightningDragonPts(cx, cy, len, amp, phase) {
  const pts = [];
  for (let i = 0; i <= 44; i++) { const u = i / 44; pts.push({ x: cx - len / 2 + len * u, y: cy + Math.sin(u * Math.PI * 3 + phase) * amp * (0.5 + 0.5 * u) }); }
  return pts;
}
function drawGlowPath(ctx, pts, rgb, alpha, width) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, a] of [[width * 3, 0.25], [width, 0.7], [width * 0.35, 1]]) {
    ctx.strokeStyle = a === 1 ? `rgba(255, 255, 255, ${alpha})` : `rgba(${rgb}, ${a * alpha})`; ctx.lineWidth = w;
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
  }
  ctx.restore();
  const h = pts[pts.length - 1]; additiveGlow(ctx, h.x, h.y, width * 4, rgb, alpha);
}
function drawAzureGather(ctx, cx, cy, prog, size) {
  const time = battle.time, top = Math.max(40, cy - 120);
  dimFocus(ctx, size, cx, cy, 0.5 * Math.min(1, prog / 0.25), '2, 6, 20');
  for (let i = 0; i < 7; i++) softPuff(ctx, cx - 90 + i * 30 + Math.sin(time + i) * 6, top + Math.sin(i * 2.1) * 10, 34, '30, 41, 59', 0.75 * Math.min(1, prog * 2));   // storm clouds
  if (hash01(Math.floor(time * 7)) > 0.55) drawBolt(ctx, cx - 60 + hash01(Math.floor(time * 7) + 1) * 120, top, cx, cy - 20, Math.floor(time * 30), AZURE, 0.9 * prog, 1.6);
  const pts = [];                                                     // lightning dragon coiling round the unit
  for (let s = 0; s <= 50; s++) { const a = s * 0.26 + time * 4, r = 72 - 30 * prog; pts.push({ x: cx + Math.cos(a) * r, y: cy - 6 + Math.sin(a) * r * 0.45 - s * 1.1 * prog }); }
  drawGlowPath(ctx, pts.slice(0, Math.max(2, Math.floor(pts.length * Math.min(1, prog * 1.3)))), AZURE, 0.9, 3);
  additiveGlow(ctx, cx, cy, 46 + 40 * prog, AZURE, 0.2 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '⚡ THANH LONG BẠO NỘ', prog, '#7dd3fc', '#082f49');
}
function drawAzureWrath(ctx, f, size) {
  const t = fxTime(f), o = routePoint(f.x, f.y, size), time = battle.time, sch = f.schedule || { hits: [] };
  dimFocus(ctx, size, o.x, o.y, 0.5 * Math.max(0, 1 - Math.max(0, t - 1.0) / 0.5), '2, 6, 20');
  if (t < 1.1) {                                                     // a full azure dragon spirit, lit by its own lightning
    const a = Math.min(1, t / 0.15) * (t > 0.8 ? 1 - (t - 0.8) / 0.3 : 1), pts = lightningDragonPts(o.x, Math.max(70, o.y - 125), 360, 30, time * 3);
    additiveGlow(ctx, o.x, Math.max(70, o.y - 125), 200, AZURE, 0.35 * a);
    DRAGON_PAL = AZURE_PAL; drawInkDragon(ctx, pts, 1, a, time, 1.45); DRAGON_PAL = INK_PAL;
    drawGlowPath(ctx, pts, AZURE, 0.45 * a, 2);
  }
  if (t > 0.08 && t < 0.5) { const k = (t - 0.08) / 0.42; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${AZURE}, ${0.8 * (1 - k)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(o.x, o.y, 30 + k * 260, 12 + k * 110, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }   // the roar
  for (const h of sch.hits) {
    if (t < h.at) continue;
    const p = enemyPt(f, h.uid, size); if (!p) continue;
    const since = t - h.at;
    if (since < 0.14) drawBolt(ctx, p.x + (hash01(h.uid) - 0.5) * 60, 0, p.x, p.y - 8, Math.floor(time * 50) + h.uid, AZURE, 1, 2.6);
    onceEach(f, 'h' + h.uid, () => { burstColors(p.x, p.y - 8, 14, ['#ffffff', '#7dd3fc', '#38bdf8'], 1.2, 0.4); nudgeEnemy(h.uid, 0, 6, 0.5); });
    if (since < 0.3) additiveGlow(ctx, p.x, p.y - 8, 34, AZURE, 0.9 * (1 - since / 0.3));
  }
}

// ==== White Tiger God of Slaughter (Bạch Hổ) — white steel, crimson edge ====
function drawClawMarks(ctx, x, y, k, alpha, ang = -0.7, len = 30) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    for (const [w, c] of [[5, `rgba(248, 113, 113, ${0.45 * alpha})`], [1.8, `rgba(255, 255, 255, ${alpha})`]]) {
      ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
      ctx.moveTo(-len / 2, i * 7); ctx.quadraticCurveTo(0, i * 7 - 4, -len / 2 + len * k, i * 7 + 2 * k); ctx.stroke();
    }
  }
  ctx.restore();
}
function drawTigerClaw(ctx, tx, ty, prog, f) {
  drawClawMarks(ctx, tx, ty - 12, Math.min(1, prog / 0.35), prog < 0.35 ? 1 : 1 - (prog - 0.35) / 0.65);
  if (prog > 0.25) onceEach(f, 'blood', () => droplets(tx, ty - 10, 6, '#b91c1c', 0.7));
}
function drawTigerGather(ctx, cx, cy, prog, size) {
  const time = battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '8, 8, 10');
  additiveGlow(ctx, cx, cy, 50 + 44 * prog, '241, 245, 249', 0.22 + 0.45 * prog);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';               // wind streaks
  for (let i = 0; i < 10; i++) { const y = cy - 60 + i * 12, x = cx - 130 + ((time * 220 + hash01(i) * 260) % 260); ctx.strokeStyle = `rgba(226, 232, 240, ${0.25 * prog})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y - 3); ctx.stroke(); }
  ctx.restore();
  channelRing(cx, cy, prog, 6, 82, 46, (x, y, i, depth, appear) => drawClawMarks(ctx, x, y - 10, 1, appear * depth, -0.9 + i * 0.3, 22));
  channelLabel(ctx, cx, cy + 150, '🐯 BẠCH HỔ THẦN HỐNG', prog, '#f1f5f9', '#1f2937');
}
function drawTigerHead(ctx, x, y, s, alpha, roar) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, 90 * s, '241, 245, 249', 0.45 * alpha);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(241, 245, 249, 0.82)';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 28, -30); ctx.lineTo(sx * 46, -58); ctx.lineTo(sx * 50, -22); ctx.closePath(); ctx.fill(); }   // ears
  ctx.beginPath(); ctx.ellipse(0, 0, 54, 46, 0, 0, Math.PI * 2); ctx.fill();                                                                                 // face
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 4; ctx.lineCap = 'round';                                                                                     // stripes and 王 brow
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sx * 52, -16 + i * 12); ctx.quadraticCurveTo(sx * 40, -12 + i * 12, sx * 30, -8 + i * 13); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-10, -34); ctx.lineTo(10, -34); ctx.moveTo(-8, -27); ctx.lineTo(8, -27); ctx.moveTo(-11, -20); ctx.lineTo(11, -20); ctx.moveTo(0, -36); ctx.lineTo(0, -18); ctx.stroke();
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(0, 22, 18, 6 + 16 * roar, 0, 0, Math.PI * 2); ctx.fill();                                          // roaring mouth
  ctx.fillStyle = '#f8fafc'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 10, 14); ctx.lineTo(sx * 6, 14 + 10 * roar + 4); ctx.lineTo(sx * 3, 14); ctx.fill(); }
  ctx.restore();
  for (const sx of [-1, 1]) additiveGlow(ctx, x + sx * 20 * s, y - 8 * s, 10 * s, '56, 189, 248', alpha);                                                    // eyes
}
function drawTigerRoar(ctx, f, size) {
  const t = fxTime(f), o = routePoint(f.x, f.y, size), sch = f.schedule || { hits: [] };
  dimFocus(ctx, size, o.x, o.y, 0.45 * Math.max(0, 1 - Math.max(0, t - 0.9) / 0.5), '8, 8, 10');
  if (t < 1.0) { const pop = t < 0.15 ? 0.6 + 0.4 * (t / 0.15) : 1; drawTigerHead(ctx, o.x, Math.max(95, o.y - 125), 1.55 * pop, Math.min(1, t / 0.1) * (t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1), Math.min(1, Math.max(0, (t - 0.15) / 0.12))); }
  const R = Math.max(0, (t - 0.25) * 6);
  if (R > 0 && R < 5) waveRing(ctx, size, f.x, f.y, R, (x, y, rx, ry) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let r = 0; r < 3; r++) { const k = Math.max(0, 1 - r * 0.12); ctx.strokeStyle = `rgba(241, 245, 249, ${(0.8 - r * 0.25) * (1 - R / 5)})`; ctx.lineWidth = 4 - r; ctx.beginPath(); ctx.ellipse(x, y, rx * k, ry * k, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  });
  for (const h of sch.hits) { if (t < h.at) continue; const p = enemyPt(f, h.uid, size); if (!p) continue; onceEach(f, 'h' + h.uid, () => { nudgeEnemy(h.uid, 0, -8, 0.6); burstColors(p.x, p.y - 10, 6, ['#ffffff', '#e2e8f0'], 0.8, 0.3); }); }
}

// ==== Xuanwu Divine Heaven-Bearer (Huyền Vũ) — black tortoise, venom green ====
const VENOM = '74, 222, 128';
function drawVenomStrike(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = chainPts(f, size), reach = Math.min(1, prog / 0.45), fade = prog < 0.45 ? 1 : 1 - (prog - 0.45) / 0.55;
  pts.forEach((p, idx) => {
    const x0 = o.x, y0 = o.y - 16, dx = p.x - x0, dy = p.y - 10 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, path = [];
    for (let i = 0; i <= 24; i++) { const k = (i / 24) * reach, w = Math.sin(k * Math.PI * 4 + battle.time * 18 + idx) * 7 * (1 - k * 0.5); path.push({ x: x0 + dx * k + nx * w, y: y0 + dy * k + ny * w }); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(${VENOM}, ${0.75 * fade})`; ctx.lineWidth = 4; ctx.beginPath(); path.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
    const h = path[path.length - 1]; ctx.fillStyle = `rgba(187, 247, 208, ${fade})`; ctx.beginPath(); ctx.arc(h.x, h.y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (reach >= 1) onceEach(f, 'h' + idx, () => droplets(p.x, p.y - 10, 7, '#22c55e', 0.7));
  });
}
function drawHex(ctx, x, y, r) { ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; if (i) ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6); else ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6); } ctx.closePath(); }
function drawXuanwuGather(ctx, cx, cy, prog, size) {
  const time = battle.time, a = Math.min(1, prog / 0.3);
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '2, 12, 8');
  drawSpiritTortoise(ctx, cx, Math.max(70, cy - 110), 1.35, Math.min(1, prog / 0.4), time);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';                // tortoise-shell hex barrier
  const R = 22;
  const cells = [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * R * 1.73, Math.sin(i * Math.PI / 3) * R * 1.73])];
  cells.forEach(([dx, dy], i) => {
    const on = Math.min(1, Math.max(0, (prog - i * 0.06) / 0.15));
    ctx.strokeStyle = `rgba(45, 212, 191, ${0.75 * on})`; ctx.lineWidth = 2; drawHex(ctx, cx + dx, cy - 6 + dy * 0.6, R); ctx.stroke();
    ctx.fillStyle = `rgba(20, 83, 45, ${0.25 * on})`; ctx.fill();
  });
  ctx.lineCap = 'round';                                                // the snake circling
  const head = time * 2.4;
  ctx.strokeStyle = `rgba(${VENOM}, ${0.9 * a})`; ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) { const ang = head - i * 0.09, r = 70 - 18 * prog + Math.sin(i * 0.8 + time * 8) * 4; const x = cx + Math.cos(ang) * r, y = cy - 6 + Math.sin(ang) * r * 0.5; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  ctx.stroke();
  ctx.restore();
  additiveGlow(ctx, cx + Math.cos(head) * (70 - 18 * prog), cy - 6 + Math.sin(head) * (70 - 18 * prog) * 0.5, 9, VENOM, a);
  channelLabel(ctx, cx, cy + 150, '🐢 HUYỀN VŨ ĐỘC ĐỊA', prog, '#86efac', '#052e16');
}
function drawXuanwuLob(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { quadrant: 0, landAt: 0.5 }, o = routePoint(f.x, f.y, size), q = trackPoint(sch.quadrant * 4 + 2, size);
  if (t < 0.6) drawSpiritTortoise(ctx, o.x, Math.max(70, o.y - 110), 1.35, 1 - t / 0.6, battle.time);
  if (t < sch.landAt) {
    const k = t / sch.landAt, p = quadPt(o.x, o.y - 20, (o.x + q.x) / 2, Math.min(o.y, q.y) - 140, q.x, q.y, k);
    additiveGlow(ctx, p.x, p.y, 26, VENOM, 0.9);
    ctx.save(); ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (Math.random() < 0.6) emitParticle(2, p.x, p.y, (Math.random() - 0.5) * 30, 20, 0.4, 1.4, '#22c55e');
  } else onceEach(f, 'splash', () => { droplets(q.x, q.y, 24, '#16a34a', 1.3); burstColors(q.x, q.y, 12, ['#bbf7d0', '#4ade80'], 1, 0.4); });
}

// ==== Immortal Vermilion Phoenix (Chu Tước) — vermilion fire and gold ====
const FLAME = '249, 115, 22';
function drawFeather(ctx, x, y, ang, k, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); ctx.globalAlpha = Math.min(1, alpha);
  const g = ctx.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#dc2626'); g.addColorStop(0.6, '#f97316'); g.addColorStop(1, '#fde047');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(0, -6, -14, -1); ctx.quadraticCurveTo(0, 6, 14, 0); ctx.fill();
  ctx.strokeStyle = '#fff7ed'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
  ctx.restore();
}
function drawPhoenixFeather(ctx, x, y, tx, ty, prog, f) {
  const FLY = 0.6;
  if (prog < FLY) {
    const k = prog / FLY, px = x + (tx - x) * k, py = y - 18 + (ty - 8 - (y - 18)) * k - Math.sin(k * Math.PI) * 18, ang = Math.atan2(ty - y, tx - x);
    additiveGlow(ctx, px, py, 16, FLAME, 0.7);
    drawFeather(ctx, px, py, ang, 1.1, 1);
    if (Math.random() < 0.7) emitParticle(0, px, py, (Math.random() - 0.5) * 30, -20 - Math.random() * 30, 0.3, 1.3, Math.random() < 0.5 ? '#fdba74' : '#fde047');
    return;
  }
  onceEach(f, 'hit', () => { for (let i = 0; i < 10; i++) emitParticle(0, tx, ty - 8, (Math.random() - 0.5) * 70, -60 - Math.random() * 90, 0.4, 1.5, Math.random() < 0.5 ? '#fb923c' : '#fde047'); });
  additiveGlow(ctx, tx, ty - 8, 26, FLAME, 0.8 * (1 - (prog - FLY) / (1 - FLY)));
}
function drawFlameLine(ctx, pts, reach, alpha) {
  if (alpha <= 0 || pts.length < 2) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) {
    const k = Math.min(1, Math.max(0, reach * (pts.length - 1) - (i - 1)));
    if (k <= 0) break;
    const a = pts[i - 1], b = pts[i], ex = a.x + (b.x - a.x) * k, ey = a.y + (b.y - a.y) * k;
    for (const [w, c] of [[10, `rgba(220, 38, 38, ${0.35 * alpha})`], [4, `rgba(${FLAME}, ${0.8 * alpha})`], [1.5, `rgba(253, 224, 71, ${alpha})`]]) { ctx.strokeStyle = c; ctx.lineWidth = w + Math.sin(battle.time * 30 + i) * 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ex, ey); ctx.stroke(); }
  }
  ctx.restore();
}
function drawFlameSpread(ctx, f, size) {
  const prog = fxProg(f), pts = chainPts(f, size).map(p => ({ x: p.x, y: p.y - 6, uid: p.uid })), reach = Math.min(1, prog / 0.5);
  drawFlameLine(ctx, pts, reach, prog < 0.5 ? 1 : 1 - (prog - 0.5) / 0.5);
  pts.forEach((p, i) => { if (i && reach * (pts.length - 1) >= i) onceEach(f, 'ig' + i, () => burstColors(p.x, p.y, 8, ['#fb923c', '#fde047'], 0.8, 0.35, true)); });
}
function drawPhoenixWings(ctx, x, y, span, alpha, flap) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, alpha);
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) {
    const a = -0.25 - i * 0.22 + flap * 0.25, len = span * (1 - i * 0.09);
    const g = ctx.createLinearGradient(x, y, x + sx * Math.cos(a) * len, y + Math.sin(a) * len);
    g.addColorStop(0, 'rgba(253, 224, 71, 0.9)'); g.addColorStop(0.5, 'rgba(249, 115, 22, 0.7)'); g.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.strokeStyle = g; ctx.lineWidth = 7 - i * 0.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sx * Math.cos(a - 0.3) * len * 0.6, y + Math.sin(a - 0.3) * len * 0.6, x + sx * Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
  }
  ctx.restore();
}
function drawPhoenixGather(ctx, cx, cy, prog, size) {
  const time = battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 6, 2');
  drawPhoenixWings(ctx, cx, cy - 22, 40 + 80 * easeOut(Math.min(1, prog / 0.7)), Math.min(1, prog * 2), Math.sin(time * 6) * 0.5);
  channelRing(cx, cy, prog, 8, 82, 46, (x, y, i, depth, appear, a) => { additiveGlow(ctx, x, y, 14, FLAME, 0.5 * appear); drawFeather(ctx, x, y, -Math.PI / 2 + Math.cos(a) * 0.3, 0.9, appear * depth); });
  additiveGlow(ctx, cx, cy, 48 + 44 * prog, FLAME, 0.22 + 0.5 * prog);
  if (Math.random() < 0.6) emitParticle(0, cx + (Math.random() - 0.5) * 60, cy, (Math.random() - 0.5) * 20, -60 - Math.random() * 60, 0.6, 1.4, Math.random() < 0.5 ? '#fdba74' : '#fde047');
  channelLabel(ctx, cx, cy + 150, '🔥 BẤT DIỆT HỎA PHƯỢNG', prog, '#fdba74', '#431407');
}
// ==== Great Sage Equal to Heaven (Tề Thiên) — golden staff and clouds ====
const GOLDEN = '250, 204, 21';
function drawStaff(ctx, x0, y0, x1, y1, w, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.lineCap = 'butt';
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#b91c1c'); g.addColorStop(0.08, '#facc15'); g.addColorStop(0.5, '#fde68a'); g.addColorStop(0.92, '#facc15'); g.addColorStop(1, '#b91c1c');
  ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}
function drawStaffStrike(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = chainPts(f, size);
  if (!pts.length) return;
  const p = pts[0], ext = prog < 0.3 ? easeOut(prog / 0.3) : prog < 0.6 ? 1 : 1 - (prog - 0.6) / 0.4;
  drawStaff(ctx, o.x, o.y - 18, o.x + (p.x - o.x) * ext, o.y - 18 + (p.y - 10 - (o.y - 18)) * ext, 5, 1);
  additiveGlow(ctx, o.x + (p.x - o.x) * ext, o.y - 18 + (p.y - 10 - (o.y - 18)) * ext, 16, GOLDEN, 0.7);
  if (pts.length > 1 && prog > 0.25) {                                  // cleave arc sweeping through the runners behind
    const k = Math.min(1, (prog - 0.25) / 0.3), fade = prog < 0.7 ? 1 : 1 - (prog - 0.7) / 0.3;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(${GOLDEN}, ${0.7 * fade})`; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 12);
    const last = Math.max(1, Math.floor(k * (pts.length - 1)));
    for (let i = 1; i <= last; i++) ctx.lineTo(pts[i].x, pts[i].y - 12);
    ctx.stroke(); ctx.restore();
  }
  pts.forEach((q, i) => { if (prog > 0.25 + i * 0.1) onceEach(f, 'h' + i, () => burstColors(q.x, q.y - 10, 7, ['#fde68a', '#facc15', '#ffffff'], 0.9, 0.3)); });
}
function drawCloudPuffs(ctx, x, y, s, alpha) { for (let i = 0; i < 5; i++) softPuff(ctx, x + (i - 2) * 12 * s, y + Math.sin(i * 1.7) * 4 * s, 16 * s, '254, 249, 195', 0.7 * alpha); additiveGlow(ctx, x, y, 30 * s, GOLDEN, 0.35 * alpha); }
function drawCloneCloud(ctx, f, size) { const prog = fxProg(f), o = routePoint(f.x, f.y, size); drawCloudPuffs(ctx, o.x, o.y + 4, 0.8 + prog * 0.8, 1 - prog); onceEach(f, 'spark', () => burstColors(o.x, o.y, 10, ['#fde68a', '#ffffff'], 0.8, 0.4)); }
function drawSageGather(ctx, cx, cy, prog, size) {
  const time = battle.time, len = 40 + 130 * easeOut(Math.min(1, prog / 0.8)), top = Math.max(30, cy - 24 - len);
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '18, 12, 2');
  drawStaff(ctx, cx, cy - 20, cx, top, 7 + 3 * prog, 1);
  additiveGlow(ctx, cx, top, 22 + 10 * Math.sin(time * 10), GOLDEN, 0.8);
  channelRing(cx, cy, prog, 6, 84, 50, (x, y, i, depth, appear) => drawCloudPuffs(ctx, x, y, 0.55, appear * depth));
  additiveGlow(ctx, cx, cy, 46 + 40 * prog, GOLDEN, 0.2 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '🐒 ĐỊNH HẢI THẦN CHÂM', prog, '#fde047', '#422006');
}
function drawSageStaff(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { quadrant: 0, impactAt: 0.55, hits: [] }, Q = trackPoint(sch.quadrant * 4 + 2, size), I = sch.impactAt;
  dimFocus(ctx, size, Q.x, Q.y, 0.4 * Math.max(0, 1 - Math.max(0, t - I) / 0.6), '18, 12, 2');
  const high = Math.max(Q.y - 320, Math.min(Q.y - 120, 40));
  let tip = high;
  if (t >= I) tip = Q.y + 6; else if (t > I - 0.15) { const k = (t - (I - 0.15)) / 0.15; tip = high + (Q.y + 6 - high) * k * k * k; }
  const a = Math.min(1, Math.max(0, (t - 0.1) / 0.1)) * (t > 1.15 ? Math.max(0, 1 - (t - 1.15) / 0.35) : 1);
  if (t < I) { ctx.save(); ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + 0.35 * a})`; ctx.beginPath(); ctx.ellipse(Q.x, Q.y + 6, 30, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  drawStaff(ctx, Q.x, tip - 380, Q.x, tip, 24, a);
  additiveGlow(ctx, Q.x, tip - 190, 95, GOLDEN, 0.4 * a);
  if (t >= I) {
    onceEach(f, 'impact', () => { burstImpact(Q.x, Q.y + 6, 26, 14, 30, 1.4); burstColors(Q.x, Q.y, 20, ['#fde68a', '#facc15', '#ffffff'], 1.5, 0.5); });
    const since = t - I;
    ctx.save(); ctx.strokeStyle = `rgba(28, 25, 23, ${0.8 * a})`; ctx.lineWidth = 3; ctx.lineCap = 'round';   // cracks across the quadrant
    for (let i = 0; i < 4; i++) { const c = ringTile(sch.quadrant * 4 + i, size); ctx.beginPath(); ctx.moveTo(Q.x, Q.y + 6); ctx.lineTo((Q.x + c.x) / 2 + (hash01(i) - 0.5) * 16, (Q.y + c.y) / 2 + 4); ctx.lineTo(c.x, c.y + 6); ctx.stroke(); }
    ctx.restore();
    for (let r = 0; r < 2; r++) { const k = Math.min(1, Math.max(0, (since - r * 0.06) / 0.4)); if (k <= 0 || k >= 1) continue; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${GOLDEN}, ${0.85 * (1 - k)})`; ctx.lineWidth = 4 * (1 - k); ctx.beginPath(); ctx.ellipse(Q.x, Q.y + 6, 12 + k * 150, 5 + k * 56, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    if (since < 0.12) additiveGlow(ctx, Q.x, Q.y, 160, '254, 249, 195', 0.8 * (1 - since / 0.12));
  }
}

// ==== Magma Lord — earth and fire ====
const LAVA = '249, 115, 22';
function drawMoltenRock(ctx, x, y, r, alpha) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, r * 2.4, LAVA, 0.6 * alpha);
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = '#292524';
  ctx.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, rr = r * (0.8 + hash01(i + r) * 0.3); if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.2); ctx.lineTo(x, y + r * 0.1); ctx.lineTo(x + r * 0.4, y - r * 0.3); ctx.stroke();
  ctx.restore();
}
function drawMagmaRock(ctx, x, y, tx, ty, prog, f) {
  const FLY = 0.55;
  if (prog < FLY) { const k = prog / FLY, p = quadPt(x, y - 16, (x + tx) / 2, Math.min(y, ty) - 70, tx, ty, k); drawMoltenRock(ctx, p.x, p.y, 7, 1); if (Math.random() < 0.6) emitParticle(0, p.x, p.y, (Math.random() - 0.5) * 30, 10, 0.3, 1.2, '#fb923c'); return; }
  onceEach(f, 'splash', () => { droplets(tx, ty, 12, '#f97316', 1); burstColors(tx, ty, 8, ['#fde047', '#fb923c'], 0.9, 0.35, true); });
  additiveGlow(ctx, tx, ty, 30, LAVA, 0.8 * (1 - (prog - FLY) / (1 - FLY)));
}
function drawLavaCracks(ctx, x, y, seed, scale, alpha, time) {
  if (alpha <= 0) return;
  ctx.save(); ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalCompositeOperation = pass ? 'lighter' : 'source-over';
    ctx.strokeStyle = pass ? `rgba(253, 186, 116, ${alpha * (0.6 + 0.4 * Math.sin(time * 6 + seed))})` : `rgba(28, 10, 4, ${0.8 * alpha})`;
    ctx.lineWidth = pass ? 1.6 : 4;
    for (let i = 0; i < 5; i++) { let a = hash01(seed + i) * 6.28, px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 0; s < 3; s++) { a += (hash01(seed + i * 7 + s) - 0.5) * 1.2; px += Math.cos(a) * 10 * scale; py += Math.sin(a) * 4 * scale; ctx.lineTo(px, py); } ctx.stroke(); }
  }
  ctx.restore();
  additiveGlow(ctx, x, y, 22 * scale, LAVA, 0.35 * alpha);
}
function drawMagmaGather(ctx, cx, cy, prog, size) {
  const time = battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 6, 2');
  ctx.save(); ctx.lineCap = 'round';                                     // glowing cracks spreading from the unit
  for (let i = 0; i < 8; i++) { let a = i / 8 * 6.28 + 0.3, px = cx, py = cy + 10; const len = 110 * prog; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 1; s <= 4; s++) { a += (hash01(i * 9 + s) - 0.5) * 0.7; px = cx + Math.cos(a) * len * s / 4; py = cy + 10 + Math.sin(a) * len * 0.45 * s / 4; ctx.lineTo(px, py); } ctx.strokeStyle = 'rgba(28, 10, 4, 0.8)'; ctx.lineWidth = 4; ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(253, 186, 116, ${0.5 + 0.4 * Math.sin(time * 8 + i)})`; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  channelRing(cx, cy, prog, 6, 84, 48, (x, y, i, depth, appear) => drawMoltenRock(ctx, x, y, 7, appear * depth));
  additiveGlow(ctx, cx, cy, 50 + 44 * prog, LAVA, 0.22 + 0.5 * prog);
  channelLabel(ctx, cx, cy + 150, '🌋 MOLTEN FISSURE', prog, '#fdba74', '#431407');
}
function drawMagmaEruption(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 5 }, R = Math.max(0, (t - sch.start) * sch.speed);
  const o = routePoint(f.x, f.y, size);
  dimFocus(ctx, size, o.x, o.y, 0.35 * Math.max(0, 1 - Math.max(0, t - 1.0) / 0.5), '20, 6, 2');
  for (let i = 0; i < 16; i++) {                                          // a lava geyser at each tile as the eruption reaches it
    const g = tileGrid(i), d = Math.hypot(g.x - f.x, g.y - f.y);
    if (R < d) continue;
    const since = (R - d) / sch.speed, c = ringTile(i, size);
    onceEach(f, 't' + i, () => { for (let k = 0; k < 6; k++) emitParticle(2, c.x, c.y, (Math.random() - 0.5) * 60, -180 - Math.random() * 150, 0.6, 1.8 + Math.random() * 1.6, Math.random() < 0.5 ? '#f97316' : '#fde047'); });
    if (since < 0.45) { const h = 120 * Math.sin(Math.min(1, since / 0.45) * Math.PI); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createLinearGradient(c.x, c.y - h, c.x, c.y); gg.addColorStop(0, 'rgba(253, 224, 71, 0)'); gg.addColorStop(0.4, 'rgba(249, 115, 22, 0.8)'); gg.addColorStop(1, 'rgba(220, 38, 38, 0.9)'); ctx.fillStyle = gg; ctx.fillRect(c.x - 9, c.y - h, 18, h); ctx.restore(); }
  }
}

// ==== Firestorm Tempest — fire and wind ====
function drawTempestGather(ctx, cx, cy, prog, size) {
  const time = battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '20, 8, 2');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';   // fiery whirlwind
  for (let i = 0; i < 14; i++) { const r = 28 + (i % 7) * 9, a = time * (6 + i * 0.3) + i, y = cy - 10 - (i % 7) * 9 * prog; ctx.strokeStyle = i % 2 ? `rgba(${LAVA}, ${0.7 * prog})` : `rgba(254, 243, 199, ${0.45 * prog})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(cx, y, r * (1.1 - prog * 0.3), r * 0.35, 0, a, a + 2.2); ctx.stroke(); }
  ctx.restore();
  if (Math.random() < 0.7) emitParticle(0, cx + (Math.random() - 0.5) * 70, cy, (Math.random() - 0.5) * 60, -80 - Math.random() * 60, 0.5, 1.3, Math.random() < 0.5 ? '#fb923c' : '#fde047');
  additiveGlow(ctx, cx, cy, 48 + 40 * prog, LAVA, 0.2 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '🌪️ FIRESTORM TORNADO', prog, '#fdba74', '#431407');
}
function drawTornado(ctx, x, y, h, alpha, time) {
  if (alpha <= 0) return;
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const k = i / 8, yy = y - k * h, w = 14 + k * 48, off = Math.sin(time * 9 + i * 0.8) * 6 * k;
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(41, 37, 36, ${0.35 * alpha * (1 - k * 0.5)})`; ctx.beginPath(); ctx.ellipse(x + off, yy, w, w * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${LAVA}, ${0.75 * alpha})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x + off, yy, w, w * 0.3, 0, time * 12 + i, time * 12 + i + 3.6); ctx.stroke();
  }
  ctx.restore();
  additiveGlow(ctx, x, y - h * 0.4, h * 0.6, LAVA, 0.4 * alpha);
}
function drawFireTornado(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 20 }, head = 16 - Math.max(0, t - sch.start) * sch.speed;
  if (t < sch.start) return;
  const a = head < 0 ? Math.max(0, 1 + head / 2) : 1, q = trackPoint(Math.max(0, Math.min(15.999, head)), size);
  const trail = [];
  for (let p = Math.min(15.999, Math.max(0, head) + 2); p >= Math.max(0, head); p -= 0.15) { const c = trackPoint(p, size); trail.push({ x: c.x, y: c.y - 4 }); }
  drawFlameLine(ctx, trail, 1, 0.6 * a);
  drawTornado(ctx, q.x, q.y + 8, 170, a, battle.time);
  if (a > 0 && Math.random() < 0.8) emitParticle(2, q.x + (Math.random() - 0.5) * 30, q.y - Math.random() * 60, (Math.random() - 0.5) * 160, -40, 0.5, 1.6, Math.random() < 0.5 ? '#57534e' : '#fb923c');
}

// ==== Scalding Vapor Sovereign — fire and water ====
const STEAM = '241, 245, 249';
function drawSteamJets(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), reach = Math.min(1, prog / 0.45), fade = prog < 0.45 ? 1 : 1 - (prog - 0.45) / 0.55;
  chainPts(f, size).forEach((p, idx) => {
    for (let i = 0; i < 9; i++) { const k = (i / 8) * reach; softPuff(ctx, o.x + (p.x - o.x) * k, o.y - 16 + (p.y - 10 - (o.y - 16)) * k, 6 + k * 10, STEAM, 0.35 * fade); }
    if (prog < 0.3) drawFlameLine(ctx, [{ x: o.x, y: o.y - 16 }, { x: o.x + (p.x - o.x) * reach, y: o.y - 16 + (p.y - 10 - (o.y - 16)) * reach }], 1, 0.5);
    if (reach >= 1) onceEach(f, 'h' + idx, () => burstColors(p.x, p.y - 10, 6, ['#ffffff', '#7dd3fc'], 0.7, 0.35));
  });
}
function drawScaldPop(ctx, tx, ty, prog, f) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const a = hash01(i * 3.3) * 6.28, d = 8 + prog * 16, r = 3 + prog * 5; ctx.strokeStyle = `rgba(186, 230, 253, ${0.9 * (1 - prog)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(tx + Math.cos(a) * d, ty - 12 + Math.sin(a) * d * 0.6, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  softPuff(ctx, tx, ty - 18 - prog * 16, 18 + prog * 12, STEAM, 0.45 * (1 - prog));
  onceEach(f, 'pop', () => burstColors(tx, ty - 12, 8, ['#ffffff', '#7dd3fc', '#fb923c'], 0.8, 0.35));
}
function drawSteamGather(ctx, cx, cy, prog, size) {
  const time = battle.time, r = 72 * (1 - prog) + 8;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '6, 12, 18');
  for (const [sgn, rgb] of [[1, LAVA], [-1, '56, 189, 248']]) {             // fire and water orbs spiral in and merge
    for (let k = 0; k < 6; k++) { const a = sgn * (time * 5 - k * 0.18); additiveGlow(ctx, cx + Math.cos(a) * r, cy - 10 + Math.sin(a) * r * 0.5, 13 - k * 1.6, rgb, 0.8 - k * 0.12); }
  }
  if (prog > 0.45) for (let i = 0; i < 4; i++) { const ph = (time * 0.9 + i / 4) % 1; softPuff(ctx, cx + Math.sin(i * 2 + time) * 14, cy - 18 - ph * 70, 14 + ph * 22, STEAM, 0.5 * (1 - ph) * (prog - 0.45) * 2); }
  channelLabel(ctx, cx, cy + 150, '💨 SCALDING VAPOR MIST', prog, '#bae6fd', '#082f49');
}
function drawSteamEruption(ctx, f, size) {
  const t = fxTime(f), o = routePoint(f.x, f.y, size);
  if (t < 0.7) { const h = 280 * Math.sin(Math.min(1, t / 0.7) * Math.PI); ctx.save(); const g = ctx.createLinearGradient(o.x, o.y - h, o.x, o.y); g.addColorStop(0, 'rgba(241, 245, 249, 0)'); g.addColorStop(1, 'rgba(241, 245, 249, 0.75)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(o.x - 12, o.y); ctx.lineTo(o.x - 34, o.y - h); ctx.lineTo(o.x + 34, o.y - h); ctx.lineTo(o.x + 12, o.y); ctx.fill(); ctx.restore(); }
  const R = Math.min(3.4, t * 4), px = tilePx(size);                        // steam rolls outward
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; softPuff(ctx, o.x + Math.cos(a) * R * px.x, o.y + Math.sin(a) * R * px.y, 26 + R * 6, STEAM, 0.35 * Math.max(0, 1 - t / 1.4)); }
}

// ==== Quagmire Colossus — earth and water ====
const MUD = '120, 83, 45';
function drawMudBoulder(ctx, x, y, tx, ty, prog, f) {
  const FLY = 0.55;
  if (prog < FLY) { const k = prog / FLY, p = quadPt(x, y - 16, (x + tx) / 2, Math.min(y, ty) - 70, tx, ty, k); ctx.save(); ctx.fillStyle = '#57381d'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#7c5a32'; ctx.beginPath(); ctx.arc(p.x - 2, p.y - 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
  const q = (prog - FLY) / (1 - FLY);
  onceEach(f, 'splat', () => droplets(tx, ty, 12, '#6b4423', 1));
  ctx.save(); ctx.globalAlpha = 0.8 * (1 - q); ctx.fillStyle = '#5b3a1e'; ctx.beginPath(); ctx.ellipse(tx, ty + 6, 12 + q * 14, 4 + q * 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function drawQuagmireGather(ctx, cx, cy, prog, size) {
  const time = battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '10, 8, 2');
  ctx.save(); ctx.lineCap = 'round';                                     // mud tendrils rising from a ring
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + time * 0.3, bx = cx + Math.cos(a) * 66, by = cy + 10 + Math.sin(a) * 28, h = 70 * prog; ctx.strokeStyle = `rgba(${MUD}, 0.9)`; ctx.lineWidth = 7 - 3 * prog; ctx.beginPath(); ctx.moveTo(bx, by); for (let s = 1; s <= 8; s++) ctx.lineTo(bx + Math.sin(s * 0.9 + time * 4 + i) * 6, by - h * s / 8); ctx.stroke(); }
  ctx.restore();
  channelRing(cx, cy, prog, 5, 80, 46, (x, y, i, depth, appear) => { ctx.save(); ctx.globalAlpha = appear * depth; ctx.fillStyle = '#57534e'; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28, rr = 8 * (0.8 + hash01(i * 6 + k) * 0.35); if (k) ctx.lineTo(x + Math.cos(a) * rr, y - 10 + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y - 10 + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); });
  additiveGlow(ctx, cx, cy, 44 + 36 * prog, '101, 163, 13', 0.18 + 0.4 * prog);
  channelLabel(ctx, cx, cy + 150, '🌿 PRIMORDIAL QUAGMIRE', prog, '#bef264', '#1a2e05');
}
function drawMudWave(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 5, hits: [] }, R = Math.max(0, (t - sch.start) * sch.speed);
  if (R > 0 && R < 4.8) waveRing(ctx, size, f.x, f.y, R, (x, y, rx, ry) => {
    ctx.save(); ctx.strokeStyle = `rgba(${MUD}, ${0.7 * (1 - R / 4.8)})`; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(x, y + 8, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(190, 242, 100, ${0.35 * (1 - R / 4.8)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y + 2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    if (Math.random() < 0.9) { const a = Math.random() * 6.28; emitParticle(2, x + Math.cos(a) * rx, y + 8 + Math.sin(a) * ry, (Math.random() - 0.5) * 40, -80 - Math.random() * 60, 0.45, 1.8, '#6b4423'); }
  });
  for (const h of sch.hits) { if (t < h.at) continue; const p = enemyPt(f, h.uid, size); if (p) onceEach(f, 'h' + h.uid, () => droplets(p.x, p.y, 10, '#5b3a1e', 1)); }
}

// ==== Glacial Typhoon — water and wind ====
const ICE = '186, 230, 253';
function drawIceShard(ctx, x, y, ang, k, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.9)'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(0, -4); ctx.lineTo(-10, 0); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  additiveGlow(ctx, x, y, 10 * k, ICE, 0.6 * alpha);
}
function drawIceShards(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), FLY = 0.55;
  chainPts(f, size).forEach((p, idx) => {
    if (prog < FLY) { const k = prog / FLY, x = o.x + (p.x - o.x) * k, y = o.y - 16 + (p.y - 10 - (o.y - 16)) * k; drawIceShard(ctx, x, y, Math.atan2(p.y - o.y, p.x - o.x), 1.1, 1); return; }
    onceEach(f, 'h' + idx, () => { for (let i = 0; i < 8; i++) { const a = Math.random() * 6.28, v = 50 + Math.random() * 90; emitParticle(3, p.x, p.y - 10, Math.cos(a) * v, Math.sin(a) * v - 30, 0.45, 1.6, Math.random() < 0.5 ? '#e0f2fe' : '#7dd3fc'); } droplets(p.x, p.y - 6, 4, '#38bdf8', 0.5); });
  });
}
function drawSnowflake(ctx, x, y, r, alpha, rot) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(224, 242, 254, ${alpha})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.moveTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55); ctx.lineTo(Math.cos(a + 0.5) * r * 0.8, Math.sin(a + 0.5) * r * 0.8); ctx.stroke(); }
  ctx.restore();
}
function drawBlizzardGather(ctx, cx, cy, prog, size) {
  const time = battle.time;
  dimFocus(ctx, size, cx, cy, 0.45 * Math.min(1, prog / 0.25), '4, 10, 18');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#f0f9ff';   // snow vortex
  for (let i = 0; i < 46; i++) { const r = 20 + hash01(i) * 90 * (1 - prog * 0.4), a = time * (2 + hash01(i * 2) * 3) + i; ctx.globalAlpha = 0.4 + 0.5 * hash01(i * 5); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy - 8 + Math.sin(a) * r * 0.45, 1 + hash01(i * 3) * 1.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  channelRing(cx, cy, prog, 6, 82, 46, (x, y, i, depth, appear) => drawSnowflake(ctx, x, y - 8, 9, appear * depth, battle.time * 2 + i));
  additiveGlow(ctx, cx, cy, 48 + 40 * prog, ICE, 0.22 + 0.45 * prog);
  channelLabel(ctx, cx, cy + 150, '❄️ GLACIAL BLIZZARD', prog, '#bae6fd', '#082f49');
}
function drawBlizzard(ctx, f, size) {
  const t = fxTime(f), sch = f.schedule || { start: 0.15, speed: 5, hits: [] }, R = Math.max(0, Math.min(5, (t - sch.start) * sch.speed));
  const o = routePoint(f.x, f.y, size), px = tilePx(size), fade = Math.max(0, 1 - Math.max(0, t - 1.0) / 0.6);
  dimFocus(ctx, size, o.x, o.y, 0.35 * fade, '4, 10, 18');
  if (R > 0) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(o.x, o.y, R * px.x, R * px.y, 0, 0, Math.PI * 2); ctx.clip();
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${ICE}, ${0.1 * fade})`; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(240, 249, 255, ${0.75 * fade})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (let i = 0; i < 140; i++) { const x = (hash01(i) * size + battle.time * 260) % size, y = (hash01(i * 7.1) * size + battle.time * 120) % size; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 9, y - 4); ctx.stroke(); }
    ctx.restore();
  }
  for (const h of sch.hits) { if (t < h.at) continue; const p = enemyPt(f, h.uid, size); if (p) onceEach(f, 'h' + h.uid, () => burstColors(p.x, p.y - 10, 10, ['#ffffff', '#bae6fd', '#7dd3fc'], 1, 0.4)); }
}

// ==== Sandstorm Titan — earth and wind ====
const SAND = '217, 119, 6';
function drawSandLance(ctx, f, size) {
  const prog = fxProg(f), o = routePoint(f.x, f.y, size), pts = [{ x: o.x, y: o.y - 18 }, ...chainPts(f, size).map(p => ({ x: p.x, y: p.y - 10 }))];
  if (pts.length < 2) return;
  const reach = Math.min(1, prog / 0.35), fade = prog < 0.35 ? 1 : 1 - (prog - 0.35) / 0.65, last = reach * (pts.length - 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, c] of [[10, `rgba(${SAND}, ${0.3 * fade})`], [3, `rgba(253, 230, 138, ${0.85 * fade})`]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) { const k = Math.min(1, last - (i - 1)); if (k <= 0) break; ctx.lineTo(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k); }
    ctx.stroke();
  }
  ctx.restore();
  pts.forEach((p, i) => { if (i && last >= i) onceEach(f, 'h' + i, () => { for (let k = 0; k < 7; k++) emitParticle(2, p.x, p.y, (Math.random() - 0.5) * 120, -40 - Math.random() * 80, 0.4, 1.3, Math.random() < 0.5 ? '#d6d3d1' : '#d97706'); }); });
}
// The Titan's 10s channel is the ability: an amber storm over the whole board for its duration.
function drawSandstormChannel(ctx, cx, cy, prog, size, u) {
  const time = battle.time, dur = u?.channeling?.duration || 10, elapsed = prog * dur, left = dur - elapsed;
  const a = Math.min(1, elapsed / 0.6) * Math.min(1, left / 0.6);
  dimFocus(ctx, size, cx, cy, 0.3 * a, '24, 14, 2');
  ctx.save(); ctx.fillStyle = `rgba(180, 120, 40, ${0.16 * a})`; ctx.fillRect(0, 0, size, size); ctx.restore();
  for (let i = 0; i < 6; i++) softPuff(ctx, (hash01(i) * size + time * 60) % (size + 200) - 100, hash01(i * 3) * size, 110, '161, 98, 7', 0.18 * a);   // dust clouds
  ctx.save(); ctx.lineCap = 'round';                                     // blowing sand streaks
  for (let i = 0; i < 110; i++) { const sp = 260 + hash01(i * 2) * 240, x = (hash01(i) * (size + 120) + time * sp) % (size + 120) - 60, y = (hash01(i * 5.3) * size + time * sp * 0.25) % size; ctx.strokeStyle = i % 3 ? `rgba(253, 230, 138, ${0.45 * a})` : `rgba(${SAND}, ${0.55 * a})`; ctx.lineWidth = 1 + hash01(i * 7) * 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y - 4); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';   // vortex around the Titan
  for (let i = 0; i < 8; i++) { const r = 34 + i * 7, s = time * (5 - i * 0.3) + i; ctx.strokeStyle = `rgba(253, 230, 138, ${0.4 * a})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy - i * 6, r, r * 0.32, 0, s, s + 2.4); ctx.stroke(); }
  ctx.restore();
  channelLabel(ctx, cx, cy + 150, `🏜️ SANDSTORM · ${Math.max(0, left).toFixed(1)}s`, prog, '#fde68a', '#422006');
}
function drawSandPulse(ctx, f, size) {
  const prog = fxProg(f);
  for (const uid of f.schedule?.hits || []) {
    const p = enemyPt(f, uid, size); if (!p) continue;
    onceEach(f, 'h' + uid, () => { for (let k = 0; k < 6; k++) emitParticle(2, p.x, p.y - 8, (Math.random() - 0.5) * 90, -30 - Math.random() * 50, 0.4, 1.2, Math.random() < 0.5 ? '#d6d3d1' : '#b45309'); });
    ctx.save(); ctx.globalAlpha = 1 - prog; ctx.translate(p.x + 14, p.y - 30);   // cracked-armour mark
    ctx.fillStyle = 'rgba(120, 113, 108, 0.85)'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(6, -4); ctx.lineTo(5, 3); ctx.lineTo(0, 7); ctx.lineTo(-5, 3); ctx.lineTo(-6, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -6); ctx.lineTo(1, -1); ctx.lineTo(-2, 2); ctx.lineTo(1, 6); ctx.stroke();
    ctx.restore();
  }
}

// ==== Ground zones: magma fissures, vapor mist, swamp, Xuanwu toxin, Rebirth Inferno flames ====
function drawElementalZones(ctx, size) {
  const time = battle.time;
  for (const z of battle.arcaneZones || []) {
    const left = z.until - time, born = time - (z.at ?? time - 1), a = Math.min(1, born / 0.25) * Math.min(1, left / 0.4);
    if (a <= 0) continue;
    if (z.type === 'magma') { const c = trackPoint(Math.floor(z.p) % 16 + 0.5, size); drawLavaCracks(ctx, c.x, c.y + 6, Math.floor(z.p) * 3.7, 1, a, time); }
    else if (z.type === 'magmaFissure16') {
      const owner = battle.units.find(v => v.uid === z.owner), ox = owner ? owner.x + 1 : 2, oy = owner ? owner.y + 1 : 2;
      for (let i = 0; i < 16; i++) { const g = tileGrid(i), reach = (born - 0.15) * 5 - Math.hypot(g.x - ox, g.y - oy); if (reach < 0) continue; const c = ringTile(i, size); drawLavaCracks(ctx, c.x, c.y + 6, i * 5.1, 1.2, a * Math.min(1, reach), time); }
    } else if (z.type === 'vaporMist') {
      for (let i = 0; i < 16; i++) { const c = ringTile(i, size); for (let k = 0; k < 2; k++) { const ph = (time * 0.35 + hash01(i * 4 + k)) % 1; softPuff(ctx, c.x + Math.sin(time + i + k) * 10, c.y - ph * 26, 26 + ph * 10, STEAM, 0.28 * a * Math.sin(ph * Math.PI)); } }
    } else if (z.type === 'swamp') {
      const q0 = (z.wall ?? Math.floor((z.p || 0) / 4)) * 4;           // the swamp covers the whole quadrant (4 tiles)
      for (let i = 0; i < 4; i++) {
        const c = ringTile(q0 + i, size);
        ctx.save(); ctx.globalAlpha = 0.5 * a; ctx.fillStyle = '#3f3a12'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, 34, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4d5a16'; ctx.beginPath(); ctx.ellipse(c.x + 6, c.y + 6, 20, 7, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        for (let k = 0; k < 3; k++) { const ph = (time * 0.8 + hash01(i * 9 + k + q0)) % 1, bx = c.x + (hash01(i * 3 + k) - 0.5) * 40, by = c.y + 8 + (hash01(i * 5 + k) - 0.5) * 12; ctx.save(); ctx.strokeStyle = `rgba(190, 242, 100, ${0.45 * a * (1 - ph)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx, by, 1 + ph * 3.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      }
    }
  }
  for (const z of battle.xuanwuToxins || []) {                             // Xuanwu toxic pool over the quadrant
    const left = z.until - time, a = Math.min(1, (time - (z.at ?? time - 1)) / 0.25) * Math.min(1, left / 0.4);
    if (a <= 0) continue;
    for (let i = 0; i < 4; i++) {
      const c = ringTile(z.quadrant * 4 + i, size);
      ctx.save(); ctx.globalAlpha = 0.55 * a; ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, 34, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      softPuff(ctx, c.x, c.y + 6, 30, VENOM, 0.3 * a, true);
      for (let k = 0; k < 3; k++) { const ph = (time * 0.7 + hash01(i * 7 + k)) % 1; softPuff(ctx, c.x + (hash01(i + k * 3) - 0.5) * 30, c.y - ph * 30, 8 + ph * 8, VENOM, 0.35 * a * (1 - ph), true); }
    }
  }
  for (const z of battle.phoenixFlames || []) {                            // Rebirth Inferno: flames on each ignited tile
    for (let i = 0; i < 16; i++) {
      const ignite = z.start + (16 - (i + 0.5)) / z.speed, since = time - ignite;
      if (since < 0 || since > z.dur) continue;
      const a = Math.min(1, since / 0.15) * Math.min(1, (z.dur - since) / 0.5), c = trackPoint(i + 0.5, size);
      additiveGlow(ctx, c.x, c.y + 4, 30, FLAME, 0.45 * a);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) {
        const fx0 = c.x + (k - 1) * 11, h = (16 + 8 * Math.sin(time * 14 + i * 3 + k * 2)) * a;
        const g = ctx.createLinearGradient(fx0, c.y + 6 - h, fx0, c.y + 6); g.addColorStop(0, 'rgba(253, 224, 71, 0)'); g.addColorStop(0.5, `rgba(249, 115, 22, ${0.7 * a})`); g.addColorStop(1, `rgba(220, 38, 38, ${0.8 * a})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx0 - 6, c.y + 6); ctx.quadraticCurveTo(fx0 - 4, c.y + 6 - h * 0.6, fx0, c.y + 6 - h); ctx.quadraticCurveTo(fx0 + 4, c.y + 6 - h * 0.6, fx0 + 6, c.y + 6); ctx.fill();
      }
      ctx.restore();
    }
  }
}

// Status marks drawn on enemies by these units: fear, ice block, mud sink, lightning stun crackle.
function drawElementalMarks(ctx, size) {
  const time = battle.time;
  for (const e of battle.enemies) {
    if (e.gone || e.hp <= 0) continue;
    const p = trackPoint(visualTrackP(e), size);
    if ((e.fearUntil || 0) > time) {
      ctx.save(); ctx.font = '900 16px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#7f1d1d'; ctx.fillStyle = '#ffffff';
      const y = p.y - 34 + Math.sin(time * 10 + e.uid) * 2; ctx.strokeText('!', p.x, y); ctx.fillText('!', p.x, y); ctx.restore();
    }
    if ((e.iceBlockUntil || 0) > time) {
      const a = Math.min(1, (e.iceBlockUntil - time) / 0.3);
      ctx.save(); ctx.globalAlpha = 0.75 * a; ctx.fillStyle = 'rgba(186, 230, 253, 0.45)'; ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x - 13, p.y + 8); ctx.lineTo(p.x - 15, p.y - 14); ctx.lineTo(p.x - 6, p.y - 26); ctx.lineTo(p.x + 8, p.y - 24); ctx.lineTo(p.x + 15, p.y - 10); ctx.lineTo(p.x + 12, p.y + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - 6, p.y - 20); ctx.lineTo(p.x - 2, p.y - 6); ctx.stroke(); ctx.restore();
    }
    if ((e.mudSinkUntil || 0) > time) {
      const a = Math.min(1, (e.mudSinkUntil - time) / 0.3);
      ctx.save(); ctx.globalAlpha = 0.85 * a; ctx.fillStyle = '#4a3218'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, 17, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6b4423'; ctx.beginPath(); ctx.ellipse(p.x - 4, p.y + 1, 7, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    if ((e.azureStunUntil || 0) > time && hash01(Math.floor(time * 20) + e.uid) > 0.4) {
      drawBolt(ctx, p.x - 12, p.y - 22, p.x + 10, p.y - 4, Math.floor(time * 30) + e.uid, AZURE, 0.8, 1.2);
    }
  }
}
// Channel type → gather drawer (draw() live channel pass); called as (ctx, cx, cy, prog, size, unit).
const ELEMENT_GATHER = { 'azure-dragon': drawAzureGather, 'white-tiger': drawTigerGather, 'xuanwu-toxin': drawXuanwuGather, 'phoenix-inferno': drawPhoenixGather, 'great-sage-staff': drawSageGather, magmaLord: drawMagmaGather, tempestArchon: drawTempestGather, steamSovereign: drawSteamGather, quagmireColossus: drawQuagmireGather, blizzardArchon: drawBlizzardGather, sandstormTitan: drawSandstormChannel };
// Effect type or vfxKind → drawer (draw() effects pass); called as (ctx, f, size, x, y, tx, ty, prog).
const ELEMENT_FX = {
  'azure-bolts': (c, f, s) => drawAzureBolts(c, f, s), 'azure-wrath': (c, f, s) => drawAzureWrath(c, f, s),
  'tiger-claw': (c, f, s, x, y, tx, ty, p) => drawTigerClaw(c, tx, ty, p, f), 'tiger-roar': (c, f, s) => drawTigerRoar(c, f, s),
  'venom-strike': (c, f, s) => drawVenomStrike(c, f, s), 'xuanwu-lob': (c, f, s) => drawXuanwuLob(c, f, s),
  'phoenix-feather': (c, f, s, x, y, tx, ty, p) => drawPhoenixFeather(c, x, y, tx, ty, p, f), 'flame-spread': (c, f, s) => drawFlameSpread(c, f, s), 'phoenix-inferno': (c, f, s) => drawPhoenixInferno(c, f, s),
  'staff-strike': (c, f, s) => drawStaffStrike(c, f, s), 'clone-cloud': (c, f, s) => drawCloneCloud(c, f, s), 'sage-staff': (c, f, s) => drawSageStaff(c, f, s),
  'magma-rock': (c, f, s, x, y, tx, ty, p) => drawMagmaRock(c, x, y, tx, ty, p, f), 'magma-eruption': (c, f, s) => drawMagmaEruption(c, f, s),
  'fire-gust': (c, f, s) => drawFireGust(c, f, s), 'fire-tornado': (c, f, s) => drawFireTornado(c, f, s),
  'steam-jets': (c, f, s) => drawSteamJets(c, f, s), 'scald-pop': (c, f, s, x, y, tx, ty, p) => drawScaldPop(c, tx, ty, p, f), 'steam-eruption': (c, f, s) => drawSteamEruption(c, f, s),
  'mud-boulder': (c, f, s, x, y, tx, ty, p) => drawMudBoulder(c, x, y, tx, ty, p, f), 'mud-wave': (c, f, s) => drawMudWave(c, f, s),
  'ice-shards': (c, f, s) => drawIceShards(c, f, s), 'blizzard': (c, f, s) => drawBlizzard(c, f, s),
  'sand-lance': (c, f, s) => drawSandLance(c, f, s), 'sand-pulse': (c, f, s) => drawSandPulse(c, f, s)
};
// Ultimate effects whose engine text label is replaced by the visual itself.
const ELEMENT_ULTS = ['azure-wrath', 'tiger-roar', 'xuanwu-lob', 'sage-staff', 'phoenix-inferno', 'magma-eruption', 'fire-tornado', 'steam-eruption', 'mud-wave', 'blizzard'];


// ==== Realism layer for the Bloodline + Arcane Mythic channels and ultimates ====
// Environment: the whole board reacts (storm, wind, toxin, fire, gold light, steam, mud, frost).
// Impact: renderer camera shake, flashes, debris, smoke, and ground decals (scorch, cracks, frost, mud, toxin).
const VFX_SHAKE = { ttl: 0, max: 0.25, mag: 0, x: null, y: null };
function vfxShake(mag, gx = null, gy = null, ttl = 0.22) { if (mag >= VFX_SHAKE.mag * (VFX_SHAKE.ttl / (VFX_SHAKE.max || 1))) { VFX_SHAKE.ttl = ttl; VFX_SHAKE.max = ttl; VFX_SHAKE.mag = mag; VFX_SHAKE.x = gx; VFX_SHAKE.y = gy; } }
function smoke(x, y, n, rgb = '68, 64, 60', scale = 1) {
  for (let i = 0; i < n; i++) emitParticle(1, x + (Math.random() - 0.5) * 16 * scale, y, (Math.random() - 0.5) * 30, -30 - Math.random() * 40, 0.9 + Math.random() * 0.6, (8 + Math.random() * 8) * scale, `rgb(${rgb})`);
}
// Ground decals: drawn in the ground pass under the runners and faded out over their life.
const DECALS = [];
function addDecal(kind, x, y, s = 1, life = 3) { if (DECALS.length > 80) DECALS.shift(); DECALS.push({ kind, x, y, s, life, born: battle.time, owner: battle, seed: Math.random() * 100 }); }
function drawDecals(ctx, size) {
  const time = battle.time;
  for (let i = DECALS.length - 1; i >= 0; i--) { const d = DECALS[i]; if (d.owner !== battle || time - d.born > d.life || time < d.born) DECALS.splice(i, 1); }
  for (const d of DECALS) {
    const age = time - d.born, a = Math.min(1, age / 0.08) * Math.min(1, (d.life - age) / Math.min(1, d.life * 0.4)), s = d.s;
    ctx.save();
    if (d.kind === 'flash') { ctx.restore(); additiveGlow(ctx, d.x, d.y, 60 * s, d.rgb || '255, 255, 255', 0.8 * (1 - age / d.life)); continue; }
    if (d.kind === 'scorch') {
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 26 * s); g.addColorStop(0, `rgba(20, 12, 8, ${0.6 * a})`); g.addColorStop(1, 'rgba(20, 12, 8, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(d.x, d.y, 26 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill();
      if (age < 1.2) { ctx.restore(); additiveGlow(ctx, d.x, d.y, 16 * s, '249, 115, 22', 0.5 * a * (1 - age / 1.2)); continue; }
    } else if (d.kind === 'crack' || d.kind === 'gold') {
      ctx.strokeStyle = `rgba(28, 25, 23, ${0.75 * a})`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for (let k = 0; k < 6; k++) { let ang = hash01(d.seed + k) * 6.28, px = d.x, py = d.y; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 3; j++) { ang += (hash01(d.seed + k * 5 + j) - 0.5); px += Math.cos(ang) * 9 * s; py += Math.sin(ang) * 3.5 * s; ctx.lineTo(px, py); } ctx.stroke(); }
      if (d.kind === 'gold' && age < 1) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(250, 204, 21, ${0.6 * (1 - age)})`; ctx.lineWidth = 1; ctx.stroke(); }
    } else if (d.kind === 'frost') {
      ctx.fillStyle = `rgba(224, 242, 254, ${0.35 * a})`; ctx.beginPath(); ctx.ellipse(d.x, d.y, 24 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * a})`; ctx.lineWidth = 1;
      for (let k = 0; k < 6; k++) { const ang = k / 6 * 6.28 + d.seed; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + Math.cos(ang) * 20 * s, d.y + Math.sin(ang) * 7 * s); ctx.stroke(); }
    } else if (d.kind === 'icespike') {
      const rise = Math.min(1, age / 0.1);
      for (let k = 0; k < 5; k++) {
        const ox = (k - 2) * 7 * s, h = (22 + hash01(d.seed + k) * 22) * s * rise, lean = (k - 2) * 0.12;
        ctx.fillStyle = `rgba(186, 230, 253, ${0.8 * a})`; ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * a})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(d.x + ox - 4 * s, d.y + 4); ctx.lineTo(d.x + ox + lean * h, d.y + 4 - h); ctx.lineTo(d.x + ox + 4 * s, d.y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    } else if (d.kind === 'mud') {
      ctx.fillStyle = `rgba(74, 50, 24, ${0.6 * a})`;
      for (let k = 0; k < 5; k++) { const ang = hash01(d.seed + k) * 6.28, r = 8 + hash01(d.seed + k * 3) * 10; ctx.beginPath(); ctx.ellipse(d.x + Math.cos(ang) * r * s, d.y + Math.sin(ang) * r * 0.4 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill(); }
    } else if (d.kind === 'toxic') {
      ctx.fillStyle = `rgba(20, 83, 45, ${0.45 * a})`; ctx.beginPath(); ctx.ellipse(d.x, d.y, 28 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// Environment overlays. a = 0..1 envelope.
function drawEnvironment(ctx, size, kind, a) {
  if (!kind || a <= 0) return;
  const time = battle.time;
  ctx.save();
  if (kind === 'storm') {
    ctx.fillStyle = `rgba(8, 20, 45, ${0.32 * a})`; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(191, 219, 254, ${0.35 * a})`; ctx.lineWidth = 1; ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) { const x = (hash01(i) * (size + 80) + time * 140) % (size + 80) - 40, y = (hash01(i * 3.7) * size + time * 700) % size; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 18); ctx.stroke(); }
    if (hash01(Math.floor(time * 3)) > 0.82) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(191, 219, 254, ${0.14 * a})`; ctx.fillRect(0, 0, size, size); }
  } else if (kind === 'wind') {
    ctx.fillStyle = `rgba(203, 213, 225, ${0.1 * a})`; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(241, 245, 249, ${0.35 * a})`; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (let i = 0; i < 40; i++) { const y = hash01(i * 2.3) * size, x = (hash01(i) * (size + 200) + time * (500 + hash01(i) * 300)) % (size + 200) - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 4, x + 60, y); ctx.stroke(); }
  } else if (kind === 'toxic') {
    const g = ctx.createLinearGradient(0, size, 0, 0); g.addColorStop(0, `rgba(20, 83, 45, ${0.35 * a})`); g.addColorStop(1, `rgba(20, 83, 45, ${0.08 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) { const ph = (time * 0.15 + hash01(i)) % 1; ctx.fillStyle = `rgba(134, 239, 172, ${0.35 * a * Math.sin(ph * Math.PI)})`; ctx.beginPath(); ctx.arc(hash01(i * 5) * size, size - ph * size, 2 + hash01(i * 7) * 2, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'fire') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(234, 88, 12, ${(0.09 + 0.03 * Math.sin(time * 17)) * a})`; ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, 0, size * 0.4); g.addColorStop(0, `rgba(28, 25, 23, ${0.35 * a})`); g.addColorStop(1, 'rgba(28, 25, 23, 0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size * 0.4);
    if (Math.random() < 0.8 * a) emitParticle(0, Math.random() * size, size * (0.6 + Math.random() * 0.4), (Math.random() - 0.5) * 20, -60 - Math.random() * 60, 1.2, 1.2, Math.random() < 0.5 ? '#fdba74' : '#fde047');
  } else if (kind === 'golden') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const x = size * (0.1 + i * 0.2) + Math.sin(time * 0.5 + i) * 20, g = ctx.createLinearGradient(x, 0, x + 120, size);
      g.addColorStop(0, `rgba(253, 230, 138, ${0.14 * a})`); g.addColorStop(1, 'rgba(253, 230, 138, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 200, size); ctx.lineTo(x + 110, size); ctx.closePath(); ctx.fill();
    }
  } else if (kind === 'steam') {
    for (let i = 0; i < 7; i++) softPuff(ctx, (hash01(i) * size + time * 25) % (size + 160) - 80, hash01(i * 3) * size, 120, '226, 232, 240', 0.22 * a);
  } else if (kind === 'mud') {
    ctx.fillStyle = `rgba(66, 46, 20, ${0.16 * a})`; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 6; i++) { const ph = (time * 0.7 + hash01(i)) % 1, c = ringTile(Math.floor(hash01(i * 9 + Math.floor(time * 0.7 + hash01(i))) * 16), size); ctx.strokeStyle = `rgba(190, 242, 100, ${0.3 * a * (1 - ph)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, 6 + ph * 26, 2 + ph * 9, 0, 0, Math.PI * 2); ctx.stroke(); }
  } else if (kind === 'frost') {
    ctx.fillStyle = `rgba(186, 230, 253, ${0.12 * a})`; ctx.fillRect(0, 0, size, size);
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.72); g.addColorStop(0, 'rgba(240, 249, 255, 0)'); g.addColorStop(1, `rgba(240, 249, 255, ${0.45 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * a})`;
    for (let i = 0; i < 70; i++) { const x = (hash01(i) * size + time * 40 + Math.sin(time + i) * 10) % size, y = (hash01(i * 6.1) * size + time * 70) % size; ctx.beginPath(); ctx.arc(x, y, 1 + hash01(i * 2) * 1.4, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}
const CHANNEL_ENV = { 'azure-dragon': 'storm', 'white-tiger': 'wind', 'xuanwu-toxin': 'toxic', 'phoenix-inferno': 'fire', 'great-sage-staff': 'golden', magmaLord: 'fire', tempestArchon: 'fire', steamSovereign: 'steam', quagmireColossus: 'mud', blizzardArchon: 'frost' };
const ULT_ENV = { 'azure-wrath': 'storm', 'tiger-roar': 'wind', 'xuanwu-lob': 'toxic', 'phoenix-inferno': 'fire', 'sage-staff': 'golden', 'magma-eruption': 'fire', 'fire-tornado': 'fire', 'steam-eruption': 'steam', 'mud-wave': 'mud', 'blizzard': 'frost' };
// Per-hit impact profile for each staggered ultimate.
const ULT_IMPACT = {
  'azure-wrath': { shake: 4, flash: '191, 219, 254', decal: 'scorch', s: 0.8 },
  'tiger-roar': { shake: 1.5 },
  'magma-eruption': { shake: 3, flash: '253, 186, 116', decal: 'scorch', smoke: '41, 37, 36', s: 1 },
  'fire-tornado': { shake: 2, decal: 'scorch', smoke: '68, 64, 60', s: 0.8 },
  'mud-wave': { shake: 2, decal: 'mud', s: 1 },
  'blizzard': { shake: 2.5, flash: '224, 242, 254', decal: 'frost', spikes: true, s: 1 },
  'sage-staff': { shake: 0, decal: 'gold', s: 0.9 }
};
// Environment envelope and per-hit impacts for an ultimate effect; called by draw() before its drawer.
function drawUltRealism(ctx, f, size) {
  const t = fxTime(f), env = ULT_ENV[f.type];
  if (env) drawEnvironment(ctx, size, env, Math.min(1, t / 0.15) * Math.min(1, f.ttl / 0.5));
  const prof = ULT_IMPACT[f.type], sch = f.schedule || {};
  if (prof && sch.hits) for (const h of sch.hits) {
    if (t < h.at) continue;
    onceEach(f, 'real' + h.uid, () => {
      const p = enemyPt(f, h.uid, size); if (!p) return;
      if (prof.shake) vfxShake(prof.shake);
      if (prof.flash) { addDecal('flash', p.x, p.y - 10, 0.8, 0.25); DECALS[DECALS.length - 1].rgb = prof.flash; }
      if (prof.decal) addDecal(prof.decal, p.x, p.y + 8, prof.s || 1, 3);
      if (prof.spikes) addDecal('icespike', p.x, p.y + 8, 1, 1.4);
      if (prof.smoke) smoke(p.x, p.y, 4, prof.smoke, 1);
      if (f.type !== 'tiger-roar') burstImpact(p.x, p.y + 6, 0, 2, 5, 0.8);
    });
  }
  if (f.type === 'sage-staff' && t >= (sch.impactAt || 0.55)) onceEach(f, 'realStaff', () => { vfxShake(8); for (let i = 0; i < 4; i++) { const c = ringTile(sch.quadrant * 4 + i, size); addDecal('gold', c.x, c.y + 8, 1.2, 3.5); smoke(c.x, c.y, 3, '120, 113, 108', 1.2); } });
  if (f.type === 'xuanwu-lob' && t >= (sch.landAt || 0.5)) onceEach(f, 'realLob', () => { vfxShake(3); for (let i = 0; i < 4; i++) { const c = ringTile(sch.quadrant * 4 + i, size); addDecal('toxic', c.x, c.y + 8, 1, 5.5); } });
  if (f.type === 'steam-eruption') onceEach(f, 'realSteam', () => vfxShake(3));
}

// ==== Bigger set pieces ====
// Spectral black tortoise with its serpent, for Xuanwu's channel and toxin lob.
function drawSpiritTortoise(ctx, x, y, s, alpha, time) {
  if (alpha <= 0) return;
  additiveGlow(ctx, x, y, 90 * s, '45, 212, 191', 0.3 * alpha);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = 'rgba(15, 50, 40, 0.85)';
  for (const [lx, ly] of [[-34, 14], [34, 14], [-26, 26], [26, 26]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); }   // legs
  ctx.beginPath(); ctx.ellipse(48, 4 + Math.sin(time * 2) * 2, 12, 9, 0.2, 0, Math.PI * 2); ctx.fill();                                            // head
  const g = ctx.createRadialGradient(-8, -14, 4, 0, 0, 46); g.addColorStop(0, 'rgba(45, 212, 191, 0.9)'); g.addColorStop(1, 'rgba(6, 40, 30, 0.95)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 44, 30, 0, Math.PI, 0); ctx.lineTo(44, 6); ctx.quadraticCurveTo(0, 16, -44, 6); ctx.closePath(); ctx.fill();   // shell
  ctx.strokeStyle = 'rgba(167, 243, 208, 0.75)'; ctx.lineWidth = 1.4;
  drawHex(ctx, 0, -12, 12); ctx.stroke(); drawHex(ctx, -22, -4, 10); ctx.stroke(); drawHex(ctx, 22, -4, 10); ctx.stroke();
  ctx.strokeStyle = 'rgba(74, 222, 128, 0.95)'; ctx.lineWidth = 5; ctx.lineCap = 'round';                                                       // serpent coiling over the shell
  ctx.beginPath(); for (let i = 0; i <= 28; i++) { const u = i / 28, ang = Math.PI * (0.1 + 1.6 * u) + time * 1.5; const px = Math.cos(ang) * (40 - u * 6), py = -10 + Math.sin(ang) * 22; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
  ctx.restore();
}
// Rebirth Inferno: the phoenix soars to the top of the board, bursts at schedule.burstAt, and fire rains on all
// 16 tiles at once (the tiles ignite together in the engine).
function drawPhoenixInferno(ctx, f, size) {
  const t = fxTime(f), burst = f.schedule?.burstAt ?? 0.6, o = routePoint(f.x, f.y, size), top = { x: size / 2, y: size * 0.22 };
  if (t < burst) {
    const k = easeOut(t / burst), x = o.x + (top.x - o.x) * k, y = o.y - 30 + (top.y - (o.y - 30)) * k;
    for (let i = 1; i <= 8; i++) { const kk = Math.max(0, k - i * 0.05), tx = o.x + (top.x - o.x) * kk, ty = o.y - 30 + (top.y - (o.y - 30)) * kk; additiveGlow(ctx, tx, ty + i * 4, 26 - i * 2, FLAME, 0.5 - i * 0.05); }   // fire trail
    additiveGlow(ctx, x, y, 90 * (0.6 + k * 0.6), FLAME, 0.7);
    drawPhoenixWings(ctx, x, y, 70 + 70 * k, 1, Math.sin(battle.time * 10));
    additiveGlow(ctx, x, y, 14, '254, 240, 138', 1);
    return;
  }
  const since = t - burst;
  onceEach(f, 'burst', () => {
    vfxShake(7); burstColors(top.x, top.y, 40, ['#fde047', '#fb923c', '#ffffff', '#dc2626'], 2.2, 0.7);
    for (let i = 0; i < 16; i++) { const c = trackPoint(i + 0.5, size); addDecal('scorch', c.x, c.y + 8, 1.1, 5.6); smoke(c.x, c.y, 2, '68, 64, 60', 1); }
  });
  if (since < 0.25) additiveGlow(ctx, top.x, top.y, 260 * (0.6 + since), '254, 240, 138', 0.9 * (1 - since / 0.25));
  if (since < 0.5) {                                                         // shockwave ring and fire raining onto every tile
    const k = since / 0.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(253, 186, 116, ${0.8 * (1 - k)})`; ctx.lineWidth = 5 * (1 - k); ctx.beginPath(); ctx.ellipse(top.x, top.y, 40 + k * 320, 20 + k * 160, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 16; i++) { const c = trackPoint(i + 0.5, size), q = Math.min(1, since / 0.18), x = top.x + (c.x - top.x) * q, y = top.y + (c.y - top.y) * q; drawFlameLine(ctx, [{ x: top.x + (c.x - top.x) * Math.max(0, q - 0.35), y: top.y + (c.y - top.y) * Math.max(0, q - 0.35) }, { x, y }], 1, 1 - k); }
  }
}
// Firestorm Tempest normal attack: three crescent blades of fire-wrapped wind sweep along the quadrant,
// cutting through each enemy; enemies pushed back are blown away with a gust.
function drawFireGust(ctx, f, size) {
  const prog = fxProg(f), q0 = f.schedule?.quad ?? 0, time = battle.time;
  for (let b = 0; b < 3; b++) {
    const k = Math.min(1, Math.max(0, (prog - b * 0.1) / 0.55)), fade = prog < 0.75 ? 1 : 1 - (prog - 0.75) / 0.25;
    if (k <= 0 || k >= 1) continue;
    const p = q0 + 4 * k, c = trackPoint(Math.min(15.999, p), size), n = trackPoint(Math.min(15.999, p + 0.1), size), ang = Math.atan2(n.y - c.y, n.x - c.x);
    ctx.save(); ctx.translate(c.x, c.y - 12 - b * 3); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const [w, col] of [[11, `rgba(220, 38, 38, ${0.35 * fade})`], [5, `rgba(${FLAME}, ${0.85 * fade})`], [1.6, `rgba(254, 243, 199, ${fade})`]]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(-14, 0, 22 + b * 3, -1.15, 1.15); ctx.stroke(); }
    ctx.strokeStyle = `rgba(241, 245, 249, ${0.5 * fade})`; ctx.lineWidth = 1;            // wind trailing behind the blade
    for (let s = -1; s <= 1; s++) { ctx.beginPath(); ctx.moveTo(-30, s * 9); ctx.lineTo(-60 - Math.random() * 10, s * 9 + 2); ctx.stroke(); }
    ctx.restore();
    if (Math.random() < 0.6) emitParticle(0, c.x, c.y - 12, (Math.random() - 0.5) * 40, -40 - Math.random() * 40, 0.4, 1.2, Math.random() < 0.5 ? '#fb923c' : '#fde047');
  }
  for (const pt of chainPts(f, size)) {
    const e = battle.enemies.find(v => v.uid === pt.uid), cut = Math.min(1, prog / 0.55) * 4 + q0 >= (e ? visualTrackP(e) : 99);
    if (!cut) continue;
    onceEach(f, 'cut' + pt.uid, () => { burstColors(pt.x, pt.y - 10, 8, ['#fb923c', '#fde047', '#ffffff'], 1, 0.3); vfxShake(1.2); });
    if (e?.warpFx && time - e.warpFx.at < 0.5) {                               // pushed back: a gust blows the runner away
      const a = 1 - (time - e.warpFx.at) / 0.5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(241, 245, 249, ${0.6 * a})`; ctx.lineWidth = 1.4;
      for (let s = 0; s < 4; s++) { ctx.beginPath(); ctx.moveTo(pt.x - 26, pt.y - 20 + s * 6); ctx.quadraticCurveTo(pt.x, pt.y - 24 + s * 6, pt.x + 26, pt.y - 20 + s * 6); ctx.stroke(); }
      ctx.restore();
    }
  }
}


function drawCultivationSword(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || 0.22);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.24 - 30;
  const headT = Math.min(1, Math.max(0.05, prog * 1.15));
  const tailT = Math.max(0, headT - 0.28);

  ctx.save();
  // Talisman ribbon trail with rune dashes
  ctx.lineCap = 'round';
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = pal.trail;
  ctx.lineWidth = 3.5 * (1 - prog * 0.4);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.3);
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const t = tailT + (headT - tailT) * (i / 6);
    const p = bezierPt(x0, y0, cx, cy, tx, ty, t);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Flying Sword Blade oriented along tangent
  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const prev = bezierPt(x0, y0, cx, cy, tx, ty, Math.max(0, headT - 0.04));
  const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
  ctx.translate(head.x, head.y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Sword Blade
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(14, 0);       // tip
  ctx.lineTo(-6, -3.5);   // left edge
  ctx.lineTo(-8, 0);      // hilt
  ctx.lineTo(-6, 3.5);    // right edge
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden Crossguard & Bagua Ring
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -7); ctx.lineTo(-6, 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-8, 0, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// --- 2. BLOODLINE: TRIPLE CLAW TEARS & SNAPPING BEAST FANGS ---
function drawBloodlineClaws(ctx, x0, y0, tx, ty, prog, pal) {
  const ang = Math.atan2(ty - y0, tx - x0);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.5);

  // 3 Jagged Crimson Claw Tears
  const spread = 0.88;
  const r = 26 + prog * 16;
  for (let c = -1; c <= 1; c++) {
    ctx.save();
    ctx.translate(c * 6, c * 8);
    ctx.strokeStyle = c === 0 ? pal.primary : pal.secondary;
    ctx.lineWidth = 6 * (1 - prog * 0.45);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-10, 0, r, -spread, spread);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-9, 0, r, -spread * 0.7, spread * 0.7);
    ctx.stroke();
    ctx.restore();
  }

  // Snapping Beast Fangs (close shut at impact)
  const jawClose = Math.max(0, 1 - prog * 1.8) * 12;
  ctx.fillStyle = '#fff4ea';
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -10 - jawClose); ctx.lineTo(4, -jawClose); ctx.lineTo(-12, -4 - jawClose);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, 10 + jawClose); ctx.lineTo(4, jawClose); ctx.lineTo(-12, 4 + jawClose);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// --- 3. SCRAPWORK: SPINNING ARTILLERY SHELL WITH EXHAUST PUFFS ---
function drawScrapworkShell(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || -0.2);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.22 - 28;
  const headT = Math.min(1, Math.max(0.05, prog * 1.15));

  ctx.save();
  // Trailing grey exhaust smoke puffs
  for (let i = 1; i <= 4; i++) {
    const t = Math.max(0, headT - i * 0.08);
    const p = bezierPt(x0, y0, cx, cy, tx, ty, t);
    ctx.globalAlpha = Math.max(0, (1 - prog) * (0.65 - i * 0.12));
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4 + i * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spinning Artillery Shell
  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const prev = bezierPt(x0, y0, cx, cy, tx, ty, Math.max(0, headT - 0.04));
  const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
  ctx.translate(head.x, head.y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Shell Body
  ctx.fillStyle = '#c89d5c';
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(11, 0);        // conical nose
  ctx.lineTo(4, -4.5);
  ctx.lineTo(-7, -4.5);     // body
  ctx.lineTo(-7, 4.5);
  ctx.lineTo(4, 4.5);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Stabilizer Fins & Orange Rocket Plume
  ctx.fillStyle = pal.secondary;
  ctx.fillRect(-12, -2, 5, 4);
  ctx.restore();
}

// --- 4. CYBER MATRIX: ZIG-ZAG DIGITAL MONOWIRE WHIP ---
function drawCyberMonowire(ctx, x0, y0, tx, ty, prog, pal) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);
  const segments = 8;
  const dx = tx - x0, dy = ty - y0;

  // Chromatic Aberration Underlayer
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, y0 - 2);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const jitter = Math.sin(t * 14 + prog * 18) * 8 * (1 - t * 0.4);
    ctx.lineTo(x0 + dx * t + 3, y0 + dy * t + jitter - 2);
  }
  ctx.stroke();

  // Primary High-Voltage Cyan Monowire
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const jitter = Math.sin(t * 14 + prog * 18) * 8 * (1 - t * 0.4);
    ctx.lineTo(x0 + dx * t, y0 + dy * t + jitter);
  }
  ctx.stroke();

  // White High-Intensity Laser Core
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

// --- 5. ARCANE LOOM: DUAL-HELIX ORBITING ELEMENTAL SPHERES ---
function drawArcaneRunes(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || 0.24);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.22 - 28;
  const headT = Math.min(1, Math.max(0.05, prog * 1.15));

  ctx.save();
  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const ang = Math.atan2(head.y - y0, head.x - x0);

  // Trailing violet aether ribbon
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 3;
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.2);
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const t = Math.max(0, headT - i * 0.05);
    const p = bezierPt(x0, y0, cx, cy, tx, ty, t);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // Two Orbiting Elemental Spheres (Fire Orange & Ice Cyan)
  const orbitR = 8;
  const spin = prog * Math.PI * 8;
  const o1x = head.x + Math.cos(spin) * orbitR;
  const o1y = head.y + Math.sin(spin) * orbitR * 0.6;
  const o2x = head.x - Math.cos(spin) * orbitR;
  const o2y = head.y - Math.sin(spin) * orbitR * 0.6;

  ctx.fillStyle = '#f97316'; // Fire Orb
  ctx.beginPath(); ctx.arc(o1x, o1y, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#38bdf8'; // Ice Orb
  ctx.beginPath(); ctx.arc(o2x, o2y, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// --- 6. HAUNTED: CURSED BLOOD SCISSOR SHEARS & VHS TEAR LINES ---
function drawHauntedScissors(ctx, x0, y0, tx, ty, prog, pal) {
  const ang = Math.atan2(ty - y0, tx - x0);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.5);

  // Horizontal VHS Glitch Scanlines
  ctx.strokeStyle = '#ffffff88';
  ctx.lineWidth = 1.5;
  for (let g = -1; g <= 1; g++) {
    const gy = g * 12 + Math.sin(prog * 15) * 4;
    ctx.beginPath();
    ctx.moveTo(-35, gy); ctx.lineTo(35, gy);
    ctx.stroke();
  }

  // Dual Scissor Blades slicing inward in X-Shear
  const snipAngle = Math.max(0.12, (1 - prog * 2.2) * 0.75);
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.rotate(side * snipAngle);
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-22, -side * 6);
    ctx.lineTo(18, 0);          // point
    ctx.lineTo(-14, side * 3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Finger loop handle
    ctx.beginPath();
    ctx.arc(-22, -side * 7, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// --- 7. FORBIDDEN TEXTS: WRITHING SINE-WAVE TENTACLE & VOID EYE ---
function drawCosmicTentacle(ctx, x0, y0, tx, ty, curve, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  const segments = 10;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Writhing Sine-Wave Spine
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 7 * (1 - prog * 0.4);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const wave = Math.sin(t * 8 + prog * 16) * 10 * (1 - t * 0.3);
    const px = x0 + dx * t + wave * (dy / (Math.hypot(dx, dy) || 1));
    const py = y0 + dy * t - wave * (dx / (Math.hypot(dx, dy) || 1));
    ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Dark Abyssal Core
  ctx.strokeStyle = pal.trail;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Opening Void Eye Pupil at target
  if (prog > 0.45) {
    const ep = Math.min(1, (prog - 0.45) / 0.55);
    ctx.translate(tx, ty);
    ctx.fillStyle = '#06020c';
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * ep, 7 * ep, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff2a6d';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5 * ep, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// --- 8. ECLIPSE HUNT: 180° MOONLIGHT-SILVER BROADSWORD WAVE ---
function drawHuntBroadsword(ctx, x0, y0, tx, ty, prog, pal) {
  const ang = Math.atan2(ty - y0, tx - x0);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Massive 180° Silver Arc
  const r = 36 + prog * 18;
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 8 * (1 - prog * 0.45);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-12, 0, r, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.stroke();

  // Razor-sharp inner white core
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-10, 0, r, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();

  // Black Iron Sparks
  ctx.fillStyle = pal.secondary;
  for (let s = -2; s <= 2; s++) {
    const a = s * 0.35;
    const sx = Math.cos(a) * (r + 8 * prog) - 12;
    const sy = Math.sin(a) * (r + 8 * prog);
    ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.restore();
}

// --- 9. ORBITAL XENO-LAB: NEEDLE SPIKE & ROTATING BIOMETRIC RETICLE ---
function drawScifiNeedle(ctx, x0, y0, tx, ty, prog, pal) {
  const dx = tx - x0, dy = ty - y0;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (1 - prog) * 1.6);

  // Rotating Triangular Biometric Target-Lock Reticle on Runner
  const lockR = Math.max(12, 28 * (1 - prog * 0.8));
  const spin = prog * Math.PI * 4;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(spin);
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const px = Math.cos(a) * lockR, py = Math.sin(a) * lockR;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // Needle Spike Projectile
  const curX = x0 + dx * prog, curY = y0 + dy * prog;
  const ang = Math.atan2(dy, dx);
  ctx.translate(curX, curY);
  ctx.rotate(ang);
  ctx.fillStyle = pal.primary;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(-8, -2.5);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 2.5);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Acid droplet trail
  ctx.fillStyle = pal.primary;
  ctx.beginPath(); ctx.arc(-14, -1, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-22, 1, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function draw() {
  let canvas = $('#arena');
  if (!canvas || !battle) return;
  let ctx = canvas.getContext('2d'), size = 700, unit = size / 5;
  ctx.clearRect(0, 0, size, size);

  // Particles run on wall time, scaled by game speed and slow motion; frozen while paused or in hit-stop
  const vfxNow = performance.now();
  let vfxDt = Math.min(0.05, (vfxNow - (draw.lastT || vfxNow)) / 1000);
  draw.lastT = vfxNow;
  if (paused || (battle.hitStopRemaining || 0) > 0) vfxDt = 0;
  updateParticles(vfxDt * simSpeed() * (battle.slowMo ? battle.slowMo.scale : 1));

  // Impact camera: 4% punch-in toward the impact point and a mostly vertical, downward-first shake
  ctx.save();
  if (VFX_SHAKE.ttl > 0) VFX_SHAKE.ttl = Math.max(0, VFX_SHAKE.ttl - vfxDt * simSpeed());   // renderer-only shake from ability impacts
  const shakeSrc = battle.shake && battle.shake.ttl > 0 ? battle.shake : VFX_SHAKE.ttl > 0 ? VFX_SHAKE : null;
  if (shakeSrc) {
    const sh = shakeSrc, k = Math.min(1, sh.ttl / (sh.max || 0.25)), m = sh.mag * k, z = 1 + Math.min(0.04, 0.006 * sh.mag) * k;
    const fp = sh.x != null ? routePoint(sh.x, sh.y, size) : { x: size / 2, y: size / 2 };
    ctx.translate(fp.x, fp.y);
    ctx.scale(z, z);
    ctx.translate(-fp.x, -fp.y);
    ctx.translate((Math.random() * 2 - 1) * m * 0.3, Math.cos((0.25 - sh.ttl) * 70) * m);
  }

  // The channelling Sword Immortal lifts and glows (DOM card over the canvas)
  for (const u of battle.units) {
    const card = document.querySelector(`.field-card[data-id="${u.uid}"]`);
    if (!card) continue;
    const glow = !u.removed && CHANNEL_GLOW[u.channeling?.type];
    for (const cls of Object.values(CHANNEL_GLOW)) card.classList.toggle(cls, cls === glow);
  }

  drawInkPuddles(ctx, size);
  drawBloodGround(ctx, size);
  drawDecals(ctx, size);                                  // scorch, cracks, frost, mud and toxin left by impacts

  // Ecosystem grounds
  for (const oil of battle.oilPools || []) {
    const p = Game.track(oil.tile + 0.5), q = routePoint(p.x, p.y, size);
    ctx.fillStyle = '#d97524aa';
    ctx.beginPath();
    ctx.ellipse(q.x, q.y, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const pos = e => { let p = Game.track(visualTrackP(e)); return routePoint(p.x, p.y, size); };

  for (const z of battle.cyberZones || []) {
    for (let i = z.wall * 4; i < z.wall * 4 + 4; i++) {
      const p = Game.track(i + 0.5), q = routePoint(p.x, p.y, size);
      ctx.fillStyle = z.type === 'plasma' ? '#63d3f066' : '#e5724b66';
      ctx.beginPath();
      ctx.ellipse(q.x, q.y, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawElementalZones(ctx, size);   // arcane fissures, mist and swamps, Xuanwu toxin, Rebirth Inferno flames
  for (const c of battle.cyclones || []) {
    const p = Game.track(c.p), q = routePoint(p.x, p.y, size);
    ctx.strokeStyle = '#f2ac70';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(q.x, q.y, 24, battle.time * 5, battle.time * 5 + 4.8);
    ctx.stroke();
  }
  if (battle.curfewUntil > battle.time) {
    ctx.save();
    ctx.fillStyle = 'rgba(15,5,18,0.22)';
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }
  if (battle.units.some(u => !u.removed && u.id === 'stair13')) {
    for (const i of [0, 4, 8, 12]) {
      const p = Game.ring[i], q = routePoint(p[0], p[1], size), pulse = 0.65 + 0.25 * Math.sin(battle.time * 5 + i);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#d98a70';
      ctx.fillStyle = '#c96d5522';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(q.x, q.y, unit * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(q.x, q.y, unit * 0.33, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // PASS 1: Perspective-Squashed Ground Decals & Rings (Under Runners)
  for (const f of battle.effects) {
    if (f.vfxKind !== 'ring') continue;
    const to = routePoint(f.tx ?? f.x, f.ty ?? f.y, size);
    const maxT = f.maxTtl || 0.65;
    const prog = Math.min(1, Math.max(0, 1 - f.ttl / maxT));
    const pal = vfxPaletteFor(f.genre);
    drawGroundRing(ctx, to.x, to.y, (f.radius || 1.2) * unit * 0.55, prog, pal, f.genre);
  }

  // PASS 2: Runners with Layer 1B Hit-Flash, Directional Recoil Spring & Hit-Squash
  for (const e of battle.enemies) {
    let baseP = pos(e);
    e.recoilX = (e.recoilX || 0) * 0.78;
    e.recoilY = (e.recoilY || 0) * 0.78;
    e.hitSquash = (e.hitSquash || 0) * 0.80;
    const rx = baseP.x + (e.recoilX || 0), ry = baseP.y + (e.recoilY || 0);
    const isFlashing = (e.hitFlashUntil || 0) > battle.time;
    const r = e.boss ? 20 : e.champion ? 18 : e.elite ? 15 : 11;
    const color = isFlashing ? (e.hitCrit ? '#ff5a46' : '#ffffff') : e.frozenUntil > battle.time ? '#a8e9fa' : e.boss ? '#ee8295' : e.champion ? '#d6a5ef' : e.armored ? '#c4ac87' : e.swift ? '#d6cd91' : '#b0b7a3';

    ctx.save();
    ctx.translate(rx, ry);
    const sq = e.hitSquash || 0;
    if (sq > 0.01) ctx.scale(1 + sq, 1 - sq * 0.65);

    const spriteIndex = e.boss || e.champion ? 41 : e.swift ? 40 : 39;
    const sw = unitAtlas.naturalWidth / 6, sh = unitAtlas.naturalHeight / 7;
    const scale = e.boss ? 58 : e.champion ? 48 : e.elite ? 40 : 34;

    ctx.fillStyle = '#131a1480';
    ctx.beginPath();
    ctx.ellipse(0, 2, scale * 0.32, scale * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    if (unitAtlas.complete && sw) {
      ctx.globalAlpha = e.frozenUntil > battle.time ? 0.65 : 1;
      if (isFlashing) ctx.filter = e.hitCrit ? 'brightness(2.8) saturate(1.8)' : 'brightness(2.5)';
      ctx.drawImage(unitAtlas, (spriteIndex % 6) * sw, Math.floor(spriteIndex / 6) * sh, sw, sh, -scale / 2, -scale + Math.sin(battle.time * 7 + e.uid) * 1.6, scale, scale);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isFlashing) {
      ctx.fillStyle = e.hitCrit ? 'rgba(255, 95, 70, 0.55)' : 'rgba(255, 255, 255, 0.52)';
      ctx.beginPath();
      ctx.arc(0, -scale * 0.42, scale * (e.hitCrit ? 0.44 : 0.34), 0, Math.PI * 2);
      ctx.fill();
    }

    if (e.subjectZero) {
      ctx.strokeStyle = '#f1c66e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f1c66e';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SUBJECT ZERO', 0, -scale - 20);
      ctx.fillStyle = '#271d16';
      ctx.fillRect(-24, -scale - 16, 48, 4);
      ctx.fillStyle = '#f1c66e';
      ctx.fillRect(-24, -scale - 16, 48 * Math.min(1, (e.ruleMarks || 0) / 5), 4);
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(`${e.ruleMarks || 0}/5 MARKS`, 0, scale * 0.15);
    }
    if (e.alphaQuarry) {
      ctx.strokeStyle = '#e4c376';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -scale / 2, scale * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#e4c376';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('QUARRY', -22, -scale - 15);
    }
    if (e.armored) {
      ctx.strokeStyle = '#e3c58c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 6, scale * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    }

    const barWidth = scale * 0.82;
    ctx.fillStyle = '#281e21';
    ctx.fillRect(-barWidth / 2, -scale - 7, barWidth, 5);
    ctx.fillStyle = e.boss ? '#ec858d' : '#aac998';
    ctx.fillRect(-barWidth / 2, -scale - 7, barWidth * Math.max(0, e.hp / e.maxHp), 5);
    if (e.bleeds.length) {
      ctx.fillStyle = '#ff8290';
      ctx.fillRect(r + 3, -scale - 9, 4, 7);
    }
    if (e.burns?.length) {
      ctx.fillStyle = '#ffad55';
      ctx.fillRect(-r - 7, -scale - 9, 5, 9);
      ctx.font = '10px system-ui';
      ctx.fillText(e.burns.length, -r - 9, -scale - 11);
    }
    ctx.restore();
  }

  drawPersistentMarks(ctx, size);
  drawElementalMarks(ctx, size);

  // Adjacency / Devour Link Visuals
  const seen = new Set();
  for (const e of visualEvents) {
    if (e.expires < performance.now() || e.fromSlot == null || e.toSlot == null || e.fromSlot === e.toSlot) continue;
    const key = e.fromSlot + ':' + e.toSlot;
    if (seen.has(key)) continue;
    seen.add(key);
    const a = Game.xy(e.fromSlot), z = Game.xy(e.toSlot), from = cardCellCenter(a.x, a.y, size), to = cardCellCenter(z.x, z.y, size);
    ctx.globalAlpha = Math.min(0.8, (e.expires - performance.now()) / 900);
    ctx.strokeStyle = e.kind === 'devour' ? '#f293a0' : '#d9e9ae';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(to.x, to.y, unit * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

    // Active Unit Channeling VFX (Real-Time)
  for (const u of battle.units.filter(u => !u.removed)) {
    if (u.channeling) {
      const pt = routePoint(u.x + 1, u.y + 1, size);
      const chProg = Math.min(1, Math.max(0, 1 - (u.channeling.remaining / (u.channeling.duration || 1.2))));
      if (u.channeling.type === 'sword-torrent') drawSwordGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'melodic-resonance') drawMelodicGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'formation-star-river') drawFormationGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'talisman-decree') drawTalismanGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'landscape-dragon') drawLandscapeGather(ctx, pt.x, pt.y, chProg, size);
      else if (u.channeling.type === 'soul-reap-detonation') drawSoulGather(ctx, pt.x, pt.y, chProg, size, u);
      else if (u.channeling.type === 'blood-domain') drawBloodGather(ctx, pt.x, pt.y, chProg, size);
      else if (ELEMENT_GATHER[u.channeling.type]) { drawEnvironment(ctx, size, CHANNEL_ENV[u.channeling.type], Math.min(1, chProg / 0.3)); ELEMENT_GATHER[u.channeling.type](ctx, pt.x, pt.y, chProg, size, u); }
      else drawSwordTorrentChannel(ctx, pt.x, pt.y, chProg, size, u.channeling.type);
    }
  }

  // PASS 3: Aerial VFX (9 Distinct Per-Genre Projectiles, Slashes & Spells)
  for (const f of battle.effects) {
    let from = routePoint(f.x, f.y, size), to = routePoint(f.tx, f.ty, size);
    let x = from.x, y = from.y, tx = to.x, ty = to.y;
    const maxT = f.maxTtl || 0.65;
    const prog = Math.min(1, Math.max(0, 1 - f.ttl / maxT));
    const pal = vfxPaletteFor(f.genre);
    const kind = f.vfxKind || 'projectile';

    if (f.type === 'sword-channel' || kind === 'sword-channel') {
      // The live u.channeling pass above already draws an active channel; only draw orphaned ones
      const chU = battle.units.find(v => v.uid === f.uid);
      if (!(chU && chU.channeling)) drawSwordTorrentChannel(ctx, x, y, prog, size);
    } else if (f.type === 'sword-torrent' || kind === 'sword-torrent') {
      drawSwordTorrent(ctx, f, size);
    } else if (f.type === 'melodic-resonance') {
      drawMelodicResonance(ctx, f, size);
    } else if (f.type === 'formation-star-river') {
      drawFormationRiver(ctx, f, size);
    } else if (f.type === 'talisman-decree') {
      drawTalismanDecree(ctx, f, size);
    } else if (f.type === 'landscape-dragon') {
      drawLandscapeDragon(ctx, f, size);
    } else if (f.type === 'soul-reap-detonation') {
      drawSoulDetonation(ctx, f, size);
    } else if (f.type === 'blood-domain') {
      drawBloodDomain(ctx, f, size);
    } else if (ELEMENT_FX[f.type] || ELEMENT_FX[kind]) {
      if (ULT_ENV[f.type] || ULT_IMPACT[f.type]) drawUltRealism(ctx, f, size);
      (ELEMENT_FX[f.type] || ELEMENT_FX[kind])(ctx, f, size, x, y, tx, ty, prog);
    } else if (kind === 'sword-pierce') {
      drawSwordPierce(ctx, f, size);
    } else if (kind === 'harmony-chord') {
      drawHarmonyChord(ctx, f, size);
    } else if (kind === 'dissonance-chord') {
      drawDissonanceChord(ctx, f, size);
    } else if (kind === 'talisman') {
      drawTalismanShot(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'talisman-burn') {
      drawTalismanBurn(ctx, tx, ty, prog, f);
    } else if (kind === 'ink-flick') {
      drawInkFlick(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'soul-wisp') {
      drawSoulWispShot(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'soul-return') {
      drawSoulReturn(ctx, x, y, tx, ty, prog);
    } else if (kind === 'blood-slash') {
      drawBloodSlash(ctx, x, y, tx, ty, prog, f);
    } else if (kind === 'go-stone') {
      drawGoStoneShot(ctx, x, y, tx, ty, prog, f.type === 'go-stone-white', f);
    } else if (kind === 'sword' || (f.genre === 'Cultivation' && ['shot', 'spell', 'sword'].includes(kind))) {
      drawCultivationSword(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'claw' || (f.genre === 'Bloodline' && ['slash', 'claw'].includes(kind))) {
      drawBloodlineClaws(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'shell' || (f.genre === 'PostApoc' && ['shot', 'shell'].includes(kind))) {
      drawScrapworkShell(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'laser' || (f.genre === 'Cyberpunk' && ['beam', 'laser'].includes(kind))) {
      drawCyberMonowire(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'orb' || (f.genre === 'Arcane' && ['spell', 'orb'].includes(kind))) {
      drawArcaneRunes(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'scissor' || (f.genre === 'Haunted' && ['slash', 'scissor'].includes(kind))) {
      drawHauntedScissors(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'tentacle' || (f.genre === 'Lovecraft' && ['spell', 'tentacle'].includes(kind))) {
      drawCosmicTentacle(ctx, x, y, tx, ty, f.curve, prog, pal);
    } else if (kind === 'broadsword' || (f.genre === 'Grimdark' && ['slash', 'broadsword'].includes(kind))) {
      drawHuntBroadsword(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'needle' || (f.genre === 'SciFi' && ['shot', 'needle'].includes(kind))) {
      drawScifiNeedle(ctx, x, y, tx, ty, prog, pal);
    } else if (kind === 'slash') {
      drawCrescentSlash(ctx, x, y, tx, ty, prog, pal, f.genre);
    } else if (kind === 'beam' || f.type === 'beam') {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.ttl * 2.8);
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 9 * (1 - prog * 0.4);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.2 * (1 - prog * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();
      drawImpactSparks(ctx, tx, ty, prog, pal, true);
    } else if (kind === 'impact') {
      drawImpactSparks(ctx, tx, ty, prog, pal, f.crit);
    } else if (f.type === 'warp') {
      ctx.strokeStyle = '#b9a5e7';
      ctx.lineWidth = 4;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(tx, ty, unit * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      drawBezierProjectile(ctx, x, y, tx, ty, f.curve, prog, pal);
      if (prog > 0.65) drawImpactSparks(ctx, tx, ty, (prog - 0.65) / 0.35, pal, f.crit);
    }

    if (f.type === 'big-dmg') {
      drawColossalNumber(ctx, tx, ty, f);
    } else if (f.text && !['sword-torrent', 'melodic-resonance', 'formation-star-river', 'talisman-decree', 'landscape-dragon', 'soul-reap-detonation', 'blood-domain', ...ELEMENT_ULTS].includes(f.type)) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.ttl * 2.2);
      const breakthrough = ['FOUNDATION ESTABLISHMENT', 'GOLDEN CORE', 'NASCENT SOUL'].includes(String(f.text).toUpperCase());
      ctx.font = breakthrough ? 'bold 9px system-ui' : f.crit ? '800 17px system-ui' : 'bold 15px system-ui';
      ctx.textAlign = 'center';
      const textX = f.vfxKind === 'impact' ? tx : (Number.isFinite(x) ? x : tx);
      const textY = (f.vfxKind === 'impact' ? ty : (Number.isFinite(y) ? y : ty)) - (breakthrough ? 52 : 30) - prog * 26;
      ctx.strokeStyle = '#090d0acc';
      ctx.lineWidth = 3.5;
      ctx.strokeText(f.text, textX, textY);
      ctx.fillStyle = f.crit ? pal.secondary : f.type === 'growth' ? '#b4f3ae' : pal.primary || '#e6d4a4';
      ctx.fillText(f.text, textX, textY);
      ctx.restore();
    }
  }

  drawParticles(ctx);

// LAYER 4: Mythic Showstopper Radial Vignette Spotlight
  if (battle.showstopper && battle.showstopper.ttl > 0) {
    const sh = battle.showstopper;
    const spot = routePoint(sh.x, sh.y, size);
    const alpha = Math.min(0.42, (sh.ttl / (sh.maxTtl || 0.65)) * 0.55);
    const pal = vfxPaletteFor(sh.genre);
    ctx.save();
    const grad = ctx.createRadialGradient(spot.x, spot.y, 28, spot.x, spot.y, size * 0.65);
    grad.addColorStop(0, 'rgba(255, 248, 220, 0.14)');
    grad.addColorStop(0.22, pal.glow || 'rgba(92, 225, 230, 0.12)');
    grad.addColorStop(1, `rgba(6, 9, 8, ${alpha.toFixed(3)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore(); // shake transform
}
function liveUI() {
  if (!$('#field')) return;
  receiveFeedback();
  const boardEl = document.querySelector('.in-combat .board');
  if (boardEl) {
    boardEl.classList.toggle('screen-shake', Boolean(battle.showstopper && battle.showstopper.ttl > 0.35));
  }
  for (const u of battle.units.filter(u => !u.removed)) {
    let el = document.querySelector('#field [data-id="' + u.uid + '"]');
    if (!el) {
      $('#field').insertAdjacentHTML('beforeend', fieldUnit(u));
      el = document.querySelector('#field [data-id="' + u.uid + '"]');
    } else if (el.dataset.card !== u.id || el.dataset.layout !== `${u.slot}:${u.extraSlot ?? ''}:${(u.modules || []).join()}:${u.mountedHead || ''}`) {
      el.outerHTML = fieldUnit(u);
      el = document.querySelector('#field [data-id="' + u.uid + '"]');
    }
    const active = visualEvents.filter(e => e.expires > performance.now());
    el.classList.toggle('combo-source', active.some(e => String(e.fromUid) === String(u.uid)));
    el.classList.toggle('combo-target', active.some(e => String(e.toUid) === String(u.uid)));
    el.classList.toggle('selected', String(selected) === String(u.uid));
    el.classList.toggle('inactive', u.state !== 'active');
    el.classList.toggle('trial-stunned', (u.trialStunnedUntil || 0) > battle.time);
    el.classList.toggle('showstopper-pop', Boolean(battle.showstopper && String(battle.showstopper.uid) === String(u.uid) && battle.showstopper.ttl > 0));
    el.setAttribute('aria-label', CARD[u.id].name + ', ' + Math.round(Game.atk(battle, u)) + ' attack');
    el.querySelector('.field-atk').textContent = Math.round(Game.atk(battle, u));

    // Layer 1: Omnidirectional Procedural Sprite Choreography (anchored at Y=467)
    if (u.animSeq && String(u.animSeq) !== el.dataset.animSeq) {
      el.dataset.animSeq = String(u.animSeq);
      const spriteEl = el.querySelector('.sprite');
      if (spriteEl) {
        const ux = u.x + 1, uy = u.y + 1;
        const tx = u.animTarget ? u.animTarget.x : ux;
        const ty = u.animTarget ? u.animTarget.y : uy - 1;
        const rawDx = tx - ux, rawDy = ty - uy;
        const dist = Math.hypot(rawDx, rawDy) || 1;
        const nx = rawDx / dist, ny = rawDy / dist;
        const durMs = Math.max(90, Math.min(420, Math.round(((u.attackInterval || 1.2) * 650) / (typeof speed === 'number' && speed > 0 ? speed : 1))));
        spriteEl.style.setProperty('--dx', `${(nx * 14).toFixed(1)}px`);
        spriteEl.style.setProperty('--dy', `${(ny * 12).toFixed(1)}px`);
        spriteEl.style.setProperty('--rx', `${(-nx * 10).toFixed(1)}px`);
        spriteEl.style.setProperty('--ry', `${(-ny * 8).toFixed(1)}px`);
        spriteEl.style.setProperty('--rot', `${(nx * 3.5).toFixed(2)}deg`);
        spriteEl.style.setProperty('--anim-dur', `${durMs}ms`);
        const cls = 'anim-' + (u.animType || 'lunge');
        spriteEl.classList.remove('anim-lunge', 'anim-recoil', 'anim-cast', 'anim-glitch');
        void spriteEl.offsetWidth;
        spriteEl.classList.add(cls);
      }
    }
  }
  const hpHTML = `${Math.ceil(run.health)}<span>/${run.maxHealth}</span>`;
  document.querySelectorAll('#hp,.stat-hp').forEach(el => el.innerHTML = hpHTML);
  document.querySelectorAll('#coin-count,.stat-coin').forEach(el => el.textContent = run.coins || 0);
  const deckStat = document.querySelector('.stats .stat:nth-child(3) b');
  if (deckStat) deckStat.innerHTML = run.roster.length + '<span> cards</span>';
  if (modal.open && modal.dataset.live === 'true' && $('#live-card-detail')) $('#live-card-detail').innerHTML = detail();
  $('#loss-strip').innerHTML = lossNotice();
  const bhud = $('#blackout-hud'); if (bhud) bhud.innerHTML = blackoutHUDHTML(battle);
  const xhud = $('#xeno-trial-hud'); if (xhud) xhud.innerHTML = xenoTrialHUDHTML(battle);
  const cthud = $('#cosmic-trial-hud'); if (cthud) cthud.innerHTML = cosmicTrialHUDHTML(battle);
  const thud = $('#heavenly-trial-hud'); if (thud) thud.innerHTML = heavenlyTrialHUDHTML(battle);
  const athud = $('#arcane-trial-hud'); if (athud) athud.innerHTML = arcaneTrialHUDHTML(battle);
  const sthud = $('#scrapwork-trial-hud'); if (sthud) sthud.innerHTML = scrapworkTrialHUDHTML(battle);
  const cyhud = $('#cyber-trial-hud'); if (cyhud) cyhud.innerHTML = cyberTrialHUDHTML(battle);
  const hthud = $('#hunt-trial-hud'); if (hthud) hthud.innerHTML = huntTrialHUDHTML(battle);
  const blhud = $('#bloodline-trial-hud'); if (blhud) blhud.innerHTML = bloodlineTrialHUDHTML(battle);
  const uthud = $('#urban-trial-hud'); if (uthud) uthud.innerHTML = urbanContainmentHUDHTML(battle);
  const ulthud = $('#urban-legend-trial-hud'); if (ulthud) ulthud.innerHTML = urbanLegendTrialHUDHTML(battle);
  for (const u of battle.units.filter(u => u.removed)) document.querySelector('#field [data-id="' + u.uid + '"]')?.remove();
}
function frame(ts){let dt=Math.min(.1,(ts-last)/1000||0);last=ts;if(screen==='lab'&&battle){if(!paused){let left=dt*labSpeed;while(left>0){let step=Math.min(1/30,left);Game.step(battle,step);left-=step}}draw();uiClock+=dt;if(uiClock>.15){labUI();uiClock=0}requestAnimationFrame(frame);return}if(battle&&!battle.done&&!paused&&screen==='game'&&(!modal.open||modal.dataset.live==='true')){let left=dt*speed;while(left>0&&!battle.done){let step=Math.min(1/30,left);Game.step(battle,step);left-=step}if(battle.done){if(modal.open)modal.close();selected=null;save();render();window.scrollTo(0,0)}}if(battle&&screen==='game'&&run.phase==='combat'){draw();uiClock+=dt;if(uiClock>.15){liveUI();uiClock=0}}requestAnimationFrame(frame)}
render();if(resetSavedRuns)toast('Your saved run was cleared for the update.');requestAnimationFrame(frame);




