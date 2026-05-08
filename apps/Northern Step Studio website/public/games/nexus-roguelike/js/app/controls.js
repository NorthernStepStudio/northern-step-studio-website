// ═══════════════════════════════
// MOVEMENT
// ═══════════════════════════════
function handleMove(dx,dy){
  if(G.inCombat)return;
  const now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  // Prevent duplicate touch+mouse movement events from causing double-steps.
  if(now-lastMoveAt<90)return;
  lastMoveAt=now;
  const p=G.player;
  if(!p) return;
  const cw=getMapW(),ch=getMapH();
  const cells=getCells();
  const nx=p.x+dx,ny=p.y+dy;
  if(nx<0||ny<0||nx>=cw||ny>=ch)return;
  const cell=cells[ny][nx];
  if(cell.type==='wall')return;

  // Slippery floors modifier: 10% chance to slip one extra tile in same direction
  if(getModEffects().slippery&&Math.random()<.10){
    const sx=nx+dx,sy=ny+dy;
    if(sx>=0&&sy>=0&&sx<cw&&sy<ch&&cells[sy][sx].type==='floor'){
      addLog('Slipped!','funny');
    }
  }

  // Get zone-aware enemy and item lists
  const curEnemies=G.inZone?(G.zoneEnemies?.[G.inZone]||[]):G.enemies;
  const curItems=G.inZone?(G.zoneItems?.[G.inZone]||[]):G.items;

  const en=curEnemies.find(e=>e.x===nx&&e.y===ny);
  if(en){startCombat(en);return;}
  p.x=nx;p.y=ny;G.turn++;

  // Entity interactions
  if(cell.entity==='stairs')addLog('Stairs! Tap GRAB or G to descend.','info');
  if(cell.entity==='shop'){addLog('Welcome to the Shop!','shop');sfx('rgba(255,200,50,.15)',300);setTimeout(()=>togglePanel('shop'),120);}
  if(cell.entity==='blacksmith'){addLog('Blacksmith! Craft gear from materials.','info');sfx('rgba(255,140,0,.15)',300);setTimeout(()=>togglePanel('blacksmith'),120);}
  if(cell.entity==='alchemist'){
    if(G.player.classType==='mage')addLog('Alchemist! Mage bonuses active.','info');
    else addLog('Alchemist! Basic brews available.','info');
    sfx('rgba(170,68,255,.15)',300);setTimeout(()=>togglePanel('alchemist'),120);
  }
  // Portal interactions — auto-enter on step
  if(cell.entity==='portal_N'){setTimeout(()=>enterPortal('N'),80);}
  if(cell.entity==='portal_S'){setTimeout(()=>enterPortal('S'),80);}
  if(cell.entity==='portal_E'){setTimeout(()=>enterPortal('E'),80);}
  if(cell.entity==='portal_W'){setTimeout(()=>enterPortal('W'),80);}
  if(cell.entity==='portal_return'){setTimeout(()=>exitPortal(),80);}
  if(cell.entity==='floor_registry'){setTimeout(()=>togglePanel('registry'),80);}
  if(cell.entity==='stairs_sub'){setTimeout(()=>enterRandomSubfloor(),80);}

  const it=curItems.find(i=>i.x===nx&&i.y===ny);
  if(it)addLog(`Spotted: ${it.emoji} ${it.name} — GRAB!`,'info');

  doETs();
  if(G.turn%3===0&&p.mp<p.maxMp)p.mp=Math.min(p.maxMp,p.mp+2);
  updateVision(p.x,p.y);renderMap();updateHUD();saveG();
}

function doWait(){
  if(G.inCombat)return;
  doETs();G.turn++;
  const p=G.player;
  if(p.mp<p.maxMp)p.mp=Math.min(p.maxMp,p.mp+4);
  if(p.hp<p.maxHp&&Math.random()<.15){p.hp=Math.min(p.maxHp,p.hp+3);addLog('❤ +3 HP','heal');}
  updateVision(p.x,p.y);renderMap();updateHUD();saveG();
}

