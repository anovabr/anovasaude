// BDI-PC Test - DATA + LOGIC COMBINED IN ONE FILE

const testDefinition = {
    id: "bdi-pc",
    title: "Inventário Beck de Depressão - Atenção Primária (BDI-PC)",
    description: "Instrumento de rastreamento rápido para sintomas depressivos",
    citation: "Validado por Anunciação, Caregnato e Silva (2019). Uso apenas complementar.",
    reference: "ANUNCIACAO, Luis; CAREGNATO, Maricy; SILVA, Flávio Soares Correa da. Aspectos psicométricos do Inventário Beck de Depressão-II e do Beck Atenção Primária em usuários do Facebook. J. bras. psiquiatr., Rio de Janeiro, v. 68, n. 2, p. 83-91, June 2019.",
    instructions: "Este questionário consiste em 7 grupos de afirmações. Por favor, leia cada uma delas cuidadosamente. Depois, escolha uma frase de cada grupo, que melhor descreve o modo como você tem se sentido nas duas últimas semanas, incluindo hoje. Se mais de uma afirmação em um grupo lhe parecer igualmente apropriada, escolha a de número mais alto neste grupo. Verifique se não marcou mais de uma afirmação por grupo.",
    questions: [
        {
            id: 1,
            title: "Tristeza",
            options: [
                { value: 0, text: "Não me sinto triste" },
                { value: 1, text: "Eu me sinto triste grande parte do tempo" },
                { value: 2, text: "Estou triste o tempo todo" },
                { value: 3, text: "Estou tão triste ou tão infeliz que não consigo suportar" }
            ]
        },
        {
            id: 2,
            title: "Pensamentos ou desejos suicidas",
            options: [
                { value: 0, text: "Não tenho nenhum pensamento de me matar" },
                { value: 1, text: "Tenho pensamentos de me matar, mas não levaria isso adiante" },
                { value: 2, text: "Gostaria de me matar" },
                { value: 3, text: "Eu me mataria se tivesse oportunidade" }
            ]
        },
        {
            id: 3,
            title: "Pessimismo",
            options: [
                { value: 0, text: "Não estou desanimado(a) a respeito do meu futuro" },
                { value: 1, text: "Eu me sinto mais desanimado(a) a respeito do meu futuro do que de costume" },
                { value: 2, text: "Não espero que as coisas deem certo para mim" },
                { value: 3, text: "Sinto que não há esperança quanto ao meu futuro. Acho que só vai piorar" }
            ]
        },
        {
            id: 4,
            title: "Perda de interesse",
            options: [
                { value: 0, text: "Não perdi o interesse por outras pessoas ou por minhas atividades" },
                { value: 1, text: "Estou menos interessado pelas outras pessoas ou coisas do que costumava estar" },
                { value: 2, text: "Perdi quase todo o interesse por outras pessoas ou coisas" },
                { value: 3, text: "É difícil me interessar por alguma coisa" }
            ]
        },
        {
            id: 5,
            title: "Fracasso passado",
            options: [
                { value: 0, text: "Não me sinto um(a) fracassado(a)" },
                { value: 1, text: "Tenho fracassado mais do que deveria" },
                { value: 2, text: "Quando penso no passado vejo muitos fracassos" },
                { value: 3, text: "Sinto que como pessoa sou um fracasso total" }
            ]
        },
        {
            id: 6,
            title: "Autoestima",
            options: [
                { value: 0, text: "Eu me sinto como sempre me senti em relação a mim mesmo(a)" },
                { value: 1, text: "Perdi a confiança em mim mesmo(a)" },
                { value: 2, text: "Estou desapontado(a) comigo mesmo(a)" },
                { value: 3, text: "Não gosto de mim" }
            ]
        },
        {
            id: 7,
            title: "Autocrítica",
            options: [
                { value: 0, text: "Não me critico nem me culpo mais do que o habitual" },
                { value: 1, text: "Estou sendo mais crítico(a) comigo mesmo(a) do que costumava ser" },
                { value: 2, text: "Eu me crítico por todos os meus erros" },
                { value: 3, text: "Eu me culpo por tudo de ruim que acontece" }
            ]
        }
    ],
    scoring: {
        min: 0,
        max: 21,
        ranges: [
            { min: 0, max: 3, level: "Mínimo", description: "Sintomas depressivos mínimos ou ausentes." },
            { min: 4, max: 7, level: "Leve", description: "Sintomas depressivos leves." },
            { min: 8, max: 15, level: "Moderado", description: "Sintomas depressivos moderados. Recomenda-se acompanhamento profissional." },
            { min: 16, max: 21, level: "Grave", description: "Sintomas depressivos graves. É importante buscar ajuda profissional." }
        ]
    }
};

let testData = testDefinition;
let answers = [];
let testResults = null;

// ===== INITIALIZATION =====
function initializeTest() {
    document.getElementById('test-title').textContent = testData.title;
    document.getElementById('test-description').textContent = testData.description;
    document.getElementById('test-instructions').innerHTML = testData.instructions;

    if (typeof Storage !== 'undefined' && Storage.isTestTaken(testData.id)) {
        const notice = document.createElement('div');
        notice.className = 'test-taken-notice';
        notice.textContent = 'Você já concluiu este teste. Confira seu histórico na página inicial.';
        document.getElementById('instructions-container').appendChild(notice);
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) submitBtn.disabled = true;
        return;
    }
    
    if (testData.citation) {
        const citationEl = document.createElement('p');
        citationEl.style.fontSize = '0.9rem';
        citationEl.style.fontStyle = 'italic';
        citationEl.style.color = 'var(--text-light)';
        citationEl.style.marginTop = '1rem';
        citationEl.textContent = testData.citation;
        document.getElementById('instructions-container').appendChild(citationEl);
    }

    answers = new Array(testData.questions.length).fill(null);
    renderQuestions();
    setupFormSubmission();
    setupPageNavigation();
}

