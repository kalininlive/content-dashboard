"use client";

import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Camera,
  PlayCircle,
  Bird,
  Briefcase,
  Music2,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  Activity,
  CalendarDays,
  BarChart2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INITIAL_COMPETITORS,
  daysAgo,
  fmtN,
  generateCompetitor,
} from "@/lib/competitors-mock-data";
import { PLATFORM_META, ALL_PLATFORMS } from "@/lib/calendar-mock-data";
import { AddCompetitorDialog } from "./add-competitor-dialog";
import { Competitor, Platform } from "@/types/index";
import { useI18n } from "@/lib/i18n";

// ─── Platform icon map ────────────────────────────────────────────────────────

const PLATFORM_ICON: Record<Platform, React.ElementType> = {
  instagram: Camera,
  youtube:   PlayCircle,
  tiktok:    Music2,
  twitter:   Bird,
  linkedin:  Briefcase,
};

// ─── Tiny SVG sparkline ───────────────────────────────────────────────────────

function SparkLine({ data, gain }: { data: number[]; gain: number }) {
  if (data.length < 2) return null;

  const W = 64, H = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - 2 - ((v - min) / range) * (H - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = gain >= 0 ? "#34d399" : "#f87171";

  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────

type SortField = "followers" | "avgEngagementRate" | "postsPerWeek" | "lastPostDate" | "gainedLast30d" | "platform";
type SortDir   = "asc" | "desc";

function SortIcon({ field, active, dir }: { field: string; active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />;
  return dir === "asc"
    ? <ChevronUp   className="h-3 w-3 text-foreground" />
    : <ChevronDown className="h-3 w-3 text-foreground" />;
}

function sortCompetitors(list: Competitor[], field: SortField, dir: SortDir): Competitor[] {
  return [...list].sort((a, b) => {
    let av: number | string = 0, bv: number | string = 0;
    switch (field) {
      case "followers":         av = a.followers;         bv = b.followers;         break;
      case "avgEngagementRate": av = a.avgEngagementRate; bv = b.avgEngagementRate; break;
      case "postsPerWeek":      av = a.postsPerWeek;      bv = b.postsPerWeek;      break;
      case "gainedLast30d":     av = a.gainedLast30d;     bv = b.gainedLast30d;     break;
      case "lastPostDate":      av = a.lastPostDate;      bv = b.lastPostDate;      break;
      case "platform":          av = a.platform;          bv = b.platform;          break;
    }
    if (typeof av === "string") {
      return dir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    }
    return dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });
}

// ─── Column header ────────────────────────────────────────────────────────────

function ColHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  field: SortField | null;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  className?: string;
}) {
  if (!field) {
    return (
      <th className={cn("px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide", className)}>
        {label}
      </th>
    );
  }
  return (
    <th
      className={cn("px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide cursor-pointer select-none", className,
        sortField === field ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon field={field} active={sortField === field} dir={sortDir} />
      </div>
    </th>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

const growthChartConfig: ChartConfig = {
  followers: { label: "Followers", color: "var(--chart-3)" },
};

function CompetitorDetail({
  competitor,
  onClose,
}: {
  competitor: Competitor;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const meta        = PLATFORM_META[competitor.platform];
  const PlatIcon    = PLATFORM_ICON[competitor.platform];
  const isPositive  = competitor.gainedLast30d >= 0;
  const initials    = competitor.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const chartData = competitor.growth30d.map((v, i) => ({
    day: `Day ${i + 1}`,
    followers: v,
  }));

  const axisStyle = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };

  const detailMetrics = [
    { icon: Users,        labelKey: "competitors.detail.metrics.followers",    value: fmtN(competitor.followers) },
    { icon: Activity,     labelKey: "competitors.detail.metrics.engagement",   value: `${competitor.avgEngagementRate}%` },
    { icon: CalendarDays, labelKey: "competitors.detail.metrics.postsPerWeek", value: `${competitor.postsPerWeek}×` },
    { icon: FileText,     labelKey: "competitors.detail.metrics.totalPosts",   value: fmtN(competitor.totalPosts) },
    { icon: BarChart2,    labelKey: "competitors.detail.metrics.lastPost",     value: daysAgo(competitor.lastPostDate) },
  ];

  const postHeaders = [
    t("competitors.detail.postTable.content"),
    t("competitors.detail.postTable.type"),
    t("competitors.detail.postTable.date"),
    t("competitors.detail.postTable.likes"),
    t("competitors.detail.postTable.comments"),
    t("competitors.detail.postTable.engRate"),
  ];

  return (
    <Card className="mt-4 border-border/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shrink-0", competitor.avatarGradient)}>
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{competitor.name}</span>
              <span className="text-sm text-muted-foreground">{competitor.handle}</span>
              <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]", meta.chipBg, meta.chipBorder)}>
                <PlatIcon className="h-2.5 w-2.5" />
                {meta.label}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{fmtN(competitor.followers)} {t("competitors.detail.metrics.followers").toLowerCase()}</span>
              <span>·</span>
              <span className={cn("flex items-center gap-0.5", isPositive ? "text-emerald-400" : "text-rose-400")}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? "+" : ""}{fmtN(competitor.gainedLast30d)} {t("competitors.detail.last30Days")}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
        {/* Growth chart */}
        <div className="border-b border-border/20 p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
          <p className="mb-3 text-xs font-medium text-muted-foreground">{t("competitors.detail.followerGrowthChart")}</p>
          <ChartContainer config={growthChartConfig} className="h-40 w-full">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-followers)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-followers)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={false} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={fmtN} width={40} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmtN(v as number)} />} />
              <Area type="monotone" dataKey="followers" stroke="var(--color-followers)" strokeWidth={2} fill="url(#detailGrad)" dot={false} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Key metrics */}
        <div className="p-5">
          <p className="mb-3 text-xs font-medium text-muted-foreground">{t("competitors.detail.keyMetrics")}</p>
          <div className="space-y-3">
            {detailMetrics.map(({ icon: Icon, labelKey, value }) => (
              <div key={labelKey} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {t(labelKey)}
                </div>
                <span className="text-xs font-medium tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <div className="border-t border-border/20">
        <div className="px-5 py-3">
          <p className="text-xs font-medium text-muted-foreground">{t("competitors.detail.recentPosts")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="border-b border-border/20">
                {postHeaders.map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitor.recentPosts.map((post) => (
                <tr key={post.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                  <td className="max-w-[280px] px-4 py-2.5 text-xs text-foreground/80">
                    <span className="line-clamp-1">{post.content}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-[10px]", meta.chipBg, meta.chipBorder)}>
                      {post.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-muted-foreground">{post.date}</td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-foreground/70">{fmtN(post.likes)}</td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-foreground/70">{fmtN(post.comments)}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "text-xs font-medium tabular-nums",
                      post.engagementRate >= 5 ? "text-emerald-400" :
                      post.engagementRate >= 3 ? "text-amber-400" : "text-muted-foreground"
                    )}>
                      {post.engagementRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export function CompetitorsDashboard() {
  const { t } = useI18n();
  const [competitors, setCompetitors]   = useState<Competitor[]>(INITIAL_COMPETITORS);
  const [sortField, setSortField]       = useState<SortField>("followers");
  const [sortDir, setSortDir]           = useState<SortDir>("desc");
  const [platformFilter, setPlatform]   = useState<Platform | "all">("all");
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [dialogOpen, setDialogOpen]     = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const displayed = useMemo(() => {
    const filtered = platformFilter === "all"
      ? competitors
      : competitors.filter((c) => c.platform === platformFilter);
    return sortCompetitors(filtered, sortField, sortDir);
  }, [competitors, platformFilter, sortField, sortDir]);

  const selected = competitors.find((c) => c.id === selectedId) ?? null;

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }
  function handleRowClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }
  function handleDelete(id: string) {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }
  function handleAdd(name: string, handle: string, platform: Platform) {
    const comp = generateCompetitor(name, handle, platform);
    setCompetitors((prev) => [comp, ...prev]);
  }

  const avgEng = competitors.length
    ? parseFloat((competitors.reduce((s, c) => s + c.avgEngagementRate, 0) / competitors.length).toFixed(1))
    : 0;
  const mostActivePlatform = (() => {
    const counts: Partial<Record<Platform, number>> = {};
    competitors.forEach((c) => { counts[c.platform] = (counts[c.platform] ?? 0) + 1; });
    return (Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] ?? "—") as Platform | "—";
  })();

  const summaryStats = [
    { labelKey: "competitors.stats.tracked",       value: String(competitors.length),  icon: Users    },
    { labelKey: "competitors.stats.avgEngagement",  value: `${avgEng}%`,               icon: Activity },
    { labelKey: "competitors.stats.mostActive",
      value: mostActivePlatform === "—" ? "—" : PLATFORM_META[mostActivePlatform as Platform]?.label ?? "—",
      icon: BarChart2 },
    { labelKey: "competitors.stats.platforms",
      value: String(new Set(competitors.map((c) => c.platform)).size),
      icon: TrendingUp },
  ];

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("competitors.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("competitors.subtitle")}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("competitors.addCompetitor")}
        </Button>
      </div>

      {/* ── Summary stats ────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryStats.map(({ labelKey, value, icon: Icon }) => (
          <Card key={labelKey}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{t(labelKey)}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Platform filter ──────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlatform("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-all",
            platformFilter === "all"
              ? "border-border bg-muted text-foreground"
              : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          {t("competitors.allPlatforms")}
        </button>
        {ALL_PLATFORMS.map((p) => {
          const meta = PLATFORM_META[p];
          const Icon = PLATFORM_ICON[p];
          const count = competitors.filter((c) => c.platform === p).length;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(platformFilter === p ? "all" : p)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                platformFilter === p ? meta.filterActive : meta.filterInactive
              )}
            >
              <Icon className="h-3 w-3" />
              {meta.label}
              {count > 0 && <span className="tabular-nums opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border-border/30">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <ColHeader label={t("competitors.table.competitor")}  field={null}               sortField={sortField} sortDir={sortDir} onSort={handleSort} className="min-w-[200px]" />
                <ColHeader label={t("competitors.table.platform")}    field="platform"           sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label={t("competitors.table.followers")}   field="followers"          sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label={t("competitors.table.engagement")}  field="avgEngagementRate"  sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label={t("competitors.table.postsPerWeek")} field="postsPerWeek"      sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label={t("competitors.table.lastPost")}    field="lastPostDate"       sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label={t("competitors.table.trend30d")}    field={null}               sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label={t("competitors.table.growth30d")}   field="gainedLast30d"      sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label=""                                    field={null}               sortField={sortField} sortDir={sortDir} onSort={handleSort} className="w-12" />
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                    {t("competitors.table.noMatch")}
                  </td>
                </tr>
              ) : (
                displayed.map((comp) => {
                  const meta     = PLATFORM_META[comp.platform];
                  const PIcon    = PLATFORM_ICON[comp.platform];
                  const isPos    = comp.gainedLast30d >= 0;
                  const initials = comp.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  const isSelected = comp.id === selectedId;

                  return (
                    <tr
                      key={comp.id}
                      onClick={() => handleRowClick(comp.id)}
                      className={cn(
                        "group border-b border-border/10 cursor-pointer transition-colors",
                        isSelected ? "bg-muted/30" : "hover:bg-muted/15"
                      )}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white", comp.avatarGradient)}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{comp.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{comp.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium", meta.chipBg, meta.chipBorder)}>
                          <PIcon className="h-2.5 w-2.5" />
                          {meta.shortLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs tabular-nums font-medium">{fmtN(comp.followers)}</td>
                      <td className="px-3 py-3">
                        <span className={cn(
                          "text-xs font-medium tabular-nums",
                          comp.avgEngagementRate >= 5 ? "text-emerald-400" :
                          comp.avgEngagementRate >= 3 ? "text-amber-400" : "text-muted-foreground"
                        )}>
                          {comp.avgEngagementRate}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs tabular-nums text-foreground/70">{comp.postsPerWeek}×</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{daysAgo(comp.lastPostDate)}</td>
                      <td className="px-3 py-3">
                        <SparkLine data={comp.growth30d} gain={comp.gainedLast30d} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("flex items-center gap-1 text-xs font-medium tabular-nums", isPos ? "text-emerald-400" : "text-rose-400")}>
                          {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isPos ? "+" : ""}{fmtN(comp.gainedLast30d)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(comp.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="border-t border-border/20 px-4 py-2.5">
          <p className="text-[11px] text-muted-foreground/50">
            {displayed.length} {displayed.length !== 1 ? t("competitors.table.competitor").toLowerCase() + "s" : t("competitors.table.competitor").toLowerCase()} shown
            {platformFilter !== "all" && ` · filtered by ${PLATFORM_META[platformFilter as Platform].label}`}
            {" · "}{t("competitors.table.clickHint")}
          </p>
        </div>
      </Card>

      {/* ── Competitor detail panel ──────────────────────────────────────── */}
      <div ref={detailRef}>
        {selected && (
          <CompetitorDetail
            competitor={selected}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* ── Add dialog ──────────────────────────────────────────────────── */}
      <AddCompetitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAdd}
      />
    </div>
  );
}
