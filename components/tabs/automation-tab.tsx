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
import { Input } from "@/components/ui/input"
import {
  Play,
  Pause,
  Square,
  Settings2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Timer,
  RefreshCw,
  Clock,
  Shield,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AutomationTab() {
  const {
    campaigns,
    templates,
    targets,
    isRunning,
    setRunning,
    setCurrentCampaign,
    addLog,
    updateTarget,
    updateCampaign,
    addTarget,
  } = useStore()

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
  const [countdown, setCountdown] = useState(0)
  const [currentTarget, setCurrentTarget] = useState<string | null>(null)
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0, queued: 0 })
  const [infiniteMode, setInfiniteMode] = useState(true)
  const [autoRetry, setAutoRetry] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(100)
  const [todaySent, setTodaySent] = useState(0)

  const automationRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const sessionRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)
  const currentDelayRef = useRef(0)

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId)

  const getPendingTargets = useCallback(() => {
    return targets.filter((t) => t.status === "pending")
  }, [targets])

  const getRandomDelay = useCallback(() => {
    if (!selectedCampaign) return 60000 // default 1 minute
    const min = selectedCampaign.delayMin * 60 * 1000
    const max = selectedCampaign.delayMax * 60 * 1000
    return Math.floor(Math.random() * (max - min + 1)) + min
  }, [selectedCampaign])

  const processNextTarget = useCallback(async () => {
    if (isProcessingRef.current) return

    const pendingTargets = getPendingTargets()

    // Check daily limit
    if (todaySent >= dailyLimit) {
      toast.warning("Batas harian tercapai. Automation akan dilanjutkan besok.")
      return false
    }

    // Check if we have targets
    if (pendingTargets.length === 0) {
      if (infiniteMode) {
        // In infinite mode, wait for new targets
        toast.info("Menunggu target baru...")
        return true // continue running
      } else {
        toast.success("Semua target telah diproses!")
        return false // stop
      }
    }

    isProcessingRef.current = true
    const target = pendingTargets[0]
    setCurrentTarget(target.username)

    const template = templates.find((t) => t.id === selectedCampaign?.templateId)
    const message =
      template?.content
        .replace(/\{name\}/g, target.fullName || target.username)
        .replace(/\{username\}/g, target.username) || ""

    // Simulate DM sending with realistic delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    // 95% success rate simulation
    const isSuccess = Math.random() > 0.05

    if (isSuccess) {
      updateTarget(target.id, { status: "sent", sentAt: new Date() })
      addLog({
        campaignId: selectedCampaign?.id || "",
        targetUsername: target.username,
        message,
        status: "sent",
      })
      if (selectedCampaign) {
        updateCampaign(selectedCampaign.id, {
          totalSent: selectedCampaign.totalSent + 1,
        })
      }
      setStats((prev) => ({ ...prev, sent: prev.sent + 1 }))
      setTodaySent((prev) => prev + 1)
      toast.success(`DM terkirim ke @${target.username}`)
    } else {
      if (autoRetry) {
        // Move to end of queue for retry
        updateTarget(target.id, { status: "pending" })
        toast.warning(`Gagal kirim ke @${target.username}, akan dicoba lagi`)
      } else {
        updateTarget(target.id, { status: "failed" })
        addLog({
          campaignId: selectedCampaign?.id || "",
          targetUsername: target.username,
          message,
          status: "failed",
          error: "Gagal mengirim DM",
        })
        setStats((prev) => ({ ...prev, failed: prev.failed + 1 }))
        toast.error(`Gagal mengirim ke @${target.username}`)
      }
    }

    setCurrentTarget(null)
    isProcessingRef.current = false
    return true
  }, [
    getPendingTargets,
    selectedCampaign,
    templates,
    infiniteMode,
    autoRetry,
    dailyLimit,
    todaySent,
    updateTarget,
    addLog,
    updateCampaign,
  ])

  const runAutomationCycle = useCallback(async () => {
    const shouldContinue = await processNextTarget()

    if (!shouldContinue) {
      stopAutomation()
      return
    }

    // Schedule next run with random delay
    const delay = getRandomDelay()
    currentDelayRef.current = delay
    setCountdown(Math.ceil(delay / 1000))

    automationRef.current = setTimeout(() => {
      runAutomationCycle()
    }, delay)
  }, [processNextTarget, getRandomDelay])

  const startAutomation = useCallback(() => {
    if (!selectedCampaignId) {
      toast.error("Pilih campaign terlebih dahulu")
      return
    }

    const pendingTargets = getPendingTargets()
    if (pendingTargets.length === 0 && !infiniteMode) {
      toast.error("Tidak ada target yang pending")
      return
    }

    setRunning(true)
    setCurrentCampaign(selectedCampaignId)
    updateCampaign(selectedCampaignId, { status: "active" })
    setStats({ sent: 0, failed: 0, total: pendingTargets.length, queued: pendingTargets.length })
    setSessionTime(0)
    toast.success("Automation dimulai!")

    // Start session timer
    sessionRef.current = setInterval(() => {
      setSessionTime((prev) => prev + 1)
    }, 1000)

    // Start countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)

    // Start first cycle
    runAutomationCycle()
  }, [
    selectedCampaignId,
    getPendingTargets,
    infiniteMode,
    setRunning,
    setCurrentCampaign,
    updateCampaign,
    runAutomationCycle,
  ])

  const stopAutomation = useCallback(() => {
    setRunning(false)
    setCurrentCampaign(null)
    setCurrentTarget(null)
    setCountdown(0)
    isProcessingRef.current = false

    if (selectedCampaignId) {
      updateCampaign(selectedCampaignId, { status: "paused" })
    }

    if (automationRef.current) {
      clearTimeout(automationRef.current)
      automationRef.current = null
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }

    if (sessionRef.current) {
      clearInterval(sessionRef.current)
      sessionRef.current = null
    }

    toast.info("Automation dihentikan")
  }, [selectedCampaignId, setRunning, setCurrentCampaign, updateCampaign])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (automationRef.current) clearTimeout(automationRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (sessionRef.current) clearInterval(sessionRef.current)
    }
  }, [])

  // Update queued count when targets change
  useEffect(() => {
    const pending = getPendingTargets()
    setStats((prev) => ({ ...prev, queued: pending.length, total: pending.length + prev.sent + prev.failed }))
  }, [targets, getPendingTargets])

  const progress = stats.total > 0 ? ((stats.sent + stats.failed) / stats.total) * 100 : 0

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
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
        <div className="flex items-center gap-3">
          {isRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(sessionTime)}</span>
            </div>
          )}
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium",
              isRunning ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-3 w-3 rounded-full",
                isRunning ? "bg-success animate-pulse" : "bg-muted-foreground",
              )}
            />
            <span>{isRunning ? "RUNNING" : "STOPPED"}</span>
          </div>
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
                <Label>Batas Harian</Label>
                <Input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  disabled={isRunning}
                  min={1}
                  max={500}
                />
              </div>
            </div>

            {/* Toggle Options */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Infinite Loop</span>
                    <p className="text-xs text-muted-foreground">Terus berjalan tanpa henti</p>
                  </div>
                </div>
                <Switch checked={infiniteMode} onCheckedChange={setInfiniteMode} disabled={isRunning} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Auto Retry</span>
                    <p className="text-xs text-muted-foreground">Coba ulang jika gagal</p>
                  </div>
                </div>
                <Switch checked={autoRetry} onCheckedChange={setAutoRetry} disabled={isRunning} />
              </div>
            </div>

            {selectedCampaign && (
              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Template</span>
                  <span className="text-sm font-medium">
                    {templates.find((t) => t.id === selectedCampaign.templateId)?.name || "Tidak dipilih"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delay Acak</span>
                  <span className="text-sm font-medium">
                    {selectedCampaign.delayMin} - {selectedCampaign.delayMax} menit
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jam Aktif</span>
                  <span className="text-sm font-medium">
                    {selectedCampaign.startTime || "00:00"} - {selectedCampaign.endTime || "23:59"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Target Pending</span>
                  <Badge variant="outline">{getPendingTargets().length}</Badge>
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
                  disabled={!selectedCampaignId || (getPendingTargets().length === 0 && !infiniteMode)}
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
              <p className="text-3xl font-bold font-mono">{formatTime(countdown)}</p>
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

            {/* Daily Progress */}
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Hari ini</span>
                <span className="text-sm font-medium">
                  {todaySent} / {dailyLimit}
                </span>
              </div>
              <Progress value={(todaySent / dailyLimit) * 100} className="h-2" />
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress Sesi</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-success/10 text-center">
                  <CheckCircle2 className="h-4 w-4 mx-auto text-success" />
                  <p className="text-lg font-bold mt-1">{stats.sent}</p>
                  <p className="text-xs text-muted-foreground">Terkirim</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10 text-center">
                  <AlertTriangle className="h-4 w-4 mx-auto text-destructive" />
                  <p className="text-lg font-bold mt-1">{stats.failed}</p>
                  <p className="text-xs text-muted-foreground">Gagal</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 text-center">
                  <TrendingUp className="h-4 w-4 mx-auto text-primary" />
                  <p className="text-lg font-bold mt-1">{stats.queued}</p>
                  <p className="text-xs text-muted-foreground">Antrian</p>
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
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Tips Anti-Spam untuk Success Rate 100%</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gunakan delay minimal 5-15 menit untuk menghindari deteksi spam</li>
                <li>• Jangan mengirim lebih dari 50-100 DM per hari</li>
                <li>
                  • Variasikan template pesan dengan personalisasi {"{name}"} dan {"{username}"}
                </li>
                <li>• Aktifkan Auto Retry untuk mengulangi DM yang gagal secara otomatis</li>
                <li>• Gunakan Infinite Loop untuk automation tanpa henti 24/7</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
