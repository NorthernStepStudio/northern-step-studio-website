// COMBAT
// ═══════════════════════════════
function startCombat(en){
  G.inCombat=true;G.currentEnemy=en;
  const p=G.player;
  updCS();
  document.getElementById('cpname').textContent=p.className;
  document.getElementById('cpwpn').textContent=G.equippedWeapon?`${G.equippedWeapon.emoji} ${G.equippedWeapon.name}`:'Bare Fists';

  // Render enemy SVG sprite in combat overlay
  const spriteEl=document.getElementById('cesprite');
  const key=getMonsterSprite(en);
  const svg=MONSTER_SVGS[key]||MONSTER_SVGS.unknown;
  const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  const animClass=key==='bat'||key==='shadow_wraith'?'anim-float':
                  key==='slime'||key==='spider'?'anim-wobble':
                  key==='void_cube'||key==='star_horror'?'anim-sway':'anim-bob';
  const eliteClass=(en.isElite||en.elite)?' elite':'';
  // Boss gets extra large with a glow ring
  const sz=en.boss?72:56;
  const bossGlow=en.boss?'filter:drop-shadow(0 0 8px #ffd700);':en.isElite?'filter:drop-shadow(0 0 5px #ffaa00);':'';
  spriteEl.innerHTML=`<img class="monster-sprite ${animClass}${eliteClass}" src="${uri}" width="${sz}" height="${sz}" style="image-rendering:pixelated;${bossGlow}display:block;">`;

  document.getElementById('cename').textContent=en.name;
  document.getElementById('cewpn').textContent=en.wpn||'Claws';
  document.getElementById('celvl').textContent=`LV.${en.level}`;
  document.getElementById('clog').innerHTML='';
  const sk=document.getElementById('cskill');sk.innerHTML=`<span class="ci">✨</span>${p.classData.skill.name}`;
  clog(`⚔ Fighting ${en.name} LV${en.level}!`,'#ff8888');
  if(en.boss)clog('BOSS BATTLE!','#ffdd00');
  if(en.isElite||en.elite)clog('★ ELITE ENEMY — stronger and drops better loot!','#ffaa00');
  if(en.zoneEnemy){
    const zdef=getZoneDefForFloorId(en.zoneEnemy)||PORTAL_ZONES[getFloorZoneId(en.zoneEnemy)||'N'];
    clog(`${zdef?.emoji||'🌀'} Zone enemy — harder but worth more.`,'#aaaaff');
  }
  updCUI();document.getElementById('combatov').classList.add('active');
}
function updCUI(){
  const p=G.player,en=G.currentEnemy;
  if(!en) return;
  document.getElementById('cphp').style.width=`${(p.hp/p.maxHp)*100}%`;
  document.getElementById('cphpv').textContent=`${p.hp}/${p.maxHp}`;
  document.getElementById('cehp').style.width=`${Math.max(0,(en.hp/en.maxHp)*100)}%`;
  document.getElementById('cehpv').textContent=`${Math.max(0,en.hp)}/${en.maxHp}`;
  document.getElementById('cskill').disabled=p.mp<p.classData.skill.cost;
  // Show status badges on enemy name
  const enName=document.getElementById('cename');
  const badges=getStatusBadges(en);
  enName.innerHTML=en.name+(badges?` ${badges}`:'');
}
function clog(tx,col='#e8e8f0'){const lg=document.getElementById('clog'),d=document.createElement('div');d.style.color=col;d.textContent=tx;lg.appendChild(d);lg.scrollTop=lg.scrollHeight;}

