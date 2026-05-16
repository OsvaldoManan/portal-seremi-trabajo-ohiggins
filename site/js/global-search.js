// ============== BUSCADOR GLOBAL ==============
(function() {
  // Índice estático de páginas y secciones
  const INDEX = [
    { titulo: 'Inicio', url: 'index.html', tags: 'portada KPIs sintesis observatorio laboral region ohiggins inicio home', tipo: 'Página' },
    { titulo: 'Indicadores Comunales · Mapa geográfico', url: 'comunas.html#tab-geomapa', tags: '31 comunas indicadores mapa geografico territorial poblacion empresas vacantes inversion', tipo: 'Sección' },
    { titulo: 'Indicadores Comunales · Heatmap', url: 'comunas.html#tab-mapa', tags: 'heatmap intensidad color tiles comuna', tipo: 'Sección' },
    { titulo: 'Indicadores Comunales · Ficha por comuna', url: 'comunas.html#tab-detalle', tags: 'ficha comuna detalle indicadores censo ENE SII BNE MIDESO 32 indicadores', tipo: 'Sección' },
    { titulo: 'Indicadores Comunales · Comparar', url: 'comunas.html#tab-comparar', tags: 'comparar indicador entre comunas barras horizontal', tipo: 'Sección' },
    { titulo: 'Indicadores Comunales · Lado a lado', url: 'comunas.html#tab-lado-a-lado', tags: 'comparativa 2 3 comunas paralelo demografia mercado laboral ingresos empresas', tipo: 'Sección' },
    { titulo: 'Indicadores Comunales · Ranking', url: 'comunas.html#tab-ranking', tags: 'ranking top 10 poblacion empresas vacantes genero tabla resumen', tipo: 'Sección' },
    { titulo: 'Inversión Histórica 1994-2025', url: 'inversion.html#tab-historica', tags: 'historica BIP 30401 iniciativas sectores transporte recursos hidricos educacion salud F.N.D.R. sectorial', tipo: 'Sección' },
    { titulo: 'Cartera de Inversión 2026 (CBC)', url: 'inversion.html#tab-cartera', tags: 'cartera 2026 mineria inmobiliario obras publicas energia industrial empleo profesional tecnico no calificado', tipo: 'Sección' },
    { titulo: 'Análisis Estratégico · Diagnóstico', url: 'analisis.html', tags: 'diagnostico hallazgos brechas concentracion urbana cuello botella demanda formativa', tipo: 'Página' },
    { titulo: 'Análisis · 7 Objetivos institucionales', url: 'analisis.html', tags: 'OE1 OE2 OE3 OE4 OE5 OE6 OE7 objetivos institucionales metas 2028 KPI indicadores seguimiento', tipo: 'Sección' },
    { titulo: 'Análisis · 6 Líneas de mejora', url: 'analisis.html', tags: 'mejoras SEREMI itinerante plan formativo formaliza mujer trabaja observatorio asistencia tecnica municipal', tipo: 'Sección' },
    { titulo: 'Líneas de Acción Institucional', url: 'lineas-accion.html', tags: 'lineas accion institucional ejes gestion empleabilidad fiscalizacion ley karin mujer 40 horas previsional consejo regional capacitacion', tipo: 'Página' },
    { titulo: 'Líneas · Empleabilidad y capacitación', url: 'lineas-accion.html', tags: 'consejo regional capacitacion despega MIPE talento digital becas laborales aprendices OMIL SENCE', tipo: 'Sección' },
    { titulo: 'Líneas · Fiscalización agrícola', url: 'lineas-accion.html', tags: 'fiscalizacion agricola temporeros direccion trabajo 500 inspecciones temporada altas temperaturas operativos masivos mineria', tipo: 'Sección' },
    { titulo: 'Líneas · Ley Karin (21.643)', url: 'lineas-accion.html', tags: 'ley karin 21643 acoso laboral sexual violencia OIT convenio 190 encuentros informativos Universidad Ohiggins', tipo: 'Sección' },
    { titulo: 'Líneas · Mujer y equidad', url: 'lineas-accion.html', tags: 'mujer equidad genero sala cuna universal mujer digital inclusion femenina mineria bono trabajo mujer', tipo: 'Sección' },
    { titulo: 'Líneas · 40 horas y salario', url: 'lineas-accion.html', tags: '40 horas 42 horas ley 21561 salario minimo 546546 ley 21751 reduccion jornada seguro cesantia', tipo: 'Sección' },
    { titulo: 'Líneas · Reforma previsional', url: 'lineas-accion.html', tags: 'reforma previsional cotizacion honorarios PGU pension garantizada universal educacion previsional', tipo: 'Sección' },
    { titulo: 'Programa de Gobierno aplicado', url: 'programa.html', tags: 'programa gobierno Kast bases programaticas trabajo previsional fuerza cambio nacional', tipo: 'Página' },
    { titulo: 'Programa · 9 Ejes regionales', url: 'programa.html', tags: 'revolucion laboral SENCE 2.0 mujer trabaja formaliza ohiggins reforma previsional cero burocracia vinculacion TP', tipo: 'Sección' },
    { titulo: 'Programa · Primeros 100 días', url: 'programa.html', tags: '100 dias instalacion regional dia 1 30 60 90 catalogo SENCE', tipo: 'Sección' },
    { titulo: 'Directorio de Servicios', url: 'directorio.html', tags: 'directorio oficinas SEREMI DT SENCE IPS OMIL telefonos chileatiende BNE direcciones horarios', tipo: 'Página' },
    { titulo: 'Directorio · OMIL en 33 comunas', url: 'directorio.html', tags: 'OMIL oficina municipal informacion laboral intermediacion empleo programas SENCE asesoria empleadores', tipo: 'Sección' },
    { titulo: 'Registro de Actualizaciones', url: 'changelog.html', tags: 'changelog historial cambios actualizaciones versiones release commits novedades', tipo: 'Página' },
    { titulo: 'Asistente / Chatbot del Portal', url: 'changelog.html#chatbot', tags: 'chatbot asistente bot pregunta consulta ayuda virtual', tipo: 'Función' },
    { titulo: 'Institucional · Misión y valores', url: 'institucional.html', tags: 'mision vision valores SEREMI trabajo previsional ohiggins compromiso publico', tipo: 'Sección' },
    { titulo: 'Institucional · Servicios y metodología', url: 'institucional.html', tags: 'fuentes datos CENSO 2024 ENE SII BNE MIDESO CBC BIP metodologia institucional', tipo: 'Sección' },
  ];

  function normalize(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  }

  function score(item, qNorm) {
    const t = normalize(item.titulo);
    const tags = normalize(item.tags || '');
    let s = 0;
    qNorm.split(/\s+/).filter(Boolean).forEach(w => {
      if (t.includes(w)) s += 5;
      if (tags.includes(w)) s += 2;
      if (t.startsWith(w)) s += 3;
    });
    return s;
  }

  function search(q) {
    if (!q.trim()) return [];
    const qNorm = normalize(q);
    return INDEX
      .map(item => ({ item, score: score(item, qNorm) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(x => x.item);
  }

  // Inject global search UI
  function injectUI() {
    const nav = document.querySelector('.main-nav');
    if (!nav || document.getElementById('global-search-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'global-search-btn';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Buscar en el portal (Ctrl+K)');
    btn.innerHTML = '🔍';
    btn.title = 'Buscar (Ctrl+K)';
    nav.appendChild(btn);

    const overlay = document.createElement('div');
    overlay.id = 'gs-overlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:9999; display:none; align-items:flex-start; justify-content:center; padding-top:80px; backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div id="gs-panel" style="background:var(--bg-card, white); width:90%; max-width:640px; border-radius:12px; box-shadow:0 24px 64px rgba(0,0,0,.4); overflow:hidden;">
        <div style="padding:1rem 1.25rem; border-bottom:1px solid var(--border, #E5E7EB); display:flex; align-items:center; gap:.75rem;">
          <span style="font-size:1.3rem;">🔍</span>
          <input type="text" id="gs-input" placeholder="Buscar en el portal — comunas, indicadores, secciones..." autocomplete="off" style="flex:1; border:0; outline:0; font-size:1.05rem; background:transparent; color:var(--text-primary, #1A2332);">
          <kbd style="background:var(--gray-200, #F3F4F6); padding:.2rem .5rem; border-radius:4px; font-size:.7rem; color:var(--gray-600, #6B7280);">ESC</kbd>
        </div>
        <div id="gs-results" style="max-height:50vh; overflow-y:auto;"></div>
        <div style="padding:.75rem 1.25rem; border-top:1px solid var(--border, #E5E7EB); background:var(--gray-100, #F9FAFB); font-size:.78rem; color:var(--gray-600, #6B7280); display:flex; justify-content:space-between;">
          <span><kbd style="font-family:monospace;">↑↓</kbd> navegar · <kbd style="font-family:monospace;">⏎</kbd> abrir</span>
          <span>Buscador global · Ctrl+K</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#gs-input');
    const results = overlay.querySelector('#gs-results');
    let selectedIdx = 0;
    let currentResults = [];

    function open() {
      overlay.style.display = 'flex';
      input.value = '';
      renderResults('');
      setTimeout(() => input.focus(), 50);
    }
    function close() {
      overlay.style.display = 'none';
    }
    function renderResults(q) {
      currentResults = search(q);
      selectedIdx = 0;
      if (!q.trim()) {
        results.innerHTML = `
          <div style="padding:2rem 1.25rem; text-align:center; color:var(--gray-500, #9CA3AF);">
            <div style="font-size:2rem; margin-bottom:.5rem;">⌨️</div>
            Escribe para buscar entre páginas, secciones y datos del portal
          </div>`;
        return;
      }
      if (!currentResults.length) {
        results.innerHTML = `
          <div style="padding:2rem 1.25rem; text-align:center; color:var(--gray-500, #9CA3AF);">
            <div style="font-size:2rem; margin-bottom:.5rem;">🤷</div>
            Sin resultados para "<strong>${q}</strong>"
          </div>`;
        return;
      }
      results.innerHTML = currentResults.map((r, i) => `
        <a href="${r.url}" class="gs-result" data-idx="${i}" style="display:flex; padding:.85rem 1.25rem; align-items:center; gap:.85rem; border-bottom:1px solid var(--border, #E5E7EB); text-decoration:none; color:var(--text-primary, #1A2332); ${i === selectedIdx ? 'background:rgba(15,63,140,.06);' : ''}">
          <div style="width:32px; height:32px; border-radius:6px; background:${r.tipo === 'Página' ? '#0F3F8C' : '#F57C00'}; color:white; display:flex; align-items:center; justify-content:center; font-size:.85rem; font-weight:700; flex-shrink:0;">
            ${r.tipo === 'Página' ? 'P' : 'S'}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; font-size:.95rem;">${r.titulo}</div>
            <div style="font-size:.75rem; color:var(--gray-500, #9CA3AF); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.url} · ${r.tipo}</div>
          </div>
          <span style="font-size:.9rem; color:var(--gray-400, #D1D5DB);">→</span>
        </a>
      `).join('');
    }

    btn.addEventListener('click', open);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = Math.min(currentResults.length - 1, selectedIdx + 1);
        renderResults(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = Math.max(0, selectedIdx - 1);
        renderResults(input.value);
      } else if (e.key === 'Enter') {
        if (currentResults[selectedIdx]) {
          window.location.href = currentResults[selectedIdx].url;
        }
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.style.display === 'flex') close(); else open();
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        open();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }
})();
