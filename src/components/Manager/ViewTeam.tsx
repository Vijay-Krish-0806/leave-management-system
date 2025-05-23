import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { userApi } from "../../api/apiCalls";
import Table, { Column } from "../CommonTable";
import { User } from "../../types";
import { useEffect } from "react";

/**
 *@description View Team component for displaying all the team members of the particular manager
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
    select: (data) => data.filter((user) => user.managerId === auth.id),
  });
  useEffect(() => {
    document.title = "Team Details";
  }, []);

  const columns: Column<User>[] = [
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Department", accessor: "department" },
  ];

  return (
    <Table columns={columns} data={usersData || []} caption="Team Members" />
  );
};

export default ViewTeam;
