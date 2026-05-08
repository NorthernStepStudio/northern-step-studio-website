// DISMANTLE SYSTEM
function getDismantleBtn(it){
  if(!it || it.type==='material') return '';
  return `<button class="icbtn" style="border-color:#ff8844;color:#ff8844" onclick="dismantleItem(CI)">⚒️ DISMANTLE</button>`;
}

function dismantleItem(it){
  if(!it)return;
  if(it.type==='material'){addLog('Cannot dismantle raw materials!','info');return;}
  if(it===G.equippedWeapon||it===G.equippedArmor||it===G.equippedRing){addLog('Unequip it first!','info');return;}
  
  const tier=it.tier||1;
  const mats=[];
  const roll=(id)=>mats.push(makeMaterial(id));
  
  // Logic to give materials based on item type and tier
  if(it.type==='weapon'){
    if(tier<=1) roll(Math.random()<.5?'iron_ore':'wood_shard');
    if(tier>=2) roll(Math.random()<.5?'iron_bar':'leather');
    if(tier>=3&&Math.random()<.4) roll('magic_dust');
  } else if(it.type==='armor'){
    if(tier<=1) roll('leather');
    if(tier>=2) roll('iron_bar');
    if(tier>=3&&Math.random()<.4) roll('steel_bar');
  } else if(it.type==='ring'){
    roll('magic_dust');
    if(tier>=2) roll('rune_stone');
  }
  
  // Extra roll for high tiers
  if(tier>=4) roll(Math.random()<.5?'void_shard':'dragon_scale');
  if(tier>=6) roll('boss_essence');

  G.inventory.splice(G.inventory.indexOf(it),1);
  addLog(`⚒️ Dismantled ${it.name}!`,'info');
  
  mats.forEach(m=>{
    if(m){
      const matCount=G.inventory.filter(i=>i.type==='material').length;
      const matCap=100;
      if(matCount<matCap){
        G.inventory.push(m);
        addLog(`+ Got ${m.emoji} ${m.name}`,'loot');
      } else {
        addLog(`! No room for ${m.name}`,'damage');
      }
    }
  });

  closeIP();
  sfx('rgba(255,136,68,.3)',200);
  updateHUD();saveG();
}
