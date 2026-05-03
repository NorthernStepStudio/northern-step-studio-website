// ═══════════════════════════════
// ZOOM
// ═══════════════════════════════
function adjustZoom(dir){
  zoomLevel=Math.max(0,Math.min(ZOOM_STEPS.length-1,zoomLevel+dir));
  if(G.map)renderMap();
}
function getCellSize(){return ZOOM_STEPS[zoomLevel];}

// ═══════════════════════════════
// SPRITE
// ═══════════════════════════════
function loadSprite(ev){const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{customSprite=e.target.result;if(G.player){rhS();renderMap();}};r.readAsDataURL(f);}
function rhS(){
  const el=document.getElementById('hsprite');
  if(customSprite){
    el.innerHTML=`<img src="${customSprite}" style="width:28px;height:28px;object-fit:contain;image-rendering:pixelated">`;
  }else if(G.player?.classType&&HERO_SVGS[G.player.classType]){
    el.innerHTML=heroImgTag(G.player.classType,28);
  }else{
    el.textContent=G.player?.emoji||'🙂';
  }
}
function updCS(){
  const pw=document.getElementById('cpsprite');
  if(customSprite){
    pw.innerHTML=`<img src="${customSprite}" style="width:64px;height:64px;object-fit:contain;image-rendering:pixelated">`;
  }else if(G.player?.classType&&HERO_SVGS[G.player.classType]){
    pw.innerHTML=heroImgTag(G.player.classType,64);
  }else{
    pw.textContent=G.player?.emoji||'🙂';
  }
}

// ═══════════════════════════════
// SAVE / LOAD
// ═══════════════════════════════
const SAVE_VERSION=2;
const SAVE_PRIMARY_KEY=SK;
const SAVE_BACKUP_KEY=`${SK}_backup`;
const SAVE_META_KEY=`${SK}_meta`;
let _saveStorageReady=null;

