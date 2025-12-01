// POST /api/member/[id]/salary-structure
//“Each payment logically relates to the structures of the member/group at that time; we don't store exact structure linkage in DB for simplicity. And its not needed TBH”
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyJWT } from '../../../../../lib/jwt';

export async function POST(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: memberId } = await params;
    const { components } = await req.json();

    if (!components || !Array.isArray(components)) {
      return NextResponse.json({ error: 'Components array is required' }, { status: 400 });
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

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { group: true },
    });

    if (!member || member.group?.salaryMode !== 'Member') {
      return NextResponse.json({ error: 'Salary updates allowed only in Member mode' }, { status: 403 });
    }

    // Delete existing structures
    await prisma.salaryStructure.deleteMany({
      where: { memberId, tenantId: decoded.tenantId },
    });

    // Create new structures
    const created = await prisma.salaryStructure.createMany({
      data: components.map(c => ({
        name: c.name,
        amount: parseFloat(c.amount),
        memberId,
        tenantId: decoded.tenantId,
      })),
    });

    // Update customSalary
    const sum = components.reduce((acc, c) => acc + parseFloat(c.amount), 0);
    await prisma.member.update({
      where: { id: memberId },
      data: { customSalary: sum },
    });

    return NextResponse.json({ createdCount: created.count, totalSalary: sum });
  } catch (error) {
    console.error('Error saving salary structure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: memberId } = await params;

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token) as { tenantId: string };

    const structures = await prisma.salaryStructure.findMany({
      where: {
        memberId,
        tenantId: decoded.tenantId,
      },
      orderBy: { createdAt: 'asc' }, // optional: keep it ordered
    });

    return NextResponse.json({
      structures: structures.map((s:any) => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
      })),
    });
  } catch (error) {
    console.error('Error fetching salary structures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

