import dayjs from 'dayjs';
import React, { useMemo } from 'react';

export const ScheduleItem = ({ cycle }) => {

    const { start_time, end_time } = useMemo(() => {
        return {
            start_time: dayjs(cycle.start_time).format('HH:mm'),
            end_time: dayjs(cycle.end_time).format('HH:mm A'),
        }
    }, [cycle]);

    return <div className="schedule-item flex flex-col rounded-md gap-2">
        <div className="schedule-item-time">
            {start_time} - {end_time}
        </div>
        <div className="schedule-item-title text-semibold">
            {cycle.title}
        </div>
    </div>;
};
