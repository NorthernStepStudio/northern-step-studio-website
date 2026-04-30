// Core game engine and state management.
let G = {};
let openPanel = null;
let customSprite = null;
let zoomLevel = 1;

// --- UTILITIES & SOUND ---
function playS(type) {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  const ctx = new AudioCtor(), osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const now = ctx.currentTime;
  let f = 440, d = 0.1, v = 0.1, w = 'square', s = 0;
  if (type === 'hit') { f = 150; d = 0.15; v = 0.15; w = 'sine'; s = -80; }
  else if (type === 'crit') { f = 80; d = 0.3; v = 0.2; w = 'sawtooth'; s = -40; }
  else if (type === 'loot') { f = 880; d = 0.2; v = 0.1; w = 'triangle'; s = 440; }
  else if (type === 'gold') { f = 1200; d = 0.08; v = 0.08; w = 'sine'; s = 200; }
  else if (type === 'magic') { f = 600; d = 0.4; v = 0.12; w = 'square'; s = -400; }
  else if (type === 'pickup') { f = 1000; d = 0.05; v = 0.05; w = 'sine'; }
  else if (type === 'levelup') { f = 440; d = 0.8; v = 0.15; w = 'square'; s = 880; }
  else if (type === 'death') { f = 100; d = 0.5; v = 0.2; w = 'sawtooth'; s = -50; }
  osc.type = w; osc.frequency.setValueAtTime(f, now);
  if (s) osc.frequency.exponentialRampToValueAtTime(Math.max(10, f + s), now + d);
  gain.gain.setValueAtTime(v, now); gain.gain.exponentialRampToValueAtTime(0.01, now + d);
  osc.start(now); osc.stop(now + d);
  setTimeout(() => ctx.close(), (d + 0.1) * 1000);
}

// --- STATE MANAGEMENT ---
function saveG() {
  if (!G.player) return;
  try {
    localStorage.setItem(SK, JSON.stringify({ G, customSprite, zoomLevel }));
    renderContinueState();
  } catch(e) {}
}

function loadGame() {
  try {
    const d = JSON.parse(localStorage.getItem(SK));
    if (!d) return false;
    G = d.G;
    if (d.customSprite) customSprite = d.customSprite;
    if (d.zoomLevel !== undefined) zoomLevel = d.zoomLevel;
    showGS();
    updateVision(G.player.x, G.player.y);
    renderMap(); updateHUD(); refreshTitleMeta();
    addLog('💾 Loaded! Welcome back.', 'info');
    return true;
  } catch(e) { return false; }
}

function blankMeta() {
  return { shards: 0, upgrades: {}, totalRuns: 0, wins: 0, bestFloor: 0, bestKills: 0 };
}

function loadMeta() {
  const raw = localStorage.getItem(SMK);
  return raw ? { ...blankMeta(), ...JSON.parse(raw) } : blankMeta();
}

function saveMeta(meta) {
  localStorage.setItem(SMK, JSON.stringify(meta));
}

function getUpgradeCost(upgrade, level) {
  return upgrade.baseCost + level * upgrade.costPerLevel;
}

function getMetaBonus() {
  const meta = loadMeta();
  const bonus = {};
  META_UPGRADES.forEach(u => {
    const lvl = meta.upgrades[u.id] || 0;
    if (lvl > 0) Object.assign(bonus, u.apply(lvl));
  });
  return bonus;
}

// --- TITLE SCREEN ---
function selectClass(el) {
  document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('start-btn').disabled = false;
  playS('pickup');
}

