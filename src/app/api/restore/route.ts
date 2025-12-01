import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { parse } from 'csv-parse/sync';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export const config = { api: { bodyParser: false } };

async function parseCSVFromZip(zip: JSZip, fileName: string) {
  const file = zip.file(fileName);
  if (!file) return null;
  const content = await file.async('string');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('content-length') && Number(req.headers.get('content-length')) > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string };

    const buffer = Buffer.from(await new Response(req.body).arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);

    //!!!!!!! Warning This will DELETE ALL Data in the tenant !!!!!!!!!!
    // await prisma.attendanceRecord.deleteMany({ where: { attendance: { tenantId } } });
    // await prisma.attendance.deleteMany({ where: { tenantId } });
    // await prisma.financeRecord.deleteMany({ where: { tenantId } });
    // await prisma.feeStructure.deleteMany({ where: { tenantId } });
    // await prisma.salaryStructure.deleteMany({ where: { tenantId } });
    // await prisma.userFavGroup.deleteMany({ where: { user: { tenantId } } });
    // await prisma.user.deleteMany({ where: { tenantId } });
    // await prisma.member.deleteMany({ where: { tenantId } });
    // await prisma.group.deleteMany({ where: { tenantId } });
    /////////////////////////////////
    // Order matters
    const raw = {
      groups: await parseCSVFromZip(zip, 'groups.csv'),
      members: await parseCSVFromZip(zip, 'members.csv'),
      users: await parseCSVFromZip(zip, 'users.csv'),
      userfavgroups: await parseCSVFromZip(zip, 'userfavgroups.csv'),
      feestructures: await parseCSVFromZip(zip, 'feestructures.csv'),
      salarystructures: await parseCSVFromZip(zip, 'salarystructures.csv'),
      attendance: await parseCSVFromZip(zip, 'attendance.csv'),
      attendancerecords: await parseCSVFromZip(zip, 'attendancerecords.csv'),
      financerecords: await parseCSVFromZip(zip, 'financerecords.csv'),
    };

    const withTenant = (arr: any[]) =>
      arr?.map(row => ({
        ...row,
        tenantId, // Force tenant
      })) ?? [];

    const relationalInsert = {
      groups: () => prisma.group.createMany({ data: withTenant(raw.groups) }),
      members: () =>
        prisma.member.createMany({
          data: withTenant(raw.members.map(sanitizeMember)),
        }),
      users: () =>
        prisma.user.createMany({
          data: withTenant(raw.users.map(sanitizeUser)),
        }),
      userfavgroups: () =>
        prisma.userFavGroup.createMany({ data: raw.userfavgroups }),

      feestructures: () =>
        prisma.feeStructure.createMany({
          data: withTenant(raw.feestructures.map(sanitizeStructure)),
        }),
      salarystructures: () =>
        prisma.salaryStructure.createMany({
          data: withTenant(raw.salarystructures.map(sanitizeStructure)),
        }),
      financeRecords: () =>
        prisma.financeRecord.createMany({
          data: withTenant(raw.financerecords.map(financeRecordSanitize)),
        }),
      attendance: () => prisma.attendance.createMany({ data: withTenant(raw.attendance) }),
      attendancerecords: () =>
        prisma.attendanceRecord.createMany({ data: raw.attendancerecords }),
    };


    for (const [key, fn] of Object.entries(relationalInsert)) {
      if (raw[key as keyof typeof raw]?.length) {
        await fn();
      }
    }

    return NextResponse.json({ message: 'Restore successful (tenant-specific)' });
  } catch (err) {
    console.error('Restore error:', err);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}

////////////sanitization functions
type MemberRow = {
  phoneNo?: string;
  username?: string;
  password?: string;
  email?: string;
  gender?: string;
  groupId?: string;
  special?: string;
  photoUrl?: string;
  criteriaVal?: string | boolean | null;
  hobbies?: string | any[];
  exitDate?: string | null;
  isActive?: string | boolean;
  [key: string]: any;
};

function sanitizeMember(row: MemberRow): MemberRow {
  const asString = (val: any) =>
    val === undefined || val === null || val === '' ? undefined : String(val);

  const asBoolean = (val: any) =>
    val === 'true' || val === true ? true : false;

  const asJsonArray = (val: any) => {
    if (!val) return [];
    try {
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

   const asNumberOrNull = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  return {
    ...row,
        memberNo: asNumberOrNull(row.memberNo),
    balance: asNumberOrNull(row.balance),
    customFee: asNumberOrNull(row.customFee),
    customSalary: asNumberOrNull(row.customSalary),
    phoneNo: asString(row.phoneNo),
    username: asString(row.username),
    password: asString(row.password),
    email: asString(row.email),
    gender: asString(row.gender),
    groupId: asString(row.groupId),
    special: asString(row.special),
    photoUrl: asString(row.photoUrl),
    criteriaVal: row.criteriaVal === '' ? null : Boolean(row.criteriaVal),
    hobbies: asJsonArray(row.hobbies),
    exitDate: asString(row.exitDate) || null,
    isActive: asBoolean(row.isActive),
  };
}


//user sanitization
type UserRow = {
  isActive?: string | boolean;
  groupId?: string;
  createdAt?: string;
  lastLogin?: string;
  [key: string]: any;
};

function sanitizeUser(row: UserRow): UserRow {
  const asBoolean = (val: any) => val === 'true' || val === true;
  const asStringOrUndefined = (val: any) =>
    val === '' || val === undefined || val === null ? undefined : String(val);

  return {
    ...row,
    isActive: asBoolean(row.isActive),
    groupId: asStringOrUndefined(row.groupId),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    lastLogin: row.lastLogin ? new Date(row.lastLogin).toISOString() : new Date().toISOString(),
  };
}

//SS sanitization
function sanitizeStructure(row: any): any {
  const allowedFields = [
    'id', 'name', 'amount', 'arrear', 'ytd',
    'groupId', 'memberId', 'tenantId', 'createdAt', 'updatedAt'
  ];

  const result: any = {};
  for (const key of allowedFields) {
    let val = row[key];

    if (['groupId', 'memberId', 'tenantId'].includes(key)) {
      val = val === '' || val === undefined || val === null ? null : String(val);
    }

    if (['createdAt', 'updatedAt'].includes(key)) {
      val = val ? new Date(val) : new Date();
    }

    result[key] = val;
  }
  return result;
}

//financial record sanitization
function financeRecordSanitize(row: any): any {
  return {
    id: String(row.id),
    tenantId: String(row.tenantId),
    memberId: row.memberId ? String(row.memberId) : null,
    structureId: row.structureId ? String(row.structureId) : null,
    structureType: row.structureType, // should be 'FEE' or 'SALARY'
    amountExpected: parseFloat(row.amountExpected) || 0,
    amountPaid: parseFloat(row.amountPaid) || 0,
    month: row.month !== '' ? parseInt(row.month) : null,
    year: row.year !== '' ? parseInt(row.year) : null,
    dueDate: row.dueDate ? new Date(row.dueDate) : null,
    paidDate: row.paidDate ? new Date(row.paidDate) : null,
    note: row.note ?? '',
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
  };
}
