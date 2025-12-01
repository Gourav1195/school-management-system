import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { verifyJWT } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (!decoded || !decoded.tenantId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const tenantId = decoded.tenantId;
  const formData = await req.formData();
  const file = formData.get('file') as File;
  

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    return NextResponse.json({ error: 'Only PNG or JPEG files are allowed' }, { status: 400 });
    }

  if (file.size > 100 * 1024) {
    return NextResponse.json({ error: 'File size must be under 100KB' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', tenantId);


  if (!fs.existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const filePath = path.join(uploadDir, `logo.${ext}`);
  await writeFile(filePath, buffer);

return NextResponse.json({ logoUrl: `/uploads/${tenantId}/logo.${ext}` });
}
