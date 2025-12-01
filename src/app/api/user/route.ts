import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/auth';
import bcrypt from 'bcrypt';


// ✅ GET all users
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const { tenantId } = (req as any).user;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId },
        include: {
          member: {
            select: {
              name: true,
              email: true,
              username: true,
              phoneNo: true,
              photoUrl: true,
              dob:true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          member: { name: 'asc' },
        },
      }),
      prisma.user.count({ where: { tenantId } }),
    ]);

    const formatted = users.map((user:any) => ({
      id: user.id,
      role: user.role,
      name: user.member?.name || "-",
      email: user.member?.email || "-",
      username: user.member?.username || "-",
      phoneNo: user.member?.phoneNo || "-",
      photoUrl: user.member?.photoUrl || null,
    }));

    return NextResponse.json({
      users: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ GET /user error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// ✅ Create user + linked member (with login)
export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const { tenantId } = (req as any).user;
  const { name, email, password, role, username, phoneNo, gender, dob } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { error: "Name, email, password, and role are required" },
      { status: 400 }
    );
  }

  try {
    const existingMember = await prisma.member.findFirst({
      where: {
        tenantId,
        OR: [
          { email },
          ...(username ? [{ username }] : []),
        ],
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "Member with same email/username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    
    // Optional: auto-assign to "Unassigned" or "Staging" group
      let assignedGroup = await prisma.group.findFirst({
        where: { name: "Independent", tenantId }
      });

      if (!assignedGroup) {
        assignedGroup = await prisma.group.create({
          data: {
            name: 'Independent',
            type: 'SALARY',
            tenantId,
          },
        });
      }
          
    // 1. Create member
    const newMember = await prisma.member.create({
      data: {
        name,
        email,
        username,
        phoneNo,
        gender,
        dob,
        password: hashedPassword,
        tenantId,
        groupId: assignedGroup.id,
      },
    });

    // 2. Create user linked to member
    const newUser = await prisma.user.create({
      data: {
        role,
        tenantId,
        memberId: newMember.id,
      },
    });

    return NextResponse.json({
      id: newUser.id,
      role: newUser.role,
      name: newMember.name,
      email: newMember.email,
    });
  } catch (err) {
    console.error("❌ POST /user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
