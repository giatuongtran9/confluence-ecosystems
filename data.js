'use strict';
const GENRES = {
  "Cultivation": ["Cultivation", "#a1d7a3"],
  "Haunted": ["Haunted realms", "#aab9ec"],
  "Bloodline": ["Bloodline fantasy", "#ed8e97"],
  "Arcane": ["Arcane magic", "#c2a0ed"],
  "PostApoc": ["Post-apocalypse", "#d9ae77"],
  "SciFi": ["Science fiction", "#85d8e9"],
  "Cyberpunk": ["Cyberpunk", "#e392e4"],
  "Grimdark": ["Dark fantasy", "#bfaaa0"],
  "Lovecraft": ["Cosmic horror", "#a8c990"]
};

const LEADERS = [
  {
    "id": "shen",
    "name": "Shen, the Unbroken",
    "genre": "Cultivation",
    "title": "Cultivation",
    "sprite": 0,
    "benefit": "Permanent ATK gains are 25% stronger.",
    "drawback": "All attack damage is 10% lower.",
    "passive": "Permanent ATK gains are 25% stronger. Drawback: All attack damage is 10% lower.",
    "mods": { "growth": 1.25, "damage": 0.9 }
  },
  {
    "id": "yara",
    "name": "Yara, the Veiled",
    "genre": "Haunted",
    "title": "Haunted realms",
    "sprite": 4,
    "benefit": "Temporary buffs last 40% longer.",
    "drawback": "All attack speeds are 10% slower.",
    "passive": "Temporary buffs last 40% longer. Drawback: All attack speeds are 10% slower.",
    "mods": { "buffDuration": 1.4, "speed": 0.9 }
  },
  {
    "id": "vesper",
    "name": "Vesper, First Rose",
    "genre": "Bloodline",
    "title": "Bloodline fantasy",
    "sprite": 8,
    "benefit": "Critical hit chance is increased by 20 percentage points.",
    "drawback": "Maximum health is reduced by 20.",
    "passive": "Critical hit chance is increased by 20 percentage points. Drawback: Maximum health is reduced by 20.",
    "mods": { "crit": 0.2, "health": -20 }
  },
  {
    "id": "lyra",
    "name": "Lyra, Starweaver",
    "genre": "Arcane",
    "title": "Arcane magic",
    "sprite": 12,
    "benefit": "Ability gauges charge 25% faster.",
    "drawback": "All basic attacks deal 15% less damage.",
    "passive": "Ability gauges charge 25% faster. Drawback: All basic attacks deal 15% less damage.",
    "mods": { "gauge": 1.25, "basicDamage": 0.85 }
  },
  {
    "id": "rook",
    "name": "Rook, Iron Scavenger",
    "genre": "PostApoc",
    "title": "Post-apocalypse",
    "sprite": 16,
    "benefit": "All attacks deal 25% more damage.",
    "drawback": "All attack speeds are 15% slower.",
    "passive": "All attacks deal 25% more damage. Drawback: All attack speeds are 15% slower.",
    "mods": { "damage": 1.25, "speed": 0.85 }
  },
  {
    "id": "orion",
    "name": "Orion, Deep Observer",
    "genre": "SciFi",
    "title": "Science fiction",
    "sprite": 20,
    "benefit": "Critical hits deal 30% more damage.",
    "drawback": "Base critical hit chance is reduced by 5 percentage points.",
    "passive": "Critical hits deal 30% more damage. Drawback: Base critical hit chance is reduced by 5 percentage points.",
    "mods": { "critDamage": 0.3, "crit": -0.05 }
  },
  {
    "id": "nyx",
    "name": "Nyx, Grid Phantom",
    "genre": "Cyberpunk",
    "title": "Cyberpunk",
    "sprite": 24,
    "benefit": "All cards attack 25% faster.",
    "drawback": "Basic hits deal 15% less damage.",
    "passive": "All cards attack 25% faster. Drawback: Basic hits deal 15% less damage.",
    "mods": { "speed": 1.25, "basicDamage": 0.85 }
  },
  {
    "id": "morrow",
    "name": "Morrow, Pale Judge",
    "genre": "Grimdark",
    "title": "Dark fantasy",
    "sprite": 28,
    "benefit": "Deal 30% more damage to Alpha Quarry, Elites, Harbingers and Bosses.",
    "drawback": "Deal 10% less damage to normal runners.",
    "passive": "Deal 30% more damage to Alpha Quarry, Elites, Harbingers and Bosses. Drawback: Deal 10% less damage to normal runners.",
    "mods": { "eliteDamage": 1.3, "normalDamage": 0.9 }
  },
  {
    "id": "naal",
    "name": "Naal, Void Prophet",
    "genre": "Lovecraft",
    "title": "Cosmic horror",
    "sprite": 32,
    "benefit": "All cards attack 10% faster.",
    "drawback": "Leaks deal 1 additional damage to the player.",
    "passive": "All cards attack 10% faster. Drawback: Leaks deal 1 additional damage to the player.",
    "mods": { "speed": 1.1, "leak": 1 }
  }
];

const RARITIES = [
  { "id": "Normal", "color": "#cbd5e1", "label": "Normal" },
  { "id": "Rare", "color": "#67e8f9", "label": "Rare" },
  { "id": "Epic", "color": "#c084fc", "label": "Epic" },
  { "id": "Legendary", "color": "#facc15", "label": "Legendary" },
  { "id": "Mythic", "color": "#f472d0", "label": "Mythic" }
];

