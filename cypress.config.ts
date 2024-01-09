import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  retries: { runMode: 2, openMode: 0 },

  e2e: {
    baseUrl: 'https://doctors.qa.patientstudio.com',

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
