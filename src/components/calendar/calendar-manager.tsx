"use client";

import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Music2,
  X,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ALL_PLATFORMS,
  CALENDAR_POSTS,
  PLATFORM_META,
  getPostsByDate,
} from "@/lib/calendar-mock-data";
import { CalendarPost, CalendarStatus, Platform } from "@/types/index";

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = "2026-03-29";
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MAX_CHIPS_PER_CELL = 2;

// ─── Platform icon map ────────────────────────────────────────────────────────

const PLATFORM_ICON: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  youtube:   Youtube,
  tiktok:    Music2,
  twitter:   Twitter,
  linkedin:  Linkedin,
};

// ─── Calendar grid builder ────────────────────────────────────────────────────

interface CalendarCell {
  day: number;
  date: string;       // "YYYY-MM-DD"
  isCurrentMonth: boolean;
}

function buildGrid(year: number, month: number): CalendarCell[] {
  const firstDow      = new Date(year, month, 1).getDay();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const prevDays      = new Date(year, month, 0).getDate();

  const fmt = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const cells: CalendarCell[] = [];

  // Leading days from previous month
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevDays - i;
    const [pm, py] = month === 0 ? [11, year - 1] : [month - 1, year];
    cells.push({ day: d, date: fmt(py, pm, d), isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: fmt(year, month, d), isCurrentMonth: true });
  }

  // Trailing days to fill 42 cells (6 rows)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const [nm, ny] = month === 11 ? [0, year + 1] : [month + 1, year];
    cells.push({ day: d, date: fmt(ny, nm, d), isCurrentMonth: false });
  }

  return cells;
}

// ─── Chip component ───────────────────────────────────────────────────────────

function ContentChip({
  post,
  compact = false,
  onClick,
}: {
  post: CalendarPost;
  compact?: boolean;
  onClick?: () => void;
}) {
  const meta   = PLATFORM_META[post.platform];
  const isScheduled = post.status === "scheduled";

  return (
    <button
      onClick={onClick}
      title={`${post.title} — ${post.time}`}
      className={cn(
        "flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left transition-opacity hover:opacity-80",
        "border text-[10px] leading-snug",
        meta.chipBg,
        meta.chipBorder,
        isScheduled && "border-dashed"
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dotColor)} />
      <span className="truncate">
        {compact
          ? `${meta.shortLabel} ${post.type}`
          : post.title.length > 28
          ? `${post.title.slice(0, 28)}…`
          : post.title}
      </span>
    </button>
  );
}

// ─── Status badge (detail panel) ─────────────────────────────────────────────

