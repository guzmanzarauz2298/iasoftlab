/* IASOFTLAB — producto Vision.
   Demo interactiva: una escena de cámara esquemática donde la "IA" marca
   patrones por rubro. Todo es una demostración estilizada, no una cámara real
   ni imágenes de personas. Corre entero en el navegador. */
(function (ISL) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const el = ISL.el;

  function svg(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  }

  /* box: [x, y, w, h] en el espacio del viewBox (320×200). sev: crit|warn|info. */
  const RUBROS = [
    { id: 'salud', label: 'Geriatría · Salud', scene: 'Habitación · Piso 2', patterns: [
      { label: 'Caída detectada', sev: 'crit', conf: 98, box: [46, 118, 82, 52] },
      { label: 'Deambulación nocturna', sev: 'warn', conf: 87, box: [214, 66, 52, 92] },
      { label: 'Sin movimiento · 22 min', sev: 'info', conf: 80, box: [140, 58, 46, 60] }
    ]},
    { id: 'retail', label: 'Retail', scene: 'Local · Salón', patterns: [
      { label: 'Hurto potencial', sev: 'crit', conf: 91, box: [40, 84, 52, 84] },
      { label: 'Aglomeración en caja', sev: 'warn', conf: 84, box: [166, 104, 128, 66] },
      { label: 'Góndola vacía', sev: 'info', conf: 96, box: [206, 30, 96, 40] }
    ]},
    { id: 'logistica', label: 'Logística', scene: 'Depósito · Playa de carga', patterns: [
      { label: 'EPP faltante · casco', sev: 'crit', conf: 94, box: [44, 66, 54, 96] },
      { label: 'Zona peligrosa invadida', sev: 'crit', conf: 89, box: [150, 112, 150, 58] },
      { label: 'Paquete dañado', sev: 'info', conf: 92, box: [212, 36, 72, 46] }
    ]},
    { id: 'manufactura', label: 'Manufactura', scene: 'Línea 2 · Inspección', patterns: [
      { label: 'Defecto en pieza', sev: 'crit', conf: 97, box: [128, 70, 62, 48] },
      { label: 'EPP faltante', sev: 'warn', conf: 90, box: [38, 80, 54, 86] },
      { label: 'Invasión zona de máquina', sev: 'crit', conf: 92, box: [206, 112, 104, 58] }
    ]},
    { id: 'agro', label: 'Agro', scene: 'Lote 4 · Vista aérea', patterns: [
      { label: 'Plaga detectada', sev: 'crit', conf: 90, box: [54, 58, 62, 56] },
      { label: 'Estrés hídrico', sev: 'warn', conf: 85, box: [168, 100, 132, 70] },
      { label: 'Conteo de ganado · 214', sev: 'info', conf: 93, box: [210, 34, 92, 46] }
    ]},
    { id: 'gastronomia', label: 'Gastronomía', scene: 'Cocina + Salón', patterns: [
      { label: 'Lavado de manos omitido', sev: 'crit', conf: 89, box: [42, 74, 54, 88] },
      { label: 'Aforo superado', sev: 'warn', conf: 84, box: [150, 96, 150, 74] },
      { label: 'Mesa lista para limpiar', sev: 'info', conf: 91, box: [216, 38, 84, 46] }
    ]},
    { id: 'inmobiliaria', label: 'Construcción', scene: 'Obra · Nivel 3', patterns: [
      { label: 'EPP faltante · arnés', sev: 'crit', conf: 93, box: [46, 66, 54, 96] },
      { label: 'Avance de obra · 62%', sev: 'info', conf: 95, box: [156, 48, 144, 58] },
      { label: 'Intrusión fuera de horario', sev: 'warn', conf: 87, box: [206, 120, 84, 48] }
    ]},
    { id: 'finanzas', label: 'Finanzas', scene: 'Sucursal · Cajeros', patterns: [
      { label: 'Merodeo en cajero', sev: 'warn', conf: 86, box: [56, 80, 54, 88] },
      { label: 'Aforo · 12 personas', sev: 'info', conf: 97, box: [138, 92, 162, 78] }
    ]},
    { id: 'educacion', label: 'Educación', scene: 'Campus · Perímetro', patterns: [
      { label: 'Intrusión perimetral', sev: 'crit', conf: 88, box: [40, 90, 60, 80] },
      { label: 'Objeto abandonado', sev: 'warn', conf: 83, box: [176, 112, 54, 46] },
      { label: 'Aforo por aula', sev: 'info', conf: 96, box: [228, 48, 82, 52] }
    ]},
    { id: 'legal', label: 'Legal', scene: 'Archivo · Acceso', patterns: [
      { label: 'Acceso no autorizado', sev: 'crit', conf: 90, box: [66, 68, 58, 92] },
      { label: 'Aforo sala de audiencia', sev: 'info', conf: 95, box: [158, 84, 142, 82] }
    ]}
  ];

  const SEV = {
    crit: 'Crítico',
    warn: 'Atención',
    info: 'Informativo'
  };

  function Vision() {
    this.tabsHost = ISL.$('#vision-tabs');
    this.view = ISL.$('#vcam-view');
    this.patternsHost = ISL.$('#vision-patterns');
    this.sceneEl = ISL.$('#vcam-scene');
    this.countEl = ISL.$('#vcam-count');
    this.clockEl = ISL.$('#vcam-clock');
    this.index = 0;
    this.tabs = [];
    if (!this.tabsHost || !this.view) return;

    this.buildTabs();
    this.select(0, { silent: true });
    this.startClock();
    this.bind();
  }

  Vision.prototype.buildTabs = function () {
    RUBROS.forEach((r, i) => {
      const btn = el('button', {
        class: 'vtab', type: 'button', role: 'tab',
        id: 'vtab-' + r.id, 'aria-selected': 'false', tabindex: '-1',
        text: r.label, 'data-cursor': 'Ver rubro',
        onclick: () => this.select(i)
      });
      this.tabs.push(btn);
      this.tabsHost.appendChild(btn);
    });
  };

  Vision.prototype.bind = function () {
    ISL.on(this.tabsHost, 'keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); this.select(this.index + step); }
      else if (e.key === 'Home') { e.preventDefault(); this.select(0); }
      else if (e.key === 'End') { e.preventDefault(); this.select(RUBROS.length - 1); }
    });
  };

  Vision.prototype.select = function (i, opts) {
    const n = RUBROS.length;
    this.index = ((i % n) + n) % n;
    const r = RUBROS[this.index];

    this.tabs.forEach((b, k) => {
      const on = k === this.index;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });

    if (this.sceneEl) this.sceneEl.textContent = r.scene;
    if (this.countEl) this.countEl.textContent = r.patterns.length;

    this.drawScene(r);
    this.renderPatterns(r);

    if (!(opts && opts.silent)) {
      const active = this.tabs[this.index];
      if (active && this.tabsHost.contains(document.activeElement)) active.focus();
      active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  };

  /* ── escena SVG: grilla de calibración + recuadros de detección ── */
  Vision.prototype.drawScene = function (r) {
    const W = 320, H = 200;
    this.view.replaceChildren();

    // grilla
    const grid = svg('g', { class: 'vcam__grid' });
    for (let x = 40; x < W; x += 40) grid.appendChild(svg('line', { x1: x, y1: 0, x2: x, y2: H }));
    for (let y = 40; y < H; y += 40) grid.appendChild(svg('line', { x1: 0, y1: y, x2: W, y2: y }));
    this.view.appendChild(grid);

    // detecciones
    r.patterns.forEach((p, i) => {
      const [x, y, w, h] = p.box;
      const g = svg('g', { class: 'det det--' + p.sev, style: '--d:' + (140 + i * 130) + 'ms' });

      g.appendChild(svg('rect', { class: 'det__box', x: x, y: y, width: w, height: h, rx: 2 }));

      // esquinas de tracking
      const c = 7;
      const corners = [
        ['M', x, y + c, 'L', x, y, 'L', x + c, y],
        ['M', x + w - c, y, 'L', x + w, y, 'L', x + w, y + c],
        ['M', x + w, y + h - c, 'L', x + w, y + h, 'L', x + w - c, y + h],
        ['M', x + c, y + h, 'L', x, y + h, 'L', x, y + h - c]
      ];
      corners.forEach((d) => g.appendChild(svg('path', { class: 'det__corner', d: d.join(' ') })));

      // etiqueta
      const padX = 4, fs = 8;
      const tw = Math.round(p.label.length * 4.5) + padX * 2;
      const tagY = y - 13 < 2 ? y + 2 : y - 13;
      const tagX = Math.min(x, W - tw - 1);
      const tag = svg('g', { class: 'det__tag', transform: 'translate(' + tagX + ',' + tagY + ')' });
      tag.appendChild(svg('rect', { class: 'det__pill', x: 0, y: 0, width: tw, height: 12, rx: 1 }));
      const t = svg('text', { class: 'det__label', x: padX, y: 8.6 });
      t.textContent = p.label;
      tag.appendChild(t);
      g.appendChild(tag);

      // confianza
      const conf = svg('text', { class: 'det__conf', x: x + w - 2, y: y + h - 3, 'text-anchor': 'end' });
      conf.textContent = p.conf + '%';
      g.appendChild(conf);

      this.view.appendChild(g);
    });
  };

  Vision.prototype.renderPatterns = function (r) {
    this.patternsHost.replaceChildren(...r.patterns.map((p) =>
      el('li', { class: 'vpat vpat--' + p.sev }, [
        el('span', { class: 'vpat__dot', 'aria-hidden': 'true' }),
        el('span', { class: 'vpat__label', text: p.label }),
        el('span', { class: 'vpat__sev mono', text: SEV[p.sev] }),
        el('span', { class: 'vpat__conf mono', text: p.conf + '%' })
      ])
    ));
  };

  /* reloj de cámara: arranca en un horario cualquiera y avanza en vivo */
  Vision.prototype.startClock = function () {
    if (!this.clockEl || ISL.prefersReducedMotion()) {
      if (this.clockEl) this.clockEl.textContent = '21:47:03';
      return;
    }
    let t = 21 * 3600 + 47 * 60 + 3;
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      t = (t + 1) % 86400;
      this.clockEl.textContent = pad((t / 3600) | 0) + ':' + pad(((t % 3600) / 60) | 0) + ':' + pad(t % 60);
    };
    tick();
    setInterval(tick, 1000);
  };

  ISL.initVision = function () { ISL.vision = new Vision(); };

})(window.ISL);
