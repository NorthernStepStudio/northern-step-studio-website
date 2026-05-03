function getFloorMetaForMapKey(mapKey){
  if(!mapKey)return null;
  const meta=getFloorMeta(mapKey);
  if(meta)return meta;
  if(PORTAL_ZONES[mapKey]){
    return{
      id:mapKey,
      name:`${PORTAL_ZONES[mapKey].name} Depth ${Math.max(1,G.portalDepth||1)}`,
      kind:'main',
      zoneId:mapKey,
      mainDepth:Math.max(1,G.portalDepth||1),
      dangerTier:Math.max(2,G.floor||2),
      portals:{N:null,S:null,E:null,W:null}
    };
  }
  return null;
}

function getZoneIdForMapKey(mapKey){
  const meta=getFloorMetaForMapKey(mapKey);
  if(meta?.zoneId&&PORTAL_ZONES[meta.zoneId])return meta.zoneId;
  if(PORTAL_ZONES[mapKey])return mapKey;
  return'N';
}

function getDirectionalDestinationFromFloor(floorId,dir){
  const meta=getFloorMeta(floorId)||getFloorMeta('NEXUS');
  if(!meta||!meta.portals)return null;
  ensurePortalLinksForFloor(meta.id);
  const targetId=meta.portals[dir];
  if(targetId&&getFloorMeta(targetId))return targetId;
  const created=createMainFloorMeta(meta.id,dir);
  meta.portals[dir]=created.id;
  return created.id;
}

function markCurrentFloorStatus(){
  const floorId=getCurrentFloorId();
  const meta=getFloorMeta(floorId);
  if(!meta||floorId==='NEXUS')return;
  const enemies=G.zoneEnemies?.[floorId]||[];
  meta.bossAlive=enemies.some(e=>e.boss);
  meta.cleared=enemies.length===0;
}

