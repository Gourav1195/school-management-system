import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

// DELETE member
export async function DELETE(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing member ID' }, { status: 400 })
  }

  try {
    await prisma.member.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json({ error: 'Error deleting member' }, { status: 500 })
  }
}

// GET member by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> } 
) {
  // const id = req.nextUrl.pathname.split('/').pop()
  const { id } = await params; 

  if (!id) {
    return NextResponse.json({ error: 'Missing member ID' }, { status: 400 })
  }

  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        group: true,
        tenant: true,
        attendance: true,
        AttendanceRecord: {
          include: {
            attendance: true
          }
        },
        feeStructures: true,
        salaryStructures: true,
        FinanceRecord: true
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json({ error: 'Error fetching member' }, { status: 500 })
  }
}

// UPDATE member
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 

  if (!id) {
    return NextResponse.json({ error: 'Missing member ID' }, { status: 400 });
  }

  try {
    const body = await req.json();

    const updated = await prisma.member.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phoneNo: body.phoneNo,
        gender: body.gender,
        special: body.special,
        criteriaVal: body.criteriaVal,
        customFee: body.customFee,
        customSalary: body.customSalary,
        balance: body.balance,
        groupId: body.groupId,
        hobbies: body.hobbies
        // extend as needed
      },
      include: {
        group: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Error updating member' }, { status: 500 });
  }
}
