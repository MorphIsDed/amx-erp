"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Users,
  Settings,
  CheckCircle2,
  ShoppingBag,
  Activity,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { API_ENDPOINTS } from "../../lib/api-config";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  INVOICE_CREATED: FileText,
  EMPLOYEE_CREATED: UserPlus,
  TENANT_REGISTERED: Settings,
  INVOICE_PAID: CheckCircle2,
  PRODUCT_CREATED: ShoppingBag,
};

const colorMap: Record<string, string> = {
  INVOICE_CREATED: "text-info bg-info/10 shadow-[0_0_12px_-3px_rgba(96,165,250,0.3)]",
  EMPLOYEE_CREATED: "text-success bg-success/10 shadow-[0_0_12px_-3px_rgba(52,211,153,0.3)]",
  TENANT_REGISTERED: "text-primary bg-primary/10 shadow-[0_0_12px_-3px_rgba(52,211,153,0.3)]",
  INVOICE_PAID: "text-success bg-success/10 shadow-[0_0_12px_-3px_rgba(52,211,153,0.3)]",
  PRODUCT_CREATED: "text-warning bg-warning/10 shadow-[0_0_12px_-3px_rgba(251,191,36,0.3)]",
};

import { useActivityStream } from "../../hooks/use-activity-stream";

export function ActivityTimeline() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activityUpdates } = useActivityStream();

  useEffect(() => {
    if (activityUpdates.length > 0) {
      const latest = activityUpdates[0];
      setActivities(prev => {
        // Prevent duplicate logs if they somehow arrive both via stream and fetch
        if (prev.some(a => a.id === latest.id)) return prev;
        return [latest, ...prev].slice(0, 50);
      });
    }
  }, [activityUpdates]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ACTIVITY, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error("Failed to fetch activity", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading)
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 shimmer rounded" />
              <div className="h-2 w-1/2 shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="relative space-y-6">
      {/* Gradient connecting line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border/20 to-transparent" />

      {activities.length === 0 ? (
        <div className="text-center py-10">
          <Activity className="w-8 h-8 text-text-faint mx-auto mb-3 opacity-30" />
          <p className="text-xs text-text-faint">
            No recent activity logged.
          </p>
        </div>
      ) : (
        activities.map((item, index) => {
          const Icon = iconMap[item.action] || Activity;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.06,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex items-start gap-4 group"
            >
              <div
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border/30 transition-all duration-300 group-hover:scale-110",
                  colorMap[item.action] ||
                    "bg-surface text-text-muted"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 pt-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-text-main leading-none">
                    {item.action
                      .split("_")
                      .map(
                        (word: string) =>
                          word.charAt(0) +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>
                  <span className="text-[10px] font-medium text-text-faint font-mono">
                    {new Date(item.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
                  {item.details?.invoiceNumber ||
                    item.details?.name ||
                    "System action"}{" "}
                  <span className="text-text-faint">by</span>{" "}
                  {item.user?.name || "Automated System"}
                </p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
