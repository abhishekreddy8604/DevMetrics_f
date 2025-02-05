import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        conversation: true
      }
    });

    if (!assessment || assessment.user.email !== session.user.email) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("[ASSESSMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}