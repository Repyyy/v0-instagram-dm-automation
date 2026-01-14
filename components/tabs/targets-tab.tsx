"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Trash2, Upload, UserPlus, Search, CheckCircle2, Clock, XCircle, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function TargetsTab() {
  const { targets, addTarget, addTargets, deleteTarget, clearTargets } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    followers: "",
  })

  const [importData, setImportData] = useState("")

  const handleSubmit = () => {
    if (!formData.username) {
      toast.error("Username harus diisi")
      return
    }

    addTarget({
      username: formData.username.replace("@", ""),
      fullName: formData.fullName || undefined,
      followers: formData.followers ? Number.parseInt(formData.followers) : undefined,
      status: "pending",
      type: "specific",
    })

    toast.success("Target berhasil ditambahkan")
    setIsDialogOpen(false)
    setFormData({ username: "", fullName: "", followers: "" })
  }

  const handleImport = () => {
    const lines = importData.split("\n").filter((l) => l.trim())
    const newTargets = lines.map((line) => {
      const [username, fullName, followers] = line.split(",").map((s) => s.trim())
      return {
        username: username.replace("@", ""),
        fullName: fullName || undefined,
        followers: followers ? Number.parseInt(followers) : undefined,
        status: "pending" as const,
        type: "specific" as const,
      }
    })

    addTargets(newTargets)
    toast.success(`${newTargets.length} target berhasil diimport`)
    setIsImportOpen(false)
    setImportData("")
  }

  const filteredTargets = targets.filter(
    (t) =>
      t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const statusCounts = {
    pending: targets.filter((t) => t.status === "pending").length,
    sent: targets.filter((t) => t.status === "sent").length,
    replied: targets.filter((t) => t.status === "replied").length,
    failed: targets.filter((t) => t.status === "failed").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Targets</h1>
          <p className="text-muted-foreground">Kelola daftar target DM Anda</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Targets</DialogTitle>
                <DialogDescription>Import multiple targets sekaligus (satu per baris)</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Data Targets</Label>
                  <Textarea
                    placeholder="username1, Full Name, 1000&#10;username2, Another Name, 2000&#10;username3"
                    className="min-h-[200px] font-mono text-sm"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: username, nama (opsional), followers (opsional)
                  </p>
                </div>
                <Button className="w-full" onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importData.split("\n").filter((l) => l.trim()).length} Targets
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Target
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Target Baru</DialogTitle>
                <DialogDescription>Tambahkan target spesifik untuk DM automation</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Username Instagram</Label>
                  <Input
                    placeholder="@username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap (opsional)</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Followers (opsional)</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleSubmit}>
                  Tambah Target
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.sent}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--chart-2)]/10">
              <MessageSquare className="h-5 w-5 text-[var(--chart-2)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.replied}</p>
              <p className="text-xs text-muted-foreground">Replied</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari username..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {targets.length > 0 && (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive bg-transparent"
            onClick={() => {
              clearTargets()
              toast.success("Semua target berhasil dihapus")
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus Semua
          </Button>
        )}
      </div>

      {/* Targets Table */}
      {targets.length > 0 ? (
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTargets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell className="font-medium">@{target.username}</TableCell>
                  <TableCell>{target.fullName || "-"}</TableCell>
                  <TableCell>{target.followers ? target.followers.toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{target.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        target.status === "sent"
                          ? "default"
                          : target.status === "replied"
                            ? "secondary"
                            : target.status === "failed"
                              ? "destructive"
                              : "outline"
                      }
                      className={cn(
                        target.status === "sent" && "bg-[var(--success)] text-[var(--success)]-foreground",
                        target.status === "replied" && "bg-[var(--chart-2)] text-white",
                      )}
                    >
                      {target.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteTarget(target.id)
                        toast.success("Target berhasil dihapus")
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Belum ada target</h3>
            <p className="text-sm text-muted-foreground mb-4">Tambahkan target untuk memulai DM automation</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Target
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
