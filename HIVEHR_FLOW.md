# HiveHR - Project Architecture & Flow Document

HiveHR is a modern, premium Human Resource Management System (HRMS) built with **React**, **Tailwind CSS**, and **Supabase**. It is designed to handle multi-role workforce management with a focus on high-performance aesthetics and real-time data integrity.

---

## 1. System Architecture Overview

The project follows a **Client-Server-Backend** architecture:
*   **Frontend**: React (Vite-powered) with a component-based modular structure.
*   **Authentication**: Supabase Auth (JWT-based persistent sessions).
*   **Database**: Supabase PostgreSQL with Row-Level Security (RLS).
*   **Storage**: Supabase Storage for employee documents and profile assets.
*   **State Management**: Custom React Hooks for data synchronization.

---

## 2. User Roles & Access Control

The system implements strict **Role-Based Access Control (RBAC)**:

| Role | Responsibility | Access Scope |
| :--- | :--- | :--- |
| **Admin** | System Overlord | Full access: Settings, logs, all employee data, and global policies. |
| **HR Manager** | Workforce Manager | Dedicated HR Panel: Leave approvals, personell tracking, and analytics. |
| **Employee** | Self-Service | Personal Dashboard: Attendance, leave balance, KPI tracking, and files. |

---

## 3. Core Application Flow

### A. Authentication & Onboarding
1.  **Login**: Users authenticate via `useSupabaseAuth`.
2.  **Profile Sync**: The system fetches the user's role and details from the `profiles` table.
3.  **Role Redirect**:
    *   `admin` → `/dashboard/admin`
    *   `hr` → `/dashboard/hr`
    *   `employee` → `/dashboard/employee`
4.  **Security**: Protected routes (`ProtectedRoute`) intercept any unauthorized URL tampering.

### B. Daily Employee Workflow
1.  **Attendance**: One-click Check-In/Check-Out with location and timestamping.
2.  **Leave Management**: 
    *   Employee submits a request.
    *   HR Manager receives it in the "HR Command Center".
    *   Employee gets an instant status update (Approved/Rejected).
3.  **Performance (KPI)**: Visual data tracking of task efficiency and monthly progress.

### C. HR & Administrative Workflow
1.  **Approval Hub**: Centralized list of all pending team requests (Leaves, reimbursements).
2.  **Employee Directory**: Full management of the workforce (Add, Edit, Deactivate).
3.  **Document Vault**: Secure area for payslips, tax forms, and contracts using Supabase Storage.

---

## 4. Technical Stack & Logic

### Frontend Modular Structure
*   **`/components/layout`**: Persistent UI elements (Header, Sidebar, DashboardLayout).
*   **`/hooks`**: The "Brain" of the app.
    *   `useSupabaseAuth`: Manages login/logout and session safety timeouts.
    *   `useEmployeeData`: Fetches and caches personalized dashboard metrics.
*   **`/pages`**: Role-centric views (Admin Panel, HR Center, Employee Hub).

### Backend Efficiency (Supabase)
*   **Postgres Triggers**: Automatically sync `auth.users` with the `public.profiles` table.
*   **RLS Policies**: Ensures a user can only see their *own* data, while managers can see their *team's* data.

---

## 5. Maintenance & Safety Measures

*   **Safety Timeouts**: Authentication includes a 3-second hard-stop to prevent "Infinite Loading" bugs.
*   **Fallback States**: If a data fetch fails, the UI gracefully renders mock data or error cards rather than crashing.
*   **Responsive Design**: Mobile-first architecture ensures HR managers can approve leaves on-the-go.

---

*Document Created: 2026-01-19*
*Version: 1.0.0*
