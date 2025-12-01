// app/api/tenant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (!decoded || !decoded.tenantId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: decoded.tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      logoUrl: true,
      plan: true,
      createdAt: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  return NextResponse.json(tenant);
}

// app/api/tenant/route.ts
export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (!decoded || !decoded.tenantId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { name, email, logoUrl } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const updated = await prisma.tenant.update({
    where: { id: decoded.tenantId },
    data: {
      name,
      email,
      logoUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      logoUrl: true,
    },
  });

  return NextResponse.json(updated);
}
