import React from "react";
import CommonTabs from "../CommonTabs";
/**
 * EmployeeTabs component that renders the CommonTabs component with no additional tabs.
 *
 *
 * @returns {JSX.Element} The rendered EmployeeTabs component.
 *
 * @example
 * return <EmployeeTabs />;
 */

const EmployeeTabs: React.FC = () => {
  return <CommonTabs additionalTabs={null} />;
};

export default EmployeeTabs;
