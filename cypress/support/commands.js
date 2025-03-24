import '@this-dot/cypress-indexeddb';

Cypress.Commands.add('resetIndexedDb', () => {
    cy.clearIndexedDb('spotify-db');
    cy.openIndexedDb('spotify-db').as('spotify-db');
    cy.getIndexedDb('@spotify-db').createObjectStore('auth').as('auth');
    cy.getIndexedDb('@spotify-db').createObjectStore('data').as('data');
});

Cypress.Commands.add('setIndexedDbData', (store,key,value) => {
    cy.getStore(`@${store}`).createItem(`${key}`, `${value}`);
});

Cypress.Commands.add('getIndexedDbData', (store,key) => {
    cy.getStore(`@${store}`).readItem(`${key}`);
});