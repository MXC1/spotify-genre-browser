import { getAccessToken } from './spotifyAuth';
import axios from 'axios';

export const getMySavedAlbums = async (limit, offset) => {
    const token = await getAccessToken();
    if (!token) {
      return [];
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
      console.error(`Error fetching saved albums: ${error}`);
      throw error;
    }
  };
  
  export const getArtists = async (ids) => {
    const token = await getAccessToken();
    if (!token) {
      return [];
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
      console.error(`Error fetching artists: ${error}`);
      throw error;
    }
  };