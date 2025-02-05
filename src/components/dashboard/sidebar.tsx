"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useWindowSize } from "@/hooks/useWindowSize"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  ClipboardList,
  User,
  BarChart,
  Code,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
} from "lucide-react"

const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    description: "Overview of your progress"
  },
  { 
    name: "Assessments", 
    href: "/dashboard/assessments", 
    icon: ClipboardList,
    description: "View and take assessments"
  },
  { 
    name: "Analytics", 
    href: "/dashboard/analytics", 
    icon: BarChart,
    description: "Your performance metrics"
  },
  { 
    name: "Profile", 
    href: "/dashboard/profile", 
    icon: User,
    description: "Manage your account"
  }
]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { width } = useWindowSize()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const isMobile = width < 768
  const effectiveCollapsed = isMobile || isCollapsed

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col justify-between",
        effectiveCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* App Name Section */}
      <div className="h-16 flex items-center justify-between border-b border-gray-200">
        <div className={cn(
          "flex items-center px-6 transition-all duration-300",
          effectiveCollapsed ? "justify-center px-4" : "space-x-3"
        )}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg flex-shrink-0">
            <Code className="h-6 w-6 text-white" />
          </div>
          {!effectiveCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DevMetrics
              </h1>
              <p className="text-xs text-gray-500">Assessment Platform</p>
            </div>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg mr-2"
          >
            {effectiveCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        
        {/* Main scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Section */}
          <nav className={cn(
            "p-3 space-y-1",
            effectiveCollapsed && "px-2"
          )}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center text-sm font-medium rounded-lg transition-all",
                    effectiveCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  title={effectiveCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "flex-shrink-0 transition-colors",
                    effectiveCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3",
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {!effectiveCollapsed && (
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className={cn(
                        "text-xs font-normal",
                        isActive ? "text-blue-500" : "text-gray-500"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Controls */}
      {isMobile && (
        <div className="border-t border-gray-200 p-3">
          <div className="space-y-2">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-center p-2">
                  <Bell className="h-6 w-6 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-80 mb-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[450px] overflow-y-auto">
                  {/* Add your notification items here */}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-center p-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile/Signout Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-center p-2">
                  <User className="h-6 w-6 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  )
}