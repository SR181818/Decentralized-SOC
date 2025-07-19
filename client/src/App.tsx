import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="dsoc-ui-theme">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Switch>
        <Route path="/" component={Index} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
