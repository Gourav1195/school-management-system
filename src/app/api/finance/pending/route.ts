import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

type GroupType = 'FEE' | 'SALARY' | 'BOTH';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Helper for session months April-March
const getSessionMonths = () => {
  return [...Array(12).keys()].map(i => (i + 3) % 12);
};

export async function GET(req: NextRequest) {
  try {
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
    const type = searchParams.get('type') as 'FEE' | 'SALARY';
    const sessionYear = Number(searchParams.get('sessionYear'));
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const skip = (page - 1) * limit;

    const groupTypes: GroupType[] = type === 'FEE' ? ['FEE', 'BOTH'] : ['SALARY', 'BOTH'];

    const totalCount = await prisma.member.count({
      where: {
        tenantId,
        group: {
          is: {
            type: { in: groupTypes }
          }
        }
      }
    });

    const members = await prisma.member.findMany({
      where: {
        tenantId,
        group: {
          is: {
            type: { in: groupTypes }
          }
        }
      },
      include: {
        group: true,
        FinanceRecord: {
          where: {
            structureType: type,
            year: sessionYear
          }
        }
      },
      skip,
      take: limit
    });

    console.log('Session Year:', sessionYear);
    console.log('Group Types:', groupTypes);
    console.log('Found Members:', members.length);

    const sessionMonths = getSessionMonths();

    const memberData = members.map(m => {
      const paidMonths = m.FinanceRecord.map(fr => fr.month).filter(mon => mon !== null) as number[];

      const pendingMonths = sessionMonths.filter(mon => !paidMonths.includes(mon));
      const mode = type === 'FEE' ? m.group?.feeMode : m.group?.salaryMode;
      const feeOrSalary = mode === 'Group'
        ? (type === 'FEE' ? m.group?.groupFee : m.group?.groupSalary) || 0
        : type === 'FEE' ? m.customFee || 0 : m.customSalary || 0;

      const expected = sessionMonths.length * feeOrSalary;
      const paid = m.FinanceRecord.reduce((sum, fr) => sum + fr.amountPaid, 0);
      const pending = expected - paid;

      return {
        id: m.id,
        name: m.name,
        expected,
        paid,
        pending,
        pendingMonthNames: pendingMonths.map(mon => monthNames[mon])
      };
    });

    const grand = memberData.reduce((acc, m) => ({
      expected: acc.expected + m.expected,
      paid: acc.paid + m.paid,
      pending: acc.pending + m.pending
    }), { expected: 0, paid: 0, pending: 0 });

    return NextResponse.json({
      perMember: memberData,
      grand,
      page,
      limit,
      totalCount
    });

  } catch (err) {
    console.error("PENDING FEE API ERROR", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
