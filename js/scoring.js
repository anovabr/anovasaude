// Scoring utility for psychological tests
const Scoring = {
    // Calculate total score from answers
    calculateScore(answers) {
        return answers.reduce((total, answer) => total + answer.value, 0);
    },

    // Get interpretation based on score and ranges
    getInterpretation(score, ranges) {
        for (let range of ranges) {
            if (score >= range.min && score <= range.max) {
                return range;
            }
        }
        return null;
    },

    // Calculate percentage
    calculatePercentage(score, maxScore) {
        return Math.round((score / maxScore) * 100);
    },

    // Format answers for storage
    formatAnswers(answers, questions) {
        return answers.map((answer, index) => ({
            questionId: questions[index].id,
            questionText: questions[index].text,
            value: answer.value,
            label: answer.label
        }));
    }
};
