describe('GIVEN I am on the genre grid page', () => {
    beforeEach(() => {
        // Note: single album and artist responses are used to test the refresh button functionality
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse_oneAlbum.json" }).as('getMySavedAlbums');
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse_oneArtist.json" }).as('getArtists');
        cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" }).as('authToken');
        
        cy.resetIndexedDb();
        cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');

        cy.wait(["@getMySavedAlbums", "@getArtists", "@authToken"]);
    });

    it('THEN there should only be one album', () => {
        cy.get('.genre-section').should('have.length', 1);
    });
    
    describe('WHEN I click the refresh button', () => {
        beforeEach(() => {
            cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums_oneAlbum');
            cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists_oneArtist');
            
            cy.get('.refresh-button').click();
        });
        
        it('THEN the genre grid should update', () => {
            cy.get('.genre-section').should('have.length', 2);
            cy.get('.genre-grid .genre-section').eq(1).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album Two');
        });
    });
});