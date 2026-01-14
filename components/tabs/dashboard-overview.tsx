"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Users,
  Target,
  TrendingUp,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { campaigns, targets, logs, isRunning, templates } = useStore()

  const totalSent = logs.filter((l) => l.status === "sent").length
  const totalFailed = logs.filter((l) => l.status === "failed").length
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length
  const pendingTargets = targets.filter((t) => t.status === "pending").length

  const stats = [
    {
      title: "Total DM Terkirim",
      value: totalSent,
      change: "+12%",
      icon: MessageSquare,
      color: "text-primary",
    },
    {
      title: "Target Aktif",
      value: pendingTargets,
      change: `${targets.length} total`,
      icon: Users,
      color: "text-[var(--chart-2)]",
    },
    {
      title: "Campaign Aktif",
      value: activeCampaigns,
      change: `${campaigns.length} total`,
      icon: Target,
      color: "text-[var(--chart-4)]",
    },
    {
      title: "Success Rate",
      value: totalSent > 0 ? `${Math.round((totalSent / (totalSent + totalFailed)) * 100)}%` : "0%",
      change: `${totalFailed} gagal`,
      icon: TrendingUp,
      color: "text-[var(--success)]",
    },
  ]

  const recentLogs = logs.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitoring dan kontrol automation DM Instagram Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              isRunning ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-2 w-2 rounded-full",
                isRunning ? "bg-[var(--success)] animate-pulse" : "bg-muted-foreground",
              )}
            />
            <span className="text-sm font-medium">{isRunning ? "Automation Berjalan" : "Automation Berhenti"}</span>
          </div>
          <Button onClick={() => onNavigate("automation")}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Kelola Automation" : "Mulai Automation"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Aksi cepat untuk mengelola automation</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-transparent"
              onClick={() => onNavigate("campaigns")}
            >
              <Target className="h-6 w-6 text-primary" />
              <span>Buat Campaign</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-transparent"
              onClick={() => onNavigate("templates")}
            >
              <MessageSquare className="h-6 w-6 text-[var(--chart-2)]" />
              <span>Buat Template</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-transparent"
              onClick={() => onNavigate("targets")}
            >
              <Users className="h-6 w-6 text-[var(--chart-4)]" />
              <span>Import Targets</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-transparent"
              onClick={() => onNavigate("logs")}
            >
              <Clock className="h-6 w-6 text-[var(--chart-5)]" />
              <span>Lihat Logs</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>Log aktivitas automation terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                    {log.status === "sent" ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                    ) : log.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-[var(--warning)] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">@{log.targetUsername}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString("id-ID")}</p>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        log.status === "sent" && "bg-[var(--success)]/10 text-[var(--success)]",
                        log.status === "failed" && "bg-destructive/10 text-destructive",
                        log.status === "queued" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                      )}
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Belum ada aktivitas</p>
                <p className="text-xs">Mulai automation untuk melihat log</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Campaign Overview
              </CardTitle>
              <CardDescription>Daftar campaign yang sedang berjalan</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("campaigns")}>
              Lihat Semua
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        campaign.status === "active" && "bg-[var(--success)]",
                        campaign.status === "paused" && "bg-[var(--warning)]",
                        campaign.status === "completed" && "bg-muted-foreground",
                      )}
                    />
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.targets.length} targets • Delay: {campaign.delayMin}-{campaign.delayMax} menit
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{campaign.totalSent} sent</p>
                    <p className="text-xs text-muted-foreground">{campaign.totalReplied} replied</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Belum ada campaign</p>
              <Button variant="link" size="sm" onClick={() => onNavigate("campaigns")}>
                Buat campaign pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
