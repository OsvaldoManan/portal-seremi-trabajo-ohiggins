// ============== PROYECCIÓN DEMANDA LABORAL ==============
(async function() {
  let inv26, comunas;
  try {
    [inv26, comunas] = await Promise.all([
      Utils.loadJSON('data/inversion_2026.json'),
      Utils.loadJSON('data/comunas.json')
    ]);
  } catch (e) {
    console.error(e); return;
  }

  // Oferta SENCE de referencia anual por sector (estimación basada en programas conocidos)
  // Fuentes: catálogo SENCE Despega MIPE (~2.000 nac), Talento Digital (~25 reg), Mujer Digital (~500 reg),
  // Becas Laborales (~1.000 reg), Consejo Regional (696 cupos)
  // Total estimado regional: ~4.000 cupos/año (alineable a la cartera)
  const OFERTA_POR_SECTOR = {
    'Minería': 600,           // operación, mantención, seguridad
    'Energía': 400,           // ER, eléctricos, instalación
    'Obras Públicas': 800,    // construcción, oficios especializados
    'Inmobiliario': 700,      // construcción residencial
    'Industrial': 350,        // procesos industriales
  };

  const r = inv26.resumen;

  // KPIs
  const totalDemanda = r.empleo_construccion_total + r.empleo_operacion_total;
  const totalOferta = Object.values(OFERTA_POR_SECTOR).reduce((s, v) => s + v, 0);

  document.getElementById('proy-kpis').innerHTML = `
    <div class="kpi"><div class="kpi-icon" style="background:#0F3F8C">👷</div>
      <div class="kpi-content"><span class="kpi-label">Demanda total proyectada</span>
        <span class="kpi-value">${Utils.formatNumber(totalDemanda)}</span>
        <span class="kpi-foot">Cartera CBC 2026 + operación</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#2E7D32">🎓</div>
      <div class="kpi-content"><span class="kpi-label">Oferta SENCE estimada</span>
        <span class="kpi-value">${Utils.formatNumber(totalOferta)}</span>
        <span class="kpi-foot">Cupos anuales referenciales</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#C0192B">📉</div>
      <div class="kpi-content"><span class="kpi-label">Gap formativo</span>
        <span class="kpi-value">${Utils.formatNumber(Math.max(0, totalDemanda - totalOferta))}</span>
        <span class="kpi-foot">Trabajadores sin cobertura</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#F57C00">⚙️</div>
      <div class="kpi-content"><span class="kpi-label">% Técnicos + No calif.</span>
        <span class="kpi-value">81%</span>
        <span class="kpi-foot">De la demanda construcción</span></div></div>
  `;

  // Demanda por sector
  const secData = [...inv26.por_sector].map(s => ({
    sector: s.sector_economico,
    prof: s.profesionales || 0,
    tec: s.tecnicos || 0,
    nc: s.nc || 0,
    op: s.empleo_op || 0,
    total: (s.profesionales||0) + (s.tecnicos||0) + (s.nc||0) + (s.empleo_op||0)
  })).sort((a,b) => b.total - a.total);

  new Chart(document.getElementById('ch-demanda-sector'), {
    type: 'bar',
    data: {
      labels: secData.map(s => s.sector),
      datasets: [
        { label: 'Profesionales', data: secData.map(s => s.prof), backgroundColor: '#0F3F8C' },
        { label: 'Técnicos', data: secData.map(s => s.tec), backgroundColor: '#1E5BB8' },
        { label: 'No calificados', data: secData.map(s => s.nc), backgroundColor: '#FFD200' },
        { label: 'Operación', data: secData.map(s => s.op), backgroundColor: '#C0192B' }
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: { label: ctx => `${ctx.dataset.label}: ${Utils.formatNumber(ctx.raw, 0)}` }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, grid: { color: '#E5E7EB' } }
      }
    }
  });

  // Composición
  new Chart(document.getElementById('ch-demanda-comp'), {
    type: 'doughnut',
    data: {
      labels: ['Profesionales', 'Técnicos', 'No calificados', 'Operación'],
      datasets: [{
        data: [r.profesionales_total, r.tecnicos_total, r.nc_total, r.empleo_operacion_total],
        backgroundColor: ['#0F3F8C', '#1E5BB8', '#FFD200', '#C0192B'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '55%',
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((s,v) => s+v, 0);
              return `${ctx.label}: ${Utils.formatNumber(ctx.raw, 0)} (${(ctx.raw/total*100).toFixed(1)}%)`;
            }
          }
        }
      }
    }
  });

  // Gap por sector
  const gapData = secData.map(s => ({
    sector: s.sector,
    demanda: s.total,
    oferta: OFERTA_POR_SECTOR[s.sector] || 0,
    gap: s.total - (OFERTA_POR_SECTOR[s.sector] || 0)
  }));

  new Chart(document.getElementById('ch-gap'), {
    type: 'bar',
    data: {
      labels: gapData.map(g => g.sector),
      datasets: [
        { label: 'Demanda laboral', data: gapData.map(g => g.demanda), backgroundColor: '#0F3F8C', borderRadius: 4 },
        { label: 'Oferta SENCE est.', data: gapData.map(g => g.oferta), backgroundColor: '#2E7D32', borderRadius: 4 }
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${Utils.formatNumber(ctx.raw, 0)}`,
            afterBody: items => {
              const i = items[0].dataIndex;
              const g = gapData[i];
              return [`Gap: ${Utils.formatNumber(g.gap, 0)}`, `Cobertura: ${(g.oferta/g.demanda*100 || 0).toFixed(1)}%`];
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#E5E7EB' } }
      }
    }
  });

  // Cobertura
  new Chart(document.getElementById('ch-cobertura'), {
    type: 'bar',
    data: {
      labels: gapData.map(g => g.sector),
      datasets: [{
        label: '% Cobertura',
        data: gapData.map(g => g.demanda > 0 ? Math.min(100, (g.oferta / g.demanda * 100)) : 0),
        backgroundColor: gapData.map(g => {
          const pct = g.demanda > 0 ? (g.oferta / g.demanda * 100) : 0;
          if (pct >= 70) return '#2E7D32';
          if (pct >= 40) return '#F57C00';
          return '#C0192B';
        }),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw.toFixed(1)}% cubierto` } }
      },
      scales: {
        x: { beginAtZero: true, max: 100, grid: { color: '#E5E7EB' }, ticks: { callback: v => v + '%' } },
        y: { grid: { display: false } }
      }
    }
  });

  // Gaps grid
  const sortedGap = [...gapData].sort((a,b) => b.gap - a.gap);
  document.getElementById('gaps-grid').innerHTML = sortedGap.slice(0, 3).map((g, i) => {
    const pct = g.demanda > 0 ? (g.oferta/g.demanda*100) : 0;
    const colors = ['#C0192B', '#F57C00', '#FFD200'];
    return `
      <article class="pillar">
        <div class="pillar-num" style="color:${colors[i]};">${i+1}</div>
        <h3>${g.sector}</h3>
        <p><strong>Demanda:</strong> ${Utils.formatNumber(g.demanda, 0)} empleos<br>
        <strong>Oferta SENCE est.:</strong> ${Utils.formatNumber(g.oferta, 0)}<br>
        <strong>Gap:</strong> ${Utils.formatNumber(g.gap, 0)} (cobertura ${pct.toFixed(1)}%)</p>
      </article>
    `;
  }).join('');

  // Tabla
  document.getElementById('tabla-proyeccion').innerHTML = gapData.map(g => {
    const pct = g.demanda > 0 ? (g.oferta/g.demanda*100) : 0;
    let prio, pill;
    if (pct < 40) { prio = 'Alta'; pill = 'red'; }
    else if (pct < 70) { prio = 'Media'; pill = 'orange'; }
    else { prio = 'Baja'; pill = 'green'; }
    const s = secData.find(x => x.sector === g.sector);
    return `
      <tr>
        <td><strong>${g.sector}</strong></td>
        <td class="num">${Utils.formatNumber(s.prof,0)}</td>
        <td class="num">${Utils.formatNumber(s.tec,0)}</td>
        <td class="num">${Utils.formatNumber(s.nc,0)}</td>
        <td class="num">${Utils.formatNumber(s.op,0)}</td>
        <td class="num"><strong>${Utils.formatNumber(g.demanda,0)}</strong></td>
        <td class="num">${Utils.formatNumber(g.oferta,0)}</td>
        <td class="num"><strong style="color:${g.gap>0?'#C0192B':'#2E7D32'};">${g.gap>0?'+':''}${Utils.formatNumber(g.gap,0)}</strong></td>
        <td><span class="pill ${pill}">${prio}</span></td>
      </tr>
    `;
  }).join('');

  // CSV
  document.getElementById('dl-proyeccion')?.addEventListener('click', () => {
    const headers = ['Sector','Profesionales','Técnicos','No calificados','Operación','Demanda total','Oferta SENCE est.','Gap','Cobertura %'];
    const rows = [headers];
    gapData.forEach(g => {
      const s = secData.find(x => x.sector === g.sector);
      rows.push([g.sector, s.prof, s.tec, s.nc, s.op, g.demanda, g.oferta, g.gap,
        g.demanda > 0 ? (g.oferta/g.demanda*100).toFixed(1) : '0']);
    });
    Utils.downloadCSV('proyeccion-demanda-laboral-ohiggins.csv', rows);
  });

})();
