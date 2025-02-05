import { Assessment } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate, getStatusColor } from "@/lib/utils"

interface AssessmentListProps {
  assessments: Assessment[]
}

export function AssessmentList({ assessments }: AssessmentListProps) {
  return (
    <div className="grid gap-4">
      {assessments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No assessments found</p>
            <Link href="/dashboard/assessments/new">
              <Button className="mt-4">Start your first assessment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        assessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <CardTitle>{assessment.title}</CardTitle>
                <span className={`mt-2 sm:mt-0 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                  {assessment.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Type: {assessment.type}
                  </p>
                  
                    <p className="text-sm text-muted-foreground">
                      Score: {assessment.score}%
                    </p>
                 
                  <p className="text-sm text-muted-foreground">
                    Created: {formatDate(assessment.createdAt)}
                  </p>
                </div>
                <Link href={`/dashboard/assessments/${assessment.id}`} className="mt-4 sm:mt-0">
                  <Button variant="outline" className="w-full sm:w-auto">
                    {assessment.status === "PENDING" ? "Start" : "View Details"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}