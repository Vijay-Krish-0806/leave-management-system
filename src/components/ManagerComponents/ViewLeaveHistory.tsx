import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format } from "date-fns";
import { leaveApi } from "../../api/apiCalls";
import { useEffect, useMemo, useState } from "react";
import Table, { Column } from "../CommonTable";
import { LeaveApplication } from "../../types";
/**
 * @description
 * ViewLeaveHistory component for displaying a list of leave applications of one's team
 * This component fteches leave application data and filter the data by currentManager id and allows user to search and filter by username and status in a table format.
 *
 * @returns {JSX.Element}
 */
const ViewLeaveHistory = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const { data: activeLeaves } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: leaveApi.getAll,
    select: (data) => data.filter((leave) => leave.currentManager === auth.id),
  });

  useEffect(() => {
    document.title = "Show Leaves";
  }, []);

  const filteredLeaves = useMemo(() => {
    if (!activeLeaves) return [];
    return activeLeaves.filter((leave) => {
      const matchesUser = leave.requestedBy
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || leave.status === filterStatus;
      return matchesUser && matchesStatus;
    });
  }, [activeLeaves, searchTerm, filterStatus]);

  
  const columns: Column<LeaveApplication>[] = [
    { header: "Username", accessor: "requestedBy" },
    {
      header: "Leave Period",
      accessor: (leave: LeaveApplication) =>
        `${format(leave.startDate, "PPP")} - ${format(leave.endDate, "PPP")}`,
    },
    {
      header: "Working Days",
      accessor: (leave: LeaveApplication) =>
        `${
          eachDayOfInterval({
            start: leave.startDate,
            end: leave.endDate,
          }).length
        } working days`,
    },
    { header: "Status", accessor: "status" },
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
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <Table<LeaveApplication>
        columns={columns}
        data={filteredLeaves || []}
        caption="Team Leave Requests History"
      />
    </>
  );
};
export default ViewLeaveHistory;
