import React, { useEffect, useState, useRef } from 'react';
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { ErrorFallback, handleError } from './utilities/errorHandling';
import { clearAccessToken } from './services/spotifyAuth';
import { clearAllData } from './utilities/indexedDb';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { logMessage, fetchOrGenerateSessionID } from './utilities/loggingConfig';
import LoginContainer from './containers/loginContainer/loginContainer';
import HeaderContainer from './containers/headerContainer/headerContainer';
import GenreGridContainer from './containers/genreGridContainer/genreGridContainer';
import PrivacyPolicyContainer from './containers/privacyPolicyContainer/privacyPolicyContainer';
import AboutContainer from './containers/aboutContainer/aboutContainer';
import ModalContainer from './containers/modalContainer/modalContainer';
import useModal from './hooks/useModal';
import { Route, Routes } from "react-router-dom";
import { useNavigationHelpers } from './utilities/navigationHelpers';
import OverlayMenu from './containers/overlayMenu/overlayMenu';
import GenreContainer from './containers/genreContainer/genreContainer';

Amplify.configure(awsconfig);

function App() {
  const { showBoundary } = useErrorBoundary()
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('number-desc');
  const genreGridRef = useRef();
  const { isModalOpen, modalParams, openModal, closeModal } = useModal();
  const { goTo } = useNavigationHelpers();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    logMessage('Environment is: ' + process.env.REACT_APP_ENV);

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      goTo(`/genre-album-map?code=${code}&state=${state}`);
    }
  }, []);

  const handleGenreAlbumMapRefresh = async () => {
    if (genreGridRef.current) {
      try {
        await genreGridRef.current.updateGenreAlbumMap();
      } catch (error) {
        logMessage(`Error refreshing genre album map: ${error}`);
        showBoundary(error);
      }
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
    if (genreGridRef.current) {
      await genreGridRef.current.clearGenreAlbumMap();
    }
    closeModal();
    goTo('/authenticate');
    openModal({
      title: "Disconnect Spotify account",
      description: "Your account has been successfully disconnected.",
      button1Text: "Ok",
      button1Action: closeModal,
      button2Text: "",
      button2Action: null
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOpenDisconnectModal = () => {
    setIsMenuOpen(false);
    openModal({
      title: "Disconnect Spotify account",
      description: "Disconnecting your Spotify account will delete your data. To use the application again, you can just press 'Login to Spotify'.",
      button1Text: "Cancel",
      button1Action: closeModal,
      button2Text: "Disconnect",
      button2Action: handleDisconnect
    });
  };

  function getGenreContainerProps(genreGridRef) {
    const genreParam = new URLSearchParams(window.location.search).get('g');
    const groupedAlbums = genreGridRef.current?.getGroupedAlbums() || {};
    return {
      genre: genreParam || '[Unknown Genre]',
      albums: groupedAlbums[genreParam] || []
    };
  }

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <HeaderContainer
          onRefresh={handleGenreAlbumMapRefresh}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onOpenDisconnectModal={handleOpenDisconnectModal}
          toggleMenu={toggleMenu}
        />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <Routes>
          <Route path="*" element={<LoginContainer />} />
          <Route path="/authenticate" element={<LoginContainer />} />
          <Route path="/genre-album-map" element={<GenreGridContainer searchQuery={searchQuery} sortOption={sortOption} ref={genreGridRef} />} />
          <Route 
            path="/genre" 
            element={<GenreContainer {...getGenreContainerProps(genreGridRef)} />} 
          />
          <Route path="/privacy-policy" element={<PrivacyPolicyContainer />} />
          <Route path="/about" element={<AboutContainer />} />
        </Routes>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <OverlayMenu ref={menuRef} isOpen={isMenuOpen} toggleMenu={toggleMenu} onDisconnect={handleOpenDisconnectModal} />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
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
      </ErrorBoundary>
    </div>
  );
}

export default App;
