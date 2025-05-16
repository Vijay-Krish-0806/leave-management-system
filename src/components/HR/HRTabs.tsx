import React from "react";
import { NavLink } from "react-router-dom";
import CommonTabs from "../CommonTabs";

const HRTabs: React.FC = () => {
  // HR-specific tabs
  const hrSpecificTabs = (
    <>
      <NavLink
        to="create"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        Add Employee
      </NavLink>
      <NavLink
        to="employees"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        View Employees
      </NavLink>
      <NavLink
        to="leaves"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        Show Leaves
      </NavLink>
    </>
  );

  return <CommonTabs additionalTabs={hrSpecificTabs} />;
};

export default HRTabs;