// ═══════════════════════════════
// ITEMS
// ═══════════════════════════════
function pickupItem(it){
  const isMat=it.type==='material';
  const isGold=it.type==='gold';

  if(!isGold){
    // Materials and gear use separate slot pools
    const gearCount=G.inventory.filter(i=>i.type!=='material').length;
    const matCount=G.inventory.filter(i=>i.type==='material').length;
    const matCap=100; // materials have their own large cap

    if(isMat&&matCount>=matCap){
      addLog('Material bag full! (max 20 types)','info');return;
    }
    if(!isMat&&gearCount>=G.maxInvSlots){
      addLog(`Gear bag full! (${gearCount}/${G.maxInvSlots} slots) — sell or drop something.`,'damage');return;
    }
  }

  if(isGold){
    const g=it.effect.gold,fg=G.player.perks?.goldBoost?Math.floor(g*(1+G.player.perks.goldBoost)):g;
    G.player.gold+=fg;addLog(`💰 Got ${fg} gold!`,'loot');
  }else{
    G.inventory.push(it);
    const affixNote=it.affixName?` [${it.affixEmoji}${it.affixName}]`:'';
    addLog(`Picked up ${it.emoji} ${it.name}${it.tier?' [T'+it.tier+']':''}${affixNote}!`,'loot');
    if(it.isHp||it.isMp)addLog(`🧪 Q=HP pot, E=MP pot`,'info');
  }
  // Zone-aware item removal
  if(G.inZone&&G.zoneItems?.[G.inZone]){
    G.zoneItems[G.inZone]=G.zoneItems[G.inZone].filter(i=>i.uid!==it.uid);
  }else{
    G.items=G.items.filter(i=>i.uid!==it.uid);
  }
  updateHUD();renderMap();saveG();
}

function fmtSt(it){
  if(!it)return'';
  if(it.type==='material')return`🧰 Crafting material • Rarity: ${'★'.repeat(it.rarity||1)}`;
  if(!it.effect)return'';
  const e=it.effect,ps=[];
  if(e.hp)ps.push(`❤+${e.hp}`);if(e.mp)ps.push(`✨+${e.mp}`);
  if(e.hpFull)ps.push('❤ FULL');if(e.mpFull)ps.push('✨ FULL');
  if(e.atk)ps.push(`⚔️+${e.atk}`);if(e.def)ps.push(`🛡️+${e.def}`);
  if(e.spd)ps.push(`⚡+${e.spd}`);if(e.crit)ps.push(`🎯+${e.crit}%`);
  if(e.gold)ps.push(`💰+${e.gold}`);if(e.bomb)ps.push(`💣${e.bomb}dmg`);
  if(e.elixirAtk)ps.push(`⚔️+${e.elixirAtk} (floor)`);
  if(e.elixirDef)ps.push(`🛡️+${e.elixirDef} (floor)`);
  if(e.elixirSpd)ps.push(`⚡+${e.elixirSpd} (floor)`);
  if(e.elixirCrit)ps.push(`🎯+${e.elixirCrit}% (floor)`);
  if(e.chaos)ps.push('🌀 CHAOS effect');
  return ps.join(' ')||'Mysterious';
}

function showIP(it){
  // Keep current panel (e.g. inventory) open so closing item popup returns
  // the player to the same context instead of collapsing all UI.
  CI=it;
  document.getElementById('ipic').innerHTML=buildItemSpriteHTML(it,44,'item-popup');
  document.getElementById('ipnm').textContent=it.name;
  const tierEl=document.getElementById('ipti');
  const affixBadge=it.affix?`<br>${getAffixBadge(it)}`:'';
  tierEl.innerHTML=it.tier?`<span class="tier-${it.tier}">[T${it.tier} — ${TIER_NAMES[it.tier]||''}]</span>${affixBadge}`:affixBadge;
  document.getElementById('ipds').textContent=it.desc||'';
  const statsText=fmtSt(it)+(it.affixDesc?`\n• ${it.affixDesc}`:'');
  document.getElementById('ipst').textContent=statsText;
  const btns=document.getElementById('ipbtns');btns.innerHTML='';
  const isMat=it.type==='material';
  const isElixir=it.type==='elixir';
  const useLabel=it.isHp||it.isMp||it.type==='consumable'||isElixir?'🧪 USE':(isMat?null:'⚔️ EQUIP');
  const useBtn=useLabel?`<button class="icbtn g" onclick="useItem(CI)">${useLabel}</button>`:'';
  const sellPrice=Math.floor((it.value||20)*.5);
  const sellBtn=`<button class="icbtn y" onclick="sellItemFromPopup(CI)">💸 SELL (${sellPrice}g)</button>`;
  const fuseBtn=`<button class="icbtn" style="border-color:var(--purple);color:var(--purple)" onclick="sendToFuse(CI)">⚗️ FUSE</button>`;
  const closeBtn=`<button class="icbtn" onclick="closeIP()">❌</button>`;
  const dropBtn=`<button class="icbtn r" onclick="dropItem(CI)">🗑️</button>`;
  btns.innerHTML=useBtn+sellBtn+fuseBtn+getDismantleBtn(it)+closeBtn+dropBtn;
  document.getElementById('itempop').classList.add('active');
}
function closeIP(){document.getElementById('itempop').classList.remove('active');CI=null;}
function sellItemFromPopup(it){if(!it)return;if(it===G.equippedWeapon||it===G.equippedArmor||it===G.equippedRing){addLog('Unequip before selling!','info');return;}const p=Math.floor((it.value||20)*.5);G.player.gold+=p;G.inventory.splice(G.inventory.indexOf(it),1);addLog(`💸 Sold ${it.emoji} ${it.name} for ${p}g`,'shop');spPt(window.innerWidth*.5,window.innerHeight*.6,'#ffd700',8,{speed:3,spread:4,grav:.1,decay:.05,ch:'💰'});closeIP();updateHUD();saveG();}
function sendToFuse(it){if(!it)return;closeIP();setFuseSlot(1,it);togglePanel('fuse');}

