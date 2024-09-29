import { useState } from "react";

function GenreGridContainer({ sortedGenres}) {
    return (
        <div className="genre-grid">
        {sortedGenres.map(([genre, albums], index) => (
          <GenreCard key={genre} genre={genre} albums={albums} index={index} />
        ))}
      </div>
    );
}

function GenreCard({ genre, albums, index }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState(null);
  
    const handleClick = () => {
      setIsCollapsed(!isCollapsed);
      setExpandedIndex(isCollapsed ? index : null);
    };
  
    return (
      <div className={`genre-section ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={handleClick} >
        <h2 className="genre-title">
          {genre}
        </h2>
        {isCollapsed ? (
          <div className="album-preview">
            {albums.slice(0, albums.length).map((album) => (
              <img key={album.id} src={album.images[0].url} alt={album.name} className="album-preview-image" />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    );
  }

export default GenreGridContainer;