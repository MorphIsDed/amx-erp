"use client";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-text-main flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4 animate-fade-in-up">
        <div className="h-6 w-48 shimmer rounded-lg" />
        <div className="h-4 w-full shimmer rounded-lg" />
        <div className="h-4 w-5/6 shimmer rounded-lg" />
        <div className="h-32 w-full shimmer rounded-2xl mt-6" />
      </div>
    </div>
  );
}
