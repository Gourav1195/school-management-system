// /api/marks/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma  from "@/lib/prisma"; // or wherever your Prisma is

export async function POST(req: NextRequest,) {
  try {
    const body = await req.json();

    const { academicYearId, testId, marks } = body; // marks: [{ memberId, subjectId, marks, remarks }]
    if (!Array.isArray(marks)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const saved = await prisma.$transaction(
      marks.map((mark) =>
        prisma.memberMark.upsert({
          where: {
            memberId_subjectId_testId_academicYear: {
              memberId: mark.memberId,
              subjectId: mark.subjectId,
              testId,
              academicYear: academicYearId,
            },
          },
          update: {
            marks: mark.marks,
            remarks: mark.remarks,
          },
          create: {
            memberId: mark.memberId,
            subjectId: mark.subjectId,
            testId,
            academicYear: academicYearId,
            academicYearId,
            marks: mark.marks,
            remarks: mark.remarks,
          },
        })
      )
    );

    return NextResponse.json({ success: true, saved });
  } catch (err) {
    console.error("Error saving marks:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// /api/marks/route.ts

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');
  const academicYearId = searchParams.get('academicYearId');
  const testId = searchParams.get('testId');

  if (!subjectId || !academicYearId || !testId) {
    return NextResponse.json({ success: false, error: 'Missing query params' }, { status: 400 });
  }

  try {
    const entries = await prisma.memberMark.findMany({
      where: {
        subjectId,
        testId,
        academicYear: academicYearId,
      },
      select: {
        memberId: true,
        marks: true,
        remarks: true,
      },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (err) {
    console.error('GET /api/marks error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
