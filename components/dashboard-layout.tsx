"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Settings, Play, History, Target, ChevronLeft, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", icon: Target },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "targets", label: "Targets", icon: Users },
  { id: "automation", label: "Automation", icon: Play },
  { id: "logs", label: "Activity Logs", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { isRunning } = useStore()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Instagram className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">InstaBot Pro</h1>
              <p className="text-xs text-muted-foreground">DM Automation</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3", collapsed && "justify-center px-2")}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {item.id === "automation" && isRunning && !collapsed && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
              )}
            </Button>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>

      {/* Tab State Provider - Hidden, just for context */}
      <input type="hidden" id="active-tab" value={activeTab} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.setActiveTab = ${JSON.stringify(setActiveTab.toString())}`,
        }}
      />
    </div>
  )
}

// Export for use in other components
export function useActiveTab() {
  if (typeof window !== "undefined") {
    const input = document.getElementById("active-tab") as HTMLInputElement
    return input?.value || "dashboard"
  }
  return "dashboard"
}
