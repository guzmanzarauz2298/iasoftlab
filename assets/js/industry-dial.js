/* IASOFTLAB — disco orbital de rubros.
   Navegación radial en lugar de grilla: los items se reposicionan
   sobre la circunferencia para que el activo quede enfrentado al panel. */
(function (ISL) {
  'use strict';

  const el = ISL.el;

  function Dial() {
    this.items = ISL.$('#dial-items');
    this.ring = ISL.$('#dial-ring');
    this.panel = ISL.$('#dial-panel');
    this.core = ISL.$('#dial-core-code');
    this.count = ISL.$('#dial-count');
    this.index = 0;
    this.buttons = [];

    if (!this.items || !this.panel) return;
    this.build();
    this.select(0, { silent: true });
    this.bind();
  }

  Dial.prototype.build = function () {
    ISL.industries.forEach((ind, i) => {
      const btn = el('button', {
        class: 'dial__item',
        type: 'button',
        role: 'tab',
        id: 'dial-tab-' + ind.id,
        'aria-selected': 'false',
        'aria-controls': 'dial-panel',
        tabindex: '-1',
        text: ind.name,
        'data-cursor': 'Ver rubro',
        onclick: () => this.select(i)
      });
      this.buttons.push(btn);
      this.items.appendChild(btn);
    });
    this.layout();
  };

  /* Reparte los botones sobre la circunferencia; el activo va a 0° (derecha).
     Dos órbitas alternadas por índice: separa radialmente a los vecinos y
     evita que las etiquetas largas se pisen. */
  Dial.prototype.layout = function () {
    if (Dial.compact()) {
      this.buttons.forEach((b) => { b.style.removeProperty('--x'); b.style.removeProperty('--y'); });
      return;
    }
    const size = this.ring.getBoundingClientRect().width;
    if (!size) return;
    const half = size / 2;
    const n = this.buttons.length;

    this.buttons.forEach((btn, i) => {
      const a = ((i - this.index) / n) * Math.PI * 2;
      const r = half * (i % 2 === 0 ? 0.86 : 0.62);
      btn.style.setProperty('--x', (Math.cos(a) * r).toFixed(1) + 'px');
      btn.style.setProperty('--y', (Math.sin(a) * r).toFixed(1) + 'px');
    });
  };

  Dial.compact = () => window.matchMedia('(max-width: 1024px)').matches;

  Dial.prototype.select = function (i, opts) {
    const n = ISL.industries.length;
    this.index = ((i % n) + n) % n;
    const ind = ISL.industries[this.index];

    this.buttons.forEach((b, k) => {
      const on = k === this.index;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });

    this.layout();
    this.renderPanel(ind);
    if (this.core) this.core.textContent = ind.code;
    if (this.count) this.count.textContent = String(this.index + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');

    ISL.store.set({ industry: ind }, 'dial');

    if (!opts || !opts.silent) {
      const active = this.buttons[this.index];
      if (active && document.activeElement !== active && this.items.contains(document.activeElement)) active.focus();
      if (Dial.compact() && active) {
        active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    }
  };

  Dial.prototype.renderPanel = function (ind) {
    const modules = el('ul', { class: 'panel__modules' },
      ind.modules.map((m, i) => el('li', {}, [
        el('i', { text: String(i + 1).padStart(2, '0') }),
        el('div', {}, [
          el('b', { text: m[0] }),
          el('span', { text: m[1] })
        ])
      ]))
    );

    const metrics = el('div', { class: 'panel__metrics' },
      ind.metrics.map((m) => el('div', { class: 'panel__metric' }, [
        el('b', { html: m[0] + (m[1] ? '<small>' + m[1] + '</small>' : '') }),
        el('span', { text: m[2] })
      ]))
    );

    const stack = el('div', { class: 'panel__stack' },
      ind.stack.map((t) => el('span', { class: 'tag', text: t }))
    );

    const panel = el('div', { class: 'panel-anim' }, [
      el('div', { class: 'panel__head' }, [
        el('span', { class: 'panel__code', text: ind.code + '-01' }),
        el('span', { class: 'panel__full', text: ind.full })
      ]),
      el('h3', { class: 'panel__claim', text: ind.claim }),
      el('p', { class: 'panel__body', text: ind.body }),
      modules,
      metrics,
      stack
    ]);

    this.panel.setAttribute('role', 'tabpanel');
    this.panel.setAttribute('tabindex', '0'); // el panel no tiene foco propio adentro
    this.panel.setAttribute('aria-labelledby', 'dial-tab-' + ind.id);
    this.panel.replaceChildren(panel);
  };

  Dial.prototype.bind = function () {
    ISL.on(this.items, 'keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (keys[e.key]) { e.preventDefault(); this.select(this.index + keys[e.key]); }
      else if (e.key === 'Home') { e.preventDefault(); this.select(0); }
      else if (e.key === 'End') { e.preventDefault(); this.select(ISL.industries.length - 1); }
    });

    ISL.$$('[data-dial]').forEach((btn) => {
      ISL.on(btn, 'click', () => {
        this.select(this.index + (btn.dataset.dial === 'next' ? 1 : -1));
      });
    });

    ISL.on(window, 'resize', ISL.debounce(() => this.layout(), 160));
  };

  ISL.initDial = function () { ISL.dial = new Dial(); };

})(window.ISL);
