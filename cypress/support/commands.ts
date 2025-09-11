/// <reference types="cypress" />

Cypress.Commands.add('loginUser', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/auth');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginUser('admin@example.com', 'admin123');
});

Cypress.Commands.add('loginAsResident', () => {
  cy.loginUser('resident@example.com', 'resident123');
});

Cypress.Commands.add('resetDatabase', () => {
  // This would reset test database state
  // Implementation depends on your backend setup
});

Cypress.Commands.add('seedTestData', () => {
  // This would seed test data
  // Implementation depends on your backend setup
});