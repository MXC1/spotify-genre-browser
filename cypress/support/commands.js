import { openDB } from 'idb';

Cypress.Commands.add("getIndexedDBData", (dbName, storeName, key) => {
    return cy.window().then((win) => {
        return new Cypress.Promise((resolve, reject) => {
            const request = win.indexedDB.open(dbName);

            request.onerror = (event) => reject(event.target.error);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, "readonly");
                const store = transaction.objectStore(storeName);
                const getRequest = store.get(key);

                getRequest.onsuccess = () => resolve(getRequest.result);
                getRequest.onerror = (event) => reject(event.target.error);
            };
        });
    });
});

Cypress.Commands.add("setIndexedDBData", (dbName, storeName, key, value) => {
    return cy.window().then((win) => {
        return new Cypress.Promise((resolve, reject) => {
            const request = win.indexedDB.open(dbName);

            request.onerror = (event) => reject(event.target.error);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, "readwrite");
                const store = transaction.objectStore(storeName);
                const putRequest = store.put(value, key);

                putRequest.onsuccess = () => resolve();
                putRequest.onerror = (event) => reject(event.target.error);
            };
        });
    });
});

Cypress.Commands.add('resetIndexedDB', () => {
    indexedDB.deleteDatabase('spotify-db');
    return openDB('spotify-db', 2, {
      upgrade(db) {
        db.createObjectStore('auth');
        db.createObjectStore('data');
      },
    });
  });