// SHOP
// ═══════════════════════════════
function generateShopStock(){
  const p=G.player,fl=G.floor;
  const tier=Math.min(4,Math.floor((fl-1)/1.2)+Math.floor((p.level-1)/3));
  const stock=[];
  // Weapons
  stock.push({...rollAffix(makeItem('weapon',tier,Math.floor(Math.random()*4))), shopCost:null});
  stock.push({...rollAffix(makeItem('weapon',Math.max(0,tier-1),Math.floor(Math.random()*4))), shopCost:null});
  // Armor
  stock.push({...rollAffix(makeItem('armor',tier,0)), shopCost:null});
  // Ring
  stock.push({...rollAffix(makeItem('ring',Math.min(tier,4),0)), shopCost:null});
  // Consumables
  stock.push({...CONSUMABLES[0],uid:Math.random().toString(36).slice(2),shopCost:null}); // hp pot
  stock.push({...CONSUMABLES[2],uid:Math.random().toString(36).slice(2),shopCost:null}); // mp pot
  stock.push({...CONSUMABLES[4],uid:Math.random().toString(36).slice(2),shopCost:null}); // bomb
  // Common crafting materials (buyable from shop)
  const shopMats=['iron_ore','iron_bar','leather','wood_shard','bone_shard','mushroom'];
  const floorMats=fl>=2?['steel_bar','magic_dust','beast_fang','firebloom']:[];
  const rareMats=fl>=3?['rune_stone','shadow_silk','void_shard','moonpetal','chaos_gem']:[];
  const matPool=[...shopMats,...floorMats,...rareMats];
  const picked=matPool.sort(()=>Math.random()-.5).slice(0,4);
  picked.forEach(mid=>{
    const m=makeMaterial(mid);
    if(m){m.shopCost=Math.ceil(m.value*1.8);stock.push(m);}
  });
  // Set costs = 1.3x item value
  stock.forEach(it=>{it.shopCost=Math.ceil((it.value||30)*1.3/5)*5;});
  return stock;
}

function openShop(){
  if(!G.shopStock||G.shopStock.length===0) G.shopStock=generateShopStock();
  const mods=getModEffects();
  const priceMult=mods.shopMult||1;
  document.getElementById('shop-gold-disp').textContent=`💰 ${G.player.gold}g`;
  const buyList=document.getElementById('shop-buy-list');
  buyList.innerHTML=''; // clear

  // Reroll button — always use appendChild, never innerHTML+= (kills listeners)
  if(G.shopRerollsLeft>0||G.player.gold>=50){
    const rerollCost=G.shopRerollsLeft>0?'FREE':'50g';
    const rBtn=document.createElement('div');
    rBtn.style.marginBottom='8px';
    rBtn.innerHTML=`<button onclick="rerollShop()" style="background:#0d0d1a;border:2px solid var(--cyan);color:var(--cyan);font-family:'Press Start 2P',monospace;font-size:7px;padding:7px 14px;cursor:pointer;width:100%;border-radius:4px;">REROLL STOCK (${rerollCost})${G.shopRerollsLeft>0?' [FREE]':''}</button>`;
    buyList.appendChild(rBtn);
  }

  // Modifier warning — appendChild only, never innerHTML+=
  if(priceMult>1){
    const warn=document.createElement('div');
    warn.style.cssText='background:#1a0808;border:2px solid #660000;border-radius:4px;padding:6px 8px;margin-bottom:8px;font-family:\'VT323\',monospace;font-size:14px;color:#ff8888;';
    warn.textContent=`GREEDY SHOPS active — prices +${Math.round((priceMult-1)*100)}%!`;
    buyList.appendChild(warn);
  }

  // Shop items — each gets its own closure with the item reference (not index)
  // Storing item ref avoids stale-index bugs when stock is modified
  G.shopStock.forEach((it)=>{
    const adjustedCost=Math.ceil((it.shopCost||30)*priceMult/5)*5;
    const gearCount=G.inventory.filter(i=>i.type!=='material').length;
    const isMat=it.type==='material';
    const canAfford=G.player.gold>=adjustedCost;
    const hasSpace=isMat
      ?(G.inventory.filter(i=>i.type==='material').length<20)
      :(gearCount<G.maxInvSlots);

    const div=document.createElement('div');
    div.className='shop-item'+((!canAfford||!hasSpace)?'':' shop-item-buyable');
    if(!canAfford||!hasSpace) div.style.opacity='.55';

    const affixBadge=it.affixName?`<span class="affix-tag ${it.affixClass||''}" style="font-size:11px">${it.affixEmoji||'♦'} ${it.affixName}</span>`:'';
    const tierBadge=it.tier?`<span class="tier-${it.tier}" style="font-size:6px">[T${it.tier}]</span>`:'';
    const spaceNote=!hasSpace?'<span style="color:var(--red);font-size:6px"> (no space)</span>':'';

    div.innerHTML=`
      <div class="shop-emoji">${buildItemSpriteHTML(it,22,'item-inline')}</div>
      <div class="shop-info">
        <div class="shop-name">${it.name} ${tierBadge} ${affixBadge}${spaceNote}</div>
        <div class="shop-desc">${fmtSt(it)||it.desc||''}</div>
      </div>
      <div class="shop-cost ${canAfford&&hasSpace?'':'cant-afford'}">${adjustedCost}g</div>`;

    // Closure captures `it` and `adjustedCost` directly — no stale index
    div.onclick=()=>{
      if(!canAfford||!hasSpace) return;
      buyItemByRef(it, adjustedCost);
    };
    buyList.appendChild(div);
  });

  // Expand inventory section
  const expandEl=document.getElementById('shop-expand');
  if(expandEl){
    expandEl.innerHTML='';
    const currentSlots=G.maxInvSlots;
    if(currentSlots<16){
      const cost=currentSlots*60;
      const canAfford=G.player.gold>=cost;
      expandEl.innerHTML=`
          <div class="inv-slots-display">Gear slots: ${currentSlots} → ${currentSlots+2}</div>
          <div class="shop-item shop-upgrade" onclick="buyInventoryExpand()" style="${canAfford?'':'opacity:.55;'}">
            <div class="shop-emoji">📦</div>
            <div class="shop-info"><div class="shop-name">+2 Gear Slots</div><div class="shop-desc">More room for more junk. Materials are always unlimited.</div></div>
            <div class="shop-cost ${canAfford?'':'cant-afford'}">${cost}g</div>
          </div>`;
    }else{
      expandEl.innerHTML=`<div class="inv-slots-display" style="color:var(--gold)">MAX SLOTS (16) — You're a hoarder.</div>`;
    }
  }
}

