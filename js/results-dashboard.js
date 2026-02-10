document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('results-list');
  if (!container || typeof Storage === 'undefined') return;

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

    const box = document.createElement('div');
    box.className = 'result-answers';
    box.innerHTML = `<h3>${title}</h3>`;

    const list = document.createElement('div');
    list.className = 'answers-list';

    const summary = document.createElement('div');
    summary.className = 'answer-item';
    summary.innerHTML = `
      <div class="answer-question">Resultado</div>
      <div class="answer-value">${score != null && max != null ? `${score} / ${max}` : (score ?? '—')} ${level ? `• ${level}` : ''} • ${date}</div>
    `;
    list.appendChild(summary);

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
    container.appendChild(box);
  });
});
