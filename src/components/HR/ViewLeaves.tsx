import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSpinner } from "react-icons/fa";
import { format } from "date-fns";
import "../css/Table.css";
import { leaveApi } from "../../api/apiCalls";
/**
 * ViewLeaves component for displaying a list of leave applications.
 *
 * This component fetches leave application data and allows users to search
 * by username and filter by leave status. It displays the leave applications
 * in a table format.
 *
 *
 * @returns {JSX.Element} The rendered ViewLeaves component.
 *
 * @example
 * return <ViewLeaves />;
 *
 * @function filteredLeaves
 * Filters the leave applications based on the search term and selected status.
 * @returns {LeaveApplication[]} The filtered list of leave applications.
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
            {filteredLeaves && filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave, index) => (
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
                <td colSpan={5} className="no-leaves-message">
                  No leave history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ViewLeaves;


// import React, { useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { format } from "date-fns";
// import Table from "../CommonTable"; // Adjust the import path as necessary
// import { leaveApi } from "../../api/apiCalls";

// const ViewLeaves: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [filterStatus, setFilterStatus] = useState<string>("All");
//   const {
//     isLoading,
//     isError,
//     data: leaves,
//     error,
//   } = useQuery({
//     queryKey: ["leave-applications"],
//     queryFn: leaveApi.getAll,
//   });

//   const filteredLeaves = useMemo(() => {
//     if (!leaves) return [];
//     return leaves.filter((leave) => {
//       const matchesUser = leave.requestedBy
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//       const matchesStatus =
//         filterStatus === "All" || leave.status === filterStatus;
//       return matchesUser && matchesStatus;
//     });
//   }, [leaves, searchTerm, filterStatus]);

//   const columns = [
//     { header: "User", accessor: "requestedBy" },
//     {
//       header: "Leave Dates",
//       accessor: (leave: any) =>
//         `${format(new Date(leave.startDate), "PPP")} - ${format(
//           new Date(leave.endDate),
//           "PPP"
//         )}`,
//     },
//     { header: "Status", accessor: "status" },
//     { header: "Reason", accessor: "reason" },
//   ];

//   return (
//     <>
//       <div className="table-controls">
//         <div>
//           <input
//             type="text"
//             placeholder="Search by username"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//           >
//             <option value="All">Status</option>
//             <option value="approved">Approved</option>
//             <option value="pending">Pending</option>
//             <option value="cancelled">Cancelled</option>
//             <option value="rejected">Rejected</option>
//           </select>
//         </div>
//       </div>
//       <Table
//         columns={columns}
//         data={filteredLeaves}
//         caption="Leave Applications"
//         isLoading={isLoading}
//         isError={isError}
//         errorMessage={`Error loading leaves: ${error?.message}`}
//       />
//     </>
//   );
// };

// export default ViewLeaves;

