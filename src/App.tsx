
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./lib/themeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Tables from "./pages/admin/Tables";
import Users from "./pages/admin/Users";
import Settings from "./pages/Settings";
import { AIFunctions } from "./pages/admin/AIFunctions";
import { Cimiteri } from "./pages/cimiteri/Cimiteri";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/chat.css";
import "./App.css";
import { useEffect } from "react";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { ConnectivityManager } from "./components/ConnectivityManager";
import { errorReporter } from "./lib/errorReporter";

function App() {
  const { updateAvailable, acceptUpdate } = useServiceWorker();
  
  // Inizializza il servizio di error reporting
  useEffect(() => {
    errorReporter.setup();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cimiteri" element={<Cimiteri />} />
            <Route path="/cimiteri/:id" element={<Cimiteri />} />
            <Route path="/admin/tables" element={<Tables />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/ai-functions" element={<AIFunctions />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Router>
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(20, 24, 33, 0.9)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
            },
            duration: 3000,
          }}
        />

        {updateAvailable && (
          <div className="fixed bottom-20 right-4 p-4 bg-indigo-600 rounded-lg shadow-lg z-50">
            <p className="text-white mb-2">Nuova versione disponibile</p>
            <button 
              onClick={acceptUpdate}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium"
            >
              Aggiorna
            </button>
          </div>
        )}

        <ConnectivityManager />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
