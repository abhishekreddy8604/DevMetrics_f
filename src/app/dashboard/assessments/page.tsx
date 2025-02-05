import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { AssessmentList } from "@/components/assessment/assessment-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AssessmentsPage() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return null
  }

  const assessments = await prisma.assessment.findMany({
    where: {
      user: {
        email: session.user.email
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
    <h1 className="text-2xl font-bold">Assessments</h1>
    <Link href="/dashboard/assessments/new" className="mt-4 sm:mt-0">
      <Button size="sm" className="w-full sm:w-auto md:text-base md:px-4 md:py-2">
        <span>Start New Assessment</span>
      </Button>
    </Link>
  </div>

  <AssessmentList assessments={assessments} />
</div>
  )
}