function canUseStorage(){
  if(_saveStorageReady!==null)return _saveStorageReady;
  try{
    const probe='__doomed_save_probe__';
    localStorage.setItem(probe,'1');
    localStorage.removeItem(probe);
    _saveStorageReady=true;
  }catch(e){
    _saveStorageReady=false;
  }
  return _saveStorageReady;
}
function cloneSaveState(state){
  try{return structuredClone(state);}
  catch(e){return JSON.parse(JSON.stringify(state));}
}
function buildSavePayload(light=false){
  const g=cloneSaveState(G||{});
  // Persist only safe world state; never mid-combat pointers.
  g.inCombat=false;
  g.currentEnemy=null;
  if(!g.zoneEnemies)g.zoneEnemies={};
  if(!g.zoneItems)g.zoneItems={};
  if(g.map&&!g.map.zones)g.map.zones={};
  if(light){
    const zid=g.inZone||null;
    if(g.map&&g.map.zones){
      g.map.zones=(zid&&g.map.zones[zid])?{[zid]:g.map.zones[zid]}:{};
    }
    g.zoneEnemies=(zid&&g.zoneEnemies?.[zid])?{[zid]:g.zoneEnemies[zid]}:{};
    g.zoneItems=(zid&&g.zoneItems?.[zid])?{[zid]:g.zoneItems[zid]}:{};
  }
  return{
    version:SAVE_VERSION,
    savedAt:Date.now(),
    G:g,
    customSprite:customSprite||null,
    zoomLevel
  };
}
function normalizeLoadedGame(d){
  if(!d||!d.G||!d.G.player)return null;
  d.G.inCombat=false;
  d.G.currentEnemy=null;
  if(typeof d.G.portalDepth!=='number')d.G.portalDepth=0;
  if(!d.G.zoneEnemies)d.G.zoneEnemies={};
  if(!d.G.zoneItems)d.G.zoneItems={};
  if(d.G.map&&!d.G.map.zones)d.G.map.zones={};
  if(!d.G.floor||d.G.floor<1)d.G.floor=1;
  if(!Array.isArray(d.G.inventory))d.G.inventory=[];
  if(typeof ensureProgressionState==='function'){
    ensureProgressionState(d.G);
    syncWorldDepthFromCurrentFloor(d.G);
  }
  return d;
}
function parseSaveRecord(key){
  try{
    const raw=localStorage.getItem(key);
    if(!raw)return null;
    const d=normalizeLoadedGame(JSON.parse(raw));
    if(!d)return null;
    d.__saveKey=key;
    return d;
  }catch(e){return null;}
}
function getBestSaveRecord(){
  if(!canUseStorage())return null;
  const candidates=[parseSaveRecord(SAVE_PRIMARY_KEY),parseSaveRecord(SAVE_BACKUP_KEY)].filter(Boolean);
  if(!candidates.length)return null;
  candidates.sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));
  return candidates[0];
}
function clearSaves(){
  try{
    localStorage.removeItem(SAVE_PRIMARY_KEY);
    localStorage.removeItem(SAVE_BACKUP_KEY);
    localStorage.removeItem(SAVE_META_KEY);
  }catch(e){}
}
function saveG(){
  if(!canUseStorage())return false;
  try{
    const payload=buildSavePayload(false);
    const json=JSON.stringify(payload);
    try{
      localStorage.setItem(SAVE_PRIMARY_KEY,json);
    }catch(primaryErr){
      // Quota fallback: store lighter cache snapshot.
      const lightJson=JSON.stringify(buildSavePayload(true));
      localStorage.setItem(SAVE_PRIMARY_KEY,lightJson);
    }
    try{localStorage.setItem(SAVE_BACKUP_KEY,json);}catch(e){}
    try{
      localStorage.setItem(SAVE_META_KEY,JSON.stringify({
        savedAt:payload.savedAt,
        floor:payload.G?.floor||1,
        level:payload.G?.player?.level||1
      }));
    }catch(e){}
    return true;
  }catch(e){return false;}
}
function loadGame(){
  try{
    const d=getBestSaveRecord();
    if(!d)return false;
    G=d.G;
    if(typeof ensureProgressionState==='function'){
      ensureProgressionState(G);
      syncWorldDepthFromCurrentFloor(G);
    }
    customSprite=d.customSprite||null;
    if(d.zoomLevel!==undefined)zoomLevel=d.zoomLevel;
    showGS();
    updateVision(G.player.x,G.player.y);
    renderMap();updateHUD();updateDoomBar();updateModBar();
    // Restore zone tint if saved inside a zone
    const zdef=getCurrentZoneDef();
    const tint=document.getElementById('zone-tint');
    if(tint&&G.inZone&&zdef){
      tint.style.background=zdef.tint;
      tint.style.opacity='1';
    }
    addLog('Loaded! Welcome back.','info');
    if(G.inZone&&zdef)addLog(`${zdef.emoji} You're inside: ${getFloorDisplayName(G.inZone)}. Find the return gate!`,'info');
    // Refresh normalized primary+backup after successful load.
    saveG();
    return true;
  }catch(e){return false;}
}
function checkSave(){
  try{
    const d=getBestSaveRecord();
    const g=d?.G;
    if(!g)return null;
    const reg=g.floorRegistry;
    if(reg?.floors){
      const cid=g.inZone||g.currentFloorId||reg.currentId||'NEXUS';
      const meta=reg.floors[cid];
      if(meta)return Math.max(0,meta.mainDepth||0);
    }
    return g.floor||null;
  }catch(e){return null;}
}

// ═══════════════════════════════
// ENEMY SCALING (key fix!)
// ═══════════════════════════════
function scaleEnemy(tmpl, floor, playerLevel){
  const lvl = Math.max(1, Math.round((floor * 1.5 + playerLevel) / 2));
  // Slower scaling so player stays competitive
  let hpScale  = 1 + (lvl - 1) * 0.22;
  let atkScale = 1 + (lvl - 1) * 0.18;
  const xpScale   = 1 + (lvl - 1) * 0.25;
  const goldScale = 1 + (lvl - 1) * 0.20;
  // DEF scales very slowly — so player damage always matters
  const scaledDef = Math.floor(tmpl.def * (1 + (lvl-1)*0.08));

  // Corruption bonus — high doom makes enemies tougher
  const doomLvl=getDoomLevel();
  const doomScale=1+(doomLvl*.06);
  hpScale*=doomScale; atkScale*=doomScale;

  // Elite surge modifier
  const mods=getModEffects();
  let isElite=tmpl.elite||false;
  if(mods.eliteSurge){hpScale*=1.4;atkScale*=1.2;isElite=true;}

  return{
    ...tmpl,
    hp: Math.floor(tmpl.baseHp * hpScale),
    maxHp: Math.floor(tmpl.baseHp * hpScale),
    atk: Math.floor(tmpl.baseAtk * atkScale),
    def: scaledDef,
    xp: Math.floor(tmpl.xp * xpScale),
    gold: Math.floor(tmpl.gold * goldScale),
    level: lvl,
    id: Math.random().toString(36).slice(2),
    poisoned: 0,
    status:{},
    isElite,
    name: isElite&&!tmpl.boss?`★ ${tmpl.name}`:tmpl.name,
    elite: isElite,
  };
}

