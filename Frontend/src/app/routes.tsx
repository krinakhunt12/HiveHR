import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "@/features/landing/pages/LandingPage";
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import EmployeeDashboard from "@/features/employee-dashboard/pages/EmployeeDashboard";
import CompanyDashboard from "@/features/company-dashboard/pages/CompanyDashboard";
import AdminDashboard from "@/features/admin-dashboard/pages/AdminDashboard";
import { marketingRoutes } from "@/features/marketing/routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  ...marketingRoutes,
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    children: [
      {
        path: "employee",
        element: <EmployeeDashboard />,
      },
      {
        path: "company",
        element: <CompanyDashboard />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
