describe('GIVEN I visit the app \
  WHEN I click the login button', () => {
  
  beforeEach(() => {
    cy.initialiseIndexedDb();
    cy.visit('/');
  })

  it('THEN the login container should load', () => {
    cy.contains('Login with Spotify');
  });

  it('AND it sets auth url', () => {
    cy.window().should('have.property', 'redirectToSpotifyAuth')

    cy.window().then(win => {
      cy.stub(win, 'redirectToSpotifyAuth')
        .as('redirect');
    })

    cy.get('.login-button').click()
    cy.get('@redirect').should('be.called')
  })
});
