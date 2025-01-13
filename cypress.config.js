const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Update with your app's URL
    specPattern: 'src/test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    fixturesFolder: 'src/test/cypress/fixtures',
    screenshotsFolder: 'src/test/cypress/screenshots',
    videosFolder: 'src/test/cypress/videos',
    downloadsFolder: 'src/test/cypress/downloads',
  },
});