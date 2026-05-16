// ============== UTILS COMUNES ==============
const Utils = {
  formatNumber(n, decimals = 0) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(n);
  },
  formatMoney(n, prefix = '$') {
    if (n === null || n === undefined || isNaN(n)) return '—';
    if (Math.abs(n) >= 1e9) return `${prefix}${(n/1e9).toFixed(1)}MM`;
    if (Math.abs(n) >= 1e6) return `${prefix}${(n/1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `${prefix}${(n/1e3).toFixed(0)}K`;
    return `${prefix}${this.formatNumber(n)}`;
  },
  async loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
    return res.json();
  },
  truncate(s, n = 40) {
    if (!s) return '';
    return s.length > n ? s.slice(0, n) + '…' : s;
  },
  // Counter animation
  animateCounter(el, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();
    function step(t) {
      const elapsed = t - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = new Intl.NumberFormat('es-CL').format(val);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
};

// ============== CHART DEFAULTS ==============
if (typeof Chart !== 'undefined') {
  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = '#495467';
  Chart.defaults.plugins.legend.position = 'bottom';
  Chart.defaults.plugins.legend.labels.padding = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(26,35,50,.95)';
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
}

// ============== PALETA INSTITUCIONAL ==============
const PALETTE = {
  primary: '#0F3F8C',
  primaryDark: '#0A2D6B',
  primaryLight: '#1E5BB8',
  red: '#C0192B',
  yellow: '#FFD200',
  green: '#2E7D32',
  orange: '#F57C00',
  gray: '#6B7280',
  // Categóricos
  categorical: [
    '#0F3F8C','#C0192B','#FFD200','#2E7D32','#F57C00',
    '#7B1FA2','#0288D1','#5D4037','#E91E63','#00838F',
    '#558B2F','#AD1457','#1976D2','#388E3C','#FBC02D',
    '#6A1B9A','#0097A7','#BF360C'
  ]
};

// ============== MOBILE NAV ==============
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Animar contadores de hero
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const target = parseInt(e.target.dataset.counter, 10);
          Utils.animateCounter(e.target, target);
          obs.unobserve(e.target);
        }
      });
    });
    counters.forEach(c => obs.observe(c));
  }
});

// Expose globally
window.Utils = Utils;
window.PALETTE = PALETTE;
