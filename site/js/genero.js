// ============== PÁGINA GÉNERO ==============
(async function() {
  let comunas;
  try {
    comunas = await Utils.loadJSON('data/comunas.json');
  } catch (e) {
    console.error(e); return;
  }

  function num(c, k) { return c.indicadores[k]?.numero || 0; }

  const totalH = comunas.reduce((s, c) => s + num(c,'Cantidad de Hombres'), 0);
  const totalM = comunas.reduce((s, c) => s + num(c,'Cantidad de Mujeres'), 0);
  const total = totalH + totalM;
  const pctM = (totalM / total) * 100;

  // Calculate by comuna
  const byComuna = comunas.map(c => {
    const h = num(c, 'Cantidad de Hombres');
    const m = num(c, 'Cantidad de Mujeres');
    const tot = h + m;
    return {
      comuna: c.comuna,
      h, m, total: tot,
      pctM: tot > 0 ? (m / tot) * 100 : 0,
      pctH: tot > 0 ? (h / tot) * 100 : 0,
      desviacion: tot > 0 ? Math.abs((m / tot) * 100 - 50) : 0
    };
  });

  const masFem = [...byComuna].sort((a,b) => b.pctM - a.pctM)[0];
  const masMasc = [...byComuna].sort((a,b) => a.pctM - b.pctM)[0];
  const paridad_total = (totalM / totalH).toFixed(2);

  // KPIs
  document.getElementById('g-kpis').innerHTML = `
    <div class="kpi"><div class="kpi-icon" style="background:#C0192B">👩</div>
      <div class="kpi-content"><span class="kpi-label">Mujeres en la región</span>
        <span class="kpi-value">${Utils.formatNumber(totalM)}</span>
        <span class="kpi-foot">${pctM.toFixed(1)}% del total · Censo 2024</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#0F3F8C">👨</div>
      <div class="kpi-content"><span class="kpi-label">Hombres en la región</span>
        <span class="kpi-value">${Utils.formatNumber(totalH)}</span>
        <span class="kpi-foot">${(100-pctM).toFixed(1)}% del total · Censo 2024</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#2E7D32">⚖️</div>
      <div class="kpi-content"><span class="kpi-label">Índice de paridad</span>
        <span class="kpi-value">${paridad_total}</span>
        <span class="kpi-foot">${paridad_total >= 1 ? 'M ≥ H' : 'M < H'} a nivel regional</span></div></div>
    <div class="kpi"><div class="kpi-icon" style="background:#F57C00">📊</div>
      <div class="kpi-content"><span class="kpi-label">Mayor % mujeres</span>
        <span class="kpi-value" style="font-size:1.3rem;">${masFem.comuna}</span>
        <span class="kpi-foot">${masFem.pctM.toFixed(1)}% mujeres</span></div></div>
  `;

  // Paridad por comuna (% mujeres)
  const sortedByPctM = [...byComuna].sort((a,b) => b.pctM - a.pctM);
  new Chart(document.getElementById('ch-paridad'), {
    type: 'bar',
    data: {
      labels: sortedByPctM.map(c => c.comuna),
      datasets: [{
        label: '% Mujeres',
        data: sortedByPctM.map(c => c.pctM),
        backgroundColor: sortedByPctM.map(c => c.pctM >= 51 ? '#C0192B' : (c.pctM >= 49 ? '#0F3F8C' : '#F57C00')),
        borderRadius: 3,
        barThickness: 'flex',
        maxBarThickness: 22
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const c = sortedByPctM[ctx.dataIndex];
              return [
                `Mujeres: ${Utils.formatNumber(c.m)} (${c.pctM.toFixed(1)}%)`,
                `Hombres: ${Utils.formatNumber(c.h)} (${c.pctH.toFixed(1)}%)`,
                `Total: ${Utils.formatNumber(c.total)}`
              ];
            }
          }
        },
        annotation: {
          annotations: {
            line50: {
              type: 'line',
              xMin: 50, xMax: 50,
              borderColor: '#C0192B',
              borderWidth: 2,
              borderDash: [5,5]
            }
          }
        }
      },
      scales: {
        x: { min: 40, max: 60, grid: { color: '#E5E7EB' }, ticks: { callback: v => v + '%' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  // Donut regional
  new Chart(document.getElementById('ch-paridad-donut'), {
    type: 'doughnut',
    data: {
      labels: ['Mujeres', 'Hombres'],
      datasets: [{
        data: [totalM, totalH],
        backgroundColor: ['#C0192B', '#0F3F8C'],
        borderColor: '#fff',
        borderWidth: 3
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${(ctx.raw/total*100).toFixed(1)}%)`
          }
        }
      }
    }
  });

  // Desviación de la paridad
  const sortedByDes = [...byComuna].sort((a,b) => b.desviacion - a.desviacion).slice(0, 15);
  new Chart(document.getElementById('ch-desviacion'), {
    type: 'bar',
    data: {
      labels: sortedByDes.map(c => c.comuna),
      datasets: [{
        label: 'Desviación de paridad (puntos %)',
        data: sortedByDes.map(c => c.pctM - 50),
        backgroundColor: sortedByDes.map(c => c.pctM >= 50 ? '#C0192B' : '#0F3F8C'),
        borderRadius: 4
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const c = sortedByDes[ctx.dataIndex];
              return c.pctM >= 50
                ? `Mujeres: ${c.pctM.toFixed(1)}% (+${(c.pctM-50).toFixed(1)}pp sobre paridad)`
                : `Hombres: ${c.pctH.toFixed(1)}% (+${(50-c.pctM).toFixed(1)}pp sobre paridad)`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: {
          grid: { color: '#E5E7EB' },
          ticks: { callback: v => (v >= 0 ? '+' : '') + v + 'pp' }
        }
      }
    }
  });

  // Total regional pie
  new Chart(document.getElementById('ch-total-genero'), {
    type: 'pie',
    data: {
      labels: ['Mujeres', 'Hombres'],
      datasets: [{
        data: [totalM, totalH],
        backgroundColor: ['#C0192B', '#0F3F8C'],
        borderColor: '#fff',
        borderWidth: 3
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${(ctx.raw/total*100).toFixed(1)}%)`
          }
        }
      }
    }
  });

  // Tabla
  document.getElementById('tabla-genero').innerHTML = [...byComuna]
    .sort((a,b) => b.total - a.total)
    .map(c => {
      let pill, diag;
      if (c.pctM >= 51) { pill = 'red'; diag = 'Más mujeres'; }
      else if (c.pctM <= 49) { pill = 'orange'; diag = 'Más hombres'; }
      else { pill = 'green'; diag = '✓ Paridad'; }
      return `
        <tr>
          <td><strong>${c.comuna}</strong></td>
          <td class="num">${Utils.formatNumber(c.h)}</td>
          <td class="num">${Utils.formatNumber(c.m)}</td>
          <td class="num">${Utils.formatNumber(c.total)}</td>
          <td class="num"><strong>${c.pctM.toFixed(1)}%</strong></td>
          <td><span class="pill ${pill}">${diag}</span></td>
        </tr>
      `;
    }).join('');

  // CSV download
  document.getElementById('dl-genero')?.addEventListener('click', () => {
    const headers = ['Comuna','Hombres','Mujeres','Total','% Mujeres','Diagnóstico'];
    const rows = [headers];
    byComuna.forEach(c => {
      const diag = c.pctM >= 51 ? 'Más mujeres' : (c.pctM <= 49 ? 'Más hombres' : 'Paridad');
      rows.push([c.comuna, c.h, c.m, c.total, c.pctM.toFixed(2), diag]);
    });
    Utils.downloadCSV('genero-comunas-ohiggins.csv', rows);
  });

})();
