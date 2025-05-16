import { Outlet } from "react-router-dom";
import ManagerTabs from "../../components/Manager/ManagerTabs";

const ManagerPage = () => {
 
  return (
    <>
      <ManagerTabs />
      <Outlet />
    </>
  );
};

export default ManagerPage;
