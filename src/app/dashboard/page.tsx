"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, BarChart2, CalendarDays, Users, Newspaper } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const { t } = useI18n();

  const modules = [
    {
      titleKey: "dashboard.modules.instagram.title",
      descKey:  "dashboard.modules.instagram.description",
      statKey:  "dashboard.modules.instagram.stat",
      icon: Instagram,
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <a key={mod.href} href={mod.href}>
              <Card className="group cursor-pointer transition-colors hover:border-border/80 hover:bg-card/80">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-sm font-medium">{t(mod.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{t(mod.descKey)}</p>
                  <p className="mt-3 text-xs font-medium text-foreground/50">{t(mod.statKey)}</p>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
