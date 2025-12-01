import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { authMiddleware } from '../../../../middleware/auth';
import bcrypt from 'bcrypt';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const { id } = await params;
  const { role, isActive, memberId, email, password, favGroupIds, name } = await req.json();

  try {
    const userUpdateData: any = {};
    const memberUpdateData: any = {};

    if (role) userUpdateData.role = role;
    if (typeof isActive === 'boolean') userUpdateData.isActive = isActive;
    if (memberId) userUpdateData.memberId = memberId;

    // Handle member updates
    if (name) memberUpdateData.name = name;
    if (email) memberUpdateData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      memberUpdateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: userUpdateData,
    });

    // Update linked member if applicable
    if (updatedUser.memberId && (email || password)) {
      await prisma.member.update({
        where: { id: updatedUser.memberId },
        data: memberUpdateData,
      });
    }

    // Handle favorite group update (optional)
    if (Array.isArray(favGroupIds)) {
      await prisma.user.update({
        where: { id },
        data: {
          favGroup: {
            set: favGroupIds.map((groupId: string) => ({
              userId_groupId: {
                userId: id,
                groupId,
              },
            }))
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

// DELETE - remove a user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const { id } = await params

  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.log('err', err)
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 })
  }
}
