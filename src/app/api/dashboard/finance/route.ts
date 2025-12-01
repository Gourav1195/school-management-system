// src/app/api/dashboard/finance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

// Helper to get ISO Week (e.g. "2025-W23")
function getISOWeek(date: Date): string {
  const tmp = new Date(date.getTime());
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string };

    const range = req.nextUrl.searchParams.get('range') || 'monthly';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let from: Date;
    if (range === 'daily') {
      from = new Date(today);
      from.setDate(today.getDate() - 7);
    } else if (range === 'weekly') {
      from = new Date(today);
      from.setDate(today.getDate() - 35);
    } else if (range === 'monthly') {
      from = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    } else if (range === 'yearly') {
      from = new Date(today.getFullYear() - 4, 0, 1);
    } else {
      return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
    }

    const records = await prisma.financeRecord.findMany({
      where: {
        tenantId,
        paidDate: { gte: from, lte: today },
      }
    });

    const bucketMap = new Map<string, { fees: number; salary: number }>();
    for (const record of records) {
      if (!record.paidDate) continue;

      let key = '';
      if (range === 'daily') {
        key = record.paidDate.toISOString().split('T')[0];
      } else if (range === 'weekly') {
        key = getISOWeek(record.paidDate);
      } else if (range === 'monthly') {
        const m = record.paidDate;
        key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      } else if (range === 'yearly') {
        key = `${record.paidDate.getFullYear()}`;
      }

      if (!bucketMap.has(key)) {
        bucketMap.set(key, { fees: 0, salary: 0 });
      }

      const bucket = bucketMap.get(key)!;
      if (record.structureType === 'FEE') {
        bucket.fees += record.amountPaid;
      } else {
        bucket.salary += record.amountPaid;
      }
    }

    const financeData = Array.from(bucketMap.entries())
      .map(([date, values]) => ({
        date,
        fees: values.fees,
        salary: values.salary,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ finance: { feesSalary: financeData } });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