// ═══════════════════════════════
// MAP GEN — Big dungeon (48x32) with portals
// ═══════════════════════════════

// Zone definitions — each portal leads to one of these
const PORTAL_ZONES = {
  N: {
    id:'N', name:'FROZEN RUINS', emoji:'❄️', color:'#4488ff', tint:'rgba(40,90,200,.12)',
    desc:'Ancient halls entombed in ice and moonlit dust.',
    enemies:[
      {name:'FIRE IMP',emoji:'🔥',baseHp:28,baseAtk:14,def:3,xp:35,gold:14,floor:1,wpn:'Ember Claws',taunt:["BURN BURN BURN!","Hot enough for ya?","I am literally on fire!"]},
      {name:'LAVA GOLEM',emoji:'🌋',baseHp:65,baseAtk:20,def:12,xp:65,gold:28,floor:1,wpn:'Molten Fist',taunt:["RUMBLERUMBLE","Hot take incoming.","My skin is lava. Literally."]},
      {name:'SCORCHED KNIGHT',emoji:'⚔️',baseHp:50,baseAtk:22,def:10,xp:58,gold:22,floor:1,wpn:'Burning Blade',taunt:["TOUCHED FLAME. BECAME FLAME.","My armor is welded on.","I forgot to stop drop and roll."]},
      {name:'EMBER WITCH',emoji:'🧙‍♀️',baseHp:38,baseAtk:28,def:4,xp:72,gold:32,floor:1,wpn:'Fire Staff',taunt:["My spells are HOT","Literally FIRED","You'll be ash!"]},
      {name:'INFERNO BOSS',emoji:'🔥',baseHp:220,baseAtk:40,def:18,xp:600,gold:250,floor:1,boss:true,wpn:'Hellfire',taunt:["I AM THE FLAME","BURN EVERYTHING","THE HEAT IS SENTIENT"]},
    ],
    lootBonus:{type:'armor',affixHint:'frost'},
    portalColor:'#4488ff',
  },
  S: {
    id:'S', name:'LAVA CAVERNS', emoji:'🌋', color:'#ff5533', tint:'rgba(200,60,20,.12)',
    desc:'Molten tunnels spit ash, smoke, and ember rain.',
    enemies:[
      {name:'BONE ARCHER',emoji:'🏹',baseHp:22,baseAtk:16,def:2,xp:32,gold:12,floor:1,wpn:'Bone Arrows',taunt:["Took an arrow to the knee? No, you gave one.","Accuracy: questionable.","My aim is dead. Like me."]},
      {name:'SHADOW WRAITH',emoji:'👻',baseHp:30,baseAtk:19,def:1,xp:45,gold:18,floor:1,wpn:'Shadow Claws',taunt:["You can't hit what isn't there.","Incorporeal. Mostly.","I AM THE DARK."]},
      {name:'ZOMBIE CHEF',emoji:'🧟‍♂️',baseHp:55,baseAtk:15,def:8,xp:48,gold:20,floor:1,wpn:'Cursed Pan',taunt:["Today's special: YOU","Braaains with a light vinaigrette.","I followed a recipe. Poorly."]},
      {name:'LICH INTERN',emoji:'🧟‍♀️',baseHp:40,baseAtk:24,def:6,xp:62,gold:30,floor:1,wpn:'Soul Drain',taunt:["First day on the lich job.","Benefits: undeath. Downsides: this.","I didn't sign up for eternal torment!"]},
      {name:'THE DEEP ONE',emoji:'🐙',baseHp:240,baseAtk:38,def:20,xp:650,gold:280,floor:1,boss:true,wpn:'Void Tentacles',taunt:["THAT WHICH LIES BENEATH","YOUR SOUL IS MINE NOW","GURGLE GURGLE DOOM"]},
    ],
    lootBonus:{type:'weapon',affixHint:'burning'},
    portalColor:'#ff5533',
  },
  E: {
    id:'E', name:'OVERGROWN TEMPLE', emoji:'🌿', color:'#44ff88', tint:'rgba(20,160,60,.12)',
    desc:'Vines reclaim old stone halls and hidden shrines.',
    enemies:[
      {name:'ANGRY BOAR',emoji:'🐗',baseHp:42,baseAtk:18,def:5,xp:40,gold:16,floor:1,wpn:'Tusks',taunt:["OINK OF DEATH","I CHARGE THINGS FOR FUN","Technically a pig."]},
      {name:'SPIDER QUEEN',emoji:'🕷️',baseHp:32,baseAtk:21,def:3,xp:50,gold:20,floor:1,wpn:'Venom Bite',taunt:["My babies will avenge me.","I have 8 reasons to hate you.","Web incoming!"]},
      {name:'TREANT BOUNCER',emoji:'🌳',baseHp:88,baseAtk:16,def:16,xp:70,gold:30,floor:1,wpn:'Branch Slam',taunt:["You're not on the list.","No shoes, no service, no survival.","LEAVE. THE. FOREST."]},
      {name:'POISON PIXIE',emoji:'🧚‍♀️',baseHp:25,baseAtk:26,def:1,xp:55,gold:24,floor:1,wpn:'Pollen Dust',taunt:["Small but LETHAL","I am tiny and furious","Pixie dust: now toxic!"]},
      {name:'ANCIENT BARK',emoji:'🌲',baseHp:260,baseAtk:36,def:22,xp:700,gold:300,floor:1,boss:true,wpn:'Root Crush',taunt:["THE FOREST IS ANGRY","I HAVE BEEN GROWING FOR 1000 YEARS","LEAF ME ALONE"]},
    ],
    lootBonus:{type:'ring',affixHint:'poison'},
    portalColor:'#44ff88',
  },
  W: {
    id:'W', name:'CURSED CRYPT', emoji:'🕯️', color:'#cc44ff', tint:'rgba(120,0,200,.12)',
    desc:'Necrotic incense, broken tombs, and whispering curses.',
    enemies:[
      {name:'VOID CUBE',emoji:'▢',baseHp:35,baseAtk:20,def:7,xp:45,gold:18,floor:1,wpn:'Dimension Tap',taunt:["I AM A SHAPE","GEOMETRY ATTACKS","Your physics are wrong."]},
      {name:'COSMIC JESTER',emoji:'🤡',baseHp:28,baseAtk:30,def:2,xp:68,gold:35,floor:1,wpn:'Chaos Cards',taunt:["HAHAHAHA","Pick a card, any card... wrong.","The joke is your HP."]},
      {name:'GLITCH KNIGHT',emoji:'🛡️',baseHp:55,baseAtk:25,def:9,xp:75,gold:38,floor:1,wpn:'Error Blade',taunt:["UNDEFINED BEHAVIOR","SEGMENTATION FAULT","NULL POINTER EXCEPTION"]},
      {name:'STAR HORROR',emoji:'✸',baseHp:45,baseAtk:32,def:5,xp:80,gold:42,floor:1,wpn:'Stellar Scream',taunt:["THE STARS ARE HUNGRY","YOUR LIGHT WILL FADE","TWINKLE TWINKLE LITTLE CORPSE"]},
      {name:'THE NULL',emoji:'∅',baseHp:280,baseAtk:45,def:18,xp:800,gold:350,floor:1,boss:true,wpn:'Event Horizon',taunt:["NOTHING SURVIVES","I AM THE ABSENCE OF EVERYTHING","YOUR EXISTENCE IS AN ERROR"]},
    ],
    lootBonus:{type:'weapon',affixHint:'runic'},
    portalColor:'#cc44ff',
  },
};

