
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { Cimiteri } from "./pages/cimiteri/Cimiteri";
import { AIFunctions } from "./pages/admin/AIFunctions";
import TablesAdmin from "./pages/admin/Tables"; // Corretto: import diretto
import UsersAdmin from "./pages/admin/Users"; // Corretto: import diretto

// Definizione delle rotte dell'applicazione
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout>
      {/* Layout richiede children come prop */}
      <div />
    </Layout>,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "cimiteri",
        element: <Cimiteri />,
      },
      {
        path: "admin",
        children: [
          {
            path: "ai-functions",
            element: <AIFunctions />,
          },
          {
            path: "tables",
            element: <TablesAdmin />, // Utilizzo del nome corretto
          },
          {
            path: "users",
            element: <UsersAdmin />, // Utilizzo del nome corretto
          },
        ],
      },
    ],
  },
]);
