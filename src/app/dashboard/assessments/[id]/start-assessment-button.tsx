"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function StartAssessmentButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to start assessment:", error)
      setError(error instanceof Error ? error.message : "Failed to start assessment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
      <Button 
        onClick={handleStart}
        disabled={loading}
        className="w-full md:w-auto"
      >
        {loading ? "Starting..." : "Start Assessment"}
      </Button>
    </div>
  )
}