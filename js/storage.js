// Storage utility for managing test results
const Storage = {
    // Save test result
    saveResult(testId, data) {
        const resultId = this.generateResultId();
        const result = {
            id: resultId,
            testId: testId,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        localStorage.setItem(`test_result_${resultId}`, JSON.stringify(result));
        
        // Also save to results index
        this.addToResultsIndex(resultId, testId);
        
        return resultId;
    },

    // Get result by ID
    getResult(resultId) {
        const data = localStorage.getItem(`test_result_${resultId}`);
        return data ? JSON.parse(data) : null;
    },

    // Generate unique result ID
    generateResultId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `${timestamp}_${random}`;
    },

    // Add result to index
    addToResultsIndex(resultId, testId) {
        let index = this.getResultsIndex();
        index.push({ resultId, testId, timestamp: new Date().toISOString() });
        localStorage.setItem('results_index', JSON.stringify(index));
    },

    // Get all results
    getResultsIndex() {
        const data = localStorage.getItem('results_index');
        return data ? JSON.parse(data) : [];
    },

    // Export result as JSON file
    exportResult(resultId) {
        const result = this.getResult(resultId);
        if (!result) return;

        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `resultado_${result.testId}_${resultId}.json`;
        link.click();
    },

    // Clear all results (for testing)
    clearAll() {
        const index = this.getResultsIndex();
        index.forEach(item => {
            localStorage.removeItem(`test_result_${item.resultId}`);
        });
        localStorage.removeItem('results_index');
    }
};
