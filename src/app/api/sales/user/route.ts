// /api/sales/users/route.ts or index.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { Role } from '@prisma/client';
import { hash } from 'bcrypt';
  
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search')?.trim();
    const skip = (page - 1) * limit;

    const role = 'Sales';

    // Optional: Extract token for tenant-scoping
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const decoded = token ? await verifyJWT(token) : null;

    const tenantId = decoded?.tenantId ?? undefined;

    const where: any = {
      role,
      ...(tenantId ? { tenantId } : {}),
      ...(search
        ? {
            member: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNo: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { member: true, group: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('GET Sales Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (!decoded || !decoded.tenantId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const tenantId = decoded.tenantId;
  const body = await req.json();

  const {
    name,
    email,
    phoneNo,
    gender,
    groupId,
    joiningDate,
    dob, 
    password,
  } = body;

  // Default password logic
  let finalPassword = password;
  if (!finalPassword && dob) {
    const date = new Date(dob);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    finalPassword = `${dd}${mm}${yyyy}`; // 👉 DDMMYYYY
  }

  if (!finalPassword) {
    return NextResponse.json({ error: 'DOB or password required' }, { status: 400 });
  }

  const hashed = await hash(finalPassword, 10);

  const member = await prisma.member.create({
    data: {
      name,
      email,
      phoneNo,
      gender,
      dob: dob ? new Date(dob) : new Date(),
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      tenantId,
      groupId,
      password: hashed,
    },
  });

  const user = await prisma.user.create({
    data: {
      role: Role.Sales,
      tenantId,
      memberId: member.id,
      groupId,
    },
  });

  return NextResponse.json({ user, member });
}
