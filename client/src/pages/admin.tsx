import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Calendar, Users, Trophy, Banknote, TrendingUp, MapPin, X } from "lucide-react";
import type { Turf, Booking, Team, Tournament } from "@shared/schema";

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isAddTurfOpen, setIsAddTurfOpen] = useState(false);
  const [turfForm, setTurfForm] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    turfType: "5-a-side",
    pricePerHour: "",
    imageUrl: "",
  });
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: turfs } = useQuery<Turf[]>({
    queryKey: ["/api/admin/turfs"],
    enabled: !!user?.isAdmin,
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: !!user?.isAdmin,
  });

  // Mutation for creating turf
  const createTurfMutation = useMutation({
    mutationFn: async (data: typeof turfForm) => {
      const payload = {
        ...data,
        pricePerHour: parseFloat(data.pricePerHour),
      };
      return await apiRequest("POST", "/api/turfs", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/turfs"] });
      setIsAddTurfOpen(false);
      setTurfForm({
        name: "",
        description: "",
        location: "",
        address: "",
        turfType: "5-a-side",
        pricePerHour: "",
        imageUrl: "",
      });
      toast({
        title: "Success",
        description: "Turf created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create turf",
        variant: "destructive",
      });
    },
  });

  // Mutation for booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/bookings/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: !!user?.isAdmin,
  });

  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
    enabled: !!user?.isAdmin,
  });

  if (!user?.isAdmin) {
    return null;
  }

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="font-display text-5xl md:text-6xl font-bold uppercase" data-testid="heading-admin">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Manage turfs, bookings, and platform operations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card data-testid="card-stat-turfs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{turfs?.length || 0}</Badge>
              </div>
              <div className="font-display text-2xl font-bold uppercase">Total Turfs</div>
              <p className="text-sm text-muted-foreground">Active facilities</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-bookings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{bookings?.length || 0}</Badge>
              </div>
              <div className="font-display text-2xl font-bold uppercase">Bookings</div>
              <p className="text-sm text-muted-foreground">{pendingBookings.length} pending</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-teams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{teams?.length || 0}</Badge>
              </div>
              <div className="font-display text-2xl font-bold uppercase">Teams</div>
              <p className="text-sm text-muted-foreground">Registered teams</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Banknote className="w-8 h-8 text-primary" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="font-display text-2xl font-bold uppercase">PKR {totalRevenue.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Total revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="turfs" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
            <TabsTrigger value="turfs" data-testid="tab-manage-turfs">Turfs</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-manage-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-manage-teams">Teams</TabsTrigger>
            <TabsTrigger value="tournaments" data-testid="tab-manage-tournaments">Tournaments</TabsTrigger>
          </TabsList>

          <TabsContent value="turfs">
            <Card data-testid="card-turfs-management">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-2xl uppercase">Turf Management</CardTitle>
                <Button 
                  data-testid="button-add-turf"
                  onClick={() => setIsAddTurfOpen(true)}
                >
                  Add Turf
                </Button>
              </CardHeader>
              <CardContent>
                {turfs && turfs.length > 0 ? (
                  <div className="space-y-3">
                    {turfs.map(turf => (
                      <div key={turf.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`row-turf-${turf.id}`}>
                        <div className="flex-1">
                          <div className="font-semibold">{turf.name}</div>
                          <div className="text-sm text-muted-foreground">{turf.location} • {turf.turfType}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-mono font-semibold">PKR {turf.pricePerHour}/hr</div>
                            <Badge variant={turf.isActive ? "default" : "secondary"}>
                              {turf.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" data-testid={`button-edit-turf-${turf.id}`}>Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No turfs yet. Add your first turf to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card data-testid="card-bookings-management">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase">Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 10).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`row-booking-${booking.id}`}>
                        <div className="flex-1">
                          <div className="font-semibold">{booking.bookingDate}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={
                              booking.status === 'confirmed' ? 'default' : 
                              booking.status === 'pending' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {booking.status}
                          </Badge>
                          <div className="font-mono font-semibold">PKR {booking.totalPrice}</div>
                          {booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                data-testid={`button-approve-${booking.id}`}
                                disabled={updateBookingStatus.isPending}
                                onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "confirmed" })}
                              >
                                {updateBookingStatus.isPending ? "Approving..." : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                data-testid={`button-reject-${booking.id}`}
                                disabled={updateBookingStatus.isPending}
                                onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "rejected" })}
                              >
                                {updateBookingStatus.isPending ? "Rejecting..." : "Reject"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No bookings yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card data-testid="card-teams-management">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase">Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                {teams && teams.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map(team => (
                      <div key={team.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`row-team-${team.id}`}>
                        <div className="flex-1">
                          <div className="font-semibold font-display uppercase">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ELO: {team.eloRating} • {team.wins}W - {team.losses}L - {team.draws}D
                          </div>
                        </div>
                        <Badge className={`bg-gradient-to-r ${getTierColor(team.tier)}`}>
                          {team.tier}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No teams yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments">
            <Card data-testid="card-tournaments-management">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-2xl uppercase">Tournament Management</CardTitle>
                <Button data-testid="button-create-tournament">Create Tournament</Button>
              </CardHeader>
              <CardContent>
                {tournaments && tournaments.length > 0 ? (
                  <div className="space-y-3">
                    {tournaments.map(tournament => (
                      <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`row-tournament-${tournament.id}`}>
                        <div className="flex-1">
                          <div className="font-semibold font-display uppercase">{tournament.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tournament.location} • Max {tournament.maxTeams} teams
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            tournament.status === 'upcoming' ? 'default' :
                            tournament.status === 'ongoing' ? 'secondary' :
                            'outline'
                          }>
                            {tournament.status}
                          </Badge>
                          <Button size="sm" variant="outline" data-testid={`button-edit-tournament-${tournament.id}`}>Manage</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No tournaments yet. Create your first tournament.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Turf Dialog */}
        <Dialog open={isAddTurfOpen} onOpenChange={setIsAddTurfOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Turf</DialogTitle>
              <DialogDescription>
                Create a new turf listing for your platform
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTurfMutation.mutate(turfForm);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Turf Name</Label>
                <Input
                  id="name"
                  required
                  value={turfForm.name}
                  onChange={(e) => setTurfForm({ ...turfForm, name: e.target.value })}
                  placeholder="e.g., Downtown Sports Complex"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  required
                  value={turfForm.location}
                  onChange={(e) => setTurfForm({ ...turfForm, location: e.target.value })}
                  placeholder="e.g., Downtown"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  value={turfForm.address}
                  onChange={(e) => setTurfForm({ ...turfForm, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={turfForm.description}
                  onChange={(e) => setTurfForm({ ...turfForm, description: e.target.value })}
                  placeholder="Describe the turf facility"
                />
              </div>

              <div>
                <Label htmlFor="turfType">Turf Type</Label>
                <select
                  id="turfType"
                  value={turfForm.turfType}
                  onChange={(e) => setTurfForm({ ...turfForm, turfType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="5-a-side">5-a-side</option>
                  <option value="7-a-side">7-a-side</option>
                  <option value="11-a-side">11-a-side</option>
                </select>
              </div>

              <div>
                <Label htmlFor="pricePerHour">Price Per Hour (PKR)</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  required
                  value={turfForm.pricePerHour}
                  onChange={(e) => setTurfForm({ ...turfForm, pricePerHour: e.target.value })}
                  placeholder="5000"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={turfForm.imageUrl}
                  onChange={(e) => setTurfForm({ ...turfForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddTurfOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTurfMutation.isPending}
                >
                  {createTurfMutation.isPending ? "Creating..." : "Create Turf"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import { getTierColor } from "@/lib/eloUtils";
