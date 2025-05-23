import React from "react";
import { NavLink } from "react-router-dom";
import "./css/Tabs.css";
import { FaChartPie } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { DEFAULT_MANAGER_ID } from "../constants";

/**
 * CommonTabs component for rendering common navigation tabs to all roles.
 *
 * This component provides navigation links for common functionalities, including
 * Show the leave balance, Apply leave request
 *
 *
 * @returns {JSX.Element} The rendered CommonTabs component.
 *
 * @example
 * return <CommonTabs />;
 */

interface CommonTabsProps {
  additionalTabs?: React.ReactNode;
}

const CommonTabs: React.FC<CommonTabsProps> = ({ additionalTabs }) => {
  const authId = useSelector((state: RootState) => state.auth.id);
  if (authId === DEFAULT_MANAGER_ID) {
    return <div className="tabs-container">{additionalTabs}</div>;
  }
  return (
    <div className="tabs-container">
      <NavLink
        to="leave-balance"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaChartPie />
        Attendance
      </NavLink>
      <NavLink
        to="apply-leave"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaSignOutAlt />
        Apply Leave
      </NavLink>
      {additionalTabs}
    </div>
  );
};

export default CommonTabs;