let combatBusy=false;
function ca(action){
  const p=G.player,en=G.currentEnemy;
  if(!en||combatBusy||en.hp<=0)return;
  combatBusy=true;
  let pd=0;
  const mods=getModEffects();

  if(action==='attack'){
    const crit=Math.random()*100<p.crit;
    const base=Math.max(3, p.atk - Math.floor(en.def*0.35) + Math.floor(Math.random()*8));
    let dmg=crit?Math.floor(base*(1.8+Math.random()*.4)):base;
    if(mods.dmgBoost)dmg=Math.floor(dmg*mods.dmgBoost);
    dmg=applyAffixOnHit(p,en,dmg);
    pd=dmg;
    clog(`You hit for ${pd}${crit?' 💥 CRIT!':''}`,'#88ff88');
    doVfx(crit?'crit':'slash');hfl('enemy');spawnDmg(pd,crit?'#ffdd00':'#ff8888');
    if(p.perks.lifesteal||mods.lifeStealBoost){const lsR=(p.perks.lifesteal||0)+(mods.lifeStealBoost||0);const ls=Math.floor(pd*lsR);if(ls>0){p.hp=Math.min(p.maxHp,p.hp+ls);clog(`❤ +${ls}HP`,'#44ff88');spawnDmg(ls,'#44ff88',true);}}
    if(p.affix_effect?.thorns){const tr=Math.floor(pd*p.affix_effect.thorns);en.hp-=tr;clog(`Thorns ${tr}!`,'#88ff44');}
  }else if(action==='skill'){
    if(p.mp<p.classData.skill.cost){clog('Not enough MP!','#ff4444');combatBusy=false;return;}
    p.mp-=p.classData.skill.cost;
    if(p.classType==='mage')addCorruption(1);
    pd=useSkill(p.classData.skill.fn);
  }else if(action==='item'){
    const pot=G.inventory.find(i=>i.isHp||i.isMp)||G.inventory.find(i=>i.type==='consumable');
    if(!pot){clog('No usable items!','#ff4444');combatBusy=false;return;}
    applyEffect(pot);G.inventory.splice(G.inventory.indexOf(pot),1);clog(`Used ${pot.emoji} ${pot.name}`,'#ffd700');
    if(pot.isHp){spawnDmg(pot.effect.hp||G.player.maxHp,'#44ff88',true);sfx('rgba(68,255,136,.2)',200);}
    updCUI();updateHUD();
    setTimeout(()=>eAtk(),400);
    return;
  }else if(action==='flee'){
    if(mods.noFlee){clog('🚫 Inescapable! Cannot flee!','#ff4444');setTimeout(()=>eAtk(),400);return;}
    if(Math.random()<.5){clog('Fled! Dignity gone.','#88aaff');addLog(`Fled from ${en.name}. Coward.`,'funny');endCombat();return;}
    else{clog("Failed! Cape grabbed!",'#ff4444');setTimeout(()=>eAtk(),400);return;}
  }

  if(mods.mpDrain&&action!=='flee'){p.mp=Math.max(0,p.mp-mods.mpDrain);}
  tickStatusEnemy(en);
  tickStatusPlayer();
  en.hp-=pd;
  updCUI();
  if(en.hp<=0){defeatEnemy(en,true);return;}

  if(mods.enemyRegen){const regen=Math.floor(en.maxHp*.03);en.hp=Math.min(en.maxHp,en.hp+regen);if(regen)clog(`${en.name} regens ${regen}HP!`,'#ff6644');}
  setTimeout(()=>eAtk(),600);
}

function getMageMindPower(p){
  if(!p||p.classType!=='mage')return 1;
  const lvlBoost=Math.min(.42,Math.max(0,p.level-1)*.05);
  const mpBoost=Math.min(.36,p.maxMp/500);
  return 1+lvlBoost+mpBoost;
}

