import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Share2, LayoutDashboard, Shield, LogOut } from "lucide-react";

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Share2 className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShareDrop</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link to="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2 text-sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">My Files</span>
              </Button>
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin">
                <Button
                  variant={isActive("/admin") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 text-sm"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-sm text-muted-foreground ml-2"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}