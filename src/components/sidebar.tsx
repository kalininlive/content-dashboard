"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  BarChart2,
  CalendarDays,
  Users,
  Newspaper,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type Locale } from "@/lib/i18n";

const NAV_ITEMS = [
  { key: "overview",    href: "/dashboard",             icon: LayoutDashboard },
  { key: "instagram",   href: "/dashboard/instagram",   icon: Instagram       },
  { key: "analytics",   href: "/dashboard/analytics",   icon: BarChart2       },
  { key: "calendar",    href: "/dashboard/calendar",    icon: CalendarDays    },
  { key: "competitors", href: "/dashboard/competitors", icon: Users           },
  { key: "news",        href: "/dashboard/news",        icon: Newspaper       },
] as const;

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
          <LayoutDashboard className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">
          {t("sidebar.appName")}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(`sidebar.nav.${item.key}`)}
            </Link>
          );
        })}
      </nav>

      {/* Footer: version + language switcher */}
      <div className="border-t border-border px-4 py-3">
        <p className="mb-2 text-xs text-sidebar-foreground/40">{t("sidebar.footer")}</p>
        <div className="flex gap-1">
          {LOCALES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLocale(value)}
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                locale === value
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
