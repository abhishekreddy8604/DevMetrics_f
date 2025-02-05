import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await getServerSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="z-10 w-full mx-auto max-w-full lg:max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="w-full text-center">
          <h1 className="text-4xl font-bold mb-8">DevMetrics</h1>
          <p className="text-xl mb-8">
            Evaluate your development skills and track your progress
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signin">
              <Button>Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}