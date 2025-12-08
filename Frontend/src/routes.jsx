import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

// ============================================
// LAZY-LOADED PAGES
// ============================================

// Auth Pages
const Login = lazy(() => import("./pages/Auth/Login"));

// Public Pages
const Home = lazy(() => import("./pages/Home"));

// Dashboard Pages
const EmployeeDashboard = lazy(() => import("./pages/dashboard/EmployeeDashboard"));

// Error Pages
const NotFound = lazy(() => import("./pages/errors/NotFound"));
const Forbidden = lazy(() => import("./pages/errors/Forbidden"));

// attendance page
const AttendancePage = lazy(() => import("./pages/attendance/AttendancePage"));

// Leaves page
const LeavesPage = React.lazy(() => import('./pages/leaves/LeavesPage'));

// Performance page
const PerformancePage = React.lazy(() => import('./pages/performance/PerformancePage'));

// KPI page
const KPIPage = React.lazy(() => import('./pages/kpi/KPIPage'));

// Files page
const FilesPage = React.lazy(() => import('./pages/files/FilesPage'));

// People page
const PeoplePage = React.lazy(() => import('./pages/people/PeoplePage'));

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
// ============================================
// LOADER COMPONENT
// ============================================
const Loader = () => (
    <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
        </div>
    </div>
);

// ============================================
// MOCK AUTH HOOK (Replace with real auth logic)
// ============================================
function useAuth() {
    // Simulate checking localStorage or context
    const storedUser = localStorage.getItem("user");

    return {
        isAuthenticated: !!storedUser, // true if user exists
        user: storedUser ? JSON.parse(storedUser) : null,
        loading: false,
    };
}

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================
function ProtectedRoute({ requiredRoles = [], children }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Loader />;

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based access check
    if (requiredRoles.length > 0) {
        const hasAccess = user?.roles?.some((r) => requiredRoles.includes(r));
        if (!hasAccess) return <Navigate to="/403" replace />;
    }

    return children ? children : <Outlet />;
}

// ============================================
// PUBLIC ROUTE (Redirect authenticated users)
// ============================================
function PublicRoute({ children }) {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        // Redirect authenticated users to their dashboard
        if (user?.roles?.includes("admin")) {
            return <Navigate to="/dashboard/admin" replace />;
        }
        if (user?.roles?.includes("hr")) {
            return <Navigate to="/dashboard/hr" replace />;
        }
        return <Navigate to="/dashboard/employee" replace />;
    }

    return children ? children : <Outlet />;
}

// ============================================
// APP ROUTES
// ============================================
export default function AppRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                {/* ============================================ */}
                {/* PUBLIC ROUTES */}
                {/* ============================================ */}

                {/* Landing Page - accessible to everyone */}
                <Route path="/" element={<Home />} />

                {/* Auth Routes - redirect if already logged in */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* ============================================ */}
                {/* PROTECTED DASHBOARD ROUTES */}
                {/* ============================================ */}

                {/* Employee Dashboard - requires 'employee' role */}
                {/* <Route element={<ProtectedRoute requiredRoles={["employee", "hr", "admin"]} />}>
          <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
        </Route> */}
                <Route path="/dashboard/employee" element={<EmployeeDashboard />} />

                {/* Add this route inside ProtectedRoute for employees */}
                {/* <Route element={<ProtectedRoute requiredRoles={["employee", "hr", "admin"]} />}>
  <Route path="/attendance" element={<AttendancePage />} />
</Route> */}
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/leaves" element={<LeavesPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/kpi" element={<KPIPage />} />
                 <Route path="/files" element={<FilesPage />} />
                 <Route path="/people" element={<PeoplePage />} />
                 <Route path="/admin" element={<AdminDashboard />} />


                {/* HR Dashboard - requires 'hr' role (placeholder for future) */}
                <Route element={<ProtectedRoute requiredRoles={["hr", "admin"]} />}>
                    <Route
                        path="/dashboard/hr"
                        element={
                            <div className="flex h-screen items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">HR Dashboard</h1>
                                    <p className="text-slate-600">Coming soon...</p>
                                </div>
                            </div>
                        }
                    />
                </Route>

                {/* Admin Dashboard - requires 'admin' role (placeholder for future) */}
                <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
                    <Route
                        path="/dashboard/admin"
                        element={
                            <div className="flex h-screen items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                                    <p className="text-slate-600">Coming soon...</p>
                                </div>
                            </div>
                        }
                    />
                </Route>

                {/* Default Dashboard Route - redirects based on role */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<DashboardRedirect />}
                    />
                </Route>

                {/* ============================================ */}
                {/* ERROR ROUTES */}
                {/* ============================================ */}

                {/* 403 Forbidden */}
                <Route path="/403" element={<Forbidden />} />

                {/* 404 Not Found */}
                <Route path="/404" element={<NotFound />} />

                {/* Catch-all - redirect to 404 */}
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Suspense>
    );
}

// ============================================
// DASHBOARD REDIRECT COMPONENT
// ============================================
function DashboardRedirect() {
    const { user } = useAuth();

    // Redirect to appropriate dashboard based on user role
    if (user?.roles?.includes("admin")) {
        return <Navigate to="/dashboard/admin" replace />;
    }
    if (user?.roles?.includes("hr")) {
        return <Navigate to="/dashboard/hr" replace />;
    }
    return <Navigate to="/dashboard/employee" replace />;
}

// ============================================
// USAGE EXAMPLE: Login Component Update
// ============================================
/*
// Update your Login component to set user data after successful login:

const handleEmailLogin = () => {
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }
  setIsLoading(true);

  // Simulate API call
  setTimeout(() => {
    // Mock user data - replace with actual API response
    const userData = {
      id: "emp-001",
      name: "John Anderson",
      email: email,
      roles: ["employee"], // Can be ["hr"], ["admin"], or multiple roles
      token: "mock-jwt-token"
    };

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    // Navigate to dashboard - the route will handle role-based redirect
    window.location.href = "/dashboard";

    setIsLoading(false);
  }, 1500);
};

// Logout function (add to your DashboardLayout or wherever needed):
const handleLogout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};
*/


// ============================================
// ROUTE STRUCTURE SUMMARY
// ============================================
/*
PUBLIC ROUTES:
- / (Home/Landing page)
- /login (redirects to dashboard if authenticated)

PROTECTED ROUTES:
- /dashboard (auto-redirects based on role)
- /dashboard/employee (accessible by employee, hr, admin)
- /dashboard/hr (accessible by hr, admin)
- /dashboard/admin (accessible by admin only)

ERROR ROUTES:
- /403 (Forbidden - no access)
- /404 (Not Found)
- * (catch-all → redirect to 404)

AUTHENTICATION FLOW:
1. User lands on /login
2. After login, user data stored in localStorage
3. Redirected to appropriate /dashboard/* based on role
4. Protected routes check auth & roles
5. Unauthorized access → /403
6. Invalid routes → /404
*/