function useItem(it){
  if(!it)return;const p=G.player;
  if(it.isHp||it.isMp||it.type==='consumable'||it.type==='elixir'){applyEffect(it);G.inventory.splice(G.inventory.indexOf(it),1);addLog(`Used ${it.emoji}!`,'heal');}
  else if(it.type==='weapon'){
    if(G.equippedWeapon){p.atk-=G.equippedWeapon.effect.atk||0;if(G.equippedWeapon.effect.crit)p.crit-=G.equippedWeapon.effect.crit;if(G.equippedWeapon.effect.def)p.def-=G.equippedWeapon.effect.def||0;applyAffixOnEquip(G.equippedWeapon,false);}
    G.equippedWeapon=it;p.atk+=it.effect.atk||0;if(it.effect.crit)p.crit+=it.effect.crit;if(it.effect.def)p.def+=it.effect.def||0;applyAffixOnEquip(it,true);
    addLog(`Equipped ${it.emoji} ${it.name}${it.affixName?' ['+it.affixEmoji+it.affixName+']':''}!`,'info');
  }else if(it.type==='armor'){
    if(G.equippedArmor){const oe=G.equippedArmor.effect;p.def-=oe.def||0;if(oe.spd)p.spd-=oe.spd;if(oe.crit)p.crit-=oe.crit;applyAffixOnEquip(G.equippedArmor,false);}
    G.equippedArmor=it;const ae=it.effect;p.def+=ae.def||0;if(ae.spd)p.spd+=ae.spd;if(ae.crit)p.crit+=ae.crit;applyAffixOnEquip(it,true);
    addLog(`Equipped ${it.emoji} ${it.name}!`,'info');
  }
  else if(it.type==='ring'){if(G.equippedRing){const re=G.equippedRing.effect;if(re.spd)p.spd-=re.spd;if(re.crit)p.crit-=re.crit;if(re.atk)p.atk-=re.atk;}G.equippedRing=it;const e=it.effect;if(e.spd)p.spd+=e.spd;if(e.crit)p.crit+=e.crit;if(e.atk)p.atk+=e.atk;addLog(`Equipped ${it.emoji}!`,'info');}
  updateHUD();closeIP();saveG();
}
function applyEffect(it){
  const p=G.player,e=it.effect,b=p.perks.potBoost||0;
  const mods=getModEffects();
  const healMult=mods.healMult||1;
  if(e.hp)p.hp=Math.min(p.maxHp,p.hp+Math.floor(e.hp*(1+b)*healMult));
  if(e.hpFull)p.hp=p.maxHp;if(e.mp)p.mp=Math.min(p.maxMp,p.mp+e.mp);if(e.mpFull)p.mp=p.maxMp;
  if(e.gold)p.gold+=p.perks.goldBoost?Math.floor(e.gold*(1+p.perks.goldBoost)):e.gold;
  if(e.bomb&&G.currentEnemy){const bd=Math.floor(e.bomb*(1+(p.perks.bombBoost||0)));G.currentEnemy.hp-=bd;clog(`💣 BOMB! ${bd}!`,'#ff8800');doVfx('bomb');hfl('enemy');}
  if(e.elixirAtk){p.atk+=e.elixirAtk;G.elixirBuffs=G.elixirBuffs||[];G.elixirBuffs.push({stat:'atk',val:e.elixirAtk});addLog(`💥 +${e.elixirAtk} ATK (elixir)!`,'heal');}
  if(e.elixirDef){p.def+=e.elixirDef;G.elixirBuffs=G.elixirBuffs||[];G.elixirBuffs.push({stat:'def',val:e.elixirDef});addLog(`🛡️ +${e.elixirDef} DEF (elixir)!`,'heal');}
  if(e.elixirSpd){p.spd+=e.elixirSpd;G.elixirBuffs=G.elixirBuffs||[];G.elixirBuffs.push({stat:'spd',val:e.elixirSpd});addLog(`⚡ +${e.elixirSpd} SPD (elixir)!`,'heal');}
  if(e.elixirCrit){p.crit+=e.elixirCrit;G.elixirBuffs=G.elixirBuffs||[];G.elixirBuffs.push({stat:'crit',val:e.elixirCrit});addLog(`⚡ +${e.elixirCrit} CRIT (elixir)!`,'heal');}
  if(e.chaos){
    const outcomes=[
      ()=>{p.hp=p.maxHp;addLog('🌀 Chaos: Full heal!','heal');},
      ()=>{p.mp=p.maxMp;addLog('🌀 Chaos: Full MP!','heal');},
      ()=>{p.atk+=15;addLog('🌀 Chaos: +15 ATK!','heal');},
      ()=>{p.hp=Math.max(1,p.hp-30);addLog('🌀 Chaos: Ouch. -30 HP.','damage');},
      ()=>{p.gold+=100;addLog('🌀 Chaos: +100 gold!','loot');},
      ()=>{p.crit+=25;addLog('🌀 Chaos: +25 CRIT!','heal');},
    ];
    outcomes[Math.floor(Math.random()*outcomes.length)]();
  }
  updateHUD();
}
function dropItem(it){
  if(!it)return;const p=G.player;
  if(it===G.equippedWeapon){p.atk-=it.effect.atk||0;if(it.effect.crit)p.crit-=it.effect.crit;if(it.effect.def)p.def-=it.effect.def||0;applyAffixOnEquip(it,false);G.equippedWeapon=null;}
  if(it===G.equippedArmor){const ae=it.effect;p.def-=ae.def||0;if(ae.spd)p.spd-=ae.spd;if(ae.crit)p.crit-=ae.crit;applyAffixOnEquip(it,false);G.equippedArmor=null;}
  if(it===G.equippedRing){const e=it.effect;if(e.spd)p.spd-=e.spd;if(e.crit)p.crit-=e.crit;if(e.atk)p.atk-=e.atk;G.equippedRing=null;}
  G.inventory.splice(G.inventory.indexOf(it),1);
  const dropped={...it,x:p.x,y:p.y,uid:Math.random().toString(36).slice(2)};
  if(G.inZone&&G.zoneItems?.[G.inZone]){
    G.zoneItems[G.inZone].push(dropped);
  }else{
    G.items.push(dropped);
  }
  addLog(`Dropped ${it.emoji}.`,'info');updateHUD();renderMap();closeIP();saveG();
}

