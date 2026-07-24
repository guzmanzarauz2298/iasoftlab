/* IASOFTLAB — riel horizontal del proceso.
   El scroll vertical se traduce en avance horizontal 1:1: la altura de
   la sección se calcula desde el ancho real del track, sin números mágicos. */
(function (ISL) {
  'use strict';

  function Pipeline() {
    this.section = ISL.$('#proceso');
    this.track = ISL.$('#rail-track');
    this.bar = ISL.$('#rail-progress');
    if (!this.section || !this.track) return;

    this.distance = 0;
    this.enabled = false;

    this.measure();
    ISL.on(window, 'resize', ISL.debounce(() => this.measure(), 180));
    ISL.on(window, 'scroll', ISL.raf(() => this.update()), { passive: true });
  }

  /* Mismo umbral que el fallback vertical del CSS: una sola fuente de verdad. */
  Pipeline.prototype.canRun = function () {
    return window.matchMedia('(min-width: 901px)').matches && !ISL.prefersReducedMotion();
  };

  Pipeline.prototype.measure = function () {
    if (!this.canRun()) {
      this.enabled = false;
      this.section.style.removeProperty('--rail-h');
      this.track.style.removeProperty('--rail-x');
      return;
    }
    this.enabled = true;
    this.track.style.setProperty('--rail-x', '0px');
    const overflow = this.track.scrollWidth - document.documentElement.clientWidth;
    this.distance = Math.max(0, overflow + 48);
    this.section.style.setProperty('--rail-h', (window.innerHeight + this.distance) + 'px');
    this.update();
  };

  Pipeline.prototype.update = function () {
    if (!this.enabled) return;
    const rect = this.section.getBoundingClientRect();
    const progress = ISL.clamp(-rect.top / this.distance, 0, 1);
    this.track.style.setProperty('--rail-x', (-progress * this.distance).toFixed(1) + 'px');
    if (this.bar) this.bar.style.width = (8 + progress * 92) + '%';
  };

  ISL.initPipeline = function () { ISL.pipeline = new Pipeline(); };

})(window.ISL);
