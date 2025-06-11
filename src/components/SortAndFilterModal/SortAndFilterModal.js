import React from 'react';
import ModalContainer from '../../containers/modalContainer/modalContainer';
import './SortAndFilterModal.css';

function SortAndFilterModal({ isOpen, onClose, sortOptions, selectedSortOption, onSortOptionChange }) {
    const handleSortChange = (event) => {
        onSortOptionChange(event.target.value);
    };

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            title="Sort & Filter"
            description=""
            button1Text="Apply"
            button1Action={onClose}
        >
            <div className="sort-filter-content">
                <hr />
                <div className="sort-options">
                    <h3>Sort by</h3>
                    {sortOptions && sortOptions.map((option) => (
                        <label key={option.value} className="sort-option">
                            <input
                                type="radio"
                                name="sort"
                                value={option.value}
                                checked={selectedSortOption === option.value}
                                onChange={handleSortChange}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </ModalContainer>
    );
}

export default SortAndFilterModal;