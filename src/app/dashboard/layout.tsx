"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useWindowSize } from "@/hooks/useWindowSize"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { width } = useWindowSize()
  const isMobile = width < 768
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const effectiveCollapsed = isMobile || isSidebarCollapsed

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 pt-16 transition-all duration-300 ${effectiveCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}