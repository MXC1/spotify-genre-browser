import './modalContainer.css';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ModalContainer({ isOpen, onClose, title, description, button1Text, button1Action, button2Text, button2Action, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
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
