# HiveHR - Frontend Architecture & Flow

This document provides a detailed technical breakdown of how the HiveHR frontend operates, from authentication to role-based dashboard rendering.

---

## 1. Bootstrapping & Auth Initialization
Everything starts in `main.jsx` and `App.jsx`, which initialize the routing and authentication layer.

*   **Auth Hook (`useSupabaseAuth.js`)**: As soon as the app loads, this hook triggers. It checks for an existing session using `supabase.auth.getSession()`.
*   **Safety Break**: To prevent "Infinite Loading" bugs, the auth hook has a **3-second safety break** that forces the loading state to `false` if Supabase takes too long to respond.
*   **Profile Sync**: If a session exists, the app fetches the user's role (Admin, HR, or Employee) from the `profiles` table to determine access levels.

---

## 2. Routing & Security (`routes.jsx`)
The application uses **React Router 6** with a protected-layer architecture:

*   **Public Routes**: Pages like `/login` or the Landing page are accessible to everyone. If an already-logged-in user tries to visit `/login`, the `PublicRoute` wrapper automatically redirects them to their dashboard.
*   **Protected Routes**: The `ProtectedRoute` component intercepts navigation to sensitive paths. It checks:
    1.  **Authentication**: Is the user logged in?
    2.  **Authorization**: Does the user's role match the `requiredRoles` array for that route?
*   **Lazy Loading**: Most pages (e.g., `AttendancePage`, `LeavesPage`) are lazy-loaded to ensure fast initial page loads.

---

## 3. The Dashboard Redirection Logic
The system features a **Smart Redirector** (`DashboardRedirect`):
1.  User enters credentials on `/login`.
2.  Upon success, the app sends them to `/dashboard`.
3.  The `DashboardRedirect` component checks the user profile:
    *   `admin` → Sends to `/dashboard/admin`
    *   `hr` → Sends to `/dashboard/hr`
    *   `employee` → Sends to `/dashboard/employee`

---

## 4. Data Handling Architecture ("The Brain Hooks")
HiveHR uses **Custom Hooks** as the logic layer to separate UI from business logic:

*   **`useEmployeeData`**: The central brain for the employee portal. It fetches personal info, KPIs, attendance stats, and upcoming holidays.
*   **`useAttendance`**: Handles the logic for "Check In/Check Out," calculating delays (late-by minutes) and formatting the attendance timeline.
*   **Mock vs. Real Data**: While the Auth is live with Supabase, the data hooks currently use stylized **Mock Data Generator** functions (`attendanceUtils.js`). This allows for high-fidelity UI testing and client demos.

---

## 5. Component Logic & UI Flow
*   **Layout Layer (`DashboardLayout`)**: Every page inside the dashboard is wrapped in this layout. It provides the persistent Sidebar, the Top Navigation (with notifications), and manages the responsive transitions for mobile screens.
*   **Card Composition**: Dashboards are built using specialized atoms (e.g., `AttendanceCard`, `KpiChart`). These components use **Tailwind CSS** for premium "glassmorphism" effects.
*   **Interaction Feedback**: Actions like "Refreshing" or "Checking In" trigger local loading states (spinners) and immediate UI updates through React state.

---

## 6. Technical Summary

| Feature | Implementation |
| :--- | :--- |
| **Framework** | React (Vite) |
| **Styling** | Tailwind CSS (Premium Theme) |
| **Auth** | Supabase Auth (JWT) |
| **Database** | Supabase Postgres (via RLS) |
| **Icons** | Lucide React |
| **Routing** | React Router 6 |

---

## 7. Maintenance & Safety
*   **Safety Timeouts**: Authentication includes a 3-second hard-stop to prevent "Infinite Loading."
*   **Fallback States**: If a data fetch fails, the UI renders mock data or error cards rather than crashing.
*   **Responsive Design**: Mobile-first architecture ensures HR managers can approve leaves on-the-go.

---
*Created: 2026-01-20*
*Version: 1.0.0*
