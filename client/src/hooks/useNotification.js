'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from './useUser';
import { BASE_URL } from '@/utils/const';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

const useNotification = () => {
    const token = useRef(localStorage.getItem('token'));
    const [user, _ignore, isInitialized] = useUser();
    const [notification, setNotification] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isInitialized || !token.current) return;
        const eventSource = new EventSource(`${BASE_URL}/client-event/register?userId=${user?.id}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type) {
                    queryClient.invalidateQueries({ queryKey: ['notification'] });
                    switch (data.type) {
                        case 'SCHEDULE_UPDATE':
                            queryClient.invalidateQueries({ queryKey: ['schedules'] });
                            queryClient.invalidateQueries({ queryKey: ['schedule'] });
                            setNotification({
                                id: uuidv4(),
                                type: 'SCHEDULE_UPDATE',
                                message: 'You have a new update schedule'
                            });
                            break;

                        case 'GROUP_UPDATE':
                            queryClient.invalidateQueries({ queryKey: ['group'] });
                            queryClient.invalidateQueries({ queryKey: ['groups'] });
                            setNotification({
                                id: uuidv4(),
                                type: 'GROUP_UPDATE',
                                message: 'You have a new update group'
                            });
                            break;
                        case 'MEETING_UPDATE':
                            queryClient.invalidateQueries({ queryKey: ['meeting'] });
                            queryClient.invalidateQueries({ queryKey: ['meetings'] });
                            setNotification({
                                id: uuidv4(),
                                type: 'MEETING_UPDATE',
                                message: 'You have a new update meeting'
                            });
                            break;
                        default:
                            break;
                    }
                }
            } catch (error) {
                console.info('Error parsing event data:', error);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [user?.id, isInitialized]);

    return { notification };

};

export default useNotification;