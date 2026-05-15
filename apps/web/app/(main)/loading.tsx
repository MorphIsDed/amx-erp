"use client";

export default function Loading() {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fade-in-up">
      {/* Title skeleton */}
      <div className="h-8 w-56 shimmer rounded-lg" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 shimmer rounded-2xl border border-border/20" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] shimmer rounded-2xl border border-border/20" />
        <div className="h-[400px] shimmer rounded-2xl border border-border/20" />
      </div>
    </div>
  );
}
