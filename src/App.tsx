
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";
import OrganizationStatusIndicator from "@/components/OrganizationStatusIndicator";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Check if we're in production to use the correct basename for GitHub Pages
const basename = import.meta.env.PROD ? '/barcode-lookup-web-app/' : '/';

const App = () => (
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <OrganizationProvider>
        <BrowserRouter basename={basename}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <OrganizationStatusIndicator />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/design-system" element={<DesignSystem />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </OrganizationProvider>
    </ThemeProvider>
  </StrictMode>
);

export default App;
