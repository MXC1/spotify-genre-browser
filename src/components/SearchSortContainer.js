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
      <input
        type="text"
        placeholder={placeholderText}
        value={searchQuery} 
        onChange={(e) => onSearchQueryChange(e.target.value.toLowerCase())}
        className="search-bar"
      />
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