function startNewGame() {
  const sel = document.querySelector('.class-card.selected');
  if (!sel) return;
  const classId = sel.dataset.class;
  const base = CLS[classId];
  const metaBonus = getMetaBonus();

  G = {
    player: {
      ...base,
      classId,
      level: 1, xp: 0, xpNext: 100,
      maxHp: base.hp + (metaBonus.hp || 0),
      maxMp: base.mp,
      hp: base.hp + (metaBonus.hp || 0),
      mp: base.mp,
      atk: base.atk + (metaBonus.atk || 0),
      def: base.def + (metaBonus.def || 0),
      spd: base.spd,
      crit: base.crit + (metaBonus.crit || 0),
      x: 0, y: 0
    },
    floor: 1, gold: 50, killCount: 0, doom: 0,
    inventory: [], invSlots: 8 + (metaBonus.invBonus || 0),
    equippedWeapon: null, equippedArmor: null, equippedRing: null,
    enemies: [], items: [], logs: [], inZone: null,
    zoneEnemies: {}, zoneItems: {}
  };

  const starterWeapon = WEAPON_TIERS[0].find(w => w.id === base.sw);
  if (starterWeapon) {
    const it = { ...starterWeapon, uid: 'starter-wpn', type: 'weapon' };
    G.inventory.push(it); G.equippedWeapon = it;
  }

  generateMap();
  placeEntities();
  updateVision(G.player.x, G.player.y);
  showGS();
  updateHUD();
  renderMap();
  addLog('A new descent begins.', 'info');
  saveG();
}

function showGS() {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
}

function renderContinueState() {
  const btn = document.getElementById('continue-btn');
  const fl = document.getElementById('sfl');
  const d = JSON.parse(localStorage.getItem(SK));
  if (d && d.G) {
    btn.classList.remove('hidden');
    btn.style.display = 'block';
    fl.textContent = d.G.floor || 1;
  } else {
    btn.classList.add('hidden');
    btn.style.display = 'none';
  }
}

function refreshTitleMeta() {
  const meta = loadMeta();
  const el = document.getElementById('title-shard-count');
  if (el) el.textContent = meta.shards;
}

// --- PANELS ---
function openMetaScreen() {
  document.getElementById('meta-screen').style.display = 'block';
  renderMetaScreen();
}

function closeMetaScreen() {
  document.getElementById('meta-screen').style.display = 'none';
}

function renderMetaScreen() {
  const meta = loadMeta();
  const display = document.getElementById('meta-shards-display');
  const list = document.getElementById('meta-upgrades-list');
  if (!display || !list) return;

  display.textContent = `${meta.shards} Doom Shards available`;
  list.innerHTML = '';

  META_UPGRADES.forEach(u => {
    const level = meta.upgrades[u.id] || 0;
    const maxed = level >= u.maxLevel;
    const cost = getUpgradeCost(u, level);
    const canAfford = meta.shards >= cost;
    const card = document.createElement('div');
    card.className = `meta-upgrade-card${maxed ? ' maxed' : ''}`;
    card.innerHTML = `
      <div class="meta-upgrade-icon">${u.emoji}</div>
      <div class="meta-upgrade-info">
        <div class="meta-upgrade-name">${u.name}</div>
        <div class="meta-upgrade-desc">${u.desc}</div>
        <div class="meta-upgrade-level">${maxed ? 'MAX' : `Lv ${level}/${u.maxLevel}`}</div>
      </div>
      <div class="meta-upgrade-cost ${!canAfford && !maxed ? 'cant-afford' : ''}">${maxed ? 'MAXED' : `${cost} SH`}</div>
    `;
    if (!maxed && canAfford) card.onclick = () => purchaseMetaUpgrade(u.id);
    list.appendChild(card);
  });
}

function purchaseMetaUpgrade(id) {
  const meta = loadMeta();
  const u = META_UPGRADES.find(x => x.id === id);
  const level = meta.upgrades[id] || 0;
  const cost = getUpgradeCost(u, level);
  if (meta.shards >= cost) {
    meta.shards -= cost;
    meta.upgrades[id] = level + 1;
    saveMeta(meta);
    renderMetaScreen();
    refreshTitleMeta();
    playS('levelup');
  }
}

function togglePanel(panelId) {
  if (openPanel === panelId) { closeAllPanels(); return; }
  closeAllPanels();
  const el = document.getElementById('panel-' + panelId);
  if (el) { el.classList.add('open'); openPanel = panelId; }
}

function closeAllPanels() {
  document.querySelectorAll('.spanel').forEach(p => p.classList.remove('open'));
  openPanel = null;
}

