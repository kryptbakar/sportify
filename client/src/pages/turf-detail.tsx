import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { generateTimeSlots, isSlotAvailable, formatTime } from "@/lib/bookingUtils";
import { MapPin, DollarSign, Calendar as CalendarIcon, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Turf, Booking, Team, InsertBooking } from "@shared/schema";

export default function TurfDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const { data: turf, isLoading: turfLoading } = useQuery<Turf>({
    queryKey: ["/api/turfs", id],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/turfs", id, "bookings"],
  });

  const { data: myTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
  });

  const timeSlots = generateTimeSlots();

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const isSlotBooked = (startTime: string) => {
    if (!selectedDate || !bookings) return false;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const endTime = calculateEndTime(startTime, selectedDuration);
    return !isSlotAvailable({ startTime, endTime }, dateStr, bookings);
  };

  const createBookingMutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      await apiFetch("/api/bookings", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/turfs", id, "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Requested!",
        description: "Your booking is pending confirmation",
      });
      setSelectedStartTime("");
      setNotes("");
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
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!selectedDate || !selectedStartTime || !turf) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }

    const endTime = calculateEndTime(selectedStartTime, selectedDuration);
    const pricePerHour = parseFloat(turf.pricePerHour);
    const totalPrice = (pricePerHour * selectedDuration / 60).toFixed(2);

    createBookingMutation.mutate({
      turfId: turf.id,
      userId: "", // Will be set by backend
      teamId: selectedTeamId === "personal" ? null : selectedTeamId || null,
      bookingDate: selectedDate.toISOString().split('T')[0],
      startTime: selectedStartTime,
      endTime,
      status: "pending",
      totalPrice,
      notes: notes || null,
    });
  };

  if (turfLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30 animate-pulse" />
          <p className="text-muted-foreground">Loading turf details...</p>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Turf not found</p>
          <Link href="/turfs">
            <Button>Back to Turfs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/turfs">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Turfs
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Turf Details */}
          <div className="lg:col-span-2">
            <Card data-testid="card-turf-details">
              <CardHeader className="p-0">
                <div 
                  className="h-64 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                  style={turf.imageUrl ? {
                    backgroundImage: `url(${turf.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : undefined}
                >
                  {!turf.imageUrl && (
                    <CalendarIcon className="w-24 h-24 text-primary/30" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="font-display text-4xl uppercase font-bold mb-2" data-testid="text-turf-name">
                      {turf.name}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span data-testid="text-turf-location">{turf.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base px-4 py-2" data-testid="badge-turf-type">
                    {turf.turfType}
                  </Badge>
                </div>

                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <span className="font-mono text-3xl font-bold" data-testid="text-turf-price">
                      ${turf.pricePerHour}
                    </span>
                    <span className="text-muted-foreground">/ hour</span>
                  </div>
                </div>

                {turf.description && (
                  <div className="mb-6">
                    <h3 className="font-display text-xl uppercase font-semibold mb-3">About This Turf</h3>
                    <p className="text-muted-foreground leading-relaxed">{turf.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-display text-xl uppercase font-semibold mb-3">Location Details</h3>
                  <p className="text-muted-foreground">{turf.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <Card className="sticky top-20" data-testid="card-booking-form">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase">Book This Turf</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Date</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border w-full"
                    data-testid="calendar-booking-date"
                  />
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <Select value={selectedDuration.toString()} onValueChange={(v) => setSelectedDuration(parseInt(v))}>
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Time Slot</label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {timeSlots.map((slot) => {
                      const booked = isSlotBooked(slot.startTime);
                      return (
                        <Button
                          key={slot.startTime}
                          variant={selectedStartTime === slot.startTime ? "default" : "outline"}
                          className={`${booked ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={booked}
                          onClick={() => setSelectedStartTime(slot.startTime)}
                          data-testid={`button-timeslot-${slot.startTime}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(slot.startTime)}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Team Selection (Optional) */}
                {myTeams && myTeams.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Book for Team (Optional)</label>
                    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                      <SelectTrigger data-testid="select-team">
                        <SelectValue placeholder="Personal booking" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal booking</SelectItem>
                        {myTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                  <Textarea
                    placeholder="Any special requests or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    data-testid="input-booking-notes"
                  />
                </div>

                {/* Booking Summary */}
                {selectedStartTime && (
                  <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {formatTime(selectedStartTime)} - {formatTime(calculateEndTime(selectedStartTime, selectedDuration))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{selectedDuration / 60} hour(s)</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-primary/20">
                        <span className="font-semibold">Total:</span>
                        <span className="font-mono font-bold text-lg text-primary">
                          ${(parseFloat(turf.pricePerHour) * selectedDuration / 60).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedStartTime || createBookingMutation.isPending}
                  data-testid="button-confirm-booking"
                >
                  {createBookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
