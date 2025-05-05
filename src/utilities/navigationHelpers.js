import { useNavigate, useLocation } from "react-router-dom";
import { logMessage } from './loggingConfig';
import { getAccessToken } from '../services/spotifyAuth';

export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    if (location.pathname !== path) {
      logMessage(`Navigating to ${path}`);
      navigate(path, { replace: true });
    }
  }

  const goBack = () => {
    // navigate(-1)

    logMessage(`Navigated back to ${location.pathname}`);
  };

  const checkAuthAndNavigate = async () => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      logMessage('User is authenticated. Redirecting to /genre-album-map.');
      navigate('/genre-album-map', { replace: true });
    } else {
      logMessage('User is not authenticated. Redirecting to /authenticate.');
      navigate('/authenticate', { replace: true });
    }
  };

  return { goTo, goBack, checkAuthAndNavigate };
};
