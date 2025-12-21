import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, apiFetch } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign, CheckCircle, XCircle } from "lucide-react";
import type { Booking, Turf } from "@shared/schema";

export default function OwnerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Fetch owner's bookings (for turfs they own)
  const { data: ownerBookings, isLoading: bookingsLoading } = useQuery<(Booking & { turfName: string })[]>({
    queryKey: ["/api/owner/bookings"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiFetch("/api/owner/bookings");
      return res.json();
    },
  });

  // Fetch turfs to check if user owns any
  const { data: turfs } = useQuery<Turf[]>({
    queryKey: ["/api/turfs"],
    enabled: !!user,
  });

  const ownedTurfs = turfs?.filter(t => t.ownerId === user?.id) || [];

  // Mutation for updating booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiFetch(`/api/owner/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/bookings"] });
      toast({
        title: "Success",
        description: "Booking status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (ownedTurfs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-display text-2xl font-bold uppercase mb-2">
                No Turfs Owned
              </h3>
              <p className="text-muted-foreground">
                You don't own any turfs. Contact an admin to register your turf.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pendingBookings = ownerBookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = ownerBookings?.filter(b => b.status === 'confirmed') || [];
  const totalRevenue = ownerBookings?.reduce((sum, b) => {
    if (b.status === 'confirmed') {
      return sum + parseFloat(b.totalPrice || '0');
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-12 h-12 text-primary" />
            <h1 className="font-display text-5xl md:text-6xl font-bold uppercase">
              Turf Owner Dashboard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Manage bookings for your turfs
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{ownedTurfs.length}</Badge>
              </div>
              <div className="font-display text-2xl font-bold uppercase">Your Turfs</div>
              <p className="text-sm text-muted-foreground">Active facilities</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{pendingBookings.length}</Badge>
              </div>
              <div className="font-display text-2xl font-bold uppercase">Pending</div>
              <p className="text-sm text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <div className="font-display text-2xl font-bold uppercase">${totalRevenue.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Total confirmed revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bookings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Pending Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="text-center py-12">Loading bookings...</div>
            ) : pendingBookings.length > 0 ? (
              <div className="space-y-3">
                {pendingBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex-1">
                      <div className="font-semibold">{booking.turfName}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-semibold">${booking.totalPrice}</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={updateBookingStatus.isPending}
                          onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "confirmed" })}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={updateBookingStatus.isPending}
                          onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "rejected" })}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No pending booking requests
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase">All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="text-center py-12">Loading bookings...</div>
            ) : ownerBookings && ownerBookings.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ownerBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex-1">
                      <div className="font-semibold">{booking.turfName}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.bookingDate} • {booking.startTime} - {booking.endTime}
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
                      <div className="font-mono font-semibold">${booking.totalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No bookings yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
