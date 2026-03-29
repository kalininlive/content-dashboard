import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Plus, Rss, ExternalLink } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Newspaper className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">News Feed</h1>
            <p className="text-sm text-muted-foreground">Industry news and trends aggregator</p>
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Source
        </Button>
      </div>

      {/* Feed sources */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Feed Sources</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Rss className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No RSS feeds configured</p>
          <Button size="sm" variant="ghost" className="mt-2 gap-1 text-xs">
            <Plus className="h-3 w-3" />
            Add RSS feed
          </Button>
        </CardContent>
      </Card>

      {/* Articles empty state */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ExternalLink className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-sm font-medium">No articles yet</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Add news sources to aggregate the latest content for your industry.
          </p>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add News Source
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
