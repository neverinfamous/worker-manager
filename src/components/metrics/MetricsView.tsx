import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  AlertCircle,
  RefreshCw,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getMetrics, type Metrics } from "@/lib/api";
import { formatNumber, formatPercent, formatDuration } from "@/lib/format";
import { RequestsChart } from "./RequestsChart";
import { LatencyChart } from "./LatencyChart";
import { ErrorsChart } from "./ErrorsChart";

type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

export function MetricsView(): React.ReactNode {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  const fetchMetrics = async (
    range: TimeRange,
    skipCache = false,
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    const response = await getMetrics(range, { skipCache });

    if (response.success && response.result) {
      setMetrics(response.result);
    } else {
      setError(response.error ?? "Failed to load metrics");
    }

    setLoading(false);
  };

  useEffect(() => {
    const initFetch = async (): Promise<void> => {
      await fetchMetrics(timeRange);
    };
    void initFetch();
  }, [timeRange]);

  const handleRefresh = (): void => {
    void fetchMetrics(timeRange, true);
  };

  const handleTimeRangeChange = (range: string): void => {
    setTimeRange(range as TimeRange);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>
          <p className="text-muted-foreground">
            Analytics and performance metrics for your Workers and Pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={handleTimeRangeChange}>
            <TabsList>
              <TabsTrigger value="1h">1H</TabsTrigger>
              <TabsTrigger value="6h">6H</TabsTrigger>
              <TabsTrigger value="24h">24H</TabsTrigger>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Requests"
              value={metrics ? formatNumber(metrics.requests) : "-"}
              icon={<Activity className="h-4 w-4" />}
              loading={loading}
              trend={12.5}
              description="vs previous period"
            />
            <MetricCard
              title="Success Rate"
              value={metrics ? formatPercent(metrics.success_rate) : "-"}
              icon={<TrendingUp className="h-4 w-4" />}
              loading={loading}
              trend={0.2}
              description="vs previous period"
              variant={
                metrics && metrics.success_rate >= 99 ? "success" : "default"
              }
            />
            <MetricCard
              title="Errors"
              value={metrics ? formatNumber(metrics.errors) : "-"}
              icon={<AlertCircle className="h-4 w-4" />}
              loading={loading}
              trend={-5.3}
              description="vs previous period"
              variant={metrics && metrics.errors > 0 ? "warning" : "success"}
            />
            <MetricCard
              title="Avg CPU Time"
              value={metrics ? formatDuration(metrics.cpu_time_p50) : "-"}
              icon={<Zap className="h-4 w-4" />}
              loading={loading}
              trend={-8.1}
              description="p50 latency"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Request Volume
                </CardTitle>
                <CardDescription>
                  Total requests over{" "}
                  {timeRange === "1h"
                    ? "the last hour"
                    : timeRange === "6h"
                      ? "the last 6 hours"
                      : timeRange === "24h"
                        ? "the last 24 hours"
                        : timeRange === "7d"
                          ? "the last 7 days"
                          : "the last 30 days"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 bg-muted animate-pulse rounded" />
                ) : (
                  <RequestsChart timeRange={timeRange} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Response Latency
                </CardTitle>
                <CardDescription>
                  P50, P90, and P99 latency percentiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 bg-muted animate-pulse rounded" />
                ) : (
                  <LatencyChart
                    p50={metrics?.duration_p50 ?? 0}
                    p90={metrics?.duration_p90 ?? 0}
                    p99={metrics?.duration_p99 ?? 0}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Errors Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Rate
              </CardTitle>
              <CardDescription>Error distribution over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 bg-muted animate-pulse rounded" />
              ) : (
                <ErrorsChart
                  timeRange={timeRange}
                  errorCount={metrics?.errors ?? 0}
                />
              )}
            </CardContent>
          </Card>

          {/* Performance Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  CPU Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PercentileRow
                    label="P50"
                    value={metrics?.cpu_time_p50 ?? 0}
                    loading={loading}
                  />
                  <PercentileRow
                    label="P90"
                    value={metrics?.cpu_time_p90 ?? 0}
                    loading={loading}
                  />
                  <PercentileRow
                    label="P99"
                    value={metrics?.cpu_time_p99 ?? 0}
                    loading={loading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Response Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PercentileRow
                    label="P50"
                    value={metrics?.duration_p50 ?? 0}
                    loading={loading}
                  />
                  <PercentileRow
                    label="P90"
                    value={metrics?.duration_p90 ?? 0}
                    loading={loading}
                  />
                  <PercentileRow
                    label="P99"
                    value={metrics?.duration_p99 ?? 0}
                    loading={loading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Time Range
                    </span>
                    <Badge variant="secondary">{timeRange.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge variant="success">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="text-sm">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
  trend?: number;
  description?: string;
  variant?: "default" | "success" | "warning";
}

function MetricCard({
  title,
  value,
  icon,
  loading,
  trend,
  description,
  variant = "default",
}: MetricCardProps): React.ReactNode {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={
            variant === "success"
              ? "text-green-500"
              : variant === "warning"
                ? "text-yellow-500"
                : "text-muted-foreground"
          }
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${trend > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {trend > 0 ? "+" : ""}
                  {trend.toFixed(1)}%
                </span>
                {description && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {description}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PercentileRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}): React.ReactNode {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {loading ? (
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      ) : (
        <span className="text-sm font-medium">{formatDuration(value)}</span>
      )}
    </div>
  );
}
