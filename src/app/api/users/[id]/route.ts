import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        contactNumber: true,
        address: true,
        role: true,
        companyName: true,
        vendorId: true,
        employeeId: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { fullName, contactNumber, address } = body
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(fullName && { fullName }),
        ...(contactNumber && { contactNumber }),
        ...(address && { address }),
      },
    })
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
} 