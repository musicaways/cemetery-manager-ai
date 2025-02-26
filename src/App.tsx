
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./lib/themeContext";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tables from "./pages/admin/Tables";
import Users from "./pages/admin/Users";
import AIFunctions from "./pages/admin/AIFunctions";
import { Cimiteri } from "./pages/cimiteri/Cimiteri";
import NotFound from "./pages/NotFound";
import './styles/chat.css';

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router>
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={
                    isAuthenticated ? <Index /> : <Auth />
                  }
                />
                <Route
                  path="/auth"
                  element={
                    !isAuthenticated ? <Auth /> : <Index />
                  }
                />
                <Route path="/admin">
                  <Route
                    path="tables"
                    element={
                      isAuthenticated ? <Tables /> : <Auth />
                    }
                  />
                  <Route
                    path="users"
                    element={
                      isAuthenticated ? <Users /> : <Auth />
                    }
                  />
                  <Route
                    path="ai-functions"
                    element={
                      isAuthenticated ? <AIFunctions /> : <Auth />
                    }
                  />
                </Route>
                <Route
                  path="/cimiteri"
                  element={
                    isAuthenticated ? <Cimiteri /> : <Auth />
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
