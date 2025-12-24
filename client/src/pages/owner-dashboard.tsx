import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiFetch } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  Calendar, 
  MapPin, 
  Banknote, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  Edit, 
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarClock,
  Loader2
} from "lucide-react";
import type { Booking, Turf } from "@shared/schema";

interface BookingWithTurf extends Booking {
  turfName: string;
  userName?: string;
  userEmail?: string;
}

export default function OwnerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    pricePerHour: "",
    imageUrl: "",
    isActive: true,
  });

  // Fetch owner's bookings (for turfs they own)
  const { data: ownerBookings, isLoading: bookingsLoading } = useQuery<BookingWithTurf[]>({
    queryKey: ["/api/owner/bookings"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiFetch("/api/owner/bookings");
      return res.json();
    },
  });

  // Fetch owner's turfs
  const { data: ownerTurfs, isLoading: turfsLoading } = useQuery<Turf[]>({
    queryKey: ["/api/owner/turfs"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiFetch("/api/owner/turfs");
      return res.json();
    },
  });

  // Mutation for updating booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiFetch(`/api/owner/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update booking");
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

  // Mutation for updating turf details
  const updateTurf = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiFetch(`/api/owner/turfs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update turf");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/turfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/turfs"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Turf updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update turf",
        variant: "destructive",
      });
    },
  });

  // Toggle turf active status
  const toggleTurfStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiFetch(`/api/owner/turfs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update turf");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/turfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/turfs"] });
      toast({
        title: "Success",
        description: "Turf status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update turf status",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (turf: Turf) => {
    setSelectedTurf(turf);
    setEditForm({
      name: turf.name,
      description: turf.description || "",
      location: turf.location,
      address: turf.address,
      pricePerHour: turf.pricePerHour,
      imageUrl: turf.imageUrl || "",
      isActive: turf.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!selectedTurf) return;
    updateTurf.mutate({
      id: selectedTurf.id,
      data: {
        ...editForm,
        pricePerHour: parseFloat(editForm.pricePerHour),
      },
    });
  };

  if (authLoading || turfsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const ownedTurfs = ownerTurfs || [];

  if (ownedTurfs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-display text-2xl font-bold uppercase mb-2">
                No Turfs Owned
              </h3>
              <p className="text-muted-foreground mb-4">
                You don't own any turfs yet. Contact an admin to register your turf.
              </p>
              <p className="text-sm text-muted-foreground">
                Once you have turfs registered, you'll be able to manage bookings, 
                update pricing, and track your revenue here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate stats
  const pendingBookings = ownerBookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = ownerBookings?.filter(b => b.status === 'confirmed') || [];
  
  const totalRevenue = confirmedBookings.reduce((sum, b) => {
    return sum + parseFloat(b.totalPrice || '0');
  }, 0);

  const pendingRevenue = pendingBookings.reduce((sum, b) => {
    return sum + parseFloat(b.totalPrice || '0');
  }, 0);

  // Get today's bookings
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = ownerBookings?.filter(b => b.bookingDate === today) || [];

  // Get this week's bookings
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekBookings = ownerBookings?.filter(b => new Date(b.bookingDate) >= weekAgo) || [];

  // Revenue by turf
  const revenueByTurf = ownedTurfs.map(turf => {
    const turfBookings = confirmedBookings.filter(b => b.turfId === turf.id);
    const revenue = turfBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0);
    return { turf, revenue, bookingsCount: turfBookings.length };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-10 h-10 text-primary" />
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold uppercase">
                Owner Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your turfs and bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">My Turfs</span>
              </div>
              <div className="font-display text-2xl font-bold">{ownedTurfs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <div className="font-display text-2xl font-bold">{pendingBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Confirmed</span>
              </div>
              <div className="font-display text-2xl font-bold">{confirmedBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
              <div className="font-display text-2xl font-bold">{todayBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <div className="font-display text-xl font-bold">PKR {totalRevenue.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-muted-foreground">Pending Rev</span>
              </div>
              <div className="font-display text-xl font-bold">PKR {pendingRevenue.toFixed(0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="turfs" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">My Turfs</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <CalendarClock className="w-4 h-4" />
              <span className="hidden sm:inline">Pending</span>
              {pendingBookings.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">All Bookings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Turf */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl uppercase flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Revenue by Turf
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueByTurf.map(({ turf, revenue, bookingsCount }) => (
                      <div key={turf.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-semibold">{turf.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {bookingsCount} bookings
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-lg">PKR {revenue.toFixed(0)}</div>
                          <Badge variant={turf.isActive ? "default" : "secondary"} className="text-xs">
                            {turf.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl uppercase flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayBookings.length > 0 ? (
                    <div className="space-y-3">
                      {todayBookings.map(booking => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-semibold">{booking.turfName}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.startTime} - {booking.endTime}
                            </div>
                          </div>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' : 
                            booking.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No bookings scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display text-xl uppercase flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    This Week Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {thisWeekBookings.filter(b => b.status === 'confirmed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Confirmed</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-yellow-600">
                        {thisWeekBookings.filter(b => b.status === 'pending').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">
                        {thisWeekBookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Cancelled/Rejected</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        PKR {thisWeekBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0).toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Week Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Turfs Tab */}
          <TabsContent value="turfs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  My Turfs
                </CardTitle>
                <CardDescription>
                  Manage your turf details, pricing, and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownedTurfs.map(turf => {
                    const turfRevenue = confirmedBookings
                      .filter(b => b.turfId === turf.id)
                      .reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0);
                    const turfBookingsCount = ownerBookings?.filter(b => b.turfId === turf.id).length || 0;
                    
                    return (
                      <Card key={turf.id} className={`overflow-hidden ${!turf.isActive ? 'opacity-60' : ''}`}>
                        {turf.imageUrl && (
                          <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${turf.imageUrl})` }} />
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-display text-xl font-bold uppercase">{turf.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground gap-1">
                                <MapPin className="w-3 h-3" />
                                {turf.location}
                              </div>
                            </div>
                            <Badge variant={turf.isActive ? "default" : "secondary"}>
                              {turf.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div className="bg-muted/50 rounded p-2">
                              <div className="text-muted-foreground">Type</div>
                              <div className="font-semibold">{turf.turfType}</div>
                            </div>
                            <div className="bg-muted/50 rounded p-2">
                              <div className="text-muted-foreground">Price/Hour</div>
                              <div className="font-semibold font-mono">PKR {turf.pricePerHour}</div>
                            </div>
                            <div className="bg-muted/50 rounded p-2">
                              <div className="text-muted-foreground">Total Bookings</div>
                              <div className="font-semibold">{turfBookingsCount}</div>
                            </div>
                            <div className="bg-muted/50 rounded p-2">
                              <div className="text-muted-foreground">Revenue</div>
                              <div className="font-semibold font-mono">PKR {turfRevenue.toFixed(0)}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={turf.isActive}
                                onCheckedChange={(checked) => toggleTurfStatus.mutate({ id: turf.id, isActive: checked })}
                                disabled={toggleTurfStatus.isPending}
                              />
                              <span className="text-sm">{turf.isActive ? "Active" : "Inactive"}</span>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(turf)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Bookings Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                  <CalendarClock className="w-6 h-6" />
                  Pending Booking Requests
                  {pendingBookings.length > 0 && (
                    <Badge variant="destructive">{pendingBookings.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Review and approve or reject booking requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading bookings...</p>
                  </div>
                ) : pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBookings.map(booking => (
                      <Card key={booking.id} className="border-yellow-500/50">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{booking.turfName}</Badge>
                                <Badge variant="outline">{booking.status}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Date:</span>
                                  <div className="font-semibold">{booking.bookingDate}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time:</span>
                                  <div className="font-semibold">{booking.startTime} - {booking.endTime}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Amount:</span>
                                  <div className="font-semibold font-mono">PKR {booking.totalPrice}</div>
                                </div>
                                {booking.notes && (
                                  <div className="col-span-2 md:col-span-1">
                                    <span className="text-muted-foreground">Notes:</span>
                                    <div className="font-semibold truncate">{booking.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={updateBookingStatus.isPending}
                                onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "confirmed" })}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="destructive"
                                disabled={updateBookingStatus.isPending}
                                onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "rejected" })}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h3 className="font-display text-xl font-bold mb-2">All Caught Up!</h3>
                    <p>No pending booking requests at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  All Bookings
                </CardTitle>
                <CardDescription>
                  Complete booking history for your turfs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading bookings...</p>
                  </div>
                ) : ownerBookings && ownerBookings.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {ownerBookings.map(booking => (
                      <div 
                        key={booking.id} 
                        className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg ${
                          booking.status === 'confirmed' ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20' :
                          booking.status === 'pending' ? 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20' :
                          booking.status === 'rejected' ? 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20' :
                          'border-gray-500/30'
                        }`}
                      >
                        <div className="flex-1 mb-2 md:mb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{booking.turfName}</span>
                            <Badge 
                              variant={
                                booking.status === 'confirmed' ? 'default' : 
                                booking.status === 'pending' ? 'secondary' : 
                                'outline'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-mono font-semibold">PKR {booking.totalPrice}</div>
                          {booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={updateBookingStatus.isPending}
                                onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "confirmed" })}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={updateBookingStatus.isPending}
                                onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "rejected" })}
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h3 className="font-display text-xl font-bold mb-2">No Bookings Yet</h3>
                    <p>Bookings will appear here when customers book your turfs.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Turf Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl uppercase">Edit Turf</DialogTitle>
              <DialogDescription>
                Update your turf details and pricing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price/Hour (PKR)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.pricePerHour}
                    onChange={(e) => setEditForm({ ...editForm, pricePerHour: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} disabled={updateTurf.isPending}>
                {updateTurf.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
