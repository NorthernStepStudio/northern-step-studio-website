// Core engine: state, save/load, meta progression, and input.
let G = {};
const SK = 'doomed_v3';
const SMK = 'doomed_meta_v2';
let openPanel = null;
let fuseSlot = [null, null];
let fuseSelectTarget = 0;
let pendingCustomSprite = '';

const META_UPGRADES = [
  { id: 'inv_slots', name: 'BOTTOMLESS POCKETS', emoji: 'BP', desc: '+2 inventory slots per level.', maxLevel: 4, baseCost: 3, costPerLevel: 3, apply: (lvl) => ({ invBonus: lvl * 2 }) },
  { id: 'gold_gain', name: 'GOLD MAGNET', emoji: 'GG', desc: '+15% gold gain per level.', maxLevel: 4, baseCost: 4, costPerLevel: 4, apply: (lvl) => ({ goldBonus: lvl * 0.15 }) },
  { id: 'drop_rate', name: 'LUCKY DROPS', emoji: 'LD', desc: '+10% item drop rate per level.', maxLevel: 3, baseCost: 3, costPerLevel: 5, apply: (lvl) => ({ dropBonus: lvl * 0.10 }) },
  { id: 'start_mat', name: 'STARTER KIT', emoji: 'SK', desc: 'Start each run with 2 crafting materials.', maxLevel: 1, baseCost: 5, costPerLevel: 0, apply: (lvl) => ({ startMat: lvl > 0 }) },
  { id: 'vendor_reroll', name: 'MERCHANT BUDDY', emoji: 'MB', desc: 'Start each run with 1 free shop reroll.', maxLevel: 1, baseCost: 6, costPerLevel: 0, apply: (lvl) => ({ vendorReroll: lvl > 0 }) },
  { id: 'start_potion', name: 'MEDIC PACK', emoji: 'MP', desc: 'Start each run with 1 HP potion.', maxLevel: 1, baseCost: 4, costPerLevel: 0, apply: (lvl) => ({ startPotion: lvl > 0 }) },
  { id: 'corruption_slow', name: 'DOOM RESISTANCE', emoji: 'DR', desc: '-20% doom gain per level.', maxLevel: 3, baseCost: 5, costPerLevel: 6, apply: (lvl) => ({ corruptionSlow: lvl * 0.20 }) },
  { id: 'xp_boost', name: 'QUICK LEARNER', emoji: 'QL', desc: '+15% XP gain per level.', maxLevel: 3, baseCost: 3, costPerLevel: 4, apply: (lvl) => ({ xpBonus: lvl * 0.15 }) }
];

function playS(type) {
  if (!type) return;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  const ctx = new AudioCtor();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  let freq = 440;
  let dur = 0.1;
  let vol = 0.1;
  let wave = 'square';
  let sweep = 0;

  if (type === 'hit') { freq = 150; dur = 0.15; vol = 0.15; wave = 'sine'; sweep = -80; }
  else if (type === 'crit') { freq = 80; dur = 0.30; vol = 0.20; wave = 'sawtooth'; sweep = -40; }
  else if (type === 'loot') { freq = 880; dur = 0.20; vol = 0.10; wave = 'triangle'; sweep = 440; }
  else if (type === 'gold') { freq = 1200; dur = 0.08; vol = 0.08; wave = 'sine'; sweep = 200; }
  else if (type === 'magic') { freq = 600; dur = 0.40; vol = 0.12; wave = 'square'; sweep = -400; }
  else if (type === 'heal') { freq = 440; dur = 0.50; vol = 0.10; wave = 'sine'; sweep = 600; }
  else if (type === 'pickup') { freq = 1000; dur = 0.05; vol = 0.05; wave = 'sine'; }
  else if (type === 'levelup') { freq = 440; dur = 0.80; vol = 0.15; wave = 'square'; sweep = 880; }
  else if (type === 'death') { freq = 100; dur = 0.50; vol = 0.20; wave = 'sawtooth'; sweep = -90; }

  osc.type = wave;
  osc.frequency.setValueAtTime(freq, now);
  if (sweep) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + sweep), now + dur);
  }
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
  osc.start(now);
  osc.stop(now + dur);
  setTimeout(() => ctx.close(), (dur + 0.1) * 1000);
}

