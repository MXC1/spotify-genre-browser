import React from 'react';
import './overlayMenu.css';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function OverlayMenu({ isOpen, toggleMenu, onDisconnect, onDisplayPrivacyPolicy }) {

    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        toggleMenu(); // Close the menu after navigation
    };

    return (
        <div className={`overlay-menu ${isOpen ? 'open' : ''}`}>
            <button className="close-menu-button" onClick={toggleMenu}>
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <ul className="menu-items">
                <li className="menu-item">
                    <button className="menu-item-button" onClick={() => handleNavigation("/genre-album-map")}>
                        Home
                    </button>
                </li>
                <li className="menu-item">
                    <button className="menu-item-button" onClick={() => handleNavigation("/privacy-policy")}>
                        Privacy Policy
                    </button>
                </li>
                <li className="menu-item">
                    <button className="menu-item-button" onClick={onDisconnect}>
                        Disconnect Spotify account
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default OverlayMenu;
