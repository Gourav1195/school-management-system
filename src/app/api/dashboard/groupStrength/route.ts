import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string };

    const range = req.nextUrl.searchParams.get('range') || 'daily';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1); // include today
    let from: Date;

    if (range === 'daily') {
      from = new Date(today);
      from.setDate(today.getDate() - 7);
    } else if (range === 'weekly') {
      from = new Date(today);
      from.setDate(today.getDate() - 30); // last ~4 weeks
    } else if (range === 'monthly') {
      from = new Date(today.getFullYear(), 0, 1);
    } else if (range === 'yearly') {
      from = new Date(today.getFullYear() - 4, 0, 1);
    } else {
      return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
    }

    const members = await prisma.member.findMany({
      where: {
        tenantId,
        joiningDate: { gte: from, lte: today },
        groupId: { not: null }
      },
      select: {
        id: true,
        joiningDate: true,
        group: { select: { id: true, name: true } }
      }
    });

    const map = new Map<string, Map<string, { groupName: string, count: number }>>();

    for (const m of members) {
      if (!m.joiningDate || !m.group) continue;

      let dateKey = '';

      if (range === 'daily') {
        dateKey = m.joiningDate.toISOString().split('T')[0];
      } else if (range === 'weekly') {
        const date = new Date(m.joiningDate);
        date.setHours(0, 0, 0, 0);
        const thursday = new Date(date);
        thursday.setDate(date.getDate() + 4 - (date.getDay() || 7)); // ISO week start logic
        const yearStart = new Date(thursday.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((+thursday - +yearStart) / 86400000) + 1) / 7);
        dateKey = `${thursday.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
      } else if (range === 'monthly') {
        dateKey = `${m.joiningDate.getFullYear()}-${String(m.joiningDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        dateKey = `${m.joiningDate.getFullYear()}`;
      }

      if (!map.has(dateKey)) map.set(dateKey, new Map());
      const groupMap = map.get(dateKey)!;

      if (!groupMap.has(m.group.id)) {
        groupMap.set(m.group.id, { groupName: m.group.name, count: 0 });
      }
      groupMap.get(m.group.id)!.count += 1;
    }

    const result = Array.from(map.entries()).map(([date, groupsMap]) => ({
      date,
      groups: Array.from(groupsMap.entries()).map(([groupId, g]) => ({
        groupId,
        groupName: g.groupName,
        memberCount: g.count
      }))
    })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ strength: result });

  } catch (err) {
    console.error('Group Strength API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
