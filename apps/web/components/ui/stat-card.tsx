"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  accentColor?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  accentColor = "from-primary/20 to-primary/5",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Card
        className={cn(
          "overflow-hidden group relative hover:-translate-y-0.5 transition-all duration-300",
          className
        )}
      >
        {/* Gradient accent bar at bottom */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-40 group-hover:opacity-80 transition-opacity", accentColor)} />

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {title}
              </p>
              <h2 className="text-2xl font-bold text-text-main tracking-tight">
                {value}
              </h2>
              {trend && (
                <p className="text-xs text-text-muted">
                  <span
                    className={cn(
                      "font-semibold",
                      trend.value >= 0 ? "text-success" : "text-danger"
                    )}
                  >
                    {trend.value >= 0 ? "+" : ""}
                    {trend.value}%
                  </span>{" "}
                  {trend.label}
                </p>
              )}
            </div>
            {icon && (
              <div className="p-2.5 rounded-xl bg-surface/80 border border-border/40 text-text-muted group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 group-hover:shadow-[0_0_20px_-5px_rgba(52,211,153,0.2)]">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
