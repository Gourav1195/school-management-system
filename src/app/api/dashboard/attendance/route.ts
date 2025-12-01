
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

// 🧠 Helpers
function getWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getLabels(from: Date, to: Date, range: string): string[] {
  const labels: string[] = [];
  const d = new Date(from);

  while (d <= to) {
    if (range === 'daily') {
      labels.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    } else if (range === 'weekly') {
      const label = getWeekLabel(d);
      if (!labels.includes(label)) labels.push(label);
      d.setDate(d.getDate() + 7);
    } else if (range === 'monthly') {
      labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      d.setMonth(d.getMonth() + 1);
    } else if (range === 'yearly') {
      labels.push(`${d.getFullYear()}`);
      d.setFullYear(d.getFullYear() + 1);
    }
  }

  return labels;
}

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Auth
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string };

    // 2️⃣ Range
    const range = req.nextUrl.searchParams.get('range') || 'daily';
    const today = new Date();
    let from = new Date();
    let to = new Date(today);

    if (range === 'daily') {
      from.setDate(today.getDate() - 7);
    } else if (range === 'weekly') {
      from.setDate(today.getDate() - 35);
    } else if (range === 'monthly') {
      from = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    } else if (range === 'yearly') {
      from = new Date(today.getFullYear() - 4, 0, 1);
    }

    // 3️⃣ Get Labels
    const labels = getLabels(from, to, range);

    // 4️⃣ Fetch Data
    const attendanceData = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: from, lte: to },
      },
      include: {
        records: true,
        group: {
          select: {
            name: true,
            members: { select: { id: true } }
          }
        }
      }
    });

    // 5️⃣ Group Data
    const groupedMap = new Map<
      string, // group name
      { label: string; present: number; absent: number; total: number; percentPresent: number }[]
    >();

    for (const a of attendanceData) {
      const groupName = a.group.name;
      const label =
        range === 'daily'
          ? a.date.toISOString().split('T')[0]
          : range === 'weekly'
          ? getWeekLabel(a.date)
          : range === 'monthly'
          ? `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`
          : `${a.date.getFullYear()}`;

      const present = a.records.filter(r => r.present).length;
      const total = a.group.members.length;
      const absent = total - present;
      const percent = total ? Math.round((present / total) * 100) : 0;

      if (!groupedMap.has(groupName)) groupedMap.set(groupName, []);
      groupedMap.get(groupName)!.push({ label, present, absent, total, percentPresent: percent });
    }

    // 6️⃣ Fill Missing Labels
    const grouped: Record<string, { label: string; present: number; absent: number; total: number; percentPresent: number }[]> = {};

    for (const [groupName, stats] of groupedMap.entries()) {
      const statMap = stats.reduce<Record<string, typeof stats[0]>>((acc, s) => {
        acc[s.label] = s;
        return acc;
      }, {});

      grouped[groupName] = labels.map(label => {
        return statMap[label] ?? {
          label,
          present: 0,
          absent: 0,
          total: 0,
          percentPresent: 0
        };
      });
    }

    return NextResponse.json({ attendance: { grouped, labels } });
  } catch (err) {
    console.error('Attendance summary error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
