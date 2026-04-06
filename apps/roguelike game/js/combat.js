// Combat engine: enemy scaling, battle loop, rewards, and combat UI.

function scaleEnemy(template, floor, playerLevel, type = 'normal') {
  const level = Math.max(1, Math.floor((floor * 1.5 + playerLevel) / 2));
  let hpScale = 1 + (level - 1) * 0.35;
  let atkScale = 1 + (level - 1) * 0.28;
  const xpScale = 1 + (level - 1) * 0.2;
  const goldScale = 1 + (level - 1) * 0.15;
  let scaledDef = template.def + Math.floor((level - 1) * 0.5);

  if (type === 'mini') {
    hpScale *= 2;
    atkScale *= 1.3;
    scaledDef += 4;
  }
  if (type === 'boss') {
    hpScale *= 4;
    atkScale *= 1.6;
    scaledDef += 8;
  }

  let mutationName = '';
  if (G.doom >= 90) {
    hpScale *= 1.6;
    atkScale *= 1.5;
    scaledDef += 10;
    mutationName = 'ABYSSAL ';
  } else if (G.doom >= 60) {
    hpScale *= 1.3;
    atkScale *= 1.2;
    scaledDef += 5;
    mutationName = 'MUTATED ';
  }

  return {
    ...template,
    name: `${mutationName}${type === 'mini' ? 'ELITE ' : ''}${template.name}`,
    hp: Math.floor(template.baseHp * hpScale),
    maxHp: Math.floor(template.baseHp * hpScale),
    atk: Math.floor(template.baseAtk * atkScale),
    def: scaledDef,
    xp: Math.floor(template.xp * xpScale * (type === 'boss' ? 3 : type === 'mini' ? 1.5 : 1)),
    gold: Math.floor(template.gold * goldScale * (type === 'boss' ? 4 : type === 'mini' ? 2 : 1)),
    level,
    id: Math.random().toString(36).slice(2),
    status: {},
    isElite: type !== 'normal',
    enemyType: type
  };
}

function addCombatLog(message) {
  const log = document.getElementById('clog');
  if (!log) return;
  const entry = document.createElement('div');
  entry.textContent = `> ${message}`;
  log.prepend(entry);
  while (log.children.length > 8) {
    log.removeChild(log.lastChild);
  }
}

function clearCombatLog() {
  const log = document.getElementById('clog');
  if (log) log.innerHTML = '';
}

function startCombat(enemy) {
  G.currentEnemy = enemy;
  const overlay = document.getElementById('combatov');
  if (overlay) overlay.classList.add('active');

  const playerSprite = document.getElementById('cpsprite');
  if (playerSprite) playerSprite.innerHTML = getPlayerSpriteMarkup(42);
  document.getElementById('cpname').textContent = G.player.classData.name;
  document.getElementById('cename').textContent = enemy.name;
  document.getElementById('cesprite').textContent = glyphForEnemy(enemy);
  document.getElementById('celvl').textContent = `${enemy.enemyType === 'mini' ? 'ELITE ' : ''}LV.${enemy.level}`;

  clearCombatLog();
  addCombatLog(`Encountered ${enemy.name}.`);
  addLog(`Encountered ${enemy.name}.`, 'damage');
  updateCombatHUD();
  updateCombatSkills();
}

function updateCombatHUD() {
  if (!G.currentEnemy) return;

  const enemy = G.currentEnemy;
  document.getElementById('cphp').style.width = `${(G.player.hp / G.player.maxHp) * 100}%`;
  document.getElementById('cphpv').textContent = `${Math.ceil(G.player.hp)}/${G.player.maxHp}`;
  document.getElementById('cehp').style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
  document.getElementById('cehpv').textContent = `${Math.ceil(enemy.hp)}/${enemy.maxHp}`;
}

function updateCombatSkills() {
  const classData = G.player.classData;
  const skills = [classData.skill, classData.skill2, classData.skill3, classData.skill4];
  skills.forEach((skill, index) => {
    const id = index === 0 ? 'cskill' : `cskill${index + 1}`;
    const button = document.getElementById(id);
    if (!button) return;

    if (skill && G.player.level >= skill.lvl) {
      button.style.display = 'block';
      button.innerHTML = `<span class="ci">SK</span>${skill.name.split(' ')[0]}<br><span class="fs-5">${skill.cost}MP</span>`;
      button.disabled = G.player.mp < skill.cost;
    } else {
      button.style.display = 'none';
    }
  });
}