// Generate portal return point tag
function zonePortalEntity(zoneId){return 'portal_'+zoneId;}

// ═══════════════════════════════
// FLOOR PROGRESSION GRAPH (multi-floor portal crawl)
// ═══════════════════════════════
const PORTAL_DIRS=['N','S','E','W'];
const MAIN_FLOOR_NAMES=[
  'Frost Reach',
  'Ember Hollow',
  'Wildroot Den',
  'Hollow Void',
  'Crystal Grave',
  'Rotspire',
  'Dread Bloom',
  'Ash Cathedral',
  'Black Maw',
  'Doom Core'
];
const SUBFLOOR_NAMES=[
  'Forgotten Armory',
  'Blood Vault',
  'Rot Pit',
  'Mirror Crypt',
  'Bone Treasury',
  'Void Nest',
  'Corrupted Forge',
  'Ruin Chapel',
  'Abyssal Cellar'
];
const MAIN_FLOOR_TARGET=10;

function nowMs(){return Date.now();}

function createNexusFloorRecord(){
  return{
    id:'NEXUS',
    name:'Nexus Floor',
    kind:'nexus',
    zoneId:null,
    biome:'hub',
    mainDepth:0,
    depth:0,
    dangerTier:1,
    parentId:null,
    discovered:true,
    cleared:false,
    bossAlive:false,
    rareEvent:false,
    corruption:0,
    portals:{N:null,S:null,E:null,W:null},
    discoveredAt:nowMs(),
    createdAt:nowMs()
  };
}

