document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('results-list');
  if (!container || typeof Storage === 'undefined') return;

  const MP_PREF_ONE = '63317762-5eeb54d6-3242-4b6c-8bd7-3176fad46396';
  const MP_PREF_THREE = '63317762-195fd6d9-b3a9-47a0-a261-5cb1d63bd83e';

  const renderMPButton = (target, preferenceId) => {
    if (!target || !preferenceId || target.dataset.rendered === 'true') return;
    const script = document.createElement('script');
    script.src = 'https://www.mercadopago.com.br/integrations/v1/web-payment-checkout.js';
    script.setAttribute('data-preference-id', preferenceId);
    script.setAttribute('data-source', 'button');
    target.appendChild(script);
    target.dataset.rendered = 'true';
  };

  const buildInterpretationUrl = (testId, resultId) => {
    const url = new URL('test.html', window.location.href);
    if (testId) url.searchParams.set('id', testId);
    url.searchParams.set('flow', 'interpretation');
    if (resultId) url.searchParams.set('result_id', resultId);
    return url.href;
  };

  const index = Storage.getResultsIndex();
  if (!index.length) {
    container.innerHTML = '<div class="result-answers"><h3>Nenhum resultado salvo ainda.</h3></div>';
    return;
  }

  index.slice().reverse().forEach(item => {
    const res = Storage.getResult(item.resultId) || item;
    const title = res.testTitle || item.testTitle || item.testId || 'Teste';
    const score = (res.score ?? item.score);
    const max = (res.maxScore ?? item.maxScore);
    const level = res.interpretation ? res.interpretation.level : item.level;
    const description = res.interpretation ? res.interpretation.description : '';
    const date = new Date(res.timestamp || item.timestamp || Date.now()).toLocaleDateString('pt-BR');

    const details = document.createElement('details');
    details.className = 'result-row';

    const summary = document.createElement('summary');
    summary.className = 'result-row__summary';

    const funnelData = Storage.getFunnel(item.resultId);
    const stepViewed = funnelData ? !!funnelData.results_viewed : true;
    const stepInterpretation = funnelData ? !!funnelData.interpretation_clicked : false;
    const stepSubmitted = funnelData ? !!funnelData.submit_clicked : false;

    summary.innerHTML = `
      <div class="result-row__head">
        <div class="result-row__title">${title}</div>
        <div class="result-row__meta">${score != null && max != null ? `${score} / ${max}` : (score ?? '—')} ${level ? ` • ${level}` : ''} • ${date}</div>
      </div>
    `;

    const flags = document.createElement('div');
    flags.className = 'result-row__flags';

    const completedFlag = document.createElement('span');
    completedFlag.className = 'status-flag is-done';
    completedFlag.textContent = 'Teste completo';
    flags.appendChild(completedFlag);

    if (stepSubmitted) {
      const sentFlag = document.createElement('span');
      sentFlag.className = 'status-flag is-done';
      sentFlag.textContent = 'Resultados enviados para interpretacao humana';
      flags.appendChild(sentFlag);
    } else {
      const requestBtn = document.createElement('button');
      requestBtn.type = 'button';
      requestBtn.className = 'status-action';
      requestBtn.textContent = 'Solicitar interpretacao humana';
      requestBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        Storage.setFunnelEvent(item.resultId, 'interpretation_clicked');
        window.location.href = buildInterpretationUrl(item.testId, item.resultId);
      });
      flags.appendChild(requestBtn);
    }

    summary.appendChild(flags);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'row-delete';
    deleteBtn.textContent = 'Remover';
    deleteBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!window.confirm('Remover este teste do seu dashboard?')) return;
      try {
        localStorage.removeItem(`test_result_${item.resultId}`);
        localStorage.removeItem(`result_funnel_${item.resultId}`);
        const index = Storage.getResultsIndex().filter(x => x.resultId !== item.resultId);
        localStorage.setItem('results_index', JSON.stringify(index));

        if (item.testId) {
          const latest = index.filter(x => x.testId === item.testId).pop();
          if (latest && latest.resultId) {
            localStorage.setItem(`latest_result_${item.testId}`, latest.resultId);
          } else {
            localStorage.removeItem(`latest_result_${item.testId}`);
          }
        }

        window.location.reload();
      } catch (e) {
        alert('Nao foi possivel remover este teste.');
      }
    });
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'row-toggle';
    toggleBtn.textContent = 'Exibir';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      details.open = !details.open;
      toggleBtn.textContent = details.open ? 'Ocultar' : 'Exibir';
      toggleBtn.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    });
    summary.appendChild(toggleBtn);

    summary.appendChild(deleteBtn);

    details.appendChild(summary);

    summary.addEventListener('click', (ev) => {
      if (!ev.target.classList.contains('row-toggle')) {
        ev.preventDefault();
      }
    });

    const content = document.createElement('div');
    content.className = 'result-row__content';

    const box = document.createElement('div');
    box.className = 'result-answers';

    if (stepSubmitted) {
      const paymentBox = document.createElement('div');
      paymentBox.className = 'result-payment';
      paymentBox.innerHTML = `
        <p>Caso voce ja tenha realizado o pagamento, a confirmacao e feita pelo Mercado Pago e e confirmada automaticamente. Caso voce ainda nao tenha feito, clique abaixo para realizar o pagamento.</p>
        <div class="result-payment__actions">
          <div class="mp-payment-button" data-pref="${MP_PREF_ONE}"></div>
          <div class="mp-payment-button" data-pref="${MP_PREF_THREE}"></div>
        </div>
        <div class="result-payment__labels">
          <span>Pagar 1 teste</span>
          <span>Pagar ate 3 testes</span>
        </div>
      `;
      box.appendChild(paymentBox);

      const btns = paymentBox.querySelectorAll('.mp-payment-button');
      if (btns[0]) renderMPButton(btns[0], MP_PREF_ONE);
      if (btns[1]) renderMPButton(btns[1], MP_PREF_THREE);
    }

    const list = document.createElement('div');
    list.className = 'answers-list';

    const resultSummary = document.createElement('div');
    resultSummary.className = 'answer-item';
    resultSummary.innerHTML = `
      <div class="answer-question">Resultado</div>
      <div class="answer-value">${score != null && max != null ? `${score} / ${max}` : (score ?? '—')} ${level ? `• ${level}` : ''} • ${date}</div>
    `;
    list.appendChild(resultSummary);

    if (description) {
      const desc = document.createElement('div');
      desc.className = 'answer-item';
      desc.innerHTML = `
        <div class="answer-question">Interpretação</div>
        <div class="answer-value">${description}</div>
      `;
      list.appendChild(desc);
    }

    if (Array.isArray(res.factors) && res.factors.length > 1) {
      res.factors.forEach(f => {
        const factor = document.createElement('div');
        factor.className = 'answer-item';
        factor.innerHTML = `
          <div class="answer-question">${f.name || f.id}</div>
          <div class="answer-value">${f.score} / ${f.maxScore || ''} ${f.level ? `• ${f.level}` : ''}</div>
        `;
        list.appendChild(factor);
      });
    }

    if (Array.isArray(res.answers)) {
      res.answers.forEach((ans, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'answer-item';
        itemEl.innerHTML = `
          <div class="answer-question">${idx + 1}. ${ans.questionTitle || ''}</div>
          <div class="answer-value">${ans.label || ans.value || ''}</div>
        `;
        list.appendChild(itemEl);
      });
    }

    box.appendChild(list);
    content.appendChild(box);
    details.appendChild(content);
    container.appendChild(details);
  });
});
