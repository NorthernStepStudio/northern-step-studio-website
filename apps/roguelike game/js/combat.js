// Combat systems and enemy scaling.

function scaleEnemy(tmpl, floor, playerLevel) {
  const enemyLevel = Math.max(1, Math.floor((floor * 1.25 + playerLevel * 0.85) / 2));
  const hpScale = 1 + (enemyLevel - 1) * 0.32;
  const atkScale = 1 + (enemyLevel - 1) * 0.12;
  const defScale = 1 + (enemyLevel - 1) * 0.06;
  const xpScale = 1 + (enemyLevel - 1) * 0.22;
  const goldScale = 1 + (enemyLevel - 1) * 0.16;

  const archetype = (typeof enemyArchetypes !== 'undefined' && enemyArchetypes[tmpl.archetype]) 
    ? enemyArchetypes[tmpl.archetype] 
    : { hpMultiplier: 1.0, atkMultiplier: 1.0, defMultiplier: 1.0, xpMultiplier: 1.0, goldMultiplier: 1.0 };

  return {
    ...tmpl,
    hp: Math.round(tmpl.baseHp * hpScale * archetype.hpMultiplier),
    maxHp: Math.round(tmpl.baseHp * hpScale * archetype.hpMultiplier),
    atk: Math.round(tmpl.baseAtk * atkScale * archetype.atkMultiplier),
    def: Math.round((tmpl.def || 0) * defScale * archetype.defMultiplier),
    xp: Math.round(tmpl.xp * xpScale * archetype.xpMultiplier),
    gold: Math.round(tmpl.gold * goldScale * archetype.goldMultiplier),
    level: enemyLevel,
    id: Math.random().toString(36).slice(2)
  };
}

function startCombat(en) {
  G.currentEnemy = en;
  if (!G.player.activeEffects) G.player.activeEffects = [];
  if (!G.player.cooldowns) G.player.cooldowns = {};
  G.currentEnemy.activeEffects = [];

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

  // Update skills UI
  const cskills = document.getElementById('cskills');
  if (cskills) {
    cskills.innerHTML = '';
    const skills = (typeof HERO_SKILLS !== 'undefined' && G.player.classType && HERO_SKILLS[G.player.classType]) ? HERO_SKILLS[G.player.classType] : [];
    
    if (!G.player.cooldowns) G.player.cooldowns = {};
    
    skills.forEach(skill => {
      const cd = G.player.cooldowns[skill.id] || 0;
      const noMp = G.player.mp < skill.mpCost;
      const disabled = cd > 0 || noMp;
      
      const btn = document.createElement('button');
      btn.className = 'cbtn';
      if (disabled) btn.style.opacity = '0.5';
      btn.style.fontSize = '8px';
      btn.style.padding = '4px 6px';
      btn.title = skill.description;
      
      let label = `${skill.name} (${skill.mpCost}MP)`;
      if (cd > 0) label += ` [CD:${cd}]`;
      
      btn.textContent = label;
      btn.onclick = () => { if (!disabled) ca('skill', skill.id); };
      cskills.appendChild(btn);
    });
  }
}

function calculateDamage(attacker, defender, opts = {}) {
  const mult = opts.mult || 1.0;
  const ignoreDef = opts.ignoreDef || 0;
  const critBonus = opts.critBonus || 0;
  
  let atkVal = attacker.atk;
  let defVal = defender.def * (1 - ignoreDef);
  let dodgeChance = 0;
  let dmgResist = 0;

  (defender.activeEffects || []).forEach(e => {
    if (e.type === 'def_up') defVal += e.value;
    if (e.type === 'bulwark') { defVal += e.defValue; dmgResist += e.resistValue; }
    if (e.type === 'dmg_resist') dmgResist += e.value;
    if (e.type === 'dodge') dodgeChance += e.value;
  });

  if (Math.random() < dodgeChance) {
    return { dmg: 0, dodged: true, isCrit: false };
  }

  const baseDamage = Math.max(2, Math.round((atkVal * 1.15) - (defVal * 0.75))) * mult;
  const variance = 0.9 + Math.random() * 0.2;
  let dmg = Math.max(2, Math.round(baseDamage * variance));

  let isCrit = false;
  let finalCritChance = ((attacker.crit || 0) + critBonus) / 100;
  if (Math.random() < finalCritChance) {
    dmg = Math.round(dmg * 1.75);
    isCrit = true;
  }

  dmg = Math.round(dmg * (1 - dmgResist));
  return { dmg, dodged: false, isCrit };
}

