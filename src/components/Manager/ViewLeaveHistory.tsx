import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format } from "date-fns";
import { leaveApi } from "../../api/apiCalls";

const ViewLeaveHistory = () => {
  const auth = useSelector((state: RootState) => state.auth);

  const { data: activeLeaves } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: leaveApi.getAll,
    select: (data) => {
      return data.filter((leave) => leave.currentManager === auth.id);
    },
  });
  return (
    <div className="table-container">
      <table className="custom-table">
        <caption className="table-caption">Team Leave Requests History</caption>
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
          {activeLeaves && activeLeaves.length > 0 ? (
            activeLeaves?.map((leave, index) => (
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
            <tr >
              <td colSpan={5} className="no-leaves-message">No team leaves history</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewLeaveHistory;
