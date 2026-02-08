// storage and scoring utilities

/**
 * Function to store data
 * @param {string} key - The key under which to store the data
 * @param {any} value - The data value to be stored
 */
function storeData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Function to retrieve data
 * @param {string} key - The key of the data to retrieve
 * @returns {any} - The retrieved data
 */
function retrieveData(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

/**
 * Function to calculate score based on input data
 * @param {Array<number>} scores - An array of numeric scores
 * @returns {number} - The calculated average score
 */
function calculateScore(scores) {
    if (!Array.isArray(scores) || scores.length === 0) return 0;
    const total = scores.reduce((acc, score) => acc + score, 0);
    return total / scores.length;
}