// ═══════════════════════════════
// LEVEL UP
// ═══════════════════════════════
function showLU(){
  const p=G.player;
  // ── AUTOMATIC STAT GAINS on every level-up ──
  const cls=p.classType||'warrior';
  const gains={
    warrior:{atk:4,def:2,maxHp:12},
    mage:   {atk:3,maxMp:15,crit:1},
    rogue:  {atk:3,spd:1,crit:2},
    paladin:{atk:2,def:3,maxHp:10},
  }[cls]||{atk:3,def:1,maxHp:8};

  Object.entries(gains).forEach(([stat,val])=>{
    if(stat==='maxHp'){p.maxHp+=val;p.hp=Math.min(p.maxHp,p.hp+val);}
    else if(stat==='maxMp'){p.maxMp+=val;p.mp=Math.min(p.maxMp,p.mp+val);}
    else p[stat]+=val;
  });
  const gainStr=Object.entries(gains).map(([k,v])=>`+${v} ${k}`).join(', ');
  addLog(`🎉 LVL ${p.level}! Auto: ${gainStr}`,'loot');

  // Show 3 random perk choices for bonus selection
  document.getElementById('ludesc').textContent=`Level ${p.level} — Pick a bonus!`;
  const perks=[...PERKS].sort(()=>Math.random()-.5).slice(0,3);
  const el=document.getElementById('luperks');el.innerHTML='';
  perks.forEach(pk=>{
    const b=document.createElement('button');b.className='pkchoice';
    b.innerHTML=`<span class="pn">${pk.name}</span><span class="pd">${pk.desc}</span>`;
    b.onclick=()=>applyPerk(pk);
    el.appendChild(b);
  });
  document.getElementById('luov').classList.add('active');
  sfx('rgba(170,68,255,.3)',400);
  const c=document.getElementById('combatov').classList.contains('active')?gctr('player'):{x:window.innerWidth/2,y:window.innerHeight/2};
  spPt(c.x,c.y,'#aa44ff',20,{speed:4,spread:5,grav:0,decay:.03});
  spRi(c.x,c.y,'#aa44ff');
}
function applyPerk(pk){
  const p=G.player,e=pk.effect;
  if(e.atk)p.atk+=e.atk;if(e.def)p.def+=e.def;if(e.spd)p.spd+=e.spd;if(e.crit)p.crit+=e.crit;
  if(e.maxHp){p.maxHp+=e.maxHp;p.hp+=e.maxHp;}if(e.maxMp){p.maxMp+=e.maxMp;p.mp+=e.maxMp;}
  if(e.lifesteal)p.perks.lifesteal=(p.perks.lifesteal||0)+e.lifesteal;
  if(e.potBoost)p.perks.potBoost=(p.perks.potBoost||0)+e.potBoost;
  if(e.goldBoost)p.perks.goldBoost=(p.perks.goldBoost||0)+e.goldBoost;
  if(e.bombBoost)p.perks.bombBoost=(p.perks.bombBoost||0)+e.bombBoost;
  if(e.cannibal)p.perks.cannibal=e.cannibal;
  G.perkList.push(pk.name);addLog(`✨ Perk: ${pk.name}!`,'loot');
  document.getElementById('luov').classList.remove('active');updateHUD();saveG();
}

// ═══════════════════════════════
// FLOOR
// ═══════════════════════════════
function descend(){
  const p=G.player;
  const cells=getCells();
  if(cells[p.y]?.[p.x]?.entity!=='stairs'){addLog('Step onto the stairs first!','info');return;}
  // Stairs are now optional shortcut anchors into deeper portal floors.
  if(G.inZone){
    addLog('🜃 Hidden stairs detected — diving into a risky subfloor.','funny');
    enterRandomSubfloor();
    return;
  }
  const dirs=['N','S','E','W'];
  const dir=dirs[Math.floor(Math.random()*dirs.length)];
  addLog(`⬇️ Nexus descent anchor activated — routing to ${PORTAL_ZONES[dir].name}.`,'info');
  enterPortal(dir);
}

// ═══════════════════════════════
// LOG
// ═══════════════════════════════
function addLog(tx,type='info'){const l=document.getElementById('log-list'),d=document.createElement('div');d.className=`le ${type}`;d.textContent=tx;l.appendChild(d);while(l.children.length>100)l.removeChild(l.firstChild);if(openPanel==='log')l.scrollTop=l.scrollHeight;}

// ═══════════════════════════════
// FLOATERS
// ═══════════════════════════════
function spawnDmg(v,col='#ff4444',isH=false){
  const el=document.createElement('div');el.className='dmgf';el.style.color=col;el.textContent=isH?`+${v}`:`-${v}`;
  const cin=document.getElementById('combatov').classList.contains('active')?(isH?gctr('player'):gctr('enemy')):{x:window.innerWidth/2+(Math.random()-.5)*60,y:window.innerHeight*.4};
  el.style.left=`${cin.x+(Math.random()-.5)*40}px`;el.style.top=`${cin.y+(Math.random()-.5)*20}px`;
  document.body.appendChild(el);setTimeout(()=>el.remove(),1000);
}

// ═══════════════════════════════
// GAME OVER
// ═══════════════════════════════
function gameOver(killer){
  const p=G.player;const ep=EPITAPHS[Math.floor(Math.random()*EPITAPHS.length)];
  document.getElementById('gotitle').textContent='💀 YOU DIED 💀';
  document.getElementById('gotitle').style.color='var(--red)';
  document.getElementById('goep').textContent=`Killed by ${killer}. ${ep}`;
  document.getElementById('gost').innerHTML=`Floor: ${G.floor} • Kills: ${G.kills} • Gold: ${G.goldTotal}g • Level: ${p.level}`;
  if(typeof saveNow==='function')saveNow(false);
  if(typeof clearSaves==='function')clearSaves(true,true);
  else localStorage.removeItem(SK);
  endCombat();
  sfx('rgba(200,0,0,.6)',500);
  setTimeout(()=>{document.getElementById('gov').style.display='flex';},600);
  setTimeout(()=>showRunSummary(false),1800);
}
function showWin(){showRunSummary(true);}

// ═══════════════════════════════
// BLACKSMITH
// ═══════════════════════════════
function openBlacksmith(){
  const p=G.player;
  const el=document.getElementById('bs-content');
  if(!el)return;
  document.getElementById('bs-gold').textContent=`💰 ${p.gold}g`;
  // Group blueprints by category
  const cats={};
  BLUEPRINTS.forEach(bp=>{
    if(!cats[bp.cat])cats[bp.cat]=[];
    cats[bp.cat].push(bp);
  });
  let html='';
  for(const [cat,bps] of Object.entries(cats)){
    html+=`<div class="shop-section-title" style="margin-top:10px">${getCatEmoji(cat)} ${cat}s</div>`;
    bps.forEach(bp=>{
      const canCraft=canCraftBP(bp);
      const missing=getMissingMats(bp);
      const afford=p.gold>=bp.goldCost;
      const ready=canCraft&&afford;
      html+=`<div class="bp-card ${ready?'bp-ready':''}" onclick="${ready?`craftItem('${bp.id}')`:''}" style="opacity:${ready||canCraft?'1':'.65'}">
        <div class="bp-header">
          <span class="bp-icon">${buildItemSpriteHTML(bp,24,'item-inline')}</span>
          <div class="bp-info">
            <div class="bp-name">${bp.name} <span class="tier-${bp.tier}">[T${bp.tier}]</span></div>
            <div class="bp-stats">${fmtSt(bp)}</div>
          </div>
          <div class="bp-cost ${afford?'':'cant-afford'}">${bp.goldCost}g</div>
        </div>
        <div class="bp-mats">${bp.mats.map(m=>{
          const mat=MATERIALS[m.id],have=countMat(m.id);
          const ok=have>=m.qty;
          return`<span class="mat-tag ${ok?'mat-ok':'mat-missing'}">${buildItemSpriteHTML(mat,12,'item-inline item-mat')} ${mat?.name||m.id} ${have}/${m.qty}</span>`;
        }).join('')}</div>
        ${!ready?`<div class="bp-hint">${!afford?'Not enough gold. ':''}${missing.length?'Missing: '+missing.join(', '):''}</div>`:'<div class="bp-hint" style="color:var(--green)">✓ Ready to craft!</div>'}
      </div>`;
    });
  }
  el.innerHTML=html;
}

