beforeEach(() => {
    cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" });
    cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" });
    cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" });
    cy.resetIndexedDb();
    cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
});

describe('GIVEN I am on the homepage', () => {
    beforeEach(() => {
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');
    });

    describe('WHEN I open the hamburger menu privacy policy link', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.menu-item-button').contains('Privacy Policy').click();
        });

        it('THEN the privacy policy should be displayed', () => {
            cy.get('.page-title').should('contain', 'Privacy policy');
            cy.get('.home-button').should('exist');
            cy.get('.privacy-policy-container').should('exist');
        });
    });

    describe('WHEN I click outside the hamburger menu', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.overlay-background').click();
        });
        
        it('THEN the hamburger menu should close', () => {
            cy.get('.overlay-background').should('not.be.visible');
            cy.get('.menu-button').click();
        });
    });
});

describe('GIVEN I am on the privacy policy page', () => {
    beforeEach(() => {
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');
        cy.get('.menu-button').click();
        cy.get('.menu-item-button').contains('Privacy Policy').click();
    });

    describe('WHEN I click the hamburger menu home link', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.menu-item-button').contains('Home').click();
        });

        it('THEN the genre grid should be shown', () => {
            cy.get('.page-title').should('contain', 'Your album library');
            cy.get('.refresh-button').should('exist');
            cy.get('.genre-grid').should('exist');
        });
    });

    describe('WHEN I click the home button', () => {
        beforeEach(() => {
            cy.get('.home-button').click();
        });

        it('THEN the genre grid should be shown', () => {
            cy.get('.page-title').should('contain', 'Your album library');
            cy.get('.refresh-button').should('exist');
            cy.get('.genre-grid').should('exist');
        });
    });
});

