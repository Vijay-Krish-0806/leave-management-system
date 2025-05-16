import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

interface LayoutProps {
  children?: React.ReactNode;
}

const DashBoardLayout: React.FC<LayoutProps> = () => {
  return (
    <main>
      <Navbar />
      <Outlet />
    </main>
  );
};

export default DashBoardLayout;
