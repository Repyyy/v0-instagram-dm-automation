"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Instagram, Bell, Shield, Clock, Save, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function SettingsTab() {
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    username: "",
    password: "",
    dailyLimit: 50,
    enableNotifications: true,
    pauseOnError: true,
    respectQuietHours: true,
    quietStart: "22:00",
    quietEnd: "08:00",
  })

  const handleSave = () => {
    // Simulasi menyimpan settings
    toast.success("Settings berhasil disimpan")
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Konfigurasi akun dan preferensi automation</p>
      </div>

      {/* Instagram Account */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-primary" />
            Akun Instagram
          </CardTitle>
          <CardDescription>Kredensial akun Instagram untuk automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              placeholder="@username"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={settings.password}
                onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[var(--warning)]/10 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)] shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Gunakan akun khusus untuk automation. Jangan gunakan akun utama Anda untuk menghindari banned.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Safety Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Keamanan
          </CardTitle>
          <CardDescription>Pengaturan untuk menghindari banned dan spam detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Batas DM Harian</Label>
            <Input
              type="number"
              min={10}
              max={200}
              value={settings.dailyLimit}
              onChange={(e) => setSettings({ ...settings, dailyLimit: Number.parseInt(e.target.value) || 50 })}
            />
            <p className="text-xs text-muted-foreground">
              Rekomendasi: 30-50 DM per hari untuk akun baru, 50-100 untuk akun lama
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pause Saat Error</Label>
              <p className="text-xs text-muted-foreground">Hentikan automation saat terjadi error berulang</p>
            </div>
            <Switch
              checked={settings.pauseOnError}
              onCheckedChange={(checked) => setSettings({ ...settings, pauseOnError: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Quiet Hours
          </CardTitle>
          <CardDescription>Jeda automation di jam-jam tertentu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aktifkan Quiet Hours</Label>
              <p className="text-xs text-muted-foreground">Pause automation di jam istirahat</p>
            </div>
            <Switch
              checked={settings.respectQuietHours}
              onCheckedChange={(checked) => setSettings({ ...settings, respectQuietHours: checked })}
            />
          </div>

          {settings.respectQuietHours && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mulai</Label>
                <Input
                  type="time"
                  value={settings.quietStart}
                  onChange={(e) => setSettings({ ...settings, quietStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Selesai</Label>
                <Input
                  type="time"
                  value={settings.quietEnd}
                  onChange={(e) => setSettings({ ...settings, quietEnd: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifikasi
          </CardTitle>
          <CardDescription>Pengaturan notifikasi dan alert</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Notifications</Label>
              <p className="text-xs text-muted-foreground">Terima notifikasi untuk DM terkirim dan error</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button className="w-full" size="lg" onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Simpan Settings
      </Button>
    </div>
  )
}
