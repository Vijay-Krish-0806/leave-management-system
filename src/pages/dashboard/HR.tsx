import { Outlet } from "react-router-dom";

import HRTabs from "../../components/HR/HRTabs";

const HRPage = () => {
  
  return (
    <>
      <HRTabs />
      <Outlet />
    </>
  );
};

export default HRPage;
