
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { Cimiteri } from "./pages/cimiteri/Cimiteri";
import { AIFunctions } from "./pages/admin/AIFunctions";
import { Tables } from "./pages/admin/Tables";
import { Users } from "./pages/admin/Users";

// Definizione delle rotte dell'applicazione
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
            element: <Tables />,
          },
          {
            path: "users",
            element: <Users />,
          },
        ],
      },
    ],
  },
]);
