import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

// MongoDB connection string

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, daysState } = req.body;
    try {
        const client = await clientPromise;
        await client.connect();
        const collection = client.db('user').collection('timetable');

        if (req.method === 'GET') {
            const { userId } = req.query;
    
            try {
                // Retrieve the data from the MongoDB collection
                const document = await collection.findOne({ userId });
    
                if (document) {
                    // Respond with the fetched data
                    res.status(200).json({ daysState: document.daysState });
                } else {
                    // Respond with a message indicating no data found for the user
                    res.status(404).json({ message: 'No data found for this user' });
                }
            } catch (error) {
                // Respond with an error message
                res.status(500).json({ error: 'Error retrieving data' });
            }
        } else {
            // Respond with a message indicating the method is not allowed
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error connecting to server' });
    }
}