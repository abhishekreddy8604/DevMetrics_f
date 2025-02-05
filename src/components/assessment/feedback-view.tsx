
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackProps {
  feedback: {
    technicalSkills: { score: number; comments: string };
    communication: { score: number; comments: string };
    problemSolving: { score: number; comments: string };
    overallScore: number;
    strengths: string[];
    areasForImprovement: string[];
    summary: string;
  };
}

export function FeedbackView({ feedback }: FeedbackProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Interview Feedback</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{feedback.technicalSkills.score}/100</div>
            <p className="text-sm text-muted-foreground">{feedback.technicalSkills.comments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{feedback.communication.score}/100</div>
            <p className="text-sm text-muted-foreground">{feedback.communication.comments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Problem Solving</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{feedback.problemSolving.score}/100</div>
            <p className="text-sm text-muted-foreground">{feedback.problemSolving.comments}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Overall Score</h3>
            <div className="text-3xl font-bold">{feedback.overallScore}/100</div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Strengths</h3>
            <ul className="list-disc pl-5 space-y-1">
              {feedback.strengths.map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Areas for Improvement</h3>
            <ul className="list-disc pl-5 space-y-1">
              {feedback.areasForImprovement.map((area, i) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground">{feedback.summary}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}