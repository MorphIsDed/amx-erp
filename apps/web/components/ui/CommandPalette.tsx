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
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <>
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />
      
      <div className={cn(
        "fixed left-1/2 top-[20%] z-50 w-full max-w-[640px] -translate-x-1/2 transition-all duration-300",
        open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      )}>
        <Command className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center border-b border-border px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-text-muted" />
            <Command.Input 
              placeholder="Search or jump to..." 
              className="flex-1 bg-transparent text-text-main placeholder:text-text-muted outline-none"
            />
            <div className="rounded bg-surface border border-border px-2 py-0.5 text-[10px] text-text-muted">
              ESC
            </div>
          </div>
          
          <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
            <Command.Empty className="px-4 py-8 text-center text-sm text-text-muted">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick Actions" className="px-2 py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">
              <CommandItem onSelect={() => runCommand(() => router.push("/hr/employees/new"))}>
                <Plus className="mr-3 h-4 w-4" />
                <span>New Employee</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/finance/invoices/new"))}>
                <Plus className="mr-3 h-4 w-4" />
                <span>Create Invoice</span>
              </CommandItem>
            </Command.Group>

            <Command.Group heading="Navigation" className="mt-2 px-2 py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                <LayoutDashboard className="mr-3 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/hr"))}>
                <Users className="mr-3 h-4 w-4" />
                <span>HR & Payroll</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/finance"))}>
                <CreditCard className="mr-3 h-4 w-4" />
                <span>Finance</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/supply-chain"))}>
                <Truck className="mr-3 h-4 w-4" />
                <span>Supply Chain</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
                <Briefcase className="mr-3 h-4 w-4" />
                <span>Projects</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                <Settings className="mr-3 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </>
  );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item 
      onSelect={onSelect}
      className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-text-main transition-colors hover:bg-surface aria-selected:bg-surface"
    >
      {children}
    </Command.Item>
  );
}
