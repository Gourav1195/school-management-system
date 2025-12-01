// backend/api/group/[id]/route.ts
import prisma from '../../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../lib/jwt'
import { AssignmentMode } from '@prisma/client'; // import the enum

// enum AssignmentMode {
//   Group = 'Group',
//   Individual = 'Member'
// }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = (await verifyJWT(token)) as { tenantId: string };

    if (!decoded?.tenantId) {
      return NextResponse.json({ error: "Tenant ID missing" }, { status: 401 });
    }

    const { id } = await params;

    // Parse pagination query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Fetch group metadata (no members yet)
    const group = await prisma.group.findFirst({
      where: {
        id,
        tenantId: decoded.tenantId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Pull out search from query
    const search = searchParams.get("search") || "";

    const [members, totalMembers] = await Promise.all([
      prisma.member.findMany({
        where: {
          groupId: id,
          name: {
            contains: search,
            mode: "insensitive", // so 'ravi' matches 'Ravi'
          },
        },
        skip,
        take: limit,
      }),
      prisma.member.count({
        where: {
          groupId: id,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    ]);

    return NextResponse.json({
      ...group,
      members,
      totalMembers,
      totalPages: Math.ceil(totalMembers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error getting group:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, feeMode, salaryMode, groupSalary, groupFee, criteria, type } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token) as { tenantId: string };

    const data: any = {
      name,
      feeMode: feeMode ?? AssignmentMode.Group,
      salaryMode: salaryMode ?? AssignmentMode.Group,
      tenantId: decoded.tenantId,
    };

    if (groupSalary != null) data.groupSalary = groupSalary;
    if (groupFee != null) data.groupFee = groupFee;
    if (criteria != null) data.criteria = criteria;
    if (type != null) data.type = type;

    const group = await prisma.group.update({
      where: { id },
      data,
    });

    return NextResponse.json(group);
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    await verifyJWT(token) // You can validate tenantId or role here if needed

    await prisma.group.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete error:', err)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
