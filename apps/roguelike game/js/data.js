// Game Constants & Data
const MW = 48, MH = 32;
const SK = 'doomed_v3';
const SMK = 'doomed_meta_v2';

const CLS = {
  warrior:{hp:125,atk:12,def:8,mp:25,spd:5,crit:5,sw:'sword_0',emoji:'🗡️'},
  mage:{hp:75,atk:6,def:3,mp:110,spd:4,crit:3,sw:'wand_0',emoji:'🔮'},
  rogue:{hp:90,atk:10,def:5,mp:45,spd:9,crit:18,sw:'dagger_0',emoji:'🗡️'},
  paladin:{hp:115,atk:8,def:11,mp:65,spd:3,crit:4,sw:'mace_0',emoji:'🛡️'}
};

const HERO_SKILLS = {
  warrior: [
    { id: 'heavy_slash', name: 'Heavy Slash', description: 'Deal 160% normal attack damage.', mpCost: 8, cooldown: 2, type: 'damage', target: 'enemy', mult: 1.6 },
    { id: 'battle_guard', name: 'Battle Guard', description: 'Gain +4 DEF for 2 enemy turns.', mpCost: 10, cooldown: 4, type: 'buff', target: 'self', effect: { id: 'battle_guard', type: 'def_up', value: 4, duration: 2, name: 'Battle Guard' } },
    { id: 'blood_oath', name: 'Blood Oath', description: 'Deal 130% damage and heal for 25% of damage dealt.', mpCost: 14, cooldown: 5, type: 'hybrid', target: 'enemy', mult: 1.3, healDealt: 0.25 }
  ],
  mage: [
    { id: 'arcane_bolt', name: 'Arcane Bolt', description: 'Deal 170% damage and ignore 30% of enemy DEF.', mpCost: 10, cooldown: 1, type: 'damage', target: 'enemy', mult: 1.7, ignoreDef: 0.30 },
    { id: 'mana_ward', name: 'Mana Ward', description: 'Reduce incoming damage by 35% for 2 enemy turns.', mpCost: 14, cooldown: 4, type: 'buff', target: 'self', effect: { id: 'mana_ward', type: 'dmg_resist', value: 0.35, duration: 2, name: 'Mana Ward' } },
    { id: 'soul_burn', name: 'Soul Burn', description: 'Deal 120% damage immediately, then apply Burn for 3 turns.', mpCost: 22, cooldown: 5, type: 'hybrid', target: 'enemy', mult: 1.2, applyStatus: { id: 'burn', name: 'Burn', type: 'burn', duration: 3, mult: 0.25 } }
  ],
  rogue: [
    { id: 'backstab', name: 'Backstab', description: 'Deal 135% damage with +25% temporary crit chance.', mpCost: 8, cooldown: 2, type: 'damage', target: 'enemy', mult: 1.35, critBonus: 25 },
    { id: 'smoke_step', name: 'Smoke Step', description: 'Gain 35% dodge chance for the next enemy attack only.', mpCost: 12, cooldown: 4, type: 'buff', target: 'self', effect: { id: 'smoke_step', type: 'dodge', value: 0.35, duration: 1, name: 'Smoke Step' } },
    { id: 'hemorrhage', name: 'Hemorrhage', description: 'Deal 110% damage and apply Bleed for 3 turns.', mpCost: 16, cooldown: 5, type: 'hybrid', target: 'enemy', mult: 1.1, applyStatus: { id: 'bleed', name: 'Bleed', type: 'bleed', duration: 3, mult: 0.20 } }
  ],
  paladin: [
    { id: 'smite', name: 'Smite', description: 'Deal 135% damage and heal for 15% of damage dealt.', mpCost: 10, cooldown: 2, type: 'hybrid', target: 'enemy', mult: 1.35, healDealt: 0.15 },
    { id: 'holy_bulwark', name: 'Holy Bulwark', description: 'Gain +3 DEF and 20% dmg resist for 2 enemy turns.', mpCost: 14, cooldown: 4, type: 'buff', target: 'self', effect: { id: 'holy_bulwark', type: 'bulwark', defValue: 3, resistValue: 0.20, duration: 2, name: 'Holy Bulwark' } },
    { id: 'judgment', name: 'Judgment', description: 'Deal 150% damage. If enemy < 35% HP after, hit again for 50%.', mpCost: 24, cooldown: 6, type: 'hybrid', target: 'enemy', mult: 1.5, execute: { threshold: 0.35, mult: 0.50 } }
  ]
};

