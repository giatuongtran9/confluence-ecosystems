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

// --- CURRENT DRAFTABLE CARDS ---
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
  "rules": "Every 4s, grants +1 Qi to all deployed unascended practitioners and +2 Qi to ascended Cultivation Mythics; realm-gated Qi stops at the next locked threshold. An adjacent Cauldron consumes this card to brew one Breakthrough Pill (only while shared storage is below 3); when storage is full, it instead converts the grass into +12 Qi for the deployed practitioner with the most Qi.",
  "synergy": "Qi-Refining Practitioner and Nine-Turn Alchemy Cauldron."
},
  // 3. Nine-Turn Alchemy Cauldron
  {
  "id": "cauldron",
  "name": "Nine-Turn Alchemy Cauldron",
  "vn": "Cửu Chuyển Luyện Đan Lô",
  "genre": "Cultivation",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "asset": "cauldron",
  "sprite": 0,
  "icon": "✧",
  "fav": "neighbor",
  "tags": [
    "alchemy",
    "refiner"
  ],
  "ecosystem": "Cultivation · Dan Dao",
  "rules": "Does not attack. Stores up to 3 shared Breakthrough Pills while any Cauldron remains in the roster; stock persists between battles and pills can be spent only while one is deployed. Starting at 8s and every 8s, consumes adjacent Spirit Grass to brew 1 pill below cap; at cap, converts the Grass to +12 Qi for the deployed Practitioner with the most Qi. Each adjacent Lotus Blossom is independently consumed for +6 Qi/+2 permanent ATK to the eligible Cultivation unit with the least Qi; direct absorption remains +5 Qi/+1 ATK.",
  "synergy": "Spirit Lotus Root, Cloud-Mist Spirit Grass, Qi-Refining Practitioner."
},
  // 4. Qi-Refining Practitioner
  {
  "id": "practitioner",
  "name": "Qi-Refining Practitioner",
  "vn": "Luyện Khí Tu Sĩ",
  "genre": "Cultivation",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "cultivationBase",
  "sprite": 0,
  "icon": "劍",
  "fav": "neighbor",
  "tags": [
    "attacker",
    "scaling"
  ],
  "ecosystem": "Cultivation · Ascension",
  "rules": "Base 12 ATK, 1.5s interval. Gains Qi from Spirit Grass, Lotus Blossoms, and Cauldron brewing, never from normal attacks. Breakthrough Pills advance at 30/85/175 Qi to Foundation (25 ATK, 1.4s), Golden Core (50 ATK, 1.3s), and Nascent Soul (85 ATK, 1.2s); a deployed Cauldron is required to spend pills. Qi stops at 200 until ascension; after Mythic ascension each Qi gained above 175 grants +0.15 uncapped permanent ATK. At 200 Qi with an adjacent eligible relic on an Elite/Boss node, begin Heavenly Tribulation. Every 4s during the trial, the storm stuns the Nascent Soul for 0.5s and deals 25 damage to active enemies. Clear with zero leaks to consume the relic and awaken its Mythic; any leak or failed node removes both cards.",
  "synergy": "Lotus Blossoms, Spirit Grass, Cauldron Pills, and Relics."
},
  // 5. Ancient Flying Sword
  {
    "id": "flyingSword",
    "name": "Ancient Flying Sword",
    "vn": "Phi Kiếm",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "cultivationBase",
    "sprite": 0,
    "icon": "劍",
    "fav": "neighbor",
    "tags": ["relic", "pierce"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Does not attack. Adjacent allied attackers ignore 50% of enemy DEF. When adjacent to a 200-Qi Nascent Soul, starts the Elite/Boss Heavenly Tribulation. A zero-leak clear consumes the Sword and awakens the Sword Immortal; any leak or failed node removes both cards.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 6. Celestial Guqin
  {
    "id": "guqin",
    "name": "Celestial Guqin",
    "vn": "Thiên Cổ Cầm",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "hauntedRelic",
    "sprite": 0,
    "icon": "♫",
    "fav": "neighbor",
    "tags": ["relic", "control"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Does not attack. Slows all enemies by 20%; adjacent allies gain 20% attack speed. When adjacent to a 200-Qi Nascent Soul, starts the Elite/Boss Heavenly Tribulation. A zero-leak clear consumes the Guqin and awakens the Melodic Saint; any leak or failed node removes both cards.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 7. Star-River Weiqi Board
  {
    "id": "weiqiBoard",
    "name": "Star-River Weiqi Board",
    "vn": "Kỳ Bàn",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "altar",
    "sprite": 0,
    "icon": "▨",
    "fav": "neighbor",
    "tags": ["relic", "trap"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Does not attack. Every 8s, warps all enemies back 2 tiles. The first time each enemy steps onto a corner tile, it is stunned for 1s. When adjacent to a 200-Qi Nascent Soul, starts the Elite/Boss Heavenly Tribulation. A zero-leak clear consumes the Board and awakens the Formation Master; any leak or failed node removes both cards.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 8. Dragon-Tail Ink Brush
  {
    "id": "inkBrush",
    "name": "Dragon-Tail Ink Brush",
    "vn": "Thần Bút",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "totem",
    "sprite": 0,
    "icon": "✎",
    "fav": "neighbor",
    "tags": ["relic", "vulnerability"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Does not attack. All enemies take 10% more damage from every source. When adjacent to a 200-Qi Nascent Soul, starts the Elite/Boss Heavenly Tribulation. A zero-leak clear consumes the Brush and awakens the Talisman Sovereign; any leak or failed node removes both cards.",
    "synergy": "Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 9. Mountain-River Scroll
  {
    "id": "mountainScroll",
    "name": "Mountain-River Scroll",
    "vn": "Sơn Hà Đồ",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "lantern",
    "sprite": 0,
    "icon": "▧",
    "fav": "neighbor",
    "tags": ["relic", "banish"],
    "ecosystem": "Cultivation · Relic",
    "rules": "Does not attack. Adjacent allies gain 15% ATK. When adjacent to a 200-Qi Nascent Soul, starts the Elite/Boss Heavenly Tribulation. A zero-leak clear consumes the Scroll and awakens the Landscape Sage; any leak or failed node removes both cards.",
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
    "rules": "Epic relic. Does not attack. Captures 1 soul per team kill, up to 100, for the Soul-Reaping Heavenly Demon and slows all enemies by 20%. The Banner may start the adjacent 200-Qi Nascent Soul’s Elite/Boss Heavenly Tribulation with zero stored souls; collected souls transfer to the Demon when a zero-leak clear awakens it. Any leak or failed node removes both cards.",
    "synergy": "Team kills, Qi-Refining Practitioner (Nascent Soul) and Apex Immortals."
  },
  // 11. Blood-Drinking Demon Blade
  {
    "id": "demonBlade",
    "name": "Blood-Drinking Demon Blade",
    "vn": "Huyết Ma Đao",
    "genre": "Cultivation",
    "rarity": "Epic",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "atlasCaster",
    "sprite": 0,
    "icon": "🗡",
    "fav": "neighbor",
    "tags": ["relic", "demonic", "bleed"],
    "ecosystem": "Cultivation · Demonic Relic",
    "rules": "Does not attack. Adjacent allies gain 10% attack speed; their normal attacks apply one Bleed stack dealing 1% of the target’s max HP over 1s. When adjacent to a 200-Qi Nascent Soul, starts the Elite/Boss Heavenly Tribulation. A zero-leak clear consumes the Blade and awakens the Blood-Fiend Sword Master; any leak or failed node removes both cards.",
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
    "baseAtk": 12,
    "attackInterval": 1.5,
    "max": 0,
    "asset": "hauntedInvestigator",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["attacker", "investigator", "urban-scaling"],
    "ecosystem": "Quái Đàm · Anomaly Log",
    "rules": "Order. Attacks add 1 Citation to the target (max 5 per runner); every new team Citation grants +1 Dread and pushes the Order↔Chaos gauge toward Order. Advances at 25/70/140 Dread. A 140-Dread Rule Enforcer orthogonally adjacent to a Protocol relic on an Elite/Boss node starts the Subject Zero trial. 3+ Citations make a runner Compliant: 25% slower, cannot panic or speed up.",
    "synergy": "Incident Dossiers, Forensic Coroner, and Cursed Containment Relics."
  },
  // 2. Security Monitor (Architecture A Producer)
  {
    "id": "securityCam",
    "name": "Security Monitor",
    "vn": "Camera Giám Sát",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "sensor",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["sensor", "producer", "dossier"],
    "ecosystem": "Quái Đàm · Surveillance",
    "rules": "Order support · does not attack. Every 3rd Citation the team applies opens 1 Case File in the team pool (max 6). Adjacent Investigator: every 2nd Citation instead.",
    "synergy": "Forensic Coroner, Black-Box Cryptographer, and Night Investigator."
  },
  // 3. Emergency Broadcast (Architecture A Producer & Buffer)
  {
    "id": "radioPA",
    "name": "Emergency Broadcast",
    "vn": "Đài Phát Thanh Khẩn Cấp",
    "genre": "Haunted",
    "rarity": "Normal",
    "baseAtk": 0,
    "attackInterval": 0,
    "max": 0,
    "asset": "atlasMachineA",
    "icon": "✧",
    "fav": "team",
    "tags": ["control", "producer", "curfew"],
    "ecosystem": "Quái Đàm · Curfew Radio",
    "rules": "Order support · does not attack. Every 6s, a curfew pulse cites the 2 leading runners and pushes the gauge −10 toward Order. Adjacent Order allies gain +15% attack speed.",
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
    "baseAtk": 16,
    "attackInterval": 1.5,
    "max": 0,
    "asset": "executioner",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["refiner", "forensics"],
    "ecosystem": "Quái Đàm · Forensics",
    "rules": "Order. Every 5s, examines 1 Case File from the team pool: +3 permanent ATK to the lowest-ATK Order ally (an adjacent Order ally is preferred and gets +6), +10 Dread to the lowest-Dread Investigator, and pushes the gauge −20.",
    "synergy": "Security Monitor, Emergency Broadcast, and Night Investigator."
  },
  // 5. Black-Box Cryptographer (Architecture A Processor)
  {
    "id": "decoder",
    "name": "Black-Box Cryptographer",
    "vn": "Chuyên Viên Mật Mã",
    "genre": "Haunted",
    "rarity": "Rare",
    "baseAtk": 15,
    "attackInterval": 1.4,
    "max": 0,
    "asset": "atlasCyberNetrunner",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["refiner", "buffer"],
    "ecosystem": "Quái Đàm · Forensics",
    "rules": "Order. Every 6s, decodes 1 Case File from the team pool: all Order allies gain +25% attack speed and +15% critical chance for 4s (6s with an adjacent Order ally), +8 Dread to the lowest-Dread Investigator, and pushes the gauge −20.",
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
    "ecosystem": "Quái Đàm · Protocol Relic",
    "rules": "Protocol relic. Case Files grant +2 bonus Dread when examined or decoded. When orthogonally adjacent to a 140-Dread Rule Enforcer on an Elite or Boss node, starts the Subject Zero trial; success consumes this relic to promote the Enforcer to The Architect of Taboos. Two adjacent relics: one is picked at random.",
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
    "ecosystem": "Quái Đàm · Protocol Relic",
    "rules": "Protocol relic. Every 4s, cites the 3 fastest runners. When orthogonally adjacent to a 140-Dread Rule Enforcer on an Elite or Boss node, starts the Subject Zero trial; success consumes this relic to promote the Enforcer to The All-Seeing Overseer.",
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
    "asset": "hauntedRelic",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["relic", "urban-relic", "curfew"],
    "ecosystem": "Quái Đàm · Protocol Relic",
    "rules": "Protocol relic. Battle start: Order allies gain +20% attack speed for 10s. Every 4s, cites Subject Zero first, otherwise the leading runner. When orthogonally adjacent to a 140-Dread Rule Enforcer on an Elite or Boss node, starts the Subject Zero trial; success consumes this relic to promote the Enforcer to the Director of Curfew.",
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
    "ecosystem": "Quái Đàm · Protocol Relic",
    "rules": "Protocol relic. Inflicts Bleed on hit and deals 50% more damage to Elites and Harbingers. When orthogonally adjacent to a 140-Dread Rule Enforcer on an Elite or Boss node, starts the Subject Zero trial; success consumes this relic to promote the Enforcer to the Forensic Demiurge.",
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
    "ecosystem": "Quái Đàm · Protocol Relic",
    "rules": "Protocol relic. Every 7s, warps the 2 most-cited runners backward 3 tiles. When orthogonally adjacent to a 140-Dread Rule Enforcer on an Elite or Boss node, starts the Subject Zero trial; success consumes this relic to promote the Enforcer to the Warden of the Backrooms.",
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
    "asset": "hauntedBase",
    "icon": "✧",
    "fav": "team",
    "tags": ["attacker", "urban-lineage", "boss-slayer"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'Do Not Say Ugly / Do Not Flee.' Prioritizes the fastest runner; if target speed > 0.30, inflicts 1 Violation Mark. Attacks against marked targets apply Bleed (5 DPS for 4s). Epic at 15 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Slit-Mouthed Woman lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. It remains Epic until the node is cleared with zero runner leaks. Any leak fails the trial and removes this devourer from the roster.",
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
    "rules": "Rule: 'The last bus only takes rule-breakers.' Reacts only to marked, panicked, fleeing, or unnaturally fast runners; it does not attack ordinary runners. Its attack pierces 2 violators and adds 1 Violation Mark to each survivor, up to 5. Every 8s, sweeps the leading runner's 4-tile edge and warps runners with 2+ marks backward 3 tiles. Epic at 15 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Midnight Bus 44 lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. It remains Epic until the node is cleared with zero runner leaks. Any leak fails the trial and removes this devourer from the roster.",
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
    "asset": "hauntedRelic",
    "icon": "♫",
    "fav": "team",
    "tags": ["control", "urban-lineage", "sonic"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'Answer on the 3rd Ring.' Reacts only to marked, panicked, or fleeing runners; it does not attack ordinary runners. Every 3rd triggered attack rings across all 16 tiles, dealing full damage and slowing violators by 30% for 2s. Rings immediately when Blackout begins. Epic at 15 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Midnight Caller lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. It remains Epic until the node is cleared with zero runner leaks. Any leak fails the trial and removes this devourer from the roster.",
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
    "rules": "Rule: 'Never Stare into the Reflection.' Reacts to marked, panicked, frozen, or retreating runners and those approaching its reflective angle; it ignores ordinary runners. Reflects 25% of adjacent allies' ATK onto the violating runner. When Blackout triggers, summons 1 temporary Mirror Reflection token. Epic at 15 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Morgue Mirror lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. It remains Epic until the node is cleared with zero runner leaks. Any leak fails the trial and removes this devourer from the roster.",
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
    "asset": "hauntedBase",
    "icon": "✧",
    "fav": "team",
    "tags": ["attacker", "urban-lineage"],
    "ecosystem": "Quái Đàm · Autonomous Legend",
    "rules": "Rule: 'It Only Moves When Unseen.' Reacts when a runner breaks taboo by running fast, panicking, fleeing, or carrying a mark, or when an ally is inactive; it ignores ordinary runners. During Blackout (or while any ally is inactive), gains +150% attack speed and +100% critical damage. Epic at 15 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Window Mannequin lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. It remains Epic until the node is cleared with zero runner leaks. Any leak fails the trial and removes this devourer from the roster.",
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
  "asset": "hauntedInvestigator",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "attacker",
    "contagion"
  ],
  "ecosystem": "Quái Đàm · Folklore Contagion",
  "rules": "Attacks infect runners with Folklore Rumors. Each infected runner can spread once by contact to an uninfected runner within 0.45 track tiles. On death it can infect another within 1.5 tiles. Newly infected recipients take 20 true damage. Each real contact spread and infected death grants 0.1 evolution progress to deployed original Urban Legends; ordinary attacks grant none.",
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
    "asset": "hauntedBase",
    "icon": "✧",
    "fav": "team",
    "tags": ["attacker", "urban-lineage", "retribution"],
    "ecosystem": "Quái Đàm · Do Not Look Back",
    "rules": "Rule: 'Do Not Look Back.' Reactive trap · does not attack normally. Slashes runners who turn back, retreat, or get warped/slowed, dealing 18 true damage, applying bleed, and leaving a blood pool. In Blackout, triggers against turning or crowding runners, dealing double shadow damage. Epic at 15 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Red Raincoat Specter lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. It remains Epic until the node is cleared with zero runner leaks. Any leak fails the trial and removes this devourer from the roster.",
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
    "rules": "Rule: 'Never Count the Steps.' Reactive trap · does not attack normally. Lays curse marks on corners and triggers every 13th step, dealing 35 damage, causing stumble, and warping repeat violators. During Blackout, triggers every 4th step, banishing victims into the Penrose Trapdoor. Epic at 15 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent 13th Step lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. It remains Epic until the node is cleared with zero runner leaks. Any leak fails the trial and removes this devourer from the roster.",
    "synergy": "Night Investigator, Slit-Mouthed Woman, and corner track tiles."
  },

  {
    "id": "hound",
    "name": "Crimson Hound",
    "vn": "Xích Huyết Khuyển",
    "genre": "Bloodline",
    "baseAtk": 12,
    "attackInterval": 1.5,
    "sprite": 10,
    "icon": "爪",
    "fav": "center",
    "ecosystem": "Execution · Bloodline fodder",
    "rarity": "Normal",
    "tags": ["predator", "fodder"],
    "rules": "Attacks runners for 100% ATK. Prioritizes runners below 30% HP and deals double damage to them. Eligible prey for the Primordial Blood Cub; its first meal imprints the Slaughter Tiger lineage. Same-species neighbors can breed a temporary Crimson Hound copy (10%/s).",
    "synergy": "Primordial Blood Cub, Crimson Broodkeeper, and other Crimson Hounds."
  },
  
  
  
  {
  "id": "smelter",
  "name": "Junkyard Smelter",
  "genre": "PostApoc",
  "rarity": "Rare",
  "baseAtk": 0,
  "attackInterval": 0,
  "max": 0,
  "icon": "⚙",
  "fav": "neighbor",
  "tags": [
    "mechanical"
  ],
  "ecosystem": "Scrapwork · salvage and forging",
  "rules": "Does not attack. Accepts adjacent scrap one piece at a time into a two-piece intake (stored pieces persist between battles). With a deployed Mech, two stored pieces forge a weapon whenever ready (4s cooldown). Sword+Sword: Colossal Scrap Blade (+50 ATK). Gun+Gun: Twin Flak Battery (+45 ATK). Sword+Gun: Vanguard Gunblade (+48 ATK). Installs on the nearest Mech accepting that weapon type (Mechs accept matching weapons up to 2, or one Blade + one Flak for a Vanguard Juggernaut). If all Mechs are armed, banks up to 2 forged weapons (persisting between battles). Excess forged weapons recycle into +5 Alloy for all deployed Mechs.",
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
    "synergy": "Vector Railgun and Focused Nanites."
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
    "baseAtk": 40,
    "attackInterval": 1.8,
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
    "ecosystem": "Sacrifice · neighborhood growth",
    "rules": "Cannot attack. Whenever an ally is consumed anywhere or an enemy dies while bleeding, grants all orthogonally adjacent original allies +2 permanent ATK.",
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
    "ecosystem": "Critical strikes · defense shred",
    "rules": "Strike the leading runner. Critical hits shred runner defense by 25% for 3s. Every 6 critical hits across battles grant this card +1 permanent ATK.",
    "synergy": "Telemetry Sensor and Singularity Core."
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
    "baseAtk": 85,
    "attackInterval": 1.2,
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
    "baseAtk": 20,
    "attackInterval": 1.4,
    "max": 0,
    "asset": "atlasCreature",
    "tags": [],
    "fav": "team",
    "icon": "✧",
    "ecosystem": "Predation · recycling",
    "rules": "Attacks runners for 100% ATK. Brood Recovery: Whenever any of the 5 Bloodline fodders is consumed anywhere on the board, rolls a 60% chance to spawn a temporary token copy of that same species into an empty slot (prioritizing slots orthogonally adjacent to the Cub). If an original fodder is consumed, rolls an independent 30% chance to recover and re-deploy the original card.",
    "synergy": "Primordial Blood Cub and all five Bloodline fodders."
  },
  {
    "id": "matriarch",
    "name": "Brood Matriarch",
    "vn": "Trùng Quần Mẫu Thể",
    "genre": "Bloodline",
    "rarity": "Epic",
    "baseAtk": 45,
    "attackInterval": 1.3,
    "max": 0,
    "asset": "atlasCaster",
    "tags": [],
    "fav": "team",
    "icon": "✧",
    "ecosystem": "Predation · swarm haste",
    "rules": "3-Target Strike: Hits up to 3 leading runners for 70% ATK each. Matriarch's Haste: Passively grants adjacent allies +35% attack speed. Prey Mark: Her attacks mark targets for 3s (+20% damage taken from all Bloodline attacks) and apply 1 Bleed stack (1% enemy max HP/s for 1s).",
    "synergy": "Primordial Blood Cub, all five Bloodline fodders, and Bleed support."
  },
{
  "id": "cub",
  "name": "Primordial Blood Cub",
  "vn": "Thái Cổ Ấu Thú",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "neighbor",
  "tags": [
    "attacker",
    "predator"
  ],
  "ecosystem": "Bloodline · first-meal destiny",
  "rules": "Attacks runners for 100% ATK and devours orthogonally adjacent Bloodline prey at combat opening and every 6s. Its first meal permanently locks one lineage. Every meal grants permanent ATK: +4 for matching prey, +3 for off-lineage prey. Matching meals alone add evolution stacks (evolves at 2, 4, 6 matching stacks). At 6 matching meals it reaches Tier 3; an adjacent matching ancestral relic starts an Elite/Boss Ancestral Ascension trial.",
  "synergy": "Five Bloodline prey, their attacking offspring, and matching ancestral relics."
},
{
  "id": "serpentFodder",
  "name": "Horned Serpent",
  "vn": "Giao Xà",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "atlasCreature",
  "icon": "🐉",
  "fav": "neighbor",
  "tags": [
    "fodder",
    "attacker"
  ],
  "ecosystem": "Bloodline · Azure Dragon prey",
  "rules": "Attacks runners for 100% ATK. Eligible prey for the Primordial Blood Cub; its first meal imprints the Azure Dragon lineage. Same-species neighbors roll once per second for a 10% chance to spawn a temporary Horned Serpent copy into an empty orthogonal slot.",
  "synergy": "Primordial Blood Cub and other Horned Serpents."
},
{
  "id": "scuttler",
  "name": "Iron-Shelled Scuttler",
  "vn": "Thiết Giáp Miêu",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 12,
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
  "rules": "Attacks runners for 100% ATK. Eligible prey for the Primordial Blood Cub; its first meal imprints the Xuanwu lineage. Same-species neighbors can breed a temporary Iron-Shelled Scuttler copy (10%/s).",
  "synergy": "Primordial Blood Cub and other Iron-Shelled Scuttlers."
},
{
  "id": "flameToad",
  "name": "Flame Toad",
  "vn": "Hỏa Diệm Thiềm Thừ",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "atlasMachineB",
  "icon": "🐸",
  "fav": "neighbor",
  "tags": [
    "fodder",
    "attacker"
  ],
  "ecosystem": "Bloodline · Vermilion Phoenix prey",
  "rules": "Attacks runners for 100% ATK. Eligible prey for the Primordial Blood Cub; its first meal imprints the Vermilion Phoenix lineage. Same-species neighbors can breed a temporary Flame Toad copy (10%/s).",
  "synergy": "Primordial Blood Cub and other Flame Toads."
},
{
  "id": "peachFodder",
  "name": "Spirit Peach Fodder",
  "vn": "Linh Đào",
  "genre": "Bloodline",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "lotus",
  "icon": "🍑",
  "fav": "neighbor",
  "tags": [
    "fodder",
    "attacker"
  ],
  "ecosystem": "Bloodline · Divine Monkey prey",
  "rules": "Attacks runners for 100% ATK. Eligible prey for the Primordial Blood Cub; its first meal imprints the Stone Simian lineage. Same-species neighbors can breed a temporary Spirit Peach copy (10%/s).",
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
  "rules": "Cannot attack. Ancestral Relic: Passively grants orthogonally adjacent allies +20% ATK. When adjacent to the matching Tier 3 Dragon, starts an Elite/Boss Ancestral Ascension trial (consumed on zero-leak clear).",
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
  "rules": "Cannot attack. Ancestral Relic: Passively grants orthogonally adjacent allies +20% crit chance, and their normal attacks apply 1 Bleed stack (1% enemy max HP for 1s). When adjacent to the matching Tier 3 Tiger, starts an Ancestral Ascension trial.",
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
  "rules": "Cannot attack. Ancestral Relic: Passively grants orthogonally adjacent allies the ability to apply slow (20% for 2s) and 1 Poison stack (1% enemy max HP for 1s) on normal attack. When adjacent to matching Tier 3 Xuanwu, starts an Ancestral Ascension trial.",
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
  "rules": "Cannot attack. Ancestral Relic: Passively grants orthogonally adjacent allies the ability to apply 1 Burn stack (1% enemy max HP for 1s) on normal attack, and their normal attack targets 1 additional runner. When adjacent to Tier 3 Phoenix, starts an Ancestral Ascension trial.",
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
  "rules": "Cannot attack. Ancestral Relic: Passively grants orthogonally adjacent allies +30% attack speed. When adjacent to matching Tier 3 Simian, starts an Ancestral Ascension trial.",
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
    "attackInterval": 1.4,
    "max": 0,
    "asset": "hauntedInvestigator",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["investigator", "urban-realm", "pierce"],
    "evolvedFrom": "investigator",
    "rules": "Occult rank · 25 Dread. Attacks pierce the 2 leading runners and add 1 Citation on hit. Records +1 Dread per team Citation. Advances to Anomaly Specialist at 70 Dread.",
    "synergy": "All Urban Legends and Rule Violations."
  },
  {
    "id": "anomalySpecialist",
    "name": "Anomaly Specialist",
    "vn": "Chuyên Viên Dị Tượng",
    "genre": "Haunted",
    "rarity": "Epic",
    "baseAtk": 48,
    "attackInterval": 1.3,
    "max": 0,
    "asset": "hauntedInvestigator",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["investigator", "urban-realm", "aoe"],
    "evolvedFrom": "investigator",
    "rules": "Anomaly rank · 70 Dread. Attacks cite the target, then hit 3 cited runners for double damage. Records +1 Dread per team Citation. Advances to Rule Enforcer at 140 Dread.",
    "synergy": "All Urban Legends and Rule Violations."
  },
  {
    "id": "ruleEnforcer",
    "name": "Rule Enforcer",
    "vn": "Chấp Pháp Quy Tắc",
    "genre": "Haunted",
    "rarity": "Legendary",
    "baseAtk": 90,
    "attackInterval": 1.2,
    "max": 0,
    "asset": "hauntedInvestigator",
    "icon": "✧",
    "fav": "neighbor",
    "tags": ["investigator", "urban-realm", "true-damage"],
    "evolvedFrom": "investigator",
    "rules": "Enforcer rank · 140 Dread. Attacks the 3 highest-HP runners for full true damage and cites them. Promotion: on an Elite or Boss node, an orthogonally adjacent Protocol relic summons Subject Zero at wave start; give it 5 Citations, kill it, and clear with zero leaks to consume that relic and become its Mythic. With two adjacent relics, one is picked at random.",
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
  "baseAtk": 150,
  "attackInterval": 0.9,
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
  "rules": "Order Mythic · Rule 0. Runners spawn with 1 Citation. Attacks hit the 4 leading runners for true damage, 1.75× against cited runners, and cite them. Once per battle, traps a leaking runner in Room 404. Every 10th attack channels 1.2s: Rule Zero Decree — +2 Citations on every runner, then 150% ATK true damage to each; pushes the gauge −40.",
  "synergy": "Cursed Noticeboard and Rule Resonance."
},
  // 2. Panopticon Monitor -> The All-Seeing Overseer
  {
    "id": "allSeeingOverseer",
    "name": "The All-Seeing Overseer",
    "vn": "Kẻ Giám Sát Vô Hình",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 130,
    "attackInterval": 0.8,
    "max": 0,
    "asset": "sensor",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "panopticon"],
    "evolvedFrom": "investigator",
    "rules": "Order Mythic · No Blind Spots. Attacks hit every runner on all 16 tiles for 40% ATK; speeding or enraged runners take full damage, lose their boosts and are frozen for 2s. Every 10th attack channels 1.2s: Panopticon Lockdown — freezes all runners for 1.5s and deals 120% ATK to each.",
    "synergy": "Panopticon Monitor and Rule Resonance."
  },
  // 3. Red Hotline -> Director of Curfew
  {
    "id": "curfewDirector",
    "name": "Director of Curfew",
    "vn": "Cục Trưởng Khống Chế",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 140,
    "attackInterval": 0.9,
    "max": 0,
    "asset": "hauntedRelic",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "curfew-master"],
    "evolvedFrom": "investigator",
    "rules": "Order Mythic · Indefinite Curfew. Order allies gain +30% attack speed and Lights On lasts +3s. Attacks deal double damage to cited runners and cite the target. Every 10th attack channels 1.2s: Curfew Lockdown — locks the 3 most-cited runners for 2s (1–2 Citations), 3s (3–4) or 4s (5).",
    "synergy": "Red Hotline and Rule Resonance."
  },
  // 4. Coroner's Bone Saw -> Forensic Demiurge
  {
    "id": "forensicDemiurge",
    "name": "Forensic Demiurge",
    "vn": "Thần Pháp Y Tử Thi",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 160,
    "attackInterval": 0.8,
    "max": 0,
    "asset": "executioner",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "dissection"],
    "evolvedFrom": "investigator",
    "rules": "Order Mythic · Living Autopsy. Hits on cited runners apply necrosis: 30% ATK true damage per second for 4s (a new hit refreshes it). Every 10th attack channels 1.2s: Living Autopsy — strips 15% current HP from every Elite, Champion and Boss, and deals 300% ATK true damage to every cited runner.",
    "synergy": "Coroner's Bone Saw and Rule Resonance."
  },
  // 5. Liminal Keycard -> Warden of the Backrooms
  {
    "id": "backroomsWarden",
    "name": "Warden of the Backrooms",
    "vn": "Chủ Nhân Tầng Âm",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 140,
    "attackInterval": 0.9,
    "max": 0,
    "asset": "totem",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "liminal-space"],
    "evolvedFrom": "investigator",
    "rules": "Order Mythic · The Floor Does Not Exist. Attacks pierce the 3 leading runners and cite them. Every 10th attack channels 1.2s: No Floor — banishes the 3 leading runners, dealing 100% ATK per second for 4s, and drops them 6 tiles backward.",
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
    "rules": "Cleaves 2 runners. Attacks against bleeding or marked runners deal triple critical damage. Remains Epic after 45 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Slit-Mouthed Woman lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. Mythic evolution requires clearing the node with zero runner leaks; any leak fails and removes this devourer from the roster.",
    "synergy": "Bleed, Violations, and Slit-Mouthed Sovereign."
  },
  {
  "id": "slitMouthedSovereign",
  "name": "Slit-Mouthed Sovereign",
  "vn": "Khẩu Liệt Chi Chủ",
  "genre": "Haunted",
  "rarity": "Mythic",
  "baseAtk": 170,
  "attackInterval": 0.8,
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
  "rules": "Pierces 3 violators and pulls marked runners toward the leading runner. Remains Epic after 45 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Midnight Bus 44 lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. Mythic evolution requires clearing the node with zero runner leaks; any leak fails and removes this devourer from the roster.",
  "synergy": "Crowded tracks and Terminus Bus 44."
},
  {
    "id": "terminusBus",
    "name": "Terminus Bus 44",
    "vn": "Chuyến Xe Đêm 44 — Bến Cuối",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 150,
    "attackInterval": 0.9,
    "max": 0,
    "asset": "atlasMachineC",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "abduction"],
    "evolvedFrom": "nightBus",
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
    "asset": "hauntedRelic",
    "icon": "♫",
    "fav": "team",
    "tags": ["urban-form", "sonic", "stun"],
    "evolvedFrom": "payphone",
    "rules": "Every third attack rings across all tiles, deals 1.5× damage, and stuns violators. Remains Epic after 45 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Midnight Caller lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. Mythic evolution requires clearing the node with zero runner leaks; any leak fails and removes this devourer from the roster.",
    "synergy": "Blackout triggers and The Midnight Operator."
  },
  {
    "id": "midnightOperator",
    "name": "The Midnight Operator",
    "vn": "Tổng Đài Viên Cõi Âm",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 140,
    "attackInterval": 0.85,
    "max": 0,
    "asset": "hauntedRelic",
    "icon": "♫",
    "fav": "team",
    "tags": ["apex", "urban-apex", "infinite-redial"],
    "evolvedFrom": "payphone",
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
    "rules": "Reflects 50% of adjacent allies' ATK and summons two temporary reflections during Blackout. Remains Epic after 45 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Morgue Mirror lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. Mythic evolution requires clearing the node with zero runner leaks; any leak fails and removes this devourer from the roster.",
    "synergy": "High-ATK neighbors and Queen in the Morgue Mirror."
  },
  {
    "id": "mirrorQueen",
    "name": "Queen in the Morgue Mirror",
    "vn": "Nữ Hoàng Trong Gương",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 150,
    "attackInterval": 0.9,
    "max": 0,
    "asset": "lantern",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "mirror-realm"],
    "evolvedFrom": "morgueMirror",
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
    "asset": "hauntedBase",
    "icon": "✧",
    "fav": "team",
    "tags": ["urban-form", "berserk"],
    "evolvedFrom": "mannequin",
    "rules": "Punishes taboo-breakers with increased attack speed and critical damage during Blackout or when an ally is inactive. Remains Epic after 45 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Window Mannequin lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. Mythic evolution requires clearing the node with zero runner leaks; any leak fails and removes this devourer from the roster.",
    "synergy": "Blackout triggers and The Living Taboo."
  },
  {
  "id": "livingTaboo",
  "name": "The Living Taboo",
  "vn": "Cấm Kỵ Sống",
  "genre": "Haunted",
  "rarity": "Mythic",
  "baseAtk": 160,
  "attackInterval": 0.8,
  "max": 0,
  "asset": "hauntedBase",
  "icon": "✧",
  "fav": "team",
  "tags": [
    "apex",
    "urban-apex",
    "berserk"
  ],
  "evolvedFrom": "mannequin",
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
    "asset": "hauntedBase",
    "icon": "✧",
    "fav": "team",
    "tags": ["urban-form", "bleed", "retribution"],
    "evolvedFrom": "redRaincoat",
    "rules": "Reactive blood-pool trap: slashes runners who retreat, turn back, warp, or are slowed. Remains Epic after 45 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent Red Raincoat Specter lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. Mythic evolution requires clearing the node with zero runner leaks; any leak fails and removes this devourer from the roster.",
    "synergy": "Bleed, Retribution, and Harbinger of the Crimson Rain."
  },
  {
    "id": "crimsonHarbinger",
    "name": "Harbinger of the Crimson Rain",
    "vn": "Huyết Vũ Sứ Giả",
    "genre": "Haunted",
    "rarity": "Mythic",
    "baseAtk": 160,
    "attackInterval": 0.85,
    "max": 0,
    "asset": "hauntedBase",
    "icon": "✧",
    "fav": "team",
    "tags": ["apex", "urban-apex", "crimson-deluge"],
    "evolvedFrom": "redRaincoat",
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
    "rules": "Every 4 steps during Blackout, banishes repeat violators into its trapdoor. Remains Epic after 45 Violations. At 80 Violations, an Elite/Boss Folklore Merger trial begins if an adjacent 13th Step lineage Legend has 45+ Violations. That prey is permanently consumed at trial start; this Legend inherits 20% of its current ATK. Mythic evolution requires clearing the node with zero runner leaks; any leak fails and removes this devourer from the roster.",
    "synergy": "Traps, Vertigo, and The Penrose Labyrinth."
  },
  {
  "id": "penroseLabyrinth",
  "name": "The Penrose Labyrinth",
  "vn": "Mê Cung Penrose",
  "genre": "Haunted",
  "rarity": "Mythic",
  "baseAtk": 150,
  "attackInterval": 0.9,
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
  "rules": "'The Endless Drop.' Corner and step traps inflict severe Vertigo and warp violators back 4 tiles. During Blackout, every 4th step triggers Penrose Trapdoor: victims vanish for 2.0s taking continuous crushing void damage; panicked or fleeing victims suffer Terminal Descent execution. Triggers Rule Resonance when adjacent to another Urban Legend. Executions and direct trapdoor position resets exclude bosses and Harbingers.",
  "synergy": "Warps, Panicked runners, and Rule Resonance."
},

  // Earned realm forms for the Qi-Refining Practitioner lineage
  {
  "id": "cultivationFoundation",
  "name": "Foundation Practitioner",
  "vn": "Trúc Cơ Tu Giả",
  "genre": "Cultivation",
  "baseAtk": 25,
  "attackInterval": 1.4,
  "rarity": "Rare",
  "asset": "cultivationBase",
  "icon": "築",
  "fav": "neighbor",
  "tags": [
    "cultivation-realm",
    "attacker",
    "scaling"
  ],
  "evolvedFrom": "practitioner",
  "rules": "Foundation realm · 30 Qi. Base 25 ATK, 1.4s interval. Attacks pierce the two leading runners. Directly absorbs adjacent Lotus Blossoms for +5 Qi/+1 permanent ATK; a Cauldron brews them for +6 Qi/+2 ATK. Qi stops at 85 until a stored Breakthrough Pill is spent by a deployed Cauldron, advancing to Golden Core. Normal attacks grant no Qi.",
  "synergy": "Spirit Lotus Blossoms, Spirit Grass, and Cauldron Pills."
},
  {
  "id": "cultivationGoldenCore",
  "name": "Golden Core Daoist",
  "vn": "Kim Đan Chân Nhân",
  "genre": "Cultivation",
  "baseAtk": 50,
  "attackInterval": 1.3,
  "rarity": "Epic",
  "asset": "cultivationBase",
  "icon": "丹",
  "fav": "neighbor",
  "tags": [
    "cultivation-realm",
    "attacker",
    "scaling"
  ],
  "evolvedFrom": "practitioner",
  "rules": "Golden Core realm · 85 Qi. Base 50 ATK, 1.3s interval. Attacks the target and deal 50% splash damage nearby. Directly absorbs adjacent Lotus Blossoms for +5 Qi/+1 permanent ATK; a Cauldron brews them for +6 Qi/+2 ATK. Qi stops at 175 until a stored Breakthrough Pill is spent by a deployed Cauldron. Normal attacks grant no Qi.",
  "synergy": "Spirit Lotus Blossoms, Spirit Grass, Cauldron Pills, and Cultivation Relics."
},
  {
  "id": "cultivationNascentSoul",
  "name": "Nascent Soul Sovereign",
  "vn": "Nguyên Anh Lão Tổ",
  "genre": "Cultivation",
  "baseAtk": 85,
  "attackInterval": 1.2,
  "rarity": "Legendary",
  "asset": "cultivationBase",
  "icon": "魂",
  "fav": "neighbor",
  "tags": [
    "cultivation-realm",
    "attacker",
    "scaling"
  ],
  "evolvedFrom": "practitioner",
  "rules": "Nascent Soul realm · 175 Qi. Base 85 ATK, 1.2s interval. Attacks the three highest-HP runners. Directly absorbs adjacent Lotus Blossoms for +5 Qi/+1 permanent ATK; a Cauldron brews them for +6 Qi/+2 ATK. Qi stops at 200 until ascension; after Mythic ascension each Qi gained above 175 grants +0.15 uncapped permanent ATK. At 200 Qi, an adjacent eligible relic starts the Elite/Boss Heavenly Tribulation; clear with zero leaks. Normal attacks grant no Qi.",
  "synergy": "Cultivation Relics and the full Practitioner lineage."
},
  // 1. Sword Immortal
  {
    "id": "swordImmortal",
    "name": "Sword Immortal",
    "vn": "Kiếm Tiên",
    "genre": "Cultivation",
    "baseAtk": 150,
    "attackInterval": 1.0,
    "rarity": "Mythic",
    "asset": "immortal",
    "sprite": 0,
    "icon": "劍",
    "fav": "team",
    "tags": ["apex", "pierce", "boss-slayer"],
    "evolvedFrom": "practitioner",
    "rules": "Devours adjacent Lotus Blossoms for +15 Qi; every 30 Qi gained after ascension grants +2 permanent ATK. Attacks pierce 50% DEF and hit the target plus up to 3 enemies behind (100%→70% damage). Every 10th attack, channels for 1.2s to release a Ten-Thousand Sword Torrent dealing 100% ATK to all tiles and dropping a Colossal Sword onto the highest-threat enemy for 100% ATK + 10% enemy current HP. Triggers Relic Resonance when adjacent to another Cultivation relic (+20% Mythic damage).",
    "synergy": "Ancient Flying Sword, Relic Resonance."
  },
  // 2. Melodic Saint
  {
    "id": "melodicSaint",
    "name": "Melodic Saint",
    "vn": "Cầm Tiên",
    "genre": "Cultivation",
    "baseAtk": 110,
    "attackInterval": 1.0,
    "rarity": "Mythic",
    "asset": "hauntedRelic",
    "sprite": 0,
    "icon": "♫",
    "fav": "team",
    "tags": ["apex", "control", "detonate"],
    "evolvedFrom": "practitioner",
    "rules": "Base 110 ATK. Attacks alternate between Harmony Chord (+50% attack speed to all allies for 2s) and Dissonance Chord (deals 50% ATK damage and applies 45% slow to all enemies for 2s). Every 10th attack, channels for 1.2s to release Celestial Resonance dealing 200% ATK to all enemies and stunning them for 1.5s. Gains +2 permanent ATK per 30 post-ascension Qi.",
    "synergy": "Celestial Guqin, Relic Resonance."
  },
  // 3. Formation Master
  {
    "id": "formationMaster",
    "name": "Formation Master",
    "vn": "Kỳ Tiên",
    "genre": "Cultivation",
    "baseAtk": 110,
    "attackInterval": 0.8,
    "rarity": "Mythic",
    "asset": "altar",
    "sprite": 0,
    "icon": "▨",
    "fav": "team",
    "tags": ["apex", "trap", "stasis"],
    "evolvedFrom": "practitioner",
    "rules": "Devours adjacent Lotus Blossoms for +15 Qi; every 30 Qi gained after ascension grants +2 permanent ATK. Attacks alternate between Black Stone (deals 120% ATK) and White Stone (deals 80% ATK and slows target 30% for 2s). Every 10th attack, channels for 1.2s to activate Star-River Weiqi Board: warps all enemies backward 2 tiles and deals 150% ATK (300% on corner tiles 0, 4, 8, 12). Triggers Relic Resonance when adjacent to another Cultivation relic (+20% Mythic damage).",
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
  "rules": "Devours adjacent Lotus Blossoms for +15 Qi; every 30 Qi gained after ascension grants +2 permanent ATK. Attacks deal 100% ATK, apply +50% Vulnerable for 3s, and execute non-boss/non-champion runners below 10% HP. Every 10th attack, channels for 1.2s to inscribe Imperial Ink Decree: deals 250% ATK board-wide, executes non-bosses below 15% HP, and applies +50% Vulnerable for 3s to survivors. Triggers Relic Resonance when adjacent to another Cultivation relic (+20% Mythic damage).",
    "synergy": "Dragon-Tail Ink Brush, Relic Resonance."
},
  // 5. Landscape Sage
  {
    "id": "landscapeSage",
    "name": "Landscape Sage",
    "vn": "Họa Tiên",
    "genre": "Cultivation",
    "baseAtk": 110,
    "attackInterval": 0.8,
    "rarity": "Mythic",
    "asset": "lantern",
    "sprite": 0,
    "icon": "▧",
    "fav": "team",
    "tags": ["apex", "banish"],
    "evolvedFrom": "practitioner",
    "rules": "Base 110 ATK. Attacks deal 100% ATK and leave an ink puddle on the track slowing passing runners 25% for 2s. Every 10th attack, channels for 1.2s to summon Mountain-River Ink Dragon: sweeps counter-clockwise across the perimeter dealing 200% ATK, stuns all runners for 2s, and warps Boss/Elite/Champion runners backward 3 tiles. Gains +2 permanent ATK per 30 post-ascension Qi.",
    "synergy": "Mountain-River Scroll, Relic Resonance."
  },
  // 6. Soul-Reaping Heavenly Demon
  {
    "id": "soulReapingDemon",
    "name": "Soul-Reaping Heavenly Demon",
    "vn": "Vạn Hồn Ma Tôn",
    "genre": "Cultivation",
    "baseAtk": 140,
    "attackInterval": 1.0,
    "rarity": "Mythic",
    "asset": "totem",
    "sprite": 0,
    "icon": "☠",
    "fav": "team",
    "tags": ["apex", "demonic", "chain"],
    "evolvedFrom": "practitioner",
    "rules": "Devours adjacent Lotus Blossoms for +15 Qi; every 30 Qi gained after ascension grants +2 permanent ATK. Attacks fire a volley hitting up to 5 targets for 50% ATK each. Every enemy death adds +1 permanent Soul to the banner. Every 10th attack, channels for 1.2s to detonate Ten-Thousand Soul Banner: deals (150% + floor(Souls / 2)%) ATK to all enemies. Triggers Relic Resonance when adjacent to another Cultivation relic (+20% Mythic damage).",
    "synergy": "Ten-Thousand Soul Banner, Relic Resonance."
  },
  // 7. Blood-Fiend Sword Master
  {
    "id": "bloodFiendMaster",
    "name": "Blood-Fiend Sword Master",
    "vn": "Huyết Kiếm Ma Tu",
    "genre": "Cultivation",
    "baseAtk": 150,
    "attackInterval": 1.0,
    "rarity": "Mythic",
    "asset": "atlasCaster",
    "sprite": 0,
    "icon": "🗡",
    "fav": "team",
    "tags": ["apex", "demonic", "cleave"],
    "evolvedFrom": "practitioner",
    "rules": "Base 150 ATK. Attacks deal 100% ATK and apply 1 bleed stack (1% target max HP/sec for 3s). Every 10th attack, channels for 1.2s to trigger Boiling Blood Domain: deals 150% ATK to all enemies, detonates existing bleed stacks for instant true damage, and applies 20 bleed stacks (1% max HP/sec for 20s). Gains +2 permanent ATK per 30 post-ascension Qi.",
    "synergy": "Blood-Drinking Demon Blade, Relic Resonance."
  },
  // 4 Other Earned Forms
{
  "id": "dragonCubT1",
  "name": "Horned Drake Cub",
  "vn": "Horned Drake Cub",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 25,
  "attackInterval": 1.4,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-dragon"
  ],
  "evolvedFrom": "cub",
  "lineage": "dragon",
  "lineageTier": 1,
  "rules": "Normal attack targets 2 enemies dealing 80% ATK damage each.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "dragonCubT2",
  "name": "Storm Dragon Noble",
  "vn": "Storm Dragon Noble",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 48,
  "attackInterval": 1.3,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-dragon"
  ],
  "evolvedFrom": "cub",
  "lineage": "dragon",
  "lineageTier": 2,
  "rules": "Normal attack targets 2 enemies dealing 90% ATK damage each.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "dragonCubT3",
  "name": "Nine-Cloud Sky Dragon",
  "vn": "Nine-Cloud Sky Dragon",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 85,
  "attackInterval": 1.2,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-dragon"
  ],
  "evolvedFrom": "cub",
  "lineage": "dragon",
  "lineageTier": 3,
  "rules": "Normal attack targets 3 enemies dealing 100% ATK damage each.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "dragonCubApex",
  "name": "Primordial Azure Dragon",
  "vn": "Primordial Azure Dragon",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 150,
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
  "lineage": "dragon",
  "lineageTier": 4,
  "rules": "Normal attack targets 4 enemies dealing 100% ATK damage each. Every 10th attack, channels for 1.2s to release Primordial Wrath: targets all active enemies dealing 200% ATK damage and stuns them for 1s.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubT1",
  "name": "Fanged Tiger Cub",
  "vn": "Fanged Tiger Cub",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 24,
  "attackInterval": 1.3,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-tiger"
  ],
  "evolvedFrom": "cub",
  "lineage": "tiger",
  "lineageTier": 1,
  "rules": "Normal attack deals 100% ATK damage. Passively gains +15% extra crit chance (base 25%).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubT2",
  "name": "Blood-Stripe Saber",
  "vn": "Blood-Stripe Saber",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 45,
  "attackInterval": 1.2,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-tiger"
  ],
  "evolvedFrom": "cub",
  "lineage": "tiger",
  "lineageTier": 2,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Bleed stack (1% enemy max HP for 1s). Inherits +15% extra crit chance (base 25%).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubT3",
  "name": "Slaughter War Tiger",
  "vn": "Slaughter War Tiger",
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
    "lineage-tiger"
  ],
  "evolvedFrom": "cub",
  "lineage": "tiger",
  "lineageTier": 3,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Bleed stack (1% enemy max HP for 1s). Gains +25% extra crit chance (base is now 50%).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "tigerCubApex",
  "name": "White Tiger God of Slaughter",
  "vn": "White Tiger God of Slaughter",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 130,
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
  "lineage": "tiger",
  "lineageTier": 4,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Bleed stack (1% enemy max HP for 1s). Gains +25% extra crit chance (base is now 75%). Every 10th attack, channels for 1.2s to roar and inflict Terror board-wide: all enemies run backward for 3s, then are slowed by 45% for 3s.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubT1",
  "name": "Xuanwu Hatchling",
  "vn": "Xuanwu Hatchling",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 20,
  "attackInterval": 1.5,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-xuanwu"
  ],
  "evolvedFrom": "cub",
  "lineage": "xuanwu",
  "lineageTier": 1,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Poison stack (1% enemy max HP for 1s).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubT2",
  "name": "Mountain-Back Behemoth",
  "vn": "Mountain-Back Behemoth",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 45,
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
  "lineage": "xuanwu",
  "lineageTier": 2,
  "rules": "Normal attack deals 100% ATK damage to 2 enemies and applies 1 Poison stack (1% enemy max HP for 1s).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubT3",
  "name": "Abyssal Twin Sovereigns",
  "vn": "Abyssal Twin Sovereigns",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 90,
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
  "lineage": "xuanwu",
  "lineageTier": 3,
  "rules": "Normal attack deals 100% ATK damage to 3 enemies and applies 1 Poison stack (1% enemy max HP for 1s).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "xuanwuCubApex",
  "name": "Xuanwu Divine Heaven-Bearer",
  "vn": "Xuanwu Divine Heaven-Bearer",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 150,
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
  "lineage": "xuanwu",
  "lineageTier": 4,
  "rules": "Normal attack deals 100% ATK damage to 3 enemies and applies 1 Poison stack (1% enemy max HP for 1s). Every 10th attack, channels for 1.2s to release a toxic pool onto the track quadrant (0-4, 4-8, 8-12, 12-16) with the highest enemy density for 5s: enemies on the toxin take 1 Poison stack every second and are slowed by 30%.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubT1",
  "name": "Fire-Fledged Chick",
  "vn": "Fire-Fledged Chick",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 22,
  "attackInterval": 1.4,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "lineage": "phoenix",
  "lineageTier": 1,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Burn stack (1% enemy max HP for 1s).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubT2",
  "name": "Blazing Sun Crane",
  "vn": "Blazing Sun Crane",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 46,
  "attackInterval": 1.3,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "lineage": "phoenix",
  "lineageTier": 2,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Burn stack (1% enemy max HP for 1s), spreading 1 Burn stack to 1 runner behind.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubT3",
  "name": "Nirvana Flame Bird",
  "vn": "Nirvana Flame Bird",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 86,
  "attackInterval": 1.2,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "lineage": "phoenix",
  "lineageTier": 3,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Burn stack (1% enemy max HP for 1s), spreading 1 Burn stack to 2 runners behind. If a burning runner dies, all its Burn stacks spread to the runner behind.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "phoenixCubApex",
  "name": "Immortal Vermilion Phoenix",
  "vn": "Immortal Vermilion Phoenix",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 130,
  "attackInterval": 1.0,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-phoenix"
  ],
  "evolvedFrom": "cub",
  "lineage": "phoenix",
  "lineageTier": 4,
  "rules": "Normal attack deals 100% ATK damage and applies 1 Burn stack (1% enemy max HP for 1s), spreading 1 Burn stack to 3 runners behind. Burning deaths spread stacks behind. Every 10th attack, channels for 1.2s to release Rebirth Inferno: all 16 tiles burn for 5s, and runners on them take 1 Burn stack every second. Once per run, if player health drops to 0, revives with 15 HP.",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubT1",
  "name": "Stone Simian Cub",
  "vn": "Stone Simian Cub",
  "genre": "Bloodline",
  "rarity": "Rare",
  "baseAtk": 29,
  "attackInterval": 1.4,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "lineage": "monkey",
  "lineageTier": 1,
  "rules": "Normal attack deals 100% ATK damage. Passively gains +15% ATK (base 25 → 29 ATK).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubT2",
  "name": "Four-Eared Macaque",
  "vn": "Four-Eared Macaque",
  "genre": "Bloodline",
  "rarity": "Epic",
  "baseAtk": 54,
  "attackInterval": 1.3,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "lineage": "monkey",
  "lineageTier": 2,
  "rules": "Normal attack deals 100% ATK damage. Passively gains +20% ATK (base 45 → 54 ATK). Every 4th attack summons a clone with 75% ATK into an empty slot (clones perform normal attacks only).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubT3",
  "name": "Heaven-Shaking Ape King",
  "vn": "Heaven-Shaking Ape King",
  "genre": "Bloodline",
  "rarity": "Legendary",
  "baseAtk": 111,
  "attackInterval": 1.2,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "lineage": "monkey",
  "lineageTier": 3,
  "rules": "Normal attack deals 100% ATK damage and cleaves up to 3 runners behind. Passively gains +30% ATK (base 85 → 111 ATK). Every 4th attack summons a clone with 75% ATK into an empty slot (clones also cleave 3 runners behind).",
  "synergy": "Primordial Blood Cub and matching prey/relics."
},
{
  "id": "monkeyCubApex",
  "name": "Great Sage Equal to Heaven",
  "vn": "Great Sage Equal to Heaven",
  "genre": "Bloodline",
  "rarity": "Mythic",
  "baseAtk": 169,
  "attackInterval": 1.0,
  "max": 0,
  "asset": "atlasCaster",
  "icon": "♜",
  "fav": "team",
  "tags": [
    "bloodline-form",
    "lineage-monkey"
  ],
  "evolvedFrom": "cub",
  "lineage": "monkey",
  "lineageTier": 4,
  "rules": "Normal attack deals 100% ATK damage and cleaves up to 3 runners behind. Passively gains +30% ATK (base 130 → 169 ATK). Every 4th attack summons a clone with 75% ATK into an empty slot. Every 10th attack, channels for 1.2s: strikes staff down the track quadrant with the highest enemy density for 200% ATK damage board-wide in that quadrant.",
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
    "asset": "hauntedInvestigator",
    "tags": ["token", "dossier", "consumable"],
    "token": true,
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
    "fav": "neighbor",
    "species": "lotusRoot",
    "ecosystem": "Cultivation · Dan Dao",
    "rules": "An adjacent Practitioner directly absorbs this token for +5 Qi and +1 permanent ATK. A Cauldron instead consumes it for +6 Qi and +2 permanent ATK to the deployed eligible Cultivation unit with the least Qi. Cultivation Mythics absorb it for +15 Qi; every 30 gained Qi grants +2 permanent ATK, and Qi above 175 also grants +0.15 permanent ATK per Qi. Consuming the token preserves its parent root.",
    "synergy": "Qi-Refining Practitioner, Nine-Turn Alchemy Cauldron."
  },

  {
    "id": "houndToken",
    "name": "Hound Phantom",
    "vn": "Hound Phantom",
    "genre": "Bloodline",
    "rarity": "Normal",
    "baseAtk": 12,
    "attackInterval": 1.5,
    "asset": "hound",
    "tags": ["token", "fodder"],
    "token": true,
    "fav": "center",
    "ecosystem": "Tokens · predation",
    "rules": "Temporary Crimson Hound token.",
    "synergy": "Primordial Blood Cub and Crimson Broodkeeper."
  },
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


