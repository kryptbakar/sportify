import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3">
            Welcome Back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Your football command center
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/turfs">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-book">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-xl font-bold uppercase mb-1">
                  Book Turf
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find and reserve turfs
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/teams">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-teams">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-xl font-bold uppercase mb-1">
                  My Teams
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your squads
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/matchmaking">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-matchmaking">
              <CardContent className="p-6">
                <Sparkles className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-xl font-bold uppercase mb-1">
                  Find Match
                </h3>
                <p className="text-sm text-muted-foreground">
                  Challenge opponents
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tournaments">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-tournaments">
              <CardContent className="p-6">
                <Trophy className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-xl font-bold uppercase mb-1">
                  Tournaments
                </h3>
                <p className="text-sm text-muted-foreground">
                  Join competitions
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upcoming Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-upcoming-bookings">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <Link href="/turfs">
                    <Button data-testid="button-browse-turfs">Browse Turfs</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-matches">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground mb-4">No matches played yet</p>
                  <Link href="/matchmaking">
                    <Button data-testid="button-find-match">Find a Match</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Teams & Stats */}
          <div className="space-y-6">
            <Card data-testid="card-my-teams">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  My Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm mb-3">No teams yet</p>
                  <Link href="/teams">
                    <Button size="sm" data-testid="button-create-team">Create Team</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-rankings">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-3">View top teams</p>
                  <Link href="/rankings">
                    <Button size="sm" variant="outline" data-testid="button-view-rankings">
                      View Leaderboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {user?.isAdmin && (
              <Card className="border-primary/30 bg-primary/5" data-testid="card-admin-access">
                <CardHeader>
                  <CardTitle className="font-display text-xl uppercase flex items-center gap-2">
                    <Badge className="bg-primary">Admin</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">Access admin dashboard</p>
                  <Link href="/admin">
                    <Button size="sm" variant="default" className="w-full" data-testid="button-admin-dashboard">
                      Admin Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
