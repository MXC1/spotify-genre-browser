import { useState, useEffect } from 'react';
import logMessage from '../utilities/loggingConfig';

const usePWAInstall = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);

    const captureInstallPrompt = (event) => {
        logMessage(`Install prompt captured: ${event.type}`);
        event.preventDefault();
        setInstallPromptEvent(event);
    };

    const showInstallPrompt = () => {
        if (installPromptEvent) {
            logMessage(`Showing install prompt: ${installPromptEvent.type}`);
            installPromptEvent.prompt();
            setInstallPromptEvent(null);
        }
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            captureInstallPrompt(event);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    return {
        installPromptEvent,
        captureInstallPrompt,
        showInstallPrompt
    };
};

export default usePWAInstall;