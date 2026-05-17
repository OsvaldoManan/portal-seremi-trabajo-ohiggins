/* Reveal-on-scroll animations + UI polish.
   Auto-attaches .reveal to common content cards if not present. */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  function autoTagReveal() {
    var selectors = [
      '.kpi',
      '.chart-card',
      '.pillar',
      '.info-card',
      '.objective-card',
      '.line-card',
      '.priority-card',
      '.value-card',
      '.metric-card',
      '.feature-card',
      '.gallery-item',
      '.event-card',
      '.section-head',
      '.tile',
      '.profile-card',
      '.timeline-item'
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
          el.style.transitionDelay = Math.min(i % 8, 8) * 60 + 'ms';
        }
      });
    });
  }

  function observeReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  }

  function elevateHeaderOnScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function smoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.length < 2) return;
      a.addEventListener('click', function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', href);
      });
    });
  }

  ready(function () {
    autoTagReveal();
    observeReveal();
    elevateHeaderOnScroll();
    smoothAnchors();
  });
})();
