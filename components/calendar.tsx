import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimeSelector } from './time-selector';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type TimeSlot = { startTime: string; endTime: string };
type DayState = { type: "timeSelector"; timeSlots: TimeSlot[] } | { type: "noTime"; timeSlots: TimeSlot[] };
type DaysState = Record<string, DayState>;
type WeeksProps = {
    selectedDate: Date
}

export default function CalendarTab() {
    const [loading, setLoading] = useState(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const onClickDay: (value: Date) => void = (value) => {
        setSelectedDate(value);
    };

    const tileClassName = ({ date, view }: { date: Date, view: string }) => {
        if (
            view === 'month' && 
            selectedDate instanceof Date && 
            date.getDate() === selectedDate.getDate() && 
            date.getMonth() === selectedDate.getMonth() && 
            date.getFullYear() === selectedDate.getFullYear() && 
            date.getTime() !== today.getTime()
        ) {
            return 'highlight';
        }
    }

    const tileDisabled = ({ date }: { date: Date }) => {
        return date < today;
    };

    const [daysState, setDaysState] = useState<DaysState>(() => {
        let initialState: DaysState = {};
        return initialState;
    });

    useEffect(() => {
        if (selectedDate) { // Add a check for selectedDate being non-null
            const day = selectedDate.toISOString().split('T')[0]; // transform the selectedDate to a 'YYYY-MM-DD' format
            if (!daysState[day]) {
                // If the selected day doesn't exist in the daysState, initialize it
                setDaysState(prevState => ({
                    ...prevState,
                    [day]: {
                        type: "timeSelector",
                        timeSlots: [
                            { startTime: "09:00", endTime: "09:30" }
                        ]
                    }
                }));
            }
        }
        setLoading(false);
    }, [selectedDate]);
    
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
            // Initialize the daysState if it doesn't exist in the data
            let initialState: DaysState = {};
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
            // Get the end time of the last time slot
            const beforeLastEndTime = prevState[day].timeSlots[prevState[day].timeSlots.length - 1].endTime;
            
            // Convert the end time to minutes from midnight
            const lastTimeSlotEndTimeInMinutes = convertTimeToMinutesFromMidnight(beforeLastEndTime);
    
            // If the end time is same or later than 23:00 (which is 1380 minutes from midnight), do not add a new time slot
            if (lastTimeSlotEndTimeInMinutes >= 1380) {
                toast.error("Cannot add the time seletor anymore", {
                    autoClose: 3000,
                    hideProgressBar: true,
                    style: {
                        backgroundColor: '#333',
                    },
                });
                return prevState;
            }
    
            // If the end time is earlier than 23:00, add a new time slot
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
            body: JSON.stringify({
                userId: "userid", // need implementation
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

    return (
        <div>
        {/* Display loading fragment while data is being fetched */}
        {loading && <div>Loading...</div>}
        {!loading && (
            <>
                <h1>날짜를 선택해주세요</h1>
                <Calendar
                    onClickDay={onClickDay}
                    tileClassName={tileClassName}
                    tileDisabled={tileDisabled}
                    value={selectedDate}
                    locale="en-US" // Set the locale to 'en-US' to start the week with Sunday
                />
                {selectedDate && (
                    <div key={selectedDate.toISOString().split('T')[0]} className="mt-4">
                        {daysState[selectedDate.toISOString().split('T')[0]]?.timeSlots.length >= 0 &&(
                            <div>
                                {daysState[selectedDate.toISOString().split('T')[0]].timeSlots.map((timeSlot, timeSlotIndex) => (
                                    <div key={timeSlotIndex} className="flex justify-between items-center">
                                        <div className="flex-1 mr-2">
                                            <p>Start</p>
                                            <TimeSelector
                                                defaultTime={timeSlot.startTime}
                                                maxTime={"23:30"}
                                                minTime={timeSlotIndex > 0 ? getMinTime(daysState[selectedDate.toISOString().split('T')[0]].timeSlots[timeSlotIndex - 1].endTime) : null} // Pass the end time of the previous slot
                                                onChangeTime={(selectedTime) => handleTimeChange(selectedDate.toISOString().split('T')[0], timeSlotIndex, 'startTime', selectedTime)}
                                            />
                                        </div>
                                        <div className="flex-1 ml-2">
                                            <p>End</p>
                                            <TimeSelector
                                                defaultTime={timeSlot.endTime}
                                                onChangeTime={(selectedTime) => handleTimeChange(selectedDate.toISOString().split('T')[0], timeSlotIndex, 'endTime', selectedTime)}
                                                maxTime={null}
                                                minTime={getMinTime(daysState[selectedDate.toISOString().split('T')[0]].timeSlots[timeSlotIndex].startTime)}
                                            />
                                        </div>
                                        <button onClick={() => handleDeleteTimeSlot(selectedDate.toISOString().split('T')[0], timeSlotIndex)}>Delete</button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddTimeSlot(selectedDate.toISOString().split('T')[0])}>+ Add Time Slot</button>
                            </div>
                        )}
                    {daysState[selectedDate.toISOString().split('T')[0]]?.timeSlots.length === 0 && <div>No available time for {selectedDate.toISOString().split('T')[0]}</div>}
                    </div>
                )}

                <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white py-2 px-4 rounded">Submit</button>
                <ToastContainer 
                    position="bottom-right" // Position of the toast container
                    toastClassName="dark-toast" // Custom CSS class for the toast
                />
            </>
        )}
    </div>
    );
}

const convertTimeToMinutesFromMidnight = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
};

// export function Weeks({selectedDate}: WeeksProps) {
//     const [loading, setLoading] = useState(true);
//     const [daysState, setDaysState] = useState<DaysState>(() => {
//         let initialState: DaysState = {};
//         return initialState;
//     });

//     useEffect(() => {
//         const day = selectedDate.toISOString().split('T')[0]; // transform the selectedDate to a 'YYYY-MM-DD' format
//         if (!daysState[day]) {
//             // If the selected day doesn't exist in the daysState, initialize it
//             setDaysState(prevState => ({
//                 ...prevState,
//                 [day]: {
//                     type: "timeSelector",
//                     timeSlots: [
//                         { startTime: "09:00", endTime: "09:30" }
//                     ]
//                 }
//             }));
//         }
//         setLoading(false);
//     }, [selectedDate]);

//     useEffect(() => {
//         const userId = "userid";
    
//         fetch(`/api/submit?userId=${userId}`, {
//         method: 'GET',
//         headers: {
//         'Content-Type': 'application/json'
//         },
//     })
//         .then(response => response.json())
//         .then(data => {
//         console.log(data);
//         if (data && data.daysState) {
//             setDaysState(data.daysState);
//         } else {
//             // Initialize the daysState if it doesn't exist in the data
//             let initialState: DaysState = {};
//             for (let day of daysOfWeek) {
//                 initialState[day] = {
//                 type: "timeSelector",
//                 timeSlots: [
//                     { startTime: "09:00", endTime: "09:30" }
//                 ]
//                 };
//             }
//             setDaysState(initialState);
//         }
//         setLoading(false);
//         })
//         .catch((error) => {
//         console.error('Error:', error);
//         // Error occurred, set loading to false
//         setLoading(false);
//         });
//     }, []);

//     const handleClick = (day: string) => {
//         setDaysState(prevState => {
//             let updatedDayState: DayState = prevState[day].type === "timeSelector"
//                 ? { type: "noTime", timeSlots: [] }
//                 : { type: "timeSelector", timeSlots: [{ startTime: "09:00", endTime: "09:30" }] };
//             return {
//                 ...prevState,
//                 [day]: updatedDayState
//             };
//         });
//     };

//     const handleTimeChange = (day: string, timeSlotIndex: number, timeType: 'startTime' | 'endTime', selectedTime: string) => {
//         setDaysState(prevState => {
//             const updatedTimeSlots = [...prevState[day].timeSlots];
//             updatedTimeSlots[timeSlotIndex] = {
//                 ...updatedTimeSlots[timeSlotIndex],
//                 [timeType]: selectedTime
//             };
    
//             // If the start time is later than the end time, then set the end time to 30 minutes later than the start time
//             if (timeType === 'startTime') {
//                 // Check if start time is later than end time of the same slot
//                 if (convertTimeToMinutesFromMidnight(selectedTime) >= convertTimeToMinutesFromMidnight(updatedTimeSlots[timeSlotIndex].endTime)) {
//                     updatedTimeSlots[timeSlotIndex].endTime = getMinTime(selectedTime);
//                     // console.log(`${updatedTimeSlots[timeSlotIndex].endTime}`);
//                 }
    
//                 // Check if start time is earlier than end time of the previous slot
//                 if (timeSlotIndex > 0 && convertTimeToMinutesFromMidnight(selectedTime) <= convertTimeToMinutesFromMidnight(updatedTimeSlots[timeSlotIndex - 1].endTime)) {
//                     updatedTimeSlots[timeSlotIndex].startTime = getMinTime(updatedTimeSlots[timeSlotIndex - 1].endTime);
//                     // console.log(`${updatedTimeSlots[timeSlotIndex].startTime}`);
//                 }
//             }

//             return {
//                 ...prevState,
//                 [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
//             };
//         });
//     };
        

//     const handleAddTimeSlot = (day: string) => {
//         setDaysState(prevState => {
//             const updatedTimeSlots = [...prevState[day].timeSlots, { startTime: "09:00", endTime: "09:30" }];

//             return {
//                 ...prevState,
//                 [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
//             };
//         });
//     };

//     const handleDeleteTimeSlot = (day: string, timeSlotIndex: number) => {
//         setDaysState(prevState => {
//             const updatedTimeSlots = [...prevState[day].timeSlots];
//             updatedTimeSlots.splice(timeSlotIndex, 1);
    
//             return {
//                 ...prevState,
//                 [day]: updatedTimeSlots.length > 0 
//                     ? { ...prevState[day], timeSlots: updatedTimeSlots } 
//                     : { type: "noTime", timeSlots: [] }  // preserve `type` property
//             };
//         });
//     };

//     const handleSubmit = () => {
//         fetch('/api/submit', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 userId: "userid", // need implementation
//                 daysState
//             })
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             toast.success("Save complete", {
//                 autoClose: 3000, // Duration of the toast in milliseconds (e.g., 3000 ms = 3 seconds)
//                 hideProgressBar: true, // Hide the progress bar
//                 style: {
//                   backgroundColor: '#333', // Set the background color of the toast
//                 },
//             });      
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//         });
//     };

//     // const handleSubmit = () => {
//     //     console.log(daysState);
//     // };

//     return (
//         <div>
//             {/* Display loading fragment while data is being fetched */}
//             {loading && <div>Loading...</div>}
//             {!loading && (
//                 <>
//                 {daysOfWeek.map((day, index) => (
//                     <div key={index}>
//                         <button onClick={() => handleClick(day)} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">{day}</button>
//                         {daysState[day].type === "timeSelector" && (
//                             <div>
//                                 {daysState[day].timeSlots.map((timeSlot, timeSlotIndex) => (
//                                     <div key={timeSlotIndex} className="flex justify-between items-center">
//                                         <div className="flex-1 mr-2">
//                                             <p>Start</p>
//                                             <TimeSelector
//                                                 defaultTime={timeSlot.startTime}
//                                                 minTime={timeSlotIndex > 0 ? getMinTime(daysState[day].timeSlots[timeSlotIndex - 1].endTime) : null} // Pass the end time of the previous slot
//                                                 onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'startTime', selectedTime)}
//                                             />
//                                         </div>
//                                         <div className="flex-1 ml-2">
//                                             <p>End</p>
//                                             <TimeSelector
//                                                 defaultTime={timeSlot.endTime}
//                                                 onChangeTime={(selectedTime) => handleTimeChange(day, timeSlotIndex, 'endTime', selectedTime)}
//                                                 minTime={
//                                                     getMinTime(daysState[day].timeSlots[timeSlotIndex].startTime)
//                                                 }
//                                             />
//                                         </div>
//                                         <button onClick={() => handleDeleteTimeSlot(day, timeSlotIndex)}>Delete</button>
//                                     </div>
//                                 ))}
//                                 <button onClick={() => handleAddTimeSlot(day)}>+ Add Time Slot</button>
//                             </div>
//                         )}
//                         {daysState[day].type === "noTime" && <div>No available time for {day}</div>}
//                     </div>
//                 ))}
//             <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white py-2 px-4 rounded">Submit</button>
//             <ToastContainer 
//                 position="bottom-right" // Position of the toast container
//                 toastClassName="dark-toast" // Custom CSS class for the toast
//             />
//             </>
//             )}
//         </div>
//     );

//     function getMinTime(selectedTime: string) {
//         let hour = parseInt(selectedTime.split(':')[0]);
//         let minute = parseInt(selectedTime.split(':')[1]) + 30;
//         if (minute >= 60) {
//             hour += 1;
//             minute -= 60;
//         }
//         let result = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//         return result;
//     }
// }