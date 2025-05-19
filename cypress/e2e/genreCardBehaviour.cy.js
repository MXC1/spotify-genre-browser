describe("GIVEN I have no albums in my library", () => {
  beforeEach(() => {
    cy.intercept(
      "POST",
      "https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth",
      { fixture: "mockAuthTokenResponse.json" }
    ).as("authToken");
    cy.intercept("GET", "https://api.spotify.com/v1/me/albums*", {
      fixture: "mockGetMySavedAlbumsResponse_noAlbums.json",
    }).as("getMySavedAlbums_noAlbums");

    cy.resetIndexedDb();
    cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");

    cy.visit("/genre-album-map?code=valid_token&state=valid_state");

    // cy.wait(["@authToken", "@getMySavedAlbums", "@getArtists"]);
  });

  it.only("THEN the no albums message should be shown", () => {
    cy.get(".page-title").should("contain", "Your album library");
    cy.get(".refresh-button").should("exist");

    cy.get(".genre-section").should("have.length", 0);
    
    cy.get('.no-albums-message').should('exist');
  });
});

describe("GIVEN I am on the genre grid page", () => {
  beforeEach(() => {
    cy.mockAPIResponsesAndInitialiseAuthenticatedState();
  });

  describe("WHEN I change the search query", () => {
    beforeEach(() => {
      cy.get(".search-bar").type("slowcore");
    });

    it("THEN the genre grid is filtered", () => {
      cy.get(".genre-section").should("have.length", 1);
      cy.get(".genre-section").eq(0).should("contain", "slowcore, spoken word");
    });

    it("THEN the search query is retained", () => {
      cy.get(".genre-section").eq(0).click();
      cy.get(".back-button").click();
      cy.get(".search-bar").should("have.value", "slowcore");
    });
  });

  describe("WHEN I click on a genre card", () => {
    beforeEach(() => {
      cy.get(".genre-section").eq(0).click();
    });

    it("THEN the relevant genre page is opened", () => {
      cy.get(".big-genre-title").should(
        "contain.text",
        "slowcore, spoken word"
      );
    });

    it("THEN the sort option is A-Z (Artist)", () => {
      cy.get(".album-item")
        .eq(0)
        .get(".album-name")
        .should("contain.text", "Test Album One");
    });

    describe("WHEN I change the sort option", () => {
      beforeEach(() => {
        cy.get(".sort-dropdown").select("alphabetical-desc-artist");
      });

      it("THEN the order of the albums changes", () => {
        cy.get(".album-item")
          .eq(0)
          .get(".album-name")
          .should("contain.text", "Test Album Three");
      });
    });

    describe("WHEN I change the search query", () => {
      beforeEach(() => {
        cy.get(".search-bar").type("Three");
      });

      it("THEN the albums are filtered", () => {
        cy.get(".album-item")
          .eq(0)
          .get(".album-name")
          .should("contain.text", "Test Album Three");
        cy.get(".album-item").should("have.length", 1);
      });
    });

    describe("WHEN I click the home button", () => {
      beforeEach(() => {
        cy.get(".home-button").click();
      });

      it("THEN I go back to the genre grid page", () => {
        cy.get(".page-title").should("contain", "Your album library");
        cy.get(".refresh-button").should("exist");
        cy.get(".genre-grid").should("exist");
      });

      it("THEN the sort option is Size (Desc)", () => {
        cy.get(".genre-section")
          .eq(0)
          .should("contain", "slowcore, spoken word");
      });
    });

    describe("WHEN I click the genre title", () => {
      beforeEach(() => {
        cy.get(".big-genre-title").click();
      });

      it("THEN I go back to the genre grid page", () => {
        cy.get(".page-title").should("contain", "Your album library");
        cy.get(".refresh-button").should("exist");
        cy.get(".genre-grid").should("exist");
      });

      it("THEN the sort option is Size (Desc)", () => {
        cy.get(".genre-section")
          .eq(0)
          .should("contain", "slowcore, spoken word");
      });
    });
  });
});

describe("GIVEN I navigate to a single album", () => {
  beforeEach(() => {
    cy.mockAPIResponsesAndInitialiseAuthenticatedState();
    cy.get(".genre-section").eq(0).click();
    cy.get(".search-bar").type("Test");
    cy.get(".album-item").eq(0).click();
  });

  it("THEN that album page is shown", () => {
    cy.get(".single-album-title").contains("Test Album One");
    cy.get(".single-album-artists").contains("Test Artist One");
    cy.get(".single-album-image")
      .should("have.attr", "src")
      .should(
        "include",
        "https://i.scdn.co/image/ab67616d0000b27326597c053b38c9cf93f8f3a9"
      );

    cy.get(".spotify-button").contains("Open in Spotify");
    cy.get(".spotify-button")
      .should("have.attr", "href")
      .should("include", "https://open.spotify.com/album/test-album-1");
  });

  describe("WHEN I click the back button", () => {
    beforeEach(() => {
      cy.get(".genre-back-button").click();
    });

    it("THEN the genre grid is shown again", () => {
      cy.get(".big-genre-title").should(
        "contain.text",
        "slowcore, spoken word"
      );
      cy.get(".search-bar").should("have.value", "test");
    });
  });

  describe("WHEN I click the home button", () => {
    beforeEach(() => {
      cy.get(".home-button").click();
    });

    it("THEN I go back to the genre grid page", () => {
      cy.get(".page-title").should("contain", "Your album library");
      cy.get(".refresh-button").should("exist");
      cy.get(".genre-grid").should("exist");
    });
  });
});
