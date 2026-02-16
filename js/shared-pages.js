// ===== SHARED PAGES TEMPLATE =====

function injectSharedPages() {
  const testContainer = document.querySelector(".test-container");
  if (!testContainer) return;

  const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzVZifIzJPeLNbGRQapGj0NQr-Xs6lRntuNWoEK9oUlEqHoI9Uc6nEQvn3INDurKrTs/exec';
  const SHEETS_SECRET = 'Eugene2024##abc';
  const SESSION_USER_ID_KEY = 'anova_user_id';

  const sharedPagesHTML = `
    <!--
      MAINTENANCE NOTE (2026-02-16):
      Keep this PAGE 2 block for now.
      Even though users are redirected to dashboard after finishing tests,
      test-runner.js and shared-pages.js still reference these IDs
      (e.g., results-page, result-score/result-max/result-level/result-description,
      factors-breakdown, result-answers-container, interpretation/download buttons).
      Remove this block only after those dependencies are fully migrated.
    -->
    <!-- PAGE 2: RESULTS PAGE -->
    <div id="results-page" class="page-section" style="display: none;">
      <div class="test-header">
        <h1>Seus Resultados</h1>
        <p id="results-default-text" class="results-default-text"></p>
      </div>

      <!-- FACTORS BAR CHART -->
      <div id="factors-chart" style="display:none; margin-bottom:2rem;">
        <h3 style="margin-bottom:1rem;">Fatores Avaliados</h3>
        <div style="max-width:900px;margin:0 auto;">
          <canvas id="factors-canvas-bars" style="max-height:400px;width:100%;"></canvas>
        </div>
        <div id="chart-tooltip" class="chart-tooltip" style="display:none;"></div>
      </div>

      <!-- FACTORS BREAKDOWN (if multiple) -->
      <div id="factors-breakdown" class="result-answers" style="display:none;">
        <h3>Detalhamento por Fator</h3>
        <p class="factor-note">Estes resultados indicam seus pontos brutos obtidos e a relação deles com os valores mínimo e máximo 
        possíveis. Eles não possuem transformações psicométricas padronizadas, como pontos ponderados, Z-scores, T-scores ou percentis.
        Assim, a única interpretação possível é descritiva, sendo útil para transparência dos resultados, comparação intra-instrumento e 
        acompanhamento longitudinal. Estes resultados não devem ser interpretados como diagnóstico em nenhum caso.</p>
        <div id="factors-list"></div>
      </div>

      <!-- ANSWERS -->
      <div class="result-answers" id="result-answers-container">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
          <h3 style="margin:0;">Suas Respostas</h3>
          <button type="button" class="btn btn-secondary btn-small" id="toggle-answers-btn">Ver respostas completas</button>
        </div>
        <div id="answers-wrapper" style="display:none;margin-top:1rem;"></div>
      </div>

      <div class="result-box result-box--full">
        <p><span class="result-symbol" aria-hidden="true">❖</span>Este material <span class="highlight-marker">não possui valor jurídico</span> e não constitui documento psicológico, não se enquadrando entre aqueles previstos na Resolução CFP nº 06/2019.
        <br><span class="result-symbol" aria-hidden="true">❖</span>É possível que <span class="highlight-marker">um psicólogo da equipe</span> tenha acesso aos 
        seus resultados e faça um relatório técnico sobre eles, explicando de maneira mais detalhada e precisa.  
        <br><span class="result-symbol" aria-hidden="true">❖</span>Caso você tenha esse interesse, clique em <button class="interpretation-link highlight-marker" style="border:none;text-decoration:none;cursor:pointer;padding:0;font:inherit;background:transparent;font-weight:bold;">"Quero interpretação humana"</button>. 
        Você irá deverá preenher algumas informações extras, poderá fazer novos testes e irá pagar uma taxa de serviço.
        Após 2 dias úteis, um documento técnico será enviado para você via e-mail ou whatsapp por um acesso seguro.
        <br><span class="result-symbol" aria-hidden="true">❖</span>Caso você tenha executado mais do que 3 testes, nossa equipe entrará em contato com outros prazos e valores.</p>

      </div>

      <div class="test-navigation">
        <button type="button" id="results-back-btn" class="btn btn-secondary btn-small">Voltar</button>
        <div id="test-resources-btns" style="display:contents;"></div>
        <button type="button" id="download-pdf-btn" class="btn btn-secondary btn-small">Baixar PDF</button>
        <button id="interpretation-btn" class="btn btn-primary btn-small">Quero Interpretação Humana</button>
      </div>
    </div>

    <!-- PAGE 3: DEMOGRAPHICS FORM -->
    <div id="demographics-page" class="page-section" style="display: none;">
      <div class="test-header">
        <h1 id="demographics-title">Informações Pessoais</h1>
        <p id="demographics-desc">As perguntas abaixo são opcionais, mas ao preencher, elas vão possibilitar uma melhor interpretação dos resultados.
        Você receberá um único relatório técnico sobre os seguintes testes:</p>
        <div id="interpretation-tests-notice" class="result-answers" style="display:none; margin:0.5rem 0 0.75rem 0; padding:0.8rem 1rem;">
          <p style="margin:0 0 0.5rem 0; font-weight:600;"></p>
          <ul id="interpretation-tests-list" style="margin:0; padding-left:0; list-style:none;"></ul>
        </div>
      </div>

      <form id="demographics-form">
        <div class="form-group">
          <label for="full-name">Nome Completo</label>
          <input type="text" id="full-name" name="full-name">
        </div>
        <div class="form-group">
          <label for="birth-date">Data de Nascimento (DD/MM/AAAA)</label>
          <input type="text" id="birth-date" name="birth-date" placeholder="DD/MM/AAAA">
        </div>
        <div class="form-group">
          <label for="state">Estado</label>
          <select id="state" name="state">
            <option value="">Selecione seu estado</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
        <div class="form-group">
          <label for="gender">Sexo</label>
          <select id="gender" name="gender">
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
        </div>
        <div class="form-group">
          <label for="marital-status">Estado civil</label>
          <select id="marital-status" name="marital-status">
            <option value="">Selecione</option>
            <option value="Solteiro">Solteiro</option>
            <option value="Casado ou morando junto">Casado ou morando junto</option>
            <option value="Separado ou Divorciado">Separado ou Divorciado</option>
            <option value="Viúvo">Viúvo</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div class="form-group">
          <label for="education">Escolaridade</label>
          <select id="education" name="education">
            <option value="">Selecione</option>
            <option value="Fundamental">Fundamental</option>
            <option value="Médio">Médio</option>
            <option value="Superior">Superior</option>
            <option value="Pós-graduação">Pós-graduação</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div class="form-group">
          <label for="children">Filhos?</label>
          <select id="children" name="children">
            <option value="">Selecione</option>
            <option value="0">0 (Não tenho filhos)</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3 ou mais">3 ou mais</option>
          </select>
        </div>
        <div class="form-group">
          <label for="phone">Telefone (com DDD)</label>
          <input type="tel" id="phone" name="phone" placeholder="(11) 99999-9999">
        </div>
        <div class="form-group">
          <label for="email">Email (Obrigatório)</label>
          <input type="email" id="email" name="email">
        </div>
        <div class="form-group">
          <label style="font-weight:600;color:#1a4d2e;">Marque tudo o que se aplica</label>
          <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
            <input type="checkbox" id="diagnosis-checkbox">
            Já recebi um diagnóstico psiquiátrico
          </label>
          <div id="diagnosis-options" style="display:none;margin-top:0.75rem;">
            <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
              <input type="checkbox" class="diagnosis-option" value="Depressão">
              Depressão
            </label>
            <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
              <input type="checkbox" class="diagnosis-option" value="Ansiedade">
              Ansiedade
            </label>
            <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
              <input type="checkbox" class="diagnosis-option" value="TDAH">
              TDAH
            </label>
            <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
              <input type="checkbox" class="diagnosis-option" value="Transtorno de Personalidade">
              Transtorno de Personalidade
            </label>
            <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
              <input type="checkbox" class="diagnosis-option" value="Autismo">
              Autismo
            </label>
            <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
              <input type="checkbox" class="diagnosis-option" value="Altas Habilidades">
              Altas Habilidades
            </label>
            <input type="text" id="diagnosis-other" style="margin-top:0.75rem;" placeholder="Outro (escreva)">
          </div>
          <label style="display:flex;align-items:center;gap:8px;margin-top:0.5rem;">
            <input type="checkbox" id="therapy-checkbox">
            Faço acompanhamento psicológico ou psiquiátrico
          </label>
          <textarea id="therapy-details" style="display:none;margin-top:0.75rem;" placeholder="Descreva brevemente (opcional)"></textarea>
          <label style="display:flex;align-items:center;gap:8px;margin-top:0.75rem;">
            <input type="checkbox" id="meds-checkbox">
            Faço uso de algum remédio psiquiátrico (por exemplo, remédios para dormir)
          </label>
          <textarea id="meds-details" style="display:none;margin-top:0.75rem;" placeholder="Descreva brevemente (opcional)"></textarea>
          <label style="display:flex;align-items:center;gap:8px;margin-top:0.75rem;">
            <input type="checkbox" id="behavior-checkbox">
            Notei alterações   em seu comportamento nos últimos meses
          </label>
          <textarea id="behavior-details" style="display:none;margin-top:0.75rem;" placeholder="Por exemplo, comecei a ter mais sono ou fiquei com menos fome"></textarea>
        </div>
        <div class="form-group">
          <label for="comments">Use este campo abaixo para fazer comentários ou algo que possa auxiliar o profissional a entender melhor seus resultados.</label>
          <textarea id="comments" name="comments" placeholder="Por exemplo, eu já mudei de psiquiatra várias vezes ou Já me falaram que posso ter alguns sintomas psiquiátricos"></textarea>
        </div>
        <div class="form-group" style="border:1px solid #d4a574;background:#fff7ee;padding:1rem;border-radius:6px;">
          <label style="display:flex;align-items:flex-start;gap:8px;">
            <input type="checkbox" id="consent-checkbox" required>
            Declaro ser maior de idade e autorizo o envio dos meus resultados. O relatório técnico será elaborado e enviado após a confirmação do pagamento.
          </label>
        </div>

        <div id="post-send-message" class="payment-message" style="display:none;"></div>
      </form>
      <div class="test-navigation">
        <button type="button" id="back-to-results-btn" class="btn btn-secondary" style="display:none;">Voltar</button>
        <button type="button" id="submit-results-btn" class="btn btn-primary">Enviar Resultados</button>
        <a href="../index.html#testes" class="btn btn-secondary post-action" style="display:none;">Fazer Outro Teste</a>
      </div>
    </div>

    <!-- VIDEO MODAL -->
    <div id="video-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;align-items:center;justify-content:center;">
      <div style="position:relative;width:90%;max-width:900px;background:#000;border-radius:12px;overflow:hidden;">
        <button id="close-video-modal" style="position:absolute;top:10px;right:10px;z-index:10000;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:40px;height:40px;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#333;">✕</button>
        <div id="video-container" style="position:relative;padding-top:56.25%;background:#000;">
          <iframe id="video-iframe" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  `;

  testContainer.insertAdjacentHTML("beforeend", sharedPagesHTML);

  function getCurrentTestId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) return id;
    return (window.location.pathname.split('/').pop() || '').replace('.html','');
  }

  function getOrCreateSessionUserId() {
    try {
      const existing = sessionStorage.getItem(SESSION_USER_ID_KEY);
      if (existing) return existing;
      const randomPart = Math.random().toString(36).slice(2, 10);
      const created = `nonreg_user_${Date.now().toString(36)}_${randomPart}`;
      sessionStorage.setItem(SESSION_USER_ID_KEY, created);
      return created;
    } catch (e) {
      return `nonreg_user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  function findLatestResultIdForTest(testId) {
    if (typeof Storage === 'undefined' || !testId) return null;
    const index = Storage.getResultsIndex();
    for (let i = index.length - 1; i >= 0; i--) {
      if (index[i].testId === testId) return index[i].resultId;
    }
    return null;
  }

  function getCurrentResultId() {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('result_id');
    if (rid) return rid;
    if (typeof Storage === 'undefined') return null;
    const testId = getCurrentTestId();
    return Storage.getLatestResultId(testId) || findLatestResultIdForTest(testId);
  }

  function markFunnelEvent(eventKey) {
    if (typeof Storage === 'undefined') return;
    const resultId = getCurrentResultId();
    if (resultId) {
      Storage.setFunnelEvent(resultId, eventKey);
    }
  }

  function markInterpretationClickedServer() {
    const userId = sessionStorage.getItem(SESSION_USER_ID_KEY);
    if (!userId || !SHEETS_WEBHOOK_URL || !SHEETS_SECRET) return;
    const url = new URL(SHEETS_WEBHOOK_URL);
    url.searchParams.set('password', SHEETS_SECRET);
    url.searchParams.set('action', 'mark_interpretation_clicked');
    url.searchParams.set('user_id', userId);

    try {
      fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
        keepalive: true,
        cache: 'no-store'
      }).catch(() => {});
    } catch (e) {
      try {
        const img = new Image();
        img.src = url.toString();
      } catch (err) {
        // no-op
      }
    }
  }

  function openDemographicsPage() {
    const resultsPage = document.getElementById('results-page');
    const demographicsPage = document.getElementById('demographics-page');
    const testPage = document.getElementById('test-page');
    if (resultsPage) resultsPage.style.display = 'none';
    if (testPage) testPage.style.display = 'none';
    if (demographicsPage) demographicsPage.style.display = 'block';
    renderInterpretationTestsNotice();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function renderInterpretationTestsNotice() {
    const noticeEl = document.getElementById('interpretation-tests-notice');
    const listEl = document.getElementById('interpretation-tests-list');
    if (!noticeEl || !listEl) return;

    if (typeof Storage === 'undefined') {
      noticeEl.style.display = 'none';
      return;
    }

    let index = [];
    try {
      index = Storage.getResultsIndex() || [];
    } catch (e) {
      index = [];
    }

    const seen = new Set();
    const titles = [];
    index.forEach(item => {
      const rawTitle = (item?.testTitle || item?.testId || '').toString().trim();
      if (!rawTitle) return;
      const key = rawTitle.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      titles.push(rawTitle);
    });

    if (!titles.length) {
      noticeEl.style.display = 'none';
      return;
    }

    listEl.innerHTML = '';
    titles.forEach((title) => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.gap = '0.5rem';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'interpretation-test-checkbox';
      input.value = title;
      input.checked = true;

      const span = document.createElement('span');
      span.textContent = title;

      label.appendChild(input);
      label.appendChild(span);
      li.appendChild(label);
      listEl.appendChild(li);
    });
    noticeEl.style.display = 'block';
  }

  // Navigation handlers
  document.addEventListener("click", e => {
    if (e.target.id === "interpretation-btn" || e.target.classList.contains("interpretation-link")) {
      markFunnelEvent('interpretation_clicked');
      markInterpretationClickedServer();
      openDemographicsPage();
    }
    if (e.target.id === "back-to-results-btn") {
      document.getElementById("demographics-page").style.display = "none";
      document.getElementById("results-page").style.display = "block";
      document.getElementById("results-page").scrollIntoView({ behavior: "smooth" });
    }
    if (e.target.id === "results-back-btn") {
      document.getElementById("results-page").style.display = "none";
      const testPage = document.getElementById("test-page");
      if (testPage) {
        testPage.style.display = "block";
        testPage.scrollIntoView({ behavior: "smooth" });
      } else {
        history.back();
      }
    }
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('flow') === 'interpretation') {
    markFunnelEvent('interpretation_clicked');
    markInterpretationClickedServer();
    openDemographicsPage();
  }

  // Video modal handlers
  const videoModal = document.getElementById('video-modal');
  const closeVideoBtn = document.getElementById('close-video-modal');
  const videoIframe = document.getElementById('video-iframe');
  
  if (closeVideoBtn && videoModal && videoIframe) {
    closeVideoBtn.addEventListener('click', () => {
      videoModal.style.display = 'none';
      videoIframe.src = ''; // Stop video playback
    });
    
    // Close on background click
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        videoModal.style.display = 'none';
        videoIframe.src = '';
      }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.style.display === 'flex') {
        videoModal.style.display = 'none';
        videoIframe.src = '';
      }
    });
  }

  const toggleBtn = document.getElementById('toggle-answers-btn');
  const answersWrapper = document.getElementById('answers-wrapper');
  if (toggleBtn && answersWrapper) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = answersWrapper.style.display === 'none';
      answersWrapper.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Ocultar respostas' : 'Ver respostas completas';
    });
  }

  const downloadBtn = document.getElementById('download-pdf-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Birth date formatting
  const birthDateEl = document.getElementById('birth-date');
  if (birthDateEl) {
    birthDateEl.addEventListener('input', (ev) => {
      let digits = ev.target.value.replace(/\D/g, '').slice(0, 8);
      if (digits.length >= 5) {
        digits = digits.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
      } else if (digits.length >= 3) {
        digits = digits.replace(/(\d{2})(\d{1,2})/, '$1/$2');
      }
      ev.target.value = digits;
    });
  }

  // Form submission
  const submitBtn = document.getElementById('submit-results-btn');
  const diagnosisCheckbox = document.getElementById('diagnosis-checkbox');
  const diagnosisOptions = document.getElementById('diagnosis-options');
  const diagnosisOther = document.getElementById('diagnosis-other');
  const therapyCheckbox = document.getElementById('therapy-checkbox');
  const therapyDetails = document.getElementById('therapy-details');
  const medsCheckbox = document.getElementById('meds-checkbox');
  const medsDetails = document.getElementById('meds-details');
  const behaviorCheckbox = document.getElementById('behavior-checkbox');
  const behaviorDetails = document.getElementById('behavior-details');
  if (diagnosisCheckbox && diagnosisOptions) {
    diagnosisCheckbox.addEventListener('change', () => {
      diagnosisOptions.style.display = diagnosisCheckbox.checked ? 'block' : 'none';
      if (!diagnosisCheckbox.checked) {
        diagnosisOptions.querySelectorAll('input[type="checkbox"]').forEach(el => { el.checked = false; });
        if (diagnosisOther) diagnosisOther.value = '';
      }
    });
  }
  if (therapyCheckbox && therapyDetails) {
    therapyCheckbox.addEventListener('change', () => {
      therapyDetails.style.display = therapyCheckbox.checked ? 'block' : 'none';
      if (!therapyCheckbox.checked) therapyDetails.value = '';
    });
  }
  if (medsCheckbox && medsDetails) {
    medsCheckbox.addEventListener('change', () => {
      medsDetails.style.display = medsCheckbox.checked ? 'block' : 'none';
      if (!medsCheckbox.checked) medsDetails.value = '';
    });
  }
  if (behaviorCheckbox && behaviorDetails) {
    behaviorCheckbox.addEventListener('change', () => {
      behaviorDetails.style.display = behaviorCheckbox.checked ? 'block' : 'none';
      if (!behaviorCheckbox.checked) behaviorDetails.value = '';
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', (ev) => {
      ev.preventDefault();

      const consentEl = document.getElementById('consent-checkbox');
      if (!consentEl || !consentEl.checked) {
        const label = consentEl?.closest('label');
        if (label) {
          label.style.backgroundColor = '#ffeeba';
          setTimeout(() => { label.style.backgroundColor = ''; }, 700);
        }
        consentEl?.focus();
        return;
      }

      const emailEl = document.getElementById('email');
      const emailValue = (emailEl?.value || '').trim();
      if (!emailValue) {
        if (emailEl) {
          emailEl.style.backgroundColor = '#ffeeba';
          setTimeout(() => { emailEl.style.backgroundColor = ''; }, 700);
          emailEl.focus();
        }
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailValue)) {
        if (emailEl) {
          emailEl.style.backgroundColor = '#ffeeba';
          setTimeout(() => { emailEl.style.backgroundColor = ''; }, 700);
          emailEl.focus();
        }
        return;
      }

      markFunnelEvent('submit_clicked');

      const testId = getCurrentTestId();
      let answers = [];
      let storedResult = null;
      if (typeof Storage !== 'undefined') {
        const resultId = getCurrentResultId();
        if (resultId) {
          storedResult = Storage.getResult(resultId);
        }
        if (!storedResult) {
          const index = Storage.getResultsIndex();
          const latest = index.length ? index[index.length - 1] : null;
          storedResult = latest?.resultId ? Storage.getResult(latest.resultId) : null;
        }
        if (storedResult && Array.isArray(storedResult.answers)) {
          answers = storedResult.answers.map(ans => {
            const q = (ans.questionTitle || '').toString().trim();
            const a = (ans.label || ans.value || '').toString().trim();
            return q && a ? `${q}, ${a}` : (q || a);
          }).filter(Boolean);
        }
      }
      const selectedInterpretationTests = Array.from(document.querySelectorAll('.interpretation-test-checkbox:checked'))
        .map(el => (el.value || '').trim())
        .filter(Boolean);
      const whichTestsComment = `[User want these tests in report: [${selectedInterpretationTests.join(' | ')}]]`;

      const userId = getOrCreateSessionUserId();
      const payload = {
        token: SHEETS_SECRET,
        action: 'update_demographics_by_user',
        user_id: userId,
        which_tests: whichTestsComment,
        testId,
        testTitle: document.getElementById('test-title')?.textContent || storedResult?.testTitle || testId,
        score: Number(document.getElementById('result-score')?.textContent) || storedResult?.score || null,
        maxScore: Number(document.getElementById('result-max')?.textContent) || storedResult?.maxScore || null,
        interpretation: document.getElementById('result-level')?.textContent || storedResult?.interpretation?.level || '',
        description: document.getElementById('result-description')?.textContent || storedResult?.interpretation?.description || '',
        answers,
        demographics: {
          fullName: document.getElementById('full-name')?.value || '',
          birthDate: document.getElementById('birth-date')?.value || '',
          state: document.getElementById('state')?.value || '',
          gender: document.getElementById('gender')?.value || '',
          maritalStatus: document.getElementById('marital-status')?.value || '',
          education: document.getElementById('education')?.value || '',
          diagnosisReceived: document.getElementById('diagnosis-checkbox')?.checked || false,
          diagnosisList: Array.from(document.querySelectorAll('.diagnosis-option:checked')).map(el => el.value),
          diagnosisOther: document.getElementById('diagnosis-other')?.value || '',
          therapyFollowup: document.getElementById('therapy-checkbox')?.checked || false,
          therapyDetails: document.getElementById('therapy-details')?.value || '',
          children: document.getElementById('children')?.value || '',
          medsUse: document.getElementById('meds-checkbox')?.checked || false,
          medsDetails: document.getElementById('meds-details')?.value || '',
          behaviorChanges: document.getElementById('behavior-checkbox')?.checked || false,
          behaviorDetails: document.getElementById('behavior-details')?.value || '',
          phone: document.getElementById('phone')?.value || '',
          email: document.getElementById('email')?.value || '',
          comments: document.getElementById('comments')?.value || ''
        },
        consent: true,
        metadata: {
          user_id: userId,
          pageUrl: window.location.href,
          whichTestsComment,
          interpretationRequestedTests: selectedInterpretationTests,
          interpretationRequestedCount: selectedInterpretationTests.length
        }
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then((resp) => {
        if (!resp || resp.success !== true) {
          throw new Error(resp?.error || 'Falha ao atualizar dados');
        }
        submitBtn.textContent = '✓ Enviado';
        const formEl = document.getElementById('demographics-form');
        if (formEl) formEl.style.display = 'none';
        const titleEl = document.getElementById('demographics-title');
        const descEl = document.getElementById('demographics-desc');
        if (titleEl) titleEl.textContent = 'Próximos passos';
        if (descEl) {
          descEl.textContent = 'Agora você pode optar por fazer outros testes ou ir para o dashboard para realizar o pagamento. Quando seu pagamento for confirmado, nossa equipe entrará em contato, preferencialmente por e-mail, seja para solicitar mais informações, seja para enviar seu relatório técnico.';
        }
        document.querySelectorAll('.post-action').forEach(a => a.style.display = 'inline-flex');
        let count = 0;
        if (typeof Storage !== 'undefined') {
          try {
            count = Storage.getResultsIndex().length || 0;
          } catch (e) {
            count = 0;
          }
        }
        const msgEl = document.getElementById('post-send-message');
        if (msgEl) {
          const plural = count === 1 ? 'teste' : 'testes';
          msgEl.textContent = `Você realizou ${count} ${plural}. Você pode realizar novas avaliações ou ir para o dashboard para concluir o pagamento da interpretação. Caso você tenha executado mais do que 3 testes, nossa equipe entrará em contato com outros prazos e valores.`;
          msgEl.style.display = 'block';
        }

        // After successful submit, return user to dashboard.
        window.location.href = 'dashboard.html';
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Resultados';
      });
    });
  }
}

// Render bar chart for factors
let barHitboxes = [];

window.renderFactorsChart = function(factors) {
  if (!factors || factors.length === 0) return;

  const chartDiv = document.getElementById('factors-chart');
  if (!chartDiv) return;
  chartDiv.style.display = 'block';

  renderBarsChart(factors);
};

function renderBarsChart(factors) {
  const canvas = document.getElementById('factors-canvas-bars');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const labels = factors.map(f => f.name || f.id || '');
  const scores = factors.map(f => f.score || 0);
  const maxScore = Math.max(...factors.map(f => f.maxScore || 0), 1);

  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(520, Math.floor(rect.width || 800));
  canvas.height = 400;

  const width = canvas.width;
  const height = canvas.height;
  const padding = 60;
  const bottomPadding = 90; // Extra space for multi-line labels
  const barSpacing = 20;
  const chartHeight = height - padding - bottomPadding;
  const chartWidth = width - padding * 2;
  const barWidth = (width - padding * 2 - barSpacing * (factors.length - 1)) / factors.length;

  ctx.clearRect(0, 0, width, height);
  barHitboxes = [];

  const theme = 'bw';
  const gridColor = theme === 'bw' ? '#d9d9d9' : '#efe7de';
  const axisColor = theme === 'bw' ? '#2b2b2b' : '#cfc4b8';
  const labelColor = theme === 'bw' ? '#2b2b2b' : '#3f3f3f';

  // Gridlines + Y axis labels
  const ticks = 4;
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.font = '12px sans-serif';
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'right';
  for (let t = 0; t <= ticks; t++) {
    const y = padding + (chartHeight * (1 - t / ticks));
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();
    const val = Math.round(maxScore * (t / ticks));
    ctx.fillText(val.toString(), padding - 8, y + 4);
  }

  // Axes
  ctx.strokeStyle = axisColor;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + chartHeight);
  ctx.lineTo(padding + chartWidth, padding + chartHeight);
  ctx.stroke();

  // Helper function to wrap text
  function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  factors.forEach((f, i) => {
    const x = padding + i * (barWidth + barSpacing);
    const pct = (f.score || 0) / maxScore;
    const barHeight = pct * chartHeight;
    const y = padding + chartHeight - barHeight;

    if (theme === 'bw') {
      ctx.fillStyle = '#1a4d2e';
    } else {
      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, '#245f3a');
      grad.addColorStop(1, '#153f27');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = labelColor;
    ctx.font = '600 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${f.score || 0}/${f.maxScore || maxScore}`, x + barWidth / 2, y - 8);

    // Draw wrapped label below chart
    ctx.fillStyle = labelColor;
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'center';
    const labelLines = wrapText(labels[i], barWidth - 4);
    const lineHeight = 14;
    const startY = padding + chartHeight + 20;
    labelLines.forEach((line, lineIdx) => {
      ctx.fillText(line, x + barWidth / 2, startY + lineIdx * lineHeight);
    });

    barHitboxes.push({
      x,
      y,
      w: barWidth,
      h: barHeight,
      name: f.name || f.id || '',
      score: f.score || 0,
      max: f.maxScore || maxScore
    });
  });

  const chartDiv = document.getElementById('factors-chart');
  const tooltip = document.getElementById('chart-tooltip');
  if (chartDiv && tooltip) {
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;
      const hit = barHitboxes.find(b => cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h);
      if (!hit) {
        tooltip.style.display = 'none';
        canvas.style.cursor = 'default';
        return;
      }
      canvas.style.cursor = 'pointer';
      tooltip.textContent = `${hit.name}: ${hit.score}/${hit.max}`;
      const hostRect = chartDiv.getBoundingClientRect();
      tooltip.style.left = `${e.clientX - hostRect.left + 12}px`;
      tooltip.style.top = `${e.clientY - hostRect.top + 12}px`;
      tooltip.style.display = 'block';
    };
    canvas.onmouseleave = () => {
      tooltip.style.display = 'none';
      canvas.style.cursor = 'default';
    };
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectSharedPages);
} else {
  injectSharedPages();
}
