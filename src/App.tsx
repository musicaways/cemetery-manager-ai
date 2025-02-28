
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

// Configurazione di React Query con gestione errori
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      gcTime: 1000 * 60 * 30, // 30 minuti (sostituisce cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('React Query error:', error);
        errorReporter.reportError(
          error instanceof Error ? error : new Error(String(error)), 
          { source: 'react-query' }
        );
      }
    }
  }
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

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
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        try {
          setIsAuthenticated(!!session);
        } catch (error) {
          console.error("Errore durante l'aggiornamento dello stato di autenticazione:", error);
          setAuthError(error instanceof Error ? error : new Error(String(error)));
        }
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        try {
          setIsAuthenticated(!!session);
          setAppReady(true);
        } catch (error) {
          console.error("Errore durante l'impostazione della sessione:", error);
          setAuthError(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch(error => {
        console.error("Errore durante il recupero della sessione:", error);
        setAuthError(error instanceof Error ? error : new Error(String(error)));
        setAppReady(true); // Comunque imposta l'app come pronta per mostrare l'errore
      });

      // Cleanup della sottoscrizione
      return () => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Errore durante l'annullamento della sottoscrizione:", error);
        }
      };
    } catch (error) {
      console.error("Errore critico nell'inizializzazione dell'autenticazione:", error);
      setAuthError(error instanceof Error ? error : new Error(String(error)));
      setAppReady(true); // Imposta l'app come pronta per mostrare l'errore
    }
  }, []);

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg border border-destructive/30">
          <h1 className="text-xl font-bold mb-4 text-destructive">Errore di autenticazione</h1>
          <p className="mb-4">{authError.message}</p>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md w-full"
            onClick={() => window.location.reload()}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

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
                      <ErrorBoundary>
                        {isAuthenticated ? <Index /> : <Auth />}
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/auth"
                    element={
                      <ErrorBoundary>
                        {!isAuthenticated ? <Auth /> : <Index />}
                      </ErrorBoundary>
                    }
                  />
                  <Route path="/admin">
                    <Route
                      path="tables"
                      element={
                        <ErrorBoundary>
                          {isAuthenticated ? <Tables /> : <Auth />}
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <ErrorBoundary>
                          {isAuthenticated ? <Users /> : <Auth />}
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="ai-functions"
                      element={
                        <ErrorBoundary>
                          {isAuthenticated ? <AIFunctions /> : <Auth />}
                        </ErrorBoundary>
                      }
                    />
                  </Route>
                  <Route
                    path="/cimiteri"
                    element={
                      <ErrorBoundary>
                        {isAuthenticated ? <Cimiteri /> : <Auth />}
                      </ErrorBoundary>
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
