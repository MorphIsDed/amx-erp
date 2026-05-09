"use client";
import { motion } from "framer-motion";

export default function ProjectsPage() {
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
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Todo", "In Progress", "Done"].map((col) => (
            <div
              key={col}
              className="bg-card border border-border p-4 rounded-xl"
            >
              <h2 className="mb-3 font-semibold">{col}</h2>
              <p className="text-muted">No tasks yet</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

