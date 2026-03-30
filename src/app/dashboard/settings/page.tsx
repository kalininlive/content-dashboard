"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Shield,
  Camera,
  Cpu,
  Bot,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Zap,
} from "lucide-react"

type Tab = "account" | "instagram" | "services" | "autopilot"

interface Settings {
  email: string
  hasOpenaiKey: boolean
  hasApifyKey: boolean
  hasImageGenKey: boolean
  igUsername: string | null
  autopilotConfig?: {
    enabled: boolean
    frequency: string
    topicContext: string
    style: string
    requireApproval: boolean
  } | null
}

interface IgAccount {
  igUsername: string
  profilePicUrl: string | null
  tokenExpiry: string | null
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">Загрузка...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) ?? "account"
  )
  const [settings, setSettings] = useState<Settings | null>(null)
  const [igAccount, setIgAccount] = useState<IgAccount | null>(null)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Load settings
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(console.error)
  }, [])

  // Check connection status from URL params
  useEffect(() => {
    const connected = searchParams.get("connected")
    const error = searchParams.get("error")
    if (connected === "true") setMsg({ type: "success", text: "Instagram успешно подключён!" })
    if (error) setMsg({ type: "error", text: `Ошибка подключения: ${error}` })
  }, [searchParams])

  async function save(body: Record<string, unknown>) {
    setMsg(null)
    startTransition(async () => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setMsg({ type: "success", text: "Сохранено" })
        const updated = await fetch("/api/settings").then((r) => r.json())
        setSettings(updated)
      } else {
        const text = await res.text()
        setMsg({ type: "error", text })
      }
    })
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "account", label: "Аккаунт", icon: Shield },
    { id: "instagram", label: "Instagram", icon: Camera },
    { id: "services", label: "Сервисы", icon: Cpu },
    { id: "autopilot", label: "Автопилот", icon: Bot },
  ]

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Настройки</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/30 p-1 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Status message */}
      {msg && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm mb-6 ${
            msg.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {msg.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      {/* Tab content */}
      {activeTab === "account" && (
        <AccountTab settings={settings} onSave={save} isPending={isPending} />
      )}
      {activeTab === "instagram" && (
        <InstagramTab igAccount={igAccount} settings={settings} onSync={() => {
          startTransition(async () => {
            const res = await fetch("/api/instagram/sync", { method: "POST" })
            const data = await res.json()
            if (data.ok) setMsg({ type: "success", text: `Синхронизировано. Подписчиков: ${data.followers}` })
            else setMsg({ type: "error", text: data.error })
          })
        }} isPending={isPending} />
      )}
      {activeTab === "services" && (
        <ServicesTab settings={settings} onSave={save} isPending={isPending} />
      )}
      {activeTab === "autopilot" && (
        <AutopilotTab settings={settings} onSave={save} isPending={isPending} />
      )}
    </div>
  )
}

// ─── Account Tab ──────────────────────────────────────────────────────────────

function AccountTab({
  settings,
  onSave,
  isPending,
}: {
  settings: Settings | null
  onSave: (b: Record<string, unknown>) => void
  isPending: boolean
}) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail) return
    onSave({ email: newEmail, currentPassword })
    setCurrentPassword("")
    setNewEmail("")
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return
    onSave({ newPassword, currentPassword })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="space-y-6">
      <Card title="Текущий email">
        <p className="text-sm text-muted-foreground">{settings?.email ?? "—"}</p>
      </Card>

      <Card title="Изменить email">
        <form onSubmit={handleEmailChange} className="space-y-3">
          <Field label="Новый email" type="email" value={newEmail} onChange={setNewEmail} />
          <Field label="Текущий пароль" type="password" value={currentPassword} onChange={setCurrentPassword} />
          <SaveButton isPending={isPending} label="Изменить email" />
        </form>
      </Card>

      <Card title="Изменить пароль">
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <Field label="Текущий пароль" type="password" value={currentPassword} onChange={setCurrentPassword} />
          <Field label="Новый пароль (мин. 8 символов)" type="password" value={newPassword} onChange={setNewPassword} />
          <Field label="Подтвердите пароль" type="password" value={confirmPassword} onChange={setConfirmPassword} />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">Пароли не совпадают</p>
          )}
          <SaveButton isPending={isPending} label="Изменить пароль" />
        </form>
      </Card>
    </div>
  )
}

