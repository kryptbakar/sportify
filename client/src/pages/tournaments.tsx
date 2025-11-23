import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, MapPin, Users, DollarSign, Clock } from "lucide-react";
import { formatDate } from "@/lib/bookingUtils";
import type { Tournament } from "@shared/schema";

export default function Tournaments() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const upcomingTournaments = tournaments?.filter(t => t.status === 'upcoming') || [];
  const ongoingTournaments = tournaments?.filter(t => t.status === 'ongoing') || [];
  const completedTournaments = tournaments?.filter(t => t.status === 'completed') || [];

  const renderTournamentCard = (tournament: Tournament) => (
    <Card key={tournament.id} className="hover-elevate" data-testid={`card-tournament-${tournament.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-2xl uppercase truncate" data-testid={`text-tournament-name-${tournament.id}`}>
              {tournament.name}
            </CardTitle>
          </div>
          <Badge 
            variant={tournament.status === 'upcoming' ? 'default' : tournament.status === 'ongoing' ? 'secondary' : 'outline'}
            data-testid={`badge-tournament-status-${tournament.id}`}
          >
            {tournament.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tournament.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tournament.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate">{tournament.location}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Max {tournament.maxTeams} teams</span>
            </div>
            {tournament.entryFee && (
              <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Entry: ${tournament.entryFee}</span>
              </div>
            )}
            {tournament.prizeInfo && (
              <div className="flex items-center text-sm">
                <Trophy className="w-4 h-4 mr-2 text-primary shrink-0" />
                <span className="font-medium">{tournament.prizeInfo}</span>
              </div>
            )}
            {tournament.status === 'upcoming' && (
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-red-600 shrink-0" />
                <span className="text-red-600 font-medium">
                  Registration closes: {formatDate(tournament.registrationDeadline)}
                </span>
              </div>
            )}
          </div>

          {tournament.status === 'upcoming' && (
            <Button className="w-full mt-4" data-testid={`button-register-tournament-${tournament.id}`}>
              Register Team
            </Button>
          )}
          {tournament.status === 'ongoing' && (
            <Button className="w-full mt-4" variant="secondary" data-testid={`button-view-tournament-${tournament.id}`}>
              View Bracket
            </Button>
          )}
          {tournament.status === 'completed' && (
            <Button className="w-full mt-4" variant="outline" data-testid={`button-results-tournament-${tournament.id}`}>
              View Results
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3 flex items-center gap-3" data-testid="heading-tournaments">
            <Trophy className="w-12 h-12 text-primary" />
            Tournaments
          </h1>
          <p className="text-xl text-muted-foreground">
            Compete in exciting tournaments and win prizes
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingTournaments.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing" data-testid="tab-ongoing">
              Ongoing ({ongoingTournaments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed ({completedTournaments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} data-testid={`skeleton-tournament-${i}`}>
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted animate-pulse rounded mb-4" />
                      <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTournaments.map(renderTournamentCard)}
              </div>
            ) : (
              <Card data-testid="card-no-upcoming-tournaments">
                <CardContent className="py-16 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-display text-2xl font-bold uppercase mb-2">
                    No Upcoming Tournaments
                  </h3>
                  <p className="text-muted-foreground">
                    Check back later for new tournaments
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ongoing">
            {ongoingTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingTournaments.map(renderTournamentCard)}
              </div>
            ) : (
              <Card data-testid="card-no-ongoing-tournaments">
                <CardContent className="py-16 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-display text-2xl font-bold uppercase mb-2">
                    No Ongoing Tournaments
                  </h3>
                  <p className="text-muted-foreground">
                    No tournaments currently in progress
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTournaments.map(renderTournamentCard)}
              </div>
            ) : (
              <Card data-testid="card-no-completed-tournaments">
                <CardContent className="py-16 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-display text-2xl font-bold uppercase mb-2">
                    No Completed Tournaments
                  </h3>
                  <p className="text-muted-foreground">
                    Past tournaments will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
