import { getOrGenerateNewAccessToken } from './spotifyAuth';
import axios from 'axios';
import logger from '../utilities/logger';

export const getMySavedAlbums = async (limit, offset) => {
    const token = await getOrGenerateNewAccessToken();
    if (!token) {
      throw new Error('Access token not found.');
    }
    try {
      const response = await axios.get(`https://api.spotify.com/v1/me/albums`, {
        params: {
          limit,
          offset,
          album_type: 'album',
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      logger.error('SPOT001', 'Error fetching saved albums', { error });
      throw error;
    }
  };
  
  export const getArtists = async (ids) => {
    const token = await getOrGenerateNewAccessToken();
    if (!token) {
      throw new Error('Access token not found.');
    }
    try {
      const response = await axios.get(`https://api.spotify.com/v1/artists`, {
        params: {
          ids: ids.join(','),
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      logger.error('SPOT002', 'Error fetching artists', { error });
      throw error;
    }
  };