// Buy by direct item reference — immune to index shifting bugs
function buyItemByRef(it, cost){
  const idx=G.shopStock.indexOf(it);
  if(idx<0){addLog('Item no longer available!','damage');openShop();return;}
  if(G.player.gold<cost){addLog(`Need ${cost}g!`,'damage');return;}
  const isMat=it.type==='material';
  const gearCount=G.inventory.filter(i=>i.type!=='material').length;
  const matCount=G.inventory.filter(i=>i.type==='material').length;
  if(isMat&&matCount>=20){addLog('Material bag full!','damage');return;}
  if(!isMat&&gearCount>=G.maxInvSlots){addLog(`Gear bag full! (${gearCount}/${G.maxInvSlots})`, 'damage');return;}
  G.player.gold-=cost;
  G.inventory.push({...it, uid:Math.random().toString(36).slice(2)});
  G.shopStock.splice(idx,1);
  addLog(`Bought ${it.emoji} ${it.name} for ${cost}g`,'shop');
  sfx('rgba(255,215,0,.25)',200);
  spPt(window.innerWidth*.5, window.innerHeight*.6,'#ffd700',8,{speed:3,spread:4,grav:.1,decay:.06,ch:'*'});
  updateHUD();openShop();saveG();
}

// Keep old buyItem for any legacy calls
function buyItem(idx,overrideCost){
  const it=G.shopStock[idx];
  if(!it)return;
  buyItemByRef(it, overrideCost||it.shopCost||30);
}

function buyInventoryExpand(){
  const cost=G.maxInvSlots*60;
  if(G.player.gold<cost){addLog(`Need ${cost}g!`,'damage');return;}
  G.player.gold-=cost;G.maxInvSlots+=2;
  addLog(`Inventory expanded to ${G.maxInvSlots} slots!`,'shop');
  sfx('rgba(68,255,136,.2)',200);
  updateHUD();openShop();saveG();
}

function sellItem(it){
  if(it===G.equippedWeapon||it===G.equippedArmor||it===G.equippedRing){
    addLog('Unequip it first before selling!','info');return;
  }
  const price=Math.floor((it.value||20)*.5);
  G.player.gold+=price;
  G.inventory.splice(G.inventory.indexOf(it),1);
  addLog(`Sold ${it.emoji} ${it.name} for ${price}g`,'shop');
  spPt(window.innerWidth*.5,window.innerHeight*.6,'#ffd700',8,{speed:3,spread:4,grav:.1,decay:.05,ch:'*'});
  updateHUD();openShop();saveG();
}

