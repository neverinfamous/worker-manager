import { useState, useEffect } from "react";
import { FileCode, Plus, RefreshCw, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkerCard } from "./WorkerCard";
import { WorkerDetailView } from "./WorkerDetailView";
import { CreateWorkerDialog } from "./CreateWorkerDialog";
import { listWorkers, type Worker } from "@/lib/api";

export function WorkerListView(): React.ReactNode {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchWorkers = async (skipCache = false): Promise<void> => {
    setLoading(true);
    setError(null);

    const response = await listWorkers({ skipCache });

    if (response.success && response.result) {
      setWorkers(response.result);
    } else {
      setError(response.error ?? "Failed to load workers");
    }

    setLoading(false);
  };

  useEffect(() => {
    const initFetch = async (): Promise<void> => {
      await fetchWorkers();
    };
    void initFetch();
  }, []);

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false,
  );

  // Show detail view if a worker is selected
  if (selectedWorker) {
    return (
      <WorkerDetailView
        worker={selectedWorker}
        onBack={() => {
          setSelectedWorker(null);
        }}
        onRefresh={() => {
          void fetchWorkers(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workers</h1>
          <p className="text-muted-foreground">
            Manage your Cloudflare Workers scripts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              void fetchWorkers(true);
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Create Worker
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-workers"
            name="search-workers"
            aria-label="Search workers"
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredWorkers.length} of {workers.length} workers
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : (
        <Tabs defaultValue="grid" className="w-full">
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <Grid className="h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-lg border bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No workers match your search"
                    : "No workers found"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onSelect={setSelectedWorker}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg border bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No workers match your search"
                    : "No workers found"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border divide-y">
                {filteredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedWorker(worker);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedWorker(worker);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-3">
                      <FileCode className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {worker.handlers?.join(", ") ?? "No handlers"}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(worker.modified_on).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <CreateWorkerDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={() => {
          void fetchWorkers(true);
        }}
      />
    </div>
  );
}
