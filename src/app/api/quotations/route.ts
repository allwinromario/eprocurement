import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productService, description, selectedCategories, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const quotation = await prisma.quotation.create({
      data: {
        productService,
        description,
        categories: selectedCategories,
        userId,
      },
    })

    return NextResponse.json({ message: 'Quotation submitted successfully', quotation }, { status: 201 })
  } catch (error) {
    console.error('Quotation submission error:', error)
    return NextResponse.json({ error: 'Error submitting quotation' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const orderId = searchParams.get('orderId')

  if (orderId) {
    // Fetch all quotations for a specific order, including vendor info
    const quotations = await prisma.quotation.findMany({
      where: { orderId },
      include: {
        user: { select: { id: true, vendorId: true, fullName: true, email: true, companyName: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })
    return NextResponse.json({ quotations })
  }

  if (userId) {
    const quotations = await prisma.quotation.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    })
    return NextResponse.json({ quotations })
  }

  return NextResponse.json({ quotations: [] })
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing quotation id' }, { status: 400 })
    }
    await prisma.quotation.delete({ where: { id } })
    return NextResponse.json({ message: 'Quotation deleted' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 })
  }
} 