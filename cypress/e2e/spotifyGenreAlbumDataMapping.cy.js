import '../support/commands.js';

describe('GIVEN I have authenticated', () => {

    before(() => {
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" });
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" });
        cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" });

        cy.resetIndexedDB().then( () => {
            cy.setIndexedDBData("spotify-db", "auth", "spotify_code_verifier", "valid_code_verifier" );
            cy.visit('/?code=valid_token&state=valid_state');
        })

    })
    
    it('THEN the header and genre album mapping should load', () => {
        cy.contains('Your album library');

        cy.get('.menu-button').should('exist');
        cy.get('.refresh-button').should('exist');
        cy.get('.search-sort-container').should('exist');
        
        cy.get('.genre-grid').should('exist');
        
        cy.get('.genre-grid .genre-section .genre-title').should('contain', 'slowcore, spoken word');
        cy.get('.genre-grid .genre-section .album-preview img').should('have.attr', 'src').should('include', 'https://i.scdn.co/image/ab67616d0000b273c9ac1ea80b4c74c09733bcd3');
    })

    // TODO also add reload button test
});