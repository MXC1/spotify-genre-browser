import "@this-dot/cypress-indexeddb";

Cypress.Commands.add("resetIndexedDb", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearIndexedDb("spotify-db");
    cy.openIndexedDb("spotify-db").as("spotify-db");
    cy.getIndexedDb("@spotify-db").createObjectStore("auth").as("auth");
    cy.getIndexedDb("@spotify-db").createObjectStore("data").as("data");
});

Cypress.Commands.add("seedIndexedDbWithOldFormat", () => {
    cy.clearIndexedDb("spotify-db");
    cy.openIndexedDb("spotify-db").as("spotify-db");
    cy.getIndexedDb("@spotify-db").createObjectStore("keyval").as("keyval");
    cy.getStore("@keyval").createItem("groupedAlbums", {});
    cy.getStore("@keyval").createItem("token", "BQB");
});

Cypress.Commands.add("setIndexedDbData", (store, key, value) => {
    cy.getStore(`@${store}`).createItem(`${key}`, `${value}`);
});

Cypress.Commands.add("getIndexedDbData", (store, key) => {
    cy.getStore(`@${store}`).readItem(`${key}`);
});

Cypress.Commands.add("mockAPIResponsesAndInitialiseAuthenticatedState", () => {
    cy.intercept(
        "POST",
        "https://kb2nmvou7h.execute-api.eu-west-2.amazonaws.com/dev/auth",
        { fixture: "mockAuthTokenResponse.json" }
    ).as("authToken");
    cy.intercept("GET", "https://api.spotify.com/v1/me/albums*", {
        fixture: "mockGetMySavedAlbumsResponse.json",
    }).as("getMySavedAlbums");
    cy.intercept("GET", "https://api.spotify.com/v1/artists*", {
        fixture: "mockGetArtistsResponse.json",
    }).as("getArtists");

    cy.resetIndexedDb();
    cy.setIndexedDbData("auth", "spotify_code_verifier", "valid_code_verifier");

    cy.visit("/genre-album-map?code=valid_token&state=valid_state", {
        onBeforeLoad: (win) => {
            cy.stub(win.console, "log").as("consoleLog");
        },
    });

    cy.wait(["@authToken", "@getMySavedAlbums", "@getArtists"]);
});
