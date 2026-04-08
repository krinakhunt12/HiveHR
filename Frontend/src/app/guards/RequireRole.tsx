import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, type AppRole } from '@/shared/auth/store';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
}

/**
 * --- ROLE GUARD ---
 * Protects routes based on the current session stored in the Unified Auth Store.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { session } = useAuthStore();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (session.user?.role || '').toLowerCase() as AppRole;
  const safeAllowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [];

  if (!safeAllowedRoles.includes(role)) {
    // Redirect to correct dashboard
    const defaultDash = (role === 'company_admin' || role === 'admin') 
      ? '/dashboard/company' 
      : '/dashboard/employee';
    return <Navigate to={defaultDash} replace />; 
  }

  return <>{children}</>;
};

export default RequireRole;
