// ============== TOUR GUIADO DE BIENVENIDA ==============
// Onboarding interactivo de 5 pasos. Se muestra solo la primera vez.
(function() {

  // Solo en index.html
  if (!location.pathname.endsWith('/') && !location.pathname.endsWith('index.html')) return;
  // Si ya completó el tour
  if (localStorage.getItem('tour_completed') === '1') return;

  const STEPS = [
    {
      title: '👋 Bienvenido al Portal SEREMI Trabajo O\'Higgins',
      body: `Soy una guía rápida del portal. En 5 pasos te muestro lo principal. Puedes saltar el tour en cualquier momento.<br><br><b>Este portal contiene:</b><br>• Indicadores de 31 comunas<br>• Inversión histórica 1994-2025 y cartera 2026<br>• Análisis estratégico y proyecciones<br>• Directorio de servicios y FAQ`,
      target: null,
      placement: 'center'
    },
    {
      title: '🎯 Encuentra rápido lo que necesitas',
      body: 'Selecciona tu perfil para ver rutas guiadas según tu rol: trabajador, empleador, autoridad o investigador.',
      target: '#perfiles',
      placement: 'top'
    },
    {
      title: '🗺️ Mapa interactivo + 25 visualizaciones',
      body: 'En Indicadores Comunales puedes explorar el mapa geográfico real, ranking IDLC, correlaciones interactivas, comparar comunas lado a lado y descargar todos los datos en CSV.',
      target: 'a[href="comunas.html"]',
      placement: 'bottom'
    },
    {
      title: '💬 Chatbot del portal',
      body: 'Pregunta cualquier cosa al asistente: indicadores de comunas, leyes, programas SENCE, oficinas. Atajo: <kbd>💬</kbd> en la esquina inferior derecha.',
      target: '#chatbot-toggle',
      placement: 'left'
    },
    {
      title: '🔍 Buscador global (Ctrl+K)',
      body: `Atajo de teclado para buscar en todo el portal. También puedes <b>compartir vistas</b> con el botón "🔗 Compartir vista" — los filtros se reflejan en la URL.<br><br>¡Listo! Puedes volver a este tour desde el menú "Ayuda".`,
      target: null,
      placement: 'center'
    }
  ];

  let currentStep = 0;
  let overlay, panel;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'tour-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,.7); backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center;
    `;
    document.body.appendChild(overlay);

    panel = document.createElement('div');
    panel.id = 'tour-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'tour-title');
    panel.style.cssText = `
      background: white; padding: 2rem; border-radius: 16px;
      max-width: 480px; width: 90%;
      box-shadow: 0 24px 64px rgba(0,0,0,.4);
      animation: tourSlideUp .35s cubic-bezier(.2,.8,.2,1);
    `;
    document.body.appendChild(panel);

    if (!document.getElementById('tour-style')) {
      const style = document.createElement('style');
      style.id = 'tour-style';
      style.textContent = `
        @keyframes tourSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tour-highlight {
          position: relative !important;
          z-index: 99998 !important;
          box-shadow: 0 0 0 4px rgba(255,210,0,.6), 0 0 30px rgba(255,210,0,.3) !important;
          border-radius: 8px !important;
        }
        #tour-panel kbd {
          background: #F3F4F6; padding: .15rem .4rem;
          border-radius: 4px; font-family: monospace;
          font-size: .9em; border: 1px solid #D1D5DB;
        }
        #tour-panel .tour-btn {
          padding: .65rem 1.5rem; border: 0; border-radius: 8px;
          font-weight: 600; cursor: pointer; font-size: .92rem;
          transition: all .15s;
        }
        #tour-panel .tour-btn-primary {
          background: linear-gradient(135deg, #0F3F8C, #1E5BB8); color: white;
        }
        #tour-panel .tour-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(15,63,140,.3); }
        #tour-panel .tour-btn-skip {
          background: transparent; color: #6B7280; padding-left: .25rem; padding-right: .25rem;
        }
        #tour-panel .tour-btn-skip:hover { color: #1A2332; }
      `;
      document.head.appendChild(style);
    }
  }

  function render() {
    const step = STEPS[currentStep];

    // Remove highlights
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

    // Highlight target if exists
    if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        target.classList.add('tour-highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Position panel
    const isFirst = currentStep === 0;
    const isLast = currentStep === STEPS.length - 1;

    panel.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; gap:.5rem;">
        <div style="display:flex; gap:.3rem;">
          ${STEPS.map((_, i) => `
            <div style="width:24px; height:4px; border-radius:2px; background:${i <= currentStep ? '#0F3F8C' : '#E5E7EB'};"></div>
          `).join('')}
        </div>
        <span style="font-size:.78rem; color:#6B7280;">Paso ${currentStep + 1} de ${STEPS.length}</span>
      </div>
      <h2 id="tour-title" style="margin:0 0 .8rem; color:#0A2D6B; font-size:1.3rem;">${step.title}</h2>
      <p style="margin:0 0 1.5rem; line-height:1.65; color:#495467;">${step.body}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:.5rem;">
        <button class="tour-btn tour-btn-skip" id="tour-skip">${isLast ? '' : 'Saltar tour'}</button>
        <div style="display:flex; gap:.5rem;">
          ${currentStep > 0 ? '<button class="tour-btn tour-btn-skip" id="tour-prev">← Anterior</button>' : ''}
          <button class="tour-btn tour-btn-primary" id="tour-next">${isLast ? '¡Listo! 🎉' : 'Siguiente →'}</button>
        </div>
      </div>
    `;

    panel.querySelector('#tour-next').addEventListener('click', next);
    panel.querySelector('#tour-skip')?.addEventListener('click', complete);
    panel.querySelector('#tour-prev')?.addEventListener('click', prev);
  }

  function next() {
    currentStep++;
    if (currentStep >= STEPS.length) {
      complete();
    } else {
      render();
    }
  }

  function prev() {
    if (currentStep > 0) {
      currentStep--;
      render();
    }
  }

  function complete() {
    localStorage.setItem('tour_completed', '1');
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    overlay?.remove();
    panel?.remove();
  }

  function start() {
    currentStep = 0;
    createOverlay();
    render();
  }

  // Iniciar con delay para esperar carga del portal
  setTimeout(start, 1500);

  // Expose for "show again" links
  window.startTour = () => {
    localStorage.removeItem('tour_completed');
    start();
  };
})();
