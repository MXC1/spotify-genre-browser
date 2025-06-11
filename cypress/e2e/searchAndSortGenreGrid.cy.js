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

        it('THEN the URL should contain the search parameter', () => {
            cy.url().should('include', 'genreSearch=rock');
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

        it('THEN the URL should not contain the search parameter', () => {
            cy.url().should('not.include', 'genreSearch=');
        });
    });

    describe('WHEN I sort alphabetically', () => {
        beforeEach(() => {
            cy.get(".sort-filter-button").click();
            cy.get(".sort-option").contains("A-Z (Genre)").click();
            cy.get(".modal-button").contains("Apply").click();
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
            cy.get(".sort-filter-button").click();
            cy.get(".sort-option").contains("Z-A (Genre)").click();
            cy.get(".modal-button").contains("Apply").click();
        });

        it('THEN the genre grid should be sorted reverse alphabetically', () => {
            cy.get('.genre-section').should('have.length', 2);

            cy.get('.genre-grid .genre-section').first()
                .find('.genre-title')
                .should('have.text', 'slowcore, spoken word');
        });
    });

    describe('WHEN I navigate to a genre page with a search', () => {
        beforeEach(() => {
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).click();
            cy.get(`[placeholder="${searchBoxPlaceholder}"]`).type("rock").should('have.value', "rock");
            cy.get('.genre-grid .genre-section').eq(0).click();
        });

        it('THEN the genre page should maintain the search parameter', () => {
            cy.url().should('include', 'genreSearch=rock');
        });

        describe('AND I search for an album', () => {
            beforeEach(() => {
                cy.get(`[placeholder="Search albums or artists..."]`).type("album");
            });

            it('THEN the URL should contain both search parameters', () => {
                cy.url().should('include', 'genreSearch=rock');
                cy.url().should('include', 'albumSearch=album');
            });

            describe('AND I clear the album search', () => {
                beforeEach(() => {
                    cy.get('.clear-search-button').click();
                });

                it('THEN only the genre search parameter should remain', () => {
                    cy.url().should('include', 'genreSearch=rock');
                    cy.url().should('not.include', 'albumSearch=');
                });
            });
        });
    });

    describe("WHEN I filter by tag", () => {
        beforeEach(() => {
            cy.get(".sort-filter-button").click();
            cy.get(".tag").contains("three").click();
            cy.get(".modal-button").contains("Apply").click();
        })
    
        it("THEN the genre grid should be filtered by the selected tag", () => {
            cy.get('.genre-section').should('have.length', 1);
            cy.get('.genre-grid .genre-section').eq(0).find('.genre-title').should('contain.text', 'slowcore');
            cy.get('.genre-grid .genre-section').eq(0).click();
            cy.get('.album-name').eq(0).should('contain.text', 'Test Album One');
        });

        it("THEN the tag should be retained", () => {
            cy.get(".sort-filter-button").click();
            cy.get(".tag.selected").should('contain.text', 'three');
        })

        describe("AND I clear the tag filter", () => {
            beforeEach(() => {
                cy.get(".sort-filter-button").click();
                cy.get(".tag.selected").click();
                cy.get(".modal-button").contains("Apply").click();
            });

            it("THEN the genre grid should show all genres again", () => {
                cy.get('.genre-section').should('have.length', 2);
                cy.get('.genre-grid .genre-section').eq(1).find('.genre-title').should('contain.text', 'art rock, alternative rock');
            });
        });
    });
});