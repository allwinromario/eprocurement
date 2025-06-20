import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// Place a new order
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productName, description, quantity, specifications, createdById } = body
    if (!productName || !description || !quantity || !createdById) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const order = await prisma.order.create({
      data: {
        productName,
        description,
        quantity,
        specifications,
        createdById,
      }
    })
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
} 