// --- CURRENT DRAFTABLE CARDS (retired records remain in LEGACY_CARDS for old saves) ---
const CARDS = [
  // 1. Spirit Lotus Root
  {
  "id": "lotusRoot",
  "name": "Spirit Lotus Root",
  "vn": "Linh Liên Mẫu Căn",
  "genre": "Cultivation",
  "rarity": "Normal",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "lotus",
  "sprite": 2,
  "icon": "✿",
  "fav": "neighbor",
  "tags": [
    "plant",
    "producer",
    "fodder"
  ],
  "ecosystem": "Cultivation · Dan Dao",
  "rules": "Every 8s, blooms 1 Spirit Lotus Blossom token onto a free interior slot. Eaten or brewed blossoms leave this root intact to bloom again. Cannot be consumed by Cauldrons. Ascended recipients instead absorb +15 Qi per Blossom.",
  "synergy": "Qi-Refining Practitioner devours blossoms directly; Nine-Turn Alchemy Cauldron refines blossoms into Breakthrough Dan."
},
  // 2. Cloud-Mist Spirit Grass
  {
  "id": "herbGrass",
  "name": "Cloud-Mist Spirit Grass",
  "vn": "Vân Vụ Thảo",
  "genre": "Cultivation",
  "rarity": "Normal",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "herb",
  "sprite": 2,
  "icon": "✿",
  "fav": "team",
  "tags": [
    "plant",
    "qi",
    "fodder"
  ],
  "ecosystem": "Cultivation · Dan Dao",
  "rules": "Every 4s, grants +1 Qi to all deployed cultivators (+2 Qi to ascended Immortals). An adjacent Cauldron can brew this renewable grass into Qi Gathering Pills without consuming the grass.",
  "synergy": "Qi-Refining Practitioner and Nine-Turn Alchemy Cauldron."
},
  // 3. Nine-Turn Alchemy Cauldron
  {
  "id": "cauldron",
  "name": "Nine-Turn Alchemy Cauldron",
  "vn": "Cửu Chuyển Luyện Đan Lô",
  "genre": "Cultivation",
  "rarity": "Rare",
  "baseAtk": 8,
  "attackInterval": 2.0,
  "max": 0,
  "asset": "cauldron",
  "sprite": 0,
  "icon": "✧",
  "fav": "neighbor",
  "tags": [
    "alchemy",
    "refiner"
  ],
  "growthRole": "engine",
  "ecosystem": "Cultivation · Dan Dao",
  "rules": "First brew at 8s, then one recipe every 8s when ingredients and a recipient exist. An adjacent Blossom is consumed for +12 Qi and +4 permanent ATK; otherwise adjacent renewable Spirit Grass yields +6 Qi, +3 permanent ATK, and +15% speed for 8s. Pills prefer an unascended cultivator. Ascended recipients instead gain 35/18 Qi from the two recipes, with permanent ATK earned only through their 30-Qi cycle. The team elixir grants +1 permanent ATK after an eligible consumption/refinement, at most once per 8s.",
  "synergy": "Spirit Lotus Root, Cloud-Mist Spirit Grass, Qi-Refining Practitioner."
},
  // 4. Qi-Refining Practitioner
  {
  "id": "practitioner",
  "name": "Qi-Refining Practitioner",
  "vn": "Luyện Khí Tu Sĩ",
  "genre": "Cultivation",
  "rarity": "Normal",
  "baseAtk": 6,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "jade",
  "sprite": 0,
  "icon": "劍",
  "fav": "neighbor",
  "tags": [
    "attacker",
    "scaling"
  ],
  "ecosystem": "Cultivation · Ascension",
  "rules": "Gains +1 Qi every three attacks; partial progress survives battles. Devours adjacent Lotus Blossoms for +5 Qi and +2 permanent ATK. Advances permanently into earned card forms: Foundation Establishment (Rare) at 30 Qi (ATK 18, 1.2s, 2-tile pierce); Golden Core (Epic) at 85 Qi (ATK 40, 1.0s, 50% splash); Nascent Soul (Legendary) at 175 Qi (ATK 75, 0.75s, 3 highest-HP targets). If adjacent to an eligible Relic at Nascent Soul, permanently consumes it to evolve into an Apex Immortal!",
  "synergy": "Lotus Blossoms, Spirit Grass, Cauldron Pills, and Relics."
},
  // 5. Ancient Flying Sword
  {
    "id": "flyingSword",
    "name": "Ancient Flying Sword",
    "vn": "Phi Kiếm",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 24,
    "attackInterval": 1.0,
    "max": 0,
    "asset": "jade",
    "sprite": 0,
    "icon": "劍",
    "fav": "neighbor",
    "tags": ["relic", "pierce"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Piercing blade prioritizing the leading runner. When adjacent to a Nascent Soul Practitioner, is permanently consumed to awaken the Sword Immortal. If adjacent to an Apex Immortal, triggers Relic Resonance (+25% relic attack speed, +20% Apex damage).",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 6. Celestial Guqin
  {
    "id": "guqin",
    "name": "Celestial Guqin",
    "vn": "Thiên Cổ Cầm",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 14,
    "attackInterval": 2.0,
    "max": 0,
    "asset": "bell",
    "sprite": 0,
    "icon": "♫",
    "fav": "neighbor",
    "tags": ["relic", "control"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Strikes slow enemies in a 3-tile arc by 25%. When adjacent to a Nascent Soul Practitioner, is permanently consumed to awaken the Melodic Saint. If adjacent to an Apex Immortal, triggers Relic Resonance.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 7. Star-River Weiqi Board
  {
    "id": "weiqiBoard",
    "name": "Star-River Weiqi Board",
    "vn": "Kỳ Bàn",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 16,
    "attackInterval": 1.8,
    "max": 0,
    "asset": "altar",
    "sprite": 0,
    "icon": "▨",
    "fav": "neighbor",
    "tags": ["relic", "trap"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Lays Go stones along the track dealing 35 damage when stepped on. When adjacent to a Nascent Soul Practitioner, is permanently consumed to awaken the Formation Master. If adjacent to an Apex Immortal, triggers Relic Resonance.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 8. Dragon-Tail Ink Brush
  {
    "id": "inkBrush",
    "name": "Dragon-Tail Ink Brush",
    "vn": "Thần Bút",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 15,
    "attackInterval": 1.2,
    "max": 0,
    "asset": "totem",
    "sprite": 0,
    "icon": "✎",
    "fav": "neighbor",
    "tags": ["relic", "vulnerability"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Inks targets to take +15% damage from all cards. When adjacent to a Nascent Soul Practitioner, is permanently consumed to awaken the Talisman Sovereign. If adjacent to an Apex Immortal, triggers Relic Resonance.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 9. Mountain-River Scroll
  {
    "id": "mountainScroll",
    "name": "Mountain-River Scroll",
    "vn": "Sơn Hà Đồ",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 12,
    "attackInterval": 2.5,
    "max": 0,
    "asset": "lantern",
    "sprite": 0,
    "icon": "▧",
    "fav": "neighbor",
    "tags": ["relic", "banish"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Every 10s, banishes an enemy into the scroll for 2s. When adjacent to a Nascent Soul Practitioner, is permanently consumed to awaken the Landscape Sage. If adjacent to an Apex Immortal, triggers Relic Resonance.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 10. Ten-Thousand Soul Banner
  {
    "id": "soulBanner",
    "name": "Ten-Thousand Soul Banner",
    "vn": "Vạn Hồn Phiên",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "totem",
    "sprite": 0,
    "icon": "☠",
    "fav": "neighbor",
    "tags": ["relic", "demonic", "soul"],
    "ecosystem": "Cultivation · Demonic Relic",
    "rules": "Passively captures 1 soul per team kill anywhere on the track (up to 100/100). Every 5s, releases 3 homing ghost missiles dealing Souls × 1.5 damage. Only acts as an evolution relic once fully charged at 100/100 souls, awakening the Soul-Reaping Heavenly Demon. If adjacent to an Apex Immortal, triggers Relic Resonance.",
    "synergy": "Team kills, Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 11. Blood-Drinking Demon Blade
  {
    "id": "demonBlade",
    "name": "Blood-Drinking Demon Blade",
    "vn": "Huyết Ma Đao",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 28,
    "attackInterval": 1.5,
    "max": 0,
    "asset": "atlasCaster",
    "sprite": 0,
    "icon": "🗡",
    "fav": "neighbor",
    "tags": ["relic", "demonic", "bleed"],
    "ecosystem": "Cultivation · Demonic Relic",
    "rules": "Inflicts stacking Bleed on hit. Gains +1 permanent ATK per 10 kills (up to +30). When adjacent to a Nascent Soul Practitioner, is permanently consumed to awaken the Blood-Fiend Sword Master. If adjacent to an Apex Immortal, triggers Relic Resonance.",
    "synergy": "Bleed, Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 38 Other Genre Cards (Haunted, Bloodline, Arcane, PostApoc, SciFi, Cyberpunk, Grimdark, Lovecraft)
  // =========================================================================
  // QUÁI ĐÀM ĐÔ THỊ (HAUNTED REALMS)
  // Architecture A: The Containment Protocol (Surveillance, Forensics, Clearance)
  // Architecture B: Autonomous Urban Legends (Cascading Taboos, Resonance)
  // =========================================================================

  // --- ARCHITECTURE A: CONTAINMENT PROTOCOL CORE & PRODUCERS ---
  // 1. Night Investigator (Architecture A Core)
  {
    "id": "investigator",
    "name": "Night Investigator",
    "vn": "Điều Tra Viên Ban Đêm",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 8,
    "attackInterval": 1.3,
    "max": 0,
    "asset": "medium",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["attacker", "investigator", "urban-scaling"],
    "ecosystem": "Quái Đàm · Anomaly Log",
    "rules": "Attacks add 1 Violation Mark to surviving targets, up to 5 per runner. Each newly applied team mark grants +1 Dread . Advances at 25/70/140 Dread. Rule Enforcer binds an adjacent Cursed Containment Relic immediately, including during battle. After ascension, every 30 newly earned Dread grants +2 permanent ATK; old Dread is not reused.",
    "synergy": "Incident Dossiers, Forensic Coroner, and Cursed Containment Relics."
  },
  // 2. Security Monitor (Architecture A Producer)
  {
    "id": "securityCam",
    "name": "Security Monitor",
    "vn": "Camera Giám Sát",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 7,
    "attackInterval": 1.5,
    "max": 0,
    "asset": "sensor",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["sensor", "producer", "dossier"],
    "ecosystem": "Quái Đàm · Surveillance",
    "rules": "Rule: 'Always Under Watch.' Attacks runners. Whenever any runner commits a Rule Violation, has a 40% chance to drop an Incident Dossier token onto an empty orthogonal slot. Eaten or decoded dossiers clear the slot.",
    "synergy": "Forensic Coroner, Black-Box Cryptographer, and Night Investigator."
  },
  // 3. Emergency Broadcast (Architecture A Producer & Buffer)
  {
    "id": "radioPA",
    "name": "Emergency Broadcast",
    "vn": "Đài Phát Thanh Khẩn Cấp",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 9,
    "attackInterval": 1.6,
    "max": 0,
    "asset": "atlasMachineA",
    "icon": "✧",
    "fav": "team",
    "tags": ["control", "producer", "curfew"],
    "ecosystem": "Quái Đàm · Curfew Radio",
    "rules": "Rule: 'Curfew Announcement.' Every 6s, broadcasts an emergency warning that slows all violators by 25% for 3s. Every 8s, drops an Incident Dossier token onto a free interior slot.",
    "synergy": "Security Monitor, Forensic Coroner, and Night Investigator."
  },

  // --- ARCHITECTURE A: FORENSIC PROCESSORS ---
  // 4. Forensic Coroner (Architecture A Processor)
  {
    "id": "coroner",
    "name": "Forensic Coroner",
    "vn": "Bác Sĩ Pháp Y",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 12,
    "attackInterval": 1.5,
    "max": 0,
    "asset": "executioner",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["refiner", "forensics"],
    "ecosystem": "Quái Đàm · Forensics",
    "rules": "Every 5s, examines an adjacent Incident Dossier token. Grants the lowest-ATK adjacent original Haunted ally (or itself) +3 permanent ATK and delivers +10 Dread to the lowest-Dread Investigator, prioritizing Investigators over ascended Authorities. Authorities convert every 30 new Dread into +2 permanent ATK.",
    "synergy": "Security Monitor, Emergency Broadcast, and Night Investigator."
  },
  // 5. Black-Box Cryptographer (Architecture A Processor)
  {
    "id": "decoder",
    "name": "Black-Box Cryptographer",
    "vn": "Chuyên Viên Mật Mã",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 11,
    "attackInterval": 1.4,
    "max": 0,
    "asset": "atlasCyberNetrunner",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["refiner", "buffer"],
    "ecosystem": "Quái Đàm · Forensics",
    "rules": "Every 6s, decodes an adjacent Incident Dossier, granting all deployed Haunted allies +25% attack speed and +15% critical chance for 4s (modified by buff duration). Grants +8 Dread to the lowest-Dread Investigator, prioritizing Investigators over ascended Authorities. Authorities convert every 30 new Dread into +2 permanent ATK.",
    "synergy": "Security Monitor, Emergency Broadcast, and Night Investigator."
  },

  // --- ARCHITECTURE A: 5 CURSED CONTAINMENT RELICS ---
  // 6. Cursed Noticeboard (Relic 1 -> The Architect of Taboos)
  {
    "id": "ruleboard",
    "name": "Cursed Noticeboard",
    "vn": "Cáo Thị Cấm Kỵ",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "altar",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["relic", "urban-relic", "rules"],
    "ecosystem": "Quái Đàm · Containment Relic",
    "rules": "Enhances containment efficiency: Incident Dossiers grant +2 bonus Dread when examined or decoded. When orthogonally adjacent to a Rule Enforcer, awakens The Architect of Taboos!",
    "synergy": "Rule Enforcer (Legendary Investigator) and all Urban Legends."
  },
  // 7. Panopticon Monitor (Relic 2 -> The All-Seeing Overseer)
  {
    "id": "panopticon",
    "name": "Panopticon Monitor",
    "vn": "Màn Hình Giám Sát Toàn Cảnh",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 14,
    "attackInterval": 1.5,
    "max": 0,
    "asset": "sensor",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["relic", "urban-relic", "vision"],
    "ecosystem": "Quái Đàm · Containment Relic",
    "rules": "Scans all 16 tiles. Every 4s, inflicts 1 Violation Mark on the 3 fastest runners. When orthogonally adjacent to a Rule Enforcer, awakens The All-Seeing Overseer!",
    "synergy": "Rule Enforcer (Legendary Investigator) and fast runners."
  },
  // 8. Red Hotline (Relic 3 -> Director of Curfew)
  {
    "id": "redPhone",
    "name": "Red Hotline",
    "vn": "Điện Thoại Khẩn Cấp",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "bell",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["relic", "urban-relic", "curfew"],
    "ecosystem": "Quái Đàm · Containment Relic",
    "rules": "Establishes Emergency Hotline: On battle start, grants all Haunted allies +20% attack speed for 10s. When orthogonally adjacent to a Rule Enforcer, awakens the Director of Curfew!",
    "synergy": "Rule Enforcer (Legendary Investigator) and Blackout triggers."
  },
  // 9. Coroner's Bone Saw (Relic 4 -> Forensic Demiurge)
  {
    "id": "boneSaw",
    "name": "Coroner's Bone Saw",
    "vn": "Cưa Xương Pháp Y",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 26,
    "attackInterval": 1.2,
    "max": 0,
    "asset": "executioner",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["relic", "urban-relic", "bleed"],
    "ecosystem": "Quái Đàm · Containment Relic",
    "rules": "Inflicts stacking Bleed on hit (10 DPS for 4s). Deals 50% more damage to Elites and Harbingers. When orthogonally adjacent to a Rule Enforcer, awakens the Forensic Demiurge!",
    "synergy": "Rule Enforcer (Legendary Investigator) and Bleed synergies."
  },
  // 10. Liminal Keycard (Relic 5 -> Warden of the Backrooms)
  {
    "id": "elevatorKey",
    "name": "Liminal Keycard",
    "vn": "Thẻ Từ Tầng Âm",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 12,
    "attackInterval": 1.8,
    "max": 0,
    "asset": "totem",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["relic", "urban-relic", "warp"],
    "ecosystem": "Quái Đàm · Containment Relic",
    "rules": "Every 7s, warps the 2 leading marked runners backward 3 tiles. When orthogonally adjacent to a Rule Enforcer, awakens the Warden of the Backrooms!",
    "synergy": "Rule Enforcer (Legendary Investigator) and Spatial Control."
  },

  // --- ARCHITECTURE B: 5 AUTONOMOUS URBAN LEGENDS ---
  // 11. Slit-Mouthed Woman (Autonomous Legend 1)
  {
    "id": "kuchisake",
    "name": "Slit-Mouthed Woman",
    "vn": "Khẩu Liệt Nữ",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 18,
    "attackInterval": 1.1,
    "max": 0,
    "asset": "spirit",
    "icon": "✧",
    "fav": "team",
    "tags": ["attacker", "urban-lineage", "boss-slayer"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'Do Not Say Ugly / Do Not Flee.' Prioritizes the fastest runner; if target speed > 0.30, inflicts 1 Violation Mark. Attacks against marked targets apply Bleed (5 DPS for 4s). Self-ascends across battles into Blood-Scissors Banshee (Epic, 15) and Slit-Mouthed Sovereign (Mythic, 45)!",
    "synergy": "Fast runners, Bleed, and other Urban Legends."
  },
  // 12. Midnight Bus 44 (Autonomous Legend 2)
  {
    "id": "nightBus",
    "name": "Midnight Bus 44",
    "vn": "Chuyến Xe Đêm 44",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 16,
    "attackInterval": 1.4,
    "max": 0,
    "asset": "atlasMachineA",
    "icon": "✧",
    "fav": "team",
    "tags": ["control", "urban-lineage", "banish"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'The last bus only takes rule-breakers.' Reacts only to marked, panicked, fleeing, or unnaturally fast runners; it does not attack ordinary runners. Its attack pierces 2 violators and adds 1 Violation Mark to each survivor, up to 5. Every 8s, sweeps the leading runner's 4-tile edge and warps runners with 2+ marks backward 3 tiles. Successful sweep displacements can earn evolution progress under the reward cooldown. Evolves at 15/45 violations; adjacent Urban Legends share 15% of earned evolution progress.",
    "synergy": "Crowded tracks, Warps, and other Urban Legends."
  },
  // 13. The Midnight Caller (Autonomous Legend 3)
  {
    "id": "payphone",
    "name": "The Midnight Caller",
    "vn": "Bốt Điện Thoại Nửa Đêm",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 14,
    "attackInterval": 1.6,
    "max": 0,
    "asset": "bell",
    "icon": "♫",
    "fav": "team",
    "tags": ["control", "urban-lineage", "sonic"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'Answer on the 3rd Ring.' Reacts only to marked, panicked, or fleeing runners; it does not attack ordinary runners. Every 3rd triggered attack rings across all 16 tiles, dealing full damage and slowing violators by 30% for 2s. Rings immediately when Blackout begins. Self-ascends across battles into Haunted Switchboard (Epic, 15) and The Midnight Operator (Mythic, 45)!",
    "synergy": "16 perimeter tiles, Blackout triggers, and other Urban Legends."
  },
  // 14. Morgue Mirror (Autonomous Legend 4)
  {
    "id": "morgueMirror",
    "name": "Morgue Mirror",
    "vn": "Gương Nhà Xác",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 15,
    "attackInterval": 1.3,
    "max": 0,
    "asset": "lantern",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["support", "urban-lineage", "mirror"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'Never Stare into the Reflection.' Reacts to marked, panicked, frozen, or retreating runners and those approaching its reflective angle; it ignores ordinary runners. Reflects 25% of adjacent allies' ATK onto the violating runner. When Blackout triggers, summons 1 temporary Mirror Reflection token. Self-ascends across battles into Doppelgänger Glass (Epic, 15) and Queen in the Morgue Mirror (Mythic, 45)!",
    "synergy": "High-ATK neighbors, Blackouts, and other Urban Legends."
  },
  // 15. Window Mannequin (Autonomous Legend 5)
  {
    "id": "mannequin",
    "name": "Window Mannequin",
    "vn": "Ma-Nơ-Canh Cửa Hiệu",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 10,
    "attackInterval": 1.5,
    "max": 0,
    "asset": "monk",
    "icon": "✧",
    "fav": "team",
    "tags": ["attacker", "urban-lineage"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'It Only Moves When Unseen.' Reacts when a runner breaks taboo by running fast, panicking, fleeing, or carrying a mark, or when an ally is inactive; it ignores ordinary runners. During Blackout (or while any ally is inactive), gains +150% attack speed and +100% critical damage. Qualifying punishments earn progress under the reward cooldown. Self-ascends across battles into Shadow Stalker (Epic, 15) and The Living Taboo (Mythic, 45)!",
    "synergy": "Blackouts, Night Investigator, and other Urban Legends."
  },

  // --- FOLKLORE CONTAGION & UTILITY ---
  // 16. Cursed Chain Letter
  {
  "id": "chainLetter",
  "name": "Cursed Chain Letter",
  "vn": "Thư Nặc Danh",
  "genre": "Haunted",
  "rarity": "Normal",
  "baseAtk": 9,
  "attackInterval": 1.2,
  "max": 0,
  "asset": "medium",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "attacker",
    "contagion"
  ],
  "ecosystem": "Quái Đàm · Folklore Contagion",
  "rules": "Attacks infect runners with Folklore Rumors. Each infected runner can spread once by contact to an uninfected runner within 0.45 track tiles. On death it can infect another within 1.5 tiles. A contact spread or infected death grants all deployed original Urban Legends +1 evolution progress; newly infected recipients take 20 true damage. Ordinary attacks grant no evolution progress. Each real contact spread and infected death grants 0.1 evolution progress to deployed Urban Legends; ordinary attacks grant none.",
  "synergy": "All 5 Autonomous Urban Legends."
},
  // 17. Red Raincoat Specter
  {
    "id": "redRaincoat",
    "name": "Red Raincoat Specter",
    "vn": "Áo Mưa Đỏ",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 11,
    "attackInterval": 1.2,
    "max": 0,
    "asset": "spirit",
    "icon": "✧",
    "fav": "team",
    "tags": ["attacker", "urban-lineage", "retribution"],
    "ecosystem": "Quái Đàm · Do Not Look Back",
    "rules": "Rule: 'Do Not Look Back.' Reactive trap · does not attack normally. Slashes runners who turn back, retreat, or get warped/slowed, dealing 18 true damage, applying bleed, and leaving a blood pool. In Blackout, triggers against turning or crowding runners, dealing double shadow damage. Self-ascends across battles into Blood-Drenched Phantasm (Epic, 15) and Harbinger of the Crimson Rain (Mythic, 45)!",
    "synergy": "Control cards, Midnight Bus 44, The Midnight Caller, and Void Eye."
  },
  // 18. The 13th Step
  {
    "id": "stair13",
    "name": "The 13th Step",
    "vn": "Bậc Thang Thứ 13",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 12,
    "attackInterval": 1.6,
    "max": 0,
    "asset": "totem",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["trap", "urban-lineage", "vertigo"],
    "ecosystem": "Quái Đàm · Infinite Staircase",
    "rules": "Rule: 'Never Count the Steps.' Reactive trap · does not attack normally. Lays curse marks on corners and triggers every 13th step, dealing 35 damage, causing stumble, and warping repeat violators. During Blackout, triggers every 4th step, banishing victims into the Penrose Trapdoor. Self-ascends across battles into Infinite Spiral Staircase (Epic, 15) and The Penrose Labyrinth (Mythic, 45)!",
    "synergy": "Night Investigator, Slit-Mouthed Woman, and corner track tiles."
  },

  {
    "id": "hound",
    "name": "Crimson Hound",
    "vn": "Xích Huyết Khuyển",
    "genre": "Bloodline",
    "baseAtk": 16,
    "attackInterval": 1.3,
    "sprite": 10,
    "icon": "爪",
    "fav": "center",
    "ecosystem": "Execution · Bloodline fodder",
    "rarity": "Normal",
    "tags": ["predator", "fodder"],
    "rules": "Prioritize runners below 30% health and deal double damage to them. Same-species Hound neighbors breed temporary Crimson Hound copies at the shared 10% per-second chance into an empty orthogonal slot. Eligible prey for the Primordial Blood Cub; consumed Hounds can also trigger the Broodkeeper.",
    "synergy": "Primordial Blood Cub, Crimson Broodkeeper, and other Crimson Hounds."
  },
  
  
  
  {
  "id": "smelter",
  "name": "Junkyard Smelter",
  "genre": "PostApoc",
  "rarity": "Rare",
  "baseAtk": 10,
  "attackInterval": 1.8,
  "max": 0,
  "icon": "⚙",
  "fav": "neighbor",
  "tags": [
    "mechanical"
  ],
  "ecosystem": "Scrapwork · salvage and forging",
  "rules": "Shortens ally shutdown by 1s (minimum 0.5s). Accepts adjacent scrap one piece at a time into a two-piece intake. Stored pieces persist between battles. With a deployed Mech, two stored pieces forge a module whenever the 4s forge cooldown is ready. A single adjacent working slot is enough; a full board still blocks new scrap. Sword+Sword: Colossal Scrap Blade (highest HP, 50% permanent armor removal, triple damage below 35% HP). Gun+Gun: Twin Flak Battery (six-tile arc, 25% permanent armor removal). Mixed: Vanguard Gunblade (alternating armor-piercing round and four-tile oil sweep). Installs on the nearest Mech with an empty weapon slot. Every smelt awards +3 Alloy to all deployed Mechs; surplus modules recycle into Alloy only.",
  "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
  "scrapworkAsset": "smelter"
},
  {
    "id": "sensor",
    "name": "Telemetry Sensor",
    "vn": "Viễn Trắc Cảm Ứng Khí",
    "genre": "SciFi",
    "baseAtk": 0,
    "attackInterval": 0,
    "sprite": 20,
    "icon": "◎",
    "fav": "team",
    "ecosystem": "Critical strikes · precision",
    "rarity": "Normal",
    "tags": [],
    "rules": "Grant all other deployed allies +10 percentage points of critical hit chance, and amplify their critical hit damage from 200% to 230%. When an ally strikes critically, illuminate the target runner. Multiple Sensors do not stack.",
    "synergy": "Vector Railgun, Focused Nanites, and Asura Monk."
  },
  {
    "id": "railgun",
    "name": "Vector Railgun",
    "vn": "Định Hướng Điện Từ Pháo",
    "genre": "SciFi",
    "baseAtk": 35,
    "attackInterval": 2.8,
    "sprite": 22,
    "icon": "→",
    "fav": "team",
    "ecosystem": "Volleys · piercing",
    "rarity": "Epic",
    "tags": ["pierce"],
    "rules": "Pierce 3 runners in a line for full damage, ignoring armor. Gain bonus attack damage equal to 200% of the single highest permanent ATK bonus among other allies. If Telemetry Sensor is deployed, hit 5 runners and knock each back 1 tile.",
    "synergy": "Telemetry Sensor, high-growth carry cards."
  },
  
  {
    "id": "vent",
    "name": "Cooling Vent",
    "cyberAsset": "vent",
    "vn": "Tản Nhiệt Khẩu",
    "genre": "Cyberpunk",
    "baseAtk": 0,
    "attackInterval": 0,
    "sprite": 26,
    "icon": "❄",
    "fav": "team",
    "ecosystem": "Cooling · crowd control",
    "rarity": "Normal",
    "tags": ["control"],
    "rules": "Every 8s, freeze the 2 leading runners for 1s (2s if they are burning). Halve the shutdown duration of allies in Burnout or Overheat (minimum 0.5s). Multiple Vents do not stack.",
    "synergy": "Junkyard Smelter, Cyber-Operative, and Hydraulic Riveter."
  },
  {
    "id": "totem",
    "name": "Iron Maiden Totem",
    "vn": "Thiết Xử Đồ Đằng",
    "genre": "Grimdark",
    "baseAtk": 0,
    "attackInterval": 0,
    "sprite": 28,
    "icon": "†",
    "fav": "team",
    "ecosystem": "Bleed · execution",
    "rarity": "Normal",
    "tags": [],
    "rules": "All ally attacks gain 25% armor penetration and inflict Bleed: 2 DPS for 4s, with no stack limit. Bleed stacks are independent and expire separately. Multiple Totems do not stack.",
    "synergy": "Crimson Hound, Executioner, and Blood-Drunk Abyssal Hunter."
  },
  {
    "id": "executioner",
    "name": "Gallows Executioner",
    "vn": "Đoái Đầu Phủ Thủ",
    "genre": "Grimdark",
    "baseAtk": 26,
    "attackInterval": 2.2,
    "sprite": 30,
    "icon": "斧",
    "fav": "team",
    "ecosystem": "Execution · finisher",
    "rarity": "Epic",
    "tags": ["finisher"],
    "rules": "Prioritize Elites, Harbingers, and Bosses. Deal 2× damage to runners affected by shred, nanites, Burn, or Bleed; deal 4× damage to runners below 35% health (25% for non-elites). Cleave a second runner for 50% damage.",
    "synergy": "Iron Maiden Totem, Hydraulic Riveter, and Focused Nanites."
  },
  {
    "id": "eye",
    "name": "Void Eye",
    "vn": "Hư Không Chi Nhãn",
    "genre": "Lovecraft",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 12,
    "sprite": 32,
    "icon": "◉",
    "fav": "team",
    "ecosystem": "Displacement · vulnerability",
    "rarity": "Epic",
    "tags": ["control"],
    "rules": "Gains 1 ability tick whenever a crowd control effect or status ailment is applied to any runner. At 12, inflict Vulnerable (+15% damage taken for 4s) and Warp the 2 leading runners backward 4 tiles, dealing 150 + 0.75× Team Power as spell damage.",
    "synergy": "Status inflicters, slows, and crowd-control engines."
  },
  {
    "id": "mass",
    "name": "Shoggoth Mass",
    "vn": "Tu Cẩu Tư Cốt Nhục",
    "genre": "Lovecraft",
    "baseAtk": 15,
    "attackInterval": 1.4,
    "sprite": 34,
    "icon": "☣",
    "fav": "neighbor",
    "ecosystem": "Mimicry · cosmic predation",
    "rarity": "Rare",
    "tags": ["predator", "fodder"],
    "rules": "At combat start, permanently copy the highest base ATK among orthogonally adjacent allies for this battle. Attacks slow runners by 20% for 2s.",
    "synergy": "High base-attack allies and Azathoth Herald."
  },
{
    "id": "altar",
    "name": "Blood Altar",
    "vn": "Huyết Tế Đàn",
    "genre": "Bloodline",
    "rarity": "Rare",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "altar",
    "tags": [],
    "fav": "neighbor",
    "icon": "✧",
    "growthRole": "engine",
    "ecosystem": "Sacrifice · neighborhood growth",
    "rules": "Whenever an ally is consumed or an enemy dies while bleeding, grant all orthogonally adjacent original allies +1 permanent ATK.",
    "synergy": "Primordial Blood Cub and all five Bloodline fodders."
  },
  
  
  
  
  {
    "id": "nanite",
    "name": "Focused Nanites",
    "vn": "Định Hướng Vi Trùng",
    "genre": "SciFi",
    "rarity": "Rare",
    "baseAtk": 12,
    "attackInterval": 0.8,
    "max": 0,
    "asset": "nanite",
    "tags": [],
    "fav": "team",
    "icon": "✧",
    "growthRole": "engine",
    "ecosystem": "Critical strikes · defense shred",
    "rules": "Strike the leading runner. Critical hits shred runner defense by 25% for 3s. Every 6 critical hits across battles grant this card +1 permanent ATK.",
    "synergy": "Telemetry Sensor, Singularity Core, and Asura Monk."
  },
  {
    "id": "core",
    "name": "Singularity Core",
    "vn": "Kỳ Điểm Hạch Tâm",
    "genre": "SciFi",
    "rarity": "Legendary",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 8,
    "asset": "core",
    "tags": ["finisher"],
    "fav": "team",
    "icon": "✧",
    "ecosystem": "Critical strikes · gravitational collapse",
    "rules": "Grant all other allies +15 percentage points of critical hit chance. Gain 1 tick whenever an ally lands a critical hit. At 8 ticks, trigger Gravitational Collapse: deal 240 + 2× Team Power as true damage and Warp all runners backward 2.5 tiles.",
    "synergy": "Telemetry Sensor, Focused Nanites, and high-crit allies."
  },
  
  
  {
    "id": "leech",
    "name": "Grave Leech",
    "vn": "Phần Địa Thủy Đỉa",
    "genre": "Grimdark",
    "rarity": "Normal",
    "baseAtk": 13,
    "attackInterval": 1.1,
    "max": 0,
    "asset": "leech",
    "tags": [],
    "fav": "team",
    "icon": "✧",
    "ecosystem": "Bleed · burn exploitation",
    "rules": "Strike the leading runner. Deal 2.5× damage to runners suffering from Bleed or Burn.",
    "synergy": "Iron Maiden Totem, Furnace Bellows, and Blood Altar."
  },
  
  {
    "id": "larva",
    "name": "Mind Larva",
    "vn": "Tâm Trí Ấu Trùng",
    "genre": "Lovecraft",
    "rarity": "Normal",
    "baseAtk": 11,
    "attackInterval": 1.0,
    "max": 0,
    "asset": "larva",
    "tags": ["fodder"],
    "fav": "neighbor",
    "icon": "✧",
    "ecosystem": "Cosmic predation · psionic burst",
    "rules": "Strike the leading runner and slow them by 20% for 3s. Every 5th attack deals double damage. Eligible cosmic prey for Azathoth Herald.",
    "synergy": "Shoggoth Mass, Void Eye, and Azathoth Herald."
  },
  {
    "id": "herald",
    "name": "Azathoth Herald",
    "vn": "A Tát Thác Tư Sứ Giả",
    "genre": "Lovecraft",
    "rarity": "Legendary",
    "baseAtk": 25,
    "attackInterval": 2.5,
    "max": 0,
    "asset": "herald",
    "tags": ["finisher"],
    "fav": "neighbor",
    "icon": "✧",
    "ecosystem": "Cosmic predation · madness",
    "rules": "Every 12s, consume an adjacent Shoggoth Mass or Mind Larva, gaining +100 stored Madness damage. Every 8s, release stored Madness as true damage to all runners and Warp late runners backward 5 tiles.",
    "synergy": "Shoggoth Mass, Mind Larva, and Void Eye."
  },
{
    "id": "broodkeeper",
    "name": "Crimson Broodkeeper",
    "vn": "Xích Huyết Dục Trùng Giả",
    "genre": "Bloodline",
    "rarity": "Rare",
    "baseAtk": 14,
    "attackInterval": 1.4,
    "max": 0,
    "asset": "atlasCreature",
    "tags": [],
    "fav": "team",
    "icon": "✧",
    "ecosystem": "Predation · recycling",
    "rules": "Whenever any of the five Bloodline fodders is consumed anywhere on the field, roll a 35% chance to spawn a temporary token copy of that same fodder species into any empty slot. Original and token meals can trigger it; the original remains lost.",
    "synergy": "Primordial Blood Cub and all five Bloodline fodders."
  },
  {
    "id": "matriarch",
    "name": "Brood Matriarch",
    "vn": "Trùng Quần Mẫu Thể",
    "genre": "Bloodline",
    "rarity": "Epic",
    "baseAtk": 22,
    "attackInterval": 1.8,
    "max": 0,
    "asset": "atlasCaster",
    "tags": [],
    "fav": "team",
    "icon": "✧",
    "ecosystem": "Predation · swarm haste",
    "rules": "Grants all five Bloodline fodder species and their tokens +40% attack speed: Horned Serpent, Crimson Hound, Iron-Shelled Scuttler, Flame Toad, and Spirit Peach. Bloodline Bleed duration increases by 0.5s per deployed Bloodline fodder original or token. Duplicate Matriarch auras do not stack.",
    "synergy": "Primordial Blood Cub, all five Bloodline fodders, and Bleed support."
  },
{
  "id": "cub",
  "name": "Primordial Blood Cub",
  "vn": "Thái Cổ Ấu Thú",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 9,
  "attackInterval": 1.2,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "neighbor",
  "tags": [
    "attacker",
    "predator"
  ],
  "ecosystem": "Bloodline · first-meal destiny",
  "rules": "Attacks runners and devours orthogonally adjacent Bloodline prey at combat opening and every 6 seconds. Its first meal permanently locks one lineage. Every meal grants permanent ATK: +4 for matching prey, +3 for off-lineage prey. Matching meals alone add evolution stacks; it evolves at 2, 4, and 6 matching stacks. Bloodline fodder breeds temporary copies of its own species at a 10% per-second same-species adjacency chance into an empty orthogonal slot.",
  "synergy": "Five Bloodline prey, their attacking offspring, and matching ancestral relics."
},
{
  "id": "serpentFodder",
  "name": "Horned Serpent",
  "vn": "Giao Xà",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.2,
  "max": 0,
  "asset": "atlasCreature",
  "icon": "🐉",
  "fav": "neighbor",
  "tags": [
    "fodder",
    "attacker"
  ],
  "ecosystem": "Bloodline · Azure Dragon prey",
  "rules": "Attacks enemies. Its first meal can imprint the Azure Dragon lineage. Same-species neighbors roll once per second for a 10% chance to spawn a temporary Horned Serpent copy into an empty orthogonal slot.",
  "synergy": "Primordial Blood Cub and other Horned Serpents."
},
{
  "id": "scuttler",
  "name": "Iron-Shelled Scuttler",
  "vn": "Thiết Giáp Miêu",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 14,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "atlasMachineC",
  "icon": "🐢",
  "fav": "neighbor",
  "tags": [
    "fodder",
    "attacker"
  ],
  "ecosystem": "Bloodline · Xuanwu prey",
  "rules": "Attacks enemies and slows targets by 15% for 2 seconds. Its first meal can imprint the Black Tortoise & Serpent lineage. Same-species neighbors can breed a temporary Iron-Shelled Scuttler copy using the shared 10%-per-second rule.",
  "synergy": "Primordial Blood Cub and other Iron-Shelled Scuttlers."
},
{
  "id": "flameToad",
  "name": "Flame Toad",
  "vn": "Hỏa Diệm Thiềm Thừ",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 11,
  "attackInterval": 1.1,
  "max": 0,
  "asset": "atlasMachineB",
  "icon": "🐸",
  "fav": "neighbor",
  "tags": [
    "fodder",
    "attacker"
  ],
  "ecosystem": "Bloodline · Vermilion Phoenix prey",
  "rules": "Attacks enemies and applies Burn: 3 DPS for 3 seconds. Its first meal can imprint the Vermilion Phoenix lineage. Same-species neighbors can breed a temporary Flame Toad copy using the shared 10%-per-second rule.",
  "synergy": "Primordial Blood Cub and other Flame Toads."
},
{
  "id": "peachFodder",
  "name": "Spirit Peach Fodder",
  "vn": "Linh Đào",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 10,
  "attackInterval": 0.9,
  "max": 0,
  "asset": "lotus",
  "icon": "🍑",
  "fav": "neighbor",
  "tags": [
    "fodder",
    "attacker"
  ],
  "ecosystem": "Bloodline · Divine Monkey prey",
  "rules": "Attacks enemies with swift strikes. Its first meal can imprint the Divine Monkey lineage. Same-species neighbors can breed a temporary Spirit Peach Fodder copy using the shared 10%-per-second rule.",
  "synergy": "Primordial Blood Cub and other Spirit Peach Fodder."
},
{
  "id": "dragonPearl",
  "name": "Dragon Pearl",
  "vn": "Dragon Pearl",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "totem",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "relic",
    "bloodline-relic"
  ],
  "ecosystem": "Bloodline · ancestral relic",
  "rules": "When adjacent to the matching Tier 3 Cub, consume this relic to unlock the Azure Dragon Apex form.",
  "synergy": "Primordial Blood Cub and matching lineage."
},
{
  "id": "tigerSeal",
  "name": "Slaughter Tiger Seal",
  "vn": "Slaughter Tiger Seal",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "totem",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "relic",
    "bloodline-relic"
  ],
  "ecosystem": "Bloodline · ancestral relic",
  "rules": "When adjacent to the matching Tier 3 Cub, consume this relic to unlock the White Tiger Apex form.",
  "synergy": "Primordial Blood Cub and matching lineage."
},
{
  "id": "earthTablet",
  "name": "Heavy Earth Tablet",
  "vn": "Heavy Earth Tablet",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "totem",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "relic",
    "bloodline-relic"
  ],
  "ecosystem": "Bloodline · ancestral relic",
  "rules": "When adjacent to the matching Tier 3 Cub, consume this relic to unlock the Black Tortoise & Serpent Apex form.",
  "synergy": "Primordial Blood Cub and matching lineage."
},
{
  "id": "phoenixTree",
  "name": "Phoenix Flame Tree",
  "vn": "Phoenix Flame Tree",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "totem",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "relic",
    "bloodline-relic"
  ],
  "ecosystem": "Bloodline · ancestral relic",
  "rules": "When adjacent to the matching Tier 3 Cub, consume this relic to unlock the Vermilion Phoenix Apex form.",
  "synergy": "Primordial Blood Cub and matching lineage."
},
{
  "id": "goldenStaff",
  "name": "Golden-Hooped Staff",
  "vn": "Golden-Hooped Staff",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "totem",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "relic",
    "bloodline-relic"
  ],
  "ecosystem": "Bloodline · ancestral relic",
  "rules": "When adjacent to the matching Tier 3 Cub, consume this relic to unlock the Divine Monkey Apex form.",
  "synergy": "Primordial Blood Cub and matching lineage."
}
];

// --- FORMS (7 APEX FORMS + 7 EARNED FORMS) ---
const FORMS = [
  // =========================================================================
  // QUÁI ĐÀM ĐÔ THỊ FORMS (HAUNTED REALMS)
  // Architecture A: Night Investigator Clearance Ranks + 5 Mythic Apexes
  // Architecture B: 5 Autonomous Urban Legends Lineages (Epic -> Mythic)
  // =========================================================================

  // --- ARCHITECTURE A: INVESTIGATOR CLEARANCE RANKS ---
  {
    "id": "occultDetective",
    "name": "Occult Detective",
    "vn": "Thần Thám Huyền Bí",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 24,
    "attackInterval": 1.1,
    "max": 0,
    "asset": "medium",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["investigator", "urban-realm", "pierce"],
    "evolvedFrom": "investigator",
    "draftable": false,
    "rules": "Occult rank · 25 Dread. Attacks pierce the 2 leading runners and inflict 1 Violation Mark on hit. Records +1 Dread per violation . Advances to Anomaly Specialist at 70 Dread.",
    "synergy": "All Urban Legends and Rule Violations."
  },
  {
    "id": "anomalySpecialist",
    "name": "Anomaly Specialist",
    "vn": "Chuyên Viên Dị Tượng",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 50,
    "attackInterval": 0.85,
    "max": 0,
    "asset": "medium",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["investigator", "urban-realm", "aoe"],
    "evolvedFrom": "investigator",
    "draftable": false,
    "rules": "Anomaly rank · 70 Dread. Attacks release an anomaly shockwave hitting 3 violators for double damage. Records +1 Dread per violation . Advances to Rule Enforcer at 140 Dread.",
    "synergy": "All Urban Legends and Rule Violations."
  },
  {
    "id": "ruleEnforcer",
    "name": "Rule Enforcer",
    "vn": "Chấp Pháp Quy Tắc",
    "genre": "Haunted",
    "rarity": "Legendary",
    "baseAtk": 90,
    "attackInterval": 0.65,
    "max": 0,
    "asset": "medium",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["investigator", "urban-realm", "true-damage"],
    "evolvedFrom": "investigator",
    "draftable": false,
    "rules": "Enforcer rank · 140 Dread. Attacks the 3 highest-HP runners for full true damage. Marks inflicted never expire. At this rank, an adjacent Cursed Containment Relic is permanently bound to awaken 1 of 5 Mythic Anomaly Authorities!",
    "synergy": "The 5 Cursed Containment Relics and all Urban Legends."
  },

  // --- ARCHITECTURE A: 5 MYTHIC ANOMALY AUTHORITIES ---
  // 1. Noticeboard -> The Architect of Taboos
  {
  "id": "ruleArchitect",
  "name": "The Architect of Taboos",
  "vn": "Kẻ Viết Quy Tắc — Phòng 404",
  "genre": "Haunted",
  "rarity": "Mythic",
  "baseAtk": 180,
  "attackInterval": 0.55,
  "max": 0,
  "asset": "totem",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "apex",
    "urban-apex",
    "taboo-master"
  ],
  "evolvedFrom": "investigator",
  "draftable": false,
  "rules": "Rule 0: Existence Is a Violation. All runners spawn with 2 Violation Marks (+16% damage). Attacks deal 2.5× true damage to violators. Once per battle, traps a leaking runner in Room 404, preventing the leak. Triggers Rule Resonance when adjacent to another Urban Legend or Relic (+20% damage, +25% speed). Continues receiving Dread from newly applied marks and processed Dossiers. Every 30 Dread earned after ascension grants +2 permanent ATK. Room 404 prevents an ordinary runner leak only; bosses and Harbingers must be defeated through damage.",
  "synergy": "Cursed Noticeboard and Rule Resonance."
},
  // 2. Panopticon Monitor -> The All-Seeing Overseer
  {
    "id": "allSeeingOverseer",
    "name": "The All-Seeing Overseer",
    "vn": "Kẻ Giám Sát Vô Hình",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 170,
    "attackInterval": 0.6,
    "max": 0,
    "asset": "sensor",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "panopticon"],
    "evolvedFrom": "investigator",
    "draftable": false,
    "rules": "Rule: 'No Blind Spots.' Attacks pierce all 16 track tiles simultaneously. Whenever any runner attempts to speed up, sprint, or enrage, freezes them in stasis for 2.0s and strips their speed boosts. Triggers Rule Resonance when adjacent to another Urban Legend or Relic. Continues receiving Dread from newly applied marks and processed Dossiers. Every 30 Dread earned after ascension grants +2 permanent ATK.",
    "synergy": "Panopticon Monitor and Rule Resonance."
  },
  // 3. Red Hotline -> Director of Curfew
  {
    "id": "curfewDirector",
    "name": "Director of Curfew",
    "vn": "Cục Trưởng Khống Chế",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 175,
    "attackInterval": 0.5,
    "max": 0,
    "asset": "bell",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "curfew-master"],
    "evolvedFrom": "investigator",
    "draftable": false,
    "rules": "Rule: 'Indefinite Curfew.' Establishes permanent containment protocol: all Haunted allies gain +60% attack speed. Attacks deal double damage to violators. Triggers Rule Resonance when adjacent to another Urban Legend or Relic. Continues receiving Dread from newly applied marks and processed Dossiers. Every 30 Dread earned after ascension grants +2 permanent ATK.",
    "synergy": "Red Hotline and Rule Resonance."
  },
  // 4. Coroner's Bone Saw -> Forensic Demiurge
  {
    "id": "forensicDemiurge",
    "name": "Forensic Demiurge",
    "vn": "Thần Pháp Y Tử Thi",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 200,
    "attackInterval": 0.45,
    "max": 0,
    "asset": "executioner",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "dissection"],
    "evolvedFrom": "investigator",
    "draftable": false,
    "rules": "Rule: 'Living Autopsy.' Attacks against marked runners inflict true necrosis (50 DPS Bleed ignoring armor). Every 4th attack strips 12% max HP from Elites, Harbingers, and Bosses. Triggers Rule Resonance when adjacent to another Urban Legend or Relic. Continues receiving Dread from newly applied marks and processed Dossiers. Every 30 Dread earned after ascension grants +2 permanent ATK.",
    "synergy": "Coroner's Bone Saw and Rule Resonance."
  },
  // 5. Liminal Keycard -> Warden of the Backrooms
  {
    "id": "backroomsWarden",
    "name": "Warden of the Backrooms",
    "vn": "Chủ Nhân Tầng Âm",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 160,
    "attackInterval": 0.65,
    "max": 0,
    "asset": "totem",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "liminal-space"],
    "evolvedFrom": "investigator",
    "draftable": false,
    "rules": "Rule: 'Floor Does Not Exist.' Attacks pierce 3 runners. Every 6s, banishes the 3 leading runners into non-Euclidean elevator shafts for 4.0s (taking 150 DPS) and dropping them 6 tiles backward on return. Triggers Rule Resonance when adjacent to another Urban Legend or Relic. Continues receiving Dread from newly applied marks and processed Dossiers. Every 30 Dread earned after ascension grants +2 permanent ATK.",
    "synergy": "Liminal Keycard and Rule Resonance."
  },

  // --- ARCHITECTURE B: 5 AUTONOMOUS URBAN LEGENDS LINEAGES ---
  // Lineage 1: Slit-Mouthed Woman
  {
    "id": "scissorBanshee",
    "name": "Blood-Scissors Banshee",
    "vn": "Huyết Kéo Lệ Quỷ",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 48,
    "attackInterval": 0.85,
    "max": 0,
    "asset": "executioner",
    "icon": "✧",
    "fav": "team",
    "tags": ["urban-form", "cleave", "bleed"],
    "evolvedFrom": "kuchisake",
    "draftable": false,
    "rules": "Cleaves 2 runners. Attacks against bleeding or marked runners deal triple critical damage. Earning 45 evolution progress across battles awakens the Slit-Mouthed Sovereign!",
    "synergy": "Bleed, Violations, and Slit-Mouthed Sovereign."
  },
  {
  "id": "slitMouthedSovereign",
  "name": "Slit-Mouthed Sovereign",
  "vn": "Khẩu Liệt Chi Chủ",
  "genre": "Haunted",
  "rarity": "Mythic",
  "baseAtk": 210,
  "attackInterval": 0.5,
  "max": 0,
  "asset": "atlasScythe",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "apex",
    "urban-apex",
    "boss-slayer"
  ],
  "evolvedFrom": "kuchisake",
  "draftable": false,
  "rules": "'Am I Pretty?' Reacts to fast, marked, panicked, or retreating runners and ignores ordinary runners. Strikes against marked violators critically hit for 3.5× damage and apply 35 DPS Bleed. Instantly executes ordinary runners below 30% HP. Every 6th attack shreds 15% current HP from Bosses and Harbingers. Triggers Rule Resonance when adjacent to another Urban Legend. Harbingers are also immune to execution.",
  "synergy": "Bosses, Harbingers, and Rule Resonance."
},
  // Lineage 2: Midnight Bus 44
  {
  "id": "ghostRoute",
  "name": "Ghost Route Express",
  "vn": "Tuyến Xe U Hồn",
  "genre": "Haunted",
  "rarity": "Epic",
  "baseAtk": 44,
  "attackInterval": 1.1,
  "max": 0,
  "asset": "atlasMachineC",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "urban-form",
    "banish",
    "warp"
  ],
  "evolvedFrom": "nightBus",
  "draftable": false,
  "rules": "Reacts only to marked, panicked, fleeing, or unnaturally fast runners; it does not attack ordinary runners. Its attack pierces 2 violators and adds 1 Violation Mark to surviving targets. Every 8s, sweeps a 6-tile span around the leading runner: runners with 2+ marks are warped back 3 tiles and hit for 1.5× ATK. Successful sweep displacements can earn evolution progress under the shared reward cooldown. At 45 violations becomes Terminus Bus 44.",
  "synergy": "Crowded tracks and Terminus Bus 44."
},
  {
    "id": "terminusBus",
    "name": "Terminus Bus 44",
    "vn": "Chuyến Xe Đêm 44 — Bến Cuối",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 155,
    "attackInterval": 0.7,
    "max": 0,
    "asset": "atlasMachineC",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "abduction"],
    "evolvedFrom": "nightBus",
    "draftable": false,
    "rules": "Reacts only to marked, panicked, fleeing, or unnaturally fast runners; it does not attack ordinary runners. Its attack pierces 4 violators and adds 1 Violation Mark to surviving targets. Every 8s, sweeps the leading runner's 4-tile edge, warping runners with 2+ marks back 5 tiles. Every 6s, applies 140 DPS Bleed for 3s (modified by buff duration) to the 2 leading runners and warps them back 5 tiles. Triggers Relic Resonance beside a relic.",
    "synergy": "Track control, Warps, and Rule Resonance."
  },
  // Lineage 3: The Midnight Payphone
  {
    "id": "hauntedSwitchboard",
    "name": "Haunted Switchboard",
    "vn": "Tổng Đài Oan Hồn",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 40,
    "attackInterval": 1.2,
    "max": 0,
    "asset": "bell",
    "icon": "♫",
    "fav": "team",
    "tags": ["urban-form", "sonic", "stun"],
    "evolvedFrom": "payphone",
    "draftable": false,
    "rules": "Reacts only to taboo-breaking runners; it does not attack ordinary runners. Its 16-tile rings deal +50% damage. Whenever Blackout begins, rings immediately, stunning violators for 1s. Earning 45 evolution progress across battles awakens The Midnight Operator!",
    "synergy": "Blackout triggers and The Midnight Operator."
  },
  {
    "id": "midnightOperator",
    "name": "The Midnight Operator",
    "vn": "Tổng Đài Viên Cõi Âm",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 165,
    "attackInterval": 0.6,
    "max": 0,
    "asset": "bell",
    "icon": "♫",
    "fav": "team",
    "tags": ["apex", "urban-apex", "infinite-redial"],
    "evolvedFrom": "payphone",
    "draftable": false,
    "rules": "'Infinite Redial.' Reacts only to taboo-breaking runners; it does not attack ordinary runners. Every 2nd triggered attack rings all 16 perimeter tiles for 150% ATK damage, stunning marked runners for 1.2s and extending active Blackout by 1.5s. Triggers Rule Resonance when adjacent to another Urban Legend.",
    "synergy": "16 tiles, Blackout extension, and Rule Resonance."
  },
  // Lineage 4: Morgue Mirror
  {
    "id": "doppelMirror",
    "name": "Doppelgänger Glass",
    "vn": "Gương Song Trùng",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 42,
    "attackInterval": 1.0,
    "max": 0,
    "asset": "lantern",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["urban-form", "mirror", "reflection"],
    "evolvedFrom": "morgueMirror",
    "draftable": false,
    "rules": "Reacts to taboo-breaking runners and those approaching its reflective angle; it ignores ordinary runners. Copies 50% of the highest adjacent ally's ATK. During Blackout, spawns 2 temporary Mirror Reflections into free slots. Earning 45 evolution progress across battles awakens Queen in the Morgue Mirror!",
    "synergy": "High-ATK neighbors and Queen in the Morgue Mirror."
  },
  {
    "id": "mirrorQueen",
    "name": "Queen in the Morgue Mirror",
    "vn": "Nữ Hoàng Trong Gương",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 170,
    "attackInterval": 0.65,
    "max": 0,
    "asset": "lantern",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "mirror-realm"],
    "evolvedFrom": "morgueMirror",
    "draftable": false,
    "rules": "'Glass Domain.' Reacts to taboo-breaking runners and those approaching its reflective angle; it ignores ordinary runners. Permanently adds 100% of the highest ally raw ATK on the grid to her own. During Blackout, fills available adjacent orthogonal slots with 100%-ATK Mirror Clones for 4s × buffDuration. Triggers Rule Resonance when adjacent to another Urban Legend.",
    "synergy": "All allies, Mirror Clones, and Rule Resonance."
  },
  // Lineage 5: Window Mannequin
  {
    "id": "stalker",
    "name": "Shadow Stalker",
    "vn": "Kẻ Bám Đuôi Bóng Tối",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 45,
    "attackInterval": 0.8,
    "max": 0,
    "asset": "monk",
    "icon": "✧",
    "fav": "team",
    "tags": ["urban-form", "berserk"],
    "evolvedFrom": "mannequin",
    "draftable": false,
    "rules": "Reacts only to taboo-breaking runners; it does not attack ordinary runners. Gains +150% attack speed and +100% critical damage during Blackout. Punishments slow targets by 30%. Earning 45 evolution progress across battles awakens The Living Taboo!",
    "synergy": "Blackout triggers and The Living Taboo."
  },
  {
  "id": "livingTaboo",
  "name": "The Living Taboo",
  "vn": "Cấm Kỵ Sống",
  "genre": "Haunted",
  "rarity": "Mythic",
  "baseAtk": 185,
  "attackInterval": 0.45,
  "max": 0,
  "asset": "monk",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "apex",
    "urban-apex",
    "berserk"
  ],
  "evolvedFrom": "mannequin",
  "draftable": false,
  "rules": "The apex manifestation of taboo. Reacts only to taboo-breaking runners; it does not attack ordinary runners. During Blackout, attacks at 3.0× speed with 100% critical chance. Once per battle, if an ordinary runner reaches tile 15, instantly ambushes and executes it before it can leak. Triggers Rule Resonance when adjacent to another Urban Legend. Bosses and Harbingers cannot be executed.",
  "synergy": "Blackouts and Rule Resonance."
},
  // Lineage 6: Red Raincoat Specter
  {
    "id": "bloodPhantasm",
    "name": "Blood-Drenched Phantasm",
    "vn": "Huyết Ảnh Áo Mưa",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 46,
    "attackInterval": 0.9,
    "max": 0,
    "asset": "spirit",
    "icon": "✧",
    "fav": "team",
    "tags": ["urban-form", "bleed", "retribution"],
    "evolvedFrom": "redRaincoat",
    "draftable": false,
    "rules": "Rule: 'Do Not Look Back.' Reactive trap · does not attack normally. Slashes runners who turn back or retreat for 45 true damage, heavy bleed, and spreading blood pools. In Blackout, triggers against turning or crowding runners, dealing double shadow damage. Earning 45 evolution progress across battles awakens Harbinger of the Crimson Rain!",
    "synergy": "Bleed, Retribution, and Harbinger of the Crimson Rain."
  },
  {
    "id": "crimsonHarbinger",
    "name": "Harbinger of the Crimson Rain",
    "vn": "Huyết Vũ Sứ Giả",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 195,
    "attackInterval": 0.5,
    "max": 0,
    "asset": "spirit",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "crimson-deluge"],
    "evolvedFrom": "redRaincoat",
    "draftable": false,
    "rules": "'The Crimson Deluge.' Reactive slashes critically hit for 3.0× damage. During Blackout, sudden turns or running within 2 tiles of another runner triggers lethal dismemberment; fleeing or panicked victims take triple damage and unleash a crimson mist slowing nearby runners by 60%. Triggers Rule Resonance when adjacent to another Urban Legend.",
    "synergy": "Bleed, Panic, and Rule Resonance."
  },
  // Lineage 7: The 13th Step
  {
    "id": "infiniteStair",
    "name": "Infinite Spiral Staircase",
    "vn": "Cầu Thang Vô Hạn",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 45,
    "attackInterval": 1.2,
    "max": 0,
    "asset": "totem",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["urban-form", "trap", "vertigo"],
    "evolvedFrom": "stair13",
    "draftable": false,
    "rules": "Rule: 'Never Count the Steps.' Reactive trap · does not attack normally. Corner and step traps deal 75 magic damage and inflict Stumble & Vertigo. During Blackout, triggers every 4th step, banishing victims for 2.0s into the void. Earning 45 evolution progress across battles awakens The Penrose Labyrinth!",
    "synergy": "Traps, Vertigo, and The Penrose Labyrinth."
  },
  {
  "id": "penroseLabyrinth",
  "name": "The Penrose Labyrinth",
  "vn": "Mê Cung Penrose",
  "genre": "Haunted",
  "rarity": "Mythic",
  "baseAtk": 180,
  "attackInterval": 0.6,
  "max": 0,
  "asset": "totem",
  "icon": "✧",
  "fav": "neighbor",
  "tags": [
    "apex",
    "urban-apex",
    "endless-drop"
  ],
  "evolvedFrom": "stair13",
  "draftable": false,
  "rules": "'The Endless Drop.' Corner and step traps inflict severe Vertigo and warp violators back 4 tiles. During Blackout, every 4th step triggers Penrose Trapdoor: victims vanish for 2.0s taking continuous crushing void damage; panicked or fleeing victims suffer Terminal Descent execution. Triggers Rule Resonance when adjacent to another Urban Legend. Executions and direct trapdoor position resets exclude bosses and Harbingers.",
  "synergy": "Warps, Panicked runners, and Rule Resonance."
},

  // Earned realm forms for the Qi-Refining Practitioner lineage
  {
  "id": "cultivationFoundation",
  "name": "Foundation Practitioner",
  "vn": "Trúc Cơ Tu Giả",
  "genre": "Cultivation",
  "baseAtk": 18,
  "attackInterval": 1.2,
  "rarity": "Rare",
  "asset": "jade",
  "icon": "築",
  "fav": "neighbor",
  "tags": [
    "cultivation-realm",
    "attacker",
    "scaling"
  ],
  "evolvedFrom": "practitioner",
  "draftable": false,
  "rules": "Foundation realm · 30 Qi. Attacks pierce the two leading runners. Devours adjacent Lotus Blossoms for +5 Qi and +2 permanent ATK. Advances to Golden Core at 85 Qi. Gains +1 Qi every three attacks.",
  "synergy": "Spirit Lotus Blossoms, Spirit Grass, and Cauldron Pills."
},
  {
  "id": "cultivationGoldenCore",
  "name": "Golden Core Daoist",
  "vn": "Kim Đan Chân Nhân",
  "genre": "Cultivation",
  "baseAtk": 40,
  "attackInterval": 1.0,
  "rarity": "Epic",
  "asset": "jade",
  "icon": "丹",
  "fav": "neighbor",
  "tags": [
    "cultivation-realm",
    "attacker",
    "scaling"
  ],
  "evolvedFrom": "practitioner",
  "draftable": false,
  "rules": "Golden Core realm · 85 Qi. Attacks the target and deals 50% splash damage to nearby runners. Devours adjacent Lotus Blossoms for +5 Qi and +2 permanent ATK. Advances to Nascent Soul at 175 Qi. Gains +1 Qi every three attacks.",
  "synergy": "Spirit Lotus Blossoms, Spirit Grass, Cauldron Pills, and Cultivation Relics."
},
  {
  "id": "cultivationNascentSoul",
  "name": "Nascent Soul Sovereign",
  "vn": "Nguyên Anh Lão Tổ",
  "genre": "Cultivation",
  "baseAtk": 75,
  "attackInterval": 0.75,
  "rarity": "Legendary",
  "asset": "jade",
  "icon": "魂",
  "fav": "neighbor",
  "tags": [
    "cultivation-realm",
    "attacker",
    "scaling"
  ],
  "evolvedFrom": "practitioner",
  "draftable": false,
  "rules": "Nascent Soul realm · 175 Qi. Attacks the three highest-HP runners. Devours adjacent Lotus Blossoms for +5 Qi and +2 permanent ATK. At this realm, an adjacent eligible Cultivation Relic is consumed to awaken an Apex Immortal. Gains +1 Qi every three attacks.",
  "synergy": "Cultivation Relics and the full Practitioner lineage."
},
  // 1. Sword Immortal
  {
    "id": "swordImmortal",
    "name": "Sword Immortal",
    "vn": "Kiếm Tiên",
    "genre": "Cultivation",
    "baseAtk": 150,
    "attackInterval": 0.5,
    "rarity": "Mythic",
    "asset": "immortal",
    "sprite": 0,
    "icon": "劍",
    "fav": "team",
    "tags": ["apex", "pierce", "boss-slayer"],
    "evolvedFrom": "practitioner",
    "draftable": false,
    "rules": "Every 4th attack releases a Ten-Thousand Sword Torrent piercing all 16 perimeter tiles, dealing unbuffed ATK damage and stripping 30% current HP from the highest-HP target. Triggers Relic Resonance when adjacent to another Relic (+20% damage, +25% relic speed). Absorbs adjacent Lotus Blossoms and receives spirit dew/pills. Every 30 Qi earned after ascension grants +2 permanent ATK; pre-ascension Qi is not reused.",
    "synergy": "Ancient Flying Sword, Relic Resonance."
  },
  // 2. Melodic Saint
  {
    "id": "melodicSaint",
    "name": "Melodic Saint",
    "vn": "Cầm Tiên",
    "genre": "Cultivation",
    "baseAtk": 95,
    "attackInterval": 1.0,
    "rarity": "Mythic",
    "asset": "bell",
    "sprite": 0,
    "icon": "♫",
    "fav": "team",
    "tags": ["apex", "control", "detonate"],
    "evolvedFrom": "practitioner",
    "draftable": false,
    "rules": "Strikes hit all 16 tiles simultaneously, applying Dissonance (45% slow). At 5 stacks, Dissonance explodes for 260 magic damage and stuns for 1.5s. Triggers Relic Resonance when adjacent to another Relic. Absorbs adjacent Lotus Blossoms and receives spirit dew/pills. Every 30 Qi earned after ascension grants +2 permanent ATK; pre-ascension Qi is not reused.",
    "synergy": "Celestial Guqin, Relic Resonance."
  },
  // 3. Formation Master
  {
    "id": "formationMaster",
    "name": "Formation Master",
    "vn": "Kỳ Tiên",
    "genre": "Cultivation",
    "baseAtk": 110,
    "attackInterval": 1.1,
    "rarity": "Mythic",
    "asset": "altar",
    "sprite": 0,
    "icon": "▨",
    "fav": "team",
    "tags": ["apex", "trap", "stasis"],
    "evolvedFrom": "practitioner",
    "draftable": false,
    "rules": "Places alternating Black and White Go stones on the track. Black pushes enemies backward 3 tiles; White traps enemies in a 2s stasis prison. Sequence triggers 400 true damage. Triggers Relic Resonance when adjacent to another Relic. Absorbs adjacent Lotus Blossoms and receives spirit dew/pills. Every 30 Qi earned after ascension grants +2 permanent ATK; pre-ascension Qi is not reused.",
    "synergy": "Star-River Weiqi Board, Relic Resonance."
  },
  // 4. Talisman Sovereign
  {
  "id": "talismanSovereign",
  "name": "Talisman Sovereign",
  "vn": "Thư Tiên",
  "genre": "Cultivation",
  "baseAtk": 120,
  "attackInterval": 0.7,
  "rarity": "Mythic",
  "asset": "totem",
  "sprite": 0,
  "icon": "✎",
  "fav": "team",
  "tags": [
    "apex",
    "execute",
    "amp"
  ],
  "evolvedFrom": "practitioner",
  "draftable": false,
  "rules": "Inscribes decrees on active track sections. Enemies take +70% damage from all allies. An ordinary runner below 15% HP is instantly executed. Triggers Relic Resonance when adjacent to another Relic. Absorbs adjacent Lotus Blossoms and receives spirit dew/pills. Every 30 Qi earned after ascension grants +2 permanent ATK; pre-ascension Qi is not reused. Bosses and Harbingers cannot be executed.",
  "synergy": "Dragon-Tail Ink Brush, Relic Resonance."
},
  // 5. Landscape Sage
  {
    "id": "landscapeSage",
    "name": "Landscape Sage",
    "vn": "Họa Tiên",
    "genre": "Cultivation",
    "baseAtk": 95,
    "attackInterval": 1.3,
    "rarity": "Mythic",
    "asset": "lantern",
    "sprite": 0,
    "icon": "▧",
    "fav": "team",
    "tags": ["apex", "banish"],
    "evolvedFrom": "practitioner",
    "draftable": false,
    "rules": "Every 8s, banishes the highest-threat enemy into the scroll for 5s. Target takes 90 crushing damage/sec while completely removed from the track. Triggers Relic Resonance when adjacent to another Relic. Absorbs adjacent Lotus Blossoms and receives spirit dew/pills. Every 30 Qi earned after ascension grants +2 permanent ATK; pre-ascension Qi is not reused.",
    "synergy": "Mountain-River Scroll, Relic Resonance."
  },
  // 6. Soul-Reaping Heavenly Demon
  {
    "id": "soulReapingDemon",
    "name": "Soul-Reaping Heavenly Demon",
    "vn": "Vạn Hồn Ma Tôn",
    "genre": "Cultivation",
    "baseAtk": 140,
    "attackInterval": 0.55,
    "rarity": "Mythic",
    "asset": "totem",
    "sprite": 0,
    "icon": "☠",
    "fav": "team",
    "tags": ["apex", "demonic", "chain"],
    "evolvedFrom": "practitioner",
    "draftable": false,
    "rules": "Attacks fire a continuous volley of 5 homing skulls. Every perimeter kill triggers an unholy soul detonation dealing 160 shadow damage in a 3-tile radius (no HP healing). Triggers Relic Resonance when adjacent to another Relic. Absorbs adjacent Lotus Blossoms and receives spirit dew/pills. Every 30 Qi earned after ascension grants +2 permanent ATK; pre-ascension Qi is not reused.",
    "synergy": "Ten-Thousand Soul Banner, Relic Resonance."
  },
  // 7. Blood-Fiend Sword Master
  {
    "id": "bloodFiendMaster",
    "name": "Blood-Fiend Sword Master",
    "vn": "Huyết Kiếm Ma Tu",
    "genre": "Cultivation",
    "baseAtk": 180,
    "attackInterval": 0.35,
    "rarity": "Mythic",
    "asset": "atlasCaster",
    "sprite": 0,
    "icon": "🗡",
    "fav": "team",
    "tags": ["apex", "demonic", "cleave"],
    "evolvedFrom": "practitioner",
    "draftable": false,
    "rules": "Attacks at blinding speed. Every 4th attack sweeps across an entire 4-tile perimeter edge for 280% damage, leaving a pool of boiling blood dealing 50 bleed damage/sec (no HP healing). Triggers Relic Resonance when adjacent to another Relic. Absorbs adjacent Lotus Blossoms and receives spirit dew/pills. Every 30 Qi earned after ascension grants +2 permanent ATK; pre-ascension Qi is not reused.",
    "synergy": "Blood-Drinking Demon Blade, Relic Resonance."
  },
  // 4 Other Earned Forms
  {
    "id": "immortal",
    "name": "Jade Immortal",
    "vn": "Bích Ngọc Chân Nhân",
    "genre": "Cultivation",
    "baseAtk": 20,
    "attackInterval": 1.5,
    "max": 36,
    "sprite": 0,
    "icon": "劍",
    "fav": "team",
    "ecosystem": "Cultivation · attack loops",
    "rarity": "Epic",
    "tags": [],
    "evolvedFrom": "jade",
    "draftable": false,
    "asset": "jade",
    "growthRole": "evolved-engine",
    "rules": "Strike the leading runner for full attack damage and the next two for 55% each. Retain breakthroughs: each other ally attack adds 1 ability tick; at 36, gain +3 permanent ATK.",
    "synergy": "Rapid attackers, ability-gauge batteries, and late payoffs."
  },

  {
    "id": "wraith",
    "name": "Nine-Abyss Wraith",
    "vn": "Cửu U Ma Linh",
    "genre": "Haunted",
    "baseAtk": 28,
    "attackInterval": 0.7,
    "max": 12,
    "sprite": 4,
    "icon": "幽",
    "fav": "team",
    "ecosystem": "Dormancy · state cycles",
    "rarity": "Epic",
    "tags": [],
    "evolvedFrom": "spirit",
    "draftable": false,
    "asset": "spirit",
    "growthRole": "evolved-engine",
    "rules": "After 12 attacks, enter Dormant for 5s, grant allies +20% damage while Dormant, and slow every runner by 25% for 3s. Aura continuously radiates 30% slow. Attacks deal 50% more damage to Elites, Harbingers, and Bosses.",
    "synergy": "Bell, Smelter, Medium, and damage finishers."
  },
  {
    "id": "asura",
    "name": "Asura Monk",
    "vn": "Tà Tăng",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 24,
    "attackInterval": 1.2,
    "max": 0,
    "ecosystem": "Sacrifice · evolution",
    "tags": [],
    "fav": "team",
    "icon": "✧",
    "evolvedFrom": "monk",
    "draftable": false,
    "asset": "monk",
    "growthRole": "evolved-engine",
    "rules": "Attacks against defense-shredded enemies always critically strike. Apply a separate Bleed stack: 6 DPS for 4s. Every six critical hits across battles and every credited kill grant +1 permanent ATK.",
    "synergy": "Hydraulic Riveter, Nanites, and Blood-Drunk Abyssal Hunter."
  },
{
  "id": "dragonCubT1",
  "name": "Horned Drake Cub",
  "vn": "Horned Drake Cub",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 22,
  "attackInterval": 1.1,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-dragon"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "dragon",
  "lineageTier": 1,
  "rules": "Hits the 2 leading runners. This ability is inherited by all higher Dragon evolutions.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "dragonCubT2",
  "name": "Storm Dragon Noble",
  "vn": "Storm Dragon Noble",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 48,
  "attackInterval": 1.0,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-dragon"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "dragon",
  "lineageTier": 2,
  "rules": "Inherits the 2-runner strike. Every fourth attack hits 3 runners for double damage; higher Dragon evolutions retain both abilities.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "dragonCubT3",
  "name": "Nine-Cloud Sky Dragon",
  "vn": "Nine-Cloud Sky Dragon",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 85,
  "attackInterval": 0.85,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-dragon"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "dragon",
  "lineageTier": 3,
  "rules": "Inherits the Dragon’s 2-runner strike and every-fourth-attack double strike. Hits the 4 leading runners; these abilities remain at Apex.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "dragonCubApex",
  "name": "Primordial Azure Dragon",
  "vn": "Primordial Azure Dragon",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 160,
  "attackInterval": 0.7,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-dragon"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "dragon",
  "lineageTier": 4,
  "rules": "Inherits all lower Dragon attacks and hits the 6 leading runners. Every 8 seconds knocks all runners back 2 tiles.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubT1",
  "name": "Fanged Tiger Cub",
  "vn": "Fanged Tiger Cub",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 24,
  "attackInterval": 1.0,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-tiger"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "tiger",
  "lineageTier": 1,
  "rules": "15% extra critical chance. This ability remains through every higher Tiger evolution.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubT2",
  "name": "Blood-Stripe Saber",
  "vn": "Blood-Stripe Saber",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 52,
  "attackInterval": 0.9,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-tiger"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "tiger",
  "lineageTier": 2,
  "rules": "Inherits 15% extra critical chance. Attacks apply Bleed (3 DPS for 4s); critical strikes against bleeding targets deal triple damage. These abilities remain through higher Tiger evolutions.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubT3",
  "name": "Slaughter War Tiger",
  "vn": "Slaughter War Tiger",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 95,
  "attackInterval": 0.75,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-tiger"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "tiger",
  "lineageTier": 3,
  "rules": "Inherits 15% extra critical chance, Bleed (3 DPS for 4s), and triple critical damage against bleeding targets. Prioritizes elites and deals triple damage to targets below 40% health; inherited abilities remain at Apex.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubApex",
  "name": "White Tiger God of Slaughter",
  "vn": "White Tiger God of Slaughter",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 210,
  "attackInterval": 0.55,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-tiger"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "tiger",
  "lineageTier": 4,
  "rules": "Inherits the Tiger Cub’s 15% extra critical chance, Bleed, triple critical damage against bleeding targets, elite priority, and triple damage below 40% health. Deals quadruple damage; kills stun all runners for 1.5 seconds.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubT1",
  "name": "Xuanwu Hatchling",
  "vn": "Xuanwu Hatchling",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 18,
  "attackInterval": 1.4,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-xuanwu"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "xuanwu",
  "lineageTier": 1,
  "rules": "Inherits through every higher Xuanwu evolution: attacks slow targets by 20% for 2 seconds.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubT2",
  "name": "Mountain-Back Behemoth",
  "vn": "Mountain-Back Behemoth",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 42,
  "attackInterval": 1.3,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-xuanwu"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "xuanwu",
  "lineageTier": 2,
  "rules": "Inherits the 20% slow. Attacks apply Venom (4 DPS for 4s); every fifth attack deals 120 true damage to all runners. These abilities remain through higher Xuanwu evolutions.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubT3",
  "name": "Abyssal Twin Sovereigns",
  "vn": "Abyssal Twin Sovereigns",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 80,
  "attackInterval": 1.1,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-xuanwu"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "xuanwu",
  "lineageTier": 3,
  "rules": "Inherits the Xuanwu slow, Venom, and every-fifth-attack true-damage pulse. When a runner is speed-boosted, deals 60 true damage and stuns it for 1 second; these abilities remain at Apex.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubApex",
  "name": "Xuanwu Divine Heaven-Bearer",
  "vn": "Xuanwu Divine Heaven-Bearer",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 150,
  "attackInterval": 0.9,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-xuanwu"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "xuanwu",
  "lineageTier": 4,
  "rules": "Inherits all lower Xuanwu abilities. Alternates added Venom and 2-tile knockback on attacks; prevents up to 2 leaks per battle. Leak prevention excludes bosses and Harbingers.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubT1",
  "name": "Fire-Fledged Chick",
  "vn": "Fire-Fledged Chick",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 20,
  "attackInterval": 1.1,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "phoenix",
  "lineageTier": 1,
  "rules": "Attacks apply stacking Burn (5 DPS for 4s). This ability remains through every higher Phoenix evolution.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubT2",
  "name": "Blazing Sun Crane",
  "vn": "Blazing Sun Crane",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 46,
  "attackInterval": 0.95,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "phoenix",
  "lineageTier": 2,
  "rules": "Inherits stacking Burn. Burns spread to the next runner, and attacks make targets take 15% more damage for 3s; these abilities remain through higher Phoenix evolutions.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubT3",
  "name": "Nirvana Flame Bird",
  "vn": "Nirvana Flame Bird",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 82,
  "attackInterval": 0.8,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "phoenix",
  "lineageTier": 3,
  "rules": "Inherits Burn spread and 15% increased damage taken. Every 8 seconds consumes active Burns, dealing their remaining damage immediately; inherited abilities remain at Apex.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubApex",
  "name": "Immortal Vermilion Phoenix",
  "vn": "Immortal Vermilion Phoenix",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 175,
  "attackInterval": 0.65,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "phoenix",
  "lineageTier": 4,
  "rules": "Inherits all lower Phoenix abilities and deals 25% extra true fire damage on attacks. Once per run, revives after lethal damage with 1 HP.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubT1",
  "name": "Stone Simian Cub",
  "vn": "Stone Simian Cub",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 16,
  "attackInterval": 0.8,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "monkey",
  "lineageTier": 1,
  "rules": "Fast attacks grant 10 percentage points of extra critical chance. This ability remains through every higher Monkey evolution.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubT2",
  "name": "Four-Eared Macaque",
  "vn": "Four-Eared Macaque",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 38,
  "attackInterval": 0.7,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "monkey",
  "lineageTier": 2,
  "rules": "Inherits 10 percentage points of extra critical chance. Every sixth attack summons a temporary 50%-ATK clone; these abilities remain through higher Monkey evolutions.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubT3",
  "name": "Heaven-Shaking Ape King",
  "vn": "Heaven-Shaking Ape King",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 75,
  "attackInterval": 0.6,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "monkey",
  "lineageTier": 3,
  "rules": "Inherits Monkey critical chance and the sixth-attack clone. Attacks cleave the 3 leading runners; inherited abilities remain at Apex.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubApex",
  "name": "Great Sage Equal to Heaven",
  "vn": "Great Sage Equal to Heaven",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 185,
  "attackInterval": 0.45,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "draftable": false,
  "lineage": "monkey",
  "lineageTier": 4,
  "rules": "Inherits all lower Monkey abilities. Strikes up to 8 runners for 150% ATK as true damage and strips active speed boosts and buffs.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
}
];

