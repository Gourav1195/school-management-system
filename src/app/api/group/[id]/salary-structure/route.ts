// File: /app/api/group/[id]/salary-structure/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../../lib/jwt'
import prisma from '../../../../../lib/prisma'

export async function GET(req: NextRequest,  { params }: { params: Promise<{ id: string }> } 
) {
  const { id: groupId } = await params

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
      salaryStructures: true,
      members: {
        include: {
          salaryStructures: true,
        },
      },
    },
  });

  if (!group || group.tenantId !== decoded.tenantId) {
    return NextResponse.json({ error: 'Group not found or unauthorized' }, { status: 404 });
  }

  const salaryMode = group.salaryMode;

  const salaryData = group.members.map((member: any) => {
  let salary = 0;
  let source = 'Not Assigned';

  if (salaryMode === 'Group') {
    if (group.salaryStructures.length > 0) {
      salary = group.salaryStructures.reduce((acc: number, s:any) => acc + s.amount, 0);
      source = `Group Components`;
    } else if (group.groupSalary) {
      salary = group.groupSalary;
      source = `Group Default`;
    }
  }
  else {
    if (member.salaryStructures.length > 0) {
      salary = member.salaryStructures.reduce((acc:number, s:any) => acc + s.amount, 0);
      source = `Member Components`;
    } else if (member.customSalary) {
      salary = member.customSalary;
      source = `Custom`;
    }
  }

    return {
    id: member.id,
    memberId: member.id,
    structureIds: [
      ...member.salaryStructures.map((s:any) => s.id),
      ...group.salaryStructures.map((s:any) => s.id),
    ],
    name: member.name,
    salary,
    source,
  };
});

  return NextResponse.json({
    group: group.name,
    salaryMode,
    structures: group.salaryStructures.map((s:any) => ({
      id: s.id,
      name: s.name,
      amount: s.amount
    })),
    salaries: salaryData
});
}


export async function PUT(req: NextRequest,  { params }: { params: Promise<{ id: string }> } ) {
  const { id: groupId } = await params

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyJWT(token) as { tenantId: string }

    const body = await req.json()
    const { structures } = body // array of { name: string, amount: number }

    if (!Array.isArray(structures)) {
      return NextResponse.json({ error: 'Invalid structure format' }, { status: 400 })
    }

    // Remove existing group-level salary structures for this group
    await prisma.salaryStructure.deleteMany({ where: { groupId } })

    // Create new ones
    const created = await prisma.salaryStructure.createMany({
      data: structures.map((s: any) => ({
        name: s.name,
        amount: s.amount,
        groupId,
        tenantId: decoded.tenantId,
      })),
    })

    // Update groupSalary
    const total = structures.reduce((acc, s) => acc + s.amount, 0)
    await prisma.group.update({
      where: { id: groupId },
      data: { groupSalary: total },
    })

    return NextResponse.json({ message: 'Salary structures updated', count: created.count, groupSalary: total })
  } catch (err) {
    console.error('Error updating salary structure:', err)
    return NextResponse.json({ error: 'Failed to update salary structure' }, { status: 500 })
  }
}

// ===== app/api/group/[id]/salary-structure/route.ts =====


export async function POST(
  request: Request,
   { params }: { params: Promise<{ id: string }> } 
) {
  try {
     const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyJWT(token) as { tenantId: string }
    
    const { id } = await params;
    const body = await request.json();
    const { components } = body as { components: Array<{ name: string; amount: number }> };

    if (!id) {
      return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
    }

    if (!components || !Array.isArray(components)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Delete existing structures for this group
    await prisma.salaryStructure.deleteMany({
        where: { groupId: id },
    });
    

    // Create new rows
    const created = await prisma.salaryStructure.createMany({
      data: components.map((c) => ({
        name: c.name,
        amount: c.amount,
        groupId: id, // should attach here if provided correctly
        tenantId: decoded.tenantId, // TODO: Replace with actual tenantId
        // createdAt/updatedAt handled by Prisma
      })),
    });

    const total = components.reduce((acc, c) => acc + c.amount, 0);

    await prisma.group.update({
      where: { id },
      data: { groupSalary: total },
    });

    return NextResponse.json({ createdCount: created.count });
  } catch (error) {
    console.error('Error creating salary structure:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

