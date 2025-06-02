import { getOrGenerateNewAccessToken } from './spotifyAuth';
import axios from 'axios';
import { logger } from '../utilities/logger';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeSpotifyRequestWithRetries = async (url, options, maxRetries = 3) => {
  logger.debug('SPOT001', 'Making Spotify API request', { url, options });
  let retries = 0;
  while (retries <= maxRetries) {
    try {
      const response = await axios.get(url, options);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429 && retries < maxRetries) {
        const retryAfterSeconds = parseInt(error.response.headers['retry-after'], 10) || 1;
        logger.warn('SPOT003', 'Rate limited, retrying', { retryAfterSeconds, retries });
        await delay(retryAfterSeconds * 1000);
        retries++;
      } else {
        logger.error('SPOT004', 'Error making Spotify API request', { error });
        throw error;
      }
    }
  }
};

export const getMySavedAlbums = async (limit, offset) => {
  const token = await getOrGenerateNewAccessToken();
  if (!token) {
    throw new Error('Access token not found.');
  }
  const options = {
    params: { limit, offset, album_type: 'album' },
    headers: { 'Authorization': `Bearer ${token}` },
  };
  return await makeSpotifyRequestWithRetries('https://api.spotify.com/v1/me/albums', options);
};

export const getArtists = async (ids) => {
  const token = await getOrGenerateNewAccessToken();
  if (!token) {
    throw new Error('Access token not found.');
  }
  const options = {
    params: { ids: ids.join(',') },
    headers: { 'Authorization': `Bearer ${token}` },
  };
  return await makeSpotifyRequestWithRetries('https://api.spotify.com/v1/artists', options);
};