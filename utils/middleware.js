import { verifyToken, getTokenFromRequest } from './auth'; // Import getTokenFromRequest
import { NextResponse } from 'next/server';

export function authMiddleware(handler, requireAdmin = false) {
  return async (req) => {
    const token = getTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    if (requireAdmin && user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    req.user = user; // Attach user to request
    return handler(req);
  };
}