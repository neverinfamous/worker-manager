import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { type Worker } from "@/lib/api";

interface TailConsumer {
  service: string;
  environment?: string;
}

interface TailWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerName: string;
  currentTailConsumers: TailConsumer[];
  availableWorkers: Worker[];
  onConfirm: (tailConsumers: TailConsumer[]) => void;
  loading?: boolean;
}

export function TailWorkerDialog({
  open,
  onOpenChange,
  workerName,
  currentTailConsumers,
  availableWorkers,
  onConfirm,
  loading = false,
}: TailWorkerDialogProps): React.ReactNode {
  const [tailConsumers, setTailConsumers] =
    useState<TailConsumer[]>(currentTailConsumers);
  const [selectedWorker, setSelectedWorker] = useState<string>("");

  // Filter out current worker and already connected workers
  const connectedServices = tailConsumers.map((tc) => tc.service);
  const filteredWorkers = availableWorkers.filter(
    (w) => w.name !== workerName && !connectedServices.includes(w.name),
  );

  const handleAddTailWorker = (): void => {
    if (selectedWorker && !connectedServices.includes(selectedWorker)) {
      setTailConsumers([...tailConsumers, { service: selectedWorker }]);
      setSelectedWorker("");
    }
  };

  const handleRemoveTailWorker = (service: string): void => {
    setTailConsumers(tailConsumers.filter((tc) => tc.service !== service));
  };

  const handleSubmit = (): void => {
    onConfirm(tailConsumers);
  };

  const handleOpenChange = (isOpen: boolean): void => {
    if (isOpen) {
      setTailConsumers(currentTailConsumers);
      setSelectedWorker("");
    } else {
      setTailConsumers(currentTailConsumers);
      setSelectedWorker("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Tail Workers</DialogTitle>
          <DialogDescription>
            Connect Workers to receive logs from{" "}
            <code className="bg-muted px-1 rounded">{workerName}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Connected Tail Workers</Label>
            {tailConsumers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tail workers connected
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tailConsumers.map((tc) => (
                  <Badge
                    key={tc.service}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tc.service}
                    {tc.environment && (
                      <span className="text-xs text-muted-foreground">
                        ({tc.environment})
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive/20"
                      onClick={() => {
                        handleRemoveTailWorker(tc.service);
                      }}
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Connect Tail Worker</Label>
            <div className="flex gap-2">
              <Select
                value={selectedWorker}
                onValueChange={setSelectedWorker}
                disabled={loading || filteredWorkers.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      filteredWorkers.length === 0
                        ? "No workers available"
                        : "Select a worker..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredWorkers.map((worker) => (
                    <SelectItem key={worker.name} value={worker.name}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddTailWorker}
                disabled={!selectedWorker || loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tail Workers receive console logs and exceptions from the
              connected worker.{" "}
              <a
                href="https://developers.cloudflare.com/workers/observability/tail-workers/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
