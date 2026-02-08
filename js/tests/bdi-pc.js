// BDI-PC Test Logic
let testData = null;
let answers = [];

// Load test data
async function loadTestData() {
    try {
        const response = await fetch('../../data/bdi-pc.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        testData = await response.json();
        initializeTest();
    } catch (error) {
        console.error('Error loading test data:', error);
        alert('Erro ao carregar o teste. Por favor, recarregue a página.');
    }
}

// Initialize test
function initializeTest() {
    // Set header info
    document.getElementById('test-title').textContent = testData.title;
    document.getElementById('test-description').textContent = testData.description;
    document.getElementById('test-instructions').innerHTML = testData.instructions;
    
    // Add citation if exists
    if (testData.citation) {
        const citationEl = document.createElement('p');
        citationEl.style.fontSize = '0.9rem';
        citationEl.style.fontStyle = 'italic';
        citationEl.style.color = 'var(--text-light)';
        citationEl.style.marginTop = '1rem';
        citationEl.textContent = testData.citation;
        document.getElementById('instructions-container').appendChild(citationEl);
    }

    // Initialize answers array
    answers = new Array(testData.questions.length).fill(null);

    // Render questions
    renderQuestions();

    // Setup form submission
    setupFormSubmission();
}

// Render all questions
function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    testData.questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index);
        container.appendChild(questionCard);
    });
}

// Create question card element
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

    // Use options from the question itself
    question.options.forEach((option, optIndex) => {
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

        // Add change listener
        const radio = label.querySelector('input');
        radio.addEventListener('change', (e) => handleAnswerChange(e, index));

        optionsGroup.appendChild(label);
    });

    card.appendChild(questionNumber);
    card.appendChild(questionText);
    card.appendChild(optionsGroup);

    return card;
}

// Handle answer selection
function handleAnswerChange(event, questionIndex) {
    const value = parseInt(event.target.value);
    const label = event.target.dataset.label;

    // Save answer
    answers[questionIndex] = { value, label };

    // Update UI - highlight selected option
    const card = document.getElementById(`question-${questionIndex}`);
    const labels = card.querySelectorAll('.option-label');
    labels.forEach(l => l.classList.remove('selected'));
    event.target.closest('.option-label').classList.add('selected');

    // Update progress
    updateProgress();

    // Check if all questions answered
    checkCompletion();
}

// Update progress bar
function updateProgress() {
    const answeredCount = answers.filter(a => a !== null).length;
    const percentage = (answeredCount / testData.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// Check if test is complete
function checkCompletion() {
    const allAnswered = answers.every(a => a !== null);
    document.getElementById('submit-btn').disabled = !allAnswered;
}

// Setup form submission
function setupFormSubmission() {
    document.getElementById('test-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitTest();
    });
}

// Submit test and calculate results
function submitTest() {
    // Calculate score
    const totalScore = Scoring.calculateScore(answers);
    const interpretation = Scoring.getInterpretation(totalScore, testData.scoring.ranges);
    const percentage = Scoring.calculatePercentage(totalScore, testData.scoring.max);

    // Format data
    const resultData = {
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
        testTitle: testData.title,
        citation: testData.citation,
        reference: testData.reference
    };

    // Save to localStorage
    const resultId = Storage.saveResult(testData.id, resultData);

    // Redirect to results page
    window.location.href = `../resultado.html?id=${resultId}`;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadTestData);