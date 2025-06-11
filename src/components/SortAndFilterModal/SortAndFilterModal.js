import React from 'react';
import ModalContainer from '../../containers/modalContainer/modalContainer';
import './SortAndFilterModal.css';

function SortAndFilterModal({ isOpen, onClose }) {
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
                {/* Content will be added later */}
            </div>
        </ModalContainer>
    );
}

export default SortAndFilterModal;