import React, { useState } from 'react';
import { TimeSelector } from './time-selector';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Weeks() {
    const [daysState, setDaysState] = useState(() => {
        let initialState = {};
        for (let day of daysOfWeek) {
            initialState[day] = {
                type: "timeSelector",
                timeSlots: [
                    { startTime: "09:00", endTime: "09:30" }
                ]
            };
        }
        return initialState;
    });

    const handleClick = (day) => {
        setDaysState(prevState => {
            let updatedDayState = prevState[day].type === "timeSelector"
                ? { type: "noTime", timeSlots: [] }
                : { type: "timeSelector", timeSlots: [{ startTime: "09:00", endTime: "09:30" }] };
            return {
                ...prevState,
                [day]: updatedDayState
            };
        });
    };

    const handleTimeChange = (day, timeSlotIndex, timeType, selectedTime) => {
        setDaysState(prevState => {
            const updatedTimeSlots = [...prevState[day].timeSlots];
            updatedTimeSlots[timeSlotIndex] = {
                ...updatedTimeSlots[timeSlotIndex],
                [timeType]: selectedTime
            };

            // If the start time is later than the end time, then set the end time to 30 minutes later than the start time
            if (timeType === 'startTime') {
                // Check if start time is later than end time of the same slot
                if (selectedTime >= updatedTimeSlots[timeSlotIndex].endTime) {
                    let hour = parseInt(selectedTime.split(':')[0]);
                    let minute = parseInt(selectedTime.split(':')[1]) + 30;
                    if (minute >= 60) {
                        hour += 1;
                        minute -= 60;
                    }
                    updatedTimeSlots[timeSlotIndex].endTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                }
                // Check if start time is earlier than end time of the previous slot
                if (timeSlotIndex > 0 && selectedTime <= updatedTimeSlots[timeSlotIndex - 1].endTime) {
                    updatedTimeSlots[timeSlotIndex].startTime = updatedTimeSlots[timeSlotIndex - 1].endTime;
                }
            }

            return {
                ...prevState,
                [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
            };
        });
    };


    const handleAddTimeSlot = (day) => {
        setDaysState(prevState => {
            const updatedTimeSlots = [...prevState[day].timeSlots, { startTime: "09:00", endTime: "09:30" }];

            return {
                ...prevState,
                [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
            };
        });
    };

    const handleDeleteTimeSlot = (day, timeSlotIndex) => {
        setDaysState(prevState => {
            const updatedTimeSlots = [...prevState[day].timeSlots];
            updatedTimeSlots.splice(timeSlotIndex, 1);

            return {
                ...prevState,
                [day]: updatedTimeSlots.length > 0 ? { ...prevState[day], timeSlots: updatedTimeSlots } : { type: "noTime", timeSlots: [] }
            };
        });
    };

    return (
        <div>
            {daysOfWeek.map((day, index) => (
                <div key={index}>
                    <button onClick={() => handleClick(day)} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">{day}</button>
                    {daysState[day].type === "timeSelector" && (
                        <div>
                            {daysState[day].timeSlots.map((timeSlot, timeSlotIndex) => (
                                <div key={timeSlotIndex} className="flex justify-between items-center">
                                    <div className="flex-1 mr-2">
                                        <p>Start</p>
                                        <TimeSelector
                                            defaultTime={timeSlot.startTime}
                                            onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'startTime', selectedTime)}
                                        />
                                    </div>
                                    <div className="flex-1 ml-2">
                                        <p>End</p>
                                        <TimeSelector
                                            defaultTime={timeSlot.endTime}
                                            onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'endTime', selectedTime)}
                                        />
                                    </div>
                                    <button onClick={() => handleDeleteTimeSlot(day, timeSlotIndex)}>Delete</button>
                                </div>
                            ))}
                            <button onClick={() => handleAddTimeSlot(day)}>+ Add Time Slot</button>
                        </div>
                    )}
                    {daysState[day].type === "noTime" && <div>No available time for {day}</div>}
                </div>
            ))}
        </div>
    );
}
