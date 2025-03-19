import { connectToDatabase } from '../../../utils/db';
import { sendCodeEmail } from '../../../utils/email';
import { generateToken } from '../../../utils/auth';

export async function POST(req) {
  const db = await connectToDatabase();
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Invalid request body' }), { status: 400 });
  }

  const { email, code } = body;

  if (!email || (!code && typeof code !== 'undefined')) {
    return new Response(JSON.stringify({ message: 'Email and optional code required' }), { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalizedEmail)) {
    return new Response(JSON.stringify({ message: 'Invalid email format' }), { status: 400 });
  }

  // Get the client's IP address from the request headers
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.socket.remoteAddress || 'unknown';

  if (!code) {
    try {
      const authCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await db.collection('auth_codes').insertOne({ 
        email: normalizedEmail, 
        code: authCode, 
        createdAt: new Date(),
        ip: ip // IP when the code was generated
      });
      await sendCodeEmail(normalizedEmail, authCode);
      return new Response(JSON.stringify({ message: 'Code sent' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Failed to send code email' }), { status: 500 });
    }
  } else {
    const savedCode = await db.collection('auth_codes').findOne({ email: normalizedEmail, code });
    if (!savedCode) {
      return new Response(JSON.stringify({ message: 'Invalid or expired code' }), { status: 401 });
    }
    if ((new Date() - new Date(savedCode.createdAt)) >= 15 * 60 * 1000) {
      return new Response(JSON.stringify({ message: 'Code expired' }), { status: 401 });
    }

    const user = await db.collection('users').findOne({ email: normalizedEmail });
    const isFirstLogin = !user; // If no user exists, this is the first login

    await db.collection('users').updateOne(
      { email: normalizedEmail },
      { 
        $set: { 
          email: normalizedEmail, 
          role: user?.role || 'user', 
          lastLogin: new Date(),
          lastLoginIp: ip, 
          ...(isFirstLogin && { firstLoginIp: ip }) 
        } 
      },
      { upsert: true }
    );

    const updatedUser = await db.collection('users').findOne({ email: normalizedEmail });
    const token = generateToken(normalizedEmail, updatedUser.role);
    return new Response(JSON.stringify({ message: 'Authenticated', token }), { status: 200 });
  }
}

// Optional: Handle GET if needed (e.g., for testing), but not required for auth flow
export async function GET() {
  return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
}