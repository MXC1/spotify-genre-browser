const authenticateAndVisitPrivacyPolicy = () => {
    authenticate();
    cy.get('.menu-button').click();
    cy.get('.menu-item-button').contains('Privacy Policy').click();
};

const authenticate = () => {
    cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
    cy.visit('/genre-album-map?code=valid_token&state=valid_state');
};

const clickHomeLink = () => {
    cy.get('.menu-button').click();
    cy.get('.menu-item-button').contains('Home').click();
};

const clickPrivacyPolicyLink = () => {
    cy.get('.menu-button').click();
    cy.get('.menu-item-button').contains('Privacy Policy').click();
};  

beforeEach(() => {
    cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" });
    cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" });
    cy.intercept('POST', 'https://9kr3sn67ag.execute-api.eu-west-2.amazonaws.com/*', { fixture: "mockAuthTokenResponse.json" });
    cy.resetIndexedDb();
});

describe('GIVEN I have authenticated', () => {
    beforeEach(() => {
        authenticate();
    });

    describe('WHEN I open the hamburger menu and click the privacy policy link', () => {
        beforeEach(() => {
            clickPrivacyPolicyLink();
        });

        it('THEN the header should be updated', () => {
            cy.get('.page-title').should('contain', 'Privacy policy');
            cy.get('.home-button').should('exist');
        });

        it('THEN the privacy policy should be displayed', () => {
            cy.get('.privacy-policy-container').should('exist');
        });
    });

    describe('AND I am on the privacy policy page', () => {
        beforeEach(() => {
            authenticateAndVisitPrivacyPolicy();
        });

        describe('WHEN I open the hamburger menu AND I click the home link', () => {
            it('THEN the genre grid should be shown', () => {
                clickHomeLink();
                cy.get('.genre-grid').should('exist');
            });
        });

        describe('WHEN I click the home button', () => {
            it('THEN the genre grid should be shown', () => {
                cy.get('.home-button').click();
                cy.get('.genre-grid').should('exist');
            });

            it('THEN the header should be updated', () => {
                cy.get('.page-title').should('contain', 'Your album library');
                cy.get('.refresh-button').should('exist');
            });
        });
    });
});

describe('GIVEN I have not authenticated', () => {
    describe('AND I am on the privacy policy page', () => {
        beforeEach(() => {
            cy.visit('/privacy-policy');
        });
        describe('WHEN I click the hamburger menu home link', () => {
            it('THEN the login page should be shown', () => {
                clickHomeLink();
                cy.get('.login-button').should('exist');
            });
        });

        describe('WHEN I click the home button', () => {
            it('THEN the login page should be shown', () => {
                cy.get('.home-button').click();
                cy.get('.login-button').should('exist');
            });
        });
    });
});
