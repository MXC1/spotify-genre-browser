describe('GIVEN I am on the genre grid page', () => {
    beforeEach(() => {
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse_oneAlbum.json" }).as('getMySavedAlbums');
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse_oneArtist.json" }).as('getArtists');
        cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" });
        
        cy.resetIndexedDb();
        cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');

        cy.wait("@getMySavedAlbums");
        cy.wait("@getArtists");
    });

    it('THEN there should only be one album', () => {
        cy.get('.genre-grid').children().its('length').should('eq', 1);
    });
    
    describe('WHEN I click the refresh button', () => {
        beforeEach(() => {
            cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums_oneAlbum');
            cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists_oneArtist');
            
            cy.get('.refresh-button').click();
        });
        
        it('THEN the genre grid should update', () => {
            cy.get('.genre-grid').children().its('length').should('eq', 2);
            cy.get('.genre-grid .genre-section').eq(1).click();
            cy.get('.album-name').eq(0).should('contain.text', 'The Bends');
            cy.get('.album-link')
                .should('have.attr', 'href', 'https://open.spotify.com/album/35UJLpClj5EDrhpNIi4DFg');
        });
    });
});