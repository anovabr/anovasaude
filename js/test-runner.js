// Universal test runner - loads from /tests/<id>.json
(function(){
  const params = new URLSearchParams(window.location.search);
  const testId = params.get('id') || 'demo-test';

  let testData = null;
  let answers = [];

  function loadTest() {
    fetch(`../tests/${testId}.json`)
      .then(r => r.json())
      .then(data => {
        testData = data;
        init();
      })
      .catch(err => {
        console.error(err);
        alert('Não foi possível carregar este teste.');
      });
  }

  function init() {
    document.getElementById('test-title').textContent = testData.title;
    document.getElementById('test-description').textContent = testData.description || '';
    const instr = document.getElementById('test-instructions');
    if (instr) instr.innerHTML = testData.instructions || '';

    answers = new Array(testData.questions.length).fill(null);
    renderQuestions();
    setupForm();
  }

  function renderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) return;
    container.innerHTML = '';

    testData.questions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.id = `question-${idx}`;
      card.innerHTML = `
        <div class="question-number">Questão ${idx + 1} de ${testData.questions.length}</div>
        <div class="question-text">${q.title}</div>
      `;

      const opts = document.createElement('div');
      opts.className = 'options-group';

      if (['single','likert','yesno'].includes(q.type || 'single')) {
        (q.options || []).forEach(opt => {
          const label = document.createElement('label');
          label.className = 'option-label';
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = `q-${idx}`;
          input.value = opt.value;
          input.dataset.label = opt.text;
          input.addEventListener('change', e => handleAnswer(e, idx));
          label.appendChild(input);
          const span = document.createElement('span');
          span.textContent = `${opt.value}. ${opt.text}`;
          label.appendChild(span);
          opts.appendChild(label);
        });
      } else if (q.type === 'scale') {
        const input = document.createElement('input');
        input.type = 'range';
        input.min = q.min ?? 0;
        input.max = q.max ?? 10;
        input.step = q.step ?? 1;
        input.value = input.min;
        input.addEventListener('input', e => handleScale(e, idx));
        const val = document.createElement('div');
        val.id = `scale-val-${idx}`;
        val.textContent = input.value;
        opts.appendChild(input);
        opts.appendChild(val);
      }

      card.appendChild(opts);
      container.appendChild(card);
    });
  }

  function handleAnswer(event, idx) {
    const value = Number(event.target.value);
    const label = event.target.dataset.label;
    answers[idx] = { value, label };
    
    const card = document.getElementById(`question-${idx}`);
    card.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
    event.target.closest('.option-label').classList.add('selected');
    
    updateProgress();
    checkCompletion();
  }

  function handleScale(event, idx) {
    const v = Number(event.target.value);
    answers[idx] = { value: v, label: v.toString() };
    const val = document.getElementById(`scale-val-${idx}`);
    if (val) val.textContent = v;
    updateProgress();
    checkCompletion();
  }

  function updateProgress() {
    const answered = answers.filter(a => a !== null).length;
    const pct = (answered / answers.length) * 100;
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${pct}%`;
  }

  function checkCompletion() {
    const allAnswered = answers.every(a => a !== null);
    const btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = !allAnswered;
  }

  function setupForm() {
    const form = document.getElementById('test-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitTest();
    });
  }

  function submitTest() {
    const factors = computeFactors();

    let primaryScore, primaryMax, primaryInterp;
    if (factors.length) {
      const f0 = factors[0];
      primaryScore = f0.score;
      primaryMax = f0.maxScore;
      primaryInterp = { level: f0.level || '', description: f0.description || '' };
    } else {
      primaryScore = answers.reduce((s, a) => s + (a?.value || 0), 0);
      primaryMax = testData.scoring?.max ?? primaryScore;
      primaryInterp = { level: '', description: '' };
    }

    const testResults = {
      testId: testData.id,
      testTitle: testData.title,
      score: primaryScore,
      maxScore: primaryMax,
      interpretation: primaryInterp,
      factors,
      answers: answers.map((ans, idx) => ({
        questionId: testData.questions[idx].id,
        questionTitle: testData.questions[idx].title,
        value: ans?.value || 0,
        label: ans?.label || ''
      })),
      timestamp: new Date().toISOString()
    };

    showResults(testResults);
  }

  function computeFactors() {
    const factors = testData.scoring?.factors || [];
    if (!factors.length) return [];

    return factors.map(f => {
      const scores = f.questionIds.map(id => {
        const idx = testData.questions.findIndex(q => q.id === id);
        return idx >= 0 && answers[idx] ? answers[idx].value || 0 : 0;
      });
      const score = scores.reduce((s, v) => s + v, 0);
      const maxScore = f.questionIds.reduce((s, id) => s + questionMax(id), 0);
      const interp = Scoring.getInterpretation(score, f.ranges || []);
      
      return {
        id: f.id,
        name: f.name,
        score,
        maxScore,
        level: interp?.level || '',
        description: interp?.description || ''
      };
    });
  }

  function questionMax(qid) {
    const q = testData.questions.find(q => q.id === qid);
    if (!q) return 0;
    if (q.type === 'scale') return q.max ?? 0;
    if (Array.isArray(q.options)) return Math.max(...q.options.map(o => Number(o.value) || 0));
    return 0;
  }

  function showResults(results) {
    document.getElementById('test-page').style.display = 'none';
    
    document.getElementById('result-score').textContent = results.score;
    document.getElementById('result-max').textContent = results.maxScore;
    document.getElementById('result-level').textContent = results.interpretation.level;
    document.getElementById('result-description').textContent = results.interpretation.description;

    // Show factors breakdown if multiple
    if (results.factors && results.factors.length > 1) {
      const breakdown = document.getElementById('factors-breakdown');
      const factorsList = document.getElementById('factors-list');
      if (breakdown && factorsList) {
        breakdown.style.display = 'block';
        factorsList.innerHTML = '';
        results.factors.forEach(f => {
          const item = document.createElement('div');
          item.className = 'answer-item';
          item.innerHTML = `
            <div class="answer-question">${f.name}</div>
            <div class="answer-value">${f.score} / ${f.maxScore} • ${f.level}</div>
          `;
          factorsList.appendChild(item);
        });
      }
      
      // Render chart
      if (window.renderFactorsChart) {
        window.renderFactorsChart(results.factors);
      }
    }

    // Show answers
    const answersContainer = document.getElementById('result-answers-container');
    if (answersContainer) {
      const list = document.createElement('div');
      list.className = 'answers-list';
      results.answers.forEach((ans, idx) => {
        const item = document.createElement('div');
        item.className = 'answer-item';
        item.innerHTML = `
          <div class="answer-question">${idx + 1}. ${ans.questionTitle}</div>
          <div class="answer-value">${ans.label}</div>
        `;
        list.appendChild(item);
      });
      answersContainer.appendChild(list);
    }

    // Save to storage
    if (typeof Storage !== 'undefined') {
      Storage.saveResult(results.testId, results);
      Storage.recordTestTaken(results.testId, results.testTitle);
    }

    document.getElementById('results-page').style.display = 'block';
  }

  document.addEventListener('DOMContentLoaded', loadTest);
})();