function tryPickup(){
  if(G.inCombat)return;
  const p=G.player,cells=getCells(),cell=cells[p.y]?.[p.x];
  if(!cell)return;
  if(cell.entity==='stairs'){descend();return;}
  if(cell.entity==='shop'){togglePanel('shop');return;}
  if(cell.entity==='blacksmith'){togglePanel('blacksmith');return;}
  if(cell.entity==='alchemist'){togglePanel('alchemist');return;}
  if(cell.entity==='portal_N'){enterPortal('N');return;}
  if(cell.entity==='portal_S'){enterPortal('S');return;}
  if(cell.entity==='portal_E'){enterPortal('E');return;}
  if(cell.entity==='portal_W'){enterPortal('W');return;}
  if(cell.entity==='portal_return'){exitPortal();return;}
  if(cell.entity==='floor_registry'){togglePanel('registry');return;}
  if(cell.entity==='stairs_sub'){enterRandomSubfloor();return;}
  const curItems=G.inZone?(G.zoneItems?.[G.inZone]||[]):G.items;
  const it=curItems.find(i=>i.x===p.x&&i.y===p.y);
  if(it)pickupItem(it);
  else addLog('Nothing here to grab.','info');
}

function toggleMinimap(){
  const inner=document.getElementById('minimap-inner');
  inner.classList.toggle('collapsed');
  const btn=document.getElementById('mm-toggle');
  btn.textContent=inner.classList.contains('collapsed')?'≡':'≡ MAP';
}
function dpPress(dx,dy){
  dpRelease(); // clear any existing interval first — prevents double-fire
  handleMove(dx,dy);
  dpIv=setInterval(()=>{if(!G||G.inCombat){dpRelease();return;}handleMove(dx,dy);},190);
}
function dpRelease(){
  if(dpIv!==null){clearInterval(dpIv);dpIv=null;}
}

// ═══════════════════════════════
// ENEMY TURNS
// ═══════════════════════════════
function doETs(){
  const p=G.player;
  const curEnemies=G.inZone?(G.zoneEnemies?.[G.inZone]||[]):G.enemies;
  const cells=getCells(),cw=getMapW(),ch=getMapH();
  for(const en of curEnemies){
    if(!cells[en.y]?.[en.x]?.visible)continue;
    if(en.status?.frozen>0){en.status.frozen--;continue;}
    if(en.status?.stun>0){en.status.stun--;continue;}
    const dx=p.x-en.x,dy=p.y-en.y,dist=Math.abs(dx)+Math.abs(dy);
    if(dist===1){
      const dmg=Math.max(1,en.atk-p.def+Math.floor(Math.random()*4));
      p.hp=Math.max(0,p.hp-dmg);
      addLog(`${en.emoji} ${en.name} LV${en.level} hits you for ${dmg}!`,'damage');
      if(Math.random()<.3)addLog(`"${en.taunt[Math.floor(Math.random()*en.taunt.length)]}"`,'funny');
      if(p.hp<=0){gameOver(en.name);return;}
    }else if(dist<=8){
      const dirs=[[Math.sign(dx),0],[0,Math.sign(dy)],[-Math.sign(dx),0],[0,-Math.sign(dy)]];
      for(const[ex,ey]of dirs){
        if(!ex&&!ey)continue;
        const tx=en.x+ex,ty=en.y+ey;
        if(tx<0||ty<0||tx>=cw||ty>=ch)continue;
        if(cells[ty][tx].type==='wall')continue;
        if(curEnemies.some(e=>e!==en&&e.x===tx&&e.y===ty))continue;
        if(tx===p.x&&ty===p.y)break;
        en.x=tx;en.y=ty;break;
      }
    }
    if(en.status){
      if(en.status.poison>0){const pd=Math.floor(en.maxHp*.05);en.hp-=pd;en.status.poison--;addLog(`☠ ${en.name} takes ${pd} poison!`,'damage');if(en.hp<=0){defeatEnemy(en,false);break;} }
      if(en.status.burn>0){const bd=Math.floor(en.maxHp*.04)+3;en.hp-=bd;en.status.burn--;addLog(`🔥 ${en.name} burns ${bd}!`,'damage');if(en.hp<=0){defeatEnemy(en,false);break;} }
    }
    if(en.poisoned>0){const pd=Math.floor(en.maxHp*.05);en.hp-=pd;en.poisoned--;addLog(`☠ ${en.name} takes ${pd} poison!`,'damage');if(en.hp<=0){defeatEnemy(en,false);break;} }
    if(getModEffects().enemyRegen)en.hp=Math.min(en.maxHp,en.hp+Math.floor(en.maxHp*.03));
  }
}

