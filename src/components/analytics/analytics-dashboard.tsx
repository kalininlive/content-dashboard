"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
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
  Eye,
  Heart,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Bookmark,
  MessageCircle,
  BarChart2,
} from "lucide-react";
import {
  type DateRange,
  fmtNumber,
  getMetrics,
  getPreviousMetrics,
  pctChange,
  summarise,
  TOP_POSTS,
} from "@/lib/analytics-mock-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ─── Chart configs ─────────────────────────────────────────────────────────

const impressionsConfig: ChartConfig = {
  impressions: { label: "Impressions", color: "var(--chart-1)" },
  reach:       { label: "Reach",       color: "var(--chart-4)" },
};

const engagementConfig: ChartConfig = {
  engagementRate: { label: "Engagement Rate", color: "var(--chart-2)" },
};

const followersConfig: ChartConfig = {
  followersGained: { label: "New Followers", color: "var(--chart-3)" },
};

// ─── Date range toggle ─────────────────────────────────────────────────────

const RANGES: { value: DateRange; label: string }[] = [
  { value: "7d",  label: "7D"  },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

// ─── Tick sampler ─────────────────────────────────────────────────────────

function sampleTicks(data: { date: string }[], maxTicks: number): string[] {
  if (data.length <= maxTicks) return data.map((d) => d.date);
  const step = Math.ceil(data.length / maxTicks);
  return data.filter((_, i) => i % step === 0).map((d) => d.date);
}

// ─── KPI card ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  icon: React.ElementType;
  sub: string;
  vsPrevLabel: string;
}

function KpiCard({ label, value, delta, icon: Icon, sub, vsPrevLabel }: KpiCardProps) {
  const isPositive = delta > 0;
  const isNeutral  = delta === 0;
  const DeltaIcon  = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            isNeutral
              ? "text-muted-foreground"
              : isPositive
              ? "text-emerald-400"
              : "text-rose-400"
          )}
        >
          <DeltaIcon className="h-3 w-3" />
          <span>
            {isNeutral ? "—" : `${isPositive ? "+" : ""}${delta}%`} {vsPrevLabel}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground/60">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Top post card ─────────────────────────────────────────────────────────

function TopPostCard({ post, rank }: { post: typeof TOP_POSTS[0]; rank: number }) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden border-border/40">
      <div className={cn("h-20 bg-gradient-to-br", post.gradientClass, "relative flex items-center justify-center")}>
        <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white">
          {rank}
        </span>
        <span className="rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/80">
          {t(`analytics.postTypes.${post.type}`)}
        </span>
      </div>

      <CardContent className="p-3">
        <p className="mb-3 line-clamp-2 text-xs text-foreground/80 leading-relaxed">{post.caption}</p>

        <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{fmtNumber(post.impressions)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3 w-3" />
            <span className="font-medium text-chart-2">{post.engagementRate}%</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span>{post.comments}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Bookmark className="h-3 w-3" />
            <span>{post.saves}</span>
          </div>
        </div>

        <p className="mt-2.5 text-[10px] text-muted-foreground/50">{post.publishDate}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const { t } = useI18n();
  const [range, setRange] = useState<DateRange>("30d");

  const data     = useMemo(() => getMetrics(range), [range]);
  const prevData = useMemo(() => getPreviousMetrics(range), [range]);

  const curr = useMemo(() => summarise(data), [data]);
  const prev = useMemo(() => summarise(prevData), [prevData]);

  const vsPrev = t("analytics.vsPrevPeriod");

  const kpis: KpiCardProps[] = [
    {
      label: t("analytics.kpis.totalImpressions"),
      value: fmtNumber(curr.totalImpressions),
      delta: pctChange(curr.totalImpressions, prev.totalImpressions),
      icon: Eye,
      sub: t("analytics.kpis.totalImpressionsSub", { value: fmtNumber(curr.totalImpressions) }),
      vsPrevLabel: vsPrev,
    },
    {
      label: t("analytics.kpis.avgEngagementRate"),
      value: `${curr.avgEngagementRate}%`,
      delta: pctChange(curr.avgEngagementRate, prev.avgEngagementRate),
      icon: Heart,
      sub: t("analytics.kpis.avgEngagementRateSub"),
      vsPrevLabel: vsPrev,
    },
    {
      label: t("analytics.kpis.totalFollowers"),
      value: fmtNumber(curr.totalFollowers),
      delta: pctChange(curr.totalFollowers, prev.totalFollowers),
      icon: Users,
      sub: t("analytics.kpis.totalFollowersSub"),
      vsPrevLabel: vsPrev,
    },
    {
      label: t("analytics.kpis.newFollowers"),
      value: `+${fmtNumber(curr.followersGained)}`,
      delta: pctChange(curr.followersGained, prev.followersGained),
      icon: TrendingUp,
      sub: t("analytics.kpis.newFollowersSub"),
      vsPrevLabel: vsPrev,
    },
  ];

  const ticks7  = sampleTicks(data, 7);
  const ticks30 = sampleTicks(data, 8);
  const ticks90 = sampleTicks(data, 10);
  const xTicks  = range === "7d" ? ticks7 : range === "30d" ? ticks30 : ticks90;

  const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{t("analytics.title")}</h1>
              <span className="rounded-md border border-border/50 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {t("analytics.badge")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{t("analytics.subtitle")}</p>
          </div>
        </div>

        {/* Date range toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/30 p-1">
          {RANGES.map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={range === value ? "secondary" : "ghost"}
              className={cn(
                "h-7 w-14 text-xs",
                range === value && "shadow-sm"
              )}
              onClick={() => setRange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Impressions + Reach ─────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.charts.impressionsReach")}</CardTitle>
            <p className="text-xs text-muted-foreground">{t("analytics.charts.impressionsReachSub")}</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={impressionsConfig} className="h-52 w-full">
              <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" ticks={xTicks} tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={fmtNumber} width={42} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="impressions" stroke="var(--color-impressions)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="reach" stroke="var(--color-reach)" strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("analytics.charts.engagementRate")}</CardTitle>
            <p className="text-xs text-muted-foreground">{t("analytics.charts.engagementRateSub")}</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={engagementConfig} className="h-52 w-full">
              <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-engagementRate)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-engagementRate)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" ticks={xTicks} tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={36} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                <Area type="monotone" dataKey="engagementRate" stroke="var(--color-engagementRate)" strokeWidth={2} fill="url(#engGradient)" dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Follower Growth ─────────────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("analytics.charts.followerGrowth")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("analytics.charts.followerGrowthSub")}</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={followersConfig} className="h-44 w-full">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={range === "90d" ? 3 : range === "30d" ? 8 : 20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" ticks={xTicks} tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="followersGained" fill="var(--color-followersGained)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Top Posts ────────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">{t("analytics.topPosts")}</h2>
            <p className="text-xs text-muted-foreground">{t("analytics.topPostsSub")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TOP_POSTS.map((post, i) => (
            <TopPostCard key={post.id} post={post} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
