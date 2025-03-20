import { openDB } from 'idb';
import logMessage from './loggingConfig';

const dbPromise = openDB('spotify-db', undefined, {
  upgrade(db) {
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

export const clearAllData = async () => {
  logMessage('Clearing all data from indexedDb...');
  const db = await dbPromise;
  const tx = db.transaction(['auth', 'data'], 'readwrite');
  const sessionID = await tx.objectStore('auth').get('session_id');
  await tx.objectStore('auth').clear();
  await tx.objectStore('data').clear();
  if (sessionID) {
    await tx.objectStore('auth').put(sessionID, 'session_id');
  }
  await tx.done;
};
