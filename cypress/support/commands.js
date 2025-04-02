import '@this-dot/cypress-indexeddb';

Cypress.Commands.add('resetIndexedDb', () => {
    cy.clearIndexedDb('spotify-db');
    cy.openIndexedDb('spotify-db').as('spotify-db');
    cy.getIndexedDb('@spotify-db').createObjectStore('auth').as('auth');
    cy.getIndexedDb('@spotify-db').createObjectStore('data').as('data');
});

Cypress.Commands.add('setIndexedDbData', (store, key, value) => {
    cy.getStore(`@${store}`).createItem(`${key}`, `${value}`);
});

Cypress.Commands.add('getIndexedDbData', (store, key) => {
    cy.getStore(`@${store}`).readItem(`${key}`);
});

Cypress.Commands.add('mockAPIResponsesAndInitialiseAuthenticatedState', () => {
    cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
    cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists');
    cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" }).as('authToken');

    cy.resetIndexedDb();
    cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");

    cy.visit('/genre-album-map?code=valid_token&state=valid_state');

    cy.wait(["@getMySavedAlbums", "@getArtists", "@authToken"]);

    // Wait for genre grid to load
    cy.get('.genre-grid').should('exist').and('be.visible');
});