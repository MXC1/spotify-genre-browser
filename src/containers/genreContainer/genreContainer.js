import React from 'react';
import './genreContainer.css';

function GenreContainer({ genre, albums }) {
    return (
        <div className="genre-container">
            <h1 className="big-genre-title">{genre}</h1>
            <hr className="horizontal-line" />
            <div className="album-grid">
                {albums.map((album) => (
                    <div key={album.id} className="album-item">
                        <a href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="album-link">
                            <img src={album.images[0].url} alt={album.name} className="album-image" />
                            <div className="album-info">
                                <span className="album-name">{album.name}</span>
                                <span className="album-artist">{album.artists[0].name}</span>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GenreContainer;
