import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const getSessionMonths = () => {
  return [...Array(12).keys()].map(i => (i + 3) % 12)
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyJWT(token) as { memberId: string, tenantId: string }

    const member = await prisma.member.findUnique({
      where: { id: decoded.memberId },
      include: {
        attendance: true,
        AttendanceRecord: {
          include: {
            attendance: true
          }
        },
        group: true,
        FinanceRecord: {
          where: {
            structureType: 'FEE'
          }
        },
        
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Attendance % calculation
    const totalAttendance = member.AttendanceRecord.length
    const presentDays = member.AttendanceRecord.filter(r => r.present).length;
    const attendancePercent = totalAttendance > 0
      ? ((presentDays / totalAttendance) * 100).toFixed(1)
      : '0.0'

    // Fee pending calculation
    const sessionMonths = getSessionMonths()
    const paidMonths = member.FinanceRecord.map(r => r.month).filter(m => m !== null) as number[]
    const pendingMonths = sessionMonths.filter(m => !paidMonths.includes(m))

    const mode = member.group?.feeMode
    const monthlyFee = mode === 'Group' ? (member.group?.groupFee || 0) : (member.customFee || 0)

    const expected = sessionMonths.length * monthlyFee
    const paid = member.FinanceRecord.reduce((sum, r) => sum + r.amountPaid, 0)
    const pending = expected - paid

    return NextResponse.json({
      member: {
        name: member.name,
        email: member.email,
        group: member.group?.name || 'No Group',
        attendanceRecords: member.AttendanceRecord.map(r => ({
          attendance: { date: r.attendance.date },
          present: r.present
        })),
      },
      attendance: {
        total: totalAttendance,
        present: presentDays,
        percentage: attendancePercent
      },
      fee: {
        expected,
        paid,
        pending,
        pendingMonthNames: pendingMonths.map(m => monthNames[m])
      }
    })

  } catch (err) {
    console.error('DASHBOARD API ERROR:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
