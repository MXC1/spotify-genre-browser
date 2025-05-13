import React from "react";
import "./SearchSortContainer.css";

function SearchSortContainer({
  onSearchQueryChange,
  onSortOptionChange,
  placeholderText,
  sortOptions,
  selectedSortOption,
  searchQuery, 
}) {
  return (
    <div className="search-sort-container">
      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder={placeholderText}
          value={searchQuery} 
          onChange={(e) => onSearchQueryChange(e.target.value.toLowerCase())}
          className="search-bar"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-button"
            aria-label="Clear search"
            onClick={() => onSearchQueryChange('')}
            tabIndex={0}
          >
            ×
          </button>
        )}
      </div>
      <select
        value={selectedSortOption}
        onChange={(e) => onSortOptionChange(e.target.value)}
        className="sort-dropdown"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchSortContainer;
