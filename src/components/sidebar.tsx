"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  BarChart2,
  CalendarDays,
  Users,
  Newspaper,
  LayoutDashboard,
  X,
  Settings2,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type Locale } from "@/lib/i18n";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { key: "overview",    href: "/dashboard",             icon: LayoutDashboard },
  { key: "instagram",   href: "/dashboard/instagram",   icon: Camera          },
  { key: "analytics",   href: "/dashboard/analytics",   icon: BarChart2       },
  { key: "calendar",    href: "/dashboard/calendar",    icon: CalendarDays    },
  { key: "competitors", href: "/dashboard/competitors", icon: Users           },
  { key: "news",        href: "/dashboard/news",        icon: Newspaper       },
] as const;

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();

  return (
    <aside className="relative flex h-full w-64 xl:w-72 flex-col overflow-hidden bg-sidebar border-r border-sidebar-border">
      {/* Gradient mesh background */}
      <div
        className="sidebar-mesh-bg pointer-events-none absolute inset-0"
        aria-hidden
      />

      {/* Header */}
      <div className="relative flex h-16 items-center justify-between border-b border-sidebar-border/50 px-5">
        <div className="flex items-center gap-3">
          <div
            className="sidebar-logo-glow flex h-8 w-8 items-center justify-center rounded-xl bg-primary"
          >
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
            {t("sidebar.appName")}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative flex flex-1 flex-col gap-0.5 px-2 pt-5 pb-2">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/35">
          Main
        </p>
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
              onClick={() => onClose?.()}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-foreground shadow-[0_0_0_1px_oklch(0.65_0.26_285_/_0.25)]"
                  : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-current group-hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
              </span>
              {t(`sidebar.nav.${item.key}`)}
            </Link>
          );
        })}
      </nav>

      {/* Create Post CTA */}
      <div className="relative px-2 pb-1">
        <Link
          href="/dashboard/posts/new"
          onClick={() => onClose?.()}
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-foreground transition-all"
          style={{ background: "oklch(0.65 0.26 285)", boxShadow: "0 0 16px oklch(0.65 0.26 285 / 0.3)" }}
        >
          <PlusCircle className="h-4 w-4" />
          Создать пост
        </Link>
      </div>

      {/* Settings + Logout */}
      <div className="relative px-2 pb-2">
        <Link
          href="/dashboard/settings"
          onClick={() => onClose?.()}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
            pathname.startsWith("/dashboard/settings")
              ? "bg-sidebar-accent font-medium text-sidebar-foreground shadow-[0_0_0_1px_oklch(0.65_0.26_285_/_0.25)]"
              : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
          )}
        >
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              pathname.startsWith("/dashboard/settings")
                ? "bg-primary/20 text-primary"
                : "text-current group-hover:text-sidebar-foreground"
            )}
          >
            <Settings2 className="h-4 w-4 shrink-0" />
          </span>
          Настройки
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-current group-hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4 shrink-0" />
          </span>
          Выйти
        </button>
      </div>

      {/* Footer */}
      <div className="relative border-t border-sidebar-border/50 px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-medium tracking-wide text-sidebar-foreground/30">
            {t("sidebar.footer")}
          </p>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Live
          </span>
        </div>
        <div className="flex gap-0.5 rounded-lg bg-sidebar-accent/30 p-0.5">
          {LOCALES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLocale(value)}
              className={cn(
                "flex-1 rounded-md px-3 py-1 text-xs font-semibold tracking-wide",
                locale === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/40 hover:text-sidebar-foreground"
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
