// app/api/group/[id]/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // adjust path
import { parseISO } from 'date-fns';
import { verifyJWT } from '../../../../../lib/jwt'
// import { AttendanceRecord } from '@/types/all';
type AttendanceRecord = {
  memberId: string;
  present: boolean;
};

export async function GET(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: groupId } = await params
    const dateParam = req.nextUrl.searchParams.get('date')
    if (!dateParam) {
      return NextResponse.json({ error: 'Missing date query' }, { status: 400 })
    }

    const date = parseISO(dateParam)
    const attendance = await prisma.attendance.findUnique({
      where: { groupId_date: { groupId, date } },
      include: { records: true },
    })

    return NextResponse.json({
      records: attendance?.records.map((r: AttendanceRecord) => ({
        memberId: r.memberId,
        present: r.present,
      })) ?? []
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}



export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } 

) {
  try {
    const { id: groupId } = await params;
    // const groupId = params.id;
    const body = await req.json();
    const { date, records } = body;

    if (!date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token) as { tenantId: string };
    if (!decoded || !decoded.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = decoded.tenantId;

    const isoDate = parseISO(date);

    // Check if attendance already exists
    const existing = await prisma.attendance.findUnique({
      where: {
        groupId_date: {
          groupId,
          date: isoDate,
        }
      },
      include: {
        records: true
      }
    });

    if (existing) {
      // Update records if already exists (delete and re-insert)
      await prisma.attendanceRecord.deleteMany({
        where: {
          attendanceId: existing.id
        }
      });

      await prisma.attendanceRecord.createMany({
        data: records.map((r: AttendanceRecord) => ({
          attendanceId: existing.id,
          memberId: r.memberId,
          present: r.present
        }))
      });

      return NextResponse.json({ message: 'Attendance updated' });
    } else {
      // Create new attendance + records
      const created = await prisma.attendance.create({
        data: {
          groupId,
          tenantId,
          date: isoDate,
          records: {
            create: records.map((r: AttendanceRecord) => ({
              memberId: r.memberId,
              present: r.present,
            }))
          },
        }
      });

      return NextResponse.json({ message: 'Attendance created', attendanceId: created.id });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
