import { useState, useEffect } from 'react';
import logger from '../utilities/logger';

const usePWAInstall = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false); 

    const captureInstallPrompt = (event) => {
        logger.info('Install prompt captured', { event }, 'PWA002');
        event.preventDefault();
        setInstallPromptEvent(event);
    };

    const showInstallPrompt = () => {
        if (installPromptEvent) {
            logger.info('Showing install prompt', { installPromptEvent }, 'PWA003');
            try {
                installPromptEvent.prompt();
                installPromptEvent.userChoice
                    .then((choiceResult) => {
                        logger.info('Install prompt decision', { action: choiceResult.outcome }, 'PWA004');
                    })
                    .catch((error) => {
                        logger.error('Install prompt error', { error }, 'PWA005');
                    });
                } catch (error) {
                logger.error('Install prompt error', { error }, 'PWA005');
            }
            setInstallPromptEvent(null);
        }
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            captureInstallPrompt(event);
        };

        logger.info('Adding beforeinstallprompt event listener', {}, 'PWA001');

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    useEffect(() => {
        const checkStandaloneMode = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
            setIsStandalone(isStandaloneMode);
            const modeString = isStandaloneMode ? 'standalone' : 'browser'
            logger.info(`App is running in:`, { modeString }, 'PWA007');
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