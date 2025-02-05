import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartWrapper from "@/components/analysis/ChartWrapper";

export default async function AnalyticsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  // Fetch user's assessment data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      assessments: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  const assessmentScores = user.assessments.map(a => a.score || 0);
  const assessmentDates = user.assessments.map(a => new Date(a.createdAt).toLocaleDateString("en-US"));

  const barData = {
    labels: assessmentDates,
    datasets: [
      {
        label: "Scores",
        data: assessmentScores,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: assessmentDates,
    datasets: [
      {
        label: "Scores Over Time",
        data: assessmentScores,
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 mt-2">Track your performance and progress</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Adjusted grid columns for mobile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.assessments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                user.assessments
                  .filter(a => a.score !== null)
                  .reduce((acc, curr) => acc + (curr.score || 0), 0) /
                  user.assessments.filter(a => a.score !== null).length || 0
              )}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Skill Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.skillLevel}</div>
          </CardContent>
        </Card>
      </div>

      <ChartWrapper barData={barData} lineData={lineData} />

      {/* Add more analytics components here */}
    </div>
  );
}