function useSkill(fn){
  const p=G.player,en=G.currentEnemy;let dmg=0;
  if(!en.status)en.status={};
  if(fn==='powerBonk'){dmg=Math.max(1,p.atk*3-en.def);clog(`POWER BONK! ${dmg}!`,'#ffdd00');doVfx('crit');hfl('enemy');spawnDmg(dmg,'#ff4400');}
  else if(fn==='mysterySpell'){
    const mind=getMageMindPower(p);
    const spellPower=Math.floor((p.maxMp*.12)+(p.level*2)+(p.atk*.2));
    const sp=[
      ()=>{
        const base=40+Math.floor(Math.random()*20)+spellPower;
        dmg=Math.max(1,Math.floor(base*mind)-en.def);
        clog(`Fireball! ${dmg}!`,'#ff8844');
        doVfx('bomb');hfl('enemy');
        applyStatus(en,'burn',mind>=1.45?4:3);
      },
      ()=>{
        const heal=Math.floor((35+spellPower*.45)*mind);
        p.hp=Math.min(p.maxHp,p.hp+heal);
        clog(`Accidental +${heal}HP`,'#44ff88');
        sfx('rgba(68,255,136,.3)',200);
        spawnDmg(heal,'#44ff88',true);
      },
      ()=>{
        dmg=Math.max(6,Math.floor((spellPower*.22)*mind));
        clog(`Arcane sneeze. ${dmg} dmg.`, '#88ff88');
      },
      ()=>{
        dmg=Math.max(1,Math.floor((p.atk*4+spellPower*1.5)*mind));
        clog(`CHAOS BOLT! ${dmg}!`,'#ff44ff');
        doVfx('magic');hfl('enemy');
      },
      ()=>{
        const shred=5+Math.floor((mind-1)*4);
        en.def=Math.max(0,en.def-shred);
        clog(`Enemy DEF-${shred}!`,'#aa44ff');
        doVfx('magic');
      },
      ()=>{
        const freezeDur=mind>=1.45?3:2;
        applyStatus(en,'frozen',freezeDur);
        clog(`❄ Enemy FROZEN for ${freezeDur} turns!`,'#44ccff');
        doVfx('magic');
      },
      ()=>{
        addCorruption(4);
        dmg=Math.max(1,Math.floor((p.atk*5+spellPower*1.8)*mind));
        clog(`CHAOS SURGE! ${dmg}! (+4% Doom)`, '#ff44ff');
        doVfx('magic');hfl('enemy');
      },
    ];sp[Math.floor(Math.random()*sp.length)]();if(dmg)spawnDmg(dmg,'#aa44ff');
  }else if(fn==='poisonStab'){dmg=Math.max(1,p.atk-Math.floor(en.def/2));applyStatus(en,'poison',5);clog(`☠ Poison Stab! ${dmg}+5t poison!`,'#88ff44');doVfx('poison');hfl('enemy');spawnDmg(dmg,'#88ff44');}
  else if(fn==='holyBonk'){const h=30+Math.floor(Math.random()*20);p.hp=Math.min(p.maxHp,p.hp+h);dmg=Math.floor(Math.max(1,p.atk*1.5-en.def));clog(`✨ +${h}HP, ${dmg}dmg!`,'#ffdd88');doVfx('holy');hfl('enemy');spawnDmg(h,'#44ff88',true);spawnDmg(dmg,'#ffdd44');}
  return Math.floor(dmg);
}

function eAtk(){
  const p=G.player,en=G.currentEnemy;
  if(!en||en.hp<=0){combatBusy=false;return;}
  if(en.status?.frozen>0){en.status.frozen--;clog(`❄️ ${en.name} is frozen! Skips attack.`,'#44ccff');updCUI();updateHUD();combatBusy=false;return;}
  if(en.status?.stun>0){en.status.stun--;clog(`${en.name} is stunned! Skips attack.`,'#8888ff');updCUI();updateHUD();combatBusy=false;return;}
  let dmg=Math.max(2, en.atk - Math.floor(p.def*0.45) + Math.floor(Math.random()*5));
  if(G.equippedArmor?.affix_effect?.thorns){const tr=Math.floor(dmg*G.equippedArmor.affix_effect.thorns);en.hp-=tr;clog(`Thorns! ${tr} reflected!`,'#88ff44');if(en.hp<=0){defeatEnemy(en,true);return;}}
  p.hp=Math.max(0,p.hp-dmg);
  clog(`${en.emoji} hits ${dmg}!${Math.random()<.4?' "'+en.taunt[Math.floor(Math.random()*en.taunt.length)]+'"':''}`,'#ff4444');
  doVfx('enemy');hfl('player');spawnDmg(dmg,'#ff4444');updCUI();updateHUD();
  if(p.hp<=0){gameOver(en.name);return;}
  if(en.poisoned>0){const pd=Math.floor(en.maxHp*.05);en.hp-=pd;en.poisoned--;clog(`☠️ Poison ${pd}!`,'#88ff44');if(en.hp<=0){defeatEnemy(en,true);return;}updCUI();}
  combatBusy=false;
}

