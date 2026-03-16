import type { RouteObject } from "react-router-dom";
import Integrations from "./pages/Integrations";
import Solutions from "./pages/Solutions";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";

export const marketingRoutes: RouteObject[] = [
  {
    path: "/integrations",
    element: <Integrations />,
  },
  {
    path: "/solutions",
    element: <Solutions />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
];
