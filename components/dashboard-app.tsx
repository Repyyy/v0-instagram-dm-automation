"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Settings, Play, History, Target, ChevronLeft, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { DashboardOverview } from "@/components/tabs/dashboard-overview"
import { CampaignsTab } from "@/components/tabs/campaigns-tab"
import { TemplatesTab } from "@/components/tabs/templates-tab"
import { TargetsTab } from "@/components/tabs/targets-tab"
import { AutomationTab } from "@/components/tabs/automation-tab"
import { LogsTab } from "@/components/tabs/logs-tab"
import { SettingsTab } from "@/components/tabs/settings-tab"
import { Toaster } from "@/components/ui/sonner"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", icon: Target },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "targets", label: "Targets", icon: Users },
  { id: "automation", label: "Automation", icon: Play },
  { id: "logs", label: "Activity Logs", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
]

export function DashboardApp() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { isRunning } = useStore()

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onNavigate={setActiveTab} />
      case "campaigns":
        return <CampaignsTab />
      case "templates":
        return <TemplatesTab />
      case "targets":
        return <TargetsTab />
      case "automation":
        return <AutomationTab />
      case "logs":
        return <LogsTab />
      case "settings":
        return <SettingsTab />
      default:
        return <DashboardOverview onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Single instance */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shrink-0">
            <Instagram className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-semibold text-sidebar-foreground truncate">InstaBot Pro</h1>
              <p className="text-xs text-muted-foreground">DM Automation</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3", collapsed && "justify-center px-2")}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.id === "automation" && isRunning && (
                <span
                  className={cn(
                    "flex h-2 w-2 rounded-full bg-success animate-pulse shrink-0",
                    collapsed ? "absolute top-1 right-1" : "ml-auto",
                  )}
                />
              )}
            </Button>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>

      <Toaster />
    </div>
  )
}
