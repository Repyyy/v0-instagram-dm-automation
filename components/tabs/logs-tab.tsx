"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Trash2, CheckCircle2, XCircle, Clock, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

export function LogsTab() {
  const { logs, campaigns, clearLogs } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [campaignFilter, setCampaignFilter] = useState<string>("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.targetUsername.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesCampaign = campaignFilter === "all" || log.campaignId === campaignFilter
    return matchesSearch && matchesStatus && matchesCampaign
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">Riwayat semua aktivitas DM automation</p>
        </div>
        {logs.length > 0 && (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive bg-transparent"
            onClick={() => {
              clearLogs()
              toast.success("Semua log berhasil dihapus")
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari username..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
          </SelectContent>
        </Select>
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Campaign</SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      {logs.length > 0 ? (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Log Entries
              </CardTitle>
              <Badge variant="outline">{filteredLogs.length} entries</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-border">
                {filteredLogs.map((log) => {
                  const campaign = campaigns.find((c) => c.id === log.campaignId)
                  return (
                    <div key={log.id} className="p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {log.status === "sent" ? (
                            <div className="p-2 rounded-lg bg-[var(--success)]/10">
                              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                            </div>
                          ) : log.status === "failed" ? (
                            <div className="p-2 rounded-lg bg-destructive/10">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                              <Clock className="h-4 w-4 text-[var(--warning)]" />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">@{log.targetUsername}</span>
                              <Badge
                                variant={
                                  log.status === "sent"
                                    ? "default"
                                    : log.status === "failed"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className={cn(log.status === "sent" && "bg-[var(--success)]")}
                              >
                                {log.status}
                              </Badge>
                            </div>
                            {campaign && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {campaign.name}
                              </p>
                            )}
                            {log.error && <p className="text-xs text-destructive">{log.error}</p>}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("id-ID")}
                        </span>
                      </div>
                      {log.message && (
                        <div className="mt-3 ml-11 p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground line-clamp-2">
                          {log.message}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Belum ada log</h3>
            <p className="text-sm text-muted-foreground">Log akan muncul setelah automation berjalan</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