// ===== QUESTIONS RENDERING =====
function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    testData.questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index);
        container.appendChild(questionCard);
    });
}

function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `question-${index}`;

    const questionNumber = document.createElement('div');
    questionNumber.className = 'question-number';
    questionNumber.textContent = `Questão ${index + 1} de ${testData.questions.length}`;

    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.title;

    const optionsGroup = document.createElement('div');
    optionsGroup.className = 'options-group';

    question.options.forEach((option) => {
        const label = document.createElement('label');
        label.className = 'option-label';
        label.innerHTML = `
            <input 
                type="radio" 
                name="question-${index}" 
                value="${option.value}"
                data-question-index="${index}"
                data-label="${option.text}"
            >
            <span>${option.value}. ${option.text}</span>
        `;

        const radio = label.querySelector('input');
        radio.addEventListener('change', (e) => handleAnswerChange(e, index));

        optionsGroup.appendChild(label);
    });

    card.appendChild(questionNumber);
    card.appendChild(questionText);
    card.appendChild(optionsGroup);

    return card;
}

function handleAnswerChange(event, questionIndex) {
    const value = parseInt(event.target.value);
    const label = event.target.dataset.label;

    answers[questionIndex] = { value, label };

    const card = document.getElementById(`question-${questionIndex}`);
    const labels = card.querySelectorAll('.option-label');
    labels.forEach(l => l.classList.remove('selected'));
    event.target.closest('.option-label').classList.add('selected');

    updateProgress();
    checkCompletion();
}

function updateProgress() {
    const answeredCount = answers.filter(a => a !== null).length;
    const percentage = (answeredCount / testData.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

function checkCompletion() {
    const allAnswered = answers.every(a => a !== null);
    document.getElementById('submit-btn').disabled = !allAnswered;
}

// ===== FORM SUBMISSION =====
function setupFormSubmission() {
    document.getElementById('test-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitTest();
    });
}

function submitTest() {
    const totalScore = Scoring.calculateScore(answers);
    const interpretation = Scoring.getInterpretation(totalScore, testData.scoring.ranges);
    const percentage = Scoring.calculatePercentage(totalScore, testData.scoring.max);

    testResults = {
        testId: testData.id,
        testTitle: testData.title,
        score: totalScore,
        maxScore: testData.scoring.max,
        percentage: percentage,
        interpretation: interpretation,
        answers: answers.map((answer, index) => ({
            questionId: testData.questions[index].id,
            questionTitle: testData.questions[index].title,
            value: answer.value,
            label: answer.label
        })),
        citation: testData.citation,
        reference: testData.reference,
        timestamp: new Date().toISOString()
    };

    showResultsPage();
}

// ===== RESULTS PAGE =====
function showResultsPage() {
    // Hide test page
    document.getElementById('test-page').style.display = 'none';
    
    // Display results
    document.getElementById('result-score').textContent = testResults.score;
    document.getElementById('result-max').textContent = testResults.maxScore;
    document.getElementById('result-level').textContent = testResults.interpretation.level;
    document.getElementById('result-description').textContent = testResults.interpretation.description;

    // Display answers
    const answersContainer = document.getElementById('result-answers-container');
    const answersList = document.createElement('div');
    answersList.className = 'answers-list';
    
    testResults.answers.forEach((answer, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.innerHTML = `
            <div class="answer-question">${index + 1}. ${answer.questionTitle}</div>
            <div class="answer-value">${answer.label}</div>
        `;
        answersList.appendChild(answerItem);
    });
    
    answersContainer.appendChild(answersList);

    if (typeof Storage !== 'undefined') {
        Storage.recordTestTaken(testResults.testId, testResults.testTitle);
    }

    // Show results page
    document.getElementById('results-page').style.display = 'block';
}

// ===== PAGE NAVIGATION =====
function setupPageNavigation() {
    // Interpretation button
    document.getElementById('interpretation-btn').addEventListener('click', showDemographicsPage);
    
    // Back button in demographics
    document.getElementById('back-to-results-btn').addEventListener('click', () => {
        document.getElementById('demographics-page').style.display = 'none';
        document.getElementById('results-page').style.display = 'block';
    });

    // Demographics form submission
    document.getElementById('demographics-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitDemographics();
    });
}

function showDemographicsPage() {
    document.getElementById('results-page').style.display = 'none';
    document.getElementById('demographics-page').style.display = 'block';
}

function submitDemographics() {
    const fullName = document.getElementById('full-name').value;
    const birthDate = document.getElementById('birth-date').value;
    const state = document.getElementById('state').value;
    const gender = document.getElementById('gender').value;
    const diagnosis = document.getElementById('diagnosis').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    // Validate birth date format
    if (!isValidBirthDate(birthDate)) {
        alert('Por favor, insira uma data válida no formato DD/MM/AAAA');
        return;
    }

    // Package complete submission
    const completeSubmission = {
        ...testResults,
        demographics: {
            fullName,
            birthDate,
            state,
            gender,
            diagnosis,
            phone,
            email
        },
        submittedAt: new Date().toISOString()
    };

    // Save to localStorage (temporary - will be replaced with Firebase)
    localStorage.setItem('pending_submission', JSON.stringify(completeSubmission));

    // Show payment page
    showPaymentPage();
}

function isValidBirthDate(dateString) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
}

function showPaymentPage() {
    document.getElementById('demographics-page').style.display = 'none';
    document.getElementById('payment-page').style.display = 'block';
}

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', initializeTest);
