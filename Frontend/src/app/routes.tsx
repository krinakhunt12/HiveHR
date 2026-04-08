import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "@/features/landing/pages/LandingPage";
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import EmployeeDashboard from "@/features/employee-dashboard/pages/EmployeeDashboard";
import CompanyDashboard from "@/features/company-dashboard/pages/CompanyDashboard";
import AdminDashboard from "@/features/admin-dashboard/pages/AdminDashboard";
import { marketingRoutes } from "@/features/marketing/routes";
import RequireRole from "@/app/guards/RequireRole";
import { useAuthStore } from "@/shared/auth/store";

/**
 * --- SMART REDIRECT COMPONENT ---
 * Protects public pages (Login/Signup/Landing) by sending authenticated users 
 * straight to their respective dashboards.
 */
const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuthStore();
  if (session) {
    const role = (session.user.role || '').toLowerCase();
    const target = (role === 'company_admin' || role === 'admin') ? '/dashboard/company' : '/dashboard/employee';
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicOnly>
        <LandingPage />
      </PublicOnly>
    ),
  },
  ...marketingRoutes,
  {
    path: "/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicOnly>
        <Signup />
      </PublicOnly>
    ),
  },
  {
    path: "/dashboard",
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "admin",
        element: (
          <RequireRole allowedRoles={['admin']}>
            <AdminDashboard />
          </RequireRole>
        ),
      },
      {
        path: "company",
        element: (
          <RequireRole allowedRoles={['company_admin', 'admin']}>
            <CompanyDashboard />
          </RequireRole>
        ),
      },
      {
        path: "employee",
        element: (
          <RequireRole allowedRoles={['employee']}>
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
