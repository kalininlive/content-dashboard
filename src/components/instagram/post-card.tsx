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
import { MoreHorizontal, Calendar, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ─── Colour maps (no labels — labels come from t()) ──────────────────────────

const STATUS_CLASS: Record<PostStatus, string> = {
  idea:      "bg-zinc-800 text-zinc-400 border border-zinc-700",
  draft:     "bg-amber-950/60 text-amber-400 border border-amber-900/60",
  scheduled: "bg-blue-950/60 text-blue-400 border border-blue-900/60",
  published: "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60",
};

const TYPE_CLASS: Record<PostType, string> = {
  image:    "bg-purple-950/60 text-purple-400 border border-purple-900/60",
  carousel: "bg-cyan-950/60 text-cyan-400 border border-cyan-900/60",
  reel:     "bg-pink-950/60 text-pink-400 border border-pink-900/60",
  story:    "bg-orange-950/60 text-orange-400 border border-orange-900/60",
};

const NEXT_STATUS: Record<PostStatus, PostStatus | null> = {
  idea:      "draft",
  draft:     "scheduled",
  scheduled: "published",
  published: null,
};

const NEXT_ACTION_KEY: Record<PostStatus, string | null> = {
  idea:      "instagram.actions.moveToDraft",
  draft:     "instagram.actions.schedule",
  scheduled: "instagram.actions.markPublished",
  published: null,
};

// ─── Component ──────────────────────────────────────────────────────────────

interface PostCardProps {
  post: InstagramPost;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PostStatus) => void;
}

export function PostCard({ post, onDelete, onStatusChange }: PostCardProps) {
  const { t } = useI18n();
  const next        = NEXT_STATUS[post.status];
  const nextActionKey = NEXT_ACTION_KEY[post.status];

  return (
    <Card className="group relative flex flex-col border-border/40 bg-card transition-all hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardContent className="flex flex-1 flex-col p-4">
        {/* Top row: type badge + status badge + menu */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
              TYPE_CLASS[post.postType]
            )}
          >
            {t(`instagram.postTypes.${post.postType}`)}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                STATUS_CLASS[post.status]
              )}
            >
              {t(`instagram.statuses.${post.status}`)}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {next && nextActionKey && (
                  <>
                    <DropdownMenuItem
                      className="gap-2 text-xs"
                      onClick={() => onStatusChange(post.id, next)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      {t(nextActionKey)}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="gap-2 text-xs text-destructive focus:text-destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("common.delete")}
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
            : t("common.noDateSet")}
        </div>
      </CardContent>
    </Card>
  );
}
