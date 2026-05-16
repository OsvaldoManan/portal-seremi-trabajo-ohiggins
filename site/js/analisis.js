// ============== ANALISIS PAGE ==============
(async function() {
  let comunas, hist, inv26;
  try {
    [comunas, hist, inv26] = await Promise.all([
      Utils.loadJSON('data/comunas.json'),
      Utils.loadJSON('data/inversion_historica.json'),
      Utils.loadJSON('data/inversion_2026.json')
    ]);
  } catch (e) {
    console.error(e); return;
  }

  // ============== CONCENTRACION DEMOGRAFICA Y EMPRESARIAL ==============
  // Curva de Pareto: % acumulado de población y empresas
  const num = (c, k) => c.indicadores[k]?.numero || 0;
  const sortedByPob = [...comunas].sort((a,b) => num(b,'Población censada') - num(a,'Población censada'));
  const totalPob = sortedByPob.reduce((s,c) => s + num(c,'Población censada'), 0);
  const totalEmp = sortedByPob.reduce((s,c) => s + num(c,'Total de empresas'), 0);

  let accPob = 0, accEmp = 0;
  const labels = [], pctPob = [], pctEmp = [];
  sortedByPob.forEach(c => {
    accPob += num(c,'Población censada');
    accEmp += num(c,'Total de empresas');
    labels.push(c.comuna);
    pctPob.push(+(accPob / totalPob * 100).toFixed(1));
    pctEmp.push(+(accEmp / totalEmp * 100).toFixed(1));
  });

  new Chart(document.getElementById('ch-concentracion'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '% Población acumulada',
          data: pctPob,
          borderColor: PALETTE.primary,
          backgroundColor: 'rgba(15,63,140,.12)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2.5
        },
        {
          label: '% Empresas acumuladas',
          data: pctEmp,
          borderColor: PALETTE.yellow,
          backgroundColor: 'rgba(255,210,0,.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2.5
        }
      ]
    },
    options: {
      plugins: {
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}%` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { autoSkip: true, maxRotation: 60, minRotation: 45 } },
        y: { beginAtZero: true, max: 100, grid: { color: '#E5E7EB' }, ticks: { callback: v => v + '%' } }
      }
    }
  });

  // ============== MADUREZ DEL PORTAFOLIO ==============
  const ETAPA_LABELS = {
    'Perfil': 'Perfil',
    'Ejecución': 'En ejecución',
    'Diseño': 'Diseño',
    'Prefactibilidad': 'Prefactibilidad',
    'Terminado': 'Terminado',
    'Operación': 'Operación',
    'Factibilidad': 'Factibilidad'
  };
  const ETAPA_COLORS = {
    'Perfil': '#F57C00',
    'Ejecución': '#0F3F8C',
    'Diseño': '#1E5BB8',
    'Prefactibilidad': '#6B7280',
    'Terminado': '#2E7D32',
    'Operación': '#7B1FA2',
    'Factibilidad': '#9CA3AF'
  };
  new Chart(document.getElementById('ch-madurez'), {
    type: 'doughnut',
    data: {
      labels: hist.por_etapa.map(e => ETAPA_LABELS[e.etapa_actual] || e.etapa_actual),
      datasets: [{
        data: hist.por_etapa.map(e => e.cantidad),
        backgroundColor: hist.por_etapa.map(e => ETAPA_COLORS[e.etapa_actual] || PALETTE.gray),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '60%',
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // ============== COMPOSICION LABORAL 2026 ==============
  const sec26 = [...inv26.por_sector].sort((a,b) => (b.profesionales+b.tecnicos+b.nc) - (a.profesionales+a.tecnicos+a.nc));
  new Chart(document.getElementById('ch-laboral26'), {
    type: 'bar',
    data: {
      labels: sec26.map(s => s.sector_economico),
      datasets: [
        { label: 'Profesionales', data: sec26.map(s => s.profesionales), backgroundColor: PALETTE.primary },
        { label: 'Técnicos', data: sec26.map(s => s.tecnicos), backgroundColor: PALETTE.primaryLight },
        { label: 'No calificados', data: sec26.map(s => s.nc), backgroundColor: PALETTE.yellow },
        { label: 'Operación', data: sec26.map(s => s.empleo_op), backgroundColor: PALETTE.red }
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

  // ============== RATE TECNICO ==============
  const RATE_COLORS = {
    'RS': PALETTE.green, 'OT': PALETTE.red, 'FI': PALETTE.orange,
    'AD': PALETTE.primary, 'RA': PALETTE.primaryLight
  };
  const top5Rate = hist.por_rate.slice(0, 5);
  const total_rate = hist.por_rate.reduce((s,r) => s + r.cantidad, 0);
  new Chart(document.getElementById('ch-rate-pct'), {
    type: 'doughnut',
    data: {
      labels: top5Rate.map(r => `${r.rate} (${(r.cantidad/total_rate*100).toFixed(1)}%)`),
      datasets: [{
        data: top5Rate.map(r => r.cantidad),
        backgroundColor: top5Rate.map(r => RATE_COLORS[r.rate] || PALETTE.gray),
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
              const r = top5Rate[ctx.dataIndex];
              return `${r.descripcion}: ${Utils.formatNumber(ctx.raw)}`;
            }
          }
        }
      }
    }
  });

})();
