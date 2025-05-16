import { Navigate, Outlet } from "react-router-dom";
import { RoleValue } from "./routesConfig";

interface ProtectedRouteProps {
  allowedRoles: RoleValue[];
}

const ProtectedRoutes: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("credentials");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  const userRole = JSON.parse(isAuthenticated).role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/dashboard/${userRole}/leave-balance`} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoutes;
