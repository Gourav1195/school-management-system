import prisma from '@/lib/prisma';

type BotQueryInput = {
  message: string;
  user: { tenantId: string };
};

function detectIntent(query: string) {
  const q = query.toLowerCase();
  if (q.includes('salary') && q.includes('total')) return 'salary_summary';
  if (q.includes('pending') && q.includes('fee')) return 'pending_fees';
  if (q.includes('total') && q.includes('fee')) return 'total_fees';
  if (q.includes('attendance')) return 'attendance_summary';
  return 'unknown';
}

export async function handleAIQuery({ message, user }: BotQueryInput) {
  const intent = detectIntent(message);

  switch (intent) {
    case 'salary_summary': {
      const total = await prisma.financeRecord.aggregate({
        where: {
          tenantId: user.tenantId,
          structureType: 'SALARY',
        },
        _sum: { amountPaid: true },
      });

      return { answer: `Total salary paid so far: ₹${(total._sum.amountPaid || 0).toFixed(2)}` };
    }

    case 'pending_fees': {
      const total = await prisma.financeRecord.aggregate({
        where: {
          tenantId: user.tenantId,
          structureType: 'FEE',
        },
        _sum: { amountExpected: true, amountPaid: true },
      });

      const pending = (total._sum.amountExpected || 0) - (total._sum.amountPaid || 0);
      return { answer: `Total pending fees: ₹${pending.toFixed(2)}` };
    }

    case 'total_fees': {
      const result = await prisma.financeRecord.aggregate({
        where: {
          tenantId: user.tenantId,
          structureType: 'FEE',
        },
        _sum: { amountPaid: true },
      });

      return { answer: `Total fees collected so far: ₹${(result._sum.amountPaid || 0).toFixed(2)}` };
    }

    default:
      return { answer: `I didn’t understand that. Try asking about “pending fees” or “total salary paid.”` };
  }
}
