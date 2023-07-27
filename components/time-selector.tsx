import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';

interface TimeSelectorProps {
    defaultTime: string;
    minTime: string | null;
    maxTime: string | null;
    onChangeTime: (time: string) => void;
    disabled: boolean;
}

const convertTimeToMinutesFromMidnight = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
};

export const TimeSelector: React.FC<TimeSelectorProps> = ({ defaultTime, maxTime, minTime, onChangeTime, disabled }) => {
    const [selectedTime, setSelectedTime] = useState<string>(defaultTime);
    
    useEffect(() => {
        setSelectedTime(defaultTime);
    }, [defaultTime]);

    useEffect(() => {
        if(minTime && convertTimeToMinutesFromMidnight(minTime) > convertTimeToMinutesFromMidnight(selectedTime)) {
            setSelectedTime(minTime);
            onChangeTime(minTime);
        }
    }, [minTime]);

    const getTimeSlots = () => {
        const timeSlots = [];
        for (let i = 0 * 60; i <= 24 * 60; i += 30) {
            const value = `${Math.floor(i / 60).toString().padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')}`;
            if((minTime && convertTimeToMinutesFromMidnight(minTime) > convertTimeToMinutesFromMidnight(value)) || (maxTime && convertTimeToMinutesFromMidnight(maxTime) < convertTimeToMinutesFromMidnight(value))) continue;
            timeSlots.push({
                value,
                label: value
            });
        }
        return timeSlots;
    };

    const handleTimeChange = (selectedOption: any[]) => {
        if (selectedOption.length === 0 || disabled) return; // Added check to prevent accessing undefined value and disabling the time change
        const newSelectedTime = selectedOption[0].value;
        setSelectedTime(newSelectedTime);
        onChangeTime(newSelectedTime); // Use newSelectedTime instead of selectedTime
    };
    
    return (
        <div>
            <Select
                options={getTimeSlots()}
                onChange={handleTimeChange}
                values={[{ value: selectedTime, label: selectedTime }]}
                dropdownHandle
                dropdownHeight="300px"
                disabled={disabled}
            />
        </div>
    );
};
