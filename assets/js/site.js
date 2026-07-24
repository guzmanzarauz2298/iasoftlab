/* IASOFTLAB — chrome del sitio: boot, cursor, navegación,
   revelados, contadores y formulario. */
(function (ISL) {
  'use strict';

  const el = ISL.el;

  /* ── secuencia de arranque ─────────────────────────────── */
  ISL.initBoot = function () {
    const boot = ISL.$('#boot');
    const log = ISL.$('#boot-log');
    const bar = ISL.$('#boot-bar');
    if (!boot) return;

    const steps = [
      'Cargando modelos de dominio…',
      'Indexando 10 rubros…',
      'Calibrando el compilador…',
      'Laboratorio listo.'
    ];

    if (ISL.prefersReducedMotion()) { boot.classList.add('is-done'); return; }

    let i = 0;
    const advance = () => {
      log.textContent = steps[i];
      bar.style.width = ((i + 1) / steps.length) * 100 + '%';
      i++;
      if (i < steps.length) setTimeout(advance, 260);
      else setTimeout(() => boot.classList.add('is-done'), 420);
    };
    advance();
  };

  /* ── cursor reactivo ───────────────────────────────────── */
  ISL.initCursor = function () {
    const cursor = ISL.$('#cursor');
    if (!cursor || !window.matchMedia('(pointer: fine)').matches || ISL.prefersReducedMotion()) return;

    const ring = cursor.querySelector('.cursor__ring');
    const dot = cursor.querySelector('.cursor__dot');
    const label = cursor.querySelector('.cursor__label');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;

    ISL.on(document, 'pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    }, { passive: true });

    (function follow() {
      rx = ISL.lerp(rx, x, 0.16);
      ry = ISL.lerp(ry, y, 0.16);
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      label.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%, 26px)';
      requestAnimationFrame(follow);
    })();

    const interactive = 'a, button, input, textarea, select, [data-cursor]';
    ISL.on(document, 'pointerover', (e) => {
      const hit = e.target.closest && e.target.closest(interactive);
      if (!hit) return;
      cursor.classList.add('is-active');
      label.textContent = hit.dataset.cursor || '';
    });
    ISL.on(document, 'pointerout', (e) => {
      if (e.target.closest && e.target.closest(interactive)) {
        cursor.classList.remove('is-active');
        label.textContent = '';
      }
    });
  };

  /* ── navegación: sticky, scroll-spy, drawer, riel ──────── */
  ISL.initNav = function () {
    const nav = ISL.$('#nav');
    const rail = ISL.$('#scroll-rail');
    const links = ISL.$$('.nav__links a');
    const sections = links.map((a) => ISL.$('#' + a.dataset.spy)).filter(Boolean);

    const onScroll = ISL.raf(() => {
      const y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 40);

      const doc = document.documentElement;
      const max = doc.scrollHeight - innerHeight;
      if (rail) rail.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

      let current = -1;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= innerHeight * 0.4) current = i;
      });
      links.forEach((a, i) => a.classList.toggle('is-current', i === current));
    });

    ISL.on(window, 'scroll', onScroll, { passive: true });
    onScroll();

    const toggle = ISL.$('#nav-toggle');
    const drawer = ISL.$('#nav-drawer');
    if (!toggle || !drawer) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) drawer.querySelector('a').focus();
    };
    ISL.on(toggle, 'click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    ISL.on(drawer, 'click', (e) => { if (e.target.tagName === 'A') setOpen(false); });
    ISL.on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) { setOpen(false); toggle.focus(); }
    });
  };

  /* ── revelado al entrar en viewport ────────────────────── */
  ISL.initReveals = function () {
    const targets = [
      '.section__head', '.dial', '.dial__nav', '.lab__picker', '.lab__canvas',
      '.lab__readout', '.console', '.figure', '.contacto__aside', '.form', '.hero__copy'
    ];
    let i = 0;
    targets.forEach((sel) => {
      ISL.$$(sel).forEach((node) => {
        node.setAttribute('data-reveal', '');
        node.style.setProperty('--delay', (i % 4) * 70 + 'ms');
        i++;
        ISL.onEnter(node, (n) => n.classList.add('is-in'), 0.15);
      });
    });
  };

  /* ── contadores de la banda de impacto ─────────────────── */
  ISL.initOdometers = function () {
    ISL.$$('[data-odometer]').forEach((node) => {
      const target = parseInt(node.dataset.odometer, 10);
      ISL.onEnter(node, () => {
        if (ISL.prefersReducedMotion() || target === 0) { node.textContent = target; return; }
        const start = performance.now();
        const dur = 1100;
        const tick = (now) => {
          const t = ISL.clamp((now - start) / dur, 0, 1);
          node.textContent = Math.round(ISL.easeOutCubic(t) * target);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 0.6);
    });
  };

  /* ── ticker del hero ───────────────────────────────────── */
  ISL.initTicker = function () {
    const track = ISL.$('#ticker-track');
    if (!track) return;
    const items = ISL.tickerItems.concat(ISL.tickerItems); // duplicado para loop continuo
    items.forEach((t) => track.appendChild(el('span', { text: t })));
  };

  /* ── formulario de contacto ────────────────────────────── */
  ISL.initForm = function () {
    const form = ISL.$('#contact-form');
    if (!form) return;

    const select = ISL.$('#f-rubro');
    const mensaje = ISL.$('#f-mensaje');
    const status = ISL.$('#form-status');
    let mensajeTouched = false;

    ISL.industries.forEach((ind) => {
      select.appendChild(el('option', { value: ind.id, text: ind.full }));
    });

    /* El formulario hereda lo que el usuario armó arriba. */
    const sync = () => {
      const state = ISL.store.get();
      select.value = state.industry.id;
      if (mensajeTouched) return;
      const caps = state.capabilities
        .map((id) => ISL.capabilities.find((c) => c.id === id))
        .filter(Boolean).map((c) => c.name);
      mensaje.value = caps.length
        ? 'Rubro: ' + state.industry.full + '.\nCapacidades de interés: ' + caps.join(', ') + '.\n\n'
        : 'Rubro: ' + state.industry.full + '.\n\n';
    };

    ISL.store.subscribe(sync);
    sync();

    ISL.on(mensaje, 'input', () => { mensajeTouched = true; });
    ISL.on(select, 'change', () => {
      const ind = ISL.industries.find((i) => i.id === select.value);
      if (ind) ISL.store.set({ industry: ind }, 'form');
    });

    const rules = {
      nombre:  (v) => v.trim().length >= 2 || 'Escribí tu nombre completo.',
      email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Revisá el email: falta el dominio o el @.',
      empresa: (v) => v.trim().length >= 2 || 'Necesitamos el nombre de la empresa.',
      mensaje: (v) => v.trim().length >= 12 || 'Contanos un poco más: al menos una frase.'
    };

    const showError = (name, message) => {
      const input = form.elements[name];
      const box = ISL.$('#e-' + name);
      const field = input.closest('.field');
      field.classList.toggle('has-error', Boolean(message));
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      box.hidden = !message;
      box.textContent = message || '';
    };

    Object.keys(rules).forEach((name) => {
      ISL.on(form.elements[name], 'blur', () => {
        const res = rules[name](form.elements[name].value);
        showError(name, res === true ? '' : res);
      });
    });

    ISL.on(form, 'submit', (e) => {
      e.preventDefault();
      let firstBad = null;

      Object.keys(rules).forEach((name) => {
        const res = rules[name](form.elements[name].value);
        showError(name, res === true ? '' : res);
        if (res !== true && !firstBad) firstBad = form.elements[name];
      });

      if (firstBad) {
        status.textContent = 'Revisá los campos marcados.';
        status.classList.add('is-error');
        firstBad.focus();
        return;
      }

      status.classList.remove('is-error');
      status.textContent = 'Enviando…';

      // Sin backend: se confirma en el cliente y queda el dato listo para integrar.
      setTimeout(() => {
        status.textContent = '✓ Recibido. Te escribimos dentro de las próximas 24 h hábiles.';
        form.reset();
        mensajeTouched = false;
        sync();
      }, 700);
    });
  };

})(window.ISL);
