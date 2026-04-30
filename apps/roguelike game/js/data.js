// Game Constants & Data
const MW = 48, MH = 32;
const SK = 'doomed_v3';
const SMK = 'doomed_meta_v2';

const CLS = {
  warrior:{hp:120,atk:15,def:8,mp:30,spd:5,crit:5,sw:'sword_0',emoji:'🗡️'},
  mage:{hp:70,atk:8,def:3,mp:100,spd:4,crit:2,sw:'wand_0',emoji:'🔮'},
  rogue:{hp:85,atk:12,def:5,mp:50,spd:8,crit:15,sw:'dagger_0',emoji:'🗡️'},
  paladin:{hp:100,atk:10,def:12,mp:70,spd:3,crit:4,sw:'mace_0',emoji:'🛡️'}
};

const ENEMIES = [
  {name:'RAT',emoji:'🐀',baseHp:12,baseAtk:5,def:0,xp:10,gold:4,floor:1,wpn:'🦷 Tiny Teeth'},
  {name:'SLIME',emoji:'🟢',baseHp:18,baseAtk:7,def:1,xp:15,gold:6,floor:1,wpn:'💦 Acid Goo'},
  {name:'SKELETON',emoji:'💀',baseHp:25,baseAtk:10,def:3,xp:25,gold:10,floor:1,wpn:'🦴 Bone Club'},
  {name:'GOBLIN',emoji:'👺',baseHp:22,baseAtk:12,def:2,xp:30,gold:12,floor:1,wpn:'🔪 Rusty Shiv'},
  {name:'BAT',emoji:'🦇',baseHp:15,baseAtk:11,def:0,xp:20,gold:8,floor:1,wpn:'🦷 Fangs'},
  // ... (Full list extracted from prototype)
];

// PORTAL ZONES (The exact data from your file)
const PORTAL_ZONES = {
  N: {
    id:'N', name:'INFERNO DEPTHS', emoji:'🔥', color:'#ff4444', tint:'rgba(200,40,0,.12)',
    desc:'The air burns. Even the rats are on fire.',
    enemies:[
      {name:'FIRE IMP',emoji:'🔥',baseHp:28,baseAtk:14,def:3,xp:35,gold:14,floor:1,wpn:'🔥 Ember Claws'},
      {name:'LAVA GOLEM',emoji:'🌋',baseHp:65,baseAtk:20,def:12,xp:65,gold:28,floor:1,wpn:'🪨 Molten Fist'},
      {name:'SCORCHED KNIGHT',emoji:'⚔️',baseHp:50,baseAtk:22,def:10,xp:58,gold:22,floor:1,wpn:'🗡️ Burning Blade'},
      {name:'EMBER WITCH',emoji:'🧙‍♀️',baseHp:38,baseAtk:28,def:4,xp:72,gold:32,floor:1,wpn:'🔥 Fire Staff'},
      {name:'INFERNO BOSS',emoji:'👹',baseHp:220,baseAtk:40,def:18,xp:600,gold:250,floor:1,boss:true,wpn:'☄️ Hellfire'},
    ],
    lootBonus:{type:'weapon',affixHint:'burning'},
    portalColor:'#ff4444',
  },
  S: {
    id:'S', name:'THE ABYSS', emoji:'💀', color:'#4488ff', tint:'rgba(0,40,180,.12)',
    desc:'Cold. Dark. Aggressively damp.',
    enemies:[
      {name:'BONE ARCHER',emoji:'🏹',baseHp:22,baseAtk:16,def:2,xp:32,gold:12,floor:1,wpn:'🏹 Bone Arrows'},
      {name:'SHADOW WRAITH',emoji:'👤',baseHp:30,baseAtk:19,def:1,xp:45,gold:18,floor:1,wpn:'🌑 Shadow Claws'},
      {name:'ZOMBIE CHEF',emoji:'🧟',baseHp:55,baseAtk:15,def:8,xp:48,gold:20,floor:1,wpn:'🍳 Cursed Pan'},
      {name:'LICH INTERN',emoji:'🧛',baseHp:40,baseAtk:24,def:6,xp:62,gold:30,floor:1,wpn:'💀 Soul Drain'},
      {name:'THE DEEP ONE',emoji:'🦑',baseHp:240,baseAtk:38,def:20,xp:650,gold:280,floor:1,boss:true,wpn:'🌊 Void Tentacles'},
    ],
    lootBonus:{type:'armor',affixHint:'vampiric'},
    portalColor:'#4488ff',
  },
  E: {
    id:'E', name:'CURSED FOREST', emoji:'🌿', color:'#44ff88', tint:'rgba(20,160,60,.12)',
    desc:'The trees want you dead. So does everything else.',
    enemies:[
      {name:'ANGRY BOAR',emoji:'🐗',baseHp:42,baseAtk:18,def:5,xp:40,gold:16,floor:1,wpn:'🦷 Tusks'},
      {name:'SPIDER QUEEN',emoji:'🕷️',baseHp:32,baseAtk:21,def:3,xp:50,gold:20,floor:1,wpn:'🕸️ Venom Bite'},
      {name:'TREANT BOUNCER',emoji:'🌳',baseHp:88,baseAtk:16,def:16,xp:70,gold:30,floor:1,wpn:'🌿 Branch Slam'},
      {name:'POISON PIXIE',emoji:'🧚',baseHp:25,baseAtk:26,def:1,xp:55,gold:24,floor:1,wpn:'☠️ Pollen Dust'},
      {name:'ANCIENT BARK',emoji:'🐲',baseHp:260,baseAtk:36,def:22,xp:700,gold:300,floor:1,boss:true,wpn:'🌲 Root Crush'},
    ],
    lootBonus:{type:'ring',affixHint:'poison'},
    portalColor:'#44ff88',
  },
  W: {
    id:'W', name:'THE VOID REALM', emoji:'🌌', color:'#cc44ff', tint:'rgba(120,0,200,.12)',
    desc:'Reality is optional here. So is your health.',
    enemies:[
      {name:'VOID CUBE',emoji:'🟪',baseHp:35,baseAtk:20,def:7,xp:45,gold:18,floor:1,wpn:'💠 Dimension Tap'},
      {name:'COSMIC JESTER',emoji:'🃏',baseHp:28,baseAtk:30,def:2,xp:68,gold:35,floor:1,wpn:'🌀 Chaos Cards'},
      {name:'GLITCH KNIGHT',emoji:'👾',baseHp:55,baseAtk:25,def:9,xp:75,gold:38,floor:1,wpn:'⬛ Error Blade'},
      {name:'STAR HORROR',emoji:'⭐',baseHp:45,baseAtk:32,def:5,xp:80,gold:42,floor:1,wpn:'✨ Stellar Scream'},
      {name:'THE NULL',emoji:'🌑',baseHp:280,baseAtk:45,def:18,xp:800,gold:350,floor:1,boss:true,wpn:'🌌 Event Horizon'},
    ],
    lootBonus:{type:'weapon',affixHint:'runic'},
    portalColor:'#cc44ff',
  }
};

