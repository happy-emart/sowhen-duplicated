import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography } from '@material-ui/core';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import clientPromise from '../lib/mongodb';

interface FetchResponse {
    success: boolean;
    appointments?: AppointmentProps['appointments'];
  }

interface AppointmentProps {
    appointments: {
      _id: string;
      accepterID: string;
      senderID: string;
      date: string;
      startTime: string;
      endTime: string;
      isAccepted: boolean;
    }[];
  }

  export default function Appointment() {
    const [currentAppointments, setCurrentAppointments] = useState<AppointmentProps['appointments']>([]);
  
    useEffect(() => {
      const userId = "userid";
  
      fetch(`/api/appointments?userId=${userId}`)
        .then(response => response.json())
        .then(data => setCurrentAppointments(data.appointments));
    }, []);
  
    const handleAccept = async (_id: string) => {
        const response = await fetch(`/api/appointments/${_id}`, {
            method: 'PUT',
          });
          const result: FetchResponse = await response.json();
  
      if (result.success) {
        setCurrentAppointments(currentAppointments.map(appointment => appointment._id === _id ? { ...appointment, isAccepted: true } : appointment));
      }
    };
  
    const handleReject = async (_id: string) => {
      const response = await fetch(`/api/appointments/${_id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
  
      if (result.success) {
        setCurrentAppointments(currentAppointments.filter(appointment => appointment._id !== _id));
      }
    };
  
    return (
      <div>
        {currentAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((appointment, index) => (
          <Card key={index} style={{ margin: '1em' }}>
            <CardContent>
              <Typography variant="h6">Sender: {appointment.senderID}</Typography>
              <Typography variant="body2">Date: {appointment.date}</Typography>
              <Typography variant="body2">Start time: {appointment.startTime}</Typography>
              <Typography variant="body2">End time: {appointment.endTime}</Typography>
              <Typography variant="body2">Is accepted: {appointment.isAccepted.toString()}</Typography>
              <Button variant="contained" color="primary" onClick={() => handleAccept(appointment._id)}>Accept</Button>
              <Button variant="contained" color="secondary" onClick={() => handleReject(appointment._id)}>Reject</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }