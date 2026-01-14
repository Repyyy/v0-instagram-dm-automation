"use client"

import { useState } from "react"
import { DashboardOverview } from "@/components/tabs/dashboard-overview"
import { CampaignsTab } from "@/components/tabs/campaigns-tab"
import { TemplatesTab } from "@/components/tabs/templates-tab"
import { TargetsTab } from "@/components/tabs/targets-tab"
import { AutomationTab } from "@/components/tabs/automation-tab"
import { LogsTab } from "@/components/tabs/logs-tab"
import { SettingsTab } from "@/components/tabs/settings-tab"
import { LayoutDashboard, Users, FileText, Settings, Play, History, Target, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", icon: Target },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "targets", label: "Targets", icon: Users },
  { id: "automation", label: "Automation", icon: Play },
  { id: "logs", label: "Activity Logs", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
]

export function DashboardContent() {
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
    <div className="flex h-[calc(100vh-3rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Instagram className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">InstaBot Pro</h1>
            <p className="text-xs text-muted-foreground">DM Automation</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
              {item.id === "automation" && isRunning && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
              )}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
    </div>
  )
}
