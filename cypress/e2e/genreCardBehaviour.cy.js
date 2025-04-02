describe('GIVEN I am on the genre grid page', () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
    });

    it('WHEN I click a genre card \
             THEN it should expand \
             WHEN I click it again \
             THEN it should collapse', () => {
        cy.get('.genre-grid .genre-section').eq(0).click();
        cy.get('.genre-grid .genre-section').eq(0).should('have.class', 'expanded');
        cy.get('.genre-grid .genre-section').eq(1).should('have.class', 'collapsed');


        cy.get('.genre-grid .genre-section').eq(0).click();
        cy.get('.genre-grid .genre-section').eq(0).should('have.class', 'collapsed');
    });

    it('AND the album title and URL are correct', () => {
        cy.get('.genre-grid .genre-section').eq(0).click();
        cy.get('.album-name').eq(0).should('contain.text', 'As Days Get Dark');
        cy.get('.album-link')
            .should('have.attr', 'href', 'https://open.spotify.com/album/5jMbGYYNDo0lTyUnKtcm8J');
    });
});