// backend/api/group/[id]/route.ts
import prisma from '../../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../lib/jwt'
import { GroupType } from '@prisma/client';

// export function getSessionMonths(): number[] {
//   // Example: full year months for a session
//   // You can customize this to fit academic session logic
//   return [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]; // Apr to Mar academic year
// }

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

    const groupTypes: GroupType[] = type === 'FEE' ? ['FEE', 'BOTH'] : ['SALARY', 'BOTH'];

    const group = await prisma.group.findMany({
      where: {
        tenantId,
        type: { in: groupTypes }
      },
      include: {
        members: {
          include: {
            FinanceRecord: {
              where: {
                structureType: type,
                year: sessionYear
              }
            }
          }
        }
      }
    });
    const sessionMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
    const sessionStartMonth = 4; // April
    const sessionEndMonth = 3;  // March (next year)
    const sessionStartDate = new Date(sessionYear, sessionStartMonth - 1, 1); // April 1
    const sessionEndDate = new Date(sessionYear + 1, sessionEndMonth, 0);     // March 31

    const groupData = group.map((group: any) => {
  let expected = 0;
  let paid = 0;

  for (const member of group.members) {
    const joining = new Date(member.joiningDate || sessionStartDate);
    const effectiveStart = joining > sessionStartDate ? joining : sessionStartDate;

    const monthsActive = sessionMonths.filter(month => {
      const year = month >= 4 ? sessionYear : sessionYear + 1;
      const date = new Date(year, month - 1, 1);
      return date >= effectiveStart && date <= sessionEndDate;
    });

    const mode = type === 'FEE' ? group.feeMode : group.salaryMode;
    const feeOrSalary = mode === 'Group'
      ? (type === 'FEE' ? group.groupFee : group.groupSalary) || 0
      : type === 'FEE' ? member.customFee || 0 : member.customSalary || 0;

    expected += monthsActive.length * feeOrSalary;
    paid += member.FinanceRecord.reduce((sum:any, fr:any) => sum + fr.amountPaid, 0);
  }

  return {
    groupId: group.id,
    groupName: group.name,
    expected,
    paid,
    pending: expected - paid
  };
});

    
    return NextResponse.json({
      groupWise: groupData
    });

  } catch (err) {
    console.error("PENDING GROUP API ERROR", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
