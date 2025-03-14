import { connectToDatabase } from '../../../../utils/db';
import { ObjectId } from 'mongodb';
import { newResponse } from '../utils/ticketUtils';

export async function getTickets(req) {
  const db = await connectToDatabase();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const searchParams = url.searchParams;
  const ticketId = searchParams.get('ticketId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const allTickets =
    searchParams.get('allTickets') === 'true' &&
    (req.user.role === 'admin' || req.user.role === 'superadmin');

  const dbUser = await db.collection('users').findOne({
    email: req.user.email.trim().toLowerCase(),
  });
  if (!dbUser) {
    return newResponse({ message: 'User not found in database' }, 403);
  }

  if (ticketId) {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return newResponse({ message: 'Forbidden' }, 403);
    }
    const ticket = await db.collection('tickets').findOne({ _id: new ObjectId(ticketId) });
    if (!ticket) {
      return newResponse({ message: 'Ticket not found' }, 404);
    }
    return newResponse({ ticket }, 200);
  }

  const skip = (page - 1) * limit;
  const sortOrder = sort === 'newest' ? -1 : 1;

  let query = { email: dbUser.email };
  if (allTickets) {
    query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { graalid: { $regex: search, $options: 'i' } },
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

  return newResponse({ tickets, total }, 200);
}