const enemyArchetypes = {
  weak: { hpMultiplier: 0.75, atkMultiplier: 0.85, defMultiplier: 0.75, xpMultiplier: 0.75, goldMultiplier: 0.75 },
  normal: { hpMultiplier: 1.0, atkMultiplier: 1.0, defMultiplier: 1.0, xpMultiplier: 1.0, goldMultiplier: 1.0 },
  brute: { hpMultiplier: 1.45, atkMultiplier: 1.1, defMultiplier: 1.05, xpMultiplier: 1.25, goldMultiplier: 1.1 },
  tank: { hpMultiplier: 1.25, atkMultiplier: 0.85, defMultiplier: 1.35, xpMultiplier: 1.2, goldMultiplier: 1.05 },
  assassin: { hpMultiplier: 0.8, atkMultiplier: 1.25, defMultiplier: 0.75, xpMultiplier: 1.15, goldMultiplier: 1.1 },
  elite: { hpMultiplier: 2.2, atkMultiplier: 1.35, defMultiplier: 1.2, xpMultiplier: 2.5, goldMultiplier: 2.2 },
  boss: { hpMultiplier: 5.5, atkMultiplier: 1.45, defMultiplier: 1.3, xpMultiplier: 8.0, goldMultiplier: 6.0 }
};

const ENEMIES = [
  {name:'Rot Rat',emoji:'🐀',archetype:'weak',baseHp:38,baseAtk:7,def:2,spd:5,xp:8,gold:4,floor:1,wpn:'🦷 Tiny Teeth'},
  {name:'Bone Walker',emoji:'💀',archetype:'normal',baseHp:52,baseAtk:8,def:3,spd:4,xp:12,gold:6,floor:1,wpn:'🦴 Bone Club'},
  {name:'Ash Cultist',emoji:'👺',archetype:'normal',baseHp:48,baseAtk:9,def:2,spd:5,xp:13,gold:7,floor:1,wpn:'🔪 Rusty Shiv'},
  {name:'Grave Ghoul',emoji:'🧟',archetype:'brute',baseHp:68,baseAtk:10,def:3,spd:3,xp:17,gold:8,floor:1,wpn:'🦷 Fangs'},
  {name:'Shield Husk',emoji:'🛡️',archetype:'tank',baseHp:60,baseAtk:7,def:6,spd:2,xp:18,gold:9,floor:1,wpn:'🛡️ Rusted Shield'},
  {name:'Blade Imp',emoji:'🦇',archetype:'assassin',baseHp:42,baseAtk:12,def:2,spd:8,xp:16,gold:8,floor:1,wpn:'🗡️ Quick Blade'}
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
  {id:'hp',name:'VITALITY',emoji:'❤️',desc:'+8 Max HP per level.',baseCost:50,costPerLevel:50,maxLevel:10,apply:(lvl)=>({hp:lvl*8})},
  {id:'atk',name:'STRENGTH',emoji:'⚔️',desc:'+1 Attack per level.',baseCost:50,costPerLevel:75,maxLevel:10,apply:(lvl)=>({atk:lvl*1})},
  {id:'def',name:'IRON SKIN',emoji:'🛡️',desc:'+1 Defense every 2 levels.',baseCost:60,costPerLevel:100,maxLevel:10,apply:(lvl)=>({def:Math.floor(lvl/2)})},
  {id:'luck',name:'LUCKY CHARM',emoji:'🍀',desc:'+1.5% Crit per level.',baseCost:100,costPerLevel:150,maxLevel:5,apply:(lvl)=>({crit:lvl*1.5})},
  {id:'endurance',name:'DOOM ENDURANCE',emoji:'🩸',desc:'+2% healing received per level.',baseCost:150,costPerLevel:200,maxLevel:5,apply:(lvl)=>({healBonus:lvl*0.02})}
];

const WEAPON_TIERS = [
  [
    {id:'sword_0',name:'Iron Sword',emoji:'🗡️',atk:5,spd:0,desc:'A basic blade.'},
    {id:'wand_0',name:'Cursed Wand',emoji:'🪄',atk:3,spd:1,desc:'Sparks occasionally.'},
    {id:'dagger_0',name:'Shiv of Shame',emoji:'🔪',atk:4,spd:3,desc:'Pointy.'},
    {id:'mace_0',name:'Holy Mallet',emoji:'🔨',atk:4,spd:-1,desc:'Heavy.'},
  ]
];
