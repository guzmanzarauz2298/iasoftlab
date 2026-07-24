/* IASOFTLAB — compilador de soluciones.
   Las capacidades elegidas generan el diagrama de arquitectura,
   el cronograma y el impacto estimado. Todo se recalcula en vivo. */
(function (ISL) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const el = ISL.el;

  function svg(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  const byId = (id) => ISL.capabilities.find((c) => c.id === id);

  /* Fuentes y salidas que se desprenden de las capacidades activas.
     Lo usan los dos renderers: el SVG y la versión apilada de mobile. */
  function groups(caps) {
    const uniq = (arr) => Array.from(new Set(arr));
    return {
      sources: uniq(caps.flatMap((c) => c.inputs)).slice(0, 5),
      outputs: uniq(caps.flatMap((c) => c.outputs)).slice(0, 5)
    };
  }

  function Compiler() {
    this.chipsHost = ISL.$('#lab-chips');
    this.arch = ISL.$('#lab-arch');
    this.flow = ISL.$('#lab-flow');
    this.empty = ISL.$('#lab-empty');
    this.stamp = ISL.$('#lab-stamp');
    this.meter = ISL.$('#lab-meter');
    this.note = ISL.$('#lab-note');
    this.counterEl = ISL.$('#lab-selected-count');
    this.live = ISL.$('#lab-live');
    this.readouts = {
      weeks: ISL.$('[data-count="weeks"]'),
      impact: ISL.$('[data-count="impact"]')
    };
    this.shown = { weeks: 0, impact: 0 };
    this.selected = [];
    this.autoFollowIndustry = true;
    this.chips = {};

    if (!this.chipsHost) return;
    this.build();
    this.bind();
    this.applyRecommended();
  }

  Compiler.prototype.build = function () {
    ISL.capabilities.forEach((cap) => {
      const chip = el('button', {
        class: 'chip',
        type: 'button',
        'aria-pressed': 'false',
        'data-cursor': 'Alternar',
        onclick: () => { this.autoFollowIndustry = false; this.toggle(cap.id); }
      }, [
        el('b', { text: cap.name }),
        el('span', { text: cap.desc })
      ]);
      this.chips[cap.id] = chip;
      this.chipsHost.appendChild(chip);
    });
  };

  Compiler.prototype.bind = function () {
    const preset = ISL.$('#lab-preset-industry');
    if (preset) ISL.on(preset, 'click', () => {
      this.autoFollowIndustry = true;
      this.applyRecommended();
    });

    const clear = ISL.$('[data-preset="clear"]');
    if (clear) ISL.on(clear, 'click', () => {
      this.autoFollowIndustry = false;
      this.selected = [];
      this.render();
    });

    ISL.store.subscribe((state, patch, origin) => {
      if (!patch.industry || origin === 'compiler') return;
      if (this.autoFollowIndustry) this.applyRecommended();
    });
  };

  Compiler.prototype.applyRecommended = function () {
    const ind = ISL.store.get().industry;
    this.selected = (ind.recommends || []).slice();
    this.render();
  };

  Compiler.prototype.toggle = function (id) {
    const i = this.selected.indexOf(id);
    if (i === -1) this.selected.push(id); else this.selected.splice(i, 1);
    this.render();
  };

  /* ── estimaciones ──────────────────────────────────────── */
  Compiler.prototype.estimate = function (caps) {
    const n = caps.length;
    if (!n) return { weeks: 0, impact: 0, load: 0 };

    const sumWeeks = caps.reduce((a, c) => a + c.weeks, 0);
    const sumImp   = caps.reduce((a, c) => a + c.impact, 0);
    const sumLoad  = caps.reduce((a, c) => a + c.load, 0);

    return {
      // el trabajo se solapa: no se suman las semanas completas
      weeks: Math.round(3 + sumWeeks * 0.55),
      // retornos decrecientes, techo realista
      impact: Math.min(58, Math.round(sumImp * (1 - Math.min(0.3, 0.07 * (n - 1))))),
      load: sumLoad
    };
  };

  /* ── diagrama ──────────────────────────────────────────── */
  Compiler.prototype.drawArch = function (caps) {
    const W = 720, H = 460;
    // conserva el <title> accesible y limpia el resto
    Array.from(this.arch.querySelectorAll(':scope > *:not(title)')).forEach((n) => n.remove());
    if (!caps.length) return;

    const sources = groups(caps).sources;
    const outputs = groups(caps).outputs;

    const columns = [
      { key: 'src',  x: 96,  items: sources, label: 'Fuentes' },
      { key: 'core', x: 360, items: caps.map((c) => c.short), label: 'Núcleo IA' },
      { key: 'out',  x: 624, items: outputs, label: 'Salidas' }
    ];

    const positions = {};
    const BW = 152, BH = 34;

    columns.forEach((col) => {
      svgText(this.arch, col.x - BW / 2, 26, col.label.toUpperCase(), 'layer-label');
      const n = col.items.length;
      const span = Math.min(340, n * 62);
      const top = (H - span) / 2 + 20;
      positions[col.key] = col.items.map((label, i) => {
        const y = n === 1 ? H / 2 : top + (span / (n - 1)) * i;
        return { x: col.x, y: y, label: label };
      });
    });

    // enlaces primero, para que queden por debajo de las cajas
    caps.forEach((cap, ci) => {
      const core = positions.core[ci];
      cap.inputs.forEach((inp) => {
        const src = positions.src.find((p) => p.label === inp);
        if (src) this.arch.appendChild(link(src, core, BW, ci));
      });
      cap.outputs.forEach((out) => {
        const dst = positions.out.find((p) => p.label === out);
        if (dst) this.arch.appendChild(link(core, dst, BW, ci));
      });
    });

    columns.forEach((col) => {
      positions[col.key].forEach((p, i) => {
        const isCore = col.key === 'core';
        const g = svg('g', { class: 'node-in', style: 'animation-delay:' + (i * 45 + (isCore ? 120 : 0)) + 'ms' });
        g.appendChild(svg('rect', {
          class: 'node-box' + (isCore ? ' is-core' : ''),
          x: p.x - BW / 2, y: p.y - BH / 2, width: BW, height: BH, rx: 2
        }));
        const t = svg('text', { class: 'node-label', x: p.x, y: p.y + (isCore ? 0 : 3.5), 'text-anchor': 'middle' });
        t.textContent = p.label;
        g.appendChild(t);
        if (isCore) {
          const s = svg('text', { class: 'node-sub', x: p.x, y: p.y + 11, 'text-anchor': 'middle' });
          s.textContent = 'módulo ' + String(i + 1).padStart(2, '0');
          g.appendChild(s);
        }
        this.arch.appendChild(g);
      });
    });

    function link(a, b, boxW, i) {
      const x1 = a.x + boxW / 2, x2 = b.x - boxW / 2;
      const mid = (x2 - x1) * 0.5;
      const d = 'M' + x1 + ' ' + a.y + ' C' + (x1 + mid) + ' ' + a.y + ', ' + (x2 - mid) + ' ' + b.y + ', ' + x2 + ' ' + b.y;
      return svg('path', { class: 'link is-live', d: d, style: 'animation-delay:' + (i * 90) + 'ms' });
    }

    function svgText(host, x, y, text, cls) {
      const t = svg('text', { class: cls, x: x, y: y });
      t.textContent = text;
      host.appendChild(t);
    }
  };

  /* ── arquitectura apilada, para pantallas angostas ─────── */
  Compiler.prototype.drawFlow = function (caps) {
    if (!this.flow) return;
    this.flow.replaceChildren();
    if (!caps.length) return;

    const { sources, outputs } = groups(caps);

    const layer = (label, items, isCore) => el('div', { class: 'flow__layer' }, [
      el('p', { class: 'flow__label', text: label }),
      el('div', { class: 'flow__items' }, items.map((text, i) => {
        const item = el('span', { class: 'flow__item' + (isCore ? ' flow__item--core' : '') });
        if (isCore) item.appendChild(el('i', { text: String(i + 1).padStart(2, '0') }));
        item.appendChild(document.createTextNode(text));
        return item;
      }))
    ]);

    const arrow = () => el('div', { class: 'flow__arrow', text: '▼' });

    this.flow.append(
      layer('Fuentes', sources),
      arrow(),
      layer('Núcleo IA', caps.map((c) => c.short), true),
      arrow(),
      layer('Salidas', outputs)
    );
  };

  /* ── contadores ────────────────────────────────────────── */
  Compiler.prototype.animateCounts = function (target) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const from = Object.assign({}, this.shown);
    const start = performance.now();
    const dur = ISL.prefersReducedMotion() ? 0 : 520;

    const tick = (now) => {
      const t = dur === 0 ? 1 : ISL.clamp((now - start) / dur, 0, 1);
      const e = ISL.easeOutCubic(t);
      Object.keys(this.readouts).forEach((k) => {
        const v = Math.round(ISL.lerp(from[k], target[k], e));
        this.shown[k] = v;
        if (this.readouts[k]) this.readouts[k].textContent = v;
      });
      if (t < 1) this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  };

  /* ── render ────────────────────────────────────────────── */
  Compiler.prototype.render = function () {
    const caps = this.selected.map(byId).filter(Boolean);

    Object.entries(this.chips).forEach(([id, chip]) => {
      chip.setAttribute('aria-pressed', this.selected.indexOf(id) !== -1 ? 'true' : 'false');
    });

    const est = this.estimate(caps);
    this.animateCounts(est);
    // se dibujan los dos; el CSS decide cuál se ve según el ancho
    this.drawArch(caps);
    this.drawFlow(caps);

    const n = caps.length;
    this.counterEl.textContent = n === 0 ? '0 seleccionadas' : n + (n === 1 ? ' seleccionada' : ' seleccionadas');
    this.empty.classList.toggle('is-hidden', n > 0);
    this.stamp.textContent = n === 0 ? 'en espera' : 'compilado · ' + n + ' módulos';

    const pct = ISL.clamp(Math.round((est.load / 18) * 100), 0, 100);
    this.meter.style.width = pct + '%';
    this.meter.classList.toggle('is-high', pct > 70);

    const ind = ISL.store.get().industry;
    this.note.textContent = n === 0
      ? 'Sin capacidades seleccionadas.'
      : pct > 70
        ? 'Alta: conviene partir en dos fases. Arrancamos por ' + caps[0].short.toLowerCase() + ' en ' + ind.name.toLowerCase() + '.'
        : pct > 40
          ? 'Media: una sola fase, con integración progresiva a tus sistemas.'
          : 'Baja: se integra sobre tu stack actual sin migraciones.';

    /* Un único anuncio por render: los contadores animados no deben leerse
       frame por frame. */
    if (this.live) {
      this.live.textContent = n === 0
        ? 'Sin capacidades seleccionadas.'
        : n + ' capacidades. Prototipo en ' + est.weeks + ' semanas, ahorro estimado ' +
          est.impact + ' por ciento.';
    }

    ISL.store.set({ capabilities: this.selected.slice() }, 'compiler');
  };

  ISL.initCompiler = function () { ISL.compiler = new Compiler(); };

})(window.ISL);
