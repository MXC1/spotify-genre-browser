import React, { useEffect, useState, useCallback } from 'react';
import spotifyApi, { getTokenFromUrl, loginUrl, set, get } from './Spotify';
import './App.css'
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import logToCloudWatch from './loggingConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

Amplify.configure(awsconfig);

function App() {
  const [token, setToken] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [groupedAlbums, setGroupedAlbums] = useState({});
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('number-desc');

  const logMessage = (message) => {
    if (process.env.REACT_APP_ENV === 'local') {
      console.log(message);
    } else {
      logToCloudWatch(message);
    }
  };

  const fetchAllSavedAlbums = useCallback(async () => {
    try {
      setLoadingMessage('Fetching saved albums...');
      let allAlbums = [];
      let allAlbumIds = [];
      let offset = 0;
      const limit = 50; // Maximum limit per request

      while (true) {
        logMessage(`Requesting saved albums with offset: ${offset}, limit: ${limit}`);
        setLoadingMessage(`Requesting saved albums (${offset} / ?)...`);
        const response = await spotifyApi.getMySavedAlbums({ limit, offset });
        const albums = response.items.map(item => item.album);
        allAlbums = [...allAlbums, ...albums];

        // Collect all album IDs
        allAlbumIds = [...allAlbumIds, ...albums.map(album => album.id)];

        if (response.items.length < limit) {
          break;
        }
        offset += limit;

        // Add a delay to avoid hitting the rate limit
        await delay(1000); // 1 second delay between requests
      }

      logMessage(`Finished fetching album IDs: ${JSON.stringify(allAlbumIds)}`);
      setLoadingMessage('Grouping albums by artist genre...');
      return allAlbums;
    } catch (error) {
      logMessage(`Error fetching saved albums: ${error}`);
      setLoadingMessage('Error fetching albums.');
    }
  }, []);

  const groupAlbumsByArtistGenre = useCallback(async (albums) => {
    const genreAlbumMap = {};
    const artistIds = albums.map(album => album.artists[0].id);
    const uniqueArtistIds = [...new Set(artistIds)];

    for (let i = 0; i < uniqueArtistIds.length; i += 50) {
      const batch = uniqueArtistIds.slice(i, i + 50);
      logMessage(`Requesting artist details (${i} / ${uniqueArtistIds.length})`);
      setLoadingMessage(`Requesting artist details (${i} / ${uniqueArtistIds.length})...`);
      const artists = await spotifyApi.getArtists(batch);

      artists.artists.forEach(artist => {
        const genres = artist.genres;
        if (genres.length === 0) {
          // If no genres are associated, add to 'Unknown Genre' category
          if (!genreAlbumMap['[Unknown Genre]']) {
            genreAlbumMap['[Unknown Genre]'] = [];
          }
          genreAlbumMap['[Unknown Genre]'].push(...albums.filter(album => album.artists[0].id === artist.id));
        } else {
          genres.forEach(genre => {
            if (!genreAlbumMap[genre]) {
              genreAlbumMap[genre] = [];
            }
            genreAlbumMap[genre].push(...albums.filter(album => album.artists[0].id === artist.id));
          });
        }
      });

      // Add a delay to avoid hitting the rate limit
      await delay(1000); // 1 second delay between requests
    }

    const combinedGenres = {};

    Object.keys(genreAlbumMap).forEach((genre) => {
      const albums = genreAlbumMap[genre];
      const key = JSON.stringify(albums.map(album => album.id).sort());

      if (!combinedGenres[key]) {
        combinedGenres[key] = { genres: [], albums: albums };
      }
      combinedGenres[key].genres.push(genre);
    });

    const grouped = {};
    Object.values(combinedGenres).forEach(({ genres, albums }) => {
      const genreKey = genres.join(', ');
      grouped[genreKey] = albums;
    });

    setGroupedAlbums(grouped);
    setLoadingMessage('');

    // Log the array of genre strings and their associated albums
    const genreAlbumArray = Object.entries(grouped).map(([genre, albums]) => ({
      genre,
      albums: albums.map(album => album.id)
    }));
    console.log(`Finished assigning albums to genres: ${JSON.stringify(genreAlbumArray)}`); // Check the array in the console
    return(grouped);
  }, []);

  const handleRefresh = async () => {

    setLoadingMessage('Refreshing data...');
    logMessage('Refreshing data...');
    
    // Generate a new Spotify auth token
      window.location.href = getLoginUrl();
      const hash = getTokenFromUrl();
      window.location.hash = '';
      const _token = hash.access_token;
      
      if (_token) {
        setToken(_token);
        spotifyApi.setAccessToken(_token);
        await set('token', _token);
      } else {
        const cachedToken = await get('token');
        if (cachedToken) {
          setToken(cachedToken);
          spotifyApi.setAccessToken(cachedToken);
        } else {
          setLoadingMessage('Error: No valid Spotify token found.');
          return;
        }
      }

    logMessage(`New auth token: ${_token}`);

    const allAlbums = await fetchAllSavedAlbums();
    setAlbums(allAlbums);
    await set('albums', allAlbums);
  
    const grouped = await groupAlbumsByArtistGenre(allAlbums);
    setGroupedAlbums(grouped);
    await set('groupedAlbums', grouped);
    setLoadingMessage('');
  };

  useEffect(() => {
    setLoadingMessage('Loading...');
    const initialize = async () => {
      const hash = getTokenFromUrl();
      window.location.hash = '';
      const _token = hash.access_token;
  
      if (_token) {
        setToken(_token);
        spotifyApi.setAccessToken(_token);
        await set('token', _token);
  
        const allAlbums = await fetchAllSavedAlbums();
        setAlbums(allAlbums);
        await set('albums', allAlbums);
  
        const cachedGroupedAlbums = await get('groupedAlbums');
        if (cachedGroupedAlbums) {
          setGroupedAlbums(cachedGroupedAlbums);
        } else {
          const grouped = await groupAlbumsByArtistGenre(allAlbums);
          setGroupedAlbums(grouped);
          await set('groupedAlbums', grouped);
        }
      } else {
        const cachedToken = await get('token');
        if (cachedToken) {
          setToken(cachedToken);
          spotifyApi.setAccessToken(cachedToken);
  
          const cachedAlbums = await get('albums');
          if (cachedAlbums) {
            setAlbums(cachedAlbums);
  
            const cachedGroupedAlbums = await get('groupedAlbums');
            if (cachedGroupedAlbums) {
              setGroupedAlbums(cachedGroupedAlbums);
            } else {
              const grouped = await groupAlbumsByArtistGenre(cachedAlbums);
              setGroupedAlbums(grouped);
              await set('groupedAlbums', grouped);
            }
          }
        }
      }
    setLoadingMessage('');
    };
  
    initialize();
  }, [fetchAllSavedAlbums, groupAlbumsByArtistGenre]);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const filteredGenres = Object.entries(groupedAlbums).filter(([genre, albums]) =>
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

  return (
    <div className="App">
      {!token ? (
        <div className="login-container">
          <a href={loginUrl} className="login-button">Login with Spotify</a>
        </div>
      ) : (
        <div className="albums-container">
          <div className="header-container">
          <div className="title-container">
            <h1 className="page-title">Your album library</h1>
            <button className="refresh-button" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSyncAlt} />
            </button>
          </div>
          <div className="search-sort-container">
            <input
              type="text"
              placeholder="Search genres, albums, and artists..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-bar"
            />
            <select value={sortOption} onChange={handleSortChange} className="sort-dropdown">
              <option value="alphabetical-asc">(A-Z)</option>
              <option value="alphabetical-desc">(Z-A)</option>
              <option value="number-asc">Size (Asc)</option>
              <option value="number-desc">Size (Desc)</option>
            </select>
          </div>
        </div>
          {loadingMessage ? (
            <p className="loading-message">{loadingMessage}</p>
          ) : sortedGenres.length === 0 ? (
            <p className="no-albums">No albums found</p>
          ) : (
            <div className="genre-grid">
              {sortedGenres.map(([genre, albums], index) => (
                <GenreSection key={genre} genre={genre} albums={albums} index={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GenreSection({ genre, albums, index }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleClick = () => {
    setIsCollapsed(!isCollapsed);
    setExpandedIndex(isCollapsed ? index : null);
  };

  return (
    <div className={`genre-section ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={handleClick} >
      <h2 className="genre-title">
        {genre}
      </h2>
      {isCollapsed ? (
        <div className="album-preview">
          {albums.slice(0, albums.length).map((album) => (
            <img key={album.id} src={album.images[0].url} alt={album.name} className="album-preview-image" />
          ))}
        </div>
      ) : (
        <div className="album-grid">
          {albums.map((album) => (
            <div key={album.id} className="album-item">
              <a href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="album-link">
                <img src={album.images[0].url} alt={album.name} className="album-image" />
                <div className="album-info">
                  <span className="album-name">{album.name}</span>
                  <span className="album-artist">{album.artists[0].name}</span>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
