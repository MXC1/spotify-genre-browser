import '../support/commands.js';

describe('GIVEN I visit the app', () => {

  beforeEach(() => {
    cy.resetIndexedDb();
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('consoleLog')
        cy.stub(win.console, 'error').as('consoleError')
      }
    });
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

  it('THEN a session ID is set and persisted after reload', () => {
    // I'm not _quite_ sure why, but the first call to get the sesson ID always fails
    // Hence I make no assertions on this call
    cy.getIndexedDbData('auth', 'session_id');

    cy.getIndexedDbData('auth', 'session_id').should('exist').then((sessionIdBeforeReload) => {
      cy.get('@consoleLog').should('be.calledWith', `Environment is: dev - SessionID: ${sessionIdBeforeReload}`)
      expect(sessionIdBeforeReload).to.exist;
      cy.visit('about:blank');
      
      cy.visit('/genre-album-map?code=valid_token&state=valid_state', {
        onBeforeLoad(win) {
          cy.stub(win.console, 'log').as('consoleLog')
          cy.stub(win.console, 'error').as('consoleError')
        }
      });

      cy.get('@consoleLog').should('be.calledWith', `Authenticating user... - SessionID: ${sessionIdBeforeReload}`)
    });
  });
});