function getCatEmoji(cat){
  return{Sword:'⚔️',Mace:'🔨',Spear:'🗡️',Staff:'🪄',Armor:'🛡️',Boots:'🥾',Helmet:'⛑️',Ring:'💍'}[cat]||'✨';
}

function countMat(id){
  return G.inventory.filter(i=>i.type==='material'&&i.id===id).length;
}

function getMissingMats(bp){
  const missing=[];
  bp.mats.forEach(m=>{
    const have=countMat(m.id);
    if(have<m.qty)missing.push(`${MATERIALS[m.id]?.emoji||'?'}${MATERIALS[m.id]?.name} (${m.qty-have} more)`);
  });
  return missing;
}

function canCraftBP(bp){
  return bp.mats.every(m=>countMat(m.id)>=m.qty);
}

function craftItem(bpId){
  const bp=BLUEPRINTS.find(b=>b.id===bpId);
  if(!bp)return;
  const p=G.player;
  if(!canCraftBP(bp)){addLog('Missing materials!','damage');return;}
  if(p.gold<bp.goldCost){addLog(`Need ${bp.goldCost}g!`,'damage');return;}
  if(G.inventory.length>=G.maxInvSlots){addLog('Inventory full!','damage');return;}
  // Consume materials
  bp.mats.forEach(m=>{
    let qty=m.qty;
    G.inventory=G.inventory.filter(i=>{
      if(qty>0&&i.type==='material'&&i.id===m.id){qty--;return false;}
      return true;
    });
  });
  p.gold-=bp.goldCost;
  // Create the crafted item
  const crafted={...bp,uid:Math.random().toString(36).slice(2),crafted:true};
  delete crafted.mats;delete crafted.goldCost;delete crafted.cat;delete crafted.desc;
  crafted.desc=`Crafted at the Blacksmith. ${bp.desc}`;
  G.inventory.push(crafted);
  addLog(`🔨 Crafted ${bp.emoji} ${bp.name} [T${bp.tier}]!`,'loot');
  sfx('rgba(255,140,0,.3)',400);
  spPt(window.innerWidth*.5,window.innerHeight*.5,'#ff8800',18,{speed:4,spread:5,grav:-.02,decay:.04});
  spRi(window.innerWidth*.5,window.innerHeight*.5,'#ffaa00');
  updateHUD();openBlacksmith();saveG();
}

// ═══════════════════════════════
// ALCHEMIST
// ═══════════════════════════════
function openAlchemist(){
  const p=G.player;
  const el=document.getElementById('alch-content');
  if(!el)return;
  document.getElementById('alch-gold').textContent=`💰 ${p.gold}g`;
  const isMage=p.classType==='mage';
  const recipes=ALCH_RECIPES.filter(r=>!r.mageOnly||isMage);
  let html='';
  if(!isMage){
    html+=`<div style="background:#0a0a1a;border:2px solid #2a1a3a;border-radius:4px;padding:8px;margin-bottom:10px;font-family:'VT323',monospace;font-size:13px;color:#aa88cc">
      🔮 Chaos Wizards get exclusive mage-only recipes! Some things are available to all heroes.
    </div>`;
  }
  // Group by type
  const potions=recipes.filter(r=>!r.mageOnly);
  const mageRecipes=recipes.filter(r=>r.mageOnly);
  if(potions.length){
    html+=`<div class="shop-section-title">🧪 BREWS (All Classes)</div>`;
    potions.forEach(r=>html+=renderRecipe(r,p));
  }
  if(mageRecipes.length){
    html+=`<div class="shop-section-title" style="margin-top:10px">🔮 MAGE RECIPES (Chaos Wizard Only)</div>`;
    mageRecipes.forEach(r=>html+=renderRecipe(r,p));
  }
  el.innerHTML=html;
}

function renderRecipe(r,p){
  const canBrew=r.mats.every(m=>countMat(m.id)>=m.qty);
  const afford=p.gold>=r.goldCost;
  const ready=canBrew&&afford;
  return`<div class="bp-card ${ready?'bp-ready':''}" onclick="${ready?`brewRecipe('${r.id}')`:''}" style="opacity:${ready||canBrew?'1':'.65'}">
    <div class="bp-header">
      <span class="bp-icon">${buildItemSpriteHTML(r.result||r,24,'item-inline')}</span>
      <div class="bp-info">
        <div class="bp-name">${r.name}${r.mageOnly?` <span style="color:#aa44ff;font-size:6px">MAGE</span>`:''}</div>
        <div class="bp-stats" style="color:var(--gray);font-family:'VT323',monospace;font-size:12px">${r.desc}</div>
      </div>
      <div class="bp-cost ${afford?'':'cant-afford'}">${r.goldCost}g</div>
    </div>
    <div class="bp-mats">${r.mats.map(m=>{
      const mat=MATERIALS[m.id],have=countMat(m.id);
      const ok=have>=m.qty;
      return`<span class="mat-tag ${ok?'mat-ok':'mat-missing'}">${buildItemSpriteHTML(mat,12,'item-inline item-mat')} ${mat?.name||m.id} ${have}/${m.qty}</span>`;
    }).join('')}</div>
    ${ready?'<div class="bp-hint" style="color:var(--green)">✓ Ready to brew!</div>':''}
  </div>`;
}

