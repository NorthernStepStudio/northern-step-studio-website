// Game data and tables.
const TIER_NAMES = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const TIER_COLORS = ['', '#aaaaaa', '#44ff88', '#44aaff', '#aa44ff', '#ffd700'];

const FUSION_COMBOS = {
  'fire+ice': { name: 'Frostfire', element: 'ice', icon: 'FI', bonus: 1.2 },
  'fire+lightning': { name: 'Plasma', element: 'lightning', icon: 'PL', bonus: 1.25 },
  'ice+lightning': { name: 'Supercell', element: 'lightning', icon: 'SC', bonus: 1.2 },
  'holy+shadow': { name: 'Twilight', element: 'shadow', icon: 'TW', bonus: 1.3 },
  'holy+fire': { name: 'Solar', element: 'fire', icon: 'SO', bonus: 1.2 },
  'shadow+ice': { name: 'Frostbite', element: 'ice', icon: 'FB', bonus: 1.15 }
};

const ELEMENTS = {
  fire: { strongAgainst: 'ice', icon: 'FI', color: '#ff4400' },
  ice: { strongAgainst: 'lightning', icon: 'IC', color: '#00ccff' },
  lightning: { strongAgainst: 'fire', icon: 'LG', color: '#ffcc00' },
  holy: { strongAgainst: 'shadow', icon: 'HO', color: '#ffffaa' },
  shadow: { strongAgainst: 'holy', icon: 'SH', color: '#aa00ff' },
  none: { icon: 'NE', color: '#ffffff' }
};

const CLS = {
  warrior: {
    name: 'BONK KNIGHT', emoji: 'WK', sprite: 'assets/sprites/warrior.png', hp: 120, mp: 30, atk: 15, def: 8, spd: 5, crit: 10, sw: 'iron_sword', element: 'none',
    skill: { name: 'POWER BONK', cost: 15, fn: 'powerBonk', vfx: 'crit', lvl: 1, element: 'fire' },
    skill2: { name: 'SHIELD WALL', cost: 20, fn: 'shieldWall', vfx: 'holy', lvl: 3, element: 'holy' },
    skill3: { name: 'WHIRLWIND', cost: 25, fn: 'whirlwind', vfx: 'slash', lvl: 6, element: 'lightning' },
    skill4: { name: 'BERSERK', cost: 40, fn: 'berserk', vfx: 'crit', lvl: 10, element: 'shadow' }
  },
  mage: {
    name: 'CHAOS WIZARD', emoji: 'CW', sprite: 'assets/sprites/mage.png', hp: 78, mp: 100, atk: 9, def: 4, spd: 6, crit: 14, sw: 'cursed_wand', element: 'fire',
    skill: { name: 'MYSTERY SPELL', cost: 22, fn: 'mysterySpell', vfx: 'magic', lvl: 1, element: 'lightning' },
    skill2: { name: 'TIME WARP', cost: 34, fn: 'timeWarp', vfx: 'magic', lvl: 3, element: 'ice' },
    skill3: { name: 'DOOM BOLT', cost: 36, fn: 'doomBolt', vfx: 'crit', lvl: 6, element: 'shadow' },
    skill4: { name: 'CHAOS METEOR', cost: 58, fn: 'chaosMeteor', vfx: 'bomb', lvl: 10, element: 'fire' }
  },
  rogue: {
    name: 'SNEAKY STABBER', emoji: 'RG', sprite: 'assets/sprites/rogue.png', hp: 85, mp: 50, atk: 12, def: 5, spd: 9, crit: 35, sw: 'shiv_shame', element: 'shadow',
    skill: { name: 'POISON STAB', cost: 20, fn: 'poisonStab', vfx: 'poison', lvl: 1, element: 'shadow' },
    skill2: { name: 'SMOKE BOMB', cost: 25, fn: 'smokeBomb', vfx: 'magic', lvl: 3, element: 'none' },
    skill3: { name: 'BACKSTAB', cost: 30, fn: 'backstab', vfx: 'crit', lvl: 6, element: 'none' },
    skill4: { name: 'ASSASSINATE', cost: 45, fn: 'assassinate', vfx: 'crit', lvl: 10, element: 'shadow' }
  },
  paladin: {
    name: 'HOLY YELLER', emoji: 'PD', sprite: 'assets/sprites/paladin.png', hp: 100, mp: 70, atk: 10, def: 12, spd: 4, crit: 8, sw: 'holy_mallet', element: 'holy',
    skill: { name: 'HOLY BONK', cost: 30, fn: 'holyBonk', vfx: 'holy', lvl: 1, element: 'holy' },
    skill2: { name: 'JUDGMENT', cost: 35, fn: 'judgment', vfx: 'crit', lvl: 3, element: 'lightning' },
    skill3: { name: 'HOLY NOVA', cost: 45, fn: 'holyNova', vfx: 'holy', lvl: 6, element: 'holy' },
    skill4: { name: 'DIVINE SHIELD', cost: 55, fn: 'divineShield', vfx: 'holy', lvl: 10, element: 'holy' }
  }
};

