import React, { useState } from "react";
import SearchSortContainer from "../../components/SearchSortContainer";
import "./genreContainer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function GenreContainer({ genre, albums, onBack }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("alphabetical-asc-artist");

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

    return (
        <div className="genre-container">
            <SearchSortContainer
                onSearchQueryChange={setSearchQuery}
                onSortOptionChange={setSortOption}
                selectedSortOption={sortOption}
                placeholderText="Search albums or artists..."
                sortOptions={sortOptions}
            />
            <div className="big-genre-title-container" onClick={onBack}>
                <button className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className="big-genre-title">{genre}</h1>
            </div>
            <hr className="horizontal-line" onClick={onBack} />
            <div className="album-grid">
                {sortedAlbums.map((album) => (
                    <div key={album.id} className="album-item">
                        <a
                            href={album.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="album-link"
                        >
                            <img
                                src={album.images[1].url}
                                alt={album.name}
                                className="album-image"
                            />
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