function defeatEnemy(en,fc){
  const p=G.player;G.kills++;
  const mods=getModEffects();
  const killMult=mods.killBoost||1;
  const gb=en.gold+Math.floor(Math.random()*8);
  let g=p.perks.goldBoost?Math.floor(gb*(1+p.perks.goldBoost)):gb;
  g=Math.floor(g*(1+(G.metaBonus?.goldBonus||0)));
  g=Math.floor(g*killMult);
  p.gold+=g;G.goldTotal+=g;
  let xp=Math.floor(en.xp*(1+(G.metaBonus?.xpBonus||0))*killMult);
  p.xp+=xp;

  // Corruption gain
  const corrSlow=G.metaBonus?.corruptionSlow||0;
  const corrGain=en.boss?8:1;
  addCorruption(Math.max(0,corrGain*(1-corrSlow)));

  if(en.boss){G.bossKills=(G.bossKills||0)+1;addCorruption(5);}

  if(fc){
    clog(`Victory! +${xp}XP +${g}g`,'#ffd700');
    const ec=gctr('enemy');spPt(ec.x,ec.y,'#ffd700',10,{speed:3,spread:4,grav:.1,decay:.04,ch:'*'});
    if(p.perks.cannibal&&Math.random()<p.perks.cannibal){const eh=Math.floor(en.maxHp*.3);p.hp=Math.min(p.maxHp,p.hp+eh);clog(`Nom nom! +${eh}HP`,'#44ff88');}
    // Modifier: explode on death
    if(mods.enemyExplode){
      const exDmg=Math.floor(p.maxHp*.15);
      p.hp=Math.max(1,p.hp-exDmg);
      clog(`${en.name} EXPLODES! ${exDmg} dmg!`,'#ff8800');
      doVfx('bomb');
    }
    setTimeout(()=>endCombat(),750);
  }
  // Remove enemy from correct list
  if(G.inZone&&G.zoneEnemies?.[G.inZone]){
    G.zoneEnemies[G.inZone]=G.zoneEnemies[G.inZone].filter(e=>e.id!==en.id);
  }else{
    G.enemies=G.enemies.filter(e=>e.id!==en.id);
  }
  if(typeof markCurrentFloorStatus==='function')markCurrentFloorStatus();
  const floorMeta=(typeof getCurrentFloorMeta==='function')?getCurrentFloorMeta():null;
  if(en.boss&&floorMeta&&floorMeta.kind==='main'&&(floorMeta.mainDepth||0)>=MAIN_FLOOR_TARGET){
    G.didWin=true;
    addLog('👑 Doom Core threshold broken — major boss eliminated!','loot');
    setTimeout(()=>showRunSummary(true),900);
  }
  addLog(`Defeated ${en.emoji} ${en.name} LV${en.level}! +${xp}XP +${g}g`,'loot');
  if(p.xp>=p.level*100){p.xp-=p.level*100;p.level++;
    setTimeout(showLU,fc?850:0);
  }

  // Helper: push drop to correct item list
  const pushDrop=(drop)=>{
    if(G.inZone&&G.zoneItems?.[G.inZone])G.zoneItems[G.inZone].push(drop);
    else G.items.push(drop);
  };

  // Material drop
  const matChance=en.boss?1.0:0.35;
  if(Math.random()<matChance){
    const numMats=en.boss?2+Math.floor(Math.random()*2):1;
    for(let m=0;m<numMats;m++){
      const mat=rollMaterialDrop(G.floor,en.boss||false);
      if(mat&&G.inventory.length<G.maxInvSlots){G.inventory.push(mat);addLog(`Got ${mat.emoji} ${mat.name}!`,'loot');}
      else if(mat)pushDrop({...mat,x:en.x,y:en.y});
    }
  }
  // Gear drop
  const dropChance=.30+(G.metaBonus?.dropBonus||0);
  if(Math.random()<dropChance){
    const roll=Math.random();let d;
    let flTier=Math.min(4,Math.floor((G.floor-1)/1.2));
    if(mods.lootCurse)flTier=Math.max(0,flTier-1);
    if(roll<.35)d={...CONSUMABLES[Math.floor(Math.random()*4)],uid:Math.random().toString(36).slice(2)};
    else if(roll<.6)d=rollAffix(makeItem('weapon',Math.max(0,flTier-1+Math.floor(Math.random()*2)),Math.floor(Math.random()*4)));
    else if(roll<.8)d=rollAffix(makeItem('armor',Math.max(0,flTier-1),0));
    else d=rollAffix(makeItem('ring',Math.max(0,Math.min(4,flTier-1)),0));
    pushDrop({...d,x:en.x,y:en.y,uid:Math.random().toString(36).slice(2)});
    const affixTxt=d.affixName?` [${d.affixEmoji}${d.affixName}]`:'';
    addLog(`✨ Dropped ${d.emoji} ${d.name}${d.tier?' [T'+d.tier+']':''}${affixTxt}!`,'loot');
  }
  renderMap();updateHUD();saveG();
}
function endCombat(){G.inCombat=false;G.currentEnemy=null;combatBusy=false;document.getElementById('combatov').classList.remove('active');updateHUD();renderMap();}
