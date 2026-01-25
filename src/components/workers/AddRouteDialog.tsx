import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Zone, listZones } from "@/lib/api";

interface AddRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerName: string;
  onConfirm: (pattern: string, zoneId: string) => void;
  loading?: boolean;
}

export function AddRouteDialog({
  open,
  onOpenChange,
  workerName,
  onConfirm,
  loading = false,
}: AddRouteDialogProps): React.ReactNode {
  const [pattern, setPattern] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const fetchZones = async (): Promise<void> => {
        setLoadingZones(true);
        const response = await listZones();
        if (response.success && response.result) {
          setZones(response.result);
        }
        setLoadingZones(false);
      };
      void fetchZones();
    }
  }, [open]);

  const validatePattern = (p: string): boolean => {
    // Pattern should contain a domain and path, e.g., example.com/* or *.example.com/path/*
    return p.length > 0 && p.includes("/");
  };

  const handleSubmit = (): void => {
    setError("");

    if (!pattern.trim()) {
      setError("Route pattern is required");
      return;
    }

    if (!validatePattern(pattern)) {
      setError("Pattern must include a path (e.g., example.com/*)");
      return;
    }

    if (!selectedZone) {
      setError("Please select a zone");
      return;
    }

    onConfirm(pattern, selectedZone);
  };

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setPattern("");
      setSelectedZone("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  const selectedZoneName = zones.find((z) => z.id === selectedZone)?.name ?? "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Route</DialogTitle>
          <DialogDescription>
            Create a route for{" "}
            <code className="bg-muted px-1 rounded">{workerName}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select
              value={selectedZone}
              onValueChange={setSelectedZone}
              disabled={loading || loadingZones}
            >
              <SelectTrigger id="zone">
                <SelectValue
                  placeholder={
                    loadingZones ? "Loading zones..." : "Select a zone"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern">Route Pattern</Label>
            <Input
              id="pattern"
              placeholder={
                selectedZoneName ? `${selectedZoneName}/*` : "example.com/*"
              }
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value);
              }}
              disabled={loading}
              className="font-mono"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                Use <code>*</code> as a wildcard. Examples:
              </p>
              <ul className="list-disc list-inside ml-2">
                <li>
                  <code>example.com/*</code> - All paths
                </li>
                <li>
                  <code>example.com/api/*</code> - API paths only
                </li>
                <li>
                  <code>*.example.com/*</code> - All subdomains
                </li>
              </ul>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
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
          <Button onClick={handleSubmit} disabled={loading || loadingZones}>
            {loading ? "Adding..." : "Add Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
