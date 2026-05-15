import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] select-none";

    const variants = {
      primary:
        "bg-gradient-to-r from-primary-vivid to-primary text-slate-950 font-semibold hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.4)] hover:scale-[1.02] shadow-lg shadow-primary/10",
      secondary:
        "bg-surface border border-border/60 text-text-main hover:bg-card-hover hover:border-primary/30 shadow-sm",
      outline:
        "bg-transparent border border-border/60 text-text-main hover:bg-surface hover:border-primary/30",
      danger:
        "bg-gradient-to-r from-danger to-rose-vivid text-white font-semibold hover:shadow-[0_0_30px_-5px_rgba(248,113,113,0.4)] hover:scale-[1.02] shadow-lg shadow-danger/10",
      ghost:
        "hover:bg-card text-text-muted hover:text-text-main",
      glow:
        "bg-gradient-to-r from-primary-vivid to-cyan text-slate-950 font-semibold shadow-[0_0_40px_-10px_rgba(52,211,153,0.5)] hover:shadow-[0_0_60px_-10px_rgba(52,211,153,0.6)] hover:scale-[1.02]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
      md: "h-10 px-4 py-2 text-sm gap-2",
      lg: "h-12 px-8 text-base gap-2",
      icon: "h-10 w-10 rounded-xl",
    };

    return (
      <Comp
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
export default Button;
