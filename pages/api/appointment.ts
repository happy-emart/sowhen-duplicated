import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  await client.connect();
  const collection = client.db('user').collection('appointmentTimetable');

  if (req.method === 'GET') {
    const { userId } = req.query;

    const rawAppointments = await collection.find({ accepterID: userId }).toArray();

    if (!rawAppointments || rawAppointments.length === 0) {
      res.status(404).json({ message: 'Not Found' });
      return;
    }

    const appointments = rawAppointments.map((appointment) => ({
      _id: appointment._id.toString(),
      accepterID: appointment.accepterID,
      senderID: appointment.senderID,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      isAccepted: appointment.isAccepted,
    }));

    res.status(200).json({ appointments });
  } else if (req.method === 'PUT') {
    const { _id } = req.query;

    await collection.updateOne({ _id }, { $set: { isAccepted: true } });

    res.status(200).json({ success: true });
  } else if (req.method === 'DELETE') {
    const { _id } = req.query;

    await collection.deleteOne({ _id });

    res.status(200).json({ success: true });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
