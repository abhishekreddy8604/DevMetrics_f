import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BarChart,
  Activity,
  Award,
  Clock,
  Star,
  CheckCircle
} from "lucide-react"

async function getDashboardData(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  const stats = {
    totalAssessments: await prisma.assessment.count({
      where: { userId: user?.id }
    }),
    completedAssessments: await prisma.assessment.count({
      where: { userId: user?.id, status: 'COMPLETED' }
    }),
    averageScore: await prisma.assessment.aggregate({
      where: { userId: user?.id, status: 'COMPLETED' },
      _avg: { score: true }
    }),
    inProgress: await prisma.assessment.count({
      where: { userId: user?.id, status: 'IN_PROGRESS' }
    })
  }

  return { user, stats }
}

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect("/signin")
  }

  const { user, stats } = await getDashboardData(session.user.email)
  
  if (!user) {
    redirect("/signin")
  }

  const statCards = [
    {
      title: "Total Assessments",
      value: stats.totalAssessments,
      icon: BarChart,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Completed",
      value: stats.completedAssessments,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Average Score",
      value: `${Math.round(stats.averageScore._avg.score || 0)}%`,
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Track your progress and continue your learning journey
            </p>
          </div>
          <Link href="/dashboard/assessments/new">
            <Button size="lg" className="w-full sm:w-auto">
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Assessments</CardTitle>
          <Link href="/dashboard/assessments">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {user.assessments.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                No assessments yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Start your first assessment to begin tracking your progress.
              </p>
              <Link href="/dashboard/assessments/new" className="mt-4 inline-block">
                <Button>Start First Assessment</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {user.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      assessment.status === 'COMPLETED' ? 'bg-green-100' :
                      assessment.status === 'IN_PROGRESS' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      {assessment.status === 'COMPLETED' ? (
                        <Award className="h-5 w-5 text-green-600" />
                      ) : assessment.status === 'IN_PROGRESS' ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Activity className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {assessment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assessment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {assessment.score && (
                      <div className="text-sm font-medium text-gray-900">
                        {assessment.score}%
                      </div>
                    )}
                    <Link href={`/dashboard/assessments/${assessment.id}`}>
                      <Button variant="outline" size="sm">
                        {assessment.status === 'PENDING' ? 'Start' : 'View'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skill Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-600">
                    Current Level
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    {user.skillLevel}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${(stats.completedAssessments / (stats.totalAssessments || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/assessments/new">
                <Button className="w-full" variant="outline">
                  New Assessment
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button className="w-full" variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}