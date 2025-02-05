import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    redirect("/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      assessments: {
        take: 5,
        orderBy: { createdAt: "desc" }
      }
    }
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Recent Assessments</h2>
          {user?.assessments.length === 0 ? (
            <p className="text-gray-500">No assessments yet.</p>
          ) : (
            <div className="space-y-4">
              {user?.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 bg-white rounded-lg shadow"
                >
                  <h3 className="font-medium">{assessment.title}</h3>
                  <p className="text-sm text-gray-500">
                    Status: {assessment.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}