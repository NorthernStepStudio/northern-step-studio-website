// ═══════════════════════════════
// GAME DATA
// ═══════════════════════════════
const TIER_NAMES = ['','Common','Uncommon','Rare','Epic','Legendary'];
const TIER_COLORS = ['','#aaaaaa','#44ff88','#44aaff','#aa44ff','#ffd700'];

const CLS={
  warrior:{name:'BONK KNIGHT',emoji:'🗡️',hp:150,mp:30,atk:28,def:12,spd:5,crit:12,sw:'iron_sword',
    skill:{name:'POWER BONK',cost:15,fn:'powerBonk',vfx:'crit'}},
  mage:{name:'CHAOS WIZARD',emoji:'🔮',hp:90,mp:120,atk:22,def:5,spd:7,crit:18,sw:'cursed_wand',
    skill:{name:'MYSTERY SPELL',cost:25,fn:'mysterySpell',vfx:'magic'}},
  rogue:{name:'SNEAKY STABBER',emoji:'🗡️',hp:110,mp:55,atk:24,def:8,spd:12,crit:42,sw:'shiv_shame',
    skill:{name:'POISON STAB',cost:20,fn:'poisonStab',vfx:'poison'}},
  paladin:{name:'HOLY YELLER',emoji:'🛡️',hp:130,mp:80,atk:22,def:18,spd:5,crit:10,sw:'holy_mallet',
    skill:{name:'HOLY BONK',cost:30,fn:'holyBonk',vfx:'holy'}}
};

// WEAPONS by tier (tier 1–5)
const WEAPON_TIERS = [
  // T1 — starting weapons, decent power
  [
    {id:'iron_sword',  name:'Iron Sword',    emoji:'🗡️', effect:{atk:10},          value:30},
    {id:'cursed_wand', name:'Cursed Wand',   emoji:'🪄', effect:{atk:7, mp:25},    value:30},
    {id:'shiv_shame',  name:'Shiv of Shame', emoji:'🗡️', effect:{atk:8, crit:12},  value:30},
    {id:'holy_mallet', name:'Holy Mallet',   emoji:'🔨', effect:{atk:7, def:5},    value:30}
  ],
  // T2 — real improvement
  [
    {id:'steelsword',  name:'Steel Sword',   emoji:'⚔️', effect:{atk:22},          value:80},
    {id:'firestick',   name:'Fire Staff',    emoji:'🔥', effect:{atk:18, mp:40},   value:80},
    {id:'shadow_blade',name:'Shadow Blade',  emoji:'🗡️', effect:{atk:20, crit:18}, value:80},
    {id:'silver_cross',name:'Silver Cross',  emoji:'✝️', effect:{atk:16, def:10},  value:80}
  ],
  // T3 — strong
  [
    {id:'runesword',   name:'Rune Sword',    emoji:'⚔️', effect:{atk:36},          value:180},
    {id:'chaos_staff', name:'Chaos Staff',   emoji:'🔮', effect:{atk:30, mp:60},   value:180},
    {id:'venom_fang',  name:'Venom Fang',    emoji:'🦷', effect:{atk:33, crit:25}, value:180},
    {id:'holy_lance',  name:'Holy Lance',    emoji:'✝️', effect:{atk:28, def:18},  value:180}
  ],
  // T4 — powerful
  [
    {id:'dragonbane',  name:'Dragonbane',    emoji:'🐉', effect:{atk:52},          value:350},
    {id:'arcane_orb',  name:'Arcane Orb',    emoji:'🔮', effect:{atk:44, mp:90},   value:350},
    {id:'nightmare',   name:'Nightmare',     emoji:'👹', effect:{atk:48, crit:35}, value:350},
    {id:'divinity',    name:'Divinity',      emoji:'👑', effect:{atk:40, def:28},  value:350}
  ],
  // T5 — godlike
  [
    {id:'bonkinator',  name:'THE BONKINATOR',emoji:'🔨', effect:{atk:75},              value:700},
    {id:'reality_wand',name:'Reality Wand',  emoji:'🌌', effect:{atk:62, mp:150},      value:700},
    {id:'shadowfang',  name:'SHADOWFANG',    emoji:'🌑', effect:{atk:68, crit:45},     value:700},
    {id:'armageddon',  name:'ARMAGEDDON',    emoji:'☠️', effect:{atk:58, def:35},      value:700}
  ],
  // T6 — transcendent (fusion only)
  [
    {id:'worldender',  name:'World Ender',   emoji:'🔥', effect:{atk:110, crit:20},    value:1500},
    {id:'void_staff',  name:'Void Staff',    emoji:'🌀', effect:{atk:95, mp:200},      value:1500},
    {id:'eclipse',     name:'Eclipse',       emoji:'🌘', effect:{atk:100, crit:55},    value:1500},
    {id:'apocalypse',  name:'Apocalypse',    emoji:'⚡', effect:{atk:90, def:50},      value:1500}
  ],
  // T7 — legendary (fusion only)
  [
    {id:'godslayer',   name:'GODSLAYER',     emoji:'🔮', effect:{atk:155, crit:25},    value:3000},
    {id:'infinity_rod',name:'Infinity Rod',  emoji:'✨', effect:{atk:135, mp:300},     value:3000},
    {id:'oblivion',    name:'OBLIVION',      emoji:'🌑', effect:{atk:145, crit:65},    value:3000},
    {id:'divine_wrath',name:'Divine Wrath',  emoji:'🌟', effect:{atk:125, def:70},     value:3000}
  ],
  // T8 — mythic (triple fusion only)
  [
    {id:'the_bonk',    name:'★ THE BONK',  emoji:'🕯️', effect:{atk:220, crit:30, def:40},  value:6000},
    {id:'universal',   name:'UNIVERSAL',    emoji:'🌐', effect:{atk:190, mp:400, crit:50},  value:6000},
    {id:'singularity', name:'SINGULARITY',  emoji:'🔱', effect:{atk:200, crit:80},          value:6000},
    {id:'the_holy_bonk',name:'HOLY BONK∞', emoji:'✨', effect:{atk:175, def:100, crit:30}, value:6000}
  ],
];

