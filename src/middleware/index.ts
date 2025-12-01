import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

const WINDOW_DURATION = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function rateLimiter(req: NextRequest): boolean {
  const identifier = req.headers.get('x-user-id') || req.headers.get('x-forwarded-for') || 'anon';

  const currentTime = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || currentTime - record.timestamp > WINDOW_DURATION) {
    rateLimitStore.set(identifier, { count: 1, timestamp: currentTime });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function middleware(req: NextRequest) {
  // Rate limiting check
  if (!rateLimiter(req)) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // JWT auth check
  const token = req.cookies.get('token')?.value;
  const verified = token ? await verifyJWT(token) : null;

  if (!verified) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirected', 'true');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/members/:path*', '/finance/:path*', '/test-maker/:path*', '/user/:path*', '/group/:path*', '/settings/:path*'],
};