// ═══════════════════════════════
// FUSION
// ═══════════════════════════════
function openFuseSelect(slotNum){
  fuseSelectTarget=slotNum;
  const grid=document.getElementById('fuse-select-grid');grid.innerHTML='';
  const fusable=G.inventory.filter(it=>['weapon','armor','ring','hp_pot','mp_pot'].includes(it.type));
  if(fusable.length===0){grid.innerHTML='<div style="font-size:7px;color:var(--gray);padding:12px">No fusable items in inventory.</div>';
  }else{
    fusable.forEach(it=>{
      const d=document.createElement('div');d.className='isl';
      d.innerHTML=buildItemSpriteHTML(it,30,'item-slot');
      d.title=it.name+(it.tier?' T'+it.tier:'');
      if(it.tier){const t=document.createElement('span');t.className='isl-tier tier-'+(it.tier||1);t.textContent='T'+(it.tier||1);d.appendChild(t);}
      d.onclick=()=>{setFuseSlot(slotNum,it);closeFuseSelect();};
      grid.appendChild(d);
    });
  }
  document.getElementById('fuse-select').style.display='flex';
}
function closeFuseSelect(){document.getElementById('fuse-select').style.display='none';}

function setFuseSlot(n,it){
  fuseSlot[n-1]=it;
  const icon=document.getElementById('fs'+n+'-icon');const name=document.getElementById('fs'+n+'-name');
  const sl=document.getElementById('fs'+n);
  icon.innerHTML=buildItemSpriteHTML(it,30,'item-slot');
  name.textContent=it.name+(it.tier?' [T'+it.tier+']':'');
  sl.classList.add('filled');
  checkFusionResult();
}

function checkFusionResult(){
  const [a,b]=fuseSlot;
  const res=document.getElementById('fusion-result');
  const btn=document.getElementById('fusion-btn');
  if(!res||!btn)return;
  if(!a||!b){
    res.innerHTML='<div style="font-size:8px;color:var(--gray)">Select 2 compatible items to fuse</div>';
    res.className='fusion-result';btn.disabled=true;return;
  }
  const result=getFusionResult(a,b);
  const mods=getModEffects();
  const baseTier=Math.max(a.tier||1,b.tier||1);
  const baseCost=TIER_FUSION_COST[Math.min(baseTier,8)];
  const fusionCost=mods.fusionTax?baseCost*2:baseCost;
  const taxNote=mods.fusionTax?` <span style="color:#ff8844">[TAX ×2]</span>`:'';

  if(!result){
    let reason='Incompatible!';
    if(a.type!==b.type&&!((a.isHp&&b.isHp)||(a.isMp&&b.isMp)))reason='Must be same item type.';
    else if(Math.abs((a.tier||1)-(b.tier||1))>1)reason='Tiers must be within 1 of each other.';
    res.innerHTML=`<div style="font-size:7px;color:var(--red)">❌ ${reason}</div>`;
    res.className='fusion-result';btn.disabled=true;
  }else{
    const affordable=G.player.gold>=fusionCost;
    const matReqs=getFusionMaterialRequirements(result.type,result.tier||1);
    const missingMats=getMissingFusionMaterials(matReqs);
    const matsReady=missingMats.length===0;
    const fusionReady=affordable&&matsReady;
    const tierName=TIER_NAMES_EXT[result.tier]||('T'+result.tier);
    const tierCol=TIER_COLORS_EXT[result.tier]||'#fff';
    const statPreview=Object.entries(result.effect||{}).slice(0,4).map(([k,v])=>{
      const icons={atk:'⚔',def:'🛡',hp:'❤',mp:'✨',spd:'💨',crit:'⭐'};
      return`${icons[k]||k}+${v}`;
    }).join(' ');
    const affixPreview=result.affixName
      ?`<div style="font-family:'VT323',monospace;font-size:13px;color:#aa66ff;margin-top:3px">♦ ${result.affixName} ${result.affix===a.affix||result.affix===b.affix?'(inherited)':'(new!)'}</div>`
      :'';
    const inheritNote=result.fusedFrom?'<div style="font-size:6px;color:var(--gray);margin-top:3px">Stats inherit best of both sources +20%</div>':'';
    const matPreview=matReqs.length?`<div style="font-size:7px;color:var(--gray);margin-top:6px">Required materials:</div>
      <div class="bp-mats" style="justify-content:center;margin-top:4px">${matReqs.map(m=>{
        const mat=MATERIALS[m.id]||{id:m.id,name:m.id,emoji:'?'};
        const have=countFusionMat(m.id);
        const ok=have>=m.qty;
        const icon=(typeof buildItemSpriteHTML==='function')?buildItemSpriteHTML(mat,12,'item-inline item-mat'):(mat.emoji||'?');
        return`<span class="mat-tag ${ok?'mat-ok':'mat-missing'}">${icon} ${mat.name} ${have}/${m.qty}</span>`;
      }).join('')}</div>`:'';
    const matMissingText=(!matsReady&&missingMats.length)?`<div style="font-size:7px;color:#ff6666;margin-top:4px">Missing: ${missingMats.map(m=>{
      const mat=MATERIALS[m.id]||{name:m.id};
      return`${mat.name} +${m.need}`;
    }).join(', ')}</div>`:'';
    res.className='fusion-result ready';
    res.innerHTML=`
      <div style="display:flex;justify-content:center">${buildItemSpriteHTML(result,34,'item-inline')}</div>
      <div style="font-size:8px;color:var(--gold);margin:3px 0">${result.name}</div>
      <div style="font-size:7px;color:${tierCol};margin-bottom:4px">[T${result.tier} — ${tierName}]</div>
      <div style="font-family:'VT323',monospace;font-size:14px;color:var(--cyan)">${statPreview}</div>
      ${affixPreview}${inheritNote}
      ${mods.fusionTax?'<div style="font-size:7px;color:#ff8844;margin-top:4px">⚗️ 20% chance: bonus tier!</div>':''}
      ${matPreview}
      ${matMissingText}`;
    btn.disabled=!fusionReady;
    btn.innerHTML=`⚒ FUSE — ${fusionCost}g${taxNote}`;
    if(!fusionReady)btn.style.opacity='.4';else btn.style.opacity='1';
  }
}

