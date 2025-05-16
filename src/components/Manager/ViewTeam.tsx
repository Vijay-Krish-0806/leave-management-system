import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
const ViewTeam = () => {
  const auth = useSelector((state: RootState) => state.auth);
  
  const getAllUsers = async () => {
    const response = await axios.get("http://localhost:3001/users");
    return response.data;
  };

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    select(data) {
      return data.filter((user:any) => user.managerId === auth.id);
    },
  });

  return (
    <div className="table-container">
      <table className="custom-table">
        <caption className="table-caption">Team Members</caption>
        <thead className="table-header">
          <tr>
            <th>Index</th>
            <th>Username</th>
            <th>Email</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {usersData?.length > 0 ? (
            usersData.map((user: any, index: number) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewTeam;
