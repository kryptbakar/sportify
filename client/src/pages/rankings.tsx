import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTierColor, getTierTextColor } from "@/lib/eloUtils";
import { TrendingUp, Trophy, Target } from "lucide-react";
import type { Team } from "@shared/schema";

export default function Rankings() {
  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams/rankings"],
  });

  // Sort by ELO rating
  const rankedTeams = teams ? [...teams].sort((a, b) => b.eloRating - a.eloRating) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3 flex items-center gap-3 animate-slide-pitch" data-testid="heading-rankings">
            <TrendingUp className="w-12 h-12 text-primary animate-bounce-ball" />
            Rankings
          </h1>
          <p className="text-xl text-muted-foreground">
            Top teams ranked by ELO rating
          </p>
          <div className="mt-4 flex gap-2">
            <Badge className="bg-yellow-600 animate-pulse-goal">🥇 Platinum</Badge>
            <Badge className="bg-yellow-400 text-gray-900">🥈 Gold</Badge>
            <Badge className="bg-slate-400 text-gray-900">🥉 Silver</Badge>
            <Badge className="bg-amber-700">🏅 Bronze</Badge>
          </div>
        </div>

        {/* Top 3 Podium */}
        {rankedTeams.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 flex items-center justify-center mb-3">
                <span className="font-display text-2xl font-bold text-white">2</span>
              </div>
              <Card className="w-full" data-testid="card-rank-2">
                <CardContent className="p-4 text-center">
                  <div className="font-display text-lg uppercase truncate mb-1" data-testid="text-rank-2-name">
                    {rankedTeams[1].name}
                  </div>
                  <div className="font-mono text-xl font-bold text-primary" data-testid="text-rank-2-elo">
                    {rankedTeams[1].eloRating}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-600 flex items-center justify-center mb-3">
                <span className="font-display text-3xl font-bold text-yellow-900">1</span>
              </div>
              <Card className="w-full border-primary" data-testid="card-rank-1">
                <CardContent className="p-4 text-center">
                  <div className="font-display text-xl uppercase truncate mb-1" data-testid="text-rank-1-name">
                    {rankedTeams[0].name}
                  </div>
                  <div className="font-mono text-2xl font-bold text-primary" data-testid="text-rank-1-elo">
                    {rankedTeams[0].eloRating}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-16">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 flex items-center justify-center mb-3">
                <span className="font-display text-xl font-bold text-white">3</span>
              </div>
              <Card className="w-full" data-testid="card-rank-3">
                <CardContent className="p-4 text-center">
                  <div className="font-display text-base uppercase truncate mb-1" data-testid="text-rank-3-name">
                    {rankedTeams[2].name}
                  </div>
                  <div className="font-mono text-lg font-bold text-primary" data-testid="text-rank-3-elo">
                    {rankedTeams[2].eloRating}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <Card data-testid="card-rankings-table">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase">All Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-md border" data-testid={`skeleton-rank-${i}`}>
                    <div className="w-8 h-8 bg-muted animate-pulse rounded" />
                    <div className="flex-1 h-6 bg-muted animate-pulse rounded" />
                    <div className="w-20 h-6 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : rankedTeams.length > 0 ? (
              <div className="space-y-2">
                {rankedTeams.map((team, index) => (
                  <div 
                    key={team.id} 
                    className="flex items-center gap-4 p-4 rounded-md border hover-elevate"
                    data-testid={`row-rank-${index + 1}`}
                  >
                    {/* Rank */}
                    <div className="w-10 shrink-0">
                      <div className="font-display text-2xl font-bold text-muted-foreground" data-testid={`text-position-${index + 1}`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Team Avatar */}
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 font-display text-sm">
                        {team.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-lg uppercase truncate" data-testid={`text-team-name-${index + 1}`}>
                        {team.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span data-testid={`text-team-record-${index + 1}`}>
                          {team.wins}W - {team.losses}L - {team.draws}D
                        </span>
                        {" • "}
                        <span>
                          {team.goalsScored}:{team.goalsConceded} goals
                        </span>
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <Badge 
                      className={`bg-gradient-to-r ${getTierColor(team.tier)} ${getTierTextColor(team.tier)} shrink-0`}
                      data-testid={`badge-tier-${index + 1}`}
                    >
                      {team.tier}
                    </Badge>

                    {/* ELO Rating */}
                    <div className="text-right shrink-0 min-w-[80px]">
                      <div className="font-mono text-2xl font-bold text-primary" data-testid={`text-elo-${index + 1}`}>
                        {team.eloRating}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">ELO</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-display text-2xl font-bold uppercase mb-2">
                  No Teams Yet
                </h3>
                <p className="text-muted-foreground">
                  Rankings will appear as teams are created
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
