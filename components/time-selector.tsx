import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';

interface TimeSelectorProps {
  defaultTime: string; // defaultTime 변수에 string 타입 지정
  onChangeTime: (time: string) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ defaultTime, onChangeTime }) => {
  const [selectedTime, setSelectedTime] = useState<string>(defaultTime);

  useEffect(() => {
    setSelectedTime(defaultTime);
  }, [defaultTime]);


    const getTimeSlots = () => {
        const timeSlots = [];
        for (let i = 0 * 60; i <= 24 * 60; i += 30) {
            const value = `${Math.floor(i / 60).toString().padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')}`;
            timeSlots.push({
                value,
                label: value
            });
        }
        return timeSlots;
    };

    const handleTimeChange = (selectedOption) => {
        setSelectedTime(selectedOption[0].value);
        onChangeTime(selectedOption[0].value);
    };

    return (
        <div>
            <Select
                options={getTimeSlots()}
                onChange={handleTimeChange}
                values={[{ value: selectedTime, label: selectedTime }]}
                dropdownHandle
                dropdownHeight="300px"
            />
        </div>
    );
};
