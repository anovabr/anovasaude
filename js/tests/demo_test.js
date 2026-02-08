// DEMO TEST - For quick testing

const testDefinition = {
    id: "demo-test",
    title: "Teste de Demonstração",
    description: "Um teste rápido com apenas 2 questões para demonstração",
    citation: "Teste de demonstração apenas",
    reference: "Não aplicável",
    instructions: "Responda as 2 questões abaixo e veja seus resultados instantaneamente.",
    questions: [
        {
            id: 1,
            title: "Como você se sente hoje?",
            options: [
                { value: 0, text: "Muito bem" },
                { value: 1, text: "Bem" },
                { value: 2, text: "Neutro" },
                { value: 3, text: "Mal" }
            ]
        }
    ],
    scoring: {
        min: 0,
        max: 3,
        ranges: [
            { min: 0, max: 1, level: "Ótimo", description: "Você está se sentindo muito bem!" },
            { min: 2, max: 2, level: "Bom", description: "Tudo parece estar indo bem." },
            { min: 3, max: 3, level: "Regular", description: "Talvez seja hora de se cuidar um pouco." }
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
    document.getElementById('test-page').style.display = 'none';
    
    document.getElementById('result-score').textContent = testResults.score;
    document.getElementById('result-max').textContent = testResults.maxScore;
    document.getElementById('result-level').textContent = testResults.interpretation.level;
    document.getElementById('result-description').textContent = testResults.interpretation.description;

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

    document.getElementById('results-page').style.display = 'block';
}

// ===== PAGE NAVIGATION =====
function setupPageNavigation() {
    document.getElementById('interpretation-btn').addEventListener('click', showDemographicsPage);
    
    document.getElementById('back-to-results-btn').addEventListener('click', () => {
        document.getElementById('demographics-page').style.display = 'none';
        document.getElementById('results-page').style.display = 'block';
    });

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

    if (!isValidBirthDate(birthDate)) {
        alert('Por favor, insira uma data válida no formato DD/MM/AAAA');
        return;
    }

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

    localStorage.setItem('pending_submission', JSON.stringify(completeSubmission));

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