"use client";

import { InstagramPost, PostStatus, PostType } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Label & colour maps ────────────────────────────────────────────────────

const STATUS_META: Record<PostStatus, { label: string; className: string }> = {
  idea:      { label: "Idea",      className: "bg-zinc-800 text-zinc-400 border border-zinc-700" },
  draft:     { label: "Draft",     className: "bg-amber-950/60 text-amber-400 border border-amber-900/60" },
  scheduled: { label: "Scheduled", className: "bg-blue-950/60 text-blue-400 border border-blue-900/60" },
  published: { label: "Published", className: "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60" },
};

const TYPE_META: Record<PostType, { label: string; className: string }> = {
  image:    { label: "Image",    className: "bg-purple-950/60 text-purple-400 border border-purple-900/60" },
  carousel: { label: "Carousel", className: "bg-cyan-950/60 text-cyan-400 border border-cyan-900/60" },
  reel:     { label: "Reel",     className: "bg-pink-950/60 text-pink-400 border border-pink-900/60" },
  story:    { label: "Story",    className: "bg-orange-950/60 text-orange-400 border border-orange-900/60" },
};

const NEXT_STATUS: Record<PostStatus, PostStatus | null> = {
  idea:      "draft",
  draft:     "scheduled",
  scheduled: "published",
  published: null,
};

const NEXT_LABEL: Record<PostStatus, string | null> = {
  idea:      "Move to Draft",
  draft:     "Schedule",
  scheduled: "Mark Published",
  published: null,
};

// ─── Component ──────────────────────────────────────────────────────────────

interface PostCardProps {
  post: InstagramPost;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PostStatus) => void;
}

export function PostCard({ post, onDelete, onStatusChange }: PostCardProps) {
  const statusMeta = STATUS_META[post.status];
  const typeMeta   = TYPE_META[post.postType];
  const next       = NEXT_STATUS[post.status];
  const nextLabel  = NEXT_LABEL[post.status];

  return (
    <Card className="group relative flex flex-col border-border/40 bg-card transition-all hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardContent className="flex flex-1 flex-col p-4">
        {/* Top row: type badge + status badge + menu */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
              typeMeta.className
            )}
          >
            {typeMeta.label}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                statusMeta.className
              )}
            >
              {statusMeta.label}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {next && nextLabel && (
                  <>
                    <DropdownMenuItem
                      className="gap-2 text-xs"
                      onClick={() => onStatusChange(post.id, next)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      {nextLabel}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="gap-2 text-xs text-destructive focus:text-destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/85 line-clamp-3">
          {post.description}
        </p>

        {/* Footer: date */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
          <Calendar className="h-3 w-3 shrink-0" />
          {post.publishDate
            ? new Date(post.publishDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "No date set"}
        </div>
      </CardContent>
    </Card>
  );
}
