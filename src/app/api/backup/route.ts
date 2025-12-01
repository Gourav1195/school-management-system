// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { parseAsync } from 'json2csv';
// import { parse } from 'csv-parse';

// export async function GET() {
//   const members = await prisma.member.findMany({
//     include: {
//       group: true,
//     },
//   });

//   const fields = ['id', 'name', 'email', 'phoneNo', 'gender', 'group.name'];
//   const opts = { fields };

//   const csv = await parseAsync(members, opts);

//   return new NextResponse(csv, {
//     headers: {
//       'Content-Type': 'text/csv',
//       'Content-Disposition': 'attachment; filename=members.csv',
//     },
//   });
// }

// export async function POST(req: Request) {
//   const formData = await req.formData();
//   const file = formData.get('file') as File;

//   const buffer = await file.arrayBuffer();
//   const text = new TextDecoder().decode(buffer);

//   return new Promise((resolve, reject) => {
//     parse(text, {
//       columns: true,
//       trim: true,
//     }, async (err, records: any[]) => {
//       if (err) return reject(err);

//       for (const rec of records) {
//         await prisma.member.create({
//           data: {
//             name: rec.name,
//             email: rec.email,
//             phoneNo: rec.phoneNo,
//             gender: rec.gender,
//             tenantId: 'your-tenant-id',
//             groupId: rec.groupId,
//           },
//         });
//       }

//       resolve(new Response(JSON.stringify({ success: true })));
//     });
//   });
// }

  // const tableFields: Record<string, string[]> = {
  //   tenants: ['id', 'email', 'name', 'logoUrl', 'plan', 'createdAt'],
  //   users: ['id', 'role', 'createdAt', 'memberId', 'isActive', 'tenantId', 'groupId', 'lastLogin'],
  //   members: ['id', 'name', 'email', 'phoneNo', 'gender', 'tenantId', 'groupId', 'createdAt'],
  //   groups: ['id', 'name', 'tenantId', 'createdAt'],
  //   attendance: ['id', 'memberId', 'groupId', 'date', 'status', 'tenantId', 'createdAt'],
  //   finance: ['id', 'amount', 'type', 'date', 'tenantId', 'createdAt'],
  //   fees: ['id', 'amount', 'description', 'tenantId', 'createdAt'],
  //   salaries: ['id', 'amount', 'description', 'tenantId', 'createdAt'],
  // };

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseAsync as json2csv } from 'json2csv';
import JSZip from 'jszip';
import { verifyJWT } from '@/lib/jwt';
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear
} from 'date-fns';

function getDateRange(range: string | null) {
  const now = new Date();
  let from = new Date(0), to = new Date();

  switch (range) {
    case 'daily': from = startOfDay(now); to = endOfDay(now); break;
    case 'weekly': from = startOfWeek(now, { weekStartsOn: 1 }); to = endOfWeek(now, { weekStartsOn: 1 }); break;
    case 'monthly': from = startOfMonth(now); to = endOfMonth(now); break;
    case 'yearly': from = startOfYear(now); to = endOfYear(now); break;
    default: return null;
  }

  return { from, to };
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string };

    const url = new URL(req.url);
    const tables = url.searchParams.get('tables')?.split(',') ?? [
      'tenant', 'users', 'members', 'groups',
      'attendance', 'finance', 'fees', 'salaries',
      'userfavgroups', 'attendancerecords'
    ];
    const range = url.searchParams.get('range');
    const dateFilter = getDateRange(range);

    const zip = new JSZip();

    const addTable = async (name: string, data: unknown[]) => {
      if (!data?.length) return;
      const csv = await json2csv(data);
      zip.file(`${name}.csv`, csv);
    };

    const tableMap: Record<string, () => Promise<void>> = {
      tenant: async () =>
        addTable('tenants', await prisma.tenant.findMany({
          where: { id: tenantId }
        })),

      users: async () =>
        addTable('users', await prisma.user.findMany({
          where: { tenantId }
        })),

      userfavgroups: async () =>
        addTable('userfavgroups', await prisma.userFavGroup.findMany({
          where: {
            user: { tenantId }
          }
        })),

      groups: async () =>
        addTable('groups', await prisma.group.findMany({
          where: { tenantId }
        })),

      members: async () =>
        addTable('members', await prisma.member.findMany({
          where: {
            tenantId,
            ...(dateFilter ? { joiningDate: { gte: dateFilter.from, lte: dateFilter.to } } : {})
          }
        })),

      attendance: async () =>
        addTable('attendance', await prisma.attendance.findMany({
          where: {
            tenantId,
            ...(dateFilter ? { date: { gte: dateFilter.from, lte: dateFilter.to } } : {})
          }
        })),

      attendancerecords: async () =>
        addTable('attendancerecords', await prisma.attendanceRecord.findMany({
          where: {
            attendance: { tenantId }
          }
        })),

      finance: async () =>
        addTable('financerecords', await prisma.financeRecord.findMany({
          where: {
            tenantId,
            ...(dateFilter ? { createdAt: { gte: dateFilter.from, lte: dateFilter.to } } : {})
          }
        })),

      fees: async () =>
        addTable('feestructures', await prisma.feeStructure.findMany({
          where: { tenantId }
        })),

      salaries: async () =>
        addTable('salarystructures', await prisma.salaryStructure.findMany({
          where: { tenantId }
        })),
    };

    for (const table of tables) {
      const loader = tableMap[table.toLowerCase()];
      if (loader) await loader();
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="backup.zip"',
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
