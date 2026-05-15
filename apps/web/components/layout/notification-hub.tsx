"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationHub() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-surface animate-pulse" />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 z-50"
            >
              <Card variant="glass" className="overflow-hidden shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/50">
                  <CardTitle className="text-sm">Notifications</CardTitle>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      {unreadCount} NEW
                    </span>
                  )}
                </CardHeader>
                <CardContent className="p-0 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <Bell className="w-8 h-8 text-border mx-auto mb-2 opacity-20" />
                      <p className="text-xs text-text-muted">All caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={cn(
                            "p-4 transition-colors hover:bg-surface/50 group relative",
                            !n.read && "bg-primary/5"
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "mt-0.5 w-2 h-2 rounded-full shrink-0",
                              n.type === "SUCCESS" ? "bg-emerald-500" : 
                              n.type === "WARNING" ? "bg-amber-500" : 
                              n.type === "ERROR" ? "bg-danger" : "bg-primary"
                            )} />
                            <div className="flex-1 space-y-1">
                              <p className={cn(
                                "text-xs font-semibold leading-tight",
                                n.read ? "text-text-muted" : "text-text-main"
                              )}>
                                {n.title}
                              </p>
                              <p className="text-[11px] text-text-muted leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-text-muted flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  just now
                                </span>
                                {!n.read && (
                                  <button 
                                    onClick={() => markAsRead(n.id)}
                                    className="text-[10px] font-bold text-primary hover:underline"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
