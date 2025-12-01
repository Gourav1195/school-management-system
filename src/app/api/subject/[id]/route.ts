import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // your Prisma client

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> } 
 ) {
  const { id } = await  params; 
  const subject = await prisma.subject.findUnique({
    where: { id},
  });

  if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(subject);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params;
  const body = await req.json();
  const { name, code } = body;

  const updated = await prisma.subject.update({
    where: { id },
    data: { name, code },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> } 
) {
 const { id } = await params; 

  await prisma.subject.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

