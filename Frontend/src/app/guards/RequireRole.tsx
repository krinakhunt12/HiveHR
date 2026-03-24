import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { canAccess, dashboardPathForRole, getCurrentRole, type AppRole } from "@/shared/auth/roles";
import { getAccessToken, isSessionExpired } from "@/shared/auth/session";

interface RequireRoleProps {
  requiredRole: AppRole;
  children: ReactNode;
}

const RequireRole = ({ requiredRole, children }: RequireRoleProps) => {
  const accessToken = getAccessToken();
  const isExpired = isSessionExpired();

  if (!accessToken || isExpired || accessToken.split(".").length !== 3) {
    return <Navigate to="/login" replace />;
  }


  const role = getCurrentRole();

  if (!canAccess(role, requiredRole)) {
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
