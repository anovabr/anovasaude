const highlightContainer = document.getElementById("tests-highlight");
const catalogFrame = document.getElementById("catalog-source");

function renderFallback() {
  if (!highlightContainer) return;
  const tpl = document.getElementById("catalog-static");
  if (!tpl) return;
  const clone = tpl.content.cloneNode(true);
  highlightContainer.innerHTML = "";
  highlightContainer.appendChild(clone);
  attachClicks(highlightContainer);
  if (window.ProgressDashboard) window.ProgressDashboard.refresh();
}

function attachClicks(scope) {
  scope.querySelectorAll(".test-card").forEach(card => {
    const testId = card.getAttribute("data-test-id");
    const inline = card.getAttribute("onclick");
    card.style.cursor = "pointer";
    card.removeAttribute("onclick");
    card.addEventListener("click", e => {
      if (e.target.closest(".badge")) return;
      if (testId) {
        window.location.href = `html_tests/test.html?id=${testId}`;
        return;
      }
      if (inline) {
        try { eval(inline); } catch (err) { console.error(err); }
      }
    });
  });
}

function createCard(test) {
  const card = document.createElement('div');
  card.className = 'test-card';
  card.setAttribute('data-test-id', test.id);
  if (test.featured) card.setAttribute('data-destaque', 'true');

  const ribbon = test.curadoria ? '<span class="ribbon">Curadoria Anova</span>' : '';
  const article = test.articleUrl ? `<a class="badge badge--article" href="${test.articleUrl}" target="_blank" rel="noopener">Artigo</a>` : '';

  card.innerHTML = `
    ${ribbon}
    <span class="test-tag">${test.tag || 'Teste'}</span>
    <h4>${test.title}</h4>
    <p>${test.description || ''}</p>
    <div class="test-meta"><span>⏱️ ${test.estimatedTime || ''}</span><span>📊 ${test.questionCount || ''} questões</span></div>
    <div class="test-actions">
      ${article}
    </div>
  `;

  return card;
}

function loadHighlightsFromJson() {
  fetch('tests/index.json')
    .then(r => r.json())
    .then(tests => {
      const featured = tests.filter(t => t.featured);
      const picks = (featured.length ? featured : tests).slice(0, 3);
      highlightContainer.innerHTML = "";
      picks.forEach(t => highlightContainer.appendChild(createCard(t)));
      attachClicks(highlightContainer);
      if (window.ProgressDashboard) window.ProgressDashboard.refresh();
    })
    .catch(err => {
      console.error(err);
      if (window.location.protocol === "file:") renderFallback();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.ProgressDashboard) {
    window.ProgressDashboard.refresh();
  }

  const modal = document.getElementById('team-modal');
  const backdrop = document.getElementById('team-modal-backdrop');
  const closeBtn = document.getElementById('team-modal-close');
  const nameEl = document.getElementById('team-modal-name');
  const roleEl = document.getElementById('team-modal-role');
  const bioEl = document.getElementById('team-modal-bio');
  const footerModal = document.getElementById('footer-modal');
  const footerBackdrop = document.getElementById('footer-modal-backdrop');
  const footerClose = document.getElementById('footer-modal-close');
  const footerTitle = document.getElementById('footer-modal-title');
  const footerBody = document.getElementById('footer-modal-body');

  const openModal = (name, role, bio) => {
    if (!modal) return;
    nameEl.textContent = name || '';
    roleEl.textContent = role || '';
    bioEl.textContent = bio || '';
    modal.classList.add('team-modal--open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('team-modal--open');
    modal.setAttribute('aria-hidden', 'true');
  };

  const openFooterModal = (title, body) => {
    if (!footerModal) return;
    footerTitle.textContent = title || '';
    footerBody.innerHTML = body || '';
    footerModal.classList.add('team-modal--open');
    footerModal.setAttribute('aria-hidden', 'false');
  };

  const closeFooterModal = () => {
    if (!footerModal) return;
    footerModal.classList.remove('team-modal--open');
    footerModal.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => {
      openModal(card.dataset.name, card.dataset.role, card.dataset.bio);
    });
  });

  [backdrop, closeBtn].forEach(el => {
    if (el) el.addEventListener('click', closeModal);
  });

  [footerBackdrop, footerClose].forEach(el => {
    if (el) el.addEventListener('click', closeFooterModal);
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeFooterModal();
    }
  });

  document.querySelectorAll('.footer-panel-link').forEach(btn => {
    btn.addEventListener('click', () => {
      openFooterModal(btn.dataset.title, btn.dataset.body);
    });
  });

  if (window.location.protocol === 'file:') {
    renderFallback();
  } else {
    loadHighlightsFromJson();
  }

  setTimeout(() => {
    if (highlightContainer && !highlightContainer.children.length && window.location.protocol === 'file:') {
      renderFallback();
    }
  }, 800);
});
