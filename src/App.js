import React, { useEffect, useState, useRef } from 'react';
import spotifyApi, { getTokenFromUrl, getLoginUrl } from './services/Spotify';
import { set, get } from './utilities/indexedDB';
import './App.css'
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import logMessage from './utilities/loggingConfig';
import LoginContainer from './containers/loginContainer/loginContainer';
import HeaderContainer from './containers/headerContainer/headerContainer';
import GenreGridContainer from './containers/genreGridContainer/genreGridContainer';

Amplify.configure(awsconfig);

function App() {
  const [token, setToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('number-desc');

  const genreGridRef = useRef();
  const initialize = async () => {
    logMessage('Checking for token in URL...');

    // Token is only present if the user is coming back from a Spotify redirect.
    // This only happens if they have never visited the app before, or if they
    // press the Refresh button.
    const hash = getTokenFromUrl();
    window.location.hash = '';
    const _token = hash.access_token;

    if (_token) {
      logMessage(`Token found in URL: ${_token}`);
      setToken(_token);
      spotifyApi.setAccessToken(_token);
      await set('token', _token);

      if (genreGridRef.current) {
        genreGridRef.current.updateGenreAlbumMap();
      }
    } else {
      logMessage('No token found in URL. Checking for cached token in IndexedDB...');

      const cachedToken = await get('token');
      if (cachedToken) {
        logMessage(`Cached token found: ${cachedToken}`);
        setToken(cachedToken);
        spotifyApi.setAccessToken(cachedToken);
      }

      logMessage(`genreGridRef: ${JSON.stringify(genreGridRef.current)}`);
      if (genreGridRef.current) {
        genreGridRef.current.getCachedGenreAlbumMap();
      }
    }
  }

  useEffect(() => {
    initialize();
  }, []);

  const handleRefresh = async () => {
    logMessage('Refreshing data...');

    window.location.href = getLoginUrl();
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <div className="App">
      {!token ? (
        <LoginContainer />
      ) : (
        <div className="albums-container">
          <HeaderContainer
            onRefresh={handleRefresh}
            onSearch={handleSearch}
            onSortChange={handleSortChange} />
          <GenreGridContainer searchQuery={searchQuery} sortOption={sortOption} ref={genreGridRef} />
        </div>
      )}
    </div>
  );
}

export default App;