function brewRecipe(recipeId){
  const r=ALCH_RECIPES.find(x=>x.id===recipeId);
  if(!r)return;
  const p=G.player;
  if(r.mageOnly&&p.classType!=='mage'){addLog('Only Chaos Wizards can brew this!','damage');return;}
  if(!r.mats.every(m=>countMat(m.id)>=m.qty)){addLog('Missing ingredients!','damage');return;}
  if(p.gold<r.goldCost){addLog(`Need ${r.goldCost}g!`,'damage');return;}
  if(G.inventory.length>=G.maxInvSlots){addLog('Inventory full!','damage');return;}
  // Consume mats
  r.mats.forEach(m=>{
    let qty=m.qty;
    G.inventory=G.inventory.filter(i=>{
      if(qty>0&&i.type==='material'&&i.id===m.id){qty--;return false;}
      return true;
    });
  });
  p.gold-=r.goldCost;
  // Handle transmutation (material result)
  let result;
  if(r.result.type==='material'){
    result={...makeMaterial(r.result.matId),desc:r.result.desc};
  }else{
    result={...r.result,uid:Math.random().toString(36).slice(2)};
  }
  G.inventory.push(result);
  addLog(`⚗️ Brewed: ${r.emoji} ${r.name}!`,'loot');
  sfx('rgba(170,68,255,.35)',400);
  spPt(window.innerWidth*.5,window.innerHeight*.5,'#aa44ff',16,{speed:4,spread:5,grav:-.05,decay:.04});
  spRi(window.innerWidth*.5,window.innerHeight*.5,'#7722ff');
  updateHUD();openAlchemist();saveG();
}

// ═══════════════════════════════
// ───── DOOM CORRUPTION SYSTEM ─────
// ═══════════════════════════════

// Corruption thresholds — each triggers a new modifier stack
const DOOM_THRESHOLDS = [
  {pct:20, name:'DOOM LV.1', emoji:'🟠', color:'#ff8844'},
  {pct:40, name:'DOOM LV.2', emoji:'🔴', color:'#ff4422'},
  {pct:60, name:'DOOM LV.3', emoji:'⭐',  color:'#ff2266'},
  {pct:80, name:'DOOM LV.4', emoji:'💥',  color:'#ff00ff'},
  {pct:100,name:'DOOM LV.5 — TOTAL DOOM', emoji:'🌑', color:'#ff0044'},
];

// All possible dungeon modifiers — data-driven
const ALL_MODIFIERS = [
  {id:'greedy_shops',   name:'GREEDY SHOPS',    emoji:'💸', desc:'Shop prices +25%.',    effect:{shopMult:1.25}, positive:false},
  {id:'heal_curse',     name:'HEAL CURSE',       emoji:'🩸', desc:'All healing -35%.',   effect:{healMult:0.65}, positive:false},
  {id:'enemies_explode',name:'VOLATILE FOES',    emoji:'💥', desc:'Enemies explode on death, dealing 15% max HP to you.', effect:{enemyExplode:true}, positive:false},
  {id:'slippery',       name:'SLIPPERY FLOORS',  emoji:'🧊', desc:'10% chance per move to slip an extra tile.', effect:{slippery:true}, positive:false},
  {id:'fusion_tax',     name:'FUSION TAX',       emoji:'✖️', desc:'Fusion costs 2× gold but 20% chance to jump +1 extra tier.', effect:{fusionTax:true}, positive:false},
  {id:'enemy_regen',    name:'ENEMY REGEN',      emoji:'🔄', desc:'Enemies regain 3% max HP each turn.', effect:{enemyRegen:true}, positive:false},
  {id:'cursed_loot',    name:'CURSED LOOT',      emoji:'🔻', desc:'All dropped items are 1 tier lower.',  effect:{lootCurse:true}, positive:false},
  {id:'no_flee',        name:'INESCAPABLE',      emoji:'🚫', desc:'Cannot flee from combat.',            effect:{noFlee:true}, positive:false},
  {id:'mp_drain',       name:'MANA DRAIN',       emoji:'🔵', desc:'Lose 5 MP per combat action.',        effect:{mpDrain:5}, positive:false},
  {id:'elite_surge',    name:'ELITE SURGE',      emoji:'⚔️', desc:'All enemies become Elite (+50% HP, +25% ATK, better loot).', effect:{eliteSurge:true}, positive:false},
  // Positive (silver lining) modifiers — appear at high corruption
  {id:'doom_loot',      name:'DOOM REWARD',      emoji:'🏆', desc:'Kill rewards +50% gold and XP.', effect:{killBoost:1.5}, positive:true},
  {id:'power_surge',    name:'POWER SURGE',      emoji:'⚡', desc:'You deal +20% damage.', effect:{dmgBoost:1.2}, positive:true},
  {id:'blood_pact',     name:'BLOOD PACT',       emoji:'🩸', desc:'Gain 15% lifesteal.', effect:{lifeStealBoost:.15}, positive:true},
];

// Get active modifier effects as a merged object
function getModEffects(){
  if(!G||!G.activeModifiers)return{};
  const out={};
  G.activeModifiers.forEach(id=>{
    const m=ALL_MODIFIERS.find(x=>x.id===id);
    if(m)Object.assign(out,m.effect);
  });
  return out;
}

function getDoomLevel(){
  if(!G)return 0;
  const pct=G.corruption||0;
  let lvl=0;
  DOOM_THRESHOLDS.forEach((t,i)=>{if(pct>=t.pct)lvl=i+1;});
  return lvl;
}

// Add corruption and trigger modifiers if threshold crossed
function addCorruption(amount){
  if(!G)return;
  const prev=G.corruption||0;
  const next=Math.min(100,prev+amount);
  G.corruption=next;

  // Check threshold crossings
  DOOM_THRESHOLDS.forEach((t,i)=>{
    if(prev<t.pct&&next>=t.pct){
      triggerDoomLevel(i);
    }
  });
  updateDoomBar();
}

function triggerDoomLevel(idx){
  const thresh=DOOM_THRESHOLDS[idx];
  addLog(`${thresh.emoji} ${thresh.name} REACHED!`,'damage');
  sfx('rgba(255,0,50,.5)',500);
  spPt(window.innerWidth*.5,window.innerHeight*.4,'#ff2266',25,{speed:5,spread:6,grav:.05,decay:.03});
  spRi(window.innerWidth*.5,window.innerHeight*.4,'#ff0044');
  document.getElementById('game-screen').classList.add('bigshake');
  setTimeout(()=>document.getElementById('game-screen').classList.remove('bigshake'),500);

  // Inject a new modifier (pick random unused, prefer negative at low doom, mix positive later)
  if(!G.activeModifiers)G.activeModifiers=[];
  const used=new Set(G.activeModifiers);
  const pool=ALL_MODIFIERS.filter(m=>{
    if(used.has(m.id))return false;
    if(m.positive)return idx>=3; // positive modifiers only at doom 4+
    return true;
  });
  if(pool.length){
    const pick=pool[Math.floor(Math.random()*pool.length)];
    if(G.activeModifiers.length>=3){G.activeModifiers.shift();} // max 3 active
    G.activeModifiers.push(pick.id);
    addLog(`💥 NEW MODIFIER: ${pick.emoji} ${pick.name} — ${pick.desc}`,'damage');
    showModifierBanner(pick);
  }
  updateDoomBar();
  updateModBar();
}

