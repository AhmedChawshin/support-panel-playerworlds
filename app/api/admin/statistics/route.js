import { connectToDatabase } from '../../../../utils/db';
import { authMiddleware } from '../../../../utils/middleware';

async function handler(req) {
  const db = await connectToDatabase();

  const now = new Date();
  const past24h = new Date(now - 24 * 60 * 60 * 1000);

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
        'replies.0': { $exists: true },
      })
      .toArray();
    const avgResponseTime24h = tickets24h.length
      ? tickets24h.reduce((sum, ticket) => {
          const firstReplyTime = new Date(ticket.replies[0].date) - new Date(ticket.createdAt);
          return sum + firstReplyTime / 1000;
        }, 0) / tickets24h.length
      : 0;

    // Total Tickets
    const totalTickets = await ticketsCollection.countDocuments();

    // Total Users
    const totalUsers = await usersCollection.countDocuments();

    // Agent Performance (Past 24h) - Using assignedAdmin and closed status
    const agentPerformance = await ticketsCollection
      .aggregate([
        { 
          $match: { 
            createdAt: { $gte: past24h },
            status: 'closed',
            assignedAdmin: { $ne: null } // Ensure there's an assigned admin
          } 
        },
        {
          $lookup: {
            from: 'users',
            let: { assignedAdminEmail: '$assignedAdmin' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$email', '$$assignedAdminEmail'] },
                  role: { $in: ['admin', 'superadmin'] }
                }
              }
            ],
            as: 'userInfo'
          }
        },
        // Only keep documents where we found a matching admin/superadmin
        { $match: { 'userInfo.0': { $exists: true } } },
        {
          $group: {
            _id: '$assignedAdmin',
            ticketsHandled: { $addToSet: '$_id' },
            // Calculate time from creation to closing instead of first reply
            resolutionTimes: { $push: { $subtract: ['$updatedAt', '$createdAt'] } },
          },
        },
        {
          $project: {
            email: '$_id',
            ticketsHandled: { $size: '$ticketsHandled' },
            avgResolutionTime: { $avg: '$resolutionTimes' }, // Renamed from avgResponseTime
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
        avgResponseTime: agent.avgResolutionTime / 1000, // Convert to seconds
      })),
    };

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

const superadminMiddleware = (handler) =>
  authMiddleware((req) => {
    if (req.user.role !== 'superadmin') {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
    return handler(req);
  });

export const GET = superadminMiddleware(handler);