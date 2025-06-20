import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, orderId, productService, description, categories } = body
    if (!userId || !orderId || !productService || !description || !categories) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const quotation = await prisma.quotation.create({
      data: {
        userId,
        orderId,
        productService,
        description,
        categories,
      },
    })
    return NextResponse.json({ quotation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit quotation' }, { status: 500 })
  }
} 