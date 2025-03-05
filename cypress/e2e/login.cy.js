describe('GIVEN I visit the app', () => {
  describe('WHEN I click the login button', () => {
    it('THEN sets auth url when login button is clicked', () => {
      cy.visit('http://localhost:3000/');

      cy.window().should('have.property', 'redirectToSpotifyAuth')

      cy.window().then(win => {
        cy.stub(win, 'redirectToSpotifyAuth')
          .as('redirect');
      })

      cy.get('.login-button').click()

      cy.get('@redirect').should('be.called')
    })
  })
});

