describe('GIVEN I am on the genre grid page', () => {
    beforeEach(() => {
        // Single album and artist responses are used to test the refresh button functionality
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse_oneAlbum.json" }).as('getMySavedAlbums_oneAlbum');
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse_oneArtist.json" }).as('getArtists_oneArtist');
        cy.intercept('POST', "https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth", { fixture: "mockAuthTokenResponse.json" }).as('authToken');
        
        cy.resetIndexedDb();
        cy.log("RESETTING INDEXED DB");
        cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');

        cy.wait(["@getMySavedAlbums_oneAlbum", "@getArtists_oneArtist", "@authToken"]);
    });
    
    it('THEN there should only be one album', () => {
        cy.get('.genre-section').should('have.length', 1);
    });
    
    describe('WHEN I click the refresh button', () => {
        beforeEach(() => {
            cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
            cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists');
            
            cy.get('.refresh-button').click();
        });
        
        it('THEN the genre grid should update', () => {
            cy.get('.genre-section').should('have.length', 2);
            cy.get('.genre-grid .genre-section').eq(1).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album Two');
        });
    });
    
    describe("WHEN I refresh the page after saving more albums", () => {
        beforeEach(() => {
            cy.intercept('GET',
                'https://api.spotify.com/v1/me/albums*',
                { fixture: "mockGetMySavedAlbumsResponse.json" })
                .as('getMySavedAlbums');
            cy.intercept('GET',
                'https://api.spotify.com/v1/artists*',
                { fixture: "mockGetArtistsResponse.json" })
                .as('getArtists');
            
            cy.get('.genre-section').should('exist');
            cy.reload();
        });

        it.only("THEN the genre grid refreshes and finds the new albums", () => {
            cy.get('.refresh-button svg').should('have.class', 'rotating');
            cy.get('.refresh-button').should('be.disabled');

            cy.wait(["@getMySavedAlbums", "@getArtists"]);

            cy.get('.genre-section').should('have.length', 2);
            cy.get('.genre-grid .genre-section').eq(1).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album Two');
        });
    });
});