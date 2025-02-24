
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import UsersAdmin from "./pages/admin/Users";
import TablesAdmin from "./pages/admin/Tables";
import { ThemeProvider } from '@/lib/themeContext';
import { Layout } from "@/components/Layout";
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
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route
                path="/auth"
                element={
                  !isAuthenticated ? (
                    <Auth />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <Index />
                    </Layout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/admin/users"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <UsersAdmin />
                    </Layout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/admin/tables"
                element={
                  isAuthenticated ? (
                    <Layout>
                      <TablesAdmin />
                    </Layout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
