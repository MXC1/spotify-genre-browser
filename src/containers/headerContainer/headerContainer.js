import React, { useState, useEffect, useRef } from 'react';
import './headerContainer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faBars, faHouse, faBackward } from '@fortawesome/free-solid-svg-icons';
import OverlayMenu from './overlayMenu/overlayMenu';
import { useLocation, useNavigate } from "react-router-dom";

function HeaderContainer({ onRefresh, onSearch, onSortChange, onOpenDisconnectModal }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const menuRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
            event.stopImmediatePropagation();
        }
    };

    useEffect(() => {
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside, true);
        } else {
            document.removeEventListener('mousedown', handleClickOutside, true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, [isMenuOpen]);

    const handleOpenDisconnectModal = () => {
        setIsMenuOpen(false);
        onOpenDisconnectModal();
    };

    const navigate = useNavigate();

    const handleNavigation = (path) => {
      navigate(path);
    };

    if (location.pathname === '/privacy-policy') {
        return (
            <div className="header-container">
                <OverlayMenu ref={menuRef} isOpen={isMenuOpen} toggleMenu={toggleMenu} onDisconnect={handleOpenDisconnectModal} />
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">Privacy policy</h1>
                    <button className="home-button" onClick={() => handleNavigation("/genre-album-map")}>
                        <FontAwesomeIcon icon={faHouse} />
                    </button>
                </div>
            </div>
        );
    }
    else if (location.pathname === '/genre-album-map') {
        return (
            <div className="header-container">
                <OverlayMenu ref={menuRef} isOpen={isMenuOpen} toggleMenu={toggleMenu} onDisconnect={handleOpenDisconnectModal} />
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
        );
    }
    else
        return null;
}

export default HeaderContainer;