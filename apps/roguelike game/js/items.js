// Item, inventory, fusion, and shop logic.

function glyphForThing(thing, fallback = '?') {
  if (!thing) return fallback;
  if (typeof thing.affixEmoji === 'string' && /^[A-Z0-9]{2,3}$/.test(thing.affixEmoji)) return thing.affixEmoji;
  const name = `${thing.name || ''} ${thing.cat || ''}`.toLowerCase();
  if (thing.type === 'gold' || name.includes('gold')) return '$';
  if (thing.type === 'material') return '*';
  if (thing.isHp || name.includes('hp potion')) return 'H';
  if (thing.isMp || name.includes('mp potion')) return 'M';
  if (thing.type === 'elixir' || thing.effect?.elixirAtk || thing.effect?.elixirDef || thing.effect?.elixirSpd || thing.effect?.elixirCrit || thing.effect?.chaos) return 'E';
  if (thing.effect?.bomb || name.includes('bomb')) return 'B';
  if (thing.type === 'ring' || name.includes('ring')) return 'o';
  if (thing.cat === 'Sword' || name.includes('sword') || name.includes('blade')) return '/';
  if (thing.cat === 'Mace' || name.includes('mace') || name.includes('mallet') || name.includes('hammer')) return '!';
  if (thing.cat === 'Spear' || name.includes('spear') || name.includes('lance')) return '^';
  if (thing.cat === 'Staff' || name.includes('staff') || name.includes('wand') || name.includes('orb')) return '|';
  if (thing.cat === 'Boots' || name.includes('boots')) return 'U';
  if (thing.cat === 'Helmet' || name.includes('helm') || name.includes('crown')) return 'H';
  if (thing.type === 'armor' || name.includes('armor') || name.includes('mail')) return '#';
  const byType = { weapon: 'W', armor: 'A', ring: 'R', hp_pot: 'H', mp_pot: 'M', consumable: 'C', elixir: 'E' };
  return byType[thing.type] || fallback;
}

function makeItem(type, tier0, subIdx = 0) {
  let table;
  let itemType;

  if (type === 'weapon') {
    table = WEAPON_TIERS;
    itemType = 'weapon';
  } else if (type === 'armor') {
    table = ARMOR_TIERS;
    itemType = 'armor';
  } else {
    table = RING_TIERS;
    itemType = 'ring';
  }

  const row = table[Math.min(tier0, table.length - 1)];
  const base = row[subIdx % row.length];
  return { ...base, type: itemType, tier: tier0 + 1, uid: Math.random().toString(36).slice(2) };
}

function makeMaterial(id) {
  const material = MATERIALS[id];
  if (!material) return null;
  return { ...material, type: 'material', uid: Math.random().toString(36).slice(2) };
}

function rollMaterialDrop(floor, isBoss = false) {
  const pool = Object.values(MATERIALS).filter((material) => {
    if (isBoss) return material.rarity >= 3 && material.floor <= floor + 1;
    if (floor <= 1) return material.rarity === 1;
    if (floor <= 2) return material.rarity <= 2;
    if (floor <= 3) return material.rarity <= 3;
    return true;
  });
  if (!pool.length) return null;

  const weighted = [];
  pool.forEach((material) => {
    const weight = isBoss ? 1 : Math.max(1, 5 - material.rarity);
    for (let i = 0; i < weight; i += 1) weighted.push(material);
  });

  const choice = weighted[Math.floor(Math.random() * weighted.length)];
  return makeMaterial(choice.id);
}

function describeItemStats(item) {
  if (!item?.effect) return item?.desc || 'No stat bonuses.';
  const stats = [];
  if (item.effect.atk) stats.push(`ATK +${item.effect.atk}`);
  if (item.effect.def) stats.push(`DEF +${item.effect.def}`);
  if (item.effect.hp) stats.push(`HP +${item.effect.hp}`);
  if (item.effect.mp) stats.push(`MP +${item.effect.mp}`);
  if (item.effect.hpFull) stats.push('FULL HP');
  if (item.effect.mpFull) stats.push('FULL MP');
  if (item.effect.spd) stats.push(`SPD +${item.effect.spd}`);
  if (item.effect.crit) stats.push(`CRIT +${item.effect.crit}%`);
  if (item.effect.gold) stats.push(`GOLD +${item.effect.gold}`);
  if (item.effect.bomb) stats.push(`BOMB ${item.effect.bomb}`);
  if (item.effect.elixirAtk) stats.push(`ATK +${item.effect.elixirAtk} this floor`);
  if (item.effect.elixirDef) stats.push(`DEF +${item.effect.elixirDef} this floor`);
  if (item.effect.elixirSpd) stats.push(`SPD +${item.effect.elixirSpd} this floor`);
  if (item.effect.elixirCrit) stats.push(`CRIT +${item.effect.elixirCrit}% this floor`);
  if (item.effect.chaos) stats.push('CHAOS this floor');
  return stats.length ? stats.join('<br>') : (item.desc || 'No stat bonuses.');
}

function countMat(id) {
  return G.inventory.filter((item) => item.type === 'material' && (item.id === id || item.matId === id)).length;
}