// --- TOKENS (1 CULTIVATION BLOSSOM + 5 EXISTING) ---
const TOKENS = [
  {
    "id": "dossier",
    "name": "Incident Dossier",
    "vn": "Hồ Sơ Sự Cố",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "asset": "medium",
    "tags": ["token", "dossier", "consumable"],
    "token": true,
    "draftable": false,
    "fav": "neighbor",
    "species": "securityCam",
    "ecosystem": "Quái Đàm · Incident Evidence",
    "rules": "Dropped on the grid by Security Monitor or Emergency Broadcast when rule violations occur. An adjacent Forensic Coroner examines it to grant +3 permanent ATK to an ally and +10 Dread to the Investigator. An adjacent Decoder converts it into a team haste/crit Survival Manual.",
    "synergy": "Security Monitor, Forensic Coroner, Black-Box Cryptographer, and Night Investigator."
  },

  {
    "id": "mirrorClone",
    "name": "Mirror Reflection",
    "vn": "Bản Sao Gương",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 15,
    "attackInterval": 1.2,
    "asset": "lantern",
    "tags": ["token", "urban-legend"],
    "token": true,
    "draftable": false,
    "fav": "neighbor",
    "species": "morgueMirror",
    "ecosystem": "Quái Đàm · Reflections",
    "rules": "Temporary mirror reflection summoned during Blackouts by Morgue Mirror or Mirror Queen.",
    "synergy": "Morgue Mirror and Queen in the Morgue Mirror."
  },

  {
    "id": "lotusBlossom",
    "name": "Spirit Lotus Blossom",
    "vn": "Linh Liên Hoa",
    "genre": "Cultivation",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "asset": "lotus",
    "tags": ["token", "consumable", "fodder"],
    "token": true,
    "draftable": false,
    "fav": "neighbor",
    "species": "lotusRoot",
    "ecosystem": "Cultivation · Dan Dao",
    "rules": "An adjacent Practitioner absorbs this token for +5 Qi and +2 permanent ATK. Cultivation Apex forms absorb it for +15 Qi toward their 30-Qi growth cycle. A Cauldron can instead brew it into +12 Qi and +4 permanent ATK before ascension. Consuming the token preserves its parent root.",
    "synergy": "Qi-Refining Practitioner, Nine-Turn Alchemy Cauldron."
  },
  {
    "id": "petal",
    "name": "Lotus Petal",
    "vn": "Lotus Petal",
    "genre": "Cultivation",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "asset": "lotus",
    "tags": ["token", "fodder"],
    "token": true,
    "draftable": false,
    "fav": "team",
    "ecosystem": "Tokens · predation",
    "rules": "Temporary Spirit Lotus token.",
    "synergy": "Alchemical Adept."
  },

  {
    "id": "houndToken",
    "name": "Hound Phantom",
    "vn": "Hound Phantom",
    "genre": "Bloodline",
    "rarity": "Normal",
    "baseAtk": 16,
    "attackInterval": 1.3,
    "asset": "hound",
    "tags": ["token", "fodder"],
    "token": true,
    "draftable": false,
    "fav": "center",
    "ecosystem": "Tokens · predation",
    "rules": "Temporary Crimson Hound token.",
    "synergy": "Primordial Blood Cub and Crimson Broodkeeper."
  },
  {
    "id": "echo",
    "name": "Spirit Echo",
    "vn": "Spirit Echo",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "asset": "spirit",
    "tags": ["token"],
    "token": true,
    "draftable": false,
    "fav": "team",
    "ecosystem": "Tokens · state cycles",
    "rules": "Temporary echo captured by Veil Medium.",
    "synergy": "Veil Medium and Grave Lantern."
  },
  {
    "id": "lambToken",
    "name": "Mourning Lamb Echo",
    "vn": "Mourning Lamb Echo",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 8,
    "attackInterval": 1.5,
    "asset": "monk",
    "tags": ["token", "fodder"],
    "token": true,
    "draftable": false,
    "fav": "team",
    "ecosystem": "Tokens · sacrifice",
    "rules": "Temporary Mourning Lamb token spawned by Veil Shepherd.",
    "synergy": "Soul Harvester and Soul Well."
  },
{
  "id": "scaleImp",
  "name": "Scale Imp",
  "vn": "Scale Imp",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.2,
  "tags": [
    "token",
    "fodder"
  ],
  "token": true,
  "draftable": false,
  "fav": "neighbor",
  "species": "serpentFodder",
  "ecosystem": "Bloodline · attacking offspring",
  "rules": "Legacy standalone offspring token. Breeding now creates a temporary copy with the parent fodder species identity; eligible offspring can be devoured by the Primordial Blood Cub.",
  "synergy": "Bloodline Cub and matching fodder."
},
{
  "id": "carapaceToken",
  "name": "Carapace Token",
  "vn": "Carapace Token",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 14,
  "attackInterval": 1.5,
  "tags": [
    "token",
    "fodder"
  ],
  "token": true,
  "draftable": false,
  "fav": "neighbor",
  "species": "scuttler",
  "ecosystem": "Bloodline · attacking offspring",
  "rules": "Legacy standalone offspring token. Breeding now creates a temporary copy with the parent fodder species identity; eligible offspring can be devoured by the Primordial Blood Cub.",
  "synergy": "Bloodline Cub and matching fodder."
},
{
  "id": "emberToken",
  "name": "Ember Tadpole",
  "vn": "Ember Tadpole",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 11,
  "attackInterval": 1.1,
  "tags": [
    "token",
    "fodder"
  ],
  "token": true,
  "draftable": false,
  "fav": "neighbor",
  "species": "flameToad",
  "ecosystem": "Bloodline · attacking offspring",
  "rules": "Legacy standalone offspring token. Breeding now creates a temporary copy with the parent fodder species identity; eligible offspring can be devoured by the Primordial Blood Cub.",
  "synergy": "Bloodline Cub and matching fodder."
},
{
  "id": "peachToken",
  "name": "Spirit Peach Token",
  "vn": "Spirit Peach Token",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 10,
  "attackInterval": 0.9,
  "tags": [
    "token",
    "fodder"
  ],
  "token": true,
  "draftable": false,
  "fav": "neighbor",
  "species": "peachFodder",
  "ecosystem": "Bloodline · attacking offspring",
  "rules": "Legacy standalone offspring token. Breeding now creates a temporary copy with the parent fodder species identity; eligible offspring can be devoured by the Primordial Blood Cub.",
  "synergy": "Bloodline Cub and matching fodder."
}
];