// Scrapwork is the active Post-Apocalyptic draft pool.

CARDS.push(...[
  {
    "id": "scrapFrame",
    "name": "Scavenged Frame",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 15,
    "attackInterval": 1.8,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Scavenged Frame. Holds up to 2 forged weapons of matching type (adds weapon ATK). Gains +1 Alloy per 3 attacks, +5 per deployed battle clear, and +3 per smelt. At 25/65 Alloy becomes Reinforced/Industrial Heavy Walker. At 120 unlocks a two-adjacent-slot Titan Core. Every 15 Alloy beyond 120 grants +2 permanent ATK.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "scrapFrame"
  },
  {
    "id": "junkScavenger",
    "name": "Junk Scavenger",
    "genre": "PostApoc",
    "rarity": "Normal",
    "baseAtk": 12,
    "attackInterval": 1.5,
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
    "baseAtk": 14,
    "attackInterval": 2.0,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Normal attack targets the track segment (0-4, 4-8, 8-12, or 12-16) with the highest enemy density, reducing runners' armor by 15% for 2s. Every 6s, welds +3 permanent ATK onto the weakest adjacent original Mech.",
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
    "rules": "Does not attack. Adjacent units gain +20% ATK and +20% attack speed. On an Elite/Boss, an adjacent two-slot Titan with 120 Alloy and two matching weapons starts a field test. Each module must hit a priority enemy; then clear with zero leaks to consume this Core and awaken a Mythic Titan.",
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
    "baseAtk": 30,
    "attackInterval": 1.7,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Reinforced Walker (T1). Holds up to 2 forged weapons of matching type (adds weapon ATK). Gains Alloy from attacks and smelts. At 65 Alloy becomes Industrial Heavy Walker.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "reinforcedWalker",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "heavyWalker",
    "name": "Industrial Heavy Walker",
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
    "rules": "Industrial Heavy Walker (T2). Holds up to 2 forged weapons of matching type (adds weapon ATK). Gains Alloy from attacks and smelts. At 120 Alloy unlocks The Titan Core.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "heavyWalker",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "titanFrame",
    "name": "The Titan Core",
    "genre": "PostApoc",
    "rarity": "Legendary",
    "baseAtk": 90,
    "attackInterval": 1.5,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "The Titan Core (T3). Two-slot frame holding up to 2 forged weapons of matching type. Every 15 Alloy beyond 120 grants +2 permanent ATK. Field test with adjacent Titan Reactor Core on Elite/Boss nodes awakens a Mythic Colossus.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "titanFrame",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "berserkerColossus",
    "name": "Berserker Greatsword Colossus",
    "genre": "PostApoc",
    "rarity": "Mythic",
    "baseAtk": 280,
    "attackInterval": 1.5,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Two-slot Titan forged from 2 Colossal Scrap Blades (base 180 + 50 + 50 ATK). Normal attack hits all enemies in the tile of the highest-HP runner. Every 10th attack, channels for 1.2s, then cleaves the densest track segment for 200% ATK damage. Continues earning Alloy.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "berserkerColossus",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "siegeDreadnought",
    "name": "Siege Fortress Dreadnought",
    "genre": "PostApoc",
    "rarity": "Mythic",
    "baseAtk": 260,
    "attackInterval": 1.2,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Two-slot Titan forged from 2 Twin Flak Batteries (base 170 + 45 + 45 ATK). Normal attack targets all enemies in the densest track segment for 80% ATK damage. Every 10th attack, channels for 1.2s, then targets all 16 tiles for 200% ATK damage and reduces 50% armor for 5s. Continues earning Alloy.",
    "synergy": "Scavenged Frame, Junk Scavenger, Magnetic Crane, Hydraulic Riveter, Junkyard Smelter, and Titan Reactor Core.",
    "scrapworkAsset": "siegeDreadnought",
    "evolvedFrom": "scrapFrame"
  },
  {
    "id": "vanguardJuggernaut",
    "name": "Vanguard Gunblade Juggernaut",
    "genre": "PostApoc",
    "rarity": "Mythic",
    "baseAtk": 250,
    "attackInterval": 1.4,
    "max": 0,
    "icon": "⚙",
    "fav": "neighbor",
    "tags": [
      "mechanical"
    ],
    "ecosystem": "Scrapwork · salvage and forging",
    "rules": "Two-slot Titan forged from one Colossal Scrap Blade and one Twin Flak Battery (base 155 + 50 + 45 ATK). Normal attack alternates between a long-range armor-piercing shot (30% armor pierce) on the 3 leading runners and a wide sweeping cleave applying stacking Oil Burn on the densest track segment for 5s (1 burn stack/s; if that segment already has oil burn, fires the AP shot instead). Every 10th attack, channels for 1.2s, then applies stacking oil burn pool to all 16 tiles (1 burn stack/s) for 5s and slows 45% for 5s. Continues earning Alloy.",
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
    "token": true
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
    "token": true
  }
]);

