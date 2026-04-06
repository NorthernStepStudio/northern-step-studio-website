import { createIcons, LayoutDashboard, Mic, Waves, Library, Search, Play, Download, Save, Trash2, ChevronRight, Minus, Square, X, Terminal, Activity, Copy, ShieldCheck, Settings2 } from 'lucide/dist/cjs/lucide';
import './style.css';
import './studio.css';
import './performance.css';

// --- STATE ---
let currentView = 'dashboard';
let valence = 0;
let arousal = 0;
let isDragging = false;
const API_BASE = 'http://127.0.0.1:8888';
let currentAudio = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  initIcons();
  initNav();
  initEmotionPad();
  loadVoices();
  loadLibrary();
  loadSuggestions();

  // --- TTS CONTROLS ---
  const speedSlider = document.getElementById('tts-speed');
  const pitchSlider = document.getElementById('tts-pitch');
  const speedVal = document.getElementById('speed-val');
  const pitchVal = document.getElementById('pitch-val');

  speedSlider?.addEventListener('input', (e) => {
    speedVal.textContent = `${e.target.value}x`;
  });

  pitchSlider?.addEventListener('input', (e) => {
    pitchVal.textContent = e.target.value;
  });

  const volSlider = document.getElementById('tts-volume');
  const volVal = document.getElementById('vol-val');
  volSlider?.addEventListener('input', (e) => {
    volVal.textContent = `${e.target.value}%`;
  });

  // --- SFX CONTROLS ---
  const durSlider = document.getElementById('sfx-duration');
  const guiSlider = document.getElementById('sfx-guidance');
  const durVal = document.getElementById('dur-val');
  const guiVal = document.getElementById('gui-val');

  const stepsSlider = document.getElementById('sfx-steps');
  const stepsVal = document.getElementById('steps-val');

  durSlider?.addEventListener('input', (e) => {
    durVal.textContent = `${e.target.value}s`;
  });

  guiSlider?.addEventListener('input', (e) => {
    guiVal.textContent = e.target.value;
  });

  stepsSlider?.addEventListener('input', (e) => {
    stepsVal.textContent = e.target.value;
  });

  // Voice Search
  document.getElementById('voice-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.voice-card');
    cards.forEach(card => {
      const name = card.querySelector('h4').textContent.toLowerCase();
      card.style.display = name.includes(term) ? 'flex' : 'none';
    });
  });

  checkAPIHealth();
  setInterval(checkAPIHealth, 10000);
  initDebugConsole();

  // Bind Synthesis & SFX
  document.getElementById('synth-btn')?.addEventListener('click', () => synthesize());
  document.getElementById('gen-sfx-btn')?.addEventListener('click', () => generateSFX());

  // Bind window controls
  document.getElementById('min-btn')?.addEventListener('click', () => window.electronAPI.minimize());
  document.getElementById('max-btn')?.addEventListener('click', () => window.electronAPI.maximize());
  document.getElementById('close-btn')?.addEventListener('click', () => window.electronAPI.close());

  // Listen for window state change
  window.electronAPI.onWindowStateChange((isMaximized) => {
    const maxBtn = document.getElementById('max-btn');
    if (maxBtn) {
      maxBtn.innerHTML = isMaximized ? '<i data-lucide="copy"></i>' : '<i data-lucide="square"></i>';
      initIcons();
    }
  });

  // Global function exports
  window.synthesize = synthesize;
  window.generateSFX = generateSFX;
  window.switchView = switchView;
  window.saveToLibrary = saveToLibrary;
  window.playAudio = playAudio;
  window.stopAudio = stopAudio;
  window.deleteItem = deleteItem;
  window.deleteLibraryItem = deleteLibraryItem;

  console.log("Neural Studio Initialization complete.");
});
function initIcons() {
  createIcons({
    icons: { LayoutDashboard, Mic, Waves, Library, Search, Play, Download, Save, Trash2, ChevronRight, Minus, Square, X, Terminal, Activity, Copy, ShieldCheck, Settings2 }
  });
}