const LEGACY_CARDS = [
  { "id": "spirit", "name": "Restless Spirit", "genre": "Haunted", "baseAtk": 10, "attackInterval": 1.2, "rarity": "Normal", "draftable": false, "retired": true },
  { "id": "bell", "name": "Soul-Wailing Bell", "genre": "Haunted", "baseAtk": 8, "attackInterval": 2.2, "rarity": "Normal", "draftable": false, "retired": true },
  { "id": "lantern", "name": "Grave Lantern", "genre": "Haunted", "baseAtk": 0, "attackInterval": 0, "rarity": "Rare", "draftable": false, "retired": true },
  { "id": "medium", "name": "Veil Medium", "genre": "Haunted", "baseAtk": 14, "attackInterval": 1.6, "rarity": "Rare", "draftable": false, "retired": true },
  { "id": "lamb", "name": "Mourning Lamb", "genre": "Haunted", "baseAtk": 8, "attackInterval": 1.5, "rarity": "Normal", "draftable": false, "retired": true },
  { "id": "shepherd", "name": "Veil Shepherd", "genre": "Haunted", "baseAtk": 12, "attackInterval": 1.7, "rarity": "Rare", "draftable": false, "retired": true },
  { "id": "harvester", "name": "Soul Harvester", "genre": "Haunted", "baseAtk": 20, "attackInterval": 1.9, "rarity": "Rare", "draftable": false, "retired": true },
  { "id": "soulwell", "name": "Soul Well", "genre": "Haunted", "baseAtk": 0, "attackInterval": 0, "rarity": "Epic", "draftable": false, "retired": true },
  { "id": "wraith", "name": "Nine-Abyss Wraith", "genre": "Haunted", "baseAtk": 28, "attackInterval": 0.7, "rarity": "Epic", "draftable": false, "retired": true },


  { "id": "jade", "name": "Jade Disciple", "genre": "Cultivation", "baseAtk": 14, "attackInterval": 1.5, "max": 36, "rarity": "Rare", "draftable": false, "evolveTo": "immortal" },
  { "id": "herb", "name": "Spirit Herb Spring", "genre": "Cultivation", "baseAtk": 0, "attackInterval": 0, "rarity": "Normal", "draftable": false },
  { "id": "lotus", "name": "Spirit Lotus", "genre": "Cultivation", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 18, "draftable": false },
  { "id": "monk", "name": "Mortal Monk", "genre": "Cultivation", "rarity": "Normal", "baseAtk": 12, "attackInterval": 1.2, "max": 3, "draftable": false, "evolveTo": "asura" },
  { "id": "alchemist", "name": "Alchemical Adept", "genre": "Cultivation", "rarity": "Rare", "baseAtk": 18, "attackInterval": 1.5, "draftable": false },
  { "id": "catalyst", "name": "Threefold Pill Blossom", "genre": "Cultivation", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "draftable": false }
];

