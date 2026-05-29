export default function OfflinePage() {
  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-4 text-center">
      <h1 className="text-4xl font-bold">You are offline</h1>
      <p className="text-muted-foreground">Please check your internet connection and try again.</p>
    </div>
  );
}
