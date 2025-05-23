import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { FaCheck } from "react-icons/fa";
import { eachDayOfInterval, format, isWeekend } from "date-fns";
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";
import { LeaveApplication, User } from "../../types";
import { leaveApi, userApi } from "../../api/apiCalls";
import Table, { Column } from "../CommonTable";
import "../css/Table.css";

/**
 * @description Use to show active leaves of a team members to manager for approval or reject
 * @returns {JSX.Element}
 */
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

  useEffect(() => {
    document.title = "Active Leaves";
  }, []);

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

  //to update the user on approval
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

  /**
   * @description to handle approval of leave
   * @param {LeaveApplication} leave
   * @returns {void}
   */
  const handleApprove = (leave: LeaveApplication): void => {
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

  /**
   * @description to handle reject and update the user leave balance
   * @param {LeaveApplication} leave
   * @returns {void}
   */
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

  // Define table columns
  const columns: Column<LeaveApplication>[] = [
    {
      header: "Username",
      accessor: "requestedBy",
    },
    {
      header: "Leave Period",
      accessor: (leave) => (
        <>
          {format(new Date(leave.startDate), "PPP")} -{" "}
          {format(new Date(leave.endDate), "PPP")}
        </>
      ),
    },
    {
      header: "Working Days",
      accessor: (leave) => {
        const allDays = eachDayOfInterval({
          start: new Date(leave.startDate),
          end: new Date(leave.endDate),
        });
        const workingDays = allDays.filter((d) => !isWeekend(d)).length;
        return `${workingDays} working days`;
      },
    },
    {
      header: "Leave Type",
      accessor: "type",
    },
    {
      header: "Reason",
      accessor: "reason",
    },
    {
      header: "Actions",
      accessor: (leave) => (
        <>
          <button
            className="approve-button"
            title="Approve Leave Request"
            onClick={() => handleApprove(leave)}
          >
            (
            <>
              Approve
              <FaCheck />
            </>
            )
          </button>
          <button
            className="reject-button"
            title="Reject Leave Request"
            onClick={() => handleReject(leave)}
          >
            (
            <>
              Reject
              <FaX />
            </>
            )
          </button>
        </>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={activeLeaves || []}
      caption="Pending Leave Requests"
      isLoading={isLoading}
      isError={isError}
      errorMessage={
        isError
          ? `Error loading leave requests. ${
              (error as Error)?.message || "Please try again later."
            }`
          : undefined
      }
    />
  );
};

export default ViewActiveLeaves;