const WEAPON_TIERS = [
  [
    { id: 'iron_sword', name: 'Iron Sword', emoji: 'SW', effect: { atk: 5 }, element: 'none', value: 30 },
    { id: 'cursed_wand', name: 'Cursed Wand', emoji: 'WD', effect: { atk: 3, mp: 20 }, element: 'shadow', value: 30 },
    { id: 'shiv_shame', name: 'Shiv of Shame', emoji: 'KN', effect: { atk: 4, crit: 10 }, element: 'shadow', value: 30 },
    { id: 'holy_mallet', name: 'Holy Mallet', emoji: 'HM', effect: { atk: 3, def: 3 }, element: 'holy', value: 30 }
  ],
  [
    { id: 'steelsword', name: 'Steel Sword', emoji: 'SW', effect: { atk: 12 }, element: 'lightning', value: 80 },
    { id: 'firestick', name: 'Fire Staff', emoji: 'FS', effect: { atk: 10, mp: 30 }, element: 'fire', value: 80 },
    { id: 'shadow_blade', name: 'Shadow Blade', emoji: 'SB', effect: { atk: 11, crit: 15 }, element: 'shadow', value: 80 },
    { id: 'silver_cross', name: 'Silver Cross', emoji: 'CR', effect: { atk: 9, def: 6 }, element: 'holy', value: 80 }
  ],
  [
    { id: 'runesword', name: 'Rune Sword', emoji: 'RS', effect: { atk: 20 }, element: 'lightning', value: 180 },
    { id: 'chaos_staff', name: 'Chaos Staff', emoji: 'CS', effect: { atk: 17, mp: 50 }, element: 'fire', value: 180 },
    { id: 'venom_fang', name: 'Venom Fang', emoji: 'VF', effect: { atk: 18, crit: 20 }, element: 'shadow', value: 180 },
    { id: 'holy_lance', name: 'Holy Lance', emoji: 'HL', effect: { atk: 15, def: 12 }, element: 'holy', value: 180 }
  ],
  [
    { id: 'dragonbane', name: 'Dragonbane', emoji: 'DB', effect: { atk: 30 }, element: 'fire', value: 350 },
    { id: 'arcane_orb', name: 'Arcane Orb', emoji: 'AO', effect: { atk: 25, mp: 80 }, element: 'lightning', value: 350 },
    { id: 'nightmare', name: 'Nightmare', emoji: 'NM', effect: { atk: 28, crit: 30 }, element: 'shadow', value: 350 },
    { id: 'divinity', name: 'Divinity', emoji: 'DV', effect: { atk: 22, def: 20 }, element: 'holy', value: 350 }
  ],
  [
    { id: 'bonkinator', name: 'THE BONKINATOR', emoji: 'BK', effect: { atk: 45 }, element: 'lightning', value: 700 },
    { id: 'reality_wand', name: 'Reality Wand', emoji: 'RW', effect: { atk: 38, mp: 120 }, element: 'fire', value: 700 },
    { id: 'shadowfang', name: 'SHADOWFANG', emoji: 'SF', effect: { atk: 42, crit: 40 }, element: 'shadow', value: 700 },
    { id: 'armageddon', name: 'ARMAGEDDON', emoji: 'AG', effect: { atk: 35, def: 30 }, element: 'fire', value: 700 }
  ]
];

const ARMOR_TIERS = [
  [{ id: 'cardboard', name: 'Cardboard Armor', emoji: 'CB', effect: { def: 4 }, value: 25 }],
  [{ id: 'leather', name: 'Leather Armor', emoji: 'LA', effect: { def: 10 }, value: 80 }],
  [{ id: 'chainmail', name: 'Chainmail', emoji: 'CM', effect: { def: 18 }, value: 180 }],
  [{ id: 'platemail', name: 'Plate Mail', emoji: 'PM', effect: { def: 28 }, value: 350 }],
  [{ id: 'dragonscale', name: 'Dragon Scale', emoji: 'DS', effect: { def: 40 }, value: 700 }]
];

const RING_TIERS = [
  [{ id: 'ring_speed', name: 'Ring of Speed', emoji: 'RS', effect: { spd: 3, crit: 10 }, value: 60 }],
  [{ id: 'ring_power', name: 'Ring of Power', emoji: 'RP', effect: { atk: 8 }, value: 100 }],
  [{ id: 'ring_arcane', name: 'Arcane Ring', emoji: 'AR', effect: { atk: 12, mp: 40 }, value: 200 }],
  [{ id: 'ring_void', name: 'Void Ring', emoji: 'VR', effect: { atk: 18, crit: 25 }, value: 400 }],
  [{ id: 'ring_omni', name: 'RING OF EVERYTHING', emoji: 'RO', effect: { atk: 20, def: 15, spd: 5, crit: 20 }, value: 800 }]
];