function generateMap(){
  const map=Array.from({length:MH},()=>Array(MW).fill('wall'));
  const rooms=[];
  const roomTags={};

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const carveRect=(x,y,w,h)=>{
    for(let ry=y;ry<y+h;ry++)for(let rx=x;rx<x+w;rx++){
      if(rx>0&&ry>0&&rx<MW-1&&ry<MH-1)map[ry][rx]='floor';
    }
  };
  const addRoom=(x,y,w,h,tag='room')=>{
    const rw=clamp(w,4,MW-6),rh=clamp(h,4,MH-6);
    const rx=clamp(x,2,MW-rw-2),ry=clamp(y,2,MH-rh-2);
    carveRect(rx,ry,rw,rh);
    const r={x:rx,y:ry,w:rw,h:rh,tag};
    roomTags[rooms.length]=tag;
    rooms.push(r);
    return r;
  };
  const carveHall=(x1,y1,x2,y2,w=3)=>{
    const hw=Math.max(1,Math.floor(w/2));
    let cx=x1,cy=y1;
    if(Math.random()<.5){
      while(cx!==x2){
        for(let oy=-hw;oy<=hw;oy++)if(cy+oy>0&&cy+oy<MH-1&&cx>0&&cx<MW-1)map[cy+oy][cx]='floor';
        cx+=x2>cx?1:-1;
      }
      while(cy!==y2){
        for(let ox=-hw;ox<=hw;ox++)if(cx+ox>0&&cx+ox<MW-1&&cy>0&&cy<MH-1)map[cy][cx+ox]='floor';
        cy+=y2>cy?1:-1;
      }
    }else{
      while(cy!==y2){
        for(let ox=-hw;ox<=hw;ox++)if(cx+ox>0&&cx+ox<MW-1&&cy>0&&cy<MH-1)map[cy][cx+ox]='floor';
        cy+=y2>cy?1:-1;
      }
      while(cx!==x2){
        for(let oy=-hw;oy<=hw;oy++)if(cy+oy>0&&cy+oy<MH-1&&cx>0&&cx<MW-1)map[cy+oy][cx]='floor';
        cx+=x2>cx?1:-1;
      }
    }
  };
  const centerOf=r=>[Math.floor(r.x+r.w/2),Math.floor(r.y+r.h/2)];

  const cx=Math.floor(MW/2),cy=Math.floor(MH/2);
  const hub=addRoom(cx-14+Math.floor(Math.random()*4),cy-10+Math.floor(Math.random()*4),28+Math.floor(Math.random()*5),20+Math.floor(Math.random()*4),'hub');
  const nPortal=addRoom(cx-6,hub.y-11,12,8,'portalN');
  const sPortal=addRoom(cx-6,hub.y+hub.h+3,12,8,'portalS');
  const ePortal=addRoom(hub.x+hub.w+3,cy-4,11,9,'portalE');
  const wPortal=addRoom(hub.x-14,cy-4,11,9,'portalW');

  const [hcX,hcY]=centerOf(hub);
  const [nX,nY]=centerOf(nPortal);
  const [sX,sY]=centerOf(sPortal);
  const [eX,eY]=centerOf(ePortal);
  const [wX,wY]=centerOf(wPortal);

  carveHall(hcX,hcY,nX,nY,5);
  carveHall(hcX,hcY,sX,sY,5);
  carveHall(hcX,hcY,eX,eY,5);
  carveHall(hcX,hcY,wX,wY,5);

  const branchSeeds=[
    [hub.x+2,hub.y-7,10,7,'north_ruin'],
    [hub.x+hub.w-12,hub.y-8,10,7,'north_crypt'],
    [hub.x+hub.w+7,hub.y+2,9,7,'east_garden'],
    [hub.x+hub.w+6,hub.y+hub.h-9,10,7,'east_store'],
    [hub.x+3,hub.y+hub.h+4,10,7,'south_barracks'],
    [hub.x+hub.w-13,hub.y+hub.h+5,11,7,'south_lava'],
    [hub.x-13,hub.y+3,10,7,'west_crypt'],
    [hub.x-13,hub.y+hub.h-10,10,8,'west_ritual'],
  ];
  const branchRooms=[];
  branchSeeds.forEach(([x,y,w,h,tag])=>{
    const rm=addRoom(x+Math.floor((Math.random()-.5)*3),y+Math.floor((Math.random()-.5)*3),w,h,tag);
    branchRooms.push(rm);
  });

  for(const rm of branchRooms){
    const [rx,ry]=centerOf(rm);
    carveHall(hcX,hcY,rx,ry,3+(Math.random()<.5?0:2));
  }

  for(let i=0;i<6;i++){
    const a=rooms[1+Math.floor(Math.random()*(rooms.length-1))];
    const b=rooms[1+Math.floor(Math.random()*(rooms.length-1))];
    if(!a||!b||a===b)continue;
    const [ax,ay]=centerOf(a),[bx,by]=centerOf(b);
    carveHall(ax,ay,bx,by,3);
  }

  for(let i=0;i<34;i++){
    const nx=2+Math.floor(Math.random()*(MW-4));
    const ny=2+Math.floor(Math.random()*(MH-4));
    if(Math.abs(nx-hcX)<10&&Math.abs(ny-hcY)<8)continue;
    if(map[ny][nx]!=='floor')continue;
    if(Math.random()<.65)map[ny][nx]='wall';
  }

  const portalPoints={N:[nX,nY],S:[sX,sY],E:[eX,eY],W:[wX,wY]};

  G.map={
    cells:map.map(row=>row.map(t=>({type:t,visible:false,seen:false,entity:null}))),
    rooms,
    roomTags,
    portalPoints,
    zones:{}
  };
}

