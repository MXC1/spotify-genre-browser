import React from "react";
import "./albumContainer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import spotifyLogo from "../../assets/spotify_Primary_Logo_White_RGB.svg";
import { useLocation } from "react-router-dom";
import { useAlbumData } from "../../hooks/useAlbumData";
import { useNavigationHelpers } from "../../utilities/navigationHelpers";

function AlbumContainer() {
    const location = useLocation();
    const { groupedAlbums } = useAlbumData();
    const { goTo } = useNavigationHelpers();

    // Extract params
    const params = new URLSearchParams(location.search);
    const albumId = params.get("albumId");
    const genre = params.get("genre");
    const albumSearch = params.get("albumSearch") || "";
    const genreSearch = params.get("genreSearch") || "";

    // Find album directly in the specified genre
    const album = React.useMemo(() => {
        if (!groupedAlbums || !albumId || !genre) return null;
        const albums = groupedAlbums[genre];
        if (!albums) return null;
        const found = albums.find(a => a.id === albumId);
        return found ? { ...found, _genre: genre } : null;
    }, [groupedAlbums, albumId, genre]);

    if (!album) return <div className="single-album-container">Album not found.</div>;

    return (
        <div className="single-album-container">
            <div className="back-button-container" onClick={() => goTo('/genre', { genre, albumSearch, genreSearch })}>
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
