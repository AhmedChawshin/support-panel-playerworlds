import { connectToDatabase } from '../../../../utils/db'; // Adjust path as needed
import { authMiddleware } from '../../../../utils/middleware'; // Adjust path as needed

async function handler(req) {
  const db = await connectToDatabase();

  // Define time range
  const now = new Date();
  const past24h = new Date(now - 24 * 60 * 60 * 1000);

  // Access collections
  const ticketsCollection = db.collection('tickets');
  const usersCollection = db.collection('users');

  try {
    // New Tickets (Past 24h)
    const newTickets24h = await ticketsCollection.countDocuments({
      createdAt: { $gte: past24h },
    });

    // Average Response Time (Past 24h)
    const tickets24h = await ticketsCollection
      .find({
        createdAt: { $gte: past24h },
        'replies.0': { $exists: true }, // Has at least one reply
      })
      .toArray();
    const avgResponseTime24h = tickets24h.length
      ? tickets24h.reduce((sum, ticket) => {
          const firstReplyTime = new Date(ticket.replies[0].date) - new Date(ticket.createdAt);
          return sum + firstReplyTime / 1000; // Convert to seconds
        }, 0) / tickets24h.length
      : 0;

    // Total Tickets
    const totalTickets = await ticketsCollection.countDocuments();

    // Total Users
    const totalUsers = await usersCollection.countDocuments();

    // Agent Performance (Past 24h)
    const agentPerformance = await ticketsCollection
      .aggregate([
        { $match: { createdAt: { $gte: past24h }, 'replies.0': { $exists: true } } },
        { $unwind: '$replies' },
        {
          $group: {
            _id: '$replies.by',
            ticketsHandled: { $addToSet: '$_id' },
            responseTimes: { $push: { $subtract: ['$replies.date', '$createdAt'] } },
          },
        },
        {
          $project: {
            email: '$_id',
            ticketsHandled: { $size: '$ticketsHandled' },
            avgResponseTime: { $avg: '$responseTimes' }, // In milliseconds
          },
        },
      ])
      .toArray();

    const stats = {
      newTickets24h,
      avgResponseTime24h,
      totalTickets,
      totalUsers,
      agentPerformance: agentPerformance.map((agent) => ({
        email: agent.email,
        ticketsHandled: agent.ticketsHandled,
        avgResponseTime: agent.avgResponseTime / 1000, // Convert to seconds
      })),
    };

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

// Custom middleware for superadmin role
const superadminMiddleware = (handler) =>
  authMiddleware((req) => {
    if (req.user.role !== 'superadmin') {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
    return handler(req);
  });

export const GET = superadminMiddleware(handler);