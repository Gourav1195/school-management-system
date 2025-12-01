// GET all subjects & POST create subject
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // your Prisma client

export async function GET(req: NextRequest) {
  const subjects = await prisma.subject.findMany({
    where: { tenantId: 'yourTenantId' },
    select: { id: true, name: true, code: true },
  });

  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, code } = body;

  if (!name || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const newSubject = await prisma.subject.create({
    data: {
      tenantId: 'yourTenantId',
      name,
      code,
    },
  });

  return NextResponse.json(newSubject);
}
