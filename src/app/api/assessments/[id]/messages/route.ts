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

    const { content, type } = await req.json();

    const message = await prisma.message.create({
      data: {
        content,
        role: type.toUpperCase(),
        assessmentId: params.id,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
