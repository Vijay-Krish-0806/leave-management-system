import { Outlet } from "react-router-dom";

import EmployeeTabs from "../../components/Employee/EmployeeTabs";

const EmployeePage = () => {
  return (
    <>
      <EmployeeTabs />
      <Outlet />
    </>
  );
};

export default EmployeePage;
