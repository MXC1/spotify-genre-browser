describe('GIVEN I am on the genre grid page', () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
    });

    describe('WHEN I click on a genre card', () => {
        beforeEach(() => {
            cy.get('.genre-section').eq(0).click();
        });

        it('THEN the relevant genre page is opened', () => {
            cy.get('.big-genre-title').should('contain.text', "slowcore, spoken word")
        });

        it('THEN the sort option is A-Z (Artist)', () => {
            cy.get('.album-item').eq(0).get('.album-name').should('contain.text', 'Test Album One')
        });
        
        describe('WHEN I change the sort option', () => {
            beforeEach(() => {
                cy.get('.sort-dropdown').select('alphabetical-desc-artist');
            })
            
            it('THEN the order of the albums changes', () => {
                cy.get('.album-item').eq(0).get('.album-name').should('contain.text', 'Test Album Three');
            });
        });
        
        describe('WHEN I change the search query', () => {
            beforeEach(() => {
                cy.get('.search-bar').type('Three');
            });
            
            it('THEN the albums are filtered', () => {
                cy.get('.album-item').eq(0).get('.album-name').should('contain.text', 'Test Album Three');
                cy.get('.album-item').should('have.length', 1);
            });
        });
        
        describe('WHEN I click the home button', () => {
            beforeEach(() => {
                cy.get('.home-button').click();
            })

            it('THEN I go back to the genre grid page', () => {
                cy.get('.page-title').should('contain', 'Your album library');
                cy.get('.refresh-button').should('exist');
                cy.get('.genre-grid').should('exist');
            });

            it('THEN the sort option is Size (Desc)', () => {
                cy.get('.genre-section').eq(0).should('contain', 'slowcore, spoken word')
            });
        });

        describe('WHEN I click the genre title', () => {
            beforeEach(() => {
                cy.get('.big-genre-title').click();
            })

            it('THEN I go back to the genre grid page', () => {
                cy.get('.page-title').should('contain', 'Your album library');
                cy.get('.refresh-button').should('exist');
                cy.get('.genre-grid').should('exist');
            });

            it('THEN the sort option is Size (Desc)', () => {
                cy.get('.genre-section').eq(0).should('contain', 'slowcore, spoken word')
            });
        });
    });
});