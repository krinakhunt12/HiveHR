import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "@/features/landing/pages/LandingPage";
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import EmployeeDashboard from "@/features/employee-dashboard/pages/EmployeeDashboard";
import CompanyDashboard from "@/features/company-dashboard/pages/CompanyDashboard";
import AdminDashboard from "@/features/admin-dashboard/pages/AdminDashboard";
import { marketingRoutes } from "@/features/marketing/routes";
import RequireRole from "@/app/guards/RequireRole";
import { dashboardPathForRole, getCurrentRole } from "@/shared/auth/roles";

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
        index: true,
        element: <Navigate to={dashboardPathForRole(getCurrentRole())} replace />,
      },
      {
        path: "admin",
        element: (
          <RequireRole requiredRole="admin">
            <AdminDashboard />
          </RequireRole>
        ),
      },
      {
        path: "company",
        element: (
          <RequireRole requiredRole="company_admin">
            <CompanyDashboard />
          </RequireRole>
        ),
      },
      {
        path: "employee",
        element: (
          <RequireRole requiredRole="employee">
            <EmployeeDashboard />
          </RequireRole>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
