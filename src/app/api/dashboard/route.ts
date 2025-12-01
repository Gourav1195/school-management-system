// import { NextRequest, NextResponse } from 'next/server';
// import { parseISO } from 'date-fns';
// import prisma from '../../../lib/prisma';
// import { verifyJWT } from '../../../lib/jwt'; // Make sure this path is correct

// export async function GET(req: NextRequest) {
//   try {
//     const fromParam = req.nextUrl.searchParams.get('from');
//     const toParam = req.nextUrl.searchParams.get('to');
//     const authHeader = req.headers.get('authorization');

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = verifyJWT(token) as { tenantId: string };
//     const tenantId = decoded.tenantId;

//     if (!fromParam || !toParam) {
//       return NextResponse.json({ error: 'Missing from/to params' }, { status: 400 });
//     }

//     const from = parseISO(fromParam);
//     const to = parseISO(toParam);

//     // ---------- 1. Attendance: group-wise + daily ----------
//     const attendanceData = await prisma.attendance.findMany({
//       where: {
//         tenantId,
//         date: {
//           gte: from,
//           lte: to,
//         },
//       },
//       include: {
//         records: true,
//         group: true,
//       },
//     });

//     const groupedAttendance: Record<string, { groupName: string; data: { date: string; percent: number }[] }> = {};
//     const allAttendanceDates = new Set<string>();

//     for (const entry of attendanceData) {
//       const groupId = entry.groupId;
//       const date = entry.date.toISOString().split('T')[0];
//       const present = entry.records.filter(r => r.present).length;
//       const total = entry.records.length;
//       const percent = total === 0 ? 0 : Math.round((present / total) * 100);

//       if (!groupedAttendance[groupId]) {
//         groupedAttendance[groupId] = {
//           groupName: entry.group.name,
//           data: [],
//         };
//       }

//       groupedAttendance[groupId].data.push({ date, percent });
//       allAttendanceDates.add(date);
//     }

//     // fill missing days with 0% attendance for consistency
//     const allDates = [];
//     for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
//       allDates.push(d.toISOString().split('T')[0]);
//     }

//     for (const groupId in groupedAttendance) {
//       const filled: { date: string; percent: number }[] = allDates.map(date => {
//         const match = groupedAttendance[groupId].data.find(d => d.date === date);
//         return {
//           date,
//           percent: match?.percent ?? 0,
//         };
//       });
//       groupedAttendance[groupId].data = filled;
//     }

//     // ---------- 2. Finance: daily fees vs salary paid ----------
//     const financeRecords = await prisma.financeRecord.findMany({
//       where: {
//         tenantId,
//         paidDate: {
//           gte: from,
//           lte: to,
//         },
//       },
//     });

//     const financeMap = new Map<string, { fees: number; salary: number }>();

//     for (const record of financeRecords) {
//       if (!record.paidDate) continue;

//       const date = record.paidDate.toISOString().split('T')[0];
//       if (!financeMap.has(date)) {
//         financeMap.set(date, { fees: 0, salary: 0 });
//       }

//       const stat = financeMap.get(date)!;
//       if (record.structureType === 'FEE') {
//         stat.fees += record.amountPaid;
//       } else if (record.structureType === 'SALARY') {
//         stat.salary += record.amountPaid;
//       }
//     }

//     // fill all days with 0 if not present
//     const feesSalary = allDates.map(date => {
//       const entry = financeMap.get(date);
//       return {
//         date,
//         fees: Math.round(entry?.fees ?? 0),
//         salary: Math.round(entry?.salary ?? 0),
//       };
//     });

//     return NextResponse.json({
//       attendance: {
//         dailyGrouped: Object.fromEntries(
//           Object.entries(groupedAttendance).map(([groupId, val]) => [groupId, val.data])
//         ),
//       },
//       finance: {
//         feesSalary,
//       },
//     });
//   } catch (err) {
//     console.error('[DASHBOARD API ERROR]', err);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }




// app/api/dashboard/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '../../../lib/prisma';
// import { parseISO } from 'date-fns';
// import { verifyJWT } from '../../../lib/jwt';

