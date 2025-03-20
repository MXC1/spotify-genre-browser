import React, { useEffect, useState, useRef } from 'react';
import { authenticateUser, clearAccessToken } from './services/spotifyAuth';
import { getCachedEntry, clearAllData } from './utilities/indexedDb';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { logMessage, fetchOrGenerateSessionID } from './utilities/loggingConfig';
import LoginContainer from './containers/loginContainer/loginContainer';
import HeaderContainer from './containers/headerContainer/headerContainer';
import GenreGridContainer from './containers/genreGridContainer/genreGridContainer';
import PrivacyPolicyContainer from './containers/privacyPolicyContainer/privacyPolicyContainer';
import ModalContainer from './containers/modalContainer/modalContainer';
import useModal from './hooks/useModal';
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useNavigationHelpers } from './utilities/navigationHelpers';
import OverlayMenu from './containers/overlayMenu/overlayMenu';

Amplify.configure(awsconfig);

function App() {
  const [tokenExists, setTokenExists] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('number-desc');
  const genreGridRef = useRef();
  const { isModalOpen, modalParams, openModal, closeModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate();
  const { goTo } = useNavigationHelpers();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initialise = async () => {
    await fetchOrGenerateSessionID();
    logMessage('Environment is: ' + process.env.REACT_APP_ENV);
  }

  useEffect(() => {
    initialise();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (location.pathname === "/privacy-policy") return;

      const token = await authenticateUser();
      if (!token) {
        goTo("/authenticate");
      } else {
        await fetchOrUpdateGenreAlbumMap();
        goTo("/genre-album-map");
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const fetchOrUpdateGenreAlbumMap = async () => {
    if (genreGridRef.current) {
      try {
        const cachedGenreAlbumMap = await getCachedEntry('data', 'grouped_albums');
        if (cachedGenreAlbumMap) {
          await genreGridRef.current.getCachedGenreAlbumMap();
        } else {
          await genreGridRef.current.updateGenreAlbumMap();
        }
      } catch (error) {
        logMessage(`Error updating genre album map: ${error}`);
      }
    }
  };

  const handleGenreAlbumMapRefresh = async () => {
    if (genreGridRef.current) {
      try {
        await genreGridRef.current.updateGenreAlbumMap();
      } catch (error) {
        logMessage(`Error refreshing genre album map: ${error}`);
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
    setTokenExists(false);
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

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

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

  return (
    <div className="App">
      <OverlayMenu ref={menuRef} isOpen={isMenuOpen} toggleMenu={toggleMenu} onDisconnect={handleOpenDisconnectModal} />
      <HeaderContainer
        onRefresh={handleGenreAlbumMapRefresh}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onOpenDisconnectModal={handleOpenDisconnectModal}
        toggleMenu={toggleMenu}
      />

      <Routes>
        <Route path="*" element={<LoginContainer />} />
        <Route path="/authenticate" element={<LoginContainer />} />
        <Route path="/genre-album-map" element={<GenreGridContainer searchQuery={searchQuery} sortOption={sortOption} ref={genreGridRef} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyContainer />} />
      </Routes>

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
