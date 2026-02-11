const highlightContainer = document.getElementById("tests-highlight");
const catalogFrame = document.getElementById("catalog-source");

function createVideoCard() {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `
    <div class="video-container video-container--wistia">
      <wistia-player media-id="r9ja6ay4hi" aspect="1.7777777777777777" playButton="false"></wistia-player>
    </div>
    <p class="video-caption">Apresentação da proposta, por Dr. Luis Anunciação.</p>
  `;
  return card;
}

function renderFallback() {
  if (!highlightContainer) return;
  const tpl = document.getElementById("catalog-static");
  if (!tpl) return;
  const clone = tpl.content.cloneNode(true);
  highlightContainer.innerHTML = "";
  highlightContainer.appendChild(createVideoCard());
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
        window.location.href = `test.html?id=${testId}`;
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
  card.setAttribute('data-category', test.category || 'para-voce');
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
      highlightContainer.appendChild(createVideoCard());
      picks.forEach(t => highlightContainer.appendChild(createCard(t)));
      attachClicks(highlightContainer);
      if (window.ProgressDashboard) window.ProgressDashboard.refresh();
      
      // Setup filtering on homepage
      setupCategoryFilters(highlightContainer);
    })
    .catch(err => {
      console.error(err);
      if (window.location.protocol === "file:") renderFallback();
    });
}

function setupCategoryFilters(container) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length === 0) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      
      const selectedCategory = btn.dataset.category;
      const cards = container.querySelectorAll('.test-card');
      
      cards.forEach(card => {
        if (selectedCategory === 'all') {
          card.style.display = '';
        } else {
          const cardCategory = card.getAttribute('data-category') || 'para-voce';
          card.style.display = cardCategory === selectedCategory ? '' : 'none';
        }
      });
    });
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
  const photoContainer = document.getElementById('team-modal-photo-container');
  const footerModal = document.getElementById('footer-modal');
  const footerBackdrop = document.getElementById('footer-modal-backdrop');
  const footerClose = document.getElementById('footer-modal-close');
  const footerTitle = document.getElementById('footer-modal-title');
  const footerBody = document.getElementById('footer-modal-body');

  const openModal = (name, role, bio, photoHtml) => {
    if (!modal) return;
    nameEl.textContent = name || '';
    roleEl.textContent = role || '';
    bioEl.textContent = bio || '';
    if (photoContainer) {
      photoContainer.innerHTML = photoHtml || '';
    }
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
      const photoEl = card.querySelector('[class*="team-photo"]');
      let photoHtml = '';
      if (photoEl) {
        if (photoEl.tagName === 'IMG') {
          photoHtml = `<img src="${photoEl.src}" alt="${card.dataset.name}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">`;
        } else {
          photoHtml = `<div style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; border-radius: 8px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: white;">${photoEl.textContent}</div>`;
        }
      }
      openModal(card.dataset.name, card.dataset.role, card.dataset.bio, photoHtml);
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

  // Scroll Reveal Animation
  const revealElements = () => {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(element => {
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150; // Trigger 150px before element comes into view

      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('active');
      }
    });
  };

  // Add reveal class to sections and cards on page load
  window.addEventListener('load', () => {
    document.querySelectorAll('section, .test-card, .feature-card, .team-card').forEach(el => {
      if (!el.classList.contains('team-section')) { // Don't add to team-section as it has custom styling
        el.classList.add('reveal');
      }
    });
    revealElements();
  });

  window.addEventListener('scroll', revealElements);


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
