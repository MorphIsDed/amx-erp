"use client";

import Button from "@/components/ui/button";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-main flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg animate-fade-in-up">
          <div className="bg-card/80 backdrop-blur-xl border border-danger/20 rounded-2xl p-6 sm:p-8 space-y-5 shadow-[0_0_40px_-10px_rgba(248,113,113,0.15)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-danger/10 text-danger">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-text-main">Something went wrong</h1>
            </div>
            <p className="text-sm text-text-muted">
              An unexpected error occurred. Try again, or refresh the page.
            </p>
            {error.digest && (
              <p className="text-xs text-text-faint font-mono">Ref: {error.digest}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={reset} variant="primary">Try again</Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>Refresh</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
