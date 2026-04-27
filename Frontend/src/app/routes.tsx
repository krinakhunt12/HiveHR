import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense } from "react";
import LandingPage from "@/features/landing/pages/LandingPage";
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import EmployeeDashboard from "@/features/employee-dashboard/pages/EmployeeDashboard";
import CompanyDashboard from "@/features/company-dashboard/pages/CompanyDashboard";
import AdminDashboard from "@/features/admin-dashboard/pages/AdminDashboard";
import { marketingRoutes } from "@/features/marketing/routes";
import RequireRole from "@/app/guards/RequireRole";
import { useAuthStore } from "@/shared/auth/store";
import { RouteErrorBoundary } from "@/shared/components/RouteErrorBoundary";
import { LoadingState } from "@/shared/components/LoadingState";

import { detectRole } from "@/shared/utils/authUtils";

import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";

/**
 * --- SMART REDIRECT COMPONENT ---
 * Protects public pages (Login/Signup/Landing) by sending authenticated users 
 * straight to their respective dashboards.
 */
const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuthStore();
  if (session) {
    // If user needs to reset password, don't redirect them to dashboard
    if (session.user.force_password_reset) return <>{children}</>;
    
    const role = detectRole(session.user);
    const target = (role === 'admin') ? '/dashboard/admin' : (role === 'company_admin' ? '/dashboard/company' : '/dashboard/employee');
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    element: (
      <Suspense fallback={<LoadingState />}>
        <Outlet />
      </Suspense>
    ),
    children: [
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
        path: "/reset-password",
        element: <ResetPasswordPage />,
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
    ]
  },
]);


