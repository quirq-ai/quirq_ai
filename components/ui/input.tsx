import * as React from "react";

import { cn } from "@/lib/utils";

// Uses xo-swarm's shadcn field contract without application-specific attributes.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 motion-reduce:transition-none md:text-sm file:mr-3 file:border-0 file:bg-transparent file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
