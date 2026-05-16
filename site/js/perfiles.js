// ============== RUTAS POR PERFIL DE USUARIO ==============
(function() {
  const PERFILES = {
    trabajador: {
      icon: '👷',
      color: '#2E7D32',
      titulo: 'Rutas para trabajadores/as',
      desc: 'Selecciona qué necesitas hacer y te guiamos paso a paso.',
      rutas: [
        {
          q: '💼 Buscar empleo',
          steps: [
            'Visita la <a href="https://www.bne.cl" target="_blank" rel="noopener">Bolsa Nacional de Empleo (BNE)</a> y postula con tu RUT',
            'Acércate a la <a href="directorio.html">OMIL de tu comuna</a>',
            'Revisa vacantes en empresas grandes: Codelco El Teniente, agroindustria, retail'
          ]
        },
        {
          q: '🎓 Capacitarme gratis',
          steps: [
            'Cursos online y presenciales en <a href="https://sence.gob.cl/personas/cursos" target="_blank" rel="noopener">SENCE</a>',
            'Para mujeres: programa <b>Mujer Digital</b> (65 cursos)',
            'Para cesantes: línea <b>Reinvéntate</b> (Talento Digital)',
            'Para emprendedores: <b>Despega MIPE</b>'
          ]
        },
        {
          q: '⚖️ Conocer mis derechos / denunciar',
          steps: [
            'Lee la <a href="recursos.html">FAQ sobre Ley Karin</a> y derechos básicos',
            'Denuncia online en <a href="https://www.dt.gob.cl" target="_blank" rel="noopener">dt.gob.cl</a>',
            'Línea de orientación: <b>600 450 4000</b>',
            'Atención presencial: ver <a href="directorio.html">Directorio</a>'
          ]
        },
        {
          q: '🛡️ Cotizar / Previsión',
          steps: [
            'Si eres honorario: revisa la <a href="recursos.html">FAQ sobre cotización</a>',
            'PGU para mayores de 65: llama al <b>101</b> (ChileAtiende)',
            'Saldo Seguro Cesantía: <a href="https://www.afc.cl" target="_blank" rel="noopener">afc.cl</a>'
          ]
        }
      ]
    },
    empleador: {
      icon: '🏢',
      color: '#0F3F8C',
      titulo: 'Rutas para empleadores/as',
      desc: 'Cumplimiento, contratación y subsidios disponibles.',
      rutas: [
        {
          q: '✅ Cumplir Ley Karin (21.643)',
          steps: [
            'Establece protocolo escrito de prevención y canal de denuncia',
            'Capacita a tus colaboradores',
            'La SEREMI organiza encuentros informativos regionales',
            'Ver <a href="lineas-accion.html">Eje 3 — Líneas de Acción</a>'
          ]
        },
        {
          q: '⏱️ Adaptarte a las 40 horas',
          steps: [
            '<b>42 horas</b> desde 2026 (ya vigente)',
            '<b>40 horas</b> desde 2028',
            'Jornadas excepcionales (mineras, agroindustriales) requieren autorización de la DT',
            'Consulta en la <a href="directorio.html">Inspección Provincial</a>'
          ]
        },
        {
          q: '📋 Publicar vacantes / Reclutar',
          steps: [
            'Registra tu empresa en <a href="https://www.bne.cl" target="_blank" rel="noopener">bne.cl</a>',
            'Publica vacantes gratuitas, alcance nacional',
            'Recibe postulaciones derivadas por las 33 OMIL regionales',
            'Programa <b>Aprendices</b> SENCE: subsidio por contratar jóvenes <25 años'
          ]
        },
        {
          q: '💰 Subsidios al empleo',
          steps: [
            'Franquicia tributaria SENCE: descuenta capacitación de tu impuesto',
            'Subsidio al Empleo Joven (SEJ) para trabajadores 18-24',
            'Bono al Trabajo de la Mujer para trabajadoras 25-59',
            'Más info en <a href="https://sence.gob.cl/empresas" target="_blank" rel="noopener">sence.gob.cl/empresas</a>'
          ]
        }
      ]
    },
    autoridad: {
      icon: '🏛️',
      color: '#C0192B',
      titulo: 'Rutas para autoridades y funcionarios',
      desc: 'Análisis territorial, planificación e instrumentos de gestión.',
      rutas: [
        {
          q: '📊 Diagnóstico de mi comuna',
          steps: [
            'Mira tu posición en el <a href="comunas.html#tab-idlc">Ranking IDLC</a>',
            'Identifica componentes débiles en la tabla de descomposición',
            'Compara con vecinas en <a href="comunas.html#tab-lado-a-lado">Vista lado a lado</a>',
            'Descarga CSV completo para análisis interno'
          ]
        },
        {
          q: '🏗️ Inversión en mi territorio',
          steps: [
            'Cartera 2026 por comuna en <a href="inversion.html#tab-cartera">Inversión Regional</a>',
            'Histórico BIP por comuna con detección automática',
            '<a href="proyeccion.html">Proyección de demanda laboral</a> para alinear formación local'
          ]
        },
        {
          q: '🤝 Cómo articular con SEREMI Trabajo',
          steps: [
            '<a href="lineas-accion.html">6 ejes de gestión institucional</a>',
            '6 mesas regionales activas (Consejo Capacitación, Minera, Agroindustrial, Karin, Diálogo Social)',
            'Asistencia técnica para destrabar iniciativas BIP en Perfil',
            'Contacto SEREMI: Germán Riesco 277, Rancagua · 72 254 0266'
          ]
        },
        {
          q: '📂 Datos abiertos del Observatorio',
          steps: [
            'Todos los JSON son descargables: <code>/data/comunas.json</code>, etc.',
            'Repositorio público en <a href="https://github.com/OsvaldoManan/portal-seremi-trabajo-ohiggins" target="_blank" rel="noopener">GitHub</a>',
            'Workflow automático refresca datos cada lunes',
            'Glosario y metodología en <a href="recursos.html">Recursos</a>'
          ]
        }
      ]
    },
    investigador: {
      icon: '🔬',
      color: '#7B1FA2',
      titulo: 'Rutas para investigadores y académicos',
      desc: 'Datos crudos, metodologías y análisis estadísticos disponibles.',
      rutas: [
        {
          q: '📈 Análisis cuantitativo',
          steps: [
            '<a href="comunas.html#tab-correlacion">Correlaciones interactivas</a> con regresión lineal y R²',
            '<a href="comunas.html#tab-idlc">Índice IDLC</a> compuesto 0-100 con metodología documentada',
            '<a href="analisis.html">Análisis estratégico regional</a> con interpretación cualitativa-cuantitativa'
          ]
        },
        {
          q: '⬇️ Descargar microdatos',
          steps: [
            'CSV de cada tabla del portal (botón ⬇ Descargar CSV)',
            'JSON crudos: <code>/data/comunas.json</code>, <code>/data/inversion_historica.json</code>',
            'GeoJSON: <code>/data/geo/ohiggins.geojson</code> (33 comunas con polígonos)',
            'Script Python: <a href="https://github.com/OsvaldoManan/portal-seremi-trabajo-ohiggins/blob/main/process_data.py" target="_blank" rel="noopener">process_data.py</a> para regenerar'
          ]
        },
        {
          q: '🔍 Fuentes oficiales',
          steps: [
            'CENSO 2024, ENE, SII, BNE, MIDESO, CBC, BIP',
            'Bases programáticas y normativa: <a href="lineas-accion.html">Líneas de Acción</a>',
            'Trazabilidad por comuna en cada ficha'
          ]
        },
        {
          q: '📚 Glosario y metodología',
          steps: [
            '<a href="recursos.html">24 términos técnicos definidos</a>',
            'Metodología IDLC documentada en su tab',
            'Códigos RATE del BIP, niveles educativos, etc.'
          ]
        }
      ]
    }
  };

  const modal = document.getElementById('perfil-modal');
  const closeBtn = document.getElementById('perfil-close');
  const content = document.getElementById('perfil-modal-content');
  if (!modal) return;

  function renderModal(perfil) {
    const p = PERFILES[perfil];
    if (!p) return;
    content.innerHTML = `
      <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
        <div style="font-size:2.5rem;">${p.icon}</div>
        <div>
          <h2 style="margin:0; color:var(--blue-dark); font-size:1.6rem;">${p.titulo}</h2>
          <p style="margin:.25rem 0 0; color:var(--gray-600);">${p.desc}</p>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${p.rutas.map((r, i) => `
          <details style="background:var(--gray-100); border-radius:var(--radius-sm); padding:1.25rem; ${i === 0 ? 'open' : ''}">
            <summary style="cursor:pointer; font-weight:600; color:${p.color}; font-size:1rem; list-style:none;">${r.q}</summary>
            <ol style="margin:1rem 0 0 1.25rem; line-height:1.85; color:var(--gray-700);">
              ${r.steps.map(s => `<li>${s}</li>`).join('')}
            </ol>
          </details>
        `).join('')}
      </div>
      <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--gray-200); text-align:center;">
        <a href="recursos.html" style="color:var(--blue); font-weight:600;">→ Ver Glosario y FAQ completa</a>
      </div>
    `;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.perfil-card').forEach(card => {
    card.addEventListener('click', () => renderModal(card.dataset.perfil));
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display === 'block') close(); });
})();
