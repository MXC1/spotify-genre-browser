import { useState, useEffect, useCallback } from 'react';

export const createGlobalStateHook = (initialValue) => {
    const store = {
        value: initialValue,
        setters: new Set()
    };

    return function useGlobalState() {
        const [value, setValue] = useState(store.value);
        
        const setGlobalValue = useCallback((newValue) => {
            store.value = newValue;
            store.setters.forEach(setter => setter(newValue));
        }, []);

        useEffect(() => {
            store.setters.add(setValue);
            return () => store.setters.delete(setValue);
        }, []);

        return [value, setGlobalValue];
    };
};

export const useGroupedAlbums = createGlobalStateHook({});
export const useIsLoading = createGlobalStateHook(false);
export const useIsSyncing = createGlobalStateHook(false);
export const useAlbumProgress = createGlobalStateHook({ current: 0, total: 0 });
export const useArtistProgress = createGlobalStateHook({ current: 0, total: 0 });
