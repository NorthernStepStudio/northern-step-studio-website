// ═══════════════════════════════
// VFX ENGINE
// ═══════════════════════════════
const VC=document.getElementById('vfxc'),VX=VC.getContext('2d');
let parts=[];
let vfxRaf=0;
let lowFxMode=false;

function detectLowFxMode(){
  try{
    const ua=navigator.userAgent||'';
    const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    const lowMem=Number(navigator.deviceMemory||0)>0&&Number(navigator.deviceMemory)<=4;
    const lowCore=Number(navigator.hardwareConcurrency||0)>0&&Number(navigator.hardwareConcurrency)<=4;
    lowFxMode=!!(mobile&&(lowMem||lowCore));
  }catch(_){
    lowFxMode=false;
  }
  window.__nsLowFxMode=lowFxMode;
}
detectLowFxMode();

function rzV(){VC.width=window.innerWidth;VC.height=window.innerHeight;}
rzV();window.addEventListener('resize',rzV);

function maxParticles(){return lowFxMode?180:520;}
function trimParticles(){
  const max=maxParticles();
  if(parts.length>max)parts.splice(0,parts.length-max);
}
function scaleParticles(n){
  if(!lowFxMode)return n;
  return Math.max(4,Math.floor(n*0.45));
}

function ensureVfxLoop(){
  if(vfxRaf)return;
  const loop=()=>{
    vfxRaf=0;
    renderVfx();
    if(parts.length>0&&!document.hidden)vfxRaf=requestAnimationFrame(loop);
  };
  vfxRaf=requestAnimationFrame(loop);
}

function spPt(x,y,c,n,o={}){
  const count=scaleParticles(n);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,sp=(o.speed||3)+Math.random()*(o.spread||4);
    parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(o.up||0),life:1,decay:o.decay||(0.04+Math.random()*0.04),c,size:o.size||(2+Math.random()*4),grav:o.grav!==undefined?o.grav:.15,ch:o.ch||null});
  }
  trimParticles();
  ensureVfxLoop();
}
function spSl(x,y,c='#fff'){
  parts.push({x,y,type:'slash',c,life:1,decay:.08,angle:Math.random()*Math.PI,radius:28+Math.random()*18,vx:0,vy:0,grav:0,size:3});
  trimParticles();
  ensureVfxLoop();
}
function spRi(x,y,c){
  parts.push({x,y,type:'ring',c,life:1,decay:.05,radius:5,vx:0,vy:0,grav:0,size:3});
  trimParticles();
  ensureVfxLoop();
}
function spBo(fx,fy,tx,ty,c='#44aaff'){
  const count=scaleParticles(12);
  for(let i=0;i<count;i++){
    const t=i/Math.max(1,count);
    parts.push({x:fx+(tx-fx)*t+(Math.random()-.5)*20,y:fy+(ty-fy)*t+(Math.random()-.5)*20,type:'bolt',c,life:1,decay:.12+Math.random()*.06,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,grav:0,size:2+Math.random()*3});
  }
  trimParticles();
  ensureVfxLoop();
}

function renderVfx(){
  VX.clearRect(0,0,VC.width,VC.height);
  if(document.hidden){parts=[];return;}
  parts=parts.filter(p=>p.life>0);
  for(const p of parts){
    p.life-=p.decay;
    if(p.type==='slash'){
      VX.save();VX.globalAlpha=p.life;VX.strokeStyle=p.c;VX.lineWidth=p.size;VX.shadowBlur=10;VX.shadowColor=p.c;
      VX.beginPath();VX.arc(p.x,p.y,p.radius*(1-p.life+0.4),p.angle,p.angle+1.8);VX.stroke();VX.restore();p.radius+=3;
    }else if(p.type==='ring'){
      VX.save();VX.globalAlpha=p.life*.8;VX.strokeStyle=p.c;VX.lineWidth=2;VX.shadowBlur=15;VX.shadowColor=p.c;
      VX.beginPath();VX.arc(p.x,p.y,p.radius,0,Math.PI*2);VX.stroke();VX.restore();p.radius+=5;
    }else if(p.type==='bolt'){
      VX.save();VX.globalAlpha=p.life;VX.fillStyle=p.c;VX.shadowBlur=8;VX.shadowColor=p.c;
      VX.beginPath();VX.arc(p.x+p.vx,p.y+p.vy,p.size,0,Math.PI*2);VX.fill();VX.restore();p.x+=p.vx;p.y+=p.vy;
    }else{
      p.vy+=p.grav;p.x+=p.vx;p.y+=p.vy;VX.save();VX.globalAlpha=p.life;
      if(p.ch){VX.font=`${p.size*4}px serif`;VX.textAlign='center';VX.fillText(p.ch,p.x,p.y);}
      else{VX.fillStyle=p.c;VX.shadowBlur=6;VX.shadowColor=p.c;VX.beginPath();VX.arc(p.x,p.y,p.size,0,Math.PI*2);VX.fill();}
      VX.restore();
    }
  }
}

