// Lightweight SSR navigation skeleton for fast FCP
export default function NavigationSkeleton() {
  return (
    <header className="fixed top-0 z-50 w-full bg-[hsl(var(--bg))]/80 backdrop-blur-md border-b border-[hsl(var(--muted))]/10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))]/20" />
          <div className="hidden md:flex gap-4">
            <div className="w-16 h-4 rounded bg-[hsl(var(--muted))]/20" />
            <div className="w-16 h-4 rounded bg-[hsl(var(--muted))]/20" />
            <div className="w-16 h-4 rounded bg-[hsl(var(--muted))]/20" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))]/20" />
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))]/20" />
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))]/20" />
        </div>
      </nav>
    </header>
  );
}
