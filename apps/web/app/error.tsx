"use client";

import Button from "@/components/ui/button";
import { useEffect } from "react";

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
      <body className="min-h-screen bg-card text-text-main flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-surface border border-border rounded-xl p-4 sm:p-6 space-y-3">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-text-muted">
            An unexpected error occurred. Try again, or refresh the page.
          </p>
          {error.digest && (
            <p className="text-xs text-text-muted">Ref: {error.digest}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button onClick={reset} variant="primary">
              Try again
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
