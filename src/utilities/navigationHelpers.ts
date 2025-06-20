import { useNavigate, useLocation } from "react-router-dom";
import { getAccessToken } from '../services/spotifyAuth';
import { logger } from "./logger";

export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path: string, params: any = {}) => {
    if (location.pathname !== path || Object.keys(params).length > 0) {
      logger.info('NAV001', 'Navigating to:', { path, params });
      const queryString = new URLSearchParams(params).toString();
      const fullPath = queryString ? `${path}?${queryString}` : path;
      navigate(fullPath);
    }
  }

  const checkAuthAndNavigate = async () => {
    logger.debug('AUTH080','Checking authentication status...', {});
    const accessToken = await getAccessToken();
    if (accessToken) {
      goTo('/genre-album-map');
    } else {
      goTo('/authenticate');
    }
  };

  return { goTo, checkAuthAndNavigate };
};
