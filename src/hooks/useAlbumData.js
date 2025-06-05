import { useCallback } from 'react';
import { useErrorBoundary } from "react-error-boundary";
import { setCachedEntry, getCachedEntry, clearAllData } from '../utilities/indexedDb';
import { getArtists, fetchAllSavedAlbums } from '../services/spotifyAPI';
import { authenticateUser } from "../services/spotifyAuth";
import { logger } from "../utilities/logger";
import { useNavigationHelpers } from '../utilities/navigationHelpers';
import { 
    useGroupedAlbums, 
    useIsLoading, 
    useIsSyncing,
    useAlbumProgress,
    useArtistProgress 
} from './globalState';

const BATCH_SIZE = 50;
const DELAY_MS = 500;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Custom hook to manage album data fetching and genre grouping
 */
export const useAlbumData = () => {
    const [groupedAlbums, setGroupedAlbums] = useGroupedAlbums();
    const [isLoading, setIsLoading] = useIsLoading();
    const [isSyncing, setIsSyncing] = useIsSyncing();
    const [albumProgress, setAlbumProgress] = useAlbumProgress();
    const [artistProgress, setArtistProgress] = useArtistProgress();
    const { showBoundary } = useErrorBoundary();
    const { goTo } = useNavigationHelpers();

    /**
     * Fetches all saved albums from Spotify with progress tracking
     * @returns {Promise<Array>} Array of album objects
     */    const fetchAllAlbumsWithProgress = useCallback(async () => {
        try {
            return await fetchAllSavedAlbums(setAlbumProgress);
        } catch (error) {
            logger.error('MAP012', 'Error fetching saved albums, redirecting to authenticate', { error });
            await clearAllData();
            goTo('/authenticate');
            return [];
        }
    }, [goTo, setAlbumProgress]);

    /**
     * Processes artists in batches to get their genres and map albums
     * @param {Array} albums - List of albums to process
     * @param {Array} artistIds - List of unique artist IDs
     * @returns {Object} Map of genres to their respective albums
     */
    const fetchAndProcessArtistBatches = useCallback(async (albums, artistIds) => {
        const genreAlbumMap = {};
        setArtistProgress({ current: 0, total: artistIds.length });
        logger.info('MAP020', 'Grouping albums by artist genre');

        for (let i = 0; i < artistIds.length; i += BATCH_SIZE) {
            const batch = artistIds.slice(i, i + BATCH_SIZE);
            const { artists } = await getArtists(batch);

            artists.forEach(artist => {
                const genres = artist.genres.length > 0 ? artist.genres : ['[Unknown Genre]'];
                const artistAlbums = albums.filter(album => album.artists[0].id === artist.id);
                
                genres.forEach(genre => {
                    if (!genreAlbumMap[genre]) {
                        genreAlbumMap[genre] = [];
                    }
                    genreAlbumMap[genre].push(...artistAlbums);
                });
            });
            
            setArtistProgress({ 
                current: Math.min(i + BATCH_SIZE, artistIds.length), 
                total: artistIds.length 
            });
            await delay(DELAY_MS);
        }

        return genreAlbumMap;
    }, [setArtistProgress]);

    /**
     * Combines genres that have the exact same albums into a single genre
     * @param {Object} genreAlbumMap - Initial map of genres to albums
     * @returns {Object} Optimized map with combined genres
     */
    const combineGenresWithSameAlbums = (genreAlbumMap) => {
        const combinedGenreAlbumMap = new Map();

        Object.entries(genreAlbumMap).forEach(([genre, albums]) => {
            const albumIds = albums.map(album => album.id).sort().join(',');
            if (combinedGenreAlbumMap.has(albumIds)) {
                combinedGenreAlbumMap.set(
                    albumIds,
                    `${combinedGenreAlbumMap.get(albumIds)}, ${genre}`
                );
            } else {
                combinedGenreAlbumMap.set(albumIds, genre);
            }
        });
        
        const finalGenreAlbumMap = {};
        combinedGenreAlbumMap.forEach((genres, albumIds) => {
            finalGenreAlbumMap[genres] = genreAlbumMap[genres.split(', ')[0]].filter(
                album => albumIds.includes(album.id)
            );
        });

        return finalGenreAlbumMap;
    };

    /**
     * Groups albums by their artists' genres
     * @param {Array} albums - List of albums to group
     * @returns {Promise<Object>} Map of genres to their respective albums
     */
    const groupAlbumsByArtistGenre = useCallback(async (albums) => {
        if (!albums?.length) {
            logger.info('MAP011', 'No albums to group');
            setIsLoading(false);
            return {};
        }

        const artistIds = [...new Set(albums.map(album => album.artists[0].id))];
        const genreAlbumMap = await fetchAndProcessArtistBatches(albums, artistIds);
        const finalGenreAlbumMap = combineGenresWithSameAlbums(genreAlbumMap);

        logger.info('MAP021', 'Finished grouping albums by artist genre');
        return finalGenreAlbumMap;
    }, [fetchAndProcessArtistBatches, setIsLoading]);

    /**
     * Fetches and processes all album data from Spotify
     */
    const fetchGenreAlbumMap = async () => {
        setAlbumProgress({ current: 0, total: 0 });
        setArtistProgress({ current: 0, total: 0 });
        try {
            const token = await authenticateUser();
            if (!token) {
                goTo("/authenticate");
                return;
            }

            const allAlbums = await fetchAllAlbumsWithProgress();
            const grouped = await groupAlbumsByArtistGenre(allAlbums);
            setGroupedAlbums(grouped);
            await setCachedEntry("data", grouped, "grouped_albums");
        } catch (error) {
            logger.error("MAP094", "Error initializing data", { error });
            showBoundary(error);
        } finally {
            setIsLoading(false); 
        }
    };

    /**
     * Initializes the album data from cache or fetches it from Spotify
     */
    const initializeData = useCallback(async () => {
        try {
            if (Object.keys(groupedAlbums).length > 0) {
                logger.debug("MAP014", "Using cached genre album map");
                return;
            }
            const cachedGenreAlbumMap = await getCachedEntry("data", "grouped_albums");
            if (cachedGenreAlbumMap && Object.keys(cachedGenreAlbumMap).length > 0) {
                logger.debug("MAP014", "Using cached genre album map and refreshing in background");
                setGroupedAlbums(cachedGenreAlbumMap);
                setIsSyncing(true);
                await fetchGenreAlbumMap();
                setIsSyncing(false);
            } else {
                setIsLoading(true);
                logger.debug("MAP016", "No cached data found. Fetching from scratch...");
                await fetchGenreAlbumMap();
                setIsLoading(false);
            }
        } catch (error) {
            setIsSyncing(false);
            setIsLoading(false);
            logger.error("MAP094", "Error initializing data", { error });
            showBoundary(error);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showBoundary]);

    /**
     * Forces a refresh of all album data from Spotify
     */
    const updateGenreAlbumMap = async () => {
        setIsLoading(true);
        logger.debug('MAP013', 'Updating genre album map from scratch');
        await fetchGenreAlbumMap();
        setIsLoading(false);
    };

    /**
     * Clears all cached album data
     */
    const clearGenreAlbumMap = async () => {
        setGroupedAlbums({});
    };

    return {
        groupedAlbums,
        isLoading,
        isSyncing,
        albumProgress,
        artistProgress,
        initializeData,
        updateGenreAlbumMap,
        clearGenreAlbumMap
    };
};