function blankMeta() {
  return { shards: 0, upgrades: {}, totalRuns: 0, wins: 0, bestFloor: 0, bestKills: 0 };
}

function loadMeta() {
  try {
    const raw = localStorage.getItem(SMK);
    return raw ? { ...blankMeta(), ...JSON.parse(raw) } : blankMeta();
  } catch (error) {
    return blankMeta();
  }
}

function saveMeta(meta) {
  try {
    localStorage.setItem(SMK, JSON.stringify({ ...blankMeta(), ...meta }));
  } catch (error) {
    // ignore localStorage quota issues in prototype mode
  }
}

function getMetaBonus() {
  const meta = loadMeta();
  const bonus = {};
  META_UPGRADES.forEach((upgrade) => {
    const level = meta.upgrades[upgrade.id] || 0;
    if (level > 0) {
      Object.assign(bonus, upgrade.apply(level));
    }
  });
  return bonus;
}

function getUpgradeCost(upgrade, currentLevel) {
  return upgrade.baseCost + currentLevel * upgrade.costPerLevel;
}

function refreshTitleMeta() {
  const meta = loadMeta();
  const shardEl = document.getElementById('title-shard-count');
  if (shardEl) shardEl.textContent = meta.shards;
}

function renderContinueState() {
  const button = document.getElementById('continue-btn');
  const floorEl = document.getElementById('sfl');
  if (!button || !floorEl) return;

  try {
    const raw = localStorage.getItem(SK);
    if (!raw) {
      button.classList.add('hidden');
      floorEl.textContent = '1';
      return;
    }

    const state = JSON.parse(raw);
    floorEl.textContent = state.floor || 1;
    button.classList.remove('hidden');
  } catch (error) {
    button.classList.add('hidden');
    floorEl.textContent = '1';
  }
}

function getPlayerSpriteSrc() {
  return G.player?.customSprite || G.player?.classData?.sprite || '';
}

function getPlayerSpriteMarkup(size = 28) {
  const src = getPlayerSpriteSrc();
  if (!src) return '@';
  return `<img src="${src}" style="width:${size}px;height:${size}px;image-rendering:pixelated;" alt="Hero">`;
}

function glyphForEnemy(enemy) {
  if (!enemy?.name) return 'E';
  if (enemy.boss || enemy.enemyType === 'boss') return 'B';
  const words = enemy.name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const pick = words[words.length - 1] || words[0] || 'Enemy';
  return pick.charAt(0).toUpperCase() || 'E';
}

function getStationPanelConfig(panelId) {
  return {
    shop: { entity: 'shop', label: 'merchant' },
    blacksmith: { entity: 'blacksmith', label: 'blacksmith' },
    alchemist: { entity: 'alchemist', label: 'alchemist' },
    shrine: { entity: 'shrine', label: 'shrine' }
  }[panelId] || null;
}

function loadSprite(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const result = event.target?.result;
    if (!result) return;

    if (G.player) {
      G.player.customSprite = result;
      showGS();
      if (G.currentEnemy) {
        const combatSprite = document.getElementById('cpsprite');
        if (combatSprite) combatSprite.innerHTML = getPlayerSpriteMarkup(42);
      }
      saveG();
    } else {
      pendingCustomSprite = result;
    }
  };
  reader.readAsDataURL(file);
}

function buildBaseState(clsId) {
  const classData = CLS[clsId];
  const metaBonus = getMetaBonus();

  return {
    player: {
      level: 1,
      hp: classData.hp,
      maxHp: classData.hp,
      mp: classData.mp,
      maxMp: classData.mp,
      atk: classData.atk,
      def: classData.def,
      spd: classData.spd,
      crit: classData.crit,
      classId: clsId,
      classData,
      customSprite: pendingCustomSprite || null,
      x: 0,
      y: 0
    },
    floor: 1,
    inventory: [],
    gold: 145,
    xp: 0,
    killCount: 0,
    enemies: [],
    items: [],
    log: [],
    doom: 0,
    currentEnemy: null,
    equippedWeapon: null,
    equippedArmor: null,
    equippedRing: null,
    invSlots: 8 + (metaBonus.invBonus || 0),
    shopStock: [],
    shopRerollsLeft: metaBonus.vendorReroll ? 1 : 0,
    elixirBuffs: [],
    runBuffs: [],
    shrineEvents: [],
    metaBonus,
    runStartedAt: Date.now()
  };
}

