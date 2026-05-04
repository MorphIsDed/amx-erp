"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 transition-all hover:scale-[1.01] hover:border-white/20",
        className
      )}
    >
      {children}
    </div>
  );
}