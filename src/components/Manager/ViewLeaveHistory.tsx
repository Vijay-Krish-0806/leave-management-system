import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format } from "date-fns";
import { LeaveApplication } from "../../types";

const API_URL = "http://localhost:3001";


const ViewLeaveHistory = () => {
  const auth = useSelector((state: RootState) => state.auth);

  const getLeaveApplications = async (): Promise<LeaveApplication[]> => {
    try {
      const response = await axios.get(`${API_URL}/leaveApplications`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch leave applications:", error);
      throw error;
    }
  };
  const { data: activeLeaves } = useQuery({
    queryKey: ["leave-applications"],
    queryFn: getLeaveApplications,
    select: (data) => {
      return data.filter((leave) => (leave.currentManager === auth.id ));
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
          {activeLeaves?.map((leave, index) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewLeaveHistory;
