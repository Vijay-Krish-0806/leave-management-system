import ViewAttendance from "./components/Employee/ViewAttendance";
import ApplyLeave from "./components/Employee/ApplyLeave";
import ViewTeam from "./components/Manager/ViewTeam";
import ViewActiveLeaves from "./components/Manager/ViewActiveLeaves";
import ViewLeaveHistory from "./components/Manager/ViewLeaveHistory";
import CreateEditEmployee from "./components/HR/CreateEditEmployee";
import ViewEmployees from "./components/HR/ViewEmployees";
import ViewLeaves from "./components/HR/ViewLeaves";
import EmployeePage from "./pages/dashboard/Employee";
import ManagerPage from "./pages/dashboard/Manager";
import HRPage from "./pages/dashboard/HR";
import LoginPage from "./pages/LoginPage";
import EmployeeDetails from "./components/HR/EmployeeDetails";

export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  HR: "HR",
} as const;

export type Role = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[Role];

export const commonRoutes = [
  {
    path: "leave-balance",
    element: <ViewAttendance />,
    name: "Attendance",
  },
  {
    path: "apply-leave",
    element: <ApplyLeave />,
    name: "Apply Leave",
  },
];

// Role specific routes
export const roleSpecificRoutes = {
  [ROLES.EMPLOYEE]: [
    // Employee-specific routes 
  ],

  // Manager-specific routes 
  [ROLES.MANAGER]: [
    {
      path: "view-team",
      element: <ViewTeam />,
      name: "View Team",
    
    },
    {
      path: "view-active-team-leaves",
      element: <ViewActiveLeaves />,
      name: "View Active Team Leaves",
    },
    {
      path: "view-all-team-leaves",
      element: <ViewLeaveHistory />,
      name: "View Team Leaves",
    },
  ],
  // HR-specific routes 
  [ROLES.HR]: [
    {
      path: "create",
      element: <CreateEditEmployee isModalOpen={false} />,
      name: "Add Employee",
    },
    {
      path: "employees",
      element: <ViewEmployees />,
      name: "View Employees",
    },
    {
      path: "leaves",
      element: <ViewLeaves />,
      name: "Manage Leaves",
    },
    {
      path:"employee-details/:userId",
      element:<EmployeeDetails/>,
      name:"Employee details"
    },
    {
      path:"view-active-team-leaves",
      element:<ViewActiveLeaves/>,
      name:"Active leave details"
    }
  ],
};

// Role index components
export const roleComponents = {
  [ROLES.EMPLOYEE]: EmployeePage,
  [ROLES.MANAGER]: ManagerPage,
  [ROLES.HR]: HRPage,
};

// Public routes
export const publicRoutes = [
  {
    path: "/",
    element: <LoginPage />,
  },
];