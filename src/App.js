import React, { useEffect, useState, useRef } from 'react';
import { authenticateUser } from './services/spotifyAuth';
import { getCachedEntry } from './utilities/indexedDB';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { logMessage, fetchOrGenerateSessionID } from './utilities/loggingConfig';
import LoginContainer from './containers/loginContainer/loginContainer';
import HeaderContainer from './containers/headerContainer/headerContainer';
import GenreGridContainer from './containers/genreGridContainer/genreGridContainer';

Amplify.configure(awsconfig);

function App() {
  const [tokenExists, setTokenExists] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('number-desc');

  const genreGridRef = useRef();

  const initialize = async () => {
    await fetchOrGenerateSessionID();
    logMessage('Checking for token in URL...');

  const handleAuth = async () => {
    const tokenExists = await authenticateUser();
    if (tokenExists) {
      logMessage('Token exists after authentication');
      setTokenExists(true);
      fetchOrUpdateGenreAlbumMap();
    } else {
      logMessage('No token exists after authentication');
      setTokenExists(false);
    }
  };

  const fetchOrUpdateGenreAlbumMap = async () => {
    if (genreGridRef.current) {
      const cachedGenreAlbumMap = await getCachedEntry('data', 'groupedAlbums');
      if (cachedGenreAlbumMap) {
        await genreGridRef.current.getCachedGenreAlbumMap();
      } else {
        await genreGridRef.current.updateGenreAlbumMap();
      }
    }
  };

  useEffect(() => {
    logMessage('Environment is: ' + process.env.REACT_APP_ENV);
    handleAuth();
  }, []);

  const handleGenreAlbumMapRefresh = async () => {
    if (genreGridRef.current) {
      await genreGridRef.current.updateGenreAlbumMap();
    }
  }

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <div className="App">
      {!tokenExists ? (
        <LoginContainer />
      ) : (
        <div className="albums-container">
          <HeaderContainer
            onRefresh={handleGenreAlbumMapRefresh}
            onSearch={handleSearch}
            onSortChange={handleSortChange} />
          <GenreGridContainer searchQuery={searchQuery} sortOption={sortOption} ref={genreGridRef} />
        </div>
      )}
    </div>
  );
}

export default App;
