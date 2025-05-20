import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format } from "date-fns";
import { leaveApi } from "../../api/apiCalls";
import { useMemo, useState } from "react";

/**
 * ViewLeaveHistory component for displaying a list of leave applications of one's team
 * This component fteches leave application data and filter the data by currentManager id and allows user to search and filter by username and status in a table format.
 *
 * @returns {JSX.Element} The rendered ViewLeaveHistory Component
 *
 * @example
 * return <ViewLeaveHistory/>
 *
 *  @function filteredLeaves
 * Filters the leave applications based on the search term and selected status.
 *  @returns {LeaveApplication[]} The filtered list of leave applications.
 */

const ViewLeaveHistory = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const { data: activeLeaves } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: leaveApi.getAll,
    select: (data) => {
      return data.filter((leave) => leave.currentManager === auth.id);
    },
  });

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

      <div className="table-container">
        <table className="custom-table">
          <caption className="table-caption">
            Team Leave Requests History
          </caption>
          <thead className="table-header">
            <tr>
              <th>Index</th>
              <th>Username</th>
              <th>Leave Period</th>
              <th>Working Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredLeaves && filteredLeaves.length > 0 ? (
              filteredLeaves?.map((leave, index) => (
                <tr key={leave.id}>
                  <td>{index + 1}</td>
                  <td>{leave.requestedBy}</td>
                  <td>
                    {format(leave.startDate, "PPP")} -{" "}
                    {format(leave.endDate, "PPP")}
                  </td>
                  <td>
                    {
                      eachDayOfInterval({
                        start: leave.startDate,
                        end: leave.endDate,
                      }).length
                    }{" "}
                    working days
                  </td>
                  <td>{leave.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-leaves-message">
                  No team leaves history
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ViewLeaveHistory;


// import { useSelector } from "react-redux";
// import { RootState } from "../../app/store";
// import { useQuery } from "@tanstack/react-query";
// import { eachDayOfInterval, format } from "date-fns";
// import { leaveApi } from "../../api/apiCalls";
// import { useMemo, useState } from "react";
// import Table from "../CommonTable"; 


// const ViewLeaveHistory = () => {
//   const auth = useSelector((state: RootState) => state.auth);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [filterStatus, setFilterStatus] = useState<string>("All");

//   const { data: activeLeaves } = useQuery({
//     queryKey: ["leave-applications"],
//     queryFn: leaveApi.getAll,
//     select: (data) =>
//       data.filter((leave) => leave.currentManager === auth.id),
//   });

//   const filteredLeaves = useMemo(() => {
//     if (!activeLeaves) return [];
//     return activeLeaves.filter((leave) => {
//       const matchesUser = leave.requestedBy
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//       const matchesStatus =
//         filterStatus === "All" || leave.status === filterStatus;
//       return matchesUser && matchesStatus;
//     });
//   }, [activeLeaves, searchTerm, filterStatus]);

//   const columns = [
//     { header: "Username", accessor: "requestedBy" },
//     {
//       header: "Leave Period",
//       accessor: (leave: any) =>
//         `${format(leave.startDate, "PPP")} - ${format(
//           leave.endDate,
//           "PPP"
//         )}`,
//     },
//     {
//       header: "Working Days",
//       accessor: (leave: any) =>
//         `${eachDayOfInterval({
//           start: leave.startDate,
//           end: leave.endDate,
//         }).length} working days`,
//     },
//     { header: "Status", accessor: "status" },
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
//             <option value="All">All Statuses</option>
//             <option value="pending">Pending</option>
//             <option value="approved">Approved</option>
//             <option value="cancelled">Cancelled</option>
//             <option value="rejected">Rejected</option>
//           </select>
//         </div>
//       </div>
//       <Table
//         columns={columns}
//         data={filteredLeaves}
//         caption="Team Leave Requests History"
//       />
//     </>
//   );
// };

// export default ViewLeaveHistory;
