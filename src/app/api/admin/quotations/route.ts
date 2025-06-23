import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    if (!adminId) {
      return NextResponse.json({ error: 'Missing adminId' }, { status: 400 })
    }
    // Get all orders placed by this admin
    const orders = await prisma.order.findMany({
      where: { createdById: adminId },
      select: { id: true }
    })
    const orderIds = orders.map(o => o.id)
    // Get all quotations for these orders
    const quotations = await prisma.quotation.findMany({
      where: { orderId: { in: orderIds } },
      include: {
        user: { select: { vendorId: true, fullName: true, email: true } },
        order: { select: { id: true, productName: true } }
      },
      orderBy: { submittedAt: 'desc' }
    })
    return NextResponse.json({ quotations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, vendorId, approvalReason } = await request.json()
    if (!orderId || !vendorId || !approvalReason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    // Set approvedVendorId and approvalReason on the order, mark as completed
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        approvedVendorId: vendorId,
        approvalReason,
        status: 'completed',
      },
    })
    // Set approvalReason on the approved quotation
    await prisma.quotation.updateMany({
      where: { orderId, userId: vendorId },
      data: { approvalReason },
    })
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve vendor' }, { status: 500 })
  }
} 