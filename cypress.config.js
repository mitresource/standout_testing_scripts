const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://standout.infuture.ai/",
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      /// <reference types="cypress" />
      
    },
  },
});
