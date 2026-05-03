// Startup flow management

const AudioCtor = window.AudioContext || window.webkitAudioContext;
let startupAudioCtx = null;

function playStartupSound(type) {
  if (!startupAudioCtx) {
    try { startupAudioCtx = new AudioCtor(); } catch (e) { return; }
  }
  if (startupAudioCtx.state === 'suspended') startupAudioCtx.resume();
  
  const ctx = startupAudioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  let f = 440, d = 0.1, v = 0.1, w = 'sine';
  
  if (type === 'hover') { f = 600; d = 0.05; v = 0.05; w = 'sine'; }
  if (type === 'click') { f = 800; d = 0.1; v = 0.1; w = 'triangle'; }
  if (type === 'reveal') { f = 150; d = 2.0; v = 0.15; w = 'sawtooth'; osc.frequency.exponentialRampToValueAtTime(50, now + d); }
  if (type === 'start') { f = 200; d = 1.0; v = 0.2; w = 'square'; osc.frequency.exponentialRampToValueAtTime(800, now + d); }
  
  osc.type = w;
  osc.frequency.setValueAtTime(f, now);
  gain.gain.setValueAtTime(v, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + d);
  
  osc.start(now);
  osc.stop(now + d);
}

function switchView(viewId) {
  document.querySelectorAll('.startup-view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(viewId);
  if (el) {
    el.classList.add('active');
  }
}

// 1. Studio Splash -> 2. Title Reveal
window.addEventListener('load', () => {
  const startupContainer = document.getElementById('startup-container');
  if (!startupContainer) return;

  // Add hover sounds to menu buttons
  document.querySelectorAll('.menu-btn, .back-btn, .profile-slot, .class-card').forEach(btn => {
    btn.addEventListener('mouseenter', () => playStartupSound('hover'));
  });

  // Longer delay for cinematic splash then transition
  setTimeout(() => {
    switchView('title-reveal-view');
    playStartupSound('reveal');
  }, 3500);
});

// 2. Title Reveal -> 3. Main Menu
async function showMainMenu() {
  playStartupSound('click');
  switchView('main-menu-view');
  
  // Update Continue button visibility based on existing save
  const btn = document.getElementById('menu-continue-btn');
  if (btn) {
    const hasSave = typeof hasAnySaveData === 'function' ? await hasAnySaveData() : localStorage.getItem('doomed_v4');
    btn.style.display = hasSave ? 'block' : 'none';
  }
}

// 3. Main Menu -> 4. Profiles Select
async function showProfiles() {
  playStartupSound('click');
  const container = document.getElementById('profile-slots-container');
  if (!container) return;
  container.innerHTML = '';
  
  const hasSave = typeof hasAnySaveData === 'function' ? await hasAnySaveData() : localStorage.getItem('doomed_v4');
  
  // Slot 1 (Current)
  container.innerHTML += `
    <div class="profile-slot" onclick="selectProfile(1)">
      <div class="profile-info">
        <div class="profile-title">Profile 1 ${hasSave ? '(Active)' : ''}</div>
        <div class="profile-stats">${hasSave ? 'Save Data Exists' : '<span class="profile-empty">Empty Slot</span>'}</div>
      </div>
      <div>${hasSave ? '▶' : '➕'}</div>
    </div>
  `;
  
  // Slot 2 & 3 (Empty)
  for(let i=2; i<=3; i++) {
    container.innerHTML += `
      <div class="profile-slot" onclick="selectProfile(${i})">
        <div class="profile-info">
          <div class="profile-title">Profile ${i}</div>
          <div class="profile-stats"><span class="profile-empty">Empty Slot</span></div>
        </div>
        <div>➕</div>
      </div>
    `;
  }
  
  switchView('profile-select-view');
}

function showProfileSelect() {
  playStartupSound('click');
  showProfiles();
}

function selectProfile(slotIndex) {
  playStartupSound('click');
  // For now, any profile slot selection goes to Hero Select.
  switchView('hero-select-view');
}

// Continue Button
async function continueGame() {
  playStartupSound('start');
  const hasSave = typeof hasAnySaveData === 'function' ? await hasAnySaveData() : localStorage.getItem('doomed_v4');
  if (hasSave && typeof loadGame === 'function') {
    document.getElementById('startup-container').style.display = 'none';
    loadGame();
  } else {
    showProfileSelect();
  }
}

// Global override for showGS (game start)
const originalShowGS = window.showGS;
window.showGS = function() {
  playStartupSound('start');
  const startupContainer = document.getElementById('startup-container');
  if (startupContainer) startupContainer.style.display = 'none';
  const ts = document.getElementById('title-screen');
  if (ts) ts.style.display = 'none';
  
  // Call original if it exists and wasn't us
  if (typeof originalShowGS === 'function' && originalShowGS !== window.showGS) {
    originalShowGS();
  } else {
    // Fallback logic if original was overwritten or not found
    const gs = document.getElementById('game-screen');
    if (gs) gs.style.display = 'flex';
    const mi = document.getElementById('minimap-inner');
    if (mi) mi.classList.remove('collapsed');
  }
};

