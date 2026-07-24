/* IASOFTLAB — utilidades compartidas y bus de estado. */
(function (ISL) {
  'use strict';

  ISL.$  = (sel, root) => (root || document).querySelector(sel);
  ISL.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  ISL.el = function (tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === false || v === null || v === undefined) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach((c) => node.appendChild(c));
    return node;
  };

  ISL.clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  ISL.lerp  = (a, b, t) => a + (b - a) * t;
  ISL.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  ISL.prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ISL.on = (target, type, fn, opts) => target.addEventListener(type, fn, opts);

  /* Ejecuta fn como máximo una vez por frame. */
  ISL.raf = function (fn) {
    let queued = false, lastArgs;
    return function () {
      lastArgs = arguments;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fn.apply(null, lastArgs); });
    };
  };

  ISL.debounce = function (fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  };

  /* Observa la entrada de un elemento en viewport una sola vez. */
  ISL.onEnter = function (node, fn, threshold) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        fn(e.target);
      });
    }, { threshold: threshold || 0.25 });
    io.observe(node);
  };

  /* ── bus de estado mínimo ────────────────────────────────
     Un único estado compartido: el rubro elegido y las
     capacidades compiladas. Cada módulo se suscribe a lo suyo. */
  ISL.store = (function () {
    const state = { industry: ISL.industries[0], capabilities: [] };
    const subs = [];
    return {
      get: () => state,
      subscribe(fn) { subs.push(fn); return () => subs.splice(subs.indexOf(fn), 1); },
      set(patch, origin) {
        Object.assign(state, patch);
        subs.forEach((fn) => fn(state, patch, origin));
      }
    };
  })();

})(window.ISL);
