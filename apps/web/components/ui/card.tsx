import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "outline" | "aurora";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-card/80 border border-border/60 shadow-lg hover:border-border-light/40 hover:shadow-xl",
      glass:
        "bg-glass-bg backdrop-blur-xl border border-glass-border shadow-lg hover:border-glass-border-lit hover:shadow-xl",
      outline:
        "bg-transparent border border-border/40 hover:border-border-light/60",
      aurora:
        "bg-card/60 backdrop-blur-lg border border-glass-border shadow-lg bg-mesh hover:border-primary/20 hover:shadow-xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);

const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-base font-semibold leading-none tracking-tight text-text-main",
      className
    )}
    {...props}
  />
);

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
