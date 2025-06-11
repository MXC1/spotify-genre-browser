import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNavigationHelpers } from "../../utilities/navigationHelpers";
import { useAlbumData } from "../../hooks/useAlbumData";
import './genreGridContainer.css';
import SearchSortContainer from '../../components/SearchSortContainer';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import NoAlbums from '../../components/NoAlbums/NoAlbums';

const GenreGridContainer = () => {
  const { groupedAlbums, isLoading, albumProgress, artistProgress } = useAlbumData();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const genreSearch = params.get("genreSearch") || '';
  const [searchQuery, setSearchQuery] = useState(genreSearch || '');
  const [sortOption, setSortOption] = useState('number-desc');
  const [filterString, setFilterString] = useState('');
  const { goTo } = useNavigationHelpers();
  const navigate = useNavigate();

  // Extract all unique strings from groupedAlbums
  const allStrings = React.useMemo(() => {
    if (!groupedAlbums) return [];
    
    const strings = new Set();
    Object.entries(groupedAlbums).forEach(([genre, albums]) => {
      strings.add(genre.toLowerCase());
      albums.forEach(album => {
        strings.add(album.name.toLowerCase());
        album.artists.forEach(artist => strings.add(artist.name.toLowerCase()));
      });
    });
    return Array.from(strings);
  }, [groupedAlbums]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const params = new URLSearchParams(location.search);
    if (query) {
      params.set('genreSearch', query);
    } else {
      params.delete('genreSearch');
    }
    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === '/genre-album-map') {
      setSortOption('number-desc');
    }
  }, [navigate]);

  const filteredGenres = Object.entries(groupedAlbums || {}).filter(([genre, albums]) => {
    const matchesSearch = genre.toLowerCase().includes(searchQuery) ||
      albums.some(album =>
        album.name.toLowerCase().includes(searchQuery) ||
        album.artists.some(artist => artist.name.toLowerCase().includes(searchQuery))
      );
    
    const matchesFilter = !filterString || 
      genre.toLowerCase().includes(filterString.toLowerCase()) ||
      albums.some(album =>
        album.name.toLowerCase().includes(filterString.toLowerCase()) ||
        album.artists.some(artist => artist.name.toLowerCase().includes(filterString.toLowerCase()))
      );

    return matchesSearch && matchesFilter;
  });

  const sortedGenres = filteredGenres.sort((a, b) => {
    if (sortOption === 'alphabetical-asc') {
      return a[0].localeCompare(b[0]);
    } else if (sortOption === 'alphabetical-desc') {
      return b[0].localeCompare(a[0]);
    } else if (sortOption === 'number-asc') {
      return a[1].length - b[1].length;
    } else if (sortOption === 'number-desc') {
      return b[1].length - a[1].length;
    }
    return 0;
  });

  const sortOptions = [
    { value: "alphabetical-asc", label: "A-Z (Genre)" },
    { value: "alphabetical-desc", label: "Z-A (Genre)" },
    { value: "number-asc", label: "Size (Asc)" },
    { value: "number-desc", label: "Size (Desc)" },
  ];

  return (
    <div>
      {isLoading ? (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
          <ProgressBar
            label="Fetching your saved albums..."
            current={albumProgress.current}
            total={albumProgress.total}
          />
          {artistProgress.total > 0 && (
            <ProgressBar
              label="Fetching genre information for artists..."
              current={artistProgress.current}
              total={artistProgress.total}
            />
          )}
        </div>
      ) : (
        Object.keys(groupedAlbums || {}).length === 0 ? (
          <NoAlbums />
        ) : (
          <div>
            <SearchSortContainer
              onSearchQueryChange={handleSearchChange}
              onSortOptionChange={setSortOption}
              onFilterStringChange={setFilterString}
              selectedSortOption={sortOption}
              placeholderText="Search genres, albums, and artists..."
              sortOptions={sortOptions}
              searchQuery={searchQuery}
              filterStrings={allStrings}
            />
            <div className="genre-grid">
              {sortedGenres.map(([genre, albums], index) => (
                <GenreCard
                  key={genre}
                  genre={genre}
                  albums={albums}
                  index={index}
                  onClick={() => goTo(`/genre`, { genre, genreSearch: searchQuery })}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

function GenreCard({ genre, albums, onClick }) {
  return (
    <div className="genre-section" onClick={onClick}>
      <div className="album-preview">
        {albums.slice(0, albums.length < 4 ? 1 : 4).map((album, index) => (
          <img
            key={album.id}
            src={album.images[1].url}
            alt={album.name}
            className={`album-preview-image ${albums.length < 4 ? 'single-album' : ''}`}
          />
        ))}
      </div>
      <h2 className="genre-title">{genre}</h2>
    </div>
  );
}

export default GenreGridContainer;