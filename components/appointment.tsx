import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography } from '@material-ui/core';

export interface AppointmentProps {
    appointments: {
      _id: string;
      accepterId: string;
      senderId: string;
      date: string;
      startTime: string;
      endTime: string;
      isAccepted: boolean;
    }[];
  }

  export default function Appointment({ appointments }: AppointmentProps) {
    const [currentAppointments, setCurrentAppointments] = useState<AppointmentProps['appointments']>([]);
  
    useEffect(() => {
      setCurrentAppointments(appointments);
    }, [appointments]);
  
    const handleAccept = async (_id: string) => {
      await fetch('/api/appointments/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id :_id }),
      });
    
      setCurrentAppointments(currentAppointments.map(appointment => appointment._id === _id ? { ...appointment, isAccepted: true } : appointment));
    
      console.log('Appointment accepted');
    }
    
    const handleReject = async (_id: string) => {
      await fetch('/api/appointments/reject', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id :_id }),
      });
    
      setCurrentAppointments(currentAppointments.filter(appointment => appointment._id !== _id));
    }
  
    return (
      <div>
          {currentAppointments && currentAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((appointment, index) => (
              <Card key={index} style={{ margin: '1em' }}>
                  <CardContent>
                      <Typography variant="h6">Sender: {appointment.senderId}</Typography>
                      <Typography variant="body2">Date: {appointment.date}</Typography>
                      <Typography variant="body2">Start time: {appointment.startTime}</Typography>
                      <Typography variant="body2">End time: {appointment.endTime}</Typography>
                      <Typography variant="body2">Is accepted: {appointment.isAccepted.toString()}</Typography>
                      {!appointment.isAccepted && (
                          <>
                              <Button variant="contained" color="primary" onClick={() => handleAccept(appointment._id)}>Accept</Button>
                              <Button variant="contained" color="secondary" onClick={() => handleReject(appointment._id)}>Reject</Button>
                          </>
                      )}
                  </CardContent>
              </Card>
          ))}
      </div>
  );
}


 