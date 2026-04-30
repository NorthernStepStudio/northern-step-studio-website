// Visual and Audio effects.

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

function screenShake() {
  const game = document.getElementById('game-screen');
  if (!game) return;
  game.classList.add('shake');
  setTimeout(() => game.classList.remove('shake'), 300);
}
