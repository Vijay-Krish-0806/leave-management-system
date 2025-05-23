import { Outlet } from "react-router-dom";
import EmployeeTabs from "../../components/Employee/EmployeeTabs";

/**
 * EmployeePage component that renders the EmployeeTabs and the Outlet.
 *
 * This component serves as a container for employee-related routes and
 * displays the tabs for employee management along with any nested routes
 * defined in the router.
 *
 * 
 * @returns {JSX.Element} The rendered EmployeePage component.
 */
const EmployeePage = () => {
  return (
    <>
      <EmployeeTabs />
      <Outlet />
    </>
  );
};

export default EmployeePage;
