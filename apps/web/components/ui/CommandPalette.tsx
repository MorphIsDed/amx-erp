"use client";

import * as React from "react";
import { Command } from "cmdk";
import {
  Search,
  LayoutDashboard,
  Users,
  CreditCard,
  Truck,
  Settings,
  Briefcase,
  Plus,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-[18%] z-50 w-full max-w-[580px] -translate-x-1/2"
          >
            <Command className="overflow-hidden rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-float">
              {/* Search input area */}
              <div className="flex items-center border-b border-border/30 px-4 py-3.5 gap-3">
                <div className="p-1 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <Command.Input
                  placeholder="Search or jump to..."
                  className="flex-1 bg-transparent text-text-main placeholder:text-text-faint outline-none text-sm"
                />
                <div className="rounded-lg bg-surface border border-border/50 px-2 py-1 text-[10px] font-mono text-text-faint">
                  ESC
                </div>
              </div>

              {/* Results */}
              <Command.List className="max-h-[380px] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="px-4 py-10 text-center text-sm text-text-muted">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading="Quick Actions"
                  className="px-2 py-2 text-[10px] font-semibold text-text-faint uppercase tracking-widest"
                >
                  <CommandItem
                    onSelect={() =>
                      runCommand(() => router.push("/hr"))
                    }
                  >
                    <Plus className="mr-3 h-4 w-4 text-primary" />
                    <span>New Employee</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      runCommand(() =>
                        router.push("/finance/invoices")
                      )
                    }
                  >
                    <Plus className="mr-3 h-4 w-4 text-primary" />
                    <span>Create Invoice</span>
                  </CommandItem>
                </Command.Group>

                <Command.Group
                  heading="Navigation"
                  className="mt-1 px-2 py-2 text-[10px] font-semibold text-text-faint uppercase tracking-widest"
                >
                  <CommandItem
                    onSelect={() =>
                      runCommand(() => router.push("/dashboard"))
                    }
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    <span>Dashboard</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      runCommand(() => router.push("/hr"))
                    }
                  >
                    <Users className="mr-3 h-4 w-4" />
                    <span>HR & Payroll</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      runCommand(() => router.push("/finance"))
                    }
                  >
                    <CreditCard className="mr-3 h-4 w-4" />
                    <span>Finance</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      runCommand(() =>
                        router.push("/supply-chain")
                      )
                    }
                  >
                    <Truck className="mr-3 h-4 w-4" />
                    <span>Supply Chain</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      runCommand(() => router.push("/analytics"))
                    }
                  >
                    <BarChart3 className="mr-3 h-4 w-4" />
                    <span>Analytics</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      runCommand(() => router.push("/projects"))
                    }
                  >
                    <Briefcase className="mr-3 h-4 w-4" />
                    <span>Projects</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      runCommand(() => router.push("/settings"))
                    }
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </CommandItem>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm text-text-muted transition-all duration-200 hover:bg-primary/[0.06] hover:text-text-main aria-selected:bg-primary/[0.06] aria-selected:text-text-main group"
    >
      {children}
    </Command.Item>
  );
}
