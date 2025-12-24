import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Banknote, Search } from "lucide-react";
import { Link } from "wouter";
import type { Turf } from "@shared/schema";

export default function Turfs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [turfTypeFilter, setTurfTypeFilter] = useState<string>("all");

  const { data: turfs, isLoading } = useQuery<Turf[]>({
    queryKey: ["/api/turfs"],
  });

  const filteredTurfs = turfs?.filter((turf) => {
    const matchesSearch = turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turf.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = turfTypeFilter === "all" || turf.turfType === turfTypeFilter;
    return matchesSearch && matchesType && turf.isActive;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-3" data-testid="heading-turfs">
            Browse Turfs
          </h1>
          <p className="text-xl text-muted-foreground">
            Find and book premium football turfs near you
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-turfs"
            />
          </div>
          <Select value={turfTypeFilter} onValueChange={setTurfTypeFilter}>
            <SelectTrigger data-testid="select-turf-type">
              <SelectValue placeholder="Turf Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="5-a-side">5-a-side</SelectItem>
              <SelectItem value="7-a-side">7-a-side</SelectItem>
              <SelectItem value="11-a-side">11-a-side</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Turfs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} data-testid={`skeleton-turf-${i}`}>
                <CardHeader className="p-0">
                  <div className="h-48 bg-muted animate-pulse rounded-t-md" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted animate-pulse rounded mb-3" />
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTurfs && filteredTurfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTurfs.map((turf) => (
              <Card key={turf.id} className="hover-elevate overflow-hidden" data-testid={`card-turf-${turf.id}`}>
                <CardHeader className="p-0">
                  <div 
                    className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                    style={turf.imageUrl ? {
                      backgroundImage: `url(${turf.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : undefined}
                  >
                    {!turf.imageUrl && (
                      <Calendar className="w-16 h-16 text-primary/30" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="font-display text-xl uppercase" data-testid={`text-turf-name-${turf.id}`}>
                      {turf.name}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2 shrink-0" data-testid={`badge-turf-type-${turf.id}`}>
                      {turf.turfType}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 shrink-0" />
                      <span className="truncate" data-testid={`text-turf-location-${turf.id}`}>{turf.location}</span>
                    </div>
                    <div className="flex items-center text-sm font-semibold">
                      <Banknote className="w-4 h-4 mr-2 shrink-0 text-primary" />
                      <span data-testid={`text-turf-price-${turf.id}`}>PKR {turf.pricePerHour}/hour</span>
                    </div>
                  </div>

                  {turf.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {turf.description}
                    </p>
                  )}

                  <Link href={`/turfs/${turf.id}`}>
                    <Button className="w-full" data-testid={`button-book-turf-${turf.id}`}>
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card data-testid="card-no-turfs">
            <CardContent className="py-16 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-display text-2xl font-bold uppercase mb-2">
                No Turfs Found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || turfTypeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No turfs available at the moment"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
