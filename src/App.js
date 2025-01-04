import React, { useEffect, useState, useRef } from 'react';
import { authenticateUser, clearAccessToken } from './services/spotifyAuth';
import { getCachedEntry, clearAllData } from './utilities/indexedDB';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { logMessage, fetchOrGenerateSessionID } from './utilities/loggingConfig';
import LoginContainer from './containers/loginContainer/loginContainer';
import HeaderContainer from './containers/headerContainer/headerContainer';
import GenreGridContainer from './containers/genreGridContainer/genreGridContainer';
import ModalContainer from './containers/modalContainer/modalContainer';
import useModal from './hooks/useModal';

Amplify.configure(awsconfig);

function App() {
  const [tokenExists, setTokenExists] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('number-desc');
  const genreGridRef = useRef();
  const { isModalOpen, modalParams, openModal, closeModal } = useModal();

  const initialise = async () => {
    await fetchOrGenerateSessionID();
    logMessage('Environment is: ' + process.env.REACT_APP_ENV);
    handleAuth();
  }

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
    initialise();
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

  const handleDisconnect = async () => {
    logMessage('Disconnecting Spotify account...');
    await clearAllData();
    clearAccessToken();
    setTokenExists(false);
    if (genreGridRef.current) {
      await genreGridRef.current.clearGenreAlbumMap();
    }
    closeModal();
    openModal({
      title: "Disconnect Spotify account",
      description: "Your account has been successfully disconnected.",
      button1Text: "Ok",
      button1Action: closeModal,
      button2Text: "",
      button2Action: null
    });
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
            onSortChange={handleSortChange}
            onOpenDisconnectModal={() => openModal({
              title: "Disconnect Spotify account",
              description: "Disconnecting your Spotify account will delete your data. To use the application again, you can just press 'Login to Spotify'.",
              button1Text: "Cancel",
              button1Action: closeModal,
              button2Text: "Disconnect",
              button2Action: handleDisconnect
            })}
          />
          <GenreGridContainer searchQuery={searchQuery} sortOption={sortOption} ref={genreGridRef} />
        </div>
      )}
      <ModalContainer
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalParams.title}
        description={modalParams.description}
        button1Text={modalParams.button1Text}
        button1Action={modalParams.button1Action}
        button2Text={modalParams.button2Text}
        button2Action={modalParams.button2Action}
      />
    </div>
  );
}

export default App;