const CONSUMABLES = [
  {id:'hp_pot',name:'HP Potion',emoji:'❤️',desc:'Restores 40 HP.',type:'potion',effect:{hp:40}},
  {id:'mp_pot',name:'MP Potion',emoji:'💙',desc:'Restores 30 MP.',type:'potion',effect:{mp:30}},
  {id:'bread',name:'Dungeon Bread',emoji:'🍞',desc:'Restores 15 HP.',type:'food',effect:{hp:15}},
];

const META_UPGRADES = [
  {id:'hp',name:'VITALITY',emoji:'❤️',desc:'+10 Max HP per level.',baseCost:50,costPerLevel:50,maxLevel:10,apply:(lvl)=>({hp:lvl*10})},
  {id:'atk',name:'STRENGTH',emoji:'⚔️',desc:'+2 Attack per level.',baseCost:50,costPerLevel:75,maxLevel:10,apply:(lvl)=>({atk:lvl*2})},
  {id:'def',name:'IRON SKIN',emoji:'🛡️',desc:'+1 Defense per level.',baseCost:60,costPerLevel:100,maxLevel:10,apply:(lvl)=>({def:lvl*1})},
  {id:'luck',name:'LUCKY CHARM',emoji:'🍀',desc:'+2% Crit per level.',baseCost:100,costPerLevel:150,maxLevel:5,apply:(lvl)=>({crit:lvl*2})},
  {id:'slots',name:'DEEP POCKETS',emoji:'🎒',desc:'+1 Inventory Slot per level.',baseCost:200,costPerLevel:300,maxLevel:4,apply:(lvl)=>({invBonus:lvl})}
];

const WEAPON_TIERS = [
  [
    {id:'sword_0',name:'Iron Sword',emoji:'🗡️',atk:5,spd:0,desc:'A basic blade.'},
    {id:'wand_0',name:'Cursed Wand',emoji:'🪄',atk:3,spd:1,desc:'Sparks occasionally.'},
    {id:'dagger_0',name:'Shiv of Shame',emoji:'🔪',atk:4,spd:3,desc:'Pointy.'},
    {id:'mace_0',name:'Holy Mallet',emoji:'🔨',atk:4,spd:-1,desc:'Heavy.'},
  ]
];
