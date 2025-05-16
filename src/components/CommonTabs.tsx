import React from "react";
import { NavLink } from "react-router-dom";
import "./css/Tabs.css";

interface CommonTabsProps {
  additionalTabs?: React.ReactNode;
}

const CommonTabs: React.FC<CommonTabsProps> = ({ additionalTabs }) => {
  return (
    <div className="tabs-container">
      <NavLink
        to="leave-balance"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        Attendance
      </NavLink>
      <NavLink
        to="apply-leave"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        Apply Leave
      </NavLink>
      {additionalTabs}
    </div>
  );
};

export default CommonTabs;
