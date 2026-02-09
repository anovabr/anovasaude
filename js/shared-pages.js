// ===== SHARED PAGES TEMPLATE =====

function injectSharedPages() {
  const testContainer = document.querySelector(".test-container");
  if (!testContainer) return;

  const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzJY2wdkUagPXfOEDGfblH4DA8o9KEYZ2cXZ31nEaH8RK33yxtEHMjuj6ZqYh-dA2Ti/exec';
  const SHEETS_SECRET = 'Eugene2024##abc';

  const sharedPagesHTML = `
    <!-- PAGE 2: RESULTS PAGE -->
    <div id="results-page" class="page-section" style="display: none;">
      <div class="test-header">
        <h1>Seus Resultados</h1>
      </div>

      <!-- FACTORS BAR CHART -->
      <div id="factors-chart" style="display:none; margin-bottom:2rem;">
        <h3 style="margin-bottom:1rem;">Fatores Avaliados</h3>
        <canvas id="factors-canvas" style="max-height:300px;"></canvas>
      </div>

      <!-- PRIMARY SCORE -->
      <div class="result-box">
        <div class="result-score-display">
          <div class="score-number" id="result-score">0</div>
          <div class="score-max">de <span id="result-max">1</span></div>
        </div>
        <div class="result-interpretation">
          <h2 id="result-level">Nível</h2>
          <p id="result-description">Descrição</p>
        </div>
      </div>

      <!-- FACTORS BREAKDOWN (if multiple) -->
      <div id="factors-breakdown" class="result-answers" style="display:none;">
        <h3>Detalhamento por Fator</h3>
        <div id="factors-list"></div>
      </div>

      <!-- ANSWERS -->
      <div class="result-answers" id="result-answers-container">
        <h3>Suas Respostas</h3>
      </div>

      <div class="test-navigation">
        <button type="button" id="results-back-btn" class="btn btn-secondary">Voltar</button>
        <button id="interpretation-btn" class="btn btn-primary">Quero Interpretação Humana</button>
      </div>
    </div>

    <!-- PAGE 3: DEMOGRAPHICS FORM -->
    <div id="demographics-page" class="page-section" style="display: none;">
      <div class="test-header">
        <h1>Informações Pessoais</h1>
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

        <div class="test-navigation">
          <button type="button" id="back-to-results-btn" class="btn btn-secondary">Voltar</button>
          <button type="button" id="submit-results-btn" class="btn btn-primary">Enviar Resultados</button>
          <a href="../index.html#testes" class="btn btn-secondary post-action" style="display:none;">Fazer Outro Teste</a>
          <a href="https://anovasaude.lojavirtualnuvem.com.br/produtos/relatorio-personalizado/" target="_blank" class="btn btn-primary post-action" style="display:none;">Realizar Pagamento</a>
        </div>
      </form>
    </div>
  `;

  testContainer.insertAdjacentHTML("beforeend", sharedPagesHTML);

  // Navigation handlers
  document.addEventListener("click", e => {
    if (e.target.id === "interpretation-btn") {
      document.getElementById("results-page").style.display = "none";
      document.getElementById("demographics-page").style.display = "block";
      document.getElementById("demographics-page").scrollIntoView({ behavior: "smooth" });
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

      const testId = (window.location.pathname.split('/').pop() || '').replace('.html','');
      const payload = {
        token: SHEETS_SECRET,
        testId,
        testTitle: document.getElementById('test-title')?.textContent || testId,
        score: Number(document.getElementById('result-score')?.textContent) || null,
        maxScore: Number(document.getElementById('result-max')?.textContent) || null,
        interpretation: document.getElementById('result-level')?.textContent || '',
        description: document.getElementById('result-description')?.textContent || '',
        demographics: {
          fullName: document.getElementById('full-name')?.value || '',
          birthDate: document.getElementById('birth-date')?.value || '',
          state: document.getElementById('state')?.value || '',
          gender: document.getElementById('gender')?.value || '',
          diagnosis: document.getElementById('diagnosis')?.value || '',
          phone: document.getElementById('phone')?.value || '',
          email: document.getElementById('email')?.value || ''
        },
        consent: true,
        metadata: { pageUrl: window.location.href }
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      .then(r => r.text())
      .then(() => {
        submitBtn.textContent = '✓ Enviado';
        document.querySelectorAll('.post-action').forEach(a => a.style.display = 'inline-flex');
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Resultados';
      });
    });
  }
}

// Render bar chart for factors
window.renderFactorsChart = function(factors) {
  if (!factors || factors.length <= 1) return;

  const chartDiv = document.getElementById('factors-chart');
  const canvas = document.getElementById('factors-canvas');
  if (!chartDiv || !canvas) return;

  chartDiv.style.display = 'block';
  
  const ctx = canvas.getContext('2d');
  const labels = factors.map(f => f.name || f.id);
  const scores = factors.map(f => f.score);
  const maxScores = factors.map(f => f.maxScore || Math.max(...scores));

  const maxY = Math.max(...maxScores);
  const barWidth = canvas.width / (factors.length * 2);
  const barSpacing = barWidth / 2;

  canvas.height = 250;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  factors.forEach((f, i) => {
    const x = i * (barWidth + barSpacing) + barSpacing;
    const pct = f.score / maxY;
    const h = pct * 200;
    const y = 220 - h;

    ctx.fillStyle = '#1a4d2e';
    ctx.fillRect(x, y, barWidth, h);

    ctx.fillStyle = '#2b2b2b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.score, x + barWidth/2, y - 5);
    ctx.fillText(labels[i], x + barWidth/2, 240);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectSharedPages);
} else {
  injectSharedPages();
}