const ARMOR_TIERS = [
  [{id:'cardboard',   name:'Cardboard Armor', emoji:'📦', effect:{def:6},           value:25}],
  [{id:'leather',     name:'Leather Armor',   emoji:'🥾', effect:{def:16},          value:80}],
  [{id:'chainmail',   name:'Chainmail',        emoji:'⛑️', effect:{def:28},          value:180}],
  [{id:'platemail',   name:'Plate Mail',       emoji:'🛡️', effect:{def:44},          value:350}],
  [{id:'dragonscale', name:'Dragon Scale',     emoji:'🐉', effect:{def:65},          value:700}],
  [{id:'voidplate',   name:'Void Plate',       emoji:'🌀', effect:{def:90, spd:5},   value:1500}],
  [{id:'godmail',     name:'God Mail',         emoji:'✨', effect:{def:125, crit:15},value:3000}],
  [{id:'the_armor',   name:'THE ARMOR',        emoji:'🔥', effect:{def:175, atk:30}, value:6000}],
];

const RING_TIERS = [
  [{id:'ring_speed',  name:'Ring of Speed',       emoji:'⚡', effect:{spd:4,  crit:12},        value:60}],
  [{id:'ring_power',  name:'Ring of Power',        emoji:'💪', effect:{atk:14},                 value:100}],
  [{id:'ring_arcane', name:'Arcane Ring',          emoji:'🔮', effect:{atk:20, mp:50},          value:200}],
  [{id:'ring_void',   name:'Void Ring',            emoji:'🌑', effect:{atk:30, crit:30},        value:400}],
  [{id:'ring_omni',   name:'RING OF EVERYTHING',  emoji:'🌐', effect:{atk:35,def:20,spd:6,crit:25},value:800}],
  [{id:'ring_beyond', name:'Ring Beyond',          emoji:'🌀', effect:{atk:55, crit:35, spd:8}, value:1800}],
  [{id:'ring_cosmos', name:'Cosmic Ring',          emoji:'🌌', effect:{atk:80, def:40, crit:40},value:3500}],
  [{id:'ring_god',    name:'GOD RING',             emoji:'🔥', effect:{atk:110,def:60,spd:12,crit:55},value:7000}],
];

function makeItem(type, tier0, subIdx=0) {
  // tier0 = 0-indexed (0=T1)
  let tbl, itype;
  if(type==='weapon'){ tbl=WEAPON_TIERS; itype='weapon'; }
  else if(type==='armor'){ tbl=ARMOR_TIERS; itype='armor'; }
  else { tbl=RING_TIERS; itype='ring'; }
  const row=tbl[Math.min(tier0,tbl.length-1)];
  const base=row[subIdx%row.length];
  return {...base, type:itype, tier:tier0+1, uid:Math.random().toString(36).slice(2)};
}

const CONSUMABLES = [
  {id:'hp1',name:'HP Potion',emoji:'🧪',type:'hp_pot',desc:"Heals 40 HP. Smells of strawberry.",effect:{hp:40},value:20,isHp:true,tier:1},
  {id:'hp2',name:'Big HP Potion',emoji:'❤️',type:'hp_pot',desc:"Full HP restore!",effect:{hpFull:true},value:80,isHp:true,tier:2},
  {id:'mp1',name:'MP Potion',emoji:'🔵',type:'mp_pot',desc:"Restores 50 MP. Tastes like ozone.",effect:{mp:50},value:25,isMp:true,tier:1},
  {id:'mp2',name:'Big MP Potion',emoji:'🔮',type:'mp_pot',desc:"Full MP restore!",effect:{mpFull:true},value:75,isMp:true,tier:2},
  {id:'bomb',name:'Cartoon Bomb',emoji:'💣',type:'consumable',desc:"BOOM. 60+ damage.",effect:{bomb:60},value:40,tier:1},
  {id:'gold1',name:'Gold Bag',emoji:'💰',type:'gold',desc:"Found on the ground.",effect:{gold:30},value:30,tier:1},
];

