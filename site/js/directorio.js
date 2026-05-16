// ============== DIRECTORIO ==============
(async function() {
  let dir;
  try {
    dir = await Utils.loadJSON('data/directorio.json');
  } catch (e) {
    console.error(e); return;
  }

  // Mapeo de comuna -> provincia (33 comunas de O'Higgins)
  const PROVINCIA = {
    'Rancagua':'Cachapoal','Codegua':'Cachapoal','Coinco':'Cachapoal','Coltauco':'Cachapoal',
    'Doñihue':'Cachapoal','Graneros':'Cachapoal','Las Cabras':'Cachapoal','Machalí':'Cachapoal',
    'Malloa':'Cachapoal','Mostazal':'Cachapoal','Olivar':'Cachapoal','Peumo':'Cachapoal',
    'Pichidegua':'Cachapoal','Quinta de Tilcoco':'Cachapoal','Rengo':'Cachapoal',
    'Requínoa':'Cachapoal','San Vicente':'Cachapoal',
    'San Fernando':'Colchagua','Chépica':'Colchagua','Chimbarongo':'Colchagua',
    'Lolol':'Colchagua','Nancagua':'Colchagua','Palmilla':'Colchagua','Peralillo':'Colchagua',
    'Placilla':'Colchagua','Pumanque':'Colchagua','Santa Cruz':'Colchagua',
    'Pichilemu':'Cardenal Caro','La Estrella':'Cardenal Caro','Litueche':'Cardenal Caro',
    'Marchigüe':'Cardenal Caro','Navidad':'Cardenal Caro','Paredones':'Cardenal Caro'
  };

  const TIPO_BADGE = {
    'SEREMI': { color: '#0F3F8C', icon: '🏛️' },
    'DT':     { color: '#C0192B', icon: '⚖️' },
    'SENCE':  { color: '#2E7D32', icon: '🎓' },
    'IPS':    { color: '#F57C00', icon: '🛡️' }
  };

  // Teléfonos útiles destacados
  const tels = dir.telefonos_utiles;
  document.getElementById('kpi-telefonos').innerHTML = tels.map((t, i) => {
    const colors = ['#0F3F8C', '#C0192B', '#2E7D32', '#F57C00', '#7B1FA2'];
    return `
      <a href="tel:${t.telefono.replace(/[^+0-9*]/g,'')}" style="text-decoration:none;">
        <div class="kpi">
          <div class="kpi-icon" style="background:${colors[i % colors.length]}">📞</div>
          <div class="kpi-content">
            <span class="kpi-label">${t.servicio}</span>
            <span class="kpi-value" style="font-size:1.4rem;">${t.telefono}</span>
            <span class="kpi-foot">${t.descripcion}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  // Pobla select de comunas
  const allComunas = [...new Set([...dir.omil.map(o => o.comuna), ...dir.servicios.map(s => s.comuna)])].sort((a,b) => a.localeCompare(b,'es'));
  const selComuna = document.getElementById('dir-comuna');
  allComunas.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    selComuna.appendChild(o);
  });

  function renderOficinas() {
    const q = (document.getElementById('dir-search').value || '').toLowerCase().trim();
    const tipo = document.getElementById('dir-tipo').value;
    const comuna = document.getElementById('dir-comuna').value;

    const filtered = dir.servicios.filter(s => {
      if (tipo && s.tipo !== tipo) return false;
      if (comuna && s.comuna !== comuna) return false;
      if (q) {
        const haystack = [s.nombre, s.direccion, s.comuna, s.competencia, s.tipo].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const grid = document.getElementById('oficinas-grid');
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div style="font-size:3rem;">🔍</div>No se encontraron oficinas que coincidan con la búsqueda.</div>';
      return;
    }

    grid.innerHTML = filtered.map(s => {
      const t = TIPO_BADGE[s.tipo] || { color: '#6B7280', icon: '🏢' };
      return `
        <article class="info-card">
          <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:1rem;">
            <div class="icon-circle" style="background:${t.color}20; color:${t.color}; margin:0;">${t.icon}</div>
            <div>
              <span style="display:inline-block; background:${t.color}; color:white; padding:.15rem .55rem; border-radius:4px; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em;">${s.tipo}</span>
              ${s.verificado ? '<span style="margin-left:.4rem; color:var(--green); font-size:.75rem;">✓ Verificado</span>' : ''}
            </div>
          </div>
          <h3 style="font-size:1.05rem; margin-bottom:.6rem;">${s.nombre}</h3>
          <p style="margin:0; line-height:1.7; font-size:.92rem; color:var(--gray-700);">
            <strong>📍 Comuna:</strong> ${s.comuna}<br>
            <strong>🏠 Dirección:</strong> ${s.direccion}<br>
            <strong>☎ Teléfono:</strong> <a href="tel:${s.telefono.replace(/[^+0-9*]/g,'')}" style="color:var(--blue); font-variant-numeric:tabular-nums;">${s.telefono}</a><br>
            <strong>🕐 Horario:</strong> ${s.horario}<br>
            <strong>🌐 Competencia:</strong> ${s.competencia}
          </p>
          ${s.web ? `<div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--gray-200);"><a href="${s.web}" target="_blank" rel="noopener" style="font-size:.85rem; font-weight:600;">Ir al sitio oficial →</a></div>` : ''}
        </article>
      `;
    }).join('');
  }

  function renderOMIL() {
    const q = (document.getElementById('dir-search').value || '').toLowerCase().trim();
    const comuna = document.getElementById('dir-comuna').value;

    const filtered = dir.omil.filter(o => {
      if (comuna && o.comuna !== comuna) return false;
      if (q) {
        const haystack = [o.comuna, o.municipalidad, PROVINCIA[o.comuna] || ''].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const tbody = document.getElementById('tabla-omil');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--gray-500);">Sin resultados</td></tr>';
      return;
    }
    tbody.innerHTML = filtered.map(o => `
      <tr>
        <td><strong>${o.comuna}</strong></td>
        <td>${o.municipalidad}</td>
        <td><span class="pill ${PROVINCIA[o.comuna] === 'Cardenal Caro' ? 'red' : PROVINCIA[o.comuna] === 'Colchagua' ? 'orange' : 'green'}">${PROVINCIA[o.comuna] || '—'}</span></td>
        <td style="font-size:.85rem; color:var(--gray-600);">Intermediación laboral · Programas SENCE · Asesoría empleadores</td>
      </tr>
    `).join('');
  }

  function rerender() {
    renderOficinas();
    renderOMIL();
  }

  document.getElementById('dir-search').addEventListener('input', rerender);
  document.getElementById('dir-tipo').addEventListener('change', rerender);
  document.getElementById('dir-comuna').addEventListener('change', rerender);

  rerender();
})();
