import { connectToDatabase } from '../../../../utils/db';
import axios from 'axios';
import { newResponse } from '../utils/ticketUtils'; 

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const baseUrl = process.env.WEBPAGE_URL || 'http://localhost:3000';

export async function createTicket(req) {
  const db = await connectToDatabase();
  const { graalid, type, title, description } = await req.json();

  if (!graalid || !type || !title || !description) {
    return newResponse({ message: 'All fields required' }, 400);
  }

  const userEmail = req.user.email.trim().toLowerCase();

  // Check active ticket count
  const activeTicketsCount = await db.collection('tickets').countDocuments({
    email: userEmail,
    status: { $in: ['open', 'Waiting for user response'] },
  });

  if (activeTicketsCount >= 3) {
    return newResponse({ message: 'Maximum of 3 active tickets allowed per user' }, 429);
  }

  const ticket = {
    email: userEmail,
    graalid,
    type,
    title,
    description,
    createdAt: new Date(),
    replies: [],
    status: 'open',
    assignedAdmin: null,
  };

  const result = await db.collection('tickets').insertOne(ticket);

  await axios.post(webhookUrl, {
    embeds: [
      {
        title: '🎟️ New Ticket Created',
        color: 3447003,
        fields: [
          { name: '📌 Ticket ID', value: `#${result.insertedId}`, inline: true },
          { name: '👤 Created by', value: userEmail, inline: true },
        ],
        url: `${baseUrl}/admin/tickets/${result.insertedId}`,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  return newResponse({ message: 'Ticket created', ticketId: result.insertedId }, 201);
}