function getMissingMats(recipe) {
  const missing = [];
  recipe.mats.forEach((matReq) => {
    const have = countMat(matReq.id);
    if (have < matReq.qty) {
      const material = MATERIALS[matReq.id];
      missing.push(`${material?.name || matReq.id} (${matReq.qty - have} short)`);
    }
  });
  return missing;
}

function canCraftBP(bp) {
  return bp.mats.every((matReq) => countMat(matReq.id) >= matReq.qty);
}

function formatEffectStats(effect = {}) {
  return describeItemStats({ effect }).replace(/<br>/g, ' | ');
}

function consumeMaterials(materials) {
  materials.forEach((matReq) => {
    let remaining = matReq.qty;
    G.inventory = G.inventory.filter((item) => {
      if (remaining > 0 && item.type === 'material' && (item.id === matReq.id || item.matId === matReq.id)) {
        remaining -= 1;
        return false;
      }
      return true;
    });
  });
}

const SHRINE_OPTION_POOL = [
  {
    id: 'vitality',
    title: 'Heart Furnace',
    desc: '+18 max HP for the rest of this run.',
    cost: 'You feel heavier but harder to kill.',
    apply: () => addRunBuff('hp', 18, 'MAX HP')
  },
  {
    id: 'focus',
    title: 'Echo Well',
    desc: '+22 max MP for the rest of this run.',
    cost: 'Your brain smells faintly electric.',
    apply: () => addRunBuff('mp', 22, 'MAX MP')
  },
  {
    id: 'fury',
    title: 'Blood Mirror',
    desc: '+5 ATK for the run, lose 12 HP now.',
    cost: 'Power always invoices someone.',
    apply: () => {
      addRunBuff('atk', 5, 'ATK');
      G.player.hp = Math.max(1, G.player.hp - 12);
    }
  },
  {
    id: 'ward',
    title: 'Stone Oath',
    desc: '+4 DEF and +2 SPD for the run.',
    cost: 'You move like armored confidence.',
    apply: () => {
      addRunBuff('def', 4, 'DEF');
      addRunBuff('spd', 2, 'SPD');
    }
  },
  {
    id: 'crit',
    title: 'Laughing Knife',
    desc: '+12 CRIT for the run, +8 doom.',
    cost: 'The shrine likes reckless people.',
    apply: () => {
      addRunBuff('crit', 12, 'CRIT');
      G.doom = Math.min(100, G.doom + 8);
    }
  },
  {
    id: 'purge',
    title: 'Pale Flame',
    desc: 'Lose 18 doom and heal 35 HP.',
    cost: 'No stat gain, just survival.',
    apply: () => {
      G.doom = Math.max(0, G.doom - 18);
      G.player.hp = Math.min(G.player.maxHp, G.player.hp + 35);
    }
  },
  {
    id: 'greed',
    title: 'Golden Joke',
    desc: 'Gain 120 gold and +10 doom.',
    cost: 'The shrine thinks this is funny.',
    apply: () => {
      G.gold += 120;
      G.doom = Math.min(100, G.doom + 10);
    }
  },
  {
    id: 'gift',
    title: 'Armed Blessing',
    desc: 'Gain one high-tier item immediately.',
    cost: 'The dungeon expects you to earn it.',
    apply: () => {
      const gift = makeItem(['weapon', 'armor', 'ring'][Math.floor(Math.random() * 3)], Math.max(1, Math.min(4, G.floor - 1)));
      gift.x = G.player.x;
      gift.y = G.player.y;
      G.items.push(gift);
    }
  }
];

function addRunBuff(stat, val, label) {
  if (!Array.isArray(G.runBuffs)) G.runBuffs = [];
  G.runBuffs.push({ stat, val, label: label || stat.toUpperCase() });
}

