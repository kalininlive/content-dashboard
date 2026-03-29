"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstagramPost, PostStatus, PostType } from "@/types/index";
import { useI18n } from "@/lib/i18n";

// ─── Types ──────────────────────────────────────────────────────────────────

type FormState = {
  description: string;
  postType: PostType;
  status: PostStatus;
  publishDate: string;
};

const DEFAULT_FORM: FormState = {
  description: "",
  postType: "image",
  status: "idea",
  publishDate: "",
};

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (post: Omit<InstagramPost, "id" | "createdAt">) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePostDialogProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) return;

    onSubmit({
      description: form.description.trim(),
      postType: form.postType,
      status: form.status,
      publishDate: form.publishDate || null,
      tags: [],
    });

    setForm(DEFAULT_FORM);
    onOpenChange(false);
  }

  function handleCancel() {
    setForm(DEFAULT_FORM);
    onOpenChange(false);
  }

  const isScheduled = form.status === "scheduled";
  const canSubmit = form.description.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base">{t("createPost.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-muted-foreground">
              {t("createPost.descriptionLabel")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("createPost.descriptionPlaceholder")}
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="resize-none text-sm"
              required
            />
          </div>

          {/* Post Type + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("createPost.postTypeLabel")}</Label>
              <Select
                value={form.postType}
                onValueChange={(v) => set("postType", v as PostType)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["image", "carousel", "reel", "story"] as PostType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`instagram.postTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("createPost.statusLabel")}</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as PostStatus)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["idea", "draft", "scheduled"] as PostStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`instagram.statuses.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Publish date — only when scheduled */}
          {isScheduled && (
            <div className="space-y-1.5">
              <Label htmlFor="publishDate" className="text-xs text-muted-foreground">
                {t("createPost.publishDateLabel")}
              </Label>
              <Input
                id="publishDate"
                type="datetime-local"
                value={form.publishDate}
                onChange={(e) => set("publishDate", e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {t("createPost.createButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