function generateZoneMap(zoneId,floorId=null){
  const fmeta=getFloorMetaForMapKey(floorId||zoneId);
  const isSub=fmeta?.kind==='sub';
  const ZW=isSub?36:48,ZH=isSub?24:32;
  const zmap=Array.from({length:ZH},()=>Array(ZW).fill('wall'));
  const zrooms=[];

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const carveRect=(x,y,w,h)=>{
    for(let ry=y;ry<y+h;ry++)for(let rx=x;rx<x+w;rx++){
      if(rx>0&&ry>0&&rx<ZW-1&&ry<ZH-1)zmap[ry][rx]='floor';
    }
  };
  const addRoom=(x,y,w,h,tag='zone')=>{
    const rw=clamp(w,4,ZW-6),rh=clamp(h,4,ZH-6);
    const rx=clamp(x,2,ZW-rw-2),ry=clamp(y,2,ZH-rh-2);
    carveRect(rx,ry,rw,rh);
    const r={x:rx,y:ry,w:rw,h:rh,tag};
    zrooms.push(r);
    return r;
  };
  const hall=(x1,y1,x2,y2,w=3)=>{
    const hw=Math.max(1,Math.floor(w/2));
    let cx=x1,cy=y1;
    if(Math.random()<.5){
      while(cx!==x2){for(let oy=-hw;oy<=hw;oy++)if(cy+oy>0&&cy+oy<ZH-1&&cx>0&&cx<ZW-1)zmap[cy+oy][cx]='floor';cx+=x2>cx?1:-1;}
      while(cy!==y2){for(let ox=-hw;ox<=hw;ox++)if(cx+ox>0&&cx+ox<ZW-1&&cy>0&&cy<ZH-1)zmap[cy][cx+ox]='floor';cy+=y2>cy?1:-1;}
    }else{
      while(cy!==y2){for(let ox=-hw;ox<=hw;ox++)if(cx+ox>0&&cx+ox<ZW-1&&cy>0&&cy<ZH-1)zmap[cy][cx+ox]='floor';cy+=y2>cy?1:-1;}
      while(cx!==x2){for(let oy=-hw;oy<=hw;oy++)if(cy+oy>0&&cy+oy<ZH-1&&cx>0&&cx<ZW-1)zmap[cy+oy][cx]='floor';cx+=x2>cx?1:-1;}
    }
  };
  const centerOf=r=>[Math.floor(r.x+r.w/2),Math.floor(r.y+r.h/2)];

  const cx=Math.floor(ZW/2),cy=Math.floor(ZH/2);
  const core=addRoom(cx-(isSub?8:10),cy-(isSub?5:7),isSub?17:21,isSub?11:15,'zone_core');
  const nRoom=addRoom(cx-6,isSub?3:4,12,isSub?6:7,'portalN');
  const sRoom=addRoom(cx-6,ZH-(isSub?9:11),12,isSub?6:7,'portalS');
  const eRoom=addRoom(ZW-(isSub?14:16),cy-4,11,9,'portalE');
  const wRoom=addRoom(isSub?3:5,cy-4,11,9,'portalW');

  const [ccx,ccy]=centerOf(core);
  const [nx,ny]=centerOf(nRoom);
  const [sx,sy]=centerOf(sRoom);
  const [ex,ey]=centerOf(eRoom);
  const [wx,wy]=centerOf(wRoom);

  hall(ccx,ccy,nx,ny,isSub?3:5);
  hall(ccx,ccy,sx,sy,isSub?3:5);
  hall(ccx,ccy,ex,ey,isSub?3:5);
  hall(ccx,ccy,wx,wy,isSub?3:5);

  const sideSeeds=[
    [core.x-7,core.y-3,8,6,'left_ruin'],
    [core.x+core.w-1,core.y-3,8,6,'right_ruin'],
    [core.x-6,core.y+core.h-3,7,6,'southwest'],
    [core.x+core.w-1,core.y+core.h-3,7,6,'southeast'],
    [core.x+2,core.y-6,8,5,'north_mid'],
    [core.x+core.w-10,core.y-6,8,5,'north_mid2'],
  ];
  for(const[sx0,sy0,sw,sh,tag] of sideSeeds){
    const rm=addRoom(sx0+Math.floor((Math.random()-.5)*3),sy0+Math.floor((Math.random()-.5)*3),sw,sh,tag);
    const [rx,ry]=centerOf(rm);
    hall(ccx,ccy,rx,ry,3);
  }

  for(let i=0;i<16;i++){
    const vx=2+Math.floor(Math.random()*(ZW-4));
    const vy=2+Math.floor(Math.random()*(ZH-4));
    if(Math.abs(vx-ccx)<8&&Math.abs(vy-ccy)<6)continue;
    if(zmap[vy][vx]==='floor'&&Math.random()<.6)zmap[vy][vx]='wall';
  }

  const zcells=zmap.map(row=>row.map(t=>({type:t,visible:false,seen:false,entity:null})));

  if(!isSub){
    zcells[ny][nx].entity='portal_N';
    zcells[sy][sx].entity='portal_S';
    zcells[ey][ex].entity='portal_E';
    zcells[wy][wx].entity='portal_W';
  }

  const rx=ccx,ry=ccy;
  zcells[ry][rx].entity='portal_return';
  // Floor registry terminal near central return gate.
  const regOffsets=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const[ox,oy]of regOffsets){
    const gx=rx+ox,gy=ry+oy;
    if(gx<=0||gy<=0||gx>=ZW-1||gy>=ZH-1)continue;
    if(zcells[gy][gx].type!=='floor')continue;
    if(zcells[gy][gx].entity)continue;
    zcells[gy][gx].entity='floor_registry';
    break;
  }

  // Rare subfloor stairs (risk/reward side content) on major floors only.
  if(fmeta&&fmeta.kind!=='sub'){
    const subRoll=Math.random();
    const subCount=subRoll<0.22?2:(subRoll<0.58?1:0);
    const blocked=new Set([`${rx},${ry}`,`${nx},${ny}`,`${sx},${sy}`,`${ex},${ey}`,`${wx},${wy}`]);
    for(let i=0;i<subCount;i++){
      let placed=false;
      for(let tries=0;tries<140&&!placed;tries++){
        const rm=zrooms[1+Math.floor(Math.random()*Math.max(1,zrooms.length-1))]||zrooms[0];
        const tx=rm.x+Math.floor(Math.random()*rm.w);
        const ty=rm.y+Math.floor(Math.random()*rm.h);
        if(tx<=1||ty<=1||tx>=ZW-1||ty>=ZH-1)continue;
        if(zcells[ty][tx].type!=='floor')continue;
        if(zcells[ty][tx].entity)continue;
        const k=`${tx},${ty}`;
        if(blocked.has(k))continue;
        blocked.add(k);
        zcells[ty][tx].entity='stairs_sub';
        placed=true;
      }
    }
  }

  return{
    cells:zcells,
    rooms:zrooms,
    w:ZW,
    h:ZH,
    returnX:rx,
    returnY:ry,
    portalPoints:!isSub?{N:[nx,ny],S:[sx,sy],E:[ex,ey],W:[wx,wy]}:{},
    startX:ccx,
    startY:ccy,
    floorId:floorId||zoneId
  };
}

