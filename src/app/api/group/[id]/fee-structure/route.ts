import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyJWT } from '../../../../../lib/jwt';

export async function GET(req: NextRequest,  { params }: { params: Promise<{ id: string }> } ) {
  const { id: groupId } = await params;

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token) as { tenantId: string };
  if (!decoded || !decoded.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      feeStructures: true,
      members: {
        include: {
          feeStructures: true,
        },
      },
    },
  });

  if (!group || group.tenantId !== decoded.tenantId) {
    return NextResponse.json({ error: 'Group not found or unauthorized' }, { status: 404 });
  }

  const feeMode = group.feeMode;

  const feeData = group.members.map((member : any) => {
    let fee = 0;
    let source = 'Not Assigned';

    if (feeMode === 'Group') {
      if (group.feeStructures.length > 0) {
        fee = group.feeStructures.reduce((acc: number, f: any) => acc + f.amount, 0);
        source = `Group Components`;
      } else if (group.groupFee) {
        fee = group.groupFee;
        source = `Group Default`;
      }
    } else {
      if (member.feeStructures.length > 0) {
        fee = member.feeStructures.reduce((acc: number, f:any) => acc + f.amount, 0);
        source = `Member Components`;
      } else if (member.customFee) {
        fee = member.customFee;
        source = `Custom`;
      }
    }

    return {
      id: member.id,
      memberId: member.id,
      structureIds: [
        ...member.feeStructures.map((f:any) => f.id),
        ...group.feeStructures.map((f: any) => f.id),
      ],
      name: member.name,
      fee,
      source,
    };
  });

  return NextResponse.json({
    group: group.name,
    feeMode,
    structures: group.feeStructures.map((f: any) => ({
      id: f.id,
      name: f.name,
      amount: f.amount,
    })),
    fees: feeData,
  });
}

export async function PUT(req: NextRequest,  { params }: { params: Promise<{ id: string }> } ) {
  const { id: groupId } = await params;

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

    const body = await req.json();
    const { structures } = body;

    if (!Array.isArray(structures)) {
      return NextResponse.json({ error: 'Invalid structure format' }, { status: 400 });
    }

    await prisma.feeStructure.deleteMany({ where: { groupId } });

    const created = await prisma.feeStructure.createMany({
      data: structures.map((s: any) => ({
        name: s.name,
        amount: s.amount,
        groupId,
        tenantId: decoded.tenantId,
      })),
    });

    const total = structures.reduce((acc, s) => acc + s.amount, 0);
    await prisma.group.update({
      where: { id: groupId },
      data: { groupFee: total },
    });

    return NextResponse.json({ message: 'Fee structures updated', count: created.count, groupFee: total });
  } catch (err) {
    console.error('Error updating fee structure:', err);
    return NextResponse.json({ error: 'Failed to update fee structure' }, { status: 500 });
  }
}

export async function POST(req: NextRequest,  { params }: { params: Promise<{ id: string }> } ) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token) as { tenantId: string };

    const { id: groupId } = await params;
    const body = await req.json();
    const { components } = body as { components: Array<{ name: string; amount: number }> };

    if (!components || !Array.isArray(components)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await prisma.feeStructure.deleteMany({
      where: { groupId },
    });

    const created = await prisma.feeStructure.createMany({
      data: components.map(c => ({
        name: c.name,
        amount: c.amount,
        groupId,
        tenantId: decoded.tenantId,
      })),
    });

    const total = components.reduce((acc, c) => acc + c.amount, 0);
    await prisma.group.update({
      where: { id: groupId },
      data: { groupFee: total },
    });

    return NextResponse.json({ createdCount: created.count, groupFee: total });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