// --- VIEW NAVIGATION ---
function initNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });
}

window.switchView = (viewId) => {
  // Update Sidebar
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  // Update Views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('hidden', view.id !== `view-${viewId}`);
  });

  currentView = viewId;
  if (viewId === 'library') loadLibrary();
};

// --- HELPERS ---
window.insertAtCursor = (text) => {
  const textarea = document.getElementById('tts-input');
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
};

// --- EMOTION PAD ---
function initEmotionPad() {
  const pad = document.getElementById('emotion-pad');
  const cursor = document.getElementById('pad-cursor');
  const valDisp = document.getElementById('val-disp');
  const aroDisp = document.getElementById('aro-disp');

  if (!pad) return;

  function updatePad(e) {
    const rect = pad.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    valence = ((x / rect.width) * 2 - 1).toFixed(2);
    arousal = (-(y / rect.height) * 2 + 1).toFixed(2);

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    valDisp.textContent = valence;
    aroDisp.textContent = arousal;
  }

  pad.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePad(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) updatePad(e);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Center it
  valence = 0;
  arousal = 0;
  updatePadCursor();
}

window.setEmotion = (v, a, el) => {
  valence = v;
  arousal = a;
  updatePadCursor();

  // Update active chip
  if (el) {
    document.querySelectorAll('.emotion-chips .chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  console.log(`Emotion Preset set: V:${v}, A:${a}`);
};

window.updatePadCursor = () => {
  const pad = document.getElementById('emotion-pad');
  const cursor = document.getElementById('pad-cursor');
  const valDisp = document.getElementById('val-disp');
  const aroDisp = document.getElementById('aro-disp');
  if (!pad || !cursor) return;

  const rect = pad.getBoundingClientRect();
  const x = (parseFloat(valence) + 1) / 2 * rect.width;
  const y = (1 - parseFloat(arousal)) / 2 * rect.height;

  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  if (valDisp) valDisp.textContent = valence;
  if (aroDisp) aroDisp.textContent = arousal;
};

// --- DEBUG CONSOLE ---
function initDebugConsole() {
  const container = document.getElementById('debug-log');
  if (!container) return;

  const originalLog = console.log;
  const originalError = console.error;

  function appendToDebug(type, args) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-msg">${Array.from(args).join(' ')}</span>`;
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
  }

  console.log = (...args) => {
    originalLog(...args);
    appendToDebug('info', args);
  };
  console.error = (...args) => {
    originalError(...args);
    appendToDebug('error', args);
  };

  // Mirror UI notifications (alerts/confirms) to logs
  const originalAlert = window.alert;
  window.alert = (msg) => {
    console.log(`[UI ALERT] ${msg}`);
    originalAlert(msg);
  };

  const originalConfirm = window.confirm;
  window.confirm = (msg) => {
    const result = originalConfirm(msg);
    console.log(`[UI CONFIRM] ${msg} -> ${result ? 'YES' : 'CANCEL'}`);
    return result;
  };

  console.log("Neural Studio Diagnostics Initialized.");
  console.log(`OS: ${navigator.platform}`);
  console.log(`API_BASE: ${API_BASE}`);
}

// --- API ACTIONS ---

async function checkAPIHealth() {
  const indicator = document.querySelector('.status-indicator');
  const debugStatus = document.getElementById('debug-api-status');
  if (!indicator) return;

  try {
    const res = await fetch(`${API_BASE}/v1/voices`);
    if (res.ok) {
      indicator.innerHTML = '<span class="pulse-dot"></span> API ONLINE';
      indicator.classList.remove('offline');
      if (debugStatus) {
        debugStatus.textContent = "ONLINE";
        debugStatus.className = "value online";
      }
    } else {
      throw new Error();
    }
  } catch (e) {
    indicator.innerHTML = '<span class="pulse-dot offline"></span> API OFFLINE';
    indicator.classList.add('offline');
    if (debugStatus) {
      debugStatus.textContent = "OFFLINE";
      debugStatus.className = "value offline";
    }
  }
}

async function loadVoices() {
  const select = document.getElementById('voice-select');
  const grid = document.getElementById('voice-list-grid');
  // We need at least the grid to proceed
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/v1/voices`);
    const data = await res.json();
    const voices = data.voices || data; // Handle both nested and flat responses

    console.log("Loaded voices:", voices);

    grid.innerHTML = voices.map(v => {
      const gender = v.gender || 'Neural';
      const accent = v.accent || 'Neural';
      const engine = v.id.includes('vits') ? 'VITS' : (v.id.includes('xtts') ? 'XTTS' : 'Hybrid');

      return `
          <div class="voice-card" onclick="selectVoice('${v.id}', this)" data-voice-id="${v.id}">
            <div class="avatar"><i data-lucide="mic"></i></div>
            <div class="voice-info">
              <h4>${v.name}</h4>
              <div class="voice-tags">
                <span class="tag">${gender}</span>
                <span class="tag">${accent}</span>
                <span class="tag">${engine}</span>
              </div>
            </div>
          </div>
        `;
    }).join('');

    // Auto-select first voice
    if (voices.length > 0) {
      const firstCard = grid.querySelector('.voice-card');
      if (firstCard) selectVoice(voices[0].id, firstCard);
    }

    initIcons();
  } catch (e) {
    console.error("Failed to load voices:", e);
  }
}

window.selectVoice = (id, el) => {
  console.log("Selecting voice:", id);
  document.querySelectorAll('.voice-card').forEach(c => c.classList.remove('selected'));

  // If called programmatically with just ID
  if (!el && id) {
    el = document.querySelector(`.voice-card[data-voice-id="${id}"]`);
  }

  if (el) el.classList.add('selected');

  const voiceInput = document.getElementById('voice-select');
  if (voiceInput) {
    voiceInput.value = id;
    console.log("Updated hidden select value:", voiceInput.value);
  }
};

async function synthesize() {
  const text = document.getElementById('tts-input').value.trim();
  if (!text) return;

  console.log(`[API] Synthesis start: "${text.substring(0, 30)}..."`);
  const btn = document.getElementById('synth-btn');
  btn.disabled = true;
  btn.innerText = "Processing...";

  try {
    const pitchSemitones = parseFloat(document.getElementById('tts-pitch').value);
    const pitchMultiplier = Math.pow(2, pitchSemitones / 12);

    const res = await fetch(`${API_BASE}/v1/synthesis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        valence: parseFloat(valence),
        arousal: parseFloat(arousal),
        pitch: pitchMultiplier,
        speed: parseFloat(document.getElementById('tts-speed').value),
        volume: parseFloat(document.getElementById('tts-volume')?.value || 100) / 100,
        voice_id: document.getElementById('voice-select').value
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`[API] Synthesis success: ${data.url}`);
      addHistoryItem('tts', text, data.url);
    } else {
      console.error(`[API] Synthesis error: ${data.detail || 'Unknown error'}`);
    }
  } catch (e) {
    console.error(`[API] Synthesis connection failed: ${e.message}`);
    alert("Synthesis failed: " + e.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Generate Voice";
  }
}

