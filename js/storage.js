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
        
        // Also save to results index with summary info
        this.addToResultsIndex(resultId, testId, data);
        this.setLatestResultId(testId, resultId);
        
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
    addToResultsIndex(resultId, testId, meta = {}) {
        let index = this.getResultsIndex();
        index.push({
            resultId,
            testId,
            testTitle: meta.testTitle || meta.title || testId,
            score: meta.score,
            maxScore: meta.maxScore,
            percentage: meta.percentage,
            level: meta.interpretation ? meta.interpretation.level : undefined,
            timestamp: new Date().toISOString()
        });
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
            localStorage.removeItem(`result_funnel_${item.resultId}`);
            if (item.testId) {
                localStorage.removeItem(`latest_result_${item.testId}`);
            }
        });
        localStorage.removeItem('results_index');
        localStorage.removeItem('tests_taken');
    },

    // Track tests taken for dashboard
    getTakenTests() {
        const data = localStorage.getItem('tests_taken');
        return data ? JSON.parse(data) : [];
    },

    isTestTaken(testId) {
        return this.getTakenTests().some(test => test.testId === testId);
    },

    recordTestTaken(testId, testTitle) {
        if (!testId) return;
        const tests = this.getTakenTests();
        const existing = tests.find(test => test.testId === testId);
        if (existing) return;
        tests.push({
            testId,
            testTitle: testTitle || testId,
            completedAt: new Date().toISOString()
        });
        localStorage.setItem('tests_taken', JSON.stringify(tests));
    },

    setLatestResultId(testId, resultId) {
        if (!testId || !resultId) return;
        localStorage.setItem(`latest_result_${testId}`, resultId);
    },

    getLatestResultId(testId) {
        if (!testId) return null;
        return localStorage.getItem(`latest_result_${testId}`);
    },

    setFunnelEvent(resultId, key) {
        if (!resultId || !key) return;
        const storageKey = `result_funnel_${resultId}`;
        let data = {};
        const raw = localStorage.getItem(storageKey);
        if (raw) {
            try {
                data = JSON.parse(raw) || {};
            } catch (e) {
                data = {};
            }
        }
        data[key] = true;
        data[`${key}_at`] = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(data));
    },

    getFunnel(resultId) {
        if (!resultId) return null;
        const raw = localStorage.getItem(`result_funnel_${resultId}`);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }
};
