
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider } from "@/lib/themeContext";
import { ConnectivityManager } from "./components/ConnectivityManager";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { ServiceWorkerCleanup } from "./ServiceWorkerCleanup";

// Crea un client per React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minuti
    },
  },
});

// Definisci un ID di versione per l'applicazione
// Questo aiuta a forzare un refresh quando viene aggiornato
const APP_VERSION = "1.0.0";

const App = () => {
  // Controlla se è necessario un aggiornamento dell'app
  useEffect(() => {
    const lastVersion = localStorage.getItem('appVersion');
    if (lastVersion !== APP_VERSION) {
      // Aggiorna la versione salvata
      localStorage.setItem('appVersion', APP_VERSION);
      
      // Se non è il primo avvio (c'è già una versione salvata), forza l'aggiornamento
      if (lastVersion) {
        console.log(`Aggiornamento dalla versione ${lastVersion} alla ${APP_VERSION}`);
        // Forza un hard reload dopo un breve ritardo
        setTimeout(() => {
          window.location.reload(true);
        }, 500);
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ConnectivityManager />
          <ServiceWorkerCleanup />
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
