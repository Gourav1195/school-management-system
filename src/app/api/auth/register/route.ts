// /api/auth/register.ts
import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '@/lib/jwt';
import { Role } from '@prisma/client';

const DEFAULT_TENANT_ID = 'equaseed-core';

export async function POST(req: NextRequest) {
  try {
    const { tenantName, email, password, name, role, dob } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashed = await hash(password, 10);

    let tenant;
    let group;

    if (role === Role.SuperAdmin || role === Role.Sales) {
      // 👉 System user path
      tenant = await prisma.tenant.upsert({
        where: { id: DEFAULT_TENANT_ID },
        update: {},
        create: {
          id: DEFAULT_TENANT_ID,
          name: 'Equaseed Internal',
          email: 'core@equaseed.in',
          plan: 'Premium',
        },
      });
    } else {
      // 👉 Normal SaaS tenant
      if (!tenantName) {
        return NextResponse.json({ error: 'Tenant name required for normal users' }, { status: 400 });
      }

      tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          email,
        },
      });

      group = await prisma.group.create({
        data: {
          name: 'Main',
          type: 'SALARY',
          tenantId: tenant.id,
        },
      });
    }

    // Common: create Member
    const member = await prisma.member.create({
      data: {
        name,
        email,
        password: hashed,
        tenantId: tenant.id,
        groupId: group?.id,
        dob: dob ?? new Date(), // or provide a default date, e.g. new Date()
      },
    });

    // Common: create User
    const user = await prisma.user.create({
      data: {
        role,
        tenantId: tenant.id,
        memberId: member.id,
      },
    });

    const token = await generateJWT({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
      memberId: member.id,
      plan: tenant.plan,
    });

    return NextResponse.json({
      token,
      tenant: { name: tenant.name },
      member: { name: member.name, email: member.email },
      role,
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}