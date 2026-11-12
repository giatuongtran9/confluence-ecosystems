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
  </nav>`;
}
const $=s=>document.querySelector(s),app=$('#app'),modal=$('#modal');
const RUN_KEY='confluence-run-v4',RESET_KEY='confluence-save-reset-v1';
function read(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}
let resetSavedRuns=false;
try{
 if(localStorage.getItem(RESET_KEY)!=='done'){
  const oldKeys=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(key=>key&&(/^(confluence-run-|confluence-meta-|confluence-save-reset)/.test(key)));
  resetSavedRuns=oldKeys.some(key=>key.startsWith('confluence-run-'));
  for(const key of oldKeys)localStorage.removeItem(key);
  localStorage.setItem(RESET_KEY,'done');
 }
}catch{}
let run=read(RUN_KEY,null),screen='home',battle=null,selected=null,paused=false,speed=1,last=0,uiClock=0,filter='all';
if(run?.version!==4){run=null;try{localStorage.removeItem(RUN_KEY)}catch{}}

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
        <button class="hud-icon-btn" data-action="help" aria-label="Help">?</button>
      </div>
    </header>`;
  }
  return `<header class="mobile-hud lobby-hud">
    <button class="brand" data-action="home"><span class="sigil">✧</span><span><span class="brand-name">CONFLUENCE</span><span class="brand-sub">THE NINEFOLD CROSSING</span></span></button>
    <div class="lobby-actions"><button class="hud-icon-btn" data-action="help" aria-label="How to play">?</button></div>
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
function heavenlyTrialHUDHTML(b){const t=b?.heavenlyTrial;if(!t)return '';const soul=b.units.find(u=>u.uid===t.unitUid),name=soul?CARD[soul.id]?.name:'Nascent Soul';if(t.status==='active'){const until=Math.max(0,t.nextStrikeAt-b.time),pct=Math.max(0,Math.min(100,until/4*100));return `<div class="tribulation-hud active"><div class="tribulation-head"><b>⚡ HEAVENLY TRIBULATION</b><span>${until.toFixed(1)}s to next strike</span></div><div class="tribulation-meter"><i style="width:${pct}%"></i></div><p>${name} is stunned for 0.5s every 4s · lightning deals 25 damage to every active runner, including the boss.</p><p><strong>Trial:</strong> clear the Elite/Boss node with zero leaks. Failure permanently removes the Nascent Soul and ${CARD[t.relicId]?.name||'matching relic'} from your roster.</p></div>`}if(t.status==='passed')return `<div class="tribulation-hud passed"><b>✦ TRIBULATION PASSED</b><span>${CARD[t.apexId]?.name||'Mythic Immortal'} awakened · ${t.strikes} lightning strikes</span></div>`;return `<div class="tribulation-hud failed"><b>⚡ TRIBULATION FAILED</b><span>${t.reason||'A runner escaped'} · Nascent Soul and ${CARD[t.relicId]?.name||'matching relic'} removed from the roster</span></div>`}
function arcaneTrialHUDHTML(b){const t=b?.arcaneTrial;if(!t)return '';const pair=t.pair.split('+').join(' + '),name=CARD[t.apexId]?.name||'Arcane Mythic';if(t.status==='active')return `<div class="arcane-trial-hud active"><div class="urban-trial-head"><b>✦ ASTRAL WEAVING TRIAL</b><span>${pair} · ${t.nodeType.toUpperCase()}</span></div><p>${t.featDone?'Chosen reaction proved. ':'Land this reaction on an Elite, Harbinger, or Boss. '}Then clear with zero leaks to awaken ${name}. Any leak or missing feat removes the Mage and Astral Loom.</p></div>`;if(t.status==='passed')return `<div class="arcane-trial-hud passed"><b>✦ ASTRAL WEAVING PASSED</b><span>${name} awakened · Astral Loom consumed</span></div>`;return `<div class="arcane-trial-hud failed"><b>✦ ASTRAL WEAVING FAILED</b><span>${t.reason||'Trial failed'} · Mage and Astral Loom removed</span></div>`}
function scrapworkTrialHUDHTML(b){const t=b?.scrapworkTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Titan Mythic',proof=t.modules.map((m,i)=>`<span class="${t.moduleHits[`${m}:${i+1}`]?'proved':''}">${m.toUpperCase()} ${t.moduleHits[`${m}:${i+1}`]?'✓':'○'}</span>`).join(' · ');if(t.status==='active')return `<div class="scrapwork-trial-hud active"><div class="urban-trial-head"><b>⚙ TITAN FIELD TEST</b><span>${t.nodeType.toUpperCase()}</span></div><p>Each locked module must hit an Elite, Harbinger, or Boss. Then clear with zero leaks to awaken ${name}. Any leak or missing proof removes the Titan and Reactor Core.</p><p class="module-proof">${proof}</p></div>`;if(t.status==='passed')return `<div class="scrapwork-trial-hud passed"><b>⚙ FIELD TEST PASSED</b><span>${name} awakened · Reactor Core consumed</span></div>`;return `<div class="scrapwork-trial-hud failed"><b>⚙ FIELD TEST FAILED</b><span>${t.reason||'Trial failed'} · Titan and Reactor Core removed</span></div>`}
function lossNotice(){const lost=(battle.metrics.consumed||[]).filter(c=>!c.token),trial=battle.heavenlyTrial,rows=lost.map(c=>`<span>${CARD[c.id].name} #${c.uid} → ${CARD[c.by].name} #${c.byUid} · +${c.bonus} ATK</span>`);if(battle.xenoTrial?.status==='failed')rows.unshift(`<span>Sci-Fi Xeno trial failure: candidate and matching Serum removed from roster.</span>`);if(battle.cyberTrial?.status==='failed')rows.unshift(`<span>Cyber OS Overdrive failure: Operative and Military Cyber-Reactor removed from roster.</span>`);if(battle.huntTrial?.status==='failed')rows.unshift(`<span>Eclipse Hunt failure: Branded Berserker and Hunt Relic removed from roster.</span>`);if(battle.scrapworkTrial?.status==='failed')rows.unshift(`<span>Titan Field Test failure: Titan and Reactor Core removed from roster.</span>`);if(trial?.status==='failed')rows.unshift(`<span>Heavenly Tribulation failure: ${CARD[trial.relicId]?.name||'relic'} and Nascent Soul removed from roster.</span>`);const arcane=battle.arcaneTrial;if(arcane?.status==='failed')rows.unshift(`<span>Astral Weaving failure: Mage and Astral Loom removed from roster.</span>`);const legendTrial=battle.urbanLegendTrial;if(legendTrial?.status==='failed')rows.unshift(`<span>Folklore trial failure: devourer removed; same-lineage prey was already consumed.</span>`);return rows.length?`<div class="combat-loss"><strong>PERMANENTLY LOST THIS BATTLE</strong>${rows.join('')}</div>`:''}
function devourGhosts(){const age=performance.now()-openingAt;if(age>1600)return '';return (battle.metrics.consumed||[]).map(c=>{let a=Game.xy(c.slot),z=Game.xy(c.toSlot);const cell=cardCell(a.x,a.y);return `<div class="devour-ghost" style="left:${cell.left}%;top:${cell.top}%;width:${cell.width}%;height:${cell.height}%;--dx:${(z.x-a.x)*100}%;--dy:${(z.y-a.y)*100}%;animation-delay:-${age}ms">${art(CARD[c.id])}</div>`}).join('')}
function ecosystemPanel(){if(!run.roster.length)return '';const groups=[['Scrapwork Colossus',['scrapFrame','junkScavenger','magneticCrane','hydraulicRiveter','smelter','titanReactor']],['Arcane Loom',['elementalApprentice','pyroMage','hydroMage','geoMage','aeroMage','elementalPrism','manaBattery','astralLoom']],['Ripperdoc Matrix',['cyberSolo','mantisImplant','gorillaImplant','monowireImplant','sandyOS','berserkOS','cyberdeckOS','vent','cryoPump','biomonitor','accessPoint','cyberReactor']],['Cooling & Bleed',['vent','leech']],['Critical volleys',['sensor','nanite','railgun','core']],['Eclipse Hunt',['mercenary','witchHunter','executioner','leech','trophyStake','taxidermist','totem']],['Control & spells',['eye','larva','herald']],['Bloodline food chain',['cub','serpentFodder','hound','scuttler','flameToad','peachFodder','broodkeeper','matriarch','altar']],['The Containment Protocol (Arch A)',['investigator','securityCam','radioPA','coroner','decoder','occultDetective','anomalySpecialist','ruleEnforcer','ruleboard','panopticon','redPhone','boneSaw','elevatorKey','ruleArchitect','allSeeingOverseer','curfewDirector','forensicDemiurge','backroomsWarden']],['Autonomous Urban Legends (Arch B)',['kuchisake','scissorBanshee','slitMouthedSovereign','nightBus','ghostRoute','terminusBus','payphone','hauntedSwitchboard','midnightOperator','morgueMirror','doppelMirror','mirrorQueen','mannequin','stalker','livingTaboo','chainLetter','redRaincoat','bloodPhantasm','crimsonHarbinger','stair13','infiniteStair','penroseLabyrinth']],['Cosmic predation',['mass','larva','herald']],['Cultivation & Ascension',['practitioner','lotusRoot','herbGrass','cauldron','flyingSword','guqin','weiqiBoard','inkBrush','mountainScroll','soulBanner','demonBlade']]];const ids=new Set(run.roster.map(u=>u.id));return `<details class="ecosystem-guide"><summary>Your ecosystem · drafted connections</summary><p class="hint">These are overlapping paths, not classes. Only deployed cards contribute. Mix paths freely; passive support auras do not stack.</p>${groups.filter(([name,list])=>list.some(id=>ids.has(id))).map(([name,list])=>`<p><b>${name}</b><br>${list.filter(id=>ids.has(id)).map(id=>CARD[id].name).join(' · ')}<br><span class="hint">Explore: ${list.filter(id=>!ids.has(id)).map(id=>CARD[id].name).join(', ')||'All pieces drafted'}</span></p>`).join('')}</details>`}
function deckPanel(){return `<section class="panel"><div class="row between"><div><div class="eyebrow">${leader().title}</div><h3>${leader().name.split(',')[0]}</h3></div>${sprite(leader().sprite)}</div><p class="hint">${leader().passive}</p><div class="divider"></div><div class="row between"><b>Your deck · ${run.roster.length}</b>${btn('roster','Inspect','small')}</div>${ecosystemPanel()}<div class="deck-mini">${run.roster.map(u=>`<button data-action="rosterCard" data-id="${u.uid}" title="${CARD[u.id].name}">${art(CARD[u.id])}<span>${Math.round(Game.base(u))}</span></button>`).join('')||'<p class="muted">Your first draft awaits.</p>'}</div><p class="hint">Nine deployment slots are filled randomly each battle. Titans occupy two adjacent slots. A small deck is more consistent. Devoured cards are permanently lost from this run.</p>${run.relics.length?`<div class="divider"></div>${run.relics.map(id=>{let r=RELICS.find(r=>r.id===id);return `<div class="relic"><b>${r.name}</b><p>${r.desc}</p></div>`}).join('')}`:''}</section>`}
function draftView(){return `${gamehead()}<section class="draft-intro"><div><div class="eyebrow">${run.draftReason==='first'?'Your first card':'Crossing cleared · choose your reward'}</div><h2>One of three. Your choice.</h2><p class="muted">${run.draftReason==='first'?'Begin with a single attacker. Your leader’s genre gets 1.5× selection weight within each rarity in every draft.':'Recruit one card, skip to keep your deck lean, or spend 10 coins to reroll all three choices.'}</p></div>${run.recap&&run.draftReason==='reward'?`<div class="recap"><b>${run.recap.kills} defeated · ${run.recap.leaks} escaped</b><span>+${run.recap.growth.toFixed(0)} permanent ATK · ${run.recap.triggers} ability triggers</span>${run.recap.relic?`<span>Found ${run.recap.relic}</span>`:''}${run.recap.coinsEarned?`<span>+${run.recap.coinsEarned} coins earned</span>`:''}</div>`:''}</section>${run.draftReason==='reward'?battleReport(run.recap):''}<p class="hint rarity-unlocks">Normal / Rare initially · Epic from crossing 5 · Legendary from crossing 10 · Mythic Apex forms are earned only · Elites improve rarity odds</p><div class="draft-grid">${run.offers.map(id=>cardView(id,'draft')).join('')}</div><div class="actions draft-actions">${run.draftReason!=='first'?btn('skipDraft','Skip · keep deck small'):''}${btn('rerollDraft','Reroll · −10 coins','',' '+((run.coins||0)<10?'disabled':''))}</div><p class="hint center">Each reroll costs 10 coins and can be repeated while you can afford it. Normal battles pay 100 coins, Elites 200, and the Boss 500, even on losses. Skipping grants no additional reward.</p><div class="map-layout below-draft">${mapView(false)}${deckPanel()}</div>`}
function readyPanel(){const n=run.node,p=Game.wavePlan(run),field=battlefield();return `<section class="panel ready-panel"><span class="node-emblem">${NODES[n.type].icon}</span><div class="eyebrow">Crossing ${run.depth+1} · ${NODES[n.type].name}</div><h2>Bring the ecosystem to life.</h2><div class="battlefield-callout"><b>${field.theme} battlefield</b><span>Cards deploy on the center 3×3. Enemies circle the 16-tile outer track.</span></div><p>${NODES[n.type].desc}</p>${encounterPanel(n)}${readinessPanel()}<div class="preview-stats"><span><b>${p.count}</b> runners</span><span><b>${p.hp}</b> base HP</span><span><b>9</b> deployment slots</span></div>${n.type==='boss'?'<p class="health">If the final boss escapes, the run ends.</p><p class="hint">The Unraveler has 11,000 HP and halves slow strength, stun duration, and knockback. After 45 seconds on the track, it moves 25% faster and resists all stuns, freezes, and knockback.</p>':''}<p class="hint">Deploy draws your cards, shuffles them into the nine slots, resolves devours and opening effects, then starts combat immediately.</p>${btn('deploy','Deploy & Start →','primary')}<p class="hint">No manual placement · No energy cost · All attacks have global reach</p>${run.roster.some(u=>['practitioner','cultivationFoundation','cultivationGoldenCore','cultivationNascentSoul','cauldron','herbGrass','lotusRoot'].includes(u.id))?'<p class="hint">Cultivation: normal attacks grant no Qi. Spirit Grass grants +1 Qi every 4s; Lotus Blossoms give +5 Qi/+2 ATK by direct absorption or +6 Qi/+4 ATK when brewed. A Cauldron stores 3 Breakthrough Pills, auto-spends them at 30/85/175 Qi gates only while deployed, and at full storage turns Grass into +12 Qi for the highest-Qi deployed cultivator. At 200 Qi with an adjacent relic on Elite/Boss, the zero-leak Heavenly Tribulation begins.</p>':''}${run.roster.some(u=>['practitioner','cultivationFoundation','cultivationGoldenCore','cultivationNascentSoul','cauldron','herbGrass','lotusRoot'].includes(u.id))?'<p class="hint">Cultivation: normal attacks grant no Qi. Spirit Grass grants +1 Qi every 4s; Lotus Blossoms grant +5 Qi/+2 ATK on direct absorption or +6 Qi/+4 ATK when brewed by a Cauldron. At 30/85/175 Qi, a stored Breakthrough Pill is spent only with a deployed Cauldron. Shared stock: 3; at cap, Grass converts to +12 Qi. Reach 200 Qi with an adjacent eligible relic on Elite/Boss to begin the zero-leak Heavenly Tribulation.</p>':''}${run.roster.some(u=>['investigator','kuchisake','nightBus','payphone','morgueMirror','mannequin','redRaincoat','stair13','ruleboard'].includes(u.id))?'<p class="health">QUÁI ĐÀM ĐÔ THỊ: Enemies violate track rules as they march, stacking Violation Marks (+8% damage taken). Every 5 marks trigger Blackout (Tắt Đèn), slowing runners and granting Haunted units +40% attack speed and True Form attacks. Night Investigator ascends via recorded Dread; Urban Legends reach Epic at 15 and Mythic readiness at 80; an adjacent same-lineage Legend at 45+ is consumed in an Elite/Boss trial, and Mythic requires zero leaks!</p>':''}${run.roster.some(u=>['cub','herald'].includes(u.id))?'<p class="health">CONSUMPTION: predators consume only named prey. The Cub&#39;s first meal locks its lineage; all meals grant permanent ATK and matching meals alone grant evolution stacks. Bloodline fodder attacks and breeds at 10% per second when same-species neighbors are orthogonally adjacent. Eating an original permanently deletes it, including a summoning parent. Tokens and originals grant the same predator-defined reward. No eligible prey means no meal.</p>':''}</section>`}
function workshopPanel(){return `<section class="panel ready-panel"><div class="eyebrow">Fate Workshop · crossing ${run.depth+1}</div><h2>Choose a card’s next path.</h2><p>One upgrade costs <b>10 health</b>. Cards with an unearned evolution offer three awakening paths. Other cards offer three permanent upgrades. Pick a card to see the exact choices before spending.</p><div class="rostergrid">${run.roster.map(u=>btn('upgradeCard',`${art(CARD[u.id])}<b>${CARD[u.id].name} #${u.uid}</b><span>${Math.round(Game.base(u))} ATK${u.upgradePath?' · '+u.upgradePath+' path':''}</span>`,'unit-card workshop-card',`data-id="${u.uid}" ${run.health<=10?'disabled':''}`)).join('')}</div>${run.health<=10?'<p>At least 11 health is required to purchase.</p>':''}${btn('safe','Pass · restore 3 health','event-option')}</section>`}
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
 if(Game.isApprentice(u)){lines.push('Synthesis: '+Object.keys(Game.ARCANE_PAIRS).map(p=>names(p)+' '+(u.synthesis?.[p]||0)).join(' · '));lines.push('Stored essences: '+((u.essences||[]).join(', ')||'none'));const prog=Game.evolutionProgress(u);lines.push(u.boundPair?'Bound pair: '+names(u.boundPair):prog.label||'Highest pair advances at 10 / 20 / 30');}
 if(u.id==='manaBattery')lines.push('Stored mana: '+(u.manaStored||0).toFixed(2)+' / 32 · discharge every 6s');
 if(u.id==='elementalPrism')lines.push('Works from any slot · orthogonal neighbors · one pulse per second');
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
  const g=u.genome||0,strains=u.strains||[];
  lines.push(`Genome: ${g} · Strains: ${strains.join(' + ')||'none'}`);
  const pair=Game.xenoPair(strains);
  if(pair&&Game.XENO_BRANCHES[pair]){
   const [epicId,serumId,apexId]=Game.XENO_BRANCHES[pair];
   lines.push(`Lineage: ${CARD[epicId].name} → ${CARD[apexId].name} · Required Serum: ${CARD[serumId].name}`);
   lines.push(`Mythic gate: 130 Genome + two matching strains + adjacent ${CARD[serumId].name} on an Elite/Boss; zero-leak clear. Failure removes both cards.`);
  } else lines.push('Mythic gate: reach 130 Genome with two strains, then align the matching Serum beside this Xeno on an Elite/Boss; clear with zero leaks. Failure removes both cards.');
  const trial=battle?.xenoTrial;
  if(trial?.unitUid===u.uid)lines.push(`Xeno trial: ${trial.status}${trial.status==='active'?' · zero-leak clear required':trial.reason?` · ${trial.reason}`:''}`);
 }
 if(u.id==='geneSplicer'){
  lines.push('Consumes adjacent Helices every 5s to grant +12 Genome, +3 ATK to Specimen, and forge Serums.');
 }
 return lines.map(t=>`<p class="hint">${t}</p>`).join('');
}

