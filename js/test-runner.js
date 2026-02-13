// Universal test runner - loads from /tests/<id>.json
(function(){
  // Format markdown text
  function formatMarkdown(text) {
    if (!text) return '';
    // Convert **text** to <strong>text</strong>
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert *text* to <em>text</em> (but not already processed **)
    text = text.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    return text;
  }
  
  const params = new URLSearchParams(window.location.search);
  const testId = params.get('id') || 'demo-test';
  const isPreview = params.get('preview') === 'true';

  let testData = null;
  let answers = [];

  function loadTest() {
    // Preview mode: load from sessionStorage instead of fetching
    if (isPreview) {
      const previewData = sessionStorage.getItem('previewTestData');
      const previewAnswers = sessionStorage.getItem('previewAnswers');
      
      if (!previewData || !previewAnswers) {
        alert('Dados de pré-visualização não encontrados.');
        return;
      }
      
      testData = JSON.parse(previewData);
      answers = JSON.parse(previewAnswers);
      initPreview();
      return;
    }
    
    // Normal mode: fetch from server
    fetch(`tests/${testId}.json`)
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
    document.getElementById('test-description').innerHTML = formatMarkdown(testData.description) || '';
    const instr = document.getElementById('test-instructions');
    if (instr) instr.innerHTML = formatMarkdown(testData.instructions) || '';

    answers = new Array(testData.questions.length).fill(null);
    renderQuestions();
    setupForm();
  }

  function initPreview() {
    // Preview mode: skip questions and show results directly
    document.getElementById('test-title').textContent = testData.title + ' (Pré-visualização)';
    
    // Hide the test form page
    const testPage = document.getElementById('test-page');
    if (testPage) testPage.style.display = 'none';
    
    // Compute and show results
    submitTest();
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
        <div class="question-text">${formatMarkdown(q.title)}</div>
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
    card.classList.add('question-answered');
    
    updateProgress();
    checkCompletion();
    autoAdvance(idx);
  }

  function handleScale(event, idx) {
    const v = Number(event.target.value);
    answers[idx] = { value: v, label: v.toString() };
    const val = document.getElementById(`scale-val-${idx}`);
    if (val) val.textContent = v;
    const card = document.getElementById(`question-${idx}`);
    if (card) card.classList.add('question-answered');
    updateProgress();
    checkCompletion();
    autoAdvance(idx);
  }

  function updateProgress() {
    const answered = answers.filter(a => a !== null).length;
    const pct = (answered / answers.length) * 100;
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${pct}%`;
  }

  function autoAdvance(idx) {
    const nextIdx = answers.findIndex((a, i) => i > idx && a === null);
    if (nextIdx === -1) {
      const btn = document.getElementById('submit-btn');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const nextCard = document.getElementById(`question-${nextIdx}`);
    if (nextCard) {
      const rect = nextCard.getBoundingClientRect();
      const inView = rect.top >= 0 && rect.bottom <= window.innerHeight * 0.85;
      if (!inView) {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
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
        if (idx < 0 || !answers[idx]) return 0;
        
        const question = testData.questions[idx];
        let value = answers[idx].value || 0;
        
        // Apply reverse scoring if needed
        if (question.reverse) {
          const options = question.options || [];
          if (options.length > 0) {
            const min = Math.min(...options.map(o => Number(o.value)));
            const max = Math.max(...options.map(o => Number(o.value)));
            value = (max + min) - value;
          }
        }
        
        // Apply weight multiplier
        const weight = question.weight || 1;
        return value * weight;
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
    
    const weight = q.weight || 1;
    let maxVal = 0;
    
    if (q.type === 'scale') {
      maxVal = q.max ?? 0;
    } else if (Array.isArray(q.options)) {
      maxVal = Math.max(...q.options.map(o => Number(o.value) || 0));
    }
    
    return maxVal * weight;
  }

  function showResults(results) {
    document.getElementById('test-page').style.display = 'none';

    const defaultTextEl = document.getElementById('results-default-text');
    if (defaultTextEl) {
      defaultTextEl.innerHTML = `Você realizou com sucesso o ${testData.title}. Os resultados apresentados abaixo correspondem a uma descrição sintética e informativa, baseada no artigo científico no qual este instrumento foi desenvolvido e descrito.<br>Assim, 
      eles auxiliam na compreensão inicial de características psicológicas e servem como informação complementar. 
      Caso deseje, você pode imprimir este documento e levá-lo a um psicólogo para uma avaliação clínica adequada.`;
    }
    
    // Add article and video buttons if available
    const resourcesBtns = document.getElementById('test-resources-btns');
    if (resourcesBtns) {
      resourcesBtns.innerHTML = '';
      if (testData.articleUrl) {
        const articleBtn = document.createElement('a');
        articleBtn.href = testData.articleUrl;
        articleBtn.target = '_blank';
        articleBtn.rel = 'noopener';
        articleBtn.className = 'btn btn-secondary btn-small';
        articleBtn.innerHTML = '📄 Artigo';
        resourcesBtns.appendChild(articleBtn);
      }
      if (testData.videoUrl) {
        const videoBtn = document.createElement('button');
        videoBtn.type = 'button';
        videoBtn.className = 'btn btn-secondary btn-small';
        videoBtn.innerHTML = '🎥 Vídeo';
        videoBtn.addEventListener('click', () => {
          // Extract Wistia video ID from URL
          const match = testData.videoUrl.match(/medias\/([a-zA-Z0-9]+)/);
          if (match && match[1]) {
            const videoId = match[1];
            const modal = document.getElementById('video-modal');
            const iframe = document.getElementById('video-iframe');
            if (modal && iframe) {
              iframe.src = `https://fast.wistia.net/embed/iframe/${videoId}?videoFoam=true`;
              modal.style.display = 'flex';
            }
          } else {
            // Fallback: open in new tab if URL format is unexpected
            window.open(testData.videoUrl, '_blank');
          }
        });
        resourcesBtns.appendChild(videoBtn);
      }
    }
    
    const scoreEl = document.getElementById('result-score');
    if (scoreEl) scoreEl.textContent = results.score;
    const maxEl = document.getElementById('result-max');
    if (maxEl) maxEl.textContent = results.maxScore;
    const levelEl = document.getElementById('result-level');
    if (levelEl) levelEl.textContent = results.interpretation.level;
    const descEl = document.getElementById('result-description');
    if (descEl) descEl.innerHTML = formatMarkdown(results.interpretation.description);

    // Show factors breakdown
    if (results.factors && results.factors.length > 0) {
      const breakdown = document.getElementById('factors-breakdown');
      const factorsList = document.getElementById('factors-list');
      if (breakdown && factorsList) {
        breakdown.style.display = 'block';
        factorsList.innerHTML = '';
        results.factors.forEach(f => {
          const item = document.createElement('div');
          item.className = 'factor-card';
          const maxScore = f.maxScore || 0;
          const pct = maxScore ? Math.min(100, Math.round((f.score / maxScore) * 100)) : 0;
          item.innerHTML = `
            <div class="factor-header">
              <div class="factor-title">${f.name}</div>
              <div class="factor-level">${f.level || ''}</div>
            </div>
            <div class="factor-bar">
              <span class="factor-min">0</span>
              <div class="factor-track">
                <div class="factor-fill" style="width:0%;"><span class="factor-value">${f.score}</span></div>
              </div>
              <span class="factor-max">${maxScore}</span>
            </div>
            ${f.description ? `<div class="factor-interpretation">${formatMarkdown(f.description)}</div>` : ''}
          `;
          factorsList.appendChild(item);
          requestAnimationFrame(() => {
            const fill = item.querySelector('.factor-fill');
            if (fill) fill.style.width = `${pct}%`;
          });
        });
      }
      
      // Render chart
      if (window.renderFactorsChart) {
        window.renderFactorsChart(results.factors);
      }
    }

    // Show answers
    const answersContainer = document.getElementById('result-answers-container');
    const answersWrapper = document.getElementById('answers-wrapper');
    const toggleBtn = document.getElementById('toggle-answers-btn');
    const target = answersWrapper || answersContainer;
    if (target) {
      if (answersWrapper && toggleBtn) {
        answersWrapper.style.display = 'none';
        toggleBtn.textContent = 'Ver respostas completas';
      }
      target.innerHTML = '';
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
      target.appendChild(list);
    }

    // Save to storage
    if (typeof Storage !== 'undefined') {
      Storage.saveResult(results.testId, results);
      Storage.recordTestTaken(results.testId, results.testTitle);
    }
    if (window.ProgressDashboard && typeof window.ProgressDashboard.refresh === 'function') {
      window.ProgressDashboard.refresh();
    }

    document.getElementById('results-page').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  document.addEventListener('DOMContentLoaded', loadTest);
})();
