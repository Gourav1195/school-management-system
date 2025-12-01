// /api/finance/record/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyJWT } from '../../../../lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const {
      tenantId,
      memberId,
      structureId,
      structureType,
      amountExpected,
      amountPaid = 0,
      month,
      year,
      note
    } = await req.json();

    if (!tenantId || !memberId || !structureId || !structureType || amountExpected == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Compute dueDate as last day of the given month
    let dueDate: Date | undefined = undefined;
    if (typeof month === 'number' && typeof year === 'number') {
      const firstOfNextMonth = new Date(year, month + 1, 1);
      dueDate = new Date(firstOfNextMonth.getTime() - 1); // Last ms of the given month
    }

    const record = await prisma.financeRecord.create({
      data: {
        tenantId,
        memberId,
        structureId,
        structureType,
        amountExpected,
        amountPaid,
        note,
        month,
        year,
        dueDate,
        paidDate: amountPaid > 0 ? new Date() : null,
      },
    });

    return NextResponse.json(record);
  } catch (err: any) {
    console.error('FINANCE RECORD CREATE ERROR:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token) as { tenantId: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const tenantId = decoded.tenantId;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  const structureType = searchParams.get('structureType') as 'SALARY' | 'FEE';
  const where: any = {
    tenantId,
    ...(memberId && { memberId }),
    ...(structureType && { structureType }),
  };
  const records = await prisma.financeRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      member: { select: { name: true } }
    }
  });

  return NextResponse.json(records);
}
