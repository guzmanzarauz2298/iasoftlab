/* IASOFTLAB — agente de demostración.
   Todo corre en el navegador: intenciones por palabra clave y respuestas
   escritas a mano, personalizadas con el rubro activo. Sin red, sin datos afuera. */
(function (ISL) {
  'use strict';

  const el = ISL.el;

  /* minúsculas y sin tildes: "cuánto" y "cuanto" deben matchear igual */
  const ACCENTED = 'áàäâãéèëêíìïîóòöôõúùüûñç';
  const PLAIN    = 'aaaaaeeeeiiiiooooouuuunc';

  function normalize(s) {
    let out = '';
    const low = s.toLowerCase();
    for (let i = 0; i < low.length; i++) {
      const k = ACCENTED.indexOf(low[i]);
      out += k === -1 ? low[i] : PLAIN[k];
    }
    return out;
  }

  function Agent() {
    this.log = ISL.$('#demo-log');
    this.form = ISL.$('#demo-form');
    this.input = ISL.$('#demo-input');
    this.badge = ISL.$('#demo-industry');
    this.state = ISL.$('#demo-state');
    this.suggestions = ISL.$('#demo-suggestions');
    this.busy = false;
    if (!this.log || !this.form) return;

    this.buildSuggestions();
    this.reset(ISL.store.get().industry);
    this.bind();
  }

  Agent.prototype.bind = function () {
    ISL.on(this.form, 'submit', (e) => {
      e.preventDefault();
      const q = this.input.value.trim();
      if (!q || this.busy) return;
      this.input.value = '';
      this.ask(q);
    });

    ISL.store.subscribe((state, patch) => {
      if (patch.industry) this.reset(patch.industry);
    });
  };

  Agent.prototype.buildSuggestions = function () {
    ISL.agentSuggestions.forEach((text) => {
      this.suggestions.appendChild(el('button', {
        class: 'suggestion', type: 'button', text: text,
        onclick: () => { if (!this.busy) this.ask(text); }
      }));
    });
  };

  Agent.prototype.reset = function (ind) {
    this.log.replaceChildren();
    if (this.badge) this.badge.textContent = ind.full;
    this.push('bot', 'Contexto cargado: ' + ind.full.toLowerCase() + '. ' + ind.pain + ' Preguntame lo que quieras sobre cómo lo resolvemos.');
  };

  Agent.prototype.push = function (who, text, typing) {
    const body = el('p', { class: 'msg__body' });
    const msg = el('div', { class: 'msg msg--' + who + (typing ? ' msg--typing' : '') }, [
      el('p', { class: 'msg__who', text: who === 'bot' ? 'agente' : 'vos' }),
      body
    ]);
    body.textContent = text;
    this.log.appendChild(msg);
    this.log.scrollTop = this.log.scrollHeight;
    return { msg: msg, body: body };
  };

  Agent.prototype.resolve = function (question) {
    const q = normalize(question);
    const ind = ISL.store.get().industry;
    let best = null, score = 0;

    ISL.agentIntents.forEach((intent) => {
      const hits = intent.match.filter((k) => q.indexOf(normalize(k)) !== -1).length;
      if (hits > score) { score = hits; best = intent; }
    });

    return best ? best.answer(ind) : ISL.agentFallback(ind);
  };

  Agent.prototype.ask = function (question) {
    this.busy = true;
    if (this.state) this.state.textContent = 'procesando';
    this.push('user', question);

    const pending = this.push('bot', 'consultando el contexto del rubro', true);
    const answer = this.resolve(question);
    const thinking = ISL.prefersReducedMotion() ? 120 : 520 + Math.random() * 420;

    setTimeout(() => {
      pending.msg.classList.remove('msg--typing');
      this.type(pending.body, answer, () => {
        this.busy = false;
        if (this.state) this.state.textContent = 'en línea';
      });
    }, thinking);
  };

  Agent.prototype.type = function (node, text, done) {
    if (ISL.prefersReducedMotion()) {
      node.textContent = text;
      this.log.scrollTop = this.log.scrollHeight;
      done();
      return;
    }
    /* Duración acotada: una respuesta larga no puede hacer esperar más que una
       corta. rAF en vez de setTimeout para no depender del throttling del timer. */
    node.textContent = '';
    const total = text.length;
    const dur = ISL.clamp(total * 8, 420, 1300);
    const start = performance.now();

    const tick = (now) => {
      const t = ISL.clamp((now - start) / dur, 0, 1);
      node.textContent = text.slice(0, Math.round(t * total));
      this.log.scrollTop = this.log.scrollHeight;
      if (t < 1) requestAnimationFrame(tick);
      else done();
    };
    requestAnimationFrame(tick);
  };

  ISL.initAgent = function () { ISL.agent = new Agent(); };

})(window.ISL);
