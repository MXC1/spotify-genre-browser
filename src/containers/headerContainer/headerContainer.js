import React, { useState, useEffect, useRef } from 'react';
import './headerContainer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faBars, faHouse, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router-dom";
import { useNavigationHelpers } from '../../utilities/navigationHelpers';

function HeaderContainer({ onRefresh, onOpenDisconnectModal, toggleMenu }) {
    const location = useLocation();
    const { goTo, checkAuthAndNavigate } = useNavigationHelpers();

    const handleOpenDisconnectModal = () => {
        onOpenDisconnectModal();
    };

    if (location.pathname === '/privacy-policy') {
        return (
            <div className="header-container">
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">Privacy policy</h1>
                    <button className="home-button" onClick={async () => await checkAuthAndNavigate()}>
                        <FontAwesomeIcon icon={faHouse} />
                    </button>
                </div>
            </div>
        );
    }
    else if (location.pathname === '/genre-album-map') {
        return (
            <div className="header-container">
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">Your album library</h1>
                    <button className="refresh-button" onClick={onRefresh}>
                        <FontAwesomeIcon icon={faSyncAlt} />
                    </button>
                </div>
            </div>
        );
    }
    else if (location.pathname.startsWith('/genre') || location.pathname.startsWith('/album')) {
        return (
            <div className="header-container">
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">Your album library</h1>
                    <button className="home-button" onClick={async () => await checkAuthAndNavigate()}>
                        <FontAwesomeIcon icon={faHouse} />
                    </button>
                </div>
            </div>
        );
    }
    else if (location.pathname === '/about') {
        return (
            <div className="header-container">
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">About</h1>
                    <button className="home-button" onClick={() => checkAuthAndNavigate()}>
                        <FontAwesomeIcon icon={faHouse} />
                    </button>
                </div>
            </div>
        );
    }
    else if (location.pathname === '/donate') {
        return (
            <div className="header-container">
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">Donate</h1>
                    <button className="home-button" onClick={() => checkAuthAndNavigate()}>
                        <FontAwesomeIcon icon={faHouse} />
                    </button>
                </div>
            </div>
        );
    }
    else if (location.pathname === '/feedback') {
        return (
            <div className="header-container">
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">Give Feedback</h1>
                    <button className="home-button" onClick={() => checkAuthAndNavigate()}>
                        <FontAwesomeIcon icon={faHouse} />
                    </button>
                </div>
            </div>
        );
    }
    else if (location.pathname) {
        return (
            <div className="header-container">
                <div className="title-container">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <h1 className="page-title">Authentication</h1>
                    <button className="refresh-button" onClick={() => goTo("/about")}>
                        <FontAwesomeIcon icon={faCircleInfo} />
                    </button>
                </div>
            </div>
        );
    }
    else
        return null;
}

export default HeaderContainer;