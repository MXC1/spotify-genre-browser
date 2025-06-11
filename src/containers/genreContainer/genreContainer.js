import React from "react";
import { useState } from "react";
import SearchSortContainer from "../../components/SearchSortContainer";
import "./genreContainer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigationHelpers } from "../../utilities/navigationHelpers";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlbumData } from "../../hooks/useAlbumData";

function GenreContainer() {
    const location = useLocation();
    const { goTo } = useNavigationHelpers();
    const { groupedAlbums } = useAlbumData();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const genre = params.get("genre");
    const genreSearch = params.get("genreSearch") || "";
    const albumSearch = params.get("albumSearch") || "";

    const [searchQuery, setSearchQuery] = useState(albumSearch || "");
    const [sortOption, setSortOption] = useState("alphabetical-asc-artist");
    const [filterString, setFilterString] = useState("");

    const albums = groupedAlbums?.[genre] || [];

    // Extract all unique strings from albums
    const allStrings = React.useMemo(() => {
        if (!albums) return [];
        
        const strings = new Set();
        albums.forEach(album => {
            strings.add(album.name.toLowerCase());
            album.artists.forEach(artist => strings.add(artist.name.toLowerCase()));
        });
        return Array.from(strings);
    }, [albums]);

    const sortOptions = [
        { value: "alphabetical-asc-album", label: "A-Z (Album)" },
        { value: "alphabetical-desc-album", label: "Z-A (Album)" },
        { value: "alphabetical-asc-artist", label: "A-Z (Artist)" },
        { value: "alphabetical-desc-artist", label: "Z-A (Artist)" },
    ];

    const filteredAlbums = albums.filter(
        (album) => {
            const matchesSearch = album.name.toLowerCase().includes(searchQuery) ||
                album.artists.some((artist) =>
                    artist.name.toLowerCase().includes(searchQuery)
                );
            
            const matchesFilter = !filterString ||
                album.name.toLowerCase().includes(filterString.toLowerCase()) ||
                album.artists.some((artist) =>
                    artist.name.toLowerCase().includes(filterString.toLowerCase())
                );

            return matchesSearch && matchesFilter;
        }
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

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        const params = new URLSearchParams(location.search);
        if (query) {
            params.set('albumSearch', query);
        } else {
            params.delete('albumSearch');
        }
        navigate({ search: params.toString() });
    };

    if (!genre || !albums.length) return <div className="genre-container">No albums found for this genre.</div>;

    return (
        <div className="genre-container">
            <SearchSortContainer
                onSearchQueryChange={handleSearchChange}
                onSortOptionChange={setSortOption}
                onFilterStringChange={setFilterString}
                selectedSortOption={sortOption}
                placeholderText="Search albums or artists..."
                sortOptions={sortOptions}
                searchQuery={searchQuery}
                filterStrings={allStrings}
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
