import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMatchInvitationSchema, type Team, type MatchInvitation } from "@shared/schema";
import { apiFetch, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Send, CheckCircle, XCircle } from "lucide-react";

export default function Challenges() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's teams
  const { data: myTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiFetch("/api/teams/my");
      return res.json();
    },
  });

  // Fetch all teams for challenging
  const { data: allTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      const res = await apiFetch("/api/teams");
      return res.json();
    },
  });

  // Fetch match invitations
  const { data: invitations, isLoading } = useQuery<MatchInvitation[]>({
    queryKey: ["/api/match-invitations"],
    queryFn: async () => {
      const res = await apiFetch("/api/match-invitations");
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertMatchInvitationSchema),
    defaultValues: {
      fromTeamId: "",
      toTeamId: "",
      message: "",
      status: "pending",
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch("/api/match-invitations", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/match-invitations"] });
      toast({
        title: "Challenge sent!",
        description: "Your match challenge has been sent",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send challenge",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createInvitationMutation.mutate(data);
  };

  const acceptChallenge = (challengeId: string) => {
    // Call API to accept challenge
    apiFetch(`/api/match-invitations/${challengeId}/accept`, {
      method: "PATCH",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to accept challenge");
        return res.json();
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/match-invitations"] });
        toast({
          title: "Challenge accepted!",
          description: "You have accepted the challenge.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to accept challenge.",
          variant: "destructive",
        });
      });
  };

  const declineChallenge = (challengeId: string) => {
    // Call API to decline challenge
    apiFetch(`/api/match-invitations/${challengeId}/decline`, {
      method: "PATCH",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to decline challenge");
        return res.json();
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/match-invitations"] });
        toast({
          title: "Challenge declined!",
          description: "You have declined the challenge.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to decline challenge.",
          variant: "destructive",
        });
      });
  };

  const receivedChallenges = invitations?.filter(
    (inv) => myTeams?.some((t) => t.id === inv.toTeamId) && inv.status === "pending"
  ) || [];

  const sentChallenges = invitations?.filter(
    (inv) => myTeams?.some((t) => t.id === inv.fromTeamId)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3">Match Challenges</h1>
            <p className="text-xl text-muted-foreground">Challenge other teams to matches</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Send className="w-5 h-5" />
                Challenge Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl uppercase">Send Challenge</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fromTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Team</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {myTeams?.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenge Team</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team to challenge" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allTeams
                              ?.filter((team) => !myTeams?.some((t) => t.id === team.id))
                              .map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name} (ELO: {team.eloRating})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Add a message (optional)"
                            className="w-full p-2 border rounded"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createInvitationMutation.isPending}>
                    {createInvitationMutation.isPending ? "Sending..." : "Send Challenge"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Received Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Challenges Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">Loading challenges...</div>
              ) : receivedChallenges.length > 0 ? (
                <div className="space-y-4">
                  {receivedChallenges.map((challenge) => (
                    <Card key={challenge.id} className="p-4 border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">Challenge from another team</h3>
                          <p className="text-sm text-muted-foreground">{challenge.message}</p>
                        </div>
                        <Badge>Pending</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => acceptChallenge(challenge.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => declineChallenge(challenge.id)}
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No challenges yet. Challenge other teams!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sent Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                <Send className="w-6 h-6" />
                Challenges Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">Loading challenges...</div>
              ) : sentChallenges.length > 0 ? (
                <div className="space-y-4">
                  {sentChallenges.map((challenge) => (
                    <Card key={challenge.id} className="p-4 border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">Challenge sent</h3>
                          <p className="text-sm text-muted-foreground">Waiting for response...</p>
                        </div>
                        <Badge variant={challenge.status === "pending" ? "secondary" : "default"}>
                          {challenge.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No challenges sent yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
