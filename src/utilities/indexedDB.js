import { openDB } from 'idb';

const dbPromise = openDB('spotify-db', 2, {
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
  const db = await dbPromise;
  const tx = db.transaction(['auth', 'data'], 'readwrite');
  const sessionId = await tx.objectStore('auth').get('session_id');
  await tx.objectStore('auth').clear();
  await tx.objectStore('data').clear();
  if (sessionId) {
    await tx.objectStore('auth').put(sessionId, 'session_id');
  }
  await tx.done;
};