// ─── MATERIALS ─────────────────────────────────────────────────────────────
// rarity: 1=common 2=uncommon 3=rare 4=boss-only
const MATERIALS = {
  iron_ore:    {id:'iron_ore',   name:'Iron Ore',      emoji:'🪨',rarity:1,floor:1,value:8,  desc:'Basic metal. Useful for everything.'},
  iron_bar:    {id:'iron_bar',   name:'Iron Bar',       emoji:'🔩',rarity:1,floor:1,value:15, desc:'Smelted iron. Ready to forge.'},
  leather:     {id:'leather',    name:'Leather Strip',  emoji:'🥾',rarity:1,floor:1,value:10, desc:'Scraped from something. Don\'t ask.'},
  wood_shard:  {id:'wood_shard', name:'Wood Shard',     emoji:'🪵',rarity:1,floor:1,value:8,  desc:'Splintered but sturdy.'},
  bone_shard:  {id:'bone_shard', name:'Bone Shard',     emoji:'🦴',rarity:1,floor:1,value:12, desc:'Rattles ominously.'},
  steel_bar:   {id:'steel_bar',  name:'Steel Bar',      emoji:'🔩',rarity:2,floor:2,value:35, desc:'Harder than iron. Twice as smug.'},
  magic_dust:  {id:'magic_dust', name:'Magic Dust',     emoji:'✨',rarity:2,floor:2,value:40, desc:'Smells of ozone and bad decisions.'},
  beast_fang:  {id:'beast_fang', name:'Beast Fang',     emoji:'🦷',rarity:2,floor:2,value:45, desc:'Still sharp. Still resentful.'},
  void_shard:  {id:'void_shard', name:'Void Shard',     emoji:'🌑',rarity:3,floor:3,value:80, desc:'Hums with dark energy. Slightly warm.'},
  rune_stone:  {id:'rune_stone', name:'Rune Stone',     emoji:'🔮',rarity:3,floor:3,value:90, desc:'Ancient script. Gibberish or power?'},
  shadow_silk: {id:'shadow_silk',name:'Shadow Silk',    emoji:'🕸️',rarity:3,floor:3,value:75, desc:'Woven by shadow spiders. Unwillingly.'},
  holy_water:  {id:'holy_water', name:'Holy Water',     emoji:'💧',rarity:3,floor:3,value:85, desc:'Blessed by a very tired priest.'},
  dragon_scale:{id:'dragon_scale',name:'Dragon Scale',  emoji:'🐉',rarity:4,floor:4,value:200,desc:'Fell off a discount dragon.'},
  void_crystal:{id:'void_crystal',name:'Void Crystal',  emoji:'🔮',rarity:4,floor:4,value:250,desc:'Crystallized nothingness. Heavy.'},
  boss_essence:{id:'boss_essence',name:'Boss Essence',  emoji:'👑',rarity:4,floor:5,value:400,desc:'Distilled greatness of the defeated.'},
  mushroom:    {id:'mushroom',   name:'Gloom Mushroom', emoji:'🍄',rarity:1,floor:1,value:10, desc:'Damp and sulky.'},
  firebloom:   {id:'firebloom',  name:'Firebloom',      emoji:'🌺',rarity:2,floor:2,value:50, desc:'Burns to the touch. Gorgeous.'},
  moonpetal:   {id:'moonpetal',  name:'Moon Petal',     emoji:'🌸',rarity:3,floor:3,value:90, desc:'Only blooms in darkness.'},
  chaos_gem:   {id:'chaos_gem',  name:'Chaos Gem',      emoji:'🌀',rarity:3,floor:3,value:110,desc:'Unpredictable. Like a cat.'},
};