// ═══════════════════════════════
// FUSION SYSTEM — T1–T8, stat inheritance, affix merge
// ═══════════════════════════════

// Tier name labels extended for T6-T8
const TIER_NAMES_EXT = ['','Common','Uncommon','Rare','Epic','Legendary','Transcendent','Mythic','GODLIKE'];
const TIER_COLORS_EXT = ['','#aaaaaa','#44ff88','#44aaff','#aa44ff','#ffd700','#ff6600','#ff00cc','#ffffff'];
const TIER_FUSION_COST = [0, 50, 80, 120, 200, 350, 600, 1000, 2000]; // cost to fuse at each tier

// Higher-tier fusions require extra materials in addition to matching items.
const FUSION_MAT_THRESHOLDS = {
  weapon:[
    {minTier:3,mats:[{id:'iron_bar',qty:1}]},
    {minTier:4,mats:[{id:'steel_bar',qty:2},{id:'magic_dust',qty:1}]},
    {minTier:5,mats:[{id:'beast_fang',qty:1}]},
    {minTier:6,mats:[{id:'void_shard',qty:1}]},
    {minTier:7,mats:[{id:'dragon_scale',qty:1},{id:'chaos_gem',qty:1}]},
    {minTier:8,mats:[{id:'void_crystal',qty:1},{id:'boss_essence',qty:1}]},
  ],
  armor:[
    {minTier:3,mats:[{id:'iron_bar',qty:1},{id:'leather',qty:1}]},
    {minTier:4,mats:[{id:'steel_bar',qty:2},{id:'leather',qty:2}]},
    {minTier:5,mats:[{id:'bone_shard',qty:2}]},
    {minTier:6,mats:[{id:'shadow_silk',qty:1},{id:'void_shard',qty:1}]},
    {minTier:7,mats:[{id:'dragon_scale',qty:1},{id:'rune_stone',qty:1}]},
    {minTier:8,mats:[{id:'void_crystal',qty:1},{id:'boss_essence',qty:1}]},
  ],
  ring:[
    {minTier:3,mats:[{id:'magic_dust',qty:1}]},
    {minTier:4,mats:[{id:'rune_stone',qty:1},{id:'magic_dust',qty:1}]},
    {minTier:5,mats:[{id:'moonpetal',qty:1}]},
    {minTier:6,mats:[{id:'chaos_gem',qty:2}]},
    {minTier:7,mats:[{id:'void_shard',qty:1},{id:'dragon_scale',qty:1}]},
    {minTier:8,mats:[{id:'void_crystal',qty:1},{id:'boss_essence',qty:1}]},
  ],
  hp_pot:[
    {minTier:2,mats:[{id:'mushroom',qty:1}]},
  ],
  mp_pot:[
    {minTier:2,mats:[{id:'magic_dust',qty:1}]},
  ],
  consumable:[
    {minTier:2,mats:[{id:'firebloom',qty:1}]},
  ],
  elixir:[
    {minTier:3,mats:[{id:'moonpetal',qty:1},{id:'chaos_gem',qty:1}]},
    {minTier:8,mats:[{id:'void_crystal',qty:1},{id:'boss_essence',qty:1}]},
  ],
};

function countFusionMat(id){
  return G.inventory.reduce((n,it)=>n+((it.type==='material'&&it.id===id)?1:0),0);
}

function mergeMatReqs(reqs){
  const acc={};
  reqs.forEach(m=>{acc[m.id]=(acc[m.id]||0)+(m.qty||0);});
  return Object.entries(acc).map(([id,qty])=>({id,qty}));
}