function showModifierBanner(mod){
  const b=document.createElement('div');
  b.style.cssText=`position:fixed;top:20%;left:50%;transform:translateX(-50%);background:#1a0010;border:3px solid #ff2266;color:#ff6688;font-family:'Press Start 2P',monospace;font-size:9px;padding:12px 20px;z-index:520;text-align:center;border-radius:6px;box-shadow:0 0 30px rgba(255,34,102,.4);max-width:90vw;`;
  b.innerHTML=`${mod.emoji} ${mod.name}<br><span style="font-size:7px;color:#ff9999;font-family:'VT323',monospace;font-size:15px">${mod.desc}</span>`;
  document.body.appendChild(b);
  setTimeout(()=>b.style.transition='opacity .5s',1200);
  setTimeout(()=>b.style.opacity='0',1700);
  setTimeout(()=>b.remove(),2200);
}

function updateDoomBar(){
  if(!G)return;
  const pct=G.corruption||0;
  const lvl=getDoomLevel();
  const colors=['#880033','#cc4400','#cc2222','#cc0044','#ff00ff'];
  const fills=['#660033,#cc0044,#ff2266','#884400,#cc6600,#ff8800','#660000,#cc0000,#ff2222','#660033,#cc0044,#ff00aa','#660066,#aa00aa,#ff00ff'];
  const fill=document.getElementById('doom-fill');
  const lbl=document.getElementById('doom-label');
  if(fill){fill.style.width=pct+'%';fill.style.background=`linear-gradient(90deg,${fills[Math.min(lvl,4)]})`;fill.style.boxShadow=`0 0 ${6+lvl*3}px ${colors[Math.min(lvl,4)]}`;}
  if(lbl){const lvlNames=['','LV1','LV2','LV3','LV4','MAX'];lbl.textContent=`☠ ${pct}%${lvl>0?' '+lvlNames[lvl]:''}`;lbl.style.color=lvl>0?colors[lvl-1]:'#ff2266';}
}

function updateModBar(){
  if(!G)return;
  const bar=document.getElementById('mod-bar');
  if(!bar)return;
  const mods=G.activeModifiers||[];
  if(!mods.length){bar.style.display='none';return;}
  bar.style.display='block';
  bar.innerHTML=mods.map(id=>{
    const m=ALL_MODIFIERS.find(x=>x.id===id);
    if(!m)return'';
    return`<span class="mod-badge ${m.positive?'positive':''}">${m.emoji} ${m.name}</span>`;
  }).join('');
}

function openDoomPanel(){
  const el=document.getElementById('doom-panel-content');
  if(!el)return;
  const pct=G.corruption||0;
  const lvl=getDoomLevel();
  const mods=G.activeModifiers||[];
  let html=`<div class="doom-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <div style="font-size:8px;color:#ff2266">☠ CORRUPTION: ${pct}%</div>
      <div style="font-size:7px;color:#ff6688">Doom Level: ${lvl}/5</div>
    </div>
    <div style="background:#1a0010;border-radius:4px;height:10px;overflow:hidden;margin-bottom:8px;">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#660033,#ff2266);transition:width .3s;"></div>
    </div>
    <div style="font-family:'VT323',monospace;font-size:13px;color:var(--gray)">Higher corruption = better loot, stronger enemies, stranger rules.<br>Each 20% triggers a new dungeon modifier.</div>
  </div>`;

  if(mods.length){
    html+=`<div style="font-size:7px;color:#ff2266;margin-bottom:6px">💥 ACTIVE MODIFIERS (${mods.length}/3)</div>`;
    mods.forEach(id=>{
      const m=ALL_MODIFIERS.find(x=>x.id===id);
      if(!m)return;
      html+=`<div class="doom-card active-mod">
        <div style="font-size:8px;color:${m.positive?'#66ff66':'#ff6688'};margin-bottom:4px">${m.emoji} ${m.name}</div>
        <div style="font-family:'VT323',monospace;font-size:14px;color:var(--gray)">${m.desc}</div>
      </div>`;
    });
  }else{
    html+=`<div style="font-family:'VT323',monospace;font-size:15px;color:var(--gray);padding:8px;text-align:center">No active modifiers yet. Gain corruption to unlock doom!</div>`;
  }

  html+=`<div style="font-size:7px;color:#ff2266;margin-bottom:6px;margin-top:10px">📍 UPCOMING THRESHOLDS</div>`;
  DOOM_THRESHOLDS.forEach(t=>{
    const reached=pct>=t.pct;
    html+=`<div class="doom-threshold ${reached?'reached':'upcoming'}">
      <span>${reached?'✓':t.emoji}</span>
      <span style="flex:1">${t.name} @ ${t.pct}%</span>
      ${reached?`<span style="color:#ff2266">ACTIVE</span>`:`<span>${t.pct-pct}% away</span>`}
    </div>`;
  });

  html+=`<div style="font-family:'VT323',monospace;font-size:13px;color:var(--gray);margin-top:12px;padding:8px;background:#080808;border-radius:4px;line-height:1.8">
    <div style="color:#ff2266;font-size:12px;margin-bottom:4px">📈 CORRUPTION SOURCES</div>
    Each floor: +15% • Each enemy killed: +1% • Boss kill: +8%<br>
    Floor milestone: +5% • Using chaos spells: +2%
  </div>`;

  el.innerHTML=html;
}

// ═══════════════════════════════
// ───── STATUS EFFECTS ─────
// ═══════════════════════════════
// status: {poison, burn, stun, frozen, holy} — counts of remaining turns

function applyStatus(target, status, stacks=1){
  if(!target.status)target.status={};
  target.status[status]=(target.status[status]||0)+stacks;
}

function tickStatusEnemy(en){
  if(!en.status)return;
  const logs=[];
  if(en.status.poison>0){const d=Math.max(1,Math.floor(en.maxHp*.06));en.hp-=d;en.status.poison--;logs.push(`☠️ ${en.name} poison ${d}!`);}
  if(en.status.burn>0){const d=Math.max(1,Math.floor(en.maxHp*.05)+5);en.hp-=d;en.status.burn--;logs.push(`🔥 ${en.name} burn ${d}!`);}
  if(en.status.frozen>0){en.status.frozen--;logs.push(`🧊 ${en.name} frozen!`);}
  logs.forEach(l=>clog(l,'#88ff44'));
}

function tickStatusPlayer(){
  const p=G.player;
  if(!p.status)return;
  if(p.status.poison>0){const d=Math.max(1,Math.floor(p.maxHp*.04));p.hp=Math.max(1,p.hp-d);p.status.poison--;clog(`☠️ You're poisoned! ${d} dmg`,'#88ff44');if(p.hp<=1&&p.status.poison>0){gameOver('Poison');return;}}
  if(p.status.burn>0){const d=4+Math.floor(Math.random()*4);p.hp=Math.max(1,p.hp-d);p.status.burn--;clog(`🔥 Burning! ${d} dmg`,'#ff8844');}
}

