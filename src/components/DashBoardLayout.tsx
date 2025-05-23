import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * DashBoardLayout component for rendering the main layout of the dashboard.
 *
 * This component includes a navigation bar and renders the child routes
 * using the `Outlet` component from React Router.
 *
 *
 * @returns {JSX.Element} The rendered DashBoardLayout component.
 *
 * @example
 * return <DashBoardLayout />;
 *
 * @typedef {Object} LayoutProps
 * @property {React.ReactNode} [children] - Optional children to render within the layout.
 */

interface LayoutProps {
  children?: React.ReactNode;
}

const DashBoardLayout: React.FC<LayoutProps> = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default DashBoardLayout;