function getFusionMaterialRequirements(itemType,targetTier){
  const rules=FUSION_MAT_THRESHOLDS[itemType]||[];
  if(!rules.length)return[];
  const reqs=[];
  rules.forEach(rule=>{
    if(targetTier>=rule.minTier)reqs.push(...rule.mats);
  });
  return mergeMatReqs(reqs);
}

function getMissingFusionMaterials(reqs){
  const missing=[];
  reqs.forEach(r=>{
    const have=countFusionMat(r.id);
    if(have<r.qty)missing.push({id:r.id,need:r.qty-have,have,qty:r.qty});
  });
  return missing;
}

function consumeFusionMaterials(reqs){
  reqs.forEach(r=>{
    let left=r.qty;
    for(let i=G.inventory.length-1;i>=0&&left>0;i--){
      const it=G.inventory[i];
      if(it.type==='material'&&it.id===r.id){
        G.inventory.splice(i,1);
        left--;
      }
    }
  });
}

function getFusionResult(a,b){
  if(!a||!b||a===b)return null;

  // Same category check
  const sameType=(a.type===b.type)||(a.isHp&&b.isHp)||(a.isMp&&b.isMp);
  if(!sameType)return null;

  // Potions — always allowed, result is next tier
  if(a.isHp&&b.isHp)return{...CONSUMABLES[1],uid:Math.random().toString(36).slice(2),fusedFrom:true};
  if(a.isMp&&b.isMp)return{...CONSUMABLES[3],uid:Math.random().toString(36).slice(2),fusedFrom:true};

  // Equipment — must be within 1 tier of each other (allows slight mismatch)
  const tierA=a.tier||1, tierB=b.tier||1;
  if(Math.abs(tierA-tierB)>1)return null;
  const baseTier=Math.max(tierA,tierB);
  const newTier=Math.min(8,baseTier+1);

  // Get base item for this tier from the correct table
  let tbl;
  if(a.type==='weapon')tbl=WEAPON_TIERS;
  else if(a.type==='armor')tbl=ARMOR_TIERS;
  else if(a.type==='ring')tbl=RING_TIERS;
  else return null;

  const tierIdx=newTier-1;
  const row=tbl[Math.min(tierIdx,tbl.length-1)];
  // Pick best-matching sub-type from row (prefer same sub-type)
  const aIdx=tbl[tierA-1]?.findIndex(x=>x.id===a.id)||0;
  const subIdx=Math.max(0,Math.min(aIdx>=0?aIdx:0, row.length-1));
  const base={...row[subIdx], type:a.type, tier:newTier, uid:Math.random().toString(36).slice(2)};

  // ── STAT INHERITANCE ──
  // Merge stats from both source items (take best of each stat, then add bonus)
  const ea=a.effect||{}, eb=b.effect||{};
  const merged={};
  const allKeys=new Set([...Object.keys(ea),...Object.keys(eb),...Object.keys(base.effect||{})]);
  allKeys.forEach(k=>{
    const va=ea[k]||0, vb=eb[k]||0, vbase=base.effect?.[k]||0;
    // Take the highest of: base table stat, or inherited best + 20% bonus
    const inherited=Math.floor(Math.max(va,vb)*1.2);
    merged[k]=Math.max(vbase,inherited);
  });
  base.effect=merged;
  base.value=Math.floor((a.value||0)+(b.value||0))*1.5;

  // ── AFFIX INHERITANCE ──
  // If either source had an affix, the fused item keeps the better one
  // with a 40% chance to UPGRADE it (pick a new random affix)
  const hasAffixA=!!a.affix, hasAffixB=!!b.affix;
  if(hasAffixA||hasAffixB){
    if(Math.random()<0.40){
      // Upgrade — roll a fresh affix
      rollAffix(base);
    }else{
      // Inherit — carry the affix from whichever source had one (prefer A)
      const donor=hasAffixA?a:b;
      base.affix=donor.affix;
      base.affixName=donor.affixName;
      base.affixClass=donor.affixClass;
      base.affixDesc=donor.affixDesc;
      base.affixEmoji=donor.affixEmoji;
      if(donor.affix_effect)base.affix_effect={...donor.affix_effect};
    }
  }else if(newTier>=4){
    // High-tier fusions get a free random affix
    rollAffix(base);
  }

  // ── FUSION NAME ──
  // Use source items' names to generate a combined name for uniqueness
  base.fusedName=`${a.name.split(' ')[0]}-${b.name.split(' ').pop()}`;
  if(newTier>=6){
    const prefixes=['Doom','Void','Chaos','Null','God','Eternal'];
    base.fusedName=prefixes[Math.floor(Math.random()*prefixes.length)]+' '+base.name;
    base.name=base.fusedName;
  }

  base.fusedFrom=true;
  base.fusedTier=newTier;
  return base;
}

