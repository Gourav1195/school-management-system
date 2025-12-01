// app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { authMiddleware } from '../../../middleware/auth'
import { verifyJWT } from '@/lib/jwt';

// export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
//   const authError = await authMiddleware(req)
//   if (authError) return authError

//   const { name, criteria, criteriaVal } = await req.json()
//   if (!name || typeof criteriaVal !== 'boolean' || !criteria) {
//     return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
//   }

//   try {
//     const member = await prisma.member.create({
//       data: {
//         name,
//         criteria,
//         criteriaVal,
//         groupId: params.groupId,
//       }
//     })
//     return NextResponse.json(member)
//   } catch (err) {
//     console.error('MEMBER CREATE ERROR:', err)
//     return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
//   }
// }

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token) as { tenantId: string };
  if (!decoded || !decoded.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = decoded.tenantId;

  const body = await req.json();

  const {
    name,
    email,
    phoneNo,
    gender,
    memberNo,
    balance,
    groupId,
    special,
    criteriaVal,
    joiningDate,
    hobbies,
    dob
  } = body;

  if (!name || !groupId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const member = await prisma.member.create({
    data: {
      name,
      email,
      phoneNo,
      gender,
      memberNo,
      balance,
      groupId,
      special,
      criteriaVal,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      tenantId,
      hobbies: hobbies ?? [],
      password: body.password ?? '', // Provide a default or get from request
      dob: body.dob ? new Date(body.dob) : new Date('2025-12-25T10:00:00Z') // Provide a default or get from request
    }
  });

  return NextResponse.json(member);
}

// GET /api/member?groupId=abc123
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  try {
    const groupId = req.nextUrl.searchParams.get("groupId");

    const members = await prisma.member.findMany({
      where: groupId ? { groupId } : undefined,
    });

    return NextResponse.json(members);
  } catch (err) {
    console.error("MEMBER LIST ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

