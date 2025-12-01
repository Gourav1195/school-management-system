import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../lib/jwt'
import prisma from '../lib/prisma'

export async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]
  try {
    const user = await verifyJWT(token)
    ;(req as any).user = user
    return null // no error
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function requireTenantPlan(req: NextRequest, requiredPlan: 'Premium' | 'Free') {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]
  const payload = await verifyJWT(token)
  const tenantId = payload?.tenantId

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }
  if (requiredPlan === 'Premium' && tenant.plan !== 'Premium') {
    return NextResponse.json({ error: 'Upgrade to Premium required' }, { status: 403 })
  }
  return null
}