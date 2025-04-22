import React from 'react';
import { ScheduleItem } from './ScheduleItem';

const DayCell = ({ date, cycles }) => {
    return (
        <div className="day-cell">
            <div className="day-number">{date.date()}</div>
            {cycles?.map((cycle, index) => (
                <ScheduleItem key={index} cycle={cycle} />
            ))}
        </div>
    );
};

export default DayCell;
