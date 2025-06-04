import { useCallback } from 'react';
import { useErrorBoundary } from "react-error-boundary";
import { setCachedEntry, getCachedEntry } from '../utilities/indexedDb';
import { getMySavedAlbums, getArtists } from '../services/spotifyAPI';
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

const fetchAlbumBatch = async (limit, offset) => {
    const response = await getMySavedAlbums(limit, offset);
    const albums = response.items.map(({ album }) => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map(({ id, name }) => ({ id, name })),
        external_urls: { spotify: album.external_urls?.spotify || null },
        images: album.images.slice(0, 2).map(image => ({ url: image?.url || null })),
    }));
    return [albums, response.total];
};

export const useAlbumData = () => {
    const [groupedAlbums, setGroupedAlbums] = useGroupedAlbums();
    const [isLoading, setIsLoading] = useIsLoading();
    const [isSyncing, setIsSyncing] = useIsSyncing();
    const [albumProgress, setAlbumProgress] = useAlbumProgress();
    const [artistProgress, setArtistProgress] = useArtistProgress();
    const { showBoundary } = useErrorBoundary();
    const { goTo } = useNavigationHelpers();

    const fetchAllSavedAlbums = useCallback(async () => {
        try {
            let allAlbums = [];
            let offset = 0;
            setAlbumProgress({ current: 0, total: 0 });
            
            logger.info('MAP001', 'Fetching saved albums...');
            const [firstBatch, total] = await fetchAlbumBatch(BATCH_SIZE, offset);
            allAlbums = firstBatch;
            setAlbumProgress({ current: Math.min(BATCH_SIZE, total), total });

            while (offset + BATCH_SIZE < total) {
                offset += BATCH_SIZE;
                const [batch] = await fetchAlbumBatch(BATCH_SIZE, offset);
                allAlbums.push(...batch);
                setAlbumProgress({ current: Math.min(offset + BATCH_SIZE, total), total });
            }

            logger.debug('MAP002', 'Fetched all saved albums');
            return allAlbums;
        } catch (error) {
            logger.error('MAP095', 'Error fetching saved albums', { error });
            showBoundary(error);
            return [];
        }
    }, [showBoundary, setAlbumProgress]);

    const groupAlbumsByArtistGenre = useCallback(async (albums) => {
        if (!albums?.length) {
            logger.info('MAP011', 'No albums to group');
            setIsLoading(false);
            return {};
        }

        const genreAlbumMap = {};
        const artistIds = [...new Set(albums.map(album => album.artists[0].id))];

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

        logger.info('MAP021', 'Finished grouping albums by artist genre');
        return finalGenreAlbumMap;
    }, [setArtistProgress, setIsLoading]);

    const fetchGenreAlbumMap = async () => {
        try {
            const token = await authenticateUser();
            if (!token) {
                goTo("/authenticate");
                return;
            }

            const allAlbums = await fetchAllSavedAlbums();
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

    const updateGenreAlbumMap = async () => {
        setIsLoading(true);
        logger.debug('MAP013', 'Updating genre album map from scratch');
        await fetchGenreAlbumMap();
        setIsLoading(false);
    };

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