function generateShrineOptions() {
  return [...SHRINE_OPTION_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((option) => ({ id: option.id }));
}

function getShrineOption(optionId) {
  return SHRINE_OPTION_POOL.find((option) => option.id === optionId) || null;
}

function getShrineAt(x, y) {
  return Array.isArray(G.shrineEvents)
    ? G.shrineEvents.find((event) => event.x === x && event.y === y)
    : null;
}

function openFuseSelect(slotNum) {
  fuseSelectTarget = slotNum;
  document.getElementById('fuse-select').classList.remove('hidden');
  const grid = document.getElementById('fuse-select-grid');
  grid.innerHTML = '';

  const otherSlot = fuseSlot[1 - slotNum];
  const items = G.inventory.filter((item) => ['weapon', 'armor', 'ring'].includes(item.type));
  if (!items.length) {
    grid.innerHTML = '<div class="text-gray fs-7 p-10 col-span-4 text-center">NO FUSABLE ITEMS</div>';
    return;
  }

  items.forEach((item) => {
    const disabled = otherSlot?.uid === item.uid;
    const el = document.createElement('div');
    el.className = `isl ${disabled ? 'opacity-50 pointer-events-none' : ''}`;
    el.innerHTML = `<span>${glyphForThing(item)}</span>${item.tier ? `<div class="isl-tier tier-${item.tier}">${item.tier}</div>` : ''}`;
    el.onclick = () => {
      if (!disabled) setFuseSlot(item);
    };
    grid.appendChild(el);
  });
}

function setFuseSlot(item) {
  fuseSlot[fuseSelectTarget] = item;
  closeFuseSelect();
  renderFusionGrid();
  checkFusionResult();
}

function closeFuseSelect() {
  document.getElementById('fuse-select').classList.add('hidden');
}

function renderFusionGrid() {
  for (let i = 0; i < 2; i += 1) {
    const el = document.getElementById(`fslot-${i}`);
    if (!el) continue;
    if (fuseSlot[i]) {
      el.classList.add('filled');
      el.innerHTML = `<span class="fusion-slot-icon">${glyphForThing(fuseSlot[i])}</span><span class="fusion-slot-name">${fuseSlot[i].name}</span>`;
    } else {
      el.classList.remove('filled');
      el.innerHTML = '<span class="fusion-slot-icon">?</span><span class="fusion-slot-name">Empty</span>';
    }
  }
}

function getFusionResult(a, b) {
  if (a.type !== b.type) return null;

  let combo = null;
  if (a.element && b.element && a.element !== b.element) {
    const key1 = `${a.element}+${b.element}`;
    const key2 = `${b.element}+${a.element}`;
    combo = FUSION_COMBOS[key1] || FUSION_COMBOS[key2];
  }

  if (+a.tier === +b.tier && +a.tier < 5) {
    const newTier = +a.tier + 1;
    const item = makeItem(a.type, newTier - 1, Math.floor(Math.random() * 4));

    if (combo) {
      item.name = `${combo.name} ${item.name.split(' ').pop()}`;
      item.element = combo.element;
      item.affixEmoji = combo.icon;
      if (item.effect.atk) item.effect.atk = Math.round(item.effect.atk * combo.bonus);
    } else if (a.element === b.element) {
      item.element = a.element;
    }

    return { item, cost: newTier * 50 };
  }

  if (Math.abs(+a.tier - +b.tier) === 1) {
    const higher = +a.tier > +b.tier ? a : b;
    return { item: makeItem(higher.type, higher.tier - 1, Math.floor(Math.random() * 4)), cost: higher.tier * 30 };
  }

  return null;
}

function checkFusionResult() {
  const resultEl = document.getElementById('f-res');
  const button = document.getElementById('f-btn');
  if (!resultEl || !button) return;

  if (!fuseSlot[0] || !fuseSlot[1]) {
    resultEl.innerHTML = '<span class="text-gray fs-7">Select 2 items to forge...</span>';
    resultEl.classList.remove('ready');
    button.disabled = true;
    button.textContent = 'FORGE ITEM';
    return;
  }

  const result = getFusionResult(fuseSlot[0], fuseSlot[1]);
  if (!result) {
    resultEl.classList.remove('ready');
    resultEl.innerHTML = '<span class="text-red fs-7">Incompatible types or tiers.</span>';
    button.disabled = true;
    button.textContent = 'FUSION IMPOSSIBLE';
    return;
  }

  const canAfford = G.gold >= result.cost;
  resultEl.classList.add('ready');
  resultEl.innerHTML = `
    <div class="text-gold fs-8 mb-4">FORGE RESULT</div>
    <div class="flex items-center justify-center gap-4">
      <span class="fs-18">${glyphForThing(result.item)}</span>
      <div class="text-left">
        <div class="fs-7">${result.item.name}</div>
        <div class="fs-6 text-cyan">Tier ${result.item.tier}</div>
      </div>
    </div>
    <div class="mt-6 fs-7 ${canAfford ? 'text-gold' : 'text-red'}">Cost: ${result.cost}G</div>
  `;
  button.disabled = !canAfford;
  button.textContent = canAfford ? 'FORGE ITEM' : 'NOT ENOUGH GOLD';
}

function doFusion() {
  const result = getFusionResult(fuseSlot[0], fuseSlot[1]);
  if (!result || G.gold < result.cost) return;

  G.gold -= result.cost;
  playS('magic');
  doVfx('holy');
  addLog(`Forged ${result.item.name}.`, 'loot');

  if (G.equippedWeapon && [fuseSlot[0].uid, fuseSlot[1].uid].includes(G.equippedWeapon.uid)) unequipItem(G.equippedWeapon);
  if (G.equippedArmor && [fuseSlot[0].uid, fuseSlot[1].uid].includes(G.equippedArmor.uid)) unequipItem(G.equippedArmor);
  if (G.equippedRing && [fuseSlot[0].uid, fuseSlot[1].uid].includes(G.equippedRing.uid)) unequipItem(G.equippedRing);

  const fusedIds = [fuseSlot[0].uid, fuseSlot[1].uid];
  G.inventory = G.inventory.filter((item) => !fusedIds.includes(item.uid));
  G.inventory.push(result.item);
  fuseSlot = [null, null];

  renderFusionGrid();
  checkFusionResult();
  updateStats(false);
  updateHUD();
  saveG();
}

function generateShopStock() {
  const tier = Math.min(4, Math.max(0, G.floor - 1));
  const stock = [];
  stock.push({ ...makeItem('weapon', tier, Math.floor(Math.random() * 4)), shopCost: null });
  stock.push({ ...makeItem('armor', Math.max(0, tier - 1), 0), shopCost: null });
  stock.push({ ...makeItem('ring', Math.min(tier, 4), 0), shopCost: null });
  stock.push({ ...CONSUMABLES[0], uid: Math.random().toString(36).slice(2), shopCost: null });
  stock.push({ ...CONSUMABLES[2], uid: Math.random().toString(36).slice(2), shopCost: null });

  const commonMaterials = ['iron_ore', 'iron_bar', 'leather', 'wood_shard', 'bone_shard', 'mushroom'];
  const midMaterials = G.floor >= 2 ? ['steel_bar', 'magic_dust', 'beast_fang', 'firebloom'] : [];
  const rareMaterials = G.floor >= 3 ? ['rune_stone', 'shadow_silk', 'void_shard', 'moonpetal', 'chaos_gem'] : [];
  const materialPool = [...commonMaterials, ...midMaterials, ...rareMaterials].sort(() => Math.random() - 0.5).slice(0, 4);

  materialPool.forEach((id) => {
    const material = makeMaterial(id);
    if (material) stock.push({ ...material, shopCost: Math.ceil(material.value * 1.8) });
  });

  stock.forEach((item) => {
    if (item.shopCost == null) item.shopCost = Math.ceil(((item.value || 30) * 1.35) / 5) * 5;
  });
  return stock;
}

function openShop() {
  if (!Array.isArray(G.shopStock) || !G.shopStock.length) {
    G.shopStock = generateShopStock();
  }

  const goldDisplay = document.getElementById('shop-gold-disp');
  const buyList = document.getElementById('shop-buy-list');
  const expand = document.getElementById('shop-expand');
  if (!goldDisplay || !buyList || !expand) return;

  goldDisplay.textContent = `${G.gold}G`;
  buyList.innerHTML = '';

  if (G.shopRerollsLeft > 0 || G.gold >= 50) {
    const reroll = document.createElement('div');
    const label = G.shopRerollsLeft > 0 ? 'FREE' : '50G';
    reroll.innerHTML = `<button class="shop-item" style="width:100%;justify-content:center;color:var(--cyan)" onclick="rerollShop()">REROLL STOCK (${label})</button>`;
    buyList.appendChild(reroll);
  }

  G.shopStock.forEach((item, index) => {
    const cost = item.shopCost || 30;
    const canAfford = G.gold >= cost;
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.innerHTML = `
      <div class="shop-emoji">${glyphForThing(item)}</div>
      <div class="shop-info">
        <div class="shop-name">${item.name}${item.tier ? ` <span class="tier-${item.tier}">[T${item.tier}]</span>` : ''}</div>
        <div class="shop-desc">${describeItemStats(item)}</div>
      </div>
      <div class="shop-cost ${canAfford ? '' : 'cant-afford'}">${cost}G</div>
    `;
    card.onclick = () => buyShopItem(index, cost);
    buyList.appendChild(card);
  });

  const slots = G.invSlots || 8;
  if (slots < 18) {
    const cost = slots * 45;
    const canAfford = G.gold >= cost;
    expand.innerHTML = `
      <div class="inv-slots-display">Current: ${slots} slots -> ${slots + 2} slots</div>
      <div class="shop-item shop-upgrade" onclick="buyInventoryExpand()">
        <div class="shop-emoji">BAG</div>
        <div class="shop-info"><div class="shop-name">+2 Inventory Slots</div><div class="shop-desc">More room for more dungeon junk.</div></div>
        <div class="shop-cost ${canAfford ? '' : 'cant-afford'}">${cost}G</div>
      </div>
    `;
  } else {
    expand.innerHTML = '<div class="inv-slots-display" style="color:var(--gold)">MAX SLOTS REACHED</div>';
  }
}

function rerollShop() {
  if (G.shopRerollsLeft > 0) {
    G.shopRerollsLeft -= 1;
  } else if (G.gold >= 50) {
    G.gold -= 50;
  } else {
    addLog('Need 50G to reroll the merchant.', 'damage');
    return;
  }

  G.shopStock = [];
  addLog('The merchant restocked.', 'shop');
  updateHUD();
  openShop();
  saveG();
}

function buyShopItem(index, cost) {
  const item = G.shopStock[index];
  if (!item) return;
  if (G.gold < cost) {
    addLog(`Need ${cost}G for that purchase.`, 'damage');
    return;
  }
  if (G.inventory.length >= G.invSlots) {
    addLog('Inventory full. Expand it or fuse something first.', 'damage');
    return;
  }

  G.gold -= cost;
  G.inventory.push({ ...item, uid: Math.random().toString(36).slice(2) });
  G.shopStock.splice(index, 1);
  addLog(`Bought ${item.name} for ${cost}G.`, 'shop');
  updateStats(false);
  updateHUD();
  openShop();
  saveG();
}

function buyInventoryExpand() {
  const cost = G.invSlots * 45;
  if (G.gold < cost) {
    addLog(`Need ${cost}G for more bag space.`, 'damage');
    return;
  }
  if (G.invSlots >= 18) {
    addLog('You already maxed out inventory space.', 'info');
    return;
  }

  G.gold -= cost;
  G.invSlots += 2;
  addLog(`Inventory expanded to ${G.invSlots} slots.`, 'shop');
  updateHUD();
  openShop();
  saveG();
}

function openShrine() {
  const shrine = getShrineAt(G.player.x, G.player.y);
  const desc = document.getElementById('shrine-desc');
  const options = document.getElementById('shrine-options');
  if (!desc || !options) return;

  if (!shrine || shrine.used) {
    desc.textContent = 'This shrine has gone quiet.';
    options.innerHTML = '<div class="shop-desc">Nothing answers anymore.</div>';
    return;
  }

  desc.textContent = 'Accept one blessing. The shrine never explains the side effects.';
  options.innerHTML = '';

  shrine.options.forEach((choiceRef, index) => {
    const choice = getShrineOption(choiceRef.id);
    if (!choice) return;
    const button = document.createElement('button');
    button.className = 'shrine-choice';
    button.innerHTML = `<strong>${choice.title}</strong>${choice.desc}<span class="shrine-cost">${choice.cost}</span>`;
    button.onclick = () => chooseShrineOption(index);
    options.appendChild(button);
  });
}

function chooseShrineOption(index) {
  const shrine = getShrineAt(G.player.x, G.player.y);
  if (!shrine || shrine.used) return;
  const choiceRef = shrine.options[index];
  const choice = getShrineOption(choiceRef?.id);
  if (!choice) return;

  choice.apply();
  shrine.used = true;
  G.map.cells[G.player.y][G.player.x].entity = null;
  playS('magic');
  addLog(`Shrine boon claimed: ${choice.title}.`, 'loot');
  updateStats(false);
  updateHUD();
  renderMap();
  saveG();
  closeAllPanels();
}

function openBlacksmith() {
  const goldDisplay = document.getElementById('bs-gold');
  const content = document.getElementById('bs-content');
  if (!goldDisplay || !content) return;

  goldDisplay.textContent = `${G.gold}G`;
  const categories = {};
  BLUEPRINTS.forEach((blueprint) => {
    if (!categories[blueprint.cat]) categories[blueprint.cat] = [];
    categories[blueprint.cat].push(blueprint);
  });

  content.innerHTML = '';
  Object.entries(categories).forEach(([category, blueprints]) => {
    const section = document.createElement('div');
    section.className = 'shop-section';
    section.innerHTML = `<div class="shop-section-title">${category}</div>`;

    blueprints.forEach((blueprint) => {
      const canCraft = canCraftBP(blueprint);
      const afford = G.gold >= blueprint.goldCost;
      const ready = canCraft && afford;
      const card = document.createElement('div');
      card.className = `bp-card${ready ? ' bp-ready' : ''}`;
      card.style.opacity = ready || canCraft ? '1' : '0.68';
      card.innerHTML = `
        <div class="bp-header">
          <span class="bp-icon">${glyphForThing(blueprint)}</span>
          <div class="bp-info">
            <div class="bp-name">${blueprint.name} <span class="tier-${blueprint.tier}">[T${blueprint.tier}]</span></div>
            <div class="bp-stats">${formatEffectStats(blueprint.effect)}</div>
          </div>
          <div class="bp-cost ${afford ? '' : 'cant-afford'}">${blueprint.goldCost}G</div>
        </div>
        <div class="bp-mats">${blueprint.mats.map((matReq) => {
          const material = MATERIALS[matReq.id];
          const have = countMat(matReq.id);
          const ok = have >= matReq.qty;
          return `<span class="mat-tag ${ok ? 'mat-ok' : 'mat-missing'}">${glyphForThing(material)} ${material?.name || matReq.id} ${have}/${matReq.qty}</span>`;
        }).join('')}</div>
        <div class="bp-hint">${ready ? 'Ready to craft.' : `${!afford ? 'Need more gold. ' : ''}${getMissingMats(blueprint).join(', ')}`.trim() || 'Gather more materials.'}</div>
      `;
      if (ready) card.onclick = () => craftItem(blueprint.id);
      section.appendChild(card);
    });

    content.appendChild(section);
  });
}

function craftItem(bpId) {
  const blueprint = BLUEPRINTS.find((entry) => entry.id === bpId);
  if (!blueprint) return;
  if (!canCraftBP(blueprint)) {
    addLog('Missing forging materials.', 'damage');
    return;
  }
  if (G.gold < blueprint.goldCost) {
    addLog(`Need ${blueprint.goldCost}G to craft that.`, 'damage');
    return;
  }
  consumeMaterials(blueprint.mats);
  G.gold -= blueprint.goldCost;

  const crafted = {
    ...blueprint,
    uid: Math.random().toString(36).slice(2),
    desc: `Forged at the blacksmith. ${blueprint.desc || ''}`.trim()
  };
  delete crafted.mats;
  delete crafted.goldCost;
  delete crafted.cat;

  G.inventory.push(crafted);
  playS('loot');
  addLog(`Forged ${crafted.name}.`, 'loot');
  updateStats(false);
  updateHUD();
  openBlacksmith();
  saveG();
}

function renderRecipe(recipe, isMage) {
  const canBrew = recipe.mats.every((matReq) => countMat(matReq.id) >= matReq.qty);
  const afford = G.gold >= recipe.goldCost;
  const eligible = !recipe.mageOnly || isMage;
  const ready = canBrew && afford && eligible;
  const card = document.createElement('div');
  card.className = `bp-card${ready ? ' bp-ready' : ''}`;
  card.style.opacity = ready || canBrew ? '1' : '0.68';
  card.innerHTML = `
    <div class="bp-header">
      <span class="bp-icon">${glyphForThing(recipe.result || recipe)}</span>
      <div class="bp-info">
        <div class="bp-name">${recipe.name}${recipe.mageOnly ? ' <span style="color:var(--purple);font-size:10px">MAGE</span>' : ''}</div>
        <div class="bp-stats">${recipe.desc}${recipe.mageOnly && !isMage ? ' Mage only.' : ''}</div>
      </div>
      <div class="bp-cost ${afford ? '' : 'cant-afford'}">${recipe.goldCost}G</div>
    </div>
    <div class="bp-mats">${recipe.mats.map((matReq) => {
      const material = MATERIALS[matReq.id];
      const have = countMat(matReq.id);
      const ok = have >= matReq.qty;
      return `<span class="mat-tag ${ok ? 'mat-ok' : 'mat-missing'}">${glyphForThing(material)} ${material?.name || matReq.id} ${have}/${matReq.qty}</span>`;
    }).join('')}</div>
    <div class="bp-hint">${ready ? 'Ready to brew.' : `${!afford ? 'Need more gold. ' : ''}${recipe.mageOnly && !isMage ? 'Requires Chaos Wizard. ' : ''}${getMissingMats(recipe).join(', ')}`.trim() || 'Gather more materials.'}</div>
  `;
  if (ready) card.onclick = () => brewRecipe(recipe.id);
  return card;
}

function openAlchemist() {
  const goldDisplay = document.getElementById('alch-gold');
  const content = document.getElementById('alch-content');
  if (!goldDisplay || !content) return;

  const isMage = G.player.classId === 'mage';
  goldDisplay.textContent = `${G.gold}G`;
  content.innerHTML = '';

  const intro = document.createElement('div');
  intro.className = 'shop-section';
  intro.innerHTML = `<div class="shop-desc" style="line-height:1.5;color:${isMage ? 'var(--purple)' : 'var(--gray)'}">${isMage ? 'You can brew the full chaos menu on this floor.' : 'You can buy standard brews here. Mage-only experiments stay locked.'}</div>`;
  content.appendChild(intro);

  const standard = ALCH_RECIPES.filter((recipe) => !recipe.mageOnly);
  const mage = ALCH_RECIPES.filter((recipe) => recipe.mageOnly);

  if (standard.length) {
    const section = document.createElement('div');
    section.className = 'shop-section';
    section.innerHTML = '<div class="shop-section-title">Standard Brews</div>';
    standard.forEach((recipe) => section.appendChild(renderRecipe(recipe, isMage)));
    content.appendChild(section);
  }

  if (mage.length) {
    const section = document.createElement('div');
    section.className = 'shop-section';
    section.innerHTML = '<div class="shop-section-title">Chaos Wizard Recipes</div>';
    mage.forEach((recipe) => section.appendChild(renderRecipe(recipe, isMage)));
    content.appendChild(section);
  }
}

function brewRecipe(recipeId) {
  const recipe = ALCH_RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe) return;
  if (recipe.mageOnly && G.player.classId !== 'mage') {
    addLog('Only the Chaos Wizard knows that brew.', 'damage');
    return;
  }
  if (!recipe.mats.every((matReq) => countMat(matReq.id) >= matReq.qty)) {
    addLog('Missing ingredients for that brew.', 'damage');
    return;
  }
  if (G.gold < recipe.goldCost) {
    addLog(`Need ${recipe.goldCost}G for that brew.`, 'damage');
    return;
  }
  consumeMaterials(recipe.mats);
  G.gold -= recipe.goldCost;
  const brewed = recipe.result.type === 'material' && recipe.result.matId
    ? (makeMaterial(recipe.result.matId) || { ...recipe.result, uid: Math.random().toString(36).slice(2) })
    : { ...recipe.result, uid: Math.random().toString(36).slice(2) };
  G.inventory.push(brewed);
  playS('magic');
  addLog(`Brewed ${brewed.name}.`, 'loot');
  updateHUD();
  openAlchemist();
  saveG();
}

