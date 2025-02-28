
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "@/pages/Index";
import { Cimiteri } from "@/pages/cimiteri/Cimiteri";
import { Tables } from "@/pages/admin/Tables";
import { Users } from "@/pages/admin/Users";
import { AIFunctions } from "@/pages/admin/AIFunctions";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/lib/themeContext";
import { ConnectivityManager } from "@/components/ConnectivityManager";
import { useEffect } from "react";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import "./App.css";

function App() {
  const { isServiceWorkerActive } = useServiceWorker();

  useEffect(() => {
    if (isServiceWorkerActive()) {
      console.info("ServiceWorker registrato con successo:", {});
      console.info("SW registered:", {});
    }
  }, [isServiceWorkerActive]);

  return (
    <>
      <ThemeProvider>
        <ErrorBoundary>
          <ConnectivityManager />
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cimiteri" element={<Cimiteri />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/tables" element={<Tables />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/ai-functions" element={<AIFunctions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
