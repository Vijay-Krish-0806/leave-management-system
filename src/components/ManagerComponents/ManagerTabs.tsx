import React from "react";
import CommonTabs from "../CommonTabs";
import { NavLink } from "react-router-dom";
import { FaUserCheck, FaUsers, FaUsersViewfinder } from "react-icons/fa6";

/**
 * ManagerTabs component for rendering manager-specific navigation tabs.
 *
 * This component provides navigation links for manager functionalities, including
 * view the team, viewing active team leaves, and showing all leave applications of the team.
 *
 *
 * @returns {JSX.Element} The rendered ManagerTabs component.
 *
 * @example
 * return <ManagerTabs />;
 */
const ManagerTabs: React.FC = () => {
  const managerSpecificTabs = (
    <>
      <NavLink
        to="view-team"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaUsers />
        View Team
      </NavLink>
      <NavLink
        to="view-active-team-leaves"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaUserCheck />
        View Active Leaves
      </NavLink>
      <NavLink
        to="view-all-team-leaves"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        <FaUsersViewfinder />
        Team Leave History
      </NavLink>
    </>
  );

  return <CommonTabs additionalTabs={managerSpecificTabs} />;
};

export default ManagerTabs;