function getStatusBadges(entity){
  if(!entity.status)return'';
  const s=entity.status;
  const parts=[];
  if(s.poison>0)parts.push(`<span class="status-tag status-poison">☠${s.poison}</span>`);
  if(s.burn>0)parts.push(`<span class="status-tag status-burn">🔥${s.burn}</span>`);
  if(s.stun>0)parts.push(`<span class="status-tag status-stun">💫${s.stun}</span>`);
  if(s.frozen>0)parts.push(`<span class="status-tag status-frozen">🧊${s.frozen}</span>`);
  if(s.holy>0)parts.push(`<span class="status-tag status-holy">✨${s.holy}</span>`);
  return parts.join('');
}

// ═══════════════════════════════
// ───── AFFIXES SYSTEM ─────
// ═══════════════════════════════
const AFFIXES = [
  {id:'vampiric', name:'Vampiric', emoji:'🩸', desc:'Lifesteal 12% on hit.', cls:'affix-vampiric', apply:(it)=>{it.affix_effect={lifesteal:.12};}},
  {id:'thorns',   name:'Thorns',   emoji:'🌵', desc:'Reflect 15% dmg taken.', cls:'affix-thorns',   apply:(it)=>{it.affix_effect={thorns:.15};}},
  {id:'chaotic',  name:'Chaotic',  emoji:'🌀', desc:'Attacks have wild crits (double range).', cls:'affix-chaotic',apply:(it)=>{it.affix_effect={chaotic:true};}},
  {id:'holy',     name:'Holy',     emoji:'✨', desc:'Attacks may heal 8 HP.', cls:'affix-holy',    apply:(it)=>{it.affix_effect={holyStrike:.25};}},
  {id:'poison',   name:'Venomous', emoji:'☠️', desc:'Attacks apply 2 turns poison.', cls:'affix-poison',apply:(it)=>{it.affix_effect={poisonStrike:2};}},
  {id:'swift',    name:'Swift',    emoji:'⚡', desc:'+5 SPD while equipped.', cls:'affix-swift',  apply:(it)=>{it.affix_effect={spdBonus:5};}},
  {id:'runic',    name:'Runic',    emoji:'🔮', desc:'+20 Max MP while equipped.', cls:'affix-runic', apply:(it)=>{it.affix_effect={mpBonus:20};}},
  {id:'burning',  name:'Burning',  emoji:'🔥', desc:'Attacks apply 2 turns burn.', cls:'affix-chaotic', apply:(it)=>{it.affix_effect={burnStrike:2};}},
];

// Roll a random affix onto an item (only gear, not consumables)
function rollAffix(it){
  if(!it||it.type==='material'||it.type==='consumable'||it.isHp||it.isMp)return it;
  if(Math.random()>.35)return it; // 35% chance
  const aff=AFFIXES[Math.floor(Math.random()*AFFIXES.length)];
  it.affix=aff.id;
  it.affixName=aff.name;
  it.affixClass=aff.cls;
  it.affixDesc=aff.desc;
  it.affixEmoji=aff.emoji;
  aff.apply(it);
  return it;
}

function getAffixBadge(it){
  if(!it.affix)return'';
  return`<span class="affix-tag ${it.affixClass||''}">${it.affixEmoji||'✦'} ${it.affixName}</span>`;
}

// Apply affix effects during combat
function applyAffixOnHit(attacker, target, dmg){
  if(!attacker.affix_effect&&!G.equippedWeapon?.affix_effect)return dmg;
  const eff=(attacker===G.player?G.equippedWeapon?.affix_effect:null)||attacker.affix_effect||{};
  const p=G.player;

  if(eff.lifesteal){const ls=Math.floor(dmg*eff.lifesteal);p.hp=Math.min(p.maxHp,p.hp+ls);if(ls>0)clog(`🩸 Vampiric +${ls}HP`,'#ff4488');}
  if(eff.holyStrike&&Math.random()<eff.holyStrike){const h=8;p.hp=Math.min(p.maxHp,p.hp+h);clog(`✨ Holy Strike +${h}HP`,'#ffff44');}
  if(eff.poisonStrike&&target.status)applyStatus(target,'poison',eff.poisonStrike);
  if(eff.burnStrike&&target.status)applyStatus(target,'burn',eff.burnStrike);
  if(eff.chaotic&&Math.random()<.3){dmg=Math.floor(dmg*(1.5+Math.random()*2.5));clog(`🌀 Chaotic crit! ${dmg}!`,'#ffaa44');}
  return dmg;
}

function applyAffixOnEquip(it, equip=true){
  if(!it.affix_effect)return;
  const p=G.player,eff=it.affix_effect,m=equip?1:-1;
  if(eff.spdBonus)p.spd+=eff.spdBonus*m;
  if(eff.mpBonus){p.maxMp+=eff.mpBonus*m;if(equip)p.mp=Math.min(p.maxMp,p.mp+eff.mpBonus);}
}

// ═══════════════════════════════
// ───── META PROGRESSION ─────
// ═══════════════════════════════
const META_SK='doomed_meta_v1';

const META_UPGRADES = [
  {id:'inv_slots',   name:'BOTTOMLESS POCKETS', emoji:'🎒', desc:'+2 inventory slots per level. (Max +8)', maxLevel:4, baseCost:3, costPerLevel:3, apply:(lvl)=>({invBonus:lvl*2})},
  {id:'gold_gain',   name:'GOLD MAGNET',         emoji:'💰', desc:'+15% gold gain per level.', maxLevel:4, baseCost:4, costPerLevel:4, apply:(lvl)=>({goldBonus:lvl*.15})},
  {id:'drop_rate',   name:'LUCKY DROPS',          emoji:'🎁', desc:'+10% item drop rate per level.', maxLevel:3, baseCost:3, costPerLevel:5, apply:(lvl)=>({dropBonus:lvl*.10})},
  {id:'start_mat',   name:'STARTER KIT',          emoji:'🪨', desc:'Start each run with 2 crafting materials.', maxLevel:1, baseCost:5, costPerLevel:0, apply:(lvl)=>({startMat:lvl>0})},
  {id:'vendor_reroll',name:'MERCHANT BUDDY',      emoji:'🔁', desc:'Get 1 free shop reroll per run.', maxLevel:1, baseCost:6, costPerLevel:0, apply:(lvl)=>({vendorReroll:lvl>0})},
  {id:'start_potion', name:'MEDIC PACK',          emoji:'🧪', desc:'Start each run with 1 extra HP potion.', maxLevel:1, baseCost:4, costPerLevel:0, apply:(lvl)=>({startPotion:lvl>0})},
  {id:'corruption_slow',name:'DOOM RESISTANCE',  emoji:'☠️', desc:'-20% corruption gain per level.', maxLevel:3, baseCost:5, costPerLevel:6, apply:(lvl)=>({corruptionSlow:lvl*.2})},
  {id:'xp_boost',    name:'QUICK LEARNER',        emoji:'⭐', desc:'+15% XP gain per level.', maxLevel:3, baseCost:3, costPerLevel:4, apply:(lvl)=>({xpBonus:lvl*.15})},
];

