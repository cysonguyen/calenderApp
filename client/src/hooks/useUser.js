import { useState, useEffect, useCallback } from 'react';

export const useUser = () => {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const updateUser = useCallback((user) => {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setUser(JSON.parse(user));
            setIsInitialized(true);
        }
    }, []);

    return [user, updateUser, isInitialized];
}
