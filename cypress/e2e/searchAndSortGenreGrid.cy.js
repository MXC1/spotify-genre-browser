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

        it.only('THEN the genre grid should be filtered', () => {
            cy.get('.genre-section').should('have.length', 1);

            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album Two');
            cy.get('.album-link')
                .should('have.attr', 'href', 'https://open.spotify.com/album/test-album-2');
        });
    });

    describe('WHEN I clear the search box', () => {
        beforeEach(() => {
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).click();
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).type("rock").should('have.value', "rock");
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).clear().should('have.value', '');
        });

        it.only('THEN the genre grid should be reset', () => {
            cy.get('.genre-section').should('have.length', 2);

            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album One');
            cy.get('.album-link')
                .should('have.attr', 'href', 'https://open.spotify.com/album/test-album-1');
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

        it.only('THEN the genre grid should be sorted alphabetically', () => {
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

        it.only('THEN the genre grid should be sorted reverse alphabetically', () => {
            cy.get('.genre-section').should('have.length', 2);

            cy.get('.genre-grid .genre-section').first()
                .find('.genre-title')
                .should('have.text', 'slowcore, spoken word');
        });
    });
});