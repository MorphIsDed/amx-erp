"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Users, 
  Settings, 
  CheckCircle2, 
  ShoppingBag,
  Activity,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const iconMap: any = {
  INVOICE_CREATED: FileText,
  EMPLOYEE_CREATED: UserPlus,
  TENANT_REGISTERED: Settings,
  INVOICE_PAID: CheckCircle2,
  PRODUCT_CREATED: ShoppingBag,
};

const colorMap: any = {
  INVOICE_CREATED: "text-blue-500 bg-blue-500/10",
  EMPLOYEE_CREATED: "text-emerald-500 bg-emerald-500/10",
  TENANT_REGISTERED: "text-primary bg-primary/10",
  INVOICE_PAID: "text-emerald-500 bg-emerald-500/10",
  PRODUCT_CREATED: "text-amber-500 bg-amber-500/10",
};

export function ActivityTimeline() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("http://localhost:3001/activity", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
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

  if (loading) return (
    <div className="space-y-4 animate-pulse p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-12 bg-surface rounded-lg" />
      ))}
    </div>
  );

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
      {activities.length === 0 ? (
        <div className="text-center py-10">
          <Activity className="w-8 h-8 text-border mx-auto mb-2 opacity-20" />
          <p className="text-xs text-text-muted italic">No recent activity logged.</p>
        </div>
      ) : (
        activities.map((item, index) => {
          const Icon = iconMap[item.action] || Activity;
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex items-start gap-4 group"
            >
              <div className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border shadow-sm group-hover:scale-110 transition-transform",
                colorMap[item.action] || "bg-surface text-text-muted"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-text-main leading-none">
                    {item.action.split('_').map((word: string) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </p>
                  <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  {item.details?.invoiceNumber || item.details?.name || 'System action'} 
                  <span className="opacity-50"> by </span> 
                  {item.user?.name || 'Automated System'}
                </p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
