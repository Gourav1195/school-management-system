// backend/api/group/[id]/route.ts
import prisma from '../../../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../../lib/jwt'
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
    if (!decoded || !decoded.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = decoded.tenantId;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'FEE' | 'SALARY';
    const sessionYear = Number(searchParams.get('sessionYear'));

    const groupTypes: GroupType[] = type === 'FEE' ? ['FEE', 'BOTH'] : ['SALARY', 'BOTH'];

    const groups = await prisma.group.findMany({
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

    // const sessionMonths = getSessionMonths();
    const sessionMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

    const groupData = groups.map((group : any) => {
      let expected = 0, paid = 0;

      for (const member of group.members) {
        const paidMonths = member.FinanceRecord.map((fr:any) => fr.month).filter((mon:any) => mon !== null) as number[];
        const mode = type === 'FEE' ? group.feeMode : group.salaryMode;
        const feeOrSalary = mode === 'Group'
          ? (type === 'FEE' ? group.groupFee : group.groupSalary) || 0
          : type === 'FEE' ? member.customFee || 0 : member.customSalary || 0;

        expected += sessionMonths.length * feeOrSalary;
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
