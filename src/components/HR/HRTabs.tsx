import React from "react";
import { NavLink } from "react-router-dom";
import CommonTabs from "../CommonTabs";
import {  FaUserCheck, FaUserGroup, FaUserPlus, FaUsersViewfinder } from "react-icons/fa6";

/**
 * HRTabs component for rendering HR-specific navigation tabs.
 *
 * This component provides navigation links for HR functionalities, including
 * adding an employee, viewing employees, and showing leave applications.
 *
 * @returns {JSX.Element} The rendered HRTabs component.
 *
 * @example
 * return <HRTabs />;
 */

const HRTabs: React.FC = () => {
  // HR-specific tabs
  const hrSpecificTabs = (
    <>
      <NavLink
        to="create"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaUserPlus/>
        Add Employee
      </NavLink>
      <NavLink
        to="employees"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaUserCheck/>
        View Employees
      </NavLink>
      <NavLink
        to="view-active-team-leaves"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaUserGroup/>
        Show Team Leaves
      </NavLink>
      <NavLink
        to="leaves"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaUsersViewfinder/>
        Show Leaves
      </NavLink>
    </>
  );

  return <CommonTabs additionalTabs={hrSpecificTabs} />;
};

export default HRTabs;
