import { useState, useEffect } from 'react';
import logger from '../utilities/logger';

const usePWAInstall = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false); 

    const captureInstallPrompt = (event) => {
        logger.info('PWA002','Install prompt captured', { event });
        event.preventDefault();
        setInstallPromptEvent(event);
    };

    const showInstallPrompt = () => {
        if (installPromptEvent) {
            logger.info('PWA003','Showing install prompt', { installPromptEvent });
            try {
                installPromptEvent.prompt();
                installPromptEvent.userChoice
                    .then((choiceResult) => {
                        logger.info('PWA004','Install prompt decision', { action: choiceResult.outcome });
                    })
                    .catch((error) => {
                        logger.error('PWA005','Install prompt error', { error });
                    });
                } catch (error) {
                logger.error('PWA005','Install prompt error', { error });
            }
            setInstallPromptEvent(null);
        }
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            captureInstallPrompt(event);
        };

        logger.debug('PWA001','Adding beforeinstallprompt event listener', {});

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
            logger.debug('PWA007',`App is running in`, { mode: modeString });
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