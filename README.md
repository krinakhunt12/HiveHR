# 🐝 HiveHR - Enterprise Workforce Intelligence System

HiveHR is a premium, high-performance Human Resource Management System (HRMS) built with React, Tailwind CSS, and Supabase. It features triple-layered role-based access control (RBAC), real-time attendance synchronization, and a minimalist design language focused on functional elegance.

## 🏗️ Folder Structure

- **`/src/hooks`**: **Core Logic Layer.** Contains all business logic separated from the UI.
  - `useSupabaseAuth.js`: Global Session and Profile management.
  - `useAdmin.js`: Admin-specific dashboard and user management logic.
  - `useHR.js`: HR intelligence and monitoring hooks.
  - `useEmployee.js`: Personal attendance and activity logic.
- **`/src/components`**: **Presentational Layer.** Atomic and modular components.
  - `layout/`: Sidebar, Header, and Dashboard layouts.
  - `admin/`: User management grids and role-specific tools.
  - `common/`: Error boundaries and shared UI elements.
- **`/src/pages`**: **Composition Layer.** Assemblies of components for specific routes.
- **`/src/utils`**: **System Utilities.** Centralized logging and formatting.
- **`/src/lib`**: **Infrastructure Layer.** Supabase clients and API configurations.

## 🔐 Authentication & Authorization Flow

1.  **Triple Portal Entry**: Dedicated login portals for Admin, HR Managers, and Employees.
2.  **Auth Guarding**: All `/admin/*`, `/hr/*`, and `/employee/*` routes are wrapped in a `ProtectedRoute` component.
3.  **Role Verification**: The system verifies the user's `role` from the database `profiles` table after session initialization. Any role mismatch results in a `403 Forbidden` redirect.
4.  **Admin Empowerment**: Only Administrators can register new accounts. HR and Employee accounts are provisioned via the Admin Hub to maintain system integrity.

## 🎮 Dashboard Responsibilities

### 👑 Admin Hub
- Overarchging system statistics (Active/Total count).
- Full CRUD operations on HR and Employee records.
- Role-based permission matrix management.
- Hard deletion and status toggling (Enable/Disable).

### 👔 HR Intelligence Suite
- Workforce attendance monitoring.
- Multi-user leave request management and decision-making.
- Performance reporting and talent oversight.
- Restricted employee data management.

### 👤 Employee Workspace
- One-click Clock In / Clock Out synchronization.
- Personal attendance history and productivity tracking.
- Leave application and status tracking.
- Secure profile identity management.

## 🎨 UI/UX Philosophy

- **Minimalist Aesthetics**: Thin lines, ample whitespace, and high-quality typography (Inter/System stack).
- **Interactive Feedback**: All interactive elements use `cursor: pointer` and feature subtle scale transformations on click.
- **Responsive Mastery**: Fluid layouts that adapt from mobile drawers to expanded desktop views.
- **Data-Driven**: Heavy use of visual feedback (ghost loading, status colors, and micro-animations).

## 🚨 Error Handling & Logging

- **Global Error Boundary**: A top-level React Error Boundary catches runtime crashes and presents a premium recovery UI instead of white screens.
- **App Logger**: A centralized `AppLogger` utility replaces all `console.log` and `console.error` calls. It supports various severity levels and can be easily toggled for production.
- **Toast Engine**: Non-blocking, auto-dismissable notifications handle all API successes and failures, ensuring the user is always informed of the system state.

## 🚪 Logout Flow

1.  **Storage Purge**: Clicking Logout executes `localStorage.clear()` to prevent data leakage.
2.  **Session Termination**: Closes the Supabase Auth session via `tempClient.auth.signOut()`.
3.  **Role-Specific Landing**: Redirects the user back to their specific role's login portal for a seamless re-entry experience.

---
*Developed with ❤️ as a secure, role-protected HR ecosystem.*
