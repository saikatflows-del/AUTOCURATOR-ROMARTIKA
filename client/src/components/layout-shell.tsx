import { Link, useLocation } from "wouter";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-24 items-center justify-between">
          <div className="flex items-center">
            <Link href="/analyze">
              <Button size="sm" variant="ghost" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Analysis
              </Button>
            </Link>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <img src="/logo.png" alt="AUTOCURATOR" className="h-[5.25rem] w-auto" />
          </Link>

          <div className="flex items-center">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/analyze">
                <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === "/analyze" || location === "/" ? "text-primary" : "text-muted-foreground"}`}>
                  Analyze Art
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
      <footer className="border-t border-white/10 py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            &copy; 2025 AUTOCURATOR. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
