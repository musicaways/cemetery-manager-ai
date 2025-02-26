
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./lib/themeContext";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { Index } from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Tables } from "./pages/admin/Tables";
import { Users } from "./pages/admin/Users";
import { AIFunctions } from "./pages/admin/AIFunctions";
import { Cimiteri } from "./pages/cimiteri/Cimiteri";
import { CimiteroDetails } from "./pages/cimiteri/components/CimiteroDetails/CimiteroDetails";
import { BloccoDetails } from "./pages/cimiteri/components/BloccoDetails/BloccoDetails";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin">
                <Route path="tables" element={<Tables />} />
                <Route path="users" element={<Users />} />
                <Route path="ai-functions" element={<AIFunctions />} />
              </Route>
              <Route path="/cimiteri" element={<Cimiteri />} />
              <Route path="/cimiteri/:id" element={<CimiteroDetails />} />
              <Route path="/cimiteri/:cimiteroId/blocchi/:bloccoId" element={<BloccoDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
