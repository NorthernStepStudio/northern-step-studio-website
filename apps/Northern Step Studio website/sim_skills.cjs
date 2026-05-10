const fs = require('fs');
eval(fs.readFileSync('public/games/nexus-roguelike/js/data.js', 'utf8'));
eval(fs.readFileSync('public/games/nexus-roguelike/js/combat.js', 'utf8'));

// Mock addLog so we can see output without breaking
global.addLog = function(msg, type) { }
global.updateCombatUI = function() { }

function simulate(className, enemyName) {
  let heroTmpl = CLS[className];
  let enTmpl = ENEMIES.find(e => e.name === enemyName);
  let enemy = scaleEnemy(enTmpl, 1, 1);
  
  // Set up mock globals
  global.G = {
    player: { ...heroTmpl, maxHp: heroTmpl.hp, classType: className, activeEffects: [], cooldowns: {} },
    currentEnemy: enemy
  };
  
  let turns = 0;
  
  // Very simplistic AI: Use skill 3 if available, else 2, else 1, else attack.
  while(G.currentEnemy && G.currentEnemy.hp > 0 && G.player.hp > 0) {
    turns++;
    let skills = HERO_SKILLS[className];
    let casted = false;
    
    // Try casting highest cooldown skill if possible
    for (let i = 2; i >= 0; i--) {
      let s = skills[i];
      if (G.player.mp >= s.mpCost && !(G.player.cooldowns[s.id] > 0)) {
        ca('skill', s.id);
        casted = true;
        break;
      }
    }
    if (!casted) {
      ca('attack');
    }
    
    // Safety break
    if (turns > 50) break;
  }
  
  console.log(className.toUpperCase() + ' vs ' + enemyName + ' -> ' + turns + ' turns. Hero HP: ' + G.player.hp + '/' + G.player.maxHp);
}

simulate('warrior', 'Bone Walker');
simulate('mage', 'Shield Husk');
simulate('rogue', 'Blade Imp');
simulate('paladin', 'Grave Ghoul');
