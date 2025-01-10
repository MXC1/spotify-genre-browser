const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Update with your app's URL
    supportFile: false, // Optional, disable support files if not needed
  },
});