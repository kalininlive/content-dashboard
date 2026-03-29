import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingUp, Eye, Heart, Users } from "lucide-react";

const metrics = [
  { label: "Total Reach", value: "—", change: null, icon: Eye },
  { label: "Engagement Rate", value: "—", change: null, icon: Heart },
  { label: "Followers", value: "—", change: null, icon: Users },
  { label: "Growth", value: "—", change: null, icon: TrendingUp },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track performance metrics and growth trends</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-muted-foreground">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">No data connected</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <BarChart2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-sm font-medium">No analytics data</h3>
          <p className="text-xs text-muted-foreground">
            Connect your Instagram account to start tracking performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
