import { useState } from 'react';

const useModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalParams, setModalParams] = useState({});

    const openModal = (params) => {
        setModalParams(params);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return {
        isModalOpen,
        modalParams,
        openModal,
        closeModal
    };
};

export default useModal;
