import { Router as WouterRouter, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import Auth from "@/pages/auth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Turfs from "@/pages/turfs";
import TurfDetail from "@/pages/turf-detail";
import Teams from "@/pages/teams";
import Matchmaking from "@/pages/matchmaking";
import Tournaments from "@/pages/tournaments";
import Rankings from "@/pages/rankings";
import Challenges from "@/pages/challenges";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Switch>
        {isLoading || !isAuthenticated ? (
          <>
            <Route path="/auth" component={Auth} />
            <Route path="/" component={Landing} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/turfs" component={Turfs} />
            <Route path="/turfs/:id" component={TurfDetail} />
            <Route path="/teams" component={Teams} />
            <Route path="/matchmaking" component={Matchmaking} />
            <Route path="/challenges" component={Challenges} />
            <Route path="/tournaments" component={Tournaments} />
            <Route path="/rankings" component={Rankings} />
            <Route path="/admin" component={Admin} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Toaster />
          <AppRouter />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
