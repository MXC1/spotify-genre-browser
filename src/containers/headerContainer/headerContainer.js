import { useState } from 'react';
import './headerContainer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

function HeaderContainer({ onRefresh, onSearch, onSortChange }) {
    const [searchQuery] = useState('');
    const [sortOption] = useState('number-desc');

    return (
        <div className="header-container">
            <div className="title-container">
                <h1 className="page-title">Your album library</h1>
                <button className="refresh-button" onClick={onRefresh}>
                    <FontAwesomeIcon icon={faSyncAlt} />
                </button>
            </div>
            <div className="search-sort-container">
                <input
                    type="text"
                    placeholder="Search genres, albums, and artists..."
                    onChange={onSearch}
                    className="search-bar"
                />
                <select onChange={onSortChange} className="sort-dropdown">
                    <option value="alphabetical-asc">(A-Z)</option>
                    <option value="alphabetical-desc">(Z-A)</option>
                    <option value="number-asc">Size (Asc)</option>
                    <option value="number-desc">Size (Desc)</option>
                </select>
            </div>
        </div>    )
}

export default HeaderContainer;