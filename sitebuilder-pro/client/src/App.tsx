import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import SiteBuilder from "@/pages/site-builder";
import SiteEditor from "@/pages/site-editor";
import SitePreview from "@/pages/site-preview";
import SiteAnalytics from "@/pages/site-analytics";
import SitePublic from "@/pages/site-public";
import Orders from "@/pages/orders";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/s/:slug" component={SitePublic} />
      <Route path="/preview/:id" component={SitePublic} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/builder" component={SiteBuilder} />
          <Route path="/editor/:siteId" component={SiteEditor} />
          <Route path="/site-preview/:id" component={SitePreview} />
          <Route path="/site-analytics/:id" component={SiteAnalytics} />
          <Route path="/orders/:siteId" component={Orders} />
          <Route path="/analytics/:siteId" component={Analytics} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
