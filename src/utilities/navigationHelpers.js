import { useNavigate } from "react-router-dom";
import { logMessage } from './loggingConfig';

export const useNavigationHelpers = () => {
  const navigate = useNavigate();

  const goTo = (path) => {
      logMessage(`Navigating to ${path}`);
      navigate(path, { replace: true });
    }
  const goBack = () => navigate(-1);

  return { goTo, goBack };
};
