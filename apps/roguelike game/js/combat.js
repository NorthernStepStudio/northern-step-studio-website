// Combat systems and enemy scaling.

function scaleEnemy(tmpl, floor, playerLevel) {
  const lvl = Math.max(1, Math.round((floor * 1.5 + playerLevel) / 2));
  let hpScale = 1 + (lvl - 1) * 0.22;
  let atkScale = 1 + (lvl - 1) * 0.18;
  const xpScale = 1 + (lvl - 1) * 0.25;
  const goldScale = 1 + (lvl - 1) * 0.20;
  const scaledDef = Math.floor((tmpl.def || 0) * (1 + (lvl - 1) * 0.08));

  return {
    ...tmpl,
    hp: Math.floor(tmpl.baseHp * hpScale),
    maxHp: Math.floor(tmpl.baseHp * hpScale),
    atk: Math.floor(tmpl.baseAtk * atkScale),
    def: scaledDef,
    xp: Math.floor(tmpl.xp * xpScale),
    gold: Math.floor(tmpl.gold * goldScale),
    level: lvl,
    id: Math.random().toString(36).slice(2)
  };
}

function startCombat(en) {
  G.currentEnemy = en;
  const ov = document.getElementById('combatov');
  if (ov) ov.classList.add('active');
  updateCombatUI();
  addLog(`A wild ${en.name} appears!`, 'info');
}

function updateCombatUI() {
  const en = G.currentEnemy;
  if (!en) return;
  document.getElementById('cename').textContent = en.name;
  document.getElementById('cehp').style.width = (en.hp / en.maxHp * 100) + '%';
  document.getElementById('cehpv').textContent = `${en.hp}/${en.maxHp}`;
  document.getElementById('cesprite').textContent = en.emoji;
  
  document.getElementById('cphp').style.width = (G.player.hp / G.player.maxHp * 100) + '%';
  document.getElementById('cphpv').textContent = `${Math.ceil(G.player.hp)}/${G.player.maxHp}`;
}

function ca(action) {
  if (!G.currentEnemy) return;
  if (action === 'attack') {
    const dmg = Math.max(1, G.player.atk - G.currentEnemy.def);
    G.currentEnemy.hp -= dmg;
    addLog(`You hit ${G.currentEnemy.name} for ${dmg}.`, 'info');
    if (G.currentEnemy.hp <= 0) { endCombat(true); return; }
  } else if (action === 'flee') {
    addLog('You ran away!', 'info');
    endCombat(false);
    return;
  }
  monsterTurn();
  updateCombatUI();
}

function monsterTurn() {
  const dmg = Math.max(1, G.currentEnemy.atk - G.player.def);
  G.player.hp -= dmg;
  addLog(`${G.currentEnemy.name} hits you for ${dmg}.`, 'damage');
  if (G.player.hp <= 0) die();
}

function endCombat(won) {
  if (won && G.currentEnemy) {
    G.gold += G.currentEnemy.gold;
    G.player.xp += G.currentEnemy.xp;
    G.killCount++;
    addLog(`Victory! Gained ${G.currentEnemy.gold}G and ${G.currentEnemy.xp}XP.`, 'loot');
    const idx = G.enemies.indexOf(G.currentEnemy);
    if (idx > -1) G.enemies.splice(idx, 1);
  }
  G.currentEnemy = null;
  document.getElementById('combatov').classList.remove('active');
  updateHUD();
  renderMap();
}

// Visuals
function getMonsterSprite(en) {
  const n = (en.name || '').toUpperCase();
  if (n.includes('SLIME')) return 'slime';
  if (n.includes('SKELETON') || n.includes('BONE')) return 'skeleton';
  if (n.includes('RAT')) return 'slime';
  return 'unknown';
}

function buildMonsterHTML(en, cs) {
  const sz = cs - 2;
  return `<span class="ce" style="font-size:${sz}px">${en.emoji}</span>`;
}