const NODES = {
  "battle": { "name": "Battlefield", "icon": "⚔", "desc": "Defeat the crossing runners. Earn a card draft." },
  "elite": { "name": "Elite breach", "icon": "☠", "desc": "Dangerous enemies; higher rarity cards and a general relic reward." },
  "rest": { "name": "Campfire", "icon": "⛺", "desc": "Restore 25 health, or awaken a card for 12 permanent ATK. Then draft." },
  "cache": { "name": "Forgotten vault", "icon": "▧", "desc": "Choose a general relic, then draft a card." },
  "event": { "name": "Crossroads", "icon": "?", "desc": "Trade health for power, or take a safe blessing. Then draft." },
  "boss": { "name": "The Unraveler", "icon": "♜", "desc": "The final siege. The boss must be defeated; its escape ends the run." },
  "workshop": { "name": "Fate Workshop", "icon": "✦", "desc": "Choose one roster card, then one of three upgrades or awakening paths for 10 health. Or pass and restore 3 health. Draft afterward." }
};

const RELICS = [
  { "id": "blade", "name": "Glass Blade", "desc": "+12% damage for every card." },
  { "id": "clock", "name": "Second Hand", "desc": "+10% attack speed for every attacking card." },
  { "id": "heart", "name": "Living Amber", "desc": "+20 maximum health; restore 10 health when found." },
  { "id": "lens", "name": "Hunter’s Lens", "desc": "+10 percentage points of critical chance for every card." },
  { "id": "frost", "name": "Winter Thread", "desc": "All runners move 10% slower." },
  { "id": "mercy", "name": "Mercy Knot", "desc": "Each leak deals 1 less damage (minimum 1)." }
];


