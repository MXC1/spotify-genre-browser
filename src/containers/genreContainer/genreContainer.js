import React from 'react';
import './genreContainer.css';

function GenreContainer({ genre, albums, onBack, searchQuery, sortOption }) {
  const filteredAlbums = albums.filter(
    (album) =>
      album.name.toLowerCase().includes(searchQuery) ||
      album.artists.some((artist) => artist.name.toLowerCase().includes(searchQuery))
  );

  const sortedAlbums = filteredAlbums.sort((a, b) => {
    if (sortOption === 'alphabetical-asc') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'alphabetical-desc') {
      return b.name.localeCompare(a.name);
    }
    return 0; 
  });

  return (
    <div className="genre-container">
      <h1 className="big-genre-title" onClick={onBack}>{genre}</h1>
      <hr className="horizontal-line" onClick={onBack} />
      <div className="album-grid">
        {sortedAlbums.map((album) => (
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
