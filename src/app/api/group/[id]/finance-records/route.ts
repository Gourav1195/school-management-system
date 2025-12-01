// /api/group/[id]/finance-records/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { FinanceRecord } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params;
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

  const structureType = searchParams.get('structureType') as 'FEE' | 'SALARY' | 'BOTH';
  const search = searchParams.get('search')?.trim() || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const memberWhere: any = {
    tenantId,
    groupId,
    isActive: true,
    exitDate: null,
    ...(search && {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    }),
  };

  // Step 1: Paginate members
  const members = await prisma.member.findMany({
    where: memberWhere,
    select: { id: true, name: true },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const memberIds = members.map((m) => m.id);

  // Step 2: Fetch all finance records for these members
  const records = await prisma.financeRecord.findMany({
    where: {
      tenantId,
      memberId: { in: memberIds },
      ...(structureType !== 'BOTH' && { structureType }),
    },
    orderBy: { createdAt: 'desc' },
  });

  // Step 3: Group by memberId
  const grouped = members.reduce((acc, member) => {
    acc[member.id] = records.filter(r => r.memberId === member.id);
    return acc;
  }, {} as Record<string, FinanceRecord[]>);

  // Step 4: Total member count (for pagination UI)
  const totalCount = await prisma.member.count({ where: memberWhere });

  return NextResponse.json({
    data: grouped,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
  });
}
