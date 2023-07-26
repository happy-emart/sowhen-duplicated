import React, { useState, useEffect } from 'react';
import { TimeSelector } from './time-selector';

type TimeSlot = { startTime: string; endTime: string };
type DayState = { type: "timeSelector"; timeSlots: TimeSlot[] } | { type: "noTime"; timeSlots: TimeSlot[] };
type DaysState = Record<string, DayState>;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Weeks() {
    const [loading, setLoading] = useState(true);

    const [daysState, setDaysState] = useState<DaysState>(() => {
        let initialState: DaysState = {};
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

    useEffect(() => {
        const userId = "userid";
    
        fetch(`/api/submit?userId=${userId}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
        console.log(data);
        if (data && data.daysState) {
            setDaysState(data.daysState);
        } else {
            // ... (same as before)
        }

        // Data has been fetched, set loading to false
        setLoading(false);
        })
        .catch((error) => {
        console.error('Error:', error);
        // Error occurred, set loading to false
        setLoading(false);
        });
    }, []);
        

    const handleClick = (day: string) => {
        setDaysState(prevState => {
            let updatedDayState: DayState = prevState[day].type === "timeSelector"
                ? { type: "noTime", timeSlots: [] }
                : { type: "timeSelector", timeSlots: [{ startTime: "09:00", endTime: "09:30" }] };
            return {
                ...prevState,
                [day]: updatedDayState
            };
        });
    };

    const handleTimeChange = (day: string, timeSlotIndex: number, timeType: 'startTime' | 'endTime', selectedTime: string) => {
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
    
                    // This makes sure the start time doesn't overlap with the previous time slot's end time
                    let hour = parseInt(updatedTimeSlots[timeSlotIndex].startTime.split(':')[0]);
                    let minute = parseInt(updatedTimeSlots[timeSlotIndex].startTime.split(':')[1]) + 30;
                    if (minute >= 60) {
                        hour += 1;
                        minute -= 60;
                    }
                    updatedTimeSlots[timeSlotIndex].startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                }
            }
    
            return {
                ...prevState,
                [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
            };
        });
    };
        

    const handleAddTimeSlot = (day: string) => {
        setDaysState(prevState => {
            const updatedTimeSlots = [...prevState[day].timeSlots, { startTime: "09:00", endTime: "09:30" }];

            return {
                ...prevState,
                [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
            };
        });
    };

    const handleDeleteTimeSlot = (day: string, timeSlotIndex: number) => {
        setDaysState(prevState => {
            const updatedTimeSlots = [...prevState[day].timeSlots];
            updatedTimeSlots.splice(timeSlotIndex, 1);
    
            return {
                ...prevState,
                [day]: updatedTimeSlots.length > 0 
                    ? { ...prevState[day], timeSlots: updatedTimeSlots } 
                    : { type: "noTime", timeSlots: [] }  // preserve `type` property
            };
        });
    };

    const handleSubmit = () => {
        fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Does it have to include username?
            body: JSON.stringify({
                userId: "userid", // need implementation
                daysState
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    return (
        <div>
            {/* Display loading fragment while data is being fetched */}
            {loading && <div>Loading...</div>}
            {!loading && (
                <>
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
                                                minTime={timeSlotIndex > 0 ? daysState[day].timeSlots[timeSlotIndex - 1].endTime : null} // Pass the end time of the previous slot
                                                onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'startTime', selectedTime)}
                                            />
                                        </div>
                                        <div className="flex-1 ml-2">
                                            <p>End</p>
                                            <TimeSelector
                                                defaultTime={timeSlot.endTime}
                                                onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'endTime', selectedTime)}
                                                minTime={null}
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
            <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white py-2 px-4 rounded">Submit</button>
            </>
            )}
        </div>
    );
}
