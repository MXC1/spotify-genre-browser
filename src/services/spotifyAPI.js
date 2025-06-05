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
  try {
    const token = await getOrGenerateNewAccessToken();
    if (!token) {
      throw new Error('Access token not found.');
    }
    const options = {
      params: { limit, offset, album_type: 'album' },
      headers: { 'Authorization': `Bearer ${token}` },
    };
    return await makeSpotifyRequestWithRetries('https://api.spotify.com/v1/me/albums', options);
  } catch (error) {
    logger.error('SPOT006', 'Error fetching saved albums', { error, limit, offset });
    throw error;
  }
};

export const getArtists = async (ids) => {
  try {
    const token = await getOrGenerateNewAccessToken();
    if (!token) {
      throw new Error('Access token not found.');
    }
    const options = {
      params: { ids: ids.join(',') },
      headers: { 'Authorization': `Bearer ${token}` },
    };
    return await makeSpotifyRequestWithRetries('https://api.spotify.com/v1/artists', options);
  } catch (error) {
    logger.error('SPOT007', 'Error fetching artists', { error, ids });
    throw error;
  }
};

const BATCH_SIZE = 50;

export const fetchAllSavedAlbums = async (onProgress) => {
    try {
        let allAlbums = [];
        let offset = 0;
        onProgress?.({ current: 0, total: 0 });
        
        logger.info('MAP001', 'Fetching saved albums...');
        const response = await getMySavedAlbums(BATCH_SIZE, offset);
        const firstBatch = response.items.map(({ album }) => ({
            id: album.id,
            name: album.name,
            artists: album.artists.map(({ id, name }) => ({ id, name })),
            external_urls: { spotify: album.external_urls?.spotify || null },
            images: album.images.slice(0, 2).map(image => ({ url: image?.url || null })),
        }));
        const total = response.total;
        allAlbums = firstBatch;
        onProgress?.({ current: Math.min(BATCH_SIZE, total), total });

        while (offset + BATCH_SIZE < total) {
            offset += BATCH_SIZE;
            const nextResponse = await getMySavedAlbums(BATCH_SIZE, offset);
            const batch = nextResponse.items.map(({ album }) => ({
                id: album.id,
                name: album.name,
                artists: album.artists.map(({ id, name }) => ({ id, name })),
                external_urls: { spotify: album.external_urls?.spotify || null },
                images: album.images.slice(0, 2).map(image => ({ url: image?.url || null })),
            }));
            allAlbums.push(...batch);
            onProgress?.({ current: Math.min(offset + BATCH_SIZE, total), total });
        }

        logger.debug('MAP002', 'Fetched all saved albums');
        return allAlbums;
    } catch (error) {
        logger.error('MAP095', 'Error fetching saved albums', { error });
        throw error;
    }
};