const CONSUMABLES = [
  { id: 'hp1', name: 'HP Potion', emoji: 'HP', type: 'hp_pot', desc: 'Heals 45 HP.', effect: { hp: 45 }, value: 20, isHp: true, tier: 1 },
  { id: 'hp2', name: 'Big HP Potion', emoji: 'HX', type: 'hp_pot', desc: 'Full HP restore.', effect: { hpFull: true }, value: 80, isHp: true, tier: 2 },
  { id: 'mp1', name: 'MP Potion', emoji: 'MP', type: 'mp_pot', desc: 'Restores 55 MP.', effect: { mp: 55 }, value: 25, isMp: true, tier: 1 },
  { id: 'mp2', name: 'Big MP Potion', emoji: 'MX', type: 'mp_pot', desc: 'Full MP restore.', effect: { mpFull: true }, value: 75, isMp: true, tier: 2 },
  { id: 'bomb', name: 'Cartoon Bomb', emoji: 'BM', type: 'consumable', desc: 'BOOM. 70 damage.', effect: { bomb: 70 }, value: 40, tier: 1 },
  { id: 'gold1', name: 'Gold Bag', emoji: 'GB', type: 'gold', desc: 'Found on the ground.', effect: { gold: 30 }, value: 30, tier: 1 }
];

const MATERIALS = {
  iron_ore: { id: 'iron_ore', name: 'Iron Ore', emoji: 'IO', rarity: 1, floor: 1, value: 8, desc: 'Basic metal.' },
  iron_bar: { id: 'iron_bar', name: 'Iron Bar', emoji: 'IB', rarity: 1, floor: 1, value: 15, desc: 'Smelted iron.' },
  leather: { id: 'leather', name: 'Leather Strip', emoji: 'LT', rarity: 1, floor: 1, value: 10, desc: 'Scraped from something.' },
  wood_shard: { id: 'wood_shard', name: 'Wood Shard', emoji: 'WS', rarity: 1, floor: 1, value: 8, desc: 'Splintered.' },
  bone_shard: { id: 'bone_shard', name: 'Bone Shard', emoji: 'BS', rarity: 1, floor: 1, value: 12, desc: 'Rattles.' },
  steel_bar: { id: 'steel_bar', name: 'Steel Bar', emoji: 'SB', rarity: 2, floor: 2, value: 35, desc: 'Harder than iron.' },
  magic_dust: { id: 'magic_dust', name: 'Magic Dust', emoji: 'MD', rarity: 2, floor: 2, value: 40, desc: 'Smells of ozone.' },
  beast_fang: { id: 'beast_fang', name: 'Beast Fang', emoji: 'BF', rarity: 2, floor: 2, value: 45, desc: 'Still sharp.' },
  void_shard: { id: 'void_shard', name: 'Void Shard', emoji: 'VS', rarity: 3, floor: 3, value: 80, desc: 'Hums with dark energy.' },
  rune_stone: { id: 'rune_stone', name: 'Rune Stone', emoji: 'RS', rarity: 3, floor: 3, value: 90, desc: 'Ancient script.' },
  shadow_silk: { id: 'shadow_silk', name: 'Shadow Silk', emoji: 'SS', rarity: 3, floor: 3, value: 75, desc: 'Woven by shadow spiders.' },
  holy_water: { id: 'holy_water', name: 'Holy Water', emoji: 'HW', rarity: 3, floor: 3, value: 85, desc: 'Blessed.' },
  dragon_scale: { id: 'dragon_scale', name: 'Dragon Scale', emoji: 'DS', rarity: 4, floor: 4, value: 200, desc: 'Off a dragon.' },
  void_crystal: { id: 'void_crystal', name: 'Void Crystal', emoji: 'VC', rarity: 4, floor: 4, value: 250, desc: 'Nothingness.' },
  boss_essence: { id: 'boss_essence', name: 'Boss Essence', emoji: 'BE', rarity: 4, floor: 5, value: 400, desc: 'Defeated greatness.' },
  mushroom: { id: 'mushroom', name: 'Gloom Mushroom', emoji: 'GM', rarity: 1, floor: 1, value: 10, desc: 'Damp.' },
  firebloom: { id: 'firebloom', name: 'Firebloom', emoji: 'FB', rarity: 2, floor: 2, value: 50, desc: 'Burns to the touch.' },
  moonpetal: { id: 'moonpetal', name: 'Moon Petal', emoji: 'MP', rarity: 3, floor: 3, value: 90, desc: 'Blooms in darkness.' },
  chaos_gem: { id: 'chaos_gem', name: 'Chaos Gem', emoji: 'CG', rarity: 3, floor: 3, value: 110, desc: 'Unpredictable.' }
};

