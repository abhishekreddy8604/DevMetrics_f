import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 })
    }

    if (assessment.user.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id: params.id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date()
      }
    })

    return NextResponse.json(updatedAssessment)
  } catch (error) {
    console.error("[ASSESSMENT_START]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}