import React, { forwardRef, useEffect, useState } from 'react';
import './overlayMenu.css';
import { useNavigationHelpers } from '../../utilities/navigationHelpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const OverlayMenu = forwardRef(({ isOpen, toggleMenu, onDisconnect, onDisplayInstallModal, installPromptEvent }, ref) => {
    const { goTo } = useNavigationHelpers();

    const handleNavigation = (path) => {
        toggleMenu();
        goTo(path);
    };

    return (
        <div>
            <div className={`overlay-background ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
            </div>
            <div ref={ref} className={`overlay-menu ${isOpen ? 'open' : ''}`}>
                <button className="close-menu-button" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <ul className="menu-items">
                    <li className="menu-item">
                        <button className="menu-item-button" onClick={() => handleNavigation("/genre-album-map")}>
                            Home
                        </button>
                    </li>
                    <hr className="menu-divider" />
                    <li className="menu-item">
                        <button className="menu-item-button" onClick={() => handleNavigation("/about")}>
                            About
                        </button>
                    </li>
                    <li className="menu-item">
                        <button className="menu-item-button" onClick={() => handleNavigation("/privacy-policy")}>
                            Privacy Policy
                        </button>
                    </li>
                    <hr className="menu-divider" />
                    {installPromptEvent && (
                        <li className="menu-item">
                            <button className="menu-item-button" onClick={onDisplayInstallModal}>Install the app</button>
                        </li>
                    )}
                    <li className="menu-item">
                        <button className="menu-item-button" onClick={onDisconnect}>
                            Disconnect Spotify account
                        </button>
                    </li>
                    <hr className="menu-divider" />
                    <li className="menu-item">
                        <button className="menu-item-button" onClick={() => handleNavigation("/feedback")}>
                            Give Feedback
                        </button>
                    </li>
                    <li className="menu-item">
                        <button className="menu-item-button" onClick={() => handleNavigation("/donate")}>
                            Donate
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
});

export default OverlayMenu;
