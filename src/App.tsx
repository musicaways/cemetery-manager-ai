
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./lib/themeContext";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingScreen } from "./components/LoadingScreen";
import { ConnectivityManager, OfflineBanner } from "./components/ConnectivityManager";
import { performanceMonitor } from "./lib/performanceMonitor";
import { errorReporter } from "./lib/errorReporter";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tables from "./pages/admin/Tables";
import Users from "./pages/admin/Users";
import { AIFunctions } from "./pages/admin/AIFunctions";
import { Cimiteri } from "./pages/cimiteri/Cimiteri";
import NotFound from "./pages/NotFound";
import './styles/chat.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      gcTime: 1000 * 60 * 30, // 30 minuti (sostituisce cacheTime)
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Registra il tempo di avvio dell'app
    performanceMonitor.recordMetric(
      'navigation', 
      'app-startup-time', 
      performance.now(), 
      'ms'
    );
    
    // Inizializza il Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered:', registration);
          })
          .catch(error => {
            console.error('SW registration failed:', error);
            errorReporter.reportError(
              new Error('Service Worker registration failed'), 
              { originalError: error }
            );
          });
      });
    }
    
    // Controlla lo stato di autenticazione
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAppReady(true);
    });
  }, []);

  if (isAuthenticated === null && !appReady) {
    return <LoadingScreen message="Inizializzazione dell'applicazione..." />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Router>
              <ConnectivityManager />
              <OfflineBanner />
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
    </ErrorBoundary>
  );
}

export default App;
