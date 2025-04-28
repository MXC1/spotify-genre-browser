describe("GIVEN I have authenticated with Spotify", () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
    });

    describe("WHEN I click the disconnect Spotify account link", () => {
        beforeEach(() => { 
            cy.get('.menu-button').click();
            cy.get('.menu-item-button').contains('Disconnect Spotify account').click();
            cy.get('.modal-button').contains('Disconnect').click();
        });

        it("THEN my Spotify account is disconnected", () => {
            cy.get('.login-button').should('exist');

            cy.get('.modal-description').should('contain', 'Your account has been successfully disconnected.');

            cy.getIndexedDbData('auth', 'access_token').should('be.undefined');
            cy.getIndexedDbData('auth', 'refresh_token').should('be.undefined');
            cy.getIndexedDbData('auth', 'spotify_code_verifier').should('be.undefined');

        });
        
        it("THEN my session_id is not removed", () => {
            cy.getIndexedDbData('auth', 'session_id').should('exist');
        });

        it("THEN my saved albums are removed", () => {
            cy.getIndexedDbData('data', 'grouped_albums').should('be.undefined');
        }); 
    });
});