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
          <DialogTitle className="text-base">New Post Idea</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What's the post about? Describe the content, tone, and key message."
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
              <Label className="text-xs text-muted-foreground">Post Type</Label>
              <Select
                value={form.postType}
                onValueChange={(v) => set("postType", v as PostType)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as PostStatus)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Publish date — only when scheduled */}
          {isScheduled && (
            <div className="space-y-1.5">
              <Label htmlFor="publishDate" className="text-xs text-muted-foreground">
                Publish Date
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
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              Create Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
