import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import DashBoardLayout from "./components/DashBoardLayout";
import ProtectedRoute from "./ProtectedRoutes";
import {
  ROLES,
  commonRoutes,
  roleSpecificRoutes,
  roleComponents,
  publicRoutes,
} from "./routesConfig";
import React from "react";
import NotFoundPage from "./components/NotFoundPage";

/**
 * App component for the main application routing.
 *
 * This component sets up the routing for the application using React Router.
 * It includes public routes, protected dashboard routes based on user roles,
 * and a 404 Not Found page for unmatched routes. It also integrates a toast
 * notification container for displaying messages.
 * 
 * @returns {JSX.Element} The rendered App component.
 *
 * @example
 * return <App />;
 */

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastContainer autoClose={2000} />
      <Routes>
        {/* Public routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute allowedRoles={Object.values(ROLES)} />}
        >
          <Route element={<DashBoardLayout />}>
            {/* Role-specific routes */}
            {Object.values(ROLES).map((role) => {
              const RoleComponent = roleComponents[role];
              return (
                <Route
                  key={role}
                  path={role}
                  element={<ProtectedRoute allowedRoles={[role]} />}
                >
                  <Route element={<RoleComponent />}>
                    {/* Common routes available to this role */}
                    {commonRoutes.map((route) => (
                      <Route
                        key={`${role}-${route.path}`}
                        path={`${route.path}`}
                        element={route.element}
                      />
                    ))}
                    {/* Role-specific routes */}
                    {roleSpecificRoutes[role]?.map((route) => (
                      <Route
                        key={`${role}-${route.path}`}
                        path={`${route.path}`}
                        element={route.element}
                      />
                    ))}
                  </Route>
                </Route>
              );
            })}
          </Route>
        </Route>
        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
