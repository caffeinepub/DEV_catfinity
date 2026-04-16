import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Infinity as InfinityIcon,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideNav && (
        <header className="bg-card border-b border-border shadow-xs sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Branding */}
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-smooth"
              data-ocid="nav.home_link"
            >
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <InfinityIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-semibold text-foreground tracking-tight">
                CatFinity
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                data-ocid="nav.lessons_link"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Lessons
                </span>
              </Link>
              <Link
                to="/settings"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                data-ocid="nav.settings_link"
              >
                <span className="flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  Settings
                </span>
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                data-ocid="nav.theme_toggle"
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  aria-label="Log out"
                  data-ocid="nav.logout_button"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 bg-background">{children}</main>

      {!hideNav && (
        <footer className="bg-card border-t border-border mt-auto">
          <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <InfinityIcon className="w-4 h-4 text-primary" />
              <span className="font-display">CatFinity</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Foundation for (∞, 1)-Categories</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
