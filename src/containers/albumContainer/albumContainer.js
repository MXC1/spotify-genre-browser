import React from "react";
import "./albumContainer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import spotifyLogo from "../../assets/spotify_Primary_Logo_White_RGB.svg";

function AlbumContainer({ album, onBack }) {
    return (
        <div className="single-album-container">
            <div className="back-button-container" onClick={onBack}>
                <button className="genre-back-button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
            </div>
            <div className="single-album-details">
                <img
                    src={album.images[0]?.url}
                    alt={album.name}
                    className="single-album-image"
                />
                <div className="single-album-info">
                    <h1 className="single-album-title">{album.name}</h1>
                    <p className="single-album-artists">
                        {album.artists.map((artist) => artist.name).join(", ")}
                    </p>
                    <a
                        href={album.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spotify-button"
                    >
                        <img
                            src={spotifyLogo}
                            alt="Spotify Logo"
                            className="spotify-logo"
                        />
                        Open in Spotify
                    </a>
                </div>
            </div>
            <hr className="end-of-album-rule"/>
        </div>
    );
}

export default AlbumContainer;
