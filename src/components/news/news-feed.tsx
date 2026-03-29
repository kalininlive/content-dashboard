"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Newspaper,
  Rss,
  ExternalLink,
  Search,
  Wrench,
  FlaskConical,
  Briefcase,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import { newsArticles, LAST_UPDATED, type NewsArticle } from "@/lib/news-mock-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "all" | "tools" | "research" | "business";

const CATEGORY_BADGE: Record<Exclude<Category, "all">, string> = {
  tools:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  research: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  business: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const CATEGORY_ICON: Record<Exclude<Category, "all">, React.ElementType> = {
  tools:    Wrench,
  research: FlaskConical,
  business: Briefcase,
};

// ─── Date formatter ───────────────────────────────────────────────────────────

function useFormatDate() {
  const { t } = useI18n();
  return (iso: string): string => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);

    if (diffH < 1) return t("news.dates.justNow");
    if (diffH < 24) return t("news.dates.hoursAgo", { n: diffH });
    if (diffD === 1) return t("news.dates.yesterday");
    if (diffD < 7) return t("news.dates.daysAgo", { n: diffD });
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };
}

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: NewsArticle }) {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const badge = CATEGORY_BADGE[article.category];
  const Icon  = CATEGORY_ICON[article.category];

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0 transition-colors hover:border-border/60">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              badge
            )}
          >
            <Icon className="h-3 w-3" />
            {t(`news.categories.${article.category}`)}
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-1.5 text-sm font-semibold leading-snug text-foreground hover:text-foreground/80"
        >
          <span className="line-clamp-2">{article.title}</span>
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Rss className="h-3 w-3 shrink-0" />
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-foreground hover:underline"
          >
            {article.source}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  const { t } = useI18n();
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Newspaper className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-sm font-medium">{t("news.empty.title")}</h3>
      <p className="text-xs text-muted-foreground">
        {query
          ? t("news.empty.withQuery", { query })
          : t("news.empty.noCategory")}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NewsFeed() {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Category>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return newsArticles
      .filter((a) => (tab === "all" ? true : a.category === tab))
      .filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [query, tab]);

  const counts: Record<Category, number> = useMemo(
    () => ({
      all:      newsArticles.length,
      tools:    newsArticles.filter((a) => a.category === "tools").length,
      research: newsArticles.filter((a) => a.category === "research").length,
      business: newsArticles.filter((a) => a.category === "business").length,
    }),
    []
  );

  const CATEGORIES: Category[] = ["all", "tools", "research", "business"];

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Newspaper className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("news.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          {t("news.updatedAt", { time: formatDate(LAST_UPDATED) })}
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const isAll = cat === "all";
          const Icon  = isAll ? LayoutGrid : CATEGORY_ICON[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setTab(cat)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
                tab === cat
                  ? "border-border bg-card"
                  : "border-transparent bg-card/50 hover:bg-card"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {isAll ? t("news.allSources") : t(`news.categories.${cat}`)}
                </p>
                <p className="text-sm font-semibold">{counts[cat]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("news.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ── Tabs + Grid ─────────────────────────────────────────────────── */}
      <Tabs
        defaultValue="all"
        value={tab}
        onValueChange={(v) => setTab(v as Category)}
      >
        <TabsList className="mb-5">
          <TabsTrigger value="all" className="gap-1.5 text-xs">
            <LayoutGrid className="h-3.5 w-3.5" />
            {t("news.categories.all")}
            <span className="ml-0.5 text-muted-foreground">({counts.all})</span>
          </TabsTrigger>
          {(["tools", "research", "business"] as Exclude<Category, "all">[]).map((cat) => {
            const Icon = CATEGORY_ICON[cat];
            return (
              <TabsTrigger key={cat} value={cat} className="gap-1.5 text-xs capitalize">
                <Icon className="h-3.5 w-3.5" />
                {t(`news.categories.${cat}`)}
                <span className="ml-0.5 text-muted-foreground">({counts[cat]})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.length > 0 ? (
                filtered.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <EmptyState query={query} />
              )}
            </div>
            {filtered.length > 0 && (
              <p className="mt-6 text-center text-xs text-muted-foreground">
                {t("news.showing", {
                  count: filtered.length,
                  total: counts[cat],
                })}
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
