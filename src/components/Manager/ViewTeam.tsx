import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { userApi } from "../../api/apiCalls";

/**
 * View Team component for displaying all the team members of the particular manager
 * This component fetches leave application data and filters through managerId
 * Shows the data in tabluar format
 *
 * @returns {JSX.Element} The rendered ViewTeam Component
 */

const ViewTeam = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getAll,
    select(data) {
      return data.filter((user) => user.managerId === auth.id);
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
          {usersData && usersData?.length > 0 ? (
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



// import { useQuery } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { RootState } from "../../app/store";
// import { userApi } from "../../api/apiCalls";
// import Table from "../CommonTable"; // Adjust the import path as necessary

// const ViewTeam = () => {
//   const auth = useSelector((state: RootState) => state.auth);
//   const { data: usersData } = useQuery({
//     queryKey: ["users"],
//     queryFn: userApi.getAll,
//     select: (data) =>
//       data.filter((user) => user.managerId === auth.id),
//   });

//   const columns = [
//     { header: "Username", accessor: "username" },
//     { header: "Email", accessor: "email" },
//     { header: "Department", accessor: "department" },
//   ];

//   return (
//     <Table
//       columns={columns}
//       data={usersData || []}
//       caption="Team Members"
//     />
//   );
// };

// export default ViewTeam;