function processEffects(entity, timing) {
  if (!entity || !entity.activeEffects) return;
  for (let i = entity.activeEffects.length - 1; i >= 0; i--) {
    let e = entity.activeEffects[i];
    let bDmg = 0;

    if (timing === 'start' && e.type === 'burn') {
      bDmg = Math.max(1, Math.round(G.player.atk * e.mult));
      entity.hp -= bDmg;
      addLog(`${entity.name} takes ${bDmg} burn damage.`, 'damage');
    } else if (timing === 'end' && e.type === 'bleed') {
      bDmg = Math.max(1, Math.round(G.player.atk * e.mult));
      entity.hp -= bDmg;
      addLog(`${entity.name} bleeds for ${bDmg} damage.`, 'damage');
    }

    if (timing === 'end') {
      e.duration--;
      if (e.duration <= 0) {
        entity.activeEffects.splice(i, 1);
      }
    }
  }
}

function checkEnemyDeath() {
  if (G.currentEnemy.hp <= 0) {
    G.player.activeEffects = [];
    endCombat(true);
    return true;
  }
  return false;
}

function ca(action, skillId = null) {
  if (!G.currentEnemy) return;

  if (!G.player.activeEffects) G.player.activeEffects = [];
  if (!G.player.cooldowns) G.player.cooldowns = {};
  if (!G.currentEnemy.activeEffects) G.currentEnemy.activeEffects = [];

  if (action === 'attack') {
    let res = calculateDamage(G.player, G.currentEnemy);
    if (res.dodged) {
      addLog(`${G.currentEnemy.name} dodged your attack!`, 'info');
    } else {
      G.currentEnemy.hp -= res.dmg;
      addLog(`You hit ${G.currentEnemy.name} for ${res.dmg}${res.isCrit ? ' (CRIT!)' : ''}.`, 'info');
    }
    if (checkEnemyDeath()) return;

  } else if (action === 'skill' && skillId) {
    let skills = HERO_SKILLS[G.player.classType] || [];
    let skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    if (G.player.mp < skill.mpCost) {
      addLog(`Not enough MP.`, 'error');
      return;
    }
    if (G.player.cooldowns[skill.id] > 0) {
      addLog(`Skill on cooldown.`, 'error');
      return;
    }

    G.player.mp -= skill.mpCost;
    G.player.cooldowns[skill.id] = skill.cooldown;
    addLog(`== ${skill.name} ==`, 'loot');

    if (skill.type === 'damage' || skill.type === 'hybrid') {
      let res = calculateDamage(G.player, G.currentEnemy, skill);
      if (res.dodged) {
        addLog(`${G.currentEnemy.name} dodged!`, 'info');
      } else {
        G.currentEnemy.hp -= res.dmg;
        addLog(`You hit ${G.currentEnemy.name} for ${res.dmg}${res.isCrit ? ' (CRIT!)' : ''}.`, 'info');

        if (skill.healDealt) {
          let heal = Math.floor(res.dmg * skill.healDealt);
          G.player.hp = Math.min(G.player.maxHp, G.player.hp + heal);
          addLog(`You healed for ${heal} HP.`, 'info');
        }

        if (skill.execute && G.currentEnemy.hp > 0 && (G.currentEnemy.hp / G.currentEnemy.maxHp) <= skill.execute.threshold) {
           let exRes = calculateDamage(G.player, G.currentEnemy, { mult: skill.execute.mult });
           G.currentEnemy.hp -= exRes.dmg;
           addLog(`Extra hit for ${exRes.dmg}!`, 'info');
        }
      }
    }

    if (skill.type === 'buff' || skill.type === 'hybrid') {
      if (skill.effect) {
         G.player.activeEffects.push({...skill.effect});
         addLog(skill.description, 'info');
      }
      if (skill.applyStatus) {
         G.currentEnemy.activeEffects.push({...skill.applyStatus});
         addLog(`Applied ${skill.applyStatus.name}.`, 'info');
      }
    }

    if (checkEnemyDeath()) return;
  } else if (action === 'item') {
    addLog('Use items from your inventory!', 'info');
    return;
  } else if (action === 'flee') {
    addLog('You ran away!', 'info');
    G.player.activeEffects = [];
    endCombat(false);
    return;
  }

  monsterTurn();
  updateCombatUI();
}

function monsterTurn() {
  processEffects(G.currentEnemy, 'start');
  if (checkEnemyDeath()) return;

  let res = calculateDamage(G.currentEnemy, G.player);
  if (res.dodged) {
    addLog(`You dodged ${G.currentEnemy.name}'s attack!`, 'info');
  } else {
    G.player.hp -= res.dmg;
    addLog(`${G.currentEnemy.name} hits you for ${res.dmg}.`, 'damage');
  }

  if (G.player.hp <= 0) {
    die();
    return;
  }

  processEffects(G.currentEnemy, 'end');
  processEffects(G.player, 'end');

  if (G.player.cooldowns) {
    for (let k in G.player.cooldowns) {
      if (G.player.cooldowns[k] > 0) G.player.cooldowns[k]--;
    }
  }

  checkEnemyDeath();
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
