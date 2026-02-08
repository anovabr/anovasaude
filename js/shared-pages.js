// ===== SHARED PAGES TEMPLATE =====

function injectSharedPages() {
  const testContainer = document.querySelector(".test-container");
  if (!testContainer) return;

  // Apps Script webhook (replace SECRET_TOKEN if you added one to your script)
  const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzJY2wdkUagPXfOEDGfblH4DA8o9KEYZ2cXZ31nEaH8RK33yxtEHMjuj6ZqYh-dA2Ti/exec';
  const SHEETS_SECRET = 'Eugene2024##abc';

    const sharedPagesHTML = `
        <!-- PAGE 2: RESULTS PAGE -->
        <div id="results-page" class="page-section" style="display: none;">
            <div class="test-header">
                <h1>Seus Resultados</h1>
            </div>

            <div class="result-box">
                <div class="result-score-display">
                    <div class="score-number" id="result-score">0</div>
                    <div class="score-max">de <span id="result-max">1</span></div>
                </div>

                <div class="result-interpretation">
                    <h2 id="result-level">NÃ­vel</h2>
                    <p id="result-description">Descrição</p>
                </div>
            </div>

            <div class="result-answers" id="result-answers-container">
                <h3>Suas Respostas</h3>
            </div>

            <div class="test-navigation">
                <button type="button" id="results-back-btn" class="btn btn-secondary">Voltar</button>
                <button id="interpretation-btn" class="btn btn-primary">
                    Quero Interpretação Humana
                </button>
            </div>
        </div>

        <!-- PAGE 3: DEMOGRAPHICS FORM -->
        <div id="demographics-page" class="page-section" style="display: none;">
            <div class="test-header">
                <h1>InformaçÃµes Pessoais</h1>
                <p>Para enviar seus resultados e solicitar a interpretação profissional, preencha o formulário abaixo:</p>
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
                        <option value="ES">EspÃ­rito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">ParaÃ­ba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">PiauÃ­</option>
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
                  <label for="diagnosis">Já recebeu algum diagnóstico psiquiátrico dado por um médico?</label>
                  <select id="diagnosis" name="diagnosis">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                        <option value="Não tenho certeza">Não tenho certeza</option>
                    </select>
                </div>

                <div class="form-group">
                  <label for="phone">Telefone (com DDD)</label>
                  <input type="tel" id="phone" name="phone" placeholder="(11) 99999-9999">
                </div>

                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" name="email">
                </div>

                <div class="form-group">
                  <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="consent-checkbox" required>
                    Autorizo enviar meus resultados e entendo que deverei pagar para receber o relatório.
                  </label>
                </div>

                <div id="actions-bar" class="test-navigation actions-bar">
                    <button type="button" id="back-to-results-btn" class="btn btn-secondary">
                        Voltar
                    </button>
                    <button type="button" id="submit-results-btn" class="btn btn-primary">
                        Enviar Resultados
                    </button>
                    <a href="../index.html#testes" class="btn btn-secondary post-action" style="display:none;">
                      Fazer Outro Teste
                    </a>
                    <a href="https://anovasaude.lojavirtualnuvem.com.br/produtos/relatorio-personalizado/" target="_blank" class="btn btn-primary post-action" style="display:none;">
                      Realizar Pagamento
                    </a>
                </div>
            </form>
        </div>

    `;

  testContainer.insertAdjacentHTML("beforeend", sharedPagesHTML);

  document.addEventListener("click", e => {
    if (e.target.id === "interpretation-btn") {
      const resultsPage = document.getElementById("results-page");
      const demoPage = document.getElementById("demographics-page");
      if (!demoPage) return;
      // Show the form below the results without hiding the results
      demoPage.style.display = "block";
      // Ensure the demographics form is placed after the results section
      if (resultsPage && resultsPage.nextSibling !== demoPage) {
        resultsPage.parentNode.insertBefore(demoPage, resultsPage.nextSibling);
      }
      demoPage.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (e.target.id === "back-to-results-btn") {
      const demoPage = document.getElementById("demographics-page");
      if (!demoPage) return;
      demoPage.style.display = "none";
      const resultsPage = document.getElementById("results-page");
      if (resultsPage) resultsPage.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // When user wants to go back from results to the test form
    if (e.target.id === "results-back-btn") {
      const resultsPage = document.getElementById("results-page");
      const testPage = document.getElementById("test-page");
      if (resultsPage) resultsPage.style.display = "none";
      if (testPage) {
        testPage.style.display = "block";
        testPage.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // fallback to history.back()
        history.back();
      }
    }

    // (payment button removed) no click handling here
  });

  const form = document.getElementById("demographics-form");
  if (!form) return;

  // Disable native HTML5 validation to avoid browser popup messages
  form.noValidate = true;

  // Auto-format birth date as DD/MM/YYYY while typing
  const birthDateEl = document.getElementById('birth-date');
  if (birthDateEl) {
    const formatDateInput = ev => {
      const input = ev.target;
      let digits = input.value.replace(/\D/g, '').slice(0, 8);
      if (digits.length >= 5) {
        digits = digits.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
      } else if (digits.length >= 3) {
        digits = digits.replace(/(\d{2})(\d{1,2})/, '$1/$2');
      }
      input.value = digits;
    };

    birthDateEl.addEventListener('input', formatDateInput);
    birthDateEl.addEventListener('paste', e => {
      // Format pasted content as well
      setTimeout(() => formatDateInput({ target: e.target }), 0);
    });
  }

  // Use button click to submit to avoid native form submission/navigation
  const submitBtn = document.getElementById('submit-results-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function clickHandler(ev) {
      ev.preventDefault();

      // Assemble payload for Google Sheets webhook
      const testId = (window.location.pathname.split('/').pop() || '').replace('.html','');
      const testTitleEl = document.getElementById('test-title');
      const testTitle = testTitleEl ? testTitleEl.textContent.trim() : testId;
      const scoreEl = document.getElementById('result-score');
      const maxEl = document.getElementById('result-max');
      const score = scoreEl ? Number(scoreEl.textContent.trim()) : null;
      const maxScore = maxEl ? Number(maxEl.textContent.trim()) : null;
      const interpretation = (document.getElementById('result-level') && document.getElementById('result-level').textContent) || '';
      const description = (document.getElementById('result-description') && document.getElementById('result-description').textContent) || '';

      // Collect answers (text content from result answers container)
      const answersContainer = document.getElementById('result-answers-container');
      let answers = [];
      if (answersContainer) {
        const items = answersContainer.querySelectorAll('li, p, div, span');
        if (items && items.length) {
          answers = Array.from(items).map(n => n.textContent.trim()).filter(Boolean);
        } else {
          const text = answersContainer.textContent.trim();
          if (text) answers = [text];
        }
      }

      // Collect demographics fields if present
      const getVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
      const demographics = {
        fullName: getVal('full-name'),
        birthDate: getVal('birth-date'),
        state: getVal('state'),
        gender: getVal('gender'),
        diagnosis: getVal('diagnosis'),
        phone: getVal('phone'),
        email: getVal('email')
      };

      // Consent enforcement (checkbox)
      const consentEl = document.getElementById('consent-checkbox');
      const prevText = submitBtn ? submitBtn.textContent : null;
      if (!consentEl || !consentEl.checked) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = prevText; }
        if (consentEl) {
          // visually highlight / animate the consent label to draw attention
          const labelEl = consentEl.closest('label') || consentEl.parentNode;
          try {
            if (labelEl && labelEl.animate) {
              labelEl.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-6px)' },
                { transform: 'translateX(6px)' },
                { transform: 'translateX(0)' }
              ], { duration: 420, easing: 'ease-out' });
            } else if (labelEl) {
              // fallback highlight via temporary background
              const origBg = labelEl.style.backgroundColor;
              labelEl.style.backgroundColor = '#ffeeba';
              setTimeout(() => { labelEl.style.backgroundColor = origBg; }, 700);
            }
          } catch (err) {
            // ignore animation errors
            console.error(err);
          }
          consentEl.focus();
        }
        return;
      }

      const payload = {
        token: SHEETS_SECRET,
        testId,
        testTitle,
        score,
        maxScore,
        interpretation: interpretation || description,
        answers,
        demographics,
        consent: !!(consentEl && consentEl.checked),
        metadata: { pageUrl: window.location.href, userAgent: navigator.userAgent }
      };

      // Disable submit button while sending
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; }

      // Send as text/plain to avoid CORS preflight (Apps Script accepts raw body)
      fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      .then(r => r.text())
      .then(txt => {
        let resp = {};
        try { resp = JSON.parse(txt); } catch (_) { /* ignore parse errors */ }
        const success = resp.success !== false; // treat non-false as success to keep UX flowing

        if (submitBtn) {
          if (success) {
            submitBtn.textContent = '✓ Enviado';
            submitBtn.disabled = true;
            
            // Show the two new buttons
            const postActions = document.querySelectorAll('.post-action');
            postActions.forEach(a => a.style.display = 'inline-flex');
          } else {
            submitBtn.disabled = false;
            submitBtn.textContent = prevText || 'Enviar Resultados';
            console.error('Submission error', resp);
          }
        }
      })
      .catch(err => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = prevText || 'Enviar Resultados'; }
        console.error(err);
      });
    }, true);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectSharedPages);
} else {
  injectSharedPages();
}



