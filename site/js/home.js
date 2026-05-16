// ============== HOME PAGE ==============
(async function() {
  let comunas, historico, inv2026;
  try {
    [comunas, historico, inv2026] = await Promise.all([
      Utils.loadJSON('data/comunas.json'),
      Utils.loadJSON('data/inversion_historica.json'),
      Utils.loadJSON('data/inversion_2026.json')
    ]);
  } catch (e) {
    console.error('Error cargando datos', e);
    return;
  }

  // ============== KPIs agregados ==============
  const sumIndicator = (key) => {
    return comunas.reduce((acc, c) => {
      const ind = c.indicadores[key];
      return acc + (ind && ind.numero ? ind.numero : 0);
    }, 0);
  };

  const poblacion = sumIndicator('Población censada');
  const ocupados = sumIndicator('Cantidad de ocupados');
  const empresas = sumIndicator('Total de empresas');
  const vacantes = sumIndicator('Cantidad de vacantes');

  document.getElementById('kpi-poblacion').textContent = Utils.formatNumber(poblacion);
  document.getElementById('kpi-ocupados').textContent = Utils.formatNumber(ocupados);
  document.getElementById('kpi-empresas').textContent = Utils.formatNumber(empresas);
  document.getElementById('kpi-vacantes').textContent = Utils.formatNumber(vacantes);

  // ============== CHART: Sectores históricos ==============
  const topSectores = historico.por_sector.slice(0, 10);
  new Chart(document.getElementById('chart-sectores'), {
    type: 'bar',
    data: {
      labels: topSectores.map(s => s.sector),
      datasets: [{
        label: 'Cantidad de proyectos',
        data: topSectores.map(s => s.cantidad),
        backgroundColor: PALETTE.primary,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 28
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${Utils.formatNumber(ctx.raw)} proyectos`
          }
        }
      },
      scales: {
        x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatNumber(v) } },
        y: { grid: { display: false } }
      }
    }
  });

  // ============== CHART: Tipología (donut) ==============
  new Chart(document.getElementById('chart-tipologia'), {
    type: 'doughnut',
    data: {
      labels: historico.por_tipologia.map(t => t.tipologia),
      datasets: [{
        data: historico.por_tipologia.map(t => t.cantidad),
        backgroundColor: [PALETTE.primary, PALETTE.yellow, PALETTE.red],
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

  // ============== CHART: Evolución anual ==============
  const anios = historico.por_anio;
  new Chart(document.getElementById('chart-anios'), {
    type: 'line',
    data: {
      labels: anios.map(a => a.anio_postulacion),
      datasets: [{
        label: 'Iniciativas postuladas',
        data: anios.map(a => a.cantidad),
        borderColor: PALETTE.primary,
        backgroundColor: 'rgba(15,63,140,.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: PALETTE.primary,
        borderWidth: 2.5
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${Utils.formatNumber(ctx.raw)} iniciativas`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#E5E7EB' } }
      }
    }
  });

  // ============== CHART: Fuente de financiamiento ==============
  new Chart(document.getElementById('chart-fuente'), {
    type: 'pie',
    data: {
      labels: historico.por_fuente.map(f => f.fuente_simple),
      datasets: [{
        data: historico.por_fuente.map(f => f.cantidad),
        backgroundColor: PALETTE.categorical.slice(0, historico.por_fuente.length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
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

  // ============== CHART: Inversión 2026 por comuna ==============
  const inv26Comuna = [...inv2026.por_comuna]
    .filter(c => c.comuna && !c.comuna.toLowerCase().includes('km ') && !c.comuna.toLowerCase().includes('sector industrial') && !c.comuna.toLowerCase().includes('avenida'))
    .slice(0, 10);
  new Chart(document.getElementById('chart-inv26-comuna'), {
    type: 'bar',
    data: {
      labels: inv26Comuna.map(c => c.comuna),
      datasets: [{
        label: 'Inversión (MUSD)',
        data: inv26Comuna.map(c => c.inversion),
        backgroundColor: PALETTE.primary,
        borderRadius: 4
      }, {
        label: 'Empleo en operación',
        data: inv26Comuna.map(c => c.empleo_total),
        backgroundColor: PALETTE.yellow,
        borderRadius: 4,
        yAxisID: 'y1'
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.dataset.label.includes('MUSD')) return `Inversión: US$${Utils.formatNumber(ctx.raw)}M`;
              return `Empleo operación: ${Utils.formatNumber(ctx.raw)}`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: '#E5E7EB' },
          title: { display: true, text: 'MUSD' }
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { display: false },
          title: { display: true, text: 'Empleos' }
        }
      }
    }
  });

  // ============== CHART: Empleo proyectado ==============
  const r = inv2026.resumen;
  new Chart(document.getElementById('chart-inv26-empleo'), {
    type: 'doughnut',
    data: {
      labels: ['Profesionales', 'Técnicos', 'No calificados'],
      datasets: [{
        data: [r.profesionales_total, r.tecnicos_total, r.nc_total],
        backgroundColor: [PALETTE.primary, PALETTE.primaryLight, PALETTE.yellow],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '55%',
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = r.profesionales_total + r.tecnicos_total + r.nc_total;
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return `${ctx.label}: ${Utils.formatNumber(ctx.raw, 0)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

})();
