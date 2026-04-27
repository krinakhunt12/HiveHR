import type { RouteObject } from "react-router-dom";
import Integrations from "./pages/Integrations";
import Solutions from "./pages/Solutions";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HelpCenter from "./pages/HelpCenter";
import SystemStatus from "./pages/SystemStatus";
import Security from "./pages/Security";

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
  {
    path: "/careers",
    element: <Careers />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/help",
    element: <HelpCenter />,
  },
  {
    path: "/status",
    element: <SystemStatus />,
  },
  {
    path: "/security",
    element: <Security />,
  },
];
