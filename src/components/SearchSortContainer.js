import React from "react";
import "./SearchSortContainer.css";

function SearchSortContainer({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  disableSizeOptions,
  placeholderText,
}) {
  return (
    <div className="search-sort-container">
      <input
        type="text"
        placeholder={placeholderText}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        className="search-bar"
      />
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="sort-dropdown"
      >
        <option value="alphabetical-asc">(A-Z)</option>
        <option value="alphabetical-desc">(Z-A)</option>
        {!disableSizeOptions && (
          <>
            <option value="number-asc">Size (Asc)</option>
            <option value="number-desc">Size (Desc)</option>
          </>
        )}
      </select>
    </div>
  );
}

export default SearchSortContainer;
