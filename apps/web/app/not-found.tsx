import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text-main flex items-center justify-center p-4 sm:p-6">
      <div className="text-center space-y-6 animate-fade-in-up">
        {/* Large 404 gradient text */}
        <h1 className="text-[120px] font-black leading-none tracking-tighter text-gradient-primary opacity-60 animate-float select-none">
          404
        </h1>

        <div className="space-y-3 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-text-main">Page not found</h2>
          <p className="text-sm text-text-muted">
            The page you&apos;re looking for doesn&apos;t exist or was moved.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 h-11 px-6 text-sm bg-gradient-to-r from-primary-vivid to-primary text-slate-950 hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.4)] hover:scale-[1.02] active:scale-[0.98]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
