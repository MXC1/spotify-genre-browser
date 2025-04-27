import { useState } from 'react';

const useModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalParams, setModalParams] = useState({});
    const [installPromptEvent, setInstallPromptEvent] = useState(null);

    const openModal = (params) => {
        setModalParams(params);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const captureInstallPrompt = (event) => {
        event.preventDefault();
        setInstallPromptEvent(event);
    };

    const showInstallPrompt = () => {
        if (installPromptEvent) {
            installPromptEvent.prompt();
            setInstallPromptEvent(null);
        }
    };

    return {
        isModalOpen,
        modalParams,
        openModal,
        closeModal,
        captureInstallPrompt,
        showInstallPrompt
    };
};

export default useModal;
