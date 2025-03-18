import '../support/commands.js';

describe('GIVEN I visit the app', () => {
    before(() => {
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" });
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" });
        cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" });

        cy.resetIndexedDB().then(() => {
            cy.setIndexedDBData("spotify-db", "auth", "spotify_code_verifier", "valid_code_verifier");
            cy.visit('/?code=valid_token&state=valid_state');
        });
    });

    it('WHEN I click a genre card \
             THEN it should expand \
             WHEN I click it again \
             THEN it should collapse', () => {
        cy.visit('/?code=valid_token&state=valid_state');

        cy.get('.genre-grid .genre-section').eq(0).click();
        cy.get('.genre-grid .genre-section').eq(0).should('have.class', 'expanded');

        cy.get('.genre-grid .genre-section').eq(0).click();
        cy.get('.genre-grid .genre-section').eq(0).should('have.class', 'collapsed');
    });

    it('AND the album title and URL are correct', () => {
        cy.visit('/?code=valid_token&state=valid_state');

        cy.get('.genre-grid .genre-section').eq(0).click();
        cy.get('.album-name').eq(0).should('contain.text', 'As Days Get Dark');
        cy.get('.album-link')
            .should('have.attr', 'href', 'https://open.spotify.com/album/5jMbGYYNDo0lTyUnKtcm8J');
    });
});