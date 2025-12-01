import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string }

    const range = req.nextUrl.searchParams.get('range') || 'monthly'
    const today = new Date()
    let from: Date, prevFrom: Date, prevTo: Date

    if (range === 'daily') {
      from = new Date(today)
      from.setDate(today.getDate() - 1)

      prevTo = new Date(from)
      prevFrom = new Date(prevTo)
      prevFrom.setDate(prevFrom.getDate() - 1)

    } else if (range === 'weekly') {
      from = new Date(today)
      from.setDate(today.getDate() - 7)

      prevTo = new Date(from)
      prevFrom = new Date(prevTo)
      prevFrom.setDate(prevFrom.getDate() - 7)

    } else if (range === 'monthly') {
      from = new Date(today.getFullYear(), today.getMonth(), 1)

      prevTo = new Date(from)
      prevTo.setDate(0) // last day of previous month
      prevFrom = new Date(prevTo.getFullYear(), prevTo.getMonth(), 1)

    } else if (range === 'yearly') {
      from = new Date(today.getFullYear(), 0, 1)

      prevTo = new Date(from)
      prevTo.setDate(-1)
      prevFrom = new Date(prevTo.getFullYear(), 0, 1)

    } else {
      return NextResponse.json({ error: 'Invalid range' }, { status: 400 })
    }

    // Current Period Data
    const [totalFeesCurr, newMembersCurr, pendingCurr] = await Promise.all([
      prisma.financeRecord.aggregate({
        where: {
          tenantId,
          structureType: 'FEE',
          paidDate: { gte: from, lte: today },
        },
        _sum: { amountPaid: true }
      }),

      prisma.member.count({
        where: {
          tenantId,
          joiningDate: { gte: from, lte: today },
        },
      }),

      prisma.financeRecord.aggregate({
        where: {
          tenantId,
          structureType: 'FEE',
          amountPaid: { lt: prisma.financeRecord.fields.amountExpected },
        },
        _sum: {
          amountExpected: true,
          amountPaid: true,
        },
      })
    ])

    const totalPendingCurr = (pendingCurr._sum.amountExpected || 0) - (pendingCurr._sum.amountPaid || 0)

    // Previous Period Data
    const [totalFeesPrev, newMembersPrev] = await Promise.all([
      prisma.financeRecord.aggregate({
        where: {
          tenantId,
          structureType: 'FEE',
          paidDate: { gte: prevFrom, lte: prevTo },
        },
        _sum: { amountPaid: true }
      }),

      prisma.member.count({
        where: {
          tenantId,
          joiningDate: { gte: prevFrom, lte: prevTo },
        },
      }),
    ])

    const calcGrowth = (prev: number, curr: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100

    const floor2 = (num: number) => Math.floor(num * 100) / 100

    return NextResponse.json({
      summary: {
        totalFees: floor2(totalFeesCurr._sum.amountPaid || 0),
        newMembers: newMembersCurr,
        pendingFees: floor2(totalPendingCurr),

        feeGrowthPercent: floor2(calcGrowth(totalFeesPrev._sum.amountPaid || 0, totalFeesCurr._sum.amountPaid || 0)),
        memberGrowthPercent: floor2(calcGrowth(newMembersPrev, newMembersCurr)),
        pendingGrowthPercent: 0 // You can’t calculate this easily without time dimension
      },
    })
  } catch (err) {
    console.error('Dashboard summary error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
