// ============== SERIE HISTÓRICA SALARIO MÍNIMO ==============
(async function() {
  if (!document.getElementById('ch-sm-historico')) return;

  let data;
  try {
    data = await Utils.loadJSON('data/salario-minimo.json');
  } catch (e) {
    console.error(e); return;
  }

  const serie = data.serie;
  const ipc = data.ipc;
  const fmt = (n) => '$' + new Intl.NumberFormat('es-CL').format(n);

  // Calcular variaciones
  const variaciones = serie.map((s, i) => {
    if (i === 0) return { anio: s.anio, varSM: 0, varIPC: ipc[s.anio] || 0 };
    const prev = serie[i-1].valor;
    const varSM = ((s.valor - prev) / prev) * 100;
    return { anio: s.anio, varSM: Number(varSM.toFixed(2)), varIPC: ipc[s.anio] || 0 };
  });

  // ====== Gráfico serie histórica ======
  new Chart(document.getElementById('ch-sm-historico'), {
    type: 'line',
    data: {
      labels: serie.map(s => s.anio),
      datasets: [{
        label: 'Salario Mínimo (CLP)',
        data: serie.map(s => s.valor),
        borderColor: PALETTE.primary,
        backgroundColor: 'rgba(15,63,140,.12)',
        fill: true,
        tension: 0.25,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: PALETTE.yellow,
        pointBorderColor: PALETTE.primary,
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const s = serie[ctx.dataIndex];
              const prev = ctx.dataIndex > 0 ? serie[ctx.dataIndex - 1].valor : null;
              const pct = prev ? ` (+${(((s.valor - prev) / prev) * 100).toFixed(1)}%)` : '';
              return [`${fmt(s.valor)}${pct}`, s.ley];
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: '#E5E7EB' },
          ticks: { callback: v => '$' + Math.round(v/1000) + 'K' }
        }
      }
    }
  });

  // ====== Gráfico variaciones ======
  new Chart(document.getElementById('ch-sm-variacion'), {
    type: 'bar',
    data: {
      labels: variaciones.filter(v => v.varSM > 0).map(v => v.anio),
      datasets: [
        {
          label: '% Reajuste IMM',
          data: variaciones.filter(v => v.varSM > 0).map(v => v.varSM),
          backgroundColor: PALETTE.primary,
          borderRadius: 4
        },
        {
          label: '% IPC anual',
          data: variaciones.filter(v => v.varSM > 0).map(v => v.varIPC),
          backgroundColor: PALETTE.yellow,
          borderRadius: 4
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}%` }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#E5E7EB' }, ticks: { callback: v => v + '%' } }
      }
    }
  });

  // ====== KPIs ======
  const inicio = serie[0];
  const fin = serie[serie.length - 1];
  const crecimientoTotal = ((fin.valor - inicio.valor) / inicio.valor) * 100;
  const variacionMaxima = variaciones.filter(v => v.varSM > 0).sort((a,b) => b.varSM - a.varSM)[0];
  const anios = serie.length - 1;
  const crecAnualProm = (Math.pow(fin.valor / inicio.valor, 1/anios) - 1) * 100;

  document.getElementById('sm-kpis').innerHTML = `
    <div class="kpi" style="background:rgba(255,255,255,.97);"><div class="kpi-icon" style="background:#0F3F8C">📅</div>
      <div class="kpi-content"><span class="kpi-label">Período</span>
        <span class="kpi-value" style="font-size:1.4rem;">${inicio.anio}–${fin.anio}</span>
        <span class="kpi-foot">${anios} años de evolución</span></div></div>
    <div class="kpi" style="background:rgba(255,255,255,.97);"><div class="kpi-icon" style="background:#2E7D32">📈</div>
      <div class="kpi-content"><span class="kpi-label">Crecimiento total</span>
        <span class="kpi-value">+${crecimientoTotal.toFixed(0)}%</span>
        <span class="kpi-foot">${fmt(inicio.valor)} → ${fmt(fin.valor)}</span></div></div>
    <div class="kpi" style="background:rgba(255,255,255,.97);"><div class="kpi-icon" style="background:#F57C00">📊</div>
      <div class="kpi-content"><span class="kpi-label">Reajuste anual prom.</span>
        <span class="kpi-value">${crecAnualProm.toFixed(1)}%</span>
        <span class="kpi-foot">Tasa geométrica</span></div></div>
    <div class="kpi" style="background:rgba(255,255,255,.97);"><div class="kpi-icon" style="background:#C0192B">🚀</div>
      <div class="kpi-content"><span class="kpi-label">Mayor reajuste</span>
        <span class="kpi-value">+${variacionMaxima.varSM}%</span>
        <span class="kpi-foot">Año ${variacionMaxima.anio}</span></div></div>
  `;
})();
