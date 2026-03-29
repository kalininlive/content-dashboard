"use client";

import { useState } from "react";
import {
  Camera,
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
import { useI18n } from "@/lib/i18n";

// ─── Static tab config (icons only — labels come from t()) ───────────────────

const TABS: { value: PostStatus; icon: React.ElementType }[] = [
  { value: "idea",      icon: Lightbulb     },
  { value: "draft",     icon: FileText      },
  { value: "scheduled", icon: CalendarClock },
  { value: "published", icon: CheckCircle2  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function InstagramManager() {
  const { t } = useI18n();
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

  const stats: { labelKey: string; value: number; icon: React.ElementType }[] = [
    { labelKey: "instagram.stats.ideas",     value: byStatus("idea").length,      icon: Lightbulb     },
    { labelKey: "instagram.stats.drafts",    value: byStatus("draft").length,     icon: FileText      },
    { labelKey: "instagram.stats.scheduled", value: byStatus("scheduled").length, icon: CalendarClock },
    { labelKey: "instagram.stats.published", value: byStatus("published").length, icon: CheckCircle2  },
  ];

  return (
    <div className="p-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("instagram.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("instagram.subtitle")}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("instagram.newPost")}
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ labelKey, value, icon: Icon }) => (
          <Card key={labelKey}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {t(labelKey)}
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
          {TABS.map(({ value, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
              <Icon className="h-3.5 w-3.5" />
              {t(`instagram.tabs.${value}`)}
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
  const { t } = useI18n();
  return (
    <Card className="border-dashed border-border/40">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Camera className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-medium">{t(`instagram.empty.${status}.title`)}</h3>
        <p className="mb-5 max-w-xs text-xs text-muted-foreground">{t(`instagram.empty.${status}.desc`)}</p>
        {status === "idea" && (
          <Button size="sm" variant="outline" className="gap-2" onClick={onNew}>
            <Plus className="h-4 w-4" />
            {t("instagram.addIdea")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
