//indexedDB.js
import { openDB } from 'idb';

// IndexedDB functions
const dbPromise = openDB('spotify-db', 1, {
  upgrade(db) {
    db.createObjectStore('keyval');
  },
});

export const set = async (key, val) => {
  const db = await dbPromise;
  return db.put('keyval', val, key);
};

export const get = async (key) => {
  const db = await dbPromise;
  return db.get('keyval', key);
};
