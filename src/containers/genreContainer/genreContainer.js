import { useState, useEffect } from "react";
import SearchSortContainer from "../../components/SearchSortContainer";
import "./genreContainer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigationHelpers } from "../../utilities/navigationHelpers";
import { useLocation } from "react-router-dom";
import { getCachedEntry } from "../../utilities/indexedDb";
import { logger } from "../../utilities/logger";

function GenreContainer() {
    const location = useLocation();
    const { goTo } = useNavigationHelpers();

    const params = new URLSearchParams(location.search);
    const genre = params.get("genre");
    const genreSearch = params.get("genreSearch") || "";
    const albumSearch = params.get("albumSearch") || "";

    const [albums, setAlbums] = useState([]);
    const [searchQuery, setSearchQuery] = useState(albumSearch || "");
    const [sortOption, setSortOption] = useState("alphabetical-asc-artist");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAlbums() {
            setLoading(true);
            try {
                const groupedAlbums = await getCachedEntry('data', 'grouped_albums');
                let genreAlbums = [];
                if (groupedAlbums && groupedAlbums[genre]) {
                    genreAlbums = groupedAlbums[genre];
                }
                setAlbums(genreAlbums);
            } catch (e) {
                logger.error('GENRE001', 'Error fetching genre albums', { genre, error: e });
            }
            setLoading(false);
        }
        if (genre) fetchAlbums();
    }, [genre]);

    const sortOptions = [
        { value: "alphabetical-asc-album", label: "A-Z (Album)" },
        { value: "alphabetical-desc-album", label: "Z-A (Album)" },
        { value: "alphabetical-asc-artist", label: "A-Z (Artist)" },
        { value: "alphabetical-desc-artist", label: "Z-A (Artist)" },
    ];

    const filteredAlbums = albums.filter(
        (album) =>
            album.name.toLowerCase().includes(searchQuery) ||
            album.artists.some((artist) =>
                artist.name.toLowerCase().includes(searchQuery)
            )
    );

    const sortedAlbums = filteredAlbums.sort((a, b) => {
        if (sortOption === "alphabetical-asc-album") {
            return a.name.localeCompare(b.name);
        } else if (sortOption === "alphabetical-desc-album") {
            return b.name.localeCompare(a.name);
        } else if (sortOption === "alphabetical-asc-artist") {
            return a.artists[0].name.localeCompare(b.artists[0].name);
        } else if (sortOption === "alphabetical-desc-artist") {
            return b.artists[0].name.localeCompare(a.artists[0].name);
        }
        return 0;
    });

    if (loading) return <div className="genre-container">Loading...</div>;
    if (!genre || !albums.length) return <div className="genre-container">No albums found for this genre.</div>;

    return (
        <div className="genre-container">
            <SearchSortContainer
                onSearchQueryChange={setSearchQuery}
                onSortOptionChange={setSortOption}
                selectedSortOption={sortOption}
                placeholderText="Search albums or artists..."
                sortOptions={sortOptions}
                searchQuery={searchQuery} 
            />
            <div className="big-genre-title-container" onClick={() => goTo('/genre-album-map', { genreSearch })}>
                <button className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className="big-genre-title">{genre}</h1>
            </div>
            <hr className="horizontal-line" onClick={() => goTo('/genre-album-map', { genreSearch })} />
            <div className="album-grid">
                {sortedAlbums.map((album) => (
                    <div
                        key={album.id}
                        className="album-item"
                        onClick={() => goTo(`/album`, { albumId: album.id, genre: genre, genreSearch, albumSearch: searchQuery })}
                    >
                        <div className="album-link">
                            <img
                                src={album.images[1].url}
                                alt={album.name}
                                className="album-image"
                            />
                            <div className="album-info">
                                <span className="album-name">{album.name}</span>
                                <span className="album-artist">{album.artists[0].name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GenreContainer;
