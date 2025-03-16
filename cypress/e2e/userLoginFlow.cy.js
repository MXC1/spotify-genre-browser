describe('GIVEN I visit the app \
  WHEN I click the login button', () => {

  it('THEN the login container should load', () => {
    cy.visit('/');
    cy.contains('Login with Spotify');
  });

  it('AND it sets auth url', () => {
    cy.visit('/');
    cy.window().should('have.property', 'redirectToSpotifyAuth')

    cy.window().then(win => {
      cy.stub(win, 'redirectToSpotifyAuth')
        .as('redirect');
    })

    cy.get('.login-button').click()
    cy.get('@redirect').should('be.called')
  })
});