async function generateSFX() {
  const prompt = document.getElementById('sfx-prompt').value.trim();
  if (!prompt) return;

  const btn = document.getElementById('gen-sfx-btn');
  btn.disabled = true;
  btn.innerText = "Dreaming SFX...";

  try {
    const duration = document.getElementById('sfx-duration')?.value || 5.0;
    const guidance = document.getElementById('sfx-guidance')?.value || 7.5;
    const steps = document.getElementById('sfx-steps')?.value || 50;
    const soundClass = document.getElementById('sfx-class')?.value || 'auto';
    const eqPreset = document.getElementById('sfx-eq')?.value || 'auto';
    const pitchRand = document.getElementById('sfx-pitch-rand')?.checked;

    const res = await fetch(`${API_BASE}/v1/sfx/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        duration: parseFloat(duration),
        guidance_scale: parseFloat(guidance),
        steps: parseInt(steps),
        sound_class: soundClass,
        eq_preset: eqPreset,
        pitch_randomize: pitchRand
      })
    });

    const data = await res.json();
    if (res.ok && data.results && data.results.length > 0) {
      const first = data.results[0];
      console.log(`[API] SFX success: ${first.url}`);
      addHistoryItem('sfx', prompt, first.url);
      renderDiagnostics(first.diagnostics);

      // If variations exist, add them too (optional logic)
      if (data.results.length > 1) {
        console.log(`Generated ${data.results.length} variations.`);
      }
    } else {
      console.error(`[API] SFX generation error: ${data.detail || 'Unknown error'}`);
    }
  } catch (e) {
    console.error(`[API] SFX connection failed: ${e.message}`);
    alert("SFX failed: " + e.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Generate SFX";
  }
}

function renderDiagnostics(report) {
  const panel = document.getElementById('diagnostics-panel');
  if (!panel || !report) return;

  panel.classList.remove('hidden');

  // 1. Classification
  const typeBadge = document.getElementById('diag-type');
  typeBadge.textContent = report.classification.sound_type.toUpperCase();
  typeBadge.className = `badge ${report.classification.sound_type}`;

  document.getElementById('diag-dur').textContent =
    `${report.classification.actual_duration}s / ${report.classification.expected_max_duration}s`;

  // 2. Health
  const rmsEl = document.getElementById('diag-rms');
  rmsEl.textContent = `${report.audio_health.rms_db} dB`;
  rmsEl.style.color = report.audio_health.rms_db > -12 ? '#ff4a4a' : '#4ade80';

  const peakEl = document.getElementById('diag-peak');
  peakEl.textContent = `${report.audio_health.peak_dbfs} dBFS`;
  peakEl.style.color = report.audio_health.peak_dbfs >= -0.5 ? '#ff4a4a' : '#4ade80';

  document.getElementById('diag-noise').textContent = `${report.audio_health.noise_floor_db} dB`;

  // 3. Repairs
  const repairList = document.getElementById('diag-repairs');
  if (report.repairs_applied && report.repairs_applied.length > 0) {
    repairList.innerHTML = report.repairs_applied.map(r => `<span>${r.replace('_', ' ')}</span>`).join('');
  } else {
    repairList.innerHTML = '<span style="background: rgba(255,255,255,0.05); color: #888;">None required</span>';
  }

  // Engine Safety Check
  if (!report.engine_compatibility.engine_safe) {
    console.warn("DIAGNOSTICS: Asset may clip in engine.");
  }

  initIcons();
}

async function loadSuggestions() {
  const container = document.getElementById('sfx-suggestions');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/v1/sfx/suggestions`);
    const data = await res.json();
    container.innerHTML = data.map(s =>
      `<span class="chip" onclick="document.getElementById('sfx-prompt').value='${s.prompt}'">${s.category}</span>`
    ).join('');
  } catch (e) {
    console.error("Suggestions error", e);
  }
}

