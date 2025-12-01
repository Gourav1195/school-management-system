// app/api/superadmin/summary/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [tenantsCount, salesCount, revenue, whatsappUsed, tenants] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count({ where: { role: 'Sales' } }),
      prisma.sale.aggregate({
        _sum: { amount: true },
      }),
      prisma.ledger.aggregate({
        _sum: { amount: true },
        where: { coin: 'WHATSAPP_MESSAGE' },
      }),
      prisma.tenant.findMany({
        select: { id: true, name: true, email: true, plan: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      tenantsCount,
      salesCount,
      revenue: revenue._sum.amount ?? 0,
      whatsappUsed: whatsappUsed._sum.amount ?? 0,
      tenants,
    });
  } catch (err) {
    console.error('SUPERADMIN SUMMARY ERROR:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
