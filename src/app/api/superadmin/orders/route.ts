import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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
    const { orderId, action } = await request.json()
    if (!orderId || !['approve','reject','post'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    let data = {}
    if (action === 'approve') data = { status: 'approved' }
    if (action === 'reject') data = { status: 'rejected' }
    if (action === 'post') data = { visibleToVendors: true }
    const order = await prisma.order.update({ where: { id: orderId }, data })
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
} 