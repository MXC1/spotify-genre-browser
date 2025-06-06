describe("GIVEN I have the old IndexedDB structure", () => {
    beforeEach(() => {
        cy.seedIndexedDbWithOldFormat();
        cy.visit("/genre-album-map?code=valid_token&state=valid_state");
    })

    it("THEN the new stores should be created", () => {
        // Assert that auth and data stores exist
        cy.window().then((win) => {
            const request = win.indexedDB.open("spotify-db");
            request.onsuccess = () => {
                const db = request.result;
                expect(db.objectStoreNames.contains("auth")).to.be.true;
                expect(db.objectStoreNames.contains("data")).to.be.true;
            };
        });


        // Assert that the user is redirected to the login page
        cy.get(".login-button").should("exist");
    })
})

describe("GIVEN /data/grouped_albums is deleted from indexedDb", () => {
    beforeEach(() => {
        cy.intercept("GET", "https://api.spotify.com/v1/me/albums*", { fixture: "mockGetMySavedAlbumsResponse_oneAlbum.json" }).as("getMySavedAlbums_oneAlbum");
        cy.intercept("GET", "https://api.spotify.com/v1/artists*", { fixture: "mockGetArtistsResponse_oneArtist.json" }).as("getArtists_oneArtist");
        cy.intercept("POST", "https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth", { fixture: "mockAuthTokenResponse.json" }).as("authToken");

        cy.resetIndexedDb();
        cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");

        cy.visitWithConsoleStub("/genre-album-map?code=valid_token&state=valid_state");

        cy.wait(["@authToken", "@getMySavedAlbums_oneAlbum", "@getArtists_oneArtist"]);
        cy.deleteIndexedDbData("data", "grouped_albums")

        cy.intercept("GET", "https://api.spotify.com/v1/me/albums*", { fixture: "mockGetMySavedAlbumsResponse.json", }).as("getMySavedAlbums");
        cy.intercept("GET", "https://api.spotify.com/v1/artists*", { fixture: "mockGetArtistsResponse.json" }).as("getArtists");

        cy.visitWithConsoleStub("/genre-album-map?code=valid_token&state=valid_state");
    })

    it("THEN new data is fetched from Spotify", () => {
        cy.get("@consoleLog").should("have.been.calledWithMatch", /MAP001/);
        cy.wait(["@getMySavedAlbums", "@getArtists"]);
        cy.get('.genre-section').should('have.length', 2);
    })
})

const authFields = ['access_token', 'expires_at'];

authFields.forEach((field) => {
    describe(`GIVEN /auth/${field} is deleted from indexedDb`, () => {
        beforeEach(() => {
            cy.mockAPIResponsesAndInitialiseAuthenticatedState();
            cy.intercept('POST', 'https://accounts.spotify.com/api/token*', { fixture: "mockRefreshTokenResponse.json" }).as('refreshToken');
            cy.deleteIndexedDbData("auth", field);

            cy.visitWithConsoleStub("/genre-album-map?code=valid_token&state=valid_state");
        });

        it("THEN new access token is fetched from the API", () => {
            cy.get("@consoleLog").should("have.been.calledWithMatch", /AUTH030/);
            cy.wait("@refreshToken");
        });
    });
});

describe("GIVEN /auth/refresh_token is deleted from indexedDb", () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
        cy.intercept('POST', 'https://accounts.spotify.com/api/token*', { fixture: "mockRefreshTokenResponse.json" }).as('refreshToken');
        cy.deleteIndexedDbData("auth", "refresh_token");
        cy.intercept('GET', 'https://api.spotify.com/v1/me/albums*', { statusCode: 401, body: { error: { message: "Request failed with status code 401" } } }).as('getMySavedAlbumsExpired');

        cy.visitWithConsoleStub("/genre-album-map?code=valid_token&state=valid_state");
    })

    it("THEN the user is redirected to /authenticate", () => {
        cy.get("@consoleLog").should("have.been.calledWithMatch", /MAP012/);
        cy.getIndexedDbData('auth', 'access_token').should('be.undefined');
        cy.url().should("include", "/authenticate");
    })
});

describe("GIVEN /auth/session_id is deleted from indexedDb", () => {
    beforeEach(() => {
        cy.mockAPIResponsesAndInitialiseAuthenticatedState();
        cy.deleteIndexedDbData("auth", "session_id");

        cy.visitWithConsoleStub("/genre-album-map?code=valid_token&state=valid_state");
    })

    it("THEN a new session_id is generated", () => {
        cy.get("@consoleLog").should("have.been.calledWithMatch", /SYS002/);
        cy.getIndexedDbData('auth', 'session_id').should('exist');
    })
});