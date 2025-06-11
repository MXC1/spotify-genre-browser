import './modalContainer.css';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useCallback } from 'react';

function ModalContainer({ isOpen, onClose, title, description, button1Text, button1Action, button2Text, button2Action, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOverlayClick = useCallback((e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <button className="close-modal-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-description">{description}</p>
                {children}
                <div className="modal-buttons">
                    <button className="modal-button" onClick={button1Action}>{button1Text}</button>
                    {button2Text && <button className="modal-button" onClick={button2Action}>{button2Text}</button>}
                </div>
            </div>
        </div>
    );
}

export default ModalContainer;
