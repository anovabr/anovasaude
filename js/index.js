document.addEventListener('DOMContentLoaded', () => {
    if (typeof Storage === 'undefined') return;

    const testsTaken = Storage.getTakenTests();
    const countEl = document.getElementById('tests-taken-count');
    const listEl = document.getElementById('tests-taken-list');

    if (countEl) {
        countEl.textContent = testsTaken.length;
    }

    if (listEl) {
        listEl.innerHTML = '';
        if (testsTaken.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'Nenhum teste realizado ainda.';
            listEl.appendChild(emptyItem);
        } else {
            testsTaken.forEach(test => {
                const item = document.createElement('li');
                item.textContent = `${test.testTitle}`;
                listEl.appendChild(item);
            });
        }
    }

    const cards = document.querySelectorAll('.test-card[data-test-id]');
    cards.forEach(card => {
        const testId = card.getAttribute('data-test-id');
        if (!testId || !Storage.isTestTaken(testId)) return;

        card.classList.add('test-card--taken');
        card.setAttribute('aria-disabled', 'true');
        card.removeAttribute('onclick');

        const status = document.createElement('span');
        status.className = 'test-status';
        status.textContent = 'Concluído';
        card.appendChild(status);
    });
});
