import { useEffect } from "react";
import { setAuthUrl } from "../../services/spotifyAuth";

function LoginContainer() {

  useEffect(() => {
    window.redirectToSpotifyAuth = function () {
      setAuthUrl();
    }
  }, []);

  return (
    <div className="login-container">
      <a onClick={() => window.redirectToSpotifyAuth()} className="login-button">Login with Spotify</a>
    </div>
  )
}

export default LoginContainer;