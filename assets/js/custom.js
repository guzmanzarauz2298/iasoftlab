/* IASOFTLAB — demostrador "A medida".
   Los controles no re-renderizan nada por JS: sólo escriben atributos de estado
   y una variable de color en el mock. El CSS hace todo el trabajo visual. Así se
   muestra, en vivo, que el mismo software se adapta a la forma de cada cliente. */
(function (ISL) {
  'use strict';

  ISL.initCustom = function () {
    const mock = ISL.$('#mock');
    const controls = ISL.$('.custom__controls');
    if (!mock || !controls) return;

    ISL.$$('[data-control]', controls).forEach((btn) => {
      ISL.on(btn, 'click', () => {
        const ctl = btn.dataset.control;
        const group = btn.parentElement;

        group.querySelectorAll('[data-control="' + ctl + '"]').forEach((b) =>
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));

        if (ctl === 'accent') mock.style.setProperty('--mock-accent', btn.dataset.color);
        else mock.dataset[ctl] = btn.dataset.value;
      });
    });
  };

})(window.ISL);
