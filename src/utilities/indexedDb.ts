import { openDB } from 'idb';
import { logger } from './logger';
import { IndexedDbKey, IndexedDbValue } from "./indexedDbTypes";

const dbPromise = openDB('spotify-db', 3, {
  upgrade(db, oldVersion, newVersion) {
    logger.debug('DB001', 'Upgrading indexedDb', { oldVersion, newVersion });
    if (!db.objectStoreNames.contains('auth')) {
      db.createObjectStore('auth');
    }
    if (!db.objectStoreNames.contains('data')) {
      db.createObjectStore('data');
    }
    
    if (db.objectStoreNames.contains('keyval')) {
      db.deleteObjectStore('keyval');
    }
  },
});

export const setCachedEntry = async (store: string, val: IndexedDbValue, key: IndexedDbKey) => {
  const db = await dbPromise;
  return db.put(store, val, key);
};

export const removeCachedEntry = async (store: string, key: IndexedDbKey) => {
  const db = await dbPromise;
  return db.delete(store, key);
};

export const getCachedEntry = async (store: string, key: IndexedDbKey) => {
  const db = await dbPromise;
  return db.get(store, key);
};

export const clearAllData = async () => {
  logger.debug('DB002', 'Clearing all data from indexedDb');
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
