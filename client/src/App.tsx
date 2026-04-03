import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutShell } from "@/components/layout-shell";

import Analyze from "@/pages/analyze";
import AnalysisResult from "@/pages/analysis-result";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <LayoutShell>
      <Switch>
        <Route path="/" component={Analyze} />
        <Route path="/analyze" component={Analyze} />
        <Route path="/analyses/:id" component={AnalysisResult} />
        <Route component={NotFound} />
      </Switch>
    </LayoutShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
