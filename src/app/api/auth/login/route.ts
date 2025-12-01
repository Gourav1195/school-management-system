import prisma from '@/lib/prisma';
import { compare } from 'bcrypt';
import { generateJWT } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 🔒 Normalize email (avoid case-sensitive login issues)
    const normalizedEmail = email.toLowerCase();

    // ✅ Fetch member with related user and tenant
    const member = await prisma.member.findUnique({
      where: { email: normalizedEmail },
      include: {
        user: {
          include: { tenant: true },
        },
      },
    });

    if (!member || !member.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await compare(password, member.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = member.user;

    // ✅ Extract role and tenant info safely
    const role: Role = user?.role ?? Role.Viewer;
    const tenantId = user?.tenantId ?? member.tenantId ?? null;
    const plan = user?.tenant?.plan ?? 'Free';

    // ✅ Allow login for system users (SuperAdmin, Sales) even without tenantId
    const isSystemUser = role === Role.SuperAdmin || role === Role.Sales;

    if (!tenantId && !isSystemUser) {
      return NextResponse.json({ error: 'No associated tenant found' }, { status: 403 });
    }

    // ✅ Generate JWT
    const token = await generateJWT({
      userId: user?.id ?? '',
      tenantId: tenantId ?? '',
      role,
      plan,
      memberId: member.id,
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
