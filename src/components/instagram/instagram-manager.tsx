"use client";

import { useState } from "react";
import {
  Instagram,
  Plus,
  Lightbulb,
  FileText,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePostDialog } from "./create-post-dialog";
import { PostCard } from "./post-card";
import { InstagramPost, PostStatus } from "@/types/index";
import { mockPosts } from "@/lib/mock-data";

// ─── Helpers ────────────────────────────────────────────────────────────────

const TABS: { value: PostStatus; label: string; icon: React.ElementType }[] = [
  { value: "idea",      label: "Backlog",   icon: Lightbulb     },
  { value: "draft",     label: "Drafts",    icon: FileText      },
  { value: "scheduled", label: "Scheduled", icon: CalendarClock },
  { value: "published", label: "Published", icon: CheckCircle2  },
];

const EMPTY_COPY: Record<PostStatus, { title: string; desc: string }> = {
  idea:      { title: "No ideas yet",         desc: "Capture post ideas before they slip away."               },
  draft:     { title: "No drafts",            desc: "Move backlog ideas here when you start working on them." },
  scheduled: { title: "Nothing scheduled",    desc: "Schedule drafts with a publish date and time."           },
  published: { title: "Nothing published yet", desc: "Published posts will appear here."                       },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function InstagramManager() {
  const [posts, setPosts] = useState<InstagramPost[]>(mockPosts);
  const [dialogOpen, setDialogOpen] = useState(false);

  const byStatus = (s: PostStatus) => posts.filter((p) => p.status === s);

  function handleCreate(payload: Omit<InstagramPost, "id" | "createdAt">) {
    const post: InstagramPost = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [post, ...prev]);
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleStatusChange(id: string, status: PostStatus) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  const stats = [
    { label: "Ideas",     value: byStatus("idea").length,      icon: Lightbulb     },
    { label: "Drafts",    value: byStatus("draft").length,     icon: FileText      },
    { label: "Scheduled", value: byStatus("scheduled").length, icon: CalendarClock },
    { label: "Published", value: byStatus("published").length, icon: CheckCircle2  },
  ];

  return (
    <div className="p-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Instagram className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Instagram Manager</h1>
            <p className="text-sm text-muted-foreground">
              Plan, schedule, and track your content pipeline
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue="idea">
        <TabsList className="mb-6 h-9">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
              <Icon className="h-3.5 w-3.5" />
              {label}
              <span className="ml-0.5 tabular-nums text-muted-foreground">
                ({byStatus(value).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value }) => {
          const filtered = byStatus(value);
          return (
            <TabsContent key={value} value={value} className="mt-0">
              {filtered.length === 0 ? (
                <EmptyTabState
                  status={value}
                  onNew={() => setDialogOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* ── Dialog ─────────────────────────────────────────────────────── */}
      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyTabState({
  status,
  onNew,
}: {
  status: PostStatus;
  onNew: () => void;
}) {
  const { title, desc } = EMPTY_COPY[status];
  return (
    <Card className="border-dashed border-border/40">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Instagram className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-medium">{title}</h3>
        <p className="mb-5 max-w-xs text-xs text-muted-foreground">{desc}</p>
        {status === "idea" && (
          <Button size="sm" variant="outline" className="gap-2" onClick={onNew}>
            <Plus className="h-4 w-4" />
            Add Idea
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