function getElementMult(atkElement, defElement) {
  if (!atkElement || !defElement || atkElement === 'none' || defElement === 'none') return 1;
  if (atkElement === defElement) return 0.75;

  const element = ELEMENTS[atkElement];
  if (element && element.strongAgainst === defElement) return 1.5;
  if ((atkElement === 'holy' && defElement === 'shadow') || (atkElement === 'shadow' && defElement === 'holy')) return 1.5;

  const defender = ELEMENTS[defElement];
  if (defender && defender.strongAgainst === atkElement) return 0.6;
  return 1;
}

function triggerEnemyRetaliation(enemy) {
  setTimeout(() => {
    if (!G.currentEnemy) return;

    const enemyElement = enemy.element || 'none';
    const playerElement = G.player.classData.element || 'none';
    const enemyMult = getElementMult(enemyElement, playerElement);
    const enemyDamage = Math.max(1, Math.round((enemy.atk * enemyMult) - G.player.def / 2));
    G.player.hp -= enemyDamage;

    playS('hit');
    doVfx('enemy');
    hfl('player');
    updateCombatHUD();
    updateHUD();

    const retaliation = `${enemy.name} hits you for ${enemyDamage}.`;
    addCombatLog(retaliation);
    addLog(retaliation, 'damage');
    if (G.player.hp <= 0) die();
  }, 500);
}

function pickCombatItem() {
  if (G.player.hp <= G.player.maxHp * 0.45) {
    const hpPotion = G.inventory.find((item) => item.isHp);
    if (hpPotion) return hpPotion;
  }
  if (G.player.mp <= G.player.maxMp * 0.35) {
    const mpPotion = G.inventory.find((item) => item.isMp);
    if (mpPotion) return mpPotion;
  }
  const bomb = G.inventory.find((item) => item.effect?.bomb);
  if (bomb) return bomb;
  const elixir = G.inventory.find((item) => item.type === 'elixir');
  if (elixir) return elixir;
  return G.inventory.find((item) => item.isHp || item.isMp);
}

function ca(type) {
  if (!G.currentEnemy) return;

  const enemy = G.currentEnemy;
  let damage = 0;
  let crit = false;
  let vfxType = 'slash';
  let element = 'none';

  let damageMult = 1.0;
  let critBonus = 0;
  if (G.doom >= 90) {
    damageMult = 1.7;
    critBonus = 30;
  } else if (G.doom >= 60) {
    damageMult = 1.35;
    critBonus = 15;
  } else if (G.doom >= 30) {
    damageMult = 1.15;
  }

  if (type === 'attack') {
    crit = Math.random() < ((G.player.crit + critBonus) / 100);
    damage = G.player.atk;
    element = G.equippedWeapon?.element || G.player.classData.element || 'none';
    if (crit) {
      damage *= 2;
      vfxType = 'crit';
    }
  } else if (type.startsWith('skill')) {
    const index = type === 'skill' ? 0 : parseInt(type.slice(5), 10) - 1;
    const skill = [G.player.classData.skill, G.player.classData.skill2, G.player.classData.skill3, G.player.classData.skill4][index];
    if (!skill || G.player.level < skill.lvl || G.player.mp < skill.cost) return;
    G.player.mp -= skill.cost;
    crit = Math.random() < ((G.player.crit + critBonus) / 100);
    damage = G.player.atk * 2.5;
    element = skill.element || 'none';
    vfxType = skill.vfx || 'magic';
    if (crit) damage *= 2;
  } else if (type === 'item') {
    const item = pickCombatItem();
    if (!item) {
      addCombatLog('No useful combat item available.');
      addLog('No useful combat item available.', 'info');
      return;
    }
    if (!useItem(item, { fromCombat: true })) return;
    addCombatLog(`Used ${item.name}.`);
    if (enemy.hp <= 0) {
      winCombat();
      return;
    }
    triggerEnemyRetaliation(enemy);
    return;
  } else if (type === 'flee') {
    if (enemy.boss || enemy.enemyType === 'boss') {
      addCombatLog('No escape from a boss fight.');
      addLog('No escape from a boss fight.', 'damage');
      triggerEnemyRetaliation(enemy);
      return;
    }

    const chance = Math.max(0.2, Math.min(0.75, 0.35 + ((G.player.spd - enemy.level) * 0.04)));
    if (Math.random() < chance) {
      addCombatLog('Escaped the fight.');
      addLog(`Escaped ${enemy.name}.`, 'info');
      G.currentEnemy = null;
      saveG();
      setTimeout(closeCombat, 250);
    } else {
      addCombatLog('Tried to flee and failed.');
      addLog(`Failed to escape ${enemy.name}.`, 'damage');
      triggerEnemyRetaliation(enemy);
    }
    return;
  } else {
    return;
  }

  const elementMult = getElementMult(element, enemy.element || 'none');
  const actualDamage = Math.max(1, Math.round((damage * damageMult * elementMult) - enemy.def / 2));
  enemy.hp -= actualDamage;

  playS(vfxType === 'crit' ? 'crit' : 'hit');
  doVfx(vfxType);
  hfl('enemy');

  let message = `You hit ${enemy.name} for ${actualDamage}.`;
  if (G.doom >= 90) message = `ABYSSAL STRIKE for ${actualDamage}.`;
  else if (G.doom >= 60) message = `MUTATED BLOW for ${actualDamage}.`;
  else if (elementMult > 1) message = `WEAKNESS HIT for ${actualDamage}.`;

  addCombatLog(message);
  addLog(message, (G.doom >= 60 || elementMult > 1) ? 'loot' : 'damage');

  updateCombatHUD();
  updateHUD();

  if (enemy.hp <= 0) {
    winCombat();
    return;
  }

  triggerEnemyRetaliation(enemy);
}

