
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FeedbackPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/signin");
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!assessment || assessment.user.email !== session.user.email) {
    redirect("/dashboard");
  }

  const feedback = assessment.feedback as any;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Interview Feedback</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{feedback?.technicalSkills?.score}/100</div>
            <p className="text-sm text-muted-foreground">{feedback?.technicalSkills?.comments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{feedback?.communication?.score}/100</div>
            <p className="text-sm text-muted-foreground">{feedback?.communication?.comments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Problem Solving</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{feedback?.problemSolving?.score}/100</div>
            <p className="text-sm text-muted-foreground">{feedback?.problemSolving?.comments}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Strengths</h3>
            <ul className="list-disc pl-5 space-y-1">
              {feedback?.strengths?.map((strength: string, i: number) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Areas for Improvement</h3>
            <ul className="list-disc pl-5 space-y-1">
              {feedback?.areasForImprovement?.map((area: string, i: number) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground">{feedback?.summary}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}