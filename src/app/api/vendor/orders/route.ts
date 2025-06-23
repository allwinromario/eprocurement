import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const url = request?.url ? new URL(request.url) : null;
    const history = url?.searchParams.get('history') === 'true';
    const where = history
      ? { visibleToVendors: true, status: 'completed' }
      : { visibleToVendors: true, status: 'approved' };
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch open orders' }, { status: 500 })
  }
} 