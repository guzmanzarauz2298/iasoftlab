/* IASOFTLAB — campo de partículas del hero.
   La marca se arma con materia: cada palabra es un set de destinos
   muestreado de un canvas fuera de pantalla. El cursor empuja. */
(function (ISL) {
  'use strict';

  const WORDS = ['IA', 'SOFT', 'LAB'];
  const CYCLE_MS = 3800;

  function ParticleField(canvas, hint) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.hint = hint;
    this.particles = [];
    this.wordIndex = 0;
    this.pointer = { x: -9999, y: -9999, active: false };
    this.lastSwap = 0;
    this.running = false;

    this.sampler = document.createElement('canvas');
    this.sctx = this.sampler.getContext('2d', { willReadFrequently: true });

    this.resize();
    this.seed();
    this.setWord(0);
    this.bind();
  }

  ParticleField.prototype.resize = function () {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.sampler.width = this.w;
    this.sampler.height = this.h;
  };

  ParticleField.prototype.count = function () {
    const area = this.w * this.h;
    return ISL.clamp(Math.round(area / 260), 320, 1500);
  };

  ParticleField.prototype.seed = function () {
    const n = this.count();
    const list = [];
    for (let i = 0; i < n; i++) {
      list.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        tx: this.w / 2, ty: this.h / 2,
        vx: 0, vy: 0,
        size: Math.random() < 0.14 ? 2 : 1.4,
        accent: Math.random() < 0.12,
        drift: 0.6 + Math.random() * 0.9
      });
    }
    this.particles = list;
  };

  /* Muestrea los píxeles opacos del texto y devuelve destinos. */
  ParticleField.prototype.sample = function (word) {
    const ctx = this.sctx;
    ctx.clearRect(0, 0, this.w, this.h);

    let size = Math.min(this.h * 0.52, this.w * 0.42);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';

    const fit = () => {
      ctx.font = '700 ' + size + 'px "Segoe UI", Helvetica, Arial, sans-serif';
      return ctx.measureText(word).width;
    };
    let width = fit();
    const target = this.w * 0.78;
    if (width > 0) { size = size * (target / width); width = fit(); }

    ctx.fillText(word, this.w / 2, this.h / 2);

    const data = ctx.getImageData(0, 0, this.w, this.h).data;
    const step = this.w > 520 ? 4 : 3;
    const points = [];
    for (let y = 0; y < this.h; y += step) {
      for (let x = 0; x < this.w; x += step) {
        if (data[(y * this.w + x) * 4 + 3] > 128) points.push({ x: x, y: y });
      }
    }
    // barajado: evita que partículas contiguas ocupen zonas contiguas
    for (let i = points.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = points[i]; points[i] = points[j]; points[j] = t;
    }
    return points;
  };

  ParticleField.prototype.setWord = function (index) {
    this.wordIndex = index % WORDS.length;
    const points = this.sample(WORDS[this.wordIndex]);
    if (!points.length) return;
    this.particles.forEach((p, i) => {
      const t = points[i % points.length];
      p.tx = t.x + (Math.random() - 0.5) * 2.5;
      p.ty = t.y + (Math.random() - 0.5) * 2.5;
    });
  };

  ParticleField.prototype.bind = function () {
    const canvas = this.canvas;

    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      this.pointer.x = src.clientX - r.left;
      this.pointer.y = src.clientY - r.top;
      this.pointer.active = true;
      if (this.hint) this.hint.classList.add('is-hidden');
    };

    ISL.on(canvas, 'pointermove', move);
    ISL.on(canvas, 'pointerleave', () => { this.pointer.active = false; });
    ISL.on(canvas, 'pointerdown', (e) => { move(e); this.burst(); });

    ISL.on(window, 'resize', ISL.debounce(() => {
      this.resize();
      this.seed();
      this.setWord(this.wordIndex);
      if (!this.running) this.drawStatic();
    }, 220));
  };

  /* Empuja todo hacia afuera; los destinos siguen ahí, así que vuelve a armarse. */
  ParticleField.prototype.burst = function () {
    this.particles.forEach((p) => {
      const dx = p.x - this.pointer.x;
      const dy = p.y - this.pointer.y;
      const d = Math.max(12, Math.hypot(dx, dy));
      const f = 340 / d;
      p.vx += (dx / d) * f;
      p.vy += (dy / d) * f;
    });
  };

  ParticleField.prototype.step = function (now) {
    if (now - this.lastSwap > CYCLE_MS) {
      this.lastSwap = now;
      this.setWord(this.wordIndex + 1);
    }

    const ctx = this.ctx;
    const R = 108;
    ctx.clearRect(0, 0, this.w, this.h);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.vx += (p.tx - p.x) * 0.016 * p.drift;
      p.vy += (p.ty - p.y) * 0.016 * p.drift;

      if (this.pointer.active) {
        const dx = p.x - this.pointer.x;
        const dy = p.y - this.pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.max(8, Math.sqrt(d2));
          const f = (1 - d / R) * 5.2;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }

      p.vx *= 0.885;
      p.vy *= 0.885;
      p.x += p.vx;
      p.y += p.vy;

      ctx.fillStyle = p.accent ? '#c6f24e' : 'rgba(236,231,222,.72)';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  };

  ParticleField.prototype.drawStatic = function () {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.particles.forEach((p) => {
      ctx.fillStyle = p.accent ? '#c6f24e' : 'rgba(236,231,222,.72)';
      ctx.fillRect(p.tx, p.ty, p.size, p.size);
    });
  };

  ParticleField.prototype.start = function () {
    if (ISL.prefersReducedMotion()) { this.drawStatic(); return; }
    this.running = true;
    const loop = (now) => {
      if (!this.running) return;
      this.step(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // pausa cuando el hero sale de pantalla: nada de quemar CPU de fondo
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !this.running) { this.running = true; requestAnimationFrame(loop); }
        else if (!visible) { this.running = false; }
      }, { threshold: 0.02 }).observe(this.canvas);
    }
  };

  ISL.initHero = function () {
    const canvas = ISL.$('#hero-canvas');
    if (!canvas) return;

    const hint = ISL.$('#hero-hint');
    if (hint && window.matchMedia('(pointer: coarse)').matches) {
      hint.textContent = 'Tocá la materia';
    }

    const field = new ParticleField(canvas, hint);
    field.start();
    ISL.heroField = field;
  };

})(window.ISL);
