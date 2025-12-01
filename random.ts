//older middleware.ts
////DELETE THIS FILE 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60 * 1000; // 1 min
const MAX_REQUESTS = 10;

function getClientKey(req: NextRequest): string {
  return (
    req.headers.get('x-user-id') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon'
  );
}

function rateLimit(req: NextRequest): boolean {
  const key = getClientKey(req);
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS) {
    return true; // Block
  }

  record.count++;
  rateLimitMap.set(key, record);
  return false;
}

export async function middleware(req: NextRequest) {
  // 🔐 Auth
  const token = req.cookies.get('token')?.value;
  const verified = token ? await verifyJWT(token) : null;

  if (!verified) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirected', 'true');
    return NextResponse.redirect(loginUrl);
  }

  // 🚧 Rate Limiting
  if (rateLimit(req)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, slow down 💀' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/members/:path*',
    '/finance/:path*',
    '/test-maker/:path*',
    '/user/:path*',
    '/group/:path*',
    '/settings/:path*',
  ],
};
