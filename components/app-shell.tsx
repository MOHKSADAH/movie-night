"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Film,
  List,
  Eye,
  CalendarDays,
  LogOut,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist", icon: List },
  { href: "/watched", label: "Watched", icon: Eye },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/members", label: "Members", icon: Users },
];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 border-r border-border bg-sidebar">
        <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
          <Film className="h-5 w-5 text-sidebar-primary" />
          <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
            Movie Night
          </span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <div key={item.href} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 md:ml-56 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Film className="h-8 w-8 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 border-r border-border bg-sidebar z-10">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
          <Film className="h-5 w-5 text-sidebar-primary" />
          <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
            Movie Night
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {user && (
            <Link
              href={`/profile/${user._id}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
                pathname.startsWith("/profile")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60",
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className="text-xs">
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user.name ?? "My Profile"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  View profile
                </p>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8 px-2"
            onClick={() => signOut()}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 border-b border-border bg-background flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          <span className="font-semibold text-sm">Movie Night</span>
        </div>
        {user && (
          <Link href={`/profile/${user._id}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback className="text-xs">
                {user.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 h-16 border-t border-border bg-background flex items-center justify-around z-10">
        {navItems.slice(0, 4).map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-56 pb-16 md:pb-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
