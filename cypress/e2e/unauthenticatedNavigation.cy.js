const clickHomeLink = () => {
    cy.get('.menu-button').click();
    cy.get('.menu-item-button').contains('Home').click();
};

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