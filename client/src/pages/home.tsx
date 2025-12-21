import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, TrendingUp, Sparkles, Goal, X } from "lucide-react";
import { Link } from "wouter";
import { FootballPitch, FootballBall, PlayerMarker } from "@/components/football-pitch";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
  // Fetch user's teams
  const { data: myTeams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams/my"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiFetch("/api/teams/my");
      return res.json();
    },
  });
  // Fetch user's bookings
  const { data: myBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiFetch("/api/bookings");
      return res.json();
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await apiFetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header with Interactive Pitch */}
        <div className="mb-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3 animate-slide-pitch">
                Welcome Back{user?.firstName ? `, ${user.firstName}` : ''}!
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Your football command center
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-primary animate-pulse-goal">⚽ Live Bookings</Badge>
                <Badge variant="secondary" className="animate-wiggle">🏆 ELO Rankings</Badge>
              </div>
            </div>
            
            {/* Mini Interactive Pitch */}
            <div className="h-48 animate-glow">
              <FootballPitch className="h-full p-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <FootballBall />
                  <span className="text-sm font-display text-white/80">Kickoff Time!</span>
                </div>
              </FootballPitch>
            </div>
          </div>
        </div>

        {/* Quick Actions - Interactive Sports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/turfs">
            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 group" data-testid="card-quick-book">
              <CardContent className="p-6">
                <div className="relative mb-3 h-12 flex items-center">
                  <Calendar className="w-8 h-8 text-primary group-hover:animate-bounce-ball" />
                  <div className="absolute right-0 top-0 w-3 h-3 bg-primary rounded-full animate-pulse-goal" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase mb-1 group-hover:text-primary">
                  Book Turf
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find and reserve turfs
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/teams">
            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 group" data-testid="card-quick-teams">
              <CardContent className="p-6">
                <div className="relative mb-3 h-12 flex items-center gap-1">
                  <Users className="w-8 h-8 text-primary" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-wiggle" style={{animationDelay: '0s'}} />
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-wiggle" style={{animationDelay: '0.1s'}} />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold uppercase mb-1 group-hover:text-primary">
                  Teams
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your squads
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/matchmaking">
            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 group" data-testid="card-quick-matchmaking">
              <CardContent className="p-6">
                <div className="relative mb-3 h-12 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-rotate-ball" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase mb-1 group-hover:text-primary">
                  Find Match
                </h3>
                <p className="text-sm text-muted-foreground">
                  Challenge opponents
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tournaments">
            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 group" data-testid="card-quick-tournaments">
              <CardContent className="p-6">
                <div className="relative mb-3 h-12 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary group-hover:animate-bounce-ball" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase mb-1 group-hover:text-primary">
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
              {isLoading ? (
                <div className="text-center py-12">Loading bookings...</div>
              ) : myBookings && myBookings.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {myBookings.map((booking: any) => (
                    <Card key={booking.id} className="mb-2">
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{booking.turfName || 'Unknown Turf'}</div>
                            <div className="text-sm text-muted-foreground">Date: {booking.bookingDate}</div>
                            <div className="text-sm text-muted-foreground">Time: {booking.startTime} - {booking.endTime}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'outline'}>
                              {booking.status}
                            </Badge>
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => cancelBookingMutation.mutate(booking.id)}
                                disabled={cancelBookingMutation.isPending}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Link href="/turfs">
                    <Button data-testid="button-browse-turfs">Browse Turfs</Button>
                  </Link>
                </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                    <Link href="/turfs">
                      <Button data-testid="button-browse-turfs">Browse Turfs</Button>
                    </Link>
                  </div>
                )}
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
                {/* You can add recent matches logic here if available */}
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
                  Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="text-center py-8">Loading teams...</div>
                ) : myTeams && myTeams.length > 0 ? (
                  <div className="space-y-4">
                    {myTeams.slice(0, 2).map((team: any) => (
                      <Card key={team.id} className="mb-2">
                        <CardContent className="p-4 flex flex-col gap-2">
                          <div className="font-bold">{team.name}</div>
                          <div>ELO: {team.eloRating}</div>
                          <div>Wins: {team.wins} | Losses: {team.losses}</div>
                        </CardContent>
                      </Card>
                    ))}
                    <Link href="/teams">
                      <Button size="sm" data-testid="button-create-team">Manage Teams</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm mb-3">No teams yet</p>
                    <Link href="/teams">
                      <Button size="sm" data-testid="button-create-team">Create Team</Button>
                    </Link>
                  </div>
                )}
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
