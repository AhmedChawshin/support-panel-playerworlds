import { connectToDatabase } from '../../../utils/db';
import axios from 'axios';
import { sendTicketUpdateEmail } from '../../../utils/email';
import { ObjectId } from 'mongodb';
import { authMiddleware } from '../../../utils/middleware';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

export const POST = authMiddleware(async (req) => {
  const db = await connectToDatabase();
  const { graalid, type, title, description } = await req.json();
  if (!graalid || !type || !title || !description) {
    return new Response(JSON.stringify({ message: 'All fields required' }), { status: 400 });
  }

  const ticket = {
    email: req.user.email.trim().toLowerCase(),
    graalid,
    type,
    title,
    description,
    createdAt: new Date(),
    replies: [],
    status: 'open',
  };
  const result = await db.collection('tickets').insertOne(ticket);

  await axios.post(webhookUrl, {
    embeds: [
      {
        title: "🎟️ New Ticket Created",
        color: 3447003, // Blue color
        fields: [
          {
            name: "📌 Ticket ID",
            value: `#${result.insertedId}`,
            inline: true
          },
          {
            name: "👤 Created by",
            value: req.user.email,
            inline: true
          }
        ],
        timestamp: new Date().toISOString() // Adds timestamp
      }
    ]
  });
  

  return new Response(JSON.stringify({ message: 'Ticket created', ticketId: result.insertedId }), { status: 201 });
});

export const GET = authMiddleware(async (req) => {
  const db = await connectToDatabase();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || ''; // Unified search param
  const sort = searchParams.get('sort') || 'newest';
  const allTickets = searchParams.get('allTickets') === 'true' && req.user.role === 'admin';

  const dbUser = await db.collection('users').findOne({ email: req.user.email.trim().toLowerCase() });
  if (!dbUser) {
    return new Response(JSON.stringify({ message: 'User not found in database' }), { status: 403 });
  }

  const skip = (page - 1) * limit;
  const sortOrder = sort === 'newest' ? -1 : 1;

  let query = { email: dbUser.email };
  if (allTickets) {
    query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } }, // Case-insensitive partial match for email
        { graalid: { $regex: search, $options: 'i' } }, // Case-insensitive partial match for graalid
      ];
    }
  }

  const total = await db.collection('tickets').countDocuments(query);
  const tickets = await db.collection('tickets')
    .find(query)
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(limit)
    .toArray();

  return new Response(JSON.stringify({ tickets, total }), { status: 200 });
});

export const PUT = authMiddleware(async (req) => {
  const db = await connectToDatabase();
  const { ticketId, response, status } = await req.json();
  if (!ticketId || (!response && !status)) {
    return new Response(JSON.stringify({ message: 'Ticket ID and either response or status required' }), { status: 400 });
  }

  const dbUser = await db.collection('users').findOne({ email: req.user.email.trim().toLowerCase() });
  if (!dbUser) {
    return new Response(JSON.stringify({ message: 'User not found in database' }), { status: 403 });
  }

  const ticket = await db.collection('tickets').findOne({ _id: new ObjectId(ticketId) });
  if (!ticket) {
    return new Response(JSON.stringify({ message: 'Ticket not found' }), { status: 404 });
  }
  if (ticket.email !== dbUser.email && dbUser.role !== 'admin') {
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  let update = { $set: { updatedAt: new Date() } };
  if (response) {
    update.$push = { replies: { text: response, by: dbUser.email, date: new Date() } };
    update.$set.status = dbUser.role === 'admin' ? 'Waiting for user response' : 'open'; // User reply sets to 'open'
  }
  if (status) {
    update.$set.status = status;
  }

  const updatedTicket = await db.collection('tickets').findOneAndUpdate(
    { _id: new ObjectId(ticketId) },
    update,
    { returnDocument: 'after' }
  );

  if (response) {
    if (dbUser.email === ticket.email) {
      if(dbUser.role == "user") {
        await axios.post(webhookUrl, {
          embeds: [
            {
              title: "💬 New Ticket Reply",
              color: 3447003, // Blue color
              fields: [
                {
                  name: "📌 Ticket ID",
                  value: `#${ticketId}`,
                  inline: true
                },
                {
                  name: "👤 Replied by",
                  value: dbUser.email,
                  inline: true
                },
                {
                  name: "📝 Response",
                  value: response
                }
              ],
              timestamp: new Date().toISOString() // Adds timestamp
            }
          ]
        });
        
      }
    } else {
      await sendTicketUpdateEmail(ticket.email, ticketId);
    }
  }

  return new Response(JSON.stringify({ message: 'Ticket updated', ticket: updatedTicket.value }), { status: 200 });
});