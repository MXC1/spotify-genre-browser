import { openDB } from 'idb';

const dbPromise = openDB('spotify-db', 2, {
  upgrade(db) {
    db.deleteObjectStore('keyval');

    db.createObjectStore('auth');
    db.createObjectStore('data');
  },
});

export const setCachedEntry = async (store, val, key) => {
  const db = await dbPromise;
  return db.put(store, val, key);
};

export const getCachedEntry = async (store, key) => {
  const db = await dbPromise;
  return db.get(store, key);
};
