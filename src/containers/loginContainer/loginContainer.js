import { redirectToAuthorizationUrl } from "../../services/spotifyAuth";

function LoginContainer() {

    return (
        <div className="login-container">
          <a onClick={() => redirectToAuthorizationUrl()} className="login-button">Login with Spotify</a>
        </div>
    )
}

export default LoginContainer;