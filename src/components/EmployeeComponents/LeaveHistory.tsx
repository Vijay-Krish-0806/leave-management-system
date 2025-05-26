import React, { useMemo, useState } from "react";
import { format, eachDayOfInterval, isWeekend, isPast } from "date-fns";
import { LeaveApplication } from "../../types";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import { setUser } from "../../features/auth/authSlice";
import { combinedOperations } from "../../api/apiCalls";
import "../css/Table.css";
import { LeaveStatus } from "../../constants";

interface LeaveHistoryProps {
  leaves: LeaveApplication[] | undefined;
  isLoading: boolean;
  managerNames: string[];
  onEditLeave: (leave: LeaveApplication) => void;
}
/**
* @description 
*  LeaveHistory component for displaying a user's leave applications.
* This component shows a table of leave applications with options to filter by leave type and status.
* It allows users to edit or cancel their leave requests based on their current status.
* @param {LeaveHistoryProps} {
  leaves,
  isLoading,
  managerNames,
  onEditLeave,
}
* @returns {JSX.Element}
*/
const LeaveHistory: React.FC<LeaveHistoryProps> = ({
  leaves,
  isLoading,
  managerNames,
  onEditLeave,
}) => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  /**
   * @description Get the status class for a particular status
   * @param {string} status
   * @returns {string}
   */
  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case LeaveStatus.Pending:
        return "leave-status-pending";
      case LeaveStatus.Approved:
        return "leave-status-approved";
      case LeaveStatus.Rejected:
        return "leave-status-rejected";
      case LeaveStatus.Cancelled:
        return "leave-status-cancelled";
      default:
        return "";
    }
  };
  //to get filtered leaves
  const filteredLeaves = useMemo(() => {
    if (!leaves) return [];
    return leaves.filter((leave) => {
      const matchesType = filterType === "All" || leave.type === filterType;
      const matchesStatus =
        filterStatus === "All" || leave.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [leaves, filterType, filterStatus]);
  //to cancel a leave
  /**
   * @description function to cancel a leave
   * @param {LeaveApplication} leave
   * @returns {Promise<void>}
   */
  const handleCancelLeave = async (leave: LeaveApplication): Promise<void> => {
    if (!["pending", "approved"].includes(leave.status)) {
      toast.error("Only pending or approved leave requests can be cancelled.");
      return;
    }
    if (
      leave.status === LeaveStatus.Approved &&
      isPast(new Date(leave.startDate))
    ) {
      toast.error("Cannot cancel a leave that has already started.");
      return;
    }
    try {
      let updatedLeaveBalance = auth.leaveBalance;
      let updatedUnpaid = auth.unpaidLeaves;
      if (
        leave.status === LeaveStatus.Approved ||
        leave.status === LeaveStatus.Pending
      ) {
        const allDays = eachDayOfInterval({
          start: new Date(leave.startDate),
          end: new Date(leave.endDate),
        });
        const days = allDays.filter((d) => !isWeekend(d)).length;
        if (leave.type === "paid") {
          updatedLeaveBalance += days;
        } else {
          updatedUnpaid = Math.max(0, updatedUnpaid - days);
        }
      }
      const result = await combinedOperations.cancelLeaveAndRestoreBalance(
        leave.id,
        auth.id,
        updatedLeaveBalance,
        updatedUnpaid
      );
      dispatch(
        setUser({
          ...auth,
          leaveBalance: result.user.leaveBalance,
          unpaidLeaves: result.user.unpaidLeaves as number,
        })
      );
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["leave-applications"] });
      toast.success("Leave request cancelled successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel leave request. Please try again.");
    }
  };

  /**
   * @description utility function to know whether to enable or disable actions
   * disabled edit/cancel if leave already starts
   * @param {LeaveApplication} leave
   * @returns {boolean}
   */
  const canPerformActions = (leave: LeaveApplication): boolean => {
    if (leave.status === LeaveStatus.Pending) {
      return true;
    } else if (leave.status === LeaveStatus.Approved) {
      return !isPast(new Date(leave.startDate));
    }
    return false;
  };
  return (
    <div className="leave-history-section">
      <div className="filter-container">
        <div>
          <span>Leave History</span>
        </div>
        <div className="filters">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="paternity">Paternity</option>
            <option value="maternity">Maternity</option>
            <option value="bereavement">Bereavement</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      {isLoading ? (
        <div className="loading">Loading leave history...</div>
      ) : (
        <table className="leaves-container">
          <thead>
            <tr>
              <th>Applied on</th>
              <th>Requested For</th>
              <th>Leave Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action Taken</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves && filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave, index) => (
                <tr key={leave.id}>
                  <td>{format(new Date(leave.createdAt), "PPP")}</td>
                  <td>
                    <span className="date-range">
                      {format(new Date(leave.startDate), "PPP")}-{" "}
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
                      className={`leave-status ${getStatusClass(leave.status)}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    <div className="approval-info">
                      <span className="approved-by-label">
                        {["pending", "approved", "cancelled"].includes(
                          leave.status
                        )
                          ? "Approved"
                          : "Rejected"}{" "}
                        By
                      </span>
                      <span className="manager-name">
                        {(leave.status === LeaveStatus.Approved ||
                          leave.status === LeaveStatus.Rejected) &&
                          managerNames[index]}
                      </span>
                    </div>
                  </td>
                  <td>
                    {canPerformActions(leave) ? (
                      <div className="buttons-group">
                        <button
                          className="leave-edit-button"
                          onClick={() => onEditLeave(leave)}
                        >
                          Edit
                        </button>
                        <button
                          className="leave-cancel-button"
                          onClick={() => handleCancelLeave(leave)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button disabled className="disabled-btn">
                        Actions
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-leaves-message">
                  No leave history found. Apply for leave to see your history
                  here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default LeaveHistory;
