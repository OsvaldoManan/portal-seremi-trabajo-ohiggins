// ============== MAPA INTERACTIVO DE OFICINAS ==============
(async function() {
  let geo, coords;
  try {
    [geo, coords] = await Promise.all([
      Utils.loadJSON('data/geo/ohiggins.geojson'),
      Utils.loadJSON('data/oficinas-coords.json')
    ]);
  } catch (e) {
    console.error('Error cargando datos del mapa de oficinas:', e);
    return;
  }

  const svg = d3.select('#oficinas-map');
  const wrap = document.getElementById('oficinas-map-wrap');
  const tooltip = document.getElementById('oficinas-tooltip');
  if (!svg.node() || !wrap) return;

  const TIPO_COLOR = {
    'SEREMI': '#0F3F8C',
    'DT': '#C0192B',
    'SENCE': '#2E7D32',
    'IPS': '#F57C00',
    'OMIL': '#7B1FA2'
  };

  function render() {
    const r = wrap.getBoundingClientRect();
    const w = r.width || 800, h = 560;
    svg.attr('viewBox', `0 0 ${w} ${h}`);
    svg.selectAll('*').remove();

    const projection = d3.geoMercator().fitSize([w - 60, h - 60], geo);
    const path = d3.geoPath().projection(projection);

    const g = svg.append('g').attr('transform', 'translate(30, 30)');

    // Comunas (fondo)
    g.selectAll('path.comuna')
      .data(geo.features)
      .join('path')
      .attr('class', 'comuna')
      .attr('d', path)
      .attr('fill', '#E5EAF1')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1);

    // Labels de comunas (sutiles)
    g.selectAll('text.comuna-label')
      .data(geo.features)
      .join('text')
      .attr('class', 'comuna-label')
      .attr('transform', d => {
        const c = path.centroid(d);
        return `translate(${c[0]}, ${c[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('font-size', '7px')
      .style('fill', '#6B7280')
      .style('pointer-events', 'none')
      .style('opacity', .65)
      .text(d => d.properties.Comuna);

    // Marcadores OMIL (centroides comunales)
    const omilGroup = g.append('g').attr('class', 'omil-markers');
    Object.entries(coords.centroides_omil).forEach(([comuna, latlng]) => {
      const [lat, lng] = latlng;
      const [x, y] = projection([lng, lat]);
      omilGroup.append('circle')
        .attr('cx', x).attr('cy', y).attr('r', 5)
        .attr('fill', TIPO_COLOR.OMIL)
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .style('opacity', .85)
        .on('mouseover', function(ev) {
          d3.select(this).attr('r', 8).style('opacity', 1);
          tooltip.style.display = 'block';
          tooltip.innerHTML = `
            <div style="font-weight:700; margin-bottom:.25rem;">OMIL ${comuna}</div>
            <div style="font-size:.78rem; opacity:.85;">Ilustre Municipalidad de ${comuna}</div>
            <div style="margin-top:.4rem; font-size:.72rem; color:#FFD200;">Oficina Municipal de Información Laboral</div>
          `;
        })
        .on('mousemove', (ev) => positionTooltip(ev))
        .on('mouseout', function() {
          d3.select(this).attr('r', 5).style('opacity', .85);
          tooltip.style.display = 'none';
        });
    });

    // Marcadores oficinas verificadas
    const ofGroup = g.append('g').attr('class', 'oficina-markers');
    coords.oficinas_verificadas.forEach(o => {
      const [x, y] = projection([o.lng, o.lat]);
      const color = TIPO_COLOR[o.tipo] || '#6B7280';

      // Halo pulse
      ofGroup.append('circle')
        .attr('cx', x).attr('cy', y).attr('r', 12)
        .attr('fill', color)
        .style('opacity', .25)
        .style('animation', 'oficinaPulse 2.5s ease-in-out infinite');

      // Marcador principal
      ofGroup.append('circle')
        .attr('cx', x).attr('cy', y).attr('r', 8)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2.5)
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,.3))')
        .on('mouseover', function(ev) {
          d3.select(this).attr('r', 11);
          tooltip.style.display = 'block';
          tooltip.innerHTML = `
            <div style="display:flex; align-items:center; gap:.4rem; margin-bottom:.4rem;">
              <span style="background:${color}; padding:.15rem .5rem; border-radius:4px; font-size:.7rem; font-weight:700; letter-spacing:.04em;">${o.tipo}</span>
              <span style="color:#FFD200; font-size:.7rem;">✓ Verificado</span>
            </div>
            <div style="font-weight:700; margin-bottom:.35rem; font-size:.92rem;">${o.nombre}</div>
            <div style="font-size:.78rem; opacity:.9; line-height:1.5;">
              📍 ${o.direccion}<br>
              ☎ ${o.telefono}<br>
              🕐 ${o.horario}
            </div>
            <div style="margin-top:.5rem; font-size:.72rem; opacity:.7;">Click para llamar</div>
          `;
        })
        .on('mousemove', (ev) => positionTooltip(ev))
        .on('mouseout', function() {
          d3.select(this).attr('r', 8);
          tooltip.style.display = 'none';
        })
        .on('click', () => {
          const tel = o.telefono.replace(/[^+0-9*]/g, '');
          if (tel) window.location.href = `tel:${tel}`;
        });
    });

    // CSS animation para halo (inyectar una vez)
    if (!document.getElementById('oficina-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'oficina-pulse-style';
      style.textContent = `
        @keyframes oficinaPulse {
          0%, 100% { transform: scale(1); opacity: .25; }
          50% { transform: scale(1.5); opacity: .05; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function positionTooltip(ev) {
    const r = wrap.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;
    tooltip.style.left = (x + 15) + 'px';
    tooltip.style.top = (y - 30) + 'px';
    const tr = tooltip.getBoundingClientRect();
    if (x + 15 + tr.width > r.width) {
      tooltip.style.left = (x - tr.width - 15) + 'px';
    }
  }

  render();
  window.addEventListener('resize', render);
})();
