// ============== CENSO 2024 APLICADO A LA SEREMI ==============
(async function() {
  let data;
  try {
    data = await Utils.loadJSON('data/censo-2024.json');
  } catch (e) {
    console.error(e); return;
  }

  const fmt = (n) => new Intl.NumberFormat('es-CL').format(n);

  // ====== KPIs ======
  document.getElementById('censo-kpis').innerHTML = `
    <div class="kpi"><div class="kpi-icon" style="background:#0F3F8C">👥</div>
      <div class="kpi-content"><span class="kpi-label">Población O'Higgins</span>
        <span class="kpi-value">${fmt(data.ohiggins.poblacion_total)}</span>
        <span class="kpi-foot">Censo 2024 · 33 comunas</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#C0192B">👩</div>
      <div class="kpi-content"><span class="kpi-label">% Mujeres</span>
        <span class="kpi-value">${data.ohiggins.pct_mujeres}%</span>
        <span class="kpi-foot">${fmt(data.ohiggins.mujeres)} mujeres</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#2E7D32">📈</div>
      <div class="kpi-content"><span class="kpi-label">Crecimiento vs 2017</span>
        <span class="kpi-value">+${data.comparativa_2017_2024.ohiggins.delta_pct}%</span>
        <span class="kpi-foot">+${fmt(data.comparativa_2017_2024.ohiggins.delta_abs)} personas</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#F57C00">🏘️</div>
      <div class="kpi-content"><span class="kpi-label">Hogares (nacional)</span>
        <span class="kpi-value">${data.nacional.tamanio_hogar_promedio}</span>
        <span class="kpi-foot">personas/hogar · era ${data.nacional.tamanio_hogar_1992}</span></div></div>
  `;

  // ====== Ranking de regiones ======
  const regiones = [...data.regiones_ranking].sort((a,b) => b.poblacion - a.poblacion);
  new Chart(document.getElementById('ch-regiones'), {
    type: 'bar',
    data: {
      labels: regiones.map(r => r.region),
      datasets: [{
        label: 'Habitantes',
        data: regiones.map(r => r.poblacion),
        backgroundColor: regiones.map(r => r.region === "O'Higgins" ? '#FFD200' : '#0F3F8C'),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const r = regiones[ctx.dataIndex];
              return `${fmt(r.poblacion)} habitantes (${r.pct_nacional}% del país)`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: '#E5E7EB' }, ticks: { callback: v => v >= 1000000 ? (v/1000000).toFixed(1)+'M' : (v/1000)+'K' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  // ====== Sexo (donut comparativa) ======
  new Chart(document.getElementById('ch-sexo'), {
    type: 'doughnut',
    data: {
      labels: ['Mujeres', 'Hombres'],
      datasets: [{
        label: "O'Higgins",
        data: [data.ohiggins.mujeres, data.ohiggins.hombres],
        backgroundColor: ['#C0192B', '#0F3F8C'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '60%',
      plugins: {
        title: { display: true, text: "O'Higgins · 51% / 49%", color: '#1A2332', font: { size: 12, weight: 'normal' } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = ((ctx.raw/total)*100).toFixed(1);
              return `${ctx.label}: ${fmt(ctx.raw)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // ====== Tendencias 1992 → 2024 ======
  const tendencias = [
    {
      titulo: '👵 Población mayor (65+)',
      yr_then: '1992', val_then: data.nacional.pct_65_o_mas_1992 + '%',
      yr_now: '2024', val_now: data.nacional.pct_65_o_mas_2024 + '%',
      desc: 'Más del doble. Mayor presión sobre el sistema previsional y demanda de servicios de cuidado.'
    },
    {
      titulo: '🧒 Población menor (0-14)',
      yr_then: '1992', val_then: data.nacional.pct_menores_14_1992 + '%',
      yr_now: '2024', val_now: data.nacional.pct_menores_14_2024 + '%',
      desc: 'Casi a la mitad. Cambio del modelo familiar y reducción de la fuerza laboral juvenil futura.'
    },
    {
      titulo: '🏠 Tamaño promedio del hogar',
      yr_then: '1992', val_then: data.nacional.tamanio_hogar_1992 + ' p/hogar',
      yr_now: '2024', val_now: data.nacional.tamanio_hogar_promedio + ' p/hogar',
      desc: 'Hogares 30% más pequeños. Implica menos red de cuidado familiar y mayor demanda institucional.'
    },
    {
      titulo: '🚶 Hogares unipersonales',
      yr_then: '1992', val_then: data.nacional.hogares_unipersonales_1992_pct + '%',
      yr_now: '2024', val_now: data.nacional.hogares_unipersonales_pct + '%',
      desc: '1 de cada 5 personas vive sola. Aumento de demanda sobre el mercado laboral de cuidados.'
    },
    {
      titulo: '👴 Hogares solo de 65+',
      yr_then: '1992', val_then: data.nacional.hogares_solo_65_1992_pct + '%',
      yr_now: '2024', val_now: data.nacional.hogares_solo_65_pct + '%',
      desc: 'Más adultos mayores viven solos. Aumenta demanda de PGU y servicios de previsión.'
    },
    {
      titulo: '📊 Índice de envejecimiento',
      yr_then: '1992', val_then: data.nacional.indice_envejecimiento_1992,
      yr_now: '2024', val_now: data.nacional.indice_envejecimiento,
      desc: '3,5 veces mayor. Por cada 100 menores de 15 años, hay 79 personas mayores de 65 años.'
    }
  ];

  document.getElementById('tendencias-list').innerHTML = tendencias.map(t => `
    <article class="tendencia-card">
      <h3 style="margin:0 0 .5rem; color:var(--blue-dark);">${t.titulo}</h3>
      <div class="tendencia-comparison">
        <div class="tendencia-then">
          <span class="yr">${t.yr_then}</span><br>
          <span class="val">${t.val_then}</span>
        </div>
        <span class="tendencia-arrow">→</span>
        <div class="tendencia-now">
          <span class="yr">${t.yr_now}</span><br>
          <span class="val">${t.val_now}</span>
        </div>
      </div>
      <p style="margin:.75rem 0 0; font-size:.88rem; color:var(--gray-700); line-height:1.55;">${t.desc}</p>
    </article>
  `).join('');

  // ====== Evolución del envejecimiento (serie temporal) ======
  const envejecimientoSerie = [
    { anio: 1992, valor: data.nacional.indice_envejecimiento_1992 },
    { anio: 2002, valor: 36 },
    { anio: 2017, valor: 57 },
    { anio: 2024, valor: data.nacional.indice_envejecimiento }
  ];
  new Chart(document.getElementById('ch-envejecimiento'), {
    type: 'line',
    data: {
      labels: envejecimientoSerie.map(s => s.anio),
      datasets: [{
        label: 'Índice de envejecimiento (Chile)',
        data: envejecimientoSerie.map(s => s.valor),
        borderColor: '#C0192B',
        backgroundColor: 'rgba(192,25,43,.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: '#FFD200',
        pointBorderColor: '#C0192B',
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw} personas 65+ por cada 100 menores de 15 años` } }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#E5E7EB' }, title: { display: true, text: 'Índice' } }
      }
    }
  });

  // ====== Envejecimiento por región ======
  const regEnvSorted = Object.entries(data.regiones_indice_envejecimiento).sort((a,b) => b[1] - a[1]);
  new Chart(document.getElementById('ch-envejecimiento-regiones'), {
    type: 'bar',
    data: {
      labels: regEnvSorted.map(([n]) => n),
      datasets: [{
        label: 'Índice envejecimiento',
        data: regEnvSorted.map(([,v]) => v),
        backgroundColor: regEnvSorted.map(([n]) => n === "O'Higgins" ? '#FFD200' : '#0F3F8C'),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw} adultos mayores / 100 menores` } }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: '#E5E7EB' } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ====== Pirámide poblacional ======
  const tramos = Object.entries(data.edad_distribucion_estimada);
  new Chart(document.getElementById('ch-piramide'), {
    type: 'bar',
    data: {
      labels: tramos.map(([k]) => k + ' años'),
      datasets: [
        {
          label: 'Hombres',
          data: tramos.map(([,v]) => -v.hombres),
          backgroundColor: '#0F3F8C',
          borderRadius: 4
        },
        {
          label: 'Mujeres',
          data: tramos.map(([,v]) => v.mujeres),
          backgroundColor: '#C0192B',
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${fmt(Math.abs(ctx.raw))}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: '#E5E7EB' },
          ticks: { callback: v => fmt(Math.abs(v)) },
          title: { display: true, text: 'Habitantes' }
        },
        y: {
          stacked: true,
          grid: { display: false }
        }
      }
    }
  });

  // ====== Implicancias para la SEREMI ======
  document.getElementById('implicaciones-grid').innerHTML = data.implicaciones_seremi.map((imp, i) => `
    <article class="implicacion-card">
      <h3>${i+1}. ${imp.titulo}</h3>
      <div class="implicacion-dato">📊 ${imp.dato}</div>
      <p style="margin:.75rem 0 0; color:var(--gray-700); line-height:1.65; font-size:.92rem;">${imp.impacto}</p>
      <span class="implicacion-tag">🎯 ${imp.linea_accion}</span>
    </article>
  `).join('');

})();
