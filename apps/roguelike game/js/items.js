// Item generation and usage.

function makeItem(type, tier, subId) {
  const t = WEAPON_TIERS[tier] || WEAPON_TIERS[0];
  const tmpl = t[subId % t.length];
  return {
    ...tmpl,
    uid: Math.random().toString(36).slice(2),
    type,
    tier
  };
}

function usePot(type) {
  const pot = G.inventory.find(i => i.id === (type === 'hp' ? 'hp_pot' : 'mp_pot'));
  if (!pot) { addLog(`No ${type.toUpperCase()} potions!`, 'damage'); return; }
  
  if (type === 'hp') {
    G.player.hp = Math.min(G.player.maxHp, G.player.hp + pot.effect.hp);
    addLog(`Healed for ${pot.effect.hp} HP.`, 'heal');
  } else {
    G.player.mp = Math.min(G.player.maxMp, G.player.mp + pot.effect.mp);
    addLog(`Restored ${pot.effect.mp} MP.`, 'magic');
  }
  
  const idx = G.inventory.indexOf(pot);
  G.inventory.splice(idx, 1);
  playS('magic');
  updateHUD();
}