const BLUEPRINTS = [
  { id: 'bp_iron_sword', name: 'Iron Sword', emoji: 'SW', cat: 'Sword', type: 'weapon', tier: 1, effect: { atk: 7 }, mats: [{ id: 'iron_bar', qty: 2 }, { id: 'wood_shard', qty: 1 }], goldCost: 20, desc: 'Basic sword.' },
  { id: 'bp_steel_sword', name: 'Steel Sword', emoji: 'SW', cat: 'Sword', type: 'weapon', tier: 2, effect: { atk: 15 }, mats: [{ id: 'steel_bar', qty: 2 }, { id: 'leather', qty: 1 }], goldCost: 60, desc: 'Balance and edge.' },
  { id: 'bp_runesword', name: 'Rune Sword', emoji: 'RS', cat: 'Sword', type: 'weapon', tier: 3, effect: { atk: 25, crit: 10 }, mats: [{ id: 'steel_bar', qty: 2 }, { id: 'rune_stone', qty: 1 }, { id: 'magic_dust', qty: 1 }], goldCost: 140, desc: 'Glows judgmentally.' },
  { id: 'bp_dragonbane', name: 'Dragonbane', emoji: 'DB', cat: 'Sword', type: 'weapon', tier: 4, effect: { atk: 38 }, mats: [{ id: 'dragon_scale', qty: 2 }, { id: 'void_shard', qty: 1 }, { id: 'steel_bar', qty: 1 }], goldCost: 300, desc: 'Upsets dragons.' },
  { id: 'bp_bonkinator', name: 'THE BONKINATOR', emoji: 'BK', cat: 'Sword', type: 'weapon', tier: 5, effect: { atk: 50 }, mats: [{ id: 'dragon_scale', qty: 2 }, { id: 'void_crystal', qty: 1 }, { id: 'boss_essence', qty: 1 }], goldCost: 500, desc: 'Ultimate bonking.' },
  { id: 'bp_bone_mace', name: 'Bone Mace', emoji: 'MC', cat: 'Mace', type: 'weapon', tier: 1, effect: { atk: 8, def: 1 }, mats: [{ id: 'bone_shard', qty: 3 }, { id: 'leather', qty: 1 }], goldCost: 25, desc: 'Haunted.' },
  { id: 'bp_iron_mace', name: 'Iron Mace', emoji: 'MC', cat: 'Mace', type: 'weapon', tier: 2, effect: { atk: 14, def: 3 }, mats: [{ id: 'iron_bar', qty: 3 }, { id: 'bone_shard', qty: 1 }], goldCost: 70, desc: 'Head-shaped.' },
  { id: 'bp_holy_mace', name: 'Holy Mace', emoji: 'HM', cat: 'Mace', type: 'weapon', tier: 3, effect: { atk: 20, def: 8 }, mats: [{ id: 'steel_bar', qty: 2 }, { id: 'holy_water', qty: 2 }], goldCost: 150, desc: 'Blessed and deadly.' },
  { id: 'bp_void_crusher', name: 'Void Crusher', emoji: 'VC', cat: 'Mace', type: 'weapon', tier: 4, effect: { atk: 32, def: 12 }, mats: [{ id: 'void_shard', qty: 2 }, { id: 'dragon_scale', qty: 1 }], goldCost: 320, desc: 'Crushes void.' },
  { id: 'bp_doom_gavel', name: 'DOOM GAVEL', emoji: 'DG', cat: 'Mace', type: 'weapon', tier: 5, effect: { atk: 44, def: 18 }, mats: [{ id: 'void_crystal', qty: 1 }, { id: 'boss_essence', qty: 1 }, { id: 'dragon_scale', qty: 2 }], goldCost: 520, desc: 'Judge and executioner.' },
  { id: 'bp_wood_spear', name: 'Wooden Spear', emoji: 'SP', cat: 'Spear', type: 'weapon', tier: 1, effect: { atk: 6, crit: 8 }, mats: [{ id: 'wood_shard', qty: 3 }, { id: 'bone_shard', qty: 1 }], goldCost: 18, desc: 'Pointy end out.' },
  { id: 'bp_iron_spear', name: 'Iron Spear', emoji: 'SP', cat: 'Spear', type: 'weapon', tier: 2, effect: { atk: 13, crit: 12 }, mats: [{ id: 'iron_bar', qty: 2 }, { id: 'wood_shard', qty: 2 }], goldCost: 65, desc: 'Reach out and touch someone.' },
  { id: 'bp_shadow_spear', name: 'Shadow Spear', emoji: 'SS', cat: 'Spear', type: 'weapon', tier: 3, effect: { atk: 22, crit: 18 }, mats: [{ id: 'shadow_silk', qty: 2 }, { id: 'steel_bar', qty: 1 }, { id: 'beast_fang', qty: 1 }], goldCost: 160, desc: 'Throws shadows.' },
  { id: 'bp_dragon_lance', name: 'Dragon Lance', emoji: 'DL', cat: 'Spear', type: 'weapon', tier: 4, effect: { atk: 34, crit: 22 }, mats: [{ id: 'dragon_scale', qty: 2 }, { id: 'rune_stone', qty: 1 }], goldCost: 310, desc: 'Dragon knight gear.' },
  { id: 'bp_void_lance', name: 'VOID LANCE', emoji: 'VL', cat: 'Spear', type: 'weapon', tier: 5, effect: { atk: 46, crit: 30 }, mats: [{ id: 'void_crystal', qty: 2 }, { id: 'boss_essence', qty: 1 }, { id: 'chaos_gem', qty: 1 }], goldCost: 540, desc: 'Pierces dimensions.' },
  { id: 'bp_stick', name: 'Magic Stick', emoji: 'MS', cat: 'Staff', type: 'weapon', tier: 1, effect: { atk: 4, mp: 25 }, mats: [{ id: 'wood_shard', qty: 2 }, { id: 'mushroom', qty: 1 }], goldCost: 20, desc: 'Ambitions.' },
  { id: 'bp_fire_staff', name: 'Fire Staff', emoji: 'FS', cat: 'Staff', type: 'weapon', tier: 2, effect: { atk: 10, mp: 40 }, mats: [{ id: 'rune_stone', qty: 1 }, { id: 'firebloom', qty: 2 }], goldCost: 80, desc: 'Fire hazard.' },
  { id: 'bp_chaos_staff', name: 'Chaos Staff', emoji: 'CS', cat: 'Staff', type: 'weapon', tier: 3, effect: { atk: 18, mp: 60 }, mats: [{ id: 'chaos_gem', qty: 1 }, { id: 'magic_dust', qty: 2 }, { id: 'rune_stone', qty: 1 }], goldCost: 170, desc: 'Random spells.' },
  { id: 'bp_arcane_orb', name: 'Arcane Orb', emoji: 'AO', cat: 'Staff', type: 'weapon', tier: 4, effect: { atk: 28, mp: 90 }, mats: [{ id: 'void_shard', qty: 1 }, { id: 'chaos_gem', qty: 2 }, { id: 'moonpetal', qty: 1 }], goldCost: 330, desc: 'Floats menacingly.' },
  { id: 'bp_reality_wand', name: 'Reality Wand', emoji: 'RW', cat: 'Staff', type: 'weapon', tier: 5, effect: { atk: 42, mp: 130 }, mats: [{ id: 'void_crystal', qty: 2 }, { id: 'boss_essence', qty: 1 }, { id: 'chaos_gem', qty: 1 }], goldCost: 560, desc: 'Rewrites reality.' },
  { id: 'bp_leather_armor', name: 'Leather Armor', emoji: 'LA', cat: 'Armor', type: 'armor', tier: 1, effect: { def: 6 }, mats: [{ id: 'leather', qty: 3 }], goldCost: 20, desc: 'Old leather.' },
  { id: 'bp_iron_armor', name: 'Iron Armor', emoji: 'IA', cat: 'Armor', type: 'armor', tier: 2, effect: { def: 14 }, mats: [{ id: 'iron_bar', qty: 3 }, { id: 'leather', qty: 1 }], goldCost: 75, desc: 'Occasionally a sauna.' },
  { id: 'bp_chainmail', name: 'Chainmail', emoji: 'CM', cat: 'Armor', type: 'armor', tier: 3, effect: { def: 22 }, mats: [{ id: 'steel_bar', qty: 3 }, { id: 'iron_bar', qty: 1 }], goldCost: 165, desc: 'Tiny rings of optimism.' },
  { id: 'bp_shadow_armor', name: 'Shadow Armor', emoji: 'SA', cat: 'Armor', type: 'armor', tier: 4, effect: { def: 32, spd: 3 }, mats: [{ id: 'shadow_silk', qty: 3 }, { id: 'void_shard', qty: 1 }], goldCost: 340, desc: 'Wearable darkness.' },
  { id: 'bp_dragonscale', name: 'Dragon Scale Mail', emoji: 'DM', cat: 'Armor', type: 'armor', tier: 5, effect: { def: 45, spd: 2 }, mats: [{ id: 'dragon_scale', qty: 3 }, { id: 'void_crystal', qty: 1 }, { id: 'boss_essence', qty: 1 }], goldCost: 580, desc: 'Dragon is annoyed.' },
  { id: 'bp_leather_boots', name: 'Leather Boots', emoji: 'LB', cat: 'Boots', type: 'armor', tier: 1, effect: { def: 3, spd: 2 }, mats: [{ id: 'leather', qty: 2 }], goldCost: 15, desc: 'Haunted.' },
  { id: 'bp_iron_boots', name: 'Iron Boots', emoji: 'IB', cat: 'Boots', type: 'armor', tier: 2, effect: { def: 8, spd: 3 }, mats: [{ id: 'iron_bar', qty: 2 }, { id: 'leather', qty: 1 }], goldCost: 55, desc: 'Clank clank.' },
  { id: 'bp_rune_boots', name: 'Rune Boots', emoji: 'RB', cat: 'Boots', type: 'armor', tier: 3, effect: { def: 12, spd: 6 }, mats: [{ id: 'rune_stone', qty: 1 }, { id: 'steel_bar', qty: 1 }, { id: 'magic_dust', qty: 1 }], goldCost: 145, desc: 'Fast flee.' },
  { id: 'bp_shadow_boots', name: 'Shadow Boots', emoji: 'SB', cat: 'Boots', type: 'armor', tier: 4, effect: { def: 16, spd: 10, crit: 8 }, mats: [{ id: 'shadow_silk', qty: 2 }, { id: 'void_shard', qty: 1 }, { id: 'beast_fang', qty: 1 }], goldCost: 300, desc: 'Move like shadow.' },
  { id: 'bp_void_striders', name: 'VOID STRIDERS', emoji: 'VS', cat: 'Boots', type: 'armor', tier: 5, effect: { def: 20, spd: 14, crit: 15 }, mats: [{ id: 'void_crystal', qty: 1 }, { id: 'boss_essence', qty: 1 }, { id: 'shadow_silk', qty: 2 }], goldCost: 500, desc: 'Walk between dimensions.' },
  { id: 'bp_bone_helmet', name: 'Bone Helmet', emoji: 'BH', cat: 'Helmet', type: 'armor', tier: 1, effect: { def: 4 }, mats: [{ id: 'bone_shard', qty: 3 }], goldCost: 18, desc: 'Another skull.' },
  { id: 'bp_iron_helm', name: 'Iron Helm', emoji: 'IH', cat: 'Helmet', type: 'armor', tier: 2, effect: { def: 11 }, mats: [{ id: 'iron_bar', qty: 2 }, { id: 'leather', qty: 1 }], goldCost: 60, desc: 'Headache.' },
  { id: 'bp_rune_crown', name: 'Rune Crown', emoji: 'RC', cat: 'Helmet', type: 'armor', tier: 3, effect: { def: 18, mp: 30 }, mats: [{ id: 'rune_stone', qty: 2 }, { id: 'magic_dust', qty: 1 }], goldCost: 155, desc: 'Fashion power.' },
  { id: 'bp_void_helm', name: 'Void Helm', emoji: 'VH', cat: 'Helmet', type: 'armor', tier: 4, effect: { def: 27, crit: 10 }, mats: [{ id: 'void_shard', qty: 2 }, { id: 'chaos_gem', qty: 1 }], goldCost: 330, desc: 'Sees too much.' },
  { id: 'bp_dragon_crown', name: 'DRAGON CROWN', emoji: 'DC', cat: 'Helmet', type: 'armor', tier: 5, effect: { def: 38, crit: 15, mp: 50 }, mats: [{ id: 'dragon_scale', qty: 2 }, { id: 'boss_essence', qty: 1 }, { id: 'void_crystal', qty: 1 }], goldCost: 560, desc: 'A dragon wore this.' },
  { id: 'bp_speed_ring', name: 'Ring of Speed', emoji: 'RS', cat: 'Ring', type: 'ring', tier: 1, effect: { spd: 4, crit: 10 }, mats: [{ id: 'iron_ore', qty: 2 }, { id: 'beast_fang', qty: 1 }], goldCost: 30, desc: 'Less dead.' },
  { id: 'bp_power_ring', name: 'Ring of Power', emoji: 'RP', cat: 'Ring', type: 'ring', tier: 2, effect: { atk: 10 }, mats: [{ id: 'steel_bar', qty: 1 }, { id: 'chaos_gem', qty: 1 }], goldCost: 90, desc: 'Original name.' },
  { id: 'bp_arcane_ring', name: 'Arcane Ring', emoji: 'AR', cat: 'Ring', type: 'ring', tier: 3, effect: { atk: 14, mp: 50 }, mats: [{ id: 'rune_stone', qty: 1 }, { id: 'moonpetal', qty: 1 }, { id: 'magic_dust', qty: 1 }], goldCost: 175, desc: 'Somewhat rude.' },
  { id: 'bp_void_ring', name: 'Void Ring', emoji: 'VR', cat: 'Ring', type: 'ring', tier: 4, effect: { atk: 22, crit: 28 }, mats: [{ id: 'void_shard', qty: 2 }, { id: 'chaos_gem', qty: 1 }], goldCost: 360, desc: 'Powerful nothing.' },
  { id: 'bp_omni_ring', name: 'RING OF EVERYTHING', emoji: 'RO', cat: 'Ring', type: 'ring', tier: 5, effect: { atk: 22, def: 16, spd: 6, crit: 22 }, mats: [{ id: 'void_crystal', qty: 1 }, { id: 'boss_essence', qty: 1 }, { id: 'dragon_scale', qty: 1 }, { id: 'chaos_gem', qty: 1 }], goldCost: 600, desc: 'Showoff.' }
];

