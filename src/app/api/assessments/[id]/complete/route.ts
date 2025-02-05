import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import OpenAI from 'openai';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages }: { messages: Message[] } = await req.json();

    const conversationText = messages
      .map((m: Message) => `${m.type === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Based on the following technical interview conversation, provide a structured assessment in the exact format shown below:

${conversationText}

Format your response exactly like this example (replace values with actual assessment):
{
  "technicalSkills": {
    "score": 85,
    "comments": "Strong understanding of core concepts"
  },
  "communication": {
    "score": 90,
    "comments": "Clear and concise responses"
  },
  "problemSolving": {
    "score": 88,
    "comments": "Good analytical approach"
  },
  "overallScore": 87,
  "strengths": ["Technical knowledge", "Communication skills"],
  "areasForImprovement": ["Could improve system design knowledge"],
  "summary": "Overall strong performance"
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a technical interviewer. Provide feedback in valid JSON format only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      // Remove response_format parameter as it's not supported
    });

    let feedback;
    try {
      feedback = JSON.parse(completion.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Failed to parse feedback:", error);
      feedback = {
        technicalSkills: { score: 0, comments: "Failed to generate feedback" },
        communication: { score: 0, comments: "Failed to generate feedback" },
        problemSolving: { score: 0, comments: "Failed to generate feedback" },
        overallScore: 0,
        strengths: [],
        areasForImprovement: [],
        summary: "Failed to generate feedback"
      };
    }

    // Update assessment
    const updatedAssessment = await prisma.assessment.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        score: feedback.overallScore,
        feedback: feedback,
        conversation: {
          createMany: {
            data: messages.map((msg: any) => ({
              content: msg.content,
              role: msg.type.toUpperCase()
            }))
          }
        }
      }
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.error("[ASSESSMENT_COMPLETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}