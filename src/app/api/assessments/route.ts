import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { AssessmentType } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { type, title } = body

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Create the assessment
    const assessment = await prisma.assessment.create({
      data: {
        title,
        type: type as AssessmentType,
        status: "PENDING",
        userId: user.id,
        score: 0, // Set a default value or remove if making it optional
      },
      include: {
        questions: true
      }
    })

    return NextResponse.json(assessment)
  } catch (error) {
    console.error("[ASSESSMENT_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        userId: user.id
      },
      include: {
        questions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error("[ASSESSMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

function generateQuestions(type: string) {
  const questions = {
    TECHNICAL_INTERVIEW: [
      {
        content: "Explain the concept of closure in JavaScript.",
        type: "OPEN_ENDED",
        difficulty: "MEDIUM"
      },
      {
        content: "What is the difference between let, const, and var?",
        type: "OPEN_ENDED",
        difficulty: "EASY"
      },
      {
        content: "Explain how the event loop works in JavaScript.",
        type: "OPEN_ENDED",
        difficulty: "HARD"
      }
    ],
    CODING_CHALLENGE: [
      {
        content: "Implement a function to reverse a string without using the built-in reverse method.",
        type: "CODING",
        difficulty: "EASY"
      },
      {
        content: "Write a function to find the first non-repeating character in a string.",
        type: "CODING",
        difficulty: "MEDIUM"
      },
      {
        content: "Implement a function to detect a cycle in a linked list.",
        type: "CODING",
        difficulty: "HARD"
      }
    ],
    SYSTEM_DESIGN: [
      {
        content: "Design a URL shortening service like bit.ly.",
        type: "SYSTEM_DESIGN",
        difficulty: "MEDIUM"
      },
      {
        content: "How would you design Twitter's trending topics feature?",
        type: "SYSTEM_DESIGN",
        difficulty: "HARD"
      },
      {
        content: "Design a simple key-value store.",
        type: "SYSTEM_DESIGN",
        difficulty: "MEDIUM"
      }
    ]
  }

  return questions[type as keyof typeof questions] || questions.TECHNICAL_INTERVIEW
}