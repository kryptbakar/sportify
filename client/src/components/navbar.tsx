import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useCallback } from "react";
import { Trophy, Calendar, Users, TrendingUp, Sparkles, Shield } from "lucide-react";

export function Navbar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = useCallback(async () => {
    localStorage.removeItem("jwt");
    await fetch("/api/auth/logout");
    setLocation("/auth");
  }, [setLocation]);

  const navItems = [
    { href: "/", label: "Home", icon: null },
    { href: "/turfs", label: "Turfs", icon: Calendar },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/matchmaking", label: "Match", icon: Sparkles },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/rankings", label: "Rankings", icon: TrendingUp },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate px-3 py-1 rounded-md" data-testid="link-logo">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="font-display text-2xl font-bold uppercase tracking-wide">
                SportiFY
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={`font-semibold ${isActive(item.href) ? "bg-primary/10" : ""}`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2" data-testid="nav-admin">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer w-full text-left bg-transparent border-0 p-0 m-0"
                    data-testid="menu-logout"
                  >
                    Log Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
