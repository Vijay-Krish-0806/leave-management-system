
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Table, { Column } from "../CommonTable";
import { leaveApi } from "../../api/apiCalls";
import { LeaveApplication } from "../../types";
/**
 * @description
 * ViewLeaves component for displaying a list of leave applications.
 *
 * This component fetches leave application data and allows users to search
 * by username and filter by leave status. It displays the leave applications
 * in a table format.
 * @returns {JSX.Element}
 */
const ViewLeaves: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const {
    isLoading,
    isError,
    data: leaves,
    error,
  } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: leaveApi.getAll,
  });
  useEffect(() => {
    document.title = "All Leaves";
  }, []);
  const filteredLeaves = useMemo(() => {
    if (!leaves) return []; 
    return leaves.filter((leave) => {
      const matchesUser = leave.requestedBy
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || leave.status === filterStatus;
      return matchesUser && matchesStatus;
    });
  }, [leaves, searchTerm, filterStatus]);
  const columns: Column<LeaveApplication>[] = [
    { header: "User", accessor: "requestedBy" },
    {
      header: "Leave Dates",
      accessor: (leave: any) =>
        `${format(new Date(leave.startDate), "PPP")} - ${format(
          new Date(leave.endDate),
          "PPP"
        )}`,
    },
    { header: "Status", accessor: "status" },
    { header: "Reason", accessor: "reason" },
  ];
  return (
    <>
      <div className="table-controls">
        <div>
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <Table
        columns={columns}
        data={filteredLeaves}
        caption="Leave Applications"
        isLoading={isLoading}
        isError={isError}
        errorMessage={`Error loading leaves: ${error?.message}`}
      />
    </>
  );
};
export default ViewLeaves;
