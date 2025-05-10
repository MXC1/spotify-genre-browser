import { useState, useEffect } from 'react';
import logMessage from '../utilities/loggingConfig';

const usePWAInstall = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false); // New state

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

    useEffect(() => {
        const checkStandaloneMode = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
            setIsStandalone(isStandaloneMode);
            logMessage(`App is running in ${isStandaloneMode ? 'standalone' : 'browser'} mode`);
        };

        checkStandaloneMode();
    }, []);

    return {
        installPromptEvent,
        captureInstallPrompt,
        showInstallPrompt,
        isStandalone 
    };
};

export default usePWAInstall;