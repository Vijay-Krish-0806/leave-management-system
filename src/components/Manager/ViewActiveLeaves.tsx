import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { eachDayOfInterval, format, isWeekend } from "date-fns";
import "../css/Table.css";
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";
import { LeaveApplication, User } from "../../types";

const API_URL = "http://localhost:3001";

const ViewActiveLeaves: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  // Fetch all leave applications
  const getLeaveApplications = async (): Promise<LeaveApplication[]> => {
    try {
      const response = await axios.get(`${API_URL}/leaveApplications`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch leave applications:", error);
      throw error;
    }
  };
  
  // Update leave status
  const updateLeaveStatus = async (
    updatedLeave: LeaveApplication
  ): Promise<LeaveApplication> => {
    const response = await axios.put<LeaveApplication>(
      `${API_URL}/leaveApplications/${updatedLeave.id}`,
      updatedLeave
    );
    return response.data;
  };

  // Update user data including leave balances
  const updateUserData = async (updatedUser: User): Promise<User> => {
    const response = await axios.put<User>(
      `${API_URL}/users/${updatedUser.id}`,
      updatedUser
    );
    return response.data;
  };

  // Fetch active leaves assigned to current manager
  const {
    data: activeLeaves,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: getLeaveApplications,
    select: (data) => {
      return data.filter(
        (leave) =>
          leave.currentManager === auth.id && leave.status === "pending"
      );
    },
  });

  // Mutation for updating leave status
  const approveRejectMutation = useMutation({
    mutationFn: updateLeaveStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-applications"] });
    },
    onError: (error) => {
      toast.error("An error occurred while updating the leave status");
      console.error("Mutation error:", error);
    },
  });

  // Mutation for updating user data
  const updateUserMutation = useMutation({
    mutationFn: updateUserData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error("Failed to update user's leave balance");
      console.error("User update error:", error);
    }
  });

  // Handle approve leave action
  const handleApprove = (leave: LeaveApplication) => {
    approveRejectMutation.mutate(
      { ...leave, status: "approved", approvedBy: auth.id },
      {
        onSuccess: () => {
          toast.success(
            `Leave request for ${leave.requestedBy} approved successfully`
          );
        },
      }
    );
  };

  const handleReject = async (leave: LeaveApplication) => {
    try {
      await approveRejectMutation.mutateAsync(
        { ...leave, status: "rejected", approvedBy: auth.id }
      );
      
      const response = await axios.get(`${API_URL}/users/${leave.employeeId}`);
      const userData = response.data;
      
      const allDays = eachDayOfInterval({
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
      });
      const workingDays = allDays.filter(d => !isWeekend(d)).length;
      
      if (leave.type === "paid") {
        userData.leaveBalance += workingDays;
      } else if (leave.type === "unpaid") {
        userData.unpaidLeaves = Math.max(0, userData.unpaidLeaves - workingDays);
      }
      
      await updateUserMutation.mutateAsync(userData);
      
      toast.error(
        `Leave request for ${leave.requestedBy} has been rejected`
      );
    } catch (error) {
      console.error("Error in reject process:", error);
      toast.error("Failed to complete the rejection process");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-spinner">
        <FaSpinner className="spin" />
        <span>Loading leave requests...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="error-message">
        <p>Error loading leave requests. Please try again later.</p>
        <p>{(error as Error)?.message}</p>
      </div>
    );
  }

  // No data state
  if (!activeLeaves || activeLeaves.length === 0) {
    return (
      <div className="no-data-message">
        <p>No pending leave requests to review.</p>
      </div>
    );
  }

  // Render the leave requests table
  return (
    <div className="table-container">
      <table className="custom-table">
        <caption className="table-caption">Pending Leave Requests</caption>
        <thead className="table-header">
          <tr>
            <th>Index</th>
            <th>Username</th>
            <th>Leave Period</th>
            <th>Working Days</th>
            <th>Leave Type</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {activeLeaves.map((leave, index) => {
            const allDays = eachDayOfInterval({
              start: new Date(leave.startDate),
              end: new Date(leave.endDate),
            });
            const workingDays = allDays.filter(d => !isWeekend(d)).length;
            
            return (
              <tr key={leave.id}>
                <td>{index + 1}</td>
                <td>{leave.requestedBy}</td>
                <td>
                  {format(new Date(leave.startDate), "PPP")} -{" "}
                  {format(new Date(leave.endDate), "PPP")}
                </td>
                <td>{workingDays} working days</td>
                <td>{leave.type}</td>
                <td>{leave.reason}</td>
                <td>
                  <button
                    className="approve-button"
                    title="Approve Leave Request"
                    onClick={() => handleApprove(leave)}
                    disabled={approveRejectMutation.isPending || updateUserMutation.isPending}
                  >
                    {(approveRejectMutation.isPending || updateUserMutation.isPending) ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <>
                        Approve
                        <FaCheck />
                      </>
                    )}
                  </button>
                  <button
                    className="reject-button"
                    title="Reject Leave Request"
                    onClick={() => handleReject(leave)}
                    disabled={approveRejectMutation.isPending || updateUserMutation.isPending}
                  >
                    {(approveRejectMutation.isPending || updateUserMutation.isPending) ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <>
                        Reject
                        <FaX />
                      </>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ViewActiveLeaves;