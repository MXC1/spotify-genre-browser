import { useNavigate, useLocation } from "react-router-dom";
import { logMessage } from './loggingConfig';

export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    if (location.pathname !== path) {
      logMessage(`Navigating to ${path}`);
      navigate(path, { replace: true });
    }
  }
  const goBack = () => navigate(-1);

  return { goTo, goBack };
};
