import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

type Intent = 'salary_summary' | 'pending_fees' | 'total_fees' | 'attendance_summary' | 'unknown';

function detectIntent(message: string): Intent {
  const q = message.toLowerCase();
  if (q.includes('salary') && q.includes('total')) return 'salary_summary';
  if (q.includes('pending') && q.includes('fee')) return 'pending_fees';
  if (q.includes('total') && q.includes('fee')) return 'total_fees';
  if (q.includes('attendance')) return 'attendance_summary';
  return 'unknown';
}

async function callGroqForIntent(prompt: string): Promise<Intent> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_CLOUD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for a school ERP system. The system includes Attendance, Finance (Fees and Salary), Groups, and Members. Only classify queries into one of the following: 'salary_summary', 'pending_fees', 'total_fees', 'attendance_summary'. Respond with only the intent keyword.`
        },
        {
          role: 'user',
          content: prompt,
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const aiMessage = data.choices?.[0]?.message?.content?.trim().toLowerCase();

  const validIntents: Intent[] = ['salary_summary', 'pending_fees', 'total_fees', 'attendance_summary'];
  return validIntents.includes(aiMessage as Intent) ? (aiMessage as Intent) : detectIntent(prompt);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const prompt = body.query?.trim();
    if (!prompt) return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });

    const intent = await callGroqForIntent(prompt);
    let result;

    switch (intent) {
      case 'salary_summary': {
        const res = await prisma.financeRecord.aggregate({
          _sum: { amountPaid: true },
          where: { structureType: 'SALARY' },
        });
        result = {
          message: `Total salary paid: ₹${res._sum.amountPaid?.toFixed(2) ?? '0.00'}`,
        };
        break;
      }

      case 'pending_fees': {
        const res = await prisma.financeRecord.aggregate({
          _sum: { amountExpected: true, amountPaid: true },
          where: { structureType: 'FEE' },
        });
        const expected = res._sum.amountExpected ?? 0;
        const paid = res._sum.amountPaid ?? 0;
        const pending = expected - paid;
        result = {
          message: `Total pending fees: ₹${pending.toFixed(2)}`,
        };
        break;
      }

      case 'total_fees': {
        const res = await prisma.financeRecord.aggregate({
          _sum: { amountPaid: true },
          where: { structureType: 'FEE' },
        });
        result = {
          message: `Total fees collected: ₹${res._sum.amountPaid?.toFixed(2) ?? '0.00'}`,
        };
        break;
      }

      case 'attendance_summary': {
        const today = new Date();
        const records = await prisma.attendanceRecord.findMany({
          where: {
            attendance: {
              date: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
              },
            },
          },
          select: { present: true },
        });

        const total = records.length;
        const present = records.filter((r) => r.present).length;

        result = {
          message: `Today’s attendance: ${present}/${total} members present.`,
        };
        break;
      }

      default:
        result = { message: "Sorry, I didn't understand that." };
    }

    return NextResponse.json({ success: true, response: result });
  } catch (err) {
    console.error('[AI QUERY ERROR]', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
