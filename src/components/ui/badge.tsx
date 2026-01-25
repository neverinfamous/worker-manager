import * as React from "react";

import { cn } from "@/lib/utils";
import { badgeVariants, type BadgeVariant } from "./badge-variants";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps): React.ReactNode {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
