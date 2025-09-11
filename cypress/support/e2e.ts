// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      loginUser(email?: string, password?: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsResident(): Chainable<void>;
      resetDatabase(): Chainable<void>;
      seedTestData(): Chainable<void>;
    }
  }
}