// Scrapwork replaces the old draft pool; old IDs remain readable in existing saves.

CARDS.push(...[
  {
    "id": "scrapFrame",
    "name": "Scavenged Frame",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 10,
    "attackInterval": 1.4,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Locks its first two forged modules; both fire each attack at 65% individual power when dual-equipped. Gains +1 Alloy per 3 attacks, +5 per deployed battle clear, and +3 per smelt. At 25/65 Alloy becomes Reinforced/Heavy Walker. At 120 unlocks a two-adjacent-slot Titan, waiting for space if blocked. Every 15 Alloy beyond 120 grants +2 permanent ATK.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "scrapFrame"
  },
  {
    "id": "junkScavenger",
    "name": "Junk Scavenger",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 12,
    "attackInterval": 1.3,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Attacks the leading runner. Each team kill anywhere on the track has a 50% chance to salvage one random Rust Sword or Rust Gun into an empty adjacent slot. Full grid: salvage is lost. No scrap-count cap.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "junkScavenger"
  },
  {
    "id": "magneticCrane",
    "name": "Magnetic Crane",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 8,
    "attackInterval": 1.6,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Every 4s, moves loose scrap from anywhere on the grid into free slots adjacent to a Smelter. Never displaces a card or occupies a Titan reservation.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "magneticCrane"
  },
  {
    "id": "hydraulicRiveter",
    "name": "Hydraulic Riveter",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 12,
    "attackInterval": 1.4,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Hits permanently remove 25% of original runner armor; repeated hits do not stack. Every 6s, welds +3 permanent ATK onto the weakest adjacent original Mech. Can weld from either side of a two-slot Titan.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "hydraulicRiveter"
  },
  {
    "id": "titanReactor",
    "name": "Titan Reactor Core",
    "genre": "PostApoc",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Adjacent mechanical allies deal +20% damage; duplicate reactors do not stack. At Crossing 10+, a neighboring two-slot Titan with two locked modules permanently consumes this Core to become Mythic. Blade+Blade: Berserker. Flak+Flak: Siege. Every other pair: Vanguard.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "titanReactor"
  }
]);
FORMS.push(...[
  {
    "id": "reinforcedWalker",
    "name": "Reinforced Walker",
    "genre": "PostApoc",
    "rarity": "Rare",
    "baseAtk": 24,
    "attackInterval": 1.4,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Locks its first two forged modules; both fire each attack at 65% individual power when dual-equipped. Gains +1 Alloy per 3 attacks, +5 per deployed battle clear, and +3 per smelt. At 25/65 Alloy becomes Reinforced/Heavy Walker. At 120 unlocks a two-adjacent-slot Titan, waiting for space if blocked. Every 15 Alloy beyond 120 grants +2 permanent ATK.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "reinforcedWalker",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "heavyWalker",
    "name": "Heavy Walker",
    "genre": "PostApoc",
    "rarity": "Epic",
    "baseAtk": 50,
    "attackInterval": 1.6,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Locks its first two forged modules; both fire each attack at 65% individual power when dual-equipped. Gains +1 Alloy per 3 attacks, +5 per deployed battle clear, and +3 per smelt. At 25/65 Alloy becomes Reinforced/Heavy Walker. At 120 unlocks a two-adjacent-slot Titan, waiting for space if blocked. Every 15 Alloy beyond 120 grants +2 permanent ATK.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "heavyWalker",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "titanFrame",
    "name": "Titan Core",
    "genre": "PostApoc",
    "rarity": "Legendary",
    "baseAtk": 95,
    "attackInterval": 1.8,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Locks its first two forged modules; both fire each attack at 65% individual power when dual-equipped. Gains +1 Alloy per 3 attacks, +5 per deployed battle clear, and +3 per smelt. At 25/65 Alloy becomes Reinforced/Heavy Walker. At 120 unlocks a two-adjacent-slot Titan, waiting for space if blocked. Every 15 Alloy beyond 120 grants +2 permanent ATK.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "titanFrame",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "berserkerColossus",
    "name": "Berserker Greatsword Colossus",
    "genre": "PostApoc",
    "rarity": "Mythic",
    "baseAtk": 260,
    "attackInterval": 1.8,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Two-slot Titan from Blade+Blade. Strikes the highest-current-HP runner, ignoring armor, and permanently removes 50% original armor. Executes ordinary runners below 30% HP (never bosses or Harbingers). Every third attack cleaves 15% current HP from each deployed boss/Harbinger. Continues earning Alloy; each 15 beyond 120 grants +2 permanent ATK.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "berserkerColossus",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "siegeDreadnought",
    "name": "Siege Fortress Dreadnought",
    "genre": "PostApoc",
    "rarity": "Mythic",
    "baseAtk": 165,
    "attackInterval": 1.8,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Two-slot Titan from Flak+Flak. Bombards an eight-tile perimeter arc centered on the leading runner, hitting every runner in it. Breaks shields and permanently removes 50% original armor, without repeated stacking. Continues earning Alloy and permanent growth beyond 120.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "siegeDreadnought",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "vanguardJuggernaut",
    "name": "Vanguard Gunblade Juggernaut",
    "genre": "PostApoc",
    "rarity": "Mythic",
    "baseAtk": 185,
    "attackInterval": 1.7,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Two-slot Titan from any mixed pair or pair containing Gunblade. Each attack fires one armor-ignoring round for full ATK and cleaves a four-tile arc for 45% ATK. Leaves burning oil for 4s: 35 true DPS to runners on those tiles. Same-owner overlapping oil refreshes without stacking. Continues earning Alloy and permanent growth beyond 120.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "vanguardJuggernaut",
    "evolvedFrom": "scrapFrame"
  }
]);
TOKENS.push(...[
  {
    "id": "rustSword",
    "name": "Rust Sword",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Temporary bladed scrap. Two Swords forge a Blade; Sword+Gun forges a Gunblade. Consumed by an adjacent Smelter; cannot breed.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "rustSword",
    "token": true,
    "draftable": false
  },
  {
    "id": "rustGun",
    "name": "Rust Gun",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Temporary ballistic scrap. Two Guns forge Flak; Gun+Sword forges a Gunblade. Consumed by an adjacent Smelter; cannot breed.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "rustGun",
    "token": true,
    "draftable": false
  }
]);

