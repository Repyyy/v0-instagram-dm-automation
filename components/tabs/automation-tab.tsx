"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Settings2, Zap, AlertTriangle, CheckCircle2, Timer, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AutomationTab() {
  const {
    campaigns,
    templates,
    targets,
    logs,
    isRunning,
    currentCampaignId,
    setRunning,
    setCurrentCampaign,
    addLog,
    updateTarget,
    updateCampaign,
  } = useStore()

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
  const [countdown, setCountdown] = useState(0)
  const [currentTarget, setCurrentTarget] = useState<string | null>(null)
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 })
  const [infiniteMode, setInfiniteMode] = useState(true)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId)
  const pendingTargets = targets.filter((t) => t.status === "pending")

  const getRandomDelay = useCallback(() => {
    if (!selectedCampaign) return 5000
    const min = selectedCampaign.delayMin * 60 * 1000
    const max = selectedCampaign.delayMax * 60 * 1000
    return Math.floor(Math.random() * (max - min + 1)) + min
  }, [selectedCampaign])

  const processTarget = useCallback(() => {
    const target = pendingTargets[0]
    if (!target || !selectedCampaign) return

    setCurrentTarget(target.username)

    const template = templates.find((t) => t.id === selectedCampaign.templateId)
    const message =
      template?.content
        .replace(/\{name\}/g, target.fullName || target.username)
        .replace(/\{username\}/g, target.username) || ""

    // Simulasi pengiriman DM (dalam implementasi nyata, ini akan memanggil API Instagram)
    const isSuccess = Math.random() > 0.1 // 90% success rate simulasi

    setTimeout(() => {
      if (isSuccess) {
        updateTarget(target.id, { status: "sent", sentAt: new Date() })
        addLog({
          campaignId: selectedCampaign.id,
          targetUsername: target.username,
          message,
          status: "sent",
        })
        updateCampaign(selectedCampaign.id, {
          totalSent: selectedCampaign.totalSent + 1,
        })
        setStats((prev) => ({ ...prev, sent: prev.sent + 1 }))
        toast.success(`DM terkirim ke @${target.username}`)
      } else {
        updateTarget(target.id, { status: "failed" })
        addLog({
          campaignId: selectedCampaign.id,
          targetUsername: target.username,
          message,
          status: "failed",
          error: "Gagal mengirim DM",
        })
        setStats((prev) => ({ ...prev, failed: prev.failed + 1 }))
        toast.error(`Gagal mengirim ke @${target.username}`)
      }
      setCurrentTarget(null)
    }, 2000)
  }, [pendingTargets, selectedCampaign, templates, updateTarget, addLog, updateCampaign])

  const startAutomation = () => {
    if (!selectedCampaignId) {
      toast.error("Pilih campaign terlebih dahulu")
      return
    }

    if (pendingTargets.length === 0) {
      toast.error("Tidak ada target yang pending")
      return
    }

    setRunning(true)
    setCurrentCampaign(selectedCampaignId)
    updateCampaign(selectedCampaignId, { status: "active" })
    setStats({ sent: 0, failed: 0, total: pendingTargets.length })
    toast.success("Automation dimulai!")

    // Proses target pertama
    processTarget()

    // Set interval untuk proses berikutnya
    const delay = getRandomDelay()
    setCountdown(Math.ceil(delay / 1000))

    intervalRef.current = setInterval(() => {
      if (pendingTargets.length > 0 || infiniteMode) {
        processTarget()
        const newDelay = getRandomDelay()
        setCountdown(Math.ceil(newDelay / 1000))
      } else {
        stopAutomation()
      }
    }, delay)

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
  }

  const stopAutomation = useCallback(() => {
    setRunning(false)
    setCurrentCampaign(null)
    setCurrentTarget(null)
    setCountdown(0)

    if (selectedCampaignId) {
      updateCampaign(selectedCampaignId, { status: "paused" })
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }

    toast.info("Automation dihentikan")
  }, [selectedCampaignId, setRunning, setCurrentCampaign, updateCampaign])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const progress = stats.total > 0 ? ((stats.sent + stats.failed) / stats.total) * 100 : 0

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Control</h1>
          <p className="text-muted-foreground">Kontrol dan monitor DM automation</p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            isRunning ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-muted text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-3 w-3 rounded-full",
              isRunning ? "bg-[var(--success)] animate-pulse" : "bg-muted-foreground",
            )}
          />
          <span className="font-medium">{isRunning ? "RUNNING" : "STOPPED"}</span>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Konfigurasi Automation
            </CardTitle>
            <CardDescription>Pilih campaign dan atur parameter automation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mode</Label>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Infinite Loop</span>
                  </div>
                  <Switch checked={infiniteMode} onCheckedChange={setInfiniteMode} disabled={isRunning} />
                </div>
              </div>
            </div>

            {selectedCampaign && (
              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Template</span>
                  <span className="text-sm font-medium">
                    {templates.find((t) => t.id === selectedCampaign.templateId)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delay</span>
                  <span className="text-sm font-medium">
                    {selectedCampaign.delayMin} - {selectedCampaign.delayMax} menit
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jam Aktif</span>
                  <span className="text-sm font-medium">
                    {selectedCampaign.startTime} - {selectedCampaign.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Target Pending</span>
                  <Badge variant="outline">{pendingTargets.length}</Badge>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isRunning ? (
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={startAutomation}
                  disabled={!selectedCampaignId || pendingTargets.length === 0}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Mulai Automation
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 bg-transparent" size="lg" onClick={stopAutomation}>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                  <Button variant="destructive" size="lg" onClick={stopAutomation}>
                    <Square className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Live Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Countdown */}
            <div className="text-center p-6 rounded-lg bg-secondary/50">
              <Timer className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold font-mono">{formatCountdown(countdown)}</p>
              <p className="text-sm text-muted-foreground mt-1">hingga DM berikutnya</p>
            </div>

            {/* Current Target */}
            {currentTarget && (
              <div className="p-4 rounded-lg border border-primary/50 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-muted-foreground">Sedang mengirim ke</span>
                </div>
                <p className="font-medium">@{currentTarget}</p>
              </div>
            )}

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--success)]/10 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-[var(--success)]" />
                  <p className="text-lg font-bold mt-1">{stats.sent}</p>
                  <p className="text-xs text-muted-foreground">Terkirim</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10 text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto text-destructive" />
                  <p className="text-lg font-bold mt-1">{stats.failed}</p>
                  <p className="text-xs text-muted-foreground">Gagal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Tips Anti-Spam</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gunakan delay minimal 5-15 menit untuk menghindari deteksi spam</li>
                <li>• Jangan mengirim lebih dari 50-100 DM per hari</li>
                <li>• Variasikan template pesan untuk menghindari pola yang sama</li>
                <li>• Atur jam aktif sesuai zona waktu target audience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
