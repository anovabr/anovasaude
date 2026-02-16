document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('results-list');
  if (!container || typeof Storage === 'undefined') return;
  const openResultId = new URLSearchParams(window.location.search).get('open_result') || '';
  let didAutoOpenResult = false;

  const MP_PREF_ONE = '63317762-5eeb54d6-3242-4b6c-8bd7-3176fad46396';
  const MP_PREF_THREE = '63317762-195fd6d9-b3a9-47a0-a261-5cb1d63bd83e';
  const DASHBOARD_API = 'https://script.google.com/macros/s/AKfycby8BTh278W7IN-bYgn74kV9dNqRYmEN3qszhGGrghLEZ3pQbqo0UwplKijxCKBizgzZ/exec';
  const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzVZifIzJPeLNbGRQapGj0NQr-Xs6lRntuNWoEK9oUlEqHoI9Uc6nEQvn3INDurKrTs/exec';
  const SHEETS_SECRET = 'Eugene2024##abc';
  const FINANCEIRO_PUBLIC_URL = '/financeiro.json';

  const formatBRL = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const loadDashboardPrices = async () => {
    const priceOneEl = document.getElementById('dashboard-price-one');
    const priceThreeEl = document.getElementById('dashboard-price-three');
    if (!priceOneEl || !priceThreeEl) return;
    try {
      const res = await fetch(`${FINANCEIRO_PUBLIC_URL}?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      priceOneEl.textContent = formatBRL(data.preco_um_teste);
      priceThreeEl.textContent = formatBRL(data.preco_ate_tres);
    } catch (err) {
      priceOneEl.textContent = '—';
      priceThreeEl.textContent = '—';
    }
  };

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

  const normalizeKey = (value) => {
    if (!value) return '';
    return String(value)
      .replace(/^["']+|["']+$/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  const markInterpretationClickedServer = () => {
    const userId = sessionStorage.getItem('anova_user_id');
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
  };

  const markAdvancedAnalysisClickedServer = () => {
    const userId = sessionStorage.getItem('anova_user_id');
    if (!userId || !SHEETS_WEBHOOK_URL || !SHEETS_SECRET) return;
    const url = new URL(SHEETS_WEBHOOK_URL);
    url.searchParams.set('password', SHEETS_SECRET);
    url.searchParams.set('action', 'mark_advanced_analysis_clicked');
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
  };

  const openPaymentDrawer = () => {
    let overlay = document.getElementById('payment-drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'payment-drawer-overlay';
      overlay.className = 'payment-drawer-overlay';
      overlay.innerHTML = `
        <aside class="payment-drawer" role="dialog" aria-modal="true" aria-label="Pagamento">
          <button type="button" class="payment-drawer__close" aria-label="Fechar">×</button>
          <h3 class="payment-drawer__title">Realizar pagamento</h3>
          <p class="payment-drawer__desc">Escolha uma opção de pagamento pelo Mercado Pago:</p>
          <div class="payment-drawer__actions">
            <div class="mp-payment-button" data-pref="${MP_PREF_ONE}"></div>
            <div class="mp-payment-button" data-pref="${MP_PREF_THREE}"></div>
          </div>
          <div class="payment-drawer__labels">
            <span>Pagar 1 teste</span>
            <span>Pagar até 3 testes</span>
          </div>
        </aside>
      `;
      document.body.appendChild(overlay);

      const closeDrawer = () => {
        overlay.classList.remove('is-open');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 220);
      };

      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) closeDrawer();
      });
      const closeBtn = overlay.querySelector('.payment-drawer__close');
      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

      const btns = overlay.querySelectorAll('.mp-payment-button');
      if (btns[0]) renderMPButton(btns[0], MP_PREF_ONE);
      if (btns[1]) renderMPButton(btns[1], MP_PREF_THREE);
    }

    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('is-open'));
  };

  // Approximation of the error function for normal CDF.
  const erf = (x) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    let ax = Math.abs(x);
    const t = 1 / (1 + p * ax);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
    return sign * y;
  };

  const normalDensity = (x, mean, stdDev) => {
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
  };

  const generateNormalCurveData = (mean, stdDev, numPoints = 100) => {
    const data = [];
    const range = 4 * stdDev;
    const startX = mean - range;
    const endX = mean + range;
    const step = (endX - startX) / numPoints;
    for (let i = 0; i <= numPoints; i++) {
      const x = startX + i * step;
      const y = normalDensity(x, mean, stdDev);
      data.push({ x, y });
    }
    return data;
  };

  function openAnalysisIframe() {
    markAdvancedAnalysisClickedServer();

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; align-items: center;
      justify-content: center; z-index: 10000; cursor: pointer;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 40px; border-radius: 12px; max-width: 960px; width: 90vw; max-height: 80vh; overflow-y: auto; text-align: center; cursor: default;">
        <h3>Análise Estatística</h3>
        <div id="stats-total" style="margin: 8px 0 16px; color: #555;">O sistema tem ...</div>
        <div id="stats-tests" style="margin: 0 0 16px; color: #555;">Existem ...</div>
        <div id="stats-result">Calculando...</div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="margin-top: 20px; background: #1a4d2e; color: white; border: none; padding: 12px 30px; border-radius: 6px; cursor: pointer;">
          Fechar
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.remove();
    });

    const userResults = Storage.getResultsIndex();

    fetch(DASHBOARD_API)
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error(data.error);

        const totalEl = document.getElementById('stats-total');
        const totalRows = Array.isArray(data.data) ? data.data.length : 0;
        if (totalEl) totalEl.textContent = `O sistema tem ${totalRows} respostas`;

        const uniqueTests = new Set();
        (Array.isArray(data.data) ? data.data : []).forEach(row => {
          const rowText = String(row[0] || '');
          const titleMatch = rowText.match(/testTitle = ([^,]+)/);
          const title = titleMatch ? normalizeKey(titleMatch[1]) : '';
          if (title) uniqueTests.add(title);
        });
        const testsEl = document.getElementById('stats-tests');
        if (testsEl) testsEl.textContent = `Existem ${uniqueTests.size} testes diferentes realizados no sistema.`;

        let html = '';

        userResults.forEach(userTest => {
          const userScore = userTest.score;
          const testTitle = (userTest.testTitle || '').trim();
          const userKey = normalizeKey(testTitle);

          if (userScore == null || !userKey) return;

          const allScores = [];
          let testCount = 0;

          data.data.forEach(row => {
            const rowText = String(row[0] || '');

            const titleMatch = rowText.match(/testTitle = ([^,]+)/i);
            const rowTitle = titleMatch ? normalizeKey(titleMatch[1]) : '';
            if (!(rowTitle && rowTitle === userKey)) return;
            testCount += 1;

            const scoreMatch = rowText.match(/score = ([^,]+)/);
            if (scoreMatch && scoreMatch[1].trim() !== '') {
              const score = parseFloat(scoreMatch[1].trim());
              if (!isNaN(score)) allScores.push(score);
            }
          });

          const hasScores = allScores.length > 0;
          const mean = hasScores ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;
          const variance = hasScores ? allScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allScores.length : null;
          const stdDev = hasScores && variance > 0 ? Math.sqrt(variance) : null;
          const zScore = hasScores && stdDev ? (userScore - mean) / stdDev : null;
          const tScore = zScore !== null ? 50 + 10 * zScore : null;
          const percentile = zScore !== null ? Math.round(100 * (0.5 + 0.5 * erf(zScore / Math.sqrt(2)))) : null;
          const diff = hasScores ? (userScore - mean) : null;

          let curveSvg = '<p>Curva não disponível</p>';
          if (zScore !== null && stdDev !== null) {
            const curveData = generateNormalCurveData(mean, stdDev);
            const maxY = Math.max(...curveData.map(p => p.y));
            const scaleY = 160 / maxY;
            const rangeX = 8 * stdDev;
            const startX = mean - 4 * stdDev;
            const scaleX = 360 / rangeX;

            const pathData = curveData.map((p, i) => {
              const xSvg = 20 + (p.x - startX) * scaleX;
              const ySvg = 180 - p.y * scaleY;
              return (i === 0 ? 'M' : 'L') + ` ${xSvg.toFixed(1)} ${ySvg.toFixed(1)}`;
            }).join(' ');

            const zX = mean + zScore * stdDev;
            const zXSvg = 20 + (zX - startX) * scaleX;
            const shadedIndex = curveData.findIndex(p => p.x >= zX);
            const shadedPath = shadedIndex > 0
              ? curveData.slice(0, shadedIndex + 1).map((p, i) => {
                  const xSvg = 20 + (p.x - startX) * scaleX;
                  const ySvg = 180 - p.y * scaleY;
                  return (i === 0 ? 'M' : 'L') + ` ${xSvg.toFixed(1)} ${ySvg.toFixed(1)}`;
                }).join(' ') + ` L ${zXSvg.toFixed(1)} 180 L 20 180 Z`
              : '';

            curveSvg = `
              <svg width="400" height="200" viewBox="0 0 400 200">
                ${shadedPath ? `<path d="${shadedPath}" fill="rgba(0,100,255,0.3)"/>` : ''}
                <path d="${pathData}" stroke="#333" stroke-width="2" fill="none"/>
                <line x1="20" y1="180" x2="380" y2="180" stroke="#666" stroke-width="1"/>
                <line x1="200" y1="180" x2="200" y2="15" stroke="#666" stroke-width="1" stroke-dasharray="2,2"/>
                <text x="200" y="15" text-anchor="middle" font-size="10" fill="#666">Média</text>
                <line x1="${zXSvg.toFixed(1)}" y1="180" x2="${zXSvg.toFixed(1)}" y2="10" stroke="red" stroke-width="2"/>
                <text x="20" y="195" font-size="8" fill="#666">-4s</text>
                <text x="380" y="195" font-size="8" fill="#666">+4s</text>
              </svg>
            `;
          }

          html += `
            <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; display: flex; gap: 20px;">
              <div style="flex: 1; text-align: left;">
                <h4 style="margin: 0 0 10px 0;">${testTitle || 'Teste'}</h4>
                <p><strong>Este teste foi feito:</strong> ${testCount} vezes</p>
                <p><strong>Seu score:</strong> ${userScore}</p>
                ${hasScores ? `<p><strong>Média geral (n=${allScores.length}):</strong> ${mean.toFixed(2)}</p>` : ''}
                ${stdDev !== null ? `<p><strong>Desvio-padrão:</strong> ${stdDev.toFixed(2)}</p>` : ''}
                ${hasScores ? `<p style="color: ${diff > 0 ? '#d32f2f' : '#4caf50'};">${diff > 0 ? 'Acima da média' : 'Abaixo da média'}</p>` : ''}
                ${zScore !== null ? `<p><strong>Z-score:</strong> ${zScore.toFixed(2)}</p>` : ''}
                ${tScore !== null ? `<p><strong>T-score:</strong> ${tScore.toFixed(2)}</p>` : ''}
                ${percentile !== null ? `<p><strong>Percentil:</strong> ${percentile}º</p>` : ''}
              </div>
              <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                ${curveSvg}
              </div>
            </div>
          `;
        });

        document.getElementById('stats-result').innerHTML = html || '<p>Nenhum dado encontrado</p>';
      })
      .catch(err => {
        document.getElementById('stats-result').innerHTML =
          '<p style="color: red;">Erro ao carregar dados: ' + err.message + '</p>';
      });
  }

  loadDashboardPrices();

  const index = Storage.getResultsIndex();
  if (!index.length) {
    container.innerHTML = '<div class="result-answers"><h3>Nenhum resultado salvo ainda.</h3></div>';
    return;
  }

  const currentSessionUserId = sessionStorage.getItem('anova_user_id') || 'sem user_id';
  const infoRows = Array.from(document.querySelectorAll('.dashboard-info__row p'));
  const privacyRow = infoRows.find((p) => /Privacidade:/i.test((p.textContent || '').trim()));
  if (privacyRow) {
    privacyRow.innerHTML = `<strong>Privacidade:</strong> se você fechar esta janela, seus dados são perdidos. Isto faz parte da nossa política de privacidade. Inclusive, seu registro temporário no site é ${currentSessionUserId}`;
  }

  const stamp = document.querySelector('.tests-stamp');
  if (stamp) {
    const sortedIndex = index.slice().reverse();
    const submittedItem = sortedIndex.find((entry) => {
      const funnel = Storage.getFunnel(entry.resultId);
      return !!(funnel && funnel.submit_clicked);
    });
    const pendingItem = sortedIndex.find((entry) => {
      const funnel = Storage.getFunnel(entry.resultId);
      return !(funnel && funnel.submit_clicked);
    });
    const targetItem = submittedItem || pendingItem || sortedIndex[0];

    const existingStampBtn = stamp.querySelector('.tests-stamp__action');
    if (existingStampBtn) existingStampBtn.remove();
    const existingStampMoreBtn = stamp.querySelector('.tests-stamp__more');
    if (existingStampMoreBtn) existingStampMoreBtn.remove();
    if (targetItem) {
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'tests-stamp__action tests-stamp__more';
      moreBtn.textContent = 'Fazer mais testes';
      moreBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        window.location.href = 'catalogo.html';
      });
      stamp.appendChild(moreBtn);

      const stampBtn = document.createElement('button');
      stampBtn.type = 'button';
      stampBtn.className = 'tests-stamp__action';
      stampBtn.textContent = submittedItem ? 'Realizar pagamento' : 'Adquirir relatório técnico';
      stampBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (submittedItem) {
          openPaymentDrawer();
          return;
        }
        Storage.setFunnelEvent(targetItem.resultId, 'interpretation_clicked');
        markInterpretationClickedServer();
        window.location.href = buildInterpretationUrl(targetItem.testId, targetItem.resultId);
      });
      stamp.appendChild(stampBtn);
    }
  }

  // Collapsible advanced analyses card
  const topDetails = document.createElement('details');
  topDetails.className = 'dashboard-info';
  topDetails.style.margin = '12px 0';

  const topSummary = document.createElement('summary');
  topSummary.style.cssText = 'cursor: pointer; white-space: nowrap;';
  topSummary.innerHTML = '<h3 class="section-title" style="display: inline;">Análises avançadas</h3>';
  topDetails.appendChild(topSummary);

  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = 'position: relative; padding: 10px 0 64px;';
  contentDiv.innerHTML = `
    <div class="dashboard-info__row">
      <span class="dashboard-info__icon" aria-hidden="true">💳</span>
      <p><strong>Opção paga:</strong> Esta é uma opção paga.</p>
    </div>
    <div class="dashboard-info__row">
      <span class="dashboard-info__icon" aria-hidden="true">📊</span>
      <p><strong>Relatório dinâmico:</strong> Cada teste será comparado para obter Z-scores, T-scores e percentis.</p>
    </div>
    <div class="dashboard-info__row">
      <span class="dashboard-info__icon" aria-hidden="true">⏳</span>
      <p><strong>Carregamento:</strong> Este relatório pode demorar para ser carregado.</p>
    </div>
    <div class="dashboard-info__row">
      <span class="dashboard-info__icon" aria-hidden="true">⚠️</span>
      <p><strong>Aviso:</strong> Os resultados não substituem uma consulta ou avaliação psicológica ou psiquiátrica.</p>
    </div>
  `;

  const bigAnalysisBtn = document.createElement('button');
  bigAnalysisBtn.id = 'bigAnalysisBtn';
  bigAnalysisBtn.type = 'button';
  bigAnalysisBtn.textContent = 'Abrir';
  bigAnalysisBtn.style.cssText = 'position: absolute; bottom: 10px; right: 10px; background: #1a4d2e; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;';
  bigAnalysisBtn.addEventListener('click', openAnalysisIframe);
  contentDiv.appendChild(bigAnalysisBtn);

  topDetails.appendChild(contentDiv);
  container.appendChild(topDetails);

  // NOW RENDER TEST CARDS
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
    details.dataset.resultId = item.resultId || '';

    const summary = document.createElement('summary');
    summary.className = 'result-row__summary';

    const funnelData = Storage.getFunnel(item.resultId);
    const stepSubmitted = funnelData ? !!funnelData.submit_clicked : false;

    summary.innerHTML = `
      <div class="result-row__head">
        <div class="result-row__title">${title}</div>
        <div class="result-row__meta">${score != null && max != null ? `${score} / ${max}` : (score ?? '—')} ${level ? ` • ${level}` : ''} • ${date}</div>
      </div>
    `;

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
        alert('Não foi possível remover este teste.');
      }
    });
    
    const actionWrap = document.createElement('div');
    actionWrap.className = 'result-row__actions';

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
    actionWrap.appendChild(toggleBtn);
    actionWrap.appendChild(deleteBtn);
    summary.appendChild(actionWrap);
    details.appendChild(summary);

    summary.addEventListener('click', (ev) => {
      // Keep explicit buttons independent.
      if (ev.target.closest('.row-toggle') || ev.target.closest('.row-delete')) {
        return;
      }
      ev.preventDefault();
      details.open = !details.open;
      toggleBtn.textContent = details.open ? 'Ocultar' : 'Exibir';
      toggleBtn.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    });

    const content = document.createElement('div');
    content.className = 'result-row__content';

    const box = document.createElement('div');
    box.className = 'result-answers';

    // Add factors chart for this test (also works with a single factor).
    if (Array.isArray(res.factors) && res.factors.length > 0) {
      const chartContainer = document.createElement('div');
      chartContainer.style.cssText = 'margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; position: relative;';
      chartContainer.innerHTML = `
        <h4 style="margin: 0 0 15px 0;">Fatores Avaliados</h4>
        <canvas id="chart-${item.resultId}" style="max-height: 340px; width: 100%;"></canvas>
        <div id="chart-tooltip-${item.resultId}" class="chart-tooltip" style="display:none;"></div>
      `;
      box.appendChild(chartContainer);
      
      // Render after insertion so the canvas can measure.
      setTimeout(() => {
        renderMiniChart(`chart-${item.resultId}`, `chart-tooltip-${item.resultId}`, res.factors);
      }, 100);

      const breakdown = document.createElement('div');
      breakdown.className = 'result-answers';
      breakdown.innerHTML = `
        <h3>Detalhamento por Fator</h3>
        <p class="factor-note">Estes resultados indicam seus pontos brutos obtidos e a relação deles com os valores mínimo e máximo possíveis. Eles não possuem transformações psicométricas padronizadas, como pontos ponderados, Z-scores, T-scores ou percentis. Assim, a única interpretação possível é descritiva, sendo útil para transparência dos resultados, comparação intra-instrumento e acompanhamento longitudinal. Estes resultados não devem ser interpretados como diagnóstico em nenhum caso.</p>
      `;
      const factorsList = document.createElement('div');
      res.factors.forEach((f) => {
        const card = document.createElement('div');
        card.className = 'factor-card';
        const factorMax = f.maxScore || 0;
        const factorPct = factorMax ? Math.min(100, Math.round(((f.score || 0) / factorMax) * 100)) : 0;
        card.innerHTML = `
          <div class="factor-header">
            <div class="factor-title">${f.name || f.id || ''}</div>
            <div class="factor-level">${f.level || ''}</div>
          </div>
          <div class="factor-bar">
            <span class="factor-min">0</span>
            <div class="factor-track">
              <div class="factor-fill" style="width:${factorPct}%;">
                <span class="factor-value">${f.score || 0}</span>
              </div>
            </div>
            <span class="factor-max">${factorMax}</span>
          </div>
          ${f.description ? `<div class="factor-interpretation">${f.description}</div>` : ''}
        `;
        factorsList.appendChild(card);
      });
      breakdown.appendChild(factorsList);
      box.appendChild(breakdown);
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

    if (Array.isArray(res.factors) && res.factors.length > 0) {
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

    if (!didAutoOpenResult && openResultId && item.resultId === openResultId) {
      details.open = true;
      toggleBtn.textContent = 'Ocultar';
      toggleBtn.setAttribute('aria-expanded', 'true');
      didAutoOpenResult = true;
      setTimeout(() => {
        details.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
    }

    details.appendChild(content);
    container.appendChild(details);
  });
});

// Mini chart renderer for each test.
function renderMiniChart(canvasId, tooltipId, factors) {
  const canvas = document.getElementById(canvasId);
  const tooltip = document.getElementById(tooltipId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width || 600);
  canvas.height = 280;

  const width = canvas.width;
  const height = canvas.height;
  const padding = 50;
  const bottomPadding = 80;
  const chartHeight = height - padding - bottomPadding;
  const chartWidth = width - padding * 2;
  const barGap = 16;
  const barWidth = (chartWidth - (barGap * (factors.length - 1))) / factors.length;

  const maxScore = Math.max(...factors.map(f => f.maxScore || 0), 1);

  ctx.clearRect(0, 0, width, height);

  // Grid and axes
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight * i / 4);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + chartHeight);
  ctx.lineTo(padding + chartWidth, padding + chartHeight);
  ctx.stroke();

  // Bars
  factors.forEach((f, i) => {
    const x = padding + i * (barWidth + barGap);
    const bw = barWidth;
    const pct = (f.score || 0) / maxScore;
    const bh = pct * chartHeight;
    const y = padding + chartHeight - bh;

    ctx.fillStyle = '#1a4d2e';
    ctx.fillRect(x, y, bw, bh);

    // Score label
    ctx.fillStyle = '#333';
    ctx.font = '600 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${f.score || 0}/${f.maxScore || maxScore}`, x + bw / 2, y - 5);

    // Factor name
    ctx.fillStyle = '#666';
    ctx.font = '600 10px sans-serif';
    const name = (f.name || f.id || '').substring(0, 18);
    ctx.fillText(name, x + bw / 2, padding + chartHeight + 20);
  });

  if (!tooltip) return;
  const hitboxes = factors.map((f, i) => {
    const x = padding + i * (barWidth + barGap);
    const pct = (f.score || 0) / maxScore;
    const bh = pct * chartHeight;
    const y = padding + chartHeight - bh;
    return {
      x, y, w: barWidth, h: bh,
      name: f.name || f.id || '',
      score: f.score || 0,
      max: f.maxScore || maxScore
    };
  });

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const hit = hitboxes.find((b) => cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h);
    if (!hit) {
      tooltip.style.display = 'none';
      canvas.style.cursor = 'default';
      return;
    }
    canvas.style.cursor = 'pointer';
    tooltip.textContent = `${hit.name}: ${hit.score}/${hit.max}`;
    tooltip.style.left = `${e.clientX - rect.left + 10}px`;
    tooltip.style.top = `${e.clientY - rect.top + 10}px`;
    tooltip.style.display = 'block';
  };

  canvas.onmouseleave = () => {
    tooltip.style.display = 'none';
    canvas.style.cursor = 'default';
  };
}





