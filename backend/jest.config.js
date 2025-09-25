module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./__tests__/setup.js'],
    // On ajoute cette ligne pour dire à Jest de ne chercher que les fichiers .test.js
    testMatch: ['**/__tests__/**/*.test.js'],
};