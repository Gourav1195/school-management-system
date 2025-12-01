import prisma from '../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../lib/jwt'
import { AssignmentMode, GroupType, Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token) as { tenantId: string };

    if (!decoded?.tenantId) {
      return NextResponse.json({ error: 'Tenant ID missing' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where = {
      tenantId: decoded.tenantId,
      name: {
        contains: search,
        mode: Prisma.QueryMode.insensitive
      }
    };

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: true,
          feeStructures: true,
          salaryStructures: true,
        },
      }),
      prisma.group.count({ where }),
    ]);

    return NextResponse.json({
      data: groups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error getting groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  const { name, feeMode, salaryMode, groupSalary, groupFee, criteria, type } = await req.json();
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token) as { tenantId: string };
  const tenantId = decoded.tenantId;

  if (!name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const data: any = {
    name,
    tenantId,
    feeMode: feeMode ?? AssignmentMode.Group,
    salaryMode: salaryMode ?? AssignmentMode.Group,
    groupSalary: groupSalary ?? 0.0,
    groupFee: groupFee ?? 0.0,
    criteria,
    type: type ?? GroupType.FEE,
  };

  const group = await prisma.group.create({ data });
  return NextResponse.json(group);
}


// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;
//   const { name } = await req.json();

//   if (!id || !name) {
//     return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
//   }

//   try {
//     const updated = await prisma.group.update({
//       where: { id },
//       data: { name },
//     });

//     return NextResponse.json(updated);
//   } catch (error) {
//     console.error('PUT ERROR:', error);
//     return NextResponse.json({ error: 'Update failed' }, { status: 500 });
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   if (!id) {
//     return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
//   }

//   await prisma.group.delete({
//     where: { id },
//   });

//   return NextResponse.json({ message: 'Group deleted successfully' });
// }
