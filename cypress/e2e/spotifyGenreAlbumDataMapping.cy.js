describe('GIVEN I have authenticated', () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
    })
    
    it('THEN the header should load', () => {
        cy.contains('Your album library');
        
        cy.get('.menu-button').should('exist');
        cy.get('.refresh-button').should('exist');
        cy.get('.search-sort-container').should('exist');
    })
    
    it('AND the genre grid should load', () => {
        cy.get('.genre-grid').should('exist');
    }) 
    
    it('AND the album data should load', () => { 
        cy.get('.genre-grid .genre-section .genre-title').should('contain', 'slowcore, spoken word');
        cy.get('.genre-grid .genre-section .album-preview img').should('have.attr', 'src').should('include', 'https://i.scdn.co/image/ab67616d0000b273c9ac1ea80b4c74c09733bcd3');
    }) 
});