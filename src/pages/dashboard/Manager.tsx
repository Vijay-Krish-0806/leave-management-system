import { Outlet } from "react-router-dom";
import ManagerTabs from "../../components/ManagerComponents/ManagerTabs";

/**
 * ManagerPage component that renders the ManagerTabs and the Outlet.
 *
 * This component serves as a container for manager-related routes, displaying
 * tabs for manager functionalities and rendering nested route components.
 *
 *
 * @returns {JSX.Element} The rendered ManagerPage component.
 */
const ManagerPage = () => {
  return (
    <>
      <ManagerTabs />
      <Outlet />
    </>
  );
};

export default ManagerPage;
