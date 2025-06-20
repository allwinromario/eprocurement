import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const vendors = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        contactNumber: true,
        address: true,
        companyName: true,
        vendorId: true,
        quotations: true,
      },
    })
    return NextResponse.json({ vendors })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
} 