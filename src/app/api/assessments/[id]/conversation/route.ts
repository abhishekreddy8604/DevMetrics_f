
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

    const { messages } = await req.json();
    
    // Save all messages in a transaction
    await prisma.$transaction(
      messages.map((msg: any) => 
        prisma.message.create({
          data: {
            content: msg.content,
            role: msg.type === "user" ? "USER" : "ASSISTANT",
            assessmentId: params.id
          }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONVERSATION_SAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}