// --- CORE LOGIC ---
function handleMove(tx, ty) {
  if (G.player.hp <= 0 || G.currentEnemy) return;
  const cw = getMapW(), ch = getMapH(), cells = getCells();
  if (tx < 0 || ty < 0 || tx >= cw || ty >= ch) return;
  if (cells[ty][tx].type === 'wall') return;

  const curEnemies = G.inZone ? (G.zoneEnemies[G.inZone] || []) : G.enemies;
  const en = curEnemies.find(e => e.x === tx && e.y === ty);
  if (en) { startCombat(en); return; }

  G.player.x = tx; G.player.y = ty;
  updateVision(tx, ty);
  
  const curItems = G.inZone ? (G.zoneItems[G.inZone] || []) : G.items;
  const it = curItems.find(i => i.x === tx && i.y === ty);
  if (it) pickupItem(it);

  gainDoom(0.5);
  updateHUD();
  renderMap();
  saveG();
}

function pickupItem(it) {
  if (G.inventory.length >= G.invSlots) { addLog('Inventory full!', 'damage'); return; }
  const curItems = G.inZone ? (G.zoneItems[G.inZone] : G.items);
  const idx = curItems.indexOf(it);
  if (idx > -1) curItems.splice(idx, 1);
  G.inventory.push(it);
  playS('pickup');
  addLog(`Picked up ${it.name}.`, 'loot');
  updateHUD();
  renderMap();
}

function gainDoom(amount) {
  G.doom = Math.min(100, G.doom + amount);
  if (G.doom >= 100) {
    G.player.hp = Math.max(0, G.player.hp - 1);
    if (G.player.hp <= 0) die();
  }
}

function die() {
  playS('death');
  showRunSummary(false);
}

function showRunSummary(won) {
  const floorScore = Math.max(0, G.floor - 1) * 15;
  const killScore = Math.floor((G.killCount || 0) * 0.5);
  const total = floorScore + killScore;
  
  const meta = loadMeta();
  meta.shards += total;
  meta.totalRuns += 1;
  meta.bestFloor = Math.max(meta.bestFloor, G.floor);
  saveMeta(meta);

  localStorage.removeItem(SK);
  document.getElementById('rs-title').textContent = won ? 'VICTORY' : 'YOU DIED';
  document.getElementById('rs-shard-total').textContent = `Total shards earned: ${total}`;
  document.getElementById('run-summary').style.display = 'flex';
}

function hardResetRun() {
  localStorage.removeItem(SK);
  location.reload();
}

function updateHUD() {
  if (!G.player) return;
  document.getElementById('hfl').textContent = 'F' + G.floor;
  document.getElementById('hgo').textContent = 'G ' + G.gold;
  document.getElementById('bhp').style.width = (G.player.hp / G.player.maxHp * 100) + '%';
  document.getElementById('bmp').style.width = (G.player.mp / G.player.maxMp * 100) + '%';
  document.getElementById('thp').textContent = `${Math.ceil(G.player.hp)}/${G.player.maxHp}`;
  document.getElementById('tmp').textContent = `${Math.ceil(G.player.mp)}/${G.player.maxMp}`;
  document.getElementById('hname').textContent = G.player.classId.toUpperCase();
}

function addLog(txt, cls = 'info') {
  const list = document.getElementById('log-list');
  if (!list) return;
  const div = document.createElement('div');
  div.className = 'le ' + cls;
  div.textContent = '> ' + txt;
  list.prepend(div);
}

// --- INPUT ---
document.addEventListener('keydown', (e) => {
  if (!G.player) {
    if (e.key === 'Escape') closeMetaScreen();
    return;
  }
  const dirs = { 
    ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1], 
    ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0] 
  };
  if (dirs[e.key]) {
    e.preventDefault();
    handleMove(G.player.x + dirs[e.key][0], G.player.y + dirs[e.key][1]);
  }
  if (e.key === 'Escape') closeAllPanels();
});

window.onload = () => {
  refreshTitleMeta();
  renderContinueState();
};
