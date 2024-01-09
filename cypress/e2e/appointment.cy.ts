const PatientName = 'Clarke Cheairs';

describe('Patient payment claim', () => {
  it('Should be able to add payment', () => {
    cy.visit('/');
    cy.contains('Hello, Derek').should('exist');

    cy.findByRole('link', { name: 'Patients' }).click();
    cy.contains('Fetching patients').should('be.visible').as('spinner');

    cy.contains('Phone number', { matchCase: false }).should('be.visible');
    cy.get('@spinner').should('not.exist');

    // ========== Search patient =========
    cy.findByPlaceholderText('Search patients...').focus().type(PatientName, { delay: 50 });
    cy.contains(`Searching for ${PatientName}`).should('be.visible').as('searching-spinner');
    cy.get('@searching-spinner').should('not.exist');

    // Patient table
    cy.findByRole('table')
      .get('tbody > tr')
      .should('have.length', 1)
      .within((firstRow) => {
        // Go to patient demographics
        cy.wrap(firstRow).contains(PatientName).should('be.visible').click();
      });

    cy.contains('Demographics').should('exist').as('Demographics-tab');

    // Moved out of Demographics
    cy.fixture('meta').then((meta) => {
      cy.location('href').should('not.eq', `${meta.baseUrl}/patients`);
    });

    cy.contains('Balance').children('p').should('have.text', '$0.00').as('patient-balance-sidebar');

    cy.findByRole('link', { name: 'Financial' }).click();
    cy.contains('Payments').should('exist');
    cy.get('@Demographics-tab').should('not.exist');

    // ======================= Add payment ===============================

    cy.findByRole('button', { name: 'Add Payment' }).click();

    cy.get('input[name="paymentType"]').should('exist').click({ multiple: true, force: true });
    cy.get('input#value').should('exist').type('30');

    cy.findByText('Select an appointment').click({ multiple: true, force: true });
    cy.contains('Jul 04').should('exist').click();

    cy.findByTestId('paymentMethod').click({ force: true });
    cy.contains('Cash').should('exist').click();

    cy.findByTestId('-primary').click({ multiple: true, force: true });

    // ======================= ---------- ===============================

    // We have to wait backend transaction event to be performed
    cy.wait(2000);
    cy.reload();
    // check patient responsibility
    cy.contains('Balance').children('p').should('have.text', '$0.00').as('patient-balance-sidebar');

    cy.contains('07/04/23').should('exist');

    cy.findByRole('table').get('tbody > tr').should('have.length', 2).as('new-appointment-tr');

    // Patient payed $30
    cy.findByRole('table')
      .get('tbody > tr')
      .eq(1)
      .within((tr) => {
        cy.wrap(tr).get('td').eq(7).should('have.text', '$30');
      })
      .as('patient-payed');

    // Patient balance negative $30
    cy.findByRole('table')
      .get('tbody > tr')
      .eq(1)
      .within((tr) => {
        cy.wrap(tr).get('td').eq(8).should('have.text', '($30)');
      })
      .as('balance');

    // Under payments tab
    cy.findByRole('button', { name: 'Payments' }).click();

    cy.findByRole('table').get('tbody > tr').should('have.length', 1).as('payment-table-tr');
    cy.get('@payment-table-tr').get('td').eq(2).should('contain', '$30').as('amount');
    cy.get('@payment-table-tr').get('td').eq(3).should('contain', '-').as('amount-applied');

    cy.contains('Total Payments').should('exist').parent().should('contain.text', '$30');
  });
});
