import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-muted">
          {title}
        </CardTitle>
        {icon && <div className="text-text-muted">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text-main">{value}</div>
        {trend && (
          <p className="text-xs text-text-muted mt-1">
            <span className={cn("font-medium", trend.value >= 0 ? "text-green-500" : "text-danger")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>{" "}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