// Urban Legend progression is described on each card form; do not append shared or Blackout-based Mythic shortcuts.

CARDS.push({"id": "mercenary", "name": "Cursed Mercenary", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 10, "attackInterval": 1.4, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Attacks the leading runner, inflicting 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At 100 Trophy Points, an adjacent Hunt Relic starts an Elite/Boss Eclipse Hunt trial. Clear with zero leaks to awaken its mapped Mythic and consume the relic; any leak or failed clear removes the Slayer and relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "mercenary"},{"id": "witchHunter", "name": "Witch Hunter", "genre": "Grimdark", "rarity": "Rare", "baseAtk": 18, "attackInterval": 1.2, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Once per team per battle, after three runners spawn, brands the healthiest living ordinary runner Alpha Quarry. It qualifies for Morrow’s bonus and a trophy. Deals double damage to shielded runners.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witchHunter"},{"id": "trophyStake", "name": "Trophy Stake", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Mounts one adjacent loose trophy, freeing its slot and projecting its aura to orthogonal neighbors. Adjacent Taxidermists can carve the mounted head. Mounted heads expire after battle.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "trophyStake"},{"id": "taxidermist", "name": "Beast Taxidermist", "genre": "Grimdark", "rarity": "Rare", "baseAtk": 10, "attackInterval": 1.5, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Every 6s carves an adjacent loose or mounted head: +3 permanent ATK to adjacent hunters; +10 Trophy Points to deployed core slayers. Skull: +3 permanent ATK to lowest-ATK ally. Horn: -10% base armor to priority enemies, run-wide, capped 30%. Eye: ordinary-runner execution thresholds of 30% become 35%. Two same-family carvings forge a permanent undraftable relic into an empty slot. One unbound copy per family; excess counters persist.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "taxidermist"});
FORMS.push({"id": "oathboundHunter", "name": "Oathbound Hunter", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 24, "attackInterval": 1.3, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At 100 Trophy Points, an adjacent Hunt Relic starts an Elite/Boss Eclipse Hunt trial. Clear with zero leaks to awaken its mapped Mythic and consume the relic; any leak or failed clear removes the Slayer and relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "oathboundHunter", "evolvedFrom": "mercenary"},{"id": "blackIronSlayer", "name": "Black-Iron Slayer", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 55, "attackInterval": 1.2, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At 100 Trophy Points, an adjacent Hunt Relic starts an Elite/Boss Eclipse Hunt trial. Clear with zero leaks to awaken its mapped Mythic and consume the relic; any leak or failed clear removes the Slayer and relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "blackIronSlayer", "evolvedFrom": "mercenary"},{"id": "brandedBerserker", "name": "Branded Berserker", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 55, "attackInterval": 1.2, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts 3 DPS Bleed for 4s. Gains 3 Trophy Points per slain quarry/elite/boss and 10 per carving while deployed. Evolves at 25/60/100 points. At 100 Trophy Points, an adjacent Hunt Relic starts an Elite/Boss Eclipse Hunt trial. Clear with zero leaks to awaken its mapped Mythic and consume the relic; any leak or failed clear removes the Slayer and relic.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "brandedBerserker", "evolvedFrom": "mercenary"},{"id": "dragonSlayer", "name": "Dragon Slayer Berserker", "genre": "Grimdark", "rarity": "Mythic", "baseAtk": 250, "attackInterval": 1.4, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Sweeps the target’s entire 4-tile wall, ignoring armor, breaking shields and cancelling sprint boosts. Every third swing strips 15% current HP from bosses and Harbingers. Kills on its attacked wall grant +5% battle attack speed, capped +50%.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "dragonSlayer", "evolvedFrom": "mercenary"},{"id": "witcherGrandmaster", "name": "Grandmaster Witcher", "genre": "Grimdark", "rarity": "Mythic", "baseAtk": 180, "attackInterval": 1.1, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Alternates three Silver attacks and three Sign attacks. Silver guarantees criticals: 3× TOTAL damage against priority enemies, 2× against ordinary runners. Signs blast the target’s 4-tile wall, knock runners back 3 tiles (boss resistance applies), and strip 50% armor.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witcherGrandmaster", "evolvedFrom": "mercenary"},{"id": "bloodDrunkHunter", "name": "Blood-Drunk Abyssal Hunter", "genre": "Grimdark", "rarity": "Mythic", "baseAtk": 170, "attackInterval": 0.85, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["hunter"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Inflicts stacking Arterial Hemorrhage: 40 true DPS for 4s. A hemorrhaging ordinary runner below 30% HP (35% after Eye carving) is executed once, exploding for 400 true damage across its 4-tile wall. Bosses and Harbingers cannot be executed.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "bloodDrunkHunter", "evolvedFrom": "mercenary"},{"id": "beastRelic", "name": "Feral Beast Heart", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Forged only from two beast carvings. Permanent roster card; orthogonal allies gain +25% attack speed. On an Elite/Boss, this relic starts an Eclipse Hunt trial for an adjacent 100-point Branded Berserker. A zero-leak clear awakens its mapped Mythic and consumes the relic; any leak or failed clear removes both.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "beastRelic"},{"id": "fiendRelic", "name": "Demon-Forged Brand", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Forged only from two fiend carvings. Permanent roster card; orthogonal allies gain 30% armor penetration. On an Elite/Boss, this relic starts an Eclipse Hunt trial for an adjacent 100-point Branded Berserker. A zero-leak clear awakens its mapped Mythic and consumes the relic; any leak or failed clear removes both.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "fiendRelic"},{"id": "witchRelic", "name": "Clairvoyant Iris", "genre": "Grimdark", "rarity": "Epic", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "Forged only from two witch carvings. Permanent roster card; orthogonal allies gain +20% critical chance. On an Elite/Boss, this relic starts an Eclipse Hunt trial for an adjacent 100-point Branded Berserker. A zero-leak clear awakens its mapped Mythic and consumes the relic; any leak or failed clear removes both.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witchRelic"});
TOKENS.push({"id": "beastSkull", "name": "Feral Beast Skull", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "One-battle trophy. Orthogonal allies gain +20% attack speed and attacks inflict 6 DPS stacking Bleed for 4s. Duplicate family auras do not stack. May be mounted or carved.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "beastSkull", "token": true, "trophyFamily": "beast"},{"id": "fiendHorn", "name": "Armored Demon Horn", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "One-battle trophy. Orthogonal allies gain 40% armor penetration and one 50% second-target cleave per attack. Duplicate family auras do not stack. May be mounted or carved.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "fiendHorn", "token": true, "trophyFamily": "fiend"},{"id": "witchEye", "name": "Specter Witch Eye", "genre": "Grimdark", "rarity": "Normal", "baseAtk": 0, "attackInterval": 0, "max": 0, "icon": "⚔", "fav": "neighbor", "tags": ["support"], "ecosystem": "Eclipse Hunt · trophies and relic forging", "rules": "One-battle trophy. Orthogonal allies gain +25% critical chance and double attack damage against runners below 35% HP. Duplicate family auras do not stack. May be mounted or carved.", "synergy": "Witch Hunter marks one quarry; leave room beside hunters for heads. Stake mounts heads; Taxidermist carves adjacent heads every 6s. Two matching carvings forge a permanent relic.", "huntAsset": "witchEye", "token": true, "trophyFamily": "witch"});
Object.assign(CARDS.find(c=>c.id==='executioner'),{rules:'Prioritizes Alpha Quarry, Elites, Harbingers and Bosses. Deals 4× damage to targets below 35% HP.',huntAsset:'executioner',tags:['hunter']});
Object.assign(CARDS.find(c=>c.id==='leech'),{name:'Grave Leech',rules:'Deals 2.5× damage against bleeding runners or while adjacent to a loose or mounted trophy.',huntAsset:'leech'});
Object.assign(CARDS.find(c=>c.id==='totem'),{huntAsset:'totem'});

// Arcane Loom: primary mages and earned synthesis forms.
CARDS.push({
  "id": "elementalApprentice",
  "name": "Elemental Apprentice",
  "genre": "Arcane",
  "rarity": "Normal",
  "baseAtk": 12,
  "attackInterval": 1.5,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 10 ticks: casts an essence volley targeting 1 + Math.floor(points / 20) enemies (up to 5 targets at 80 points) for 100% ATK damage. Adjacent primary spells supply essence; two different stored essences are consumed for +1 point in that pair. Locks path at 25 points; subsequent off-pair points convert 2:1 into the locked pair. Unlocks Adept at 25 pts, Mage at 45 pts, Archmage at 65 pts, and starts Astral Weaving trial at 80 pts with adjacent Astral Loom.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "elementalApprentice"
},
{
  "id": "pyroMage",
  "name": "Pyromancer",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 25,
  "attackInterval": 1.4,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 10 ticks: Ignite Blast deals 100% ATK damage and inflicts 1 + Math.floor(mastery / 10) Burn stacks (1% max HP/s for 1s), grants +1% Mastery and +1 permanent ATK. Supplies Fire Essence to adjacent Apprentices.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "pyroMage",
  "element": "fire"
},
{
  "id": "hydroMage",
  "name": "Hydromancer",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 22,
  "attackInterval": 1.4,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 10 ticks: Tidal Wave hits 4 leading enemies for ATK × (1 + mastery × 0.005) damage, applies Drenched (30% slow for 3s), grants +1% Mastery and +1 permanent ATK. Supplies Water Essence.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "hydroMage",
  "element": "water"
},
{
  "id": "geoMage",
  "name": "Geomancer",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 23,
  "attackInterval": 1.4,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Each attack charges 1 tick. At 10 ticks: Seismic Spike deals 100% ATK damage, pierces 20% + Math.floor(mastery / 5)% armor, grants +1% Mastery and +1 permanent ATK. Supplies Earth Essence.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "geoMage",
  "element": "earth"
},
{
  "id": "aeroMage",
  "name": "Aeromancer",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 22,
  "attackInterval": 1.3,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Hits 2 targets. Each attack charges 1 tick and gains +Math.floor(mastery / 5)% permanent attack speed. At 10 ticks: hits 4 targets for 100% ATK damage, grants adjacent allies +20% haste for 3s, grants +1% Mastery and +1 permanent ATK. Supplies Wind Essence.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
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
  "rules": "When an adjacent mage casts at max gauge (10 ticks), grants all deployed elemental mages +2 ticks.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "elementalPrism"
},
{
  "id": "manaBattery",
  "name": "Mana Battery",
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
  "rules": "Every 8.0s, grants +4 ticks to one random deployed mage.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
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
  "rules": "Adjacent units gain 2 ticks per normal attack and +20% attack speed. On an Elite or Boss, starts the Astral Weaving trial for an adjacent Apprentice with 80+ points in its locked pair: land that pair’s reaction on an Elite, Harbinger, or Boss and clear with zero leaks to consume this Loom and awaken the matching Mythic Archon.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "astralLoom"
});
FORMS.push({
  "id": "elementalAdept",
  "name": "Elemental Adept",
  "genre": "Arcane",
  "rarity": "Rare",
  "baseAtk": 25,
  "attackInterval": 1.4,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Earned at 25 points in locked pair. Essence volley hits 1 + Math.floor(points / 20) enemies for 100% ATK damage; off-pair points convert 2:1 into the locked pair. At 80 points, adjacent Astral Loom starts an Elite/Boss trial to awaken the Mythic Archon.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "elementalAdept",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "elementalMage",
  "name": "Elemental Mage",
  "genre": "Arcane",
  "rarity": "Epic",
  "baseAtk": 55,
  "attackInterval": 1.4,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Earned at 45 points in locked pair. Essence volley hits 1 + Math.floor(points / 20) enemies for 100% ATK damage; off-pair points convert 2:1 into the locked pair. At 80 points, adjacent Astral Loom starts an Elite/Boss trial to awaken the Mythic Archon.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "elementalMaster",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "elementalMaster",
  "name": "Elemental Mage",
  "genre": "Arcane",
  "rarity": "Epic",
  "baseAtk": 55,
  "attackInterval": 1.4,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Earned at 45 points in locked pair. Essence volley hits 1 + Math.floor(points / 20) enemies for 100% ATK damage; off-pair points convert 2:1 into the locked pair. At 80 points, adjacent Astral Loom starts an Elite/Boss trial to awaken the Mythic Archon.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "elementalMaster",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "elementalArchmage",
  "name": "Elemental Archmage",
  "genre": "Arcane",
  "rarity": "Legendary",
  "baseAtk": 90,
  "attackInterval": 1.4,
  "max": 10,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Earned at 65 points in locked pair. Legendary tier. Essence volley hits 1 + Math.floor(points / 20) enemies for 100% ATK damage. At 80 points, adjacent Astral Loom starts an Elite/Boss Astral Weaving trial: prove the chosen reaction on an Elite, Harbinger, or Boss and clear with zero leaks to awaken the Mythic Archon.",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "elementalArchmage",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "magmaLord",
  "name": "Magma Lord",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 150,
  "attackInterval": 1.2,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Normal attack creates a 2s molten fissure on the hit tile, inflicting 1 Burn stack per second on enemies running across it. Every 10th attack: channels 1.2s to deal 150% ATK across all 16 tiles, inflict 1 Burn stack, and create a 16-tile Molten Fissure for 5s (1 burn/s). Reaction (Earth + Fire): Completely shreds target armor (100% strip). Patronage: When this Archon is deployed, Pyromancer and Geomancer max-gauge spells gain both elemental effects (Pyromancer inflicts 1 Burn stack and pierces 20% armor; Geomancer pierces 20% armor and inflicts 1 Burn stack).",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "magmaLord",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "tempestArchon",
  "name": "Firestorm Tempest",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 135,
  "attackInterval": 0.9,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Normal attack hits 1 quadrant (4 tiles) with 20% chance of 2-tile warp back. Every 10th attack: channels 1.2s to summon a counter-clockwise tornado across all 16 tiles dealing 150% ATK, pushing enemies 3 tiles back, and inflicting 1 Burn stack. Reaction (Fire + Wind): Spreads all target Burn stacks to up to 2 runners behind it. Patronage: When this Archon is deployed, Pyromancer and Aeromancer max-gauge spells gain both elemental effects (Pyromancer inflicts 1 Burn stack, hits 4 targets, and grants adjacent allies +20% haste for 3s; Aeromancer hits 4 targets, grants adjacent allies +20% haste for 3s, and inflicts 1 Burn stack).",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "tempestArchon",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "steamSovereign",
  "name": "Scalding Vapor Sovereign",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 145,
  "attackInterval": 1.4,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Normal attack hits 3 enemies; if Drenched, bursts 10% missing HP (once per enemy). Every 10th attack: channels 1.2s to coat all 16 tiles in Vapor Mist for 5s (5% max HP/s true damage). Reaction (Fire + Water): Deals 15% missing HP true damage. Patronage: When this Archon is deployed, Pyromancer and Hydromancer max-gauge spells gain both elemental effects (Pyromancer applies Drenched [30% slow for 3s] and inflicts 1 Burn stack; Hydromancer inflicts 1 Burn stack and applies Drenched [30% slow for 3s]).",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "steamSovereign",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "quagmireColossus",
  "name": "Quagmire Colossus",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 150,
  "attackInterval": 1.5,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Normal attack deals 100% ATK. Its first attack each battle converts one random 4-tile quadrant into Primordial Swamp for the rest of the battle (2% max HP/s + 45% slow). Every 10th attack: channels 1.2s to stun for 2s and drench for 4s across all 16 tiles. Reaction (Earth + Water): Target is Drenched (30% slow) and has armor reduced by 20% for 3s. Patronage: When this Archon is deployed, Hydromancer and Geomancer max-gauge spells gain both elemental effects (Hydromancer pierces 20% armor and applies Drenched [30% slow for 3s]; Geomancer applies Drenched [30% slow for 3s] and pierces 20% armor).",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "quagmireColossus",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "blizzardArchon",
  "name": "Glacial Typhoon",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 140,
  "attackInterval": 1.2,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Normal attack hits 3 targets and applies Drenched (30% slow for 3s). Every 10th attack: channels 1.2s to unleash a 16-tile Blizzard for 150% ATK and 2s freeze (3s freeze + 50% armor shred if Drenched). Reaction (Water + Wind): Freezes target for 2s. Patronage: When this Archon is deployed, Hydromancer and Aeromancer max-gauge spells gain both elemental effects (Hydromancer hits 4 targets, grants adjacent allies +20% haste for 3s, and applies Drenched [30% slow for 3s]; Aeromancer applies Drenched [30% slow for 3s], hits 4 targets, and grants adjacent allies +20% haste for 3s).",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "blizzardArchon",
  "evolvedFrom": "elementalApprentice"
},
{
  "id": "sandstormTitan",
  "name": "Sandstorm Titan",
  "genre": "Arcane",
  "rarity": "Mythic",
  "baseAtk": 145,
  "attackInterval": 1.0,
  "max": 0,
  "icon": "✦",
  "fav": "neighbor",
  "tags": [
    "elemental"
  ],
  "ecosystem": "Arcane Loom · elemental synthesis",
  "rules": "Normal attack pierces 5 targets with 10% falloff per hit (100%/90%/80%/70%/60%). Every 10th attack: enters a 10s channel mode (disabling normal attacks), stripping 10% base armor/s and dealing 10% ATK + 10% missing HP every second across all 16 tiles. Reaction (Earth + Wind): Inflicts 1 Bleed stack (1% enemy HP/s for 3s). Patronage: When this Archon is deployed, Geomancer and Aeromancer max-gauge spells gain both elemental effects (Geomancer hits 4 targets, grants adjacent allies +20% haste for 3s, and pierces 20% armor; Aeromancer pierces 20% armor, hits 4 targets, and grants adjacent allies +20% haste for 3s).",
  "synergy": "Adjacent primary spells supply essence to Apprentices. Combine two different essences for one permanent pair point. Prism refracts gauge charge; Battery stores overflow. At 80 pair points, Astral Loom starts an Elite/Boss trial: prove the chosen reaction on a priority target, then clear with zero leaks.",
  "arcaneAsset": "sandstormTitan",
  "evolvedFrom": "elementalApprentice"
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
  "rules": "Two permanent sockets: one Arm, one OS. Every4 attacks earns1 Chrome across battles; cleaves count once. Evolves at25 and65. At120 Chrome with both sockets and an adjacent Military Cyber-Reactor, prove the OS signature on an Elite/Boss, then clear with zero leaks to awaken its matching Mythic; trial failure removes the Operative and Reactor. Sandevistan: land3 attacks during its window. Berserk: land3 attacks at80–99°C without shutdown. Cyberdeck: complete one Short Circuit and one Contagion. Base heat20°C; attacks generate8°C (14°C with Berserk), passive cooling4°C/s. At100°C shuts down for3s and purges to40°C.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
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
  "rules": "Draftable from Crossing5. On an Elite/Boss, an adjacent120-Chrome Operative with both sockets filled must prove its OS signature and clear with zero leaks to consume this Reactor and awaken the matching Mythic. Failure removes the Operative and Reactor. One grid slot per Operative, including Mythics.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "cyberReactor"
});
FORMS.push({
  "id": "chromedSolo",
  "name": "Chromed Operative",
  "genre": "Cyberpunk",
  "rarity": "Rare",
  "baseAtk": 26,
  "attackInterval": 1.2,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Earned at25 Chrome. Retains installed modules. Four attacks earn1 Chrome. Heat and socket rules remain.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "chromedSolo",
  "evolvedFrom": "cyberSolo"
},
{
  "id": "eliteSolo",
  "name": "Elite Cyber-Operative",
  "genre": "Cyberpunk",
  "rarity": "Epic",
  "baseAtk": 55,
  "attackInterval": 1.1,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Earned at65 Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "eliteSolo",
  "evolvedFrom": "cyberSolo"
},
{
  "id": "chronoPhantom",
  "name": "Chrono-Scythe Phantom",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 130,
  "attackInterval": 0.7,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Permanent40% track slow replaces Sandevistan windows. Mantis slashes execute ordinary runners below30% HP (35% with carved Witch Eye). Bosses/Harbingers cannot execute.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "chronoPhantom",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "mantisImplant",
  "cyberOS": "sandyOS"
},
{
  "id": "thermalRipper",
  "name": "Thermal Ripper Demon",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 160,
  "attackInterval": 0.8,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Four full-damage true-fire cleaves replace ordinary Mantis cleaves and Berserk doubling. Retains Plasma Bleed. Creates one4-tile slag trail for4s at50 true DPS; recasts refresh/replace, never stack.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "thermalRipper",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "mantisImplant",
  "cyberOS": "berserkOS"
},
{
  "id": "glitchAssassin",
  "name": "Glitch Infiltrator",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 140,
  "attackInterval": 0.75,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Mantis hits inject viral nanites. When an infected bleeding runner dies, infects its wall with Contagion at24 true DPS for4s. Viral death explosions occur once per victim and cannot propagate further death explosions. Retains RAM and regular paid hacks.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "glitchAssassin",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "mantisImplant",
  "cyberOS": "cyberdeckOS"
},
{
  "id": "gravitonColossus",
  "name": "Kinetic Graviton Colossus",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 180,
  "attackInterval": 0.9,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Every4s creates a gravity impact: freezes the target2s and pulls nearby runners within2 track tiles backward up to2 tiles. Replaces Sandevistan windows. Boss resistance/enrage remain.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "gravitonColossus",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "gorillaImplant",
  "cyberOS": "sandyOS"
},
{
  "id": "juggernautSmasher",
  "name": "Apex Juggernaut Smasher",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 200,
  "attackInterval": 1,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Punches remove all target armor. Every third punch removes15% current boss/Harbinger HP. Signature replaces Berserk doubling; retains Gorilla targeting and fourth-hit stun.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "juggernautSmasher",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "gorillaImplant",
  "cyberOS": "berserkOS"
},
{
  "id": "empBreaker",
  "name": "EMP Shockwave Breaker",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 150,
  "attackInterval": 0.85,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Punches strike a6-tile perimeter arc, erase shields and cancel temporary sprint boosts. Never resets boss enrage or its timer. Retains Gorilla priority, fourth-hit stun, RAM and paid hacks.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "empBreaker",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "gorillaImplant",
  "cyberOS": "cyberdeckOS"
},
{
  "id": "razorPhantom",
  "name": "Razor Phantom",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 120,
  "attackInterval": 0.7,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Whips up to eight leading runners track-wide with guaranteed criticals (normal critical multipliers apply). Retains shield stripping and50% defense ignore. Replaces Sandevistan windows.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "razorPhantom",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "monowireImplant",
  "cyberOS": "sandyOS"
},
{
  "id": "plasmaTempest",
  "name": "Plasma Whiplash Tempest",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 160,
  "attackInterval": 0.8,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Wire attacks create one4-tile blue-plasma zone for4s:40 true DPS and10% base armor stripped per second. Retains wire pattern; signature replaces Berserk doubling.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "plasmaTempest",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "monowireImplant",
  "cyberOS": "berserkOS"
},
{
  "id": "networkReaper",
  "name": "Network Reaper",
  "genre": "Cyberpunk",
  "rarity": "Mythic",
  "baseAtk": 140,
  "attackInterval": 0.8,
  "max": 0,
  "icon": "⌘",
  "fav": "neighbor",
  "tags": [
    "chrome"
  ],
  "ecosystem": "Ripperdoc Matrix · arms × operating systems",
  "rules": "Wire hits generate1 RAM per runner hit instead of attack-count generation. Every1.5s spends3 RAM on Short Circuit. Retains RAM capacity and wire pattern; uploads are never free.",
  "synergy": "Install one adjacent Arm and one OS into the oldest eligible Operative. Leave cooling near hot operatives. Every four attacks earn one Chrome. At120 Chrome with both sockets filled and an adjacent Military Cyber-Reactor, prove the installed OS signature on an Elite/Boss, then clear with zero leaks to awaken its Mythic. Failure removes the Operative and Reactor.",
  "cyberAsset": "networkReaper",
  "evolvedFrom": "cyberSolo",
  "cyberArm": "monowireImplant",
  "cyberOS": "cyberdeckOS"
});
Object.assign(CARDS.find(c=>c.id==='vent'),{cyberAsset:'vent',rules:'Cool adjacent Operatives by15°C/s; duplicate Vents do not stack. Every8s freezes the two leading runners for1s, or2s if burning. Retains team-wide halved Overheat/Burnout shutdown duration. Cooling below80°C interrupts Berserk.'});
// Forbidden Texts: earned forms and relics never enter the draft pool.
const cosmicCard=(id,name,rarity,baseAtk,attackInterval,rules,extra={})=>({id,name,genre:'Lovecraft',rarity,baseAtk,attackInterval,max:0,icon:'◈',sprite:32,fav:'neighbor',tags:['forbidden'],ecosystem:'Forbidden Texts · three scripts, six awakenings',rules,synergy:'Chants advance deployed Idols. The oldest unsealed Idol receives the first two deciphered scripts. At154 Syllables, an adjacent matching Grimoire starts an Elite/Boss Forbidden Recitation: channel8 seconds, prove each script effect on a priority target, then clear with zero leaks. Failure removes the Herald and Grimoire. No Crossing gate.',...extra});
CARDS.push(
 cosmicCard('slumberingIdol','Slumbering Idol','Normal',8,1.4,'Absorbs combat chants and decipher rewards. At25 Syllables the first deciphered script selects a Rare form; at65 the first two scripts select an Epic Herald. At154 Syllables, an Elite/Boss trial requires an8-second recitation, each script effect on a priority target, and a zero-leak clear; failure removes the Herald and Grimoire. Scripts lock permanently.'),
 cosmicCard('blindAstrologer','Blind Astrologer','Normal',10,1.2,'Pierces two runners. Every fourth attack chants4 Syllables and has45% chance to drop a random adjacent page. Every10 combat syllables also yields a themed page. Full-board drops are lost.'),
 cosmicCard('archivist','Mad Archivist','Rare',12,1.5,'Every5s deciphers an adjacent page for12 Syllables and its script effect. The oldest deployed Idol missing a script receives it. Every two pages forge a permanent undraftable Grimoire; recipes persist and wait for an empty slot.'));
const COSMIC_BRANCH_DATA=[
 ['abyss+abyss','rlyehHerald',"Herald of Sunken R’lyeh",45,1.1,'deepGrimoire','Necronomicon of the Deep','cthulhu',"Great Cthulhu, Sleeper of R’lyeh",160,0.9,'Floods the facing track wall with40% slow. Every6s reverses the two leading runners for2s.','All runners are slowed35%. Every6s normal and elite runners walk backward for3s, taking150 true DPS. Bosses and Harbingers resist slowing and cannot enter Madness Flight.'],
 ['astral+astral','gateHerald','Herald of the Silver Gate',45,1.1,'astralGrimoire','Book of Eibon','yogSothoth','Yog-Sothoth, The Gate and the Key',160,0.85,'The first forward crossing of Tile8 per runner warps it back3 tiles and deals120 true damage.','The first forward crossing of each of Tiles8 and12 per runner warps it back5 tiles for220 + Team Power true damage. Once per battle, rewind a non-boss runner reaching15.5 to8 and stun2.5s.'],
 ['flesh+flesh','broodHerald','Herald of the Black Brood',45,1.1,'fleshGrimoire','Cultes des Goules','shubNiggurath','Shub-Niggurath, Black Goat of the Woods',150,0.9,'Copies50% of the highest adjacent base ATK for this battle. Summons a temporary Mind Larva every8s.','At awakening, battle start and every6s, fill empty adjacent slots with Dark Young:75% ATK,0.5s attacks,20% slow and25% armor shred. Each runner death or token consumption grants deployed Cosmic originals +2 permanent ATK once, without a cap; multiple Shubs do not multiply rewards.'],
 ['abyss+astral','yellowHerald','Herald of the Yellow Sign',45,1.1,'yellowGrimoire','The King in Yellow Folio','kingInYellow','Hastur, The King in Yellow',150,0.85,'Attacks brand runners. A fresh allied slow or warp detonates the brand for140 spell damage, with a1s per-runner cooldown.','All runners take35% more damage. Fresh allied slow, stun, freeze or warp detonates the target and two nearby runners for180 +1.5× ATK true damage.1s per-runner cooldown; reactions cannot trigger themselves.'],
 ['abyss+flesh','brainHerald','Herald of the Brain Harvest',45,1.1,'brainGrimoire',"Revelations of Gla’aki",'elderBrain','Yuggoth Elder Brain',150,0.85,'Infects attacked runners for4s; once per second each infected runner pulses50% ATK damage within2.5 tiles.','Once at awakening permanently absorbs50% of every other deployed Cosmic ally’s ATK. Every5s hijacks the highest-HP runner for4s, halting it and pulsing200% ATK each second within2.5 tiles. Boss halt duration is halved and enraged bosses are immune to halting.'],
 ['astral+flesh','chaosHerald','Herald of the Crawling Chaos',45,1.1,'chaosGrimoire','Pnakotic Manuscripts','azathoth','Azathoth, The Daemon Sultan',180,0.85,'Prioritizes Elites, Harbingers and Bosses; strips40% armor and deals double damage to them.','Each attack bombards up to six runners with true damage. Every fourth attack additionally strips exactly15% current HP from Bosses and Harbingers and warps them back3 tiles. Boss resistance and enrage remain active.']
];
for(const [script,id,name,atk,interval] of [['abyss','drownedIdol','Idol of the Drowned Dreamer',22,1.3],['astral','keyIdol','Idol of the Shifting Key',20,1.2],['flesh','wombIdol','Idol of the Protoplasmic Womb',24,1.1]])FORMS.push(cosmicCard(id,name,'Rare',atk,interval,script==='abyss'?'Pierces two runners; every sixth attack reverses the target for1.2s.':script==='astral'?'Ignores armor; every fifth attack warps the leading runner back2.5 tiles.':'Adds30% of the highest adjacent base ATK for this battle; attacks apply8 bleed DPS for4s.',{evolvedFrom:'slumberingIdol',cosmicScript:script}));
for(const [pair,id,name,atk,interval,relic,relicName,apex,apexName,apexAtk,apexInterval,rule,apexRule] of COSMIC_BRANCH_DATA){FORMS.push(cosmicCard(id,name,'Epic',atk,interval,rule,{evolvedFrom:'slumberingIdol',cosmicPair:pair}),cosmicCard(relic,relicName,'Epic',0,0,'Forged from '+pair.replace('+',' + ')+' pages. Permanent undraftable relic; consumed only when its adjacent Herald completes the 154-Syllable Elite/Boss Forbidden Recitation with each script effect proved on a priority target and zero leaks. Failure removes the Herald and Grimoire.',{cosmicPair:pair}),cosmicCard(apex,apexName,'Mythic',apexAtk,apexInterval,apexRule,{evolvedFrom:'slumberingIdol',cosmicPair:pair}));}
for(const [script,id,name,rule] of [['abyss','abyssPage','Sunken Page','Adjacent attacks apply20% slow and +10% spell damage taken for3s. Decipher:12 Syllables and reverse two leading runners for1.5s.'],['astral','astralPage','Star-Chart Page','Adjacent allies gain20% gauge charge and ignore30% armor. Decipher:12 Syllables and warp two leading runners back3 tiles.'],['flesh','fleshPage','Skin-Bound Page','Adjacent allies gain15% speed and apply6 parasite DPS for4s. Decipher:12 Syllables and +3 permanent ATK to the lowest-ATK adjacent original.']])TOKENS.push(cosmicCard(id,name,'Normal',0,0,rule,{token:true,cosmicScript:script}));
TOKENS.push(cosmicCard('mindLarvaToken','Mind Larva Spawn','Normal',11,1,'Temporary larva:20% slow; every fifth attack double damage. Tokens do not chant.',{token:true,evolvedFrom:'larva'}),cosmicCard('darkYoung','Dark Young','Normal',0,.5,'Temporary spawn:75% summoner ATK,20% slow and25% armor shred.',{token:true}));
for(const [id,atk,interval,max,rules] of [
 ['larva',11,1,0,'Strikes and slows20% for3s. Every fifth attack deals double damage and chants3 Syllables. Pages generated by its chants use Flesh script.'],
 ['mass',15,1.4,0,'Copies highest adjacent base ATK at battle start. Uses oldest deployed Idol’s primary script: Abyss35% slow; Astral warp2 every fourth attack; Flesh cleaves three and spawns a temporary Mind Larva on kill.'],
 ['eye',0,0,12,'Fresh crowd control or status applications charge one tick (1s per-runner/type cooldown; no reaction recursion). At12 ticks, vulnerable15%,150 +0.75× Team Power damage and warp4 on two leading runners, plus8 Astral Syllables.4s cast cooldown.'],
 ['herald',85,1.2,0,'Every12s consumes an adjacent token, Shoggoth Mass or Mind Larva for100 stored Madness. Every8s releases stored Madness as true damage to all runners and warps late runners back5. Tokens are prioritized; consumed originals are permanently lost.']])Object.assign(CARDS.find(c=>c.id===id),{baseAtk:atk,attackInterval:interval,max,rules,ecosystem:'Forbidden Texts · three scripts, six awakenings'});

for(const c of [...CARDS,...FORMS,...TOKENS].filter(c=>c.genre==='Lovecraft'))c.cosmicAsset=c.id;

// Orbital Xeno-Lab: Alien CRISPR gene-splicing ecosystem
const xenoCard = (id, name, rarity, baseAtk, attackInterval, rules, extra = {}) => ({
  id, name, genre: 'SciFi', rarity, baseAtk, attackInterval, max: 0, icon: '⬡', sprite: 20, fav: 'neighbor',
  tags: ['xeno'], ecosystem: 'Orbital Xeno-Lab · CRISPR gene-splicing & leviathans', rules,
  synergy: 'Scan Weakpoints to amplify crits. Extract Helices with Nanites and sequence with Gene-Splicer. At 130 Genome with a two-strain lineage and its adjacent matching Serum, start an Elite/Boss Mythic trial. Clear with zero leaks to consume the Serum and awaken the matching Xeno-Leviathan; any leak or failed node removes both candidate and Serum.', ...extra
});

CARDS.push(
  xenoCard('xenoSpecimen', 'Cryo-Specimen', 'Normal', 10, 1.2, 'Strikes the leading runner. Absorbs Genetic Helices sequenced by the Gene-Splicer across battles, evolving into 1 of 3 Larval Morphs at 25 Genome (Rare), 1 of 6 Chrysalis Strains at 65 Genome (Epic), and 1 of 6 Mythic Xeno-Leviathans through an Elite/Boss trial at 130 Genome with a two-strain lineage and its adjacent matching Forged Mutagen Serum. Clear with zero leaks to consume the Serum and awaken the matching Mythic; any leak or failed node removes both cards.'),
  xenoCard('bioScanner', 'Orbital Bio-Scanner', 'Normal', 8, 1.3, 'Scans the leading and fastest runners, applying 1 Anatomical Weakpoint (+5% crit chance against target). Every 4th attack applies Weakpoints to 3 runners simultaneously.'),
  xenoCard('geneSplicer', 'CRISPR Gene-Splicer', 'Rare', 11, 1.4, 'Every 5s, sequences an orthogonally adjacent Genetic Helix Token—clearing the slot, granting +3 permanent ATK and +12 Genome to your Cryo-Specimen, and triggering the Helix combat pulse. When the Specimen reaches its 65-Genome Epic form, forge its matching undraftable Serum as a permanent roster card if an adjacent slot is free.')
);

const XENO_BRANCH_DATA = [
  ['chitin+chitin', 'impalerMorph', 'Sub-Orbital Impaler', 56, 1.2, 'keratinSerum', 'Hyper-Keratin Vial', 'impalerApex', 'Apex Impaler Behemoth', 245, 1.5, 'Pierces 4 runners in a line; critical hits ricochet bone shards to 2 nearby runners.', 'Relativistic Bone-Railgun: Sweeps an entire 4-tile perimeter track wall, ignoring 100% of armor. Against Weakpoint-marked runners, guaranteed critical hits deal 260%+ damage, knock targets backward 2 tiles, and ricochet splinter volleys to 3 additional runners. Grants +50% bonus permanent ATK transfer to any deployed Vector Railgun.'],
  ['acid+acid', 'acidBrood', 'Royal Acid-Brood', 50, 1.0, 'royalSerum', 'Xenomorph Royal Jelly', 'xenoQueen', 'Sovereign Xenomorph Queen', 170, 1, 'Critical hits strip 60% armor and leave 3-tile acid puddles dealing 30 true DPS.', 'Molecular Dissolution: Critical strikes permanently dissolve 100% of runner armor and coat a 4-tile track edge in pressurized Molecular Acid (65 true DPS for 5s). Every 4th critical hit against an Elite, Harbinger, or Boss dissolves 14% of its current HP directly.'],
  ['psionic+psionic', 'synapseNexus', 'Synaptic Nexus', 46, 0.8, 'cortexSerum', 'Overmind Cortex Vial', 'hiveOvermind', 'Cerebral Hive-Overmind', 140, 0.9, 'Grants all allies +20% crit chance; fires a bonus psychic ray whenever an adjacent ally crits.', 'Hive-Mind Telemetry Synchronization: Grants +30% Critical Strike Chance and +30% Critical Hit Damage across the entire 3×3 grid. Synchronized Fire: Whenever any allied card lands a Critical Hit, immediately fires a coordinated psionic lance at that target for 75% ATK true damage.'],
  ['chitin+acid', 'ravagerMorph', 'Caustic Ravager', 54, 1.05, 'ordnanceSerum', 'Bio-Ordnance Vial', 'causticRavager', 'Caustic Ravager Titan', 190, 1.1, 'Launches barbed acid pods that explode on critical hit for 150% splash damage within 2 tiles.', 'Living Bio-Artillery: Launches clusters of Barbed Acid-Pods into the densest runner group. On Critical Hit, detonates in a 5-tile radius, dealing 220% Crit Damage, shredding 50% defense, and inflicting stacking acid bleed (40 DPS).'],
  ['chitin+psionic', 'stalkerMorph', 'Phase-Chitin Hunter', 52, 0.75, 'phaseSerum', 'Phase-Chitin Vial', 'phaseStalker', 'Quantum Phase-Stalker', 180, 0.8, 'Prioritizes Elites/Harbingers; crits deal double damage to targets below 35% HP.', 'Predatory Phase-Execution: Prioritizes Elites/Harbingers/Bosses; attacks always critically strike Weakpoint-marked targets. Instantly executes non-boss runners below 35% HP. Against Bosses and Harbingers, every 5th critical slash phases inside their hull to deal 450 true damage and stun for 1.2s.'],
  ['acid+psionic', 'siphonMorph', 'Bio-Plasma Leech', 48, 0.85, 'metroidSerum', 'Metroid Siphon Vial', 'metroidLeviathan', 'Parasitic Metroid Leviathan', 160, 0.9, 'Drains bio-energy from runners, granting +2 ticks to Singularity Core and allied ability gauges every 4th hit.', 'Bio-Electric Life Drain: Latches bio-electric tendrils onto the 2 highest-HP runners, slowing them by 45% and draining 8% of Max HP every 3 seconds as true damage. Reactor Siphon: Every 3rd attack charges Singularity Core and all allied ability gauges by +2 ticks and grants +2 permanent ATK.']
];

for (const [strain, id, name, atk, interval] of [
  ['chitin', 'spineLurker', 'Spine-Lurker', 24, 1.1],
  ['acid', 'bileSpitter', 'Bile-Spitter', 22, 1.2],
  ['psionic', 'opticDrone', 'Optic-Drone', 20, 0.9]
]) {
  FORMS.push(xenoCard(id, name, 'Rare', atk, interval,
    strain === 'chitin' ? 'Fires high-velocity bone needles that pierce 2 runners and always critically strike targets with 2+ Weakpoints.' :
    strain === 'acid' ? 'Critical hits splash corrosive bile across 2 adjacent runners, melting 35% of their armor and applying 12 DPS acid burn.' :
    'Every 3rd attack scans the leading runner with 2 Weakpoint stacks and arcs bio-electric lightning to a second target.',
    { evolvedFrom: 'xenoSpecimen' }
  ));
}

for (const [pair, id, name, atk, interval, serum, serumName, apex, apexName, apexAtk, apexInterval, rule, apexRule] of XENO_BRANCH_DATA) {
  FORMS.push(
    xenoCard(id, name, 'Epic', atk, interval, rule, { evolvedFrom: 'xenoSpecimen', xenoPair: pair }),
    xenoCard(serum, serumName, 'Epic', 0, 0, 'Forged from ' + pair.replace('+', ' + ') + ' Helices. Permanent undraftable serum; its adjacent matching 130-Genome chrysalis must clear an Elite/Boss trial with zero leaks to consume this Serum and awaken ' + apexName + '.', { xenoPair: pair }),
    xenoCard(apex, apexName, 'Mythic', apexAtk, apexInterval, apexRule, { evolvedFrom: 'xenoSpecimen', xenoPair: pair })
  );
}

for (const [strain, id, name, rule] of [
  ['chitin', 'chitinHelix', 'Alpha-Chitin Helix', 'Adjacent allies gain +25% Critical Hit Damage and their critical hits pierce 1 additional runner. Pulse: Grants +12 Genome and +3 permanent ATK to Specimen, and fires a piercing bone spike.'],
  ['acid', 'acidHelix', 'Beta-Acid Helix', 'Adjacent allies critical hits apply Molecular Corrosion (shreds 30% armor and deals 10 true DPS for 4s). Pulse: Grants +12 Genome and +3 permanent ATK to Specimen, and sprays a 3-tile acid pool.'],
  ['psionic', 'psionicHelix', 'Gamma-Synapse Helix', 'Adjacent allies gain +15% Critical Hit Chance and charge Singularity Core by +1 extra tick on crit. Pulse: Grants +12 Genome and +3 permanent ATK to Specimen, and stuns all Weakpoint runners for 1.0s.']
]) {
  TOKENS.push(xenoCard(id, name, 'Normal', 0, 0, rule, { token: true }));
}


// Update existing SciFi card rules to match design proposal
Object.assign(CARDS.find(c => c.id === 'sensor'), { rules: 'Grants all other deployed allies +10 percentage points of critical hit chance and amplifies their critical hit damage to 230%. When an ally strikes critically, illuminates the target runner with an Anatomical Weakpoint.' });
Object.assign(CARDS.find(c => c.id === 'nanite'), { rules: 'Strikes at 0.8s interval. Critical hits shred runner defense by 25% for 3s. Every 6 critical hits across battles grant +1 permanent ATK and extract a random Genetic Helix Token onto an empty adjacent slot.' });
Object.assign(CARDS.find(c => c.id === 'railgun'), { rules: 'Pierces 3 runners in a line (5 with Telemetry Sensor and knocks back 1 tile), ignoring armor. Gains bonus attack damage equal to 200% of the single highest permanent ATK bonus among other allies.' });
Object.assign(CARDS.find(c => c.id === 'core'), { rules: 'Grants all other allies +15 percentage points of critical hit chance. Gains 1 tick whenever an ally lands a critical hit. At 8 ticks, triggers Gravitational Collapse: deals 240 + 2× Team Power true damage and Warps all runners backward 2.5 tiles.' });

const CARD = Object.fromEntries([...CARDS, ...FORMS, ...TOKENS].map(c => [c.id, c]));
if (typeof module !== 'undefined') module.exports = { GENRES, LEADERS, CARDS, CARD, NODES, RELICS, FORMS, TOKENS };



