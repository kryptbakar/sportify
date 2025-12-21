import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema, type Team, type InsertTeam } from "@shared/schema";
import { apiFetch, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getTierColor, getTierTextColor } from "@/lib/eloUtils";
import { Users, Trophy, Target, Plus } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Teams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const form = useForm<InsertTeam>({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      name: "",
      captainId: user?.id || "",
      location: "",
      preferredTurfType: "5-a-side",
      logoUrl: "",
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: InsertTeam) => {
      await apiFetch("/api/teams", { method: "POST", body: JSON.stringify({ ...data, captainId: user?.id }), headers: { "Content-Type": "application/json" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success!",
        description: "Team created successfully",
      });
      setCreateDialogOpen(false);
      form.reset();
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
        description: "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTeam) => {
    createTeamMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3" data-testid="heading-teams">
              Teams
            </h1>
            <p className="text-xl text-muted-foreground">
              Create and manage your football squads
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" data-testid="button-create-team">
                <Plus className="w-5 h-5" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-testid="dialog-create-team">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl uppercase">Create New Team</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Thunder Strikers" {...field} data-testid="input-team-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="New York, NY" {...field} data-testid="input-team-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredTurfType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Turf Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "5-a-side"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-team-turf-type">
                              <SelectValue placeholder="Select turf type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5-a-side">5-a-side</SelectItem>
                            <SelectItem value="7-a-side">7-a-side</SelectItem>
                            <SelectItem value="11-a-side">11-a-side</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createTeamMutation.isPending} data-testid="button-submit-team">
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} data-testid={`skeleton-team-${i}`}>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted animate-pulse rounded mb-4" />
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover-elevate" data-testid={`card-team-${team.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="font-display text-2xl uppercase truncate" data-testid={`text-team-name-${team.id}`}>
                        {team.name}
                      </CardTitle>
                    </div>
                    <Badge 
                      className={`bg-gradient-to-r ${getTierColor(team.tier)} ${getTierTextColor(team.tier)} shrink-0`}
                      data-testid={`badge-team-tier-${team.id}`}
                    >
                      {team.tier}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-mono text-2xl font-bold text-primary" data-testid={`text-team-elo-${team.id}`}>
                          {team.eloRating}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">ELO</div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl font-bold text-green-600" data-testid={`text-team-wins-${team.id}`}>
                          {team.wins}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">Wins</div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl font-bold text-red-600" data-testid={`text-team-losses-${team.id}`}>
                          {team.losses}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">Losses</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Captain: </span>
                        <span className="ml-1 font-medium">You</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Prefers: </span>
                        <span className="ml-1 font-medium">{team.preferredTurfType}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Trophy className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Goals: </span>
                        <span className="ml-1 font-medium">{team.goalsScored} / {team.goalsConceded}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card data-testid="card-no-teams">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-display text-2xl font-bold uppercase mb-2">
                No Teams Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first team to start playing
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-team">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
