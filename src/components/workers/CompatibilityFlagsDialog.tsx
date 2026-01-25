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

// Common Cloudflare Workers compatibility flags
const COMMON_FLAGS = [
  {
    value: "nodejs_compat",
    label: "Node.js Compatibility",
    description: "Enable Node.js built-in module support",
  },
  {
    value: "nodejs_compat_v2",
    label: "Node.js Compatibility v2",
    description: "Enhanced Node.js compatibility",
  },
  {
    value: "nodejs_als",
    label: "Node.js AsyncLocalStorage",
    description: "Enable AsyncLocalStorage API",
  },
  {
    value: "export_commonjs_default",
    label: "Export CommonJS Default",
    description: "Export default from CommonJS modules",
  },
  {
    value: "export_commonjs_namespace",
    label: "Export CommonJS Namespace",
    description: "Export namespace from CommonJS modules",
  },
  {
    value: "dynamic_dispatch",
    label: "Dynamic Dispatch",
    description: "Enable dynamic dispatch to other Workers",
  },
  {
    value: "service_binding_extra_handlers",
    label: "Service Binding Extra Handlers",
    description: "Enable extra handlers in service bindings",
  },
  {
    value: "durable_object_fetch_requires_full_url",
    label: "DO Fetch Requires Full URL",
    description: "Durable Objects require full URLs",
  },
  {
    value: "fetch_refuses_unknown_protocols",
    label: "Fetch Refuses Unknown Protocols",
    description: "Fetch rejects unknown URL protocols",
  },
  {
    value: "formdata_parser_supports_files",
    label: "FormData Supports Files",
    description: "FormData parser supports file uploads",
  },
  {
    value: "html_rewriter_treats_esi_include_as_void_tag",
    label: "HTMLRewriter ESI Include",
    description: "HTMLRewriter treats esi:include as void tag",
  },
  {
    value: "no_cots_on_external_fetch",
    label: "No COTS on External Fetch",
    description: "Disable COTS on external fetch",
  },
  {
    value: "spectre_hardening",
    label: "Spectre Hardening",
    description: "Enable Spectre vulnerability mitigations",
  },
  {
    value: "streams_enable_constructors",
    label: "Streams Enable Constructors",
    description: "Enable stream constructors",
  },
  {
    value: "transformstream_enable_standard_constructor",
    label: "TransformStream Constructor",
    description: "Enable standard TransformStream constructor",
  },
  {
    value: "url_standard",
    label: "URL Standard",
    description: "Use WHATWG URL standard",
  },
];

interface CompatibilityFlagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerName: string;
  currentFlags: string[];
  onConfirm: (flags: string[]) => void;
  loading?: boolean;
}

export function CompatibilityFlagsDialog({
  open,
  onOpenChange,
  workerName,
  currentFlags,
  onConfirm,
  loading = false,
}: CompatibilityFlagsDialogProps): React.ReactNode {
  const [flags, setFlags] = useState<string[]>(currentFlags);
  const [selectedFlag, setSelectedFlag] = useState<string>("");

  const availableFlags = COMMON_FLAGS.filter((f) => !flags.includes(f.value));

  const handleAddFlag = (): void => {
    if (selectedFlag && !flags.includes(selectedFlag)) {
      setFlags([...flags, selectedFlag]);
      setSelectedFlag("");
    }
  };

  const handleRemoveFlag = (flag: string): void => {
    setFlags(flags.filter((f) => f !== flag));
  };

  const handleSubmit = (): void => {
    onConfirm(flags);
  };

  const handleOpenChange = (isOpen: boolean): void => {
    if (isOpen) {
      setFlags(currentFlags);
      setSelectedFlag("");
    } else {
      setFlags(currentFlags);
      setSelectedFlag("");
    }
    onOpenChange(isOpen);
  };

  const getFlagLabel = (value: string): string => {
    const flag = COMMON_FLAGS.find((f) => f.value === value);
    return flag?.label ?? value;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Compatibility Flags</DialogTitle>
          <DialogDescription>
            Add or remove compatibility flags for{" "}
            <code className="bg-muted px-1 rounded">{workerName}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Flags</Label>
            {flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No compatibility flags configured
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {flags.map((flag) => (
                  <Badge key={flag} variant="secondary" className="gap-1 pr-1">
                    {getFlagLabel(flag)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive/20"
                      onClick={() => {
                        handleRemoveFlag(flag);
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
            <Label>Add Flag</Label>
            <div className="flex gap-2">
              <Select
                value={selectedFlag}
                onValueChange={setSelectedFlag}
                disabled={loading || availableFlags.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      availableFlags.length === 0
                        ? "All flags added"
                        : "Select a flag..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableFlags.map((flag) => (
                    <SelectItem key={flag.value} value={flag.value}>
                      <div className="flex flex-col">
                        <span>{flag.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {flag.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddFlag}
                disabled={!selectedFlag || loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <a
                href="https://developers.cloudflare.com/workers/configuration/compatibility-flags/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View all compatibility flags
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