function grabItem() {
  const cell = G.map.cells[G.player.y][G.player.x];
  const item = G.items.find((entry) => entry.x === G.player.x && entry.y === G.player.y);

  if (cell.entity === 'stairs' || cell.entity === 'pit') {
    descend();
    return;
  }
  if (cell.entity === 'shop') {
    togglePanel('shop');
    return;
  }
  if (cell.entity === 'blacksmith') {
    togglePanel('blacksmith');
    return;
  }
  if (cell.entity === 'alchemist') {
    togglePanel('alchemist');
    return;
  }
  if (cell.entity === 'shrine') {
    togglePanel('shrine');
    return;
  }

  if (!item) {
    addLog('Nothing here but dust bunnies.', 'funny');
    return;
  }

  if (G.inventory.length >= G.invSlots) {
    addLog('Inventory is full.', 'funny');
    return;
  }

  G.items = G.items.filter((entry) => entry.uid !== item.uid);
  if (item.type === 'gold') {
    const amount = item.effect.gold || 10;
    G.gold += amount;
    playS('gold');
    addLog(`Picked up ${amount}G.`, 'loot');
  } else {
    G.inventory.push(item);
    playS('pickup');
    addLog(`Picked up ${item.name}.`, 'loot');
  }

  updateStats(false);
  updateHUD();
  renderMap();
  saveG();
}

