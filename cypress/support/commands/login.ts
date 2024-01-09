Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.contains('Login');

  cy.findByPlaceholderText('E-mail address').type(Cypress.env('email'), { delay: 50 });
  cy.findByPlaceholderText('Password').type(Cypress.env('password'), { delay: 50 });

  cy.get('form').as('form');
  cy.get('@form').get('button').should('contain.text', 'Login').click();

  cy.wait(1000);
  cy.contains('Hello, Derek').should('exist').and('be.visible');

  cy.fixture('meta').then((meta) => {
    cy.location('href').should('not.eq', meta.baseUrl + '/login');
    cy.location('href').should('eq', meta.baseUrl + '/');
  });
});
