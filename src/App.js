import React, { useEffect, useState, useRef } from 'react';
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { ErrorFallback, handleError } from './utilities/errorHandling';
import { clearAccessToken } from './services/spotifyAuth';
import { clearAllData } from './utilities/indexedDb';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import LoginContainer from './containers/loginContainer/loginContainer';
import HeaderContainer from './containers/headerContainer/headerContainer';
import GenreGridContainer from './containers/genreGridContainer/genreGridContainer';
import PrivacyPolicyContainer from './containers/privacyPolicyContainer/privacyPolicyContainer';
import AboutContainer from './containers/aboutContainer/aboutContainer';
import DonatePageContainer from './containers/donatePageContainer/donatePageContainer';
import ModalContainer from './containers/modalContainer/modalContainer';
import useModal from './hooks/useModal';
import usePWAInstall from './hooks/usePWAInstall';
import { Route, Routes } from "react-router-dom";
import { useNavigationHelpers } from './utilities/navigationHelpers';
import OverlayMenu from './containers/overlayMenu/overlayMenu';
import { logger } from './utilities/logger';

Amplify.configure(awsconfig);

function App() {
  const { showBoundary } = useErrorBoundary()
  const genreGridRef = useRef();
  const { isModalOpen, modalParams, openModal, closeModal } = useModal();
  const { showInstallPrompt, installPromptEvent } = usePWAInstall();
  const { goTo } = useNavigationHelpers();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    logger.info('SYS001','Environment is', { env: process.env.REACT_APP_ENV });

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      goTo(`/genre-album-map`, {code: code, state: state});
    }
  }, []);

  const handleGenreAlbumMapRefresh = async () => {
    if (genreGridRef.current) {
      try {
        await genreGridRef.current.updateGenreAlbumMap();
      } catch (error) {
        logger.error('MAP001','Error refreshing genre album map', error);
        showBoundary(error);
      }
    }
  }

  const handleDisconnect = async () => {
    logger.info('AUTH001','Disconnecting Spotify account...', {});
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

  const handleOpenInstallModal = () => {
    logger.info('INSTALL001','Opening install modal', {});
    setIsMenuOpen(false);
    openModal({
      title: "Install the app",
      description: "Installing this app allows you to access it directly from your home screen, just like a native app.",
      button1Text: "Cancel",
      button1Action: () => {
        logger.info('INSTALL002','User canceled the install modal', {});
        closeModal();
      },
      button2Text: "Install",
      button2Action: () => {
        logger.info('INSTALL003','User accepted the install modal', {});
        closeModal();
        showInstallPrompt();
      }
    });
  };

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <HeaderContainer
          onRefresh={handleGenreAlbumMapRefresh}
          onOpenDisconnectModal={handleOpenDisconnectModal}
          toggleMenu={toggleMenu}
        />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <Routes>
          <Route path="*" element={<LoginContainer />} />
          <Route path="/authenticate" element={<LoginContainer />} />
          <Route path="/genre-album-map" element={<GenreGridContainer ref={genreGridRef} />} />
          <Route path="/genre" element={<GenreGridContainer ref={genreGridRef} />} />
          <Route path="/album" element={<GenreGridContainer ref={genreGridRef} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyContainer />} />
          <Route path="/about" element={<AboutContainer />} />
          <Route path="/donate" element={<DonatePageContainer />} />
        </Routes>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <OverlayMenu
          ref={menuRef}
          isOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          onDisconnect={handleOpenDisconnectModal}
          onDisplayInstallModal={handleOpenInstallModal}
          installPromptEvent={installPromptEvent}
        />
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
