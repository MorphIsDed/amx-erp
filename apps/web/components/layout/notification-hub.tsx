"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { Bell, Clock, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NotificationHub() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-card/60 transition-all duration-200"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-ping opacity-75" />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="absolute right-0 mt-2 w-80 z-50"
            >
              <div className="bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-float overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
                  <h3 className="text-sm font-semibold text-text-main">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary tracking-wider">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <Bell className="w-8 h-8 text-border mx-auto mb-3 opacity-20" />
                      <p className="text-xs text-text-faint">
                        All caught up!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "px-5 py-4 transition-all duration-200 hover:bg-primary/[0.03] group relative",
                            !n.read && "bg-primary/[0.04]"
                          )}
                        >
                          {/* Unread edge indicator */}
                          {!n.read && (
                            <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-primary to-cyan" />
                          )}
                          <div className="flex gap-3">
                            <div
                              className={cn(
                                "mt-0.5 w-2 h-2 rounded-full shrink-0",
                                n.type === "SUCCESS"
                                  ? "bg-success shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                                  : n.type === "WARNING"
                                    ? "bg-warning shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                                    : n.type === "ERROR"
                                      ? "bg-danger shadow-[0_0_6px_rgba(248,113,113,0.5)]"
                                      : "bg-primary shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                              )}
                            />
                            <div className="flex-1 space-y-1">
                              <p
                                className={cn(
                                  "text-xs font-semibold leading-tight",
                                  n.read
                                    ? "text-text-muted"
                                    : "text-text-main"
                                )}
                              >
                                {n.title}
                              </p>
                              <p className="text-[11px] text-text-faint leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-text-faint flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  just now
                                </span>
                                {!n.read && (
                                  <button
                                    onClick={() =>
                                      markAsRead(n.id)
                                    }
                                    className="text-[10px] font-bold text-primary hover:text-primary-vivid transition-colors"
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
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