function updateInventory() {
  const grid = document.getElementById('inv-grid');
  const count = document.getElementById('inv-count');
  const max = document.getElementById('inv-max');
  if (!grid) return;

  if (count) count.textContent = G.inventory.length;
  if (max) max.textContent = G.invSlots;

  grid.innerHTML = '';
  G.inventory.forEach((item) => {
    const equipped = [G.equippedWeapon?.uid, G.equippedArmor?.uid, G.equippedRing?.uid].includes(item.uid);
    const el = document.createElement('div');
    el.className = `isl ${equipped ? 'equipped' : ''}`;
    el.innerHTML = `<span>${glyphForThing(item)}</span>${item.tier ? `<div class="isl-tier tier-${item.tier}">${item.tier}</div>` : ''}`;
    el.onclick = () => showItemPop(item);
    grid.appendChild(el);
  });
}

function showItemPop(item) {
  const popup = document.getElementById('itempop');
  if (!popup) return;
  popup.classList.add('active');

  document.getElementById('icip').textContent = glyphForThing(item);
  document.getElementById('icname').textContent = item.name;

  const tierEl = document.getElementById('ictier');
  const label = item.tier ? `TIER ${item.tier} ${item.type.toUpperCase()}` : item.type.toUpperCase();
  tierEl.textContent = label;
  tierEl.className = `ictier ${item.tier ? `tier-${item.tier}` : ''}`.trim();

  const descEl = document.getElementById('icdesc');
  const element = item.element && ELEMENTS[item.element] ? ELEMENTS[item.element] : null;
  if (element) {
    descEl.innerHTML = `<span style="color:${element.color}">${element.icon} ${item.element.toUpperCase()} AFFINITY</span><br><span class="fs-6 text-gray">${item.desc || ''}</span>`;
  } else {
    descEl.textContent = item.desc || 'A sturdy item found in the dungeon deeps.';
  }
  document.getElementById('icstats').innerHTML = describeItemStats(item);

  const action = document.getElementById('icbtn-action');
  const equippable = ['weapon', 'armor', 'ring'].includes(item.type);
  const equipped = [G.equippedWeapon?.uid, G.equippedArmor?.uid, G.equippedRing?.uid].includes(item.uid);

  action.disabled = false;
  if (equippable) {
    action.textContent = equipped ? 'UNEQUIP' : 'EQUIP';
    action.onclick = () => {
      equipItem(item);
      closeItemPop();
    };
  } else if (item.isHp || item.isMp || item.effect?.bomb || item.type === 'elixir') {
    action.textContent = 'USE';
    action.onclick = () => {
      useItem(item);
      closeItemPop();
    };
  } else {
    action.textContent = 'STASHED';
    action.onclick = () => {};
    action.disabled = true;
  }
}