function doFusion(){
  const [a,b]=fuseSlot;
  if(!a||!b)return;
  let result=getFusionResult(a,b);
  if(!result)return;

  const baseTier=Math.max(a.tier||1,b.tier||1);
  const mods=getModEffects();
  const baseCost=TIER_FUSION_COST[Math.min(baseTier,8)];
  const fusionCost=mods.fusionTax?baseCost*2:baseCost;

  if(G.player.gold<fusionCost){
    addLog(`Need ${fusionCost}g to fuse T${baseTier} items!`,'damage');return;
  }
  const matReqs=getFusionMaterialRequirements(result.type,result.tier||1);
  const missingMats=getMissingFusionMaterials(matReqs);
  if(missingMats.length){
    const msg=missingMats.map(m=>{
      const mat=MATERIALS[m.id]||{name:m.id};
      return`${mat.name} +${m.need}`;
    }).join(', ');
    addLog(`Need fusion materials: ${msg}`,'damage');
    return;
  }
  // Check gear slots — result replaces 2 items with 1, so net -1
  const gearBefore=G.inventory.filter(i=>i.type!=='material').length;
  if(gearBefore-2+1>G.maxInvSlots&&result.type!=='material'){
    addLog('Not enough inventory space!','damage');return;
  }

  G.player.gold-=fusionCost;
  if(matReqs.length)consumeFusionMaterials(matReqs);
  G.fusionCount=(G.fusionCount||0)+1;

  // Fusion Tax modifier: 20% chance +1 extra tier
  if(mods.fusionTax&&Math.random()<.20&&result.tier<8){
    const extraTier=Math.min(8,result.tier+1);
    const tbl=result.type==='weapon'?WEAPON_TIERS:result.type==='armor'?ARMOR_TIERS:RING_TIERS;
    const row=tbl[Math.min(extraTier-1,tbl.length-1)];
    result={...result,...row[0],effect:{...result.effect},tier:extraTier,uid:Math.random().toString(36).slice(2)};
    addLog('⚗️ FUSION TAX MIRACLE! Bonus tier!','loot');
  }

  // Unequip source items properly
  [a,b].forEach(it=>{
    if(it===G.equippedWeapon){G.player.atk-=it.effect?.atk||0;if(it.effect?.crit)G.player.crit-=it.effect.crit;applyAffixOnEquip(it,false);G.equippedWeapon=null;}
    if(it===G.equippedArmor){G.player.def-=it.effect?.def||0;if(it.effect?.spd)G.player.spd-=it.effect.spd;applyAffixOnEquip(it,false);G.equippedArmor=null;}
    if(it===G.equippedRing){const e=it.effect||{};if(e.atk)G.player.atk-=e.atk;if(e.def)G.player.def-=e.def;if(e.spd)G.player.spd-=e.spd;if(e.crit)G.player.crit-=e.crit;G.equippedRing=null;}
    const idx=G.inventory.indexOf(it);
    if(idx>=0)G.inventory.splice(idx,1);
  });

  G.inventory.push(result);
  fuseSlot=[null,null];

  // Reset fusion UI
  ['1','2'].forEach(n=>{
    const ic=document.getElementById('fs'+n+'-icon');
    const nm=document.getElementById('fs'+n+'-name');
    const sl=document.getElementById('fs'+n);
    if(ic)ic.innerHTML='?';
    if(nm)nm.textContent='Tap to pick';
    if(sl)sl.classList.remove('filled');
  });
  const fr=document.getElementById('fusion-result');
  if(fr){fr.innerHTML='<div style="font-size:8px;color:var(--gray)">Select 2 compatible items</div>';fr.className='fusion-result';}
  const fb=document.getElementById('fusion-btn');
  if(fb)fb.disabled=true;

  const tierLabel=TIER_NAMES_EXT[result.tier]||('T'+result.tier);
  const affixNote=result.affixName?` ✦${result.affixName}`:'';
  const matSpendNote=matReqs.length?` + mats(${matReqs.map(m=>`${MATERIALS[m.id]?.name||m.id}×${m.qty}`).join(', ')})`:'';
  addLog(`⚗️ FUSED → ${result.emoji} ${result.name} [${tierLabel}]${affixNote}${matSpendNote}!`,'loot');
  sfx('rgba(170,68,255,.4)',400);
  spPt(window.innerWidth*.5,window.innerHeight*.5,'#aa44ff',24,{speed:5,spread:6,grav:0,decay:.04});
  spRi(window.innerWidth*.5,window.innerHeight*.5,'#aa44ff');
  updateHUD();openFusePanel();saveG();
}

// ═══════════════════════════════
// PANELS
// ═══════════════════════════════
function openFusePanel(){
  checkFusionResult();
}

