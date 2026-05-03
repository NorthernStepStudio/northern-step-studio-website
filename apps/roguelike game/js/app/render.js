// ═══════════════════════════════
// HERO SVG SPRITES
// 4 distinct pixel-art characters, each with personality
// ═══════════════════════════════
const HERO_SVGS = {
  // ⚔️ BONK KNIGHT — armoured warrior, blue-grey plate, sword & shield
  warrior:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- boots --><rect x="7" y="20" width="4" height="3" rx="1" fill="#445"/>
    <rect x="13" y="20" width="4" height="3" rx="1" fill="#445"/>
    <!-- legs --><rect x="8" y="16" width="3" height="5" fill="#556"/>
    <rect x="13" y="16" width="3" height="5" fill="#556"/>
    <!-- body armour --><rect x="6" y="9" width="12" height="8" rx="1" fill="#778"/>
    <rect x="7" y="10" width="10" height="6" rx="1" fill="#889"/>
    <!-- chest cross --><line x1="12" y1="9" x2="12" y2="17" stroke="#aab" stroke-width=".8"/>
    <line x1="6" y1="13" x2="18" y2="13" stroke="#aab" stroke-width=".8"/>
    <!-- shoulders --><rect x="4" y="9" width="3" height="3" rx="1" fill="#667"/>
    <rect x="17" y="9" width="3" height="3" rx="1" fill="#667"/>
    <!-- sword (right) --><rect x="20" y="5" width="1.5" height="10" rx=".5" fill="#ccc"/>
    <rect x="19" y="9" width="3.5" height="1" rx=".3" fill="#888"/>
    <rect x="20.2" y="4" width="1" height="2" rx=".3" fill="#ffdd88"/>
    <!-- shield (left) --><rect x="1" y="8" width="4" height="6" rx="1" fill="#446"/>
    <rect x="1.5" y="8.5" width="3" height="5" rx=".5" fill="#558"/>
    <circle cx="3" cy="11" r=".8" fill="#aac"/>
    <!-- helmet --><rect x="7" y="3" width="10" height="7" rx="2" fill="#667"/>
    <rect x="8" y="4" width="8" height="5" rx="1" fill="#778"/>
    <!-- visor slit --><rect x="8" y="6" width="8" height="1.5" rx=".5" fill="#222"/>
    <!-- visor glow eyes --><rect x="9.5" y="6.2" width="2" height=".8" rx=".3" fill="#88aaff"/>
    <rect x="12.5" y="6.2" width="2" height=".8" rx=".3" fill="#88aaff"/>
  </svg>`,

  // 🔮 CHAOS WIZARD — robed caster, dark purple robes, glowing orb, wild hair
  mage:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- robe base --><ellipse cx="12" cy="18" rx="7" ry="5" fill="#330055"/>
    <!-- robe body --><rect x="6" y="9" width="12" height="12" rx="3" fill="#440066"/>
    <rect x="7" y="10" width="10" height="10" rx="2" fill="#550077"/>
    <!-- robe trim --><line x1="12" y1="9" x2="12" y2="21" stroke="#aa44ff" stroke-width=".7" opacity=".6"/>
    <rect x="6" y="17" width="12" height="1" rx=".5" fill="#7722aa" opacity=".5"/>
    <!-- sleeves --><ellipse cx="4" cy="13" rx="3" ry="2" fill="#440066"/>
    <ellipse cx="20" cy="13" rx="3" ry="2" fill="#440066"/>
    <!-- orb hand --><circle cx="20" cy="13" r="2" fill="#220033"/>
    <circle cx="20" cy="13" r="1.5" fill="#aa44ff" opacity=".8"/>
    <circle cx="19.5" cy="12.5" r=".5" fill="#ffffff" opacity=".9"/>
    <!-- head --><circle cx="12" cy="6" r="4" fill="#d4a880"/>
    <!-- wild hair --><ellipse cx="12" cy="3" rx="4.5" ry="2.5" fill="#222"/>
    <path d="M8 4 Q6 1 7 3" stroke="#222" stroke-width="1.5" fill="none"/>
    <path d="M16 4 Q18 1 17 3" stroke="#222" stroke-width="1.5" fill="none"/>
    <path d="M12 2 Q11 0 12 1.5" stroke="#222" stroke-width="1.5" fill="none"/>
    <!-- eyes --><circle cx="10.5" cy="6" r="1" fill="#fff"/>
    <circle cx="13.5" cy="6" r="1" fill="#fff"/>
    <circle cx="10.8" cy="6" r=".6" fill="#cc44ff"/>
    <circle cx="13.8" cy="6" r=".6" fill="#cc44ff"/>
    <!-- star on hat hint --><polygon points="12,0 12.4,1.2 13.7,1.2 12.7,2 13,3.2 12,2.5 11,3.2 11.3,2 10.3,1.2 11.6,1.2" fill="#ffdd44" opacity=".8"/>
  </svg>`,

  // 🗡️ SNEAKY STABBER — hooded rogue, dark green cloak, twin daggers
  rogue:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- cloak base --><ellipse cx="12" cy="18" rx="7" ry="5" fill="#1a3322"/>
    <!-- cloak body --><rect x="6" y="8" width="12" height="13" rx="3" fill="#1e3d28"/>
    <rect x="7" y="9" width="10" height="11" rx="2" fill="#254d32"/>
    <!-- cloak dark inner --><polygon points="12,9 9,21 15,21" fill="#152a1e" opacity=".7"/>
    <!-- leather belt --><rect x="6" y="15" width="12" height="2" rx=".5" fill="#7a4a1a"/>
    <rect x="11" y="14.5" width="2" height="3" rx=".4" fill="#9a6a2a"/>
    <!-- arms --><rect x="3" y="9" width="3" height="7" rx="1" fill="#1e3d28"/>
    <rect x="18" y="9" width="3" height="7" rx="1" fill="#1e3d28"/>
    <!-- dagger left --><rect x="1" y="8" width="1" height="8" rx=".4" fill="#ccc"/>
    <rect x=".5" y="7" width="2" height="1.5" rx=".3" fill="#888"/>
    <rect x=".8" y="5.5" width="1.4" height="2" rx=".5" fill="#ffdd88"/>
    <!-- dagger right --><rect x="22" y="8" width="1" height="8" rx=".4" fill="#ccc"/>
    <rect x="21.5" y="7" width="2" height="1.5" rx=".3" fill="#888"/>
    <rect x="21.8" y="5.5" width="1.4" height="2" rx=".5" fill="#ffdd88"/>
    <!-- hood --><ellipse cx="12" cy="6" rx="5" ry="4" fill="#1a2e1e"/>
    <ellipse cx="12" cy="5" rx="4" ry="3" fill="#224428"/>
    <!-- shadow face under hood --><ellipse cx="12" cy="7" rx="3" ry="2.5" fill="#0a1a0e"/>
    <!-- glinting eyes --><circle cx="10.5" cy="6.5" r=".6" fill="#44ff88" opacity=".9"/>
    <circle cx="13.5" cy="6.5" r=".6" fill="#44ff88" opacity=".9"/>
    <!-- scar hint --><line x1="13" y1="6" x2="14.5" y2="7.5" stroke="#553322" stroke-width=".5"/>
  </svg>`,

  // 🛡️ HOLY YELLER — paladin, golden armour, glowing mace, holy aura
  paladin:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- holy aura glow --><circle cx="12" cy="12" r="11" fill="none" stroke="#ffdd44" stroke-width=".5" opacity=".4"/>
    <!-- boots --><rect x="7" y="20" width="4" height="3" rx="1" fill="#8a7020"/>
    <rect x="13" y="20" width="4" height="3" rx="1" fill="#8a7020"/>
    <!-- legs --><rect x="8" y="16" width="3" height="5" fill="#aa8828"/>
    <rect x="13" y="16" width="3" height="5" fill="#aa8828"/>
    <!-- body armour gold --><rect x="6" y="9" width="12" height="8" rx="1" fill="#bb9930"/>
    <rect x="7" y="10" width="10" height="6" rx="1" fill="#ddbb44"/>
    <!-- cross emblem --><rect x="11" y="10" width="2" height="6" rx=".4" fill="#ffffff" opacity=".9"/>
    <rect x="8" y="12" width="8" height="2" rx=".4" fill="#ffffff" opacity=".9"/>
    <!-- shoulders --><rect x="4" y="9" width="3" height="3" rx="1" fill="#bb9930"/>
    <rect x="17" y="9" width="3" height="3" rx="1" fill="#bb9930"/>
    <!-- mace (right) --><rect x="20" y="12" width="1.5" height="9" rx=".5" fill="#aaa"/>
    <rect x="18.5" y="10" width="4.5" height="3" rx="1" fill="#cc9933"/>
    <circle cx="20.8" cy="11.5" r="1.5" fill="#ffdd44"/>
    <circle cx="20.8" cy="11.5" r=".8" fill="#fff" opacity=".6"/>
    <!-- shield (left) --><rect x="1" y="7" width="4" height="6" rx="1" fill="#bb9930"/>
    <rect x="1.5" y="7.5" width="3" height="5" rx=".5" fill="#ddbb44"/>
    <rect x="2.8" y="9.5" width="1.5" height="4" rx=".3" fill="#fff" opacity=".7"/>
    <rect x="1.8" y="10.5" width="3.5" height="1.5" rx=".3" fill="#fff" opacity=".7"/>
    <!-- helmet --><rect x="7" y="3" width="10" height="7" rx="2" fill="#cc9930"/>
    <rect x="8" y="4" width="8" height="5" rx="1" fill="#ddbb44"/>
    <!-- helmet cross --><rect x="11.2" y="3.5" width="1.6" height="5" rx=".4" fill="#fff" opacity=".6"/>
    <rect x="8.5" y="5.5" width="7" height="1.5" rx=".4" fill="#fff" opacity=".6"/>
    <!-- face --><rect x="9" y="6" width="6" height="2" rx=".5" fill="#1a0a00" opacity=".7"/>
    <circle cx="10.5" cy="7" r=".7" fill="#ffee88"/>
    <circle cx="13.5" cy="7" r=".7" fill="#ffee88"/>
    <!-- halo --><circle cx="12" cy="2.5" r="2" fill="none" stroke="#ffdd44" stroke-width=".8" opacity=".7"/>
  </svg>`,
};