function resolveInventoryRef(items, ref) {
  if (!ref?.uid) return ref || null;
  return items.find((item) => item.uid === ref.uid) || ref;
}

function ensureMapStructure(savedMap) {
  if (!savedMap || !Array.isArray(savedMap.cells)) return null;
  const cells = [];
  for (let y = 0; y < MH; y += 1) {
    const row = [];
    for (let x = 0; x < MW; x += 1) {
      const src = savedMap.cells?.[y]?.[x];
      row.push({
        type: src?.type === 'floor' ? 'floor' : 'wall',
        visible: false,
        seen: !!src?.seen,
        entity: src?.entity || null
      });
    }
    cells.push(row);
  }
  return { cells, rooms: Array.isArray(savedMap.rooms) ? savedMap.rooms : [] };
}

function normalizeGameState(rawState) {
  const state = rawState || {};
  const player = state.player || {};
  const classData = CLS[player.classId] || CLS.warrior;
  const inventory = Array.isArray(state.inventory) ? state.inventory : [];
  const metaBonus = state.metaBonus || getMetaBonus();

  const normalized = {
    floor: state.floor || 1,
    map: ensureMapStructure(state.map) || null,
    inventory,
    gold: state.gold ?? 0,
    xp: state.xp ?? 0,
    killCount: state.killCount ?? 0,
    enemies: Array.isArray(state.enemies) ? state.enemies : [],
    items: Array.isArray(state.items) ? state.items : [],
    log: Array.isArray(state.log) ? state.log : [],
    doom: state.doom ?? 0,
    currentEnemy: null,
    equippedWeapon: null,
    equippedArmor: null,
    equippedRing: null,
    invSlots: state.invSlots || (8 + (metaBonus.invBonus || 0)),
    shopStock: Array.isArray(state.shopStock) ? state.shopStock : [],
    shopRerollsLeft: typeof state.shopRerollsLeft === 'number' ? state.shopRerollsLeft : (metaBonus.vendorReroll ? 1 : 0),
    elixirBuffs: Array.isArray(state.elixirBuffs) ? state.elixirBuffs : [],
    runBuffs: Array.isArray(state.runBuffs) ? state.runBuffs : [],
    shrineEvents: Array.isArray(state.shrineEvents) ? state.shrineEvents : [],
    metaBonus,
    runStartedAt: state.runStartedAt || Date.now(),
    player: {
      level: player.level || 1,
      hp: player.hp ?? classData.hp,
      maxHp: player.maxHp ?? classData.hp,
      mp: player.mp ?? classData.mp,
      maxMp: player.maxMp ?? classData.mp,
      atk: player.atk ?? classData.atk,
      def: player.def ?? classData.def,
      spd: player.spd ?? classData.spd,
      crit: player.crit ?? classData.crit,
      classId: player.classId || 'warrior',
      classData,
      customSprite: player.customSprite || null,
      x: player.x ?? 0,
      y: player.y ?? 0
    }
  };

  normalized.equippedWeapon = resolveInventoryRef(inventory, state.equippedWeapon);
  normalized.equippedArmor = resolveInventoryRef(inventory, state.equippedArmor);
  normalized.equippedRing = resolveInventoryRef(inventory, state.equippedRing);
  return normalized;
}

function serializeGameState() {
  if (!G.player) return null;

  const player = { ...G.player };
  delete player.classData;

  const map = G.map ? {
    cells: G.map.cells.map((row) => row.map((cell) => ({
      type: cell.type,
      seen: !!cell.seen,
      entity: cell.entity || null
    })))
  } : null;

  return {
    ...G,
    currentEnemy: null,
    map,
    player
  };
}