function freeTileZ(zcells,zw,zh,rooms,excluded){
  for(let a=0;a<120;a++){
    const rm=rooms[Math.floor(Math.random()*rooms.length)];
    const tx=rm.x+Math.floor(Math.random()*rm.w);
    const ty=rm.y+Math.floor(Math.random()*rm.h);
    if(tx<1||ty<1||tx>=zw-1||ty>=zh-1)continue;
    if(zcells[ty][tx].type!=='floor')continue;
    if(excluded.some(([ex,ey])=>ex===tx&&ey===ty))continue;
    return[tx,ty];
  }
  return null;
}

function freeTile(rm,excluded){
  const cw=G.inZone?G.map.zones[G.inZone].w:MW;
  const ch=G.inZone?G.map.zones[G.inZone].h:MH;
  for(let a=0;a<120;a++){
    const tx=rm.x+Math.floor(Math.random()*rm.w);
    const ty=rm.y+Math.floor(Math.random()*rm.h);
    if(tx<1||ty<1||tx>=cw-1||ty>=ch-1)continue;
    const cells=G.inZone?G.map.zones[G.inZone].cells:G.map.cells;
    if(cells[ty][tx].type!=='floor')continue;
    if(excluded.some(([ex,ey])=>ex===tx&&ey===ty))continue;
    return[tx,ty];
  }
  return null;
}

