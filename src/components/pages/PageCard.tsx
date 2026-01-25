import { Globe, Settings, ExternalLink, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type PagesProject } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";

interface PageCardProps {
  page: PagesProject;
  onSelect: (page: PagesProject) => void;
  onSettings?: (page: PagesProject) => void;
}

export function PageCard({
  page,
  onSelect,
  onSettings,
}: PageCardProps): React.ReactNode {
  const latestDeploy = page.latest_deployment;
  const deployStatus = latestDeploy?.latest_stage?.status ?? "idle";

  const statusVariant =
    deployStatus === "success"
      ? "success"
      : deployStatus === "failure"
        ? "destructive"
        : deployStatus === "active"
          ? "warning"
          : "secondary";

  return (
    <div
      className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => {
        onSelect(page);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(page);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{page.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onSettings?.(page);
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {page.subdomain}.pages.dev
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="gap-1">
          <GitBranch className="h-3 w-3" />
          {page.production_branch}
        </Badge>
        <Badge variant={statusVariant}>{deployStatus}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {latestDeploy
            ? `Deployed ${formatRelativeTime(latestDeploy.created_on)}`
            : "No deployments"}
        </span>
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