function closeItemPop() {
  document.getElementById('itempop').classList.remove('active');
}

function equipItem(item) {
  if (item.type === 'weapon') {
    G.equippedWeapon = G.equippedWeapon?.uid === item.uid ? null : item;
  } else if (item.type === 'armor') {
    G.equippedArmor = G.equippedArmor?.uid === item.uid ? null : item;
  } else if (item.type === 'ring') {
    G.equippedRing = G.equippedRing?.uid === item.uid ? null : item;
  }

  playS('pickup');
  updateStats(false);
  updateHUD();
  saveG();
}

function unequipItem(item) {
  if (G.equippedWeapon?.uid === item.uid) G.equippedWeapon = null;
  if (G.equippedArmor?.uid === item.uid) G.equippedArmor = null;
  if (G.equippedRing?.uid === item.uid) G.equippedRing = null;
  updateStats(false);
}

function addFloorBuff(stat, val, label) {
  if (!Array.isArray(G.elixirBuffs)) G.elixirBuffs = [];
  G.elixirBuffs.push({ stat, val, label: label || stat.toUpperCase() });
}

function clearFloorBuffs() {
  if (!Array.isArray(G.elixirBuffs) || !G.elixirBuffs.length) return;
  G.elixirBuffs = [];
  updateStats(false);
  addLog('The temporary alchemy buffs faded on the next floor.', 'info');
}

