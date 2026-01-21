import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

// ============================================
// LAZY-LOADED PAGES
// ============================================

// Auth Pages
const Login = lazy(() => import("./pages/Auth/Login"));
const AdminLogin = lazy(() => import("./pages/Auth/AdminLogin"));
const HRLogin = lazy(() => import("./pages/Auth/HRLogin"));
const EmployeeLogin = lazy(() => import("./pages/Auth/EmployeeLogin"));
const AdminSignup = lazy(() => import("./pages/Auth/AdminSignup"));

// Public Pages
const Home = lazy(() => import("./pages/Home"));

// Dashboard Pages
const EmployeeDashboard = lazy(() => import("./pages/employee/EmployeeDashboard"));
const EmployeeProfile = lazy(() => import("./pages/employee/EmployeeProfile"));
const HRDashboard = lazy(() => import("./pages/hr/HRDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// HR Specific Management Pages
const HREmployeeManagement = lazy(() => import("./pages/hr/HREmployeeManagement"));
const HRAttendanceManagement = lazy(() => import("./pages/hr/HRAttendanceManagement"));
const HRLeaveManagement = lazy(() => import("./pages/hr/HRLeaveManagement"));
const HRReports = lazy(() => import("./pages/hr/HRReports"));
const HRProfile = lazy(() => import("./pages/hr/HRProfile"));

// Admin Specific Management Pages
const HRManagement = lazy(() => import("./pages/admin/HRManagement"));
const EmployeeManagement = lazy(() => import("./pages/admin/EmployeeManagement"));
const RolePermissions = lazy(() => import("./pages/admin/RolePermissions"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));

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

import { useCurrentUser } from "./hooks/api/useAuthQueries";

// ============================================
// REAL AUTH HOOK (TanStack Query Integration)
// ============================================
function useAuth() {
    const { data: currentUser, isLoading, isError } = useCurrentUser();

    // The query returns { data: { user: ..., profile: ... } } structure via apiCall
    // currentUser itself is the response object from apiCall

    // Normalize user data
    const user = currentUser?.data?.user;
    const profile = currentUser?.data?.profile;

    // Determine authentication status
    const isAuthenticated = !!user && !isError;

    // Construct user object compatible with existing code
    const authUser = user ? {
        id: user.id || user._id,
        email: user.email,
        roles: [profile?.role || 'employee']
    } : null;

    return {
        isAuthenticated,
        user: authUser,
        loading: isLoading,
        profile
    };
}

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================
function ProtectedRoute({ requiredRoles = [], children }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Loader />;

    // Redirect unauthenticated users to their respective login pages
    if (!isAuthenticated) {
        // Find out which dashboard they were trying to access to redirect to the right login
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        if (location.pathname.startsWith('/hr')) {
            return <Navigate to="/hr/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/employee/login" state={{ from: location }} replace />;
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
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (user?.roles?.includes("hr")) {
            return <Navigate to="/hr/dashboard" replace />;
        }
        return <Navigate to="/employee/dashboard" replace />;
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
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/signup" element={<AdminSignup />} />
                    <Route path="/hr/login" element={<HRLogin />} />
                    <Route path="/employee/login" element={<EmployeeLogin />} />
                </Route>

                {/* ============================================ */}
                {/* PROTECTED DASHBOARD ROUTES */}
                {/* ============================================ */}

                {/* Admin Dashboard - restricted to admins */}
                <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/hr-management" element={<HRManagement />} />
                    <Route path="/admin/employee-management" element={<EmployeeManagement />} />
                    <Route path="/admin/roles" element={<RolePermissions />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>

                {/* HR Dashboard - restricted to HR and admins */}
                <Route element={<ProtectedRoute requiredRoles={["hr", "admin"]} />}>
                    <Route path="/hr/dashboard" element={<HRDashboard />} />
                    <Route path="/hr/employees" element={<HREmployeeManagement />} />
                    <Route path="/hr/attendance" element={<HRAttendanceManagement />} />
                    <Route path="/hr/leaves" element={<HRLeaveManagement />} />
                    <Route path="/hr/reports" element={<HRReports />} />
                    <Route path="/hr/profile" element={<HRProfile />} />
                    <Route path="/dashboard/hr" element={<Navigate to="/hr/dashboard" replace />} />
                </Route>

                {/* Employee Dashboard - accessible by all but mostly for employees */}
                <Route element={<ProtectedRoute requiredRoles={["employee", "hr", "admin"]} />}>
                    <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    <Route path="/employee/profile" element={<EmployeeProfile />} />
                    <Route path="/dashboard/employee" element={<Navigate to="/employee/dashboard" replace />} />
                </Route>

                {/* Shared Protected Routes */}
                <Route element={<ProtectedRoute requiredRoles={["employee", "hr", "admin"]} />}>
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/leaves" element={<LeavesPage />} />
                    <Route path="/performance" element={<PerformancePage />} />
                    <Route path="/kpi" element={<KPIPage />} />
                    <Route path="/files" element={<FilesPage />} />
                    <Route path="/people" element={<PeoplePage />} />
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
        return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.roles?.includes("hr")) {
        return <Navigate to="/hr/dashboard" replace />;
    }
    return <Navigate to="/employee/dashboard" replace />;
}
