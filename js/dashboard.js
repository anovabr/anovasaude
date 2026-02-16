document.addEventListener('DOMContentLoaded', () => {
    if (typeof Storage === 'undefined') return;

    const nav = document.querySelector('.nav');
    if (!nav) return;

    // Home-only: subtle logo zoom when user is at the top.
    const isHomePage = /\/?(index\.html)?$/i.test(window.location.pathname);
    if (isHomePage) {
        let ticking = false;
        const applyTopClass = () => {
            const currentY = window.scrollY || 0;
            document.body.classList.toggle('home-at-top', currentY <= 8);
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(applyTopClass);
        }, { passive: true });
        applyTopClass();
    }

    const ensureNavBrand = () => {
        let brand = nav.querySelector('.nav-brand');
        if (brand) return brand;

        const logo = nav.querySelector('.logo');
        brand = document.createElement('div');
        brand.className = 'nav-brand';

        if (logo && logo.parentNode === nav) {
            nav.insertBefore(brand, logo);
            brand.appendChild(logo);
        } else if (logo) {
            nav.insertBefore(brand, nav.firstChild);
            brand.appendChild(logo);
        } else {
            nav.insertBefore(brand, nav.firstChild);
        }

        return brand;
    };

    const ensureProgressChip = (brand) => {
        let chip = brand.querySelector('.progress-chip');
        if (!chip) {
            chip = document.createElement('div');
            chip.className = 'progress-chip';
            chip.setAttribute('aria-live', 'polite');
            chip.innerHTML = `
                <span class="progress-chip__label">Seu progresso</span>
                <span class="progress-chip__count"><strong data-count-tests>0</strong> testes</span>
            `;
            brand.appendChild(chip);
        } else {
            const strong = chip.querySelector('strong');
            if (strong && !strong.hasAttribute('data-count-tests')) {
                strong.setAttribute('data-count-tests', '');
            }
        }
    };

    const ensureActions = (brand) => {
        let actions = brand.querySelector('.progress-actions');
        if (!actions) {
            actions = document.createElement('div');
            actions.className = 'progress-actions';
            actions.innerHTML = `
                <button type="button" class="progress-btn" id="view-results-btn" title="Abrir painel">Painel</button>
                <button type="button" class="progress-btn progress-btn--ghost" id="clear-results-btn" title="Limpar resultados">Limpar</button>
            `;
            brand.appendChild(actions);
        } else {
            let viewBtn = actions.querySelector('#view-results-btn');
            if (!viewBtn) {
                viewBtn = document.createElement('button');
                viewBtn.id = 'view-results-btn';
                viewBtn.type = 'button';
                viewBtn.className = 'progress-btn';
                viewBtn.textContent = 'Painel';
                viewBtn.title = 'Abrir painel';
                actions.appendChild(viewBtn);
            }
            let clearBtn = actions.querySelector('#clear-results-btn');
            if (!clearBtn) {
                clearBtn = document.createElement('button');
                clearBtn.id = 'clear-results-btn';
                clearBtn.type = 'button';
                clearBtn.className = 'progress-btn progress-btn--ghost';
                clearBtn.textContent = 'Limpar';
                clearBtn.title = 'Limpar resultados';
                actions.appendChild(clearBtn);
            }
        }
    };

    const brand = ensureNavBrand();
    ensureProgressChip(brand);
    ensureActions(brand);

    const toggleBtn = document.querySelector('.nav-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const open = nav.classList.toggle('nav--open');
            toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggleBtn.textContent = open ? '✕' : '☰';
        });
    }

    let panel = brand.querySelector('.progress-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'progress-panel';
        panel.innerHTML = `
            <h4>Últimos resultados</h4>
            <ul class="progress-panel__list" id="progress-results-list"></ul>
        `;
        brand.appendChild(panel);
    }

    const countEls = document.querySelectorAll('[data-count-tests], #tests-taken-count, #tests-taken-count-header');
    const listEls = document.querySelectorAll('.tests-taken-list');
    const clearBtn = document.getElementById('clear-results-btn');
    const viewBtn = document.getElementById('view-results-btn');

    const renderTakenState = () => {
        const resultsIndex = Storage.getResultsIndex();
        const testsTakenCount = resultsIndex.length;
        const takenIds = new Set(resultsIndex.map(test => test.testId));
        const uniqueTests = [];
        const seen = new Set();
        resultsIndex.forEach(item => {
            if (!item.testId || seen.has(item.testId)) return;
            seen.add(item.testId);
            uniqueTests.push(item);
        });

        // Re-query cards fresh each time to catch dynamically created cards
        const cards = Array.from(document.querySelectorAll('.test-card[data-test-id]'));

        // Preserve onclick as dataset.href for any new cards
        cards.forEach(card => {
            if (!card.dataset.href && card.getAttribute('onclick')) {
                card.dataset.href = card.getAttribute('onclick');
            }
        });

        countEls.forEach(el => (el.textContent = testsTakenCount));

        listEls.forEach(list => {
            list.innerHTML = '';
            if (uniqueTests.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.textContent = 'Nenhum teste realizado ainda.';
                list.appendChild(emptyItem);
                return;
            }
            uniqueTests.forEach(test => {
                const item = document.createElement('li');
                item.textContent = test.testTitle || test.testId;
                list.appendChild(item);
            });
        });

        cards.forEach(card => {
            const testId = card.getAttribute('data-test-id');
            const href = card.dataset.href;
            const status = card.querySelector('.test-status');
            const isTaken = takenIds.has(testId);

            if (isTaken) {
                card.classList.add('test-card--taken');
                card.setAttribute('aria-disabled', 'true');
                card.removeAttribute('onclick');
                if (!status) {
                    const badge = document.createElement('span');
                    badge.className = 'test-status';
                    badge.textContent = 'Concluído';
                    card.appendChild(badge);
                }
            } else {
                card.classList.remove('test-card--taken');
                card.removeAttribute('aria-disabled');
                if (href) card.setAttribute('onclick', href);
                if (status) status.remove();
            }
        });
    };

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            Storage.clearAll();
            const isDashboardPage = /\/?dashboard\.html$/i.test(window.location.pathname);
            if (isDashboardPage) {
                window.location.reload();
                return;
            }
            renderTakenState();
        });
    }

    const renderResultsPanel = () => {
        const list = panel.querySelector('#progress-results-list');
        if (!list) return;
        const index = Storage.getResultsIndex();
        list.innerHTML = '';

        if (!index.length) {
            const li = document.createElement('li');
            li.className = 'progress-panel__item';
            li.textContent = 'Nenhum resultado salvo ainda.';
            list.appendChild(li);
            return;
        }

        index.slice(-5).reverse().forEach(item => {
            const res = Storage.getResult(item.resultId) || item;
            const title = item.testTitle || res.testTitle || item.testId;
            const score = (res.score ?? item.score);
            const max = (res.maxScore ?? item.maxScore);
            const level = res.interpretation ? res.interpretation.level : item.level;
            const date = new Date(item.timestamp);

            const li = document.createElement('li');
            li.className = 'progress-panel__item';
            li.innerHTML = `
                <div class="progress-panel__title">${title}</div>
                <div class="progress-panel__meta">
                    ${score != null && max != null ? `${score}/${max}` : (score ?? '—')}
                    ${level ? ` • ${level}` : ''} • ${date.toLocaleDateString('pt-BR')}
                </div>
            `;
            list.appendChild(li);
        });
    };

    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            window.location.href = new URL('../dashboard.html', window.location.href).href;
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('nav--open')) {
                nav.classList.remove('nav--open');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.textContent = '☰';
                }
            }
        });
    });

    renderTakenState();

    // Expose manual refresh for other scripts if needed
    window.ProgressDashboard = {
        refresh: renderTakenState
    };
});
