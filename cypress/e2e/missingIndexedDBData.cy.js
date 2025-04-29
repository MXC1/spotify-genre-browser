describe('GIVEN I have the old IndexedDB structure', () => {
    beforeEach(() => {
        cy.seedIndexedDbWithOldFormat();
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');
    })

    it('THEN the new stores should be created', () => {
        // Assert that auth and data stores exist
        cy.window().then((win) => {
            const request = win.indexedDB.open('spotify-db');
            request.onsuccess = () => {
                const db = request.result;
                expect(db.objectStoreNames.contains('auth')).to.be.true;
                expect(db.objectStoreNames.contains('data')).to.be.true;
            };
          });

        
        // Assert that the user is redirected to the login page
        cy.get('.login-button').should('exist');
    })
})