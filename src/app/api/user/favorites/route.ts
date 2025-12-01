import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId;

    const favorites = await prisma.userFavGroup.findMany({
      where: { userId },
      include: {
        group: {
        select: {
            id: true,
            name: true,
            },
            },
        },
    });
    // const favoriteGroupIds = favorites.map((f: { groupId: number }) => f.groupId);
    return NextResponse.json({ favorites: favorites.map((fav: { group: { id: string; name: string } }) => fav.group) });

  } catch (err) {
    console.error('GET /favorites error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId;

    const { groupId } = await req.json();
    if (!groupId) return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });

    await prisma.userFavGroup.create({
      data: { userId, groupId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Unique constraint failed (already added)
      return NextResponse.json({ success: true });
    }
    console.error('POST /favorites error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = decoded.userId;

    const { groupId } = await req.json();
    if (!groupId) return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });

    await prisma.userFavGroup.deleteMany({
      where: { userId, groupId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /favorites error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