// ─── BLACKSMITH BLUEPRINTS ──────────────────────────────────────────────────
// Each blueprint: id, name, emoji, type, tier, effect, mats:[{id,qty}], goldCost, desc
const BLUEPRINTS = [
  // ── SWORDS ──
  {id:'bp_iron_sword',    name:'Iron Sword',      emoji:'🗡️', cat:'Sword',  type:'weapon',tier:1, effect:{atk:7},       mats:[{id:'iron_bar',qty:2},{id:'wood_shard',qty:1}],         goldCost:20,  desc:'A basic sword. Gets the job done.'},
  {id:'bp_steel_sword',   name:'Steel Sword',     emoji:'⚔️', cat:'Sword',  type:'weapon',tier:2, effect:{atk:15},      mats:[{id:'steel_bar',qty:2},{id:'leather',qty:1}],           goldCost:60,  desc:'Balance and edge, finally friends.'},
  {id:'bp_runesword',     name:'Rune Sword',      emoji:'⚔️', cat:'Sword',  type:'weapon',tier:3, effect:{atk:25,crit:10},mats:[{id:'steel_bar',qty:2},{id:'rune_stone',qty:1},{id:'magic_dust',qty:1}],goldCost:140,desc:'Inscribed with runes that glow judgmentally.'},
  {id:'bp_dragonbane',    name:'Dragonbane',      emoji:'🐉', cat:'Sword',  type:'weapon',tier:4, effect:{atk:38},      mats:[{id:'dragon_scale',qty:2},{id:'void_shard',qty:1},{id:'steel_bar',qty:1}],goldCost:300,desc:'Specifically designed to upset dragons.'},
  {id:'bp_bonkinator',    name:'THE BONKINATOR',  emoji:'🔨', cat:'Sword',  type:'weapon',tier:5, effect:{atk:50},      mats:[{id:'dragon_scale',qty:2},{id:'void_crystal',qty:1},{id:'boss_essence',qty:1}],goldCost:500,desc:'The ultimate bonking implement.'},
  // ── MACES ──
  {id:'bp_bone_mace',     name:'Bone Mace',       emoji:'🔨', cat:'Mace',   type:'weapon',tier:1, effect:{atk:8,def:1}, mats:[{id:'bone_shard',qty:3},{id:'leather',qty:1}],          goldCost:25,  desc:'Clunky but effective. And haunted.'},
  {id:'bp_iron_mace',     name:'Iron Mace',       emoji:'🔨', cat:'Mace',   type:'weapon',tier:2, effect:{atk:14,def:3},mats:[{id:'iron_bar',qty:3},{id:'bone_shard',qty:1}],          goldCost:70,  desc:'Head-sized. Head-shaped. Coincidence?'},
  {id:'bp_holy_mace',     name:'Holy Mace',       emoji:'✝️', cat:'Mace',   type:'weapon',tier:3, effect:{atk:20,def:8},mats:[{id:'steel_bar',qty:2},{id:'holy_water',qty:2}],         goldCost:150, desc:'Blessed and deadly. Blessed for whom?'},
  {id:'bp_void_crusher',  name:'Void Crusher',    emoji:'🌑', cat:'Mace',   type:'weapon',tier:4, effect:{atk:32,def:12},mats:[{id:'void_shard',qty:2},{id:'dragon_scale',qty:1}],     goldCost:320, desc:'Crushes void itself. Messy.'},
  {id:'bp_doom_gavel',    name:'DOOM GAVEL',      emoji:'⚖️', cat:'Mace',   type:'weapon',tier:5, effect:{atk:44,def:18},mats:[{id:'void_crystal',qty:1},{id:'boss_essence',qty:1},{id:'dragon_scale',qty:2}],goldCost:520,desc:'The judge. Jury. And executioner.'},
  // ── SPEARS ──
  {id:'bp_wood_spear',    name:'Wooden Spear',    emoji:'🪵', cat:'Spear',  type:'weapon',tier:1, effect:{atk:6,crit:8}, mats:[{id:'wood_shard',qty:3},{id:'bone_shard',qty:1}],       goldCost:18,  desc:'Pointy end goes toward enemy.'},
  {id:'bp_iron_spear',    name:'Iron Spear',      emoji:'🗡️', cat:'Spear',  type:'weapon',tier:2, effect:{atk:13,crit:12},mats:[{id:'iron_bar',qty:2},{id:'wood_shard',qty:2}],       goldCost:65,  desc:'Reach out and touch someone. Hard.'},
  {id:'bp_shadow_spear',  name:'Shadow Spear',    emoji:'🌑', cat:'Spear',  type:'weapon',tier:3, effect:{atk:22,crit:18},mats:[{id:'shadow_silk',qty:2},{id:'steel_bar',qty:1},{id:'beast_fang',qty:1}],goldCost:160,desc:'Throws shadows. Literally.'},
  {id:'bp_dragon_lance',  name:'Dragon Lance',    emoji:'🐉', cat:'Spear',  type:'weapon',tier:4, effect:{atk:34,crit:22},mats:[{id:'dragon_scale',qty:2},{id:'rune_stone',qty:1}],   goldCost:310, desc:'Once belonged to a dragon knight. Briefly.'},
  {id:'bp_void_lance',    name:'VOID LANCE',      emoji:'🔮', cat:'Spear',  type:'weapon',tier:5, effect:{atk:46,crit:30},mats:[{id:'void_crystal',qty:2},{id:'boss_essence',qty:1},{id:'chaos_gem',qty:1}],goldCost:540,desc:'Pierces through dimensions. And armor.'},
  // ── STAVES (Mage preferred) ──
  {id:'bp_stick',         name:'Magic Stick',     emoji:'🪄', cat:'Staff',  type:'weapon',tier:1, effect:{atk:4,mp:25},  mats:[{id:'wood_shard',qty:2},{id:'mushroom',qty:1}],         goldCost:20,  desc:'A stick. With ambitions.'},
  {id:'bp_fire_staff',    name:'Fire Staff',      emoji:'🔥', cat:'Staff',  type:'weapon',tier:2, effect:{atk:10,mp:40}, mats:[{id:'rune_stone',qty:1},{id:'firebloom',qty:2}],        goldCost:80,  desc:'Burns at both ends. Wizard fire hazard.'},
  {id:'bp_chaos_staff',   name:'Chaos Staff',     emoji:'🔮', cat:'Staff',  type:'weapon',tier:3, effect:{atk:18,mp:60}, mats:[{id:'chaos_gem',qty:1},{id:'magic_dust',qty:2},{id:'rune_stone',qty:1}],goldCost:170,desc:'Casts random spells. Intentionally.'},
  {id:'bp_arcane_orb',    name:'Arcane Orb',      emoji:'🔮', cat:'Staff',  type:'weapon',tier:4, effect:{atk:28,mp:90}, mats:[{id:'void_shard',qty:1},{id:'chaos_gem',qty:2},{id:'moonpetal',qty:1}],goldCost:330,desc:'Floats menacingly. Does not float gently.'},
  {id:'bp_reality_wand',  name:'Reality Wand',    emoji:'🌌', cat:'Staff',  type:'weapon',tier:5, effect:{atk:42,mp:130},mats:[{id:'void_crystal',qty:2},{id:'boss_essence',qty:1},{id:'chaos_gem',qty:1}],goldCost:560,desc:'Rewrites reality. Warranty void.'},
  // ── ARMOR ──
  {id:'bp_leather_armor', name:'Leather Armor',   emoji:'🥾', cat:'Armor',  type:'armor', tier:1, effect:{def:6},        mats:[{id:'leather',qty:3}],                                  goldCost:20,  desc:'Smells of adventure. And old leather.'},
  {id:'bp_iron_armor',    name:'Iron Armor',       emoji:'🛡️', cat:'Armor',  type:'armor', tier:2, effect:{def:14},       mats:[{id:'iron_bar',qty:3},{id:'leather',qty:1}],            goldCost:75,  desc:'Heavy. Warm. Occasionally a sauna.'},
  {id:'bp_chainmail',     name:'Chainmail',        emoji:'⛓️', cat:'Armor',  type:'armor', tier:3, effect:{def:22},       mats:[{id:'steel_bar',qty:3},{id:'iron_bar',qty:1}],          goldCost:165, desc:'A thousand tiny rings of optimism.'},
  {id:'bp_shadow_armor',  name:'Shadow Armor',     emoji:'🕸️', cat:'Armor',  type:'armor', tier:4, effect:{def:32,spd:3}, mats:[{id:'shadow_silk',qty:3},{id:'void_shard',qty:1}],     goldCost:340, desc:'Darkness woven into wearable form.'},
  {id:'bp_dragonscale',   name:'Dragon Scale Mail',emoji:'🐉', cat:'Armor',  type:'armor', tier:5, effect:{def:45,spd:2}, mats:[{id:'dragon_scale',qty:3},{id:'void_crystal',qty:1},{id:'boss_essence',qty:1}],goldCost:580,desc:'The dragon is VERY annoyed about this.'},
  // ── BOOTS ──
  {id:'bp_leather_boots', name:'Leather Boots',   emoji:'🥾', cat:'Boots',  type:'armor', tier:1, effect:{def:3,spd:2},  mats:[{id:'leather',qty:2}],                                  goldCost:15,  desc:'Comfortable. Slightly haunted.'},
  {id:'bp_iron_boots',    name:'Iron Boots',       emoji:'🥾', cat:'Boots',  type:'armor', tier:2, effect:{def:8,spd:3},  mats:[{id:'iron_bar',qty:2},{id:'leather',qty:1}],            goldCost:55,  desc:'Clank with every step. Stealth: 0.'},
  {id:'bp_rune_boots',    name:'Rune Boots',       emoji:'⚡', cat:'Boots',  type:'armor', tier:3, effect:{def:12,spd:6}, mats:[{id:'rune_stone',qty:1},{id:'steel_bar',qty:1},{id:'magic_dust',qty:1}],goldCost:145,desc:'Allows fast walking. And fast fleeing.'},
  {id:'bp_shadow_boots',  name:'Shadow Boots',     emoji:'🌑', cat:'Boots',  type:'armor', tier:4, effect:{def:16,spd:10,crit:8},mats:[{id:'shadow_silk',qty:2},{id:'void_shard',qty:1},{id:'beast_fang',qty:1}],goldCost:300,desc:'Move like shadow. Crit like shadow.'},
  {id:'bp_void_striders', name:'VOID STRIDERS',   emoji:'🔮', cat:'Boots',  type:'armor', tier:5, effect:{def:20,spd:14,crit:15},mats:[{id:'void_crystal',qty:1},{id:'boss_essence',qty:1},{id:'shadow_silk',qty:2}],goldCost:500,desc:'Walk between dimensions. Mind the gap.'},
  // ── HELMETS ──
  {id:'bp_bone_helmet',   name:'Bone Helmet',      emoji:'💀', cat:'Helmet', type:'armor', tier:1, effect:{def:4},        mats:[{id:'bone_shard',qty:3}],                               goldCost:18,  desc:'Someone else\'s skull. Don\'t think about it.'},
  {id:'bp_iron_helm',     name:'Iron Helm',         emoji:'⛑️', cat:'Helmet', type:'armor', tier:2, effect:{def:11},       mats:[{id:'iron_bar',qty:2},{id:'leather',qty:1}],            goldCost:60,  desc:'Headache-inducing in a good way.'},
  {id:'bp_rune_crown',    name:'Rune Crown',        emoji:'👑', cat:'Helmet', type:'armor', tier:3, effect:{def:18,mp:30}, mats:[{id:'rune_stone',qty:2},{id:'magic_dust',qty:1}],       goldCost:155, desc:'Crown of power. Or fashion. Both.'},
  {id:'bp_void_helm',     name:'Void Helm',         emoji:'🌑', cat:'Helmet', type:'armor', tier:4, effect:{def:27,crit:10},mats:[{id:'void_shard',qty:2},{id:'chaos_gem',qty:1}],      goldCost:330, desc:'Sees in darkness. Sees too much.'},
  {id:'bp_dragon_crown',  name:'DRAGON CROWN',      emoji:'🐉', cat:'Helmet', type:'armor', tier:5, effect:{def:38,crit:15,mp:50},mats:[{id:'dragon_scale',qty:2},{id:'boss_essence',qty:1},{id:'void_crystal',qty:1}],goldCost:560,desc:'A dragon wore this. Briefly.'},
  // ── RINGS ──
  {id:'bp_speed_ring',    name:'Ring of Speed',    emoji:'⚡', cat:'Ring',   type:'ring',  tier:1, effect:{spd:4,crit:10},mats:[{id:'iron_ore',qty:2},{id:'beast_fang',qty:1}],         goldCost:30,  desc:'Faster. Better. Less dead.'},
  {id:'bp_power_ring',    name:'Ring of Power',    emoji:'🔮', cat:'Ring',   type:'ring',  tier:2, effect:{atk:10},       mats:[{id:'steel_bar',qty:1},{id:'chaos_gem',qty:1}],         goldCost:90,  desc:'Power ring. Very original name.'},
  {id:'bp_arcane_ring',   name:'Arcane Ring',      emoji:'🔮', cat:'Ring',   type:'ring',  tier:3, effect:{atk:14,mp:50}, mats:[{id:'rune_stone',qty:1},{id:'moonpetal',qty:1},{id:'magic_dust',qty:1}],goldCost:175,desc:'Hums in old languages. Somewhat rude.'},
  {id:'bp_void_ring',     name:'Void Ring',         emoji:'🌑', cat:'Ring',   type:'ring',  tier:4, effect:{atk:22,crit:28},mats:[{id:'void_shard',qty:2},{id:'chaos_gem',qty:1}],     goldCost:360, desc:'Ring of nothing. Very powerful nothing.'},
  {id:'bp_omni_ring',     name:'RING OF EVERYTHING',emoji:'🌐',cat:'Ring',   type:'ring',  tier:5, effect:{atk:22,def:16,spd:6,crit:22},mats:[{id:'void_crystal',qty:1},{id:'boss_essence',qty:1},{id:'dragon_scale',qty:1},{id:'chaos_gem',qty:1}],goldCost:600,desc:'Does everything. Showoff.'},
];

