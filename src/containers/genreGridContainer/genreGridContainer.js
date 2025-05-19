import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";
import { setCachedEntry, getCachedEntry } from "../../utilities/indexedDb";
import { getMySavedAlbums, getArtists } from '../../services/spotifyAPI';
import { authenticateUser } from "../../services/spotifyAuth";
import { logger } from "../../utilities/logger";
import './genreGridContainer.css';
import { useLocation, useNavigate } from "react-router-dom";
import { useNavigationHelpers } from "../../utilities/navigationHelpers";
import SearchSortContainer from '../../components/SearchSortContainer';

const GenreGridContainer = forwardRef((props, genreGridRef) => {
  const [groupedAlbums, setGroupedAlbums] = useState({});
  const [albumProgress, setAlbumProgress] = useState({ current: 0, total: 0 });
  const [artistProgress, setArtistProgress] = useState({ current: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const genreSearch = params.get("genreSearch") || '';
  const [searchQuery, setSearchQuery] = useState(genreSearch || '');
  const [sortOption, setSortOption] = useState('number-desc');
  const { showBoundary } = useErrorBoundary();
  const { goTo } = useNavigationHelpers();
  const navigate = useNavigate();

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const delayTimeMs = 500;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === '/genre-album-map') {
      setSortOption('number-desc');
    }
  }, [navigate]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (Object.keys(groupedAlbums).length > 0) {
          logger.debug('MAP014', 'Using cached genre album map');
          return;
        }
        const cachedGenreAlbumMap = await getCachedEntry('data', 'grouped_albums');
        if (cachedGenreAlbumMap && Object.keys(cachedGenreAlbumMap).length > 0) {
          logger.debug('MAP014', 'Using cached genre album map');
          setGroupedAlbums(cachedGenreAlbumMap);
        } else {
          logger.debug('MAP016', 'No cached data found. Fetching from scratch...');
          await fetchOrUpdateGenreAlbumMap();
        }
      } catch (error) {
        logger.error('MAP094', 'Error initializing data', { location: "initializeData", error });
        showBoundary(error);
      }
    };

    initializeData();
  }, []);
  
  const fetchOrUpdateGenreAlbumMap = async () => {
    try {
      const token = await authenticateUser();
      if (!token) {
        goTo("/authenticate");
        return;
      }
      
      setIsLoading(true);

      const cachedGenreAlbumMap = await getCachedEntry('data', 'grouped_albums');
      if (cachedGenreAlbumMap && Object.keys(cachedGenreAlbumMap).length > 0) {
        setGroupedAlbums(cachedGenreAlbumMap);
      } else {
        const allAlbums = await fetchAllSavedAlbums();
        const grouped = await groupAlbumsByArtistGenre(allAlbums);
        setGroupedAlbums(grouped);
        await setCachedEntry('data', grouped, 'grouped_albums');
      }
    } catch (error) {
      logger.error('MAP094', 'Error initializing data', { location: "fetchOrUpdateGenreAlbumMap", error });
      showBoundary(error);
    }
  };

  const fetchAllSavedAlbums = useCallback(async () => {
    try {
      let allAlbums = [];
      let allAlbumIds = [];
      let offset = 0;
      const limit = 50; // Maximum items per request

      setAlbumProgress({ current: 0, total: 0 });
      setArtistProgress({ current: 0, total: 0 });

      logger.info('MAP001', 'Fetching saved albums...');

      const [albums, numberOfAlbums] = await getReducedAlbumsAndTotal(limit, offset);
      allAlbums = [...allAlbums, ...albums];
      allAlbumIds = [...allAlbumIds, ...albums.map(album => album.id)];
      setAlbumProgress({ current: Math.min(offset + limit, numberOfAlbums), total: numberOfAlbums });

      // Calculate the remaining batches
      const albumsToProcess = numberOfAlbums - limit;
      const batchesToProcess = Math.ceil(albumsToProcess / limit);
      offset += limit;

      // Collect the remaining batches
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
      logger.error('MAP095', 'Error fetching saved albums', { location: "fetchAllSavedAlbums", error });
      showBoundary(error);
    }
  }, []);

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

  const groupAlbumsByArtistGenre = useCallback(async (albums) => {
    if (!albums || albums.length === 0) {
      logger.info('MAP011', 'No albums to group');
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

    // Combine genres with identical albums
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

  // Allow these methods to be called from the parent element
  useImperativeHandle(genreGridRef, () => ({
    getGroupedAlbums: () => {
      return groupedAlbums;
    },

    updateGenreAlbumMap: async () => {
      setIsLoading(true);
      logger.debug('MAP013', 'Updating genre album map from scratch');
      const allAlbums = await fetchAllSavedAlbums();

      const grouped = await groupAlbumsByArtistGenre(allAlbums);
      setGroupedAlbums(grouped);
      await setCachedEntry('data', grouped, 'grouped_albums');
    },
    getCachedGenreAlbumMap: async () => {
      logger.debug('MAP012', 'Fetching genre album map from cache');
      const cachedGroupedAlbums = await getCachedEntry('data', 'grouped_albums');
      setGroupedAlbums(cachedGroupedAlbums);
    },
    clearGenreAlbumMap: async () => {
      setGroupedAlbums(null);
    }
  }))

  const filteredGenres = Object.entries(groupedAlbums || {}).filter(([genre, albums]) =>
    genre.toLowerCase().includes(searchQuery) ||
    albums.some(album =>
      album.name.toLowerCase().includes(searchQuery) ||
      album.artists.some(artist => artist.name.toLowerCase().includes(searchQuery))
    )
  );

  const sortedGenres = filteredGenres.sort((a, b) => {
    if (sortOption === 'alphabetical-asc') {
      return a[0].localeCompare(b[0]);
    } else if (sortOption === 'alphabetical-desc') {
      return b[0].localeCompare(a[0]);
    } else if (sortOption === 'number-asc') {
      return a[1].length - b[1].length;
    } else if (sortOption === 'number-desc') {
      return b[1].length - a[1].length;
    }
    return 0;
  });

  const sortOptions = [
    { value: "alphabetical-asc", label: "A-Z (Genre)" },
    { value: "alphabetical-desc", label: "Z-A (Genre)" },
    { value: "number-asc", label: "Size (Asc)" },
    { value: "number-desc", label: "Size (Desc)" },
  ];

  return (
    <div>
      {isLoading ? (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Fetching your saved albums...</label>
            <div className="genre-progress-bar-outer">
              <div
                className="genre-progress-bar-inner"
                style={{
                  width: albumProgress.total > 0 ? `${(albumProgress.current / albumProgress.total) * 100}%` : '0%'
                }}
              />
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>{albumProgress.current} / {albumProgress.total}</div>
          </div>
          {artistProgress.total > 0 && (
            <div>
              <label style={{ fontWeight: 500 }}>Fetching genre information for artists...</label>
              <div className="genre-progress-bar-outer">
                <div
                  className="genre-progress-bar-inner"
                  style={{
                    width: artistProgress.total > 0 ? `${(artistProgress.current / artistProgress.total) * 100}%` : '0%'
                  }}
                />
              </div>
              <div style={{ fontSize: 13, color: '#aaa' }}>{artistProgress.current} / {artistProgress.total}</div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <SearchSortContainer
            onSearchQueryChange={setSearchQuery}
            onSortOptionChange={setSortOption}
            selectedSortOption={sortOption}
            placeholderText="Search genres, albums, and artists..."
            sortOptions={sortOptions}
            searchQuery={searchQuery} 
          />
          <div className="genre-grid">
            {sortedGenres.map(([genre, albums], index) => (
              <GenreCard
                key={genre}
                genre={genre}
                albums={albums}
                index={index}
                onClick={() => goTo(`/genre`, { genre, genreSearch: searchQuery })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

function GenreCard({ genre, albums, onClick }) {
  return (
    <div className="genre-section" onClick={onClick}>
      <div className="album-preview">
        {albums.slice(0, albums.length < 4 ? 1 : 4).map((album, index) => (
          <img
            key={album.id}
            src={album.images[1].url}
            alt={album.name}
            className={`album-preview-image ${albums.length < 4 ? 'single-album' : ''}`}
          />
        ))}
      </div>
      <h2 className="genre-title">{genre}</h2>
    </div>
  );
}

export default GenreGridContainer;