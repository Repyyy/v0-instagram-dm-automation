"use client"

import { useState } from "react"
import { useStore, type MessageTemplate } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, FileText, Trash2, Edit, Copy, Variable, MoreVertical, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export function TemplatesTab() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    content: "",
  })

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{(\w+)\}/g)
    if (!matches) return []
    return [...new Set(matches.map((m) => m.slice(1, -1)))]
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      toast.error("Nama dan isi template harus diisi")
      return
    }

    const variables = extractVariables(formData.content)

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name: formData.name,
        content: formData.content,
        variables,
      })
      toast.success("Template berhasil diupdate")
    } else {
      addTemplate({
        name: formData.name,
        content: formData.content,
        variables,
      })
      toast.success("Template berhasil dibuat")
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({ name: "", content: "" })
    setEditingTemplate(null)
  }

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      content: template.content,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteTemplate(id)
    toast.success("Template berhasil dihapus")
  }

  const handleDuplicate = (template: MessageTemplate) => {
    addTemplate({
      name: `${template.name} (Copy)`,
      content: template.content,
      variables: template.variables,
    })
    toast.success("Template berhasil diduplikasi")
  }

  const previewContent = (content: string) => {
    return content
      .replace(/\{name\}/g, "John Doe")
      .replace(/\{username\}/g, "@johndoe")
      .replace(/\{company\}/g, "ABC Company")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Kelola template pesan DM Anda</p>
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
              Buat Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "Buat Template Baru"}</DialogTitle>
              <DialogDescription>Buat template pesan untuk DM automation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Template</Label>
                <Input
                  placeholder="Contoh: Intro Bisnis"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Isi Pesan</Label>
                <Textarea
                  placeholder="Tulis pesan Anda di sini..."
                  className="min-h-[200px] resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Gunakan {"{"}
                  <span>name</span>
                  {"}"}, {"{"}
                  <span>username</span>
                  {"}"}, {"{"}
                  <span>company</span>
                  {"}"} untuk variabel dinamis
                </p>
              </div>

              {extractVariables(formData.content).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Variabel terdeteksi:</span>
                  {extractVariables(formData.content).map((v) => (
                    <Badge key={v} variant="secondary">
                      <Variable className="h-3 w-3 mr-1" />
                      {v}
                    </Badge>
                  ))}
                </div>
              )}

              <Button className="w-full" onClick={handleSubmit}>
                {editingTemplate ? "Update Template" : "Buat Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>Preview dengan data contoh</DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 rounded-lg bg-secondary/50 whitespace-pre-wrap">
            {previewTemplate && previewContent(previewTemplate.content)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates List */}
      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(template.createdAt).toLocaleDateString("id-ID")}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                        <Eye className="h-4 w-4 mr-2" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" /> Duplikasi
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{template.content}</p>
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {"{" + v + "}"}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Belum ada template</h3>
            <p className="text-sm text-muted-foreground mb-4">Buat template pesan untuk digunakan di campaign</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
