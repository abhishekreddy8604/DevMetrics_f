import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecentAssessmentsProps {
  assessments: any[]
}

export function RecentAssessments({ assessments }: RecentAssessmentsProps) {
  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No assessments yet</p>
          <Link href="/dashboard/assessments/new">
            <Button className="mt-4">Start your first assessment</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <Card key={assessment.id}>
          <CardHeader>
            <CardTitle>{assessment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  Status: {assessment.status}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {formatDate(assessment.createdAt)}
                </p>
              </div>
              <Link href={`/dashboard/assessments/${assessment.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}