function togglePanel(n){
  if(openPanel===n){closeAllPanels();return;}
  closeAllPanels(true);
  document.getElementById('panel-'+n).classList.add('open');
  document.getElementById('bkdrop').classList.add('on');
  openPanel=n;
  if(n==='shop')openShop();
  if(n==='fuse')openFusePanel();
  if(n==='blacksmith')openBlacksmith();
  if(n==='alchemist')openAlchemist();
  if(n==='doom')openDoomPanel();
  if(n==='registry')openFloorRegistry();
  if(n==='save'&&typeof refreshSaveSummary==='function')refreshSaveSummary();
  if(n==='log')setTimeout(()=>{const l=document.getElementById('log-list');l.scrollTop=l.scrollHeight;},50);
}
function closeAllPanels(){
  ['inv','shop','fuse','stats','log','menu','save','blacksmith','alchemist','doom','registry'].forEach(n=>{
    const el=document.getElementById('panel-'+n);
    if(el)el.classList.remove('open');
  });
  document.getElementById('bkdrop').classList.remove('on');
  openPanel=null;
}

// ═══════════════════════════════
// QUICKUSE
// ═══════════════════════════════
function quickUse(t){
  const pot=G.inventory.find(i=>t==='hp'?i.isHp:i.isMp);
  if(!pot){addLog(`No ${t.toUpperCase()} potions!`,'info');return;}
  applyEffect(pot);G.inventory.splice(G.inventory.indexOf(pot),1);
  addLog(`Used ${pot.emoji} ${pot.name}!`,'heal');
  spawnDmg(pot.effect.hp||G.player.maxHp,t==='hp'?'#44ff88':'#44aaff',true);
  if(t==='hp')sfx('rgba(68,255,136,.2)',200);else sfx('rgba(68,136,255,.2)',200);
  updateHUD();saveG();
}

// ═══════════════════════════════
// PORTAL SYSTEM
// ═══════════════════════════════
function ensureFloorMapReady(floorId){
  const meta=getFloorMeta(floorId);
  if(!meta||floorId==='NEXUS')return null;
  if(!G.map.zones[floorId]){
    const zid=getFloorZoneId(floorId)||'N';
    G.map.zones[floorId]=generateZoneMap(zid,floorId);
    placeZoneEntities(floorId);
  }
  return G.map.zones[floorId];
}

function applyZoneTintForCurrentFloor(){
  const tint=document.getElementById('zone-tint');
  if(!tint)return;
  const zdef=getCurrentZoneDef();
  if(G.inZone&&zdef){
    tint.style.background=zdef.tint;
    tint.style.opacity='1';
  }else{
    tint.style.opacity='0';
  }
}

function openFloorRegistry(){
  const list=document.getElementById('registry-list');
  const note=document.getElementById('registry-note');
  if(!list)return;
  ensureProgressionState();
  const currentId=getCurrentFloorId();
  const floors=getDiscoveredFloorList(true);
  if(note){
    note.textContent=`Current: ${getFloorDisplayName(currentId)} • Discovered: ${floors.length}`;
  }
  list.innerHTML='';
  floors.forEach(meta=>{
    const zid=getFloorZoneId(meta.id);
    const zdef=zid?PORTAL_ZONES[zid]:null;
    const btn=document.createElement('button');
    btn.className='shop-item';
    btn.style.justifyContent='space-between';
    btn.style.alignItems='center';
    btn.style.gap='8px';
    btn.style.opacity=(meta.id===currentId)?'.7':'1';
    const bossText=meta.kind==='nexus'?'Safe':(meta.bossAlive?'Boss Alive':'Boss Down');
    const clr=meta.cleared?'Cleared':'Uncleared';
    const biome=zdef?`${zdef.emoji} ${zdef.name}`:'NEXUS';
    const floorId=`#${meta.id}`;
    const corrText=`T${Math.max(1,meta.dangerTier||1)} • Corruption ${Math.max(0,meta.corruption||0)}%`;
    const eventText=meta.rareEvent?'Event Hot':'Calm';
    btn.innerHTML=`
      <div style="text-align:left">
        <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:${zdef?.color||'var(--gold)'}">${meta.kind==='sub'?'⛓ SUB':'⬇ MAIN'} ${meta.name}</div>
        <div style="font-family:'VT323',monospace;font-size:14px;color:var(--gray)">Depth ${meta.mainDepth||0} • ${biome}</div>
        <div style="font-family:'VT323',monospace;font-size:13px;color:#7f85a8">${floorId} • ${corrText} • ${eventText}</div>
      </div>
      <div style="text-align:right;font-family:'VT323',monospace;font-size:14px;color:${meta.cleared?'#66ff99':'#ff8888'}">${clr}<br><span style="color:${meta.bossAlive?'#ff6666':'#88ddff'}">${bossText}</span></div>`;
    btn.disabled=(meta.id===currentId);
    btn.onclick=()=>{
      closeAllPanels();
      travelToFloor(meta.id,'registry');
    };
    list.appendChild(btn);
  });
}

