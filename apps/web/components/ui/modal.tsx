"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/button";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Cinematic backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-2xl shadow-float w-full max-w-md pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 pb-4 border-b border-border/40">
                <h2 className="text-lg font-semibold text-text-main">
                  {title}
                </h2>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-text-muted hover:text-text-main"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="max-h-[70dvh] overflow-y-auto p-6 scrollbar-hide">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