function winCombat() {
  const enemy = G.currentEnemy;
  if (!enemy) return;

  const xpMult = 1 + (G.metaBonus?.xpBonus || 0);
  const goldMult = 1 + (G.metaBonus?.goldBonus || 0);
  const xp = Math.floor((enemy.xp || enemy.level * 10) * xpMult);
  const gold = Math.floor((enemy.gold || enemy.level * 5) * goldMult);
  G.xp += xp;
  G.gold += gold;
  G.killCount += 1;
  G.doom = Math.max(0, G.doom - (enemy.enemyType === 'mini' ? 9 : 5));

  addCombatLog(`Defeated ${enemy.name}. +${xp} XP +${gold}G.`);
  addLog(`Defeated ${enemy.name}! Found ${xp} XP and ${gold}G.`, 'loot');
  addLog(`Combat purge: -${enemy.enemyType === 'mini' ? 9 : 5} corruption.`, 'info');

  G.enemies = G.enemies.filter((entry) => entry.id !== enemy.id);
  G.currentEnemy = null;

  if (G.xp >= G.player.level * 50) {
    G.xp -= G.player.level * 50;
    levelUp();
  }

  let dropChance = 0.40 + (G.metaBonus?.dropBonus || 0);
  let rareChance = 0.20;
  if (G.doom >= 90) {
    dropChance = 0.90 + (G.metaBonus?.dropBonus || 0);
    rareChance = 0.70;
  } else if (G.doom >= 60) {
    dropChance = 0.60 + (G.metaBonus?.dropBonus || 0);
    rareChance = 0.40;
  }
  if (enemy.enemyType === 'mini') {
    dropChance = 1;
    rareChance = 0.7;
    G.player.hp = Math.min(G.player.maxHp, G.player.hp + Math.ceil(G.player.maxHp * 0.15));
    addLog('Elite reward: recovered a bit of HP.', 'heal');
  }

  if (Math.random() < dropChance) {
    const item = Math.random() < rareChance
      ? makeItem(['weapon', 'armor', 'ring'][Math.floor(Math.random() * 3)], Math.max(0, Math.min(4, G.floor - 1)))
      : rollMaterialDrop(G.floor, enemy.boss);
    if (item) {
      item.x = G.player.x;
      item.y = G.player.y;
      G.items.push(item);
      addLog('The remains held treasure.', 'loot');
    }
  }

  updateHUD();
  renderMap();
  saveG();
  setTimeout(closeCombat, 800);
}

function closeCombat() {
  const overlay = document.getElementById('combatov');
  if (overlay) overlay.classList.remove('active');
  G.currentEnemy = null;
  clearCombatLog();
  updateHUD();
}
