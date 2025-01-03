import { getLoginUrl } from "../../services/Spotify";

function LoginContainer() {

    return (
        <div className="login-container">
          <a href={getLoginUrl()} className="login-button">Login with Spotify</a>
        </div>
    )
}

export default LoginContainer;