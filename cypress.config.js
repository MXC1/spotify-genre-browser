const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: '5te4qf',
  e2e: {
    baseUrl: 'http://localhost:3000', // Update with your app's URL
  },
});