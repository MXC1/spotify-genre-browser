const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    fixturesFolder: 'src/test/cypress/fixtures',
    e2eFolder: 'src/test/cypress/e2e',
    supportFolder: 'src/test/cypress/support',
    screenshotsFolder: 'src/test/cypress/screenshots',
    videosFolder: 'src/test/cypress/videos',
  },
});
