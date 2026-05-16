// ============== INVERSION PAGE ==============
(async function() {
  let hist, inv26;
  try {
    [hist, inv26] = await Promise.all([
      Utils.loadJSON('data/inversion_historica.json'),
      Utils.loadJSON('data/inversion_2026.json')
    ]);
  } catch (e) {
    console.error(e); return;
  }

  // ====== KPIs HISTORICO ======
  const r = hist.resumen;
  document.getElementById('kpi-hist').innerHTML = `
    <div class="kpi"><div class="kpi-icon" style="background:#0F3F8C">📊</div>
      <div class="kpi-content"><span class="kpi-label">Total iniciativas</span>
        <span class="kpi-value">${Utils.formatNumber(r.total_registros)}</span>
        <span class="kpi-foot">${r.anio_min}–${r.anio_max}</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#2E7D32">🏗️</div>
      <div class="kpi-content"><span class="kpi-label">Proyectos</span>
        <span class="kpi-value">${Utils.formatNumber(r.total_proyectos)}</span>
        <span class="kpi-foot">${((r.total_proyectos/r.total_registros)*100).toFixed(1)}% del total</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#C0192B">💰</div>
      <div class="kpi-content"><span class="kpi-label">Inversión acumulada</span>
        <span class="kpi-value">M$${Utils.formatMoney(r.inversion_total_M, '')}</span>
        <span class="kpi-foot">Costo total registrado</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#F57C00">🏛️</div>
      <div class="kpi-content"><span class="kpi-label">Instituciones</span>
        <span class="kpi-value">${Utils.formatNumber(r.instituciones_count)}</span>
        <span class="kpi-foot">${r.sectores_count} sectores</span></div></div>
  `;

  // ====== CHART: Años evolución ======
  new Chart(document.getElementById('ch-anios'), {
    type: 'bar',
    data: {
      labels: hist.por_anio.map(a => a.anio_postulacion),
      datasets: [{
        label: 'Iniciativas',
        data: hist.por_anio.map(a => a.cantidad),
        backgroundColor: PALETTE.primary,
        borderRadius: 3
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${Utils.formatNumber(ctx.raw)} iniciativas` } }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatNumber(v) } }
      }
    }
  });

  // ====== CHART: Etapa ======
  new Chart(document.getElementById('ch-etapa'), {
    type: 'doughnut',
    data: {
      labels: hist.por_etapa.map(e => e.etapa_actual),
      datasets: [{
        data: hist.por_etapa.map(e => e.cantidad),
        backgroundColor: PALETTE.categorical,
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
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // ====== CHART: Sectores costo ======
  const secCosto = [...hist.por_sector].sort((a,b) => b.costo_total - a.costo_total).slice(0, 12);
  new Chart(document.getElementById('ch-sec-costo'), {
    type: 'bar',
    data: {
      labels: secCosto.map(s => s.sector),
      datasets: [{
        label: 'Inversión (M$)',
        data: secCosto.map(s => s.costo_total),
        backgroundColor: secCosto.map((_, i) => `hsl(${215 - i * 6}, 65%, ${48 + i}%)`),
        borderRadius: 3
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `M$${Utils.formatNumber(ctx.raw)}` } }
      },
      scales: {
        x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatMoney(v, '$') } },
        y: { grid: { display: false } }
      }
    }
  });

  // ====== CHART: Rate ======
  const RATE_COLORS = {
    'RS': PALETTE.green, 'OT': PALETTE.red, 'FI': PALETTE.orange,
    'AD': PALETTE.primary, 'RA': PALETTE.primaryLight, 'FA': PALETTE.gray,
    'VN': '#7B1FA2', 'IN': '#5D4037', '*': PALETTE.gray,
    'SP': '#0288D1', 'CF': PALETTE.yellow
  };
  new Chart(document.getElementById('ch-rate'), {
    type: 'pie',
    data: {
      labels: hist.por_rate.map(r => r.rate),
      datasets: [{
        data: hist.por_rate.map(r => r.cantidad),
        backgroundColor: hist.por_rate.map(r => RATE_COLORS[r.rate] || PALETTE.gray),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              const r = hist.por_rate[ctx.dataIndex];
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return `${r.rate} (${r.descripcion}): ${Utils.formatNumber(ctx.raw)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // ====== CHART: Instituciones top ======
  new Chart(document.getElementById('ch-inst'), {
    type: 'bar',
    data: {
      labels: hist.top_formuladoras.map(i => Utils.truncate(i.institucion, 50)),
      datasets: [{
        label: 'Iniciativas',
        data: hist.top_formuladoras.map(i => i.cantidad),
        backgroundColor: PALETTE.primary,
        borderRadius: 3
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => hist.top_formuladoras[ctx[0].dataIndex].institucion,
            label: ctx => `${Utils.formatNumber(ctx.raw)} iniciativas`
          }
        }
      },
      scales: {
        x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatNumber(v) } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  // ====== CHART: Fuente ======
  new Chart(document.getElementById('ch-fuente'), {
    type: 'doughnut',
    data: {
      labels: hist.por_fuente.map(f => f.fuente_simple),
      datasets: [{
        data: hist.por_fuente.map(f => f.cantidad),
        backgroundColor: PALETTE.categorical,
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
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // ====== CHART: Sub-sectores ======
  new Chart(document.getElementById('ch-subsec'), {
    type: 'bar',
    data: {
      labels: hist.top_subsectores.map(s => Utils.truncate(s.sub_sector, 45)),
      datasets: [{
        label: 'Iniciativas',
        data: hist.top_subsectores.map(s => s.cantidad),
        backgroundColor: PALETTE.primary,
        borderRadius: 3
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => hist.top_subsectores[ctx[0].dataIndex].sub_sector,
            label: ctx => `${Utils.formatNumber(ctx.raw)} iniciativas`
          }
        }
      },
      scales: {
        x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => Utils.formatNumber(v) } },
        y: { grid: { display: false }, ticks: { font: { size: 10.5 } } }
      }
    }
  });

  // ====== CHART: Tipología ======
  new Chart(document.getElementById('ch-tip'), {
    type: 'pie',
    data: {
      labels: hist.por_tipologia.map(t => t.tipologia),
      datasets: [{
        data: hist.por_tipologia.map(t => t.cantidad),
        backgroundColor: [PALETTE.primary, PALETTE.yellow, PALETTE.red],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
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

  // ====== Tablas ======
  document.getElementById('tabla-sectores').innerHTML = hist.por_sector.map(s => `
    <tr>
      <td><strong>${s.sector}</strong></td>
      <td class="num">${Utils.formatNumber(s.cantidad)}</td>
      <td class="num">${Utils.formatNumber(s.costo_total)}</td>
      <td class="num">${Utils.formatNumber(s.costo_total / s.cantidad, 0)}</td>
    </tr>
  `).join('');

  document.getElementById('tabla-comunas-hist').innerHTML = hist.por_comuna.map(c => `
    <tr>
      <td><strong>${c.comuna}</strong></td>
      <td class="num">${Utils.formatNumber(c.cantidad)}</td>
      <td class="num">${Utils.formatNumber(c.costo_total)}</td>
    </tr>
  `).join('');

  // ============== TAB 2026 ==============
  let rendered2026 = false;
  function render2026() {
    const r26 = inv26.resumen;
    document.getElementById('kpi-2026').innerHTML = `
      <div class="kpi"><div class="kpi-icon" style="background:#0F3F8C">🏭</div>
        <div class="kpi-content"><span class="kpi-label">Proyectos en cartera</span>
          <span class="kpi-value">${Utils.formatNumber(r26.cantidad_total)}</span>
          <span class="kpi-foot">${r26.total_filas} registros</span></div></div>
      <div class="kpi"><div class="kpi-icon" style="background:#2E7D32">💵</div>
        <div class="kpi-content"><span class="kpi-label">Inversión total</span>
          <span class="kpi-value">US$${Utils.formatNumber(r26.inversion_total_MUSD)}M</span>
          <span class="kpi-foot">Cartera CBC 2026</span></div></div>
      <div class="kpi"><div class="kpi-icon" style="background:#C0192B">👷</div>
        <div class="kpi-content"><span class="kpi-label">Empleo construcción</span>
          <span class="kpi-value">${Utils.formatNumber(r26.empleo_construccion_total)}</span>
          <span class="kpi-foot">Profesionales + técnicos + NC</span></div></div>
      <div class="kpi"><div class="kpi-icon" style="background:#F57C00">⚙️</div>
        <div class="kpi-content"><span class="kpi-label">Empleo operación</span>
          <span class="kpi-value">${Utils.formatNumber(r26.empleo_operacion_total)}</span>
          <span class="kpi-foot">Fase de operación</span></div></div>
    `;

    // Sector inversión
    const sec = [...inv26.por_sector].sort((a,b) => b.inversion - a.inversion);
    new Chart(document.getElementById('ch26-sec'), {
      type: 'bar',
      data: {
        labels: sec.map(s => s.sector_economico),
        datasets: [{
          label: 'Inversión (MUSD)',
          data: sec.map(s => s.inversion),
          backgroundColor: PALETTE.categorical,
          borderRadius: 4
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `US$${Utils.formatNumber(ctx.raw)}M` } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#E5E7EB' }, ticks: { callback: v => `US$${v}M` } }
        }
      }
    });

    // Etapa
    new Chart(document.getElementById('ch26-etapa'), {
      type: 'doughnut',
      data: {
        labels: inv26.por_etapa.map(e => e.etapa),
        datasets: [{
          data: inv26.por_etapa.map(e => e.cantidad),
          backgroundColor: [PALETTE.primary, PALETTE.green, PALETTE.orange, PALETTE.yellow],
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
                const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return `${ctx.label}: ${ctx.raw} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Empleo por sector
    new Chart(document.getElementById('ch26-empleo'), {
      type: 'bar',
      data: {
        labels: sec.map(s => s.sector_economico),
        datasets: [
          {
            label: 'Profesionales',
            data: sec.map(s => s.profesionales),
            backgroundColor: PALETTE.primary
          },
          {
            label: 'Técnicos',
            data: sec.map(s => s.tecnicos),
            backgroundColor: PALETTE.primaryLight
          },
          {
            label: 'No calificados',
            data: sec.map(s => s.nc),
            backgroundColor: PALETTE.yellow
          }
        ]
      },
      options: {
        plugins: {
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${Utils.formatNumber(ctx.raw, 0)}` } }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, grid: { color: '#E5E7EB' } }
        }
      }
    });

    // Composición
    new Chart(document.getElementById('ch26-comp'), {
      type: 'doughnut',
      data: {
        labels: ['Profesionales', 'Técnicos', 'No calificados'],
        datasets: [{
          data: [r26.profesionales_total, r26.tecnicos_total, r26.nc_total],
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
              label: ctx => {
                const total = r26.profesionales_total + r26.tecnicos_total + r26.nc_total;
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return `${ctx.label}: ${Utils.formatNumber(ctx.raw, 0)} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Tabla cartera
    const PILL_MAP = {'Construcción': 'pill orange', 'Terminado': 'pill green', 'Ing. de Detalle': 'pill'};
    document.getElementById('tabla-cartera').innerHTML = inv26.registros.map(p => `
      <tr>
        <td><strong>${Utils.truncate(p.comuna || '—', 30)}</strong></td>
        <td>${p.sector_economico}</td>
        <td>${Utils.truncate(p.tipologia, 45)}</td>
        <td><span class="${PILL_MAP[p.etapa] || 'pill'}">${p.etapa}</span></td>
        <td class="num">${p.cantidad}</td>
        <td class="num">${Utils.formatNumber(p.inversion)}</td>
        <td class="num">${Utils.formatNumber(p.empleo_operacion)}</td>
      </tr>
    `).join('');
  }

  // ====== TABS ======
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById(`tab-${target}`).classList.add('active');
      if (target === 'cartera' && !rendered2026) {
        render2026();
        rendered2026 = true;
      }
    });
  });

})();
