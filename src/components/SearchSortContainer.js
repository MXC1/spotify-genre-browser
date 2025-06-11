import React, { useState } from "react";
import "./SearchSortContainer.css";
import SortAndFilterModal from "./SortAndFilterModal/SortAndFilterModal";
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function SearchSortContainer({
  onSearchQueryChange,
  onSortOptionChange,
  onFilterStringChange,
  placeholderText,
  sortOptions,
  selectedSortOption,
  searchQuery, 
  filterStrings = [], 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
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
        <button
          className="sort-filter-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Open sort and filter options"
        >
          <FontAwesomeIcon icon={faSliders} size="lg"/>
        </button>
      </div>
      <SortAndFilterModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sortOptions={sortOptions}
        selectedSortOption={selectedSortOption}
        onSortOptionChange={onSortOptionChange}
        onFilterStringChange={onFilterStringChange}
        filterStrings={filterStrings}
      />
    </>
  );
}

export default SearchSortContainer;
