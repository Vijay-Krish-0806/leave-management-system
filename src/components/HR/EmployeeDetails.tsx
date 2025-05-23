import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { eachDayOfInterval, format, isWeekend } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LeaveApplication } from "../../types";
import {
  FaArrowLeft,
  FaEnvelope,
  FaUserTie,
  FaBuilding,
  FaUserFriends,
} from "react-icons/fa";
import "../css/EmployeeDetails.css";
import { userApi } from "../../api/apiCalls";
/**
 * @description
 * EmployeeDetails component for displaying detailed information about an employee.
 * This component fetches and displays user data, including personal information,
 * role, department, and leave history. It also shows the manager's name and allows
 * navigation back to the previous page.
 * @returns {JSX.Element}
 */
const EmployeeDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Employee details";
  }, []);

  /**
   * @description to get all leave data with particular employee ID
   * @returns {Promise<LeaveApplication[]>}
   */
  const getAllLeaves = async (): Promise<LeaveApplication[]> => {
    const response = await axios.get(
      `http://localhost:3001/leaveApplications/?employeeId=${userId}`
    );
    return response.data;
  };
  const [managerName, setManagerName] = useState("");
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => userApi.getById(userId as string),
  });

  const {
    data: userLeaves,
    isLoading: isLeavesLoading,
    isError: isLeaveError,
  } = useQuery({
    queryKey: ["employee-leaves"],
    queryFn: getAllLeaves,
  });
  /**
   * @description to get the manager name based on manager ID
   * @returns {Promise<void>}
   */
  const getManagerName = async () :Promise<void>=> {
    if (userData && userData.managerId) {
      try {
        const res = await axios.get(
          `http://localhost:3001/users/${userData.managerId}`
        );
        setManagerName(res.data.username);
      } catch (e) {
        console.error("Error fetching manager:", e);
      }
    }
  };
  useEffect(() => {
    if (userData && userData.managerId) {
      getManagerName();
    }
  }, [userData]);
  /**
   * @description when go back is clicked to navigate to previous page
   * @returns {void}
   */
  const handleNavigate = ():void => {
    navigate(-1);
  };
  if (isLoading) return <div className="loading">Loading user data...</div>;
  if (isError) return <div className="error">Error loading user data</div>;
  return (
    <div className="employee-details-container">
      <div className="back-button-container">
        <button className="back-button" onClick={handleNavigate}>
          <FaArrowLeft /> Go back
        </button>
      </div>

      <div className="employee-content">
        <div className="user-card">
          <div className="user-header">
            <div className="avatar-placeholder">
              {userData?.username?.charAt(0) || "U"}
            </div>
            <h2>{userData?.username || "User"}</h2>
          </div>

          <div className="user-info-list">
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{userData?.email || "N/A"}</span>
              </div>
            </div>

            <div className="info-item">
              <FaUserTie className="info-icon" />
              <div>
                <span className="info-label">Role</span>
                <span className="info-value">{userData?.role || "N/A"}</span>
              </div>
            </div>

            <div className="info-item">
              <FaUserFriends className="info-icon" />
              <div>
                <span className="info-label">Reports to</span>
                <span className="info-value">{managerName || "N/A"}</span>
              </div>
            </div>

            <div className="info-item">
              <FaBuilding className="info-icon" />
              <div>
                <span className="info-label">Department</span>
                <span className="info-value">
                  {userData?.department || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="leaves-section">
          <h2>Leave History</h2>
          {isLeavesLoading ? (
            <div className="loading">Loading leave data...</div>
          ) : isLeaveError ? (
            <div className="error">Error loading leave data</div>
          ) : (
            <div className="leaves-table-container">
              <table className="leaves-container">
                <thead>
                  <tr>
                    <th>Applied on</th>
                    <th>Requested For</th>
                    <th>Leave Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userLeaves && userLeaves.length > 0 ? (
                    userLeaves.map((leave: LeaveApplication) => (
                      <tr key={leave.id}>
                        <td>{format(new Date(leave.createdAt), "PPP")}</td>
                        <td>
                          <span className="date-range">
                            {format(new Date(leave.startDate), "PPP")} -{" "}
                            {format(new Date(leave.endDate), "PPP")}
                          </span>
                          <span className="working-days">
                            {
                              eachDayOfInterval({
                                start: new Date(leave.startDate),
                                end: new Date(leave.endDate),
                              }).filter((d) => !isWeekend(d)).length
                            }{" "}
                            working days
                          </span>
                        </td>
                        <td className="leave-type">{leave.type}</td>
                        <td>{leave.reason}</td>
                        <td>
                          <span
                            className={`leave-status ${leave.status.toLowerCase()}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="no-leaves-message">
                        No leave history found. Apply for leave to see your
                        history here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmployeeDetails;
