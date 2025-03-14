import { connectToDatabase } from '../../../utils/db';
import { authMiddleware } from '../../../utils/middleware';

export const GET = authMiddleware(async (req) => {
  const db = await connectToDatabase();
  if (req.user.role !== 'superadmin') {
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const email = url.searchParams.get('email');

  if (email) {
    const user = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ user }), { status: 200 });
  }

  // Fallback for older behavior (not used now, but kept for compatibility)
  const users = await db.collection('users').find({}).toArray();
  return new Response(JSON.stringify({ users }), { status: 200 });
});

export const PUT = authMiddleware(async (req) => {
  const db = await connectToDatabase();
  if (req.user.role !== 'superadmin') {
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }
  const { email, role } = await req.json();
  if (!email || !['user', 'admin', 'superadmin'].includes(role)) {
    return new Response(JSON.stringify({ message: 'Invalid email or role' }), { status: 400 });
  }
  await db.collection('users').updateOne(
    { email },
    { $set: { role } },
    { upsert: true }
  );
  return new Response(JSON.stringify({ message: 'Role updated' }), { status: 200 });
});