function ensureProgressionState(g=G){
  if(!g||typeof g!=='object')return null;
  if(!g.floorRegistry||typeof g.floorRegistry!=='object')g.floorRegistry={};
  const reg=g.floorRegistry;
  if(!reg.floors||typeof reg.floors!=='object')reg.floors={};
  if(!reg.floors.NEXUS)reg.floors.NEXUS=createNexusFloorRecord();
  if(typeof reg.serial!=='number')reg.serial=0;
  if(!Array.isArray(reg.discovered))reg.discovered=['NEXUS'];
  if(typeof reg.mainNameCursor!=='number')reg.mainNameCursor=0;
  if(!reg.currentId)reg.currentId=(g.inZone||'NEXUS');

  // Migrate legacy saves that were inside static portal zones.
  if(g.inZone&&PORTAL_ZONES[g.inZone]&&!reg.floors[g.inZone]){
    reg.floors[g.inZone]={
      id:g.inZone,
      name:`${PORTAL_ZONES[g.inZone].name} Depth ${(g.portalDepth||1)}`,
      kind:'main',
      zoneId:g.inZone,
      biome:g.inZone,
      mainDepth:Math.max(1,g.portalDepth||1),
      depth:Math.max(1,g.portalDepth||1),
      dangerTier:Math.max(2,g.floor||2),
      parentId:'NEXUS',
      discovered:true,
      cleared:false,
      bossAlive:true,
      rareEvent:false,
      corruption:Math.max(0,Math.round((g.corruption||0)/4)),
      portals:{N:null,S:null,E:null,W:null},
      discoveredAt:nowMs(),
      createdAt:nowMs()
    };
  }

  if(!reg.discovered.includes('NEXUS'))reg.discovered.unshift('NEXUS');
  for(const floorId of Object.keys(reg.floors)){
    const meta=reg.floors[floorId];
    if(!meta.id)meta.id=floorId;
    if(!meta.kind)meta.kind=(floorId==='NEXUS'?'nexus':'main');
    if(meta.zoneId===undefined)meta.zoneId=(PORTAL_ZONES[floorId]?floorId:null);
    if(!meta.biome)meta.biome=(meta.zoneId||'hub');
    if(typeof meta.mainDepth!=='number')meta.mainDepth=(meta.kind==='nexus'?0:1);
    if(typeof meta.depth!=='number')meta.depth=meta.mainDepth;
    if(typeof meta.dangerTier!=='number')meta.dangerTier=Math.max(1,meta.mainDepth+1);
    if(!meta.portals)meta.portals={N:null,S:null,E:null,W:null};
    if(typeof meta.corruption!=='number')meta.corruption=0;
    if(typeof meta.bossAlive!=='boolean')meta.bossAlive=(meta.kind!=='nexus');
    if(typeof meta.cleared!=='boolean')meta.cleared=false;
    if(typeof meta.discovered!=='boolean')meta.discovered=(meta.id==='NEXUS');
    if(!meta.discoveredAt)meta.discoveredAt=nowMs();
    if(!meta.createdAt)meta.createdAt=nowMs();
    if(meta.discovered&&!reg.discovered.includes(meta.id))reg.discovered.push(meta.id);
  }

  const safeId=reg.floors[reg.currentId]?reg.currentId:'NEXUS';
  reg.currentId=safeId;
  const curMeta=reg.floors[safeId];
  if(curMeta){
    curMeta.discovered=true;
    if(!reg.discovered.includes(safeId))reg.discovered.push(safeId);
  }
  g.currentFloorId=safeId;
  if(safeId==='NEXUS')g.inZone=null;
  else g.inZone=safeId;
  return reg;
}

