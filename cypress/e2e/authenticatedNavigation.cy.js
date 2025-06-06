beforeEach(() => {
    cy.mockAPIResponsesAndInitialiseAuthenticatedState();
});

describe('GIVEN I am on the homepage', () => {
    beforeEach(() => {
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');
    });

    describe('WHEN I open the hamburger menu privacy policy link', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.menu-item-button').contains('Privacy Policy').click();
        });

        it('THEN the privacy policy should be displayed', () => {
            cy.get('.page-title').should('contain', 'Privacy policy');
            cy.get('.home-button').should('exist');
            cy.get('.privacy-policy-container').should('exist');
        });
    });
    describe('WHEN I open the hamburger menu about link', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.menu-item-button').contains('About').click();
        });

        it('THEN the about page should be displayed', () => {
            cy.get('.page-title').should('contain', 'About');
            cy.get('.home-button').should('exist');
            cy.get('.about-container').should('exist');
        });
    });

    describe('WHEN I click outside the hamburger menu', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.overlay-background').click();
        });
        
        it('THEN the hamburger menu should close', () => {
            cy.get('.overlay-background').should('not.be.visible');
            cy.get('.menu-button').click();
        });
    });
    
    describe('WHEN I click the close menu button', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.close-menu-button').click();
        });
        
        it('THEN the hamburger menu should close', () => {
            cy.get('.overlay-background').should('not.be.visible');
            cy.get('.menu-button').click();
        });
    });
    
    describe('WHEN I click the menu itself', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.overlay-menu').click('bottomRight', { force: true });
        });
        
        it('THEN the hamburger menu should stay open', () => {
            cy.get('.overlay-menu').should('be.visible');
            cy.get('.overlay-background').should('be.visible');
            cy.get('.close-menu-button').click();
        });
    });

    describe('WHEN I click the browser refresh button', () => {
        beforeEach(() => {
            cy.reload();
        });

        it('THEN the genre grid is still shown', () => {
            cy.get('.page-title').should('contain', 'Your album library');
            cy.get('.refresh-button').should('exist');
            cy.get('.genre-grid').should('exist');
        });
    });
});

describe('GIVEN I am on the privacy policy page', () => {
    beforeEach(() => {
        cy.visit('/genre-album-map?code=valid_token&state=valid_state');
        cy.get('.menu-button').click();
        cy.get('.menu-item-button').contains('Privacy Policy').click();
    });

    describe('WHEN I click the hamburger menu home link', () => {
        beforeEach(() => {
            cy.get('.menu-button').click();
            cy.get('.menu-item-button').contains('Home').click();
        });

        it('THEN the genre grid should be shown', () => {
            cy.get('.page-title').should('contain', 'Your album library');
            cy.get('.refresh-button').should('exist');
            cy.get('.genre-grid').should('exist');
        });
    });

    describe('WHEN I click the home button', () => {
        beforeEach(() => {
            cy.get('.home-button').click();
        });

        it('THEN the genre grid should be shown', () => {
            cy.get('.page-title').should('contain', 'Your album library');
            cy.get('.refresh-button').should('exist');
            cy.get('.genre-grid').should('exist');
        });
    });

    describe('WHEN I click the browser refresh button', () => {
        beforeEach(() => {
            cy.reload();
        });

        it('THEN the privacy policy is still shown', () => {
            cy.get('.page-title').should('contain', 'Privacy policy');
            cy.get('.home-button').should('exist');
            cy.get('.privacy-policy-container').should('exist');
        });
    });
});

describe('GIVEN I am on the donate page', () => {
    beforeEach(() => {
        cy.visit('/donate');
    });

    it('THEN the donate page should be shown', () => {
        cy.get('.page-title').should('contain', 'Donate');
        cy.get('.home-button').should('exist');
        cy.get('.donate-container').should('exist');
    });

    it('THEN the donate iframe should be loaded', () => {
        cy.get('#kofiframe').should('exist');
        cy.get('#kofiframe').should('have.attr', 'src').and('include', 'ko-fi.com/genrebrowser');
    })
});

describe('GIVEN I am on the feedback page', () => {
    beforeEach(() => {
        cy.visitWithConsoleStub('/feedback');
    });

    it('THEN the feedback page should be shown', () => {
        cy.get('.page-title').should('contain', 'Give Feedback');
        cy.get('.home-button').should('exist');
        cy.get('.feedback-container').should('exist');
    });

    describe('WHEN I submit feedback', () => {
        beforeEach(() => {
            cy.get('textarea').type('This is a test feedback');
            cy.get('button[type="submit"]').click();
        });

        it('THEN the success message should be shown', () => {
            cy.get('.feedback-success').should('exist');
            cy.get('.feedback-error').should('not.exist');
            cy.get('@consoleLog').should('have.been.calledWithMatch', /Submitting feedback/);
        });
    });
});

describe('GIVEN my location is empty', () => {
    beforeEach(() => {
        cy.visit('/?code=valid_token&state=valid_state');
    });

    it('THEN the genre grid should be shown', () => {
        cy.get('.page-title').should('contain', 'Your album library');
        cy.get('.refresh-button').should('exist');
        cy.get('.genre-grid').should('exist');
    });
});

describe('GIVEN I navigate to /authenticate', () => {
    beforeEach(() => {
        cy.visit('/authenticate');
    });

    it('THEN the genre grid should be shown', () => {
        cy.get('.page-title').should('contain', 'Your album library');
        cy.get('.refresh-button').should('exist');
        cy.get('.genre-grid').should('exist');
    });
});