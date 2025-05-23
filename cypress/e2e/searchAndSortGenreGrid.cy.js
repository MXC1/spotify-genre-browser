const searchBoxPlaceholder = 'Search genres, albums, and artists...';

describe('GIVEN I am on the genre grid page', () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
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
            cy.get('.genre-section').should('have.length', 1);

            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album Two');
        });
    });

    describe('WHEN I clear the search box', () => {
        beforeEach(() => {
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).click();
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).type("rock").should('have.value', "rock");
            cy.get('.clear-search-button').click();
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).should('have.value', '');
        });

        it('THEN the genre grid should be reset', () => {
            cy.get('.genre-section').should('have.length', 2);

            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album One');
        });
    });

    it('THEN there should be a sorting dropdown', () => {
        cy.get('.sort-dropdown').should('exist');
        cy.get('.sort-dropdown').should('have.value', 'number-desc');
    });

    describe('WHEN I sort alphabetically', () => {
        beforeEach(() => {
            cy.get('.sort-dropdown').select('alphabetical-asc');
        });

        it('THEN the genre grid should be sorted alphabetically', () => {
            cy.get('.genre-section').should('have.length', 2);

            cy.get('.genre-grid .genre-section').first()
                .find('.genre-title')
                .should('have.text', 'art rock, alternative rock');
        });
    });

    describe('WHEN I sort reverse alphabetically', () => {
        beforeEach(() => {
            cy.get('.sort-dropdown').select('alphabetical-desc');
        });

        it('THEN the genre grid should be sorted reverse alphabetically', () => {
            cy.get('.genre-section').should('have.length', 2);

            cy.get('.genre-grid .genre-section').first()
                .find('.genre-title')
                .should('have.text', 'slowcore, spoken word');
        });
    });
});