function allocateFloorId(kind='main'){
  const reg=ensureProgressionState();
  reg.serial=(reg.serial||0)+1;
  const head=kind==='sub'?'SUB':'FLR';
  return`${head}_${String(reg.serial).padStart(4,'0')}`;
}

function getFloorMeta(floorId){
  const reg=ensureProgressionState();
  const id=floorId||reg.currentId||'NEXUS';
  return reg.floors[id]||null;
}

function getCurrentFloorId(){
  const reg=ensureProgressionState();
  return G.inZone||G.currentFloorId||reg.currentId||'NEXUS';
}

function getCurrentFloorMeta(){
  return getFloorMeta(getCurrentFloorId());
}

function setCurrentFloorId(floorId){
  const reg=ensureProgressionState();
  const id=floorId&&reg.floors[floorId]?floorId:'NEXUS';
  reg.currentId=id;
  G.currentFloorId=id;
  G.inZone=(id==='NEXUS')?null:id;
  return id;
}

function getFloorZoneId(floorId){
  if(!floorId||floorId==='NEXUS')return null;
  if(PORTAL_ZONES[floorId])return floorId;
  const meta=getFloorMeta(floorId);
  if(meta&&meta.zoneId&&PORTAL_ZONES[meta.zoneId])return meta.zoneId;
  return null;
}

function getZoneDefForFloorId(floorId){
  const zid=getFloorZoneId(floorId);
  return zid?PORTAL_ZONES[zid]:null;
}

function getCurrentZoneDef(){
  return getZoneDefForFloorId(getCurrentFloorId());
}

function getMainFloorNameAt(index){
  const i=Math.max(0,Math.min(MAIN_FLOOR_NAMES.length-1,index|0));
  return MAIN_FLOOR_NAMES[i];
}

function getFloorDisplayName(floorId){
  if(!floorId||floorId==='NEXUS')return'Floor 0 — Nexus';
  const meta=getFloorMeta(floorId);
  if(!meta)return'Unknown Floor';
  const zdef=getZoneDefForFloorId(floorId);
  const base=meta.name||`Depth ${meta.mainDepth}`;
  if(meta.kind==='sub')return`${base} [Subfloor]`;
  if(zdef)return`${base} • ${zdef.name}`;
  return base;
}

function getFloorDangerTier(floorId){
  const meta=getFloorMeta(floorId);
  if(!meta)return Math.max(1,G.floor||1);
  return Math.max(1,Math.round(meta.dangerTier||meta.mainDepth||1));
}

function syncWorldDepthFromCurrentFloor(g=G){
  const reg=ensureProgressionState(g);
  const id=g.inZone||g.currentFloorId||reg.currentId||'NEXUS';
  const meta=reg.floors[id]||reg.floors.NEXUS;
  if(!meta)return;
  g.floor=Math.max(1,meta.dangerTier||1);
  g.portalDepth=Math.max(0,meta.mainDepth||0);
}

