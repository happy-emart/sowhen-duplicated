import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

// MongoDB connection string

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const client = await clientPromise;
        await client.connect();
        const collection = client.db('user').collection('appointmentTimetable');

        if (req.method === 'POST') {
            const newDocument = req.body;
            try {
                // Insert the data into the MongoDB collection
                await collection.insertOne(newDocument);
    
                // Respond with a success message
                res.status(200).json({ success: 'Data inserted successfully' });
            } catch (error) {
                // Respond with an error message
                res.status(500).json({ error: 'Error inserting data' });
            }
        } else if (req.method === 'GET') {
            const { accepterId } = req.query;
    
            try {
                // Retrieve the data from the MongoDB collection
                const documents = await collection.find({ accepterId: accepterId }).toArray();
                if (documents.length > 0) {
                    // Respond with the fetched data
                    res.status(200).json({ appointmentState: documents });
                } else {
                    // Respond with a message indicating no data found for the user
                    res.status(404).json(null);
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