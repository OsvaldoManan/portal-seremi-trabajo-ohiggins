// ============== COMUNAS PAGE ==============
(async function() {
  let comunas;
  try {
    comunas = await Utils.loadJSON('data/comunas.json');
  } catch (e) {
    console.error(e);
    document.getElementById('comuna-detail').innerHTML = '<div class="no-data">Error al cargar los datos.</div>';
    return;
  }

  // Orden alfabético
  comunas.sort((a, b) => a.comuna.localeCompare(b.comuna, 'es'));

  // ====== Llenar select de comunas ======
  const selectComuna = document.getElementById('comuna-select');
  comunas.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.comuna;
    opt.textContent = c.comuna;
    selectComuna.appendChild(opt);
  });
  // Rancagua por defecto si existe
  const defaultComuna = comunas.find(c => c.comuna === 'Rancagua')?.comuna || comunas[0].comuna;
  selectComuna.value = defaultComuna;

  // ====== Llenar select de indicadores ======
  const selectIndicator = document.getElementById('indicator-select');
  // Indicadores numéricos comparables (excluir los textuales)
  const NUMERIC_INDICATORS = [
    'Población censada',
    'Cantidad de Hombres',
    'Cantidad de Mujeres',
    'Cantidad de ocupados',
    'Cantidad de desocupados',
    'Población en Edad de Trabajar',
    'Fuerza de Trabajo',
    'Promedio de Ingresos Asalariados Formales',
    'Mediana de Ingresos Asalariados Dependientes',
    'Total de empresas',
    'Total de trabajadores dependientes',
    'Total de trabajadores a honorarios',
    'Cantidad de avisos',
    'Cantidad de vacantes',
    'Cantidad de proyectos de inversión 2025-2029',
    'Gasto involucrado 2025-2029 en millones de dólares',
    'Creación cantidad de empleos no calificados',
    'Creación cantidad de empleos técnicos',
    'Creación de cantidad de empleos profesionales',
    'Cantidad de empleos en la fase de operación',
    'Empleo Peak Total (N° Personas)'
  ];
  NUMERIC_INDICATORS.forEach(ind => {
    const opt = document.createElement('option');
    opt.value = ind;
    opt.textContent = ind;
    selectIndicator.appendChild(opt);
  });
  selectIndicator.value = 'Población censada';

  // ====== Cargar benchmarks nacionales (opcional, no bloquea) ======
  let benchmarks = null;
  fetch('data/benchmarks-nacionales.json').then(r => r.json()).then(d => {
    benchmarks = d.benchmarks || {};
  }).catch(() => { benchmarks = null; });

  // ====== Render ficha comunal ======
  function renderFicha(comunaName) {
    const c = comunas.find(x => x.comuna === comunaName);
    if (!c) return;
    const cont = document.getElementById('comuna-detail');
    const inds = c.indicadores;
    const indKeys = Object.keys(inds);

    // Determinar comuna meta
    const pob = inds['Población censada'];
    const h = inds['Cantidad de Hombres'];
    const m = inds['Cantidad de Mujeres'];
    const empresas = inds['Total de empresas'];
    const ocupados = inds['Cantidad de ocupados'];
    const vacantes = inds['Cantidad de vacantes'];

    cont.innerHTML = `
      <div class="comuna-header">
        <div>
          <h2>${c.comuna}</h2>
          <div class="comuna-meta">Región del Libertador General Bernardo O'Higgins · ${indKeys.length} indicadores disponibles</div>
        </div>
        <div style="text-align:right;">
          <div class="comuna-meta" style="margin-bottom:.25rem;">Población</div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--blue-dark);">${pob ? pob.valor : '—'}</div>
        </div>
      </div>

      <div class="indicators-grid">
        ${indKeys.map(key => {
          const v = inds[key];
          const isNA = !v.valor || v.valor === 'NA' || v.valor === 'N/A';
          return `
            <div class="indicator ${isNA ? 'is-na' : ''}">
              <div class="indicator-label">${key}</div>
              <div class="indicator-value">${isNA ? 'No disponible' : v.valor}</div>
              <div class="indicator-source">${v.fuente || ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 2.5rem;">
        <h3 style="margin-bottom: 1rem;">Composición laboral</h3>
        <div class="charts-grid">
          <div class="chart-card">
            <h3>Distribución por género</h3>
            <p class="chart-sub">Censo 2024</p>
            <div class="chart-wrap"><canvas id="chart-comuna-genero"></canvas></div>
          </div>
          <div class="chart-card">
            <h3>Empleo proyectado 2025-2029</h3>
            <p class="chart-sub">Cartera de inversiones (CBC)</p>
            <div class="chart-wrap"><canvas id="chart-comuna-empleos"></canvas></div>
          </div>
          <div class="chart-card">
            <h3>Mercado laboral</h3>
            <p class="chart-sub">PET, Fuerza de Trabajo y Ocupados</p>
            <div class="chart-wrap"><canvas id="chart-comuna-mercado"></canvas></div>
          </div>
        </div>
      </div>
    `;

    // Charts de la ficha
    renderComunaCharts(c);
  }

  function renderComunaCharts(c) {
    const i = c.indicadores;
    const num = (k) => (i[k] && i[k].numero != null) ? i[k].numero : 0;

    // Género
    new Chart(document.getElementById('chart-comuna-genero'), {
      type: 'doughnut',
      data: {
        labels: ['Hombres', 'Mujeres'],
        datasets: [{
          data: [num('Cantidad de Hombres'), num('Cantidad de Mujeres')],
          backgroundColor: [PALETTE.primary, PALETTE.red],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        cutout: '60%',
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
                const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Empleos por nivel
    new Chart(document.getElementById('chart-comuna-empleos'), {
      type: 'bar',
      data: {
        labels: ['No calificados', 'Técnicos', 'Profesionales', 'Operación', 'Peak total'],
        datasets: [{
          label: 'Empleos',
          data: [
            num('Creación cantidad de empleos no calificados'),
            num('Creación cantidad de empleos técnicos'),
            num('Creación de cantidad de empleos profesionales'),
            num('Cantidad de empleos en la fase de operación'),
            num('Empleo Peak Total (N° Personas)')
          ],
          backgroundColor: [PALETTE.yellow, PALETTE.primaryLight, PALETTE.primary, PALETTE.green, PALETTE.red],
          borderRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#E5E7EB' } }
        }
      }
    });

    // Mercado laboral
    new Chart(document.getElementById('chart-comuna-mercado'), {
      type: 'bar',
      data: {
        labels: ['PET', 'Fuerza Trabajo', 'Ocupados', 'Desocupados'],
        datasets: [{
          label: 'Personas',
          data: [
            num('Población en Edad de Trabajar'),
            num('Fuerza de Trabajo'),
            num('Cantidad de ocupados'),
            num('Cantidad de desocupados')
          ],
          backgroundColor: PALETTE.primary,
          borderRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#E5E7EB' } }
        }
      }
    });
  }

  selectComuna.addEventListener('change', () => renderFicha(selectComuna.value));
  renderFicha(defaultComuna);

  // ====== TAB COMPARAR ======
  let chartComparar = null;
  function renderComparar(indicador) {
    const data = comunas
      .map(c => ({
        comuna: c.comuna,
        valor: c.indicadores[indicador]?.numero || 0,
        text: c.indicadores[indicador]?.valor || 'NA'
      }))
      .filter(d => d.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    // Benchmark nacional
    const bench = benchmarks?.[indicador];
    const benchInfo = bench ? `<br><small style="color:#C0192B;">📊 Benchmark Chile: ${new Intl.NumberFormat('es-CL').format(bench.valor_chile)} · ${bench.fuente}</small>` : '';

    document.getElementById('comparar-titulo').textContent = `${indicador} por comuna`;
    document.getElementById('comparar-sub').innerHTML = `Comparativa entre ${data.length} comunas con datos disponibles${benchInfo}`;

    if (chartComparar) chartComparar.destroy();

    const benchValue = bench ? bench.valor_chile : null;
    // Anotación de línea de benchmark
    const annotations = benchValue ? {
      annotations: {
        benchmark: {
          type: 'line',
          xMin: benchValue, xMax: benchValue,
          borderColor: '#C0192B',
          borderWidth: 2,
          borderDash: [6, 4],
          label: {
            display: true,
            content: 'Chile',
            position: 'start',
            backgroundColor: '#C0192B',
            color: 'white',
            font: { size: 10, weight: 'bold' },
            padding: 4
          }
        }
      }
    } : {};

    chartComparar = new Chart(document.getElementById('chart-comparar'), {
      type: 'bar',
      data: {
        labels: data.map(d => d.comuna),
        datasets: [{
          label: indicador,
          data: data.map(d => d.valor),
          backgroundColor: data.map(d => {
            // Color según comparación con benchmark
            if (benchValue) {
              return d.valor >= benchValue ? PALETTE.green : PALETTE.primaryLight;
            }
            return PALETTE.primary;
          }),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.raw;
                let s = Utils.formatNumber(v, v < 100 ? 2 : 0);
                if (benchValue) {
                  const pct = ((v / benchValue - 1) * 100).toFixed(1);
                  const sign = pct >= 0 ? '+' : '';
                  s += ` (${sign}${pct}% vs Chile)`;
                }
                return s;
              }
            }
          },
          annotation: annotations
        },
        scales: {
          x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatNumber(v) } },
          y: { grid: { display: false } }
        }
      }
    });
  }
  selectIndicator.addEventListener('change', () => renderComparar(selectIndicator.value));

  // ====== TAB RANKING ======
  function renderRanking() {
    const num = (c, k) => c.indicadores[k]?.numero || 0;

    // Top 10 población
    const topPob = [...comunas].sort((a,b) => num(b, 'Población censada') - num(a, 'Población censada')).slice(0, 10);
    new Chart(document.getElementById('chart-rank-poblacion'), {
      type: 'bar',
      data: {
        labels: topPob.map(c => c.comuna),
        datasets: [{
          label: 'Habitantes',
          data: topPob.map(c => num(c, 'Población censada')),
          backgroundColor: PALETTE.primary,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatNumber(v) } },
          y: { grid: { display: false } }
        }
      }
    });

    // Género total
    const totalH = comunas.reduce((a, c) => a + num(c, 'Cantidad de Hombres'), 0);
    const totalM = comunas.reduce((a, c) => a + num(c, 'Cantidad de Mujeres'), 0);
    new Chart(document.getElementById('chart-genero'), {
      type: 'doughnut',
      data: {
        labels: ['Hombres', 'Mujeres'],
        datasets: [{
          data: [totalH, totalM],
          backgroundColor: [PALETTE.primary, PALETTE.red],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        cutout: '60%',
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Top empresas
    const topEmp = [...comunas].sort((a,b) => num(b, 'Total de empresas') - num(a, 'Total de empresas')).slice(0, 10);
    new Chart(document.getElementById('chart-rank-empresas'), {
      type: 'bar',
      data: {
        labels: topEmp.map(c => c.comuna),
        datasets: [{
          label: 'Empresas',
          data: topEmp.map(c => num(c, 'Total de empresas')),
          backgroundColor: PALETTE.green,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatNumber(v) } },
          y: { grid: { display: false } }
        }
      }
    });

    // Top vacantes
    const topVac = [...comunas].sort((a,b) => num(b, 'Cantidad de vacantes') - num(a, 'Cantidad de vacantes')).slice(0, 5);
    new Chart(document.getElementById('chart-rank-vacantes'), {
      type: 'pie',
      data: {
        labels: topVac.map(c => c.comuna),
        datasets: [{
          data: topVac.map(c => num(c, 'Cantidad de vacantes')),
          backgroundColor: PALETTE.categorical.slice(0, 5),
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${Utils.formatNumber(ctx.raw)}`
            }
          }
        }
      }
    });

    // Tabla resumen
    const tbody = document.getElementById('tabla-resumen');
    tbody.innerHTML = [...comunas].sort((a,b) => num(b, 'Población censada') - num(a, 'Población censada'))
      .map(c => `
        <tr>
          <td><strong>${c.comuna}</strong></td>
          <td class="num">${Utils.formatNumber(num(c, 'Población censada'))}</td>
          <td class="num">${Utils.formatNumber(num(c, 'Población en Edad de Trabajar'))}</td>
          <td class="num">${Utils.formatNumber(num(c, 'Cantidad de ocupados'))}</td>
          <td class="num">${Utils.formatNumber(num(c, 'Total de empresas'))}</td>
          <td class="num">${Utils.formatNumber(num(c, 'Cantidad de vacantes'))}</td>
          <td class="num">${Utils.formatNumber(num(c, 'Gasto involucrado 2025-2029 en millones de dólares'))}</td>
        </tr>
      `).join('');
  }

  // ====== TAB MAPA / HEATMAP ======
  function color(intensity) {
    // intensity 0..1 -> blue gradient with alpha
    const a = 0.08 + intensity * 0.85;
    return `rgba(15, 63, 140, ${a.toFixed(3)})`;
  }

  function renderHeatmap(indicator) {
    const grid = document.getElementById('heatmap-grid');
    document.getElementById('map-title').textContent = `${indicator} por comuna`;

    const data = comunas.map(c => ({
      comuna: c.comuna,
      valor: c.indicadores[indicator]?.numero || 0,
      text: c.indicadores[indicator]?.valor || 'NA'
    }));
    const max = Math.max(...data.map(d => d.valor)) || 1;
    const min = Math.min(...data.filter(d => d.valor > 0).map(d => d.valor)) || 0;
    const total = data.reduce((s, d) => s + d.valor, 0);

    document.getElementById('heat-stats').innerHTML =
      `Total regional: <strong>${Utils.formatNumber(total)}</strong> · Máximo: <strong>${Utils.formatNumber(max)}</strong>`;

    grid.innerHTML = data
      .sort((a, b) => b.valor - a.valor)
      .map(d => {
        const intensity = max > 0 ? d.valor / max : 0;
        const valor = d.valor > 0 ? Utils.formatNumber(d.valor, d.valor < 100 ? 2 : 0) : 'NA';
        return `
          <div class="heat-tile" style="--tile-color:${color(intensity)};" data-comuna="${d.comuna}" title="${d.comuna}: ${valor}">
            <span class="heat-tile-name">${d.comuna}</span>
            <span class="heat-tile-value">${valor}</span>
            <span class="heat-tile-label">${intensity > 0 ? Math.round(intensity*100) + '%' : '—'}</span>
          </div>
        `;
      }).join('');

    // Click on tile -> switch to detalle tab with that comuna
    grid.querySelectorAll('.heat-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        selectComuna.value = tile.dataset.comuna;
        renderFicha(tile.dataset.comuna);
        document.querySelector('.tab[data-tab="detalle"]').click();
        window.scrollTo({ top: document.querySelector('#tab-detalle').offsetTop - 80, behavior: 'smooth' });
      });
    });

    // Apply current search filter to the new tiles
    applyHeatmapFilter();
  }

  // ====== Search/filter (declarado ANTES de renderHeatmap para evitar TDZ) ======
  const searchInput = document.getElementById('comuna-search');
  const searchClear = document.getElementById('search-clear');

  function applyHeatmapFilter() {
    if (!searchInput) return;
    const q = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.heat-tile').forEach(t => {
      const match = !q || t.dataset.comuna.toLowerCase().includes(q);
      t.classList.toggle('hidden', !match);
    });
  }
  if (searchInput) searchInput.addEventListener('input', applyHeatmapFilter);
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      applyHeatmapFilter();
      searchInput.focus();
    });
  }

  const mapIndicatorSel = document.getElementById('map-indicator');
  if (mapIndicatorSel) {
    mapIndicatorSel.addEventListener('change', () => renderHeatmap(mapIndicatorSel.value));
    renderHeatmap(mapIndicatorSel.value);
  }

  // ====== CSV Downloads ======
  document.getElementById('download-comunas-csv').addEventListener('click', () => {
    // All indicators for all comunas
    const allKeys = new Set();
    comunas.forEach(c => Object.keys(c.indicadores).forEach(k => allKeys.add(k)));
    const headers = ['Comuna', ...allKeys];
    const rows = [headers];
    comunas.forEach(c => {
      const row = [c.comuna];
      [...allKeys].forEach(k => {
        row.push(c.indicadores[k]?.valor || '');
      });
      rows.push(row);
    });
    Utils.downloadCSV('indicadores-comunales-ohiggins.csv', rows);
  });

  // ====== TABS Switch ======
  let comparingRendered = false;
  let rankingRendered = false;
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById(`tab-${target}`).classList.add('active');

      if (target === 'comparar' && !comparingRendered) {
        renderComparar(selectIndicator.value);
        comparingRendered = true;
      }
      if (target === 'ranking' && !rankingRendered) {
        renderRanking();
        rankingRendered = true;
        // Attach ranking download once
        const dlBtn = document.getElementById('download-ranking-csv');
        if (dlBtn) {
          dlBtn.addEventListener('click', () => {
            const headers = ['Comuna','Población','PET','Ocupados','Empresas','Vacantes','Inversión 2025-29 (MUSD)'];
            const rows = [headers];
            const num = (c, k) => c.indicadores[k]?.numero || 0;
            [...comunas].sort((a,b) => num(b,'Población censada') - num(a,'Población censada')).forEach(c => {
              rows.push([
                c.comuna,
                num(c,'Población censada'),
                num(c,'Población en Edad de Trabajar'),
                num(c,'Cantidad de ocupados'),
                num(c,'Total de empresas'),
                num(c,'Cantidad de vacantes'),
                num(c,'Gasto involucrado 2025-2029 en millones de dólares')
              ]);
            });
            Utils.downloadCSV('ranking-comunas-ohiggins.csv', rows);
          });
        }
      }
    });
  });

})();
