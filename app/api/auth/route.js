import { connectToDatabase } from '../../../utils/db';
import { sendCodeEmail } from '../../../utils/email';
import { generateToken } from '../../../utils/auth';

export async function POST(req) {
  const db = await connectToDatabase();
  const { email, code } = await req.json();

  if (!email || (!code && typeof code !== 'undefined')) {
    return new Response(JSON.stringify({ message: 'Email and optional code required' }), { status: 400 });
  }

  // Sanitize and validate email
  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalizedEmail)) {
    return new Response(JSON.stringify({ message: 'Invalid email format' }), { status: 400 });
  }

  if (!code) {
    try {
      const authCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await db.collection('auth_codes').insertOne({ email: normalizedEmail, code: authCode, createdAt: new Date() });
      await sendCodeEmail(normalizedEmail, authCode);
      return new Response(JSON.stringify({ message: 'Code sent' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Failed to send code email' }), { status: 500 });
    }
  } else {
    const savedCode = await db.collection('auth_codes').findOne({ email: normalizedEmail, code });
    if (savedCode && (new Date() - new Date(savedCode.createdAt)) < 15 * 60 * 1000) {
      const user = (await db.collection('users').findOne({ email: normalizedEmail })) || { role: 'user' };
      await db.collection('users').updateOne(
        { email: normalizedEmail },
        { $set: { email: normalizedEmail, role: user.role || 'user', lastLogin: new Date() } },
        { upsert: true }
      );
      const token = generateToken(normalizedEmail, user.role);
      return new Response(JSON.stringify({ message: 'Authenticated', token }), { status: 200 });
    }
    return new Response(JSON.stringify({ message: 'Invalid or expired code' }), { status: 401 });
  }
}