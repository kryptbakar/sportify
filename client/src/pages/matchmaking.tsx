import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiFetch, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getTierColor, getTierTextColor } from "@/lib/eloUtils";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Sparkles, Trophy, Users, MapPin, Target, Send } from "lucide-react";
import type { Team, MatchInvitation } from "@shared/schema";

export default function Matchmaking() {
  const { toast } = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Team | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");

  const { data: myTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
  });

  const { data: suggestedTeams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/matchmaking/suggestions", selectedTeamId],
    enabled: !!selectedTeamId,
  });

  const { data: invitations } = useQuery<MatchInvitation[]>({
    queryKey: ["/api/match-invitations"],
  });

  const sendInvitationMutation = useMutation({
    mutationFn: async (data: { fromTeamId: string; toTeamId: string; message: string }) => {
      await apiFetch("/api/match-invitations", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/match-invitations"] });
      toast({
        title: "Invitation Sent!",
        description: "Your match invitation has been sent",
      });
      setInviteDialogOpen(false);
      setInviteMessage("");
      setSelectedOpponent(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const handleSendInvite = () => {
    if (!selectedOpponent || !selectedTeamId) return;
    sendInvitationMutation.mutate({
      fromTeamId: selectedTeamId,
      toTeamId: selectedOpponent.id,
      message: inviteMessage,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3 flex items-center gap-3" data-testid="heading-matchmaking">
            <Sparkles className="w-12 h-12 text-primary" />
            Find a Match
          </h1>
          <p className="text-xl text-muted-foreground">
            Intelligent opponent matching based on ELO rating and preferences
          </p>
        </div>

        {/* Team Selection */}
        <Card className="mb-8" data-testid="card-select-team">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase">Select Your Team</CardTitle>
          </CardHeader>
          <CardContent>
            {myTeams && myTeams.length > 0 ? (
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full" data-testid="select-my-team">
                  <SelectValue placeholder="Choose a team to find opponents" />
                </SelectTrigger>
                <SelectContent>
                  {myTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} - ELO: {team.eloRating} ({team.tier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-4">You need to create a team first</p>
                <Button onClick={() => window.location.href = "/teams"} data-testid="button-go-to-teams">
                  Create Team
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Opponents */}
        {selectedTeamId && (
          <div>
            <h2 className="font-display text-3xl font-bold uppercase mb-6">
              Suggested Opponents
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} data-testid={`skeleton-opponent-${i}`}>
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted animate-pulse rounded mb-4" />
                      <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : suggestedTeams && suggestedTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestedTeams.map((team) => (
                  <Card key={team.id} className="hover-elevate" data-testid={`card-opponent-${team.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="font-display text-xl uppercase truncate" data-testid={`text-opponent-name-${team.id}`}>
                            {team.name}
                          </CardTitle>
                        </div>
                        <Badge 
                          className={`bg-gradient-to-r ${getTierColor(team.tier)} ${getTierTextColor(team.tier)} shrink-0`}
                          data-testid={`badge-opponent-tier-${team.id}`}
                        >
                          {team.tier}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="font-mono text-xl font-bold text-primary" data-testid={`text-opponent-elo-${team.id}`}>
                              {team.eloRating}
                            </div>
                            <div className="text-xs text-muted-foreground">ELO</div>
                          </div>
                          <div>
                            <div className="font-mono text-xl font-bold text-green-600" data-testid={`text-opponent-wins-${team.id}`}>
                              {team.wins}
                            </div>
                            <div className="text-xs text-muted-foreground">W</div>
                          </div>
                          <div>
                            <div className="font-mono text-xl font-bold text-red-600" data-testid={`text-opponent-losses-${team.id}`}>
                              {team.losses}
                            </div>
                            <div className="text-xs text-muted-foreground">L</div>
                          </div>
                        </div>

                        <div className="pt-3 border-t space-y-2">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground truncate">{team.location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Target className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Prefers {team.preferredTurfType}</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full mt-4 gap-2" 
                          onClick={() => {
                            setSelectedOpponent(team);
                            setInviteDialogOpen(true);
                          }}
                          data-testid={`button-challenge-${team.id}`}
                        >
                          <Send className="w-4 h-4" />
                          Challenge Team
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card data-testid="card-no-opponents">
                <CardContent className="py-16 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-display text-2xl font-bold uppercase mb-2">
                    No Opponents Found
                  </h3>
                  <p className="text-muted-foreground">
                    No suitable opponents at this time. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent data-testid="dialog-send-invitation">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl uppercase">
                Challenge {selectedOpponent?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Optional Message
                </label>
                <Textarea
                  placeholder="Hey! Would you like to play a match this weekend?"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={4}
                  data-testid="input-invite-message"
                />
              </div>
              <Button 
                className="w-full gap-2" 
                onClick={handleSendInvite}
                disabled={sendInvitationMutation.isPending}
                data-testid="button-send-invitation"
              >
                <Send className="w-4 h-4" />
                {sendInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
