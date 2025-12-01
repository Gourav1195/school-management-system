// app/api/finance/record/[id]/route.ts
///don't use this now
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
// import { verifyJWT } from '../../../../../lib/jwt';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ treat params as a Promise
) {
  const { id } = await params; // ✅ await the promise here

  const { amountPaid, amountExpected, note, dueDate, paidDate } = await req.json();

  try {
    const updated = await prisma.financeRecord.update({
      where: { id },
      data: {
        ...(amountExpected != null && { amountExpected }),
        ...(amountPaid != null && { amountPaid }),
        ...(note && { note }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(paidDate && { paidDate: new Date(paidDate) }),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('UPDATE ERROR', err);
    return NextResponse.json({ error: 'Could not update record' }, { status: 500 });
  }
}
