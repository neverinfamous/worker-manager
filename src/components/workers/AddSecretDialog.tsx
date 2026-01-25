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

interface AddSecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerName: string;
  onConfirm: (secretName: string, secretValue: string) => void;
  loading?: boolean;
}

export function AddSecretDialog({
  open,
  onOpenChange,
  workerName,
  onConfirm,
  loading = false,
}: AddSecretDialogProps): React.ReactNode {
  const [secretName, setSecretName] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [error, setError] = useState("");

  const validateSecretName = (name: string): boolean => {
    // Secret names must be alphanumeric with underscores
    const pattern = /^[A-Z][A-Z0-9_]*$/;
    return pattern.test(name);
  };

  const handleSubmit = (): void => {
    setError("");

    if (!secretName.trim()) {
      setError("Secret name is required");
      return;
    }

    if (!validateSecretName(secretName)) {
      setError(
        "Secret name must start with a letter and contain only uppercase letters, numbers, and underscores",
      );
      return;
    }

    if (!secretValue) {
      setError("Secret value is required");
      return;
    }

    onConfirm(secretName, secretValue);
  };

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setSecretName("");
      setSecretValue("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Secret</DialogTitle>
          <DialogDescription>
            Add a new secret to{" "}
            <code className="bg-muted px-1 rounded">{workerName}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="secret-name">Secret Name</Label>
            <Input
              id="secret-name"
              placeholder="MY_SECRET_KEY"
              value={secretName}
              onChange={(e) => {
                setSecretName(e.target.value.toUpperCase());
              }}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Use uppercase letters, numbers, and underscores only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret-value">Secret Value</Label>
            <Input
              id="secret-value"
              type="password"
              placeholder="Enter secret value..."
              value={secretValue}
              onChange={(e) => {
                setSecretValue(e.target.value);
              }}
              disabled={loading}
            />
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Secret"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