function detail(){let u=battle?.units.find(u=>String(u.uid)===String(selected));if(!u)return `<div class="empty-detail"><span class="sigil">✧</span><h3>Watch the connections.</h3><p>Tap any card to inspect its current attack, progress, and ecosystem role.</p><p class="hint">Team effects work across the board. Only explicitly marked abilities depend on neighbors. No card can take damage.</p></div>`;const c=CARD[u.id];return `<div class="unit-title">${art(c)}<div><div class="eyebrow" style="color:${GENRES[c.genre][1]}">${GENRES[c.genre][0]}</div><h3>${c.name}</h3>${rarityBadge(c.id)}${cardTags(c,!!(u.phantom||u.token))}</div></div><div class="unit-stats"><div><b>${Math.round(Game.atk(battle,u))}</b><small>ATTACK</small></div><div><b>${u.attackInterval?(u.attackInterval/Game.speed(battle,u)).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u.permanentAtkBonus}</b><small>${u.phantom?"WAVE BONUS":"PERMANENT"}</small></div></div>${Game.isPractitioner(u)?`<p class="state-text cultivation-realm">${['Qi-Refining','Foundation Establishment','Golden Core','Nascent Soul'][u.realm||0]} · Realm ${u.realm||0}/3 · ${u.qi||0} Qi${u.realm<3?` · next pill gate ${[30,85,175][u.realm||0]} · stock ${Game.breakthroughPills?.(battle)??0}/3`:u.qi>=200?' · 200 Qi + adjacent relic: Elite/Boss trial':' · next: 200 Qi + adjacent relic on Elite/Boss'}</p>`:''}${Game.isCultivationApex(u)?`<p class="state-text cultivation-realm">Post-ascension Qi ${u.apexQi||0}/30 toward the next permanent +2 ATK · lifetime Qi ${u.qi||0}</p>`:''}${u.id==='cauldron'?`<p class="state-text cultivation-realm">Breakthrough Pills ${Game.breakthroughPills?.(battle)??0}/3 · stored while any Cauldron remains in roster; spend only while one is deployed.</p>`:''}<p class="state-text">${u.removed?(u.phantom?'Token consumed · parent safe':'Original consumed · permanently lost'):u.overclock?'Overclock · '+u.clockRemaining.toFixed(1)+'s remaining':u.state!=='active'?u.state+' · '+u.stateRemaining.toFixed(1)+'s remaining':'Active'}${u.phantom?' · one-wave token · species: '+CARD[Game.species(u)]?.name:''}</p>${u.threshold.max?`<div class="meter"><i style="width:${u.threshold.current/u.threshold.max*100}%"></i></div><p class="hint">Progress ${Math.floor(u.threshold.current)} / ${u.threshold.max}</p>`:''}${cosmicDetail(u)}${cyberDetail(u)}${arcaneDetail(u)}${huntDetail(u)}${scrapworkDetail(u)}${xenoDetail(u)}${ascensionBarHTML(u)}${evolutionHint(c,u)}${u?`<p class="hint">Workshop: ${u.upgradePath||"no awakening path"} · +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}${u.upgradePath==="storm"?" · Every sixth attack: three-target true-damage burst equal to unbuffed ATK.":""}</p>`:""}<div class="eyebrow">Rules</div><div class="ability">${c.rules}</div>${c.rules.includes('Team Power')?`<p class="hint">Current Team Power: <b>${Game.teamPower(battle).toFixed(1)}</b> · permanent ATK on deployed originals, including this card.</p>`:''}<div class="spatial ${Game.favored(battle,u)?'on':''}">Works well with<p>${c.synergy}</p></div><p class="hint">${Math.round(Game.crit(battle,u)*100)}% critical chance · ${Math.round(Game.critMultiplier(battle,u)*100)}% critical damage</p>${c.fav==='neighbor'?`<p class="hint">Neighbors: ${Game.neighbors(battle,u).map(v=>CARD[v.id].name).join(', ')||'none'}</p>`:''}`}
function blackoutHUDHTML(b){
 if(!b)return '';
 const hasUrban = b.units.some(u=>!u.removed&&Game.isUrbanLegend(u));
 const inCurfew = b.curfewUntil > b.time;
 const inLockout = !inCurfew && b.time < (b.blackoutLockoutUntil||0);
 const violations = b.urbanViolationsForBlackout || 0;
 if(!hasUrban && !inCurfew && !inLockout && violations === 0)return '';

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
 const needed = Math.max(1, 5 - violations);
 const pct = Math.min(100, Math.max(0, (violations / 5) * 100));
 const statusMsg = violations === 4
  ? '⚠️ Next taboo violation triggers 6s Blackout Frenzy!'
  : `Triggers Blackout in ${needed} more taboo violation${needed > 1 ? 's' : ''}`;
 return `<div class="blackout-banner state-ready"><div class="blackout-header"><span class="blackout-badge ready-badge">👁 TABOO VIOLATIONS</span><span class="blackout-counter">${violations} / 5</span></div><div class="blackout-meter"><i style="width:${pct}%"></i></div><div class="blackout-sub">${statusMsg}</div></div>`;
}
function bloodlineTrialHUDHTML(b){const t=b?.bloodlineTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Bloodline Mythic';if(t.status==='active')return `<div class="bloodline-trial-hud active"><div class="urban-trial-head"><b>♜ ANCESTRAL ASCENSION TRIAL</b><span>${CARD[t.relicId]?.name||'Ancestral Relic'} · ${t.nodeType.toUpperCase()}</span></div><p>Clear this Elite/Boss node with zero runner leaks to awaken ${name}. Any leak removes the Tier 3 Bloodline and its relic.</p></div>`;if(t.status==='passed')return `<div class="bloodline-trial-hud passed"><b>✦ ANCESTRAL TRIAL PASSED</b><span>${name} awakened · relic consumed</span></div>`;return `<div class="bloodline-trial-hud failed"><b>♜ ANCESTRAL TRIAL FAILED</b><span>${t.reason||'A runner leaked'} · Tier 3 Bloodline and relic removed</span></div>`}
function urbanLegendTrialHUDHTML(b){const t=b?.urbanLegendTrial;if(!t)return '';const dev=b.units.find(u=>u.uid===t.devourerUid);const name=dev?CARD[dev.id]?.name:'Urban Legend';if(t.status==='active')return `<div class="urban-legend-trial-hud active"><div class="urban-trial-head"><b>☒ FOLKLORE MERGER TRIAL · ${name}</b><span>80+ Violations · +${Number(t.inheritedAtk||0).toFixed(1)} inherited ATK</span></div><p>Same-lineage prey (45+ Violations) was consumed at trial start. Clear this Elite/Boss node with zero runner leaks to earn Mythic. Any leak removes the devourer from the roster.</p></div>`;if(t.status==='passed')return `<div class="urban-legend-trial-hud passed"><b>✦ ZERO-LEAK TRIAL PASSED</b><span>${CARD[t.apexId]?.name||'Mythic Urban Legend'} awakened · +${Number(t.inheritedAtk||0).toFixed(1)} ATK inherited</span></div>`;return `<div class="urban-legend-trial-hud failed"><b>☒ FOLKLORE TRIAL FAILED</b><span>${t.reason||'A runner leaked'} · devourer removed; prey was consumed</span></div>`}
function urbanContainmentHUDHTML(b){const t=b?.urbanContainmentTrial;if(!t)return '';const zero=b.enemies.find(e=>e.uid===t.subjectZeroUid);if(t.status==='active'&&t.subjectZeroContained)return `<div class="urban-trial-hud active"><div class="urban-trial-head"><b>☒ SUBJECT ZERO CONTAINED</b><span>Zero-leak clear required</span></div><p>The containment feat is complete. Clear this Elite/Boss node with no runner leaks to bind the Relic into ${CARD[t.apexId]?.name||'its Mythic form'}; any leak removes the Rule Enforcer and Relic.</p></div>`;if(t.status==='active'){const marks=zero?.ruleMarks||0,hp=zero?Math.max(0,Math.ceil(zero.hp)).toLocaleString():'—',max=zero?zero.maxHp.toLocaleString():'—';return `<div class="urban-trial-hud active"><div class="urban-trial-head"><b>☒ SUBJECT ZERO CONTAINMENT</b><span>${marks}/5 Violation Marks · ${hp}/${max} HP</span></div><p>Mark Subject Zero five times, then defeat it before it reaches the exit. Its escape or an under-marked kill permanently removes the Rule Enforcer and Relic. After containment, finish the Elite/Boss with zero leaks to earn Mythic.</p></div>`}if(t.status==='passed')return `<div class="urban-trial-hud passed"><b>✦ SUBJECT ZERO CONTAINED</b><span>${CARD[t.apexId]?.name||'Mythic Authority'} awakened · Relic consumed</span></div>`;return `<div class="urban-trial-hud failed"><b>☒ CONTAINMENT FAILED</b><span>${t.reason||'Trial failed'} · Rule Enforcer and Relic removed</span></div>`}
function cosmicTrialHUDHTML(b){const t=b?.cosmicTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Cosmic Mythic',proof=t.scripts.map(s=>`<span class="${t.scriptProof[s]?'proved':''}">${s.toUpperCase()} ${t.scriptProof[s]?'✓':'○'}</span>`).join(' · '),remaining=Math.max(0,t.recitationEndsAt-b.time);if(t.status==='active')return `<div class="cosmic-trial-hud active"><div class="urban-trial-head"><b>☄ FORBIDDEN RECITATION</b><span>${t.nodeType.toUpperCase()} · ${remaining.toFixed(1)}s ${t.recitationComplete?'complete':'remaining'}</span></div><p>Channel uninterrupted for 8 seconds. Prove each script on an Elite, Harbinger, or Boss, then clear with zero leaks to awaken ${name}. Failure removes the Herald and matching Grimoire.</p><p class="module-proof">${proof}</p></div>`;if(t.status==='passed')return `<div class="cosmic-trial-hud passed"><b>☄ FORBIDDEN RECITATION PASSED</b><span>${name} awakened · Grimoire consumed</span></div>`;return `<div class="cosmic-trial-hud failed"><b>☄ FORBIDDEN RECITATION FAILED</b><span>${t.reason||'Trial failed'} · Herald and Grimoire removed</span></div>`}
function xenoTrialHUDHTML(b){const t=b?.xenoTrial;if(!t)return '';const name=CARD[t.apexId]?.name||'Xeno-Leviathan',serum=CARD[t.serumId]?.name||'matching Serum';if(t.status==='active')return `<div class="xeno-trial-hud active"><div class="urban-trial-head"><b>⬡ XENO-LEVIATHAN TRIAL</b><span>${t.pair.split('+').join(' + ')} · ${t.nodeType.toUpperCase()}</span></div><p>Clear this Elite/Boss node with zero leaks to awaken ${name} and consume ${serum}. Any leak or failed clear removes the Xeno candidate and Serum.</p></div>`;if(t.status==='passed')return `<div class="xeno-trial-hud passed"><b>✦ XENO TRIAL PASSED</b><span>${name} awakened · ${serum} consumed</span></div>`;return `<div class="xeno-trial-hud failed"><b>⬡ XENO TRIAL FAILED</b><span>${t.reason||'Trial failed'} · Xeno candidate and ${serum} removed</span></div>`}
function combat(){return `${gamehead()}<div class="combat-layout"><section class="panel arena-panel"><div class="combat-toolbar"><div class="row">${btn('pause',paused?'▶ Resume':'Ⅱ Pause','small','id="pauseBtn"')}${[1,2,4].map(n=>btn('speed',n+'×',`small ${speed===n?'chosen':''}`,`data-id="${n}"`)).join('')}</div><div class="row">${btn('route','Map','small')}</div></div><div id="blackout-hud" class="blackout-hud">${blackoutHUDHTML(battle)}</div><div id="xeno-trial-hud">${xenoTrialHUDHTML(battle)}</div><div id="cosmic-trial-hud">${cosmicTrialHUDHTML(battle)}</div><div id="heavenly-trial-hud">${heavenlyTrialHUDHTML(battle)}</div><div id="arcane-trial-hud">${arcaneTrialHUDHTML(battle)}</div><div id="scrapwork-trial-hud">${scrapworkTrialHUDHTML(battle)}</div><div id="cyber-trial-hud">${cyberTrialHUDHTML(battle)}</div><div id="hunt-trial-hud">${huntTrialHUDHTML(battle)}</div><div id="bloodline-trial-hud">${bloodlineTrialHUDHTML(battle)}</div><div id="urban-trial-hud">${urbanContainmentHUDHTML(battle)}</div><div id="urban-legend-trial-hud">${urbanLegendTrialHUDHTML(battle)}</div>${board()}<div id="loss-strip">${lossNotice()}</div></section></div>`}
function end(){return `${gamehead()}<section class="stage center"><div class="eyebrow">${run.phase==='won'?'The road holds':'The crossing falls'}</div><h1>${run.phase==='won'?'Worlds, united.':'A thread remains.'}</h1><p class="muted" style="margin-top:20px">Your next deck will tell a different story.</p><div class="summary-grid"><div><b>${run.cleared}</b><small>Battles cleared</small></div><div><b>${run.stats.kills}</b><small>Runners defeated</small></div><div><b>+${Math.round(run.stats.growth)}</b><small>ATK grown in combat</small></div><div><b>${run.coins||0}</b><small>Coins remaining</small></div></div><div class="actions">${btn('home','Choose a new leader','primary')}</div></section>${battleReport(run.recap)}`}
function codex(){return `<section class="stage"><div class="eyebrow">${CARDS.length} draftable cards · ${FORMS.length} evolutions · Nine genres</div><h1>The fellowship.</h1><p class="muted" style="margin-top:15px">Mix attack loops, Burn, Bleed, tokens, sacrifice, critical hits, and control. Evolved forms are earned in combat or awakened at Fate Workshops, never drafted.</p><div class="filterbar">${btn('filter','All '+(CARDS.length+FORMS.length),filter==='all'?'active':'','data-id="all"')}${Object.entries(GENRES).map(([k,v])=>btn('filter',v[0],filter===k?'active':'',`data-id="${k}"`)).join('')}</div><div class="codex-grid">${[...CARDS,...FORMS].filter(c=>filter==='all'||c.genre===filter).map(c=>cardView(c.id)).join('')}</div></section>`}
function render(){document.body.classList.toggle('in-combat',screen==='game'&&run?.phase==='combat');document.body.classList.toggle('has-dock',screen!=='home');app.innerHTML=`<div class="shell">${header()}${screen==='home'?home():screen==='codex'?codex():!run?home():run.phase==='combat'?combat():run.phase==='draft'?draftView():['won','lost'].includes(run.phase)?end():mapScreen()}</div>${bottomDock()}`;if(battle&&screen==='game'&&run.phase==='combat')draw();}
function showDialog(html,live=false){if(battle&&!battle.done&&!live){paused=true;let p=$('#pauseBtn');if(p)p.textContent='▶ Resume'}if(modal.open)modal.close();modal.dataset.live=live?'true':'false';modal.innerHTML=btn('close','×','close','aria-label="Close dialog"')+(live&&battle&&!battle.done?'<p class="live-warning">● COMBAT CONTINUES · close this window to return to the battlefield</p>':'')+html;modal.showModal()}
modal.addEventListener('close',()=>{if(!modal.open){selected=null;modal.dataset.live='false'}});

function info(id,u=null){const c=CARD[id];showDialog(`<div class="unit-title">${art(c)}<div><div class="eyebrow">${GENRES[c.genre][0]}</div><h2>${getUnitTitles(c,u).name}</h2>${rarityBadge(id)}${cardTags(c)}<p>${getUnitTitles(c,u).vn}</p></div></div><div class="unit-stats"><div><b>${u?Math.round(Game.base(u)):c.baseAtk}</b><small>ATK</small></div><div><b>${c.attackInterval?(c.attackInterval/(1+(u?.permanentSpeed||0))).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u?.permanentAtkBonus||0}</b><small>PERMANENT</small></div></div><div class="eyebrow">Rules</div><p>${c.rules}</p>${evolutionHint(c,u)}${u?cosmicDetail(u)+cyberDetail(u)+ascensionBarHTML(u):''}${u?`<p class="hint">Workshop: ${u.upgradePath||"no awakening path"} · +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}${u.upgradePath==="storm"?" · Every sixth attack: three-target true-damage burst equal to unbuffed ATK.":""}</p>`:""}<div class="eyebrow">${c.ecosystem}</div><div class="spatial"><b>Works well with</b><p>${c.synergy}</p></div><p class="hint">Team Power is the total permanent ATK bonus on deployed originals, including the caster; reserves, consumed cards, and tokens are excluded. Unbuffed ATK excludes damage multipliers. All attacking cards have global reach. Ability charge affects elemental mages, Jade, Lantern, Eye, and Core; it never advances shutdown attack counts, maturity, or evolution witnesses. Consumed originals are permanently lost. Consumed tokens leave their parents safe. The predator defines the meal reward; token and original meals grant the same reward. Permanent ATK lasts for this run.</p>`,true)}
function help(){showDialog(`<div class="eyebrow">How to play</div><h2>Build the deck. Trust the draw.</h2><ol><li>Choose a genre-themed leader with a universal benefit and drawback, then choose <b>one of three starting attackers</b>. The leader’s genre gets 1.5× selection weight inside each rarity in every draft.</li><li>Inspect the entire branching map. Pick a connected gold destination.</li><li><b>Deploy & Start</b> fills nine slots with randomly drawn cards on the 3×3 grid; each Titan reserves two adjacent slots. Opening effects resolve and the battle begins immediately.</li><li>Enemies walk clockwise around the <b>16 outer tiles</b>. They cannot attack your cards. Runners completing the loop damage you and disappear.</li><li>All cards attack globally. Most synergies work across the deployed team. Predation, token spawns, Altar, Netrunner, and Shoggoth use the neighbor rules printed on their cards. There are no center, corner, edge, or alignment bonuses.</li><li>Cards grow, transform, and trigger automatically <b>during combat</b>. Coins are earned from battles and spent on draft rerolls. Fate Workshops offer optional upgrades and evolution paths.</li><li>After every successful stage, choose <b>one of three cards</b>, skip for no extra reward, or reroll all three for 10 coins per reroll. The first card is mandatory. Normal and Rare cards appear initially, Epic from crossing 5, and Legendary from crossing 10; Mythic Apex forms are earned, not drafted. Elite rewards improve high-rarity chances. A roster over nine cards makes each draw less predictable.</li></ol><p>Predators have named diets within their genre. A token’s ancestry determines its species and genre; being a token alone never makes it edible. Consumed originals—including eligible high-rarity Fodder—are permanently lost. Tokens do not delete their parents. Predators prioritize eligible adjacent tokens, then the weakest eligible original. Each predator defines its fixed meal reward, identical for tokens and originals. Empty slots stay empty unless an explicit summon fills them. Parents summon before opening consumption. Crimson Hound does not summon. Each breeding original or token checks every second: with at least one orthogonal same-species neighbor, roll one 10% birth chance into a free orthogonal slot. A birth is a temporary copy of its parent fodder species, not a separate offspring species. No offspring cap. Tokens snapshot unbuffed ATK and attack interval at birth, inherit species attack and breeding traits, and never inherit growth engines or evolve. Scrapwork Mechs permanently lock their first two forged weapons; both fire per attack at reduced individual power. There are no automatic reserve replacements. Phantoms do not join the deck. The final boss halves crowd control and enrages after 45 seconds, so control alone cannot hold it indefinitely. Permanent ATK and trigger-gauge progress last for the run; temporary buffs and attack-cycle counters reset between battles.</p><p>Card values are shown before leader modifiers. Permanent ATK growth and Burn/Bleed stack counts have no numerical limits. Team Power means the sum of permanent ATK bonuses on deployed original cards, including the caster; consumed cards, reserves, and tokens are excluded. Unbuffed ATK means base ATK plus permanent ATK and any Shoggoth mimic bonus. Ability damage can crit unless marked true damage or a detonation. True damage ignores armor. Other damage remains affected by armor, critical hits, leader damage, and Vulnerable as applicable. Base critical chance: 10%. Critical strikes deal 200% damage. Bleed stacks last 4 seconds. Vents freeze the two leading runners every 8 seconds. Every Burn and Bleed stack expires independently; effects are not permanent. Slows use the strongest active slow rather than adding together. Vulnerable uses the most recently applied value. Original cards can evolve during combat; their new form and accumulated growth persist for the run. Cauldron elixirs have an 8s cooldown and cannot trigger themselves. Growth has no battle cap. Summoning has no per-parent or battle count cap. Each ability retains its stated timing, and requires an empty slot. Normal/Rare cards build permanent power early; late-tier cards use that accumulated power. Herald feeding is a lore-based late growth exception, and evolved forms retain their growth engines. Duplicate passive support auras do not stack. Downtime cannot fall below 0.5 seconds.</p><p>Progress saves between decisions. Reloading during combat returns to the pre-deployment checkpoint. Card information opens in a centered modal while combat continues. Map, Deck, and Help menus pause combat; use Resume to continue.</p>`)}
function startLeader(id){run=Game.newRun(id);battle=null;selected=null;screen='game';paused=false;save();render();window.scrollTo(0,0)}
document.addEventListener('click',e=>{let el=e.target.closest('[data-action]');if(!el)return;let a=el.dataset.action,id=el.dataset.id;
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
    'juggernaut-hellfire': { text: '🔥 VANGUARD OIL HELLFIRE (1.2s)', color: '#fb923c', glow: '#ea580c', bg: '#431407' }
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

function drawSwordTorrentA(ctx, x, y, tx, ty, prog, size) {
  ctx.save();
  if (prog < 0.35) {
    const flashAlpha = (1 - prog / 0.35) * 0.22;
    ctx.fillStyle = 'rgba(16, 185, 129, ' + flashAlpha + ')';
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 16; i++) {
    const tp = Game.track(i);
    const pt = routePoint(tp.x, tp.y, size);

    for (let s = 0; s < 2; s++) {
      const delay = (i * 0.02) + (s * 0.14);
      const localProg = Math.min(1, Math.max(0, (prog - delay) * 2.4));
      if (localProg <= 0) continue;

      const startY = pt.y - 165;
      const startX = pt.x + 38;
      const fallT = Math.min(1, localProg * 1.35);
      const curX = startX + (pt.x - startX) * fallT;
      const curY = startY + (pt.y - startY) * fallT;
      const angle = Math.atan2(pt.y - startY, pt.x - startX);

      ctx.strokeStyle = s === 0 ? 'rgba(52, 211, 153, 0.65)' : 'rgba(110, 231, 183, 0.5)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(curX, curY);
      ctx.stroke();

      // Offset back along angle so the sword TIP lands cleanly on curX, curY
      const tipOffset = 34 * 0.72;
      const drawX = curX - Math.cos(angle) * tipOffset;
      const drawY = curY - Math.sin(angle) * tipOffset;
      const sAlpha = Math.min(1, (1 - localProg * 0.32));
      drawEmeraldSwordBlade(ctx, drawX, drawY, angle, 0.72, sAlpha, false);

      if (localProg >= 0.72) {
        const impT = (localProg - 0.72) / 0.28;
        const impRad = impT * 26;
        ctx.strokeStyle = `rgba(52, 211, 153, ${(1 - impT) * 0.9})`;
        ctx.lineWidth = 2 * (1 - impT);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, impRad, 0, Math.PI * 2);
        ctx.stroke();

        for (let k = 0; k < 4; k++) {
          const spAng = k * (Math.PI / 2) + i;
          const spDist = impT * 18;
          ctx.fillStyle = '#ecfdf5';
          ctx.fillRect(pt.x + Math.cos(spAng) * spDist - 1.5, pt.y + Math.sin(spAng) * spDist - 1.5, 3, 3);
        }
      }
    }
  }

  ctx.fillStyle = '#34d399';
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 10;
  ctx.fillText('TEN-THOUSAND SWORD TORRENT · CELESTIAL RAIN', size * 0.5, 26);
  ctx.restore();
}

function drawSwordTorrentB(ctx, x, y, tx, ty, prog, size) {
  ctx.save();
  const cx = x, cy = y;
  const maxRadius = size * 0.58;
  const curRadius = Math.min(maxRadius, (prog / 0.85) * maxRadius);

  const arms = 6;
  ctx.save();
  ctx.translate(cx, cy);
  const rot = prog * Math.PI * 6.5;
  ctx.rotate(rot);

  for (let i = 0; i < arms; i++) {
    const a = (i * Math.PI * 2) / arms;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(52, 211, 153, ' + ((1 - prog * 0.5) * 0.8) + ')' : 'rgba(16, 185, 129, ' + ((1 - prog * 0.5) * 0.5) + ')';
    ctx.lineWidth = 4 * (1 - prog * 0.4);
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let r = 10; r <= curRadius; r += 12) {
      const theta = a + r * 0.04;
      const px = Math.cos(theta) * r;
      const py = Math.sin(theta) * (r * 0.85);
      if (r === 10) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  const ringCount = 16;
  for (let i = 0; i < ringCount; i++) {
    const bladeAng = (i * Math.PI * 2) / ringCount + rot * 0.7;
    const bx = cx + Math.cos(bladeAng) * curRadius;
    const by = cy + Math.sin(bladeAng) * (curRadius * 0.82);
    const tangent = bladeAng + Math.PI * 0.5;
    drawEmeraldSwordBlade(ctx, bx, by, tangent, 0.78, Math.min(1, (1 - prog * 0.35)), false);
  }

  ctx.fillStyle = '#6ee7b7';
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 10;
  ctx.fillText('TEN-THOUSAND SWORD TORRENT · BLADE STORM', size * 0.5, 26);
  ctx.restore();
}

// === LOCKED-IN OPTION C: COLOSSAL HEAVEN-SPLITTING JADE JIAN + CELESTIAL SWORD RAIN ===
function drawSwordTorrentC(ctx, x, y, tx, ty, prog, size) {
  ctx.save();
  const bX = tx, bY = ty;

  // 1. Emerald Celestial Sky Flash on Impact
  if (prog > 0.35 && prog < 0.65) {
    const flashAlpha = (1 - Math.abs(prog - 0.45) / 0.20) * 0.24;
    if (flashAlpha > 0) {
      ctx.fillStyle = 'rgba(16, 185, 129, ' + flashAlpha + ')';
      ctx.fillRect(0, 0, size, size);
    }
  }

  // 2. CELESTIAL SWORD RAIN (Like Option A) Across All 16 Perimeter Tiles!
  for (let i = 0; i < 16; i++) {
    const tp = Game.track(i);
    const pt = routePoint(tp.x, tp.y, size);

    for (let s = 0; s < 2; s++) {
      const delay = (i * 0.018) + (s * 0.13);
      const localProg = Math.min(1, Math.max(0, (prog - delay) * 2.35));
      if (localProg <= 0) continue;

      const startY = pt.y - 165;
      const startX = pt.x + 36;
      const fallT = Math.min(1, localProg * 1.35);
      const curX = startX + (pt.x - startX) * fallT;
      const curY = startY + (pt.y - startY) * fallT;
      const angle = Math.atan2(pt.y - startY, pt.x - startX);

      // Jade Qi tail streak from the heavens
      ctx.strokeStyle = s === 0 ? 'rgba(52, 211, 153, 0.68)' : 'rgba(110, 231, 183, 0.52)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(curX, curY);
      ctx.stroke();

      // Draw authentic Jian sword with tip touching curX, curY
      const tipOffset = 34 * 0.72;
      const drawX = curX - Math.cos(angle) * tipOffset;
      const drawY = curY - Math.sin(angle) * tipOffset;
      const sAlpha = Math.min(1, (1 - localProg * 0.3));
      drawEmeraldSwordBlade(ctx, drawX, drawY, angle, 0.72, sAlpha, false);

      // Jade Lotus / Bagua Ripple on each tile upon impact
      if (localProg >= 0.72) {
        const impT = (localProg - 0.72) / 0.28;
        const impRad = impT * 26;
        ctx.strokeStyle = `rgba(52, 211, 153, ${(1 - impT) * 0.9})`;
        ctx.lineWidth = 2 * (1 - impT);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, impRad, 0, Math.PI * 2);
        ctx.stroke();

        for (let k = 0; k < 4; k++) {
          const spAng = k * (Math.PI / 2) + i;
          const spDist = impT * 18;
          ctx.fillStyle = '#ecfdf5';
          ctx.fillRect(pt.x + Math.cos(spAng) * spDist - 1.5, pt.y + Math.sin(spAng) * spDist - 1.5, 3, 3);
        }
      }
    }
  }

  // 3. COLOSSAL SOVEREIGN JADE JIAN (巨型翡翠仙劍) Crashing Vertically Onto Highest-HP Target!
  const dropProg = Math.min(1, prog / 0.42);
  const colossalScale = 1.15;
  const colossalBladeLen = 155 * colossalScale;

  // Vertical Heavenly Pillar Beam locking onto the target before & during impact
  const pillarAlpha = prog < 0.42 ? 0.55 : Math.max(0, (1 - (prog - 0.42) / 0.58) * 0.65);
  const pillarW = prog < 0.42 ? 22 : 36 * (1 - (prog - 0.42) / 0.58);
  const pillarGrad = ctx.createLinearGradient(bX - pillarW, 0, bX + pillarW, 0);
  pillarGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
  pillarGrad.addColorStop(0.5, `rgba(110, 231, 183, ${pillarAlpha})`);
  pillarGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = pillarGrad;
  ctx.fillRect(bX - pillarW, 0, pillarW * 2, bY + 12);

  // Calculate sword guard position so the colossal sword TIP embeds into (bX, bY) at dropProg = 1
  const tipStartY = -40;
  const curTipY = tipStartY + dropProg * (bY - tipStartY);
  const guardY = curTipY - colossalBladeLen * 0.92; // Tip slightly buried into ground at impact
  const colAlpha = prog > 0.78 ? Math.max(0, 1 - (prog - 0.78) / 0.22) : 1;

  // Render the Colossal Celestial Jade Jian pointing straight down (Math.PI * 0.5)
  drawEmeraldSwordBlade(ctx, bX, guardY, Math.PI * 0.5, colossalScale, colAlpha, true);

  // 4. Colossal Impact Crater, 8-Trigram Bagua Shockwave & -30% Current HP Strip Callout
  if (dropProg >= 1.0) {
    const impactT = Math.min(1, (prog - 0.42) / 0.58);

    // Isometric ground Bagua octagon seal under the pinned Colossal Sword
    ctx.save();
    ctx.translate(bX, bY);
    ctx.scale(1.0, 0.52);
    const baguaR = 25 + impactT * 75;
    ctx.strokeStyle = `rgba(254, 240, 138, ${(1 - impactT) * 0.95})`;
    ctx.lineWidth = 3 * (1 - impactT * 0.6);
    ctx.beginPath();
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI * 2 + impactT * 1.5;
      const px = Math.cos(a) * baguaR, py = Math.sin(a) * baguaR;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Expanding Jade Shockwave Rings
    for (let r = 0; r < 3; r++) {
      const ringT = Math.max(0, impactT - r * 0.12);
      if (ringT <= 0) continue;
      ctx.strokeStyle = r === 0 ? `rgba(236, 253, 245, ${(1 - ringT) * 0.95})` : `rgba(52, 211, 153, ${(1 - ringT) * 0.9})`;
      ctx.lineWidth = (4 - r) * (1 - ringT);
      ctx.beginPath();
      ctx.arc(bX, bY, ringT * 82, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Callout Banner for 30% Current HP Strip
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#047857';
    ctx.shadowBlur = 14;
    ctx.fillText('🗡 −30% CURRENT HP! · VẠN KIẾM QUY TÔNG', bX, bY - 45 - impactT * 24);
    ctx.restore();
  }

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 10;
  ctx.fillText('TEN-THOUSAND SWORD TORRENT · COLOSSAL JIAN & SWORD RAIN', size * 0.5, 26);
  ctx.restore();
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

  // Ecosystem grounds
  for (const oil of battle.oilPools || []) {
    const p = Game.track(oil.tile + 0.5), q = routePoint(p.x, p.y, size);
    ctx.fillStyle = '#d97524aa';
    ctx.beginPath();
    ctx.ellipse(q.x, q.y, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const pos = e => { let p = Game.track(e.p); return routePoint(p.x, p.y, size); };

  for (const z of battle.cyberZones || []) {
    for (let i = z.wall * 4; i < z.wall * 4 + 4; i++) {
      const p = Game.track(i + 0.5), q = routePoint(p.x, p.y, size);
      ctx.fillStyle = z.type === 'plasma' ? '#63d3f066' : '#e5724b66';
      ctx.beginPath();
      ctx.ellipse(q.x, q.y, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const z of battle.arcaneZones || []) {
    for (let i = z.wall * 4; i < z.wall * 4 + 4; i++) {
      const p = Game.track(i + 0.5), q = routePoint(p.x, p.y, size);
      ctx.fillStyle = z.type === 'magma' ? '#e8754055' : '#6c926455';
      ctx.beginPath();
      ctx.ellipse(q.x, q.y, 28, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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
      drawSwordTorrentChannel(ctx, pt.x, pt.y, chProg, size, u.channeling.type);
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
      drawSwordTorrentChannel(ctx, x, y, prog, size);
    } else if (f.type === 'sword-torrent-a' || kind === 'sword-torrent-a') {
      drawSwordTorrentA(ctx, x, y, tx, ty, prog, size);
    } else if (f.type === 'sword-torrent-b' || kind === 'sword-torrent-b') {
      drawSwordTorrentB(ctx, x, y, tx, ty, prog, size);
    } else if (f.type === 'sword-torrent-c' || kind === 'sword-torrent-c' || f.type === 'sword-torrent' || kind === 'sword-torrent') {
      drawSwordTorrentC(ctx, x, y, tx, ty, prog, size);
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

    if (f.text) {
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
function frame(ts){let dt=Math.min(.1,(ts-last)/1000||0);last=ts;if(battle&&!battle.done&&!paused&&screen==='game'&&(!modal.open||modal.dataset.live==='true')){let left=dt*speed;while(left>0&&!battle.done){let step=Math.min(1/30,left);Game.step(battle,step);left-=step}if(battle.done){if(modal.open)modal.close();selected=null;save();render();window.scrollTo(0,0)}}if(battle&&screen==='game'&&run.phase==='combat'){draw();uiClock+=dt;if(uiClock>.15){liveUI();uiClock=0}}requestAnimationFrame(frame)}
render();if(resetSavedRuns)toast('Your saved run and old account upgrades were cleared for the update.');requestAnimationFrame(frame);




