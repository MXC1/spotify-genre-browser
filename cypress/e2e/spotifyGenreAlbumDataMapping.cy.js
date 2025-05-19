const assertErrorMessage = () => {
    cy.get('.error-title').should('contain', 'Something went wrong.')
        .and('contain', 'This has been reported to the developers.');
    cy.get('.error-message').should('contain', 'Request failed with status code 400')
        .and('contain', 'Internal server error');
    cy.get('.error-button').should('exist').and('contain', 'Try Again');
};

const interceptWithError = (method, url, alias) => {
    cy.intercept(method, url, {
        statusCode: 400,
        body: { message: 'Internal server error' }
    }).as(alias);
};

const interceptSuccessfulAuth = () => {
    cy.intercept('POST', 'https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth', { fixture: "mockAuthTokenResponse.json" }).as('authToken');
    cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
    cy.intercept('GET', 'https://api.spotify.com/v1/artists*', { fixture: "mockGetArtistsResponse.json" }).as('getArtists');
};

describe('GIVEN I authenticate successfully', () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
    });

    it('THEN the header should load', () => {
        cy.contains('Your album library');
        cy.get('.menu-button').should('exist');
        cy.get('.refresh-button').should('exist');
        cy.get('.search-sort-container').should('exist');
    });

    it('THEN the progress bar should load', () => {
        cy.get('.progress-bar-block').should('exist');
        cy.get('.progress-bar-label').should('contain', 'Fetching your saved albums...');
        cy.get('.progress-bar-count').contains('3 / 3');
    });
    
    it('AND the genre grid should load', () => {
        cy.get('.genre-grid').should('exist');
    });
    
    it('AND the album data should load', () => {
        cy.get('.no-albums-message').should('not.exist');
        cy.get('.genre-grid .genre-section .genre-title').should('contain', 'slowcore, spoken word');
        cy.get('.genre-grid .genre-section .album-preview img').should('have.attr', 'src')
        .should('include', 'https://i.scdn.co/image/ab67616d00001e0226597c053b38c9cf93f8f3a9');
    });
});

[
    { 
        name: 'token exchange proxy', 
        method: 'POST', 
        url: 'https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth', 
        alias: 'authTokenError', 
        setup: () => interceptWithError('POST', 'https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth', 'authTokenError') 
    },
    { 
        name: 'albums', 
        method: 'GET', 
        url: 'https://api.spotify.com/v1/me/albums*', 
        alias: 'albumsError', 
        setup: () => {
            cy.intercept('POST', 'https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth', { fixture: "mockAuthTokenResponse.json" }).as('authToken');
            interceptWithError('GET', 'https://api.spotify.com/v1/me/albums*', 'albumsError') 
        }
    },
    { 
        name: 'artists', 
        method: 'GET', 
        url: 'https://api.spotify.com/v1/artists*', 
        alias: 'artistsError', 
        setup: () => {
            cy.intercept('POST', 'https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth', { fixture: "mockAuthTokenResponse.json" }).as('authToken');
            cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { fixture: "mockGetMySavedAlbumsResponse.json" }).as('getMySavedAlbums');
            interceptWithError('GET', 'https://api.spotify.com/v1/artists*', 'artistsError');
        } 
    }
].forEach(({ name, method, url, alias, setup }) => {
    describe(`GIVEN the Spotify ${name} endpoint returns an error`, () => {
        beforeEach(() => {
            Cypress.on('uncaught:exception', () => false);
            setup();
            cy.resetIndexedDb();
            cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");
            cy.visit('/genre-album-map?code=valid_token&state=valid_state');
            cy.wait([`@${alias}`]);
        });
        
        it('THEN the error message should load', () => {
            assertErrorMessage();
        });

        describe('WHEN I try again unsuccessfully', () => {
            beforeEach(() => {
                cy.get('.error-button').click();
                cy.wait([`@${alias}`]);
            });
            
            it('THEN the error message should load', () => {
                assertErrorMessage();
            });
        });
        
        describe('WHEN I try again successfully', () => {
            beforeEach(() => {
                interceptSuccessfulAuth();
                cy.get('.error-button').click();
                cy.wait(["@authToken", "@getMySavedAlbums", "@getArtists"]);
            });
            
            it('THEN the genre grid should load', () => {
                cy.get('.page-title').should('contain', 'Your album library');
                cy.get('.refresh-button').should('exist');
                cy.get('.genre-grid').should('exist');
            });
        });
    });
});