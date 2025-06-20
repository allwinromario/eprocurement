import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      username,
      password,
      fullName,
      email,
      contactNumber,
      address,
      role,
      // Vendor specific fields
      companyName,
      vendorId,
      // Admin specific fields
      employeeId,
      department,
    } = body

    // Validate required fields based on role
    if (role === 'VENDOR') {
      if (!companyName || !vendorId) {
        return NextResponse.json(
          { error: 'Company name and vendor ID are required for vendors' },
          { status: 400 }
        )
      }
    } else if (role === 'ADMIN') {
      if (!employeeId || !department) {
        return NextResponse.json(
          { error: 'Employee ID and department are required for admins' },
          { status: 400 }
        )
      }
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
          ...(role === 'VENDOR' ? [{ vendorId }] : []),
          ...(role === 'ADMIN' ? [{ employeeId }] : []),
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username, email, or ID already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        contactNumber,
        address,
        role,
        // Role specific fields
        ...(role === 'VENDOR' ? { companyName, vendorId } : {}),
        ...(role === 'ADMIN' ? { employeeId, department } : {}),
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 