// export async function GET(req: NextRequest) {
//   try {
//     const authHeader = req.headers.get('authorization');
//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = await verifyJWT(token) as { tenantId: string };
//     const tenantId = decoded.tenantId;

//     const fromParam = req.nextUrl.searchParams.get('from');
//     const toParam = req.nextUrl.searchParams.get('to');

//     if (!fromParam || !toParam) {
//       return NextResponse.json({ error: 'Missing from/to params' }, { status: 400 });
//     }

//     const from = parseISO(fromParam);
//     const to = parseISO(toParam);

//     // 🔍 Fetch finance records by paidDate
//     const financeRecords = await prisma.financeRecord.findMany({
//       where: {
//         tenantId,
//         paidDate: {
//           gte: from,
//           lte: to,
//         },
//       },
//     });

//     // 🧮 Group by date and type
//     const dailyMap = new Map<string, { fees: number; salary: number; feesPending: number; salaryPending: number }>();

//     for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
//       const key = d.toISOString().split('T')[0];
//       dailyMap.set(key, { fees: 0, salary: 0, feesPending: 0, salaryPending: 0 });
//     }

//     // Populate paid amounts
//     for (const record of financeRecords) {
//       if (!record.paidDate) continue;
//       const dateKey = record.paidDate.toISOString().split('T')[0];
//       const daily = dailyMap.get(dateKey)!;

//       if (record.structureType === 'FEE') {
//         daily.fees += record.amountPaid;
//       } else if (record.structureType === 'SALARY') {
//         daily.salary += record.amountPaid;
//       }
//     }

//     // Fetch group + member info to compute pending
//     const groups = await prisma.group.findMany({
//       where: { tenantId },
//       include: {
//         members: true
//       }
//     });

//     for (const [dateKey, daily] of dailyMap.entries()) {
//       // Pending FEE
//       let expectedFee = 0;
//       let paidFee = 0;

//       for (const group of groups) {
//         if (group.type === 'FEE' || group.type === 'BOTH') {
//           if (group.feeMode === 'Group') {
//             expectedFee += (group.groupFee || 0) * group.members.length;
//           } else {
//             expectedFee += group.members.reduce((sum, m) => sum + (m.customFee || 0), 0);
//           }
//         }
//       }

//       paidFee = daily.fees;
//       daily.feesPending = expectedFee - paidFee;

//       // Pending SALARY
//       let expectedSalary = 0;
//       let paidSalary = 0;

//       for (const group of groups) {
//         if (group.type === 'SALARY' || group.type === 'BOTH') {
//           if (group.salaryMode === 'Group') {
//             expectedSalary += (group.groupSalary || 0) * group.members.length;
//           } else {
//             expectedSalary += group.members.reduce((sum, m) => sum + (m.customSalary || 0), 0);
//           }
//         }
//       }

//       paidSalary = daily.salary;
//       daily.salaryPending = expectedSalary - paidSalary;
//     }

//     const feesSalary = Array.from(dailyMap.entries())
//       .map(([date, { fees, salary, feesPending, salaryPending }]) => ({
//         date,
//         fees,
//         salary,
//         feesPending,
//         salaryPending
//       }))
//       .sort((a, b) => a.date.localeCompare(b.date));
//     // console.log("Grouped finance by date", Array.from(dailyMap.entries()));


//     /////////////////////
//     // 1) Fetch attendance + records + group roster size
//     const attendanceData = await prisma.attendance.findMany({
//       where: {
//         tenantId,
//         date: { gte: from, lte: to },
//       },
//       include: {
//         records: true,
//         group: {
//           select: {
//             name: true,
//             members: { select: { id: true } }  // to know full group size
//           }
//         }
//       }
//     });

//     // Prepare maps
//     const dailyGroupedMap = new Map<
//       string, // groupName
//       { date: string; present: number; absent: number; total: number; percentPresent: number }[]
//     >();
//     const allDates: string[] = [];
//     for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
//       allDates.push(d.toISOString().split('T')[0]);
//     }

//     // 2) Aggregate
//     for (const a of attendanceData) {
//       const groupName = a.group.name;
//       const dateKey = a.date.toISOString().split('T')[0];
//       const present = a.records.filter((r: any) => r.present).length;
//       const totalOnRoll = a.group.members.length;
//       const absent = totalOnRoll - present;
//       const percentPresent = totalOnRoll
//         ? Math.round((present / totalOnRoll) * 100)
//         : 0;

