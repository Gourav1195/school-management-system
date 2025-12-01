//referrals/validate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust path

// hardcoded discounts & commissions (commission = for Sales role)
const customDiscounts: Record<string, { finalPrice: number; commission: number }> = {
  "24M": { finalPrice: 24999, commission: 10000 },
  "12M": { finalPrice: 14999, commission: 5000 },
  "5M": { finalPrice: 9999, commission: 3500 },
};

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
      if (!auth.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
  
  try {
    const { code, planId } = await req.json();

    if (!code || !planId) {
      return NextResponse.json({ valid: false, message: "Missing data" }, { status: 400 });
    }

    // Find user with referral code
    const user = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ valid: false, message: "Invalid referral" }, { status: 404 });
    }

    const discountConfig = customDiscounts[planId];

    if (!discountConfig) {
      return NextResponse.json({ valid: false, message: "Invalid plan" }, { status: 400 });
    }

    // 🔑 Commission logic
    const commission = user.role === "Sales" 
      ? discountConfig.commission 
      : 1000;

    return NextResponse.json({
      valid: true,
      finalPrice: discountConfig.finalPrice, // ✅ always same per plan
      commission,                             // ✅ role-based commission
      message: "Custom referral applied 🎉",
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}
