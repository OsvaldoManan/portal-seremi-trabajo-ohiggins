// ============== TAB ÍNDICE IDLC ==============
(async function() {
  let comunas;
  try {
    comunas = await Utils.loadJSON('data/comunas.json');
  } catch (e) {
    console.error(e); return;
  }

  const PROVINCIA = {
    'Rancagua':'Cachapoal','Codegua':'Cachapoal','Coinco':'Cachapoal','Coltauco':'Cachapoal',
    'Doñihue':'Cachapoal','Graneros':'Cachapoal','Las Cabras':'Cachapoal','Machalí':'Cachapoal',
    'Malloa':'Cachapoal','Mostazal':'Cachapoal','Olivar':'Cachapoal','Pichidegua':'Cachapoal',
    'Quinta de Tilcoco':'Cachapoal','Rengo':'Cachapoal','Requínoa':'Cachapoal','San Vicente':'Cachapoal',
    'San Fernando':'Colchagua','Chépica':'Colchagua','Chimbarongo':'Colchagua',
    'Lolol':'Colchagua','Nancagua':'Colchagua','Palmilla':'Colchagua','Peralillo':'Colchagua',
    'Placilla':'Colchagua','Pumanque':'Colchagua','Santa Cruz':'Colchagua',
    'Pichilemu':'Cardenal Caro','La Estrella':'Cardenal Caro',
    'Marchigüe':'Cardenal Caro','Navidad':'Cardenal Caro','Paredones':'Cardenal Caro'
  };

  let rendered = false;
  function render() {
    if (rendered) return;
    rendered = true;

    // Validate IDLC exists
    if (!comunas[0]?.idlc) {
      document.getElementById('tabla-idlc').innerHTML = '<tr><td colspan="9">IDLC no disponible. Reprocesa datos con process_data.py.</td></tr>';
      return;
    }

    const sorted = [...comunas].sort((a, b) => b.idlc.score - a.idlc.score);
    const top = sorted[0];
    const bot = sorted[sorted.length - 1];
    const avg = sorted.reduce((s, c) => s + c.idlc.score, 0) / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)].idlc.score;

    // KPIs
    document.getElementById('idlc-kpis').innerHTML = `
      <div class="kpi"><div class="kpi-icon" style="background:#2E7D32">🏆</div>
        <div class="kpi-content"><span class="kpi-label">Comuna líder</span>
          <span class="kpi-value">${top.comuna}</span>
          <span class="kpi-foot">IDLC ${top.idlc.score}</span></div></div>
      <div class="kpi"><div class="kpi-icon" style="background:#0F3F8C">📊</div>
        <div class="kpi-content"><span class="kpi-label">IDLC promedio regional</span>
          <span class="kpi-value">${avg.toFixed(1)}</span>
          <span class="kpi-foot">Mediana: ${median.toFixed(1)}</span></div></div>
      <div class="kpi"><div class="kpi-icon" style="background:#C0192B">📉</div>
        <div class="kpi-content"><span class="kpi-label">Brecha máx/min</span>
          <span class="kpi-value">${(top.idlc.score / Math.max(1, bot.idlc.score)).toFixed(1)}x</span>
          <span class="kpi-foot">${top.comuna} vs ${bot.comuna}</span></div></div>
      <div class="kpi"><div class="kpi-icon" style="background:#F57C00">🎯</div>
        <div class="kpi-content"><span class="kpi-label">Bajo promedio</span>
          <span class="kpi-value">${sorted.filter(c => c.idlc.score < avg).length}</span>
          <span class="kpi-foot">comunas necesitan refuerzo</span></div></div>
    `;

    // Color por tertiles
    const sorted_scores = sorted.map(c => c.idlc.score);
    const t1 = sorted_scores[Math.floor(sorted_scores.length / 3)];
    const t2 = sorted_scores[Math.floor(sorted_scores.length * 2 / 3)];
    function colorByScore(s) {
      if (s >= t1) return '#2E7D32';      // Top tercio
      if (s >= t2) return '#F57C00';      // Medio
      return '#C0192B';                    // Bottom
    }

    // Ranking chart
    new Chart(document.getElementById('ch-idlc-ranking'), {
      type: 'bar',
      data: {
        labels: sorted.map(c => `${c.idlc.rank}. ${c.comuna}`),
        datasets: [{
          label: 'IDLC',
          data: sorted.map(c => c.idlc.score),
          backgroundColor: sorted.map(c => colorByScore(c.idlc.score)),
          borderRadius: 3,
          barThickness: 'flex',
          maxBarThickness: 20
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const c = sorted[ctx.dataIndex];
                const compStrs = Object.entries(c.idlc.componentes).map(([k,v]) => `  ${k}: ${v.toFixed(1)}`).join('\n');
                return [`IDLC: ${ctx.raw}`, '', 'Componentes:', compStrs];
              }
            }
          }
        },
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: '#E5E7EB' } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });

    // IDLC por provincia
    const byProv = {};
    comunas.forEach(c => {
      const p = PROVINCIA[c.comuna] || 'Otros';
      if (!byProv[p]) byProv[p] = [];
      byProv[p].push(c.idlc.score);
    });
    const provLabels = Object.keys(byProv);
    const provAvgs = provLabels.map(p => byProv[p].reduce((s,x) => s+x, 0) / byProv[p].length);

    new Chart(document.getElementById('ch-idlc-provincia'), {
      type: 'bar',
      data: {
        labels: provLabels,
        datasets: [{
          label: 'IDLC promedio',
          data: provAvgs,
          backgroundColor: ['#0F3F8C', '#F57C00', '#C0192B'],
          borderRadius: 6
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `IDLC promedio: ${ctx.raw.toFixed(1)} (${byProv[provLabels[ctx.dataIndex]].length} comunas)`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, max: 100, grid: { color: '#E5E7EB' } }
        }
      }
    });

    // Tabla
    document.getElementById('tabla-idlc').innerHTML = sorted.map(c => {
      const co = c.idlc.componentes;
      const score = c.idlc.score;
      const pill = score >= t1 ? 'green' : (score >= t2 ? 'orange' : 'red');
      return `
        <tr>
          <td><strong>${c.idlc.rank}</strong></td>
          <td><strong>${c.comuna}</strong> <span style="color:var(--gray-500); font-size:.8rem;">(${PROVINCIA[c.comuna] || '—'})</span></td>
          <td class="num"><span class="pill ${pill}" style="font-size:.95rem; font-weight:700;">${score.toFixed(1)}</span></td>
          <td class="num">${co['Densidad empresarial'].toFixed(1)}</td>
          <td class="num">${co['Formalización laboral'].toFixed(1)}</td>
          <td class="num">${co['Equilibrio honorarios'].toFixed(1)}</td>
          <td class="num">${co['Dinamismo BNE'].toFixed(1)}</td>
          <td class="num">${co['Inversión per cápita'].toFixed(1)}</td>
          <td class="num">${co['Empleo proyectado'].toFixed(1)}</td>
        </tr>
      `;
    }).join('');

    // CSV download
    document.getElementById('dl-idlc')?.addEventListener('click', () => {
      const headers = ['Ranking','Comuna','Provincia','IDLC','Densidad Empresarial','Formalización','Eq. Honorarios','Dinamismo BNE','Inv. Per Cápita','Empleo Proyectado'];
      const rows = [headers];
      sorted.forEach(c => {
        const co = c.idlc.componentes;
        rows.push([c.idlc.rank, c.comuna, PROVINCIA[c.comuna] || '',
          c.idlc.score, co['Densidad empresarial'], co['Formalización laboral'],
          co['Equilibrio honorarios'], co['Dinamismo BNE'], co['Inversión per cápita'], co['Empleo proyectado']]);
      });
      Utils.downloadCSV('idlc-comunas-ohiggins.csv', rows);
    });
  }

  document.querySelector('.tab[data-tab="idlc"]')?.addEventListener('click', render);
  // Render also if user lands directly via URL hash
  if (location.hash === '#tab-idlc') setTimeout(render, 100);
})();
