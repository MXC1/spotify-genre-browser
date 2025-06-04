import { useState, useCallback, useEffect } from 'react';
import { useErrorBoundary } from "react-error-boundary";
import { setCachedEntry, getCachedEntry } from '../utilities/indexedDb';
import { getMySavedAlbums, getArtists } from '../services/spotifyAPI';
import { authenticateUser } from "../services/spotifyAuth";
import { logger } from "../utilities/logger";
import { useNavigationHelpers } from '../utilities/navigationHelpers';

let globalGroupedAlbums = {};
let globalSetters = new Set();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const delayTimeMs = 500;

export const useAlbumData = () => {
    const [groupedAlbums, setLocalGroupedAlbums] = useState(globalGroupedAlbums);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [albumProgress, setAlbumProgress] = useState({ current: 0, total: 0 });
    const [artistProgress, setArtistProgress] = useState({ current: 0, total: 0 });

    const { showBoundary } = useErrorBoundary();
    const { goTo } = useNavigationHelpers();

    const setGroupedAlbums = useCallback((newAlbums) => {
        globalGroupedAlbums = newAlbums;
        globalSetters.forEach(setter => setter(newAlbums));
    }, []);

    const fetchAllSavedAlbums = useCallback(async () => {
        try {
            let allAlbums = [];
            let allAlbumIds = [];
            let offset = 0;
            const limit = 50;

            setAlbumProgress({ current: 0, total: 0 });
            setArtistProgress({ current: 0, total: 0 });

            logger.info('MAP001', 'Fetching saved albums...');

            const [albums, numberOfAlbums] = await getReducedAlbumsAndTotal(limit, offset);
            allAlbums = [...allAlbums, ...albums];
            allAlbumIds = [...allAlbumIds, ...albums.map(album => album.id)];
            setAlbumProgress({ current: Math.min(offset + limit, numberOfAlbums), total: numberOfAlbums });

            const albumsToProcess = numberOfAlbums - limit;
            const batchesToProcess = Math.ceil(albumsToProcess / limit);
            offset += limit;

            for (offset; offset <= batchesToProcess * limit; offset += limit) {
                setAlbumProgress({ current: Math.min(offset + limit, numberOfAlbums), total: numberOfAlbums });
                const [albums] = await getReducedAlbumsAndTotal(limit, offset);
                allAlbums = [...allAlbums, ...albums];
                allAlbumIds = [...allAlbumIds, ...albums.map(album => album.id)];
            }
            setAlbumProgress({ current: numberOfAlbums, total: numberOfAlbums });
            logger.debug('MAP002', 'Fetched all saved albums');
            return allAlbums;
        } catch (error) {
            logger.error('MAP095', 'Error fetching saved albums', { error });
            showBoundary(error);
        }
    }, [showBoundary]);

    const groupAlbumsByArtistGenre = useCallback(async (albums) => {
        if (!albums || albums.length === 0) {
            logger.info('MAP011', 'No albums to group');
            setIsLoading(false);
            return {};
        }

        const genreAlbumMap = {};
        const artistIds = [...new Set(albums.map(album => album.artists[0].id))];

        setArtistProgress({ current: 0, total: artistIds.length });
        logger.info('MAP020', 'Grouping albums by artist genre');

        for (let i = 0; i < artistIds.length; i += 50) {
            const batch = artistIds.slice(i, i + 50);
            const artists = await getArtists(batch);

            artists.artists.forEach(artist => {
                const genres = artist.genres.length > 0 ? artist.genres : ['[Unknown Genre]'];
                genres.forEach(genre => {
                    if (!genreAlbumMap[genre]) {
                        genreAlbumMap[genre] = [];
                    }
                    genreAlbumMap[genre].push(...albums.filter(album => album.artists[0].id === artist.id));
                });
            });

            setArtistProgress(prev => ({ current: Math.min(i + 50, artistIds.length), total: artistIds.length }));
            await delay(delayTimeMs);
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
            finalGenreAlbumMap[genres] = Object.values(genreAlbumMap).find(
                albums => albums.map(album => album.id).sort().join(',') === albumIds
            );
        });

        setArtistProgress({ current: artistIds.length, total: artistIds.length });
        setIsLoading(false);
        logger.info('MAP021', 'Finished grouping albums by artist genre');
        return finalGenreAlbumMap;
    }, []);

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
                logger.debug("MAP016", "No cached data found. Fetching from scratch...");
                await fetchGenreAlbumMap();
            }
        } catch (error) {
            setIsSyncing(false);
            setIsLoading(false);
            logger.error("MAP094", "Error initializing data", { error });
            showBoundary(error);
        }
    }, [groupedAlbums, showBoundary]);

    const updateGenreAlbumMap = async () => {
        setIsLoading(true);
        logger.debug('MAP013', 'Updating genre album map from scratch');
        await fetchGenreAlbumMap();
        setIsLoading(false);
    };

    const clearGenreAlbumMap = async () => {
        setGroupedAlbums({});
    };

    useEffect(() => {
        globalSetters.add(setLocalGroupedAlbums);
        return () => globalSetters.delete(setLocalGroupedAlbums);
    }, []);

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

async function getReducedAlbumsAndTotal(limit, offset) {
    const response = await getMySavedAlbums(limit, offset);

    const reducedAlbums = response.items.map(({ album }) => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map(({ id, name }) => ({ id, name })),
        external_urls: { spotify: album.external_urls?.spotify || null },
        images: album.images.slice(0, 2).map(image => ({ url: image?.url || null })),
    }));

    return [reducedAlbums, response.total];
}