const ALCH_RECIPES = [
  { id: 'ar_hp_pot', name: 'HP Potion', emoji: 'HP', mageOnly: false, mats: [{ id: 'mushroom', qty: 2 }, { id: 'firebloom', qty: 1 }], goldCost: 10, result: { ...CONSUMABLES[0] }, desc: 'Heals 45 HP.' },
  { id: 'ar_big_hp', name: 'Big HP Potion', emoji: 'HX', mageOnly: false, mats: [{ id: 'firebloom', qty: 2 }, { id: 'moonpetal', qty: 1 }], goldCost: 30, result: { ...CONSUMABLES[1] }, desc: 'Full restore.' },
  { id: 'ar_mp_pot', name: 'MP Potion', emoji: 'MP', mageOnly: false, mats: [{ id: 'mushroom', qty: 1 }, { id: 'magic_dust', qty: 1 }], goldCost: 12, result: { ...CONSUMABLES[2] }, desc: 'Restores 55 MP.' },
  { id: 'ar_big_mp', name: 'Big MP Potion', emoji: 'MX', mageOnly: false, mats: [{ id: 'moonpetal', qty: 2 }, { id: 'magic_dust', qty: 1 }], goldCost: 35, result: { ...CONSUMABLES[3] }, desc: 'Full restore.' },
  { id: 'ar_bomb', name: 'Cartoon Bomb', emoji: 'BM', mageOnly: false, mats: [{ id: 'firebloom', qty: 2 }, { id: 'chaos_gem', qty: 1 }], goldCost: 20, result: { ...CONSUMABLES[4] }, desc: 'BOOM.' },
  { id: 'ar_berserker', name: 'Berserker Elixir', emoji: 'BE', mageOnly: true, mats: [{ id: 'beast_fang', qty: 2 }, { id: 'firebloom', qty: 1 }, { id: 'chaos_gem', qty: 1 }], goldCost: 50, result: { id: 'berserker', name: 'Berserker Elixir', emoji: 'BE', type: 'elixir', desc: '+18 ATK this floor.', effect: { elixirAtk: 18 }, value: 80, tier: 2 }, desc: '+18 ATK this floor.' },
  { id: 'ar_iron_skin', name: 'Iron Skin Elixir', emoji: 'IS', mageOnly: true, mats: [{ id: 'iron_ore', qty: 3 }, { id: 'mushroom', qty: 2 }], goldCost: 45, result: { id: 'ironskin', name: 'Iron Skin Elixir', emoji: 'IS', type: 'elixir', desc: '+12 DEF this floor.', effect: { elixirDef: 12 }, value: 70, tier: 2 }, desc: '+12 DEF this floor.' },
  { id: 'ar_swift_brew', name: 'Swift Brew', emoji: 'SB', mageOnly: true, mats: [{ id: 'moonpetal', qty: 1 }, { id: 'shadow_silk', qty: 1 }], goldCost: 40, result: { id: 'swiftbrew', name: 'Swift Brew', emoji: 'SB', type: 'elixir', desc: '+6 SPD and +16 CRIT this floor.', effect: { elixirSpd: 6, elixirCrit: 16 }, value: 70, tier: 2 }, desc: '+6 SPD and +16 CRIT this floor.' },
  { id: 'ar_chaos_brew', name: 'Chaos Brew', emoji: 'CB', mageOnly: true, mats: [{ id: 'chaos_gem', qty: 2 }, { id: 'void_shard', qty: 1 }], goldCost: 80, result: { id: 'chaosbrew', name: 'Chaos Brew', emoji: 'CB', type: 'elixir', desc: 'Chaos this floor.', effect: { chaos: true }, value: 120, tier: 3 }, desc: 'Who knows.' }
];