function showGS() {
  const title = document.getElementById('title-screen');
  const game = document.getElementById('game-screen');
  if (title) title.style.display = 'none';
  if (game) game.style.display = 'flex';

  const hSprite = document.getElementById('hsprite');
  if (hSprite && G.player) {
    hSprite.innerHTML = getPlayerSpriteMarkup(28);
  }
}

function updateHUD() {
  if (!G.player) return;

  document.getElementById('hname').textContent = G.player.classData.name;
  document.getElementById('hlvl').textContent = `LV.${G.player.level}`;
  document.getElementById('thp').textContent = `${Math.ceil(G.player.hp)}/${G.player.maxHp}`;
  document.getElementById('bhp').style.width = `${(G.player.hp / G.player.maxHp) * 100}%`;
  document.getElementById('tmp').textContent = `${Math.ceil(G.player.mp)}/${G.player.maxMp}`;
  document.getElementById('bmp').style.width = `${(G.player.mp / G.player.maxMp) * 100}%`;
  document.getElementById('hgo').textContent = `G ${G.gold}`;
  document.getElementById('hfl').textContent = `F ${G.floor}`;
  document.getElementById('hki').textContent = `K ${G.killCount}`;

  const weapon = G.equippedWeapon;
  const elementIcon = weapon?.element && ELEMENTS[weapon.element] ? ELEMENTS[weapon.element].icon : '';
  document.getElementById('hwpn').textContent = weapon ? `${elementIcon} ${weapon.name}`.trim() : 'Unarmed';
  document.getElementById('hatk').textContent = `ATK ${G.player.atk}`;
  document.getElementById('xp-fill').style.width = `${Math.min(100, (G.xp / (G.player.level * 50)) * 100)}%`;

  const doomFill = document.getElementById('doom-fill');
  const doomStrip = document.getElementById('doom-strip');
  doomFill.style.width = `${Math.min(100, G.doom)}%`;
  doomStrip.classList.remove('doom-tier-1', 'doom-tier-2', 'doom-tier-max');
  document.body.classList.remove('corrupted-60', 'corrupted-90');
  if (G.doom >= 90) {
    doomStrip.classList.add('doom-tier-max');
    document.body.classList.add('corrupted-90');
  } else if (G.doom >= 60) {
    doomStrip.classList.add('doom-tier-2');
    document.body.classList.add('corrupted-60');
  } else if (G.doom >= 30) {
    doomStrip.classList.add('doom-tier-1');
  }

  if (openPanel === 'inv' && typeof updateInventory === 'function') {
    updateInventory();
  }
}

function addLog(txt, cls = 'info') {
  if (!G.log) G.log = [];
  G.log.unshift({ txt, cls });
  if (G.log.length > 80) G.log.pop();

  const list = document.getElementById('log-list');
  if (!list) return;
  const el = document.createElement('div');
  el.className = `le ${cls}`;
  el.textContent = `> ${txt}`;
  list.prepend(el);
}

function gainDoom(amount) {
  const modifier = Math.max(0, 1 - (G.metaBonus?.corruptionSlow || 0));
  G.doom = Math.min(100, G.doom + amount * modifier);
  if (G.doom >= 100) {
    G.player.hp = Math.max(0, G.player.hp - 1);
    if (G.player.hp <= 0) {
      die();
    }
  }
}