function playAudio(url) {
  stopAudio();
  currentAudio = new Audio(`${API_BASE}${url}`);
  currentAudio.play();
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

window.playAudio = playAudio;
window.stopAudio = stopAudio;

function addHistoryItem(type, text, url) {
  const container = type === 'tts' ? document.getElementById('tts-history') : document.getElementById('sfx-list');
  if (!container) return;

  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const item = document.createElement('div');
  item.className = 'history-card-mini';
  item.id = `item-${url.split('/').pop().replace('.', '-')}`;
  item.innerHTML = `
        <div class="info">
           <div class="info-top">
             <span class="type-badge">${type.toUpperCase()}</span>
             <span class="time-stamp">${timestamp}</span>
           </div>
           <p>${text.substring(0, 40)}${text.length > 40 ? '...' : ''}</p>
        </div>
        <div class="actions">
           <button class="icon-btn" onclick="playAudio('${url}')" title="Play">
             <i data-lucide="play"></i>
           </button>
           <button class="icon-btn" onclick="stopAudio()" title="Stop">
             <i data-lucide="square"></i>
           </button>
           <button class="icon-btn" onclick="saveToLibrary('${url}', '${text.substring(0, 20)}')" title="Save">
             <i data-lucide="save"></i>
           </button>
           <button class="icon-btn danger" onclick="deleteItem('${url}')" title="Delete">
             <i data-lucide="trash-2"></i>
           </button>
        </div>
    `;
  container.prepend(item);

  // Update Dashboard Recent Feed
  updateDashboardRecent(type, text, url, timestamp);

  initIcons();
}

function updateDashboardRecent(type, text, url, timestamp) {
  const container = document.getElementById('recent-dashboard-list');
  if (!container) return;

  // Clear empty state if exists
  if (container.querySelector('.empty-state')) {
    container.innerHTML = '';
  }

  const card = document.createElement('div');
  card.className = 'recent-mini-card glass';
  card.innerHTML = `
    <div class="recent-top">
      <span class="type-badge ${type}">${type.toUpperCase()}</span>
      <span class="recent-time">${timestamp}</span>
    </div>
    <p class="recent-text">${text.substring(0, 30)}...</p>
    <div class="recent-play" onclick="playAudio('${url}')">
      <i data-lucide="play"></i>
    </div>
  `;

  container.prepend(card);

  // Keep only last 10
  if (container.children.length > 10) {
    container.lastChild.remove();
  }
}

async function deleteItem(url) {
  if (!confirm("Delete this generation?")) return;
  try {
    const res = await fetch(`${API_BASE}/v1/api/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name: '' })
    });
    if (res.ok) {
      const id = `item-${url.split('/').pop().replace('.', '-')}`;
      document.getElementById(id)?.remove();
    }
  } catch (e) {
    alert("Delete failed: " + e.message);
  }
}

window.deleteItem = deleteItem;

window.saveToLibrary = async (url, name) => {
  try {
    await fetch(`${API_BASE}/v1/library/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name })
    });
    alert("Saved to Archive");
  } catch (e) {
    alert("Save error: " + e.message);
  }
};