// ─── Instagram Tab ────────────────────────────────────────────────────────────

function InstagramTab({
  igAccount,
  settings,
  onSync,
  isPending,
}: {
  igAccount: IgAccount | null
  settings: Settings | null
  onSync: () => void
  isPending: boolean
}) {
  return (
    <div className="space-y-6">
      <Card title="Подключённый аккаунт">
        {igAccount ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">@{igAccount.igUsername}</p>
                <p className="text-xs text-muted-foreground">
                  Токен истекает: {igAccount.tokenExpiry ? new Date(igAccount.tokenExpiry).toLocaleDateString("ru") : "—"}
                </p>
              </div>
            </div>
            <button
              onClick={onSync}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              Синхронизировать
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-muted-foreground">Instagram не подключён</p>
            <p className="text-xs text-muted-foreground/60">
              Для публикации нужен Instagram Business или Creator аккаунт
            </p>
          </div>
        )}
      </Card>

      <Card title="Подключить Instagram">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Нажми кнопку ниже — ты будешь перенаправлен на авторизацию через Meta.
            Убедись, что META_APP_ID и META_REDIRECT_URI настроены в .env.local.
          </p>
          <a
            href="/api/auth/instagram/connect"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Camera className="h-4 w-4" />
            Подключить через Meta
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      </Card>

      <Card title="Аккаунт для аналитики (Apify)">
        <SettingsForm
          fields={[{ label: "Instagram username (без @)", key: "igUsername", type: "text", value: settings?.igUsername ?? "" }]}
          onSave={(v) => {
            /* handled by parent onSave via services tab sync */
          }}
          isPending={isPending}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Используется для сбора статистики через Apify (подписчики, посты, ER).
        </p>
      </Card>
    </div>
  )
}

// ─── Services Tab ─────────────────────────────────────────────────────────────

function ServicesTab({
  settings,
  onSave,
  isPending,
}: {
  settings: Settings | null
  onSave: (b: Record<string, unknown>) => void
  isPending: boolean
}) {
  return (
    <div className="space-y-6">
      <ServiceKeyCard
        title="OpenAI"
        description="GPT-4o-mini — генерация подписей, хэштегов, анализ конкурентов, суммаризация новостей."
        docUrl="https://platform.openai.com/api-keys"
        hasKey={settings?.hasOpenaiKey ?? false}
        onSave={(key) => onSave({ openaiKey: key })}
        isPending={isPending}
      />
      <ServiceKeyCard
        title="Apify"
        description="Сбор статистики Instagram-профилей (подписчики, посты, ER) без Meta Developer App."
        docUrl="https://console.apify.com/account/integrations"
        hasKey={settings?.hasApifyKey ?? false}
        onSave={(key) => onSave({ apifyKey: key })}
        isPending={isPending}
      />
      <ServiceKeyCard
        title="kie.ai (Nano Banana 2)"
        description="Генерация изображений для постов. Основан на Google Gemini 3.1 Flash Image."
        docUrl="https://kie.ai/api-key"
        hasKey={settings?.hasImageGenKey ?? false}
        onSave={(key) => onSave({ imageGenKey: key })}
        isPending={isPending}
      />
    </div>
  )
}

// ─── Autopilot Tab ────────────────────────────────────────────────────────────