function handleMove(tx, ty) {
  if (!G.player || G.currentEnemy) return;
  if (!G.map || !Array.isArray(G.map.cells)) {
    generateMap();
    placeEntities();
    updateStats(true);
    renderMap();
    updateHUD();
  }

  const dx = Math.sign(tx - G.player.x);
  const dy = Math.sign(ty - G.player.y);

  if (dx === 0 && dy === 0) {
    gainDoom(0.5);
    updateHUD();
    saveG();
    return;
  }

  let nx = G.player.x + dx;
  let ny = G.player.y + dy;
  if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) return;

  let targetCell = G.map.cells[ny][nx];
  if (targetCell.type === 'wall' && dx !== 0 && dy !== 0) {
    const horizontal = G.map.cells[G.player.y][nx];
    const vertical = G.map.cells[ny][G.player.x];
    if (horizontal.type !== 'wall') {
      ny = G.player.y;
      targetCell = horizontal;
    } else if (vertical.type !== 'wall') {
      nx = G.player.x;
      targetCell = vertical;
    }
  }

  if (targetCell.type === 'wall') {
    return;
  }

  const enemy = G.enemies.find((entry) => entry.x === nx && entry.y === ny);
  if (enemy) {
    gainDoom(0.5);
    startCombat(enemy);
    return;
  }

  gainDoom(0.5);
  G.player.x = nx;
  G.player.y = ny;
  updateVision(nx, ny);
  renderMap();

  if (targetCell.entity === 'stairs' || targetCell.entity === 'pit') {
    setTimeout(descend, 100);
    return;
  }

  if (targetCell.entity === 'shop') {
    addLog('A wandering merchant appears.', 'shop');
    setTimeout(() => togglePanel('shop'), 120);
  } else if (targetCell.entity === 'blacksmith') {
    addLog('A blacksmith grunts and points at the forge.', 'info');
    setTimeout(() => togglePanel('blacksmith'), 120);
  } else if (targetCell.entity === 'alchemist') {
    if (G.player.classId === 'mage') addLog('The alchemist slides over the weird recipes.', 'info');
    else addLog('The alchemist offers basic brews and a suspicious smile.', 'info');
    setTimeout(() => togglePanel('alchemist'), 120);
  } else if (targetCell.entity === 'shrine') {
    addLog('A void shrine hums with dangerous generosity.', 'loot');
    setTimeout(() => togglePanel('shrine'), 120);
  } else {
    const item = G.items.find((entry) => entry.x === nx && entry.y === ny);
    if (item) {
      addLog(`Nearby: ${item.name}. Press G to grab it.`, 'info');
    }
  }

  updateHUD();
  saveG();
}

function descend() {
  if (typeof clearFloorBuffs === 'function') clearFloorBuffs();
  G.floor += 1;
  G.doom = Math.max(0, G.doom - 35);
  G.shopStock = [];
  G.currentEnemy = null;
  playS('levelup');
  addLog(`Descended to floor ${G.floor}.`, 'loot');
  generateMap();
  placeEntities();
  updateVision(G.player.x, G.player.y);
  renderMap();
  updateHUD();
  saveG();
}

function levelUp() {
  G.player.level += 1;
  playS('levelup');
  updateStats(true);
  addLog(`LEVEL UP! Reached LV.${G.player.level}.`, 'loot');
  updateHUD();
}

function calculateRunShards() {
  if (!G.player) return { total: 0, lines: [] };
  const floorScore = Math.max(0, G.floor - 1) * 15;
  const killScore = Math.floor(G.killCount * 0.5);
  const goldScore = Math.floor(G.gold / 100);
  const total = Math.floor(floorScore + killScore + goldScore);
  return {
    total,
    lines: [
      `Floors: ${floorScore}`,
      `Kills: ${killScore}`,
      `Gold: ${goldScore}`
    ]
  };
}

function saveG() {
  try {
    if (!G.player) return;
    const serialized = serializeGameState();
    if (!serialized) return;
    localStorage.setItem(SK, JSON.stringify(serialized));
    renderContinueState();
  } catch (error) {
    // ignore localStorage quota issues in prototype mode
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SK);
    if (!raw) return;
    G = normalizeGameState(JSON.parse(raw));

    if (!G.map || !Array.isArray(G.map.cells) || G.map.cells.length !== MH) {
      generateMap();
      placeEntities();
      updateStats(true);
    } else {
      updateStats(false);
    }

    showGS();
    if (!G.map || !Array.isArray(G.map.cells)) {
      updateVision(G.player.x, G.player.y);
    } else {
      updateVision(G.player.x, G.player.y);
    }
    if (typeof renderFusionGrid === 'function') renderFusionGrid();
    if (typeof checkFusionResult === 'function') checkFusionResult();
    renderMap();
    updateHUD();
    addLog('Welcome back.', 'info');
  } catch (error) {
    localStorage.removeItem(SK);
    renderContinueState();
  }
}

