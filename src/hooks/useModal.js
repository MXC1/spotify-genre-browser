import { useState } from 'react';
import logMessage from '../utilities/loggingConfig';

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
        logMessage(`Install prompt captured: ${event.type}`);
        event.preventDefault();
        setInstallPromptEvent(event);
    };

    const showInstallPrompt = () => {
        logMessage(`Showing install prompt: ${installPromptEvent.type}`);
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
        showInstallPrompt,
        installPromptEvent // Ensure this is exposed
    };
};

export default useModal;
