//Spotify.js
import SpotifyWebApi from 'spotify-web-api-js';
import { openDB } from 'idb';

const spotifyApi = new SpotifyWebApi();

const CLIENT_ID = 'd8d864b7c0594b7aa393d5ab713246dd';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

// Dynamically set the redirect URI based on the current URL
const REDIRECT_URI = window.location.origin;

export const getTokenFromUrl = () => {
  return window.location.hash
    .substring(1)
    .split('&')
    .reduce((initial, item) => {
      let parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

export const getLoginUrl = () => {
  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi();
  }
  let loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=user-library-read`;
  return loginUrl;
}

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

export default spotifyApi;
