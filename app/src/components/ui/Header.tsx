/**
 * Header component for the Content Engine app.
 * Simple, minimal header with logo/title.
 */
import Link from "next/link";
import { SparklesIcon } from "./Icons";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-unfocused-border-color bg-background/80 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
          <SparklesIcon size={20} className="text-accent" />
          <span className="font-semibold text-lg">Content Engine</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/projects"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Projects
          </Link>
        </nav>
      </div>
    </header>
  );
}
