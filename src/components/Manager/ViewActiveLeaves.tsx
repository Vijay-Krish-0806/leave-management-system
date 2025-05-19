import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { eachDayOfInterval, format, isWeekend } from "date-fns";
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";
import { LeaveApplication, User } from "../../types";
import { leaveApi, userApi } from "../../api/apiCalls";
import "../css/Table.css";

const ViewActiveLeaves: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  const {
    data: activeLeaves,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: leaveApi.getAll,
    select: (data) => {
      return data.filter(
        (leave) =>
          leave.currentManager === auth.id && leave.status === "pending"
      );
    },
  });

  const approveRejectMutation = useMutation({
    mutationFn: (leave: LeaveApplication) => leaveApi.update(leave.id, leave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-applications"] });
    },
    onError: (error) => {
      toast.error("An error occurred while updating the leave status");
      console.error("Mutation error:", error);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: User) =>
      userApi.update(userData.id as string, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error("Failed to update user's leave balance");
      console.error("User update error:", error);
    },
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
      await approveRejectMutation.mutateAsync({
        ...leave,
        status: "rejected",
        approvedBy: auth.id,
      });

      const userData = await userApi.getById(leave.employeeId);
      const allDays = eachDayOfInterval({
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
      });
      const workingDays = allDays.filter((d) => !isWeekend(d)).length;
      if (leave.type === "paid") {
        userData.leaveBalance += workingDays;
      } else if (leave.type === "unpaid") {
        userData.unpaidLeaves = Math.max(
          0,
          (userData.unpaidLeaves || 0) - workingDays
        );
      }

      // Update user with new balance
      await updateUserMutation.mutateAsync(userData);

      toast.error(`Leave request for ${leave.requestedBy} has been rejected`);
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
          {activeLeaves && activeLeaves.length > 0 ? (
            activeLeaves.map((leave, index) => {
              const allDays = eachDayOfInterval({
                start: new Date(leave.startDate),
                end: new Date(leave.endDate),
              });
              const workingDays = allDays.filter((d) => !isWeekend(d)).length;

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
                      disabled={
                        approveRejectMutation.isPending ||
                        updateUserMutation.isPending
                      }
                    >
                      {approveRejectMutation.isPending ||
                      updateUserMutation.isPending ? (
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
                      disabled={
                        approveRejectMutation.isPending ||
                        updateUserMutation.isPending
                      }
                    >
                      {approveRejectMutation.isPending ||
                      updateUserMutation.isPending ? (
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
            })
          ) : (
            <tr>
              <td className="no-leave-message" colSpan={8}>No active leaves</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewActiveLeaves;
