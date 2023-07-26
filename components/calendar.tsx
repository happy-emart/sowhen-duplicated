import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarGfg() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [value, setValue] = useState<Date | null>(null);

    const onClickDay: (value: Date) => void = (value) => {
        setValue(value);
    };

    const tileClassName = ({ date, view }: { date: Date, view: string }) => {
        if (
            view === 'month' && 
            value instanceof Date && 
            date.getDate() === value.getDate() && 
            date.getMonth() === value.getMonth() && 
            date.getFullYear() === value.getFullYear() && 
            date.getTime() !== today.getTime()
        ) {
            return 'highlight';
        }
    }

    const tileDisabled = ({ date }: { date: Date }) => {
        return date < today;
    };

    return (
        <div>
            <h1>날짜를 선택해주세요</h1>
            <Calendar
                onClickDay={onClickDay}
                tileClassName={tileClassName}
                tileDisabled={tileDisabled}
                value={value}
            />
        </div>
    );
}


