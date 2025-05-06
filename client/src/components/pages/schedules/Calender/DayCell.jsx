import React from 'react';
import { ScheduleItem } from './ScheduleItem';

const DayCell = ({ date, cycles, isToday }) => {
    return (
        <div className={`day-cell ${isToday ? 'today' : ''}`}>
            <div className="day-number">{date.date()}</div>
            {cycles?.map((cycle, index) => (
                <ScheduleItem key={index} cycle={cycle} scheduleId={cycle.schedule_id} />
            ))}
        </div>
    );
};

export default DayCell;
