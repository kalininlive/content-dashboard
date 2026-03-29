import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Plus, ImageIcon, Clock, CheckCircle2 } from "lucide-react";

const stats = [
  { label: "Total Posts", value: "0", icon: ImageIcon },
  { label: "Scheduled", value: "0", icon: Clock },
  { label: "Published", value: "0", icon: CheckCircle2 },
];

export default function InstagramPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Instagram className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Instagram Manager</h1>
            <p className="text-sm text-muted-foreground">Create, schedule, and publish content</p>
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Instagram className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-sm font-medium">No posts yet</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Create your first post to get started with Instagram management.
          </p>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
