// /api/sales-users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> } ) {
  const { id } = await params; 
  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> } ) {
  const { id } = await params; 

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
