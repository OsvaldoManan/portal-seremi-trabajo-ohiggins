// ============== MAPA GEOGRAFICO de O'HIGGINS ==============
(async function() {
  let geo, comunas;
  try {
    [geo, comunas] = await Promise.all([
      Utils.loadJSON('data/geo/ohiggins.geojson'),
      Utils.loadJSON('data/comunas.json')
    ]);
  } catch (e) {
    console.error('Error cargando GeoJSON', e);
    document.getElementById('geomap-wrap').innerHTML = '<div class="no-data">Error al cargar el mapa geográfico.</div>';
    return;
  }

  // Match comuna por nombre — el GeoJSON usa propiedad "Comuna"
  const dataByName = new Map();
  comunas.forEach(c => dataByName.set(normalizeName(c.comuna), c));

  function normalizeName(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z]/g,'');
  }

  // Configuración SVG y projection
  const svg = d3.select('#geomap-svg');
  const tooltip = document.getElementById('geomap-tooltip');
  const wrap = document.getElementById('geomap-wrap');

  function getDims() {
    const r = wrap.getBoundingClientRect();
    return { w: r.width || 800, h: 540 };
  }

  // Paletas de color (escala secuencial)
  const PALETTES = {
    blue:   { name: 'Azul', stops: ['#E8EEF8', '#B7C9E8', '#7B9BCC', '#3A6BB0', '#0F3F8C', '#0A2D6B'] },
    red:    { name: 'Rojo', stops: ['#FCE8EA', '#F5B5BC', '#E27A85', '#CA3F4F', '#C0192B', '#8B0F1E'] },
    green:  { name: 'Verde', stops: ['#E6F1E8', '#B8D8BD', '#82B98C', '#4E9659', '#2E7D32', '#1B5E20'] },
    yellow: { name: 'Amarillo', stops: ['#FFF8D6', '#FFE57A', '#FFC93C', '#FFA800', '#F57C00', '#BF5F00'] }
  };

  function makeColorScale(values, paletteKey) {
    const p = PALETTES[paletteKey] || PALETTES.blue;
    const valid = values.filter(v => v > 0);
    const max = Math.max(...valid, 1);
    const min = Math.min(...valid, 0);
    return {
      palette: p,
      max, min,
      color: (v) => {
        if (!v || v <= 0) return '#E5E7EB';
        const t = (v - min) / (max - min || 1);
        const idx = Math.min(p.stops.length - 1, Math.floor(t * (p.stops.length - 1)));
        // Smooth interpolation between idx and idx+1
        const localT = t * (p.stops.length - 1) - idx;
        const c1 = d3.color(p.stops[idx]);
        const c2 = d3.color(p.stops[Math.min(p.stops.length - 1, idx + 1)]);
        return d3.interpolateRgb(c1, c2)(localT);
      }
    };
  }

  function fmt(n, decimals) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || (n < 100 ? 2 : 0)
    }).format(n);
  }

  function render(indicator, paletteKey) {
    const { w, h } = getDims();
    svg.attr('viewBox', `0 0 ${w} ${h}`);

    // Projection auto-fit
    const projection = d3.geoMercator().fitSize([w - 40, h - 40], geo);
    const path = d3.geoPath().projection(projection);

    // Get values for each feature
    const values = geo.features.map(f => {
      const comName = f.properties.Comuna;
      const cdata = dataByName.get(normalizeName(comName));
      const v = cdata?.indicadores[indicator]?.numero || 0;
      return { feature: f, comuna: comName, value: v, has: !!cdata };
    });

    const allValues = values.map(v => v.value);
    const scale = makeColorScale(allValues, paletteKey);

    // Compute stats
    const valid = values.filter(v => v.has && v.value > 0);
    const total = valid.reduce((s, v) => s + v.value, 0);
    const avg = valid.length ? total / valid.length : 0;
    const top = [...valid].sort((a, b) => b.value - a.value)[0];
    const bot = [...valid].sort((a, b) => a.value - b.value)[0];

    document.getElementById('geo-title').textContent = `Mapa geográfico — ${indicator}`;
    document.getElementById('geo-top').textContent = top ? top.comuna : '—';
    document.getElementById('geo-top-val').textContent = top ? fmt(top.value) : '—';
    document.getElementById('geo-avg').textContent = fmt(avg, 1);
    document.getElementById('geo-gap').textContent =
      (top && bot && bot.value > 0) ? `${(top.value / bot.value).toFixed(1)}x` : '—';

    // Clear
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', 'translate(20, 20)');

    // Draw shapes
    g.selectAll('path')
      .data(values)
      .join('path')
      .attr('d', d => path(d.feature))
      .attr('fill', d => d.has ? scale.color(d.value) : '#E5E7EB')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 0.8)
      .style('cursor', 'pointer')
      .style('transition', 'opacity .15s')
      .on('mouseover', function(ev, d) {
        d3.select(this).attr('stroke-width', 2.5).attr('stroke', '#0F3F8C');
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <div style="font-weight:700; margin-bottom:.25rem; font-size:.95rem;">${d.comuna}</div>
          <div style="opacity:.85; font-size:.78rem; margin-bottom:.35rem;">${indicator}</div>
          <div style="font-size:1.1rem; font-weight:800; color:#FFD200;">${d.has ? fmt(d.value) : 'Sin datos'}</div>
          ${d.has && d.value > 0 ? `<div style="margin-top:.3rem; font-size:.75rem; opacity:.8;">${((d.value/avg)*100 - 100 >= 0 ? '+' : '')}${((d.value/avg)*100 - 100).toFixed(1)}% sobre el promedio</div>` : ''}
          ${d.has ? `<div style="margin-top:.5rem; font-size:.72rem; opacity:.7;">Click para ver ficha</div>` : ''}
        `;
      })
      .on('mousemove', (ev) => {
        const rect = wrap.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        // Posiciona offset para no taparlo con el cursor
        tooltip.style.left = (x + 15) + 'px';
        tooltip.style.top = (y - 30) + 'px';
        // Si se va del borde derecho, mover a la izquierda
        const tr = tooltip.getBoundingClientRect();
        if (x + 15 + tr.width > rect.width) {
          tooltip.style.left = (x - tr.width - 15) + 'px';
        }
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 0.8).attr('stroke', '#FFFFFF');
        tooltip.style.display = 'none';
      })
      .on('click', function(ev, d) {
        if (!d.has) return;
        // Switch to ficha tab and select this comuna
        const sel = document.getElementById('comuna-select');
        if (sel) {
          sel.value = d.comuna;
          sel.dispatchEvent(new Event('change'));
        }
        document.querySelector('.tab[data-tab="detalle"]')?.click();
        window.scrollTo({ top: document.querySelector('#tab-detalle').offsetTop - 80, behavior: 'smooth' });
      });

    // Etiquetas para Top 5 más grandes
    const topN = [...values].sort((a,b) => b.value - a.value).slice(0, 5);
    g.selectAll('text.label')
      .data(topN)
      .join('text')
      .attr('class', 'label')
      .attr('transform', d => {
        const c = path.centroid(d.feature);
        return `translate(${c[0]}, ${c[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#FFF')
      .style('text-shadow', '0 0 3px rgba(0,0,0,.6)')
      .style('pointer-events', 'none')
      .text(d => d.comuna);

    // Legend
    renderLegend(scale, indicator);
  }

  function renderLegend(scale, indicator) {
    const el = document.getElementById('geomap-legend');
    const stops = scale.palette.stops;
    el.innerHTML = `
      <div style="font-weight:600; margin-bottom:.35rem; font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color:#495467;">Escala</div>
      <div style="display:flex; align-items:center; gap:.5rem;">
        <span style="font-size:.7rem; color:#6B7280;">${fmt(scale.min)}</span>
        <div style="width:140px; height:12px; border-radius:3px; background:linear-gradient(90deg, ${stops.join(', ')});"></div>
        <span style="font-size:.7rem; color:#6B7280;">${fmt(scale.max)}</span>
      </div>
      <div style="margin-top:.5rem; display:flex; align-items:center; gap:.4rem; font-size:.7rem; color:#6B7280;">
        <span style="width:14px; height:14px; background:#E5E7EB; display:inline-block; border-radius:2px; border:1px solid #D1D5DB;"></span>
        Sin datos disponibles
      </div>
    `;
  }

  // Initial render (delayed slightly to wait for tab activation)
  const ind = document.getElementById('geo-indicator');
  const pal = document.getElementById('geo-palette');

  function rerender() { render(ind.value, pal.value); }
  ind.addEventListener('change', rerender);
  pal.addEventListener('change', rerender);

  // Render when tab activates (and on resize)
  let rendered = false;
  function ensureRender() {
    if (!rendered) { rerender(); rendered = true; }
  }
  // initial since this tab is active by default
  setTimeout(ensureRender, 100);
  window.addEventListener('resize', () => { if (rendered) rerender(); });

  // SVG download
  document.getElementById('download-geomap-svg').addEventListener('click', () => {
    const serializer = new XMLSerializer();
    const svgEl = document.getElementById('geomap-svg').cloneNode(true);
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const str = '<?xml version="1.0" standalone="no"?>\n' + serializer.serializeToString(svgEl);
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapa-ohiggins-${ind.value.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  });

})();
