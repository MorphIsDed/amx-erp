"use client";
import Button from "@/components/ui/button";
import { Menu, Bell, Search, Command } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-border bg-surface/80 backdrop-blur-xl"
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
        
        {/* COMMAND PALETTE TRIGGER HINT */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-text-muted hover:text-text-main hover:border-primary/50 transition-all text-xs">
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <div className="flex items-center gap-1 ml-4 opacity-50">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-text-muted" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-surface" />
        </Button>
        
        <div className="h-8 w-px bg-border mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-text-main">Admin User</p>
            <p className="text-[10px] text-primary">System Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 font-bold text-xs">
            AD
          </div>
        </div>
      </div>
    </motion.header>
  );
}
