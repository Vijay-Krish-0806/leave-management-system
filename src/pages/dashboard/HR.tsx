import { Outlet } from "react-router-dom";
import HRTabs from "../../components/HRComponents/HRTabs";

/**
 * HRPage component that renders the HRTabs and the Outlet.
 *
 * This component acts as a container for HR-related routes, displaying
 * tabs for HR management and rendering nested route components.
 *
 *
 * @returns {JSX.Element} The rendered HRPage component.
 */
const HRPage = () => {
  return (
    <>
      <HRTabs />
      <Outlet />
    </>
  );
};

export default HRPage;