function StatusPill({ status }: { status: CalendarStatus }) {
  const config: Record<CalendarStatus, { label: string; className: string; icon: React.ElementType }> = {
    published: { label: "Published", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
    scheduled: { label: "Scheduled", className: "bg-blue-500/15 text-blue-400 border-blue-500/30",         icon: Clock        },
    draft:     { label: "Draft",     className: "bg-amber-500/15 text-amber-400 border-amber-500/30",      icon: Clock        },
  };
  const { label, className, icon: Icon } = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium", className)}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

// ─── Day cell ─────────────────────────────────────────────────────────────────

function DayCell({
  cell,
  posts,
  isToday,
  isSelected,
  onSelect,
}: {
  cell: CalendarCell;
  posts: CalendarPost[];
  isToday: boolean;
  isSelected: boolean;
  onSelect: (date: string) => void;
}) {
  const visible  = posts.slice(0, MAX_CHIPS_PER_CELL);
  const overflow = posts.length - MAX_CHIPS_PER_CELL;

  return (
    <div
      onClick={() => cell.isCurrentMonth && onSelect(cell.date)}
      className={cn(
        "group flex min-h-[100px] flex-col gap-1 rounded-md border p-1.5 transition-colors",
        cell.isCurrentMonth
          ? "cursor-pointer border-border/20 hover:border-border/50 hover:bg-muted/20"
          : "cursor-default border-transparent opacity-30",
        isSelected && "border-border/60 bg-muted/30 ring-1 ring-border/40",
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
            isToday
              ? "bg-primary text-primary-foreground"
              : "text-foreground/70 group-hover:text-foreground"
          )}
        >
          {cell.day}
        </span>
        {posts.length > 0 && (
          <span className="text-[9px] text-muted-foreground/50 tabular-nums">
            {posts.length}
          </span>
        )}
      </div>

      {/* Chips */}
      <div className="flex flex-col gap-0.5">
        {visible.map((post) => (
          <ContentChip
            key={post.id}
            post={post}
            compact
            onClick={(e) => {
              (e as unknown as React.MouseEvent).stopPropagation();
              onSelect(cell.date);
            }}
          />
        ))}
        {overflow > 0 && (
          <span className="pl-1 text-[9px] text-muted-foreground/60">
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DayDetailPanel({
  date,
  posts,
  onClose,
}: {
  date: string;
  posts: CalendarPost[];
  onClose: () => void;
}) {
  const [y, m, d] = date.split("-").map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="mt-4 border-border/40">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-muted-foreground">No content scheduled for this day.</p>
          <Button size="sm" variant="outline" className="mt-3 gap-2">
            <Plus className="h-3.5 w-3.5" />
            Add Post
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {posts.map((post) => {
            const meta = PLATFORM_META[post.platform];
            const Icon = PLATFORM_ICON[post.platform];
            return (
              <div key={post.id} className="flex items-start gap-3 px-4 py-3">
                {/* Platform icon */}
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                    meta.chipBg,
                    meta.chipBorder
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{post.title}</p>
                  {post.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]",
                        meta.chipBg,
                        meta.chipBorder
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotColor)} />
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">{post.type}</span>
                    <span className="text-[10px] text-muted-foreground/50">{post.time}</span>
                    <StatusPill status={post.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CalendarManager() {
  const [year, setYear]               = useState(2026);
  const [month, setMonth]             = useState(2); // March
  const [activeFilters, setFilters]   = useState<Set<Platform>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  const filteredPosts = useMemo(() => {
    if (activeFilters.size === 0) return CALENDAR_POSTS;
    return CALENDAR_POSTS.filter((p) => activeFilters.has(p.platform));
  }, [activeFilters]);

  function goBack() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }
  function goForward() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }
  function goToday() {
    setYear(2026); setMonth(2); setSelectedDate(TODAY);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  function toggleFilter(platform: Platform) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  }

  function handleSelectDate(date: string) {
    setSelectedDate((prev) => (prev === date ? null : date));
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  const selectedPosts = selectedDate ? getPostsByDate(filteredPosts, selectedDate) : [];

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Content Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Plan and schedule your multi-platform content
            </p>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={goToday}>
            Today
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center text-sm font-medium">
              {MONTH_LABELS[month]} {year}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goForward}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Platform filters ─────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {/* All */}
        <button
          onClick={() => setFilters(new Set())}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-all",
            activeFilters.size === 0
              ? "border-border bg-muted text-foreground"
              : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          All platforms
        </button>

        {/* Per-platform */}
        {ALL_PLATFORMS.map((platform) => {
          const meta   = PLATFORM_META[platform];
          const Icon   = PLATFORM_ICON[platform];
          const active = activeFilters.has(platform);
          const count  = CALENDAR_POSTS.filter(
            (p) => p.platform === platform && p.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
          ).length;
          return (
            <button
              key={platform}
              onClick={() => toggleFilter(platform)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                active ? meta.filterActive : meta.filterInactive
              )}
            >
              <Icon className="h-3 w-3" />
              {meta.label}
              {count > 0 && (
                <span className="tabular-nums opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Calendar grid ────────────────────────────────────────────────── */}
      <Card className="border-border/30">
        <CardContent className="p-3">
          {/* Day-of-week headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DOW_LABELS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "py-2 text-center text-[11px] font-medium text-muted-foreground",
                  (i === 0 || i === 6) && "text-muted-foreground/50"
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells — 6 rows × 7 */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell) => {
              const posts = getPostsByDate(filteredPosts, cell.date);
              return (
                <DayCell
                  key={cell.date}
                  cell={cell}
                  posts={posts}
                  isToday={cell.date === TODAY}
                  isSelected={cell.date === selectedDate}
                  onSelect={handleSelectDate}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
          <span className="inline-block h-2.5 w-7 rounded border border-muted-foreground/30 bg-muted-foreground/10" />
          Published
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
          <span className="inline-block h-2.5 w-7 rounded border border-dashed border-muted-foreground/30 bg-muted-foreground/10" />
          Scheduled
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground/50">
          <span>Click a day to view details</span>
        </div>
      </div>

      {/* ── Day detail panel ─────────────────────────────────────────────── */}
      <div ref={detailRef}>
        {selectedDate && (
          <DayDetailPanel
            date={selectedDate}
            posts={selectedPosts}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  );
}
