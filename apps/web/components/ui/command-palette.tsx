"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, Users, FileText, Package, Briefcase, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Modal } from "@/components/ui/modal";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { user } = useAuthStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Command Palette"
    >
      <Command className="[&_[cmdk-root]]:w-full [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-border/10 [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-input]]:h-14 [&_[cmdk-input]]:w-full [&_[cmdk-input]]:bg-transparent [&_[cmdk-input]]:outline-none [&_[cmdk-input]]:placeholder:text-text-muted [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-3 [&_[cmdk-item]]:text-sm [&_[cmdk-item][data-selected='true']]:bg-primary/10 [&_[cmdk-item][data-selected='true']]:text-primary [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-empty]]:py-6 [&_[cmdk-empty]]:text-center [&_[cmdk-empty]]:text-sm">
        <div className="flex items-center border-b border-border/10 px-4">
          <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
          <Command.Input
            placeholder="Search anything..."
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group heading="Navigation">
            <Command.Item
              onSelect={() => runCommand(() => router.push("/"))}
              className="flex cursor-pointer items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Command.Item>

            {(!user || ["admin", "hr"].includes(user.role)) && (
              <Command.Item
                onSelect={() => runCommand(() => router.push("/hr"))}
                className="flex cursor-pointer items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Human Resources</span>
              </Command.Item>
            )}

            {(!user || ["admin", "finance"].includes(user.role)) && (
              <Command.Item
                onSelect={() => runCommand(() => router.push("/finance"))}
                className="flex cursor-pointer items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                <span>Finance & Ledger</span>
              </Command.Item>
            )}

            {(!user || ["admin", "inventory"].includes(user.role)) && (
              <Command.Item
                onSelect={() =>
                  runCommand(() => router.push("/supply-chain/inventory"))
                }
                className="flex cursor-pointer items-center gap-2"
              >
                <Package className="h-4 w-4" />
                <span>Inventory Master</span>
              </Command.Item>
            )}

            {(!user || ["admin", "inventory", "finance"].includes(user.role)) && (
              <Command.Item
                onSelect={() =>
                  runCommand(() => router.push("/supply-chain/purchase-orders"))
                }
                className="flex cursor-pointer items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                <span>Purchase Orders</span>
              </Command.Item>
            )}

            <Command.Item
              onSelect={() => runCommand(() => router.push("/analytics"))}
              className="flex cursor-pointer items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Analytics & BI</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Actions">
            <Command.Item
              onSelect={() => runCommand(() => console.log("Export to CSV"))}
              className="flex cursor-pointer items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Export current view to CSV</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </Modal>
  );
}
