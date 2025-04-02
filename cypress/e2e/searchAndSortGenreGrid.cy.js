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
            cy.get('.genre-grid').children().its('length').should('eq', 2);

            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'As Days Get Dark');
            cy.get('.album-link')
                .should('have.attr', 'href', 'https://open.spotify.com/album/5jMbGYYNDo0lTyUnKtcm8J');
        });
    });

    it('THEN there should be a sorting dropdown', () => {
        cy.get('.sort-dropdown').should('exist');
        cy.get('.sort-dropdown').should('have.value', 'number-desc');
    });

    describe('WHEN I change the sorting dropdown', () => {
        beforeEach(() => {
            cy.get('.sort-dropdown').select('alphabetical-asc');
        });

        it('THEN the genre grid should be sorted', () => {
            cy.get('.genre-grid').children().its('length').should('eq', 2);

            cy.get('.genre-grid .genre-section').first()
                .find('.genre-title')
                .should('have.text', 'art rock, alternative rock');
        });
    });
});