const ENEMIES = [
  { name: 'CONFUSED RAT', emoji: 'RT', baseHp: 12, baseAtk: 4, def: 0, xp: 8, gold: 2, floor: 1, wpn: 'Tiny Teeth', element: 'none', taunt: ['*confused rat noises*', 'Why am I here?', 'I regret everything.'] },
  { name: 'GOBLIN ACCOUNTANT', emoji: 'GB', baseHp: 22, baseAtk: 7, def: 2, xp: 18, gold: 8, floor: 1, wpn: 'Tax Form', element: 'shadow', taunt: ['Your taxes are LATE!', 'I audit thee!', 'DEDUCTIBLE DAMAGE!'] },
  { name: 'DRAMATIC GHOST', emoji: 'GH', baseHp: 18, baseAtk: 9, def: 1, xp: 15, gold: 5, floor: 1, wpn: 'Spooky Hands', element: 'shadow', taunt: ["I'm not real!", 'BOO (shy)', 'Wrong dungeon...'] },
  { name: 'SKELETON', emoji: 'SK', baseHp: 35, baseAtk: 10, def: 5, xp: 25, gold: 15, floor: 1, sw: 'iron_sword', element: 'none' },
  { name: 'SKELETON DJ', emoji: 'DJ', baseHp: 30, baseAtk: 10, def: 4, xp: 25, gold: 10, floor: 2, wpn: 'Sick Beats', element: 'lightning', taunt: ['DROP THE MARROW!', '*bone rattles*'] },
  { name: 'ANGRY MUSHROOM', emoji: 'MU', baseHp: 35, baseAtk: 12, def: 3, xp: 30, gold: 12, floor: 2, wpn: 'Spore Cloud', element: 'fire', taunt: ['NOT A VEGETABLE', 'FUNGAL. RUDE.'] },
  { name: 'ORC SMASH', emoji: 'OR', baseHp: 65, baseAtk: 16, def: 8, xp: 50, gold: 30, floor: 2, sw: 'iron_sword', element: 'none' },
  { name: 'DISCOUNT DRAGON', emoji: 'DD', baseHp: 55, baseAtk: 18, def: 8, xp: 60, gold: 30, floor: 3, wpn: 'Budget Fire', element: 'fire', taunt: ['ROAR... cough', 'My fire is vaping.'] },
  { name: 'EVIL WIZARD', emoji: 'EW', baseHp: 45, baseAtk: 22, def: 5, xp: 55, gold: 25, floor: 3, wpn: 'Backwards Wand', element: 'shadow', taunt: ['Graduated LAST', 'This spell hurts me! Ow.'] },
  { name: 'WIZARD NERD', emoji: 'WN', baseHp: 50, baseAtk: 22, def: 4, xp: 60, gold: 40, floor: 3, sw: 'cursed_wand', element: 'lightning' },
  { name: 'STRESSED TROLL', emoji: 'TR', baseHp: 70, baseAtk: 20, def: 10, xp: 80, gold: 35, floor: 4, wpn: 'Giant Rock', element: 'none', taunt: ['I need VACATION', 'BRIDGE GONE. LIFE GONE.'] },
  { name: 'CORPORATE DEMON', emoji: 'CD', baseHp: 90, baseAtk: 28, def: 12, xp: 120, gold: 60, floor: 4, wpn: 'Spreadsheet', element: 'shadow', taunt: ['Synergize your doom!', 'Your soul = resource.'] },
  { name: 'DARK KNIGHT', emoji: 'DK', baseHp: 110, baseAtk: 28, def: 18, xp: 120, gold: 80, floor: 4, sw: 'holy_mallet', element: 'shadow' },
  { name: 'PIT DWELLER', emoji: 'PD', baseHp: 150, baseAtk: 35, def: 22, xp: 200, gold: 120, floor: 6, sw: 'shiv_shame', element: 'shadow' },
  { name: 'OBSIDIAN GOLEM', emoji: 'OG', baseHp: 220, baseAtk: 45, def: 35, xp: 350, gold: 200, floor: 9, sw: 'holy_mallet', element: 'ice' },
  { name: 'VOID SPECTRE', emoji: 'VS', baseHp: 180, baseAtk: 60, def: 10, xp: 450, gold: 250, floor: 12, sw: 'cursed_wand', element: 'shadow' },
  { name: 'THE BIG BAD', emoji: 'BB', baseHp: 250, baseAtk: 38, def: 18, xp: 500, gold: 300, floor: 5, boss: true, wpn: 'Doom Itself', element: 'shadow', taunt: ['FINALLY! An appointment!', 'After my coffee. DOOM.'] }
];

