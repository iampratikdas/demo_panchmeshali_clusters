import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EventContents from "@/components/EventContents";
import Index from "./pages/Index";
import VotingPage from "./pages/VotingPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfServicePanchmeshali from "./pages/TermsOfServicePanchmeshali";
import ScrollToHashElement from "./utils/ScrollToHashElement";
import { HelmetProvider } from "react-helmet-async";
const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <ScrollToHashElement />
        <Routes>
          <Route path="/" element={  <div className="min-h-screen bg-panchmeshali-brownlight"><Navbar /> <Index /> </div>} />
          <Route path="/privacy" element={ <div className="min-h-screen bg-panchmeshali-brownlight"><Navbar /><PrivacyPolicy /> </div>} />
          <Route path="/termsandcondition" element={ <div className="min-h-screen bg-panchmeshali-brownlight"><Navbar /><TermsOfServicePanchmeshali /> </div>} />
          <Route path="/voting" element={ <div className="min-h-screen bg-panchmeshali-brownlight"><Navbar /><EventContents /> </div>} />
          <Route path="/voting/:id" element={ <div className="min-h-screen bg-panchmeshali-brownlight"><Navbar /><EventContents /> </div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
