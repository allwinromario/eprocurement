import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List all orders
export async function GET(request: Request) {
  try {
    const url = request?.url ? new URL(request.url) : null;
    const history = url?.searchParams.get('history') === 'true';
    const where = history ? { status: 'completed' } : { status: { not: 'completed' } };
    const orders = await prisma.order.findMany({
      where,
      include: {
        createdBy: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// Update order status or post
export async function PATCH(request: Request) {
  try {
    const { orderId, action, approvalReason } = await request.json()
    if (!orderId || !['approve','reject','post'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    let data: any = {}
    if (action === 'approve') data = { status: 'approved', approvalReason }
    if (action === 'reject') data = { status: 'rejected', approvalReason }
    if (action === 'post') data = { visibleToVendors: true }
    const order = await prisma.order.update({ where: { id: orderId }, data })
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
} 