const FLOOR_BOSSES = [
  { name: 'CHAIRMAN OF THE BOARD', emoji: 'CB', baseHp: 50, baseAtk: 12, def: 5, xp: 100, gold: 50, floor: 1, boss: true, wpn: 'Heavy Folder', element: 'shadow', taunt: ['I need those reports!', "You're FIRED!", "Let's take this offline."] },
  { name: 'THE DISCO INFERNO', emoji: 'DI', baseHp: 80, baseAtk: 18, def: 8, xp: 200, gold: 100, floor: 2, boss: true, wpn: 'Finger Guns', element: 'fire', taunt: ["STAYIN' ALIVE? NOPE.", 'FEVER!', "Dance til you're dead!"] },
  { name: 'CAPTAIN OVERPRICE', emoji: 'CO', baseHp: 130, baseAtk: 24, def: 12, xp: 350, gold: 250, floor: 3, boss: true, wpn: 'Bag of Coins', element: 'shadow', taunt: ['No refunds!', "Inflation hurts, doesn't it?", "That'll be your LIFE."] },
  { name: 'THE INTERN FROM HELL', emoji: 'IH', baseHp: 180, baseAtk: 32, def: 16, xp: 500, gold: 400, floor: 4, boss: true, wpn: 'Toxic Coffee', element: 'shadow', taunt: ['Is this project due now?', "I don't get paid enough!", 'Can I put this on my CV?'] }
];