function travelToFloor(floorId,reason='travel'){
  ensureProgressionState();
  const targetId=(floorId&&getFloorMeta(floorId))?floorId:'NEXUS';
  const fromId=getCurrentFloorId();
  const fromMeta=getFloorMeta(fromId);
  if(fromMeta&&fromId!=='NEXUS'){
    fromMeta.lastX=G.player.x;
    fromMeta.lastY=G.player.y;
  }

  if(targetId==='NEXUS'){
    setCurrentFloorId('NEXUS');
    applyZoneTheme(null);
    G.player.x=G.portalReturnX||G.player.x||0;
    G.player.y=G.portalReturnY||G.player.y||0;
    applyZoneTintForCurrentFloor();
    syncWorldDepthFromCurrentFloor(G);
    addLog('↩️ Return gate brings you back to the Nexus.','info');
    updateVision(G.player.x,G.player.y);
    renderMap();updateHUD();saveG();
    return;
  }

  const meta=getFloorMeta(targetId);
  if(!meta){addLog('The gate loses lock on that floor.','damage');return;}
  meta.discovered=true;
  const reg=ensureProgressionState();
  if(!reg.discovered.includes(meta.id))reg.discovered.push(meta.id);
  if(meta.kind!=='sub')ensurePortalLinksForFloor(targetId);
  const zdef=getZoneDefForFloorId(targetId)||PORTAL_ZONES.N;
  const zone=ensureFloorMapReady(targetId);
  if(!zone){addLog('The portal chamber collapses.','damage');return;}

  setCurrentFloorId(targetId);
  syncWorldDepthFromCurrentFloor(G);
  applyZoneTheme(meta.zoneId||'N');
  G.player.x=(typeof meta.lastX==='number')?meta.lastX:zone.startX;
  G.player.y=(typeof meta.lastY==='number')?meta.lastY:zone.startY;

  applyZoneTintForCurrentFloor();
  showZoneFlash(zdef);
  const corrKick=(meta.kind==='sub')?4:2;
  addCorruption(Math.min(14,corrKick+Math.ceil((meta.mainDepth||1)/2)));
  addLog(`${zdef.emoji} ${reason==='registry'?'Recalled':'Entered'} ${getFloorDisplayName(targetId)}.`,'info');
  if(meta.kind==='sub')addLog('⚠ Subfloor pressure spike — stronger foes, better loot.','funny');

  sfx(`${zdef.tint.replace('rgba','rgba').replace('.12',',.45')}`,500);
  spPt(window.innerWidth*.5,window.innerHeight*.4,zdef.color,24,{speed:5,spread:7,grav:0,decay:.05});
  spRi(window.innerWidth*.5,window.innerHeight*.4,zdef.color);

  updateVision(G.player.x,G.player.y);
  renderMap();updateHUD();saveG();
}

function enterRandomSubfloor(){
  if(!G.inZone){addLog('No subfloor anchor in the Nexus.','info');return;}
  const curId=getCurrentFloorId();
  const curMeta=getFloorMeta(curId);
  if(!curMeta){addLog('Subfloor anchor is unstable.','damage');return;}
  curMeta.subfloors=Array.isArray(curMeta.subfloors)?curMeta.subfloors:[];
  let targetId=null;
  const known=curMeta.subfloors.filter(id=>getFloorMeta(id));
  if(known.length&&Math.random()<0.3)targetId=known[Math.floor(Math.random()*known.length)];
  if(!targetId){
    const sf=createSubfloorMeta(curId,'stairs_sub');
    targetId=sf.id;
    curMeta.subfloors.push(targetId);
  }
  travelToFloor(targetId,'subfloor');
}

function enterPortal(portalDir){
  ensureProgressionState();
  const dir=String(portalDir||'').toUpperCase();
  if(!PORTAL_ZONES[dir]){addLog('The portal fizzles and does nothing.','damage');return;}
  const fromId=getCurrentFloorId();
  if(fromId==='NEXUS'){
    G.portalReturnX=G.player.x;
    G.portalReturnY=G.player.y;
  }
  const targetId=getDirectionalDestinationFromFloor(fromId,dir);
  if(!targetId){addLog('No destination linked to that gate yet.','damage');return;}
  travelToFloor(targetId,'portal');
}

function exitPortal(){
  if(!G.inZone){
    addLog('You are already in the Nexus.','info');
    return;
  }
  togglePanel('registry');
}

function showZoneFlash(zdef){
  const el=document.getElementById('zone-flash');
  if(!el)return;
  el.style.background=zdef.tint.replace('.12','.85');
  el.style.color=zdef.color;
  el.style.textShadow=`0 0 10px ${zdef.color}`;
  el.textContent=`${zdef.emoji} ${zdef.name} ${zdef.emoji}`;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2500);
}