function placeEntities(){
  ensureProgressionState();
  ensurePortalLinksForFloor('NEXUS');
  setCurrentFloorId('NEXUS');
  syncWorldDepthFromCurrentFloor(G);
  const rooms=G.map.rooms;
  G.enemies=[];G.items=[];G.zoneEnemies={};G.zoneItems={};

  const st=rooms[0];
  G.player.x=Math.floor(st.x+st.w/2);
  G.player.y=Math.floor(st.y+st.h/2);
  G.portalReturnX=G.player.x;
  G.portalReturnY=G.player.y;

  const scored=rooms.map((r,i)=>({r,i,cx:r.x+r.w/2,cy:r.y+r.h/2,tag:(G.map.roomTags||{})[i]||''}));
  const usedSpecial=new Set([0]);

  const nearestRoomIdx=(tx,ty)=>{
    let best=0,bestD=1e9;
    for(let i=0;i<rooms.length;i++){
      const r=rooms[i];
      const cx=Math.floor(r.x+r.w/2),cy=Math.floor(r.y+r.h/2);
      const d=Math.abs(cx-tx)+Math.abs(cy-ty);
      if(d<bestD){bestD=d;best=i;}
    }
    return best;
  };

  const pp=G.map.portalPoints||{};
  const placePortal=(key,entity)=>{
    const pt=pp[key];
    if(!pt)return;
    const[px,py]=pt;
    if(G.map.cells[py]?.[px]?.type==='floor')G.map.cells[py][px].entity=entity;
    usedSpecial.add(nearestRoomIdx(px,py));
  };
  placePortal('N','portal_N');
  placePortal('S','portal_S');
  placePortal('E','portal_E');
  placePortal('W','portal_W');

  const startCX=G.player.x,startCY=G.player.y;
  const stairsCandidates=scored.filter(s=>!usedSpecial.has(s.i));
  stairsCandidates.sort((a,b)=>{
    const da=Math.abs(a.cx-startCX)+Math.abs(a.cy-startCY);
    const db=Math.abs(b.cx-startCX)+Math.abs(b.cy-startCY);
    return db-da;
  });
  const stairsRoom=stairsCandidates[0]||scored[scored.length-1];
  usedSpecial.add(stairsRoom.i);
  const corners=[
    [stairsRoom.r.x+1,stairsRoom.r.y+1],[stairsRoom.r.x+stairsRoom.r.w-2,stairsRoom.r.y+1],
    [stairsRoom.r.x+1,stairsRoom.r.y+stairsRoom.r.h-2],[stairsRoom.r.x+stairsRoom.r.w-2,stairsRoom.r.y+stairsRoom.r.h-2]
  ].filter(([cx,cy])=>cx>=0&&cy>=0&&cx<MW&&cy<MH&&G.map.cells[cy][cx].type==='floor');
  const[sx,sy]=corners.length?corners[Math.floor(Math.random()*corners.length)]:[Math.floor(stairsRoom.cx),Math.floor(stairsRoom.cy)];
  G.map.cells[sy][sx].entity='stairs';

  const vendorPool=scored.filter(s=>!usedSpecial.has(s.i)).sort((a,b)=>{
    const da=Math.abs(a.cx-startCX)+Math.abs(a.cy-startCY);
    const db=Math.abs(b.cx-startCX)+Math.abs(b.cy-startCY);
    return da-db;
  });
  const vendors=['shop','blacksmith'];
  if(G.floor>=2)vendors.push('alchemist');
  vendors.forEach(v=>{
    const s=vendorPool.shift();
    if(!s)return;
    usedSpecial.add(s.i);
    const vx=Math.floor(s.r.x+s.r.w/2),vy=Math.floor(s.r.y+s.r.h/2);
    if(G.map.cells[vy][vx].type==='floor')G.map.cells[vy][vx].entity=v;
  });

  // Nexus central chamber now has rare event pressure/reward.
  const nexusMeta=getFloorMeta('NEXUS');
  if(nexusMeta)nexusMeta.rareEvent=false;
  const hubEventRoll=Math.random();
  if(hubEventRoll<0.58){
    if(nexusMeta)nexusMeta.rareEvent=true;
    const hubRoom=rooms[0];
    const occ=[[G.player.x,G.player.y],...G.enemies.map(en=>[en.x,en.y]),...G.items.map(it=>[it.x,it.y])];
    if(hubEventRoll<0.22){
      const elitePool=ENEMIES.filter(e=>!e.boss&&e.floor<=Math.max(3,G.floor+1));
      const count=1+(Math.random()<0.4?1:0);
      for(let i=0;i<count;i++){
        const pos=freeTile(hubRoom,occ);
        if(!pos||!elitePool.length)continue;
        const[ex,ey]=pos;
        occ.push([ex,ey]);
        const tmpl=elitePool[Math.floor(Math.random()*elitePool.length)];
        const en=scaleEnemy(tmpl,Math.max(2,G.floor+2),G.player.level);
        en.isElite=true;en.elite=true;
        if(!en.name.startsWith('★ '))en.name='★ '+en.name;
        en.maxHp=Math.floor(en.maxHp*1.2);en.hp=en.maxHp;
        en.atk=Math.floor(en.atk*1.12);
        en.x=ex;en.y=ey;
        G.enemies.push(en);
      }
      addLog('☠ Nexus trembles — elite intrusion in the central chamber!','damage');
    }else{
      const lootCount=2+(Math.random()<0.35?1:0);
      for(let i=0;i<lootCount;i++){
        const pos=freeTile(hubRoom,occ);
        if(!pos)continue;
        const[ix,iy]=pos;
        occ.push([ix,iy]);
        const tier=Math.min(4,1+Math.floor((G.floor+1)/2));
        const roll=Math.random();
        let it;
        if(roll<0.24)it={...CONSUMABLES[4],uid:Math.random().toString(36).slice(2)};
        else if(roll<0.58)it=rollAffix(makeItem('weapon',tier,Math.floor(Math.random()*4)));
        else if(roll<0.82)it=rollAffix(makeItem('armor',tier,0));
        else it=rollAffix(makeItem('ring',tier,0));
        it.x=ix;it.y=iy;
        G.items.push(it);
      }
      addLog('✨ Nexus event chamber flares — rare loot appears in the center.','loot');
    }
  }

  const pool=ENEMIES.filter(e=>e.floor<=G.floor);
  const floorTier=Math.min(4,Math.floor((G.floor-1)/1.1));

  for(let i=1;i<rooms.length;i++){
    if(usedSpecial.has(i))continue;
    const rm=rooms[i];
    const tag=(G.map.roomTags||{})[i]||'';
    const dense=tag.includes('portal')||tag.includes('ritual')||tag.includes('lava')||tag.includes('crypt');
    const num=(dense?3:2)+Math.floor(Math.random()*(dense?3:2));

    for(let e=0;e<num;e++){
      const occ=[[G.player.x,G.player.y],...G.enemies.map(en=>[en.x,en.y]),...G.items.map(it=>[it.x,it.y])];
      const pos=freeTile(rm,occ);
      if(!pos)continue;
      const[ex,ey]=pos;
      const tmpl=pool[Math.floor(Math.random()*pool.length)];
      const enemy=scaleEnemy(tmpl,G.floor,G.player.level);
      enemy.x=ex;enemy.y=ey;
      G.enemies.push(enemy);
    }

    const lootRoll=dense ? .88 : .68;
    if(Math.random()<lootRoll){
      const occ=[[G.player.x,G.player.y],...G.enemies.map(en=>[en.x,en.y]),...G.items.map(it=>[it.x,it.y])];
      const pos=freeTile(rm,occ);
      if(!pos)continue;
      const[ix,iy]=pos;
      const roll=Math.random();let it;
      if(roll<.16)it={...CONSUMABLES[0],uid:Math.random().toString(36).slice(2)};
      else if(roll<.28)it={...CONSUMABLES[2],uid:Math.random().toString(36).slice(2)};
      else if(roll<.56)it=rollAffix(makeItem('weapon',Math.min(4,floorTier+1),Math.floor(Math.random()*4)));
      else if(roll<.78)it=rollAffix(makeItem('armor',Math.min(4,floorTier+1),0));
      else if(roll<.95)it=rollAffix(makeItem('ring',Math.min(4,floorTier+1),0));
      else it={...CONSUMABLES[4],uid:Math.random().toString(36).slice(2)};
      it.x=ix;it.y=iy;
      G.items.push(it);
    }
  }
}

