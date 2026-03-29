import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, BarChart2, CalendarDays, Users, Newspaper } from "lucide-react";

const modules = [
  {
    title: "Instagram Manager",
    description: "Manage posts, stories, and scheduling",
    icon: Instagram,
    href: "/dashboard/instagram",
    stat: "0 posts",
  },
  {
    title: "Analytics",
    description: "Track reach, engagement, and growth",
    icon: BarChart2,
    href: "/dashboard/analytics",
    stat: "No data yet",
  },
  {
    title: "Content Calendar",
    description: "Plan and visualize your publishing schedule",
    icon: CalendarDays,
    href: "/dashboard/calendar",
    stat: "0 scheduled",
  },
  {
    title: "Competitors",
    description: "Monitor competitor accounts and benchmarks",
    icon: Users,
    href: "/dashboard/competitors",
    stat: "0 tracked",
  },
  {
    title: "News Feed",
    description: "Stay updated with industry news",
    icon: Newspaper,
    href: "/dashboard/news",
    stat: "0 articles",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to your content dashboard. Select a module to get started.
        </p>
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
                  <CardTitle className="text-sm font-medium">{mod.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                  <p className="mt-3 text-xs font-medium text-foreground/50">{mod.stat}</p>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
