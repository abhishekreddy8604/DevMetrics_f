import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { resumeContent } = await req.json();
    
    // Update the assessment with resume content
    const assessment = await prisma.assessment.update({
      where: { 
        id: params.id,
        user: { email: session.user.email } // Ensure user owns assessment
      },
      data: { 
        resumeContent,
        status: "IN_PROGRESS"
      }
    });

    return NextResponse.json({ content: resumeContent });
  } catch (error) {
    console.error("[RESUME_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}