const PERKS = [
  { name: 'BIG BONK ENERGY', desc: '+8 ATK.', effect: { atk: 8 } },
  { name: 'THICK SKIN', desc: '+6 DEF.', effect: { def: 6 } },
  { name: 'EXTRA ORGAN', desc: '+40 Max HP.', effect: { maxHp: 40 } },
  { name: 'BRAIN ENLARGEMENT', desc: '+40 Max MP.', effect: { maxMp: 40 } },
  { name: 'GLASS HALF FULL', desc: 'Potions heal 50% more.', effect: { potBoost: 0.5 } },
  { name: 'LUCKY FEET', desc: '+4 SPD, +15% Crit.', effect: { spd: 4, crit: 15 } },
  { name: 'GOLD DETECTOR', desc: '+30% gold.', effect: { goldBoost: 0.3 } },
  { name: 'VAMPIRIC TENDENCIES', desc: 'Heal 20% of damage dealt.', effect: { lifesteal: 0.2 } },
  { name: 'EXPLOSION FAN', desc: 'Bombs +50% damage.', effect: { bombBoost: 0.5 } },
  { name: 'SECOND BREAKFAST', desc: '25% chance to eat the enemy for HP.', effect: { cannibal: 0.25 } }
];

const EPITAPHS = [
  'Died for a rat. A CONFUSED RAT.',
  'Inventory full of trash.',
  'Died doing what they loved: dying.',
  'Left a chest unopened.',
  'Touched grass. It was a trap.'
];
