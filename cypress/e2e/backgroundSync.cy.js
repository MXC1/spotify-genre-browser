describe('GIVEN I am loading the app for the first time', () => {
    beforeEach(() => {
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse_oneAlbum.json" }).as('getMySavedAlbums_oneAlbum');
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse_oneArtist.json" }).as('getArtists_oneArtist');
        cy.intercept('POST', "https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth", { fixture: "mockAuthTokenResponse.json" }).as('authToken');
        
        cy.resetIndexedDb();
        cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');
        cy.wait(["@getMySavedAlbums_oneAlbum", "@getArtists_oneArtist", "@authToken"]);
    });

    describe('WHEN I navigate to a genre and back', () => {
        beforeEach(() => {
            cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
            cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists');
            
            cy.get('.genre-section').click();
            cy.get('.home-button').click();
        });

        it('THEN no background sync should occur', () => {
            cy.get('.refresh-button svg').should('not.have.class', 'rotating');
            cy.get('.refresh-button').should('not.be.disabled');
            
            cy.get('.genre-section').should('have.length', 1);
        });
    });

    describe('WHEN I reload the page', () => {
        beforeEach(() => {
            cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
            cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists');
            
            cy.reload();
        });

        it('THEN a background sync should occur', () => {
            cy.get('.refresh-button svg').should('have.class', 'rotating');
            cy.get('.refresh-button').should('be.disabled');

            cy.wait(['@getMySavedAlbums', '@getArtists']);

            cy.get('.genre-section').should('have.length', 2);
        });
    });
});
