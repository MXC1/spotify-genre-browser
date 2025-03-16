import '../support/commands.js';

describe('GIVEN I have authenticated', () => {

    beforeEach(() => {
        cy.visit('/');

        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" });
        cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" });
        cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" });

        cy.setIndexedDBData("spotify-db", "auth", "spotify_code_verifier", { someProperty: "valid_code_verifier" });
    })

    it('THEN the header should load', () => {
        cy.visit('/?code=valid_token&state=valid_state');
        cy.contains('Your album library');

        cy.get('.menu-button').should('exist');
        cy.get('.refresh-button').should('exist');
        cy.get('.search-sort-container').should('exist');
    })

    // it('THEN the genre album container should load', () => {
    //     cy.visit('/?code=valid_token&state=valid_state');
    //     cy.contains('')
    // })

    // it('THEN the genre album mapping should display correctly', () => {
    //
    // });

    // TODO also add reload button test
});