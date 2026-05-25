(function () {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  const imgEl = lightbox.querySelector('.lightbox-image');
  const titleEl = lightbox.querySelector('.lightbox-title');
  const descEl = lightbox.querySelector('.lightbox-description');
  const linkEl = lightbox.querySelector('.lightbox-link');
  const counterEl = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const sections = {};
  document.querySelectorAll('.portfolio-gallery-section').forEach(function (section) {
    const id = section.dataset.gallerySection;
    if (!id) return;
    const tiles = Array.from(section.querySelectorAll('.js-lightbox-trigger'));
    sections[id] = tiles.map(function (t) {
      return {
        image: t.dataset.image || '',
        title: t.dataset.title || '',
        description: t.dataset.description || '',
        link: t.dataset.link || ''
      };
    });
  });

  let currentSection = null;
  let currentIndex = 0;
  let lastFocus = null;

  function open(sectionId, index, trigger) {
    if (!sections[sectionId] || !sections[sectionId].length) return;
    currentSection = sectionId;
    currentIndex = index;
    lastFocus = trigger || null;
    render();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  function render() {
    const items = sections[currentSection];
    const item = items[currentIndex];
    imgEl.src = item.image;
    imgEl.alt = item.title;
    titleEl.textContent = item.title;
    if (item.description) {
      descEl.textContent = item.description;
      descEl.hidden = false;
    } else {
      descEl.textContent = '';
      descEl.hidden = true;
    }
    if (item.link) {
      linkEl.href = item.link;
      linkEl.hidden = false;
    } else {
      linkEl.removeAttribute('href');
      linkEl.hidden = true;
    }
    counterEl.textContent = (currentIndex + 1) + ' / ' + items.length;
    const hasNav = items.length > 1;
    prevBtn.hidden = !hasNav;
    nextBtn.hidden = !hasNav;
  }

  function step(delta) {
    const items = sections[currentSection];
    if (!items) return;
    currentIndex = (currentIndex + delta + items.length) % items.length;
    render();
  }

  document.querySelectorAll('.js-lightbox-trigger').forEach(function (tile) {
    tile.addEventListener('click', function (e) {
      e.preventDefault();
      const section = tile.dataset.section;
      const index = parseInt(tile.dataset.index, 10) || 0;
      open(section, index, tile);
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
})();
