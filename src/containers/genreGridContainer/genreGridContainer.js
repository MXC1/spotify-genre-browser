import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";
import { setCachedEntry, getCachedEntry } from "../../utilities/indexedDb";
import { getMySavedAlbums, getArtists } from '../../services/spotifyAPI';
import { authenticateUser } from "../../services/spotifyAuth";
import { logger } from "../../utilities/logger";
import './genreGridContainer.css';
import GenreContainer from '../genreContainer/genreContainer';
import { useNavigate } from "react-router-dom";
import { useNavigationHelpers } from "../../utilities/navigationHelpers";
import SearchSortContainer from '../../components/SearchSortContainer';

const GenreGridContainer = forwardRef((props, genreGridRef) => {
  const [groupedAlbums, setGroupedAlbums] = useState({});
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('number-desc');
  const { showBoundary } = useErrorBoundary();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { goTo } = useNavigationHelpers();
  const navigate = useNavigate();

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const delayTimeMs = 500;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === '/genre-album-map') {
      setSelectedGenre(null);
      setSortOption('number-desc');
      setSearchQuery('');
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

      // Call the API once to get the total value

      setLoadingMessage(`Requesting saved albums (${offset + limit} / ?)...`);
      logger.debug('MAP001', 'Fetching saved albums...', { offset, limit });

      const [albums, numberOfAlbums] = await getSavedAlbumsWithRetries(limit, offset);
      allAlbums = [...allAlbums, ...albums];
      allAlbumIds = [...allAlbumIds, ...albums.map(album => album.id)];

      // Calculate the remaining batches

      const albumsToProcess = numberOfAlbums - limit;
      const batchesToProcess = Math.ceil(albumsToProcess / limit);

      offset += limit;

      // Collect the remaining batches

      for (offset; offset <= batchesToProcess * limit; offset += limit) {
        setLoadingMessage(`Requesting saved albums (${Math.min(offset + limit, numberOfAlbums)} / ${numberOfAlbums})...`);
        logger.debug('MAP001', 'Fetching saved albums...', { offset, limit, numberOfAlbums });

        const [albums] = await getSavedAlbumsWithRetries(limit, offset);
        allAlbums = [...allAlbums, ...albums];
        allAlbumIds = [...allAlbumIds, ...albums.map(album => album.id)];
      }

      logger.debug('MAP002', 'Fetched all saved albums');

      return allAlbums;
    } catch (error) {
      logger.error('MAP095', 'Error fetching saved albums', { location: "fetchAllSavedAlbums", error });
      setLoadingMessage('Error fetching albums.');
      showBoundary(error);
    }
  }, []);

  async function getSavedAlbumsWithRetries(limit, offset) {
    let response;

    do {
      response = await getMySavedAlbums(limit, offset);

      if (response.error && response.error.status === 429) {
        const retryAfterSeconds = parseInt(response.headers.get('Retry-After'), 10);
        logger.error('MAP096', 'Rate limited', { retryAfterSeconds, status: response.error.status });
        await delay(retryAfterSeconds * 1000);
      }
    } while (response.error && response.error.status === 429);

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

    setLoadingMessage('Grouping albums by artist genre...');
    logger.debug('MAP020', 'Grouping albums by artist genre');

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

    setLoadingMessage('');
    logger.info('MAP021', 'Finished grouping albums by artist genre');
    return finalGenreAlbumMap;
  }, []);

  // Allow these methods to be called from the parent element
  useImperativeHandle(genreGridRef, () => ({
    getGroupedAlbums: () => {
      return groupedAlbums;
    },

    updateGenreAlbumMap: async () => {
      logger.info('MAP013', 'Updating genre album map from scratch');
      const allAlbums = await fetchAllSavedAlbums();

      const grouped = await groupAlbumsByArtistGenre(allAlbums);
      setGroupedAlbums(grouped);
      await setCachedEntry('data', grouped, 'grouped_albums');
    },
    getCachedGenreAlbumMap: async () => {
      logger.info('MAP012', 'Fetching genre album map from cache');
      setLoadingMessage(`Loading saved albums...`);
      const cachedGroupedAlbums = await getCachedEntry('data', 'grouped_albums');
      setGroupedAlbums(cachedGroupedAlbums);
      setLoadingMessage('');
    },
    clearGenreAlbumMap: async () => {
      setGroupedAlbums(null);
    }
  }))

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

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

  const handleGenreClick = (genre, albums) => {
    setSortOption('alphabetical-asc');
    setSelectedGenre({ genre, albums });
    goTo(`/genre`, { genre });
  };

  const handleBackToGrid = () => {
    setSelectedGenre(null);
    setSortOption('number-desc');
    setSearchQuery('');
    goTo('/genre-album-map');
  };

  const sortOptions = [
    { value: "alphabetical-asc", label: "A-Z (Genre)" },
    { value: "alphabetical-desc", label: "Z-A (Genre)" },
    { value: "number-asc", label: "Size (Asc)" },
    { value: "number-desc", label: "Size (Desc)" },
  ];

  return (
    <div>
      {loadingMessage ? (
        <p className="loading-message">{loadingMessage}</p>
      ) : selectedGenre ? (
        <GenreContainer
          genre={selectedGenre.genre}
          albums={selectedGenre.albums}
          onBack={handleBackToGrid}
          searchQuery={searchQuery}
          sortOption={sortOption}
        />
      ) : (
        <div>
          <SearchSortContainer
            onSearchQueryChange={setSearchQuery}
            onSortOptionChange={setSortOption}
            selectedSortOption={sortOption}
            placeholderText={
              selectedGenre
                ? "Search albums and artists..."
                : "Search genres, albums, and artists..."
            }
            sortOptions={selectedGenre ? sortOptions.slice(0, 2) : sortOptions}
          />
          <div className="genre-grid">
            {sortedGenres.map(([genre, albums], index) => (
              <GenreCard
                key={genre}
                genre={genre}
                albums={albums}
                index={index}
                onClick={() => handleGenreClick(genre, albums)}
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