// Shared progression rules are appended to every current Urban Legend form.
for (const c of [...CARDS,...FORMS].filter(c=>['kuchisake','nightBus','payphone','morgueMirror','mannequin','stair13','redRaincoat'].includes(c.evolvedFrom||c.id))) {
 c.rules += ' Evolution rewards: +0.35 progress per qualifying reaction, at most once per runner per 8s for this legend. Adjacent legends share 15% of earned progress. Combat reactions and Blackout charge continue during the reward cooldown. Epic at 15 progress; Mythic at 45; no crossing lock.';
}

CARDS.push({"id": "mercenary", "name": "Cursed Mercenary", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 10, "attackInterval": 1.4, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Attacks the leading runner, inflicting 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At Crossing 10+, 100 points and an adjacent forged relic awaken a Mythic, consuming the relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "mercenary"},{"id": "witchHunter", "name": "Witch Hunter", "genre": "Grimdark", "rarity": "Rare", "baseAtk": 18, "attackInterval": 1.2, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Once per team per battle, after three runners spawn, brands the healthiest living ordinary runner Alpha Quarry. It qualifies for Morrow’s bonus and a trophy. Deals double damage to shielded runners.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witchHunter"},{"id": "trophyStake", "name": "Trophy Stake", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Mounts one adjacent loose trophy, freeing its slot and projecting its aura to orthogonal neighbors. Adjacent Taxidermists can carve the mounted head. Mounted heads expire after battle.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "trophyStake"},{"id": "taxidermist", "name": "Beast Taxidermist", "genre": "Grimdark", "rarity": "Rare", "baseAtk": 10, "attackInterval": 1.5, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Every 6s carves an adjacent loose or mounted head: +3 permanent ATK to adjacent hunters; +10 Trophy Points to deployed core slayers. Skull: +3 permanent ATK to lowest-ATK ally. Horn: -10% base armor to priority enemies, run-wide, capped 30%. Eye: ordinary-runner execution thresholds of 30% become 35%. Two same-family carvings forge a permanent undraftable relic into an empty slot. One unbound copy per family; excess counters persist.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "taxidermist"});
FORMS.push({"id": "oathboundHunter", "name": "Oathbound Hunter", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 24, "attackInterval": 1.3, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At Crossing 10+, 100 points and an adjacent forged relic awaken a Mythic, consuming the relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "oathboundHunter", "evolvedFrom": "mercenary", "draftable": false},{"id": "blackIronSlayer", "name": "Black-Iron Slayer", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 55, "attackInterval": 1.2, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At Crossing 10+, 100 points and an adjacent forged relic awaken a Mythic, consuming the relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "blackIronSlayer", "evolvedFrom": "mercenary", "draftable": false},{"id": "brandedBerserker", "name": "Branded Berserker", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 95, "attackInterval": 1.1, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At Crossing 10+, 100 points and an adjacent forged relic awaken a Mythic, consuming the relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "brandedBerserker", "evolvedFrom": "mercenary", "draftable": false},{"id": "dragonSlayer", "name": "Dragon Slayer Berserker", "genre": "Grimdark", "rarity": "Mythic", "baseAtk": 250, "attackInterval": 1.6, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Sweeps the target’s entire 4-tile wall, ignoring armor, breaking shields and cancelling sprint boosts. Every third swing strips 15% current HP from bosses and Harbingers. Kills on its attacked wall grant +5% battle attack speed, capped +50%.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "dragonSlayer", "evolvedFrom": "mercenary", "draftable": false},{"id": "witcherGrandmaster", "name": "Grandmaster Witcher", "genre": "Grimdark", "rarity": "Mythic", "baseAtk": 210, "attackInterval": 1.1, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Alternates three Silver attacks and three Sign attacks. Silver guarantees criticals: 3× TOTAL damage against priority enemies, 2× against ordinary runners. Signs blast the target’s 4-tile wall, knock runners back 3 tiles (boss resistance applies), and strip 50% armor.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witcherGrandmaster", "evolvedFrom": "mercenary", "draftable": false},{"id": "bloodDrunkHunter", "name": "Blood-Drunk Abyssal Hunter", "genre": "Grimdark", "rarity": "Mythic", "baseAtk": 195, "attackInterval": 0.75, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts stacking Arterial Hemorrhage: 40 true DPS for 4s. A hemorrhaging ordinary runner below 30% HP (35% after Eye carving) is executed once, exploding for 400 true damage across its 4-tile wall. Bosses and Harbingers cannot be executed.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "bloodDrunkHunter", "evolvedFrom": "mercenary", "draftable": false},{"id": "beastRelic", "name": "Feral Beast Heart", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Forged only from two beast carvings. Permanent roster card; orthogonal allies gain +25% attack speed. At Crossing 10+, binds to an adjacent 100-point Branded Berserker. Consumed on binding.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "beastRelic", "draftable": false, "huntRelic": true},{"id": "fiendRelic", "name": "Demon-Forged Brand", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Forged only from two fiend carvings. Permanent roster card; orthogonal allies gain 30% armor penetration. At Crossing 10+, binds to an adjacent 100-point Branded Berserker. Consumed on binding.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "fiendRelic", "draftable": false, "huntRelic": true},{"id": "witchRelic", "name": "Clairvoyant Iris", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Forged only from two witch carvings. Permanent roster card; orthogonal allies gain +20% critical chance. At Crossing 10+, binds to an adjacent 100-point Branded Berserker. Consumed on binding.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witchRelic", "draftable": false, "huntRelic": true});
TOKENS.push({"id": "beastSkull", "name": "Feral Beast Skull", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "One-battle trophy. Orthogonal allies gain +20% attack speed and attacks inflict 6 DPS stacking Bleed for 4s. Duplicate family auras do not stack. May be mounted or carved.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "beastSkull", "token": true, "draftable": false, "trophyFamily": "beast"},{"id": "fiendHorn", "name": "Armored Demon Horn", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "One-battle trophy. Orthogonal allies gain 40% armor penetration and one 50% second-target cleave per attack. Duplicate family auras do not stack. May be mounted or carved.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "fiendHorn", "token": true, "draftable": false, "trophyFamily": "fiend"},{"id": "witchEye", "name": "Specter Witch Eye", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "One-battle trophy. Orthogonal allies gain +25% critical chance and double attack damage against runners below 35% HP. Duplicate family auras do not stack. May be mounted or carved.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witchEye", "token": true, "draftable": false, "trophyFamily": "witch"});
Object.assign(CARDS.find(c=>c.id==='executioner'),{rules:'Prioritizes Alpha Quarry, Elites, Harbingers and Bosses. Deals 4× damage to targets below 35% HP.',huntAsset:'executioner',tags:['hunter']});
Object.assign(CARDS.find(c=>c.id==='leech'),{name:'Grave Leech',rules:'Deals 2.5× damage against bleeding runners or while adjacent to a loose or mounted trophy.',huntAsset:'leech'});
Object.assign(CARDS.find(c=>c.id==='totem'),{huntAsset:'totem'});

// Arcane Loom: primary mages and earned synthesis forms.
CARDS.push({
  "id": "elementalApprentice",
  "name": "Elemental Apprentice",
  "genre": "Arcane",
  "rarity": "Normal",
  "baseAtk": 8,
  "attackInterval": 1.4,
  "max": 8,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 8, casts an four-target essence volley for 120 + 6× raw ATK + 8× highest pair points. Adjacent primary spells supply one essence; two different stored essences are consumed for +1 point in that pair. Highest pair advances at 10/20/30. At Crossing 10+, bind an adjacent Astral Loom at 30 points to become that pair’s Mythic.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "elementalApprentice"
},
{
  "id": "pyroMage",
  "name": "Pyromancer",
  "genre": "Arcane",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.3,
  "max": 6,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 6: Ignite Blast deals 200 + 8× raw ATK to the leader and applies stacking Burn, 8 true DPS for 4s. Supplies Fire Essence to adjacent Apprentices.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "pyroMage",
  "element": "fire"
},
{
  "id": "hydroMage",
  "name": "Hydromancer",
  "genre": "Arcane",
  "rarity": "Normal",
  "baseAtk": 10,
  "attackInterval": 1.6,
  "max": 8,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 8: Tidal Wave deals 100 + 6× raw ATK to four leading runners, slows 35% for 3s and drenches for 4s. Supplies Water Essence.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "hydroMage",
  "element": "water"
},
{
  "id": "geoMage",
  "name": "Geomancer",
  "genre": "Arcane",
  "rarity": "Normal",
  "baseAtk": 14,
  "attackInterval": 1.8,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 10: Seismic Spike deals 250 + 10× raw ATK, strips 40% armor and stuns for 1s. Leaves an Earth mark for 4s. Supplies Earth Essence.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "geoMage",
  "element": "earth"
},
{
  "id": "aeroMage",
  "name": "Aeromancer",
  "genre": "Arcane",
  "rarity": "Normal",
  "baseAtk": 9,
  "attackInterval": 1,
  "max": 5,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 5: Gale Blast deals 100 + 5× raw ATK, knocks back 2 tiles and grants adjacent elemental mages +20% haste for 3s. Leaves a Wind mark for 4s. Supplies Wind Essence.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "aeroMage",
  "element": "wind"
},
{
  "id": "elementalPrism",
  "name": "Elemental Prism",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "support"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Works from any slot. An adjacent elemental spell refracts +2 gauge ticks to orthogonal allies with ability gauges. Once per second per Prism; duplicate Prisms cannot amplify the same spell.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "elementalPrism"
},
{
  "id": "manaBattery",
  "name": "Mana Battery",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 8,
  "attackInterval": 1.8,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Collects excess charge after elemental spell triggers, up to 32 mana. Every 6s spends stored mana on the deployed elemental mage with the lowest gauge fraction, up to a full gauge. Discharged mana cannot generate new overflow. Stored mana lasts this battle only.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "manaBattery"
},
{
  "id": "astralLoom",
  "name": "Astral Loom",
  "genre": "Arcane",
  "rarity": "Epic",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "support"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "At Crossing 10+, an adjacent Apprentice with at least 30 points in one pair permanently binds this relic to become the corresponding Mythic. Consumed on binding. Highest pair wins; ties follow the displayed pair order.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "astralLoom"
});
FORMS.push({
  "id": "elementalAdept",
  "name": "Elemental Adept",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 24,
  "attackInterval": 1.2,
  "max": 8,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Earned at 10 points in one pair. Essence bolt and synthesis continue; bind Astral Loom at 30 points and Crossing 10+.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "elementalAdept",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
},
{
  "id": "elementalMaster",
  "name": "Elemental Mage",
  "genre": "Arcane",
  "rarity": "Epic",
  "baseAtk": 55,
  "attackInterval": 1,
  "max": 8,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Earned at 20 points in one pair. Essence bolt and synthesis continue; bind Astral Loom at 30 points and Crossing 10+.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "elementalMaster",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
},
{
  "id": "magmaLord",
  "name": "Magma Lord",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 190,
  "attackInterval": 1.6,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack blasts the leading cluster within 1 track tile, melts all armor and deals triple damage to priority enemies. Creates one 4-tile molten fissure for 5s, 60 true DPS. Recasting replaces its previous fissure.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "magmaLord",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
},
{
  "id": "tempestArchon",
  "name": "Firestorm Tempest",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 165,
  "attackInterval": 0.7,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Every fourth attack creates one clockwise cyclone for 4s, carrying up to six ordinary runners at 2 tiles/s and burning for 35 true DPS. Bosses take damage but cannot be carried. Each 10 team kills in a battle grant +5% permanent attack speed.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "tempestArchon",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
},
{
  "id": "steamSovereign",
  "name": "Scalding Vapor Sovereign",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 175,
  "attackInterval": 1.2,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack drenches its target then deals a 20% missing-HP scald. Disables temporary sprint boosts track-wide while deployed. Every fifth attack additionally strips 12% current HP from bosses/Harbingers hit.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "steamSovereign",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
},
{
  "id": "quagmireColossus",
  "name": "Quagmire Colossus",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 180,
  "attackInterval": 1.5,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "First attack creates one permanent 4-tile swamp for this battle. Occupants take 45 true DPS and 60% slow. Boss slow resistance and enrage remain active.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "quagmireColossus",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
},
{
  "id": "blizzardArchon",
  "name": "Glacial Typhoon",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 160,
  "attackInterval": 1.3,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Every 5s freezes the track for 2.5s; when its freeze expires, pushes affected survivors back 3 tiles. Boss duration/knockback resistance and enrage immunity apply.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "blizzardArchon",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
},
{
  "id": "sandstormTitan",
  "name": "Sandstorm Titan",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 185,
  "attackInterval": 1.1,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Every second removes 10% base armor from all runners. At zero armor applies one refreshing 40 true DPS Bleed for 4s. Every third attack pierces five leading runners.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. Astral Loom binds at Crossing 10+.",
  "arcaneAsset": "sandstormTitan",
  "evolvedFrom": "elementalApprentice",
  "draftable": false
});

CARDS.push({
  "id": "cyberSolo",
  "name": "Cyber-Operative",
  "genre": "Cyberpunk",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.1,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Two permanent sockets: one Arm, one OS. Every4 attacks earns1 Chrome across battles; cleaves count once. Evolves at25 and65; at120 Chrome and Crossing10+, binds an adjacent Military Cyber-Reactor if both sockets are filled. Base heat20°C; attacks generate8°C (14°C with Berserk), passive cooling4°C/s. At100°C shuts down for3s and purges to40°C.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "cyberSolo"
},
{
  "id": "mantisImplant",
  "name": "Thermal Mantis Blades",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Automatically consumed into an adjacent Operative’s empty Arm socket; oldest eligible instance first. Locked for the run. Leading hit plus two50% cleaves. All hits inflict stacking Plasma Bleed:8 true DPS for4s.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "mantisImplant",
  "cyberModule": "arm"
},
{
  "id": "gorillaImplant",
  "name": "Hydraulic Gorilla Arms",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Automatically consumed into an adjacent Operative’s empty Arm socket; oldest eligible instance first. Locked for the run. Targets the highest current HP runner. Strips40% armor; every fourth attack stuns1s.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "gorillaImplant",
  "cyberModule": "arm"
},
{
  "id": "monowireImplant",
  "name": "Monomolecular Wire",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Automatically consumed into an adjacent Operative’s empty Arm socket; oldest eligible instance first. Locked for the run. Hits up to five runners on the leading target’s aligned4-tile wall; destroys shields and ignores50% defense.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "monowireImplant",
  "cyberModule": "arm"
},
{
  "id": "sandyOS",
  "name": "Sandevistan OS",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Automatically consumed into an adjacent Operative’s empty OS socket; oldest eligible instance first. Locked for the run. Every8 attacks opens a3.5s window:2.5× owner speed and50% track-wide slow. Boss slow resistance applies. Cannot retrigger during an active window.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "sandyOS",
  "cyberModule": "os"
},
{
  "id": "berserkOS",
  "name": "Berserk OS",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Automatically consumed into an adjacent Operative’s empty OS socket; oldest eligible instance first. Locked for the run. At80°C and above, attacks become double true damage and radiate12 true Burn DPS for2s on the target wall. Cooling below80°C ends Overdrive.100°C still shuts down.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "berserkOS",
  "cyberModule": "os"
},
{
  "id": "cyberdeckOS",
  "name": "Combat Cyberdeck",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Automatically consumed into an adjacent Operative’s empty OS socket; oldest eligible instance first. Locked for the run. Earn1 RAM every3 attacks (every2 with adjacent Access Point). Capacity8 (+4 with Access Point). Every3s, spend3 RAM on alternating Short Circuit and Contagion.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "cyberdeckOS",
  "cyberModule": "os"
},
{
  "id": "cryoPump",
  "name": "Cryo-Nitrogen Pump",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Every6s removes40°C from orthogonally adjacent Operatives and freezes its facing4-tile wall for2s. Interior center pumps face north; edge/corner pumps face the nearest outer wall (ties N/E/S/W). Boss resistance applies.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "cryoPump"
},
{
  "id": "biomonitor",
  "name": "Biomonitor Regulator",
  "genre": "Cyberpunk",
  "rarity": "Normal",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Every second equalizes heat between adjacent Operatives, preserving their total temperature. Grants adjacent augmented Operatives +15 percentage points of critical chance. Duplicate critical auras do not stack.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "biomonitor"
},
{
  "id": "accessPoint",
  "name": "Subnet Access Point",
  "genre": "Cyberpunk",
  "rarity": "Normal",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Adjacent Cyberdeck users have12 RAM capacity instead of8 and earn1 RAM per2 attacks instead of3. Duplicate hubs do not stack.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "accessPoint"
},
{
  "id": "cyberReactor",
  "name": "Military Cyber-Reactor",
  "genre": "Cyberpunk",
  "rarity": "Epic",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Draftable from Crossing5. At Crossing10+, consumed by an adjacent120-Chrome Operative with both sockets installed, awakening the matching Mythic. One grid slot per Operative, including Mythics.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "cyberReactor"
});
FORMS.push({
  "id": "chromedSolo",
  "name": "Chromed Operative",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 32,
  "attackInterval": 0.95,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Earned at25 Chrome. Retains installed modules. Four attacks earn1 Chrome. Heat and socket rules remain.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "chromedSolo",
  "evolvedFrom": "cyberSolo",
  "draftable": false
},
{
  "id": "eliteSolo",
  "name": "Elite Cyber-Operative",
  "genre": "Cyberpunk",
  "rarity": "Epic",
  "baseAtk": 70,
  "attackInterval": 0.8,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Earned at65 Chrome. At120 Chrome and Crossing10+, bind an adjacent Military Cyber-Reactor with both sockets filled.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "eliteSolo",
  "evolvedFrom": "cyberSolo",
  "draftable": false
},
{
  "id": "chronoPhantom",
  "name": "Chrono-Scythe Phantom",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 195,
  "attackInterval": 0.25,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Permanent40% track slow replaces Sandevistan windows. Mantis slashes execute ordinary runners below30% HP (35% with carved Witch Eye). Bosses/Harbingers cannot execute.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "chronoPhantom",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "mantisImplant",
  "cyberOS": "sandyOS"
},
{
  "id": "thermalRipper",
  "name": "Thermal Ripper Demon",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 220,
  "attackInterval": 0.45,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Four full-damage true-fire cleaves replace ordinary Mantis cleaves and Berserk doubling. Retains Plasma Bleed. Creates one4-tile slag trail for4s at50 true DPS; recasts refresh/replace, never stack.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "thermalRipper",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "mantisImplant",
  "cyberOS": "berserkOS"
},
{
  "id": "glitchAssassin",
  "name": "Glitch Infiltrator",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 180,
  "attackInterval": 0.4,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Mantis hits inject viral nanites. When an infected bleeding runner dies, infects its wall with Contagion at24 true DPS for4s. Viral death explosions occur once per victim and cannot propagate further death explosions. Retains RAM and regular paid hacks.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "glitchAssassin",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "mantisImplant",
  "cyberOS": "cyberdeckOS"
},
{
  "id": "gravitonColossus",
  "name": "Kinetic Graviton Colossus",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 210,
  "attackInterval": 0.6,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Every4s creates a gravity impact: freezes the target2s and pulls nearby runners within2 track tiles backward up to2 tiles. Replaces Sandevistan windows. Boss resistance/enrage remain.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "gravitonColossus",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "gorillaImplant",
  "cyberOS": "sandyOS"
},
{
  "id": "juggernautSmasher",
  "name": "Apex Juggernaut Smasher",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 240,
  "attackInterval": 0.7,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Punches remove all target armor. Every third punch removes15% current boss/Harbinger HP. Signature replaces Berserk doubling; retains Gorilla targeting and fourth-hit stun.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "juggernautSmasher",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "gorillaImplant",
  "cyberOS": "berserkOS"
},
{
  "id": "empBreaker",
  "name": "EMP Shockwave Breaker",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 190,
  "attackInterval": 0.65,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Punches strike a6-tile perimeter arc, erase shields and cancel temporary sprint boosts. Never resets boss enrage or its timer. Retains Gorilla priority, fourth-hit stun, RAM and paid hacks.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "empBreaker",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "gorillaImplant",
  "cyberOS": "cyberdeckOS"
},
{
  "id": "razorPhantom",
  "name": "Razor Phantom",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 175,
  "attackInterval": 0.35,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Whips up to eight leading runners track-wide with guaranteed criticals (normal critical multipliers apply). Retains shield stripping and50% defense ignore. Replaces Sandevistan windows.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "razorPhantom",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "monowireImplant",
  "cyberOS": "sandyOS"
},
{
  "id": "plasmaTempest",
  "name": "Plasma Whiplash Tempest",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 205,
  "attackInterval": 0.5,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Wire attacks create one4-tile blue-plasma zone for4s:40 true DPS and10% base armor stripped per second. Retains wire pattern; signature replaces Berserk doubling.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "plasmaTempest",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "monowireImplant",
  "cyberOS": "berserkOS"
},
{
  "id": "networkReaper",
  "name": "Network Reaper",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 165,
  "attackInterval": 0.45,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Wire hits generate1 RAM per runner hit instead of attack-count generation. Every1.5s spends3 RAM on Short Circuit. Retains RAM capacity and wire pattern; uploads are never free.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At Crossing10+,120 Chrome plus an adjacent Military Cyber-Reactor unlocks the matching Mythic.",
  "cyberAsset": "networkReaper",
  "evolvedFrom": "cyberSolo",
  "draftable": false,
  "cyberArm": "monowireImplant",
  "cyberOS": "cyberdeckOS"
});
Object.assign(CARDS.find(c=>c.id==='vent'),{cyberAsset:'vent',rules:'Cool adjacent Operatives by15°C/s; duplicate Vents do not stack. Every8s freezes the two leading runners for1s, or2s if burning. Retains team-wide halved Overheat/Burnout shutdown duration. Cooling below80°C interrupts Berserk.'});
// Forbidden Texts: earned forms and relics never enter the draft pool.
const cosmicCard=(id,name,rarity,baseAtk,attackInterval,rules,extra={})=>({id,name,genre:'Lovecraft',rarity,baseAtk,attackInterval,max:0,icon:'◈',sprite:32,fav:'neighbor',tags:['forbidden'],ecosystem:'Forbidden Texts · three scripts, six awakenings',rules,synergy:'Chants advance deployed Idols. The oldest unsealed Idol receives the first two deciphered scripts. Keep pages beside an Archivist and the matching forged Grimoire beside a Herald. Awakening needs130 Syllables, with no Crossing gate.',...extra});
CARDS.push(
 cosmicCard('slumberingIdol','Slumbering Idol','Normal',8,1.4,'Absorbs combat chants and decipher rewards. At25 Syllables the first deciphered script selects a Rare form; at65 the first two scripts select an Epic Herald; at130 bind its adjacent matching Grimoire. Scripts lock permanently.'),
 cosmicCard('blindAstrologer','Blind Astrologer','Normal',10,1.2,'Pierces two runners. Every fourth attack chants4 Syllables and has45% chance to drop a random adjacent page. Every10 combat syllables also yields a themed page. Full-board drops are lost.'),
 cosmicCard('archivist','Mad Archivist','Rare',12,1.5,'Every5s deciphers an adjacent page for12 Syllables and its script effect. The oldest deployed Idol missing a script receives it. Every two pages forge a permanent undraftable Grimoire; recipes persist and wait for an empty slot.'));
const COSMIC_BRANCH_DATA=[
 ['abyss+abyss','rlyehHerald',"Herald of Sunken R’lyeh",50,1.1,'deepGrimoire','Necronomicon of the Deep','cthulhu',"Great Cthulhu, Sleeper of R’lyeh",185,.75,'Floods the facing track wall with40% slow. Every6s reverses the two leading runners for2s.','All runners are slowed35%. Every6s normal and elite runners walk backward for3s, taking150 true DPS. Bosses and Harbingers resist slowing and cannot enter Madness Flight.'],
 ['astral+astral','gateHerald','Herald of the Silver Gate',46,1,'astralGrimoire','Book of Eibon','yogSothoth','Yog-Sothoth, The Gate and the Key',175,.65,'The first forward crossing of Tile8 per runner warps it back3 tiles and deals120 true damage.','The first forward crossing of each of Tiles8 and12 per runner warps it back5 tiles for220 + Team Power true damage. Once per battle, rewind a non-boss runner reaching15.5 to8 and stun2.5s.'],
 ['flesh+flesh','broodHerald','Herald of the Black Brood',54,.95,'fleshGrimoire','Cultes des Goules','shubNiggurath','Shub-Niggurath, Black Goat of the Woods',190,.6,'Copies50% of the highest adjacent base ATK for this battle. Summons a temporary Mind Larva every8s.','At awakening, battle start and every6s, fill empty adjacent slots with Dark Young:75% ATK,0.5s attacks,20% slow and25% armor shred. Each runner death or token consumption grants deployed Cosmic originals +2 permanent ATK once, without a cap; multiple Shubs do not multiply rewards.'],
 ['abyss+astral','yellowHerald','Herald of the Yellow Sign',48,1,'yellowGrimoire','The King in Yellow Folio','kingInYellow','Hastur, The King in Yellow',180,.6,'Attacks brand runners. A fresh allied slow or warp detonates the brand for140 spell damage, with a1s per-runner cooldown.','All runners take35% more damage. Fresh allied slow, stun, freeze or warp detonates the target and two nearby runners for180 +1.5× ATK true damage.1s per-runner cooldown; reactions cannot trigger themselves.'],
 ['abyss+flesh','brainHerald','Herald of the Brain Harvest',52,.9,'brainGrimoire',"Revelations of Gla’aki",'elderBrain','Yuggoth Elder Brain',170,.55,'Infects attacked runners for4s; once per second each infected runner pulses50% ATK damage within2.5 tiles.','Once at awakening permanently absorbs50% of every other deployed Cosmic ally’s ATK. Every5s hijacks the highest-HP runner for4s, halting it and pulsing200% ATK each second within2.5 tiles. Boss halt duration is halved and enraged bosses are immune to halting.'],
 ['astral+flesh','chaosHerald','Herald of the Crawling Chaos',56,.85,'chaosGrimoire','Pnakotic Manuscripts','azathoth','Azathoth, The Daemon Sultan',235,.5,'Prioritizes Elites, Harbingers and Bosses; strips40% armor and deals double damage to them.','Each attack bombards up to six runners with true damage. Every fourth attack additionally strips exactly15% current HP from Bosses and Harbingers and warps them back3 tiles. Boss resistance and enrage remain active.']
];
for(const [script,id,name,atk,interval] of [['abyss','drownedIdol','Idol of the Drowned Dreamer',22,1.3],['astral','keyIdol','Idol of the Shifting Key',20,1.2],['flesh','wombIdol','Idol of the Protoplasmic Womb',24,1.1]])FORMS.push(cosmicCard(id,name,'Rare',atk,interval,script==='abyss'?'Pierces two runners; every sixth attack reverses the target for1.2s.':script==='astral'?'Ignores armor; every fifth attack warps the leading runner back2.5 tiles.':'Adds30% of the highest adjacent base ATK for this battle; attacks apply8 bleed DPS for4s.',{evolvedFrom:'slumberingIdol',draftable:false,cosmicScript:script}));
for(const [pair,id,name,atk,interval,relic,relicName,apex,apexName,apexAtk,apexInterval,rule,apexRule] of COSMIC_BRANCH_DATA){FORMS.push(cosmicCard(id,name,'Epic',atk,interval,rule,{evolvedFrom:'slumberingIdol',draftable:false,cosmicPair:pair}),cosmicCard(relic,relicName,'Epic',0,0,'Forged from '+pair.replace('+',' + ')+' pages. Permanent undraftable relic; consumed by its adjacent matching130-Syllable Herald to awaken '+apexName+'.',{draftable:false,cosmicRelic:true,cosmicPair:pair}),cosmicCard(apex,apexName,'Mythic',apexAtk,apexInterval,apexRule,{evolvedFrom:'slumberingIdol',draftable:false,cosmicPair:pair}));}
for(const [script,id,name,rule] of [['abyss','abyssPage','Sunken Page','Adjacent attacks apply20% slow and +10% spell damage taken for3s. Decipher:12 Syllables and reverse two leading runners for1.5s.'],['astral','astralPage','Star-Chart Page','Adjacent allies gain20% gauge charge and ignore30% armor. Decipher:12 Syllables and warp two leading runners back3 tiles.'],['flesh','fleshPage','Skin-Bound Page','Adjacent allies gain15% speed and apply6 parasite DPS for4s. Decipher:12 Syllables and +3 permanent ATK to the lowest-ATK adjacent original.']])TOKENS.push(cosmicCard(id,name,'Normal',0,0,rule,{token:true,draftable:false,cosmicScript:script}));
TOKENS.push(cosmicCard('mindLarvaToken','Mind Larva Spawn','Normal',11,1,'Temporary larva:20% slow; every fifth attack double damage. Tokens do not chant.',{token:true,draftable:false,evolvedFrom:'larva'}),cosmicCard('darkYoung','Dark Young','Normal',0,.5,'Temporary spawn:75% summoner ATK,20% slow and25% armor shred.',{token:true,draftable:false}));
for(const [id,atk,interval,max,rules] of [
 ['larva',11,1,0,'Strikes and slows20% for3s. Every fifth attack deals double damage and chants3 Syllables. Pages generated by its chants use Flesh script.'],
 ['mass',15,1.4,0,'Copies highest adjacent base ATK at battle start. Uses oldest deployed Idol’s primary script: Abyss35% slow; Astral warp2 every fourth attack; Flesh cleaves three and spawns a temporary Mind Larva on kill.'],
 ['eye',0,0,12,'Fresh crowd control or status applications charge one tick (1s per-runner/type cooldown; no reaction recursion). At12 ticks, vulnerable15%,150 +0.75× Team Power damage and warp4 on two leading runners, plus8 Astral Syllables.4s cast cooldown.'],
 ['herald',25,2.5,0,'Every12s consumes an adjacent token, Shoggoth Mass or Mind Larva for100 stored Madness. Every8s releases stored Madness as true damage to all runners and warps late runners back5. Tokens are prioritized; consumed originals are permanently lost.']])Object.assign(CARDS.find(c=>c.id===id),{baseAtk:atk,attackInterval:interval,max,rules,ecosystem:'Forbidden Texts · three scripts, six awakenings'});

for(const c of [...CARDS,...FORMS,...TOKENS].filter(c=>c.genre==='Lovecraft'&&!['larva','mass','eye','herald'].includes(c.id)))c.cosmicAsset=c.id;
const CARD = Object.fromEntries([...CARDS, ...FORMS, ...TOKENS, ...LEGACY_CARDS].map(c => [c.id, c]));
if (typeof module !== 'undefined') module.exports = { GENRES, LEADERS, CARDS, CARD, NODES, RELICS, RARITIES, FORMS, TOKENS, LEGACY_CARDS };



