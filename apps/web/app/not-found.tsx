import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-card text-text-main flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl p-6 space-y-3">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="text-sm text-text-muted">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 h-10 px-4 py-2 text-sm bg-primary text-text-main hover:bg-primary-hover shadow-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