function loadMeta(){
  try{return JSON.parse(localStorage.getItem(META_SK))||{shards:0,upgrades:{}};}catch(e){return{shards:0,upgrades:{}};}
}
function saveMeta(meta){
  try{localStorage.setItem(META_SK,JSON.stringify(meta));}catch(e){}
}
function getMetaBonus(){
  const meta=loadMeta();
  const bonus={};
  META_UPGRADES.forEach(u=>{
    const lvl=meta.upgrades[u.id]||0;
    if(lvl>0)Object.assign(bonus,u.apply(lvl));
  });
  return bonus;
}
function getUpgradeCost(u, currentLevel){
  return u.baseCost + currentLevel * u.costPerLevel;
}

function openMetaScreen(){
  document.getElementById('meta-screen').style.display='block';
  renderMetaScreen();
}
function closeMetaScreen(){
  document.getElementById('meta-screen').style.display='none';
}
function renderMetaScreen(){
  const meta=loadMeta();
  document.getElementById('meta-shards-display').textContent=`💠 ${meta.shards} Doom Shards available`;
  const el=document.getElementById('meta-upgrades-list');
  el.innerHTML='';
  META_UPGRADES.forEach(u=>{
    const lvl=meta.upgrades[u.id]||0;
    const maxed=lvl>=u.maxLevel;
    const cost=getUpgradeCost(u,lvl);
    const canAfford=meta.shards>=cost;
    const div=document.createElement('div');
    div.className='meta-upgrade-card'+(maxed?' maxed':'');
    div.innerHTML=`
      <div class="meta-upgrade-icon">${u.emoji}</div>
      <div class="meta-upgrade-info">
        <div class="meta-upgrade-name">${u.name}</div>
        <div class="meta-upgrade-desc">${u.desc}</div>
        <div class="meta-upgrade-level">${maxed?'✓ MAX':'Lv '+lvl+'/'+u.maxLevel}</div>
      </div>
      <div class="meta-upgrade-cost ${!canAfford&&!maxed?'cant-afford':''}">
        ${maxed?'MAXED':cost+'💠'}
      </div>`;
    if(!maxed){
      div.onclick=()=>{
        const m=loadMeta();
        const l=m.upgrades[u.id]||0;
        const c=getUpgradeCost(u,l);
        if(m.shards<c){return;}
        m.shards-=c;
        m.upgrades[u.id]=(l+1);
        saveMeta(m);
        renderMetaScreen();
        if(document.getElementById('title-shard-count'))
          document.getElementById('title-shard-count').textContent=m.shards;
      };
    }
    el.appendChild(div);
  });
}

// ═══════════════════════════════
// ───── RUN SUMMARY ─────
// ═══════════════════════════════
function calcRunShards(){
  const p=G.player;
  let shards=0;
  const breakdown=[];
  // Floor milestones
  const floorBonus=G.floor*2;
  shards+=floorBonus;breakdown.push(`Floor ${G.floor}: +${floorBonus}💠`);
  // Kill bonus
  const killBonus=Math.floor(G.kills/5);
  if(killBonus>0){shards+=killBonus;breakdown.push(`${G.kills} kills: +${killBonus}💠`);}
  // Corruption bonus
  const corrBonus=Math.floor((G.corruption||0)/20)*2;
  if(corrBonus>0){shards+=corrBonus;breakdown.push(`Corruption ${G.corruption}%: +${corrBonus}💠`);}
  // Win bonus
  if(G.didWin){shards+=10;breakdown.push('RUN COMPLETE: +10💠');}
  // Boss kills
  const bossBonus=(G.bossKills||0)*5;
  if(bossBonus>0){shards+=bossBonus;breakdown.push(`${G.bossKills} boss(es): +${bossBonus}💠`);}
  // High doom
  const doomLvl=getDoomLevel();
  const doomBonus=doomLvl*2;
  if(doomBonus>0){shards+=doomBonus;breakdown.push(`Doom Lv${doomLvl}: +${doomBonus}💠`);}
  return{shards,breakdown};
}

function showRunSummary(won){
  G.didWin=won;
  const p=G.player;
  const {shards,breakdown}=calcRunShards();

  // Save shards to meta
  const meta=loadMeta();
  meta.shards+=shards;
  meta.totalRuns=(meta.totalRuns||0)+1;
  if(won)meta.wins=(meta.wins||0)+1;
  if((G.floor||1)>(meta.bestFloor||0))meta.bestFloor=G.floor;
  saveMeta(meta);

  // Update title screen shard count if visible
  if(document.getElementById('title-shard-count'))
    document.getElementById('title-shard-count').textContent=meta.shards;

  document.getElementById('rs-title').textContent=won?'🏆 VICTORY ROYALE':'💀 YOU PERISHED';
  document.getElementById('rs-title').style.color=won?'var(--gold)':'var(--red)';
  document.getElementById('rs-sub').textContent=won
    ?'Against all odds, you cleared the dungeon. The dungeon is disappointed.'
    :`Floor ${G.floor} was your undoing. The rats mourn. Briefly.`;

  const stats=[
    ['🏚️ Floor Reached',G.floor],
    ['💀 Enemies Killed',G.kills],
    ['💰 Gold Earned',G.goldTotal+'g'],
    ['⭐ Level Reached',p.level],
    ['☠️ Corruption',`${G.corruption||0}%`],
    ['👑 Doom Level',getDoomLevel()],
    ['🔴 Modifiers Active',(G.activeModifiers||[]).length],
    ['⚗️ Items Fused',G.fusionCount||0],
  ];
  document.getElementById('rs-stats').innerHTML=stats.map(([k,v])=>`<div class="rs-stat"><span class="rs-stat-k">${k}</span><span class="rs-stat-v">${v}</span></div>`).join('');
  document.getElementById('rs-shard-breakdown').innerHTML=breakdown.map(s=>`<div>${s}</div>`).join('');
  document.getElementById('rs-shard-total').textContent=`Total earned: ${shards}💠 (Bank: ${meta.shards}💠)`;

  document.getElementById('gov').style.display='none';
  document.getElementById('run-summary').style.display='flex';
}

// ═══════════════════════════════

