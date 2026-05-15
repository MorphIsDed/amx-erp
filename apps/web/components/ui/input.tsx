import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border/60 bg-surface/80 px-3 py-2 text-sm text-text-main placeholder:text-text-faint",
          "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-surface",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:border-border-light/50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
