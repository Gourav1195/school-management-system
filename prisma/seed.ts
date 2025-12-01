// prisma/seed.ts or wherever your tenant seeding logic is

import { BillingCycle, Plan, PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const TOTAL_MEMBERS = 15;

async function main() {
  // const tenantId = 'efe3068d-c742-457f-baf2-48ce33dcb130';
  const password = await bcrypt.hash("gourav", 10);

  const tenant = await prisma.tenant.upsert({
  where: { id: 'efe3068d-c742-457f-baf2-48ce33dcb130' },
  update: {}, // No updates if it already exists
  create: {
    id: 'efe3068d-c742-457f-baf2-48ce33dcb130',
    name: 'Fake Tenant',
    email: 'fake@tenant.com',
    logoUrl: 'https://dummyimage.com/200x200/000/fff',
    createdAt: new Date(),
  },
});

  console.log('🪄 Tenant created:', tenant);
  const tenantId = tenant.id;
  // Confirm tenant exists
  // const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new Error(`Tenant with ID ${tenantId} does not exist. Check your DB, King.`);
  }

  console.log(`👑 Seeding for tenant: ${tenant.name} (${tenantId})`);


  const groups = await Promise.all(
    ['Junior Wizards', 'Teaching Ninjas', 'Yogic Jedi'].map((name, i) =>
      prisma.group.create({
        data: {
          name,
          tenantId,
          type: i === 0 ? 'FEE' : i === 1 ? 'SALARY' : 'BOTH',
          feeMode: i % 2 === 0 ? 'Group' : 'Member',
          salaryMode: i % 2 === 0 ? 'Member' : 'Group',
          groupFee: 2000 + i * 500,
          groupSalary: 12000 + i * 3000,
        },
      })
    )
  );

  const members = await Promise.all(
    Array.from({ length: TOTAL_MEMBERS }).map((_, i) => {
      const group = groups[i % groups.length];
      return prisma.member.create({
        data: {
          name: faker.person.fullName(),
          memberNo: i + 10,
          username: `member${i + 1}`,
          password,
          email: faker.internet.email(),
          phoneNo: faker.phone.number(),
          gender: i % 2 === 0 ? 'Male' : 'Female',
          hobbies: [faker.hacker.verb(), faker.music.genre()],
          balance: faker.number.float({ min: -1000, max: 3000 }),
          criteriaVal: i % 3 === 0,
          groupId: group.id,
          tenantId,
          dob: '2025-08-06T20:49:29.304Z',
        },
      });
    })
  );

  const users = await Promise.all(
    members.map((member, i) =>
      prisma.user.create({
        data: {
          memberId: member.id,
          role: i % 5 === 0 ? 'Admin' : i % 4 === 0 ? 'SuperAdmin': i % 3 === 0 ? 'Finance' : 'Viewer',
          tenantId,
          groupId: member.groupId!,
          referralCode: `${member.name.split(' ')[0].toUpperCase()}${i + 1}`,
        },
      })
    )
  );

  await Promise.all(
    members.map((member, i) => {
      const group = groups.find(g => g.id === member.groupId)!;
      if (group.type === 'FEE' || group.type === 'BOTH') {
        return prisma.feeStructure.create({
          data: {
            name: `FeePlan ${i + 1}`,
            amount: group.groupFee,
            memberId: member.id,
            tenantId,
            groupId: group.id,
          },
        });
      } else {
        return prisma.salaryStructure.create({
          data: {
            name: `SalaryPlan ${i + 1}`,
            amount: group.groupSalary,
            memberId: member.id,
            tenantId,
            groupId: group.id,
          },
        });
      }
    })
  );

  await Promise.all(
    members.map((member, i) =>
      prisma.financeRecord.create({
        data: {
          tenantId,
          memberId: member.id,
          structureId: faker.string.uuid(),
          structureType:
            groups.find(g => g.id === member.groupId)?.type === 'FEE'
              ? 'FEE'
              : 'SALARY',
          amountExpected: i % 2 === 0 ? 2500 : 18000,
          amountPaid: i % 2 === 0 ? 2500 : 0,
          year: 2025,
          month: 7,
          dueDate: new Date(),
          paidDate: i % 2 === 0 ? new Date() : null,
          note: i % 2 === 0 ? 'Paid' : 'Pending',
        },
      })
    )
  );

  await Promise.all(
    users.map(user =>
      prisma.userFavGroup.create({
        data: {
          userId: user.id,
          groupId: groups[0].id,
        },
      })
    )
  );

  // const members = await prisma.member.findMany({ where: { tenantId } });
  const feeStructures = await prisma.feeStructure.findMany({ where: { tenantId } });
  const salaryStructures = await prisma.salaryStructure.findMany({ where: { tenantId } });
  // const groups = await prisma.group.findMany({ where: { tenantId } });
  for (const member of members) {
    if (feeStructures.length) {
      const fee = feeStructures[Math.floor(Math.random() * feeStructures.length)];
      await prisma.financeRecord.create({
        data: {
          tenantId,
          memberId: member.id,
          structureId: fee.id,
          structureType: "FEE",
          amountExpected: fee.amount,
          amountPaid: 0,
          year: 2025,
          month: 6,
          dueDate: new Date("2025-07-22T20:19:14.602Z"),
          note: "Auto-generated unpaid fee",
        },
      });
    }

    if (salaryStructures.length) {
      const salary = salaryStructures[Math.floor(Math.random() * salaryStructures.length)];
      await prisma.financeRecord.create({
        data: {
          tenantId,
          memberId: member.id,
          structureId: salary.id,
          structureType: "SALARY",
          amountExpected: salary.amount,
          amountPaid: salary.amount,
          year: 2025,
          month: 6,
          paidDate: new Date("2025-07-22T20:19:14.602Z"),
          note: "Auto-generated paid salary",
        },
      });
    }
  }

  for (const group of groups) {
    const attendance = await prisma.attendance.create({
      data: {
        groupId: group.id,
        date: new Date(),
        tenantId,
      },
    });

    const groupMembers = await prisma.member.findMany({ where: { groupId: group.id } });

    for (const member of groupMembers) {
      await prisma.attendanceRecord.create({
        data: {
          attendanceId: attendance.id,
          memberId: member.id,
          present: Math.random() > 0.3, // 70% chance present
        },
      });
    }
  }
  console.log(`🌱 Successfully seeded ${members.length} members, users, and finance records.`);

  // 🌟 Add dummy Sales and Commissions
const plans: Plan[] = ['Free', 'Premium'];
const billingCycles: BillingCycle[] = ['M3', 'M6', 'M12', 'M24'];

const sales = await Promise.all(
  users.slice(0, 5).map(async (user, i) => {
    const sale = await prisma.sale.create({
      data: {
        userId: user.id,
        // tenantId,
        plan: plans[i % plans.length],
        amount: (i + 1) * 1000,
        note: `Demo sale ${i + 1}`,
      },
    });

    await prisma.salesCommission.create({
      data: {
        saleId: sale.id,
        percentage: 10,
        amount: sale.amount * 0.1,
        isPaid: i % 2 === 0,
      },
    });

    return sale;
  })
);

console.log(`💰 Seeded ${sales.length} sales with commissions.`);

// 🪙 Seed Wallet and Ledger
const wallet = await prisma.wallet.create({
  data: {
    tenantId,
    aiCredits: 500,
    whatsappCredits: 1000,
  },
});

await prisma.ledger.createMany({
  data: [
    {
      tenantId,
      coin: 'AI_QUESTION',
      amount: 100,
      reason: 'Initial AI credits',
    },
    {
      tenantId,
      coin: 'WHATSAPP_MESSAGE',
      amount: 300,
      reason: 'Top-up for WhatsApp',
    },
    {
      tenantId,
      coin: 'WHATSAPP_MESSAGE',
      amount: -50,
      reason: 'Sent WhatsApp messages',
    },
  ],
});

console.log(`🪙 Seeded wallet and ledger entries for tenant ${tenantId}`);

}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());