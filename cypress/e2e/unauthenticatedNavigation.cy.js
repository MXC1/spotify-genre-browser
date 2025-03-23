beforeEach(() => {
    cy.resetIndexedDb();
});

describe('GIVEN I am on the privacy policy page', () => {
    beforeEach(() => {
        cy.visit('/privacy-policy');
    });

    it('THEN the privacy policy should be displayed', () => {
        cy.get('.page-title').should('contain', 'Privacy policy');
        cy.get('.home-button').should('exist');
        cy.get('.privacy-policy-container').should('exist');
    });

    describe('WHEN I click the hamburger menu home link', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.menu-item-button').contains('Home').click();
        });

        it('THEN the login page should be shown', () => {
            cy.get('.login-button').should('exist');
        });
    });

    describe('WHEN I click the home button', () => {
        beforeEach(() => {
            cy.get('.home-button').click();
        });

        it('THEN the login page should be shown', () => {
            cy.get('.login-button').should('exist');
        });
    });
});

const paths = [
    '/',
    '/genre-album-map',
    '/genre-album-map?code=valid_token&state=valid_state'
];

paths.forEach((path) => {
    describe(`GIVEN I visit ${path}`, () => {
        beforeEach(() => {
            cy.visit(path);
        });

        it('THEN the login page should be shown', () => {
            cy.get('.login-button').should('exist');
        });

    });
});