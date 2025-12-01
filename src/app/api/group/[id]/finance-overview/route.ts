// /api/group/[id]/finance-overview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = (await verifyJWT(token)) as { tenantId: string };
    if (!decoded?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = decoded.tenantId;

    // Query params
    const url = new URL(req.url);
    const structureType = (url.searchParams.get('structureType') || 'BOTH') as
      | 'FEE'
      | 'SALARY'
      | 'BOTH';
    const search = url.searchParams.get('search')?.trim() || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortOrder = (url.searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const validSortFields = ['name', 'joiningDate']; // Extend if needed
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';

    // Load group + global structures
    const group = await prisma.group.findFirst({
      where: { id: groupId, tenantId },
      select: {
        id: true,
        name: true,
        feeMode: true,
        salaryMode: true,
        groupFee: true,
        groupSalary: true,
        feeStructures: { select: { id: true, name: true, amount: true } },
        salaryStructures: { select: { id: true, name: true, amount: true } }
      }
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Count & fetch paginated members
    const memberWhere: any = {
      groupId,
      tenantId,
      isActive: true,
      exitDate: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' }
      })
    };
    const [totalCount, members] = await Promise.all([
      prisma.member.count({ where: memberWhere }),
      prisma.member.findMany({
        where: memberWhere,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          memberNo: true,
          name: true,
          customFee: true,
          customSalary: true,
          feeStructures: { select: { id: true, amount: true } },
          salaryStructures: { select: { id: true, amount: true } },
          FinanceRecord: {
            where: structureType !== 'BOTH'
              ? { structureType }
              : undefined,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              structureType: true,
              amountExpected: true,
              amountPaid: true,
              month: true,
              year: true,
              paidDate: true
            }
          }
        }
      })
    ]);

    // Compute per-member fee/salary based on mode
    const memberData = members.map((m) => {
      // Choose fee or salary
      const isFee = structureType === 'FEE' || structureType === 'BOTH';
      const mode = isFee ? group.feeMode : group.salaryMode;
      const groupStrucs = isFee ? group.feeStructures : group.salaryStructures;
      const memberStrucs = isFee ? m.feeStructures : m.salaryStructures;
      const groupDefault = isFee ? group.groupFee : group.groupSalary;
      const custom = isFee ? m.customFee : m.customSalary;

      let total = 0;
      let source = 'Not Assigned';
      if (mode === 'Group') {
        if (groupStrucs.length) {
          total = groupStrucs.reduce((a, s) => a + s.amount, 0);
          source = 'Group Components';
        } else if (groupDefault) {
          total = groupDefault;
          source = 'Group Default';
        }
      } else {
        if (memberStrucs.length) {
          total = memberStrucs.reduce((a, s) => a + s.amount, 0);
          source = 'Member Components';
        } else if (custom) {
          total = custom;
          source = 'Custom';
        }
      }

      return {
        id: m.id,
        name: m.name,
        total,
        source,
        financeRecords: m.FinanceRecord
      };
    });

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        feeMode: group.feeMode,
        salaryMode: group.salaryMode
      },
      structures: {
        fee: group.feeStructures,
        salary: group.salaryStructures
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      members: memberData
    });
  } catch (err: any) {
    console.error('OVERVIEW ERROR:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
