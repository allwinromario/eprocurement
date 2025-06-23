import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { current, new: newPassword } = body
    if (!current || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const isValid = await bcrypt.compare(current, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: params.id }, data: { password: hashed } })
    return NextResponse.json({ message: 'Password updated' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
} 