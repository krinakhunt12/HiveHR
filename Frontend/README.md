# HiveHr - Modern HR SaaS Platform

HiveHr is a premium, enterprise-grade HR Management System (HRMS) built with a modern tech stack and a scalable feature-based architecture. This project showcases a sophisticated UI/UX design tailored for HR professionals, employees, and platform administrators.

## ✨ Key Features

### 🏢 Three Specialized Dashboards
- **Employee Dashboard**: Manage personal profile, track attendance, request leave, and view upcoming tasks.
- **Company (HR) Dashboard**: Centralized console for employee management, hiring pipelines, and leave approval workflows.
- **Admin Dashboard**: System-wide analytics, platform health monitoring, and multi-tenant company management.

### 🎨 Design & Experience
- **Premium Aesthetics**: Built with a clean Slate/Indigo design system and the Inter typeface for professional readability.
- **Responsive Layouts**: Fully optimized for Desktop, Tablet, and Mobile devices.
- **Skeleton Loading**: Integrated shadcn-style skeleton loaders for a smooth, high-performance perceived user experience.
- **Modern UI Components**: Custom-built buttons, cards, and tables with consistent spacing and enterprise-grade styling.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Components**: shadcn/ui inspired architecture

---

## 🏗️ Architecture

The project follows a **Feature-Based Folder Structure**, ensuring scalability and maintainability as the platform grows:

```text
src/
├── app/               # Global configuration (Routes, Store)
├── features/          # Domain-specific modules
│   ├── admin-dashboard/
│   ├── auth/          # Login & Signup flows
│   ├── company-dashboard/
│   ├── employee-dashboard/
│   └── landing/       # SaaS Landing Page
├── shared/            # Reusable core elements
│   ├── ui/            # UI Primitives (Buttons, Cards, Skeletons)
│   ├── layouts/       # Dashboard & Auth Layouts
│   └── utils/         # Helper functions (cn utility)
└── assets/            # Static images and icons
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/krinakhunt12/HiveHR.git
   cd HiveHR/Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### 🛣️ Available Routes
- `http://localhost:5173/` - SaaS Landing Page
- `http://localhost:5173/login` - Authentication
- `http://localhost:5173/dashboard/employee` - Employee View
- `http://localhost:5173/dashboard/company` - Manager View
- `http://localhost:5173/dashboard/admin` - Platform Admin View

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.
