"use client"

import { useState, useCallback, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Image as ImageIcon,
  Video,
  Film,
  BookOpen,
  Upload,
  Sparkles,
  Hash,
  X,
  Clock,
  Send,
  Save,
  Music,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react"

type PostType = "image" | "carousel" | "reel" | "story"
type PostStatus = "idea" | "draft" | "scheduled"

const POST_TYPES: { id: PostType; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "image", label: "Фото", icon: ImageIcon, desc: "Одно изображение" },
  { id: "carousel", label: "Карусель", icon: BookOpen, desc: "2–10 фото/видео" },
  { id: "reel", label: "Reels", icon: Film, desc: "Короткое видео" },
  { id: "story", label: "История", icon: Video, desc: "24 часа" },
]

interface MediaFile {
  file: File
  preview: string
  blobUrl?: string
}

export default function NewPostPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const [postType, setPostType] = useState<PostType>("image")
  const [media, setMedia] = useState<MediaFile[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState("")
  const [status, setStatus] = useState<PostStatus>("draft")
  const [publishDate, setPublishDate] = useState("")
  const [error, setError] = useState<string | null>(null)

  // AI states
  const [aiCaption, setAiCaption] = useState(false)
  const [aiHashtags, setAiHashtags] = useState(false)
  const [aiImage, setAiImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")

  const maxFiles = postType === "carousel" ? 10 : 1

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newMedia = files.slice(0, maxFiles - media.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setMedia((prev) => [...prev, ...newMedia].slice(0, maxFiles))
  }, [media.length, maxFiles])

  const removeMedia = (idx: number) => {
    setMedia((prev) => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#*/, "#")
    if (tag.length > 1 && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag])
    }
    setHashtagInput("")
  }

  // Upload all media files to Vercel Blob
  async function uploadMedia(): Promise<string[]> {
    const urls: string[] = []
    for (const m of media) {
      const formData = new FormData()
      formData.append("file", m.file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Ошибка загрузки файла")
      const { url } = await res.json()
      urls.push(url)
    }
    return urls
  }

  // AI: Generate caption
  async function handleAiCaption() {
    if (!caption && media.length === 0) {
      setError("Опишите тему поста или добавьте медиа")
      return
    }
    setAiCaption(true)
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: caption || "создай подпись для поста", style: "informational" }),
      })
      const data = await res.json()
      if (data.caption) setCaption(data.caption)
      else setError(data.error)
    } catch {
      setError("Ошибка генерации подписи")
    } finally {
      setAiCaption(false)
    }
  }

  // AI: Generate hashtags
  async function handleAiHashtags() {
    if (!caption) { setError("Сначала добавьте подпись"); return }
    setAiHashtags(true)
    try {
      const res = await fetch("/api/ai/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      })
      const data = await res.json()
      if (data.hashtags) setHashtags(data.hashtags)
      else setError(data.error)
    } catch {
      setError("Ошибка генерации хэштегов")
    } finally {
      setAiHashtags(false)
    }
  }

  // AI: Generate image
  async function handleAiImage() {
    if (!imagePrompt) { setError("Введите описание изображения"); return }
    setAiImage(true)
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio: postType === "story" ? "9:16" : "1:1" }),
      })
      const data = await res.json()
      if (data.url) {
        // Add to media as a blob URL
        const imgRes = await fetch(data.url)
        const blob = await imgRes.blob()
        const file = new File([blob], `ai-${Date.now()}.jpg`, { type: "image/jpeg" })
        setMedia((prev) => [
          ...prev,
          { file, preview: URL.createObjectURL(blob), blobUrl: data.url },
        ].slice(0, maxFiles))
        setImagePrompt("")
      } else {
        setError(data.error)
      }
    } catch {
      setError("Ошибка генерации изображения")
    } finally {
      setAiImage(false)
    }
  }

  // Save / Publish
  async function handleSave(targetStatus: PostStatus | "published") {
    setError(null)
    startTransition(async () => {
      try {
        // Upload media
        let mediaUrls: string[] = []
        if (media.length > 0) {
          mediaUrls = await Promise.all(
            media.map(async (m) => {
              if (m.blobUrl) return m.blobUrl // already uploaded (AI-generated)
              const formData = new FormData()
              formData.append("file", m.file)
              const res = await fetch("/api/upload", { method: "POST", body: formData })
              if (!res.ok) throw new Error("Ошибка загрузки файла")
              const { url } = await res.json()
              return url as string
            })
          )
        }

        // Upload audio if present
        let musicUrl: string | undefined
        if (audioFile) {
          const formData = new FormData()
          formData.append("file", audioFile)
          const res = await fetch("/api/upload", { method: "POST", body: formData })
          if (res.ok) {
            const { url } = await res.json()
            musicUrl = url
          }
        }

        // Create post
        const postRes = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: targetStatus === "published" ? "scheduled" : targetStatus,
            postType,
            caption,
            hashtags,
            mediaUrls,
            musicUrl,
            publishDate: targetStatus === "published" ? new Date().toISOString() : publishDate || null,
          }),
        })
        const { post } = await postRes.json()

        // Publish immediately if requested
        if (targetStatus === "published") {
          const pubRes = await fetch("/api/instagram/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId: post.id }),
          })
          const pubData = await pubRes.json()
          if (!pubData.ok) setError(`Ошибка публикации: ${pubData.error}`)
        }

        router.push("/dashboard/instagram")
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </button>
        <h1 className="text-xl font-semibold">Новый пост</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 mb-6">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Post type selector */}
          <div className="grid grid-cols-4 gap-2">
            {POST_TYPES.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => { setPostType(t.id); setMedia([]) }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-all border ${
                    postType === t.id
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {t.label}
                  <span className="text-[10px] opacity-60">{t.desc}</span>
                </button>
              )
            })}
          </div>

          {/* Media upload */}
          <div
            className="rounded-2xl border-2 border-dashed p-5 space-y-4 transition-colors"
            style={{ borderColor: "oklch(1 0 0 / 12%)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Медиафайлы</p>
              <span className="text-xs text-muted-foreground">{media.length}/{maxFiles}</span>
            </div>

            {/* Preview grid */}
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {media.map((m, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    {m.file.type.startsWith("video") ? (
                      <video src={m.preview} className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.preview} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                    {i === 0 && media.length > 1 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                        Обложка
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload buttons */}
            <div className="flex gap-2 flex-wrap">
              {media.length < maxFiles && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border"
                  >
                    <Upload className="h-4 w-4" />
                    Загрузить
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={postType === "reel" ? "video/*" : "image/*,video/*"}
                    multiple={postType === "carousel"}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              )}

              {/* AI generate image */}
              {(postType === "image" || postType === "carousel") && media.length < maxFiles && (
                <div className="flex gap-1.5 flex-1">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Опишите изображение для ИИ..."
                    className="flex-1 rounded-xl px-3 py-2 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                    onKeyDown={(e) => e.key === "Enter" && handleAiImage()}
                  />
                  <button
                    onClick={handleAiImage}
                    disabled={aiImage || !imagePrompt}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {aiImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {aiImage ? "" : "ИИ"}
                  </button>
                </div>
              )}
            </div>

            {/* Audio for Reels */}
            {postType === "reel" && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground flex-1">
                  {audioFile ? audioFile.name : "Своя музыка (опционально)"}
                </span>
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="text-xs text-primary hover:underline"
                >
                  {audioFile ? "Заменить" : "Загрузить"}
                </button>
                {audioFile && (
                  <button onClick={() => setAudioFile(null)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>
            )}

            {postType === "reel" && (
              <p className="text-[11px] text-muted-foreground/60">
                ⚠️ Библиотека музыки Instagram недоступна через API. Загрузите видео с уже добавленным аудио, или прикрепите свой трек выше.
              </p>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Подпись</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{caption.length}/2200</span>
                <button
                  onClick={handleAiCaption}
                  disabled={aiCaption}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {aiCaption ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  ИИ
                </button>
              </div>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Напишите подпись или используйте ИИ-генерацию..."
              maxLength={2200}
              rows={5}
              className="w-full rounded-xl px-3 py-3 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Хэштеги ({hashtags.length})</label>
              <button
                onClick={handleAiHashtags}
                disabled={aiHashtags || !caption}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {aiHashtags ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Hash className="h-3.5 w-3.5" />}
                ИИ хэштеги
              </button>
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs bg-primary/10 text-primary"
                  >
                    {tag}
                    <button onClick={() => setHashtags((h) => h.filter((t) => t !== tag))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                placeholder="#хэштег"
                className="flex-1 rounded-xl px-3 py-2 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={addHashtag}
                className="rounded-xl px-3 py-2 text-sm bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Schedule & Actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Preview card */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "oklch(0.14 0.020 265)", border: "1px solid oklch(1 0 0 / 8%)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Предпросмотр</p>
            <div className="aspect-square rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center">
              {media[0] ? (
                media[0].file.type.startsWith("video") ? (
                  <video src={media[0].preview} className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media[0].preview} alt="" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                  <ImageIcon className="h-10 w-10" />
                  <span className="text-xs">Добавьте медиа</span>
                </div>
              )}
            </div>
            {caption && (
              <p className="text-xs text-muted-foreground line-clamp-3">{caption}</p>
            )}
            {hashtags.length > 0 && (
              <p className="text-xs text-primary/70 line-clamp-2">{hashtags.slice(0, 5).join(" ")}</p>
            )}
          </div>

          {/* Schedule */}
          <div
            className="rounded-2xl p-4 space-y-4"
            style={{ background: "oklch(0.14 0.020 265)", border: "1px solid oklch(1 0 0 / 8%)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Публикация</p>

            <div className="space-y-2">
              {(["idea", "draft", "scheduled"] as PostStatus[]).map((s) => (
                <label key={s} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-primary"
                  />
                  <span className="text-sm">
                    {s === "idea" && "Идея"}
                    {s === "draft" && "Черновик"}
                    {s === "scheduled" && "Запланировать"}
                  </span>
                </label>
              ))}
            </div>

            {status === "scheduled" && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Дата и время публикации
                </label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl px-3 py-2 text-sm bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleSave("published")}
              disabled={isPending || media.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ boxShadow: "0 0 20px oklch(0.65 0.26 285 / 0.3)" }}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Опубликовать сейчас
            </button>

            <button
              onClick={() => handleSave(status)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border border-border text-foreground hover:bg-muted/20 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {status === "scheduled" ? "Запланировать" : "Сохранить"}
            </button>
          </div>

          {media.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Добавьте медиафайл для публикации
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
