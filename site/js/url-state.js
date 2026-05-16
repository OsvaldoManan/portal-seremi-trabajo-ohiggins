// ============== URL STATE MANAGEMENT ==============
// Permite compartir vistas específicas del portal por URL.
// Sincroniza filtros del mapa, comparador, correlaciones y directorio con ?param=value
(function() {
  const URL_KEYS = {
    // Mapa geográfico
    'geo-indicator': { selector: '#geo-indicator', param: 'mapa' },
    'geo-palette':   { selector: '#geo-palette', param: 'paleta' },
    // Heatmap
    'map-indicator': { selector: '#map-indicator', param: 'heat' },
    // Comparador clásico
    'indicator-select': { selector: '#indicator-select', param: 'cmpind' },
    // Lado a lado
    'cmp-a': { selector: '#cmp-a', param: 'a' },
    'cmp-b': { selector: '#cmp-b', param: 'b' },
    'cmp-c': { selector: '#cmp-c', param: 'c' },
    // Correlaciones
    'corr-x': { selector: '#corr-x', param: 'x' },
    'corr-y': { selector: '#corr-y', param: 'y' },
    'corr-type': { selector: '#corr-type', param: 'reg' },
    // Directorio
    'dir-tipo': { selector: '#dir-tipo', param: 'tipo' },
    'dir-comuna': { selector: '#dir-comuna', param: 'comuna' },
    // Ficha comuna
    'comuna-select': { selector: '#comuna-select', param: 'ficha' }
  };

  // ====== TAB persistence via hash ======
  // Hash ya existe vía #tab-X, podemos forzar al cargar
  function syncTabFromHash() {
    const hash = location.hash;
    if (hash && hash.startsWith('#tab-')) {
      const tabName = hash.replace('#tab-', '');
      const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
      if (tab && !tab.classList.contains('active')) {
        tab.click();
      }
    }
  }

  // ====== URL params apply ======
  function applyParamsFromURL() {
    const params = new URLSearchParams(location.search);
    Object.entries(URL_KEYS).forEach(([id, conf]) => {
      const el = document.querySelector(conf.selector);
      const val = params.get(conf.param);
      if (el && val !== null) {
        // Try set, ignore if not valid option
        try {
          el.value = val;
          // Trigger change event so listeners update
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) { /* ignore */ }
      }
    });
  }

  // ====== Capture changes & update URL ======
  function setupListeners() {
    Object.entries(URL_KEYS).forEach(([id, conf]) => {
      const el = document.querySelector(conf.selector);
      if (!el) return;
      el.addEventListener('change', () => {
        const params = new URLSearchParams(location.search);
        if (el.value && el.value !== '') {
          params.set(conf.param, el.value);
        } else {
          params.delete(conf.param);
        }
        const newUrl = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}${location.hash}`;
        history.replaceState(null, '', newUrl);
      });
    });

    // Tab clicks update hash
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.dataset.tab;
        if (name) {
          // Use replaceState to update hash without scrolling
          history.replaceState(null, '', `${location.pathname}${location.search}#tab-${name}`);
        }
      });
    });
  }

  // ====== Add "Share view" button to controls bars ======
  function addShareButtons() {
    document.querySelectorAll('.controls-bar').forEach((bar, idx) => {
      if (bar.querySelector('.share-view-btn')) return;
      // Insertar al final
      const wrap = document.createElement('div');
      wrap.className = 'control-group';
      wrap.style.cssText = 'align-self: end;';
      wrap.innerHTML = `
        <label>&nbsp;</label>
        <button type="button" class="btn-download share-view-btn" title="Copiar URL de esta vista">🔗 Compartir vista</button>
      `;
      bar.appendChild(wrap);

      wrap.querySelector('.share-view-btn').addEventListener('click', async (e) => {
        const btn = e.target;
        const url = location.href;
        try {
          await navigator.clipboard.writeText(url);
          const originalText = btn.textContent;
          btn.textContent = '✓ URL copiada';
          btn.style.background = '#2E7D32';
          btn.style.color = 'white';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
          }, 2000);
        } catch {
          prompt('Copia este enlace:', url);
        }
      });
    });
  }

  // Init después de que el DOM y otros scripts hayan cargado
  function init() {
    syncTabFromHash();
    // Esperar un tick para que selects se hayan poblado
    setTimeout(() => {
      applyParamsFromURL();
      setupListeners();
      addShareButtons();
    }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
