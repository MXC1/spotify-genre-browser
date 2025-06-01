import './loginContainer.css';
import { useEffect } from "react";
import { setAuthUrl } from "../../services/spotifyAuth";
import { getCachedEntry } from "../../utilities/indexedDb";
import { useNavigationHelpers } from "../../utilities/navigationHelpers";

function LoginContainer() {

  const { goTo } = useNavigationHelpers();

  useEffect(() => {
    window.redirectToSpotifyAuth = function () {
      setAuthUrl();
    }
  }, []);

  useEffect(() => {
    async function checkAuthAndRedirect() {
      const token = await getCachedEntry('auth', 'access_token');
      if (token) {
        goTo('/genre-album-map');
      }
    }

    checkAuthAndRedirect();
  }, []);

  return (
    <div className="login-container">
      <button 
        onClick={() => window.redirectToSpotifyAuth()} 
        className="login-button"
      >
        Login with Spotify
      </button>
    </div>
  )
}

export default LoginContainer;