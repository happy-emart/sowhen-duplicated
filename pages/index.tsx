import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Profile from '@/components/profile';
import Tabs from '@/components/tabs';
import {
  getAllUsers,
  UserProps,
  getUserCount,
  getFirstUser
} from '@/lib/api/user';
import { defaultMetaProps } from '@/components/layout/meta';
import clientPromise from '@/lib/mongodb';
import Appointment from '@/components/appointment';

interface AppointmentProps {
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

export default function Home({ user, appointments }: { user: UserProps, appointments: AppointmentProps["appointments"] }) {
  console.log('하아', appointments)
  console.log('wdfd', user)
  return (
    <Tabs appointments={appointments} user={user} />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const accepterId = session?.username;

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    await clientPromise;
  } catch (e: any) {
    if (e.code === 'ENOTFOUND') {
      // cluster is still provisioning
      return {
        props: {
          clusterStillProvisioning: true
        }
      };
    } else {
      throw new Error(`Connection limit reached. Please try again later.`);
    }
  }

  const results = await getAllUsers();
  const totalUsers = await getUserCount();
  const firstUser = await getFirstUser();

  const client = await clientPromise;
  await client.connect();
  const collection = await client.db('user').collection('appointmentTimetable');

  const rawAppointments = await collection.find({ accepterrId: accepterId }).toArray();
  if (!rawAppointments || rawAppointments.length === 0) {
    return {
      notFound: true,
    };
  }


  const appointments = rawAppointments.map((appointment) => ({
    _id: appointment._id.toString(),
    accepterId: appointment.accepterId,
    senderId: appointment.senderId,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    isAccepted: appointment.isAccepted,
  }));
  return {
    props: {
      meta: defaultMetaProps,
      results,
      totalUsers,
      user: firstUser,
      appointments,
    },
  };
};
