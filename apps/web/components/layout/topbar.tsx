"use client";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <div className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden px-2"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </Button>
          )}
          <div className="text-sm text-muted">Welcome back!</div>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search..."
            className="hidden sm:flex bg-card border border-border px-3 py-1.5 rounded-lg text-sm outline-none focus:border-border w-40 md:w-64"
          />

          <div className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