// Hero sprite as data URI
function getHeroSVG(classKey){
  const svg=HERO_SVGS[classKey]||HERO_SVGS.warrior;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

// Build hero img tag at given size
function heroImgTag(classKey, sz=40){
  const uri=getHeroSVG(classKey);
  return `<img src="${uri}" width="${sz}" height="${sz}" style="image-rendering:pixelated;display:block;" class="idle">`;
}

// ═══════════════════════════════
// ITEM SVG SPRITES
// Reuses the same sprite-driven mechanism as the map renderer.
// ═══════════════════════════════
const ITEM_SVGS={
  sword:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="7" y="1.2" width="2" height="8.2" rx=".6" fill="#ccd6e4"/><rect x="6.2" y="8.6" width="3.6" height="1.1" rx=".4" fill="#8a93a6"/><rect x="7.2" y="9.6" width="1.6" height="3.8" rx=".5" fill="#7b4a22"/><rect x="6.6" y="13" width="2.8" height="1.8" rx=".5" fill="#c89a54"/><path d="M8 1.2 L9.4 3.1 L8 4 L6.6 3.1 Z" fill="#eef4ff"/></svg>`,
  spear:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="7.2" y="2.1" width="1.6" height="11.5" rx=".6" fill="#8b5b31"/><polygon points="8,0.7 10.8,4 8,5.1 5.2,4" fill="#d9e4f0"/><rect x="6.2" y="9.2" width="3.6" height="1" rx=".4" fill="#c18a4b"/></svg>`,
  mace:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="7.2" y="4.8" width="1.6" height="9" rx=".6" fill="#8a5a32"/><circle cx="8" cy="3.3" r="2.6" fill="#adb6c7"/><circle cx="8" cy="3.3" r="1.6" fill="#929db3"/><rect x="6.7" y="12.8" width="2.6" height="1.6" rx=".5" fill="#d3a15b"/></svg>`,
  wand:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="7.2" y="4.2" width="1.6" height="9.4" rx=".6" fill="#5a3f79"/><circle cx="8" cy="3" r="2.4" fill="#67d5ff"/><circle cx="8" cy="3" r="1.4" fill="#b4efff"/><circle cx="8.9" cy="2.2" r=".5" fill="#fff"/><rect x="6.6" y="12.8" width="2.8" height="1.6" rx=".5" fill="#8b62c8"/></svg>`,
  armor:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M5 2.1h6l2.2 2v3.3c0 2.6-2.2 5.4-5.2 6.8-3-1.4-5.2-4.2-5.2-6.8V4.1Z" fill="#778197"/><path d="M6 3.1h4l1.5 1.3v2.6c0 2.1-1.7 4.1-3.5 5.1-1.8-1-3.5-3-3.5-5.1V4.4Z" fill="#909bb2"/><rect x="7.2" y="5.1" width="1.6" height="4.8" rx=".4" fill="#d9e2ef"/></svg>`,
  boots:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 2.2h3.2v6.4H10v2.5H3.4V8.7H4Z" fill="#8c5a2f"/><path d="M8.8 3.2H12v5.4h2v2.5H8.2V8.7h.6Z" fill="#6f4525"/><rect x="2.7" y="11" width="4.8" height="2" rx=".7" fill="#c7924f"/><rect x="8.5" y="11" width="4.8" height="2" rx=".7" fill="#b07f45"/></svg>`,
  helm:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3 7.1c0-3 2.2-5.2 5-5.2s5 2.2 5 5.2v4.8H3Z" fill="#7f8798"/><path d="M4.2 7.1c0-2.3 1.5-3.9 3.8-3.9s3.8 1.6 3.8 3.9v3.7H4.2Z" fill="#a1abbe"/><rect x="5.2" y="8" width="5.6" height="1.6" rx=".5" fill="#1f2633"/><rect x="6.4" y="9.9" width="3.2" height="1.8" rx=".5" fill="#d8e0ee"/></svg>`,
  ring:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="8.2" rx="4.4" ry="4.6" fill="#c8a755"/><ellipse cx="8" cy="8.2" rx="2.4" ry="2.6" fill="#0a0c14"/><circle cx="8" cy="3.2" r="1.9" fill="#87b7ff"/><circle cx="8" cy="3.2" r="1.1" fill="#d3ebff"/></svg>`,
  potion_hp:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="6.2" y="1.3" width="3.6" height="2.1" rx=".5" fill="#a9b7cc"/><rect x="5.2" y="3" width="5.6" height="1.1" rx=".4" fill="#8290a3"/><path d="M4.5 4.1h7v1.4l1 1.4v3.8c0 2.3-2 4-4.5 4s-4.5-1.7-4.5-4V6.9l1-1.4Z" fill="#8d2435"/><path d="M5.4 6h5.2v4.3c0 1.5-1.1 2.7-2.6 2.7s-2.6-1.2-2.6-2.7Z" fill="#ff4a66"/><rect x="6.1" y="7.5" width="3.8" height="1.1" rx=".4" fill="#ffd6df"/></svg>`,
  potion_mp:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="6.2" y="1.3" width="3.6" height="2.1" rx=".5" fill="#a9b7cc"/><rect x="5.2" y="3" width="5.6" height="1.1" rx=".4" fill="#8290a3"/><path d="M4.5 4.1h7v1.4l1 1.4v3.8c0 2.3-2 4-4.5 4s-4.5-1.7-4.5-4V6.9l1-1.4Z" fill="#153475"/><path d="M5.4 6h5.2v4.3c0 1.5-1.1 2.7-2.6 2.7s-2.6-1.2-2.6-2.7Z" fill="#2f8dff"/><circle cx="8" cy="8.6" r="1.3" fill="#bce2ff"/></svg>`,
  bomb:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="7.5" cy="9" r="4.6" fill="#242a34"/><circle cx="7.5" cy="9" r="3.4" fill="#323b48"/><path d="M8 4.6 L10.8 2.2" stroke="#8d6944" stroke-width="1.1"/><path d="M11.4 1.8 L14.2 1.1" stroke="#ffcb55" stroke-width="1.2"/><circle cx="14.5" cy="1" r=".8" fill="#ff9955"/><circle cx="6" cy="8" r=".9" fill="#7d8897"/></svg>`,
  gold:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="9.6" rx="5.2" ry="3.7" fill="#a7741e"/><ellipse cx="8" cy="8.8" rx="4.6" ry="3.1" fill="#f2c84b"/><ellipse cx="8" cy="8.2" rx="3.4" ry="2.1" fill="#ffd86a"/><circle cx="9.2" cy="7.2" r=".8" fill="#fff1b0"/></svg>`,
  ore:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><polygon points="2,10 5,4 11,3 14,8 12,13 5,14" fill="#6e7483"/><polygon points="4,10 6,6 10,5 12,8 10.8,11.8 6,12.5" fill="#8d95a8"/><circle cx="8.4" cy="8.2" r="1" fill="#d5deef"/></svg>`,
  ingot:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2.6 9.8h10.8l-1.4 3.6H4Z" fill="#6b7488"/><path d="M4 7.2h8l1.3 2.6H2.7Z" fill="#9aa5bb"/><rect x="5.1" y="8.1" width="5.8" height="1.2" rx=".5" fill="#d8e2f0"/></svg>`,
  herb:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 13.8c2.8-2.2 4.9-4.6 4.9-7.4-2.9.1-4.4 1.6-4.9 3.7-.5-2.1-2-3.6-4.9-3.7 0 2.8 2.1 5.2 4.9 7.4Z" fill="#4aa155"/><path d="M8 12.8c2-1.6 3.6-3.4 3.6-5.3-2 .2-3.1 1.3-3.6 2.9-.5-1.6-1.6-2.7-3.6-2.9 0 1.9 1.6 3.7 3.6 5.3Z" fill="#7bd38a"/><rect x="7.5" y="11.8" width="1" height="2.4" rx=".4" fill="#6d4b2d"/></svg>`,
  bone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="4" cy="5.1" r="1.9" fill="#e7e0cb"/><circle cx="5.7" cy="4.7" r="1.4" fill="#e7e0cb"/><circle cx="10.3" cy="11.3" r="1.4" fill="#e7e0cb"/><circle cx="12" cy="10.9" r="1.9" fill="#e7e0cb"/><rect x="4.5" y="5.4" width="7" height="4.6" rx="2.2" transform="rotate(35 8 8)" fill="#d5cdb3"/></svg>`,
  gem:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><polygon points="8,1.5 12.6,5.8 10.2,13.6 5.8,13.6 3.4,5.8" fill="#5d66d6"/><polygon points="8,3 11.2,6 9.5,11.8 6.5,11.8 4.8,6" fill="#8ea5ff"/><line x1="8" y1="1.5" x2="8" y2="13.6" stroke="#d4ddff" stroke-width=".8" opacity=".8"/></svg>`,
  scale:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 2.1c3.3 0 5.6 2.3 5.6 5.3S11.3 13 8 13 2.4 10.8 2.4 7.4 4.7 2.1 8 2.1Z" fill="#5a7e45"/><path d="M8 3.5c2.4 0 4.2 1.6 4.2 3.9S10.4 11.3 8 11.3 3.8 9.7 3.8 7.4 5.6 3.5 8 3.5Z" fill="#7fb06a"/><path d="M4.6 7.2 Q8 5 11.4 7.2" stroke="#3f5931" stroke-width=".7" fill="none"/><path d="M5.1 9.1 Q8 7.6 10.9 9.1" stroke="#3f5931" stroke-width=".7" fill="none"/></svg>`,
  essence:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="9.5" rx="4.6" ry="3.8" fill="#4f356e"/><ellipse cx="8" cy="8.7" rx="3.7" ry="2.9" fill="#7f5bc3"/><path d="M8 1.5 L9.6 4.8 L13.2 5.2 L10.5 7.4 L11.3 10.8 L8 9.1 L4.7 10.8 L5.5 7.4 L2.8 5.2 L6.4 4.8 Z" fill="#f0d87a"/><circle cx="8" cy="6.3" r="1.1" fill="#fff4ba"/></svg>`,
  unknown:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="2" fill="#3a4050"/><text x="8" y="11" text-anchor="middle" font-size="8" fill="#e8eef8">?</text></svg>`,
};

const ITEM_URI_CACHE=new Map();
const ITEM_TIER_GLOW={1:'#bcc3d2',2:'#63df8b',3:'#67b4ff',4:'#bb7bff',5:'#ffd35f',6:'#ff9f44',7:'#ff58c8',8:'#ffffff'};

function escAttr(v){
  return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getItemSpriteKey(it){
  if(!it)return'unknown';
  const type=String(it.type||'').toLowerCase();
  const id=String(it.id||'').toLowerCase();
  const name=String(it.name||'').toLowerCase();

  if(type==='weapon'||name.includes('sword')||name.includes('blade')||name.includes('lance')||name.includes('spear')||name.includes('mace')||name.includes('wand')||name.includes('staff')){
    if(name.includes('wand')||name.includes('staff')||name.includes('orb')||name.includes('rod')||name.includes('arcane')||name.includes('rune'))return'wand';
    if(name.includes('mace')||name.includes('hammer')||name.includes('mallet')||name.includes('gavel')||name.includes('crusher')||name.includes('bonk'))return'mace';
    if(name.includes('spear')||name.includes('lance'))return'spear';
    return'sword';
  }
  if(type==='armor'){
    if(name.includes('boot'))return'boots';
    if(name.includes('helm')||name.includes('helmet')||name.includes('crown'))return'helm';
    return'armor';
  }
  if(type==='ring'||id.includes('ring')||name.includes('ring'))return'ring';
  if(it.isHp||type==='hp_pot'||name.includes('hp potion'))return'potion_hp';
  if(it.isMp||type==='mp_pot'||name.includes('mp potion'))return'potion_mp';
  if(type==='elixir')return'wand';
  if(type==='consumable'&&(id.includes('bomb')||name.includes('bomb')))return'bomb';
  if(type==='gold'||id.includes('gold')||name.includes('gold'))return'gold';

  if(type==='material'||id||name){
    if(id.includes('ore'))return'ore';
    if(id.includes('bar')||name.includes('bar'))return'ingot';
    if(id.includes('bone')||id.includes('fang')||name.includes('bone')||name.includes('fang'))return'bone';
    if(id.includes('scale')||name.includes('scale'))return'scale';
    if(id.includes('essence')||name.includes('essence'))return'essence';
    if(id.includes('mushroom')||id.includes('bloom')||id.includes('petal')||name.includes('mushroom')||name.includes('petal')||name.includes('bloom'))return'herb';
    if(id.includes('void')||id.includes('rune')||id.includes('gem')||id.includes('crystal')||id.includes('dust')||id.includes('shard'))return'gem';
    if(id.includes('wood')||id.includes('leather'))return'herb';
  }
  return'unknown';
}

function getItemGlowColor(it){
  if(!it)return'#ffd78d';
  const type=String(it.type||'').toLowerCase();
  if(type==='material'){
    const rarity=Math.max(1,Math.min(4,Number(it.rarity||1)));
    if(rarity===1)return'#8ea0b6';
    if(rarity===2)return'#63d782';
    if(rarity===3)return'#68b0ff';
    return'#b781ff';
  }
  if(it.isHp||type==='hp_pot')return'#ff6478';
  if(it.isMp||type==='mp_pot')return'#62a7ff';
  if(type==='ring')return'#ffe18f';
  if(type==='gold')return'#ffd15e';
  if(type==='consumable')return'#ff9d62';
  if(type==='elixir')return'#9f86ff';
  const tier=Math.max(1,Math.min(8,Number(it.tier||1)));
  return ITEM_TIER_GLOW[tier]||'#ffd78d';
}

function getItemAnimClass(it){
  const key=getItemSpriteKey(it);
  if(key==='gem'||key==='wand'||key==='ring'||key==='essence')return'anim-float';
  if(key==='bomb'||key==='ore'||key==='ingot')return'anim-wobble';
  if(key==='herb'||key==='scale')return'anim-sway';
  return'anim-bob';
}

function getItemSpriteURI(it){
  const key=getItemSpriteKey(it);
  if(ITEM_URI_CACHE.has(key))return ITEM_URI_CACHE.get(key);
  const svg=ITEM_SVGS[key]||ITEM_SVGS.unknown;
  const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  ITEM_URI_CACHE.set(key,uri);
  return uri;
}

function buildItemSpriteHTML(it, sz=24, extraClass=''){
  const uri=getItemSpriteURI(it);
  const glow=getItemGlowColor(it);
  const anim=getItemAnimClass(it);
  const cls=extraClass?` ${extraClass}`:'';
  const nm=escAttr(it?.name||'Item');
  return `<span class="item-wrap${cls}" style="--item-glow:${glow}"><span class="item-shadow"></span><img class="item-sprite ${anim}" src="${uri}" width="${sz}" height="${sz}" alt="${nm}" title="${nm}"></span>`;
}

// Each is a tiny inline SVG returning a data URI
// ═══════════════════════════════

// Pixel-art style SVGs — all 16×16 viewBox, rendered at cell size
const MONSTER_SVGS = {
  // 🟢 SLIME — reference blob silhouette
  slime:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="11" rx="5.8" ry="3.7" fill="#1a5127"/><path d="M2.5 10.3c0-3.2 2.4-6 5.5-6s5.5 2.8 5.5 6v1.1c0 1.9-2.6 3.3-5.5 3.3s-5.5-1.4-5.5-3.3v-1.1Z" fill="#38c45d"/><path d="M4.3 8.9c0-2.2 1.6-4 3.7-4s3.7 1.8 3.7 4" fill="#53e379"/><circle cx="6.3" cy="9.2" r="1.05" fill="#f3ffe9"/><circle cx="9.7" cy="9.2" r="1.05" fill="#f3ffe9"/><circle cx="6.6" cy="9.2" r=".45" fill="#17311f"/><circle cx="10" cy="9.2" r=".45" fill="#17311f"/></svg>`,
  // 💀 SKELETON — readable skull/limbs silhouette
  skeleton:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="3.9" r="3" fill="#ddd9ca"/><circle cx="6.8" cy="3.7" r=".9" fill="#1d1d1d"/><circle cx="9.2" cy="3.7" r=".9" fill="#1d1d1d"/><rect x="7.2" y="5.3" width="1.6" height=".9" rx=".3" fill="#1d1d1d"/><rect x="5.4" y="6.8" width="5.2" height="4.8" rx=".8" fill="#c4c0b2"/><rect x="7.4" y="6.8" width="1.2" height="4.8" fill="#8a877d"/><line x1="5.8" y1="8.7" x2="10.2" y2="8.7" stroke="#8a877d" stroke-width=".6"/><line x1="5.8" y1="10.1" x2="10.2" y2="10.1" stroke="#8a877d" stroke-width=".6"/><line x1="6.2" y1="11.3" x2="5.1" y2="15" stroke="#cbc7b9" stroke-width="1.2"/><line x1="9.8" y1="11.3" x2="10.9" y2="15" stroke="#cbc7b9" stroke-width="1.2"/></svg>`,
  // 🦇 BAT — winged silhouette from reference set
  bat:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2.1 9.1c.4-2.8 2.2-4.6 4.8-3.8 1 .3 1.5 1.2 1.1 2.1-.6 1.4-2.2 2.7-5.9 1.7Z" fill="#3c2959"/><path d="M13.9 9.1c-.4-2.8-2.2-4.6-4.8-3.8-1 .3-1.5 1.2-1.1 2.1.6 1.4 2.2 2.7 5.9 1.7Z" fill="#3c2959"/><ellipse cx="8" cy="8.7" rx="2.1" ry="2.5" fill="#5e3a87"/><path d="M6.5 6.6 7 5 8 6.1 9 5 9.5 6.6" fill="#2e1d45"/><circle cx="7.3" cy="8.2" r=".55" fill="#ff4f87"/><circle cx="8.7" cy="8.2" r=".55" fill="#ff4f87"/></svg>`,
  // 🧌 GOBLIN — hunched raider silhouette
  goblin:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="12.5" rx="4.3" ry="2.2" fill="#23331e"/><circle cx="8" cy="4.7" r="2.8" fill="#6ea53a"/><polygon points="5.1,4.5 6.1,2.5 6.9,4.5" fill="#4f8428"/><polygon points="10.9,4.5 9.9,2.5 9.1,4.5" fill="#4f8428"/><rect x="5.8" y="7" width="4.4" height="4.6" rx=".8" fill="#4a7f2e"/><rect x="4.8" y="8.4" width="1.4" height="2.9" rx=".5" fill="#4a7f2e"/><rect x="9.8" y="8.4" width="1.4" height="2.9" rx=".5" fill="#4a7f2e"/><circle cx="6.9" cy="4.8" r=".75" fill="#f0e58f"/><circle cx="9.1" cy="4.8" r=".75" fill="#f0e58f"/><circle cx="7.1" cy="4.8" r=".3" fill="#1b2817"/><circle cx="9.3" cy="4.8" r=".3" fill="#1b2817"/></svg>`,
  // 🐀 RAT — small floor enemy silhouette
  rat:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="7.8" cy="9.2" rx="4.2" ry="2.6" fill="#5f6472"/><ellipse cx="10.9" cy="8.2" rx="2.1" ry="1.6" fill="#767b8a"/><circle cx="11.5" cy="6.8" r=".7" fill="#9398a7"/><circle cx="9.8" cy="6.9" r=".6" fill="#9398a7"/><circle cx="11.8" cy="8.1" r=".28" fill="#171a24"/><path d="M3.8 9.8c-1.8.6-2.7 1.2-3.1 2.2" stroke="#a37584" stroke-width=".8" fill="none" stroke-linecap="round"/><circle cx="12.8" cy="8.2" r=".2" fill="#e8d8d8"/></svg>`,
  // 👻 GHOST — spectral silhouette
  ghost:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3.4 13.9V7.3a4.6 4.6 0 1 1 9.2 0V14l-1.8-1.4-1.5 1.4-1.3-1.3-1.3 1.3-1.4-1.2Z" fill="#c8d8ff"/><path d="M4.9 7.2a3.1 3.1 0 0 1 6.2 0V12l-.9-.7-1.1.9-1.1-.8-1.1.8-1.1-.9-1 .8Z" fill="#9ec0ff"/><circle cx="6.8" cy="7.4" r=".8" fill="#1d2b4a"/><circle cx="9.2" cy="7.4" r=".8" fill="#1d2b4a"/><ellipse cx="8" cy="9.4" rx="1.1" ry=".6" fill="#405f96"/></svg>`,
  // 🕯️ CULTIST — hooded caster silhouette
  cultist:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="13" rx="4.5" ry="2.2" fill="#241629"/><path d="M4.6 12.7h6.8l-.8-5.7h-5.2Z" fill="#4e2368"/><path d="M8 2.1 4.9 6.9h6.2Z" fill="#31133f"/><ellipse cx="8" cy="6.3" rx="1.9" ry="2" fill="#1f2030"/><circle cx="7.3" cy="6.2" r=".35" fill="#c9b8ff"/><circle cx="8.7" cy="6.2" r=".35" fill="#c9b8ff"/><rect x="10.9" y="5.8" width=".8" height="6.3" rx=".3" fill="#6f5588"/><circle cx="11.3" cy="5.2" r="1.1" fill="#8a5bdb"/></svg>`,
  // 🛡️ ARMORED BRUTE — heavy plate silhouette
  armored_brute:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="13.2" rx="4.8" ry="2.1" fill="#1d2029"/><rect x="4.7" y="6.2" width="6.6" height="6.8" rx="1.2" fill="#5d616f"/><rect x="5.4" y="7" width="5.2" height="5.2" rx=".8" fill="#707687"/><rect x="3.4" y="7.5" width="1.8" height="4.7" rx=".7" fill="#4a4f5e"/><rect x="10.8" y="7.5" width="1.8" height="4.7" rx=".7" fill="#4a4f5e"/><rect x="5.8" y="1.8" width="4.4" height="4.9" rx="1.2" fill="#616879"/><rect x="6.4" y="2.5" width="3.2" height="3.5" rx=".8" fill="#7c8496"/><circle cx="7.2" cy="4.2" r=".45" fill="#ffb56a"/><circle cx="8.8" cy="4.2" r=".45" fill="#ffb56a"/></svg>`,
  // 🔥 FIRE IMP — red fiery creature
  fire_imp:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="9" rx="4" ry="4.5" fill="#cc2200"/><circle cx="8" cy="6" r="3" fill="#dd3300"/><path d="M6 4 Q8 1 10 4 Q9 2 8 3 Q7 2 6 4Z" fill="#ff6600"/><path d="M4 5 Q5 2 7 5 Q6 3 5 4Z" fill="#ff8800"/><path d="M12 5 Q11 2 9 5 Q10 3 11 4Z" fill="#ff8800"/><circle cx="6.5" cy="6" r=".8" fill="#ffdd00"/><circle cx="9.5" cy="6" r=".8" fill="#ffdd00"/></svg>`,
  // 🌋 LAVA GOLEM — rocky orange creature
  lava_golem:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="4" y="5" width="8" height="9" rx="2" fill="#555"/><rect x="5" y="6" width="6" height="7" rx="1.5" fill="#333"/><rect x="3" y="7" width="2.5" height="5" rx=".8" fill="#444"/><rect x="10.5" y="7" width="2.5" height="5" rx=".8" fill="#444"/><circle cx="8" cy="3.5" rx="3" ry="3" fill="#444"/><ellipse cx="8" cy="3.5" rx="2.5" ry="2.5" fill="#333"/><circle cx="6.5" cy="3" r="1" fill="#ff6600"/><circle cx="9.5" cy="3" r="1" fill="#ff6600"/><path d="M5 8 Q8 10 11 8" stroke="#ff4400" stroke-width=".8" fill="none" opacity=".7"/></svg>`,
  // 👻 SHADOW WRAITH — dark spectral form
  shadow_wraith:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="5" ry="6" fill="#221133" opacity=".9"/><ellipse cx="8" cy="7" rx="4" ry="4" fill="#332244"/><circle cx="6" cy="6" r="1.2" fill="#8844ff" opacity=".9"/><circle cx="10" cy="6" r="1.2" fill="#8844ff" opacity=".9"/><path d="M5 11 Q6 14 5 16 M8 12 Q8 15 8 16 M11 11 Q10 14 11 16" stroke="#221133" stroke-width="2" opacity=".8"/></svg>`,
  // 🧟 ZOMBIE CHEF — grumpy undead
  zombie:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="4.5" r="3.2" fill="#88aa66"/><circle cx="6.5" cy="4" r="1" fill="#eeeecc"/><circle cx="9.5" cy="4" r="1" fill="#eeeecc"/><circle cx="7" cy="4" r=".5" fill="#333"/><circle cx="10" cy="4" r=".5" fill="#333"/><path d="M6 6 Q8 7.5 10 6" stroke="#333" stroke-width=".6" fill="none"/><rect x="5.5" y="7" width="5" height="5" rx=".5" fill="#668855"/><line x1="5.5" y1="12" x2="4.5" y2="16" stroke="#668855" stroke-width="1.3"/><line x1="10.5" y1="12" x2="11.5" y2="16" stroke="#668855" stroke-width="1.3"/></svg>`,
  // 🕷️ SPIDER — broad leg silhouette
  spider:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="9.3" rx="3.1" ry="2.2" fill="#1f1f27"/><ellipse cx="8" cy="6.6" rx="2.2" ry="1.8" fill="#2f2f38"/><circle cx="6.9" cy="6.2" r=".5" fill="#f04b64"/><circle cx="8" cy="6" r=".5" fill="#f04b64"/><circle cx="9.1" cy="6.2" r=".5" fill="#f04b64"/><line x1="5.2" y1="8.1" x2="1.4" y2="6.2" stroke="#3c3f4c" stroke-width=".8"/><line x1="5.1" y1="9.3" x2="1" y2="9.3" stroke="#3c3f4c" stroke-width=".8"/><line x1="5.2" y1="10.6" x2="1.5" y2="12.3" stroke="#3c3f4c" stroke-width=".8"/><line x1="10.8" y1="8.1" x2="14.6" y2="6.2" stroke="#3c3f4c" stroke-width=".8"/><line x1="10.9" y1="9.3" x2="15" y2="9.3" stroke="#3c3f4c" stroke-width=".8"/><line x1="10.8" y1="10.6" x2="14.5" y2="12.3" stroke="#3c3f4c" stroke-width=".8"/></svg>`,
  // 🌳 TREANT — walking tree
  treant:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="7" y="10" width="2" height="6" fill="#7a4a2a"/><ellipse cx="8" cy="6" rx="5" ry="5.5" fill="#2a6a1a"/><ellipse cx="8" cy="5" rx="4" ry="4.5" fill="#33882a"/><circle cx="6" cy="5" r=".8" fill="#ffaa00" opacity=".7"/><circle cx="10" cy="5" r=".8" fill="#ffaa00" opacity=".7"/><line x1="4" y1="8" x2="2" y2="11" stroke="#7a4a2a" stroke-width="1.2"/><line x1="12" y1="8" x2="14" y2="11" stroke="#7a4a2a" stroke-width="1.2"/></svg>`,
  // ▢ VOID CUBE — geometric horror
  void_cube:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="3" y="5" width="10" height="10" rx="1" fill="#220033"/><rect x="4" y="2" width="9" height="9" rx="1" fill="#330044" opacity=".9"/><rect x="5" y="3" width="8" height="8" rx="1" fill="#440055"/><circle cx="7" cy="6" r="1" fill="#cc44ff"/><circle cx="10" cy="8" r="1" fill="#cc44ff"/><line x1="5" y1="7" x2="11" y2="7" stroke="#8822cc" stroke-width=".6" opacity=".6"/></svg>`,
  // 🤡 COSMIC JESTER — chaos entity
  jester:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="6" r="4" fill="#440044"/><path d="M4 4 Q5 1 6 3" stroke="#ff44ff" stroke-width="1" fill="none"/><path d="M12 4 Q11 1 10 3" stroke="#44ffff" stroke-width="1" fill="none"/><circle cx="6" cy="5.5" r="1.2" fill="#ff44ff"/><circle cx="10" cy="5.5" r="1.2" fill="#44ffff"/><path d="M6 8 Q8 9.5 10 8" stroke="#fff" stroke-width=".6" fill="none"/><rect x="6" y="9" width="4" height="4" rx=".5" fill="#550055"/><line x1="6" y1="13" x2="5" y2="16" stroke="#550055" stroke-width="1.2"/><line x1="10" y1="13" x2="11" y2="16" stroke="#550055" stroke-width="1.2"/></svg>`,
  // 🛡️ GLITCH KNIGHT — corrupted warrior
  glitch:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="5" y="5" width="6" height="10" rx="1" fill="#113"/>  <rect x="4" y="2" width="8" height="5" rx="1" fill="#224"/><rect x="6" y="2.5" width="4" height="3" rx=".5" fill="#003"/><rect x="6.5" y="3" width="1.5" height="2" fill="#0ff" opacity=".7"/><rect x="9" y="3" width="1" height="2" fill="#f0f" opacity=".7"/><rect x="3" y="6" width="2" height="5" rx=".5" fill="#224"/><rect x="11" y="6" width="2" height="5" rx=".5" fill="#224"/><rect x="5" y="15" width="2" height="2" fill="#113"/><rect x="9" y="15" width="2" height="2" fill="#113"/></svg>`,
  // ⭐ STAR HORROR — celestial nightmare
  star_horror:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><polygon points="8,1 9.5,6 15,6 10.5,9 12,15 8,11.5 4,15 5.5,9 1,6 6.5,6" fill="#884400"/><polygon points="8,2.5 9,6 13.5,6 10,8.5 11,13 8,10.5 5,13 6,8.5 2.5,6 7,6" fill="#cc6600"/><circle cx="8" cy="8" r="2" fill="#ffaa00"/><circle cx="8" cy="8" r="1" fill="#ffffff" opacity=".8"/></svg>`,
  // 🐉 DISCOUNT DRAGON — goofy dragon
  dragon:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="10" rx="5" ry="4" fill="#226600"/><circle cx="8" cy="6" r="3.5" fill="#33880a"/><polygon points="6,4 7,1 8,4" fill="#33880a"/><polygon points="10,4 9,1 8,4" fill="#33880a"/><circle cx="6.5" cy="5.5" r="1" fill="#ffdd00"/><circle cx="9.5" cy="5.5" r="1" fill="#ffdd00"/><circle cx="7" cy="5.5" r=".5" fill="#333"/><circle cx="10" cy="5.5" r=".5" fill="#333"/><path d="M13 8 Q16 6 14 10 Q13 9 12 9Z" fill="#226600"/></svg>`,
  // 👑 BOSS — menacing crowned entity
  boss:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><ellipse cx="8" cy="9" rx="6" ry="6" fill="#440011"/><ellipse cx="8" cy="8" rx="5" ry="5" fill="#660022"/><polygon points="8,2 9.5,5 13,4 11,7 14,9 10,8.5 8,12 6,8.5 2,9 5,7 3,4 6.5,5" fill="#ffd700"/><circle cx="6" cy="7" r="1.3" fill="#ff4444"/><circle cx="10" cy="7" r="1.3" fill="#ff4444"/><path d="M5.5 10 Q8 12 10.5 10" stroke="#ff6666" stroke-width=".8" fill="none"/></svg>`,
  // Default fallback
  unknown:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#333"/><text x="8" y="12" text-anchor="middle" font-size="9" fill="#fff">?</text></svg>`,
};

// Map enemy name patterns → sprite keys
function getMonsterSprite(en){
  const n=(en.name||'').toUpperCase();
  const has=(re)=>re.test(n);
  if(en.boss||n.includes('BIG BAD')||n.includes('INFERNO')||n.includes('ANCIENT')||n.includes('NULL'))return'boss';

  // Reference lineup: skeleton / bat / slime / goblin / ghost / spider / cultist / armored brute
  if(has(/\bRAT\b/)||n.includes('CONFUSED RAT'))return'rat';
  if(n.includes('SKELETON')||n.includes('BONE')||n.includes('ARCHER')||n.includes('LICH')||n.includes('INTERN'))return'skeleton';
  if(n.includes('ZOMBIE')||n.includes('CHEF'))return'skeleton';
  if(n.includes('BAT')||n.includes('PIXIE'))return'bat';
  if(n.includes('GOBLIN'))return'goblin';
  if(n.includes('SLIME')||n.includes('MUSHROOM'))return'slime';
  if(n.includes('SPIDER')||n.includes('DEEP')||n.includes('SQUID'))return'spider';
  if(n.includes('GHOST')||n.includes('WRAITH')||n.includes('SHADOW')||n.includes('DRAMATIC'))return'ghost';
  if(n.includes('WIZARD')||n.includes('WITCH')||n.includes('JESTER')||n.includes('CULT'))return'cultist';
  if(
    n.includes('TROLL')||n.includes('GOLEM')||n.includes('KNIGHT')||n.includes('DEMON')||
    n.includes('DRAGON')||n.includes('BOAR')||n.includes('BARK')||n.includes('CORPORATE')||
    n.includes('GLITCH')
  )return'armored_brute';

  // Keep legacy fallback archetypes for older/generated enemy names.
  if(n.includes('IMP')||n.includes('EMBER'))return'cultist';
  if(n.includes('LAVA')||n.includes('SCORCHED'))return'armored_brute';
  if(n.includes('TREANT'))return'armored_brute';
  if(n.includes('VOID CUBE')||n.includes('CUBE'))return'void_cube';
  if(n.includes('STAR')||n.includes('HORROR'))return'star_horror';
  return'unknown';
}

function enemyGlowColor(en, zoneId){
  if(en.boss)return'rgba(255,80,120,.45)';
  if(en.isElite||en.elite)return'rgba(255,210,90,.45)';
  if(zoneId==='N')return'rgba(120,190,255,.3)';
  if(zoneId==='S')return'rgba(255,120,70,.3)';
  if(zoneId==='E')return'rgba(120,255,160,.28)';
  if(zoneId==='W')return'rgba(210,130,255,.32)';
  return'rgba(255,110,150,.26)';
}

// Build a monster sprite element string
function buildMonsterHTML(en, cs, zoneId){
  const key=getMonsterSprite(en);
  const svg=MONSTER_SVGS[key]||MONSTER_SVGS.unknown;
  const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  const animClass=key==='bat'||key==='ghost'?'anim-float':
                  key==='slime'||key==='rat'?'anim-wobble':
                  key==='spider'||key==='void_cube'||key==='star_horror'?'anim-sway':
                  'anim-bob';
  const eliteClass=en.isElite||en.elite?' elite':'';
  const sz=Math.min(cs-2, cs-1);
  const glow=enemyGlowColor(en, zoneId);
  return `<div class="enemy-wrap" style="--enemy-glow:${glow}">
    <span class="enemy-shadow"></span>
    <img class="monster-sprite ${animClass}${eliteClass}" src="${uri}" width="${sz}" height="${sz}" title="${en.name} LV${en.level} HP:${en.hp}/${en.maxHp}">
  </div>`;
}

// ═══════════════════════════════
// DECORATION & TILE THEMING
// ═══════════════════════════════

// Per-cell deterministic decoration seed
function cellSeed(x,y){return((x*73856093)^(y*19349663))>>>0;}

// Decide if a wall/floor cell gets a decoration
function getCellDeco(x,y,zoneId,cellType){
  const s=cellSeed(x,y);
  const rand=(s%100)/100;

  if(cellType==='wall'){
    if(!zoneId){
      // Central dungeon — stone walls with torch sconces and embedded rocks
      if(rand<.06)return{emoji:'🔥',cls:'torch'};          // wall torch
      if(rand<.09)return{emoji:'🪨',cls:'deco deco-pillar'};// embedded boulder
      if(rand<.11)return{emoji:'🕳️',cls:'deco deco-crack'}; // dark stone crack
    }else if(zoneId==='N'){
      // Ice ruin walls — no fire, just ice and cold stone
      if(rand<.08)return{emoji:'🧊',cls:'deco deco-ice'};   // ice shard in wall
      if(rand<.11)return{emoji:'🧊',cls:'deco deco-ice'};   // ice block
      if(rand<.13)return{emoji:'🪨',cls:'deco'};            // frozen rock
    }else if(zoneId==='S'){
      // Lava cavern walls — hot rock, no actual flames as wall tiles
      if(rand<.07)return{emoji:'🔥',cls:'torch'};           // wall torch (legit on wall)
      if(rand<.10)return{emoji:'🔶',cls:'deco deco-lava'};  // glowing hot stone
      if(rand<.12)return{emoji:'🪨',cls:'deco'};            // dark rock
    }else if(zoneId==='E'){
      // Forest temple — vines crawling on stone walls
      if(rand<.06)return{emoji:'✨',cls:'torch torch-green'}; // bioluminescent moss
      if(rand<.10)return{emoji:'🌿',cls:'deco deco-vine'};    // vines
      if(rand<.12)return{emoji:'🪨',cls:'deco'};              // mossy stone
    }else if(zoneId==='W'){
      // Crypt — candles on stone ledges, runes carved in wall
      if(rand<.07)return{emoji:'🕯️',cls:'torch torch-purple'};// wall candle
      if(rand<.10)return{emoji:'🔱',cls:'deco deco-rune'};    // rune carved in stone
      if(rand<.12)return{emoji:'🦴',cls:'deco deco-bones'};   // bones lodged in wall
    }
    return null;
  }

  // Floor decorations
  if(cellType==='floor'){
    if(!zoneId){
      if(rand<.04)return{emoji:'·',cls:'deco deco-crack'};   // floor crack
      if(rand<.06)return{emoji:'🪨',cls:'deco deco-rubble'}; // small rubble
      if(rand<.07)return{emoji:'💀',cls:'deco deco-bones'};  // old bones on floor
    }else if(zoneId==='N'){
      if(rand<.07)return{emoji:'❄️',cls:'deco deco-ice'};
      if(rand<.09)return{emoji:'❄️',cls:'deco'};
      if(rand<.11)return{emoji:'🪨',cls:'deco deco-crack'};
    }else if(zoneId==='S'){
      if(rand<.06)return{emoji:'🔥',cls:'deco deco-lava'};   // lava crack in floor
      if(rand<.08)return{emoji:'💀',cls:'deco deco-bones'};
      if(rand<.10)return{emoji:'🪨',cls:'deco deco-rubble'};
    }else if(zoneId==='E'){
      if(rand<.08)return{emoji:'🍄',cls:'deco deco-shroom'};
      if(rand<.11)return{emoji:'🍃',cls:'deco deco-vine'};
      if(rand<.12)return{emoji:'🪨',cls:'deco'};
    }else if(zoneId==='W'){
      if(rand<.06)return{emoji:'💀',cls:'deco deco-bones'};
      if(rand<.08)return{emoji:'🦴',cls:'deco'};
      if(rand<.09)return{emoji:'🪨',cls:'deco deco-crack'};
    }
    return null;
  }
  return null;
}

// Returns true if cell should use alt color (checkerboard variation)
function isCellAlt(x,y){return((x+y)%2===0)&&((cellSeed(x,y)%5)<2);}

function isFloorCell(cells,x,y,cw,ch){
  return x>=0&&y>=0&&x<cw&&y<ch&&cells[y][x].type==='floor';
}

function buildRoomGrid(rooms,w,h){
  const grid=Array.from({length:h},()=>Array(w).fill(-1));
  for(let i=0;i<rooms.length;i++){
    const r=rooms[i];
    for(let y=Math.max(0,r.y);y<Math.min(h,r.y+r.h);y++){
      for(let x=Math.max(0,r.x);x<Math.min(w,r.x+r.w);x++)grid[y][x]=i;
    }
  }
  return grid;
}

function getRoomStyleIndex(roomIdx,zoneId){
  const z=zoneId?zoneId.charCodeAt(0):67;
  return Math.abs(cellSeed(roomIdx+7,z+31))%6;
}

function floorTopology(cells,x,y,cw,ch){
  const n=isFloorCell(cells,x,y-1,cw,ch);
  const s=isFloorCell(cells,x,y+1,cw,ch);
  const e=isFloorCell(cells,x+1,y,cw,ch);
  const w=isFloorCell(cells,x-1,y,cw,ch);
  const floorAdj=(n?1:0)+(s?1:0)+(e?1:0)+(w?1:0);
  const wallAdj=4-floorAdj;
  const corridor=(floorAdj<=2)||(n&&s&&!e&&!w)||(e&&w&&!n&&!s);
  return{
    floorAdj,
    wallAdj,
    corridor,
    chamber:floorAdj>=3,
    nook:floorAdj<=1,
    edgeN:!n,edgeS:!s,edgeE:!e,edgeW:!w
  };
}

function wallTopology(cells,x,y,cw,ch){
  const n=isFloorCell(cells,x,y-1,cw,ch);
  const s=isFloorCell(cells,x,y+1,cw,ch);
  const e=isFloorCell(cells,x+1,y,cw,ch);
  const w=isFloorCell(cells,x-1,y,cw,ch);
  const open=(n?1:0)+(s?1:0)+(e?1:0)+(w?1:0);
  return{
    face:open>0,
    deep:open===0,
    corner:(n&&e)||(e&&s)||(s&&w)||(w&&n),
    edgeN:n,edgeS:s,edgeE:e,edgeW:w
  };
}

function pickEnvProp(x,y,zoneId,roomIdx,roomStyle,shape,room){
  const seed=Math.abs(cellSeed(x+17,y+29));
  const rand=(seed%997)/997;
  if(room){
    const lx=x-room.x,ly=y-room.y;
    const bigRoom=room.w>=9&&room.h>=7;
    if(bigRoom&&(lx===2||lx===room.w-3)&&(ly===2||ly===room.h-3)&&rand<.65)return'prop-pillar';
    if(roomStyle===2&&ly===1&&lx>1&&lx<room.w-2&&lx%3===0&&rand<.7)return'prop-crate';
    if(roomStyle===1&&Math.abs(lx-Math.floor(room.w/2))<=1&&Math.abs(ly-Math.floor(room.h/2))<=1&&rand<.4)return'prop-altar';
    if(roomStyle===3&&rand<.07)return'prop-bones';
  }
  if(shape.corridor&&rand<.05)return'prop-rubble';
  if(shape.wallAdj>=3&&rand<.04)return'prop-stain';
  if(zoneId==='W'&&rand<.05)return'prop-bones';
  if(zoneId==='S'&&rand<.04)return'prop-rubble';
  if(!zoneId&&rand<.03)return'prop-rubble';
  return null;
}

// ═══════════════════════════════
// PORTAL DEBUG LABELS
// ═══════════════════════════════
let showPortalLabels=true;
function togglePortalLabels(){
  showPortalLabels=!showPortalLabels;
  if(G.map)renderMap();
}

// ═══════════════════════════════
// ZONE BODY CLASS & LIGHTING
// ═══════════════════════════════
const ZONE_BODY_CLASSES=['zone-N','zone-S','zone-E','zone-W'];
function applyZoneTheme(zoneId){
  document.body.classList.remove(...ZONE_BODY_CLASSES);
  if(zoneId)document.body.classList.add('zone-'+zoneId);
  const lighting=document.getElementById('map-lighting');
  if(!lighting)return;
  if(!zoneId){
    lighting.style.background='radial-gradient(ellipse 58% 58% at var(--light-x,50%) var(--light-y,50%), rgba(255,255,255,.02) 8%, transparent 30%, rgba(0,0,0,.55) 76%, rgba(0,0,0,.9) 100%)';
  }else if(zoneId==='N'){
    lighting.style.background='radial-gradient(ellipse 62% 62% at var(--light-x,50%) var(--light-y,50%), rgba(80,150,220,.12) 10%, transparent 40%, rgba(0,20,60,.62) 84%, rgba(0,10,40,.93) 100%)';
  }else if(zoneId==='S'){
    lighting.style.background='radial-gradient(ellipse 58% 58% at var(--light-x,50%) var(--light-y,50%), rgba(220,70,20,.1) 12%, transparent 35%, rgba(100,10,0,.68) 82%, rgba(60,0,0,.93) 100%)';
  }else if(zoneId==='E'){
    lighting.style.background='radial-gradient(ellipse 62% 62% at var(--light-x,50%) var(--light-y,50%), rgba(40,120,30,.1) 10%, transparent 38%, rgba(0,40,0,.62) 84%, rgba(0,20,0,.93) 100%)';
  }else if(zoneId==='W'){
    lighting.style.background='radial-gradient(ellipse 52% 52% at var(--light-x,50%) var(--light-y,50%), rgba(120,40,220,.13) 12%, transparent 35%, rgba(40,0,80,.68) 84%, rgba(20,0,50,.96) 100%)';
  }
}

// ═══════════════════════════════
// PORTAL CELL HTML
// ═══════════════════════════════
const PORTAL_DEFS={
  N:{color:'#4488ff',inner:'❄️',label:'North Gate — FROZEN RUINS',labelShort:'North Gate'},
  S:{color:'#ff5533',inner:'🔥',label:'South Gate — LAVA CAVERNS',labelShort:'South Gate'},
  E:{color:'#44ff88',inner:'🌿',label:'East Gate — OVERGROWN TEMPLE',labelShort:'East Gate'},
  W:{color:'#cc44ff',inner:'🔱',label:'West Gate — CURSED CRYPT',labelShort:'West Gate'},
};

function buildPortalHTML(entity,cs,px,py,playerX,playerY){
  const isReturn=entity==='portal_return';
  const zoneId=isReturn?null:entity.replace('portal_','');
  const def=isReturn?{color:'#ffff44',inner:'↩️',label:'Return Portal',labelShort:'Return'}:PORTAL_DEFS[zoneId];
  if(!def)return`<span style="font-size:${cs-4}px">🔮</span>`;

  const isPlayer=px===playerX&&py===playerY;
  const labelHtml=showPortalLabels
    ?`<div class="portal-label" style="color:${def.color};top:${cs<=20?'-12px':'-16px'};font-size:${cs<=20?'7px':'9px'}">${cs<=20?def.labelShort:def.label}</div>`
    :'';

  return`<div class="portal-tile ${isReturn?'portal-return-tile':''}" style="color:${def.color};width:100%;height:100%;">
    ${labelHtml}
    <div class="portal-ring" style="border-color:${def.color}"></div>
    <div class="portal-ring2" style="border-color:${def.color}"></div>
    <span class="portal-inner" style="font-size:${Math.max(8,cs-8)}px;color:${def.color};text-shadow:0 0 8px ${def.color}">${def.inner}</span>
  </div>`;
}
function renderMap(){
  const p=G.player,cs=getCellSize();
  const el=document.getElementById('dungeon-map');
  const cells=getCells(),cw=getMapW(),ch=getMapH();
  const fs=Math.max(8,cs-4);
  const zoneId=G.inZone||null;
  const zoneThemeId=getFloorZoneId(zoneId);
  applyZoneTheme(zoneThemeId);
  el.classList.add('canvas-world');
  el.style.gridTemplateColumns=`repeat(${cw},${cs}px)`;
  el.style.gridTemplateRows=`repeat(${ch},${cs}px)`;
  el.innerHTML='';

  const curEnemies=G.inZone?(G.zoneEnemies?.[G.inZone]||[]):G.enemies;
  const curItems=G.inZone?(G.zoneItems?.[G.inZone]||[]):G.items;
  const activeRooms=G.inZone?(G.map.zones?.[G.inZone]?.rooms||[]):(G.map.rooms||[]);
  const roomGrid=buildRoomGrid(activeRooms,cw,ch);
  const roomStyles=activeRooms.map((_,idx)=>getRoomStyleIndex(idx,zoneId));
  const enemyAt=new Map(curEnemies.map(e=>[`${e.x},${e.y}`,e]));
  const itemAt=new Map(curItems.map(i=>[`${i.x},${i.y}`,i]));

  for(let y=0;y<ch;y++){
    for(let x=0;x<cw;x++){
      const cell=cells[y][x];
      const div=document.createElement('div');
      div.className='cell';
      div.style.width=cs+'px';div.style.height=cs+'px';

      if(!cell.seen){div.classList.add('fog');el.appendChild(div);continue;}

      const isAlt=isCellAlt(x,y);
      const roomIdx=roomGrid[y][x];
      const room=roomIdx>=0?activeRooms[roomIdx]:null;
      const roomStyle=roomIdx>=0?roomStyles[roomIdx]:-1;

      if(cell.type==='wall'){
        const wShape=wallTopology(cells,x,y,cw,ch);
        div.classList.add('wall');
        if(isAlt)div.classList.add('alt');
        if(wShape.face)div.classList.add('face');
        if(wShape.corner)div.classList.add('corner');
        if(wShape.deep)div.classList.add('deep');
        if(wShape.edgeN)div.classList.add('edge-n');
        if(wShape.edgeS)div.classList.add('edge-s');
        if(wShape.edgeE)div.classList.add('edge-e');
        if(wShape.edgeW)div.classList.add('edge-w');
        if(!cell.visible)div.classList.add('seen');
        el.appendChild(div);continue;
      }

      const fShape=floorTopology(cells,x,y,cw,ch);
      div.classList.add('floor');
      if(isAlt)div.classList.add('alt');
      if(roomStyle>=0)div.classList.add(`room-theme-${roomStyle}`);
      if(fShape.corridor)div.classList.add('corridor');
      if(fShape.chamber)div.classList.add('chamber');
      if(fShape.nook)div.classList.add('nook');
      if(fShape.edgeN)div.classList.add('edge-n');
      if(fShape.edgeS)div.classList.add('edge-s');
      if(fShape.edgeE)div.classList.add('edge-e');
      if(fShape.edgeW)div.classList.add('edge-w');
      if(!cell.visible){div.classList.add('seen');el.appendChild(div);continue;}

      const en=enemyAt.get(`${x},${y}`);
      const it=itemAt.get(`${x},${y}`);

      if(x===p.x&&y===p.y){
        if(customSprite){
          div.innerHTML=`<img class="pmap" src="${customSprite}" style="width:${cs-2}px;height:${cs-2}px">`;
        }else if(HERO_SVGS[p.classType]){
          div.innerHTML=`<img class="pmap monster-sprite anim-bob" src="${getHeroSVG(p.classType)}" width="${cs-1}" height="${cs-1}" style="image-rendering:pixelated;">`;
        }else{
          div.innerHTML=`<span class="ce idle" style="font-size:${fs}px">${p.emoji}</span>`;
        }
      }else if(en){
        // Enemy visuals are rendered by canvas. Keep tile as interaction hitbox.
        div.classList.add('enemy-hitbox');
        div.style.cursor='pointer';
        div.onclick=()=>startCombat(en);
      }else if(cell.entity==='stairs'){
        div.innerHTML=`<span class="ce" style="font-size:${fs}px">⬇️</span>`;
        div.style.cursor='pointer';div.onclick=descend;div.title='Stairs to next floor';
      }else if(cell.entity==='stairs_sub'){
        div.innerHTML=`<span class="ce" style="font-size:${fs}px">🜃</span>`;
        div.style.cursor='pointer';div.title='Unstable Subfloor';
        div.onclick=()=>{if(x===p.x&&y===p.y)enterRandomSubfloor();else addLog('🜃 Walk to the unstable stairs.','info');};
      }else if(cell.entity==='shop'){
        div.innerHTML=`<span class="ce" style="font-size:${fs}px;display:inline-block;animation:bob 1s ease-in-out infinite">🏪</span>`;
        div.style.cursor='pointer';div.title='Shop';
        div.onclick=()=>{if(x===p.x&&y===p.y)togglePanel('shop');else addLog('🏪 Walk to the shop!','info');};
      }else if(cell.entity==='blacksmith'){
        div.innerHTML=`<span class="ce" style="font-size:${fs}px;display:inline-block;animation:bob 1.2s ease-in-out infinite">🔨</span>`;
        div.style.cursor='pointer';div.title='Blacksmith';
        div.onclick=()=>{if(x===p.x&&y===p.y)togglePanel('blacksmith');else addLog('🔨 Walk to the Blacksmith!','info');};
      }else if(cell.entity==='alchemist'){
        div.innerHTML=`<span class="ce" style="font-size:${fs}px;display:inline-block;animation:bob 1.4s ease-in-out infinite">⚗️</span>`;
        div.style.cursor='pointer';div.title='Alchemist';
        div.onclick=()=>{if(x===p.x&&y===p.y)togglePanel('alchemist');else addLog('⚗️ Walk to the Alchemist!','info');};
      }else if(cell.entity==='floor_registry'){
        div.innerHTML=`<span class="ce" style="font-size:${fs}px;display:inline-block;animation:bob 1.1s ease-in-out infinite">📚</span>`;
        div.style.cursor='pointer';div.title='Floor Registry';
        div.onclick=()=>{if(x===p.x&&y===p.y)togglePanel('registry');else addLog('📚 Walk to the floor registry terminal.','info');};
      }else if(cell.entity&&cell.entity.startsWith('portal_')){
        // Portal visuals are rendered by canvas. Keep tile as interaction hitbox.
        div.classList.add('portal-hitbox');
        div.style.cssText+='cursor:pointer;overflow:visible;z-index:3;';
        const pid=cell.entity;
        if(pid==='portal_N')div.onclick=()=>{if(x===p.x&&y===p.y)enterPortal('N');else addLog('🧊 Walk to the north ice portal!','info');};
        else if(pid==='portal_S')div.onclick=()=>{if(x===p.x&&y===p.y)enterPortal('S');else addLog('🔥 Walk to the south lava portal!','info');};
        else if(pid==='portal_E')div.onclick=()=>{if(x===p.x&&y===p.y)enterPortal('E');else addLog('🌿 Walk to the green portal!','info');};
        else if(pid==='portal_W')div.onclick=()=>{if(x===p.x&&y===p.y)enterPortal('W');else addLog('🔮 Walk to the purple portal!','info');};
        else if(pid==='portal_return')div.onclick=()=>{if(x===p.x&&y===p.y)exitPortal();else addLog('↩️ Walk to the return portal!','info');};
      }else if(it){
        // Item visuals are rendered by canvas, keep this DOM tile as pickup hitbox.
        div.classList.add('item-hitbox');
        div.style.cursor='pointer';div.title=it.name;div.onclick=()=>pickupItem(it);
      }else{
        // Leave empty; terrain and props are painted by canvas renderer.
        div.innerHTML='';
      }
      el.appendChild(div);
    }
  }

  const wrap=document.getElementById('map-wrap');
  const ww=wrap.clientWidth,wh=wrap.clientHeight;
  const mapW=cw*cs,mapH=ch*cs;
  const px_s=p.x*cs+cs/2,py_s=p.y*cs+cs/2;
  let ox=ww/2-px_s,oy=wh/2-py_s;
  ox=Math.min(0,Math.max(ww-mapW,ox));
  oy=Math.min(0,Math.max(wh-mapH,oy));
  el.style.left=ox+'px';el.style.top=oy+'px';
  // Keep the canvas aligned with the HTML map grid so visuals match interaction layer
  const canvas=document.getElementById('dungeon-canvas');
  if(canvas){
    // ensure canvas shares the same offset/positioning as the grid
    canvas.style.position='absolute';
    canvas.style.left=el.style.left;
    canvas.style.top=el.style.top;
    // ensure canvas z-index is below the interactive grid but above background
    canvas.style.zIndex='1';
  }
  const lighting=document.getElementById('map-lighting');
  if(lighting&&ww>0&&wh>0){
    const lx=((px_s+ox)/ww)*100;
    const ly=((py_s+oy)/wh)*100;
    lighting.style.setProperty('--light-x',`${Math.max(8,Math.min(92,lx)).toFixed(2)}%`);
    lighting.style.setProperty('--light-y',`${Math.max(8,Math.min(92,ly)).toFixed(2)}%`);
  }

  // Update canvas-based world renderer with the current visible map state
  if(window.worldRenderer&&typeof window.worldRenderer.update==='function'){
    try{
      // ensure renderer initialized once
      if(!window.worldRenderer._inited && typeof window.worldRenderer.init==='function'){
        try{window.worldRenderer.init('dungeon-canvas');window.worldRenderer._inited=true;}catch(e){console.warn('worldRenderer.init failed',e);}      
      }
      window.worldRenderer.update({cells,cw,ch,cs,zoneId:zoneThemeId,enemies:curEnemies,items:curItems,player:p,rooms:activeRooms,roomGrid});
      window.worldRenderer.start();
    }catch(e){console.warn('worldRenderer update failed',e);}
  }

  renderMM();
}

function renderMM(){
  const p=G.player,mm=document.getElementById('minimap');
  const cells=getCells(),cw=getMapW(),ch=getMapH();
  const curEnemies=G.inZone?(G.zoneEnemies?.[G.inZone]||[]):G.enemies;
  const curItems=G.inZone?(G.zoneItems?.[G.inZone]||[]):G.items;
  const MM_W=17,MM_H=13;
  const hx=Math.floor(MM_W/2),hy=Math.floor(MM_H/2);
  mm.style.gridTemplateColumns=`repeat(${MM_W},4px)`;
  mm.innerHTML='';
  for(let vy=0;vy<MM_H;vy++)for(let vx=0;vx<MM_W;vx++){
    const x=p.x+(vx-hx),y=p.y+(vy-hy);
    const d=document.createElement('div');d.className='mc';
    if(x<0||y<0||x>=cw||y>=ch){d.classList.add('mg');mm.appendChild(d);continue;}
    const cell=cells[y][x];
    if(!cell.seen)d.classList.add('mg');
    else if(x===p.x&&y===p.y)d.classList.add('mp');
    else if(cell.type==='wall')d.classList.add('mw');
    else if(curEnemies.find(e=>e.x===x&&e.y===y))d.classList.add('me');
    else if(curItems.find(i=>i.x===x&&i.y===y))d.classList.add('mi');
    else if((cell.entity==='stairs'||cell.entity==='stairs_sub')&&cell.stairsRevealed)d.classList.add('ms');
    else if(cell.entity==='shop')d.classList.add('msh');
    else if(cell.entity==='blacksmith')d.classList.add('msm');
    else if(cell.entity==='alchemist')d.classList.add('mal');
    else if(cell.entity==='floor_registry')d.classList.add('mret');
    else if(cell.entity==='portal_N')d.classList.add('mpN');
    else if(cell.entity==='portal_S')d.classList.add('mpS');
    else if(cell.entity==='portal_E')d.classList.add('mpE');
    else if(cell.entity==='portal_W')d.classList.add('mpW');
    else if(cell.entity==='portal_return')d.classList.add('mret');
    else d.classList.add('mf');
    mm.appendChild(d);
  }
}

function cntPot(t){return G.inventory.filter(i=>t==='hp'?i.isHp:i.isMp).length;}

function updateHUD(){
  const p=G.player;
  ensureProgressionState();
  syncWorldDepthFromCurrentFloor(G);
  const curFloor=getCurrentFloorMeta();
  const curZone=getCurrentZoneDef();
  const floorDepth=Math.max(0,curFloor?.mainDepth||0);
  rhS();
  document.getElementById('hname').textContent=p.className;
  document.getElementById('hlvl').textContent=`LV.${p.level}`;
  document.getElementById('bhp').style.width=`${(p.hp/p.maxHp)*100}%`;
  document.getElementById('thp').textContent=`${p.hp}/${p.maxHp}`;
  document.getElementById('bmp').style.width=`${(p.mp/p.maxMp)*100}%`;
  document.getElementById('tmp').textContent=`${p.mp}/${p.maxMp}`;
  document.getElementById('hfl').textContent=`⛏️F${floorDepth}`;
  document.getElementById('hgo').textContent=`💰${p.gold}`;
  document.getElementById('hki').textContent=`⚔️${G.kills}`;
  document.getElementById('xp-fill').style.width=`${(p.xp/(p.level*100))*100}%`;
  // Doom shards badge
  const meta=loadMeta();
  const dsEl=document.getElementById('hds');
  if(dsEl&&meta.shards>0){dsEl.style.display='block';dsEl.textContent=`🔸${meta.shards}`;}
  else if(dsEl)dsEl.style.display='none';
  const hc=cntPot('hp'),mc=cntPot('mp');
  document.getElementById('qshpc').textContent=hc;
  document.getElementById('qsmpc').textContent=mc;
  document.getElementById('qshp').classList.toggle('qs-empty',hc===0);
  document.getElementById('qsmp').classList.toggle('qs-empty',mc===0);
  // Weapon display — floating element above map center
  const wpnFloat=document.getElementById('qs-wpn-float');
  const wpnEl=document.getElementById('qswpn');
  const atkEl=document.getElementById('qsatk');
  if(G.equippedWeapon){
    if(wpnFloat)wpnFloat.style.display='block';
    if(wpnEl)wpnEl.innerHTML=`${buildItemSpriteHTML(G.equippedWeapon,12,'item-inline')} <span>${G.equippedWeapon.name}</span>`;
    if(atkEl)atkEl.textContent=`ATK:${p.atk}`;
  }else{
    if(wpnFloat)wpnFloat.style.display='none';
    if(wpnEl)wpnEl.textContent='— No weapon';
    if(atkEl)atkEl.textContent=`ATK:${p.atk}`;
  }
  // Zone badge
  const zoneEl=document.getElementById('hzone');
  if(zoneEl){
    if(G.inZone&&curZone){
      zoneEl.style.display='block';
      zoneEl.style.color=curZone.color;
      zoneEl.textContent=`${curZone.emoji}${curZone.name}`;
    }else{
      zoneEl.style.display='none';
    }
  }
  updateDoomBar();updateModBar();
  rInv();rStats();
  document.getElementById('inv-count').textContent=G.inventory.length;
  document.getElementById('inv-max').textContent=G.maxInvSlots;
}

function tierLabel(t){return`<span class="${'tier-'+t}">[${TIER_NAMES[t]||'T'+t}]</span>`;}

function rInv(){
  const g=document.getElementById('inv-grid');g.innerHTML='';
  const gear=G.inventory.filter(it=>it.type!=='material');
  const mats=G.inventory.filter(it=>it.type==='material');
  // Gear slots
  for(let i=0;i<G.maxInvSlots;i++){
    const sl=document.createElement('div');sl.className='isl';
    const it=gear[i];
    if(it){
      sl.innerHTML=buildItemSpriteHTML(it,30,'item-slot');
      if(it.tier){const lvEl=document.createElement('span');lvEl.className='isl-tier '+('tier-'+(it.tier||1));lvEl.textContent='T'+(it.tier||1);sl.appendChild(lvEl);}
      if(it.affix){const ax=document.createElement('span');ax.style.cssText='position:absolute;top:1px;right:2px;font-size:7px;';ax.textContent='✦';ax.style.color=it.affixClass?.includes('vampiric')?'#ff4488':it.affixClass?.includes('holy')?'#ffee44':'#aa66ff';sl.appendChild(ax);}
      sl.title=it.name+(it.tier?' [T'+it.tier+']':'')+(it.affixName?' ['+it.affixName+']':'');
      if(it===G.equippedWeapon||it===G.equippedArmor||it===G.equippedRing)sl.classList.add('equipped');
      sl.onclick=()=>showIP(it);
    }else{sl.classList.add('empty');sl.textContent='·';}
    g.appendChild(sl);
  }
  // Slot counts update
  const invCount=document.getElementById('inv-count');
  const invMax=document.getElementById('inv-max');
  if(invCount)invCount.textContent=gear.length;
  if(invMax)invMax.textContent=G.maxInvSlots;
  const matTitle=document.getElementById('mat-title');
  if(matTitle)matTitle.textContent=`🪨 CRAFTING MATERIALS (${mats.length}/20)`;

  const eqw=document.getElementById('eqw');
  const eqa=document.getElementById('eqa');
  const eqr=document.getElementById('eqr');
  if(eqw)eqw.innerHTML=G.equippedWeapon?`${buildItemSpriteHTML(G.equippedWeapon,12,'item-inline')} ${G.equippedWeapon.name} [T${G.equippedWeapon.tier||1}]`:'— bare hands';
  if(eqa)eqa.innerHTML=G.equippedArmor?`${buildItemSpriteHTML(G.equippedArmor,12,'item-inline')} ${G.equippedArmor.name} [T${G.equippedArmor.tier||1}]`:'— nothing';
  if(eqr)eqr.innerHTML=G.equippedRing?`${buildItemSpriteHTML(G.equippedRing,12,'item-inline')} ${G.equippedRing.name}`:'— none';

  // Materials summary
  let mg=document.getElementById('mat-grid');
  if(!mg){
    // Self-heal if older/custom markup removed the material container.
    const invPanelBody=document.querySelector('#panel-inv .spb');
    if(invPanelBody){
      if(!document.getElementById('mat-title')){
        const title=document.createElement('div');
        title.id='mat-title';
        title.className='shop-section-title';
        title.style.marginTop='12px';
        title.textContent=`🪨 CRAFTING MATERIALS (${mats.length}/20)`;
        invPanelBody.appendChild(title);
      }
      mg=document.createElement('div');
      mg.id='mat-grid';
      mg.className='mat-grid';
      invPanelBody.appendChild(mg);
    }
  }
  if(!mg)return;
  if(!mats.length){mg.innerHTML='<div class="mat-grid-empty">None yet. Kill enemies!</div>';return;}
  const counts={};mats.forEach(m=>{counts[m.id]=(counts[m.id]||0)+1;});
  mg.innerHTML=Object.entries(counts).map(([id,qty])=>{
    const m=MATERIALS[id]||{emoji:'?',name:id};
    return`<div class="mat-tag mat-ok" style="cursor:pointer;padding:3px 7px" onclick="showMatInfo('${id}')" title="${m.name}: ${m.desc||''}">${buildItemSpriteHTML(m,12,'item-inline item-mat')} ${m.name} ×${qty}</div>`;
  }).join('');
}

function showMatInfo(id){
  const m=MATERIALS[id];if(!m)return;
  const qty=countMat(id);
  addLog(`🪨 ${m.emoji} ${m.name} ×${qty} — ${m.desc} [Rarity ${'★'.repeat(m.rarity)}]`,'info');
}

function rStats(){
  const p=G.player;
  const curFloor=getCurrentFloorMeta();
  const curDepth=Math.max(0,curFloor?.mainDepth||0);
  const curLoc=getFloorDisplayName(getCurrentFloorId());
  document.getElementById('sgrid').innerHTML=[
    ['❤ HP',`${p.hp}/${p.maxHp}`],['🔵 MP',`${p.mp}/${p.maxMp}`],
    ['⚔️ ATK',p.atk],['🛡️ DEF',p.def],['⚡ SPD',p.spd],['💥 CRIT',`${p.crit}%`],
    ['💰 GOLD',p.gold+'g'],['⚔️ KILLS',G.kills],['📍 FLOOR',curDepth],['⭐ LVL',p.level],
    ['☠️ CORRUPTION',`${G.corruption||0}%`],['💀 DOOM LVL',getDoomLevel()],
    ['📍 LOCATION',curLoc],['🔮 PORTALS','🧊🔥🌿🔮'],
    ['🧪 HP Pots',cntPot('hp')],['🔵 MP Pots',cntPot('mp')],
    ['🎒 Inventory',`${G.inventory.length}/${G.maxInvSlots}`],['⚔️ Enemy Lvl',`~${Math.max(1,Math.round((G.floor*2+p.level)/2))}`],
  ].map(([k,v])=>`<div class="sgi"><span class="sgk">${k}</span><span class="sgv">${v}</span></div>`).join('');
  const pl=document.getElementById('plst');
  let extra='';
  if((G.activeModifiers||[]).length){
    extra+='<div style="font-size:7px;color:#ff2266;margin:8px 0 4px">ACTIVE MODIFIERS:</div>';
    extra+=(G.activeModifiers||[]).map(id=>{const m=ALL_MODIFIERS.find(x=>x.id===id);return m?`<span class="mod-badge ${m.positive?'positive':''}">${m.emoji} ${m.name}</span>`:''}).join('');
  }
  pl.innerHTML=(G.perkList.length?'<div style="font-size:7px;color:var(--gray);margin:8px 0 4px">PERKS:</div>'+G.perkList.map(n=>`<span class="ptag">${n}</span>`).join(''):'<div style="font-size:7px;color:var(--gray);margin-top:8px">No perks yet.</div>')+extra;
}

// ═══════════════════════════════

