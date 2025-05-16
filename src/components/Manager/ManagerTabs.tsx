import React from "react";
import CommonTabs from "../CommonTabs";
import { NavLink } from "react-router-dom";

const ManagerTabs: React.FC = () => {
  const managerSpecificTabs = (
    <>
      <NavLink
        to="view-team"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        View Team
      </NavLink>
      <NavLink
        to="view-active-team-leaves"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        View Active Leaves
      </NavLink>
      <NavLink
        to="view-all-team-leaves"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        Team Leave History
      </NavLink>
    </>
  );

  return <CommonTabs additionalTabs={managerSpecificTabs} />;
};

export default ManagerTabs;
