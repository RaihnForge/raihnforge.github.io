// TTS reader for .project-content
// Click "Listen" -> highlight + speak each sentence in order. Click again to stop.
// Uses the browser's built-in Web Speech API (no dependencies, no network).
//
// Features:
// - Listen / Pause / Resume / Stop
// - Settings popover: voice picker + speed slider
// - Persists voice + rate in localStorage
// - Active sentence highlight + auto-scroll
//
// Notes for future maintenance:
// - Hosts that block speechSynthesis (rare) will silently disable the button.
// - For higher-quality voices, the upgrade path is a server-side TTS like
//   Resemble's open-source Chatterbox; the UI here (sentence wrapping, active
//   class, controls) would carry over unchanged.
(function () {
  if (!('speechSynthesis' in window)) return;

  const container = document.querySelector('.project-content');
  if (!container) return;

  const STORAGE_VOICE = 'tts:voiceURI';
  const STORAGE_RATE = 'tts:rate';

  let sentences = null;
  let currentIndex = 0;
  let utterance = null;
  let state = 'idle'; // 'idle' | 'speaking' | 'paused'
  let voices = [];
  let selectedVoiceURI = localStorage.getItem(STORAGE_VOICE) || '';
  let rate = clampRate(parseFloat(localStorage.getItem(STORAGE_RATE)) || 1.0);

  function clampRate(r) {
    if (Number.isNaN(r)) return 1.0;
    return Math.max(0.6, Math.min(1.6, r));
  }

  // Heuristic sentence splitter: chunks at . ! ? followed by whitespace or end.
  function splitSentences(text) {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (!trimmed) return [];
    const out = [];
    const re = /[^.!?]+(?:[.!?]+(?=\s|$)|$)/g;
    let match;
    while ((match = re.exec(trimmed)) !== null) {
      const piece = match[0].trim();
      if (piece) out.push(piece);
    }
    return out.length ? out : [trimmed];
  }

  // Wrap each sentence in every readable block with a span. Stash original
  // HTML on the block so we can restore on stop. Inline formatting on
  // mixed-content paragraphs is lost during playback by design.
  function wrapSentences() {
    const blocks = container.querySelectorAll('p, li, h2, h3');
    const collected = [];
    blocks.forEach((block) => {
      if (block.closest('.tts-controls')) return;
      if (block.closest('.yt-card')) return;
      const original = block.textContent.trim();
      if (!original) return;
      const pieces = splitSentences(original);
      if (pieces.length === 0) return;
      const frag = document.createDocumentFragment();
      pieces.forEach((piece, i) => {
        if (i > 0) frag.appendChild(document.createTextNode(' '));
        const span = document.createElement('span');
        span.className = 'tts-sentence';
        span.textContent = piece;
        collected.push(span);
        frag.appendChild(span);
      });
      block.dataset.ttsOriginal = block.innerHTML;
      block.replaceChildren(frag);
    });
    return collected;
  }

  function restoreSentences() {
    container.querySelectorAll('[data-tts-original]').forEach((block) => {
      block.innerHTML = block.dataset.ttsOriginal;
      delete block.dataset.ttsOriginal;
    });
    sentences = null;
  }

  function clearActive() {
    container.querySelectorAll('.tts-sentence.tts-active').forEach((el) => {
      el.classList.remove('tts-active');
    });
  }

  function scrollIntoViewIfNeeded(el) {
    const rect = el.getBoundingClientRect();
    const inView = rect.top >= 80 && rect.bottom <= window.innerHeight - 80;
    if (!inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function currentVoice() {
    if (!voices.length) return null;
    if (selectedVoiceURI) {
      const found = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (found) return found;
    }
    return voices.find((v) => v.default) || voices[0];
  }

  function speakIndex(i) {
    clearActive();
    if (!sentences || i >= sentences.length) {
      stop();
      return;
    }
    currentIndex = i;
    const sentenceEl = sentences[i];
    sentenceEl.classList.add('tts-active');
    scrollIntoViewIfNeeded(sentenceEl);
    utterance = new SpeechSynthesisUtterance(sentenceEl.textContent);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    const voice = currentVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (state === 'speaking') speakIndex(i + 1);
    };
    utterance.onerror = () => {
      stop();
    };
    window.speechSynthesis.speak(utterance);
  }

  function start() {
    if (state !== 'idle') return;
    sentences = wrapSentences();
    if (!sentences || sentences.length === 0) {
      restoreSentences();
      return;
    }
    state = 'speaking';
    setButton('pause');
    speakIndex(0);
  }

  function pause() {
    if (state !== 'speaking') return;
    window.speechSynthesis.pause();
    state = 'paused';
    setButton('resume');
  }

  function resume() {
    if (state !== 'paused') return;
    window.speechSynthesis.resume();
    state = 'speaking';
    setButton('pause');
  }

  function stop() {
    window.speechSynthesis.cancel();
    state = 'idle';
    clearActive();
    restoreSentences();
    setButton('listen');
  }

  // Apply a new rate. If actively speaking, we restart the current sentence
  // with the new rate (speechSynthesis won't change rate mid-utterance).
  function applyRate(newRate) {
    rate = clampRate(newRate);
    localStorage.setItem(STORAGE_RATE, String(rate));
    rateValueEl.textContent = rate.toFixed(2) + '×';
    rateRangeEl.value = String(rate);
    if (state === 'speaking') {
      window.speechSynthesis.cancel();
      speakIndex(currentIndex);
    }
  }

  function applyVoice(uri) {
    selectedVoiceURI = uri || '';
    if (selectedVoiceURI) localStorage.setItem(STORAGE_VOICE, selectedVoiceURI);
    else localStorage.removeItem(STORAGE_VOICE);
    if (state === 'speaking') {
      window.speechSynthesis.cancel();
      speakIndex(currentIndex);
    }
  }

  function loadVoices() {
    const all = window.speechSynthesis.getVoices() || [];
    // English voices first; if none, fall back to all voices so users can
    // still pick something rather than seeing an empty list.
    const english = all.filter((v) => /^en(-|_|$)/i.test(v.lang));
    voices = (english.length ? english : all).slice().sort((a, b) => {
      if (a.default && !b.default) return -1;
      if (!a.default && b.default) return 1;
      return a.name.localeCompare(b.name);
    });
    populateVoiceSelect();
  }

  function populateVoiceSelect() {
    if (!voiceSelectEl) return;
    const prev = voiceSelectEl.value;
    voiceSelectEl.innerHTML = '';
    if (!voices.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No voices available';
      voiceSelectEl.appendChild(opt);
      voiceSelectEl.disabled = true;
      return;
    }
    voiceSelectEl.disabled = false;
    voices.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      const lang = v.lang ? ` (${v.lang})` : '';
      const tag = v.default ? ' — default' : '';
      opt.textContent = v.name + lang + tag;
      voiceSelectEl.appendChild(opt);
    });
    const targetURI = selectedVoiceURI || prev || (currentVoice() && currentVoice().voiceURI) || '';
    if (targetURI) voiceSelectEl.value = targetURI;
  }

  // -- Build controls --
  const controls = document.createElement('div');
  controls.className = 'tts-controls';
  controls.innerHTML = `
    <button type="button" class="tts-btn tts-btn-primary" aria-live="polite">
      <span class="tts-icon" aria-hidden="true">▶</span>
      <span class="tts-label">Listen</span>
    </button>
    <button type="button" class="tts-btn tts-btn-stop" aria-label="Stop reading" hidden>
      <span class="tts-icon" aria-hidden="true">■</span>
    </button>
    <button type="button" class="tts-btn tts-btn-settings" aria-label="Reader settings" aria-expanded="false">
      <span class="tts-icon" aria-hidden="true">⚙</span>
    </button>
    <div class="tts-settings" hidden>
      <label class="tts-field">
        <span class="tts-field-label">Voice</span>
        <select class="tts-voice"></select>
      </label>
      <label class="tts-field">
        <span class="tts-field-label">Speed
          <span class="tts-rate-value">1.00×</span>
        </span>
        <input class="tts-rate" type="range" min="0.6" max="1.6" step="0.05" value="1" />
      </label>
    </div>
  `;
  container.insertBefore(controls, container.firstChild);

  const primaryBtn = controls.querySelector('.tts-btn-primary');
  const stopBtn = controls.querySelector('.tts-btn-stop');
  const settingsBtn = controls.querySelector('.tts-btn-settings');
  const settingsPanel = controls.querySelector('.tts-settings');
  const voiceSelectEl = controls.querySelector('.tts-voice');
  const rateRangeEl = controls.querySelector('.tts-rate');
  const rateValueEl = controls.querySelector('.tts-rate-value');
  const iconEl = primaryBtn.querySelector('.tts-icon');
  const labelEl = primaryBtn.querySelector('.tts-label');

  function setButton(mode) {
    if (mode === 'listen') {
      iconEl.textContent = '▶';
      labelEl.textContent = 'Listen';
      controls.classList.remove('is-active');
      stopBtn.hidden = true;
    } else if (mode === 'pause') {
      iconEl.textContent = '⏸';
      labelEl.textContent = 'Pause';
      controls.classList.add('is-active');
      stopBtn.hidden = false;
    } else if (mode === 'resume') {
      iconEl.textContent = '▶';
      labelEl.textContent = 'Resume';
      controls.classList.add('is-active');
      stopBtn.hidden = false;
    }
  }

  setButton('listen');
  rateValueEl.textContent = rate.toFixed(2) + '×';
  rateRangeEl.value = String(rate);

  primaryBtn.addEventListener('click', () => {
    if (state === 'idle') start();
    else if (state === 'speaking') pause();
    else if (state === 'paused') resume();
  });
  stopBtn.addEventListener('click', stop);

  settingsBtn.addEventListener('click', () => {
    const open = settingsPanel.hidden;
    settingsPanel.hidden = !open;
    settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) loadVoices();
  });

  voiceSelectEl.addEventListener('change', (e) => applyVoice(e.target.value));
  rateRangeEl.addEventListener('input', (e) => applyRate(parseFloat(e.target.value)));

  // Voices populate asynchronously in Chrome / Edge.
  loadVoices();
  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  } else {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  window.addEventListener('beforeunload', stop);
})();
