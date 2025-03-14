import { connectToDatabase } from '../../../../utils/db';
import axios from 'axios';
import { sendTicketUpdateEmail } from '../../../../utils/email';
import { ObjectId } from 'mongodb';
import { newResponse } from '../utils/ticketUtils';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const baseUrl = process.env.WEBPAGE_URL || 'http://localhost:3000';

export async function updateTicket(req) {
  const db = await connectToDatabase();
  const { ticketId, response, status } = await req.json();

  if (!ticketId || (!response && !status)) {
    return newResponse({ message: 'Ticket ID and either response or status required' }, 400);
  }

  const dbUser = await db.collection('users').findOne({
    email: req.user.email.trim().toLowerCase(),
  });
  if (!dbUser) {
    return newResponse({ message: 'User not found in database' }, 403);
  }

  const ticket = await db.collection('tickets').findOne({ _id: new ObjectId(ticketId) });
  if (!ticket) {
    return newResponse({ message: 'Ticket not found' }, 404);
  }
  if (ticket.email !== dbUser.email && dbUser.role !== 'admin' && dbUser.role !== 'superadmin') {
    return newResponse({ message: 'Forbidden' }, 403);
  }

  let update = { $set: { updatedAt: new Date() } };

  if ((dbUser.role === 'admin' || dbUser.role === 'superadmin') && !ticket.assignedAdmin) {
    update.$set.assignedAdmin = dbUser.email;
  }

  if (response) {
    const replyBy = dbUser.role === 'admin' || dbUser.role === 'superadmin' ? 'Support' : dbUser.email;
    update.$push = { replies: { text: response, by: replyBy, date: new Date() } };
    update.$set.status =
      dbUser.role === 'admin' || dbUser.role === 'superadmin' ? 'Waiting for user response' : 'open';
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
    if (dbUser.email === ticket.email && dbUser.role === 'user') {
      await axios.post(webhookUrl, {
        embeds: [
          {
            title: '💬 New Ticket Reply',
            color: 3447003,
            fields: [
              { name: '📌 Ticket ID', value: `#${ticketId}`, inline: true },
              { name: '👤 Replied by', value: dbUser.email, inline: true },
              { name: '📝 Response', value: response },
            ],
            url: `${baseUrl}/admin/tickets/${ticketId}`,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } else if (dbUser.role === 'admin' || dbUser.role === 'superadmin') {
      await sendTicketUpdateEmail(ticket.email, ticketId);
    }
  }

  return newResponse({ message: 'Ticket updated', ticket: updatedTicket.value }, 200);
}