import React, { useState } from 'react';
import './headerContainer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import OverlayMenu from './overlayMenu/overlayMenu';
import ModalContainer from '../modalContainer/modalContainer';
import { clearAllData } from '../../utilities/indexedDB';

function HeaderContainer({ onRefresh, onSearch, onSortChange }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const openDisconnectModal = () => {
        setIsMenuOpen(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDisconnect = async () => {
        await clearAllData();
        closeModal();
        window.location.reload();
    };

    return (
        <div className="header-container">
            <OverlayMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} onDisconnect={openDisconnectModal} />
            <ModalContainer
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Disconnect Spotify account"
                description="Disconnecting your Spotify account will delete your data. To use the application again, you can just press 'Login to Spotify'."
                button1Text="Cancel"
                button1Action={closeModal}
                button2Text="Disconnect"
                button2Action={handleDisconnect}
            />
            <div className="title-container">
                <button className="menu-button" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
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
                <select onChange={onSortChange} className="sort-dropdown" defaultValue="number-desc">
                    <option value="alphabetical-asc">(A-Z)</option>
                    <option value="alphabetical-desc">(Z-A)</option>
                    <option value="number-asc">Size (Asc)</option>
                    <option value="number-desc">Size (Desc)</option>
                </select>
            </div>
        </div>
    )
}

export default HeaderContainer;