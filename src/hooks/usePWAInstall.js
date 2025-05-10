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
            try {
                installPromptEvent.prompt();
                installPromptEvent.userChoice
                    .then((choiceResult) => {
                        if (choiceResult.outcome === 'dismissed') {
                            logMessage('User dismissed the install prompt');
                        } else if (choiceResult.outcome === 'accepted') {
                            logMessage('User accepted the install prompt');
                        }
                    })
                    .catch((error) => {
                        logMessage(`PWA nstallation failed: ${error.message}`);
                    });
            } catch (error) {
                logMessage(`PWA installation failed: ${error.message}`);
            }
            setInstallPromptEvent(null);
        }
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            captureInstallPrompt(event);
        };

        logMessage('Adding beforeinstallprompt event listener');

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