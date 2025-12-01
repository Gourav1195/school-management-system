//academics/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> } 
) {
   const { id } = await params; 
  const body = await req.json();

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token) as { tenantId: string };
  const tenantId = decoded.tenantId;

  const { type, data } = body;

  if (!type || !data) {
    return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'subject':
        await prisma.subject.updateMany({ where: { id, tenantId }, data });
        break;
      case 'academicYear':
        await prisma.academicYear.updateMany({ where: { id, tenantId }, data });
        break;
      case 'test':
        await prisma.test.updateMany({ where: { id, tenantId }, data });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[UPDATE_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
