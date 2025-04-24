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
    const token = getCachedEntry('auth', 'access_token');
    if (token) {
      goTo('/genre-album-map');
    }
  }, []);

  return (
    <div className="login-container">
      <a onClick={() => window.redirectToSpotifyAuth()} className="login-button">Login with Spotify</a>
    </div>
  )
}

export default LoginContainer;