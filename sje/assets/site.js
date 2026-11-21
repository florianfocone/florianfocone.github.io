(() => {
  const root = document.currentScript.dataset.root;
  const menus = [...document.querySelectorAll('.nav-group')];

  document.addEventListener('click', (event) => {
    for (const menu of menus) {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const menu = menus.find((item) => item.open);
    if (menu) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });

  const toc = [...document.querySelectorAll('.toc a')];
  const sections = toc.map((link) => document.getElementById(link.hash.slice(1)));
  const reveal = () => {
    const hash = location.hash.slice(1);
    const target = hash && document.getElementById(hash);
    if (!target) return;
    const details = target.closest('details');
    if (details && !details.open) {
      details.open = true;
      requestAnimationFrame(() => target.scrollIntoView());
    }
    const section = target.closest('.study-section');
    for (const link of toc) {
      if (section && link.hash === '#' + section.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  window.addEventListener('hashchange', reveal);
  reveal();

  if ('IntersectionObserver' in window && sections.length) {
    const activeSections = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeSections.add(entry.target);
        else activeSections.delete(entry.target);
      }
      const active = sections.find((section) => activeSections.has(section));
      if (!active) return;
      for (const link of toc) {
        if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }, {rootMargin: '-18% 0px -60% 0px'});
    sections.forEach((section) => observer.observe(section));
  }

  const dialog = document.getElementById('search-dialog');
  if (typeof dialog.showModal !== 'function' || !Array.isArray(window.chapitres)) return;
  const open = document.querySelector('[data-search]');
  const input = dialog.querySelector('input');
  const resultList = dialog.querySelector('.search-results');
  const status = dialog.querySelector('.search-status');
  const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const entries = window.chapitres.map((entry) => ({
    ...entry,
    name: normalize(entry.title),
    context: normalize(entry.area + ' ' + entry.terms),
  }));

  const update = () => {
    const terms = normalize(input.value).match(/[\p{L}\p{N}]+/gu) || [];
    resultList.replaceChildren();
    if (!terms.length) {
      status.textContent = 'Saisissez le nom d’une rubrique ou un mot-clé.';
      return;
    }
    const matches = [];
    for (const entry of entries) {
      if (!terms.every((term) => entry.name.includes(term) || entry.context.includes(term))) continue;
      const score = terms.reduce((total, term) => total + (entry.name.includes(term) ? 2 : 0), 0);
      matches.push({entry, score});
    }
    matches.sort((a, b) => b.score - a.score);
    const shown = matches.slice(0, 12);
    status.textContent = !shown.length ? 'Aucun résultat.' : matches.length > shown.length
      ? shown.length + ' résultats affichés sur ' + matches.length + '.'
      : shown.length + (shown.length === 1 ? ' résultat.' : ' résultats.');
    for (const {entry} of shown) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const label = document.createElement('strong');
      const area = document.createElement('small');
      link.href = root + entry.path;
      label.textContent = entry.title;
      area.textContent = entry.area;
      link.append(label, area);
      item.append(link);
      resultList.append(item);
    }
  };

  open.hidden = false;
  open.addEventListener('click', () => {
    dialog.showModal();
    input.focus();
    update();
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    }
  });
  resultList.addEventListener('click', (event) => {
    if (event.target.closest('a')) dialog.close();
  });
  input.addEventListener('input', update);
})();
