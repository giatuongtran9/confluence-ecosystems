import { cosmicDetail, cyberDetail } from './board.js';
import { CARD, GENRES, Game } from './lib.js';
import { ascensionBarHTML, showDialog } from './screens.js';
import { art } from './sprites.js';
import { rarityBadge } from './ui.js';

export function cardTags(c,isToken=false){return `<span class="card-tags">${isToken||c.token?'TOKEN · parent safe':c.tags?.includes('fodder')?'FODDER · original lost if eaten':''}${c.evolvedFrom?'EVOLUTION ONLY':''}</span>`}

function getUnitTitles(c, u = null) {
  if (u && Game.isPractitioner(u)) {
    const realm = u.realm || 0;
    const names = ['Qi-Refining Practitioner', 'Foundation Practitioner', 'Golden Core Daoist', 'Nascent Soul Sovereign'];
    const vnNames = ['Luyện Khí Tu Giả', 'Trúc Cơ Tu Giả', 'Kim Đan Chân Nhân', 'Nguyên Anh Lão Tổ'];
    return { name: names[realm], vn: vnNames[realm] };
  }
  return { name: c.name, vn: c.vn };
}

export function evolutionHint(c,u=null){
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
// Card face: rarity edge, genre, art, name, ⚔ ATK, ⏱ speed and a one-line summary. Full rules: hover tooltip, or ⓘ / tap for Details.
// Small inline icons: render the same everywhere (emoji such as the coin are missing from Windows fonts).
export const ICON={
  coin:'<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="#e9c46a"/><circle cx="8" cy="8" r="4" fill="none" stroke="#a5781a" stroke-width="1.3"/></svg>',
  deck:'<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.3" y="1.8" width="8.2" height="10.6" rx="1.6" fill="currentColor" opacity=".35"/><rect x="2.5" y="3.6" width="8.2" height="10.6" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  stage:'<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 14.5V2.5M3.5 3h8.5l-2.2 2.6L12 8.2H3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>'
};
export const attr=v=>String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
// Sentences are added until the summary says something (some rules open with a bare label like "The core.").
const ruleSummary=c=>{const parts=String(c.rules||'').replace(/\s+/g,' ').trim().match(/.+?(?:[.!?](?=s|$)|$)/g)||[''];let t='';for(const x of parts){t=(t+' '+x.trim()).trim();if(t.length>=40)break}return t.length>110?t.slice(0,107).trimEnd()+'…':t};
export function cardView(id,action='inspectCard',extra=''){const c=CARD[id],col=GENRES[c.genre][1],flag=c.token?'Token':c.tags?.includes('fodder')?'Fodder':c.evolvedFrom?'Evolution':'';return `<button class="draft-card rarity-${String(c.rarity||'Normal').toLowerCase()}" data-action="${action}" data-id="${id}" style="--realm:${col}" title="${attr(c.rules)}" ${extra}><span class="card-top"><span class="genre-dot"></span><span class="card-genre">${GENRES[c.genre][0]}</span>${flag?`<span class="card-flag">${flag}</span>`:''}<span class="card-rarity">${c.rarity||'Normal'}</span>${action!=='inspectCard'?`<span class="card-info" data-action="inspectCard" data-id="${id}" role="button" tabindex="0" aria-label="Details">i</span>`:''}</span><div class="card-art">${art(c)}</div><h3>${c.name}</h3><div class="card-numbers"><b title="Attack">⚔ ${c.baseAtk}</b><span title="Attack interval">${c.attackInterval?'⏱ '+c.attackInterval+'s':'Support'}</span></div><p class="card-summary">${ruleSummary(c)}</p>${evolutionHint(c)}</button>`}

export function info(id,u=null){const c=CARD[id];showDialog(`<div class="unit-title">${art(c)}<div><div class="eyebrow">${GENRES[c.genre][0]}</div><h2>${getUnitTitles(c,u).name}</h2>${rarityBadge(id)}${cardTags(c)}<p>${getUnitTitles(c,u).vn}</p></div></div><div class="unit-stats"><div><b>${u?Math.round(Game.base(u)):c.baseAtk}</b><small>ATK</small></div><div><b>${c.attackInterval?(c.attackInterval/(1+(u?.permanentSpeed||0))).toFixed(2)+'s':'—'}</b><small>INTERVAL</small></div><div><b>+${u?.permanentAtkBonus||0}</b><small>PERMANENT</small></div></div><div class="eyebrow">Rules</div><p>${c.rules}</p>${evolutionHint(c,u)}${u?cosmicDetail(u)+cyberDetail(u)+ascensionBarHTML(u):''}${u?`<p class="hint">Workshop: +${Math.round((u.permanentSpeed||0)*100)}% permanent speed · Resonance ${u.resonanceLevel||0}${u.resonanceLevel?" (every 6s: +"+u.resonanceLevel+" allied ability progress)":""}</p>`:""}<div class="eyebrow">${c.ecosystem}</div><div class="spatial"><b>Works well with</b><p>${c.synergy}</p></div><p class="hint">Team Power is the total permanent ATK bonus on deployed originals, including the caster; reserves, consumed cards, and tokens are excluded. Unbuffed ATK excludes damage multipliers. All attacking cards have global reach. Ability charge affects elemental mages, Jade, Lantern, Eye, and Core; it never advances shutdown attack counts, maturity, or evolution witnesses. Consumed originals are permanently lost. Consumed tokens leave their parents safe. The predator defines the meal reward; token and original meals grant the same reward. Permanent ATK lasts for this run.</p>`,true)}
