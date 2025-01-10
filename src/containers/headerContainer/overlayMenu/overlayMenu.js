import React from 'react';
import './overlayMenu.css';

function OverlayMenu({ isOpen, toggleMenu, onDisconnect }) {
    return (
        <div className={`overlay-menu ${isOpen ? 'open' : ''}`}>
            <button className="close-menu-button" onClick={toggleMenu}>X</button>
            <ul className="menu-items">
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
