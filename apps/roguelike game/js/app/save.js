// ═══════════════════════════════
// SAVE SYSTEM HARDENING LAYER
// localStorage + IndexedDB + import/export + recovery + migrations
// ═══════════════════════════════
(function(){
  "use strict";

  const NS_SAVE_VERSION=3;
  const NS_GAME_VERSION="nexus-roguelike-web-3.1.0";
  const BASE_KEY=(typeof SK==="string"&&SK)?SK:"doomed_v4";
  const META_KEY=(typeof META_SK==="string"&&META_SK)?META_SK:"doomed_meta_v1";
  const KEY={
    latest:`${BASE_KEY}_autosave_latest`,
    previous:`${BASE_KEY}_autosave_previous`,
    emergency:`${BASE_KEY}_autosave_emergency`,
    manual:`${BASE_KEY}_manual_backup`,
    selectedHeroDraft:`${BASE_KEY}_hero_draft`,
    status:`${BASE_KEY}_save_status`,
    legacyPrimary:BASE_KEY,
    legacyBackup:`${BASE_KEY}_backup`,
    legacyMeta:`${BASE_KEY}_meta`,
  };
  const SLOT_BY_KEY={
    [KEY.latest]:"autosave_latest",
    [KEY.previous]:"autosave_previous",
    [KEY.emergency]:"autosave_emergency",
    [KEY.manual]:"manual_backup",
    [KEY.legacyPrimary]:"legacy_primary",
    [KEY.legacyBackup]:"legacy_backup",
  };
  const SLOT_KEYS=[KEY.latest,KEY.previous,KEY.emergency,KEY.manual,KEY.legacyPrimary,KEY.legacyBackup];
  const RECOVERY_KEYS=[KEY.latest,KEY.previous,KEY.emergency,KEY.manual,KEY.legacyPrimary,KEY.legacyBackup];

  const IDB_NAME="nexus_roguelike_save_db";
  const IDB_STORE="slots";
  const AUTOSAVE_MS=45000;
  const SAVE_DEBOUNCE_MS=900;

  const S={
    storageReady:null,
    saveTimer:null,
    lastWriteAt:0,
    pendingReason:"",
    recoverNotice:"",
    saveSummaryFloor:null,
    saveSummaryHas:false,
    saveSummaryText:"",
    playStamp:Date.now(),
  };

  function now(){return Date.now();}

  function isFn(v){return typeof v==="function";}

  function toNum(v,fallback=0){
    const n=Number(v);
    return Number.isFinite(n)?n:fallback;
  }

  function clamp(n,min,max){
    return Math.max(min,Math.min(max,n));
  }

  function safeClone(v){
    try{return structuredClone(v);}
    catch(_){return JSON.parse(JSON.stringify(v));}
  }

  function isObj(v){
    return !!v&&typeof v==="object"&&!Array.isArray(v);
  }

  function canUseStorage(){
    if(S.storageReady!==null)return S.storageReady;
    try{
      const probe="__nexus_save_probe__";
      localStorage.setItem(probe,"1");
      localStorage.removeItem(probe);
      S.storageReady=true;
    }catch(_){
      S.storageReady=false;
    }
    return S.storageReady;
  }

  function setStatus(txt,type="info"){
    const statusEl=document.getElementById("save-status");
    const panelEl=document.getElementById("save-panel-status");
    const c=(type==="ok")?"#77ffaa":(type==="warn")?"#ffcc66":(type==="error")?"#ff7777":"#88ccff";
    if(statusEl){
      statusEl.textContent=txt;
      statusEl.style.color=c;
      statusEl.classList.add("show");
      clearTimeout(statusEl._hideTimer);
      statusEl._hideTimer=setTimeout(()=>statusEl.classList.remove("show"),2200);
    }
    if(panelEl){
      panelEl.textContent=txt;
      panelEl.style.color=c;
    }
    try{
      localStorage.setItem(KEY.status,JSON.stringify({t:txt,type,at:now()}));
    }catch(_){}
  }

  function loadStatusFromStorage(){
    if(!canUseStorage())return;
    try{
      const raw=localStorage.getItem(KEY.status);
      if(!raw)return;
      const d=JSON.parse(raw);
      if(d&&d.t)setStatus(d.t,d.type||"info");
    }catch(_){}
  }

  function hashString(str){
    let h=2166136261>>>0;
    for(let i=0;i<str.length;i++){
      h^=str.charCodeAt(i);
      h=Math.imul(h,16777619)>>>0;
    }
    return h.toString(16).padStart(8,"0");
  }

  function checksumForData(data){
    return hashString(JSON.stringify(data));
  }

  function collectFloorFields(reg){
    const floors=isObj(reg?.floors)?Object.values(reg.floors):[];
    const discovered=floors.filter(f=>f&&f.discovered).map(f=>f.id);
    const cleared=floors.filter(f=>f&&f.cleared).map(f=>f.id);
    const defeatedBosses=floors.filter(f=>f&&f.kind!=="nexus"&&f.bossAlive===false).map(f=>f.id);
    return{discovered,cleared,defeatedBosses};
  }

  function markPlaytime(g){
    const stamp=now();
    const delta=Math.max(0,stamp-(S.playStamp||stamp));
    S.playStamp=stamp;
    g.playtimeMs=toNum(g.playtimeMs,0)+delta;
  }

  function currentMeta(){
    if(isFn(loadMeta)){
      try{
        const m=loadMeta();
        if(m&&isObj(m))return safeClone(m);
      }catch(_){}
    }
    try{
      const raw=localStorage.getItem(META_KEY);
      if(raw){
        const m=JSON.parse(raw);
        if(m&&isObj(m))return m;
      }
    }catch(_){}
    return{shards:0,upgrades:{}};
  }

  function sanitizeWorldState(g){
    const c=safeClone(g||{});
    c.inCombat=false;
    c.currentEnemy=null;
    if(!isObj(c.zoneEnemies))c.zoneEnemies={};
    if(!isObj(c.zoneItems))c.zoneItems={};
    if(c.map&&!isObj(c.map.zones))c.map.zones={};
    if(!Array.isArray(c.inventory))c.inventory=[];
    if(!isObj(c.settings))c.settings={};
    markPlaytime(c);
    return c;
  }

  function buildSaveData(){
    if(!isObj(G)||!isObj(G.player))return null;
    const meta=currentMeta();
    const worldG=sanitizeWorldState(G);
    const reg=isObj(worldG.floorRegistry)?worldG.floorRegistry:{floors:{},links:{}};
    const floorFields=collectFloorFields(reg);
    const rareItems=(Array.isArray(worldG.rareItemsFound)?worldG.rareItemsFound:[])
      .concat((worldG.inventory||[])
        .filter(it=>toNum(it?.tier,1)>=4||toNum(it?.rarity,1)>=3)
        .map(it=>it?.id||it?.name)
      )
      .filter(Boolean);
    const dedupRare=[...new Set(rareItems)];
    const currentFloor=worldG.inZone||worldG.currentFloorId||reg.currentId||"NEXUS";
    const unlockedPortals=[...new Set(
      Object.entries(reg.links||{}).flatMap(([from,dirs])=>
        Object.entries(dirs||{})
          .filter(([,id])=>!!id)
          .map(([dir,id])=>`${from}:${dir}->${id}`)
      )
    )];

    const data={
      saveVersion:NS_SAVE_VERSION,
      gameVersion:NS_GAME_VERSION,
      timestamp:now(),
      selectedHero:worldG.player.classType||null,
      hero:safeClone(worldG.player),
      inventory:safeClone(worldG.inventory||[]),
      equippedItems:{
        weapon:safeClone(worldG.equippedWeapon||null),
        armor:safeClone(worldG.equippedArmor||null),
        ring:safeClone(worldG.equippedRing||null),
      },
      gold:toNum(worldG.player.gold,0),
      doomShards:toNum(meta.shards,0),
      discoveredFloors:floorFields.discovered,
      currentFloor,
      currentPosition:{x:toNum(worldG.player.x,0),y:toNum(worldG.player.y,0)},
      clearedFloors:floorFields.cleared,
      defeatedBosses:floorFields.defeatedBosses,
      unlockedPortals,
      rareItemsFound:dedupRare,
      metaUpgrades:safeClone(meta.upgrades||{}),
      settings:{
        zoomLevel:toNum(zoomLevel,3),
        lowFxMode:!!window.__nsLowFxMode,
        reducedMotion:!!worldG.settings?.reducedMotion,
        touchControls:true,
      },
      playtime:{
        totalMs:toNum(worldG.playtimeMs,0),
        snapshotAt:now(),
      },
      doomState:{
        corruption:toNum(worldG.corruption,0),
        bossKills:toNum(worldG.bossKills,0),
        activeModifiers:safeClone(worldG.activeModifiers||[]),
      },
      floorRegistry:safeClone(reg),
      world:{
        G:worldG,
        customSprite:customSprite||null,
        zoomLevel:toNum(zoomLevel,3),
      },
    };
    return data;
  }

  function toEnvelope(data,reason){
    const env={
      saveVersion:data.saveVersion,
      gameVersion:data.gameVersion,
      timestamp:data.timestamp,
      reason:reason||"autosave",
      data,
    };
    env.checksum=checksumForData(env.data);
    return env;
  }

  function migrateV1ToV2(oldSave){
    const legacy=safeClone(oldSave||{});
    const legacyG=sanitizeWorldState(legacy.G||{});
    const meta=currentMeta();
    const reg=isObj(legacyG.floorRegistry)?legacyG.floorRegistry:{floors:{},links:{}};
    const floorFields=collectFloorFields(reg);
    const data={
      saveVersion:2,
      gameVersion:String(legacy.version||"legacy-v1"),
      timestamp:toNum(legacy.savedAt,now()),
      selectedHero:legacyG.player?.classType||null,
      hero:safeClone(legacyG.player||{}),
      inventory:safeClone(legacyG.inventory||[]),
      equippedItems:{
        weapon:safeClone(legacyG.equippedWeapon||null),
        armor:safeClone(legacyG.equippedArmor||null),
        ring:safeClone(legacyG.equippedRing||null),
      },
      gold:toNum(legacyG.player?.gold,0),
      doomShards:toNum(meta.shards,0),
      discoveredFloors:floorFields.discovered,
      currentFloor:legacyG.inZone||legacyG.currentFloorId||"NEXUS",
      currentPosition:{x:toNum(legacyG.player?.x,0),y:toNum(legacyG.player?.y,0)},
      clearedFloors:floorFields.cleared,
      defeatedBosses:floorFields.defeatedBosses,
      unlockedPortals:[...new Set(
        Object.entries(reg.links||{}).flatMap(([from,dirs])=>
          Object.entries(dirs||{})
            .filter(([,id])=>!!id)
            .map(([dir,id])=>`${from}:${dir}->${id}`)
        )
      )],
      rareItemsFound:[],
      metaUpgrades:safeClone(meta.upgrades||{}),
      settings:{zoomLevel:toNum(legacy.zoomLevel,3),lowFxMode:false,reducedMotion:false,touchControls:true},
      playtime:{totalMs:toNum(legacyG.playtimeMs,0),snapshotAt:now()},
      doomState:{
        corruption:toNum(legacyG.corruption,0),
        bossKills:toNum(legacyG.bossKills,0),
        activeModifiers:safeClone(legacyG.activeModifiers||[]),
      },
      floorRegistry:safeClone(reg),
      world:{
        G:legacyG,
        customSprite:legacy.customSprite||null,
        zoomLevel:toNum(legacy.zoomLevel,3),
      },
      legacyExtras:Object.fromEntries(
        Object.entries(legacy).filter(([k])=>!["version","savedAt","G","customSprite","zoomLevel"].includes(k))
      ),
    };
    return data;
  }

  function migrateDataToCurrent(d){
    const data=safeClone(d||{});
    if(!isObj(data.world))data.world={};
    if(!isObj(data.world.G))data.world.G=sanitizeWorldState(data.G||{});
    if(!isObj(data.hero)&&isObj(data.world.G.player))data.hero=safeClone(data.world.G.player);
    if(!Array.isArray(data.inventory)&&Array.isArray(data.world.G.inventory))data.inventory=safeClone(data.world.G.inventory);
    if(!isObj(data.equippedItems)){
      data.equippedItems={
        weapon:safeClone(data.world.G.equippedWeapon||null),
        armor:safeClone(data.world.G.equippedArmor||null),
        ring:safeClone(data.world.G.equippedRing||null),
      };
    }
    if(!isObj(data.playtime))data.playtime={totalMs:toNum(data.world.G.playtimeMs,0),snapshotAt:now()};
    if(!isObj(data.doomState)){
      data.doomState={
        corruption:toNum(data.world.G.corruption,0),
        bossKills:toNum(data.world.G.bossKills,0),
        activeModifiers:safeClone(data.world.G.activeModifiers||[]),
      };
    }
    if(!isObj(data.floorRegistry))data.floorRegistry=safeClone(data.world.G.floorRegistry||{floors:{},links:{}});
    if(!Array.isArray(data.discoveredFloors)||!Array.isArray(data.clearedFloors)||!Array.isArray(data.defeatedBosses)){
      const floors=collectFloorFields(data.floorRegistry);
      if(!Array.isArray(data.discoveredFloors))data.discoveredFloors=floors.discovered;
      if(!Array.isArray(data.clearedFloors))data.clearedFloors=floors.cleared;
      if(!Array.isArray(data.defeatedBosses))data.defeatedBosses=floors.defeatedBosses;
    }
    if(!Array.isArray(data.rareItemsFound))data.rareItemsFound=[];
    if(!Array.isArray(data.unlockedPortals))data.unlockedPortals=[];
    if(!isObj(data.settings))data.settings={zoomLevel:3,lowFxMode:false,reducedMotion:false,touchControls:true};
    if(!isObj(data.metaUpgrades))data.metaUpgrades={};
    if(data.doomShards===undefined)data.doomShards=0;
    if(data.gold===undefined)data.gold=toNum(data.hero?.gold,0);
    if(!data.currentFloor)data.currentFloor=data.world.G.inZone||data.world.G.currentFloorId||"NEXUS";
    if(!isObj(data.currentPosition)){
      data.currentPosition={x:toNum(data.hero?.x,0),y:toNum(data.hero?.y,0)};
    }
    data.saveVersion=NS_SAVE_VERSION;
    data.gameVersion=data.gameVersion||NS_GAME_VERSION;
    data.timestamp=toNum(data.timestamp,now());
    return data;
  }

  function migrateSave(raw){
    if(!raw||typeof raw!=="object")return null;

    // Already envelope-like
    if(isObj(raw.data)){
      const data=migrateDataToCurrent(raw.data);
      return toEnvelope(data,raw.reason||"migrated");
    }
    // Data-only save payload
    if(raw.world&&raw.hero){
      const data=migrateDataToCurrent(raw);
      return toEnvelope(data,"migrated_data_only");
    }
    // Legacy core save
    if(raw.G){
      const v2=migrateV1ToV2(raw);
      const data=migrateDataToCurrent(v2);
      return toEnvelope(data,"migrated_legacy");
    }
    return null;
  }

  function validateInventory(inv){
    if(!Array.isArray(inv))return false;
    if(inv.length>3000)return false;
    for(const it of inv){
      if(!isObj(it))return false;
      if(typeof it.name!=="string"&&typeof it.id!=="string")return false;
      if(it.tier!==undefined&&!Number.isFinite(Number(it.tier)))return false;
    }
    return true;
  }

  function validateFloorRegistry(fr){
    if(!isObj(fr))return false;
    if(fr.floors!==undefined&&!isObj(fr.floors))return false;
    if(fr.links!==undefined&&!isObj(fr.links))return false;
    return true;
  }

  function validateData(data){
    const errs=[];
    if(!isObj(data))errs.push("data_missing");
    if(!Number.isFinite(toNum(data?.saveVersion,NaN)))errs.push("save_version_invalid");
    if(typeof data?.gameVersion!=="string")errs.push("game_version_invalid");
    if(!Number.isFinite(toNum(data?.timestamp,NaN)))errs.push("timestamp_invalid");
    if(!isObj(data?.hero))errs.push("hero_missing");
    if(!validateInventory(data?.inventory))errs.push("inventory_invalid");
    if(!validateFloorRegistry(data?.floorRegistry||{}))errs.push("floor_registry_invalid");
    if(!isObj(data?.currentPosition))errs.push("position_invalid");
    const hp=toNum(data?.hero?.hp,-1),maxHp=toNum(data?.hero?.maxHp,-1);
    const mp=toNum(data?.hero?.mp,-1),maxMp=toNum(data?.hero?.maxMp,-1);
    if(hp<0||maxHp<1||hp>999999||maxHp>999999)errs.push("hero_hp_range");
    if(mp<0||maxMp<0||mp>999999||maxMp>999999)errs.push("hero_mp_range");
    const x=toNum(data?.currentPosition?.x,NaN),y=toNum(data?.currentPosition?.y,NaN);
    if(!Number.isFinite(x)||!Number.isFinite(y))errs.push("hero_pos_range");
    return{ok:errs.length===0,errors:errs};
  }

  function validateEnvelope(env){
    if(!isObj(env)||!isObj(env.data))return{ok:false,errors:["envelope_missing"]};
    const check=checksumForData(env.data);
    if(env.checksum!==check)return{ok:false,errors:["checksum_mismatch"]};
    return validateData(env.data);
  }

  function parseEnvelopeRaw(raw){
    try{
      const parsed=JSON.parse(raw);
      const env=migrateSave(parsed);
      if(!env)return null;
      const v=validateEnvelope(env);
      if(!v.ok)return{env:null,error:v.errors.join(",")};
      return{env,error:null};
    }catch(e){
      return{env:null,error:"parse_failed"};
    }
  }

  function rotateLocalSlots(newJson){
    const prevLatest=localStorage.getItem(KEY.latest);
    const prevPrevious=localStorage.getItem(KEY.previous);
    if(prevPrevious)localStorage.setItem(KEY.emergency,prevPrevious);
    else if(prevLatest)localStorage.setItem(KEY.emergency,prevLatest);
    if(prevLatest)localStorage.setItem(KEY.previous,prevLatest);
    localStorage.setItem(KEY.latest,newJson);
    // Legacy compatibility keys
    localStorage.setItem(KEY.legacyPrimary,newJson);
    if(prevLatest)localStorage.setItem(KEY.legacyBackup,prevLatest);
    localStorage.setItem(KEY.legacyMeta,JSON.stringify({
      savedAt:now(),
      floor:(isObj(G)&&toNum(G.floor,1))||1,
      level:(isObj(G?.player)&&toNum(G.player.level,1))||1,
    }));
  }

  function openIdb(){
    if(!("indexedDB" in window))return Promise.resolve(null);
    return new Promise((resolve)=>{
      const req=indexedDB.open(IDB_NAME,1);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains(IDB_STORE)){
          db.createObjectStore(IDB_STORE,{keyPath:"slot"});
        }
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
    });
  }

  async function idbPut(slot,raw){
    const db=await openIdb();
    if(!db)return false;
    return new Promise((resolve)=>{
      const tx=db.transaction(IDB_STORE,"readwrite");
      const st=tx.objectStore(IDB_STORE);
      st.put({slot,raw,updatedAt:now()});
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>resolve(false);
      tx.onabort=()=>resolve(false);
    });
  }

  async function idbGet(slot){
    const db=await openIdb();
    if(!db)return null;
    return new Promise((resolve)=>{
      const tx=db.transaction(IDB_STORE,"readonly");
      const st=tx.objectStore(IDB_STORE);
      const rq=st.get(slot);
      rq.onsuccess=()=>resolve(rq.result||null);
      rq.onerror=()=>resolve(null);
    });
  }

  async function idbDelete(slot){
    const db=await openIdb();
    if(!db)return false;
    return new Promise((resolve)=>{
      const tx=db.transaction(IDB_STORE,"readwrite");
      tx.objectStore(IDB_STORE).delete(slot);
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>resolve(false);
      tx.onabort=()=>resolve(false);
    });
  }

  async function rotateIdbSlots(newRaw){
    let ok=true;
    const latest=await idbGet("autosave_latest");
    const prev=await idbGet("autosave_previous");
    if(prev?.raw)ok=(await idbPut("autosave_emergency",prev.raw))&&ok;
    else if(latest?.raw)ok=(await idbPut("autosave_emergency",latest.raw))&&ok;
    if(latest?.raw)ok=(await idbPut("autosave_previous",latest.raw))&&ok;
    ok=(await idbPut("autosave_latest",newRaw))&&ok;
    ok=(await idbPut("legacy_primary",newRaw))&&ok;
    if(latest?.raw)ok=(await idbPut("legacy_backup",latest.raw))&&ok;
    return ok;
  }

  async function saveEnvelope(reason,manual=false){
    const data=buildSaveData();
    if(!data)return false;
    const env=toEnvelope(data,reason||"autosave");
    const raw=JSON.stringify(env);
    let localOk=false;

    if(canUseStorage()){
      try{
        rotateLocalSlots(raw);
        if(manual)localStorage.setItem(KEY.manual,raw);
        localOk=true;
      }catch(_){
        localOk=false;
      }
    }

    const idbOps=[rotateIdbSlots(raw)];
    if(manual)idbOps.push(idbPut("manual_backup",raw));
    const idbResults=await Promise.allSettled(idbOps);
    const idbOk=idbResults.some(r=>r.status==="fulfilled"&&r.value!==false);

    S.lastWriteAt=now();
    S.pendingReason="";
    if(!localOk&&!idbOk){
      setStatus("Save failed — export backup now.","error");
      return false;
    }
    const mode=manual?"manual backup":"autosave";
    if(!localOk&&idbOk)setStatus(`Saved to IndexedDB ${mode}.`,"warn");
    else if(manual) setStatus(`Saved just now (${mode}).`,"ok");
    refreshSaveSummary();
    return localOk||idbOk;
  }

  function emergencyLocalSnapshot(reason){
    if(!isObj(G)||!isObj(G.player)||!canUseStorage())return false;
    try{
      const data=buildSaveData();
      if(!data)return false;
      const env=toEnvelope(data,reason||"visibility_emergency");
      const raw=JSON.stringify(env);
      rotateLocalSlots(raw);
      return true;
    }catch(_){
      return false;
    }
  }

  function scheduleAutosave(reason){
    if(!isObj(G)||!isObj(G.player))return false;
    S.pendingReason=reason||"autosave";
    clearTimeout(S.saveTimer);
    // setStatus("Autosaving…","info");
    S.saveTimer=setTimeout(()=>{
      saveEnvelope(S.pendingReason||"autosave",false).catch(()=>{
        setStatus("Save failed — export backup now.","error");
      });
    },SAVE_DEBOUNCE_MS);
    return true;
  }

  function saveG(reason){
    if(!isObj(G)||!isObj(G.player))return false;
    const elapsed=now()-S.lastWriteAt;
    if(elapsed>=SAVE_DEBOUNCE_MS){
      saveEnvelope(typeof reason==="string"?reason:"autosave",false).catch(()=>{
        setStatus("Save failed — export backup now.","error");
      });
      return true;
    }
    return scheduleAutosave(typeof reason==="string"?reason:"autosave");
  }

  async function saveNow(openNotice=false){
    if(!isObj(G)||!isObj(G.player)){
      setStatus("No active run to save.","warn");
      return false;
    }
    try{
      clearTimeout(S.saveTimer);
      const ok=await saveEnvelope("manual_save",true);
      if(openNotice&&isFn(addLog))addLog("💾 Save complete.","info");
      return !!ok;
    }catch(_){
      setStatus("Save failed — export backup now.","error");
      return false;
    }
  }

  function applyLoadedData(data){
    const d=migrateDataToCurrent(data);
    const v=validateData(d);
    if(!v.ok)throw new Error("invalid_save_data:"+v.errors.join(","));

    const world=d.world||{};
    G=sanitizeWorldState(world.G||{});
    if(!isObj(G.player))throw new Error("missing_player_state");

    // Restore key root fields
    G.player=safeClone(d.hero||G.player);
    G.inventory=safeClone(d.inventory||G.inventory||[]);
    G.equippedWeapon=safeClone(d.equippedItems?.weapon||G.equippedWeapon||null);
    G.equippedArmor=safeClone(d.equippedItems?.armor||G.equippedArmor||null);
    G.equippedRing=safeClone(d.equippedItems?.ring||G.equippedRing||null);
    const loadedFloorId=d.currentFloor||G.currentFloorId||"NEXUS";
    G.currentFloorId=loadedFloorId;
    G.inZone=(loadedFloorId&&loadedFloorId!=="NEXUS")?loadedFloorId:null;
    G.floorRegistry=safeClone(d.floorRegistry||G.floorRegistry||{floors:{},links:{}});
    G.corruption=toNum(d.doomState?.corruption,G.corruption||0);
    G.activeModifiers=safeClone(d.doomState?.activeModifiers||G.activeModifiers||[]);
    G.bossKills=toNum(d.doomState?.bossKills,G.bossKills||0);
    G.playtimeMs=toNum(d.playtime?.totalMs,G.playtimeMs||0);
    if(!isObj(G.settings))G.settings={};
    G.settings.reducedMotion=!!d.settings?.reducedMotion;
    G.settings.lowFxMode=!!d.settings?.lowFxMode;

    customSprite=world.customSprite||null;
    zoomLevel=clamp(toNum(world.zoomLevel,d.settings?.zoomLevel??zoomLevel),0,(ZOOM_STEPS?.length||1)-1);

    // Restore meta progression snapshot as backup-safe data.
    try{
      const meta={shards:toNum(d.doomShards,0),upgrades:safeClone(d.metaUpgrades||{})};
      localStorage.setItem(META_KEY,JSON.stringify(meta));
    }catch(_){}

    if(isFn(ensureProgressionState))ensureProgressionState(G);
    if(isFn(syncWorldDepthFromCurrentFloor))syncWorldDepthFromCurrentFloor(G);
    if(!G.map&&isFn(generateMap)){
      generateMap();
      if(isFn(placeEntities))placeEntities();
      if(isFn(updateVision))updateVision(G.player.x,G.player.y);
    }
  }

  async function collectCandidates(){
    S.recoverNotice="";
    const out=[];
    if(canUseStorage()){
      for(const k of SLOT_KEYS){
        const raw=localStorage.getItem(k);
        if(!raw)continue;
        const p=parseEnvelopeRaw(raw);
        if(p?.env){
          out.push({source:"localStorage",key:k,slot:SLOT_BY_KEY[k]||k,env:p.env});
        }else if(k===KEY.latest&&p?.error){
          S.recoverNotice=`Latest save is damaged (${p.error}).`;
        }
      }
    }
    const idbSlots=["autosave_latest","autosave_previous","autosave_emergency","manual_backup","legacy_primary","legacy_backup"];
    for(const slot of idbSlots){
      const rec=await idbGet(slot);
      if(!rec?.raw)continue;
      const p=parseEnvelopeRaw(rec.raw);
      if(p?.env){
        out.push({source:"indexedDB",key:slot,slot,env:p.env});
      }else if(slot==="autosave_latest"&&p?.error){
        S.recoverNotice=`Latest save is damaged (${p.error}).`;
      }
    }
    return out;
  }

  async function bestCandidate(preferRecovery=false){
    const candidates=await collectCandidates();
    if(!candidates.length)return null;
    candidates.sort((a,b)=>toNum(b.env.timestamp,0)-toNum(a.env.timestamp,0));
    if(!preferRecovery)return candidates[0];
    const badPrimary=(S.recoverNotice||"").length>0;
    if(!badPrimary)return candidates[0];
    return candidates.find(c=>c.slot!=="autosave_latest"&&c.slot!=="legacy_primary")||candidates[0];
  }

  async function loadGame(){
    try{
      const cand=await bestCandidate(false);
      if(!cand){
        setStatus("No save found. Start a new run.","warn");
        return false;
      }
      applyLoadedData(cand.env.data);
      if(isFn(showGS))showGS();
      if(isFn(updateVision))updateVision(G.player.x,G.player.y);
      if(isFn(renderMap))renderMap();
      if(isFn(updateHUD))updateHUD();
      if(isFn(updateDoomBar))updateDoomBar();
      if(isFn(updateModBar))updateModBar();
      const zdef=isFn(getCurrentZoneDef)?getCurrentZoneDef():null;
      const tint=document.getElementById("zone-tint");
      if(tint&&G.inZone&&zdef){
        tint.style.background=zdef.tint;
        tint.style.opacity="1";
      }else if(tint){
        tint.style.opacity="0";
      }
      if(isFn(addLog)){
        addLog("Loaded! Welcome back.","info");
        if(S.recoverNotice)addLog("Save recovered from backup.","loot");
      }
      if(S.recoverNotice)setStatus("Save recovered from backup.","warn");
      else setStatus("Save loaded.","ok");
      await saveEnvelope("post_load_normalize",false);
      return true;
    }catch(e){
      console.warn("loadGame failed",e);
      setStatus("Save load failed. Use Recover Backup.","error");
      return false;
    }
  }

  function checkSave(){
    if(!S.saveSummaryHas)return null;
    return Math.max(1,toNum(S.saveSummaryFloor,1));
  }

  async function refreshSaveSummary(){
    try{
      const cand=await bestCandidate(false);
      if(!cand){
        S.saveSummaryHas=false;
        S.saveSummaryFloor=null;
        S.saveSummaryText="";
      }else{
        const d=cand.env.data;
        const reg=d.floorRegistry;
        const cid=d.currentFloor||"NEXUS";
        const meta=(reg?.floors&&reg.floors[cid])||null;
        S.saveSummaryFloor=Math.max(0,toNum(meta?.mainDepth,toNum(d.world?.G?.floor,1))-0);
        S.saveSummaryHas=true;
        S.saveSummaryText=`Floor ${S.saveSummaryFloor}`;
      }
      const cbtn=document.getElementById("continue-btn");
      const sfl=document.getElementById("sfl");
      if(cbtn)cbtn.style.display=S.saveSummaryHas?"block":"none";
      if(sfl&&S.saveSummaryHas)sfl.textContent=String(S.saveSummaryFloor);
      if(S.recoverNotice)setStatus("Latest save failed validation. Use Recover Backup.","warn");
    }catch(_){}
  }

  async function recoverBackupSave(){
    try{
      const cand=await bestCandidate(true);
      if(!cand){
        setStatus("No backup save available.","warn");
        return false;
      }
      applyLoadedData(cand.env.data);
      if(isFn(showGS))showGS();
      if(isFn(updateVision))updateVision(G.player.x,G.player.y);
      if(isFn(renderMap))renderMap();
      if(isFn(updateHUD))updateHUD();
      if(isFn(updateDoomBar))updateDoomBar();
      if(isFn(updateModBar))updateModBar();
      setStatus("Save recovered.","ok");
      if(isFn(addLog))addLog("🛠 Backup recovery successful.","loot");
      await saveEnvelope("recovered_save",false);
      return true;
    }catch(_){
      setStatus("Recovery failed.","error");
      return false;
    }
  }

  async function exportSaveData(){
    try{
      if(isObj(G)&&isObj(G.player))await saveNow(false);
      let cand=await bestCandidate(false);
      if(!cand&&isObj(G)&&isObj(G.player)){
        const data=buildSaveData();
        if(data)cand={env:toEnvelope(data,"manual_export_runtime")};
      }
      if(!cand){setStatus("Nothing to export yet.","warn");return;}
      const pretty=JSON.stringify(cand.env,null,2);
      const blob=new Blob([pretty],{type:"application/json"});
      const a=document.createElement("a");
      const stamp=new Date().toISOString().replace(/[:.]/g,"-");
      a.href=URL.createObjectURL(blob);
      a.download=`nexus-roguelike-save-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),500);

      const code=btoa(unescape(encodeURIComponent(JSON.stringify(cand.env))));
      const ta=document.getElementById("save-code");
      if(ta){
        ta.value=code;
        ta.focus();
        ta.select();
      }
      setStatus("Save exported. Keep this backup safe.","ok");
    }catch(e){
      console.warn("exportSaveData failed",e);
      setStatus("Export failed.","error");
    }
  }

  function decodeImportedText(raw){
    const t=(raw||"").trim();
    if(!t)throw new Error("empty_import");
    if(t.startsWith("{"))return JSON.parse(t);
    try{
      return JSON.parse(decodeURIComponent(escape(atob(t))));
    }catch(_){
      // final attempt: plain base64 JSON
      return JSON.parse(atob(t));
    }
  }

  async function applyImportedEnvelope(envLike){
    const env=migrateSave(envLike);
    if(!env){
      setStatus("Import failed: unsupported format.","error");
      return false;
    }
    const v=validateEnvelope(env);
    if(!v.ok){
      setStatus("Import failed: corrupted save.","error");
      return false;
    }

    // Keep backup before overwrite.
    try{
      const cur=await bestCandidate(false);
      if(cur){
        const raw=JSON.stringify(cur.env);
        if(canUseStorage())localStorage.setItem(KEY.emergency,raw);
        await idbPut("autosave_emergency",raw);
      }
    }catch(_){}

    try{
      const raw=JSON.stringify(env);
      if(canUseStorage()){
        rotateLocalSlots(raw);
        localStorage.setItem(KEY.manual,raw);
      }
      await rotateIdbSlots(raw);
      await idbPut("manual_backup",raw);
      applyLoadedData(env.data);
      if(isFn(showGS))showGS();
      if(isFn(updateVision))updateVision(G.player.x,G.player.y);
      if(isFn(renderMap))renderMap();
      if(isFn(updateHUD))updateHUD();
      if(isFn(updateDoomBar))updateDoomBar();
      if(isFn(updateModBar))updateModBar();
      setStatus("Save imported successfully.","ok");
      if(isFn(addLog))addLog("📥 Save import complete.","loot");
      await refreshSaveSummary();
      return true;
    }catch(e){
      console.warn("applyImportedEnvelope failed",e);
      setStatus("Import failed while applying save.","error");
      return false;
    }
  }

  async function importSaveFile(ev){
    const file=ev?.target?.files?.[0];
    if(!file){
      setStatus("No file selected.","warn");
      return false;
    }
    try{
      const text=await file.text();
      const parsed=decodeImportedText(text);
      const ok=await applyImportedEnvelope(parsed);
      ev.target.value="";
      return ok;
    }catch(e){
      console.warn("importSaveFile failed",e);
      setStatus("Import failed: invalid file.","error");
      ev.target.value="";
      return false;
    }
  }

  async function importSaveCode(){
    const ta=document.getElementById("save-code");
    const text=ta?ta.value:"";
    try{
      const parsed=decodeImportedText(text);
      return await applyImportedEnvelope(parsed);
    }catch(e){
      console.warn("importSaveCode failed",e);
      setStatus("Import failed: invalid code.","error");
      return false;
    }
  }

  async function clearSaves(silent=false,keepRecovery=false){
    try{
      clearTimeout(S.saveTimer);
      if(canUseStorage()){
        const keys=[KEY.latest,KEY.previous,KEY.selectedHeroDraft,KEY.status,KEY.legacyPrimary,KEY.legacyBackup,KEY.legacyMeta];
        if(!keepRecovery){keys.push(KEY.emergency,KEY.manual);}
        keys.forEach(k=>localStorage.removeItem(k));
      }
      const idbSlots=["autosave_latest","autosave_previous","legacy_primary","legacy_backup"];
      if(!keepRecovery)idbSlots.push("autosave_emergency","manual_backup");
      for(const slot of idbSlots){
        await idbDelete(slot);
      }
      S.saveSummaryFloor=null;
      S.saveSummaryHas=false;
      await refreshSaveSummary();
      if(!silent)setStatus("Save deleted.","warn");
      return true;
    }catch(_){
      if(!silent)setStatus("Delete save failed.","error");
      return false;
    }
  }

  async function deleteAllSaves(){
    if(!confirm("Delete all run saves? This cannot be undone."))return false;
    return clearSaves();
  }

  async function newGameFromSavePanel(){
    const has=await hasAnySaveData();
    if(has&&!confirm("Start a new game and overwrite current run save?"))return false;
    await clearSaves();
    location.reload();
    return true;
  }

  async function hasAnySaveData(){
    if(canUseStorage()){
      for(const k of [KEY.latest,KEY.previous,KEY.emergency,KEY.manual,KEY.legacyPrimary,KEY.legacyBackup]){
        if(localStorage.getItem(k))return true;
      }
    }
    for(const slot of ["autosave_latest","autosave_previous","autosave_emergency","manual_backup","legacy_primary","legacy_backup"]){
      const rec=await idbGet(slot);
      if(rec?.raw)return true;
    }
    return false;
  }

  function rememberHeroSelection(heroClass){
    if(!canUseStorage())return;
    try{
      localStorage.setItem(KEY.selectedHeroDraft,JSON.stringify({heroClass,timestamp:now()}));
    }catch(_){}
  }

  function onVisibilityPersist(){
    if(!isObj(G)||!isObj(G.player))return;
    emergencyLocalSnapshot("visibility_emergency");
    saveEnvelope("visibility_save",false).catch(()=>{});
  }

  function boot(){
    loadStatusFromStorage();
    refreshSaveSummary();
    setInterval(()=>{
      if(isObj(G)&&isObj(G.player))saveG("interval_autosave");
    },AUTOSAVE_MS);
    window.addEventListener("pagehide",onVisibilityPersist);
    window.addEventListener("beforeunload",onVisibilityPersist);
    window.addEventListener("blur",onVisibilityPersist);
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden)onVisibilityPersist();
    });
  }

  // Public API / overrides
  window.migrateV1ToV2=migrateV1ToV2;
  window.migrateSave=migrateSave;
  window.saveG=saveG;
  window.saveNow=saveNow;
  window.loadGame=loadGame;
  window.checkSave=checkSave;
  window.clearSaves=clearSaves;
  window.deleteAllSaves=deleteAllSaves;
  window.exportSaveData=exportSaveData;
  window.importSaveFile=importSaveFile;
  window.importSaveCode=importSaveCode;
  window.recoverBackupSave=recoverBackupSave;
  window.newGameFromSavePanel=newGameFromSavePanel;
  window.hasAnySaveData=hasAnySaveData;
  window.rememberHeroSelection=rememberHeroSelection;
  window.refreshSaveSummary=refreshSaveSummary;

  boot();
})();
