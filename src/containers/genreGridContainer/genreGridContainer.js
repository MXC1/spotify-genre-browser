import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import { setCachedEntry, getCachedEntry } from "../../utilities/indexedDB";
import spotifyApi from "../../services/Spotify";
import logMessage from "../../utilities/loggingConfig";

const GenreGridContainer = forwardRef((props, genreGridRef) => {
  const [loadingMessage, setLoadingMessage] = useState('');
  const [groupedAlbums, setGroupedAlbums] = useState({});

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAllSavedAlbums = useCallback(async () => {
    try {
      setLoadingMessage('Fetching saved albums...');
      let allAlbums = [];
      let allAlbumIds = [];
      let offset = 0;
      const limit = 50; // Maximum limit per request

      while (true) {
        logMessage(`Requesting saved albums with offset: ${offset}, limit: ${limit}`);
        setLoadingMessage(`Requesting saved albums (${offset} / ?)...`);
        const response = await spotifyApi.getMySavedAlbums({ limit, offset });
        const albums = response.items.map(item => item.album);
        allAlbums = [...allAlbums, ...albums];

        // Collect all album IDs
        allAlbumIds = [...allAlbumIds, ...albums.map(album => album.id)];

        if (response.items.length < limit) {
          break;
        }
        offset += limit;

        // Add a delay to avoid hitting the rate limit
        await delay(1000); // 1 second delay between requests
      }

      logMessage(`Finished fetching album IDs: ${JSON.stringify(allAlbumIds)}`);
      setLoadingMessage('Grouping albums by artist genre...');
      return allAlbums;
    } catch (error) {
      logMessage(`Error fetching saved albums: ${error}`);
      setLoadingMessage('Error fetching albums.');
    }
  }, []);

  const groupAlbumsByArtistGenre = useCallback(async (albums) => {
    const genreAlbumMap = {};
    const artistIds = albums.map(album => album.artists[0].id);
    const uniqueArtistIds = [...new Set(artistIds)];

    for (let i = 0; i < uniqueArtistIds.length; i += 50) {
      const batch = uniqueArtistIds.slice(i, i + 50);
      logMessage(`Requesting artist details (${i} / ${uniqueArtistIds.length})`);
      setLoadingMessage(`Requesting artist details (${i} / ${uniqueArtistIds.length})...`);
      const artists = await spotifyApi.getArtists(batch);

      artists.artists.forEach(artist => {
        const genres = artist.genres;
        if (genres.length === 0) {
          // If no genres are associated, add to 'Unknown Genre' category
          if (!genreAlbumMap['[Unknown Genre]']) {
            genreAlbumMap['[Unknown Genre]'] = [];
          }
          genreAlbumMap['[Unknown Genre]'].push(...albums.filter(album => album.artists[0].id === artist.id));
        } else {
          genres.forEach(genre => {
            if (!genreAlbumMap[genre]) {
              genreAlbumMap[genre] = [];
            }
            genreAlbumMap[genre].push(...albums.filter(album => album.artists[0].id === artist.id));
          });
        }
      });

      // Add a delay to avoid hitting the rate limit
      await delay(1000); // 1 second delay between requests
    }

    const combinedGenres = {};

    Object.keys(genreAlbumMap).forEach((genre) => {
      const albums = genreAlbumMap[genre];
      const key = JSON.stringify(albums.map(album => album.id).sort());

      if (!combinedGenres[key]) {
        combinedGenres[key] = { genres: [], albums: albums };
      }
      combinedGenres[key].genres.push(genre);
    });

    const grouped = {};
    Object.values(combinedGenres).forEach(({ genres, albums }) => {
      const genreKey = genres.join(', ');
      grouped[genreKey] = albums;
    });

    setGroupedAlbums(grouped);
    setLoadingMessage('');

    // Log the array of genre strings and their associated albums
    const genreAlbumArray = Object.entries(grouped).map(([genre, albums]) => {
      const albumIds = albums.map(album => album.id);
      console.log(`Genre: ${genre}, Albums: ${albumIds}`);
      return {
        genre,
        albums: albumIds
      };
    });
    return (grouped);
  }, []);

  // Allow these methods to be called from the parent element
  useImperativeHandle(genreGridRef, () => ({
    updateGenreAlbumMap: async () => {
      logMessage(`Updating genre album map from scratch...`);
      const allAlbums = await fetchAllSavedAlbums();

      const grouped = await groupAlbumsByArtistGenre(allAlbums);
      setGroupedAlbums(grouped);
      await setCachedEntry('data', grouped, 'groupedAlbums');
    },
    getCachedGenreAlbumMap: async () => {
      logMessage(`Fetching genre album map from cache...`);
      setLoadingMessage(`Loading saved albums...`);
      const cachedGroupedAlbums = await getCachedEntry('data', 'groupedAlbums');
      setGroupedAlbums(cachedGroupedAlbums);
      setLoadingMessage('');
    }
  }))

  const filteredGenres = Object.entries(groupedAlbums || {}).filter(([genre, albums]) =>
    genre.toLowerCase().includes(props.searchQuery) ||
    albums.some(album =>
      album.name.toLowerCase().includes(props.searchQuery) ||
      album.artists.some(artist => artist.name.toLowerCase().includes(props.searchQuery))
    )
  );

  const sortedGenres = filteredGenres.sort((a, b) => {
    if (props.sortOption === 'alphabetical-asc') {
      return a[0].localeCompare(b[0]);
    } else if (props.sortOption === 'alphabetical-desc') {
      return b[0].localeCompare(a[0]);
    } else if (props.sortOption === 'number-asc') {
      return a[1].length - b[1].length;
    } else if (props.sortOption === 'number-desc') {
      return b[1].length - a[1].length;
    }
    return 0;
  });

  return (
    <div>
      {loadingMessage ? (
        <p className="loading-message">{loadingMessage}</p>
      ) : sortedGenres.length === 0 ? (
        <p className="no-albums">No albums found</p>
      ) : (
        <div className="genre-grid">
          {sortedGenres.map(([genre, albums], index) => (
            <GenreCard key={genre} genre={genre} albums={albums} index={index} />
          ))}
        </div>
      )}
    </div>
  );
});

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