// ============== TAB CORRELACIONES ==============
(async function() {
  let comunas;
  try {
    comunas = await Utils.loadJSON('data/comunas.json');
  } catch (e) {
    console.error(e); return;
  }

  const VARS = [
    { key: 'Población censada', label: 'Población' },
    { key: 'Cantidad de Hombres', label: 'Hombres' },
    { key: 'Cantidad de Mujeres', label: 'Mujeres' },
    { key: 'Total de empresas', label: 'Empresas activas' },
    { key: 'Total de trabajadores dependientes', label: 'Trabajadores dependientes' },
    { key: 'Total de trabajadores a honorarios', label: 'Trabajadores a honorarios' },
    { key: 'Cantidad de avisos', label: 'Avisos BNE' },
    { key: 'Cantidad de vacantes', label: 'Vacantes BNE' },
    { key: 'Cantidad de proyectos de inversión 2025-2029', label: 'Proyectos inversión' },
    { key: 'Gasto involucrado 2025-2029 en millones de dólares', label: 'Gasto inversión (MUSD)' },
    { key: 'Empleo Peak Total (N° Personas)', label: 'Empleo peak inversión' },
    { key: '__IDLC__', label: 'IDLC' }
  ];

  const selX = document.getElementById('corr-x');
  const selY = document.getElementById('corr-y');
  const selType = document.getElementById('corr-type');
  if (!selX || !selY) return;

  VARS.forEach(v => {
    selX.appendChild(new Option(v.label, v.key));
    selY.appendChild(new Option(v.label, v.key));
  });
  selX.value = 'Población censada';
  selY.value = 'Total de empresas';

  function getVal(c, key) {
    if (key === '__IDLC__') return c.idlc?.score || 0;
    return c.indicadores[key]?.numero || 0;
  }

  // Linear regression
  function regression(points, type) {
    let pts = points.filter(p => p.x > 0 && p.y > 0);
    if (pts.length < 2) return null;
    let dataX = pts.map(p => p.x);
    let dataY = pts.map(p => p.y);

    if (type === 'power') {
      // log(y) = log(a) + b*log(x)  ->  fit lineal en log-space
      dataX = dataX.map(v => Math.log(v));
      dataY = dataY.map(v => Math.log(v));
    }

    const n = dataX.length;
    const sumX = dataX.reduce((s, v) => s + v, 0);
    const sumY = dataY.reduce((s, v) => s + v, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let num = 0, den = 0, ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      num += (dataX[i] - meanX) * (dataY[i] - meanY);
      den += (dataX[i] - meanX) ** 2;
      ssTot += (dataY[i] - meanY) ** 2;
    }
    if (den === 0) return null;
    const slope = num / den;
    const intercept = meanY - slope * meanX;

    for (let i = 0; i < n; i++) {
      const pred = slope * dataX[i] + intercept;
      ssRes += (dataY[i] - pred) ** 2;
    }
    const r2 = 1 - (ssRes / ssTot);
    const r = (num >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, r2));

    // Predict func in original space
    const predict = type === 'power'
      ? (x) => Math.exp(intercept) * Math.pow(x, slope)
      : (x) => slope * x + intercept;

    return { slope, intercept, r2, r, predict, type, n };
  }

  function strengthLabel(r) {
    const a = Math.abs(r);
    if (a < 0.2) return 'muy débil';
    if (a < 0.4) return 'débil';
    if (a < 0.6) return 'moderada';
    if (a < 0.8) return 'fuerte';
    return 'muy fuerte';
  }

  let chart = null;
  function render() {
    const xKey = selX.value, yKey = selY.value;
    const xLabel = VARS.find(v => v.key === xKey)?.label || xKey;
    const yLabel = VARS.find(v => v.key === yKey)?.label || yKey;

    const points = comunas.map(c => ({
      x: getVal(c, xKey),
      y: getVal(c, yKey),
      comuna: c.comuna
    })).filter(p => p.x > 0 && p.y > 0);

    const reg = regression(points, selType.value);

    // Title and stats
    document.getElementById('corr-title').textContent = `${yLabel} vs ${xLabel}`;
    const corrType = selType.value === 'power' ? 'log-log' : 'lineal';
    let statsHtml = `<b>${points.length}</b> comunas con datos en ambos ejes`;
    if (reg) {
      const dir = reg.r > 0 ? 'positiva' : 'negativa';
      statsHtml += ` · Correlación ${corrType} <b>${dir} ${strengthLabel(reg.r)}</b> · R² = <b>${reg.r2.toFixed(3)}</b> · r = ${reg.r.toFixed(3)}`;
    }
    document.getElementById('corr-stats').innerHTML = statsHtml;

    // Insight box
    if (reg) {
      const interp = Math.abs(reg.r) >= 0.7
        ? `La relación entre <b>${xLabel}</b> y <b>${yLabel}</b> es estadísticamente robusta (R²=${reg.r2.toFixed(2)}). Conocer una variable permite predecir razonablemente la otra.`
        : (Math.abs(reg.r) >= 0.4
          ? `Hay una relación moderada entre las variables. Otros factores no observados podrían influir.`
          : `La relación es débil — las variables se comportan de forma relativamente independiente entre comunas.`);
      document.getElementById('corr-insight').innerHTML = `
        <div style="padding:1.25rem 1.5rem; background:rgba(15,63,140,.04); border-left:4px solid var(--blue); border-radius:var(--radius-sm);">
          <strong style="color:var(--blue-dark);">💡 Interpretación:</strong> ${interp}
        </div>
      `;
    } else {
      document.getElementById('corr-insight').innerHTML = '';
    }

    // Build regression line dataset
    const sorted = [...points].sort((a, b) => a.x - b.x);
    let line = [];
    if (reg && sorted.length) {
      const minX = sorted[0].x;
      const maxX = sorted[sorted.length - 1].x;
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const x = minX + (maxX - minX) * (i / steps);
        const y = reg.predict(x);
        if (isFinite(y) && y >= 0) line.push({ x, y });
      }
    }

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById('ch-correlacion'), {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Comunas',
            data: points.map(p => ({ x: p.x, y: p.y, comuna: p.comuna })),
            backgroundColor: 'rgba(15,63,140,.7)',
            borderColor: '#0F3F8C',
            pointRadius: 7,
            pointHoverRadius: 11
          },
          ...(reg ? [{
            label: `Regresión ${corrType}`,
            data: line,
            type: 'line',
            borderColor: '#C0192B',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            tension: 0.2,
            order: -1
          }] : [])
        ]
      },
      options: {
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.label === 'Comunas') {
                  const p = ctx.raw;
                  return `${p.comuna}: ${xLabel}=${Utils.formatNumber(p.x)}, ${yLabel}=${Utils.formatNumber(p.y)}`;
                }
                return `${ctx.dataset.label}: ${Utils.formatNumber(ctx.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: xLabel }, grid: { color: '#E5E7EB' } },
          y: { title: { display: true, text: yLabel }, grid: { color: '#E5E7EB' }, beginAtZero: true }
        },
        onClick: (ev, items) => {
          if (!items.length) return;
          const item = items[0];
          const dataset = chart.data.datasets[item.datasetIndex];
          if (dataset.label !== 'Comunas') return;
          const p = dataset.data[item.index];
          const sel = document.getElementById('comuna-select');
          if (sel && p.comuna) {
            sel.value = p.comuna;
            sel.dispatchEvent(new Event('change'));
            document.querySelector('.tab[data-tab="detalle"]')?.click();
            window.scrollTo({ top: document.querySelector('#tab-detalle').offsetTop - 80, behavior: 'smooth' });
          }
        }
      }
    });
  }

  selX.addEventListener('change', render);
  selY.addEventListener('change', render);
  selType.addEventListener('change', render);

  let rendered = false;
  document.querySelector('.tab[data-tab="correlacion"]')?.addEventListener('click', () => {
    if (!rendered) { render(); rendered = true; }
  });
})();