// ─── ALCHEMIST RECIPES (Mage-class or any class) ──────────────────────────
// mageOnly: true = only Chaos Wizard can brew it
const ALCH_RECIPES = [
  // Potions — anyone
  {id:'ar_hp_pot',    name:'HP Potion',        emoji:'🧪',mageOnly:false,mats:[{id:'mushroom',qty:2},{id:'firebloom',qty:1}],    goldCost:10,result:{...CONSUMABLES[0]},desc:'Heals 40 HP. Classic.'},
  {id:'ar_big_hp',    name:'Big HP Potion',    emoji:'❤️',mageOnly:false,mats:[{id:'firebloom',qty:2},{id:'moonpetal',qty:1}],   goldCost:30,result:{...CONSUMABLES[1]},desc:'Full HP restore. Better classic.'},
  {id:'ar_mp_pot',    name:'MP Potion',        emoji:'🔵',mageOnly:false,mats:[{id:'mushroom',qty:1},{id:'magic_dust',qty:1}],   goldCost:12,result:{...CONSUMABLES[2]},desc:'Restores 50 MP.'},
  {id:'ar_big_mp',    name:'Big MP Potion',    emoji:'🔮',mageOnly:false,mats:[{id:'moonpetal',qty:2},{id:'magic_dust',qty:1}],  goldCost:35,result:{...CONSUMABLES[3]},desc:'Full MP restore.'},
  {id:'ar_bomb',      name:'Cartoon Bomb',     emoji:'💣',mageOnly:false,mats:[{id:'firebloom',qty:2},{id:'chaos_gem',qty:1}],   goldCost:20,result:{...CONSUMABLES[4]},desc:'BOOM.'},
  // Elixirs — mage only
  {id:'ar_berserker', name:'Berserker Elixir', emoji:'💥',mageOnly:true, mats:[{id:'beast_fang',qty:2},{id:'firebloom',qty:1},{id:'chaos_gem',qty:1}],goldCost:50,
    result:{id:'berserker',name:'Berserker Elixir',emoji:'💥',type:'elixir',desc:'+20 ATK for this floor!',effect:{elixirAtk:20},value:80,tier:2},
    desc:'+20 ATK for this floor. Rage included.'},
  {id:'ar_iron_skin', name:'Iron Skin Elixir', emoji:'🛡️',mageOnly:true, mats:[{id:'iron_ore',qty:3},{id:'mushroom',qty:2}],    goldCost:45,
    result:{id:'ironskin',name:'Iron Skin Elixir',emoji:'🛡️',type:'elixir',desc:'+15 DEF for this floor!',effect:{elixirDef:15},value:70,tier:2},
    desc:'+15 DEF for this floor. Skin of iron, heart of coward.'},
  {id:'ar_swift_brew', name:'Swift Brew',      emoji:'⚡',mageOnly:true, mats:[{id:'moonpetal',qty:1},{id:'shadow_silk',qty:1}], goldCost:40,
    result:{id:'swiftbrew',name:'Swift Brew',emoji:'⚡',type:'elixir',desc:'+8 SPD & +20% Crit for this floor!',effect:{elixirSpd:8,elixirCrit:20},value:70,tier:2},
    desc:'+8 SPD +20 CRIT. Zoom zoom.'},
  {id:'ar_chaos_brew', name:'Chaos Brew',      emoji:'🔮',mageOnly:true, mats:[{id:'chaos_gem',qty:2},{id:'void_shard',qty:1}], goldCost:80,
    result:{id:'chaosbrew',name:'Chaos Brew',emoji:'🔮',type:'elixir',desc:'Random powerful effect!',effect:{chaos:true},value:120,tier:3},
    desc:'Could be amazing. Could be a frog. Who knows.'},
  {id:'ar_transmute',  name:'Transmute',       emoji:'⚗️',mageOnly:true, mats:[{id:'iron_ore',qty:3}],                          goldCost:5,
    result:{id:'transmuted',name:'Iron Bar',emoji:'⬛',type:'material',matId:'iron_bar',desc:'Transmuted from ore.',value:15},
    desc:'Turn 3 Iron Ore → 1 Iron Bar. Basic alchemy.'},
  {id:'ar_refine',     name:'Refine Steel',    emoji:'🔩',mageOnly:true, mats:[{id:'iron_bar',qty:2},{id:'magic_dust',qty:1}],  goldCost:20,
    result:{id:'refined',name:'Steel Bar',emoji:'🔩',type:'material',matId:'steel_bar',desc:'Refined from iron.',value:35},
    desc:'2 Iron Bars + Magic Dust → Steel Bar.'},
  {id:'ar_void_dust',  name:'Essence Extract', emoji:'🔮',mageOnly:true, mats:[{id:'boss_essence',qty:1},{id:'moonpetal',qty:2}],goldCost:100,
    result:{id:'extracted',name:'Void Crystal',emoji:'🔮',type:'material',matId:'void_crystal',desc:'Extracted from boss essence.',value:250},
    desc:'Boss Essence + Moon Petals → Void Crystal. Very alchemist.'},
];

