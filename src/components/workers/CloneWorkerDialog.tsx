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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from "lucide-react";

interface CloneWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerName: string;
  onConfirm: (newName: string) => void;
  loading: boolean;
}

export function CloneWorkerDialog({
  open,
  onOpenChange,
  workerName,
  onConfirm,
  loading,
}: CloneWorkerDialogProps): React.ReactNode {
  const [newName, setNewName] = useState(`${workerName}-copy`);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: { preventDefault(): void }): void => {
    e.preventDefault();

    if (!newName.trim()) {
      setError("New worker name is required");
      return;
    }

    if (newName === workerName) {
      setError("New name must be different from original");
      return;
    }

    // Validate worker name format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(newName) && newName.length > 1) {
      setError("Name must be lowercase alphanumeric with hyphens");
      return;
    }

    setError(null);
    onConfirm(newName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Clone Worker
            </DialogTitle>
            <DialogDescription>
              Create a copy of <strong>{workerName}</strong> with a new name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">New Worker Name</Label>
              <Input
                id="new-name"
                placeholder="my-worker-copy"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value.toLowerCase());
                }}
                disabled={loading}
              />
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">This will copy:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Worker script code</li>
                <li>Compatibility settings</li>
                <li>Environment variables</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Routes, custom domains, and secrets will <strong>not</strong> be
                copied.
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !newName.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Clone Worker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
