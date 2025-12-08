import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Calendar, TrendingUp, MapPin, Star } from "lucide-react";
import heroImage from "@assets/generated_images/football_turf_aerial_view_hero.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="font-display text-6xl md:text-8xl font-bold text-white uppercase tracking-wide mb-6">
            SportiFY
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8 font-medium">
            Book Premium Football Turfs, Find Opponents, Compete & Climb the Rankings
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant="default"
              className="text-lg px-8 py-6 h-auto font-semibold"
              onClick={() => window.location.href = '/auth'}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 h-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
              onClick={() => window.location.href = '/auth'}
              data-testid="button-login"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-6xl font-bold uppercase mb-4">
            Why SportiFY?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The ultimate platform for football enthusiasts and turf owners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover-elevate" data-testid="card-feature-booking">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase mb-3">
                Easy Booking
              </h3>
              <p className="text-muted-foreground">
                Browse and book premium football turfs with real-time availability. Smart scheduling prevents double-bookings.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-matchmaking">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase mb-3">
                Find Opponents
              </h3>
              <p className="text-muted-foreground">
                Intelligent matchmaking based on ELO rating, location, and preferences. Challenge teams at your skill level.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-rankings">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase mb-3">
                Rankings
              </h3>
              <p className="text-muted-foreground">
                Dynamic ELO-based ranking system with Bronze, Silver, Gold, and Platinum tiers. Track your progress.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-tournaments">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase mb-3">
                Tournaments
              </h3>
              <p className="text-muted-foreground">
                Join exciting tournaments, compete for prizes, and showcase your team's skills on the big stage.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-locations">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase mb-3">
                Prime Locations
              </h3>
              <p className="text-muted-foreground">
                Find turfs near you with detailed information about facilities, pricing, and turf types.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-analytics">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase mb-3">
                Performance Stats
              </h3>
              <p className="text-muted-foreground">
                Detailed match history, goals scored/conceded, win rates, and performance analytics for your team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-y border-primary/10 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold uppercase mb-6">
            Ready to Play?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of teams already using SportiFY to organize matches and compete
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 py-6 h-auto font-semibold"
            onClick={() => window.location.href = '/auth'}
            data-testid="button-cta-start"
          >
            Start Now - It's Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SportiFY. Premium Football Turf Booking Platform.</p>
        </div>
      </div>
    </div>
  );
}