//       if (!dailyGroupedMap.has(groupName)) {
//         dailyGroupedMap.set(groupName, []);
//       }
//       dailyGroupedMap.get(groupName)!.push({ date: dateKey, present, absent, total: totalOnRoll, percentPresent });
//     }

//     // 3) Fill in any missing dates per group with zeros
//     const dailyGrouped: Record<string, typeof dailyGroupedMap extends Map<infer K, infer V> ? V : never> = {};
//     for (const [groupName, stats] of dailyGroupedMap) {
//       const keyed = stats.reduce<Record<string, { date: string; present: number; absent: number; total: number; percentPresent: number }>>((acc, s) => {
//         acc[s.date] = s;
//         return acc;
//       }, {});
//       dailyGrouped[groupName] = allDates.map(date => {
//         const s = keyed[date];
//         return s ?? { date, present: 0, absent: 0, total: 0, percentPresent: 0 };
//       });
//     }

//     return NextResponse.json({
//       attendance: { dailyGrouped },
//       finance: { feesSalary },
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

// 🧠 Helpers
function getWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getLabels(from: Date, to: Date, range: string): string[] {
  const labels: string[] = [];
  const d = new Date(from);

  while (d <= to) {
    if (range === 'daily') {
      labels.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    } else if (range === 'weekly') {
      const label = getWeekLabel(d);
      if (!labels.includes(label)) labels.push(label);
      d.setDate(d.getDate() + 7);
    } else if (range === 'monthly') {
      labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      d.setMonth(d.getMonth() + 1);
    } else if (range === 'yearly') {
      labels.push(`${d.getFullYear()}`);
      d.setFullYear(d.getFullYear() + 1);
    }
  }

  return labels;
}

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Auth
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string };

    // 2️⃣ Range
    const range = req.nextUrl.searchParams.get('range') || 'daily';
    const today = new Date();
    let from = new Date();
    let to = new Date(today);

    if (range === 'daily') {
      from.setDate(today.getDate() - 7);
    } else if (range === 'weekly') {
      from.setDate(today.getDate() - 35);
    } else if (range === 'monthly') {
      from = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    } else if (range === 'yearly') {
      from = new Date(today.getFullYear() - 4, 0, 1);
    }

    // 3️⃣ Get Labels
    const labels = getLabels(from, to, range);

    // 4️⃣ Fetch Data
    const attendanceData = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: from, lte: to },
      },
      include: {
        records: true,
        group: {
          select: {
            name: true,
            members: { select: { id: true } }
          }
        }
      }
    });

    // 5️⃣ Group Data
    const groupedMap = new Map<
      string, // group name
      { label: string; present: number; absent: number; total: number; percentPresent: number }[]
    >();

    for (const a of attendanceData) {
      const groupName = a.group.name;
      const label =
        range === 'daily'
          ? a.date.toISOString().split('T')[0]
          : range === 'weekly'
          ? getWeekLabel(a.date)
          : range === 'monthly'
          ? `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`
          : `${a.date.getFullYear()}`;

      const present = a.records.filter(r => r.present).length;
      const total = a.group.members.length;
      const absent = total - present;
      const percent = total ? Math.round((present / total) * 100) : 0;

      if (!groupedMap.has(groupName)) groupedMap.set(groupName, []);
      groupedMap.get(groupName)!.push({ label, present, absent, total, percentPresent: percent });
    }

    // 6️⃣ Fill Missing Labels
    const grouped: Record<string, { label: string; present: number; absent: number; total: number; percentPresent: number }[]> = {};

    for (const [groupName, stats] of groupedMap.entries()) {
      const statMap = stats.reduce<Record<string, typeof stats[0]>>((acc, s) => {
        acc[s.label] = s;
        return acc;
      }, {});

      grouped[groupName] = labels.map(label => {
        return statMap[label] ?? {
          label,
          present: 0,
          absent: 0,
          total: 0,
          percentPresent: 0
        };
      });
    }

    return NextResponse.json({ attendance: { grouped, labels } });
  } catch (err) {
    console.error('Attendance summary error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
