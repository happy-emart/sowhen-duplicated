import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clientPromise from '../../lib/mongodb';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimeSelector } from '../../components/time-selector';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../components/Calendar.module.css';
import { ParsedUrlQuery } from 'querystring';

interface CatchUserProps {
  useremail: string;
  username: string;
  targetUserEmail: string;
  targetUserName: string;
}

interface Params extends ParsedUrlQuery {
    username: string;
  }

export default function CatchUsername({ username, useremail, targetUserEmail, targetUserName }: CatchUserProps) {
  const [formVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(useremail || '');
  const [note, setNote] = useState('');

  const handleClick = () => {
    setFormVisible(true);
  };

  const handleSendEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  
    if (!name || (!email && username === 'Non-members')) {
      if (username != 'Non-members') {
        toast.error("Please enter a name.", {
          autoClose: 3000,
          hideProgressBar: true,
          style: {
              backgroundColor: '#333',
              }
          })
        return;
      }
      toast.error("Please enter both your name and email.", {
        autoClose: 3000,
        hideProgressBar: true,
        style: {
            backgroundColor: '#333',
            }
        })
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email.", {
        autoClose: 3000,
        hideProgressBar: true,
        style: {
            backgroundColor: '#333',
            }
        })
      return;
    }

    fetch('/api/send_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email: [email, targetUserEmail], note, targetUserName }),
    })
    .then(data => {
      handleSubmit();
      console.log(data);
      toast.success("Submit Complete", {
        autoClose: 3000, // Duration of the toast in milliseconds (e.g., 3000 ms = 3 seconds)
        hideProgressBar: true, // Hide the progress bar
        style: {
          backgroundColor: '#333', // Set the background color of the toast
          },
        });
        setName('')
        setNote('')
      }).catch((error) => {
        console.error('Error:', error);
    });
  };

  /////////////////////////// Calendar Part /////////////////////////
  /////////////////////////// Calendar Part /////////////////////////
  /////////////////////////// Calendar Part /////////////////////////
  /////////////////////////// Calendar Part /////////////////////////
  /////////////////////////// Calendar Part /////////////////////////
  /////////////////////////// Calendar Part /////////////////////////
  type TimeSlot = { startTime: string; endTime: string };
  type DayState = { type: "timeSelector"; timeSlots: TimeSlot[] } | { type: "noTime"; timeSlots: TimeSlot[] };
  type DaysState = Record<string, DayState>;
  type Appointment = {
      accepterId: string;
      senderId: string;
      date: string;
      startTime: string;
      endTime: string;
      isAccepted: boolean;
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const [loading, setLoading] = useState(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [appointmentList, setAppointmentList] = useState<Appointment[]>([]);

      const [selectedDate, setSelectedDate] = useState<Date | null>(null);
      const [daysState, setDaysState] = useState<DaysState>(() => {
          let initialState: DaysState = {};
          return initialState;
      });
      const [appointmentState, setAppointmentState] = useState<DaysState>(() => {
          let initialState: DaysState = {};
          return initialState;
      });
      const [fetchedDates, setFetchedDates] = useState<string[]>([]);

      const isSameDayState = (day1: DayState, day2: DayState) => {
          // Compare day1 and day2 and return true if they are the same
          // For example, you can compare their timeSlots.
          return JSON.stringify(day1) === JSON.stringify(day2);
      };
      
      const onClickDay: (value: Date) => void = (value) => {
          // Get timezone offset in minutes
          const offset = value.getTimezoneOffset();
          // Create a new Date object, shifted by the timezone offset
          const localDate = new Date(value.getTime() - offset * 60 * 1000);
          setSelectedDate(localDate);
          setAppointmentState({
              [localDate.toISOString().split('T')[0]]: {
                  type: "timeSelector", // or "noTime", depending on the logic
                  timeSlots: [{ startTime: "09:00", endTime: "09:30" }],
              },
          });
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

      const tileDisabled = ({ date, view }: { date: Date, view: string }) => {
          // Don't disable tiles for month and year views
          const now = new Date();

          switch (view) {
              case ('month'):
                  now.setHours(0, 0, 0, 0);
                  break;
              case ('year'):
                  now.setDate(1);
                  now.setHours(0, 0, 0, 0);
                  break;
              case ('decade'):
                  now.setMonth(0);
                  now.setDate(1);
                  now.setHours(0, 0, 0, 0);
                  break;
              case ('century'):
                  const firstYearOfDecade = Math.floor(now.getFullYear() / 10) * 10;
                  now.setFullYear(firstYearOfDecade);
                  now.setMonth(1);
                  now.setDate(1);
                  now.setHours(0, 0, 0, 0);
                  break;
          }
          
          // Disable tiles for dates in the past
          return date.getTime() < now.getTime();
      };
      
      useEffect(() => {
          if (selectedDate) { // Add a check for selectedDate being non-null
              const day = selectedDate.toISOString().split('T')[0]; // transform the selectedDate to a 'YYYY-MM-DD' format
              if (!daysState[day]) {
                  // If the selected day doesn't exist in the daysState, initialize it
                  setDaysState(prevState => ({
                      ...prevState,
                      [day]: daysState[daysOfWeek[selectedDate.getDay()]]
                  }));
              }
          }
          // setLoading(false);
      }, [selectedDate]);
      
      useEffect(() => {
          const userId = targetUserName;
      
          fetch(`/api/submit?userId=${userId}`, {
              method: 'GET',
              headers: {
              'Content-Type': 'application/json'
              },
          })
          .then(response => response.json())
          .then(data => {
          if (data && data.daysState) {
              let fetchedDate = [];
              for (let focusedDay in data.daysState) {
                  if (!daysOfWeek.includes(focusedDay)) fetchedDate.push(focusedDay);
              }
              setFetchedDates(fetchedDate);
              setDaysState(data.daysState);
          } else {
              // // Initialize the daysState if it doesn't exist in the data
              // let initialState: DaysState = {};
              // setDaysState(initialState);

              // error state here
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
          // accepterId must be changed into actual user id
          fetch(`/api/submit-catch?accepterId=${targetUserName}`, {
              method: 'GET',
              headers: {
              'Content-Type': 'application/json'
              },
          })
          .then(response => response.json())
          .then(data => {
              if (data) {
                  const what = data.appointmentState.map(({ _id, ...rest }:any) => rest);
                  setAppointmentList(appointmentList.concat(what));
                  // console.log("pushpush babby",JSON.stringify(appointmentList));
              }
          })
          setLoading(false);
          })
          .catch((error) => {
          console.error('Error:', error);
          // Error occurred, set loading to false
          setLoading(false);
          });
      }, []);

      useEffect(() => {
          if (Object.keys(daysState).length === 0 && daysState.constructor === Object) {
              return; // If daysState is empty, do nothing
          }    
          console.log('daysState has updated!', daysState);
          let filteredDaysState: DaysState = {};
          for (let focusedDay in daysState) {
              if (daysOfWeek.includes(focusedDay)) {
                  filteredDaysState[focusedDay] = daysState[focusedDay];
              } else {
                  let date = new Date(focusedDay);
                  let selectedDayState = daysState[focusedDay];
                  let dayOfWeekState = daysState[daysOfWeek[date.getDay()]];
                  // console.log(focusedDay, selectedDayState);
                  // console.log(dayOfWeekState);
                  if (!isSameDayState(selectedDayState, dayOfWeekState))
                      filteredDaysState[focusedDay] = daysState[focusedDay];
              }
          }
          fetch('/api/submit', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  'userId': targetUserName, // need implementation
                  // somedayId: selectedDate.toISOString().split('T')[0],
                  'daysState': filteredDaysState
              })
          })

      }, [daysState]);
      
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
                  }
      
                  // Check if start time is earlier than end time of the previous slot
                  if (timeSlotIndex > 0 && convertTimeToMinutesFromMidnight(selectedTime) <= convertTimeToMinutesFromMidnight(updatedTimeSlots[timeSlotIndex - 1].endTime)) {
                      updatedTimeSlots[timeSlotIndex].startTime = getMinTime(updatedTimeSlots[timeSlotIndex - 1].endTime);
                  }
              }

              return {
                  ...prevState,
                  [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
              };
          });
      };

      const handleOpponentTimeChange = (day: string, timeSlotIndex: number, timeType: 'startTime' | 'endTime', selectedTime: string) => {
          setAppointmentState(prevState => {
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
                  }
      
                  // Check if start time is earlier than end time of the previous slot
                  if (timeSlotIndex > 0 && convertTimeToMinutesFromMidnight(selectedTime) <= convertTimeToMinutesFromMidnight(updatedTimeSlots[timeSlotIndex - 1].endTime)) {
                      updatedTimeSlots[timeSlotIndex].startTime = getMinTime(updatedTimeSlots[timeSlotIndex - 1].endTime);
                  }
              }

              return {
                  ...prevState,
                  [day]: { ...prevState[day], timeSlots: updatedTimeSlots }
              };
          });
      };

      const handleSubmit = () => {
          if (selectedDate) {
              let targetTimeSlot = Object.values(appointmentState)[0].timeSlots[0];
              let date = Object.keys(appointmentState)[0];
              let appointmentStartTime = targetTimeSlot.startTime;
              let appointmentEndTime = targetTimeSlot.endTime;
              // Look for a matching slot
              let selectedDayState = daysState[date];
              let isSucceeded = selectedDayState.timeSlots.some(timeSlot =>
                  convertTimeToMinutesFromMidnight(timeSlot.startTime) <= convertTimeToMinutesFromMidnight(appointmentStartTime) &&
                  convertTimeToMinutesFromMidnight(timeSlot.endTime) >= convertTimeToMinutesFromMidnight(appointmentEndTime)
              );
    
              // If a matching slot was found, make the request
              if (isSucceeded) {
                  const body = JSON.stringify({
                      'accepterId': targetUserName, // need implementation
                      'senderId': username, // need implementation
                      'date': date,
                      'startTime': appointmentStartTime,
                      'endTime': appointmentEndTime,
                      'isAccepted': false
                  });
                  const bodyObject = JSON.parse(body);
                  setAppointmentList([...appointmentList, bodyObject]);
                  fetch('/api/submit-catch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: body
                  })
                  .then(response => response.json())
                  .then(data => {
                      toast.success("Request complete", { autoClose: 3000, hideProgressBar: true, style: { backgroundColor: '#333' } });
                  })
                  .catch((error) => {
                      console.error('Error:', error);
                      toast.error("Request failed", { autoClose: 3000, hideProgressBar: true, style: { backgroundColor: '#333' } });
                  });

                  setDaysState(prevState => {
                      const day = selectedDate.toISOString().split('T')[0];
                      const dayState = prevState[day];
                      if (dayState) {
                          const newTimeSlots = dayState.timeSlots.flatMap(slot => splitTimeSlot(slot, bodyObject));
                          return { ...prevState, [day]: { ...dayState, timeSlots: newTimeSlots } };
                      }
                      return prevState;
                  })
                  console.log("왜안돼지왜안돼지왜안돼지왜안돼지왜안돼지왜안돼지왜안돼지",JSON.stringify(daysState[selectedDate.toISOString().split('T')[0]], null, 2));
                  console.log("머리가 아파머리가 아파머리가 아파머리가 아파머리가 아파",JSON.stringify(daysState, null, 2));    
              } else {
                  toast.error("No matching time slot found", { autoClose: 3000, hideProgressBar: true, style: { backgroundColor: '#333' } });
              }
          } else {
              toast.error("Any Date Selection", { autoClose: 3000, hideProgressBar: true, style: { backgroundColor: '#333' } });
          }
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

  const convertTimeToMinutesFromMidnight = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
  };

  const splitTimeSlot = (slot: TimeSlot, appointment: Appointment): TimeSlot[] => {
      if (
          convertTimeToMinutesFromMidnight(slot.startTime) < convertTimeToMinutesFromMidnight(appointment.startTime) &&
          convertTimeToMinutesFromMidnight(slot.endTime) > convertTimeToMinutesFromMidnight(appointment.endTime)
      ) {
          // If the appointment is in the middle of the slot, split it into two
          return [
              { startTime: slot.startTime, endTime: appointment.startTime },
              { startTime: appointment.endTime, endTime: slot.endTime },
          ];
      } else if (
          convertTimeToMinutesFromMidnight(slot.startTime) < convertTimeToMinutesFromMidnight(appointment.startTime) && convertTimeToMinutesFromMidnight(slot.endTime) == convertTimeToMinutesFromMidnight(appointment.endTime)
      ) {
          return [{ ...slot, endTime: appointment.startTime }];
      } else if (
          convertTimeToMinutesFromMidnight(slot.startTime) == convertTimeToMinutesFromMidnight(appointment.startTime) && convertTimeToMinutesFromMidnight(slot.endTime) > convertTimeToMinutesFromMidnight(appointment.endTime)
      ) {
          return [{ ...slot, startTime: appointment.endTime }];
      } else if (
          convertTimeToMinutesFromMidnight(slot.startTime) == convertTimeToMinutesFromMidnight(appointment.startTime) && convertTimeToMinutesFromMidnight(slot.endTime) == convertTimeToMinutesFromMidnight(appointment.endTime)
      ) {
          return [];
      }
      return [{...slot}];
  };
    /////////////////////////// Calendar Part /////////////////////////
    /////////////////////////// Calendar Part /////////////////////////
    /////////////////////////// Calendar Part /////////////////////////
    /////////////////////////// Calendar Part /////////////////////////
    /////////////////////////// Calendar Part /////////////////////////
    /////////////////////////// Calendar Part /////////////////////////


  return (
    <div>
      {/* <h1>보낸이 이름: {username}</h1>
      <h1>보낸이 이메일: {useremail}</h1>
      <h1>받는이 아이디: {targetUserName}</h1>
      <h1>받는이 이메일: {targetUserEmail}</h1> */}

      <button 
        onClick={handleClick} 
        className="bg-blue-500 hover:bg-blue-700 w-36 h-8 py-1 text-white border rounded-md text-sm transition-all ml-4"
      >
        Make an appointment
      </button>
      {formVisible && (
        <div>
          <label style={{ display: 'block', marginBottom: '10px', marginLeft: '10px' }}>
            Name: 
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{
                backgroundColor: 'lightgray', 
                border: 'none', 
                padding: '5px', 
                borderRadius: '5px',
                marginTop: '10px',
                marginLeft: '5px'
              }}
            />
          </label>
          {username === 'Non-members' && (
            <label style={{ display: 'block', marginBottom: '10px', marginLeft: '10px' }}>
              Email: 
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{
                  backgroundColor: 'lightgray', 
                  border: 'none', 
                  padding: '5px', 
                  borderRadius: '5px',
                  marginTop: '10px',
                  marginLeft: '5px'
                }}
              />
            </label>
          )}
          <label style={{ display: 'block', marginBottom: '10px', marginLeft: '10px' }}>
            Memo: 
            <input 
              type="text" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              style={{
                backgroundColor: 'lightgray', 
                border: 'none', 
                padding: '5px', 
                borderRadius: '5px',
                marginTop: '5px',
                marginLeft: '5px'
              }}
            />
          </label>
          <ToastContainer 
                position="bottom-right" // Position of the toast container
                toastClassName="dark-toast" // Custom CSS class for the toast
            />
          <div>
          {/* Display loading fragment while data is being fetched */}
          {loading && <div>Loading...</div>}
          {!loading && (
              <>
                  <h1>날짜를 선택해주세요</h1>
                  <Calendar
                      key={fetchedDates.length}
                      onClickDay={onClickDay}
                      tileClassName={tileClassName}
                      tileDisabled={tileDisabled}
                      tileContent={({ date, view }) => {
                              if (view === 'month') {
                                  const now = new Date();
                                  now.setHours(0, 0, 0, 0);
                                  if (now > date) return null;
                                  const dateString = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)).toISOString().split('T')[0];
                                  const convertedDate = new Date(dateString);
                                  let fianlState;
                                  if (!daysState[dateString]) {
                                      fianlState = daysState[daysOfWeek[convertedDate.getDay()]];
                                  } else fianlState = daysState[dateString];
                                  return fianlState.timeSlots.length ? <div className={styles['custom-style']}></div> : null;
                              }
                      }}
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
                                                  disabled={true}
                                                  defaultTime={timeSlot.startTime}
                                                  maxTime={"23:30"}
                                                  minTime={timeSlotIndex > 0 ? getMinTime(daysState[selectedDate.toISOString().split('T')[0]].timeSlots[timeSlotIndex - 1].endTime) : null} // Pass the end time of the previous slot
                                                  onChangeTime={(selectedTime) => handleTimeChange(selectedDate.toISOString().split('T')[0], timeSlotIndex, 'startTime', selectedTime)}
                                              />
                                          </div>
                                          <div className="flex-1 ml-2">
                                              <p>End</p>
                                              <TimeSelector
                                                  disabled={true}
                                                  defaultTime={timeSlot.endTime}
                                                  onChangeTime={(selectedTime) => handleTimeChange(selectedDate.toISOString().split('T')[0], timeSlotIndex, 'endTime', selectedTime)}
                                                  maxTime={null}
                                                  minTime={getMinTime(daysState[selectedDate.toISOString().split('T')[0]].timeSlots[timeSlotIndex].startTime)}
                                              />
                                          </div>
                                      </div>
                                  ))}
                                  {/* Separator line */}
                                  <hr style={{borderTop: "2px solid black"}} />
                                  {/* New TimeSelector for other users */}
                                  <div className="flex justify-between items-center mt-4">
                                      <div className="flex-1 mr-2">
                                          <p>Start</p>
                                          <TimeSelector
                                              disabled={false}
                                              defaultTime={appointmentState[selectedDate.toISOString().split('T')[0]].timeSlots[0].startTime}
                                              maxTime={"23:30"}
                                              minTime={null}
                                              onChangeTime={(selectedTime) => handleOpponentTimeChange(selectedDate.toISOString().split('T')[0], 0, 'startTime', selectedTime)}
                                              />
                                      </div>
                                      <div className="flex-1 ml-2">
                                          <p>End</p>
                                          <TimeSelector
                                              disabled={false}
                                              defaultTime={appointmentState[selectedDate.toISOString().split('T')[0]].timeSlots[0].endTime}
                                              onChangeTime={(selectedTime) => handleOpponentTimeChange(selectedDate.toISOString().split('T')[0], 0, 'endTime', selectedTime)}
                                              maxTime={null}
                                              minTime={getMinTime(appointmentState[selectedDate.toISOString().split('T')[0]].timeSlots[0].startTime)}
                                              />
                                      </div>
                                  </div>
                              </div>
                          )}
                      {daysState[selectedDate.toISOString().split('T')[0]]?.timeSlots.length === 0 && <div>No available time for {selectedDate.toISOString().split('T')[0]}</div>}
                      </div>
                  )}

                  {/* <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white py-2 px-4 rounded">Submit</button> */}
                  {/* <button onClick={seeDaysState} className="mt-4 ml-2 bg-green-500 text-white py-2 px-4 rounded">Reset</button> */}
                  <ToastContainer 
                      position="bottom-right" // Position of the toast container
                      toastClassName="dark-toast" // Custom CSS class for the toast
                  />
              </>
          )}
      </div>
          <button 
            onClick={handleSendEmail}
            className="bg-red-600 hover:bg-white border-red-600 w-36 h-8 py-1 text-white hover:text-black border rounded-md text-sm transition-all ml-4"
            >
            Send
          </button>
        </div>
      )}
    </div>
  );
  
}

export const getServerSideProps: GetServerSideProps<CatchUserProps | { notFound: boolean }> = async (context) => {
  const session = await getSession(context);

  const username = session?.username || 'Non-members';
  const useremail = session?.user?.email || null;

  const client = await clientPromise;
  await client.connect();
  const collection = client.db('test').collection('users');

  const targetUser = await collection.findOne({ username: (context.params as Params).username });

  if (!targetUser) {
    return {
      notFound: true,
    };
  }

  const targetUserEmail = targetUser.email;
  const targetUserName = targetUser.username;

  return {
    props: {
      username: username as string,
      useremail: useremail as string,
      targetUserEmail: targetUserEmail as string,
      targetUserName: targetUserName as string
    },
  };
};