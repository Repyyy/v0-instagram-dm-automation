"use client"

import { useState } from "react"
import { useStore, type Campaign } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, TargetIcon, Play, Pause, Trash2, Edit, Clock, Users, MessageSquare, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function CampaignsTab() {
  const { campaigns, templates, targets, addCampaign, updateCampaign, deleteCampaign } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    templateId: "",
    delayMin: 5,
    delayMax: 15,
    startTime: "09:00",
    endTime: "21:00",
    selectedTargets: [] as string[],
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.templateId) {
      toast.error("Nama campaign dan template harus diisi")
      return
    }

    const campaignTargets = targets.filter(
      (t) => formData.selectedTargets.length === 0 || formData.selectedTargets.includes(t.id),
    )

    if (editingCampaign) {
      updateCampaign(editingCampaign.id, {
        name: formData.name,
        templateId: formData.templateId,
        delayMin: formData.delayMin,
        delayMax: formData.delayMax,
        startTime: formData.startTime,
        endTime: formData.endTime,
        targets: campaignTargets,
      })
      toast.success("Campaign berhasil diupdate")
    } else {
      addCampaign({
        name: formData.name,
        templateId: formData.templateId,
        targets: campaignTargets,
        status: "paused",
        delayMin: formData.delayMin,
        delayMax: formData.delayMax,
        startTime: formData.startTime,
        endTime: formData.endTime,
      })
      toast.success("Campaign berhasil dibuat")
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      templateId: "",
      delayMin: 5,
      delayMax: 15,
      startTime: "09:00",
      endTime: "21:00",
      selectedTargets: [],
    })
    setEditingCampaign(null)
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      templateId: campaign.templateId,
      delayMin: campaign.delayMin,
      delayMax: campaign.delayMax,
      startTime: campaign.startTime || "09:00",
      endTime: campaign.endTime || "21:00",
      selectedTargets: campaign.targets.map((t) => t.id),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteCampaign(id)
    toast.success("Campaign berhasil dihapus")
  }

  const toggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active"
    updateCampaign(campaign.id, { status: newStatus })
    toast.success(`Campaign ${newStatus === "active" ? "diaktifkan" : "dijeda"}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Kelola campaign DM automation Anda</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? "Edit Campaign" : "Buat Campaign Baru"}</DialogTitle>
              <DialogDescription>Konfigurasi campaign DM automation Anda</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Campaign</Label>
                <Input
                  placeholder="Contoh: Outreach Januari 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Template Pesan</Label>
                <Select
                  value={formData.templateId}
                  onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delay Minimum (menit)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.delayMin}
                    onChange={(e) => setFormData({ ...formData, delayMin: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delay Maximum (menit)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.delayMax}
                    onChange={(e) => setFormData({ ...formData, delayMax: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Mulai</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jam Selesai</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                <p>💡 Campaign akan menggunakan {targets.length} target yang tersedia.</p>
                <p className="mt-1">
                  Delay random antara {formData.delayMin}-{formData.delayMax} menit untuk menghindari spam detection.
                </p>
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                {editingCampaign ? "Update Campaign" : "Buat Campaign"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns List */}
      {campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const template = templates.find((t) => t.id === campaign.templateId)
            return (
              <Card key={campaign.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          campaign.status === "active" && "bg-[var(--success)]",
                          campaign.status === "paused" && "bg-[var(--warning)]",
                          campaign.status === "completed" && "bg-muted-foreground",
                        )}
                      />
                      <Badge
                        variant={
                          campaign.status === "active"
                            ? "default"
                            : campaign.status === "paused"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(campaign)}>
                          {campaign.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" /> Aktifkan
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(campaign.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg mt-2">{campaign.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {template?.name || "Template tidak ditemukan"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{campaign.targets.length} targets</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {campaign.delayMin}-{campaign.delayMax}m
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-sm">
                      <span className="text-[var(--success)] font-medium">{campaign.totalSent}</span>
                      <span className="text-muted-foreground"> sent</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-primary font-medium">{campaign.totalReplied}</span>
                      <span className="text-muted-foreground"> replied</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TargetIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Belum ada campaign</h3>
            <p className="text-sm text-muted-foreground mb-4">Buat campaign pertama untuk memulai automation</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
