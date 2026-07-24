/* IASOFTLAB — arranque. Orden importa: los módulos que escriben en el
   store van antes que los que lo leen para sincronizarse. */
(function (ISL) {
  'use strict';

  function boot() {
    ISL.initBoot();
    ISL.initCursor();
    ISL.initNav();
    ISL.initTicker();

    ISL.initHero();
    ISL.initDial();      // fija el rubro inicial en el store
    ISL.initCompiler();  // deriva capacidades del rubro
    ISL.initPipeline();
    ISL.initAgent();
    ISL.initForm();      // lee rubro + capacidades ya resueltos

    ISL.initReveals();
    ISL.initOdometers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.ISL);
