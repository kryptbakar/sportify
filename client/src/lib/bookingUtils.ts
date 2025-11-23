// Booking and scheduling utilities

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface Booking {
  bookingDate: string;
  startTime: string;
  endTime: string;
}

// Convert time string (HH:MM) to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes since midnight to time string (HH:MM)
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Check if two time slots overlap
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  return start1 < end2 && start2 < end1;
}

// Check if a time slot is available (no conflicts with existing bookings)
export function isSlotAvailable(
  newSlot: TimeSlot,
  date: string,
  existingBookings: Booking[]
): boolean {
  const bookingsOnDate = existingBookings.filter(b => b.bookingDate === date);
  
  for (const booking of bookingsOnDate) {
    if (doTimeSlotsOverlap(newSlot, {
      startTime: booking.startTime,
      endTime: booking.endTime,
    })) {
      return false;
    }
  }
  
  return true;
}

// Generate available time slots for a day
export function generateTimeSlots(
  startHour: number = 6,
  endHour: number = 23,
  slotDuration: number = 60
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const startMinutes = hour * 60 + minute;
      const endMinutes = startMinutes + slotDuration;
      
      if (endMinutes <= endHour * 60) {
        slots.push({
          startTime: minutesToTime(startMinutes),
          endTime: minutesToTime(endMinutes),
        });
      }
    }
  }
  
  return slots;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time for display
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