// Place entities inside a zone sub-map
function placeZoneEntities(mapKey){
  const zone=G.map.zones[mapKey];
  if(!zone)return;
  const fmeta=getFloorMetaForMapKey(mapKey);
  const zoneId=getZoneIdForMapKey(mapKey);
  const zdef=PORTAL_ZONES[zoneId]||PORTAL_ZONES.N;
  const zcells=zone.cells;
  const rooms=zone.rooms;
  const enemies=[],items=[];
  const depth=Math.max(1,fmeta?.mainDepth||G.portalDepth||1);
  const isSubfloor=(fmeta?.kind==='sub');
  const baseFloor=Math.max(1,fmeta?.dangerTier||G.floor+depth);
  const mobFloor=baseFloor+1;
  const bossFloor=baseFloor+(isSubfloor?4:3);
  const eliteChance=Math.min(.68,.14+depth*.04+(isSubfloor?.12:0));
  const reserve=[[zone.startX,zone.startY],[zone.returnX,zone.returnY]];
  const mobPool=zdef.enemies.filter(e=>!e.boss);
  const bossPool=zdef.enemies.filter(e=>e.boss);

  const addEliteBuff=(en)=>{
    en.isElite=true;en.elite=true;
    if(!en.name.startsWith('★ '))en.name='★ '+en.name;
    en.maxHp=Math.floor(en.maxHp*1.25);
    en.hp=en.maxHp;
    en.atk=Math.floor(en.atk*1.12);
    en.def=Math.max(0,en.def+2);
    en.gold=Math.floor(en.gold*1.2);
    en.xp=Math.floor(en.xp*1.22);
    return en;
  };
  const occNow=()=>[
    ...reserve,
    ...enemies.map(en=>[en.x,en.y]),
    ...items.map(it=>[it.x,it.y])
  ];

  // Dense zone mobs + guaranteed loot in every active room.
  for(let i=1;i<rooms.length;i++){
    const rm=rooms[i];
    const roomArea=rm.w*rm.h;
    const spawnBase=(roomArea>=60?3:2)+Math.floor(Math.random()*2);
    const spawnCount=spawnBase+Math.max(1,Math.floor(depth/2));

    for(let e=0;e<spawnCount;e++){
      if(!mobPool.length)break;
      const pos=freeTileZ(zcells,zone.w,zone.h,[rm],occNow())||freeTileZ(zcells,zone.w,zone.h,rooms,occNow());
      if(!pos)continue;
      const[ex,ey]=pos;
      const tmpl=mobPool[Math.floor(Math.random()*mobPool.length)];
      const en=scaleEnemy({...tmpl},mobFloor+Math.floor(i/2)+(isSubfloor?1:0),G.player.level);
      en.x=ex;en.y=ey;en.zoneEnemy=mapKey;en.depth=depth;
      if(Math.random()<eliteChance)addEliteBuff(en);
      enemies.push(en);
    }

    // Always place at least one zone-identity loot drop per room.
    const lootPos=freeTileZ(zcells,zone.w,zone.h,[rm],occNow())||freeTileZ(zcells,zone.w,zone.h,rooms,occNow());
    if(lootPos){
      const[ix,iy]=lootPos;
      const flTier=Math.min(4,Math.floor((baseFloor+1+(isSubfloor?1:0))/1.2));
      const guaranteed=rollAffix(makeItem(zdef.lootBonus.type,flTier,Math.floor(Math.random()*4)));
      guaranteed.x=ix;guaranteed.y=iy;
      items.push(guaranteed);
    }

    // Bonus drops scale with depth.
    if(Math.random()<Math.min(.92,.5+depth*.07)){
      const bonusPos=freeTileZ(zcells,zone.w,zone.h,[rm],occNow())||freeTileZ(zcells,zone.w,zone.h,rooms,occNow());
      if(bonusPos){
        const[bx,by]=bonusPos;
        const roll=Math.random();
        const flTier=Math.min(4,Math.floor((baseFloor+2+(isSubfloor?1:0))/1.15));
        let bonus;
        if(roll<.22)bonus={...CONSUMABLES[0],uid:Math.random().toString(36).slice(2)};
        else if(roll<.34)bonus={...CONSUMABLES[2],uid:Math.random().toString(36).slice(2)};
        else if(roll<.48)bonus={...CONSUMABLES[4],uid:Math.random().toString(36).slice(2)};
        else if(roll<.76)bonus=rollAffix(makeItem('weapon',flTier,Math.floor(Math.random()*4)));
        else if(roll<.9)bonus=rollAffix(makeItem('armor',flTier,0));
        else bonus=rollAffix(makeItem('ring',flTier,0));
        bonus.x=bx;bonus.y=by;
        items.push(bonus);
      }
    }
  }

  // Boss placement: farthest room from start, with deeper chains adding a second boss.
  const sx=zone.startX,sy=zone.startY;
  const bossRooms=rooms.slice().sort((a,b)=>{
    const acx=Math.floor(a.x+a.w/2),acy=Math.floor(a.y+a.h/2);
    const bcx=Math.floor(b.x+b.w/2),bcy=Math.floor(b.y+b.h/2);
    const ad=Math.abs(acx-sx)+Math.abs(acy-sy);
    const bd=Math.abs(bcx-sx)+Math.abs(bcy-sy);
    return bd-ad;
  });
  const bossCount=isSubfloor?(Math.random()<0.32?2:1):1;
  for(let bi=0;bi<bossCount;bi++){
    const rm=bossRooms[bi]||rooms[rooms.length-1]||rooms[0];
    const bPos=freeTileZ(zcells,zone.w,zone.h,[rm],occNow())||freeTileZ(zcells,zone.w,zone.h,rooms,occNow());
    if(!bPos)continue;
    const[bx,by]=bPos;
    let bossTemplate=bossPool[bi%Math.max(1,bossPool.length)];
    if(!bossTemplate)bossTemplate=mobPool[Math.floor(Math.random()*Math.max(1,mobPool.length))];
    const boss=scaleEnemy({...bossTemplate},bossFloor+bi,G.player.level);
    boss.x=bx;boss.y=by;boss.zoneEnemy=mapKey;boss.boss=true;boss.depth=depth;
    boss.maxHp=Math.floor(boss.maxHp*1.18);
    boss.hp=boss.maxHp;
    boss.atk=Math.floor(boss.atk*1.1);
    boss.xp=Math.floor(boss.xp*1.25);
    boss.gold=Math.floor(boss.gold*1.22);
    if(depth>=5&&bi===0)addEliteBuff(boss);
    enemies.push(boss);
  }

  G.zoneEnemies=G.zoneEnemies||{};
  G.zoneItems=G.zoneItems||{};
  G.zoneEnemies[mapKey]=enemies;
  G.zoneItems[mapKey]=items;
  if(fmeta){
    fmeta.bossAlive=enemies.some(e=>e.boss);
    fmeta.cleared=enemies.length===0;
    fmeta.corruption=Math.min(99,Math.max(fmeta.corruption||0,Math.round(8+depth*6+(isSubfloor?10:0))));
    if(typeof fmeta.rareEvent!=='boolean')fmeta.rareEvent=false;
    if(isSubfloor)fmeta.rareEvent=true;
    else if(!fmeta.rareEvent)fmeta.rareEvent=(Math.random()<Math.min(.45,.14+depth*.03));
  }
}

// ═══════════════════════════════
// VISION
// ═══════════════════════════════
function getCells(){return G.inZone?G.map.zones[G.inZone].cells:G.map.cells;}
function getMapW(){return G.inZone?G.map.zones[G.inZone].w:MW;}
function getMapH(){return G.inZone?G.map.zones[G.inZone].h:MH;}

function updateVision(px,py){
  const cells=getCells(),cw=getMapW(),ch=getMapH();
  const r=8; // wider reveal so architecture and portals stay readable
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)cells[y][x].visible=false;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(dx*dx+dy*dy>r*r)continue;
    const nx=px+dx,ny=py+dy;
    if(nx<0||ny<0||nx>=cw||ny>=ch)continue;
    cells[ny][nx].visible=true;cells[ny][nx].seen=true;
  }
  // Reveal stairs on minimap when within 3 tiles
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
    if(cells[y][x].entity==='stairs'||cells[y][x].entity==='stairs_sub'){
      if(Math.abs(x-px)+Math.abs(y-py)<=3)cells[y][x].stairsRevealed=true;
    }
  }
}


