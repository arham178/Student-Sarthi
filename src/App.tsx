import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import FloatingChatbot from "@/components/FloatingChatbot";
import Index from "./pages/Index";
import Schemes from "./pages/Schemes";
import Scholarships from "./pages/Scholarships";
import Exams from "./pages/Exams";
import AIAssistant from "./pages/AIAssistant";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Bookmarklet from "./pages/Bookmarklet";
import BookmarkletTest from "./pages/BookmarkletTest";
import ApplyFlow from "./pages/ApplyFlow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/bookmarklet" element={<Bookmarklet />} />
              <Route path="/bookmarklet/test" element={<BookmarkletTest />} />
              <Route path="/apply/:itemId" element={<ApplyFlow />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
