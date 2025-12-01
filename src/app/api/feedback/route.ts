// src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // your Prisma client
import { verifyJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { tenantId } = await verifyJWT(auth.slice(7)) as { tenantId: string };
    
  const body = await req.json();
  const { message, isAnonymous, memberId, } = body;

  if (!message || message.trim() === "") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const newFeedback = await prisma.feedback.create({
    data: {
      message,
      isAnonymous: !!isAnonymous,
      memberId,   // always store real memberId
      tenantId,
    },
  });

  return NextResponse.json(newFeedback, { status: 201 });
}

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
     where: { isAnonymous: false }, 
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(feedbacks);
}
