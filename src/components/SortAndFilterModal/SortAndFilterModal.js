import React from 'react';
import ModalContainer from '../../containers/modalContainer/modalContainer';
import './SortAndFilterModal.css';

function SortAndFilterModal({ isOpen, onClose, sortOptions, selectedSortOption, onSortOptionChange, onFilterStringChange }) {
    const strings = ["punk", "test", "dub", "burial", "freddy", "ambient", "hip"];
    const [selectedTag, setSelectedTag] = React.useState(null);

    const handleSortChange = (event) => {
        onSortOptionChange(event.target.value);
    };

    const handleTagClick = (tag) => {
        const newTag = selectedTag === tag ? null : tag;
        setSelectedTag(newTag);
        onFilterStringChange?.(newTag || '');
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
                <div className="word-cloud">
                    {strings.map((tag) => (
                        <button
                            key={tag}
                            className={`tag ${selectedTag === tag ? 'selected' : ''}`}
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
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