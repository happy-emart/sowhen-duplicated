import React, { useState, useEffect } from 'react';
import { TimeSelector } from './time-selector';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProps } from '@/lib/api/user';

interface WeeksProps {
    user: UserProps;
  }

type TimeSlot = { startTime: string; endTime: string };
type DayState = { type: "timeSelector"; timeSlots: TimeSlot[] } | { type: "noTime"; timeSlots: TimeSlot[] };
type DaysState = Record<string, DayState>;

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const convertTimeToMinutesFromMidnight = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
};

export default function Weeks({ user }: WeeksProps) {
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
        const userId = user.username;
    
        fetch(`/api/submit?userId=${userId}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
        if (data && data.daysState) {
            setDaysState(data.daysState);
        } else {
            // Initialize the daysState if it doesn't exist in the data
            let initialState: DaysState = {};
            for (let day of daysOfWeek) {
                initialState[day] = {
                type: "timeSelector",
                timeSlots: [
                    { startTime: "09:00", endTime: "09:30" }
                ]
                };
            }
            setDaysState(initialState);
        }
        setLoading(false);
        })
        .catch((error) => {
        console.error('Error:', error);
        // Error occurred, set loading to false
        setLoading(false);
        });
    }, []);

    // // For function of make unavailable day by clicking day button 
    // const handleClick = (day: string) => {
    //     setDaysState(prevState => {
    //         let updatedDayState: DayState = prevState[day].type === "timeSelector"
    //             ? { type: "noTime", timeSlots: [] }
    //             : { type: "timeSelector", timeSlots: [{ startTime: "09:00", endTime: "09:30" }] };
    //         return {
    //             ...prevState,
    //             [day]: updatedDayState
    //         };
    //     });
    // };

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
                if (convertTimeToMinutesFromMidnight(selectedTime) >= convertTimeToMinutesFromMidnight(updatedTimeSlots[timeSlotIndex].endTime)) {
                    updatedTimeSlots[timeSlotIndex].endTime = getMinTime(selectedTime);
                    // console.log(`${updatedTimeSlots[timeSlotIndex].endTime}`);
                }
    
                // Check if start time is earlier than end time of the previous slot
                if (timeSlotIndex > 0 && convertTimeToMinutesFromMidnight(selectedTime) <= convertTimeToMinutesFromMidnight(updatedTimeSlots[timeSlotIndex - 1].endTime)) {
                    updatedTimeSlots[timeSlotIndex].startTime = getMinTime(updatedTimeSlots[timeSlotIndex - 1].endTime);
                    // console.log(`${updatedTimeSlots[timeSlotIndex].startTime}`);
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
            if (prevState[day].timeSlots.length != 0) {
                // Get the end time of the last time slot
                const lastTimeSlotEndTime = prevState[day].timeSlots[prevState[day].timeSlots.length - 1].endTime;
                
                // Convert the end time to minutes from midnight
                const lastTimeSlotEndTimeInMinutes = convertTimeToMinutesFromMidnight(lastTimeSlotEndTime);
        
                // If the end time is same or later than 23:00 (which is 1380 minutes from midnight), do not add a new time slot
                if (lastTimeSlotEndTimeInMinutes >= 1380) {
                    toast.error("Cannot add a new time slot as the end time of the last time slot is at or later than 23:00", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        style: {
                            backgroundColor: '#333',
                        },
                    });
                    return prevState;
                }
            }
            // If the end time is earlier than 23:00, add a new time slot
            const updatedTimeSlots = [...prevState[day].timeSlots, { startTime: "09:00", endTime: "09:30" }];

            const updatedDayState: DayState = {
                type: "timeSelector",
                timeSlots: updatedTimeSlots
            };
    
            return {
                ...prevState,
                [day]: updatedDayState
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
            body: JSON.stringify({
                userId: user.username, // need implementation
                daysState
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            toast.success("Save complete", {
                autoClose: 3000, // Duration of the toast in milliseconds (e.g., 3000 ms = 3 seconds)
                hideProgressBar: true, // Hide the progress bar
                style: {
                  backgroundColor: '#333', // Set the background color of the toast
                },
            });      
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    // const handleSubmit = () => {
    //     console.log(daysState);
    // };

    return (
        <div>
            {/* Display loading fragment while data is being fetched */}
            {loading && <div>Loading...</div>}
            {!loading && (
                <>
                {daysOfWeek.map((day, index) => (
                    <div key={index}>
                        <button 
                            className={`mt-4 text-white py-2 px-4 rounded ${daysState[day].timeSlots.length === 0 ? "bg-red-500" : "bg-blue-500"}`} 
                        >
                            {day}
                        </button>
                            <div>
                                {daysState[day].timeSlots.map((timeSlot, timeSlotIndex) => (
                                    <div key={timeSlotIndex} className="flex justify-between items-center">
                                        <div className="flex-1 mr-2">
                                            <p>Start</p>
                                            <TimeSelector
                                                disabled={false}
                                                defaultTime={timeSlot.startTime}
                                                maxTime={"23:30"}
                                                minTime={timeSlotIndex > 0 ? getMinTime(daysState[day].timeSlots[timeSlotIndex - 1].endTime) : null} // Pass the end time of the previous slot
                                                onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'startTime', selectedTime)}
                                            />
                                        </div>
                                        <div className="flex-1 ml-2">
                                            <p>End</p>
                                            <TimeSelector
                                                disabled={false}
                                                defaultTime={timeSlot.endTime}
                                                onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'endTime', selectedTime)}
                                                maxTime={null}
                                                minTime={
                                                    getMinTime(daysState[day].timeSlots[timeSlotIndex].startTime)
                                                }
                                            />
                                        </div>
                                        <button onClick={() => handleDeleteTimeSlot(day, timeSlotIndex)}>Delete</button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddTimeSlot(day)}>+ Add Time Slot</button>
                            </div>
                        {daysState[day].timeSlots.length === 0 && <div>No available time for {day}</div>}
                    </div>
                ))}
            <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white py-2 px-4 rounded">Submit</button>
            <ToastContainer 
                position="bottom-right" // Position of the toast container
                toastClassName="dark-toast" // Custom CSS class for the toast
            />
            </>
            )}
        </div>
    );

    function getMinTime(selectedTime: string) {
        let hour = parseInt(selectedTime.split(':')[0]);
        let minute = parseInt(selectedTime.split(':')[1]) + 30;
        if (minute >= 60) {
            hour += 1;
            minute -= 60;
        }
        let result = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        return result;
    }
}
