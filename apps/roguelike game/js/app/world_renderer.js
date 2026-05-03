// Canvas-based overworld renderer.
// Keeps gameplay state untouched and only upgrades world presentation.
(function(){
  const WR={};
  let canvas=null;
  let ctx=null;
  let dpr=1;
  let state=null;
  let rafId=null;
  let lastT=0;
  const imgCache=new Map();

  const BIOME_PALETTES={
    hub:{
      floor:["#2a2831","#302f38","#383640","#24222b","#312f37","#2c2a33"],
      wallTop:"#4a4851",
      wallMid:"#232531",
      wallLow:"#11131a",
      torch:"#ffb057",
      tint:"rgba(95,105,130,0.06)"
    },
    north:{
      floor:["#21324a","#294161","#2f4d70","#1b2a3f","#27496a","#35597c"],
      wallTop:"#4f6783",
      wallMid:"#1b2f48",
      wallLow:"#0d1726",
      torch:"#6fc8ff",
      tint:"rgba(70,135,205,0.10)"
    },
    east:{
      floor:["#233422","#2c4528","#35522e","#1b2b1a","#3b5d35","#274028"],
      wallTop:"#59734e",
      wallMid:"#1e3622",
      wallLow:"#101d13",
      torch:"#75de74",
      tint:"rgba(72,150,85,0.10)"
    },
    south:{
      floor:["#3a231d","#4a2a1f","#5a3021","#2b1712","#663526","#3f231a"],
      wallTop:"#7e5a42",
      wallMid:"#3a1d13",
      wallLow:"#1b0e0a",
      torch:"#ff7c4a",
      tint:"rgba(175,72,52,0.11)"
    },
    west:{
      floor:["#31253d","#3f2f52","#4f3770","#251c31","#5a4083","#3a2a4e"],
      wallTop:"#7d65a2",
      wallMid:"#322143",
      wallLow:"#170f20",
      torch:"#c57cff",
      tint:"rgba(120,70,170,0.11)"
    }
  };

  const PORTAL_DEFS={
    N:{name:"NORTH PORTAL",dest:"Frozen Ruins",color:"#20b7ff",glow:"#0b79ff",biome:"north"},
    E:{name:"EAST PORTAL",dest:"Overgrown Temple",color:"#69ff45",glow:"#20a820",biome:"east"},
    S:{name:"SOUTH PORTAL",dest:"Lava Caverns",color:"#ff5a22",glow:"#ff2200",biome:"south"},
    W:{name:"WEST PORTAL",dest:"Cursed Crypt",color:"#bc4cff",glow:"#7416ff",biome:"west"},
    return:{name:"RETURN",dest:"Hub",color:"#f4e86c",glow:"#dfbe2e",biome:"hub"}
  };

  function init(id){
    canvas=document.getElementById(id);
    if(!canvas)return;
    ctx=canvas.getContext("2d",{alpha:false});
    dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
    resizeCanvas();
    window.addEventListener("resize",resizeCanvas);
  }

  function resizeCanvas(){
    if(!canvas||!ctx)return;
    const wrap=canvas.parentElement||document.body;
    const w=Math.max(1,wrap.clientWidth||window.innerWidth);
    const h=Math.max(1,wrap.clientHeight||window.innerHeight);
    canvas.style.width=w+"px";
    canvas.style.height=h+"px";
    canvas.width=Math.max(1,Math.floor(w*dpr));
    canvas.height=Math.max(1,Math.floor(h*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function update(newState){
    state=newState||null;
    if(!canvas||!ctx||!state)return;
    const mapW=state.cw*state.cs;
    const mapH=state.ch*state.cs;
    canvas.style.width=mapW+"px";
    canvas.style.height=mapH+"px";
    canvas.width=Math.max(1,Math.floor(mapW*dpr));
    canvas.height=Math.max(1,Math.floor(mapH*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function start(){
    if(rafId)return;
    lastT=performance.now();
    tick(lastT);
  }

  function stop(){
    if(rafId)cancelAnimationFrame(rafId);
    rafId=null;
  }

  function tick(t){
    rafId=requestAnimationFrame(tick);
    const dt=(t-lastT)/1000;
    lastT=t;
    render(t/1000,dt);
  }

  function render(time){
    if(!ctx||!state)return;
    const mapW=state.cw*state.cs;
    const mapH=state.ch*state.cs;
    ctx.clearRect(0,0,mapW,mapH);

    const portals=findPortals(state);
    drawVoidBackdrop(state,time);
    drawPortalSpill(state,portals,time);
    drawWorldTiles(state,time);
    drawArchitectureDepth(state,time);
    drawProps(state,time);
    drawTorchLayer(state,time);
    drawPortalStructures(state,portals,time);
    drawItems(state,time);
    drawEnemies(state,time);
    drawPlayerGrounding(state,time);
    drawLighting(state,portals,time);
  }

  function drawVoidBackdrop(s,time){
    const mapW=s.cw*s.cs;
    const mapH=s.ch*s.cs;
    ctx.fillStyle="#04050b";
    ctx.fillRect(0,0,mapW,mapH);

    for(let i=0;i<180;i++){
      const x=(hash(i,13)*mapW+time*6*(i%3===0?1:-1))%mapW;
      const y=(hash(i,37)*mapH+time*4*(i%2===0?1:-1))%mapH;
      const a=0.012+(i%7)*0.0022;
      ctx.fillStyle="rgba(68,80,110,"+a.toFixed(4)+")";
      ctx.fillRect(x,y,2,2);
    }
  }

  function drawPortalSpill(s,portals,time){
    const cs=s.cs;
    portals.forEach((p,idx)=>{
      const def=getPortalDef(p.entity);
      const cx=p.x*cs+cs*0.5;
      const cy=p.y*cs+cs*0.5;
      const r=cs*(4.6+Math.sin(time*1.3+idx)*0.35);
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      g.addColorStop(0,hexToRgba(def.color,0.28));
      g.addColorStop(0.35,hexToRgba(def.color,0.12));
      g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=g;
      ctx.fillRect(cx-r,cy-r,r*2,r*2);
    });
  }

  function drawWorldTiles(s,time){
    const cs=s.cs;
    const cells=s.cells;
    const cw=s.cw;
    const ch=s.ch;

    for(let y=0;y<ch;y++){
      for(let x=0;x<cw;x++){
        const cell=cells[y][x];
        if(!cell||!cell.seen)continue;
        const px=x*cs;
        const py=y*cs;
        if(cell.type==="floor"){
          drawFloorTile(s,x,y,px,py,cs,time,cell.visible);
        }else{
          drawWallTile(s,x,y,px,py,cs,time,cell.visible);
        }
      }
    }
  }

  function drawFloorTile(s,x,y,px,py,cs,time,isVisible){
    const biome=getBiomeAt(s,x,y);
    const pal=BIOME_PALETTES[biome];
    const n=hash(x,y);
    const variant=Math.floor(n*pal.floor.length)%pal.floor.length;
    const roomTag=getRoomTag(s,x,y);
    let base=pal.floor[variant];
    if(roomTag.indexOf("ritual")>=0||roomTag.indexOf("crypt")>=0)base=blendHex(base,"#5d4175",0.18);
    if(roomTag.indexOf("lava")>=0)base=blendHex(base,"#9e3a22",0.22);
    if(roomTag.indexOf("garden")>=0||roomTag.indexOf("shrine")>=0)base=blendHex(base,"#4d7c40",0.18);

    ctx.fillStyle=base;
    ctx.fillRect(px,py,cs,cs);

    ctx.fillStyle=hexToRgba(pal.floor[(variant+2)%pal.floor.length],0.10);
    ctx.fillRect(px+1,py+1,cs-2,Math.max(1,Math.floor(cs*0.15)));
    ctx.fillStyle="rgba(0,0,0,0.20)";
    ctx.fillRect(px+1,py+cs-Math.max(2,Math.floor(cs*0.18)),cs-2,Math.max(2,Math.floor(cs*0.18)));

    ctx.strokeStyle=hexToRgba("#000000",0.28);
    ctx.lineWidth=1;
    ctx.strokeRect(px+0.5,py+0.5,cs-1,cs-1);

    if(n>0.72){
      ctx.strokeStyle="rgba(0,0,0,0.32)";
      ctx.beginPath();
      ctx.moveTo(px+cs*0.18,py+cs*(0.22+hash(x,y,11)*0.25));
      ctx.lineTo(px+cs*0.58,py+cs*(0.48+hash(x,y,12)*0.18));
      ctx.lineTo(px+cs*0.84,py+cs*(0.66+hash(x,y,13)*0.20));
      ctx.stroke();
    }
    if(n<0.09){
      ctx.fillStyle=getBiomeDust(biome,0.22);
      ctx.beginPath();
      ctx.arc(px+cs*(0.25+hash(x,y,31)*0.5),py+cs*(0.3+hash(x,y,33)*0.4),cs*(0.08+hash(x,y,35)*0.12),0,Math.PI*2);
      ctx.fill();
    }

    const wallAdj=countTypeNeighbors(s.cells,x,y,s.cw,s.ch,"wall");
    if(wallAdj>=3){
      ctx.fillStyle="rgba(0,0,0,0.13)";
      ctx.fillRect(px,py,cs,cs);
    }

    if(!isVisible){
      ctx.fillStyle="rgba(0,0,0,0.46)";
      ctx.fillRect(px,py,cs,cs);
    }
  }

  function drawWallTile(s,x,y,px,py,cs,time,isVisible){
    const biome=getBiomeAt(s,x,y);
    const pal=BIOME_PALETTES[biome];
    const n=hash(x,y);

    ctx.fillStyle="#080a10";
    ctx.fillRect(px,py,cs,cs);

    const grad=ctx.createLinearGradient(px,py,px,py+cs);
    grad.addColorStop(0,blendHex(pal.wallTop,"#ffffff",0.12));
    grad.addColorStop(0.36,pal.wallMid);
    grad.addColorStop(1,pal.wallLow);
    ctx.fillStyle=grad;
    ctx.fillRect(px+1,py+1,cs-2,cs-2);

    const nearFloorN=isTypeAt(s.cells,x,y-1,s.cw,s.ch,"floor");
    const nearFloorS=isTypeAt(s.cells,x,y+1,s.cw,s.ch,"floor");
    const nearFloorE=isTypeAt(s.cells,x+1,y,s.cw,s.ch,"floor");
    const nearFloorW=isTypeAt(s.cells,x-1,y,s.cw,s.ch,"floor");

    if(nearFloorN){
      ctx.fillStyle="rgba(255,255,255,0.10)";
      ctx.fillRect(px+2,py+2,cs-4,Math.max(1,Math.floor(cs*0.14)));
    }
    if(nearFloorS){
      ctx.fillStyle="rgba(0,0,0,0.42)";
      ctx.fillRect(px+1,py+Math.floor(cs*0.62),cs-2,Math.ceil(cs*0.35));
    }
    if(nearFloorW){
      ctx.fillStyle="rgba(255,255,255,0.06)";
      ctx.fillRect(px+1,py+2,Math.max(1,Math.floor(cs*0.12)),cs-4);
    }
    if(nearFloorE){
      ctx.fillStyle="rgba(0,0,0,0.25)";
      ctx.fillRect(px+cs-Math.max(2,Math.floor(cs*0.16)),py+2,Math.max(2,Math.floor(cs*0.16)),cs-4);
    }

    if(n>0.84){
      ctx.fillStyle="rgba(0,0,0,0.22)";
      ctx.fillRect(px+cs*0.24,py+cs*(0.22+hash(x,y,77)*0.22),cs*0.5,cs*0.14);
    }
    if(n<0.11){
      ctx.fillStyle=hexToRgba(pal.wallTop,0.08);
      ctx.fillRect(px+cs*0.2,py+cs*0.68,cs*0.5,cs*0.22);
    }

    if(!isVisible){
      ctx.fillStyle="rgba(0,0,0,0.55)";
      ctx.fillRect(px,py,cs,cs);
    }
  }

  function drawArchitectureDepth(s,time){
    const cs=s.cs;
    const cells=s.cells;
    for(let y=0;y<s.ch;y++){
      for(let x=0;x<s.cw;x++){
        const cell=cells[y][x];
        if(!cell||!cell.seen||cell.type!=="floor")continue;
        const n=hash(x,y,159);
        if(n<0.96)continue;
        const px=x*cs;
        const py=y*cs;
        const pitW=cs*(0.62+hash(x,y,161)*0.18);
        const pitH=cs*(0.28+hash(x,y,163)*0.16);
        ctx.fillStyle="rgba(0,0,0,0.30)";
        ctx.beginPath();
        ctx.ellipse(px+cs*0.5,py+cs*0.72,pitW*0.5,pitH*0.5,0,0,Math.PI*2);
        ctx.fill();
      }
    }
  }

  function drawProps(s,time){
    const cs=s.cs;
    for(let y=0;y<s.ch;y++){
      for(let x=0;x<s.cw;x++){
        const cell=s.cells[y][x];
        if(!cell||!cell.seen||cell.type!=="floor")continue;
        if(cell.entity)continue;
        if(hasEnemyAt(s.enemies,x,y))continue;
        if(s.player&&s.player.x===x&&s.player.y===y)continue;
        const topo=floorTopology(s,x,y);
        if(topo.corridor&&hash(x,y,203)<0.92)continue;
        const roomTag=getRoomTag(s,x,y);
        const prop=pickPropForCell(s,x,y,topo,roomTag);
        if(!prop)continue;
        drawPropShape(s,x,y,cs,prop,time);
      }
    }
  }

  function drawPropShape(s,x,y,cs,prop,time){
    const px=x*cs;
    const py=y*cs;
    const cx=px+cs*0.5;
    const cy=py+cs*0.5;
    const biome=getBiomeAt(s,x,y);

    if(prop==="pillar"){
      ctx.fillStyle="rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(cx,py+cs*0.84,cs*0.26,cs*0.1,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="rgba(152,152,165,0.44)";
      ctx.fillRect(px+cs*0.34,py+cs*0.12,cs*0.32,cs*0.65);
      ctx.fillStyle="rgba(205,205,220,0.18)";
      ctx.fillRect(px+cs*0.28,py+cs*0.08,cs*0.44,cs*0.14);
      ctx.fillStyle="rgba(60,60,75,0.5)";
      ctx.fillRect(px+cs*0.3,py+cs*0.68,cs*0.4,cs*0.12);
      return;
    }

    if(prop==="rubble"){
      ctx.fillStyle="rgba(86,84,92,0.65)";
      for(let i=0;i<5;i++){
        const rx=cx+cs*(-0.22+i*0.1);
        const ry=py+cs*(0.62+Math.sin(i*2.1)*0.06);
        const rr=cs*(0.07+hash(x+i,y,301)*0.06);
        ctx.beginPath();
        ctx.arc(rx,ry,rr,0,Math.PI*2);
        ctx.fill();
      }
      return;
    }

    if(prop==="bones"){
      ctx.fillStyle="rgba(215,212,192,0.75)";
      ctx.fillRect(px+cs*0.36,py+cs*0.63,cs*0.28,cs*0.07);
      ctx.fillRect(px+cs*0.43,py+cs*0.56,cs*0.14,cs*0.06);
      return;
    }

    if(prop==="crate"){
      ctx.fillStyle="rgba(120,78,42,0.7)";
      ctx.fillRect(px+cs*0.27,py+cs*0.35,cs*0.46,cs*0.46);
      ctx.strokeStyle="rgba(188,132,74,0.55)";
      ctx.strokeRect(px+cs*0.27,py+cs*0.35,cs*0.46,cs*0.46);
      ctx.strokeStyle="rgba(85,50,25,0.5)";
      ctx.beginPath();
      ctx.moveTo(px+cs*0.27,py+cs*0.58);
      ctx.lineTo(px+cs*0.73,py+cs*0.58);
      ctx.stroke();
      return;
    }

    if(prop==="altar"){
      ctx.fillStyle="rgba(72,60,94,0.72)";
      ctx.fillRect(px+cs*0.2,py+cs*0.34,cs*0.6,cs*0.4);
      ctx.strokeStyle="rgba(172,137,240,0.55)";
      ctx.strokeRect(px+cs*0.24,py+cs*0.38,cs*0.52,cs*0.24);
      ctx.fillStyle="rgba(170,220,255,0.18)";
      ctx.fillRect(px+cs*0.42,py+cs*0.43,cs*0.16,cs*0.1);
      return;
    }

    if(prop==="banner"){
      ctx.fillStyle="rgba(0,0,0,0.28)";
      ctx.fillRect(px+cs*0.46,py+cs*0.14,cs*0.08,cs*0.64);
      const col=biome==="south"?"rgba(190,70,45,0.62)":biome==="east"?"rgba(85,145,80,0.62)":biome==="north"?"rgba(90,130,190,0.62)":"rgba(120,95,160,0.62)";
      ctx.fillStyle=col;
      ctx.beginPath();
      ctx.moveTo(px+cs*0.54,py+cs*0.16);
      ctx.lineTo(px+cs*0.8,py+cs*0.22);
      ctx.lineTo(px+cs*0.7,py+cs*0.46);
      ctx.lineTo(px+cs*0.54,py+cs*0.42);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if(prop==="chain"){
      ctx.strokeStyle="rgba(145,145,165,0.45)";
      ctx.lineWidth=1;
      for(let i=0;i<5;i++){
        const oy=py+cs*(0.18+i*0.12);
        ctx.beginPath();
        ctx.arc(cx,oy,cs*0.04,0,Math.PI*2);
        ctx.stroke();
      }
      return;
    }

    if(prop==="pool"){
      const c=biome==="south"?"rgba(240,85,38,0.55)":biome==="north"?"rgba(92,164,220,0.45)":"rgba(98,122,160,0.42)";
      ctx.fillStyle=c;
      ctx.beginPath();
      ctx.ellipse(cx,py+cs*0.67,cs*0.25,cs*0.12,0,0,Math.PI*2);
      ctx.fill();
      return;
    }
  }

  function drawTorchLayer(s,time){
    const cs=s.cs;
    for(let y=0;y<s.ch;y++){
      for(let x=0;x<s.cw;x++){
        const cell=s.cells[y][x];
        if(!cell||!cell.seen||cell.type!=="floor")continue;
        if(!shouldDrawTorch(s,x,y))continue;
        const biome=getBiomeAt(s,x,y);
        const color=BIOME_PALETTES[biome].torch;
        const cx=x*cs+cs*0.5;
        const cy=y*cs+cs*0.5;
        const flick=1+Math.sin(time*8+x*1.3+y*0.8)*0.12;
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,cs*2.8*flick);
        g.addColorStop(0,hexToRgba(color,0.36));
        g.addColorStop(0.45,hexToRgba(color,0.13));
        g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g;
        ctx.fillRect(cx-cs*3,cy-cs*3,cs*6,cs*6);

        ctx.fillStyle="#593a25";
        ctx.fillRect(cx-cs*0.08,cy+cs*0.05,cs*0.16,cs*0.36);
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.ellipse(cx,cy-cs*0.02,cs*0.1*flick,cs*0.2*flick,0,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle="rgba(255,241,180,0.9)";
        ctx.beginPath();
        ctx.ellipse(cx,cy-cs*0.07,cs*0.05,cs*0.11,0,0,Math.PI*2);
        ctx.fill();
      }
    }
  }

  function drawPortalStructures(s,portals,time){
    const cs=s.cs;
    portals.forEach((p,idx)=>{
      if(!p.visible&&!p.seen)return;
      const def=getPortalDef(p.entity);
      const cx=p.x*cs+cs*0.5;
      const cy=p.y*cs+cs*0.5;
      const pulse=1+Math.sin(time*3+idx)*0.08;

      drawPortalGroundDetail(def,cx,cy,cs,time);

      ctx.strokeStyle="rgba(16,14,18,0.92)";
      ctx.lineWidth=Math.max(3,Math.floor(cs*0.26));
      ctx.beginPath();
      ctx.arc(cx,cy,cs*0.82,Math.PI*0.6,Math.PI*2.4);
      ctx.stroke();

      ctx.strokeStyle="rgba(132,128,145,0.72)";
      ctx.lineWidth=Math.max(2,Math.floor(cs*0.14));
      ctx.beginPath();
      ctx.arc(cx,cy,cs*0.74,Math.PI*0.62,Math.PI*2.38);
      ctx.stroke();

      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,cs*2.5*pulse);
      glow.addColorStop(0,hexToRgba(def.color,0.56));
      glow.addColorStop(0.32,hexToRgba(def.color,0.2));
      glow.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=glow;
      ctx.fillRect(cx-cs*3,cy-cs*3,cs*6,cs*6);

      ctx.save();
      ctx.strokeStyle=def.color;
      ctx.shadowColor=def.color;
      ctx.shadowBlur=18;
      ctx.lineWidth=Math.max(2,Math.floor(cs*0.1));
      ctx.beginPath();
      ctx.arc(cx,cy,cs*(0.5+Math.sin(time*5+idx)*0.04),0,Math.PI*2);
      ctx.stroke();
      ctx.restore();

      const swirl=ctx.createRadialGradient(cx,cy,0,cx,cy,cs*0.62);
      swirl.addColorStop(0,"rgba(5,5,12,0.92)");
      swirl.addColorStop(0.4,hexToRgba(def.glow,0.75));
      swirl.addColorStop(1,"rgba(5,5,12,0.95)");
      ctx.fillStyle=swirl;
      ctx.beginPath();
      ctx.ellipse(cx,cy,cs*0.36,cs*0.52,Math.sin(time*2.2+idx)*0.2,0,Math.PI*2);
      ctx.fill();

      for(let i=0;i<6;i++){
        const a=time*1.2+i*1.047+idx;
        const r=cs*(0.85+hash(p.x,p.y,i)*0.4);
        const px=cx+Math.cos(a)*r;
        const py=cy+Math.sin(a*1.13)*r*0.75;
        ctx.fillStyle=hexToRgba(def.color,0.72);
        ctx.fillRect(px,py,2,2);
      }

      if(cs>=20){
        ctx.fillStyle="rgba(10,10,16,0.78)";
        ctx.fillRect(cx-cs*1.4,cy-cs*1.55,cs*2.8,cs*0.4);
        ctx.strokeStyle=hexToRgba(def.color,0.55);
        ctx.strokeRect(cx-cs*1.4+0.5,cy-cs*1.55+0.5,cs*2.8-1,cs*0.4-1);
        ctx.fillStyle="#dccfa8";
        ctx.font=(cs<=20?"9px":"10px")+" Georgia";
        ctx.textAlign="center";
        ctx.fillText(def.name,cx,cy-cs*1.28);
      }
    });
  }

  function drawPortalGroundDetail(def,cx,cy,cs,time){
    if(def.biome==="south"){
      ctx.strokeStyle=hexToRgba(def.color,0.45);
      ctx.lineWidth=1.5;
      for(let i=0;i<4;i++){
        const ang=i*Math.PI*0.5+time*0.2;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(ang)*cs*0.95,cy+Math.sin(ang)*cs*0.95);
        ctx.lineTo(cx+Math.cos(ang)*cs*1.4,cy+Math.sin(ang)*cs*1.5);
        ctx.stroke();
      }
    }else if(def.biome==="east"){
      ctx.fillStyle="rgba(70,140,64,0.38)";
      for(let i=0;i<5;i++){
        const a=i*1.25+time*0.2;
        ctx.beginPath();
        ctx.arc(cx+Math.cos(a)*cs*0.95,cy+Math.sin(a)*cs*0.85,cs*0.06,0,Math.PI*2);
        ctx.fill();
      }
    }else if(def.biome==="north"){
      ctx.fillStyle="rgba(120,190,255,0.34)";
      for(let i=0;i<5;i++){
        const a=i*1.17;
        ctx.fillRect(cx+Math.cos(a)*cs*0.95,cy+Math.sin(a)*cs*0.9,cs*0.09,cs*0.09);
      }
    }else if(def.biome==="west"){
      ctx.fillStyle="rgba(168,102,240,0.32)";
      for(let i=0;i<4;i++){
        const a=i*1.6+time*0.15;
        ctx.beginPath();
        ctx.ellipse(cx+Math.cos(a)*cs*1.02,cy+Math.sin(a)*cs*0.78,cs*0.07,cs*0.03,a,0,Math.PI*2);
        ctx.fill();
      }
    }
  }

  function drawItems(s,time){
    if(!Array.isArray(s.items))return;
    const cs=s.cs;
    for(const it of s.items){
      if(!it)continue;
      if(it.x<0||it.y<0||it.x>=s.cw||it.y>=s.ch)continue;
      const cell=s.cells[it.y]&&s.cells[it.y][it.x];
      if(!cell||!cell.seen)continue;
      const alpha=cell.visible?1:0.55;
      const bob=Math.sin(time*2.1+it.x*1.2+it.y*0.9)*(cs*0.06);
      const sz=Math.max(10,cs*0.76);
      const px=it.x*cs+(cs-sz)/2;
      const py=it.y*cs+(cs-sz)/2+bob;
      const cx=it.x*cs+cs*0.5;
      const cy=it.y*cs+cs*0.5+bob;
      const aura=itemAuraColor(it);

      ctx.globalAlpha=alpha;
      ctx.fillStyle="rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.ellipse(cx,it.y*cs+cs*0.82,cs*0.26,cs*0.09,0,0,Math.PI*2);
      ctx.fill();

      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,cs*0.64);
      g.addColorStop(0,hexToRgba(aura,0.32));
      g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=g;
      ctx.fillRect(cx-cs*0.9,cy-cs*0.9,cs*1.8,cs*1.8);

      if(!drawItemSprite(it,px,py,sz,aura)){
        drawItemFallback(px,py,sz,aura);
      }
      ctx.globalAlpha=1;
    }
  }

  function drawEnemies(s,time){
    if(!Array.isArray(s.enemies))return;
    const cs=s.cs;
    const sz=Math.max(10,cs*0.84);
    for(const en of s.enemies){
      if(!en)continue;
      if(en.x<0||en.y<0||en.x>=s.cw||en.y>=s.ch)continue;
      const cell=s.cells[en.y]&&s.cells[en.y][en.x];
      if(!cell||!cell.seen)continue;
      const alpha=cell.visible?1:0.5;
      const bob=Math.sin(time*2.8+en.x*1.4+en.y*1.1)*(cs*0.07);
      const px=en.x*cs+(cs-sz)/2;
      const py=en.y*cs+(cs-sz)/2+bob;
      const cx=en.x*cs+cs*0.5;
      const cy=en.y*cs+cs*0.5+bob;

      ctx.globalAlpha=alpha;
      ctx.fillStyle="rgba(0,0,0,0.56)";
      ctx.beginPath();
      ctx.ellipse(cx,en.y*cs+cs*0.82,cs*0.34,cs*0.11,0,0,Math.PI*2);
      ctx.fill();

      const aura=enemyAuraColor(en,s.zoneId);
      const ag=ctx.createRadialGradient(cx,cy,0,cx,cy,cs*0.75);
      ag.addColorStop(0,hexToRgba(aura,0.28));
      ag.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=ag;
      ctx.fillRect(cx-cs,cy-cs,cs*2,cs*2);

      if(!drawEnemySprite(en,px,py,sz)){
        drawEnemyFallback(en,px,py,sz,aura);
      }

      if(en.boss){
        ctx.strokeStyle="rgba(255,115,115,0.62)";
        ctx.lineWidth=1.5;
        ctx.strokeRect(px-1,py-1,sz+2,sz+2);
      }else if(en.isElite||en.elite){
        ctx.strokeStyle="rgba(255,214,102,0.62)";
        ctx.lineWidth=1.2;
        ctx.strokeRect(px-1,py-1,sz+2,sz+2);
      }
      ctx.globalAlpha=1;
    }
  }

  function drawEnemySprite(en,px,py,sz){
    if(typeof getMonsterSprite!=="function"||typeof MONSTER_SVGS==="undefined")return false;
    const key=getMonsterSprite(en)||"unknown";
    const svg=MONSTER_SVGS[key];
    if(!svg)return false;
    const uri="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
    let img=imgCache.get(uri);
    if(!img){
      img=new Image();
      img.decoding="async";
      img.src=uri;
      imgCache.set(uri,img);
    }
    if(!img.complete)return false;
    ctx.drawImage(img,px,py,sz,sz);
    return true;
  }

  function drawItemSprite(it,px,py,sz,aura){
    if(typeof getItemSpriteURI!=="function")return false;
    let uri;
    try{
      uri=getItemSpriteURI(it);
    }catch(e){
      return false;
    }
    if(!uri)return false;
    let img=imgCache.get(uri);
    if(!img){
      img=new Image();
      img.decoding="async";
      img.src=uri;
      imgCache.set(uri,img);
    }
    if(!img.complete)return false;
    ctx.save();
    ctx.filter="drop-shadow(0 2px 1px rgba(0,0,0,.65)) drop-shadow(0 0 6px "+hexToRgba(aura,0.45)+")";
    ctx.drawImage(img,px,py,sz,sz);
    ctx.restore();
    return true;
  }

  function drawItemFallback(px,py,sz,aura){
    ctx.fillStyle="rgba(18,22,32,0.92)";
    ctx.fillRect(px,py,sz,sz);
    ctx.strokeStyle=hexToRgba(aura,0.95);
    ctx.lineWidth=1;
    ctx.strokeRect(px+0.5,py+0.5,sz-1,sz-1);
    ctx.fillStyle=hexToRgba(aura,0.85);
    ctx.beginPath();
    ctx.moveTo(px+sz*0.5,py+sz*0.12);
    ctx.lineTo(px+sz*0.82,py+sz*0.5);
    ctx.lineTo(px+sz*0.5,py+sz*0.88);
    ctx.lineTo(px+sz*0.18,py+sz*0.5);
    ctx.closePath();
    ctx.fill();
  }

  function drawEnemyFallback(en,px,py,sz,aura){
    const key=(typeof getMonsterSprite==="function"?getMonsterSprite(en):"unknown")||"unknown";
    ctx.fillStyle="rgba(30,24,34,0.9)";
    ctx.fillRect(px,py,sz,sz);
    ctx.strokeStyle=hexToRgba(aura,0.85);
    ctx.strokeRect(px+1,py+1,sz-2,sz-2);

    if(key==="bat"){
      ctx.beginPath();
      ctx.moveTo(px+sz*0.12,py+sz*0.55);
      ctx.lineTo(px+sz*0.46,py+sz*0.38);
      ctx.lineTo(px+sz*0.32,py+sz*0.7);
      ctx.closePath();
      ctx.fillStyle=hexToRgba(aura,0.8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px+sz*0.88,py+sz*0.55);
      ctx.lineTo(px+sz*0.54,py+sz*0.38);
      ctx.lineTo(px+sz*0.68,py+sz*0.7);
      ctx.closePath();
      ctx.fill();
      return;
    }

    ctx.fillStyle=hexToRgba(aura,0.85);
    ctx.beginPath();
    ctx.ellipse(px+sz*0.5,py+sz*0.48,sz*0.28,sz*0.33,0,0,Math.PI*2);
    ctx.fill();
  }

  function drawPlayerGrounding(s,time){
    if(!s.player)return;
    const cs=s.cs;
    const px=s.player.x*cs;
    const py=s.player.y*cs;
    const cx=px+cs*0.5;
    const cy=py+cs*0.5;
    const bob=Math.sin(time*4+s.player.x*0.7+s.player.y*0.7)*(cs*0.05);
    const g=ctx.createRadialGradient(cx,cy+cs*0.1,0,cx,cy+cs*0.1,cs*0.9);
    g.addColorStop(0,"rgba(136,210,255,0.22)");
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g;
    ctx.fillRect(px-cs*0.4,py-cs*0.1,cs*1.8,cs*1.8);
    ctx.fillStyle="rgba(0,0,0,0.7)";
    ctx.beginPath();
    ctx.ellipse(cx,py+cs*0.82+bob*0.2,cs*0.36,cs*0.12,0,0,Math.PI*2);
    ctx.fill();
  }

  function drawLighting(s,portals,time){
    const mapW=s.cw*s.cs;
    const mapH=s.ch*s.cs;
    const zoneBiome=zoneToBiome(s.zoneId);
    const pal=BIOME_PALETTES[zoneBiome];

    ctx.fillStyle=pal.tint;
    ctx.fillRect(0,0,mapW,mapH);

    if(s.player){
      const px=s.player.x*s.cs+s.cs*0.5;
      const py=s.player.y*s.cs+s.cs*0.5;
      const pl=ctx.createRadialGradient(px,py,0,px,py,s.cs*5.6);
      pl.addColorStop(0,"rgba(255,245,205,0.13)");
      pl.addColorStop(0.45,"rgba(160,200,255,0.07)");
      pl.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=pl;
      ctx.fillRect(px-s.cs*6,py-s.cs*6,s.cs*12,s.cs*12);
    }

    portals.forEach((p,idx)=>{
      if(!p.seen)return;
      const def=getPortalDef(p.entity);
      const cx=p.x*s.cs+s.cs*0.5;
      const cy=p.y*s.cs+s.cs*0.5;
      const rr=s.cs*(3.7+Math.sin(time*1.5+idx)*0.28);
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);
      g.addColorStop(0,hexToRgba(def.color,0.24));
      g.addColorStop(0.4,hexToRgba(def.color,0.1));
      g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=g;
      ctx.fillRect(cx-rr,cy-rr,rr*2,rr*2);
    });

    const fog=ctx.createLinearGradient(0,0,0,mapH);
    fog.addColorStop(0,"rgba(0,0,0,0.06)");
    fog.addColorStop(0.45,"rgba(0,0,0,0.15)");
    fog.addColorStop(1,"rgba(0,0,0,0.24)");
    ctx.fillStyle=fog;
    ctx.fillRect(0,0,mapW,mapH);

    const vignette=ctx.createRadialGradient(
      mapW*0.5,mapH*0.5,Math.min(mapW,mapH)*0.16,
      mapW*0.5,mapH*0.5,Math.max(mapW,mapH)*0.72
    );
    vignette.addColorStop(0,"rgba(0,0,0,0)");
    vignette.addColorStop(0.62,"rgba(0,0,0,0.21)");
    vignette.addColorStop(1,"rgba(0,0,0,0.74)");
    ctx.fillStyle=vignette;
    ctx.fillRect(0,0,mapW,mapH);
  }

  function floorTopology(s,x,y){
    const wallAdj=countTypeNeighbors(s.cells,x,y,s.cw,s.ch,"wall");
    return{
      wallAdj,
      corridor:wallAdj>=2,
      chamber:wallAdj<=1
    };
  }

  function pickPropForCell(s,x,y,topo,roomTag){
    const b=getBiomeAt(s,x,y);
    const r=hash(x,y,227);
    if(topo.corridor){
      if(r<0.02)return "rubble";
      if(roomTag.indexOf("prison")>=0&&r<0.04)return "chain";
      return "";
    }
    if(roomTag.indexOf("altar")>=0||roomTag.indexOf("ritual")>=0){
      if(r<0.08)return "altar";
      if(r<0.13)return "bones";
    }
    if(roomTag.indexOf("storage")>=0||roomTag.indexOf("barracks")>=0){
      if(r<0.1)return "crate";
    }
    if(roomTag.indexOf("flooded")>=0||roomTag.indexOf("shrine")>=0){
      if(r<0.07)return "pool";
      if(r<0.1)return "pillar";
    }
    if(r<0.045)return "pillar";
    if(r<0.09)return "rubble";
    if(b==="west"&&r<0.12)return "bones";
    if(b==="east"&&r<0.125)return "banner";
    if(b==="north"&&r<0.11)return "chain";
    if(b==="south"&&r<0.12)return "pool";
    return "";
  }

  function shouldDrawTorch(s,x,y){
    const c=s.cells[y]&&s.cells[y][x];
    if(!c||c.type!=="floor"||!c.seen)return false;
    if(c.entity)return false;
    if(s.player&&s.player.x===x&&s.player.y===y)return false;
    const wallAdj=countTypeNeighbors(s.cells,x,y,s.cw,s.ch,"wall");
    if(wallAdj<1)return false;
    const r=hash(x,y,411);
    if(wallAdj>=3)return r<0.09;
    if(wallAdj===2)return r<0.045;
    return r<0.02;
  }

  function findPortals(s){
    const portals=[];
    for(let y=0;y<s.ch;y++){
      for(let x=0;x<s.cw;x++){
        const cell=s.cells[y][x];
        if(!cell||!cell.entity||cell.entity.indexOf("portal_")!==0)continue;
        portals.push({x,y,entity:cell.entity,visible:!!cell.visible,seen:!!cell.seen});
      }
    }
    return portals;
  }

  function getPortalDef(entity){
    if(entity==="portal_N")return PORTAL_DEFS.N;
    if(entity==="portal_S")return PORTAL_DEFS.S;
    if(entity==="portal_E")return PORTAL_DEFS.E;
    if(entity==="portal_W")return PORTAL_DEFS.W;
    return PORTAL_DEFS.return;
  }

  function getRoomTag(s,x,y){
    if(!Array.isArray(s.roomGrid)||!Array.isArray(s.rooms))return "";
    const row=s.roomGrid[y];
    if(!row)return "";
    const idx=row[x];
    if(idx===undefined||idx===null||idx<0)return "";
    const room=s.rooms[idx];
    if(!room)return "";
    return String(room.tag||"");
  }

  function getBiomeAt(s,x,y){
    if(s.zoneId)return zoneToBiome(s.zoneId);
    const nx=(x/(Math.max(1,s.cw-1))-0.5)*2;
    const ny=(y/(Math.max(1,s.ch-1))-0.5)*2;
    if(Math.abs(nx)<0.34&&ny<-0.16)return "north";
    if(Math.abs(nx)<0.34&&ny>0.16)return "south";
    if(nx>0.24&&Math.abs(ny)<0.34)return "east";
    if(nx<-0.24&&Math.abs(ny)<0.34)return "west";
    return "hub";
  }

  function zoneToBiome(zoneId){
    if(zoneId==="N")return "north";
    if(zoneId==="S")return "south";
    if(zoneId==="E")return "east";
    if(zoneId==="W")return "west";
    return "hub";
  }

  function getBiomeDust(biome,a){
    if(biome==="north")return "rgba(150,210,255,"+a.toFixed(3)+")";
    if(biome==="south")return "rgba(255,110,66,"+a.toFixed(3)+")";
    if(biome==="east")return "rgba(120,190,105,"+a.toFixed(3)+")";
    if(biome==="west")return "rgba(178,130,240,"+a.toFixed(3)+")";
    return "rgba(175,168,138,"+a.toFixed(3)+")";
  }

  function enemyAuraColor(en,zoneId){
    if(en&&en.boss)return "#ff5f7d";
    if(en&&(en.isElite||en.elite))return "#f7c667";
    if(zoneId==="N")return "#78beff";
    if(zoneId==="S")return "#ff7846";
    if(zoneId==="E")return "#7cff9b";
    if(zoneId==="W")return "#d282ff";
    return "#ff7ea8";
  }

  function itemAuraColor(it){
    if(it&&typeof getItemGlowColor==="function"){
      const c=getItemGlowColor(it);
      if(typeof c==="string"&&c.startsWith("#"))return c;
    }
    const type=String(it&&it.type||"").toLowerCase();
    if(it&&(it.isHp||type==="hp_pot"))return "#ff6478";
    if(it&&(it.isMp||type==="mp_pot"))return "#62a7ff";
    if(type==="ring")return "#ffe18f";
    if(type==="material"){
      const rarity=Math.max(1,Math.min(4,Number(it.rarity||1)));
      if(rarity===1)return "#8ea0b6";
      if(rarity===2)return "#63d782";
      if(rarity===3)return "#68b0ff";
      return "#b781ff";
    }
    const tier=Math.max(1,Math.min(8,Number(it&&it.tier||1)));
    const tierColors={1:"#bcc3d2",2:"#63df8b",3:"#67b4ff",4:"#bb7bff",5:"#ffd35f",6:"#ff9f44",7:"#ff58c8",8:"#ffffff"};
    return tierColors[tier]||"#ffd78d";
  }

  function hasEnemyAt(enemies,x,y){
    if(!Array.isArray(enemies))return false;
    for(let i=0;i<enemies.length;i++){
      const en=enemies[i];
      if(en&&en.x===x&&en.y===y)return true;
    }
    return false;
  }

  function isTypeAt(cells,x,y,cw,ch,type){
    if(x<0||y<0||x>=cw||y>=ch)return false;
    const cell=cells[y]&&cells[y][x];
    return !!cell&&cell.type===type;
  }

  function countTypeNeighbors(cells,x,y,cw,ch,type){
    let n=0;
    if(isTypeAt(cells,x,y-1,cw,ch,type))n++;
    if(isTypeAt(cells,x,y+1,cw,ch,type))n++;
    if(isTypeAt(cells,x-1,y,cw,ch,type))n++;
    if(isTypeAt(cells,x+1,y,cw,ch,type))n++;
    return n;
  }

  function hash(x,y,salt){
    const z=(salt||0)*2246822519;
    let n=x*374761393+y*668265263+z;
    n=(n^(n>>>13))*1274126177;
    return ((n^(n>>>16))>>>0)/4294967295;
  }

  function hexToRgba(hex,a){
    const raw=(hex||"#ffffff").replace("#","");
    const v=raw.length===3
      ?raw.split("").map((c)=>c+c).join("")
      :raw.padEnd(6,"0").slice(0,6);
    const n=parseInt(v,16);
    const r=(n>>16)&255;
    const g=(n>>8)&255;
    const b=n&255;
    return "rgba("+r+","+g+","+b+","+a+")";
  }

  function blendHex(a,b,t){
    const ca=hexToRgb(a);
    const cb=hexToRgb(b);
    const cl=Math.max(0,Math.min(1,t));
    const r=Math.round(ca.r+(cb.r-ca.r)*cl);
    const g=Math.round(ca.g+(cb.g-ca.g)*cl);
    const bl=Math.round(ca.b+(cb.b-ca.b)*cl);
    return "#"+toHex(r)+toHex(g)+toHex(bl);
  }

  function hexToRgb(hex){
    const raw=(hex||"#000000").replace("#","");
    const v=raw.length===3
      ?raw.split("").map((c)=>c+c).join("")
      :raw.padEnd(6,"0").slice(0,6);
    const n=parseInt(v,16);
    return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }

  function toHex(n){
    return Math.max(0,Math.min(255,n)).toString(16).padStart(2,"0");
  }

  WR.init=init;
  WR.update=update;
  WR.start=start;
  WR.stop=stop;
  WR.renderImmediate=render;
  WR.imgCache=imgCache;
  window.worldRenderer=WR;
})();
