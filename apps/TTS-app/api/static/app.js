document.addEventListener('DOMContentLoaded', () => {
    const pad = document.getElementById('emotion-pad');
    const cursor = document.getElementById('pad-cursor');
    const valDisplay = document.getElementById('val-display');
    const aroDisplay = document.getElementById('aro-display');
    const synthBtn = document.getElementById('synth-btn');
    const ttsInput = document.getElementById('tts-input');
    const engineSelect = document.getElementById('engine-select');
    const voiceSelect = document.getElementById('voice-select');
    const historyList = document.getElementById('history-list');

    // Batch UI Elements
    const batchUploadZone = document.getElementById('batch-upload-zone');
    const batchFile = document.getElementById('batch-file');
    const batchStatus = document.getElementById('batch-status');
    const batchProgress = document.getElementById('batch-progress');
    const batchMsg = document.getElementById('batch-msg');

    // SFX Tab Elements
    const sfxTab = document.getElementById('sfx-tab');
    const ttsTab = document.querySelector('.input-card'); // The existing synthesis card
    const sfxPrompt = document.getElementById('sfx-prompt');
    const sfxSuggestions = document.getElementById('sfx-suggestions');
    const sfxDuration = document.getElementById('sfx-duration');
    const durationVal = document.getElementById('duration-val');
    const genSfxBtn = document.getElementById('gen-sfx-btn');

    // Library Elements
    const libraryList = document.getElementById('library-list');
    const historyListContainer = document.getElementById('history-list'); // Existing ID

    let valence = 0;
    let arousal = 0;
    let isDragging = false;

    // --- EMOTION PAD LOGIC ---

    function updatePad(e) {
        const rect = pad.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Clamp values
        const xClamped = Math.max(0, Math.min(x, rect.width));
        const yClamped = Math.max(0, Math.min(y, rect.height));

        // Map to -1.0 to 1.0
        valence = ((xClamped / rect.width) * 2 - 1).toFixed(2);
        arousal = (-(yClamped / rect.height) * 2 + 1).toFixed(2); // Y is inverted

        // Update UI
        cursor.style.left = `${xClamped}px`;
        cursor.style.top = `${yClamped}px`;
        valDisplay.textContent = valence;
        aroDisplay.textContent = arousal;
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

    // Initialize cursor at center
    const rect = pad.getBoundingClientRect();
    cursor.style.left = `${rect.width / 2}px`;
    cursor.style.top = `${rect.height / 2}px`;

    // --- TAB SWITCHING ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.tab === 'tts') {
                ttsTab.classList.remove('hidden');
                sfxTab.classList.add('hidden');
            } else {
                ttsTab.classList.add('hidden');
                sfxTab.classList.remove('hidden');
                loadSuggestions();
            }
        });
    });

    document.querySelectorAll('.card-tabs h2').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.card-tabs h2').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.list === 'recent') {
                historyListContainer.classList.remove('hidden');
                libraryList.classList.add('hidden');
            } else {
                historyListContainer.classList.add('hidden');
                libraryList.classList.remove('hidden');
                loadLibrary();
            }
        });
    });

    sfxDuration.addEventListener('input', () => {
        durationVal.textContent = sfxDuration.value;
    });

    // --- API COMMUNICATION ---

    async function synthesize() {
        const text = ttsInput.value.trim();
        if (!text) return;

        // Show loading state
        synthBtn.disabled = true;
        synthBtn.querySelector('.loader-ring').classList.remove('hidden');
        synthBtn.querySelector('.btn-text').textContent = "Processing...";

        try {
            const response = await fetch('/v1/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    valence: parseFloat(valence),
                    arousal: parseFloat(arousal),
                    engine: engineSelect.value,
                    voice_id: voiceSelect.value
                })
            });

            const data = await response.json();
            if (response.ok) {
                addHistoryItem(text, data.url, 'synthesis');
            } else {
                alert(`Error: ${data.detail}`);
            }
        } catch (err) {
            alert(`Network Error: ${err.message}`);
        } finally {
            // Reset button
            synthBtn.disabled = false;
            synthBtn.querySelector('.loader-ring').classList.add('hidden');
            synthBtn.querySelector('.btn-text').textContent = "Generate Neural Speech";
        }
    }

    async function triggerSFX(eventName) {
        try {
            const response = await fetch('/v1/sfx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: eventName,
                    valence: parseFloat(valence),
                    arousal: parseFloat(arousal)
                })
            });

            const data = await response.json();
            if (response.ok) {
                const audio = new Audio(data.url);
                audio.play();
                addHistoryItem(`SFX: ${eventName}`, data.url, 'sfx');
            }
        } catch (err) {
            console.error("SFX Error:", err);
        }
    }

    function addHistoryItem(text, url, type) {
        // Remove empty state
        const empty = historyList.querySelector('.empty-state');
        if (empty) empty.innerHTML = '';

        const item = document.createElement('div');
        item.className = 'history-item';
        const fileId = url.split('/').pop();

        item.innerHTML = `
            <div class="history-item-header">
                <span>${type.toUpperCase()}</span>
                <span>${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="history-item-text">${text}</div>
            <audio controls src="${url}"></audio>
            <div class="item-actions">
                <a href="${url}" download="${fileId}" class="action-btn">Export</a>
                <button class="action-btn save" onclick="saveToLibrary('${url}', '${text.replace(/'/g, "\\'").substring(0, 30)}')">Save to Library</button>
            </div>
        `;
        historyList.prepend(item);
    }

    async function generateSFX() {
        const prompt = sfxPrompt.value.trim();
        if (!prompt) return;

        genSfxBtn.disabled = true;
        genSfxBtn.querySelector('.loader-ring').classList.remove('hidden');
        genSfxBtn.querySelector('.btn-text').textContent = "Dreaming of sound...";

        try {
            const response = await fetch('/v1/sfx/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    duration: parseFloat(sfxDuration.value)
                })
            });

            const data = await response.json();
            if (response.ok) {
                addHistoryItem(`SFX Gen: ${prompt}`, data.url, 'sfx');
                const audio = new Audio(data.url);
                audio.play();
            } else {
                alert(`Error: ${data.detail}`);
            }
        } catch (err) {
            alert(`Network Error: ${err.message}`);
        } finally {
            genSfxBtn.disabled = false;
            genSfxBtn.querySelector('.loader-ring').classList.add('hidden');
            genSfxBtn.querySelector('.btn-text').textContent = "Generate Neural SFX";
        }
    }

    async function loadSuggestions() {
        try {
            const response = await fetch('/v1/sfx/suggestions');
            const data = await response.json();
            sfxSuggestions.innerHTML = data.map(s =>
                `<span class="chip" title="${s.category}">${s.prompt}</span>`
            ).join('');

            sfxSuggestions.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    sfxPrompt.value = chip.textContent;
                });
            });
        } catch (err) {
            console.error("Suggestions fail:", err);
        }
    }

    window.saveToLibrary = async (url, name) => {
        try {
            const response = await fetch('/v1/library/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, name })
            });
            const data = await response.json();
            if (data.success) {
                alert("Saved to Library!");
            }
        } catch (err) {
            alert("Save failed: " + err.message);
        }
    };

    async function loadLibrary() {
        libraryList.innerHTML = '<div class="loader-ring" style="margin: 20px auto;"></div>';
        try {
            const response = await fetch('/v1/library');
            const data = await response.json();
            if (data.files && data.files.length > 0) {
                libraryList.innerHTML = data.files.map(f => `
                    <div class="history-item">
                        <div class="history-item-header">
                            <span>SAVED</span>
                            <span>${(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div class="history-item-text">${f.name}</div>
                        <audio controls src="${f.url}"></audio>
                        <div class="item-actions">
                            <a href="${f.url}" download="${f.name}" class="action-btn">Export</a>
                        </div>
                    </div>
                `).join('');
            } else {
                libraryList.innerHTML = '<div class="empty-state">Library is empty</div>';
            }
        } catch (err) {
            libraryList.innerHTML = '<div class="empty-state">Failed to load library</div>';
        }
    }

    genSfxBtn.addEventListener('click', generateSFX);
    synthBtn.addEventListener('click', synthesize);

    // --- INITIALIZATION ---
    async function loadVoices() {
        try {
            const response = await fetch('/v1/voices');
            const data = await response.json();
            if (data.voices) {
                voiceSelect.innerHTML = data.voices.map(v =>
                    `<option value="${v}">${v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>`
                ).join('');
            }
        } catch (err) {
            console.error("Failed to load voices:", err);
        }
    }
    loadVoices();

    // --- BATCH PRODUCTION HANDLING ---
    batchUploadZone.addEventListener('click', () => batchFile.click());

    batchFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        batchStatus.classList.remove('hidden');
        batchProgress.style.width = '0%';
        batchProgress.classList.add('greyed');
        batchMsg.innerText = `Processing batch: ${file.name}...`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Simulated progress since we don't have socket.io yet
            let progress = 0;
            const interval = setInterval(() => {
                progress = Math.min(progress + 5, 95);
                batchProgress.style.width = `${progress}%`;
            }, 500);

            const response = await fetch('/v1/batch', {
                method: 'POST',
                body: formData
            });

            clearInterval(interval);
            const data = await response.json();

            if (response.ok) {
                batchProgress.style.width = '100%';
                batchProgress.classList.remove('greyed');
                batchMsg.innerHTML = `Success! Generated ${data.count} files. <a href="${data.url}" class="download-link">Download ZIP Package</a>`;

                // Add to history
                addHistoryItem(`Batch: ${file.name}`, data.url, true);
            } else {
                throw new Error(data.detail || 'Batch synthesis failed');
            }
        } catch (err) {
            batchMsg.innerHTML = `<span class="error">Error: ${err.message}</span>`;
            batchProgress.classList.add('error-bar');
        }
    });

    function addHistoryItem(text, url, isBatch = false) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const time = new Date().toLocaleTimeString();

        item.innerHTML = `
            <div class="item-info">
                <p class="item-text">${text}</p>
                <span class="item-time">${time}</span>
            </div>
            <div class="item-actions">
                ${isBatch ?
                `<a href="${url}" download class="action-btn download">Download ZIP</a>` :
                `<audio src="${url}" controls></audio>`
            }
            </div>
        `;

        if (historyList.querySelector('.empty-state')) {
            historyList.innerHTML = '';
        }
        historyList.prepend(item);
    }

    document.querySelectorAll('.sfx-btn').forEach(btn => {
        btn.addEventListener('click', () => triggerSFX(btn.dataset.event));
    });
});