// ═══════════════════════════════
// KEYBOARD
// ═══════════════════════════════
document.addEventListener('keydown',e=>{
  // Ignore key-repeat events for movement — only fire on fresh keydown
  if(e.repeat&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' '].includes(e.key))return;

  // Prevent scroll
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();

  // DEBUG: helpful logs for finding why input might be blocked
  if (['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    if (!G || !G.player) console.log('Movement blocked: G or G.player not initialized');
    else if (G.inCombat) console.log('Movement blocked: G.inCombat is true');
    else if (openPanel) console.log('Movement blocked: openPanel is', openPanel);
    else if (document.getElementById('luov').classList.contains('active')) console.log('Movement blocked: Level Up (luov) is active');
    else if (document.getElementById('itempop').classList.contains('active')) console.log('Movement blocked: Item Popup (itempop) is active');
  }

  // Handle panel toggles FIRST so they can be closed with the same key
  if(e.key==='i'||e.key==='I'){togglePanel('inv');return;}
  if(e.key==='m'||e.key==='M'){togglePanel('menu');return;}
  if(e.key==='c'||e.key==='C'){togglePanel('stats');return;}
  if(e.key==='l'||e.key==='L'){togglePanel('log');return;}

  // Ignore if level-up screen open
  if(document.getElementById('luov').classList.contains('active'))return;

  // Top-most overlays should close first.
  const itemPop=document.getElementById('itempop');
  if(itemPop&&itemPop.classList.contains('active')){
    if(e.key==='Escape')closeIP();
    return;
  }
  const fuseSel=document.getElementById('fuse-select');
  if(fuseSel&&fuseSel.style.display==='flex'){
    if(e.key==='Escape')closeFuseSelect();
    return;
  }

  // Combat keys
  if(G&&G.inCombat){
    if(e.key==='Escape')ca('flee');
    if(e.key==='1')ca('attack');
    if(e.key==='2')ca('skill');
    if(e.key==='3'||e.key.toLowerCase()==='f')ca('item');
    return;
  }

  // Panel open — only allow close via Escape (others handled by toggles above)
  if(openPanel){
    if(e.key==='Escape')closeAllPanels();
    return;
  }

  // Movement
  const dirs={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
  if(dirs[e.key]){handleMove(...dirs[e.key]);return;}

  // Actions
  if(e.key===' '){doWait();return;}
  if(e.key==='.'||e.key==='g'||e.key==='G')tryPickup();
  if(e.key==='q'||e.key==='Q')quickUse('hp');
  if(e.key==='e'||e.key==='E')quickUse('mp');
  if(e.key==='='||e.key==='+')adjustZoom(1);
  if(e.key==='-')adjustZoom(-1);
  if(e.key==='Escape')closeAllPanels();
  if(e.key==='Enter'){
    const cell=getCells()?.[G.player?.y]?.[G.player?.x];
    if(cell?.entity==='stairs')descend();
    else tryPickup();
  }
});

// Safety: release dpad on window blur so key-held state can't get stuck
window.addEventListener('blur',()=>dpRelease());
window.addEventListener('mouseup',()=>dpRelease());
window.addEventListener('resize',()=>{if(typeof rzV==='function')rzV();if(G&&G.map)renderMap();});
window.addEventListener('load',()=>{
  const sf=checkSave();
  if(sf){
    document.getElementById('continue-btn').style.display='block';
    document.getElementById('sfl').textContent=sf;
  }
  const meta=loadMeta();
  if(document.getElementById('title-shard-count'))document.getElementById('title-shard-count').textContent=meta.shards;
  // Inject hero SVG sprites into class select cards
  ['warrior','mage','rogue','paladin'].forEach(cls=>{
    const el=document.getElementById('ci-'+cls);
    if(el&&HERO_SVGS[cls])el.innerHTML=heroImgTag(cls,44);
  });
});

function flushSave(){
  if(!G||!G.player||!G.map)return;
  saveG();
}
