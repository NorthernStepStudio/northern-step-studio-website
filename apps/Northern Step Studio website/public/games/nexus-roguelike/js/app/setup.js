// SETUP
// ═══════════════════════════════
let SC=null;
function selectClass(el){
  document.querySelectorAll('.class-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  SC=el.dataset.class;
  document.getElementById('start-btn').disabled=false;
  if(typeof rememberHeroSelection==='function')rememberHeroSelection(SC);
}

function equipDirect(it){
  const p=G.player;
  if(it.type==='weapon'){if(G.equippedWeapon){p.atk-=G.equippedWeapon.effect.atk||0;}G.equippedWeapon=it;p.atk+=it.effect.atk||0;if(it.effect.crit)p.crit+=it.effect.crit;if(it.effect.def)p.def+=it.effect.def||0;}
}

async function startNewGame(){
  if(!SC)return;
  if(typeof hasAnySaveData==='function'){
    try{
      const hasSave=await hasAnySaveData();
      if(hasSave&&!confirm('A save already exists. Start a new run and overwrite it?'))return;
    }catch(_){}
  }else if(localStorage.getItem(SK)&&!confirm('A save already exists. Start a new run and overwrite it?')){
    return;
  }
  if(typeof clearSaves==='function')await clearSaves(true);
  else localStorage.removeItem(SK);
  const cls=CLS[SC];
  const meta=getMetaBonus();

  G={
    player:{x:0,y:0,emoji:cls.emoji,className:cls.name,classType:SC,classData:cls,
      level:1,xp:0,hp:cls.hp,maxHp:cls.hp,mp:cls.mp,maxMp:cls.mp,
      atk:cls.atk,def:cls.def,spd:cls.spd,crit:cls.crit,gold:50,perks:{},status:{}},
    map:null,enemies:[],items:[],
    floor:1,turn:0,inCombat:false,currentEnemy:null,
    inventory:[],equippedWeapon:null,equippedArmor:null,equippedRing:null,
    kills:0,goldTotal:0,perkList:[],maxInvSlots:8+(meta.invBonus||0),shopStock:[],elixirBuffs:[],
    corruption:0,activeModifiers:[],bossKills:0,fusionCount:0,
    metaBonus:meta,shopRerollsLeft:meta.vendorReroll?1:0,
    inZone:null,zoneEnemies:{},zoneItems:{},portalReturnX:0,portalReturnY:0,portalDepth:0,
    currentFloorId:'NEXUS',floorRegistry:null
  };
  ensureProgressionState(G);
  ensurePortalLinksForFloor('NEXUS');
  setCurrentFloorId('NEXUS');
  syncWorldDepthFromCurrentFloor(G);

  // Starting weapon
  const startWpnData=WEAPON_TIERS[0].find(w=>w.id===cls.sw)||WEAPON_TIERS[0][0];
  const sw={...startWpnData,type:'weapon',tier:1,uid:Math.random().toString(36).slice(2)};
  G.inventory.push(sw);
  G.inventory.push({...CONSUMABLES[0],uid:Math.random().toString(36).slice(2)});
  G.inventory.push({...CONSUMABLES[0],uid:Math.random().toString(36).slice(2)});
  G.inventory.push({...CONSUMABLES[2],uid:Math.random().toString(36).slice(2)});
  if(meta.startPotion)G.inventory.push({...CONSUMABLES[0],uid:Math.random().toString(36).slice(2)});
  // Meta: start with materials
  if(meta.startMat){
    G.inventory.push(makeMaterial('iron_ore'));
    G.inventory.push(makeMaterial('leather'));
  }
  equipDirect(sw);
  showGS();generateMap();placeEntities();updateVision(G.player.x,G.player.y);
  addLog(`Welcome, ${cls.name}! 50g to start.`,'info');
  addLog(`Walk to Shop • Blacksmith • Alchemist on the map!`,'info');
  addLog(`Find the 4 colored portals — each leads to a dangerous zone with unique loot!`,'funny');
  if(meta.invBonus)addLog(`Meta bonus: +${meta.invBonus} inventory slots!`,'loot');
  updateDoomBar();updateModBar();
  renderMap();updateHUD();saveG();
}

function showGS(){
  document.getElementById('title-screen').style.display='none';
  document.getElementById('game-screen').style.display='flex';
  // Minimap starts collapsed — player opens it when needed
  const mi=document.getElementById('minimap-inner');
  if(mi)mi.classList.remove('collapsed');
}


