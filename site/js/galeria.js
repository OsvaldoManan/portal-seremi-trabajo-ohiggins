// ============== GALERÍA DE INSTAGRAM (con embeds oficiales) ==============
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

  // ====== KPIs ======
  const totalReels = allPosts.filter(p => p.tipo === 'reel').length;
  const totalPosts = allPosts.filter(p => p.tipo === 'post').length;
  const latest = allPosts[0];
  const months = [...new Set(allPosts.map(p => p.fecha.slice(0, 7)))];

  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return `${d} ${MONTH_NAMES[m].toLowerCase().slice(0,3)} ${y}`;
  }

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

  // ====== Month filter pills ======
  const filterMonth = document.getElementById('filter-month');
  months.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.dataset.filter = m;
    btn.textContent = `${MONTH_NAMES[m.slice(5)]} ${m.slice(0,4)}`;
    filterMonth.appendChild(btn);
  });

  // ====== Render cards con embed placeholder (lazy loaded) ======
  function buildEmbedHTML(post) {
    // Convertir URL para que sea limpia para embed
    const url = post.url.replace(/\/$/, '') + '/';
    return `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"
      style="background:#FFF; border:0; border-radius:0; box-shadow:none; margin:0; max-width:540px; min-width:0; padding:0; width:100%;">
      <a href="${url}" target="_blank" rel="noopener"
         style="background:#FFFFFF; line-height:0; padding:0; text-align:center; text-decoration:none; width:100%; display:block;">
        <div style="padding:16px; display:flex; flex-direction:column; align-items:center; gap:.75rem;">
          <div style="display:flex; align-items:center; gap:.5rem; width:100%;">
            <div style="background:linear-gradient(135deg,#F09433,#DC2743,#BC1888); border-radius:50%; height:40px; width:40px;"></div>
            <div style="display:flex; flex-direction:column; flex:1;">
              <div style="background:#F4F4F4; border-radius:4px; height:14px; width:120px;"></div>
              <div style="background:#F4F4F4; border-radius:4px; margin-top:6px; height:10px; width:80px;"></div>
            </div>
          </div>
          <div style="padding:0; height:200px; width:100%; background:linear-gradient(135deg,#F09433 0%,#DC2743 50%,#BC1888 100%); border-radius:4px; display:flex; align-items:center; justify-content:center;">
            <span style="font-size:2.5rem; color:rgba(255,255,255,.95);">📷</span>
          </div>
          <div style="color:#3897F0; font-size:13px; font-weight:600;">Cargando post de Instagram…</div>
        </div>
      </a>
    </blockquote>`;
  }

  function renderCards() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = allPosts.map(p => `
      <article class="gallery-card" data-month="${p.fecha.slice(0,7)}" data-type="${p.tipo}" data-url="${p.url}">
        <div class="gallery-header">
          <span class="gallery-type-pill">${p.tipo === 'reel' ? '🎬 Reel' : '📷 Post'}</span>
          <span class="gallery-date-pill">📅 ${formatDate(p.fecha)}</span>
        </div>
        <div class="gallery-embed-wrap" data-lazy-embed="${p.url}">
          ${buildEmbedHTML(p)}
        </div>
        <div class="gallery-body">
          <h3 class="gallery-title">${p.titulo}</h3>
          <p class="gallery-desc">${p.descripcion}</p>
          ${p.tags && p.tags.length ? `<div class="gallery-tags">${p.tags.map(t => `<span class="gallery-tag">#${t.replace(/\s+/g, '')}</span>`).join('')}</div>` : ''}
          <div class="gallery-footer">
            <span class="gallery-date">@trabajoohiggins</span>
            <a href="${p.url}" target="_blank" rel="noopener" class="gallery-link">
              Abrir en Instagram →
            </a>
          </div>
        </div>
      </article>
    `).join('');
  }

  renderCards();

  // ====== Lazy load script de Instagram (una sola vez) ======
  let igScriptLoaded = false;
  function loadInstagramScript() {
    if (igScriptLoaded) return;
    igScriptLoaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = '//www.instagram.com/embed.js';
    s.onload = () => {
      // Procesar todos los embeds visibles
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    };
    document.body.appendChild(s);
  }

  // Trigger lazy load cuando el primer card entra al viewport
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          loadInstagramScript();
          obs.disconnect();
        }
      });
    }, { rootMargin: '200px' });

    const firstCard = document.querySelector('.gallery-card');
    if (firstCard) obs.observe(firstCard);
  } else {
    // Fallback: cargar inmediatamente
    setTimeout(loadInstagramScript, 500);
  }

  // ====== Filter logic ======
  let activeMonth = 'all';
  let activeType = 'all';

  function applyFilters() {
    let visible = 0;
    document.querySelectorAll('.gallery-card').forEach(c => {
      const matchMonth = activeMonth === 'all' || c.dataset.month === activeMonth;
      const matchType = activeType === 'all' || c.dataset.type === activeType;
      const show = matchMonth && matchType;
      c.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    // Re-process Instagram embeds tras cambio de filtro
    setTimeout(() => {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    }, 100);
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