async function loadLibrary() {
  const container = document.getElementById('full-library-list');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/v1/library`);
    const data = await res.json();
    container.innerHTML = data.files.map(f => `
            <div class="library-item" id="lib-item-${f.name.replace('.', '-')}">
                <div class="lib-info">
                   <b>${f.name}</b>
                   <span>${(f.size / 1024).toFixed(1)} KB</span>
                </div>
                <div class="lib-actions">
                   <button class="icon-btn" onclick="playAudio('${f.url}')"><i data-lucide="play"></i></button>
                   <button class="icon-btn" onclick="stopAudio()"><i data-lucide="square"></i></button>
                   <button class="icon-btn danger" onclick="deleteLibraryItem('${f.url}')"><i data-lucide="trash-2"></i></button>
                   <a href="${API_BASE}${f.url}" download class="icon-btn"><i data-lucide="download"></i></a>
                </div>
            </div>
        `).join('');
    initIcons();
  } catch (e) {
    console.error("Library error", e);
  }
}

async function deleteLibraryItem(url) {
  if (!confirm("Permanently delete from Archive?")) return;
  try {
    const res = await fetch(`${API_BASE}/v1/library/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name: '' })
    });
    if (res.ok) {
      loadLibrary(); // Quickest way to refresh
    }
  } catch (e) {
    alert("Delete failed: " + e.message);
  }
}

window.deleteLibraryItem = deleteLibraryItem;
