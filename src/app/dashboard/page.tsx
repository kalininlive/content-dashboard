"use client";

import {
  Camera,
  BarChart2,
  CalendarDays,
  Users,
  Newspaper,
  ArrowUpRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const QUICK_STATS = [
  { labelKey: "dashboard.stats.posts",     value: "0",  icon: Camera       },
  { labelKey: "dashboard.stats.reach",     value: "—",  icon: BarChart2    },
  { labelKey: "dashboard.stats.scheduled", value: "0",  icon: CalendarDays },
  { labelKey: "dashboard.stats.tracked",   value: "0",  icon: Users        },
] as const;

export default function DashboardPage() {
  const { t } = useI18n();

  const modules = [
    {
      titleKey: "dashboard.modules.instagram.title",
      descKey:  "dashboard.modules.instagram.description",
      statKey:  "dashboard.modules.instagram.stat",
      icon: Camera,
      href: "/dashboard/instagram",
    },
    {
      titleKey: "dashboard.modules.analytics.title",
      descKey:  "dashboard.modules.analytics.description",
      statKey:  "dashboard.modules.analytics.stat",
      icon: BarChart2,
      href: "/dashboard/analytics",
    },
    {
      titleKey: "dashboard.modules.calendar.title",
      descKey:  "dashboard.modules.calendar.description",
      statKey:  "dashboard.modules.calendar.stat",
      icon: CalendarDays,
      href: "/dashboard/calendar",
    },
    {
      titleKey: "dashboard.modules.competitors.title",
      descKey:  "dashboard.modules.competitors.description",
      statKey:  "dashboard.modules.competitors.stat",
      icon: Users,
      href: "/dashboard/competitors",
    },
    {
      titleKey: "dashboard.modules.news.title",
      descKey:  "dashboard.modules.news.description",
      statKey:  "dashboard.modules.news.stat",
      icon: Newspaper,
      href: "/dashboard/news",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero strip */}
      <div className="dashboard-hero relative overflow-hidden border-b border-border/50 px-6 py-10 lg:px-10 lg:py-14">
        <div className="relative">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Dashboard Active
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-6 py-8 lg:px-10">
        {/* Quick stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_STATS.map((stat) => {
            const Icon = stat.icon;
            const label = t(stat.labelKey);
            return (
              <div
                key={stat.labelKey}
                className="relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-foreground/8"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Module hub */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <a key={mod.href} href={mod.href} className="group">
                <div className="gradient-border relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-2xl bg-card p-5 hover:bg-card/80 hover:shadow-[0_0_30px_oklch(0.65_0.26_285_/_0.10)]">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary/25">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      {t(mod.titleKey)}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t(mod.descKey)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground/60">
                      {t(mod.statKey)}
                    </span>
                    <span className="text-xs font-medium text-primary/70">
                      Open →
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
