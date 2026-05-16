// ============== ACTIVIDADES: Calendario + Noticias + Recursos ==============
(async function() {
  let eventos, noticias, recursos;
  try {
    [eventos, noticias, recursos] = await Promise.all([
      Utils.loadJSON('data/eventos.json'),
      Utils.loadJSON('data/noticias.json'),
      Utils.loadJSON('data/recursos-descargables.json')
    ]);
  } catch (e) {
    console.error(e); return;
  }

  const MONTHS_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

  // ====== CALENDARIO ======
  function renderCalendario() {
    const list = document.getElementById('eventos-list');
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = eventos.eventos.filter(e => e.fecha >= today).sort((a,b) => a.fecha.localeCompare(b.fecha));

    if (!upcoming.length) {
      list.innerHTML = '<div class="empty-state">No hay eventos próximos.</div>';
      return;
    }

    list.innerHTML = upcoming.map(e => {
      const [y, m, d] = e.fecha.split('-');
      const monthIdx = parseInt(m, 10) - 1;
      const ICONS = {
        mesa: '🤝', operativo: '🚐', feria: '🏛️',
        capacitacion: '🎓', fiscalizacion: '⚖️', dialogo: '💬'
      };
      return `
        <article class="event-card">
          <div class="event-date">
            <span class="day">${parseInt(d, 10)}</span>
            <span class="month">${MONTHS_SHORT[monthIdx]}</span>
            <span class="year">${y}</span>
          </div>
          <div class="event-info">
            <span class="event-tipo ${e.tipo}">${ICONS[e.tipo] || '📌'} ${e.tipo}</span>
            <h3>${e.titulo}</h3>
            <div class="event-meta">
              <span>🕐 ${e.hora}</span>
              <span>📍 ${e.comuna}</span>
              <span>🏢 ${e.organiza}</span>
            </div>
            <p style="margin:.4rem 0 0; color:var(--gray-700); font-size:.9rem; line-height:1.55;">${e.descripcion}</p>
            <p style="margin:.5rem 0 0; font-size:.78rem; color:var(--gray-500);">${e.lugar}</p>
          </div>
        </article>
      `;
    }).join('');
  }

  // ====== NOTICIAS ======
  const MONTH_NAMES = {
    '01': 'enero', '02': 'febrero', '03': 'marzo', '04': 'abril',
    '05': 'mayo', '06': 'junio', '07': 'julio', '08': 'agosto',
    '09': 'septiembre', '10': 'octubre', '11': 'noviembre', '12': 'diciembre'
  };

  function fmtFecha(iso) {
    const [y, m, d] = iso.split('-');
    return `${parseInt(d, 10)} de ${MONTH_NAMES[m]} ${y}`;
  }

  function renderNoticias() {
    const grid = document.getElementById('noticias-grid');
    const ordenadas = [...noticias.noticias].sort((a,b) => b.fecha.localeCompare(a.fecha));
    grid.innerHTML = ordenadas.map(n => `
      <article class="news-card" data-id="${n.id}">
        <div class="news-header">
          <span class="news-cat">${n.categoria}</span>
          <span style="font-size:.78rem; color:var(--gray-600); font-variant-numeric:tabular-nums;">📅 ${fmtFecha(n.fecha)}</span>
        </div>
        <div class="news-body">
          <h3 class="news-title">${n.titulo}</h3>
          <p class="news-summary">${n.resumen}</p>
          <div class="news-footer">
            <span style="font-size:.78rem; color:var(--gray-600);">👤 ${n.autor}</span>
            <button class="btn-download" data-news-id="${n.id}">Leer más →</button>
          </div>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('button[data-news-id]').forEach(b => {
      b.addEventListener('click', () => openNoticia(b.dataset.newsId));
    });
  }

  function openNoticia(id) {
    const n = noticias.noticias.find(x => x.id === id);
    if (!n) return;
    document.getElementById('news-modal-body').innerHTML = `
      <span class="news-cat" style="background:#0F3F8C;color:white;padding:.2rem .65rem;border-radius:100px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${n.categoria}</span>
      <h2 style="margin-top:1rem;">${n.titulo}</h2>
      <div class="meta">📅 ${fmtFecha(n.fecha)} · 👤 ${n.autor}</div>
      <div style="font-size:1rem; line-height:1.75; color:#495467;">${n.contenido}</div>
      ${n.tags ? `<div style="margin-top:1.5rem; display:flex; gap:.4rem; flex-wrap:wrap;">${n.tags.map(t => `<span class="gallery-tag">#${t.replace(/\s+/g,'')}</span>`).join('')}</div>` : ''}
    `;
    document.getElementById('news-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeNoticia() {
    document.getElementById('news-modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('news-modal-close').addEventListener('click', closeNoticia);
  document.getElementById('news-modal').addEventListener('click', (e) => {
    if (e.target.id === 'news-modal') closeNoticia();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNoticia();
  });

  // ====== RECURSOS ======
  function renderRecursos() {
    const list = document.getElementById('recursos-list');
    list.innerHTML = recursos.recursos.map(cat => `
      <div class="resource-cat">
        <h3>${cat.categoria}</h3>
        <div class="resource-grid">
          ${cat.items.map(r => `
            <a href="${r.url}" ${r.interno ? '' : 'target="_blank" rel="noopener"'} class="resource-card">
              <div class="resource-icon">${r.icono}</div>
              <div>
                <h4>${r.titulo}</h4>
                <p>${r.descripcion}</p>
                <span class="resource-tipo">${r.tipo}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  renderCalendario();

  // Render noticias y recursos al cambiar de tab para optimizar
  let noticiasRendered = false;
  let recursosRendered = false;
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById(`tab-${target}`).classList.add('active');
      if (target === 'noticias' && !noticiasRendered) { renderNoticias(); noticiasRendered = true; }
      if (target === 'recursos' && !recursosRendered) { renderRecursos(); recursosRendered = true; }
    });
  });

})();
