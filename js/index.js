const highlightContainer = document.getElementById('tests-highlight');
const catalogFrame = document.getElementById('catalog-source');

function renderFallback(useStatic = true) {
    if (!highlightContainer) return;
    const tplId = useStatic ? 'catalog-static' : 'catalog-fallback';
    const tpl = document.getElementById(tplId);
    if (!tpl) return;
    const clone = tpl.content.cloneNode(true);
    highlightContainer.innerHTML = '';
    highlightContainer.appendChild(clone);
    attachClicks(highlightContainer);
    if (window.ProgressDashboard) window.ProgressDashboard.refresh();
}

function attachClicks(scope) {
    scope.querySelectorAll('.test-card').forEach(card => {
        const testId = card.getAttribute('data-test-id');
        const inline = card.getAttribute('onclick');
        card.style.cursor = 'pointer';
        card.removeAttribute('onclick');
        card.addEventListener('click', (e) => {
            if (e.target.closest('.badge')) return;
            if (testId) {
                window.location.href = `html_tests/${testId}.html`;
                return;
            }
            if (inline) {
                try { eval(inline); } catch (err) { console.error(err); }
            }
        });
    });
}

function loadHighlightsFromFrame() {
    if (!catalogFrame || !catalogFrame.contentDocument) {
        renderFallback(true);
        return;
    }
    const doc = catalogFrame.contentDocument;
    let cards = doc.querySelectorAll('.test-card[data-destaque="true"]');
    if (!cards.length) cards = doc.querySelectorAll('.test-card');

    const fragment = document.createDocumentFragment();
    Array.from(cards).slice(0, 3).forEach(card => fragment.appendChild(card.cloneNode(true)));

    if (!fragment.children.length) {
        renderFallback(true);
        return;
    }

    highlightContainer.innerHTML = '';
    highlightContainer.appendChild(fragment);
    attachClicks(highlightContainer);
    if (window.ProgressDashboard) window.ProgressDashboard.refresh();
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.ProgressDashboard) {
        window.ProgressDashboard.refresh();
    }

    // Team modal
    const modal = document.getElementById('team-modal');
    const backdrop = document.getElementById('team-modal-backdrop');
    const closeBtn = document.getElementById('team-modal-close');
    const nameEl = document.getElementById('team-modal-name');
    const roleEl = document.getElementById('team-modal-role');
    const bioEl = document.getElementById('team-modal-bio');

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

    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('click', () => {
            openModal(card.dataset.name, card.dataset.role, card.dataset.bio);
        });
    });

    [backdrop, closeBtn].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    document.addEventListener('keyup', e => {
        if (e.key === 'Escape') closeModal();
    });

    if (catalogFrame) {
        catalogFrame.addEventListener('load', loadHighlightsFromFrame);
        if (catalogFrame.contentDocument && catalogFrame.contentDocument.readyState === 'complete') {
            loadHighlightsFromFrame();
        }
    } else {
        renderFallback(true);
    }

    setTimeout(() => {
        if (highlightContainer && !highlightContainer.children.length) {
            renderFallback(true);
        }
    }, 800);
});
