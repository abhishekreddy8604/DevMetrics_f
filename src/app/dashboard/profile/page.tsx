import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ProfilePage() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect("/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      assessments: true,
    },
  })

  if (!user) {
    redirect("/signin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-500 mt-2">Manage your account settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Skill Level</label>
              <p className="mt-1">{user.skillLevel}</p>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Completed Assessments</label>
              <p className="mt-1">
                {user.assessments.filter(a => a.status === "COMPLETED").length}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Average Score</label>
              <p className="mt-1">
                {Math.round(
                  user.assessments
                    .filter(a => a.score !== null)
                    .reduce((acc, curr) => acc + (curr.score || 0), 0) /
                    user.assessments.filter(a => a.score !== null).length || 0
                )}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}