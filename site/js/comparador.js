// ============== COMPARADOR LADO A LADO ==============
(async function() {
  let comunas;
  try {
    comunas = await Utils.loadJSON('data/comunas.json');
  } catch (e) {
    console.error(e);
    return;
  }

  comunas.sort((a, b) => a.comuna.localeCompare(b.comuna, 'es'));

  // Llena los selects A, B y C
  const selA = document.getElementById('cmp-a');
  const selB = document.getElementById('cmp-b');
  const selC = document.getElementById('cmp-c');
  if (!selA || !selB || !selC) return;

  comunas.forEach(c => {
    [selA, selB, selC].forEach(sel => {
      const o = document.createElement('option');
      o.value = c.comuna;
      o.textContent = c.comuna;
      sel.appendChild(o.cloneNode(true));
    });
  });
  // Defaults
  selA.value = 'Rancagua';
  selB.value = 'San Fernando';
  // selC: empty default

  // Indicadores numéricos comparables
  const KEY_GROUPS = [
    { titulo: '👥 Demografía', items: [
      'Población censada',
      'Cantidad de Hombres',
      'Cantidad de Mujeres',
      '% personas de 65 años o más',
    ]},
    { titulo: '💼 Mercado laboral', items: [
      'Población en Edad de Trabajar',
      'Fuerza de Trabajo',
      'Cantidad de ocupados',
      'Cantidad de desocupados',
      'Tasa de ocupación',
      'Tasa de desocupación',
    ]},
    { titulo: '💰 Ingresos', items: [
      'Promedio de Ingresos Asalariados Formales',
      'Mediana de Ingresos Asalariados Dependientes',
      '% Ocupados Formales',
      '% Asalariados formales que ganan el mínimo',
    ]},
    { titulo: '🏢 Empresas y empleo', items: [
      'Total de empresas',
      'Total de trabajadores dependientes',
      'Total de trabajadores a honorarios',
    ]},
    { titulo: '📋 Bolsa de empleo', items: [
      'Cantidad de avisos',
      'Cantidad de vacantes',
    ]},
    { titulo: '🏗️ Inversión 2025-2029', items: [
      'Cantidad de proyectos de inversión 2025-2029',
      'Gasto involucrado 2025-2029 en millones de dólares',
      'Creación cantidad de empleos no calificados',
      'Creación cantidad de empleos técnicos',
      'Creación de cantidad de empleos profesionales',
      'Cantidad de empleos en la fase de operación',
      'Empleo Peak Total (N° Personas)',
    ]},
  ];

  const COLORS = ['#0F3F8C', '#C0192B', '#F57C00']; // A, B, C

  function getValue(c, k) {
    const ind = c.indicadores[k];
    if (!ind) return { raw: 0, text: 'NA', has: false };
    return {
      raw: ind.numero || 0,
      text: ind.valor || 'NA',
      has: ind.valor && ind.valor !== 'NA' && ind.valor !== 'N/A'
    };
  }

  function render() {
    const A = comunas.find(c => c.comuna === selA.value);
    const B = comunas.find(c => c.comuna === selB.value);
    const C = selC.value ? comunas.find(c => c.comuna === selC.value) : null;
    if (!A || !B) return;

    const entries = C ? [A, B, C] : [A, B];
    const grid = document.getElementById('lado-a-lado-grid');

    // Header con nombres y "ganador" por categoría
    let html = `
      <div style="display:grid; grid-template-columns: 1.5fr repeat(${entries.length}, 1fr) 1.3fr; gap:.6rem; padding:1rem; background:var(--gray-100); border-radius:var(--radius-sm); font-weight:600; font-size:.85rem; text-transform:uppercase; letter-spacing:.04em; color:var(--gray-700); margin-bottom:.5rem;">
        <div>Indicador</div>
        ${entries.map((c, i) => `<div style="text-align:center; color:${COLORS[i]};">
          <span style="display:inline-block; width:10px; height:10px; background:${COLORS[i]}; border-radius:50%; vertical-align:middle; margin-right:.35rem;"></span>${c.comuna}
        </div>`).join('')}
        <div style="text-align:right;">Visualización</div>
      </div>
    `;

    KEY_GROUPS.forEach(grp => {
      html += `<div style="font-weight:700; padding:1rem .5rem .5rem; color:var(--blue-dark); margin-top:.5rem; border-bottom:2px solid var(--gray-200);">${grp.titulo}</div>`;
      grp.items.forEach(key => {
        const vals = entries.map(c => getValue(c, key));
        const max = Math.max(...vals.map(v => v.raw));
        // Determinar el líder
        const leaderIdx = vals.findIndex(v => v.raw === max && v.has);

        html += `
          <div style="display:grid; grid-template-columns: 1.5fr repeat(${entries.length}, 1fr) 1.3fr; gap:.6rem; padding:.7rem .5rem; align-items:center; font-size:.9rem; border-bottom:1px solid var(--gray-200);">
            <div style="font-weight:500; color:var(--gray-800);">${key}</div>
            ${vals.map((v, i) => `
              <div style="text-align:center; font-variant-numeric: tabular-nums; ${i === leaderIdx && v.has ? 'font-weight:700; color:' + COLORS[i] + ';' : 'color:' + (v.has ? 'var(--gray-700)' : 'var(--gray-400)') + ';'}">
                ${v.has ? v.text : '—'}
                ${i === leaderIdx && v.has && entries.length > 1 ? '<span style="margin-left:.25rem;">★</span>' : ''}
              </div>
            `).join('')}
            <div style="display:flex; flex-direction:column; gap:3px; align-items:flex-end;">
              ${vals.map((v, i) => {
                const pct = max > 0 && v.has ? (v.raw / max) * 100 : 0;
                return `
                  <div style="display:flex; align-items:center; gap:.4rem; width:100%;">
                    <div style="flex:1; height:8px; background:var(--gray-200); border-radius:2px; overflow:hidden;">
                      <div style="height:100%; background:${COLORS[i]}; width:${pct}%; transition:width .3s;"></div>
                    </div>
                    <span style="font-size:.7rem; color:var(--gray-600); min-width:38px; text-align:right;">${pct.toFixed(0)}%</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });
    });

    html += `
      <div style="margin-top:1.5rem; padding:1rem 1.25rem; background:rgba(15,63,140,.05); border-left:4px solid var(--blue); border-radius:var(--radius-sm); font-size:.85rem; color:var(--gray-700);">
        <strong>★</strong> indica el valor más alto entre las comunas comparadas. La barra muestra el porcentaje relativo (100% = el mayor de la fila).
      </div>
    `;

    grid.innerHTML = html;
  }

  selA.addEventListener('change', render);
  selB.addEventListener('change', render);
  selC.addEventListener('change', render);

  // Render cuando se active el tab
  let rendered = false;
  document.querySelectorAll('.tab[data-tab="lado-a-lado"]').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!rendered) { render(); rendered = true; }
    });
  });

})();
