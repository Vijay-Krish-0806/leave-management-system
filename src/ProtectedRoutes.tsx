import { Navigate, Outlet } from "react-router-dom";
import { RoleValue } from "./routesConfig";

/**
 * ProtectedRoutes component for guarding routes based on user authentication and roles.
 *
 * This component checks if the user is authenticated and if their role is allowed
 * to access the specified routes. If the user is not authenticated, they are redirected
 * to the home page. If the user's role is not allowed, they are redirected to their
 * default dashboard route.
 *
 * @returns {JSX.Element} The rendered ProtectedRoutes component or a redirect.
 * <ProtectedRoutes/>
 *
 */


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
