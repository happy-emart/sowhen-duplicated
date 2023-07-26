import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarGfg() {
    const [value, setValue] = useState<Date>(new Date());

    const onClickDay: (value: Date) => void = (value) => {
        setValue(value);
    };

    const tileClassName = ({ date }: { date: Date }) => {
        if (value instanceof Date && date.getDate() === value.getDate() && date.getMonth() === value.getMonth() && date.getFullYear() === value.getFullYear()) {
            return 'highlight';
        }
    }

    return (
        <div>
            <h1>NextJs Calendar - GeeksforGeeks</h1>
            <Calendar
                onClickDay={onClickDay}
                tileClassName={tileClassName}
                value={value}
            />
        </div>
    );
}
