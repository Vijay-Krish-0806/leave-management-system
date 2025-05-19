import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSpinner } from "react-icons/fa";
import { format } from "date-fns";
import "../css/Table.css";
import { leaveApi } from "../../api/apiCalls";

const ViewLeaves: React.FC = () => {
  const {
    isLoading,
    isError,
    data: leaves,
    error,
  } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: leaveApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="loading">
        <FaSpinner className="spinner" />
      </div>
    );
  }

  if (isError) {
    return <div className="error">Error loading leaves: {error?.message}</div>;
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <caption className="table-caption">Leave Applications</caption>
        <thead className="table-header">
          <tr>
            <th>Index</th>
            <th>User</th>
            <th>Leave Dates</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {leaves && leaves.length > 0 ? (
            leaves?.map((leave, index) => (
              <tr key={leave.id}>
                <td>{index + 1}</td>
                <td>{leave.requestedBy}</td>
                <td>
                  {format(new Date(leave.startDate), "PPP")} -{" "}
                  {format(new Date(leave.endDate), "PPP")}
                </td>
                <td>{leave.status}</td>
                <td>{leave.reason}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="no-leaves-message">
                No leave history found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewLeaves;