function applyItemEffect(item, options = {}) {
  const { fromCombat = false } = options;
  let used = false;

  if (item.isHp) {
    G.player.hp = item.effect.hpFull ? G.player.maxHp : Math.min(G.player.maxHp, G.player.hp + (item.effect.hp || 40));
    playS('heal');
    addLog(`Used ${item.name}.`, 'heal');
    used = true;
  } else if (item.isMp) {
    G.player.mp = item.effect.mpFull ? G.player.maxMp : Math.min(G.player.maxMp, G.player.mp + (item.effect.mp || 50));
    playS('magic');
    addLog(`Used ${item.name}.`, 'heal');
    used = true;
  } else if (item.effect?.bomb) {
    if (!G.currentEnemy) {
      addLog('Save the bomb for combat.', 'info');
      return false;
    }
    const damage = item.effect.bomb;
    G.currentEnemy.hp -= damage;
    playS('crit');
    doVfx('crit');
    hfl('enemy');
    addCombatLog(`Bombed ${G.currentEnemy.name} for ${damage}.`);
    addLog(`Bomb exploded for ${damage} damage.`, 'loot');
    used = true;
  } else if (item.type === 'elixir') {
    if (item.effect?.elixirAtk) addFloorBuff('atk', item.effect.elixirAtk, 'ATK');
    if (item.effect?.elixirDef) addFloorBuff('def', item.effect.elixirDef, 'DEF');
    if (item.effect?.elixirSpd) addFloorBuff('spd', item.effect.elixirSpd, 'SPD');
    if (item.effect?.elixirCrit) addFloorBuff('crit', item.effect.elixirCrit, 'CRIT');
    if (item.effect?.chaos) {
      const chaosOutcomes = [
        () => {
          G.player.hp = G.player.maxHp;
          addLog('Chaos brew refilled your HP.', 'heal');
        },
        () => {
          G.player.mp = G.player.maxMp;
          addLog('Chaos brew refilled your MP.', 'heal');
        },
        () => {
          addFloorBuff('atk', 12, 'ATK');
          addFloorBuff('crit', 12, 'CRIT');
          addLog('Chaos brew spiked your damage output.', 'loot');
        },
        () => {
          G.gold += 80;
          addLog('Chaos brew coughed up extra gold.', 'loot');
        },
        () => {
          G.player.hp = Math.max(1, G.player.hp - 20);
          addLog('Chaos brew bit back. -20 HP.', 'damage');
        }
      ];
      chaosOutcomes[Math.floor(Math.random() * chaosOutcomes.length)]();
    } else {
      addLog(`Used ${item.name}. Temporary buffs last this floor only.`, 'heal');
    }
    playS('magic');
    used = true;
  }

  if (!used) {
    if (!fromCombat) addLog(`${item.name} cannot be used yet.`, 'info');
    return false;
  }

  updateStats(false);
  updateHUD();
  if (G.currentEnemy && typeof updateCombatHUD === 'function') updateCombatHUD();
  if (G.currentEnemy && typeof updateCombatSkills === 'function') updateCombatSkills();
  return true;
}