function AutopilotTab({
  settings,
  onSave,
  isPending,
}: {
  settings: Settings | null
  onSave: (b: Record<string, unknown>) => void
  isPending: boolean
}) {
  const cfg = settings?.autopilotConfig
  const [enabled, setEnabled] = useState(cfg?.enabled ?? false)
  const [frequency, setFrequency] = useState(cfg?.frequency ?? "daily")
  const [topicContext, setTopicContext] = useState(cfg?.topicContext ?? "")
  const [style, setStyle] = useState(cfg?.style ?? "informational")
  const [requireApproval, setRequireApproval] = useState(cfg?.requireApproval ?? true)
  const [runPending, setRunPending] = useState(false)

  useEffect(() => {
    if (cfg) {
      setEnabled(cfg.enabled)
      setFrequency(cfg.frequency)
      setTopicContext(cfg.topicContext)
      setStyle(cfg.style)
      setRequireApproval(cfg.requireApproval)
    }
  }, [cfg])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      autopilotConfig: { enabled, frequency, topicContext, style, requireApproval },
    })
  }

  async function runNow() {
    setRunPending(true)
    try {
      const res = await fetch("/api/auto-pilot/run", { method: "POST" })
      const data = await res.json()
      if (data.ok) {
        alert(`Пост создан! ID: ${data.postId}. Тема: ${data.topic}`)
      } else {
        alert(`Ошибка: ${data.error}`)
      }
    } finally {
      setRunPending(false)
    }
  }

  return (
    <Card title="Настройки автопилота">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Enabled toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Автопилот</p>
            <p className="text-xs text-muted-foreground">Автоматически создаёт и публикует посты</p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : ""}`}
            />
          </button>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Частота публикаций</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="daily">Ежедневно</option>
            <option value="3x_week">3 раза в неделю</option>
            <option value="weekly">Еженедельно</option>
          </select>
        </div>

        {/* Topic context */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Контекст аккаунта / тематика</label>
          <textarea
            value={topicContext}
            onChange={(e) => setTopicContext(e.target.value)}
            placeholder="Например: бьюти-блог, советы по уходу за кожей, лайфстайл Москва"
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Style */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Стиль контента</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="informational">Информационный</option>
            <option value="entertaining">Развлекательный</option>
            <option value="sales">Продажный</option>
          </select>
        </div>

        {/* Require approval */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Требовать одобрения</p>
            <p className="text-xs text-muted-foreground">Пост попадёт в «Идеи» вместо автопубликации</p>
          </div>
          <button
            type="button"
            onClick={() => setRequireApproval(!requireApproval)}
            className={`relative h-6 w-11 rounded-full transition-colors ${requireApproval ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${requireApproval ? "translate-x-5" : ""}`}
            />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <SaveButton isPending={isPending} label="Сохранить" />
          <button
            type="button"
            onClick={runNow}
            disabled={runPending}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-colors disabled:opacity-50"
          >
            <Zap className={`h-4 w-4 ${runPending ? "animate-pulse" : ""}`} />
            {runPending ? "Запускаю..." : "Запустить сейчас"}
          </button>
        </div>
      </form>
    </Card>
  )
}

// ─── Reusable components ──────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "oklch(0.14 0.020 265)", border: "1px solid oklch(1 0 0 / 8%)" }}
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
    </div>
  )
}

function SaveButton({ isPending, label }: { isPending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      {label}
    </button>
  )
}

function ServiceKeyCard({
  title,
  description,
  docUrl,
  hasKey,
  onSave,
  isPending,
}: {
  title: string
  description: string
  docUrl: string
  hasKey: boolean
  onSave: (key: string) => void
  isPending: boolean
}) {
  const [key, setKey] = useState("")
  const [show, setShow] = useState(false)

  return (
    <Card title={title}>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${
            hasKey ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${hasKey ? "bg-success" : "bg-muted-foreground"}`} />
          {hasKey ? "Ключ сохранён" : "Не настроен"}
        </div>
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Получить ключ <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasKey ? "Введите новый ключ для замены" : "Вставьте API ключ"}
            className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="button"
          disabled={!key || isPending}
          onClick={() => { onSave(key); setKey("") }}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "..." : "Сохранить"}
        </button>
      </div>
    </Card>
  )
}

function SettingsForm({
  fields,
  onSave,
  isPending,
}: {
  fields: { label: string; key: string; type: string; value: string }[]
  onSave: (values: Record<string, string>) => void
  isPending: boolean
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value]))
  )

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(values) }}
      className="space-y-3"
    >
      {fields.map((f) => (
        <Field
          key={f.key}
          label={f.label}
          type={f.type}
          value={values[f.key]}
          onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
        />
      ))}
      <SaveButton isPending={isPending} label="Сохранить" />
    </form>
  )
}