function registerFloorMeta(meta){
  const reg=ensureProgressionState();
  if(!meta||!meta.id)return null;
  reg.floors[meta.id]=meta;
  if(meta.discovered){
    if(!reg.discovered.includes(meta.id))reg.discovered.push(meta.id);
  }else{
    reg.discovered=reg.discovered.filter(id=>id!==meta.id);
  }
  return meta;
}

function nextMainFloorName(){
  const reg=ensureProgressionState();
  const idx=reg.mainNameCursor||0;
  reg.mainNameCursor=idx+1;
  if(idx<MAIN_FLOOR_NAMES.length)return MAIN_FLOOR_NAMES[idx];
  return`${MAIN_FLOOR_NAMES[MAIN_FLOOR_NAMES.length-1]} +${idx-MAIN_FLOOR_NAMES.length+1}`;
}

function createMainFloorMeta(parentFloorId,dir){
  const parent=getFloorMeta(parentFloorId)||getFloorMeta('NEXUS');
  const zoneId=PORTAL_ZONES[dir]?dir:'N';
  const depth=(parent?.mainDepth||0)+1;
  const zdef=PORTAL_ZONES[zoneId]||PORTAL_ZONES.N;
  const id=allocateFloorId('main');
  const meta={
    id,
    name:nextMainFloorName(),
    kind:'main',
    zoneId,
    biome:zoneId,
    mainDepth:depth,
    depth,
    dangerTier:Math.max(2,depth+1),
    parentId:parent?.id||'NEXUS',
    discovered:false,
    cleared:false,
    bossAlive:true,
    rareEvent:false,
    corruption:Math.min(99,Math.max(0,12+depth*7)),
    portals:{N:null,S:null,E:null,W:null},
    discoveredAt:nowMs(),
    createdAt:nowMs(),
    label:`${zdef.emoji} ${zdef.name}`
  };
  registerFloorMeta(meta);
  if(parent?.portals)parent.portals[dir]=id;
  return meta;
}

function rollSubfloorName(){
  const n=SUBFLOOR_NAMES[Math.floor(Math.random()*SUBFLOOR_NAMES.length)]||'Hidden Subfloor';
  return`${n} ${Math.floor(10+Math.random()*90)}`;
}

function createSubfloorMeta(parentFloorId,seedTag='secret'){
  const parent=getFloorMeta(parentFloorId)||getFloorMeta('NEXUS');
  const zoneId=parent?.zoneId||'W';
  const depth=Math.max(1,(parent?.mainDepth||0)+1);
  const id=allocateFloorId('sub');
  const meta={
    id,
    name:rollSubfloorName(),
    kind:'sub',
    zoneId,
    biome:zoneId,
    mainDepth:depth,
    depth,
    dangerTier:Math.max(2,(parent?.dangerTier||2)+1),
    parentId:parent?.id||'NEXUS',
    discovered:false,
    cleared:false,
    bossAlive:true,
    rareEvent:true,
    seedTag,
    corruption:Math.min(99,Math.max(0,(parent?.corruption||15)+8)),
    portals:{N:null,S:null,E:null,W:null},
    discoveredAt:nowMs(),
    createdAt:nowMs()
  };
  registerFloorMeta(meta);
  return meta;
}

function ensurePortalLinksForFloor(floorId){
  const meta=getFloorMeta(floorId)||getFloorMeta('NEXUS');
  if(!meta||!meta.portals)return null;
  PORTAL_DIRS.forEach(dir=>{
    if(meta.portals[dir]&&getFloorMeta(meta.portals[dir]))return;
    const child=createMainFloorMeta(meta.id,dir);
    meta.portals[dir]=child.id;
  });
  return meta;
}

function getDiscoveredFloorList(includeSub=true){
  const reg=ensureProgressionState();
  const out=(reg.discovered||[]).map(id=>reg.floors[id]).filter(Boolean);
  return out
    .filter(f=>includeSub||f.kind!=='sub')
    .sort((a,b)=>{
      if((a.kind==='nexus')!==(b.kind==='nexus'))return a.kind==='nexus'?-1:1;
      if((a.mainDepth||0)!==(b.mainDepth||0))return (a.mainDepth||0)-(b.mainDepth||0);
      return (a.createdAt||0)-(b.createdAt||0);
    });
}


