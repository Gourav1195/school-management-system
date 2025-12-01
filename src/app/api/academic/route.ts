//academics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt'

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyJWT(token) as { tenantId: string }
    const tenantId = decoded.tenantId;
    // console.log('tenantId', tenantId)
      if (!decoded || !tenantId) {
        return NextResponse.json({ error: 'Tenant ID missing' }, { status: 401 })
      }

  try {
    const subjects = await prisma.subject.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    const academicYears = await prisma.academicYear.findMany({
      select: {
        id: true,
        label: true,
      },
    });

    const tests = await prisma.test.findMany({
      select: {
        id: true,
        name: true,
        academicYearId: true,
      },
    });

    return NextResponse.json({
      subjects,
      academicYears,
      tests,
    });
  } catch (err) {
    console.error('[ACADEMIC_GET_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, data } = body;

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token) as { tenantId: string };
  const tenantId = decoded.tenantId;

  // Inject tenantId into the data
  const dataWithTenant = { ...data, tenantId };

  try {
    switch (type) {
      case 'subject':
        if (!dataWithTenant.name || !dataWithTenant.code) {
          return NextResponse.json({ error: 'Missing subject fields' }, { status: 400 });
        }
        const newSubject = await prisma.subject.create({ data: dataWithTenant });
        return NextResponse.json({ subject: newSubject });

      case 'academicYear':
        if (!dataWithTenant.label) {
          return NextResponse.json({ error: 'Missing academic year label' }, { status: 400 });
        }
        const newYear = await prisma.academicYear.create({ data: dataWithTenant });
        return NextResponse.json({ academicYear: newYear });

      case 'test':
        if (!dataWithTenant.name || !dataWithTenant.academicYearId) {
          return NextResponse.json({ error: 'Missing test fields' }, { status: 400 });
        }
        const newTest = await prisma.test.create({ data: dataWithTenant });
        return NextResponse.json({ test: newTest });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (err) {
    console.error('[MARKS_POST_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}