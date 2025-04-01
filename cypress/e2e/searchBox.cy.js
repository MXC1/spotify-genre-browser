const searchBoxPlaceholder = 'Search genres, albums, and artists...';

describe('GIVEN I am on the genre grid page', () => {
    beforeEach(() => {
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists');
        cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" });

        cy.resetIndexedDb();
        cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');

        cy.wait(["@getMySavedAlbums", "@getArtists"]);
    });

    it('THEN there should be an empty search box', () => {
        cy.get(`[placeholder="${searchBoxPlaceholder}"]`).should('exist');
        cy.get(`[placeholder="${searchBoxPlaceholder}"]`).should('have.value', '');
    });

    describe('WHEN I type in the search box', () => {
        beforeEach(() => {
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).click();
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).type("rock").should('have.value', "rock");

        });

        it('THEN the genre grid should be filtered', () => {
            cy.get('.genre-grid').should('exist');

            cy.get('.genre-grid').children().its('length').should('eq', 1);

            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'The Bends');
            cy.get('.album-link')
                .should('have.attr', 'href', 'https://open.spotify.com/album/35UJLpClj5EDrhpNIi4DFg');
        });
    });

    describe('WHEN I clear the search box', () => {
        beforeEach(() => {
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).click();
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).type("rock").should('have.value', "rock");
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).clear().should('have.value', '');
        });

        it('THEN the genre grid should be reset', () => {
            cy.get('.genre-grid').should('exist');

            cy.get('.genre-grid').children().its('length').should('eq', 2);

            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'As Days Get Dark');
            cy.get('.album-link')
                .should('have.attr', 'href', 'https://open.spotify.com/album/5jMbGYYNDo0lTyUnKtcm8J');
        });
    });
});