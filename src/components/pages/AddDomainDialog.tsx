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

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onConfirm: (domain: string) => void;
  loading?: boolean;
}

export function AddDomainDialog({
  open,
  onOpenChange,
  projectName,
  onConfirm,
  loading = false,
}: AddDomainDialogProps): React.ReactNode {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  const validateDomain = (d: string): boolean => {
    // Basic domain validation: must have at least one dot and no spaces
    const domainRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
    return domainRegex.test(d);
  };

  const handleSubmit = (): void => {
    setError("");

    const trimmedDomain = domain.trim().toLowerCase();

    if (!trimmedDomain) {
      setError("Domain name is required");
      return;
    }

    if (!validateDomain(trimmedDomain)) {
      setError("Please enter a valid domain name (e.g., example.com)");
      return;
    }

    onConfirm(trimmedDomain);
  };

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setDomain("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
          <DialogDescription>
            Add a custom domain to{" "}
            <code className="bg-muted px-1 rounded">{projectName}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
              }}
              disabled={loading}
              className="font-mono"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>After adding the domain, you'll need to configure DNS:</p>
              <ul className="list-disc list-inside ml-2">
                <li>
                  Add a <code>CNAME</code> record pointing to your Pages URL
                </li>
                <li>Or use Cloudflare DNS for automatic configuration</li>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Domain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