function makeMaterial(id){
  const m=MATERIALS[id];if(!m)return null;
  return{...m,type:'material',uid:Math.random().toString(36).slice(2)};
}

// Material drop table keyed by floor range
function rollMaterialDrop(floor, isBoss=false){
  const pool=Object.values(MATERIALS).filter(m=>{
    if(isBoss)return m.rarity>=3&&m.floor<=floor+1;
    if(floor<=1)return m.rarity===1;
    if(floor<=2)return m.rarity<=2;
    if(floor<=3)return m.rarity<=3;
    return true;
  });
  if(!pool.length)return null;
  // Weight toward lower rarity
  const weighted=[];
  pool.forEach(m=>{
    const w=isBoss?1:Math.max(1,5-m.rarity);
    for(let i=0;i<w;i++)weighted.push(m);
  });
  const m=weighted[Math.floor(Math.random()*weighted.length)];
  return makeMaterial(m.id);
}

const ENEMIES=[
  {name:'CONFUSED RAT',emoji:'🐀',baseHp:12,baseAtk:4,def:0,xp:8,gold:2,floor:1,wpn:'🦷 Tiny Teeth',taunt:["*confused rat noises*","Why am I here?","I regret everything."]},
  {name:'GOBLIN ACCOUNTANT',emoji:'🧌',baseHp:22,baseAtk:7,def:2,xp:18,gold:8,floor:1,wpn:'📄 Tax Form',taunt:["Your taxes are LATE!","I audit thee!","DEDUCTIBLE DAMAGE!"]},
  {name:'DRAMATIC GHOST',emoji:'👻',baseHp:18,baseAtk:9,def:1,xp:15,gold:5,floor:1,wpn:'👻 Spooky Hands',taunt:["I'm not real!","BOO (shy)","Wrong dungeon..."]},
  {name:'SKELETON DJ',emoji:'💀',baseHp:30,baseAtk:10,def:4,xp:25,gold:10,floor:2,wpn:'🎧 Sick Beats',taunt:["DROP THE MARROW!","*bone rattles*"]},
  {name:'ANGRY MUSHROOM',emoji:'🍄',baseHp:35,baseAtk:12,def:3,xp:30,gold:12,floor:2,wpn:'💨 Spore Cloud',taunt:["NOT A VEGETABLE","FUNGAL. RUDE."]},
  {name:'DISCOUNT DRAGON',emoji:'🐉',baseHp:55,baseAtk:18,def:8,xp:60,gold:30,floor:3,wpn:'🔥 Budget Fire',taunt:["ROAR... cough","My fire is vaping."]},
  {name:'EVIL WIZARD',emoji:'🧙‍♂️',baseHp:45,baseAtk:22,def:5,xp:55,gold:25,floor:3,wpn:'🪄 Backwards Wand',taunt:["Graduated LAST","This spell hurts me! Ow."]},
  {name:'STRESSED TROLL',emoji:'👹',baseHp:70,baseAtk:20,def:10,xp:80,gold:35,floor:4,wpn:'🪨 Giant Rock',taunt:["I need VACATION","BRIDGE GONE. LIFE GONE."]},
  {name:'CORPORATE DEMON',emoji:'😈',baseHp:90,baseAtk:28,def:12,xp:120,gold:60,floor:4,wpn:'📊 Spreadsheet',taunt:["Synergize your doom!","Your soul = resource."]},
  {name:'THE BIG BAD',emoji:'👑',baseHp:200,baseAtk:35,def:15,xp:500,gold:200,floor:5,boss:true,wpn:'💀 Doom Itself',taunt:["FINALLY! An appointment!","After my coffee. DOOM."]}
];

