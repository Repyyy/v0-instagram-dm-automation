import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Target {
  id: string
  username: string
  fullName?: string
  followers?: number
  status: "pending" | "sent" | "replied" | "failed"
  sentAt?: Date
  type: "specific" | "random"
}

export interface MessageTemplate {
  id: string
  name: string
  content: string
  variables: string[]
  createdAt: Date
}

export interface Campaign {
  id: string
  name: string
  templateId: string
  targets: Target[]
  status: "active" | "paused" | "completed"
  delayMin: number
  delayMax: number
  startTime?: string
  endTime?: string
  createdAt: Date
  totalSent: number
  totalReplied: number
}

export interface AutomationLog {
  id: string
  campaignId: string
  targetUsername: string
  message: string
  status: "sent" | "failed" | "queued"
  timestamp: Date
  error?: string
}

interface Store {
  campaigns: Campaign[]
  templates: MessageTemplate[]
  targets: Target[]
  logs: AutomationLog[]
  isRunning: boolean
  currentCampaignId: string | null

  // Actions
  addCampaign: (campaign: Omit<Campaign, "id" | "createdAt" | "totalSent" | "totalReplied">) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void

  addTemplate: (template: Omit<MessageTemplate, "id" | "createdAt">) => void
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void
  deleteTemplate: (id: string) => void

  addTarget: (target: Omit<Target, "id">) => void
  addTargets: (targets: Omit<Target, "id">[]) => void
  updateTarget: (id: string, updates: Partial<Target>) => void
  deleteTarget: (id: string) => void
  clearTargets: () => void

  addLog: (log: Omit<AutomationLog, "id" | "timestamp">) => void
  clearLogs: () => void

  setRunning: (running: boolean) => void
  setCurrentCampaign: (id: string | null) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      campaigns: [],
      templates: [
        {
          id: "1",
          name: "Intro Bisnis",
          content:
            "Halo {name}! 👋\n\nSaya melihat profil Anda dan sangat tertarik dengan bisnis Anda. Saya ingin berbagi bagaimana kami bisa membantu meningkatkan penjualan Anda hingga 3x lipat.\n\nApakah Anda tertarik untuk diskusi lebih lanjut?",
          variables: ["name"],
          createdAt: new Date(),
        },
        {
          id: "2",
          name: "Follow Up",
          content:
            "Hai {name}! 😊\n\nSaya harap kabar Anda baik. Saya ingin follow up mengenai pesan sebelumnya.\n\nKami sedang ada promo spesial bulan ini. Apakah ada waktu untuk chat sebentar?",
          variables: ["name"],
          createdAt: new Date(),
        },
      ],
      targets: [],
      logs: [],
      isRunning: false,
      currentCampaignId: null,

      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [
            ...state.campaigns,
            {
              ...campaign,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              totalSent: 0,
              totalReplied: 0,
            },
          ],
        })),

      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),

      addTemplate: (template) =>
        set((state) => ({
          templates: [
            ...state.templates,
            {
              ...template,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
          ],
        })),

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      addTarget: (target) =>
        set((state) => ({
          targets: [...state.targets, { ...target, id: crypto.randomUUID() }],
        })),

      addTargets: (targets) =>
        set((state) => ({
          targets: [...state.targets, ...targets.map((t) => ({ ...t, id: crypto.randomUUID() }))],
        })),

      updateTarget: (id, updates) =>
        set((state) => ({
          targets: state.targets.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTarget: (id) =>
        set((state) => ({
          targets: state.targets.filter((t) => t.id !== id),
        })),

      clearTargets: () => set({ targets: [] }),

      addLog: (log) =>
        set((state) => ({
          logs: [{ ...log, id: crypto.randomUUID(), timestamp: new Date() }, ...state.logs].slice(0, 500),
        })),

      clearLogs: () => set({ logs: [] }),

      setRunning: (running) => set({ isRunning: running }),

      setCurrentCampaign: (id) => set({ currentCampaignId: id }),
    }),
    {
      name: "instabot-storage",
    },
  ),
)