function useItem(item, options = {}) {
  if (!applyItemEffect(item, options)) return false;

  G.inventory = G.inventory.filter((entry) => entry.uid !== item.uid);
  updateHUD();
  saveG();
  return true;
}

function usePot(type) {
  const potion = G.inventory.find((item) => (type === 'hp' ? item.isHp : item.isMp));
  if (potion) {
    useItem(potion);
  } else {
    addLog(`No ${type.toUpperCase()} potions left.`, 'funny');
  }
}

function updateStats(fullRestore = false) {
  if (!G.player) return;

  const level = G.player.level || 1;
  const classData = G.player.classData;
  const weapon = G.equippedWeapon;
  const armor = G.equippedArmor;
  const ring = G.equippedRing;

  const previousMaxHp = G.player.maxHp || classData.hp;
  const previousMaxMp = G.player.maxMp || classData.mp;
  const baseHp = classData.hp + (level - 1) * 20;
  const baseMp = classData.mp + (level - 1) * 10;
  const baseAtk = classData.atk + (level - 1) * 2;
  const baseDef = classData.def + (level - 1);
  const floorBuffs = Array.isArray(G.elixirBuffs) ? G.elixirBuffs : [];
  const runBuffs = Array.isArray(G.runBuffs) ? G.runBuffs : [];
  const allBuffs = [...runBuffs, ...floorBuffs];
  const buffTotal = (stat) => allBuffs.filter((buff) => buff.stat === stat).reduce((sum, buff) => sum + (buff.val || 0), 0);

  G.player.maxHp = baseHp + (weapon?.effect?.hp || 0) + (armor?.effect?.hp || 0) + (ring?.effect?.hp || 0) + buffTotal('hp');
  G.player.maxMp = baseMp + (weapon?.effect?.mp || 0) + (armor?.effect?.mp || 0) + (ring?.effect?.mp || 0) + buffTotal('mp');
  G.player.atk = baseAtk + (weapon?.effect?.atk || 0) + (armor?.effect?.atk || 0) + (ring?.effect?.atk || 0) + buffTotal('atk');
  G.player.def = baseDef + (weapon?.effect?.def || 0) + (armor?.effect?.def || 0) + (ring?.effect?.def || 0) + buffTotal('def');
  G.player.spd = classData.spd + (weapon?.effect?.spd || 0) + (armor?.effect?.spd || 0) + (ring?.effect?.spd || 0) + buffTotal('spd');
  G.player.crit = classData.crit + (weapon?.effect?.crit || 0) + (armor?.effect?.crit || 0) + (ring?.effect?.crit || 0) + buffTotal('crit');

  if (fullRestore) {
    G.player.hp = G.player.maxHp;
    G.player.mp = G.player.maxMp;
  } else {
    if (G.player.maxHp < previousMaxHp) G.player.hp = Math.min(G.player.hp, G.player.maxHp);
    else G.player.hp = Math.min(G.player.maxHp, G.player.hp);
    if (G.player.maxMp < previousMaxMp) G.player.mp = Math.min(G.player.mp, G.player.maxMp);
    else G.player.mp = Math.min(G.player.maxMp, G.player.mp);
  }
}