const PERKS=[
  {name:'BIG BONK ENERGY',desc:'+8 ATK.',effect:{atk:8}},
  {name:'THICK SKIN',desc:'+6 DEF.',effect:{def:6}},
  {name:'EXTRA ORGAN',desc:'+40 Max HP.',effect:{maxHp:40}},
  {name:'BRAIN ENLARGEMENT',desc:'+40 Max MP.',effect:{maxMp:40}},
  {name:'GLASS HALF FULL',desc:'Potions heal 50% more.',effect:{potBoost:.5}},
  {name:'LUCKY FEET',desc:'+4 SPD, +15% Crit.',effect:{spd:4,crit:15}},
  {name:'GOLD DETECTOR',desc:'+30% gold.',effect:{goldBoost:.3}},
  {name:'VAMPIRIC TENDENCIES',desc:'Heal 20% dmg dealt.',effect:{lifesteal:.2}},
  {name:'EXPLOSION FAN',desc:'Bombs +50% dmg.',effect:{bombBoost:.5}},
  {name:'SECOND BREAKFAST',desc:'25% eat enemy for HP.',effect:{cannibal:.25}},
];

const EPITAPHS=["Died doing what they loved: dying.","Killed by a rat. A CONFUSED RAT.","Inventory was full of trash.","Left a chest unopened. The horror.","Gone too soon. Also too slowly.","Touched grass. It was a trap."];

const MW=64,MH=40,SK='doomed_v4';
let customSprite=null,CI=null,openPanel=null,dpIv=null;
let fuseSlot=[null,null],fuseSelectTarget=0;
let zoomLevel=3; // default — 28px cells on 64×40 map gives good map coverage
let lastMoveAt=0;
const ZOOM_STEPS=[14,18,22,28,34,42,52];
let G={};


