"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const assessmentTypes = [
  {
    id: "TECHNICAL_INTERVIEW",
    title: "Technical Interview",
    description: "Practice common technical interview questions and improve your interview skills."
  },
  {
    id: "CODING_CHALLENGE",
    title: "Coding Challenge",
    description: "Test your programming skills with algorithmic and data structure problems."
  },
  {
    id: "SYSTEM_DESIGN",
    title: "System Design",
    description: "Practice designing scalable systems and architectural solutions."
  }
]

export default function NewAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startAssessment = async (type: string) => {
    setLoading(type)
    setError(null)
    
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: `${assessmentTypes.find(t => t.id === type)?.title} Assessment`
        })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const assessment = await response.json()
      router.push(`/dashboard/assessments/${assessment.id}`)
    } catch (error) {
      console.error("Failed to create assessment:", error)
      setError("Failed to create assessment. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Start New Assessment</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {assessmentTypes.map((type) => (
          <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{type.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {type.description}
              </p>
              <Button 
                className="w-full"
                onClick={() => startAssessment(type.id)}
                disabled={loading === type.id}
              >
                {loading === type.id ? "Creating..." : "Start Assessment"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}