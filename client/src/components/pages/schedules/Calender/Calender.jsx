import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import DayCell from './DayCell';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = ({ date, meetingCycles }) => {
    const { startOfMonth, daysInMonth, startWeekday } = useMemo(() => {
        const now = dayjs(date ?? new Date());
        return {
            startOfMonth: now.startOf('month'),
            daysInMonth: now.endOf('month').date(),
            startWeekday: now.startOf('month').day(),
        }
    }, [date])


    const days = useMemo(() => {
        const days = [];
        for (let i = 0; i < startWeekday; i++) {
            days.push(<div key={`empty-${i}`} className="empty-cell" />);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = startOfMonth.date(day);
            const dayCycles = meetingCycles?.filter(cycle =>
                dayjs(cycle.start_time).isSame(currentDate, 'day')
            );

            days.push(
                <DayCell key={day} date={currentDate} cycles={dayCycles} />
            );
        }

        return days;
    }, [startOfMonth, daysInMonth, startWeekday, meetingCycles])

    return (
        <div className="calendar-wrapper">
            <h2>{dayjs(date).format('MMMM YYYY')}</h2>
            <div className="weekdays-row">
                {weekdays.map((day, idx) => (
                    <div key={idx} className="weekday-cell">{day}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {days}
            </div>
        </div>
    );
};

export default Calendar;