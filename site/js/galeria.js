// ============== GALERÍA DE INSTAGRAM ==============
(async function() {
  let data;
  try {
    data = await Utils.loadJSON('data/instagram-posts.json');
  } catch (e) {
    console.error(e);
    document.getElementById('gallery-grid').innerHTML = '<div class="empty-state">Error al cargar la galería.</div>';
    return;
  }

  const FROM_DATE = '2026-03-01';
  const allPosts = (data.posts || []).filter(p => p.fecha >= FROM_DATE);
  allPosts.sort((a, b) => b.fecha.localeCompare(a.fecha));

  const MONTH_NAMES = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  // KPIs
  const totalReels = allPosts.filter(p => p.tipo === 'reel').length;
  const totalPosts = allPosts.filter(p => p.tipo === 'post').length;
  const latest = allPosts[0];
  const months = [...new Set(allPosts.map(p => p.fecha.slice(0, 7)))];

  document.getElementById('gal-kpis').innerHTML = `
    <div class="kpi"><div class="kpi-icon" style="background:linear-gradient(135deg, #F09433, #DC2743);">📷</div>
      <div class="kpi-content"><span class="kpi-label">Posts publicados</span>
        <span class="kpi-value">${totalPosts}</span>
        <span class="kpi-foot">Desde marzo 2026</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:linear-gradient(135deg, #DC2743, #BC1888);">🎬</div>
      <div class="kpi-content"><span class="kpi-label">Reels</span>
        <span class="kpi-value">${totalReels}</span>
        <span class="kpi-foot">Videos institucionales</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#0F3F8C">📅</div>
      <div class="kpi-content"><span class="kpi-label">Meses cubiertos</span>
        <span class="kpi-value">${months.length}</span>
        <span class="kpi-foot">${months.map(m => MONTH_NAMES[m.slice(5)]).join(', ')}</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#2E7D32">🆕</div>
      <div class="kpi-content"><span class="kpi-label">Último post</span>
        <span class="kpi-value" style="font-size:1.3rem;">${formatDate(latest.fecha)}</span>
        <span class="kpi-foot">${latest.titulo.slice(0, 40)}…</span></div></div>
  `;

  // Build month filter pills
  const filterMonth = document.getElementById('filter-month');
  months.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.dataset.filter = m;
    btn.textContent = `${MONTH_NAMES[m.slice(5)]} ${m.slice(0,4)}`;
    filterMonth.appendChild(btn);
  });

  // Icon helpers
  function iconForPost(p) {
    const tagText = (p.tags || []).join(' ').toLowerCase() + ' ' + p.titulo.toLowerCase();
    if (p.tipo === 'reel') return '🎬';
    if (/mujer|género|equidad/.test(tagText)) return '👩';
    if (/discapacidad|inclusión/.test(tagText)) return '♿';
    if (/turismo/.test(tagText)) return '🏖️';
    if (/cantero|pelequén|minería|minero/.test(tagText)) return '⛏️';
    if (/bono|invierno|ips/.test(tagText)) return '💰';
    if (/informalidad|comercio|formalización/.test(tagText)) return '🏪';
    if (/dt|fiscalización|fiscalizar/.test(tagText)) return '⚖️';
    if (/mesa|reunión|articulación/.test(tagText)) return '🤝';
    return '🏛️';
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return `${d} ${MONTH_NAMES[m].toLowerCase().slice(0,3)} ${y}`;
  }

  function renderCards() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = allPosts.map(p => `
      <article class="gallery-card" data-month="${p.fecha.slice(0,7)}" data-type="${p.tipo}">
        <div class="gallery-embed">
          <span class="gallery-type-badge">${p.tipo === 'reel' ? '🎬 Reel' : '📷 Post'}</span>
          <span class="gallery-badge">📅 ${formatDate(p.fecha)}</span>
          <span class="gallery-icon">${iconForPost(p)}</span>
        </div>
        <div class="gallery-body">
          <h3 class="gallery-title">${p.titulo}</h3>
          <p class="gallery-desc">${p.descripcion}</p>
          ${p.tags && p.tags.length ? `<div class="gallery-tags">${p.tags.map(t => `<span class="gallery-tag">#${t.replace(/\s+/g, '')}</span>`).join('')}</div>` : ''}
          <div class="gallery-footer">
            <span class="gallery-date">@trabajoohiggins</span>
            <a href="${p.url}" target="_blank" rel="noopener" class="gallery-link">
              Ver en Instagram →
            </a>
          </div>
        </div>
      </article>
    `).join('');
  }

  renderCards();

  // Filter logic
  let activeMonth = 'all';
  let activeType = 'all';

  function applyFilters() {
    document.querySelectorAll('.gallery-card').forEach(c => {
      const matchMonth = activeMonth === 'all' || c.dataset.month === activeMonth;
      const matchType = activeType === 'all' || c.dataset.type === activeType;
      c.classList.toggle('hidden', !(matchMonth && matchType));
    });
  }

  document.querySelectorAll('#filter-month .filter-pill').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('#filter-month .filter-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      activeMonth = p.dataset.filter;
      applyFilters();
    });
  });

  document.querySelectorAll('#filter-type .filter-pill').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('#filter-type .filter-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      activeType = p.dataset.filter;
      applyFilters();
    });
  });
})();
