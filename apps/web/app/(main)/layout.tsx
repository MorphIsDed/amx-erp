"use client";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    if (isSidebarOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="min-h-screen bg-card text-text-main">
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

          <motion.main
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-4 sm:p-6 overflow-y-auto"
          >
            {children}
          </motion.main>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-surface/80"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-0 bottom-0"
          >
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="absolute right-3 top-3 z-10 px-2"
                aria-label="Close menu"
              >
                <X size={18} />
              </Button>
              <Sidebar onNavigate={closeSidebar} className="border-r-0" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

