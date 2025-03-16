describe('GIVEN I visit the app \
  WHEN I click the login button', () => {
  it('THEN it sets auth url', () => {
    cy.visit('http://localhost:3000/');

    cy.window().should('have.property', 'redirectToSpotifyAuth')

    cy.window().then(win => {
      cy.stub(win, 'redirectToSpotifyAuth')
        .as('redirect');
    })

    cy.get('.login-button').click()

    cy.get('@redirect').should('be.called')
  })
});

