"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { 
  Bell, 
  Search, 
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Github,
  Code,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWindowSize } from "@/hooks/useWindowSize"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  icon: React.ReactNode
  title: string
  description: string
  time: string
}

const NotificationItem = ({ icon, title, description, time }: NotificationItemProps) => {
  return (
    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const { data: session } = useSession()
  const { width } = useWindowSize()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const isMobile = width < 768

  return (
    <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <Code className="h-8 w-8 text-blue-600" />
                <span className="hidden md:block text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  DevMetrics
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Search */}
          {!isMobile && (
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search assessments..."
                  className="block w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex-1" />

          {/* Mobile Search Button - Moved to right */}
          {isMobile && !isSearchOpen && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* Actions */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-2">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[450px] overflow-y-auto">
                    <NotificationItem
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      title="Assessment Completed"
                      description="Your last assessment has been evaluated."
                      time="2 min ago"
                    />
                    <NotificationItem
                      icon={<Github className="h-5 w-5 text-purple-500" />}
                      title="New Assessment Available"
                      description="Try our latest coding challenge!"
                      time="1 hour ago"
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="w-full cursor-pointer text-center text-blue-600">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3">
                    <img
                      src="/api/placeholder/32/32"
                      alt={session?.user?.name || "User"}
                      className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session?.user?.email}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
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
          )}
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search assessments..."
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}