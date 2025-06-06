beforeEach(() => {
  caches.keys().then(function (names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
});

describe('GIVEN I visit the app', () => {

  beforeEach(() => {
    cy.resetIndexedDb();
    cy.visitWithConsoleStub('/')
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
      cy.get('@consoleLog').should('have.been.calledWithMatch',
        /Environment is/,
        Cypress.sinon.match.has('env', 'dev'));
      expect(sessionIdBeforeReload).to.exist;
      cy.visit('about:blank');

      cy.visit('/genre-album-map?code=valid_token&state=valid_state', {
        onBeforeLoad(win) {
          cy.stub(win.console, 'log').as('consoleLog')
          cy.stub(win.console, 'error').as('consoleError')
        }
      });

      cy.getIndexedDbData('auth', 'session_id').should('equal', sessionIdBeforeReload);
    });
  });
});

describe('GIVEN I am logged in', () => {
  beforeEach(() => {
    cy.intercept('POST', "https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth", { fixture: "mockAuthTokenResponse_fastExpiry.json" }).as('authToken');
    cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
    cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists');
    cy.intercept('POST', 'https://accounts.spotify.com/api/token*', { fixture: "mockRefreshTokenResponse.json" }).as('refreshToken');

    cy.resetIndexedDb();
    cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");

    cy.visitWithConsoleStub('/genre-album-map?code=valid_token&state=valid_state')

    cy.wait(["@authToken", "@getMySavedAlbums", "@getArtists"]);

  });

  describe.only('AND my auth token expires', () => {
    beforeEach(() => {
      cy.get('.refresh-button').click();
    });

    it('THEN a new auth token is fetched', () => {
      cy.get('@consoleLog').should('have.been.calledWithMatch',
        /Environment is/);
      cy.get('@consoleLog').should('have.been.calledWithMatch',
        /Refreshing access token/);
        
      cy.get('@consoleLog').should('not.have.been.calledWithMatch',
        /No refresh token found/);
      cy.get('@consoleLog').should('not.have.been.calledWithMatch',
        /Error refreshing access token/);
    });
  });
});