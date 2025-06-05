import axios from 'axios';
import { setCachedEntry, getCachedEntry, removeCachedEntry } from '../utilities/indexedDb';
import { logger } from '../utilities/logger';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin;

let accessToken;

const setAccessToken = async (newAccessToken) => {
  await setCachedEntry('auth', newAccessToken, 'access_token');
  accessToken = newAccessToken;
};

export const getAccessToken = async () => {
  const accessToken = await getCachedEntry('auth', 'access_token');
  const expiresAt = await getCachedEntry('auth', 'expires_at');

  if (expiresAt && Date.now() < expiresAt && accessToken) {
    return accessToken;
  }

  const newAccessToken = await refreshAccessToken();
  if (newAccessToken) {
    return newAccessToken;
  }

  return null;
};

export const getOrGenerateNewAccessToken = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    await setAuthUrl();
  }

  return accessToken;
}

export const setAuthUrl = async () => {
  logger.debug('AUTH013', 'Redirecting to authorization URL...', {});
  const authUrlToNavigateTo = (await getAuthorizationURL()).authorizationURL;
  window.location.href = authUrlToNavigateTo;
}

export const authenticateUser = async () => {
  logger.info('AUTH001', 'Authenticating user...', {});

  // Check if a token exists in indexedDb
  const cachedToken = await getCachedEntry('auth', 'access_token');
  if (cachedToken) {
    logger.debug('AUTH020', 'Using cached token', { cachedToken });
    setAccessToken(cachedToken);
  } else {
    // Check if we have a refresh token when no access token is found
    const refreshToken = await getCachedEntry('auth', 'refresh_token');
    if (refreshToken) {
      logger.debug('AUTH021', 'No access token found, but refresh token exists. Attempting refresh...');
      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          setAccessToken(newAccessToken);
        }
      } catch (error) {
        logger.error('AUTH092', 'Error refreshing token during authentication', { error });
      }
    }
  }

  // Check if there's already a codeVerifier saved in indexedDb
  const existingCodeVerifier = await getCachedEntry('auth', 'spotify_code_verifier');
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (existingCodeVerifier && code) {
    // If a codeVerifier and code exist, proceed with token exchange
    logger.debug('AUTH002', 'Using existing codeVerifier for token exchange');
    try {
      const token = await exchangeCodeForToken(code, existingCodeVerifier);
      setAccessToken(token);
    } catch(error) {
      throw error;
    }
      
    await removeCachedEntry('auth', 'spotify_code_verifier');
  }

  return !!accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
};

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const generateState = () => {
  return generateRandomString(16);
};

const generateCodeVerifier = () => {
  const codeVerifier = generateRandomString(64);
  return codeVerifier;
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const generateCodeChallenge = async (codeVerifier) => {
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);
  return codeChallenge;
};

export const getAuthorizationURL = async () => {
  logger.debug('AUTH010', 'Generating authorization URL');
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  await setCachedEntry('auth', codeVerifier, 'spotify_code_verifier');

  logger.debug('AUTH011', 'Generated code verifier and challenge', { codeVerifier });

  const state = generateState();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-library-read',
    state: state,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  authUrl.search = new URLSearchParams(params).toString();
  const authorizationURL = authUrl.toString();
  logger.debug('AUTH012', 'Generated authorization URL', { authorizationURL });
  return { authorizationURL };
};


export const exchangeCodeForToken = async (code, codeVerifier) => {

  const payload = {
    code: code,
    codeVerifier: codeVerifier,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  };

  const url = process.env.REACT_APP_PKCE_ENDPOINT + '/auth';
  
  logger.debug('AUTH004', 'Exchanging code for token', { payload , url});

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.debug('AUTH005', 'Token exchange successful', { response: response.data });
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresAt = Date.now() + response.data.expires_in * 1000;
    await setAccessToken(accessToken);
    await setCachedEntry('auth', refreshToken, 'refresh_token');
    await setCachedEntry('auth', expiresAt, 'expires_at');
    return accessToken;

  } catch (error) {
    logger.error('AUTH090', 'Error exchanging code for token', { error });
    throw error; 
  }
};

export const refreshAccessToken = async () => {
  logger.debug('AUTH030', 'Refreshing access token');
  const refreshToken = await getCachedEntry('auth', 'refresh_token');

  if (!refreshToken) {
    logger.error('AUTH032', 'No refresh token found');
    return null;
  }

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID
    })
  };

  try {
    const response = await fetch(url, payload);
    const data = await response.json();

    logger.debug('AUTH031', 'Refresh token response', { data });
    const newAccessToken = data.access_token;
    await setAccessToken(newAccessToken);
    if (data.refresh_token) {
      await setCachedEntry('auth', data.refresh_token, 'refresh_token');
      const expiresAt = Date.now() + data.expires_in * 1000;
      await setCachedEntry('auth', expiresAt, 'expires_at');
    }
    return newAccessToken;
  } catch (error) {
    logger.error('AUTH091', 'Error refreshing access token', { error });
    return null;
  }
};
