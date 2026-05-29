"use client";
import * as React from "react";
import Button from "@/components/ui/button";
import { Menu, Search, Command } from "lucide-react";
import { motion } from "framer-motion";
import { NotificationHub } from "./notification-hub";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/lib/auth-store";
import { CommandPalette } from "@/components/ui/command-palette";

export default function Topbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "G";

  const roleLabel = !user
    ? "Guest"
    : user.role === "admin"
      ? "Global Administrator"
      : user.role === "finance"
        ? "Finance Manager"
        : user.role === "hr"
          ? "HR Manager"
          : user.role === "inventory"
            ? "Inventory Lead"
            : "Executive Guest";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-border/20 bg-surface-0/60 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden px-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Search trigger */}
        <button 
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/30 bg-card/40 text-text-faint hover:text-text-muted hover:border-border/60 hover:bg-card/70 transition-all duration-200 text-xs group"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-text-faint group-hover:text-text-muted transition-colors">
            Quick search...
          </span>
          <div className="flex items-center gap-0.5 ml-6 px-1.5 py-0.5 rounded bg-surface border border-border/30 text-[10px] font-mono text-text-faint">
            <Command className="w-2.5 h-2.5" />K
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationHub />

        <div className="h-6 w-px bg-border/20 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-text-main leading-tight">
              {user?.name || "Executive Guest"}
            </p>
            <p className="text-[10px] text-primary/80 uppercase font-mono tracking-wider">
              {roleLabel}
            </p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-cyan/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface-0" />
          </div>
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </motion.header>
  );
}