function sfx(c,d=200){const f=document.getElementById('sflash');f.style.background=c;f.style.opacity='.35';setTimeout(()=>f.style.opacity='0',d*.3);}
function gctr(s){const el=document.getElementById(s==='player'?'cpwrap':'cewrap');const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
function hfl(s){const el=document.getElementById(s==='player'?'cpwrap':'cewrap');el.classList.remove('hflash');void el.offsetWidth;el.classList.add('hflash');setTimeout(()=>el.classList.remove('hflash'),200);}
function doVfx(type){
  const pc=gctr('player'),ec=gctr('enemy');
  if(type==='slash'){spSl(ec.x,ec.y,'#fff');spPt(ec.x,ec.y,'#ffaa44',10,{speed:4,spread:3,decay:.05});spRi(ec.x,ec.y,'#ff6644');sfx('rgba(255,100,50,.4)',180);}
  else if(type==='magic'){spBo(pc.x,pc.y,ec.x,ec.y,'#aa44ff');spPt(ec.x,ec.y,'#aa44ff',16,{speed:3,spread:5,decay:.04,grav:.05});spRi(ec.x,ec.y,'#aa44ff');sfx('rgba(120,30,220,.35)',200);}
  else if(type==='poison'){spPt(ec.x,ec.y,'#44ff44',14,{speed:2,spread:4,grav:.08,decay:.03});spPt(ec.x,ec.y,'#88ff44',6,{speed:3,spread:5,decay:.05,ch:'☠'});sfx('rgba(40,180,40,.25)',200);}
  else if(type==='holy'){spPt(ec.x,ec.y,'#ffdd44',18,{speed:4,spread:5,grav:0,decay:.04});spRi(ec.x,ec.y,'#ffdd44');spRi(pc.x,pc.y,'#44ff88');spPt(pc.x,pc.y-20,'#44ff88',10,{speed:2,spread:3,grav:-.1,decay:.04});sfx('rgba(255,220,50,.3)',200);}
  else if(type==='bomb'){spPt(ec.x,ec.y,'#ff6600',25,{speed:6,spread:5,decay:.04});spPt(ec.x,ec.y,'#ffdd00',15,{speed:4,spread:4,decay:.05});spRi(ec.x,ec.y,'#ff4400');spRi(ec.x,ec.y,'#ffaa00');sfx('rgba(255,100,0,.5)',250);document.getElementById('game-screen').classList.add('bigshake');setTimeout(()=>document.getElementById('game-screen').classList.remove('bigshake'),400);}
  else if(type==='crit'){spSl(ec.x,ec.y,'#ffff00');spPt(ec.x,ec.y,'#ffff00',22,{speed:6,spread:6,decay:.04});spRi(ec.x,ec.y,'#ffff00');sfx('rgba(255,255,0,.4)',200);document.getElementById('game-screen').classList.add('bigshake');setTimeout(()=>document.getElementById('game-screen').classList.remove('bigshake'),400);}
  else if(type==='enemy'){spSl(pc.x,pc.y,'#ff2222');spPt(pc.x,pc.y,'#ff4444',12,{speed:3,spread:4,decay:.05});sfx('rgba(200,0,0,.3)',150);}
}

