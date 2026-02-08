// Storage utility
const Storage = {
    saveResult: function(testId, resultData) {
        const results = this.getAllResults();
        const resultId = Date.now().toString();
        results[resultId] = {
            testId: testId,
            data: resultData,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('healthTestResults', JSON.stringify(results));
        return resultId;
    },
    
    getResult: function(resultId) {
        const results = this.getAllResults();
        return results[resultId] || null;
    },
    
    getAllResults: function() {
        const data = localStorage.getItem('healthTestResults');
        return data ? JSON.parse(data) : {};
    }
};

// Scoring utility
const Scoring = {
    calculateScore: function(answers) {
        return answers.reduce((sum, answer) => sum + (answer ? answer.value : 0), 0);
    },
    
    calculatePercentage: function(score, maxScore) {
        return Math.round((score / maxScore) * 100);
    },
    
    getInterpretation: function(score, ranges) {
        const range = ranges.find(r => score >= r.min && score <= r.max);
        return range || { level: 'Desconhecido', description: 'Não foi possível classificar.' };
    }
};