function selectClass(el) {
  document.querySelectorAll('.class-card').forEach((card) => card.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('start-btn').disabled = false;
  playS('pickup');
}

function startNewGame() {
  const selected = document.querySelector('.class-card.selected');
  if (!selected) return;

  G = buildBaseState(selected.dataset.class);

  const starterWeapon = WEAPON_TIERS[0].find((weapon) => weapon.id === G.player.classData.sw);
  if (starterWeapon) {
    const item = { ...starterWeapon, tier: 1, uid: `starter-${Math.random().toString(36).slice(2)}`, type: 'weapon' };
    G.inventory.push(item);
    G.equippedWeapon = item;
  }

  if (G.metaBonus.startPotion) {
    G.inventory.push({ ...CONSUMABLES[0], uid: `hp-${Math.random().toString(36).slice(2)}` });
  }
  if (G.metaBonus.startMat) {
    G.inventory.push(makeMaterial('iron_ore'));
    G.inventory.push(makeMaterial('leather'));
  }

  updateStats(true);
  generateMap();
  placeEntities();
  updateVision(G.player.x, G.player.y);
  if (typeof renderFusionGrid === 'function') renderFusionGrid();
  if (typeof checkFusionResult === 'function') checkFusionResult();
  showGS();
  updateHUD();
  addLog('Welcome to the dungeon. Try not to die immediately.', 'info');
  addLog('Floors 2+ may hide elite rooms and reckless shrines.', 'info');
  if (G.metaBonus.invBonus) addLog(`Meta bonus: +${G.metaBonus.invBonus} inventory slots.`, 'loot');
  if (G.metaBonus.vendorReroll) addLog('Meta bonus: 1 free shop reroll this run.', 'shop');
  renderMap();
  saveG();
}

function togglePanel(panelId) {
  const panel = document.getElementById(`panel-${panelId}`);
  if (!panel) return;

  const stationConfig = getStationPanelConfig(panelId);
  if (stationConfig) {
    const cell = G.map?.cells?.[G.player?.y]?.[G.player?.x];
    if (cell?.entity !== stationConfig.entity) {
      addLog(`Visit a ${stationConfig.label} tile to use that station.`, 'info');
      return;
    }
  }

  if (openPanel === panelId) {
    closeAllPanels();
    return;
  }

  closeAllPanels();
  panel.classList.add('open');
  openPanel = panelId;

  if (panelId === 'inv' && typeof updateInventory === 'function') updateInventory();
  if (panelId === 'shop' && typeof openShop === 'function') openShop();
  if (panelId === 'blacksmith' && typeof openBlacksmith === 'function') openBlacksmith();
  if (panelId === 'alchemist' && typeof openAlchemist === 'function') openAlchemist();
  if (panelId === 'shrine' && typeof openShrine === 'function') openShrine();
  if (panelId === 'stats') renderStats();
  if (panelId === 'log') {
    const list = document.getElementById('log-list');
    list.innerHTML = '';
    G.log.forEach((entry) => {
      const el = document.createElement('div');
      el.className = `le ${entry.cls}`;
      el.textContent = `> ${entry.txt}`;
      list.appendChild(el);
    });
  }
}

function closeAllPanels() {
  document.querySelectorAll('.spanel').forEach((panel) => panel.classList.remove('open'));
  openPanel = null;
}

function renderStats() {
  if (!G.player) return;
  const grid = document.getElementById('sgrid');
  if (!grid) return;

  const activeBuffs = Array.isArray(G.elixirBuffs) && G.elixirBuffs.length
    ? G.elixirBuffs.map((buff) => `${buff.label || buff.stat.toUpperCase()} +${buff.val}`).join(', ')
    : 'None';
  const runBlessings = Array.isArray(G.runBuffs) && G.runBuffs.length
    ? G.runBuffs.map((buff) => `${buff.label || buff.stat.toUpperCase()} +${buff.val}`).join(', ')
    : 'None';

  grid.innerHTML = `
    <div class="sgi"><span class="sgk">LEVEL</span><span class="sgv">${G.player.level}</span></div>
    <div class="sgi"><span class="sgk">HP / MP</span><span class="sgv">${Math.ceil(G.player.hp)} / ${Math.ceil(G.player.mp)}</span></div>
    <div class="sgi"><span class="sgk">ATK</span><span class="sgv">${G.player.atk}</span></div>
    <div class="sgi"><span class="sgk">DEF</span><span class="sgv">${G.player.def}</span></div>
    <div class="sgi"><span class="sgk">SPD</span><span class="sgv">${G.player.spd}</span></div>
    <div class="sgi"><span class="sgk">CRIT</span><span class="sgv">${G.player.crit}%</span></div>
    <div class="sgi" style="grid-column: span 2;"><span class="sgk">CORRUPTION</span><span class="sgv" style="color:#ff2266">${Math.floor(G.doom)}%</span></div>
    <div class="sgi" style="grid-column: span 2;"><span class="sgk">RUN BLESSINGS</span><span class="sgv">${runBlessings}</span></div>
    <div class="sgi" style="grid-column: span 2;"><span class="sgk">FLOOR BUFFS</span><span class="sgv">${activeBuffs}</span></div>
  `;
}

function openMetaScreen() {
  const screen = document.getElementById('meta-screen');
  if (!screen) return;
  screen.style.display = 'block';
  renderMetaScreen();
}

function closeMetaScreen() {
  const screen = document.getElementById('meta-screen');
  if (screen) screen.style.display = 'none';
}

function purchaseMetaUpgrade(id) {
  const upgrade = META_UPGRADES.find((entry) => entry.id === id);
  if (!upgrade) return;

  const meta = loadMeta();
  const level = meta.upgrades[id] || 0;
  if (level >= upgrade.maxLevel) return;

  const cost = getUpgradeCost(upgrade, level);
  if (meta.shards < cost) return;

  meta.shards -= cost;
  meta.upgrades[id] = level + 1;
  saveMeta(meta);
  refreshTitleMeta();
  renderMetaScreen();
}

function renderMetaScreen() {
  const meta = loadMeta();
  const display = document.getElementById('meta-shards-display');
  const list = document.getElementById('meta-upgrades-list');
  if (!display || !list) return;

  display.textContent = `${meta.shards} Doom Shards available`;
  list.innerHTML = '';

  META_UPGRADES.forEach((upgrade) => {
    const level = meta.upgrades[upgrade.id] || 0;
    const maxed = level >= upgrade.maxLevel;
    const cost = getUpgradeCost(upgrade, level);
    const canAfford = meta.shards >= cost;
    const card = document.createElement('div');
    card.className = `meta-upgrade-card${maxed ? ' maxed' : ''}`;
    card.innerHTML = `
      <div class="meta-upgrade-icon">${upgrade.emoji}</div>
      <div class="meta-upgrade-info">
        <div class="meta-upgrade-name">${upgrade.name}</div>
        <div class="meta-upgrade-desc">${upgrade.desc}</div>
        <div class="meta-upgrade-level">${maxed ? 'MAX' : `Lv ${level}/${upgrade.maxLevel}`}</div>
      </div>
      <div class="meta-upgrade-cost ${!canAfford && !maxed ? 'cant-afford' : ''}">${maxed ? 'MAXED' : `${cost} SH`}</div>
    `;
    if (!maxed && canAfford) {
      card.onclick = () => purchaseMetaUpgrade(upgrade.id);
    }
    list.appendChild(card);
  });
}

function showRunSummary(won) {
  const summary = calculateRunShards();
  const meta = loadMeta();
  meta.shards += summary.total;
  meta.totalRuns += 1;
  if (won) meta.wins += 1;
  meta.bestFloor = Math.max(meta.bestFloor, G.floor || 1);
  meta.bestKills = Math.max(meta.bestKills, G.killCount || 0);
  saveMeta(meta);
  refreshTitleMeta();

  localStorage.removeItem(SK);
  renderContinueState();
  closeAllPanels();
  if (typeof closeItemPop === 'function') closeItemPop();
  const combat = document.getElementById('combatov');
  if (combat) combat.classList.remove('active');

  document.getElementById('rs-title').textContent = won ? 'VICTORY' : 'YOU PERISHED';
  document.getElementById('rs-title').style.color = won ? 'var(--gold)' : 'var(--red)';
  document.getElementById('rs-sub').textContent = won
    ? 'You cleared the floor sequence and left the dungeon disappointed.'
    : `Floor ${G.floor} got you. The rats will gossip about it for days.`;

  const stats = [
    ['Floor Reached', G.floor],
    ['Enemies Killed', G.killCount],
    ['Gold Carried', `${G.gold}G`],
    ['Level Reached', G.player.level],
    ['Corruption', `${Math.floor(G.doom)}%`],
    ['Inventory Size', G.invSlots]
  ];
  document.getElementById('rs-stats').innerHTML = stats.map(([k, v]) => `<div class="rs-stat"><span class="rs-stat-k">${k}</span><span class="rs-stat-v">${v}</span></div>`).join('');
  document.getElementById('rs-shard-breakdown').innerHTML = summary.lines.map((line) => `<div>${line}</div>`).join('');
  document.getElementById('rs-shard-total').textContent = `Total earned: ${summary.total} SH (Bank: ${meta.shards} SH)`;
  document.getElementById('run-summary').style.display = 'flex';
}

function hardResetRun() {
  localStorage.removeItem(SK);
  renderContinueState();
  location.reload();
}

function die() {
  playS('death');
  showRunSummary(false);
}

window.onload = () => {
  refreshTitleMeta();
  renderContinueState();
  closeMetaScreen();
  const summary = document.getElementById('run-summary');
  if (summary) summary.style.display = 'none';
  if (typeof renderFusionGrid === 'function') renderFusionGrid();
  if (typeof checkFusionResult === 'function') checkFusionResult();
};

document.addEventListener('keydown', (event) => {
  const metaOpen = document.getElementById('meta-screen')?.style.display === 'block';
  const summaryOpen = document.getElementById('run-summary')?.style.display === 'flex';

  if (!G.player) {
    if (event.key === 'Escape' && metaOpen) closeMetaScreen();
    return;
  }

  if (summaryOpen) {
    if (event.key === 'Escape') hardResetRun();
    return;
  }

  if (event.key === 'Escape') {
    if (metaOpen) {
      closeMetaScreen();
    } else {
      closeAllPanels();
      if (typeof closeItemPop === 'function') closeItemPop();
    }
    return;
  }

  if (metaOpen) return;

  if (G.currentEnemy) {
    if (event.key === '1') ca('attack');
    if (event.key === '2') ca('skill');
    if (event.key === '3') ca('skill2');
    if (event.key === '4') ca('skill3');
    if (event.key === '5') ca('skill4');
    if (event.key === '6') ca('item');
    if (event.key === 'Escape') ca('flee');
    return;
  }

  const dirs = {
    ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
    ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
    ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
  };

  if (dirs[event.key]) {
    event.preventDefault();
    handleMove(G.player.x + dirs[event.key][0], G.player.y + dirs[event.key][1]);
    return;
  }

  if (event.key === ' ' || event.key === '.') {
    event.preventDefault();
    handleMove(G.player.x, G.player.y);
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    grabItem();
    return;
  }

  if (event.key.toLowerCase() === 'g') {
    grabItem();
    return;
  }
  if (event.key.toLowerCase() === 'i') { togglePanel('inv'); return; }
  if (event.key.toLowerCase() === 'b') { togglePanel('shop'); return; }
  if (event.key.toLowerCase() === 'n') { togglePanel('blacksmith'); return; }
  if (event.key.toLowerCase() === 'r') { togglePanel('alchemist'); return; }
  if (event.key.toLowerCase() === 'y') { togglePanel('shrine'); return; }
  if (event.key.toLowerCase() === 'f') { togglePanel('fuse'); return; }
  if (event.key.toLowerCase() === 'c') { togglePanel('stats'); return; }
  if (event.key.toLowerCase() === 'l') { togglePanel('log'); return; }
  if (event.key.toLowerCase() === 'm') { togglePanel('menu'); return; }
  if (event.key.toLowerCase() === 'q') { usePot('hp'); return; }
  if (event.key.toLowerCase() === 'e') { usePot('mp'); return; }
  if (event.key === '=' || event.key === '+') { adjustZoom(1); return; }
  if (event.key === '-') { adjustZoom(-1); }
});

window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
    event.preventDefault();
  }
});
