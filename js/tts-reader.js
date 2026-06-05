// TTS reader for .project-content
// Click "Listen" -> highlight + speak each sentence in order. Click again to stop.
// Uses the browser's built-in Web Speech API (no dependencies, no network).
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

  // Build sentence index lazily on first activation to avoid wrapping prose
  // until the user opts in.
  let sentences = null;
  let currentIndex = 0;
  let utterance = null;
  let state = 'idle'; // 'idle' | 'speaking' | 'paused'

  // Heuristic sentence splitter: chunks at . ! ? followed by whitespace or end.
  // Keeps the terminator with the sentence.
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

  // Wrap each sentence in every readable block with a span. Blocks that are
  // not text-bearing (figures, shortcode-emitted grids, code) are skipped.
  function wrapSentences() {
    const blocks = container.querySelectorAll('p, li, h2, h3');
    const collected = [];
    blocks.forEach((block) => {
      // Skip blocks inside the TTS controls themselves or inside link cards.
      if (block.closest('.tts-controls')) return;
      if (block.closest('.yt-card')) return;
      const original = block.textContent.trim();
      if (!original) return;
      const pieces = splitSentences(original);
      if (pieces.length === 0) return;
      // Replace block contents with wrapped spans. We rebuild via a fragment
      // so existing inline formatting on the whole block is preserved when
      // possible; if a block has inline elements (a, strong, em), we wrap
      // by sentence boundaries on its text and re-inject — formatting is
      // lost on the spoken paragraph but the original DOM is restored on
      // stop. For now we keep it simple and replace text only.
      const frag = document.createDocumentFragment();
      pieces.forEach((piece, i) => {
        if (i > 0) frag.appendChild(document.createTextNode(' '));
        const span = document.createElement('span');
        span.className = 'tts-sentence';
        span.textContent = piece;
        collected.push(span);
        frag.appendChild(span);
      });
      // Stash original so we can restore on stop.
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
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
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

  // Build minimal controls. Inserted at the top of .project-content.
  const controls = document.createElement('div');
  controls.className = 'tts-controls';
  controls.innerHTML = `
    <button type="button" class="tts-btn tts-btn-primary" aria-live="polite">
      <span class="tts-icon" aria-hidden="true">▶</span>
      <span class="tts-label">Listen</span>
    </button>
    <button type="button" class="tts-btn tts-btn-stop" aria-label="Stop reading">
      <span class="tts-icon" aria-hidden="true">■</span>
    </button>
  `;
  container.insertBefore(controls, container.firstChild);

  const primaryBtn = controls.querySelector('.tts-btn-primary');
  const stopBtn = controls.querySelector('.tts-btn-stop');
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

  primaryBtn.addEventListener('click', () => {
    if (state === 'idle') start();
    else if (state === 'speaking') pause();
    else if (state === 'paused') resume();
  });
  stopBtn.addEventListener('click', stop);

  // If the user navigates away or reloads, end speech politely.
  window.addEventListener('beforeunload', stop);
})();
