import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        skillLevel: true,
        createdAt: true,
        assessments: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            score: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, skillLevel, currentPassword, newPassword } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return new NextResponse("Invalid current password", { status: 400 })
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
    }

    // Update other fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        skillLevel: skillLevel || user.skillLevel
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        skillLevel: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}